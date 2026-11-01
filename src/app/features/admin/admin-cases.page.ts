import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CaseService } from '../../core/services/case.service';
import { LegalCase } from '../../core/models/legal-case.model';

@Component({
  selector: 'app-admin-cases-page',
  imports: [DatePipe, FormsModule],
  template: `
    <header class="page-heading"><div><span class="eyebrow">GESTION DES DEMANDES</span><h1 class="serif">Dossiers juridiques</h1><p>Consultez les demandes clients et publiez vos réponses.</p></div><span class="count-chip"><i class="pi pi-folder"></i> {{ allCases().length }} dossier(s)</span></header>
    <section class="cases-panel">
      <div class="toolbar"><label class="search-box"><i class="pi pi-search"></i><input [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Rechercher une référence, un client…" /></label><select [ngModel]="filter()" (ngModelChange)="filter.set($event)" aria-label="Filtrer les dossiers"><option value="TOUS">Tous les statuts</option><option value="EN_ATTENTE_PAIEMENT">Paiement attendu</option><option value="EN_ANALYSE">En analyse</option><option value="REPONDU">Répondu</option><option value="CLOTURE">Clôturé</option></select></div>
      @if (filteredCases().length) {
        <div class="case-list">@for (c of filteredCases(); track c.id) {
          <article class="case-row">
            <div class="case-title"><span class="case-icon"><i class="pi pi-file-edit"></i></span><div><strong>{{ c.reference }}</strong><small>{{ clientName(c.userId) }} · {{ c.createdAt | date:'dd/MM/yyyy HH:mm' }}</small></div></div>
            <div class="case-subject"><span>{{ c.domain }}</span><p>{{ c.question }}</p></div>
            <span class="status" [class]="'status ' + statusClass(c.status)">{{ statusLabel(c.status) }}</span>
            @if (c.response) { <button class="btn btn-line" type="button" (click)="openReply(c)"><i class="pi pi-eye"></i> Voir la réponse</button> }
            @else { <button class="btn btn-navy reply-button" type="button" (click)="openReply(c)"><i class="pi pi-send"></i> Répondre</button> }
          </article>
        }</div>
      } @else {
        <div class="empty-state"><span><i class="pi pi-inbox"></i></span><strong>{{ allCases().length ? 'Aucun résultat' : 'Aucun dossier reçu' }}</strong><p>{{ allCases().length ? 'Essayez une autre recherche ou un autre statut.' : 'Les nouvelles demandes clients apparaîtront ici.' }}</p></div>
      }
    </section>

    @if (selected(); as item) {
      <div class="reply-overlay" (click)="closeReply()"><section class="reply-modal" role="dialog" aria-modal="true" aria-label="Réponse au dossier" (click)="$event.stopPropagation()">
        <header><div><span class="eyebrow">{{ item.reference }}</span><h2 class="serif">{{ item.response ? 'Réponse au client' : 'Répondre au dossier' }}</h2></div><button type="button" aria-label="Fermer" (click)="closeReply()">×</button></header>
        <div class="client-question"><small>{{ clientName(item.userId) }} · {{ item.domain }}</small><p>{{ item.question }}</p></div>
        <label class="reply-label" for="reply-text">Votre réponse</label><textarea id="reply-text" rows="7" [(ngModel)]="response" [readonly]="!!item.response" placeholder="Rédigez une réponse claire et adaptée au dossier…"></textarea>
        @if (!item.response) { <p class="reply-hint"><i class="pi pi-info-circle"></i> La réponse publiée sera visible dans l’espace membre du client.</p> }
        <footer><button class="btn btn-line" type="button" (click)="closeReply()">Fermer</button>@if (!item.response) { <button class="btn btn-navy" type="button" [disabled]="!response.trim()" (click)="send()"><i class="pi pi-send"></i> Publier la réponse</button> }</footer>
      </section></div>
    }
  `,
  styles: [`
    :host { display:block; }.page-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; margin:2px 0 19px; }.eyebrow { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.14em; }.page-heading h1 { margin:4px 0 2px; color:#17334e; font-size:37px; }.page-heading p { margin:0; color:#7e8b96; font-size:13px; }.count-chip { display:flex; align-items:center; gap:7px; padding:8px 12px; border:1px solid #e2e8ed; border-radius:999px; background:#fff; color:#52677a; font-size:11px; font-weight:700; white-space:nowrap; }.cases-panel { overflow:hidden; border:1px solid #e5ebef; border-radius:15px; background:#fff; box-shadow:0 3px 14px #10253b06; }.toolbar { display:flex; gap:10px; padding:14px; border-bottom:1px solid #e9eef1; }.search-box { display:flex; align-items:center; gap:8px; flex:1; min-width:0; padding:0 11px; border:1px solid #e0e7eb; border-radius:10px; color:#87949e; }.search-box input { width:100%; min-height:40px; border:0; outline:0; color:#32485a; font:12px 'Source Sans 3',sans-serif; }.toolbar select { min-width:165px; border:1px solid #e0e7eb; border-radius:10px; padding:0 10px; background:#fff; color:#516474; font:12px 'Source Sans 3',sans-serif; }.case-row { display:grid; grid-template-columns:minmax(190px,1.1fr) minmax(190px,1.4fr) auto auto; align-items:center; gap:14px; padding:15px 17px; border-bottom:1px solid #edf0f2; }.case-row:last-child { border-bottom:0; }.case-title { display:flex; align-items:center; gap:10px; min-width:0; }.case-icon { display:grid; place-items:center; flex:none; width:36px; height:36px; border-radius:11px; background:#edf3f7; color:#3d607b; }.case-title > div { min-width:0; }.case-title strong,.case-title small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.case-title strong { color:#263f54; font-size:12px; }.case-title small { margin-top:3px; color:#87939d; font-size:10px; }.case-subject { min-width:0; }.case-subject > span { color:#b5764c; font-size:10px; font-weight:700; }.case-subject p { overflow:hidden; margin:3px 0 0; color:#647380; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }.status { display:inline-flex; padding:5px 8px; border-radius:99px; background:#fff4df; color:#916515; font-size:9px; font-weight:700; white-space:nowrap; }.status-done { background:#eaf6ee; color:#36734d; }.status-progress { background:#edf3fb; color:#315d8a; }.status-unpaid { background:#fff0ed; color:#9e5348; }.case-row .btn { min-height:34px; padding:0 10px; border-radius:8px; font-size:10px; white-space:nowrap; }.reply-button { background:#173650; color:#fff; }.case-row .btn i { font-size:10px; }.empty-state { display:grid; justify-items:center; padding:47px 20px; text-align:center; }.empty-state > span { display:grid; place-items:center; width:45px; height:45px; border-radius:14px; background:#edf3f7; color:#46627a; }.empty-state strong { margin-top:10px; color:#32485b; font-size:13px; }.empty-state p { margin:4px 0 0; color:#87939d; font-size:11px; }.reply-overlay { position:fixed; inset:0; z-index:70; display:grid; place-items:center; padding:18px; background:#0b1c2d80; }.reply-modal { width:min(620px,100%); max-height:min(90vh,800px); overflow:auto; padding:24px; border-radius:17px; background:#fff; box-shadow:0 22px 70px #06142155; }.reply-modal header { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }.reply-modal header h2 { margin:3px 0 13px; color:#1c3851; font-size:30px; }.reply-modal header button { width:32px; height:32px; border:0; border-radius:9px; background:#f0f3f5; color:#43586a; font-size:22px; }.client-question { margin:0 0 15px; padding:13px; border-radius:11px; background:#f6f8f9; }.client-question small { color:#a16e46; font-size:10px; font-weight:700; }.client-question p { margin:5px 0 0; color:#465b6b; font-size:12px; line-height:1.55; white-space:pre-wrap; }.reply-label { display:block; margin-bottom:6px; color:#354c5f; font-size:12px; font-weight:700; }.reply-modal textarea { width:100%; resize:vertical; padding:12px; border:1px solid #dfe6ea; border-radius:10px; color:#334a5d; font:13px/1.55 'Source Sans 3',sans-serif; }.reply-modal textarea:focus { outline:2px solid #c17a4a55; border-color:#c17a4a; }.reply-hint { color:#7d8993; font-size:10px; }.reply-modal footer { display:flex; justify-content:flex-end; gap:9px; margin-top:16px; }.reply-modal footer .btn { min-height:40px; font-size:11px; }
    @media(max-width:950px) { .case-row { grid-template-columns:minmax(180px,1fr) minmax(160px,1fr) auto; }.case-row .status { justify-self:start; }.case-row .btn { grid-column:3; grid-row:1; } }
    @media(max-width:650px) { .page-heading { align-items:flex-start; flex-direction:column; }.page-heading h1 { font-size:33px; }.toolbar { flex-direction:column; }.toolbar select { min-height:40px; }.case-row { grid-template-columns:1fr auto; gap:8px 10px; padding:13px; }.case-title { grid-column:1/-1; }.case-subject { grid-column:1/-1; }.case-row .status { grid-column:1; }.case-row .btn { grid-column:2; grid-row:3; justify-self:end; }.reply-modal { padding:19px 15px; }.reply-modal footer { flex-direction:column-reverse; }.reply-modal footer .btn { width:100%; } }
  `]
})
export class AdminCasesPage {
  private readonly caseService = inject(CaseService);
  private readonly auth = inject(AuthService);
  search = signal('');
  filter = signal('TOUS');
  private readonly revision = signal(0);
  selected = signal<LegalCase | null>(null);
  response = '';
  readonly allCases = computed(() => { this.revision(); return this.caseService.list(); });
  readonly filteredCases = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.allCases().filter((item) => {
      const matchesFilter = this.filter() === 'TOUS' || item.status === this.filter();
      const matchesSearch = !query || `${item.reference} ${this.clientName(item.userId)} ${item.question} ${item.domain}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  clientName(userId: string): string { return this.auth.users().find((user) => user.id === userId)?.fullName ?? 'Client'; }
  statusLabel(status: string): string { return ({ BROUILLON:'Brouillon', EN_ATTENTE_PAIEMENT:'Paiement attendu', EN_ANALYSE:'En analyse', REPONDU:'Répondu', CLOTURE:'Clôturé' } as Record<string,string>)[status] ?? status; }
  statusClass(status: string): string { return status === 'REPONDU' || status === 'CLOTURE' ? 'status-done' : status === 'EN_ANALYSE' ? 'status-progress' : status === 'EN_ATTENTE_PAIEMENT' ? 'status-unpaid' : ''; }

  openReply(item: LegalCase): void { this.selected.set(item); this.response = item.response ?? ''; }
  closeReply(): void { this.selected.set(null); this.response = ''; }
  send(): void {
    const item = this.selected();
    if (!item || !this.response.trim()) return;
    this.caseService.answer(item.id, this.response.trim());
    this.revision.update((value) => value + 1);
    this.closeReply();
  }
}
