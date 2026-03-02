import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

/**
 * Centralised animation triggers shared across components.
 * Exported as constants and registered in the `animations: []` array of each component.
 */

export const fadeSlideIn = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-8px)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-16px)' })),
  ]),
]);

// cubic-bezier(0.34, 1.56, 0.64, 1): spring curve with a slight overshoot
// (control points > 1.0). Creates a physically natural "bounce" feel without
// the complexity of real spring physics. Ideal for bottom sheets and modal entrances.
export const sheetSlideUp = trigger('sheetSlideUp', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateY(0)' })),
  ]),
  transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(100%)' }))]),
]);

// { optional: true } prevents an error when there are no :enter elements
// (e.g. when the list renders with existing items on initialisation).
// stagger(50ms) adds a 50ms delay between each item for the cascade waterfall effect.
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

// Same spring curve as sheetSlideUp for the checkmark icon inside completed todos.
export const checkBounce = trigger('checkBounce', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0)' }),
    animate(
      '350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1)' }),
    ),
  ]),
]);

// height: '*' is Angular Animations shorthand for "the element's natural height".
// Angular measures it at animation time, so it works for dynamic content
// (subtask lists of variable length).
export const expandCollapse = trigger('expandCollapse', [
  transition(':enter', [
    style({ opacity: 0, height: 0, overflow: 'hidden' }),
    animate('300ms ease-out', style({ opacity: 1, height: '*' })),
  ]),
  transition(':leave', [
    style({ opacity: 1, height: '*', overflow: 'hidden' }),
    animate('300ms ease-out', style({ opacity: 0, height: 0 })),
  ]),
]);
