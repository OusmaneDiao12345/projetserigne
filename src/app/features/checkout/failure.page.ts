import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-failure-page',
  imports: [RouterLink],
  template: `
    <section class="container section" style="max-width:520px;text-align:center;">
      <h1 class="serif">Paiement non abouti</h1>
      <p class="muted">La transaction Wave ou Orange Money n'a pas été confirmée. Vous pouvez réessayer.</p>
      <a class="btn btn-navy" routerLink="/">Retour aux offres</a>
    </section>
  `
})
export class FailurePage {}
