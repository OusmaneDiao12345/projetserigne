import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-app">
      <aside class="admin-sidebar">
        <a routerLink="/" class="admin-brand"><img src="assets/brand/logo-grf.jpg" alt="" /><span><strong>GRF CONSULTING</strong><small>Console d’administration</small></span></a>
        <div class="admin-nav-label">GESTION</div>
        <nav class="admin-nav" aria-label="Navigation administration">
          <a routerLink="/admin" routerLinkActive="selected" [routerLinkActiveOptions]="{exact:true}"><i class="pi pi-th-large"></i> Pilotage</a>
          <a routerLink="/admin/dossiers" routerLinkActive="selected"><i class="pi pi-folder"></i> Dossiers</a>
          <a routerLink="/admin/paiements" routerLinkActive="selected"><i class="pi pi-wallet"></i> Encaissements</a>
          <a routerLink="/admin/clients" routerLinkActive="selected"><i class="pi pi-users"></i> Clients</a>
        </nav>
        <div class="admin-bottom">
          <a routerLink="/espace"><i class="pi pi-external-link"></i> Espace membre</a>
          <button type="button" (click)="logout()"><i class="pi pi-sign-out"></i> Déconnexion</button>
          <div class="admin-identity"><span class="admin-avatar">{{ initials() }}</span><span><strong>{{ auth.currentUser()?.fullName }}</strong><small>Administrateur</small></span></div>
        </div>
      </aside>
      <div class="admin-content">
        <header class="admin-topbar">
          <button class="admin-menu-button" type="button" aria-label="Ouvrir le menu" (click)="menuOpen.set(true)"><i class="pi pi-bars"></i></button>
          <div><span>Administration</span><i class="pi pi-angle-right"></i><strong>{{ pageTitle() }}</strong></div>
          <span class="admin-status"><i class="pi pi-circle-fill"></i> Console active</span>
        </header>
        <main class="admin-main"><router-outlet /></main>
        <footer class="admin-footer">GRF CONSULTING <span>·</span> Gestion interne</footer>
      </div>
    </div>
    @if (menuOpen()) {
      <div class="admin-overlay" (click)="menuOpen.set(false)"><nav class="admin-drawer" (click)="$event.stopPropagation()">
        <div class="drawer-head"><strong>GRF Administration</strong><button type="button" aria-label="Fermer" (click)="menuOpen.set(false)">×</button></div>
        <a routerLink="/admin" routerLinkActive="selected" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen.set(false)"><i class="pi pi-th-large"></i> Pilotage</a>
        <a routerLink="/admin/dossiers" routerLinkActive="selected" (click)="menuOpen.set(false)"><i class="pi pi-folder"></i> Dossiers</a>
        <a routerLink="/admin/paiements" routerLinkActive="selected" (click)="menuOpen.set(false)"><i class="pi pi-wallet"></i> Encaissements</a>
        <a routerLink="/admin/clients" routerLinkActive="selected" (click)="menuOpen.set(false)"><i class="pi pi-users"></i> Clients</a>
        <button type="button" (click)="logout()"><i class="pi pi-sign-out"></i> Déconnexion</button>
      </nav></div>
    }
  `,
  styles: [`
    :host { display:block; min-height:100vh; }.admin-app { min-height:100vh; display:grid; grid-template-columns:260px minmax(0,1fr); background:#f4f6f8; color:#1b2a38; }.admin-sidebar { position:sticky; top:0; height:100vh; display:flex; flex-direction:column; padding:22px 15px 15px; background:#10253b; color:#dce5ed; }.admin-brand { display:flex; align-items:center; gap:10px; padding:0 8px 25px; color:#fff; }.admin-brand img { width:40px; height:40px; border-radius:11px; object-fit:cover; }.admin-brand strong,.admin-brand small { display:block; }.admin-brand strong { font-size:12px; letter-spacing:.06em; }.admin-brand small { margin-top:3px; color:#9fb0c0; font-size:11px; }.admin-nav-label { padding:8px 11px; color:#7e94a8; font-size:10px; font-weight:800; letter-spacing:.14em; }.admin-nav { display:grid; gap:5px; }.admin-nav a,.admin-bottom > a,.admin-bottom > button,.admin-drawer > a,.admin-drawer > button { display:flex; align-items:center; gap:11px; min-height:44px; padding:0 12px; border:0; border-radius:10px; background:transparent; color:#c7d3de; text-align:left; text-decoration:none; cursor:pointer; font:600 13px 'Source Sans 3',sans-serif; transition:background .16s,color .16s; }.admin-nav a i,.admin-bottom i,.admin-drawer i { width:18px; color:#9fb0c0; font-size:15px; }.admin-nav a.selected,.admin-nav a:hover,.admin-bottom > a:hover,.admin-bottom > button:hover,.admin-drawer > a:hover,.admin-drawer > button:hover { background:#1c3855; color:#fff; }.admin-nav a.selected { box-shadow:inset 3px 0 #c17a4a; }.admin-nav a.selected i { color:#e6ad83; }.admin-bottom { display:grid; gap:4px; margin-top:auto; }.admin-identity { display:flex; align-items:center; gap:9px; margin-top:13px; padding:12px 7px 3px; border-top:1px solid #ffffff1b; }.admin-avatar { display:grid; place-items:center; width:34px; height:34px; border-radius:50%; background:#e6edf3; color:#18334c; font-size:11px; font-weight:800; }.admin-identity strong,.admin-identity small { display:block; }.admin-identity strong { max-width:165px; overflow:hidden; color:#fff; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }.admin-identity small { margin-top:2px; color:#9fb0c0; font-size:10px; }.admin-content { display:flex; min-width:0; min-height:100vh; flex-direction:column; }.admin-topbar { position:sticky; top:0; z-index:10; height:68px; display:flex; align-items:center; gap:13px; padding:0 clamp(17px,3vw,36px); border-bottom:1px solid #e6ebef; background:#fff; }.admin-topbar > div { display:flex; align-items:center; gap:9px; color:#83909b; font-size:12px; }.admin-topbar > div strong { color:#253b4e; font-size:13px; }.admin-topbar > div i { font-size:10px; }.admin-status { display:flex; align-items:center; gap:7px; margin-left:auto; color:#687987; font-size:11px; }.admin-status i { color:#42a16a; font-size:8px; }.admin-main { width:min(1320px,100%); flex:1; margin:0 auto; padding:clamp(20px,3vw,36px); }.admin-footer { padding:12px 25px 19px; color:#89949d; font-size:10px; text-align:center; }.admin-footer span { padding:0 4px; }.admin-menu-button { display:none; width:37px; height:37px; border:1px solid #e1e7eb; border-radius:10px; background:white; color:#18334c; }.admin-overlay { position:fixed; inset:0; z-index:50; display:flex; background:#0b1c2d80; }.admin-drawer { width:min(310px,86vw); padding:19px 14px; background:#10253b; }.admin-drawer .drawer-head { display:flex; align-items:center; justify-content:space-between; padding:3px 9px 18px; color:#fff; }.admin-drawer .drawer-head button { border:0; background:transparent; color:#fff; font-size:26px; }.admin-drawer > a,.admin-drawer > button { width:100%; color:#dce5ed; }.admin-drawer > a.selected { background:#1c3855; }
    @media(max-width:900px) { .admin-app { grid-template-columns:1fr; }.admin-sidebar { display:none; }.admin-menu-button { display:grid; place-items:center; }.admin-main { padding:22px 16px; } }
    @media(max-width:520px) { .admin-topbar { height:60px; gap:9px; padding:0 13px; }.admin-status { font-size:0; }.admin-status i { font-size:9px; }.admin-main { padding:19px 13px; } }
  `]
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  menuOpen = signal(false);

  pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dossiers')) return 'Dossiers';
    if (url.includes('/paiements')) return 'Encaissements';
    if (url.includes('/clients')) return 'Clients';
    return 'Pilotage';
  }

  initials(): string {
    return (this.auth.currentUser()?.fullName ?? 'GRF').split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
