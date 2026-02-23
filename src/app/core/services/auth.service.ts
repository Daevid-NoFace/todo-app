import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private storageService = inject(StorageService);

  private _state = signal<AuthState>({
    user: this.storageService.get<User>('currentUser'),
    isAuthenticated: !!this.storageService.get<User>('currentUser'),
  });

  state = this._state.asReadonly();
  currentUser = () => this._state().user;
  isAuthenticated = () => this._state().isAuthenticated;

  private setSession(user: User) {
    this.storageService.set('currentUser', user);
    this._state.set({
      user,
      isAuthenticated: true,
    });
    this.router.navigate(['/']);
  }

  register(name: string, email: string, password: string): string | null {
    const users = this.storageService.get<User[]>('users') ?? [];

    if (users.find((u) => u.email === email)) {
      return 'auth.email_taken';
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: btoa(password),
    };

    this.storageService.set('users', [...users, newUser]);
    this.setSession(newUser);

    return null;
  }

  login(email: string, password: string): string | null {
    const users = this.storageService.get<User[]>('users') ?? [];
    const user = users.find((u) => u.email === email);

    if (!user) {
      return 'auth.invalid_credentials';
    }

    if (user.passwordHash !== btoa(password)) {
      return 'auth.invalid_credentials';
    }

    this.setSession(user);
    return null;
  }

  logout(): void {
    this.storageService.remove('currentUser');
    this._state.set({
      user: null,
      isAuthenticated: false,
    });
    this.router.navigate(['/login']);
  }
}
