import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentSession } from '../../core/models/payment.model';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { AccessService } from '../../core/services/access.service';

@Component({
  selector: 'app-provider-checkout-page',
  imports: [FormsModule, DecimalPipe, RouterLink],
  template: `
    <main class="sandbox-page">
      <div class="sandbox-wrap">
        <a class="sandbox-brand" routerLink="/" aria-label="Retour à GRF CONSULTING">
          <span class="brand-mark">GRF</span>
          <span><strong>GRF CONSULTING</strong><small>Paiement sécurisé</small></span>
        </a>

        @if (session(); as s) {
          <div class="sandbox-layout">
            <section class="sandbox-main card">
              <div class="sandbox-heading">
                <div>
                  <span class="test-badge"><span class="test-dot"></span> MODE TEST</span>
                  <h1 class="serif">Simulation de paiement</h1>
                  <p class="muted">Vérifiez les informations puis simulez la validation du paiement.</p>
                </div>
                <div class="sandbox-symbol" aria-hidden="true">↗</div>
              </div>

              <div class="sandbox-notice" role="note">
                <span class="notice-icon">i</span>
                <p><strong>Aucun paiement réel ne sera effectué.</strong><br />Cette page sert uniquement à tester le parcours de paiement.</p>
              </div>

              <div class="sandbox-form">
                <div class="section-label"><span>01</span><h2>Vos informations de paiement</h2></div>
                <div class="operator-summary">
                  <span class="operator-icon" [class]="'operator-icon operator-' + s.operator?.toLowerCase()">{{ operatorInitial(s.operator) }}</span>
                  <span><small>Opérateur sélectionné</small><strong>{{ operatorLabel(s.operator) }}</strong></span>
                  <span class="change-note">Choisi à l’étape précédente</span>
                </div>

                <div class="field phone-field">
                  <label for="payer-phone">Numéro associé à {{ operatorLabel(s.operator) }}</label>
                  <div class="phone-input-wrap">
                    <span class="country-prefix">🇸🇳 <b>+221</b></span>
                    <input id="payer-phone" [(ngModel)]="phone" type="tel" inputmode="numeric" autocomplete="tel-national"
                      placeholder="77 123 45 67" aria-describedby="phone-hint" />
                  </div>
                  <small id="phone-hint" class="field-hint">Saisissez le numéro qui recevra la demande de paiement.</small>
                </div>

                @if (error()) {
                  <div class="sandbox-error" role="alert">{{ error() }}</div>
                }

                <button class="btn btn-navy sandbox-submit" [disabled]="busy()" (click)="confirm()">
                  @if (busy()) { <span class="spinner"></span> Vérification en cours… }
                  @else { Simuler le paiement réussi <span aria-hidden="true">→</span> }
                </button>
                <p class="secure-note"><span aria-hidden="true">⌑</span> Simulation sécurisée · Aucun débit réel</p>
              </div>
            </section>

            <aside class="sandbox-summary card">
              <span class="summary-kicker">RÉCAPITULATIF</span>
              <h2>{{ planTitle(s.planId) }}</h2>
              <div class="summary-amount">{{ s.amount | number:'1.0-0' }} <span>FCFA</span></div>
              <div class="summary-divider"></div>
              <div class="summary-row"><span>Référence</span><strong>{{ s.providerReference }}</strong></div>
              <div class="summary-row"><span>Opérateur</span><strong>{{ operatorLabel(s.operator) }}</strong></div>
              <div class="summary-row"><span>Environnement</span><strong class="sandbox-label">DEXPAY Sandbox</strong></div>
              <div class="summary-foot"><span aria-hidden="true">✓</span> Votre espace membre sera activé après confirmation de la simulation.</div>
            </aside>
          </div>
        } @else {
          <section class="missing-session card">
            <span class="missing-icon">!</span>
            <h1 class="serif">Session introuvable</h1>
            <p class="muted">Cette session de paiement a expiré ou n’est pas disponible sur cette adresse.</p>
            <button class="btn btn-navy" (click)="router.navigate(['/adhesion'])">Reprendre l’adhésion</button>
          </section>
        }

        <footer class="sandbox-footer">GRF CONSULTING <span>·</span> Le droit à la portée de tous</footer>
      </div>
    </main>
  `,
  styles: [`
    :host { display:block; min-height:100%; }
    .sandbox-page { min-height:calc(100vh - 68px); padding:42px 20px 28px; background:radial-gradient(ellipse at 50% -10%, #e9e4dc 0, #f6f3ee 55%); }
    .sandbox-wrap { width:min(960px, 100%); margin:0 auto; }
    .sandbox-brand { display:flex; align-items:center; gap:11px; width:max-content; margin:0 0 30px; color:var(--navy); }
    .brand-mark { width:42px; height:42px; display:grid; place-items:center; border-radius:13px; background:var(--navy); color:#fff; font-family:'Cormorant Garamond',serif; font-weight:700; font-size:17px; }
    .sandbox-brand strong,.sandbox-brand small { display:block; }
    .sandbox-brand strong { font-size:14px; letter-spacing:.06em; }
    .sandbox-brand small { color:var(--muted); font-size:12px; margin-top:2px; }
    .sandbox-layout { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(260px,.85fr); gap:20px; align-items:start; }
    .sandbox-main,.sandbox-summary { padding:clamp(22px,4vw,38px); }
    .sandbox-heading { display:flex; justify-content:space-between; gap:14px; align-items:flex-start; }
    .test-badge { display:inline-flex; gap:8px; align-items:center; padding:6px 10px; border:1px solid #f1d7a1; background:#fff8e8; border-radius:99px; color:#885800; font-size:11px; font-weight:800; letter-spacing:.1em; }
    .test-dot { width:7px; height:7px; border-radius:50%; background:#d89522; box-shadow:0 0 0 3px #f6e9c9; }
    .sandbox-heading h1 { margin:14px 0 5px; color:var(--navy); font-size:clamp(32px,5vw,43px); line-height:1; }
    .sandbox-heading p { margin:0; line-height:1.5; }
    .sandbox-symbol { flex:none; width:44px; height:44px; display:grid; place-items:center; border-radius:14px; background:#f1f4f7; color:var(--navy); font-size:23px; }
    .sandbox-notice { display:flex; gap:12px; padding:14px; margin:24px 0 28px; background:#fff8e8; border:1px solid #f1e4c5; border-radius:13px; color:#704f18; }
    .sandbox-notice p { margin:0; font-size:13px; line-height:1.5; }
    .notice-icon { flex:none; display:grid; place-items:center; width:20px; height:20px; border:1.5px solid currentColor; border-radius:50%; font-size:12px; font-weight:800; }
    .section-label { display:flex; align-items:center; gap:10px; margin-bottom:15px; }
    .section-label > span { display:grid; place-items:center; width:25px; height:25px; border-radius:8px; background:#edf1f5; color:var(--navy); font-size:11px; font-weight:800; }
    .section-label h2 { margin:0; font:600 15px 'Source Sans 3',sans-serif; color:var(--ink); }
    .operator-summary { display:flex; align-items:center; gap:12px; padding:14px; margin-bottom:20px; border:1px solid var(--line); border-radius:13px; background:#fff; }
    .operator-icon { flex:none; display:grid; place-items:center; width:40px; height:40px; border-radius:12px; background:#edf2fb; color:#1b64d8; font-weight:800; }
    .operator-orange_money { background:#fff1e6; color:#f16e00; }
    .operator-free_money { background:#e9f6ee; color:#16844a; }
    .operator-summary small,.operator-summary strong { display:block; }
    .operator-summary small { color:var(--muted); font-size:12px; }
    .operator-summary strong { margin-top:2px; font-size:14px; }
    .change-note { margin-left:auto; color:#78838d; font-size:11px; text-align:right; }
    .phone-field { margin-bottom:18px; }
    .phone-input-wrap { display:flex; align-items:center; border:1px solid var(--line); border-radius:12px; background:#fff; overflow:hidden; transition:border-color .18s,box-shadow .18s; }
    .phone-input-wrap:focus-within { border-color:var(--copper); box-shadow:0 0 0 3px rgba(193,122,74,.16); }
    .country-prefix { display:flex; align-items:center; gap:7px; align-self:stretch; padding:0 13px; border-right:1px solid var(--line); color:var(--ink); font-size:13px; }
    .country-prefix b { font-weight:700; }
    .phone-input-wrap input { flex:1; min-width:0; border:0; outline:0; padding:13px 14px; font:inherit; background:transparent; }
    .field-hint { color:var(--muted); font-size:12px; }
    .sandbox-submit { width:100%; justify-content:space-between; min-height:50px; padding:0 18px; border-radius:12px; }
    .secure-note { display:flex; justify-content:center; gap:7px; margin:12px 0 0; color:var(--muted); font-size:12px; }
    .sandbox-error { margin:0 0 14px; padding:11px 13px; border-radius:10px; background:#fff0ed; color:#9f2d20; font-size:13px; }
    .spinner { width:16px; height:16px; border:2px solid #ffffff70; border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    .sandbox-summary { position:sticky; top:24px; }
    .summary-kicker { color:var(--muted); font-size:11px; font-weight:800; letter-spacing:.13em; }
    .sandbox-summary h2 { margin:12px 0 5px; color:var(--navy); font-size:25px; }
    .summary-amount { color:var(--navy); font-size:32px; font-weight:700; letter-spacing:-.03em; }
    .summary-amount span { font-size:15px; font-weight:600; letter-spacing:0; }
    .summary-divider { height:1px; margin:22px 0 12px; background:var(--line); }
    .summary-row { display:flex; flex-direction:column; gap:3px; padding:10px 0; border-bottom:1px solid #eee9e1; }
    .summary-row span { color:var(--muted); font-size:12px; }
    .summary-row strong { color:var(--ink); font-size:13px; overflow-wrap:anywhere; }
    .summary-row:last-of-type { border:0; }
    .summary-label { color:#936000 !important; }
    .summary-foot { display:flex; gap:9px; margin-top:15px; padding:12px; border-radius:11px; background:#edf7f0; color:#286744; font-size:12px; line-height:1.45; }
    .summary-foot span { font-weight:800; }
    .missing-session { max-width:480px; margin:70px auto; padding:36px; text-align:center; }
    .missing-icon { display:grid; place-items:center; width:46px; height:46px; margin:0 auto 12px; border-radius:50%; background:#fff2df; color:#9d6817; font-weight:800; }
    .missing-session h1 { margin:0 0 8px; color:var(--navy); font-size:36px; }
    .missing-session p { margin:0 0 20px; }
    .sandbox-footer { padding:23px 0 0; text-align:center; color:#7c858d; font-size:12px; }
    .sandbox-footer span { padding:0 5px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @media (max-width:720px) { .sandbox-page { padding:24px 14px; } .sandbox-brand { margin-bottom:20px; } .sandbox-layout { grid-template-columns:1fr; } .sandbox-summary { position:static; order:-1; padding:20px; } .sandbox-summary h2 { font-size:21px; } .summary-amount { font-size:27px; } .summary-divider { margin:14px 0 8px; } .summary-row { display:grid; grid-template-columns:110px 1fr; align-items:center; } }
  `]
})
export class ProviderCheckoutPage {
  private readonly route = inject(ActivatedRoute);
  private readonly payments = inject(PaymentGatewayService);
  private readonly auth = inject(AuthService);
  private readonly access = inject(AccessService);
  readonly router = inject(Router);

