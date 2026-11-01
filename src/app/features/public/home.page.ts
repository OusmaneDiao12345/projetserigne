import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FAQS, LEGAL_DOMAINS, SERVICE_PLANS, VALUES } from '../../core/config/catalog';
import { PENDING_AI_DOMAIN_KEY, PENDING_AI_GUEST_ID_KEY, PENDING_AI_PAYMENT_REFERENCE_KEY, PENDING_AI_QUESTION_KEY } from '../../core/config/payment-flow';
import { ChatMessage, ClientType } from '../../core/models/legal-case.model';
import { AuthService } from '../../core/services/auth.service';
import { CaseService } from '../../core/services/case.service';
import { ChatService } from '../../core/services/chat.service';
import { PaymentGatewayService } from '../../core/payments/payment-gateway.service';
import { createId } from '../../core/services/id.util';
import { IconComponent } from '../../shared/components/icon.component';
import { MOTION } from '../../shared/directives/motion.directives';

@Component({
  selector: 'app-home-page',
  imports: [FormsModule, RouterLink, IconComponent, DecimalPipe, ...MOTION],
  template: `
    <section class="hh">
      <div class="hh-bg" aria-hidden="true">
        <span class="hh-orb hh-orb-1"></span>
        <span class="hh-orb hh-orb-2"></span>
        <span class="hh-orb hh-orb-3"></span>
        <span class="hh-grid"></span>
        <span class="hh-noise"></span>
      </div>

      <div class="container hh-layout">
        <div class="hh-copy">
          <span class="hh-pill"><span class="hh-pill-dot"></span> Droit sénégalais · Orientation juridique en ligne</span>
          <h1 class="hh-title">
            <span class="hh-line"><span>Votre orientation</span></span>
            <span class="hh-line"><span>juridique, <em class="shine-text">claire</em></span></span>
            <span class="hh-line"><span>et accessible.</span></span>
          </h1>
          <p class="hh-lede">Posez vos questions sur le droit sénégalais et obtenez une réponse ou une orientation adaptée à votre situation.</p>
          <div class="hh-ctas">
            <a class="btn btn-glow" href="#assistant"><app-icon name="counsel" /> Obtenir une réponse rapide <i class="pi pi-arrow-right"></i></a>
            <a class="btn btn-ghost" href="#tarifs">Voir les tarifs</a>
          </div>
          <div class="hh-stats">
            <div><strong [countUp]="7"></strong><span>domaines du droit</span></div>
            <div><strong [countUp]="24" countSuffix="h"></strong><span>pour un dossier</span></div>
            <div><strong [countUp]="1000"></strong><span>FCFA la question</span></div>
          </div>
        </div>

        <div class="hh-visual" aria-hidden="true">
          <div class="hh-ring hh-ring-1"></div>
          <div class="hh-ring hh-ring-2"></div>
          <div class="hh-card hh-card-main">
            <div class="hh-card-head">
              <span class="ai-mark"><app-icon name="counsel" /></span>
              <div><strong>Réponse rapide</strong><small><span class="pulse"></span> En ligne</small></div>
            </div>
            <div class="hh-bubble hh-bubble-user">Mon employeur peut-il me licencier sans préavis ?</div>
            <div class="hh-bubble hh-bubble-ai">
              <span class="typing"><i></i><i></i><i></i></span>
              <span class="hh-answer">Selon le Code du travail sénégalais, un préavis est en principe obligatoire, sauf faute lourde…</span>
            </div>
          </div>
          <div class="hh-chip hh-chip-1"><i class="pi pi-shield"></i> 100 % confidentiel</div>
          <div class="hh-chip hh-chip-2"><i class="pi pi-bolt"></i> Réponse en minutes</div>
          <div class="hh-chip hh-chip-3"><i class="pi pi-mobile"></i> Wave · Orange Money</div>
        </div>
      </div>

      <a class="hh-scroll" href="#assistant" aria-label="Descendre vers l’assistant"><span></span></a>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        @for (round of [0, 1]; track round) {
          @for (d of domains; track d.slug) {
            <span class="marquee-item"><app-icon [name]="d.icon" /> {{ d.title }}</span>
          }
        }
      </div>
    </div>

    <section class="container assistant-wrap" id="assistant" reveal="up">
      <div class="tabs tabs-slide" [class.tabs-second]="tab()==='form'">
        <button type="button" [class.active]="tab()==='ia'" (click)="tab.set('ia')"><i class="pi pi-bolt"></i> Réponse rapide</button>
        <button type="button" [class.active]="tab()==='form'" (click)="tab.set('form')"><i class="pi pi-file-edit"></i> Soumettre une Question</button>
      </div>

      @if (tab() === 'ia') {
        <div class="card chat-card glow-card">
          <div class="chat-head">
            <div class="chat-id">
              <span class="ai-mark" aria-hidden="true"><app-icon name="counsel" /></span>
              <div>
                <strong>Réponse rapide</strong>
                <div class="chat-sub">Spécialisé en droit sénégalais</div>
              </div>
            </div>
            <span class="badge badge-ok"><span class="pulse"></span> En ligne</span>
          </div>
          <div class="ai-price-note"><i class="pi pi-lock"></i><span><strong>{{ memberAccess() ? 'Réponses rapides incluses dans votre adhésion' : 'Réponse rapide · 1 000 FCFA par question' }}</strong><small>{{ memberAccess() ? 'Votre adhésion est active : posez votre question sans frais supplémentaires.' : 'Sans compte ni adhésion : la réponse s’affiche après confirmation du paiement.' }}</small></span></div>
          <div class="chat-body" #thread [class.has-messages]="messages().length > 0">
            @if (messages().length === 0) {
              <div class="ai-empty">
                <span class="ai-mark ai-mark-float" aria-hidden="true"><app-icon name="counsel" /></span>
                <p>Posez votre question et recevez rapidement une première réponse juridique adaptée à votre situation.</p>
              </div>
            } @else {
              @for (m of messages(); track m.id) {
                <div class="msg" [class.user]="m.role==='user'" [class.assistant]="m.role==='assistant'">
                  @if (m.role === 'assistant') { <span class="ai-mark" aria-hidden="true"><app-icon name="counsel" /></span> }
                  <div class="bubble" [class.user]="m.role==='user'" [class.assistant]="m.role==='assistant'">{{ m.content }}</div>
                </div>
              }
              @if (isAnswering()) {
                <div class="msg assistant">
                  <span class="ai-mark" aria-hidden="true"><app-icon name="counsel" /></span>
                  <div class="bubble assistant" aria-label="Réponse en cours"><span class="typing"><i></i><i></i><i></i></span></div>
                </div>
              }
            }
          </div>
          <div class="domain-picker">
            <div class="domain-picker-title"><strong>Choisissez un domaine juridique</strong><small>Obligatoire avant de poser votre question</small></div>
            <div class="chips">
            @for (d of domains; track d.slug; let i = $index) {
              <button class="chip" type="button" [style.--i]="i" [class.selected]="selectedDomain() === d.title" [attr.aria-pressed]="selectedDomain() === d.title" (click)="selectDomain(d.title)">{{ d.title }}</button>
            }
            </div>
          </div>
          @if (chatError()) { <p class="chat-error" role="alert">{{ chatError() }}</p> }
          <div class="composer">
            <input [(ngModel)]="question" placeholder="Saisissez votre question juridique…" (keyup.enter)="send()" />
            <button class="send" type="button" [class.busy]="isAnswering()" [disabled]="isAnswering()" [attr.aria-label]="isAnswering() ? 'Réponse en cours' : 'Continuer'" (click)="send()">@if (isAnswering()) { <span class="spinner"></span> } @else { <app-icon name="send" /> }</button>
          </div>
        </div>
      } @else {
        <div class="card glow-card form-card" id="soumettre">
          <h3 class="serif" style="margin-top:0;">Poser une question spécifique</h3>
          <p class="muted">Soumettez votre dossier pour une analyse détaillée</p>
          <div class="notice" style="margin-bottom:16px;"><i class="pi pi-star-fill"></i> Réservé aux membres actifs · Questions incluses dans l’adhésion · Réponse sous 24h</div>
          <div class="auth-fields">
            <div class="field"><label>Nom complet *</label><input [(ngModel)]="form.fullName" placeholder="Votre nom" /></div>
            <div class="field"><label>Email *</label><input [(ngModel)]="form.email" placeholder="vous@exemple.com" /></div>
            <div class="grid-2 field">
              <div class="field">
                <label>Vous êtes</label>
                <select [(ngModel)]="form.clientType">
                  <option>Particulier</option>
                  <option>Entreprise</option>
                  <option>Association</option>
                </select>
              </div>
              <div class="field">
                <label>Domaine</label>
                <select [(ngModel)]="form.domain">
                  <option value="Autre / Non précisé">Autre / Non précisé</option>
                  @for (d of domains; track d.slug) { <option [value]="d.title">{{ d.title }}</option> }
                </select>
              </div>
            </div>
            <div class="field"><label>Votre question *</label><textarea rows="5" [(ngModel)]="form.question" placeholder="Décrivez votre situation juridique..."></textarea></div>
            <div class="field">
              <label>Document (optionnel)</label>
              <label class="dropzone" [class.has-file]="!!form.documentName">
                <span class="dropzone-icon"><app-icon [name]="form.documentName ? 'check' : 'upload'" /></span>
                <div>{{ form.documentName ? 'Fichier joint' : 'Cliquez pour joindre un fichier' }}</div>
                <input type="file" hidden (change)="onFile($event)" />
                <small class="muted">{{ form.documentName || 'PDF, images, documents' }}</small>
              </label>
            </div>
          </div>
          @if (formError()) { <p class="form-error" role="alert">{{ formError() }}</p> }
          <button class="btn btn-navy btn-shine" style="width:100%;" type="button" (click)="submitCase()">Soumettre ma question incluse <i class="pi pi-arrow-right"></i></button>
        </div>
      }
    </section>

    <section class="container section">
      <div class="values-grid">
        @for (v of values; track v.title; let i = $index) {
          <article class="card value-card" spotlight reveal="up" [revealDelay]="i * 120">
            <span class="icon-badge"><app-icon [name]="v.icon" /></span>
            <div>
              <strong>{{ v.title }}</strong>
              <p class="muted" style="margin:6px 0 0;">{{ v.text }}</p>
            </div>
          </article>
        }
      </div>
    </section>

    <section class="container section" style="padding-top:0;">
      <div class="section-head" reveal="up">
        <span class="kicker">Expertise</span>
        <h2 class="serif">Domaines d'intervention</h2>
        <p class="muted">Nous couvrons l'ensemble des principaux domaines du droit sénégalais</p>
      </div>
      <div class="domains">
        @for (d of domains; track d.slug; let i = $index) {
          <article class="card domain-card" spotlight reveal="zoom" [revealDelay]="(i % 3) * 100">
            <span class="icon-badge"><app-icon [name]="d.icon" /></span>
            <h3>{{ d.title }}</h3>
            <p class="muted" style="margin:0;">{{ d.detail }}</p>
            <i class="pi pi-arrow-up-right domain-arrow" aria-hidden="true"></i>
          </article>
        }
      </div>
    </section>

    <section class="section steps-band">
      <div class="container">
        <div class="section-head" reveal="up">
          <span class="kicker">Comment ça marche</span>
          <h2 class="serif">Trois étapes, zéro complication</h2>
        </div>
        <ol class="steps">
          <li reveal="up" [revealDelay]="0"><span class="step-num">01</span><h3>Choisissez un domaine</h3><p>Travail, famille, foncier… sélectionnez le domaine qui correspond à votre situation.</p></li>
          <li reveal="up" [revealDelay]="140"><span class="step-num">02</span><h3>Posez votre question</h3><p>Décrivez votre situation simplement, puis réglez par Wave ou Orange Money.</p></li>
          <li reveal="up" [revealDelay]="280"><span class="step-num">03</span><h3>Recevez votre réponse</h3><p>Une orientation claire, adaptée au droit sénégalais, en quelques instants.</p></li>
        </ol>
      </div>
    </section>

    <section class="container section" id="tarifs">
      <div class="section-head" reveal="up">
        <span class="kicker">Tarifs</span>
        <h2 class="serif">Nos services</h2>
        <p class="muted">Un accès au droit à un coût accessible</p>
      </div>
      <div class="plans-grid">
        @for (p of plans; track p.id; let i = $index) {
          <article class="card plan-card" spotlight [tilt]="3" [class.featured]="p.recommended" reveal="up" [revealDelay]="i * 140">
            @if (p.recommended) { <span class="ribbon"><i class="pi pi-star-fill"></i> Recommandé</span> }
            <div class="muted plan-title">{{ p.title }}</div>
            <div class="price">{{ p.price === 0 ? 'Gratuit' : (p.price | number:'1.0-0') + ' FCFA' }}</div>
            <p class="muted">{{ p.subtitle }}</p>
            <ul class="features">
              @for (f of p.features; track f) { <li><span class="check"><app-icon name="check" /></span> {{ f }}</li> }
            </ul>
            @if (p.id === 'ia') {
              <button class="btn btn-line" (click)="openAssistant()">Obtenir une réponse rapide</button>
            } @else {
              <a class="btn btn-navy btn-shine" [routerLink]="['/paiement', p.id]">Adhérer pour 5 000 FCFA <i class="pi pi-arrow-right"></i></a>
            }
          </article>
        }
      </div>
    </section>

    <section class="container section" id="faq">
      <div class="section-head" reveal="up">
        <span class="kicker">FAQ</span>
        <h2 class="serif">Questions fréquentes</h2>
        <p class="muted">Tout ce que vous devez savoir sur GRF CONSULTING</p>
      </div>
      <div class="faq-list">
        @for (item of faqs; track item.q; let i = $index) {
          <div class="faq-item" [class.open]="openFaq() === i" reveal="up" [revealDelay]="i * 60">
            <button type="button" [attr.aria-expanded]="openFaq() === i" (click)="openFaq.set(openFaq()===i ? -1 : i)">
              <span>{{ item.q }}</span>
              <span class="faq-toggle" aria-hidden="true"></span>
            </button>
            <div class="faq-panel"><div><p>{{ item.a }}</p></div></div>
          </div>
        }
      </div>
      <div class="notice" style="margin-top:24px;" reveal="up">
        <strong>Solution complémentaire aux professionnels du droit.</strong>
        GRF CONSULTING ne se substitue pas aux avocats, notaires, huissiers ou autres professionnels habilités lorsque leur intervention est légalement nécessaire.
      </div>
    </section>
  `
})
export class HomePage {
  private readonly chat = inject(ChatService);
  private readonly cases = inject(CaseService);
  private readonly auth = inject(AuthService);
  private readonly payments = inject(PaymentGatewayService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly thread = viewChild<ElementRef<HTMLElement>>('thread');

  readonly plans = SERVICE_PLANS;
  readonly domains = LEGAL_DOMAINS;
  readonly values = VALUES;
  readonly faqs = FAQS;

  tab = signal<'ia' | 'form'>('ia');
  openFaq = signal(-1);
  question = '';
  selectedDomain = signal('');
  chatError = signal('');
  isAnswering = signal(false);
  messages = signal<ChatMessage[]>([]);
  formError = signal('');
  form = {
    fullName: '',
    email: '',
    clientType: 'Particulier' as ClientType,
    domain: 'Autre / Non précisé',
    question: '',
    documentName: ''
  };

  constructor() {
    const pending = sessionStorage.getItem('grf.pendingCase');
    if (pending) {
      try {
        this.form = { ...this.form, ...JSON.parse(pending) as typeof this.form };
        this.tab.set('form');
      }
      catch { sessionStorage.removeItem('grf.pendingCase'); }
    }
    if (this.route.snapshot.queryParamMap.get('ia') === 'paid') {
      const paidQuestion = sessionStorage.getItem(PENDING_AI_QUESTION_KEY);
      const paidDomain = sessionStorage.getItem(PENDING_AI_DOMAIN_KEY) ?? '';
      const paymentReference = this.route.snapshot.queryParamMap.get('ref');
      const confirmedPayment = paymentReference ? this.payments.getById(paymentReference) : undefined;
      const currentUser = this.auth.currentUser();
      const expectedPaymentUserId = currentUser?.id ?? sessionStorage.getItem(PENDING_AI_GUEST_ID_KEY);
      if (paidQuestion && confirmedPayment?.status === 'PAID' && confirmedPayment.planId === 'ia' && confirmedPayment.userId === expectedPaymentUserId) {
        this.tab.set('ia');
        this.selectedDomain.set(paidDomain);
        sessionStorage.setItem(PENDING_AI_PAYMENT_REFERENCE_KEY, confirmedPayment.providerReference);
        void this.askQuestion(paidQuestion, paidDomain, { paymentReference: confirmedPayment.providerReference });
        queueMicrotask(() => {
          const el = this.thread()?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
      void this.router.navigate([], { queryParams: { ia: null, ref: null }, queryParamsHandling: 'merge', replaceUrl: true, fragment: 'assistant' });
    }
  }

  selectDomain(domain: string): void {
    this.selectedDomain.set(domain);
    this.chatError.set('');
  }

  memberAccess(): boolean {
    return this.auth.hasPlatformAccess();
  }

  openAssistant(): void {
    this.tab.set('ia');
    document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async send(): Promise<void> {
    const content = this.question.trim();
    if (!content || this.isAnswering()) return;
    if (!this.selectedDomain()) {
      this.chatError.set('Choisissez d’abord un domaine juridique pour votre question.');
      return;
    }
    this.question = '';
    this.chatError.set('');
    const paidReference = sessionStorage.getItem(PENDING_AI_PAYMENT_REFERENCE_KEY);
    if (paidReference) {
      this.question = '';
      await this.askQuestion(content, this.selectedDomain(), { paymentReference: paidReference });
      return;
    }
    const currentUser = this.auth.currentUser();
    if (currentUser && this.auth.userHasPlatformAccess(currentUser)) {
      const cutoff = Date.now() - 366 * 24 * 60 * 60 * 1000;
      const membershipPayment = this.payments.list()
        .filter((payment) => payment.userId === currentUser.id && payment.planId === 'adhesion' && payment.status === 'PAID'
          && Date.parse(payment.paidAt ?? payment.createdAt) > cutoff)
        .sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt))[0];
      if (!membershipPayment) {
        this.chatError.set('Votre adhésion doit être confirmée côté serveur pour utiliser la réponse rapide. Contactez GRF CONSULTING si votre paiement a déjà été validé.');
        return;
      }
      this.question = '';
      await this.askQuestion(content, this.selectedDomain(), { membershipReference: membershipPayment.providerReference });
      return;
    }
    sessionStorage.setItem(PENDING_AI_QUESTION_KEY, content);
    sessionStorage.setItem(PENDING_AI_DOMAIN_KEY, this.selectedDomain());
    if (currentUser) {
      sessionStorage.removeItem(PENDING_AI_GUEST_ID_KEY);
    } else {
      let guestId = sessionStorage.getItem(PENDING_AI_GUEST_ID_KEY);
      if (!guestId) {
        guestId = `guest_${crypto.randomUUID()}`;
        sessionStorage.setItem(PENDING_AI_GUEST_ID_KEY, guestId);
      }
    }
    void this.router.navigate(['/paiement', 'ia']);
  }

  private async askQuestion(question: string, domain: string, access: { paymentReference?: string; membershipReference?: string }): Promise<void> {
    this.isAnswering.set(true);
    this.chatError.set('');
    const userMessage: ChatMessage = { id: createId('msg'), role: 'user', content: question, createdAt: new Date().toISOString() };
    this.messages.set([...this.messages(), userMessage]);
    this.scrollToLatestMessage();
    try {
      const answer = await this.chat.reply(question, domain, access);
      this.messages.set([...this.messages(), answer]);
      if (access.paymentReference) {
        sessionStorage.removeItem(PENDING_AI_QUESTION_KEY);
        sessionStorage.removeItem(PENDING_AI_DOMAIN_KEY);
        sessionStorage.removeItem(PENDING_AI_GUEST_ID_KEY);
        sessionStorage.removeItem(PENDING_AI_PAYMENT_REFERENCE_KEY);
      }
    } catch (error) {
      this.chatError.set(error instanceof Error ? error.message : 'La réponse juridique est momentanément indisponible.');
      if (access.paymentReference) {
        this.question = question;
      }
    } finally {
      this.isAnswering.set(false);
      this.scrollToLatestMessage();
    }
  }

  private scrollToLatestMessage(): void {
    queueMicrotask(() => {
      const el = this.thread()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.documentName = file?.name ?? '';
  }

  async submitCase(): Promise<void> {
    this.formError.set('');
    if (!this.form.fullName || !this.form.email || !this.form.question) {
      this.formError.set('Merci de renseigner le nom, l’email et la question.');
      return;
    }
    const user = this.auth.currentUser();
    if (!user || !this.auth.userHasPlatformAccess(user)) {
      sessionStorage.setItem('grf.pendingCase', JSON.stringify(this.form));
      if (!user) {
        await this.router.navigate(['/inscription'], { queryParams: { plan: 'adhesion' } });
      } else {
        await this.router.navigate(['/paiement', 'adhesion']);
      }
      return;
    }
    sessionStorage.removeItem('grf.pendingCase');
    const created = this.cases.create({
      userId: user.id,
      planId: 'adhesion',
      domain: this.form.domain,
      clientType: this.form.clientType,
      question: this.form.question,
      documentName: this.form.documentName,
      includedInMembership: true
    });
    await this.router.navigate(['/espace/dossiers', created.id]);
  }
}
