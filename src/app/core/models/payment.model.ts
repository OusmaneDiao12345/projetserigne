export type PaymentProvider = 'DEXPAY';
export type MobileMoneyOperator = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface PaymentSession {
  id: string;
  provider: PaymentProvider;
  providerReference: string;
  checkoutUrl: string;
  amount: number;
  currency: 'XOF';
  planId: string;
  userId: string;
  caseId?: string;
  status: PaymentStatus;
  payerPhone?: string;
  operator?: MobileMoneyOperator;
  createdAt: string;
  paidAt?: string;
}

export interface CheckoutRequest {
  planId: string;
  provider: PaymentProvider;
  operator: MobileMoneyOperator;
  userId: string;
  caseId?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface ProviderCheckoutResult {
  providerReference: string;
  checkoutUrl: string;
  raw?: unknown;
}
