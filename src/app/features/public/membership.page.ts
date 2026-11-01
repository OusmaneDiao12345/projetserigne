import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-membership-page',
  imports: [RouterLink],
  template: `
    <section class="membership-hero">
      <div class="membership-container hero-inner">
        <div class="hero-copy">
          <span class="hero-kicker"><i class="pi pi-scale"></i> GRF CONSULTING · ESPACE MEMBRE</span>
          @if (isActive) {
            <h1 class="serif">Votre espace juridique<br /><em>vous attend.</em></h1>
            <p>Votre adhésion est active. Retrouvez vos dossiers, vos réponses et vos paiements dans votre espace personnel.</p>
            <a class="btn hero-cta" routerLink="/espace">Accéder à mon espace <i class="pi pi-arrow-right"></i></a>
          } @else {
            <h1 class="serif">Le droit plus clair,<br /><em>à votre portée.</em></h1>
            <p>Rejoignez l’espace membre GRF CONSULTING pour soumettre et suivre vos demandes juridiques en ligne.</p>
            <a class="btn hero-cta" [routerLink]="actionRoute">{{ actionLabel }} <i class="pi pi-arrow-right"></i></a>
          }
          <div class="hero-reassurance"><span><i class="pi pi-lock"></i> Paiement sécurisé</span><span><i class="pi pi-mobile"></i> Mobile Money</span></div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="visual-orbit orbit-one"></div><div class="visual-orbit orbit-two"></div>
          <div class="visual-scale"><img src="assets/brand/logo-grf.jpg" alt="Logo GRF Consulting" /></div>
          <div class="visual-tag"><i class="pi pi-check-circle"></i> Votre espace, en ligne</div>
        </div>
      </div>
    </section>

    <section class="membership-container membership-content">
      <div class="section-intro"><span class="section-kicker">UNE ADHÉSION SIMPLE</span><h2 class="serif">Tout commence avec votre espace membre</h2><p>Un parcours clair pour accéder à la plateforme et suivre vos demandes.</p></div>

      <div class="membership-grid">
        <div class="benefit-list">
          <article class="benefit-item"><span class="benefit-icon icon-navy"><i class="pi pi-user"></i></span><div><h3>Un espace personnel</h3><p>Retrouvez vos informations et votre activité au même endroit.</p></div></article>
          <article class="benefit-item"><span class="benefit-icon icon-copper"><i class="pi pi-folder-open"></i></span><div><h3>Le suivi de vos dossiers</h3><p>Consultez le statut de vos demandes et les réponses reçues.</p></div></article>
          <article class="benefit-item"><span class="benefit-icon icon-green"><i class="pi pi-comments"></i></span><div><h3>Des questions à soumettre</h3><p>Après l’adhésion, chaque question écrite traitée est facturée 1 990 FCFA.</p></div></article>
          <div class="confidentiality-note"><i class="pi pi-shield"></i><p><strong>Confidentialité</strong><br />Vos questions et documents sont traités avec discrétion.</p></div>
        </div>

        <aside class="price-card">
          <div class="price-card-top"><span class="price-label">ADHÉSION MEMBRE</span><span class="price-badge"><i class="pi pi-star-fill"></i> Accès plateforme</span></div>
          <div class="price-amount">5 000 <span>FCFA</span></div>
          <p class="price-caption">Paiement unique pour ouvrir l’accès à votre espace membre.</p>
          <div class="price-divider"></div>
          <ul>
            <li><i class="pi pi-check"></i> Activation de l’espace après confirmation du paiement</li>
            <li><i class="pi pi-check"></i> Accès au suivi de vos dossiers</li>
            <li><i class="pi pi-check"></i> Paiement par opérateur disponible</li>
          </ul>
          @if (isActive) {
            <a class="btn price-cta" routerLink="/espace">Mon espace membre <i class="pi pi-arrow-right"></i></a>
          } @else {
            <a class="btn price-cta" [routerLink]="actionRoute">{{ actionLabel }} <i class="pi pi-arrow-right"></i></a>
          }
          <div class="payment-methods"><span><i class="pi pi-mobile"></i> Wave</span><span><i class="pi pi-mobile"></i> Orange Money</span><span>et autres opérateurs disponibles</span></div>
        </aside>
      </div>

      <section class="steps-section">
        <div class="section-intro"><span class="section-kicker">COMMENT ÇA MARCHE</span><h2 class="serif">Votre accès en trois étapes</h2></div>
        <div class="steps-grid">
          <article><span class="step-number">01</span><i class="pi pi-user-plus"></i><h3>Créez votre compte</h3><p>Renseignez vos coordonnées pour ouvrir votre espace personnel.</p></article>
          <article><span class="step-number">02</span><i class="pi pi-wallet"></i><h3>Réglez l’adhésion</h3><p>Payez 5 000 FCFA avec l’opérateur proposé sur la page sécurisée.</p></article>
          <article><span class="step-number">03</span><i class="pi pi-folder"></i><h3>Suivez vos demandes</h3><p>Une fois le paiement confirmé, accédez à votre espace membre.</p></article>
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .membership-container { width:min(1100px,calc(100% - 40px)); margin:0 auto; }
    .membership-hero { overflow:hidden; position:relative; background:linear-gradient(115deg,#10253b 0%,#15334d 62%,#1b3d58 100%); color:#fff; }
    .hero-inner { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr); align-items:center; min-height:440px; gap:30px; padding-top:52px; padding-bottom:52px; }
    .hero-copy { position:relative; z-index:2; max-width:620px; }
    .hero-kicker { display:inline-flex; align-items:center; gap:9px; color:#e1b38f; font-size:10px; font-weight:800; letter-spacing:.15em; }
    .hero-kicker i { font-size:16px; }
    .hero-copy h1 { margin:20px 0 13px; font-size:clamp(46px,6.2vw,72px); line-height:.91; }
    .hero-copy h1 em { color:#fff; font-style:normal; }
    .hero-copy > p { max-width:485px; margin:0; color:#d2dce5; font-size:16px; line-height:1.65; }
    .hero-cta { margin-top:25px; min-height:49px; padding:0 18px; gap:12px; border-radius:11px; background:#fff; color:#10253b; font-size:13px; }
    .hero-cta:hover { background:#f7e9dd; }
    .hero-reassurance { display:flex; flex-wrap:wrap; gap:20px; margin-top:25px; color:#becbd6; font-size:11px; }
    .hero-reassurance span { display:flex; align-items:center; gap:7px; }.hero-reassurance i { color:#e2b08b; }
    .hero-visual { position:relative; display:grid; place-items:center; min-height:330px; }
    .visual-orbit { position:absolute; width:280px; height:280px; border:1px solid #ffffff20; border-radius:50%; }
    .orbit-two { width:220px; height:220px; border-color:#e2b08b40; }
    .visual-scale { position:relative; z-index:1; display:grid; place-items:center; width:172px; height:172px; padding:7px; overflow:hidden; border:1px solid #dfb87990; border-radius:50%; background:#10253b; box-shadow:0 24px 60px #07142165,0 0 0 9px #ffffff0a; }
    .visual-scale img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
    .visual-tag { position:absolute; z-index:2; right:2%; bottom:12%; display:flex; align-items:center; gap:9px; padding:12px 15px; border:1px solid #ffffff25; border-radius:12px; background:#ffffff14; color:#eef4f8; font-size:12px; backdrop-filter:blur(6px); }
    .visual-tag i { color:#8ed1a4; }
    .membership-content { padding-top:62px; padding-bottom:65px; }
    .section-intro { max-width:650px; margin:0 auto 30px; text-align:center; }
    .section-kicker { color:#b5764c; font-size:10px; font-weight:800; letter-spacing:.16em; }
    .section-intro h2 { margin:8px 0 5px; color:#17334e; font-size:clamp(31px,4vw,42px); line-height:1.05; }
    .section-intro p { margin:0; color:#7c8993; font-size:13px; }
    .membership-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.86fr); align-items:center; gap:clamp(24px,6vw,76px); max-width:970px; margin:0 auto; }
    .benefit-list { display:grid; gap:24px; }
    .benefit-item { display:flex; align-items:flex-start; gap:14px; }
    .benefit-icon { display:grid; place-items:center; flex:none; width:43px; height:43px; border-radius:13px; font-size:17px; }
    .icon-navy { background:#eaf0f5; color:#234c6c; }.icon-copper { background:#f8eee7; color:#b5764c; }.icon-green { background:#eaf5ed; color:#3d8057; }
    .benefit-item h3 { margin:1px 0 3px; color:#243d52; font-size:15px; }.benefit-item p { max-width:410px; margin:0; color:#7d8993; font-size:12px; line-height:1.55; }
    .confidentiality-note { display:flex; align-items:flex-start; gap:11px; margin-top:2px; padding:13px 14px; border:1px solid #eee5d7; border-radius:12px; background:#faf7f0; color:#987244; }.confidentiality-note > i { margin-top:2px; }.confidentiality-note p { margin:0; color:#7d715c; font-size:11px; line-height:1.5; }.confidentiality-note strong { color:#5e503b; }
    .price-card { padding:26px; border:1px solid #eadfd3; border-radius:19px; background:#fff; box-shadow:0 18px 45px #10253b12; }
    .price-card-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }.price-label { color:#6e7b85; font-size:10px; font-weight:800; letter-spacing:.13em; }.price-badge { display:flex; align-items:center; gap:6px; padding:6px 9px; border-radius:99px; background:#f9efe7; color:#a66642; font-size:9px; font-weight:700; }.price-badge i { font-size:9px; }
    .price-amount { margin-top:17px; color:#102b43; font-size:45px; font-weight:800; letter-spacing:-.04em; }.price-amount span { color:#536575; font-size:15px; font-weight:700; letter-spacing:0; }.price-caption { margin:1px 0 0; color:#81909b; font-size:12px; }
    .price-divider { height:1px; margin:20px 0 17px; background:#edf0f1; }.price-card ul { display:grid; gap:13px; margin:0 0 22px; padding:0; list-style:none; }.price-card li { display:flex; align-items:flex-start; gap:9px; color:#526473; font-size:12px; line-height:1.45; }.price-card li i { margin-top:2px; color:#43825b; font-size:12px; }
    .price-cta { display:flex; width:100%; min-height:49px; justify-content:space-between; padding:0 16px; border-radius:11px; background:#10253b; color:#fff; font-size:12px; }.price-cta:hover { background:#1b3d58; }
    .payment-methods { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:9px 14px; margin-top:14px; color:#87939c; font-size:10px; }.payment-methods span { display:flex; align-items:center; gap:5px; }.payment-methods i { color:#526f89; }
    .steps-section { margin-top:70px; }.steps-section .section-intro { margin-bottom:23px; }.steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:970px; margin:0 auto; }.steps-grid article { position:relative; min-height:160px; padding:21px; border:1px solid #e6e9e8; border-radius:15px; background:#fff; }.steps-grid article > i { display:grid; place-items:center; width:36px; height:36px; margin-bottom:13px; border-radius:11px; background:#edf3f7; color:#335b78; }.step-number { position:absolute; top:20px; right:20px; color:#c3cbd0; font-size:11px; font-weight:800; letter-spacing:.1em; }.steps-grid h3 { margin:0 0 5px; color:#233d53; font-size:15px; }.steps-grid p { margin:0; color:#7d8993; font-size:11px; line-height:1.5; }
    @media(max-width:800px) { .hero-inner { grid-template-columns:1fr; min-height:0; padding-top:48px; padding-bottom:35px; }.hero-visual { min-height:220px; }.visual-orbit { width:200px; height:200px; }.orbit-two { width:154px; height:154px; }.visual-scale { width:142px; height:142px; }.visual-tag { right:7%; bottom:4%; }.membership-grid { grid-template-columns:1fr; max-width:570px; }.benefit-list { order:1; }.price-card { order:0; }.steps-section { margin-top:50px; } }
    @media(max-width:560px) { .membership-container { width:calc(100% - 28px); }.hero-inner { padding-top:37px; }.hero-copy h1 { font-size:47px; }.hero-copy > p { font-size:14px; }.hero-visual { min-height:185px; }.visual-orbit { width:165px; height:165px; }.orbit-two { width:127px; height:127px; }.visual-scale { width:116px; height:116px; padding:5px; }.visual-tag { right:0; bottom:0; padding:9px 11px; font-size:10px; }.membership-content { padding-top:42px; padding-bottom:45px; }.section-intro { margin-bottom:22px; }.price-card { padding:21px 18px; }.price-amount { font-size:40px; }.steps-grid { grid-template-columns:1fr; }.steps-grid article { min-height:0; padding:17px; }.steps-grid article > i { margin-bottom:9px; }.steps-section { margin-top:46px; } }
  `]
})
export class MembershipPage {
  private readonly auth = inject(AuthService);

  get isActive(): boolean {
    return this.auth.hasPlatformAccess();
  }

  get actionRoute(): string {
    const user = this.auth.currentUser();
    return !user ? '/inscription' : this.auth.userHasPlatformAccess(user) ? '/espace' : '/paiement/adhesion';
  }

  get actionLabel(): string {
    const user = this.auth.currentUser();
    return !user ? 'Créer mon compte et adhérer' : this.auth.userHasPlatformAccess(user) ? 'Accéder à mon espace' : 'Payer mon adhésion';
  }
}
