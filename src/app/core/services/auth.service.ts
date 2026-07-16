import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto,
  UserRole
} from '../models/models';

const STORAGE_KEY = 'nexttask_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = signal<AuthResponse | null>(this.loadStored());

  readonly user = computed(() => this.authState());
  readonly isAuthenticated = computed(() => this.hasValidSession());
  readonly isAdmin = computed(() => this.authState()?.role === 'Admin');

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    // Drop expired tokens immediately so the user is not stuck half-logged-in
    if (this.authState() && !this.hasValidSession()) {
      this.clearSession();
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((res) => this.persist(res)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap((res) => this.persist(res)));
  }

  listUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${environment.apiUrl}/auth/users`);
  }

  /** Ends the session and sends the user to login. Only call on explicit Sign out or expired/invalid token. */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Clears stored auth without navigating (used when redirecting via guards). */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.authState.set(null);
  }

  getToken(): string | null {
    if (!this.hasValidSession()) {
      return null;
    }
    return this.authState()?.token ?? null;
  }

  getUserId(): number | null {
    return this.authState()?.id ?? null;
  }

  getRole(): UserRole | null {
    return this.authState()?.role ?? null;
  }

  hasValidSession(): boolean {
    const session = this.authState();
    if (!session?.token) {
      return false;
    }
    return !this.isTokenExpired(session.token);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.authState.set(res);
  }

  private loadStored(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as AuthResponse;
      if (!parsed?.token || this.isTokenExpired(parsed.token)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }
      const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(json) as { exp?: number };
      if (!payload.exp) {
        return false;
      }
      // Small skew so we don't race the server clock
      return Date.now() >= payload.exp * 1000 - 5_000;
    } catch {
      return true;
    }
  }
}
