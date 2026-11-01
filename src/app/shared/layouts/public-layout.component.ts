import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../components/icon.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="app-shell">
      <div class="scroll-progress" aria-hidden="true" [style.transform]="'scaleX(' + progress() + ')'"></div>
      <header class="public-header" [class.scrolled]="scrolled()">
        <div class="container bar">
          <a routerLink="/" class="brand">
            <img src="assets/brand/logo-grf.jpg" alt="GRF CONSULTING" />
            <span>GRF CONSULTING</span>
          </a>
          <nav class="public-nav" aria-label="Navigation principale">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Accueil</a>
            <a routerLink="/espace">Espace membre</a>
            <a routerLink="/adhesion" routerLinkActive="active">Adhésion</a>
            @if (auth.isAdmin()) { <a routerLink="/admin">Gestion</a> }
            @if (!auth.isAuthenticated()) {
              <a class="btn btn-navy nav-signup" routerLink="/inscription">Inscription</a>
              <a class="nav-login" routerLink="/connexion" routerLinkActive="active">Connexion</a>
            } @else {
              <button class="nav-logout" type="button" (click)="logout()"><app-icon name="logout" /> Déconnexion</button>
            }
          </nav>
          <button class="icon-btn mobile-menu" type="button" aria-label="Ouvrir le menu" (click)="menuOpen.set(true)"><app-icon name="menu" /></button>
        </div>
      </header>

      <main><router-outlet /></main>

      <footer class="footer">
        <div class="footer-glow" aria-hidden="true"></div>
        <div class="container footer-grid">
          <div>
            <div class="brand" style="color:#fff;margin-bottom:8px;">
              <img src="assets/brand/logo-grf.jpg" alt="" />
              <strong>GRF CONSULTING</strong>
            </div>
            <p>Le droit à la portée de tous</p>
            <div class="footer-pay"><span><i class="pi pi-mobile"></i> Wave</span><span><i class="pi pi-mobile"></i> Orange Money</span></div>
          </div>
          <div>
            <h4>Navigation</h4>
            <a routerLink="/" fragment="assistant">Réponse rapide</a>
            <a routerLink="/" fragment="soumettre">Soumettre un dossier</a>
            <a routerLink="/" fragment="tarifs">Tarifs & Domaines</a>
            <a routerLink="/" fragment="faq">FAQ</a>
          </div>
          <div>
            <h4>Nos valeurs</h4>
            <p>Accessibilité · Rapidité · Confidentialité</p>
            <h4 style="margin-top:16px;">Contact</h4>
            <a href="mailto:contact@grfconsulting.sn">contact&#64;grfconsulting.sn</a>
          </div>
        </div>
        <div class="container footer-bottom">© {{ year }} GRF CONSULTING · Tous droits réservés</div>
      </footer>

      @if (showAsk() && !onAuth()) {
        <div class="ask-bar">
          <a class="btn btn-navy" routerLink="/" fragment="assistant">
            <app-icon name="chat" /> Poser une question
          </a>
        </div>
      }
    </div>

    @if (menuOpen()) {
      <div class="drawer" (click)="menuOpen.set(false)">
        <nav (click)="$event.stopPropagation()">
          <div class="brand"><img src="assets/brand/logo-grf.jpg" alt="" /><b>GRF CONSULTING</b></div>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="menuOpen.set(false)">Accueil</a>
          <a routerLink="/espace" (click)="menuOpen.set(false)">Espace membre</a>
          <a routerLink="/adhesion" (click)="menuOpen.set(false)">Adhésion</a>
          <a routerLink="/" fragment="assistant" (click)="menuOpen.set(false)">Réponse rapide</a>
          <a routerLink="/" fragment="tarifs" (click)="menuOpen.set(false)">Nos services</a>
          <a routerLink="/" fragment="faq" (click)="menuOpen.set(false)">Questions fréquentes</a>
          @if (auth.isAuthenticated()) {
            @if (auth.isAdmin()) { <a routerLink="/admin" (click)="menuOpen.set(false)">Gestion</a> }
            <button class="btn btn-line" (click)="logout()">Se déconnecter</button>
          } @else {
            <a routerLink="/connexion" (click)="menuOpen.set(false)">Connexion</a>
            <a class="btn btn-navy" routerLink="/inscription" (click)="menuOpen.set(false)">Inscription</a>
          }
        </nav>
      </div>
    }
  `
})
export class PublicLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  menuOpen = signal(false);
  showAsk = signal(false);
  onAuth = signal(false);
  scrolled = signal(false);
  progress = signal(0);
  readonly year = new Date().getFullYear();

  constructor() {
    afterNextRender(() => {
      const update = () => {
        const path = this.router.url.split('?')[0];
        const authPage = path === '/connexion' || path === '/inscription';
        this.onAuth.set(authPage);
        this.showAsk.set(!authPage && window.scrollY > 640);
        this.scrolled.set(window.scrollY > 12);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        this.progress.set(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      const sub = this.router.events.subscribe(() => update());
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', update);
        sub.unsubscribe();
      });
    });
  }

  logout(): void {
    this.auth.logout();
    this.menuOpen.set(false);
    void this.router.navigateByUrl('/');
  }
}
