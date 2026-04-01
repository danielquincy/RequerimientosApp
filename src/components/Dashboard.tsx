import { useState } from 'react';
import { useApi } from '../context/ApiContext';

type Props = {
  onCreateNew: () => void;
};

export function Dashboard({ onCreateNew }: Props) {
  const { projects } = useApi();
  const [toastMsg, setToastMsg] = useState('');

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?view=client&id=${id}`;

    const fallbackCopy = (text: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallo copia', err);
      }
      document.body.removeChild(textArea);
    };

    const showToast = () => {
      setToastMsg('¡Enlace copiado! Envíalo a tu cliente.');
      setTimeout(() => setToastMsg(''), 3500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(showToast).catch(() => {
        fallbackCopy(url);
        showToast();
      });
    } else {
      fallbackCopy(url);
      showToast();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-[#003366] mb-6">Panel de Control de Proyectos</h2>

      {toastMsg ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {toastMsg}
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Proyectos Activos</h3>
          <button
            type="button"
            onClick={onCreateNew}
            className="text-sm bg-[#003366] text-white px-4 py-2 rounded shadow-sm hover:bg-blue-800 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Nuevo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Proyecto</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Enlace para Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-300 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Aún no hay proyectos. Comienza creando uno nuevo.
                  </td>
                </tr>
              ) : (
                projects.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#003366]">{doc.projectName}</td>
                    <td className="px-6 py-4">{doc.clientName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          'px-3 py-1 rounded-full text-xs font-bold ' +
                          (doc.status === 'Completado'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200')
                        }
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {doc.status === 'Pendiente' ? (
                        <button
                          type="button"
                          onClick={() => copyLink(doc.id)}
                          className="text-blue-700 hover:text-blue-900 font-medium text-xs border border-blue-200 px-3 py-1.5 rounded bg-white shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                          Copiar Enlace
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-[#003366] hover:underline font-bold text-xs flex items-center gap-1 ml-auto"
                        >
                          Ver Documento Completo
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
