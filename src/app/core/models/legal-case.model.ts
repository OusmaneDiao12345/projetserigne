export type CaseStatus = 'BROUILLON' | 'EN_ATTENTE_PAIEMENT' | 'EN_ANALYSE' | 'REPONDU' | 'CLOTURE';
export type ClientType = 'Particulier' | 'Entreprise' | 'Association';

export interface LegalCase {
  id: string;
  reference: string;
  userId: string;
  planId: string;
  domain: string;
  clientType: ClientType;
  question: string;
  documentName?: string;
  status: CaseStatus;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
