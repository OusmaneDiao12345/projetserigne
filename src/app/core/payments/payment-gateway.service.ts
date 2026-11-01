import { Injectable, inject } from '@angular/core';
import { CheckoutRequest, PaymentSession, PaymentStatus } from '../models/payment.model';
import { SERVICE_PLANS } from '../config/catalog';
import { createId } from '../services/id.util';
import { StorageService } from '../services/storage.service';
import { PaymentProviderPort } from './payment-provider';
import { DexpayPaymentProvider } from './providers/dexpay.provider';

const KEY = 'grf.payments';

@Injectable({ providedIn: 'root' })
export class PaymentGatewayService {
  private readonly storage = inject(StorageService);
  private readonly dexpay = inject(DexpayPaymentProvider);

  private providerOf(code: CheckoutRequest['provider']): PaymentProviderPort {
    return this.dexpay;
  }

  list(): PaymentSession[] {
    return this.storage.read<PaymentSession[]>(KEY, []);
  }

  getById(id: string): PaymentSession | undefined {
    return this.list().find((p) => p.id === id || p.providerReference === id);
  }

  async startCheckout(request: CheckoutRequest): Promise<PaymentSession> {
    const plan = SERVICE_PLANS.find((p) => p.id === request.planId);
    if (!plan || plan.price <= 0) {
      throw new Error('Cette offre ne nécessite pas de paiement.');
    }

    const provider = this.providerOf(request.provider);
    const result = await provider.createCheckout({
      ...request,
      amount: plan.price,
      currency: plan.currency
    });

    const session: PaymentSession = {
      id: createId('pay'),
      provider: request.provider,
      providerReference: result.providerReference,
      checkoutUrl: result.checkoutUrl,
      amount: plan.price,
      currency: plan.currency,
      planId: request.planId,
      userId: request.userId,
      caseId: request.caseId,
      status: 'PENDING',
      operator: request.operator,
      createdAt: new Date().toISOString()
    };

    this.save([...this.list(), session]);
    return session;
  }

  async confirm(sessionId: string, payerPhone?: string): Promise<PaymentSession> {
    const sessions = this.list();
    const index = sessions.findIndex((s) => s.id === sessionId || s.providerReference === sessionId);
    if (index < 0) {
      throw new Error('Session de paiement introuvable.');
    }

    const current = sessions[index];
    const outcome = await this.providerOf(current.provider).confirm(current.providerReference, payerPhone);
    const status: PaymentStatus = outcome.paid ? 'PAID' : 'FAILED';
    const updated: PaymentSession = {
      ...current,
      payerPhone,
      status,
      paidAt: outcome.paid ? new Date().toISOString() : current.paidAt
    };
    sessions[index] = updated;
    this.save(sessions);
    if (!outcome.paid) {
      throw new Error(outcome.message);
    }
    return updated;
  }

  mark(sessionId: string, status: PaymentStatus): PaymentSession {
    const sessions = this.list();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index < 0) {
      throw new Error('Session introuvable.');
    }
    sessions[index] = { ...sessions[index], status };
    this.save(sessions);
    return sessions[index];
  }

  byUser(userId: string): PaymentSession[] {
    return this.list()
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  private save(sessions: PaymentSession[]): void {
    this.storage.write(KEY, sessions);
  }
}
