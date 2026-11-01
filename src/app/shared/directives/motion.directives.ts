import { afterNextRender, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fades/slides an element in when it enters the viewport. Usage: <div reveal="up" [revealDelay]="120"> */
@Directive({ selector: '[reveal]', host: { class: 'reveal' } })
export class RevealDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly reveal = input<'up' | 'left' | 'right' | 'zoom' | ''>('up');
  readonly revealDelay = input(0);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      node.dataset['reveal'] = this.reveal() || 'up';
      node.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);
      if (reducedMotion() || !('IntersectionObserver' in window)) {
        node.classList.add('is-visible');
        return;
      }
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              node.classList.add('is-visible');
              this.observer?.disconnect();
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      this.observer.observe(node);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

/** Light spot that follows the cursor plus a subtle 3D tilt. Usage: <article spotlight> */
@Directive({
  selector: '[spotlight]',
  host: {
    class: 'spotlight',
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'leave()'
  }
})
export class SpotlightDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly tilt = input(4);

  move(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || reducedMotion()) return;
    const node = this.el.nativeElement;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    node.style.setProperty('--mx', `${x * 100}%`);
    node.style.setProperty('--my', `${y * 100}%`);
    node.style.setProperty('--rx', `${(0.5 - y) * this.tilt()}deg`);
    node.style.setProperty('--ry', `${(x - 0.5) * this.tilt()}deg`);
  }

  leave(): void {
    const node = this.el.nativeElement;
    node.style.setProperty('--rx', '0deg');
    node.style.setProperty('--ry', '0deg');
  }
}

/** Animates a number from 0 to its target when visible. Usage: <strong [countUp]="24"></strong> */
@Directive({ selector: '[countUp]' })
export class CountUpDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly countUp = input.required<number>();
  readonly countSuffix = input('');
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      const target = this.countUp();
      const render = (value: number) => {
        node.textContent = `${Math.round(value).toLocaleString('fr-FR')}${this.countSuffix()}`;
      };
      if (reducedMotion() || !('IntersectionObserver' in window)) {
        render(target);
        return;
      }
      render(0);
      this.observer = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        this.observer?.disconnect();
        const start = performance.now();
        const duration = 1400;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          render(target * (1 - Math.pow(1 - t, 4)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: 0.4 });
      this.observer.observe(node);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

export const MOTION = [RevealDirective, SpotlightDirective, CountUpDirective] as const;
