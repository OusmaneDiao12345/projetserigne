import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-screen">
      <aside class="auth-aside">
        @if (isAiCheckout) {
          <p class="kicker" style="color:#e7b08a;">Réponse rapide · 1 000 FCFA</p>
          <h1>Créez votre compte pour recevoir votre orientation.</h1>
          <p class="lede">Après votre inscription, réglez la consultation IA. La réponse s’affichera après confirmation du paiement.</p>
        } @else {
          <p class="kicker" style="color:#e7b08a;">Adhésion · 5 000 FCFA</p>
          <h1>Ouvrez votre espace, puis suivez chaque question.</h1>
          <p class="lede">Le paiement confirmé active votre adhésion pour un an. Vos questions juridiques sont ensuite incluses pendant cette période.</p>
        }
        <ul class="auth-points">
          @if (isAiCheckout) {
            <li><i class="pi pi-check"></i> 1 000 FCFA par question</li>
            <li><i class="pi pi-check"></i> Réponse après validation de la transaction</li>
            <li><i class="pi pi-check"></i> Orientation en droit sénégalais</li>
          } @else {
            <li><i class="pi pi-check"></i> Accès à l’espace membre après confirmation</li>
            <li><i class="pi pi-check"></i> Questions incluses pendant un an</li>
            <li><i class="pi pi-check"></i> Compte personnel sécurisé</li>
          }
        </ul>
      </aside>
      <div class="auth-panel">
        <div class="card auth-card">
          <p class="kicker">Inscription</p>
          <h2 class="serif">Créer un compte</h2>
          <p class="muted">{{ isAiCheckout ? 'Quelques informations, puis le règlement de votre consultation.' : 'Quelques informations, puis le règlement de l’adhésion.' }}</p>
          <div class="auth-fields">
            <div class="field">
              <label for="fullName">Nom complet</label>
              <input id="fullName" [(ngModel)]="fullName" autocomplete="name" placeholder="Votre nom" />
            </div>
            <div class="grid-2">
              <div class="field">
                <label for="phone">Téléphone</label>
                <input id="phone" [(ngModel)]="phone" type="tel" autocomplete="tel" placeholder="77 000 00 00" />
              </div>
              <div class="field">
                <label for="birth">Date de naissance</label>
                <input id="birth" [(ngModel)]="dateOfBirth" type="date" />
              </div>
            </div>
            <div class="field">
              <label for="email">Email</label>
              <input id="email" [(ngModel)]="email" type="email" autocomplete="email" placeholder="vous@exemple.com" />
            </div>
            <div class="field">
              <label for="password">Mot de passe</label>
              <div class="secret">
                <input id="password" [(ngModel)]="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="new-password" placeholder="Votre mot de passe" />
                <button class="secret-toggle" type="button" (click)="showPassword.set(!showPassword())" [attr.aria-pressed]="showPassword()" [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <i class="pi" [class.pi-eye]="!showPassword()" [class.pi-eye-slash]="showPassword()"></i>
                </button>
              </div>
            </div>
          </div>
          @if (!isAiCheckout) {
            <section class="signup-card-preview">
              <div class="signup-preview-heading"><div><span class="kicker">APERÇU DE VOTRE CARTE</span><p>Vérifiez les informations qui seront imprimées après le paiement.</p></div><i class="pi pi-id-card"></i></div>
              <div class="member-card-art" role="img" aria-label="Aperçu de la carte de membre GRF Consulting">
                <img src="/assets/brand/carte-membre.jpg" alt="" />
                <span class="card-value card-value-name">{{ fullName || 'Votre nom complet' }}</span>
                <span class="card-value card-value-phone">{{ phone || 'Votre numéro de téléphone' }}</span>
                <span class="card-value card-value-expiry">{{ estimatedValidity() }}</span>
              </div>
              <small class="preview-note">La date de validité définitive sera calculée à la confirmation du paiement.</small>
            </section>
          }
          @if (error()) { <p class="form-error">{{ error() }}</p> }
          <button class="btn btn-navy" style="width:100%;" type="button" (click)="submit()">Créer mon compte</button>
          <p class="muted auth-switch">Déjà inscrit ? <a routerLink="/connexion">Connexion</a></p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .signup-card-preview { margin:22px 0 18px; padding:15px; border:1px solid #e5ebef; border-radius:14px; background:#fafbfc; }.signup-preview-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:11px; }.signup-preview-heading .kicker { color:#a76d49; font-size:9px; font-weight:800; letter-spacing:.13em; }.signup-preview-heading p { margin:3px 0 0; color:#74818c; font-size:11px; }.signup-preview-heading > i { color:#ad754f; font-size:20px; }.preview-note { display:block; margin-top:8px; color:#78858e; font-size:10px; }
    .member-card-art { container-type:inline-size; position:relative; width:100%; aspect-ratio:2/1; overflow:hidden; border-radius:10px; background:#301809; box-shadow:0 8px 18px #27170f22; }.member-card-art > img { display:block; width:100%; height:100%; object-fit:cover; }.card-value { position:absolute; left:54.1%; display:flex; align-items:center; width:34%; height:7.2%; overflow:hidden; color:#fff0cc; font-family:Arial,sans-serif; font-size:2.15cqw; font-weight:700; text-shadow:0 1px 2px #1a0a00; text-overflow:ellipsis; white-space:nowrap; }.card-value-name { top:32.5%; }.card-value-phone { top:49.1%; }.card-value-expiry { top:66.3%; }
  `]
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  fullName = '';
  email = '';
  phone = '';
  dateOfBirth = '';
  password = '';
  showPassword = signal(false);
  error = signal('');

  get isAiCheckout(): boolean {
    return this.route.snapshot.queryParamMap.get('plan') === 'ia';
  }

  estimatedValidity(): string {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    return this.formatDate(expiry.toISOString().slice(0, 10));
  }

  formatDate(value: string | Date): string {
    if (!value) return 'À confirmer';
    const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  }

  async submit(): Promise<void> {
    this.error.set('');
    try {
      await this.auth.register({
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        dateOfBirth: this.dateOfBirth,
        password: this.password
      });
      const requestedPlan = this.route.snapshot.queryParamMap.get('plan');
      await this.router.navigate(['/paiement', requestedPlan === 'ia' ? 'ia' : 'adhesion']);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Inscription impossible.');
    }
  }
}
