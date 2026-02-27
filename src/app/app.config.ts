import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  LucideAngularModule,
  Home,
  Briefcase,
  Dumbbell,
  FolderOpen,
  Star,
  CalendarDays,
  Search,
  Plus,
  User,
  Sun,
  Moon,
  Check,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Circle,
  Flame,
  TrendingUp,
  ListTodo,
  LogOut,
  Heart,
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Home,
        Briefcase,
        Dumbbell,
        FolderOpen,
        Star,
        CalendarDays,
        Search,
        Plus,
        User,
        Sun,
        Moon,
        Check,
        Trash2,
        Pencil,
        ChevronDown,
        ChevronRight,
        Circle,
        Flame,
        TrendingUp,
        ListTodo,
        LogOut,
        Heart,
      }),
    ),
  ],
};
