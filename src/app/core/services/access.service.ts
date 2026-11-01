import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentSession } from '../models/payment.model';
import { SERVICE_PLANS } from '../config/catalog';
import { AuthService } from './auth.service';
import { CaseService } from './case.service';

@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly auth = inject(AuthService);
  private readonly cases = inject(CaseService);
  private readonly router = inject(Router);

  async onPaymentSuccess(session: PaymentSession): Promise<void> {
    if (session.planId === 'ia') {
      await this.router.navigate(['/'], { queryParams: { ia: 'paid', ref: session.providerReference }, fragment: 'assistant' });
      return;
    }
    const plan = SERVICE_PLANS.find((p) => p.id === session.planId);
    if (plan?.grantsAccess) {
      this.auth.activateMembership(session.userId, session.paidAt);
    }
    if (session.caseId) {
      this.cases.markPaid(session.caseId);
    }
    await this.router.navigate(['/espace']);
  }
}
