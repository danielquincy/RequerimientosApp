import { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import type { RequirementDoc } from '../models/requirement.model';

type Props = {
  projectId: string;
};

export function ClientPortal({ projectId }: Props) {
  const { getProjectById, saveProject } = useApi();
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<RequirementDoc | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      const data = await getProjectById(projectId);
      if (cancelled) return;
      if (data) {
        setProjectData(data);
        setAnswers(data.customQuestions.map((q) => q.answer ?? ''));
        if (data.status === 'Completado') setIsSaved(true);
      }
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId, getProjectById]);

  const setAnswerAt = (i: number, value: string) => {
    setAnswers((a) => a.map((v, idx) => (idx === i ? value : v)));
  };

  const answersValid =
    projectData &&
    answers.length === projectData.customQuestions.length &&
    answers.every((a) => a.trim() !== '');

  const submitAnswers = async () => {
    if (!answersValid || !projectData) return;
    const doc = projectData;
    const updatedQuestions = doc.customQuestions.map((q, i) => ({ ...q, answer: answers[i] }));
    const updatedDoc: RequirementDoc = { ...doc, status: 'Completado', customQuestions: updatedQuestions };
    await saveProject(updatedDoc);
    setIsSaved(true);
    setTimeout(() => window.print(), 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]" />
      </div>
    );
  }

  if (!projectData) {
    return <div className="text-center p-20 text-red-600 font-bold">Documento no encontrado o ID inválido.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none animate-fade-in">
      <div className="bg-[#003366] text-white p-8 text-center print:bg-white print:text-[#003366] print:border-b-2 print:border-[#003366] print:p-0 print:pb-4">
        <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-[#003366] font-bold text-3xl mb-4 print:hidden">
          P
        </div>
        <h1 className="text-2xl font-bold mb-2">Formulario de Requerimientos</h1>
        <p className="text-blue-200 print:text-gray-600">
          Por favor, responde las siguientes preguntas para iniciar el diseño técnico.
        </p>
      </div>

      <div className="p-8 bg-blue-50 border-b border-blue-100 print:bg-transparent print:p-0 print:pt-6 print:border-none">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Información del Proyecto</h3>
        <p className="text-xl font-semibold text-[#003366]">{projectData.projectName}</p>
        <p className="text-gray-700 mt-2">
          <span className="font-medium">Objetivo:</span> {projectData.mainObjective}
        </p>
      </div>

      <form
        className="p-8 space-y-8 print:p-0 print:pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          void submitAnswers();
        }}
      >
        <div className="space-y-6">
          {projectData.customQuestions.map((q, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-base font-medium text-gray-800 break-words">
                {index + 1}. {q.text}
              </label>
              <textarea
                value={answers[index] ?? ''}
                onChange={(e) => setAnswerAt(index, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#003366] bg-gray-50 print:border-none print:bg-transparent print:p-0 print:italic print:text-gray-700"
                placeholder="Tu respuesta..."
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-between items-center print:hidden">
          <p className="text-xs text-gray-500">Tus respuestas se guardarán en la nube del proyecto.</p>
          <button
            type="submit"
            disabled={!answersValid || isSaved}
            className="px-6 py-3 bg-yellow-500 text-[#003366] font-bold rounded-md hover:bg-yellow-400 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaved ? 'Guardado ✅' : 'Guardar y Descargar PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}
