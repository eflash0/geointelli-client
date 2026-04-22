import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  email: string;
  fullName: string;
  provider: 'local' | 'google';
}

interface StoredAuthState {
  user: AuthUser | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'property_client_auth_state';
  private readonly authState = signal<StoredAuthState>(this.readStoredState());
  readonly user = this.authState.asReadonly();

  get isAuthenticated(): boolean {
    return this.authState().user !== null;
  }

  login(email: string, password: string): boolean {
    if (!email || !password) {
      return false;
    }

    const nameFromEmail = email.split('@')[0] ?? 'User';
    this.setUser({
      email,
      fullName: this.toTitleCase(nameFromEmail),
      provider: 'local',
    });
    return true;
  }

  signup(fullName: string, email: string, password: string): boolean {
    if (!fullName || !email || !password) {
      return false;
    }

    this.setUser({
      email,
      fullName: fullName.trim(),
      provider: 'local',
    });
    return true;
  }

  logout(): void {
    this.authState.set({ user: null });
    this.persist();
  }

  startGoogleOAuth(): void {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem('google_oauth_state', state);

    const clientId =
      (window as unknown as { __GOOGLE_CLIENT_ID__?: string }).__GOOGLE_CLIENT_ID__ ??
      'YOUR_GOOGLE_CLIENT_ID';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  completeGoogleOAuth(code: string | null, state: string | null): boolean {
    const expectedState = sessionStorage.getItem('google_oauth_state');
    sessionStorage.removeItem('google_oauth_state');

    if (!code || !state || !expectedState || state !== expectedState) {
      return false;
    }

    this.setUser({
      email: 'google.user@example.com',
      fullName: 'Google User',
      provider: 'google',
    });
    return true;
  }

  private setUser(user: AuthUser): void {
    this.authState.set({ user });
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.authState()));
  }

  private readStoredState(): StoredAuthState {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return { user: null };
    }

    try {
      const parsed = JSON.parse(raw) as StoredAuthState;
      return parsed?.user ? parsed : { user: null };
    } catch {
      return { user: null };
    }
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[._-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
