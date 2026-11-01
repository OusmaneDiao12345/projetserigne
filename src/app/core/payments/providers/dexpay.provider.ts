import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CheckoutRequest, ProviderCheckoutResult } from '../../models/payment.model';
import { PaymentProviderPort } from '../payment-provider';

async function postApi<T extends { error?: string; message?: string }>(path: string, body: unknown, fallback: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${environment.apiBaseUrl}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
  } catch {
    throw new Error('Le serveur de paiement est inaccessible. Relancez l’application avec « npm start », qui démarre aussi l’API.');
  }

  const raw = await response.text();
  if (!raw) throw new Error(`Le serveur de paiement a renvoyé une réponse vide (HTTP ${response.status}).`);
  let result: T;
  try {
    result = JSON.parse(raw) as T;
  } catch {
    throw new Error(`Réponse invalide du serveur de paiement (HTTP ${response.status}).`);
  }
  if (!response.ok) throw new Error(result.message ?? result.error ?? fallback);
  return result;
}

@Injectable({ providedIn: 'root' })
export class DexpayPaymentProvider implements PaymentProviderPort {
  readonly code = 'DEXPAY' as const;

  async createCheckout(request: CheckoutRequest & { amount: number; currency: string }): Promise<ProviderCheckoutResult> {
    const result = await postApi<ProviderCheckoutResult & { error?: string; message?: string }>(
      '/payments/dexpay/checkout', request, 'Impossible de démarrer le paiement.'
    );
    return result;
  }

  async confirm(providerReference: string, payerPhone?: string): Promise<{ paid: boolean; message: string }> {
    const result = await postApi<{ paid: boolean; message?: string; error?: string }>(
      '/payments/dexpay/confirm', { reference: providerReference, phone: payerPhone }, 'Le paiement n’est pas encore confirmé.'
    );
    return { paid: result.paid, message: result.message ?? 'Paiement confirmé.' };
  }
}
