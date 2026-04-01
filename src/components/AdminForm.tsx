import { useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { Question, RequirementDoc } from '../models/requirement.model';

type Props = {
  onSaved: () => void;
};

const initialQuestions = ['¿Qué problema principal esperas resolver con este software?'];

export function AdminForm({ onSaved }: Props) {
  const { saveProject } = useApi();
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [mainObjective, setMainObjective] = useState('');
  const [concurrentUsers, setConcurrentUsers] = useState('');
  const [dataRetention, setDataRetention] = useState('');
  const [customQuestions, setCustomQuestions] = useState<string[]>(initialQuestions);

  const requiredOk =
    projectName.trim() !== '' &&
    clientName.trim() !== '' &&
    mainObjective.trim() !== '' &&
    customQuestions.every((q) => q.trim() !== '');

  const addQuestion = () => setCustomQuestions((q) => [...q, '']);
  const removeQuestion = (i: number) => setCustomQuestions((q) => q.filter((_, idx) => idx !== i));
  const setQuestionAt = (i: number, text: string) =>
    setCustomQuestions((q) => q.map((item, idx) => (idx === i ? text : item)));

  const saveDocument = async () => {
    if (!requiredOk) return;
    const questionsAsObjects: Question[] = customQuestions.map((text) => ({ text, answer: '' }));

    const newDoc: RequirementDoc = {
      id: 'REQ-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      date: new Date().toLocaleDateString('es-ES'),
      status: 'Pendiente',
      projectName,
      clientName,
      mainObjective,
      userRoles: '',
      mainActions: '',
      integrations: '',
      concurrentUsers,
      latency: '',
      security: '',
      dataRetention,
      customQuestions: questionsAsObjects,
    };

    await saveProject(newDoc);
    onSaved();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#003366] text-white rounded-t-lg">
        <div>
          <h2 className="text-xl font-bold">Configurar Nuevo Proyecto</h2>
          <p className="text-blue-200 text-sm mt-1">Define arquitectura y preguntas para el cliente.</p>
        </div>
        <button
          type="button"
          onClick={() => void saveDocument()}
          disabled={!requiredOk}
          className={
            'px-6 py-2 rounded-md font-bold transition-colors shadow-sm ' +
            (requiredOk
              ? 'bg-yellow-500 text-[#003366] hover:bg-yellow-400'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed')
          }
        >
          Guardar Proyecto
        </button>
      </div>

      <form
        className="p-6 md:p-8 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          void saveDocument();
        }}
      >
        <section>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 border-yellow-400">
            1. Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto *</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Área *</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Principal *</label>
              <textarea
                value={mainObjective}
                onChange={(e) => setMainObjective(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
              />
            </div>
          </div>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-[#003366] border-b pb-2 mb-4 border-blue-200">
            2. Parámetros Técnicos Internos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Carga Concurrente (Usuarios)</label>
              <input
                type="text"
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Retención de Datos (BD)</label>
              <input
                type="text"
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mt-1"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center border-b pb-2 mb-4 border-yellow-400">
            <h3 className="text-lg font-semibold text-gray-800">3. Formulario Dinámico para Cliente</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm bg-blue-100 text-[#003366] px-3 py-1 rounded shadow-sm hover:bg-blue-200 font-medium"
            >
              + Añadir Pregunta
            </button>
          </div>

          <div className="space-y-3">
            {customQuestions.map((qText, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                <span className="font-bold text-gray-400 mt-2">{index + 1}.</span>
                <input
                  value={qText}
                  onChange={(e) => setQuestionAt(index, e.target.value)}
                  placeholder="Redacta la pregunta aquí..."
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
                />
                <button type="button" onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-700 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      </form>
    </div>
  );
}
