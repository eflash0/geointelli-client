import { Routes } from '@angular/router';
import { MapComponent } from './features/map-component/map-component';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'auth/google/callback', component: GoogleCallbackComponent },
  { path: 'map', component: MapComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
