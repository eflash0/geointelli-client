import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Map } from './features/map/map';

export const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'map', component: Map, canActivate: [authGuard] },
  { path: '**', redirectTo: 'map' },
];
