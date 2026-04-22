import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
})
export class GoogleCallbackComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const ok = this.authService.completeGoogleOAuth(code, state);
    this.router.navigateByUrl(ok ? '/map' : '/login');
  }
}
