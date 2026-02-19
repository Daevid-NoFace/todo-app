import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/todo/todo-page.component').then(m => m.TodoPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  }
];
