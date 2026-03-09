import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'guest' | 'user' | 'company_staff' | 'admin';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<AuthUser>({
    id: undefined,
    name: 'Usuario Invitado',
    email: '',
    role: 'guest',
    isAuthenticated: false
  });

  constructor() {
    // Simular carga de usuario desde localStorage o backend
    this.loadUserFromStorage();
  }

  getUser(): Observable<AuthUser> {
    return this.user$.asObservable();
  }

  getCurrentUser(): AuthUser {
    return this.user$.value;
  }

  login(email: string, password: string, role: UserRole = 'user'): void {
    const user: AuthUser = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0],
      email,
      role,
      isAuthenticated: true
    };
    this.user$.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  register(name: string, email: string, password: string, role: UserRole = 'user'): void {
    // En producción, esto enviaría a un backend
    // Aquí simulamos el registro creando el usuario
    const user: AuthUser = {
      id: 'user-' + Date.now(),
      name,
      email,
      role,
      isAuthenticated: true
    };
    this.user$.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  logout(): void {
    const guest: AuthUser = {
      name: 'Usuario Invitado',
      email: '',
      role: 'guest',
      isAuthenticated: false
    };
    this.user$.next(guest);
    localStorage.removeItem('currentUser');
  }

  private loadUserFromStorage(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        this.user$.next(user);
      } catch (e) {
        console.error('Failed to load user from storage', e);
      }
    }
  }
}
