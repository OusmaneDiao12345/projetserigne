import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccessService } from '../../core/services/access.service';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';

@Component({
  selector: 'app-confirmation-page',
  imports: [RouterLink],
  template: `
    <section class="container section" style="max-width:560px;text-align:center;">
      <div class="card" style="padding:32px;">
        @if (checking()) {
          <h1 class="serif">Vérification du paiement</h1>
          <p class="muted">Nous confirmons la transaction auprès du service de paiement…</p>
        } @else if (error()) {
          <h1 class="serif">Paiement non confirmé</h1>
          <p>{{ error() }}</p>
          <a class="btn btn-navy" routerLink="/espace">Retour à mon espace</a>
        } @else {
          <h1 class="serif">Paiement confirmé</h1>
          <p>Votre adhésion est active. Votre espace membre s'ouvre automatiquement.</p>
        }
      </div>
    </section>
  `
})
export class ConfirmationPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly payments = inject(PaymentGatewayService);
  private readonly access = inject(AccessService);
  checking = signal(true);
  error = signal('');

  async ngOnInit(): Promise<void> {
    const reference = this.route.snapshot.queryParamMap.get('ref');
    if (!reference) {
      this.checking.set(false);
      this.error.set('Référence de paiement absente.');
      return;
    }
    try {
      const payment = await this.payments.confirm(reference);
      await this.access.onPaymentSuccess(payment);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Le statut du paiement est indisponible. Réessayez dans quelques instants.');
    } finally {
      this.checking.set(false);
    }
  }
}
