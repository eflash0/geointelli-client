import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MapRenderService } from './services/map-render.service';
import { ParcelService } from '../../core/services/parcel.service';
import { AddressService } from '../../core/services/address.service';
import { SearchBar } from './components/search-bar/search-bar';
import { PropertyDetailComponent } from '../property/property-detail-component/property-detail-component';
import { SearchQuery } from '../../models/search-query';

@Component({
  selector: 'app-map-component',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBar],
  providers: [MapRenderService],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class Map implements AfterViewInit, OnDestroy {

  private moveTimeout: any;
  private parcelsSubscription?: Subscription;
  private searchSubscription?: Subscription;
  private isLoadingParcels = false;
  private lastParcelRequestKey = '';
  readonly parcelZoomThreshold = 14;

  menuOpen = false;
  layersOpen = false;
  activeBaseLayer: 'street' | 'satellite' | 'terrain' = 'satellite';

  constructor(
    private mapRender: MapRenderService,
    private parcelService: ParcelService,
    private addressService: AddressService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  get currentUserName(): string {
    return 'User';
  }

  ngAfterViewInit(): void {
    this.mapRender.initMap();
    this.handleMoveEnd();
  }

  ngOnDestroy(): void {
    this.parcelsSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  toggleLayers(): void { this.layersOpen = !this.layersOpen; }
  openAbout(): void {}

  closeOverlays(): void {
    this.menuOpen = false;
    this.layersOpen = false;
  }

  setBaseLayer(layer: 'street' | 'satellite' | 'terrain'): void {
    this.activeBaseLayer = layer;
    this.mapRender.setBaseLayer(layer);
  }

  resetView(): void {
    this.mapRender.resetView();
    this.menuOpen = false;
  }

  onSearch(query: SearchQuery): void {
    if (query.mode === 'folio') {
      this.searchByFolio(query.value);
    } else {
      this.searchByAddress(query.value);
    }
  }

  private searchByFolio(folio: string): void {
    this.searchSubscription?.unsubscribe();
    this.isLoadingParcels = true;

    this.searchSubscription = this.parcelService
      .getParcelByFolio(folio)
      .subscribe({
        next: (response) => {
          const parcels = Array.isArray(response) ? response : [response];
          if (!parcels.length || !parcels[0].geom) return;

          this.mapRender.highlightedFolio = parcels[0].folio;
          this.mapRender.renderParcels(parcels, this.onParcelClick.bind(this));
          this.mapRender.highlightAndZoomToFolio(parcels[0].folio);
        },
        error: (err) => console.error('Folio search error', err),
        complete: () => (this.isLoadingParcels = false),
      });
  }

  private searchByAddress(raw: string): void {
    this.searchSubscription?.unsubscribe();
    this.isLoadingParcels = true;

    this.searchSubscription = this.addressService.search(raw).subscribe({
      next: (properties) => {
        if (!properties.length) return;

        this.mapRender.highlightedFolio = properties[0].folio;
        this.mapRender.renderParcels(properties[0].parcels, this.onParcelClick.bind(this));
        this.mapRender.highlightAndZoomToFolio(properties[0].parcels[0].folio);
      },
      error: (err) => console.error('Address search error', err),
      complete: () => (this.isLoadingParcels = false),
    });
  }

  private onParcelClick(layer: any, feature: any): void {
    this.mapRender.highlightedFolio = null;
    this.mapRender.highlightLayer(layer);

    this.dialog.open(PropertyDetailComponent, {
      data: { folio: feature.properties.folio },
      width: 'min(900px, 92vw)',
      maxWidth: '92vw',
      autoFocus: false,
      panelClass: 'property-detail-dialog-panel',
    });
  }

  private handleMoveEnd(): void {
    this.mapRender.onMoveEnd(() => {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = setTimeout(() => {
        if (this.mapRender.getZoom() >= this.parcelZoomThreshold) {
          this.loadParcels();
        } else {
          this.mapRender.clearParcels();
        }
      }, 300);
    });
  }

  private loadParcels(): void {
    const bounds = this.mapRender.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ].map((v) => v.toFixed(5)).join(',');

    const requestKey = `${bbox}|z:${this.mapRender.getZoom()}`;
    if (this.isLoadingParcels || requestKey === this.lastParcelRequestKey) return;

    this.lastParcelRequestKey = requestKey;
    this.isLoadingParcels = true;
    this.parcelsSubscription?.unsubscribe();

    this.parcelsSubscription = this.parcelService.getParcels(bbox).subscribe({
      next: (parcels) =>
        this.mapRender.renderParcels(parcels, this.onParcelClick.bind(this)),
      error: (err) => {
        console.error('Parcel load error', err);
        this.lastParcelRequestKey = '';
      },
      complete: () => (this.isLoadingParcels = false),
    });
  }

  logout(): void {
    this.router.navigateByUrl('/login');
  }
}