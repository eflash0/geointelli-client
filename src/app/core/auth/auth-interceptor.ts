import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakService } from './keycloak.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private keycloakService: KeycloakService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req);

    return from(this.addToken(req)).pipe(
      switchMap((authReq) => next.handle(authReq))
    );
  }

  private async addToken(req: HttpRequest<any>): Promise<HttpRequest<any>> {

    const token = this.keycloakService.getValidToken();

    if (!token) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}