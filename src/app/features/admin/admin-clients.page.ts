import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-clients-page',
  imports: [DatePipe, FormsModule],
  template: `
    <header class="page-heading"><div><span class="eyebrow">BASE CLIENTS</span><h1 class="serif">Clients</h1><p>Consultez les membres inscrits et leur accès à la plateforme.</p></div><span class="count-chip"><i class="pi pi-users"></i> {{ clients().length }} client(s)</span></header>
    <section class="clients-panel">
      <div class="toolbar"><label class="search-box"><i class="pi pi-search"></i><input [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="Rechercher un nom, email ou téléphone…" /></label></div>
      @if (clients().length) {
        <div class="table-wrap"><table class="clients-table"><thead><tr><th>Membre</th><th>Coordonnées</th><th>Accès plateforme</th><th>Date d’inscription</th></tr></thead><tbody>
          @for (u of clients(); track u.id) { <tr><td><div class="client-cell"><span class="client-avatar">{{ initials(u.fullName) }}</span><span><strong>{{ u.fullName }}</strong><small>Membre GRF</small></span></div></td><td><strong>{{ u.email }}</strong><small>{{ u.phone || 'Téléphone non renseigné' }}</small></td><td><span class="access-pill" [class.access-active]="auth.userHasPlatformAccess(u)"><i [class]="auth.userHasPlatformAccess(u) ? 'pi pi-check-circle' : 'pi pi-clock'"></i>{{ auth.userHasPlatformAccess(u) ? 'Actif' : 'À renouveler' }}</span></td><td>{{ u.createdAt | date:'dd MMM yyyy' }}</td></tr> }
        </tbody></table></div>
        <div class="mobile-clients">@for (u of clients(); track u.id) { <article><div class="client-cell"><span class="client-avatar">{{ initials(u.fullName) }}</span><span><strong>{{ u.fullName }}</strong><small>{{ u.email }}</small></span></div><div class="client-meta"><span>{{ u.phone || 'Téléphone non renseigné' }}</span><span class="access-pill" [class.access-active]="auth.userHasPlatformAccess(u)"><i [class]="auth.userHasPlatformAccess(u) ? 'pi pi-check-circle' : 'pi pi-clock'"></i>{{ auth.userHasPlatformAccess(u) ? 'Actif' : 'À renouveler' }}</span></div><small class="joined">Inscrit le {{ u.createdAt | date:'dd/MM/yyyy' }}</small></article> }</div>
      } @else { <div class="empty-state"><span><i class="pi pi-users"></i></span><strong>{{ search() ? 'Aucun client trouvé' : 'Aucun client inscrit' }}</strong><p>{{ search() ? 'Essayez avec un autre nom, email ou téléphone.' : 'Les inscriptions apparaîtront ici.' }}</p></div> }
    </section>
  `,
  styles: [`
    :host { display:block; }.page-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:14px; margin:2px 0 19px; }.eyebrow { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.14em; }.page-heading h1 { margin:4px 0 2px; color:#17334e; font-size:37px; }.page-heading p { margin:0; color:#7e8b96; font-size:13px; }.count-chip { display:flex; align-items:center; gap:7px; padding:8px 12px; border:1px solid #e2e8ed; border-radius:999px; background:#fff; color:#52677a; font-size:11px; font-weight:700; white-space:nowrap; }.clients-panel { overflow:hidden; border:1px solid #e5ebef; border-radius:15px; background:#fff; box-shadow:0 3px 14px #10253b06; }.toolbar { padding:13px 14px; border-bottom:1px solid #e9eef1; }.search-box { display:flex; align-items:center; gap:8px; max-width:480px; padding:0 11px; border:1px solid #e0e7eb; border-radius:10px; color:#87949e; }.search-box input { width:100%; min-height:40px; border:0; outline:0; color:#32485a; font:12px 'Source Sans 3',sans-serif; }.clients-table { width:100%; border-collapse:collapse; text-align:left; }.clients-table th { padding:12px 16px; background:#f7f9fa; color:#7d8a95; font-size:9px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }.clients-table td { padding:13px 16px; border-top:1px solid #edf0f2; color:#596a77; font-size:11px; }.clients-table td strong,.clients-table td small,.client-cell strong,.client-cell small { display:block; }.clients-table td strong { color:#31495d; font-size:11px; }.clients-table td small { margin-top:3px; color:#89959e; font-size:10px; }.client-cell { display:flex; align-items:center; gap:9px; }.client-avatar { display:grid; place-items:center; flex:none; width:34px; height:34px; border-radius:50%; background:#eaf0f5; color:#294d69; font-size:10px; font-weight:800; }.client-cell strong { color:#2c4357; font-size:11px; }.client-cell small { margin-top:3px; color:#8a969f; font-size:10px; }.access-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:99px; background:#fff5df; color:#946a19; font-size:9px; font-weight:700; white-space:nowrap; }.access-active { background:#eaf6ee; color:#36734d; }.mobile-clients { display:none; }.empty-state { display:grid; justify-items:center; padding:48px 20px; text-align:center; }.empty-state > span { display:grid; place-items:center; width:45px; height:45px; border-radius:14px; background:#edf3f7; color:#46627a; }.empty-state strong { margin-top:10px; color:#32485b; font-size:13px; }.empty-state p { margin:4px 0 0; color:#87939d; font-size:11px; }
    @media(max-width:750px) { .table-wrap { display:none; }.mobile-clients { display:grid; padding:4px 14px; }.mobile-clients article { padding:12px 1px; border-bottom:1px solid #edf0f2; }.mobile-clients article:last-child { border-bottom:0; }.mobile-clients .client-cell { align-items:flex-start; }.mobile-clients .client-cell > span:last-child { min-width:0; }.mobile-clients .client-cell strong,.mobile-clients .client-cell small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.mobile-clients .client-cell strong { margin-top:3px; }.client-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:10px 0 0 43px; color:#7f8b95; font-size:10px; }.joined { display:block; margin:6px 0 0 43px; color:#929da5; font-size:9px; } }
    @media(max-width:520px) { .page-heading { align-items:flex-start; flex-direction:column; }.page-heading h1 { font-size:33px; } }
  `]
})
export class AdminClientsPage {
  readonly auth = inject(AuthService);
  search = signal('');
  readonly clients = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.auth.users().filter((user) => user.role === 'CLIENT' && (!query || `${user.fullName} ${user.email} ${user.phone ?? ''}`.toLowerCase().includes(query)));
  });

  initials(name: string): string { return name.trim().split(/\s+/).slice(0,2).map((part) => part.charAt(0)).join('').toUpperCase(); }
}