  phone = (this.auth.currentUser()?.phone ?? '').replace(/^\+?221/, '').replace(/\D/g, '');
  busy = signal(false);
  error = signal('');
  session = signal(this.payments.getById(this.route.snapshot.paramMap.get('sessionId') ?? ''));

  operatorLabel(operator: PaymentSession['operator']): string {
    return operator === 'ORANGE_MONEY' ? 'Orange Money' : operator === 'FREE_MONEY' ? 'Free Money' : 'Wave';
  }

  operatorInitial(operator: PaymentSession['operator']): string {
    return operator === 'ORANGE_MONEY' ? 'O' : operator === 'FREE_MONEY' ? 'F' : 'W';
  }

  planTitle(planId: string): string {
    return planId === 'question-ecrite' ? 'Question juridique traitée' : planId === 'ia' ? 'Réponse rapide' : 'Adhésion membre';
  }

  async confirm(): Promise<void> {
    const current = this.session();
    if (!current) return;
    if (this.phone.replace(/\D/g, '').length < 9) {
      this.error.set('Saisissez un numéro de téléphone valide (9 chiffres minimum).');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      const paid = await this.payments.confirm(current.id, this.phone);
      await this.access.onPaymentSuccess(paid);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Paiement refusé.');
    } finally {
      this.busy.set(false);
    }
  }
}
