import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, type Firestore } from 'firebase/firestore';
import type { RequirementDoc } from '../models/requirement.model';

type ApiContextValue = {
  projects: RequirementDoc[];
  isReady: boolean;
  saveProject: (project: RequirementDoc) => Promise<void>;
  getProjectById: (id: string) => Promise<RequirementDoc | null>;
};

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<RequirementDoc[]>([]);
  const [isReady, setIsReady] = useState(false);
  const dbRef = useRef<Firestore | null>(null);
  const appIdRef = useRef('his-pipitos-app');
  const snapshotUnsubRef = useRef<(() => void) | null>(null);
  const projectsRef = useRef<RequirementDoc[]>([]);
  projectsRef.current = projects;

  const listenToDatabase = useCallback((db: Firestore, appId: string) => {
    snapshotUnsubRef.current?.();
    snapshotUnsubRef.current = null;
    const reqsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'requirements');
    snapshotUnsubRef.current = onSnapshot(
      reqsCollection,
      (snapshot) => {
        const docs: RequirementDoc[] = [];
        snapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as RequirementDoc);
        });
        setProjects(docs.sort((a, b) => b.id.localeCompare(a.id)));
      },
      (error) => {
        console.error('Error leyendo DB: ', error);
      }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (typeof __firebase_config !== 'undefined') {
          const config = JSON.parse(__firebase_config) as object;
          const app = initializeApp(config);
          const auth = getAuth(app);
          const db = getFirestore(app);
          dbRef.current = db;
          appIdRef.current = typeof __app_id !== 'undefined' ? __app_id : 'default-app';

          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }

          onAuthStateChanged(auth, (user) => {
            if (cancelled) return;
            if (user) {
              listenToDatabase(db, appIdRef.current);
              setIsReady(true);
            }
          });
        } else {
          setIsReady(true);
        }
      } catch (error) {
        console.warn('Ejecutando en modo local sin Base de Datos en la nube.', error);
        setIsReady(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
      snapshotUnsubRef.current?.();
      snapshotUnsubRef.current = null;
    };
  }, [listenToDatabase]);

  const saveProject = useCallback(async (project: RequirementDoc) => {
    const db = dbRef.current;
    const appId = appIdRef.current;
    if (db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'requirements', project.id);
      await setDoc(docRef, project);
    } else {
      setProjects((docs) => [project, ...docs]);
    }
  }, []);

  const getProjectById = useCallback(async (id: string) => {
    const db = dbRef.current;
    const appId = appIdRef.current;
    if (db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'requirements', id);
      const snap = await getDoc(docRef);
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RequirementDoc) : null;
    }
    return projectsRef.current.find((p) => p.id === id) ?? null;
  }, []);

  const value = useMemo<ApiContextValue>(
    () => ({ projects, isReady, saveProject, getProjectById }),
    [projects, isReady, saveProject, getProjectById]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextValue {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi debe usarse dentro de ApiProvider');
  return ctx;
}
