import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="member-app">
      <aside class="member-sidebar">
        <a routerLink="/" class="member-brand">
          <img src="assets/brand/logo-grf.jpg" alt="" />
          <span><strong>GRF CONSULTING</strong><small>Espace membre</small></span>
        </a>
        <div class="member-nav-label">MENU PRINCIPAL</div>
        <nav class="member-nav" aria-label="Navigation membre">
          <a routerLink="/espace" routerLinkActive="selected" [routerLinkActiveOptions]="{exact:true}"><i class="pi pi-th-large"></i><span>Vue d’ensemble</span></a>
          <a routerLink="/espace/dossiers" routerLinkActive="selected"><i class="pi pi-folder"></i><span>Mes dossiers</span></a>
          <a routerLink="/espace/paiements" routerLinkActive="selected"><i class="pi pi-wallet"></i><span>Paiements</span></a>
          <a routerLink="/espace/profil" routerLinkActive="selected"><i class="pi pi-user"></i><span>Mon profil</span></a>
          @if (auth.isAdmin()) { <a routerLink="/admin"><i class="pi pi-cog"></i><span>Administration</span></a> }
        </nav>
        <div class="member-sidebar-bottom">
          <button class="member-logout" type="button" (click)="logout()"><i class="pi pi-sign-out"></i> Déconnexion</button>
        </div>
      </aside>

      <div class="member-content">
        <header class="member-topbar">
          <button class="member-menu-button" type="button" aria-label="Ouvrir le menu" (click)="menuOpen.set(true)"><i class="pi pi-bars"></i></button>
          <div class="topbar-context"><span>Espace client</span><i class="pi pi-angle-right"></i><strong>{{ pageTitle() }}</strong></div>
          <div class="topbar-user"><span class="user-avatar">{{ initials() }}</span><div><strong>{{ auth.currentUser()?.fullName }}</strong><small>Membre GRF</small></div></div>
        </header>
        <main class="member-main"><router-outlet /></main>
        <footer class="member-footer">GRF CONSULTING <span>·</span> Le droit à la portée de tous</footer>
      </div>
    </div>

    @if (menuOpen()) {
      <div class="member-overlay" (click)="menuOpen.set(false)">
        <nav class="member-mobile-drawer" aria-label="Navigation mobile" (click)="$event.stopPropagation()">
          <div class="drawer-head"><strong>GRF CONSULTING</strong><button type="button" aria-label="Fermer le menu" (click)="menuOpen.set(false)">×</button></div>
          <a routerLink="/espace" routerLinkActive="selected" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen.set(false)"><i class="pi pi-th-large"></i> Vue d’ensemble</a>
          <a routerLink="/espace/dossiers" routerLinkActive="selected" (click)="menuOpen.set(false)"><i class="pi pi-folder"></i> Mes dossiers</a>
          <a routerLink="/espace/paiements" routerLinkActive="selected" (click)="menuOpen.set(false)"><i class="pi pi-wallet"></i> Paiements</a>
          <a routerLink="/espace/profil" routerLinkActive="selected" (click)="menuOpen.set(false)"><i class="pi pi-user"></i> Mon profil</a>
          <button class="member-logout" type="button" (click)="logout()"><i class="pi pi-sign-out"></i> Déconnexion</button>
        </nav>
      </div>
    }
  `,
  styles: [`
    :host { display:block; min-height:100vh; }
    .member-app { min-height:100vh; display:grid; grid-template-columns:260px minmax(0,1fr); background:#f4f6f8; color:#1b2a38; }
    .member-sidebar { position:sticky; top:0; height:100vh; padding:23px 16px 16px; display:flex; flex-direction:column; background:#10253b; color:#dce5ed; }
    .member-brand { display:flex; align-items:center; gap:11px; padding:0 8px 25px; color:white; }
    .member-brand img { width:40px; height:40px; border-radius:11px; object-fit:cover; }
    .member-brand strong,.member-brand small { display:block; }
    .member-brand strong { font-size:13px; letter-spacing:.055em; }
    .member-brand small { margin-top:3px; color:#9fb0c0; font-size:12px; }
    .member-nav-label { padding:9px 11px; color:#7e94a8; font-size:10px; font-weight:800; letter-spacing:.14em; }
    .member-nav { display:grid; gap:5px; }
    .member-nav a,.member-mobile-drawer a { display:flex; align-items:center; gap:12px; min-height:46px; padding:0 12px; border-radius:11px; color:#c7d3de; font-size:14px; font-weight:600; transition:background .18s,color .18s; }
    .member-nav a i,.member-mobile-drawer a i { width:19px; color:#9fb0c0; font-size:16px; }
    .member-nav a:hover,.member-nav a.selected { background:#1c3855; color:#fff; }
    .member-nav a.selected { box-shadow:inset 3px 0 #c17a4a; }
    .member-nav a.selected i { color:#e6ad83; }
    .member-sidebar-bottom { margin-top:auto; }
    .member-logout { display:flex; align-items:center; gap:10px; width:100%; min-height:43px; padding:0 12px; border:0; border-radius:10px; background:transparent; color:#b8c7d4; text-align:left; cursor:pointer; font:600 13px 'Source Sans 3',sans-serif; }
    .member-logout:hover { background:#ffffff10; color:#fff; }
    .member-content { min-width:0; display:flex; flex-direction:column; min-height:100vh; }
    .member-topbar { position:sticky; top:0; z-index:10; height:72px; display:flex; align-items:center; gap:15px; padding:0 clamp(18px,3vw,38px); background:#fff; border-bottom:1px solid #e8edf1; }
    .topbar-context { display:flex; align-items:center; gap:9px; color:#85919c; font-size:13px; }
    .topbar-context i { font-size:11px; }
    .topbar-context strong { color:#23384b; font-weight:700; }
    .topbar-user { display:flex; align-items:center; gap:9px; margin-left:auto; }
    .user-avatar { display:grid; place-items:center; width:37px; height:37px; border-radius:50%; background:#eaf0f5; color:#10253b; font-size:12px; font-weight:800; }
    .topbar-user strong,.topbar-user small { display:block; }
    .topbar-user strong { max-width:190px; overflow:hidden; color:#263b4d; font-size:12px; text-overflow:ellipsis; white-space:nowrap; }
    .topbar-user small { margin-top:2px; color:#8895a0; font-size:11px; }
    .member-main { width:min(1280px,100%); flex:1; margin:0 auto; padding:clamp(20px,3vw,38px); }
    .member-footer { padding:14px 28px 20px; color:#89949d; font-size:11px; text-align:center; }
    .member-footer span { padding:0 4px; }
    .member-menu-button { display:none; width:38px; height:38px; border:1px solid #e2e8ed; border-radius:10px; background:white; color:#10253b; }
    .member-overlay { position:fixed; inset:0; z-index:50; display:flex; background:#0b1c2d80; }
    .member-mobile-drawer { width:min(310px,86vw); padding:20px 14px; background:#10253b; }
    .drawer-head { display:flex; justify-content:space-between; align-items:center; padding:4px 8px 20px; color:#fff; }
    .drawer-head button { border:0; background:transparent; color:white; font-size:27px; }
    .member-mobile-drawer .member-logout { margin-top:16px; color:#fff; }
    @media(max-width:900px) { .member-app { grid-template-columns:1fr; } .member-sidebar { display:none; } .member-menu-button { display:grid; place-items:center; flex:none; } .member-main { padding:22px 16px; } }
    @media(max-width:520px) { .member-topbar { height:62px; gap:10px; padding:0 13px; } .topbar-context { gap:5px; font-size:12px; } .topbar-context span { display:none; } .topbar-context i { display:none; } .topbar-user > div { display:none; } .member-main { padding:20px 13px; } .member-footer { padding-bottom:14px; } }
  `]
})
export class DashboardLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  menuOpen = signal(false);

  pageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dossiers/')) return 'Détail du dossier';
    if (url.includes('/dossiers')) return 'Mes dossiers';
    if (url.includes('/paiements')) return 'Paiements';
    if (url.includes('/profil')) return 'Mon profil';
    return 'Vue d’ensemble';
  }

  initials(): string {
    return (this.auth.currentUser()?.fullName ?? 'GRF').split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
