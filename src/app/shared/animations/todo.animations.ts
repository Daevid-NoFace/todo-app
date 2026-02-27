import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const fadeSlideIn = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-8px)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-16px)' })),
  ]),
]);

export const sheetSlideUp = trigger('sheetSlideUp', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateY(0)' })),
  ]),
  transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(100%)' }))]),
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        stagger(50, [animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]),
      ],
      { optional: true },
    ),
  ]),
]);

export const checkBounce = trigger('checkBounce', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0)' }),
    animate(
      '350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1)' }),
    ),
  ]),
]);
