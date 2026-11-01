import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentSession } from '../../core/models/payment.model';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { CaseService } from '../../core/services/case.service';

@Component({
  selector: 'app-admin-overview-page',
  imports: [DecimalPipe, DatePipe, RouterLink],
  template: `
    <section class="admin-welcome"><div><span class="eyebrow">CENTRE DE PILOTAGE</span><h1 class="serif">Bonjour, {{ auth.currentUser()?.fullName }}</h1><p>Vue d’ensemble de l’activité GRF CONSULTING.</p></div><a class="btn welcome-button" routerLink="/admin/dossiers"><i class="pi pi-folder-open"></i> Examiner les dossiers</a></section>

    <section class="admin-stats">
      <article><div class="stat-head"><span class="stat-icon clients-icon"><i class="pi pi-users"></i></span><span>COMPTES</span></div><strong>{{ clients }}</strong><small>Clients inscrits</small></article>
      <article><div class="stat-head"><span class="stat-icon cases-icon"><i class="pi pi-folder"></i></span><span>DEMANDES</span></div><strong>{{ allCases.length }}</strong><small>{{ pendingCases }} demandes à suivre</small></article>
      <article><div class="stat-head"><span class="stat-icon revenue-icon"><i class="pi pi-wallet"></i></span><span>ENCAISSEMENTS</span></div><strong>{{ revenue | number:'1.0-0' }} <small>FCFA</small></strong><small>{{ paid.length }} paiements confirmés</small></article>
      <article><div class="stat-head"><span class="stat-icon questions-icon"><i class="pi pi-comments"></i></span><span>RÉPONSES RAPIDES</span></div><strong>{{ questionPayments }}</strong><small>Réponses rapides payées par les visiteurs</small></article>
    </section>

    <section class="admin-panels">
      <article class="admin-card activity-card">
        <header class="panel-heading"><div><span class="eyebrow">TRANSACTIONS</span><h2 class="serif">Activité récente</h2><p>Derniers paiements enregistrés sur la plateforme.</p></div><a routerLink="/admin/paiements">Tout voir <i class="pi pi-arrow-right"></i></a></header>
        @if (recentPayments.length) {
          <div class="table-scroll"><table class="admin-table"><thead><tr><th>Référence</th><th>Client</th><th>Opérateur</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
            @for (payment of recentPayments; track payment.id) { <tr><td><strong>{{ payment.providerReference }}</strong><small>{{ payment.createdAt | date:'dd/MM/yyyy HH:mm' }}</small></td><td>{{ clientName(payment.userId) }}</td><td><span class="operator-mark"><i class="pi pi-mobile"></i> {{ operatorLabel(payment.operator) }}</span></td><td class="amount">{{ payment.amount | number:'1.0-0' }} FCFA</td><td><span class="status" [class]="'status ' + statusClass(payment)">{{ statusLabel(payment) }}</span></td></tr> }
          </tbody></table></div>
        } @else { <div class="empty-state"><span><i class="pi pi-wallet"></i></span><strong>Aucun paiement pour le moment</strong><p>Les transactions apparaîtront ici après leur démarrage.</p></div> }
      </article>

      <article class="admin-card queue-card"><header class="panel-heading"><div><span class="eyebrow">TRAITEMENT</span><h2 class="serif">File des dossiers</h2><p>État des demandes reçues.</p></div></header>
        <div class="queue-row"><span class="queue-icon queue-wait"><i class="pi pi-clock"></i></span><span><strong>En attente de paiement</strong><small>Le client doit finaliser le règlement</small></span><b>{{ countCase('EN_ATTENTE_PAIEMENT') }}</b></div>
        <div class="queue-row"><span class="queue-icon queue-work"><i class="pi pi-file-edit"></i></span><span><strong>En cours d’analyse</strong><small>À examiner par l’équipe</small></span><b>{{ countCase('EN_ANALYSE') }}</b></div>
        <div class="queue-row"><span class="queue-icon queue-done"><i class="pi pi-check-circle"></i></span><span><strong>Réponses transmises</strong><small>Dossiers traités</small></span><b>{{ countCase('REPONDU') }}</b></div>
        <a class="queue-link" routerLink="/admin/dossiers">Ouvrir la gestion des dossiers <i class="pi pi-arrow-right"></i></a>
      </article>
    </section>
  `,
  styles: [`
    :host { display:block; }.admin-welcome { display:flex; align-items:flex-end; justify-content:space-between; gap:15px; margin:2px 0 21px; }.eyebrow { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.14em; }.admin-welcome h1 { margin:5px 0 3px; color:#17334e; font-size:38px; }.admin-welcome p { margin:0; color:#7d8a95; font-size:13px; }.welcome-button { min-height:43px; border-radius:10px; background:#10253b; color:#fff; font-size:12px; }.welcome-button i { font-size:13px; }.admin-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:13px; }.admin-stats article { min-width:0; padding:16px; border:1px solid #e5ebef; border-radius:14px; background:#fff; box-shadow:0 3px 12px #10253b05; }.stat-head { display:flex; align-items:center; justify-content:space-between; gap:5px; color:#95a0a9; font-size:9px; font-weight:800; letter-spacing:.1em; }.stat-icon { display:grid; place-items:center; width:34px; height:34px; border-radius:11px; font-size:14px; }.clients-icon { background:#edf3fa; color:#3b6891; }.cases-icon { background:#f7eee8; color:#ac7048; }.revenue-icon { background:#eaf5ed; color:#418159; }.questions-icon { background:#fff4df; color:#9b751e; }.admin-stats article > strong { display:block; overflow:hidden; margin-top:11px; color:#17334e; font-size:26px; text-overflow:ellipsis; white-space:nowrap; }.admin-stats article > strong small { font-size:12px; }.admin-stats article > small { display:block; margin-top:2px; color:#82909a; font-size:11px; }.admin-panels { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(275px,.85fr); gap:15px; margin-top:16px; align-items:start; }.admin-card { min-width:0; padding:19px; border:1px solid #e5ebef; border-radius:15px; background:#fff; box-shadow:0 3px 12px #10253b05; }.panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:15px; }.panel-heading h2 { margin:4px 0 2px; color:#203a52; font-size:25px; }.panel-heading p { margin:0; color:#84909a; font-size:11px; }.panel-heading > a { display:flex; align-items:center; gap:6px; margin-top:8px; color:#284e6b; font-size:11px; font-weight:700; white-space:nowrap; }.panel-heading > a i,.queue-link i { font-size:10px; }.table-scroll { overflow-x:auto; }.admin-table { width:100%; border-collapse:collapse; text-align:left; }.admin-table th { padding:10px 8px; border-bottom:1px solid #e8edf0; color:#82909a; font-size:9px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }.admin-table td { padding:12px 8px; border-bottom:1px solid #eef1f3; color:#536472; font-size:11px; white-space:nowrap; }.admin-table tbody tr:last-child td { border:0; }.admin-table td strong,.admin-table td small { display:block; }.admin-table td strong { max-width:135px; overflow:hidden; color:#2b4052; font-size:10px; text-overflow:ellipsis; }.admin-table td small { margin-top:3px; color:#8b969e; font-size:9px; }.operator-mark { display:inline-flex; align-items:center; gap:5px; }.operator-mark i { color:#61798e; }.amount { color:#1e3d57 !important; font-weight:800; }.status { display:inline-flex; padding:5px 8px; border-radius:99px; background:#fff4df; color:#926714; font-size:9px; font-weight:700; }.status-paid { background:#eaf6ee; color:#36734d; }.status-failed { background:#fff0ed; color:#9e5348; }.status-cancelled { background:#f0f2f4; color:#687784; }.empty-state { display:grid; justify-items:center; padding:27px 12px; text-align:center; }.empty-state > span { display:grid; place-items:center; width:40px; height:40px; border-radius:12px; background:#edf3f7; color:#46627a; }.empty-state strong { margin-top:9px; color:#32485b; font-size:12px; }.empty-state p { margin:3px 0 0; color:#8b969e; font-size:10px; }.queue-card .panel-heading { margin-bottom:7px; }.queue-row { display:flex; align-items:center; gap:10px; padding:12px 0; border-bottom:1px solid #edf0f2; }.queue-icon { display:grid; place-items:center; flex:none; width:34px; height:34px; border-radius:10px; font-size:13px; }.queue-wait { background:#fff5df; color:#a17520; }.queue-work { background:#edf3fa; color:#426b91; }.queue-done { background:#eaf6ee; color:#43805a; }.queue-row > span:nth-child(2) { flex:1; min-width:0; }.queue-row strong,.queue-row small { display:block; }.queue-row strong { color:#374b5d; font-size:11px; }.queue-row small { margin-top:2px; color:#8b969e; font-size:9px; }.queue-row > b { color:#1b3852; font-size:19px; }.queue-link { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:14px; padding:12px; border:1px solid #e2e8ec; border-radius:10px; color:#294d69; font-size:10px; font-weight:700; }.queue-link:hover { border-color:#bd8058; background:#fcf8f4; }
    @media(max-width:1050px) { .admin-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }.admin-panels { grid-template-columns:1fr; } }
    @media(max-width:600px) { .admin-welcome { align-items:flex-start; flex-direction:column; }.admin-welcome h1 { font-size:33px; }.welcome-button { width:100%; justify-content:center; }.admin-stats { gap:9px; }.admin-stats article { padding:12px; }.admin-stats article > strong { font-size:22px; }.admin-card { padding:15px 12px; }.activity-card .table-scroll { margin-right:-12px; }.admin-table { min-width:580px; } }
  `]
})
export class AdminOverviewPage {
  readonly auth = inject(AuthService);
  private readonly caseService = inject(CaseService);
  private readonly paymentService = inject(PaymentGatewayService);

