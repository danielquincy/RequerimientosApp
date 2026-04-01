import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import type { RequirementDoc } from '../models/requirement.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private db: ReturnType<typeof getFirestore> | null = null;
  private auth: ReturnType<typeof getAuth> | null = null;
  private appId = 'his-pipitos-app';

  readonly projects = signal<RequirementDoc[]>([]);
  readonly isReady = signal<boolean>(false);

  constructor() {
    void this.initCloudBackend();
  }

  private async initCloudBackend(): Promise<void> {
    try {
      if (typeof __firebase_config !== 'undefined') {
        const config = JSON.parse(__firebase_config) as object;
        const app = initializeApp(config);
        this.auth = getAuth(app);
        this.db = getFirestore(app);
        this.appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(this.auth, __initial_auth_token);
        } else {
          await signInAnonymously(this.auth);
        }

        onAuthStateChanged(this.auth, (user) => {
          if (user) {
            this.listenToDatabase();
            this.isReady.set(true);
          }
        });
      } else {
        this.isReady.set(true);
      }
    } catch (error) {
      console.warn('Ejecutando en modo local sin Base de Datos en la nube.', error);
      this.isReady.set(true);
    }
  }

  private listenToDatabase(): void {
    if (!this.db) return;
    const reqsCollection = collection(
      this.db,
      'artifacts',
      this.appId,
      'public',
      'data',
      'requirements'
    );

    onSnapshot(
      reqsCollection,
      (snapshot) => {
        const docs: RequirementDoc[] = [];
        snapshot.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() } as RequirementDoc);
        });
        this.projects.set(docs.sort((a, b) => b.id.localeCompare(a.id)));
      },
      (error) => {
        console.error('Error leyendo DB: ', error);
      }
    );
  }

  async saveProject(project: RequirementDoc): Promise<void> {
    if (this.db) {
      const docRef = doc(
        this.db,
        'artifacts',
        this.appId,
        'public',
        'data',
        'requirements',
        project.id
      );
      await setDoc(docRef, project);
    } else {
      this.projects.update((docs) => [project, ...docs]);
    }
  }

  async getProjectById(id: string): Promise<RequirementDoc | null> {
    if (this.db) {
      const docRef = doc(
        this.db,
        'artifacts',
        this.appId,
        'public',
        'data',
        'requirements',
        id
      );
      const snap = await getDoc(docRef);
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as RequirementDoc) : null;
    }
    return this.projects().find((p) => p.id === id) ?? null;
  }
}
