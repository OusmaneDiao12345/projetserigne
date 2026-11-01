import { CheckoutRequest, ProviderCheckoutResult } from '../models/payment.model';

export interface PaymentProviderPort {
  readonly code: 'DEXPAY';
  createCheckout(request: CheckoutRequest & { amount: number; currency: string }): Promise<ProviderCheckoutResult>;
  confirm(providerReference: string, payerPhone?: string): Promise<{ paid: boolean; message: string }>;
}
