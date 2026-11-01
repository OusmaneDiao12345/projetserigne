import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { PaymentSession } from '../../core/models/payment.model';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-payments-page',
  imports: [DatePipe, DecimalPipe],
  template: `
    <header class="page-heading"><div><span class="eyebrow">TRANSACTIONS</span><h1 class="serif">Mes paiements</h1><p>Consultez les règlements associés à votre compte.</p></div><div class="total-chip"><small>Total confirmé</small><strong>{{ total() | number:'1.0-0' }} FCFA</strong></div></header>
    <section class="payments-card">
      @if (payments().length) {
        <div class="payment-table-wrap"><table class="payment-table"><thead><tr><th>Transaction</th><th>Montant</th><th>Moyen de paiement</th><th>Statut</th><th>Date</th></tr></thead><tbody>
          @for (p of payments(); track p.id) { <tr><td><strong>{{ planLabel(p.planId) }}</strong><small>{{ p.providerReference }}</small></td><td class="amount-cell">{{ p.amount | number:'1.0-0' }} FCFA</td><td><span class="method-icon"><i class="pi pi-mobile"></i></span> DEXPAY · {{ operatorLabel(p.operator) }}</td><td><span class="payment-status" [class]="'payment-status ' + statusClass(p.status)"><span></span>{{ statusLabel(p.status) }}</span></td><td>{{ p.createdAt | date:'dd MMM yyyy, HH:mm' }}</td></tr> }
        </tbody></table></div>
        <div class="payment-mobile-list">@for (p of payments(); track p.id) { <article class="payment-mobile-card"><header><span class="method-icon"><i class="pi pi-mobile"></i></span><span><strong>{{ planLabel(p.planId) }}</strong><small>{{ p.providerReference }}</small></span><span class="payment-status" [class]="'payment-status ' + statusClass(p.status)"><span></span>{{ statusLabel(p.status) }}</span></header><div class="mobile-payment-meta"><span>{{ operatorLabel(p.operator) }} · {{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</span><strong>{{ p.amount | number:'1.0-0' }} FCFA</strong></div></article> }</div>
      } @else {
        <div class="empty-state"><span class="empty-icon"><i class="pi pi-wallet"></i></span><h2>Aucun paiement enregistré</h2><p>Vos paiements apparaîtront ici après une transaction.</p></div>
      }
    </section>
  `,
  styles: [`
    :host { display:block; }.page-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin:2px 0 20px; }.eyebrow { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.14em; }.page-heading h1 { margin:4px 0 2px; color:#17334e; font-size:38px; }.page-heading p { margin:0; color:#7e8b96; font-size:13px; }.total-chip { padding:10px 15px; border:1px solid #e4e9ed; border-radius:12px; background:#fff; text-align:right; }.total-chip small,.total-chip strong { display:block; }.total-chip small { color:#87939d; font-size:10px; }.total-chip strong { margin-top:3px; color:#183b59; font-size:17px; }.payments-card { overflow:hidden; border:1px solid #e5ebef; border-radius:16px; background:#fff; box-shadow:0 3px 14px #10253b06; }.payment-table { width:100%; border-collapse:collapse; text-align:left; }.payment-table th { padding:13px 15px; background:#f7f9fa; color:#7d8a95; font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }.payment-table td { padding:14px 15px; border-top:1px solid #edf0f2; color:#586875; font-size:12px; white-space:nowrap; }.payment-table td strong,.payment-table td small { display:block; }.payment-table td strong { color:#2b3f51; font-size:12px; }.payment-table td small { max-width:185px; margin-top:3px; overflow:hidden; color:#89959e; font-size:10px; text-overflow:ellipsis; }.amount-cell { color:#193b59 !important; font-weight:800; }.method-icon { display:inline-grid; place-items:center; width:30px; height:30px; margin-right:7px; vertical-align:middle; border-radius:9px; background:#edf3f8; color:#355975; }.payment-status { display:inline-flex; align-items:center; gap:6px; padding:5px 9px; border-radius:99px; background:#fff5df; color:#906413; font-size:10px; font-weight:700; }.payment-status > span { width:6px; height:6px; border-radius:50%; background:currentColor; }.status-paid { background:#eaf6ee; color:#36734d; }.status-failed,.status-cancelled { background:#fff0ed; color:#9e5348; }.payment-mobile-list { display:none; }.empty-state { display:grid; justify-items:center; padding:55px 22px; text-align:center; }.empty-icon { display:grid; place-items:center; width:50px; height:50px; border-radius:16px; background:#edf3f7; color:#41617c; }.empty-state h2 { margin:13px 0 4px; color:#203a52; font-size:24px; }.empty-state p { margin:0; color:#7f8c96; font-size:13px; }
    @media(max-width:900px) { .payment-table-wrap { display:none; }.payment-mobile-list { display:grid; padding:8px 14px; }.payment-mobile-card { padding:14px 2px; border-bottom:1px solid #edf0f2; }.payment-mobile-card:last-child { border-bottom:0; }.payment-mobile-card header { display:flex; align-items:center; gap:9px; }.payment-mobile-card header > span:nth-child(2) { flex:1; min-width:0; }.payment-mobile-card header strong,.payment-mobile-card header small { display:block; }.payment-mobile-card header strong { color:#2b3f51; font-size:12px; }.payment-mobile-card header small { max-width:155px; margin-top:3px; overflow:hidden; color:#89959e; font-size:10px; text-overflow:ellipsis; }.mobile-payment-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:12px 0 0 39px; color:#83909a; font-size:11px; }.mobile-payment-meta strong { color:#193b59; font-size:13px; white-space:nowrap; } }
    @media(max-width:520px) { .page-heading { align-items:flex-start; }.page-heading h1 { font-size:34px; }.total-chip { padding:8px 10px; }.total-chip strong { font-size:13px; }.payment-status { padding:5px 7px; font-size:9px; } }
  `]
})
export class PaymentsPage {
  private readonly auth = inject(AuthService);
  private readonly gateway = inject(PaymentGatewayService);
  readonly payments = computed(() => this.gateway.byUser(this.auth.currentUser()!.id));
  readonly total = computed(() => this.payments().filter((payment) => payment.status === 'PAID').reduce((sum, payment) => sum + payment.amount, 0));

  planLabel(planId: string): string {
    return planId === 'question-ecrite' ? 'Question juridique traitée' : planId === 'ia' ? 'Réponse rapide' : 'Adhésion membre';
  }

  operatorLabel(operator: PaymentSession['operator']): string {
    return operator === 'ORANGE_MONEY' ? 'Orange Money' : operator === 'FREE_MONEY' ? 'Free Money' : 'Wave';
  }

  statusLabel(status: PaymentSession['status']): string {
    return ({ PAID: 'Confirmé', PENDING: 'En attente', PROCESSING: 'En cours', FAILED: 'Échoué', CANCELLED: 'Annulé' } as Record<string, string>)[status] ?? status;
  }

  statusClass(status: PaymentSession['status']): string {
    return status === 'PAID' ? 'status-paid' : status === 'FAILED' ? 'status-failed' : status === 'CANCELLED' ? 'status-cancelled' : '';
  }
}
