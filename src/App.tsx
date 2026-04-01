import { useEffect, useState } from 'react';
import { ApiProvider } from './context/ApiContext';
import { Dashboard } from './components/Dashboard';
import { AdminForm } from './components/AdminForm';
import { ClientPortal } from './components/ClientPortal';

type View = 'dashboard' | 'admin-form' | 'client-form';

function AppShell() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const id = urlParams.get('id');
    if (view === 'client' && id) {
      setActiveProjectId(id);
      setCurrentView('client-form');
    }
  }, []);

  const changeView = (view: 'dashboard' | 'admin-form') => {
    setCurrentView(view);
    if (window.history.pushState) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {currentView !== 'client-form' ? (
        <header className="bg-[#003366] text-white h-14 flex items-center justify-between px-4 shadow-md z-10 print:hidden sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#003366] font-bold text-xl shadow-sm">
              P
            </div>
            <h1 className="font-semibold text-lg tracking-wide">
              HIS-PIPITOS
              <span className="text-gray-300 font-normal text-sm ml-2 hidden sm:inline">| Centro de Requerimientos</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[#003366] font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        {currentView !== 'client-form' ? (
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm print:hidden z-0">
            <nav className="flex-1 p-4 space-y-2 mt-4">
              <button
                type="button"
                onClick={() => changeView('dashboard')}
                className={
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left font-medium ' +
                  (currentView === 'dashboard'
                    ? 'bg-blue-50 text-[#003366] border-l-4 border-[#003366] shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100')
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                  />
                </svg>
                Tablero
              </button>
            </nav>
          </aside>
        ) : null}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 print:p-0 print:bg-white relative">
          {currentView === 'dashboard' ? <Dashboard onCreateNew={() => changeView('admin-form')} /> : null}
          {currentView === 'admin-form' ? <AdminForm onSaved={() => changeView('dashboard')} /> : null}
          {currentView === 'client-form' ? <ClientPortal projectId={activeProjectId} /> : null}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AppShell />
    </ApiProvider>
  );
}
