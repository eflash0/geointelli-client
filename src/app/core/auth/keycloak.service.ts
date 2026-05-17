import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js'

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloak!: Keycloak;

  init(): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8090',
      realm: 'geozentra',
      clientId: 'frontend-app',
    });

    return Promise.resolve(true);
    return this.keycloak
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        console.log('authenticated');
        return authenticated;
      })
      .catch((err) => {
        console.error('Keycloak init failed', err);
        return false;
      });
  }

  login(): Promise<void> {
    return this.keycloak.login();
  }

  logout(): Promise<void> {
    return this.keycloak.logout({
      redirectUri: 'http://localhost:4200',
    });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  isLoggedIn(): boolean {
    return !!this.keycloak?.authenticated;
  }

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.['preferred_username'];
  }

  async updateToken(minValidity = 5): Promise<boolean> {
    try {
      return await this.keycloak.updateToken(minValidity);
    } catch (err) {
      console.error('Token refresh failed', err);
      await this.login();
      return false;
    }
  }

  async getValidToken(): Promise<string | undefined> {
    await this.updateToken(5);
    return this.keycloak.token;
  }
}