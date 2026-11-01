import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CaseService } from '../../core/services/case.service';

@Component({
  selector: 'app-cases-page',
  imports: [RouterLink, DatePipe],
  template: `
    <header class="page-heading"><div><span class="eyebrow">SUIVI JURIDIQUE</span><h1 class="serif">Mes dossiers</h1><p>Consultez vos demandes et leur état de traitement.</p></div><span class="count-chip"><i class="pi pi-folder"></i> {{ cases().length }} dossier(s)</span></header>
    <section class="cases-card">
      @if (cases().length) {
        <div class="cases-table-wrap"><table class="cases-table"><thead><tr><th>Référence</th><th>Offre et domaine</th><th>Statut</th><th>Date de création</th><th></th></tr></thead>
          <tbody>@for (c of cases(); track c.id) { <tr><td><a class="reference-link" [routerLink]="['/espace/dossiers', c.id]">{{ c.reference }}</a></td><td><strong>{{ planLabel(c.planId) }}</strong><small>{{ c.domain }}</small></td><td><span class="status" [class]="'status ' + statusClass(c.status)">{{ statusLabel(c.status) }}</span></td><td>{{ c.createdAt | date:'dd MMM yyyy' }}</td><td><a class="detail-link" [routerLink]="['/espace/dossiers', c.id]" aria-label="Voir le dossier"><i class="pi pi-arrow-up-right"></i></a></td></tr> }</tbody>
        </table></div>
        <div class="case-cards">@for (c of cases(); track c.id) { <a class="case-mobile-card" [routerLink]="['/espace/dossiers', c.id]"><div><strong>{{ c.reference }}</strong><span class="status" [class]="'status ' + statusClass(c.status)">{{ statusLabel(c.status) }}</span></div><p>{{ c.domain }}</p><small>{{ c.createdAt | date:'dd MMM yyyy' }} · {{ planLabel(c.planId) }}</small></a> }</div>
      } @else {
        <div class="empty-state"><span class="empty-icon"><i class="pi pi-folder-open"></i></span><h2>Aucun dossier pour le moment</h2><p>Vos demandes juridiques apparaîtront ici dès leur soumission.</p><a class="btn btn-navy" routerLink="/" fragment="soumettre">Soumettre une question</a></div>
      }
    </section>
  `,
  styles: [`
    :host { display:block; }.page-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; margin:2px 0 20px; }.eyebrow { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.14em; }.page-heading h1 { margin:4px 0 2px; color:#17334e; font-size:38px; }.page-heading p { margin:0; color:#7e8b96; font-size:13px; }.count-chip { display:flex; align-items:center; gap:7px; padding:8px 12px; border:1px solid #e2e8ed; border-radius:999px; background:#fff; color:#52677a; font-size:12px; font-weight:700; white-space:nowrap; }.cases-card { overflow:hidden; border:1px solid #e5ebef; border-radius:16px; background:#fff; box-shadow:0 3px 14px #10253b06; }.cases-table { width:100%; border-collapse:collapse; text-align:left; }.cases-table th { padding:13px 16px; background:#f7f9fa; color:#7d8a95; font-size:10px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }.cases-table td { padding:15px 16px; border-top:1px solid #edf0f2; color:#52616e; font-size:12px; }.cases-table td strong,.cases-table td small { display:block; }.cases-table td strong { color:#2b3f51; font-size:12px; }.cases-table td small { margin-top:3px; color:#89959e; }.reference-link { color:#193e5c; font-weight:800; }.reference-link:hover,.detail-link:hover { color:#ae6b42; }.status { display:inline-flex; padding:5px 9px; border-radius:99px; background:#fff5df; color:#906413; font-size:10px; font-weight:700; white-space:nowrap; }.status-done { background:#eaf6ee; color:#36734d; }.status-progress { background:#edf3fb; color:#315d8a; }.status-unpaid { background:#fff0ed; color:#9e5348; }.detail-link { display:grid; place-items:center; width:30px; height:30px; border-radius:9px; background:#f1f5f8; color:#496176; }.case-cards { display:none; }.empty-state { display:grid; justify-items:center; padding:55px 22px; text-align:center; }.empty-icon { display:grid; place-items:center; width:50px; height:50px; border-radius:16px; background:#edf3f7; color:#41617c; }.empty-state h2 { margin:13px 0 4px; color:#203a52; font-size:24px; }.empty-state p { margin:0 0 17px; color:#7f8c96; font-size:13px; }.empty-state .btn { font-size:13px; }
    @media(max-width:760px) { .cases-table-wrap { display:none; }.case-cards { display:grid; padding:9px 14px; }.case-mobile-card { padding:14px 2px; border-bottom:1px solid #edf0f2; color:inherit; }.case-mobile-card:last-child { border-bottom:0; }.case-mobile-card > div { display:flex; align-items:center; justify-content:space-between; gap:8px; }.case-mobile-card > div strong { color:#254057; font-size:13px; }.case-mobile-card p { margin:7px 0 3px; color:#647481; font-size:12px; }.case-mobile-card small { color:#8c98a1; font-size:11px; } }
    @media(max-width:520px) { .page-heading { align-items:flex-start; flex-direction:column; }.page-heading h1 { font-size:34px; } }
  `]
})
export class CasesPage {
  private readonly auth = inject(AuthService);
  private readonly caseService = inject(CaseService);
  readonly cases = computed(() => this.caseService.byUser(this.auth.currentUser()!.id));

  statusLabel(status: string): string {
    return ({ BROUILLON: 'Brouillon', EN_ATTENTE_PAIEMENT: 'Paiement attendu', EN_ANALYSE: 'En analyse', REPONDU: 'Répondu', CLOTURE: 'Clôturé' } as Record<string, string>)[status] ?? status;
  }

  statusClass(status: string): string {
    return status === 'REPONDU' || status === 'CLOTURE' ? 'status-done' : status === 'EN_ANALYSE' ? 'status-progress' : status === 'EN_ATTENTE_PAIEMENT' ? 'status-unpaid' : '';
  }

  planLabel(planId: string): string {
    return planId === 'question-ecrite' ? 'Question traitée' : planId === 'ia' ? 'Réponse rapide' : 'Adhésion membre';
  }
}
