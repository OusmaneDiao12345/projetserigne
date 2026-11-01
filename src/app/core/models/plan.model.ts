export type PlanId = 'ia' | 'adhesion';

export interface ServicePlan {
  id: PlanId;
  title: string;
  price: number;
  currency: 'XOF';
  subtitle: string;
  features: string[];
  recommended?: boolean;
  grantsAccess: boolean;
  responseSlaHours: number | null;
}
