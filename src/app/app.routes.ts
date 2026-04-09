import { Routes } from '@angular/router';
import { MapComponent } from './features/map-component/map-component';

export const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'map', component: MapComponent },
];
