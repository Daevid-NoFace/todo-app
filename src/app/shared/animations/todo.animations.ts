import { animate, style, transition, trigger } from "@angular/animations";

export const fadeSlideIn = trigger('fadeSlideIn', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-16px)' })),
    ])
])