import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    @switch (name()) {
      @case ('scale') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3v18M7 7h10M5 21h14M8 7l-4 7h8L8 7zm8 0l-4 7h8l-4-7z" />
        </svg>
      }
      @case ('counsel') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 5.5v11" />
          <path d="M6.5 8.5h9" />
          <path d="M6.5 8.5 3.5 14h6L6.5 8.5z" />
          <path d="M15.5 8.5 12.5 14h6l-3-5.5z" />
          <path d="M7.5 19.5h7" />
          <path d="M18.2 3.2l.35.95.95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="currentColor" stroke="none" />
        </svg>
      }
      @case ('shield') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
        </svg>
      }
      @case ('bolt') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      }
      @case ('menu') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      }
      @case ('send') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 12l16-8-6 16-2-7-8-1z" />
        </svg>
      }
      @case ('upload') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 16V6m0 0l-4 4m4-4l4 4M5 20h14" />
        </svg>
      }
      @case ('check') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12l5 5L20 7" />
        </svg>
      }
      @case ('briefcase') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      }
      @case ('landmark') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M3 21h18M4 10h16M12 3l9 7H3l9-7zM6 10v8m4-8v8m4-8v8m4-8v8" />
        </svg>
      }
      @case ('building') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M8 7h2M14 7h2M8 12h2M14 12h2M8 17h8" />
        </svg>
      }
      @case ('users') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M17 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM21 20c0-2.2-1.5-4-4-4" />
        </svg>
      }
      @case ('file') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
          <path d="M14 3v5h5" />
        </svg>
      }
      @case ('chat') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M5 16l-2 5 5-2h9a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v9z" />
        </svg>
      }
      @case ('logout') {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
        </svg>
      }
      @default {
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="12" cy="12" r="9" />
        </svg>
      }
    }
  `,
  styles: `
    :host { display: inline-flex; }
    svg { width: 1.15em; height: 1.15em; }
  `
})
export class IconComponent {
  name = input.required<string>();
}
