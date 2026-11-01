import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SERVICE_PLANS } from '../../core/config/catalog';
import { PENDING_AI_DOMAIN_KEY, PENDING_AI_GUEST_ID_KEY, PENDING_AI_QUESTION_KEY } from '../../core/config/payment-flow';
import { MobileMoneyOperator, PaymentProvider } from '../../core/models/payment.model';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, DecimalPipe],
  template: `
    <section class="container section" style="max-width:720px;">
      <h1 class="serif">Paiement sécurisé</h1>
      @if (plan(); as p) {
        <p class="muted">Réglez {{ p.title }} — {{ p.price | number:'1.0-0' }} FCFA. L'accès est activé dès confirmation.</p>
        <div class="card" style="padding:22px;margin-bottom:16px;">
          <strong>{{ p.title }}</strong>
          <div class="price">{{ p.price | number:'1.0-0' }} FCFA</div>
          <ul class="features">@for (f of p.features; track f) { <li>{{ f }}</li> }</ul>
        </div>
        <h3>Paiement mobile sécurisé</h3>
        <div class="card payment-choice">
          <div class="field">
            <label for="operator">Choisissez l'opérateur utilisé pour payer</label>
            <select id="operator" [value]="operator()" (change)="operator.set($any($event.target).value)">
              <option value="WAVE">Wave</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="FREE_MONEY">Free Money</option>
            </select>
          </div>
          <p class="muted">En simulation, ce choix est utilisé pour afficher le paiement test. En mode DEXPAY, l'opérateur est à confirmer sur la page de paiement sécurisée.</p>
        </div>
        @if (error()) { <p style="color:#b42318;">{{ error() }}</p> }
        <button class="btn btn-navy" style="width:100%;margin-top:16px;" [disabled]="busy()" (click)="pay()">
          {{ busy() ? 'Préparation...' : 'Continuer le paiement' }}
        </button>
      } @else {
        <p>Offre introuvable. <a routerLink="/">Retour</a></p>
      }
    </section>
  `
})
export class CheckoutPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly payments = inject(PaymentGatewayService);

  provider = signal<PaymentProvider>('DEXPAY');
  operator = signal<MobileMoneyOperator>('WAVE');
  busy = signal(false);
  error = signal('');
  planId = this.route.snapshot.paramMap.get('planId') ?? '';
  plan = computed(() => SERVICE_PLANS.find((p) => p.id === this.planId) ?? null);

  async pay(): Promise<void> {
    this.error.set('');
    const plan = this.plan();
    if (!plan) return;
    if (plan.id === 'ia' && (!sessionStorage.getItem(PENDING_AI_QUESTION_KEY) || !sessionStorage.getItem(PENDING_AI_DOMAIN_KEY))) {
      await this.router.navigate(['/'], { fragment: 'assistant' });
      return;
    }
    const user = this.auth.currentUser();
    if (!user && plan.id !== 'ia') {
      await this.router.navigate(['/inscription'], { queryParams: { plan: this.planId } });
      return;
    }
    this.busy.set(true);
    try {
      let paymentUserId = user?.id;
      if (plan.id === 'ia' && !paymentUserId) {
        paymentUserId = sessionStorage.getItem(PENDING_AI_GUEST_ID_KEY) ?? `guest_${crypto.randomUUID()}`;
        sessionStorage.setItem(PENDING_AI_GUEST_ID_KEY, paymentUserId);
      }
      const origin = window.location.origin;
      const session = await this.payments.startCheckout({
        planId: plan.id,
        provider: this.provider(),
        operator: this.operator(),
        userId: paymentUserId!,
        returnUrl: `${origin}/paiement/confirmation`,
        cancelUrl: `${origin}/paiement/echec`
      });
      if (/^https:\/\//i.test(session.checkoutUrl)) {
        window.location.assign(session.checkoutUrl);
      } else {
        await this.router.navigate(['/paiement/checkout', session.providerReference]);
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Paiement impossible.');
    } finally {
      this.busy.set(false);
    }
  }
}
