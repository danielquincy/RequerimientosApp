export interface Question {
  text: string;
  answer?: string;
}

export interface RequirementDoc {
  id: string;
  date: string;
  projectName: string;
  clientName: string;
  mainObjective: string;
  userRoles: string;
  mainActions: string;
  integrations: string;
  concurrentUsers: string;
  latency: string;
  security: string;
  dataRetention: string;
  customQuestions: Question[];
  status: 'Pendiente' | 'Completado';
}
