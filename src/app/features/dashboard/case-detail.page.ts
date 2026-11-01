import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CaseService } from '../../core/services/case.service';

@Component({
  selector: 'app-case-detail-page',
  imports: [RouterLink, DatePipe],
  template: `
    @if (item(); as c) {
      <a routerLink="/espace/dossiers">← Retour</a>
      <div class="card" style="padding:22px;margin-top:12px;">
        <p class="muted">{{ c.reference }} · {{ c.createdAt | date:'medium' }}</p>
        <h2 class="serif">{{ c.domain }}</h2>
        <span class="badge badge-wait">{{ c.status }}</span>
        <h4>Question</h4>
        <p>{{ c.question }}</p>
        @if (c.documentName) { <p>Pièce : {{ c.documentName }}</p> }
        @if (c.response) {
          <h4>Réponse GRF</h4>
          <p style="white-space:pre-wrap;">{{ c.response }}</p>
        } @else {
          <div class="notice">Votre dossier est en cours d'analyse. Réponse sous 24h.</div>
        }
      </div>
    } @else {
      <p>Dossier introuvable.</p>
    }
  `
})
export class CaseDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly cases = inject(CaseService);
  readonly item = computed(() => this.cases.get(this.route.snapshot.paramMap.get('id') ?? ''));
}
