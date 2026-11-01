import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <header class="profile-heading"><div><span class="eyebrow">VOTRE COMPTE</span><h1 class="serif">Mon profil</h1><p>Gérez vos coordonnées et votre carte de membre.</p></div></header>
    <div class="profile-grid">
      <section class="profile-card">
        <div class="profile-card-head"><span class="profile-icon"><i class="pi pi-user-edit"></i></span><div><h2>Informations personnelles</h2><p>Ces informations figurent sur votre carte d’adhésion.</p></div></div>
        <div class="field"><label for="member-name">Nom complet</label><input id="member-name" [(ngModel)]="fullName" autocomplete="name" /></div>
        <div class="field"><label for="member-phone">Téléphone</label><input id="member-phone" [(ngModel)]="phone" type="tel" autocomplete="tel" /></div>
        <div class="field"><label for="member-email">Adresse e-mail</label><input id="member-email" [value]="auth.currentUser()?.email" type="email" disabled /><small>L’adresse e-mail ne peut pas être modifiée depuis cet espace.</small></div>
        @if (saved()) { <p class="saved-message"><i class="pi pi-check-circle"></i> Vos informations ont été enregistrées.</p> }
        <button class="btn btn-navy save-button" type="button" (click)="save()"><i class="pi pi-check"></i> Enregistrer les modifications</button>
      </section>
      <section class="card-panel">
        <div class="card-panel-heading"><div><span class="eyebrow">VOTRE ADHÉSION</span><h2>Carte de membre</h2></div>
          @if (membershipActive()) { <span class="status active">Active</span> } @else { <span class="status expired">À renouveler</span> }
        </div>
        <article class="member-card-art" aria-label="Carte d’adhésion GRF CONSULTING">
          <img src="/assets/brand/carte-membre.jpg" alt="Fond officiel de la carte GRF Consulting" />
          <span class="card-value card-value-name">{{ auth.currentUser()?.fullName }}</span>
          <span class="card-value card-value-phone">{{ auth.currentUser()?.phone }}</span>
          <span class="card-value card-value-expiry">{{ auth.currentUser()?.membershipExpiresAt | date:'dd/MM/yyyy' }}</span>
        </article>
        @if (downloadError()) { <p class="download-error" role="alert">{{ downloadError() }}</p> }
        <div class="card-actions">
          @if (membershipActive()) {
            <button class="btn btn-navy" type="button" [disabled]="downloading()" (click)="downloadCard()"><i class="pi pi-download"></i> {{ downloading() ? 'Préparation de la carte…' : 'Télécharger ma carte' }}</button>
          } @else {
            <a class="btn btn-navy" routerLink="/paiement/adhesion"><i class="pi pi-refresh"></i> Renouveler mon adhésion · 5 000 FCFA</a>
          }
          @if (membershipActive()) { <small>Le fichier téléchargé reprend le visuel de la carte ci-dessus.</small> }
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display:block; }.profile-heading { margin:2px 0 20px; }.eyebrow { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.14em; }.profile-heading h1 { margin:4px 0 2px; color:#17334e; font-size:38px; }.profile-heading p { margin:0; color:#7e8b96; font-size:13px; }.profile-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(340px,1.15fr); align-items:start; gap:17px; }.profile-card,.card-panel { min-width:0; padding:23px; border:1px solid #e5ebef; border-radius:16px; background:#fff; box-shadow:0 3px 14px #10253b06; }.profile-card-head { display:flex; align-items:flex-start; gap:12px; margin-bottom:20px; }.profile-icon { display:grid; place-items:center; flex:none; width:39px; height:39px; border-radius:12px; background:#edf3f7; color:#3e607b; }.profile-card-head h2,.card-panel-heading h2 { margin:0; color:#203a52; font-size:19px; }.profile-card-head p { margin:3px 0 0; color:#84909a; font-size:12px; line-height:1.45; }.profile-card .field { margin:0 0 15px; }.profile-card .field label { color:#415361; font-size:12px; }.profile-card .field input { border-color:#e0e6ea; border-radius:10px; font-size:13px; }.profile-card .field input:disabled { background:#f5f7f8; color:#7f8b95; }.profile-card .field small { color:#8b969e; font-size:10px; }.saved-message { display:flex; align-items:center; gap:7px; margin:0 0 12px; color:#34734d; font-size:12px; font-weight:600; }.save-button { min-height:43px; border-radius:10px; font-size:12px; }.card-panel-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:15px; }.card-panel-heading h2 { margin-top:4px; }.status { padding:6px 10px; border-radius:99px; font-size:10px; font-weight:800; }.status.active { background:#e9f5ed; color:#287346; }.status.expired { background:#fff1e8; color:#a44c25; }.card-actions { display:grid; gap:8px; margin-top:14px; }.card-actions .btn { display:flex; justify-content:center; align-items:center; gap:8px; min-height:44px; border-radius:10px; text-align:center; }.card-actions small { color:#87939d; font-size:10px; text-align:center; }.download-error { color:#a3372c; font-size:12px; }
    @media(max-width:900px) { .profile-grid { grid-template-columns:1fr; }.member-card-art { max-width:620px; } }
    @media(max-width:520px) { .profile-heading h1 { font-size:34px; }.profile-card,.card-panel { padding:18px 15px; }.profile-card-head h2 { font-size:18px; } }
  `]
})
export class ProfilePage {
  readonly auth = inject(AuthService);
  fullName = this.auth.currentUser()?.fullName ?? '';
  phone = this.auth.currentUser()?.phone ?? '';
  saved = signal(false);
  downloading = signal(false);
  downloadError = signal('');

  membershipActive(): boolean { return this.auth.hasPlatformAccess(); }

  save(): void {
    this.auth.updateProfile({ fullName: this.fullName.trim(), phone: this.phone.trim() });
    this.saved.set(true);
  }

  async downloadCard(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user || !this.membershipActive()) return;
    this.downloading.set(true);
    this.downloadError.set('');
    try {
      const artwork = new Image();
      artwork.src = '/assets/brand/carte-membre.jpg';
      await artwork.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('La génération de la carte a échoué.');
      context.drawImage(artwork, 0, 0, canvas.width, canvas.height);
      context.fillStyle = '#fff0cc';
      context.textBaseline = 'middle';
      context.shadowColor = '#1a0a00';
      context.shadowBlur = 3;
      context.shadowOffsetY = 2;
      this.drawValue(context, user.fullName, 1120, 370, 680, 52);
      this.drawValue(context, user.phone ?? '', 1120, 540, 680, 52);
      this.drawValue(context, this.formatDate(user.membershipExpiresAt), 1120, 720, 680, 52);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Impossible de créer le fichier de la carte.');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carte-membre-${user.membershipNumber ?? 'GRF'}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      this.downloadError.set(error instanceof Error ? error.message : 'Téléchargement impossible.');
    } finally {
      this.downloading.set(false);
    }
  }

  private drawValue(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, size: number): void {
    let fontSize = size;
    context.font = `700 ${fontSize}px Arial, sans-serif`;
    while (context.measureText(text).width > maxWidth && fontSize > 22) {
      fontSize -= 2;
      context.font = `700 ${fontSize}px Arial, sans-serif`;
    }
    context.fillText(text, x, y, maxWidth);
  }

  private formatDate(value?: string): string {
    return value ? new Intl.DateTimeFormat('fr-FR').format(new Date(value)) : '';
  }
}
