import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';
import { AuthService } from '../../core/services/auth.service';
import { CaseService } from '../../core/services/case.service';

@Component({
  selector: 'app-overview-page',
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <section class="welcome-panel">
      <div class="welcome-copy">
        <span class="welcome-eyebrow">VOTRE ESPACE PERSONNEL</span>
        <h1 class="serif">Bonjour {{ firstName() }}</h1>
        <p>Retrouvez ici le suivi de vos demandes et de vos paiements juridiques.</p>
      </div>
      <a routerLink="/" fragment="soumettre" class="btn welcome-action"><i class="pi pi-plus"></i> Soumettre une question</a>
      <div class="welcome-watermark" aria-hidden="true"><i class="pi pi-scale"></i></div>
    </section>

    <section class="member-stats" aria-label="Résumé du compte">
      <article class="stat-card"><div class="stat-top"><span class="stat-icon stat-blue"><i class="pi pi-folder"></i></span><span class="stat-note">Au total</span></div><strong>{{ cases().length }}</strong><span class="stat-label">Dossiers soumis</span></article>
      <article class="stat-card"><div class="stat-top"><span class="stat-icon stat-amber"><i class="pi pi-clock"></i></span><span class="stat-note">En cours</span></div><strong>{{ inProgress() }}</strong><span class="stat-label">En cours d’analyse</span></article>
      <article class="stat-card"><div class="stat-top"><span class="stat-icon stat-green"><i class="pi pi-check-circle"></i></span><span class="stat-note">Disponibles</span></div><strong>{{ answered() }}</strong><span class="stat-label">Réponses reçues</span></article>
      <article class="stat-card"><div class="stat-top"><span class="stat-icon stat-copper"><i class="pi pi-wallet"></i></span><span class="stat-note">Paiements confirmés</span></div><strong>{{ total() | number:'1.0-0' }} <small>FCFA</small></strong><span class="stat-label">Montant réglé</span></article>
    </section>

    <section class="dashboard-grid">
      <article class="content-card recent-card">
        <header class="card-heading"><div><span class="card-eyebrow">VOTRE ACTIVITÉ</span><h2>Derniers dossiers</h2><p>Suivez l’avancement de vos demandes récentes.</p></div><a routerLink="/espace/dossiers" class="text-link">Tout voir <i class="pi pi-arrow-right"></i></a></header>
        @if (cases().length) {
          <div class="recent-list">
            @for (c of cases().slice(0, 5); track c.id) {
              <a class="recent-row" [routerLink]="['/espace/dossiers', c.id]">
                <span class="case-icon"><i class="pi pi-file-edit"></i></span>
                <span class="case-main"><strong>{{ c.domain }}</strong><small>{{ c.reference }} <span>·</span> {{ c.createdAt | date:'dd/MM/yyyy' }}</small></span>
                <span class="status-pill" [class]="'status-pill ' + statusClass(c.status)">{{ statusLabel(c.status) }}</span>
                <i class="pi pi-angle-right row-arrow"></i>
              </a>
            }
          </div>
        } @else {
          <div class="empty-dashboard"><span class="empty-icon"><i class="pi pi-file"></i></span><strong>Vous n’avez pas encore de dossier</strong><p>Soumettez une question pour commencer le suivi de votre demande.</p><a routerLink="/" fragment="soumettre" class="btn btn-navy">Créer mon premier dossier</a></div>
        }
      </article>

      <aside class="content-card quick-card">
        <span class="card-eyebrow">ACCÈS RAPIDE</span><h2>Mon espace</h2>
        <a routerLink="/espace/dossiers"><span class="quick-icon"><i class="pi pi-folder-open"></i></span><span><strong>Mes dossiers</strong><small>Consulter les demandes envoyées</small></span><i class="pi pi-angle-right quick-arrow"></i></a>
        <a routerLink="/espace/paiements"><span class="quick-icon"><i class="pi pi-wallet"></i></span><span><strong>Mes paiements</strong><small>Retrouver vos transactions</small></span><i class="pi pi-angle-right quick-arrow"></i></a>
        <a routerLink="/espace/profil"><span class="quick-icon"><i class="pi pi-user-edit"></i></span><span><strong>Mon profil</strong><small>Mettre à jour vos coordonnées</small></span><i class="pi pi-angle-right quick-arrow"></i></a>
        <div class="help-note"><i class="pi pi-shield"></i><p><strong>Vos données restent confidentielles.</strong><br />Vos informations et documents sont traités avec discrétion.</p></div>
      </aside>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .welcome-panel { position:relative; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:20px; min-height:188px; padding:30px clamp(22px,4vw,42px); border-radius:20px; background:linear-gradient(115deg,#10253b,#183b59); color:white; }
    .welcome-copy { position:relative; z-index:1; }
    .welcome-eyebrow,.card-eyebrow { color:#d8a37c; font-size:10px; font-weight:800; letter-spacing:.15em; }
    .welcome-panel h1 { margin:9px 0 4px; font-size:clamp(34px,4vw,46px); line-height:1; }
    .welcome-panel p { max-width:480px; margin:10px 0 0; color:#cad6e1; font-size:14px; }
    .welcome-action { position:relative; z-index:1; flex:none; background:#fff; color:#10253b; }
    .welcome-action:hover { background:#f7e9dd; }
    .welcome-watermark { position:absolute; right:20%; top:-53px; color:#ffffff08; font-size:215px; transform:rotate(-12deg); }
    .member-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin:20px 0; }
    .stat-card { min-width:0; padding:17px 18px; border:1px solid #e7ecf0; border-radius:15px; background:white; box-shadow:0 3px 12px #10253b05; }
    .stat-top { display:flex; align-items:center; justify-content:space-between; gap:6px; }
    .stat-icon { display:grid; place-items:center; width:36px; height:36px; border-radius:11px; }
    .stat-blue { background:#edf3fb; color:#2d65a0; }.stat-amber { background:#fff5e4; color:#a36b08; }.stat-green { background:#eaf6ee; color:#378056; }.stat-copper { background:#f8eee7; color:#ae6b42; }
    .stat-note { color:#93a0aa; font-size:10px; }
    .stat-card > strong { display:block; margin-top:12px; color:#152f47; font-size:27px; line-height:1.1; }
    .stat-card > strong small { font-size:13px; font-weight:600; }
    .stat-label { display:block; margin-top:4px; color:#74818c; font-size:12px; }
    .dashboard-grid { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(265px,.85fr); gap:16px; }
    .content-card { min-width:0; padding:22px; border:1px solid #e7ecf0; border-radius:16px; background:white; box-shadow:0 3px 12px #10253b05; }
    .card-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:15px; margin-bottom:17px; }
    .card-heading h2,.quick-card h2 { margin:5px 0 2px; color:#18334d; font-size:26px; }
    .card-heading p { margin:0; color:#84909b; font-size:12px; }
    .text-link { display:flex; align-items:center; gap:7px; margin-top:8px; color:#193b5a; font-size:12px; font-weight:700; white-space:nowrap; }
    .recent-list { border-top:1px solid #edf0f2; }
    .recent-row { display:flex; align-items:center; gap:12px; min-height:69px; padding:10px 2px; border-bottom:1px solid #edf0f2; color:inherit; }
    .recent-row:last-child { border-bottom:0; }
    .recent-row:hover .case-main strong { color:#a9663f; }
    .case-icon,.quick-icon { flex:none; display:grid; place-items:center; width:38px; height:38px; border-radius:11px; background:#f0f4f7; color:#35516a; }
    .case-main { flex:1; min-width:0; }
    .case-main strong,.case-main small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .case-main strong { color:#253b4e; font-size:13px; }
    .case-main small { margin-top:3px; color:#929da6; font-size:11px; }
    .case-main small span { padding:0 3px; }
    .status-pill { flex:none; padding:5px 9px; border-radius:999px; background:#fff5df; color:#906413; font-size:10px; font-weight:700; }
    .status-done { background:#eaf6ee; color:#38734d; }.status-progress { background:#edf3fb; color:#315d8a; }.status-unpaid { background:#fff0ed; color:#9e5348; }
    .row-arrow { color:#aeb8c0; font-size:12px; }
    .quick-card h2 { margin-bottom:14px; }
    .quick-card > a { display:flex; align-items:center; gap:11px; padding:12px 0; border-bottom:1px solid #edf0f2; color:inherit; }
    .quick-card > a:hover strong { color:#a9663f; }
    .quick-card > a > span:nth-child(2) { flex:1; }
    .quick-card > a strong,.quick-card > a small { display:block; }
    .quick-card > a strong { color:#2a3e50; font-size:12px; }
    .quick-card > a small { margin-top:3px; color:#8b97a1; font-size:10px; }
    .quick-arrow { color:#aeb8c0; font-size:12px; }
    .help-note { display:flex; gap:10px; margin-top:17px; padding:12px; border-radius:11px; background:#f8f4ec; color:#8a6a3c; }
    .help-note > i { margin-top:2px; }
    .help-note p { margin:0; font-size:10px; line-height:1.5; }
    .help-note strong { color:#675337; }
    .empty-dashboard { display:grid; justify-items:center; padding:27px 14px 16px; text-align:center; }
    .empty-icon { display:grid; place-items:center; width:48px; height:48px; border-radius:15px; background:#f0f4f7; color:#46627a; }
    .empty-dashboard > strong { margin-top:12px; color:#233b51; font-size:14px; }
    .empty-dashboard p { max-width:310px; margin:5px 0 15px; color:#83909a; font-size:12px; }
    @media(max-width:980px) { .member-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }.dashboard-grid { grid-template-columns:1fr; } }
    @media(max-width:600px) { .welcome-panel { align-items:flex-start; flex-direction:column; min-height:0; padding:23px 20px; }.welcome-action { width:100%; }.welcome-watermark { right:-25px; top:-20px; font-size:150px; }.member-stats { gap:9px; margin:13px 0; }.stat-card { padding:13px; }.stat-card > strong { font-size:23px; }.stat-note { max-width:78px; text-align:right; }.content-card { padding:17px 14px; }.card-heading h2,.quick-card h2 { font-size:23px; }.status-pill { max-width:105px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.row-arrow { display:none; } }
  `]
})
export class OverviewPage {
  private readonly auth = inject(AuthService);
  private readonly caseService = inject(CaseService);
  private readonly payments = inject(PaymentGatewayService);
  readonly cases = computed(() => this.caseService.byUser(this.auth.currentUser()!.id));
  readonly paid = computed(() => this.payments.byUser(this.auth.currentUser()!.id).filter((p) => p.status === 'PAID'));
  readonly total = computed(() => this.paid().reduce((sum, p) => sum + p.amount, 0));
  readonly inProgress = computed(() => this.cases().filter((item) => item.status === 'EN_ANALYSE').length);
  readonly answered = computed(() => this.cases().filter((item) => item.status === 'REPONDU' || item.status === 'CLOTURE').length);

  firstName(): string {
    return this.auth.currentUser()?.fullName.trim().split(/\s+/)[0] ?? 'membre';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { BROUILLON: 'Brouillon', EN_ATTENTE_PAIEMENT: 'Paiement attendu', EN_ANALYSE: 'En analyse', REPONDU: 'Répondu', CLOTURE: 'Clôturé' };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    if (status === 'REPONDU' || status === 'CLOTURE') return 'status-done';
    if (status === 'EN_ANALYSE') return 'status-progress';
    if (status === 'EN_ATTENTE_PAIEMENT') return 'status-unpaid';
    return '';
  }
}
