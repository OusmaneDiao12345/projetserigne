import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-screen">
      <aside class="auth-aside">
        <p class="kicker" style="color:#e7b08a;">Espace membre</p>
        <h1>Retrouvez vos dossiers et le fil de vos questions.</h1>
        <p class="lede">Un accès personnel pour suivre chaque demande, du dépôt jusqu’à la réponse.</p>
      </aside>
      <div class="auth-panel">
        <div class="card auth-card">
          <h2 class="serif">Connexion</h2>
          <div class="auth-fields">
            <div class="field">
              <label for="email">Email</label>
              <input id="email" [(ngModel)]="email" type="email" autocomplete="username" placeholder="vous@exemple.com" />
            </div>
            <div class="field">
              <label for="password">Mot de passe</label>
              <div class="secret">
                <input id="password" [(ngModel)]="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password" placeholder="Votre mot de passe" />
                <button class="secret-toggle" type="button" (click)="showPassword.set(!showPassword())" [attr.aria-pressed]="showPassword()" [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <i class="pi" [class.pi-eye]="!showPassword()" [class.pi-eye-slash]="showPassword()"></i>
                </button>
              </div>
            </div>
          </div>
          @if (error()) { <p class="form-error">{{ error() }}</p> }
          <button class="btn btn-navy" style="width:100%;" type="button" (click)="submit()">Se connecter</button>
          <p class="muted auth-switch">Pas encore de compte ? <a routerLink="/inscription">Créer un compte</a></p>
        </div>
      </div>
    </section>
  `
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  email = '';
  password = '';
  showPassword = signal(false);
  error = signal('');

  async submit(): Promise<void> {
    this.error.set('');
    try {
      const user = await this.auth.login(this.email, this.password);
      const redirect = this.route.snapshot.queryParamMap.get('redirect');
      if (user.role === 'ADMIN') {
        await this.router.navigateByUrl(redirect || '/admin');
      } else if (this.auth.userHasPlatformAccess(user)) {
        await this.router.navigateByUrl(redirect || '/espace');
      } else {
        await this.router.navigateByUrl(redirect || '/adhesion');
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Connexion impossible.');
    }
  }
}