  readonly clients = this.auth.users().filter((user) => user.role === 'CLIENT').length;
  readonly allCases = this.caseService.list();
  readonly pendingCases = this.allCases.filter((item) => item.status === 'EN_ATTENTE_PAIEMENT' || item.status === 'EN_ANALYSE').length;
  readonly allPayments = this.paymentService.list().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  readonly paid = this.allPayments.filter((payment) => payment.status === 'PAID');
  readonly recentPayments = this.allPayments.slice(0, 6);
  readonly revenue = this.paid.reduce((sum, payment) => sum + payment.amount, 0);
  readonly questionPayments = this.paid.filter((payment) => payment.planId === 'ia').length;

  clientName(userId: string): string { return this.auth.users().find((user) => user.id === userId)?.fullName ?? 'Client'; }
  countCase(status: string): number { return this.allCases.filter((item) => item.status === status).length; }
  operatorLabel(operator: PaymentSession['operator']): string { return operator === 'ORANGE_MONEY' ? 'Orange Money' : operator === 'FREE_MONEY' ? 'Free Money' : 'Wave'; }
  statusLabel(payment: PaymentSession): string { return payment.status === 'PAID' ? 'Confirmé' : payment.status === 'PENDING' ? 'En attente' : payment.status === 'PROCESSING' ? 'En cours' : payment.status === 'FAILED' ? 'Échoué' : 'Annulé'; }
  statusClass(payment: PaymentSession): string { return payment.status === 'PAID' ? 'status-paid' : payment.status === 'FAILED' ? 'status-failed' : payment.status === 'CANCELLED' ? 'status-cancelled' : ''; }
}
