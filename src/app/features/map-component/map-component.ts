import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { ParcelService } from '../../core/services/parcel-service';
import { MatDialog } from '@angular/material/dialog';
import { Parcel } from '../../models/parcel';
import { PropertyDetailComponent } from '../property/property-detail-component/property-detail-component';
import { AuthService } from '../../core/services/auth-service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-component',
  templateUrl: './map-component.html',
  styleUrls: ['./map-component.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private geoJsonLayer!: L.GeoJSON;
  private selectedLayer: any;
  private moveTimeout: any;
  readonly parcelZoomThreshold = 14;
  private hasInitializedView = false;
  private parcelsSubscription?: Subscription;
  private lastParcelRequestKey = '';
  private isLoadingParcels = false;

  // UI state
  menuOpen = false;
  layersOpen = false;
  activeBaseLayer: 'street' | 'satellite' | 'terrain' = 'satellite';

  // Tile layers
  private streetLayer!: L.TileLayer;
  private satelliteLayer!: L.TileLayer;
  private terrainLayer!: L.TileLayer;

  constructor(
    private parcelService: ParcelService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUserName(): string {
    return this.authService.user().user?.fullName ?? 'Analyst';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.parcelsSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.handleEvents();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleLayers(): void {
    this.layersOpen = !this.layersOpen;
  }

  closeOverlays(): void {
    this.menuOpen = false;
    this.layersOpen = false;
  }

  setBaseLayer(layer: 'street' | 'satellite' | 'terrain'): void {
    this.activeBaseLayer = layer;
    this.map.removeLayer(this.streetLayer);
    this.map.removeLayer(this.satelliteLayer);
    this.map.removeLayer(this.terrainLayer);

    if (layer === 'street') {
      this.streetLayer.addTo(this.map);
      return;
    }

    if (layer === 'terrain') {
      this.terrainLayer.addTo(this.map);
      return;
    }

    this.satelliteLayer.addTo(this.map);
  }

  resetView(): void {
    const bounds = L.latLngBounds([25.138, -80.878], [25.996, -80.118]);
    this.map.fitBounds(bounds);
    this.menuOpen = false;
  }

  private initMap(): void {
    this.map = L.map('map', {
      minZoom: 10,
    }).setView([25.7617, -80.1918], 12); // Miami location

    this.setMiamiBounds();

    // Define Tile Layers
    this.streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    this.satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
      }
    );

    this.terrainLayer = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://opentopomap.org/copyright">OpenTopoMap</a> contributors',
      }
    );

    this.setBaseLayer('satellite');
  }

  private setMiamiBounds(): void {
    const bounds = L.latLngBounds([25.138, -80.878], [25.996, -80.118]);
    this.map.setMaxBounds(bounds);
  }

  private handleEvents(): void {
    this.map.on('moveend', () => {
      clearTimeout(this.moveTimeout);

      this.moveTimeout = setTimeout(() => {
        if (this.map.getZoom() >= this.parcelZoomThreshold) {
          this.loadParcels();
        } else {
          this.clearParcels();
        }
      }, 300);
    });
  }

  private loadParcels(): void {
    const bounds = this.map.getBounds();
    const bboxParts = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ].map((value) => value.toFixed(5));
    const bbox = bboxParts.join(',');
    const requestKey = `${bbox}|z:${this.map.getZoom()}`;

    if (this.isLoadingParcels || requestKey === this.lastParcelRequestKey) {
      return;
    }

    this.lastParcelRequestKey = requestKey;
    this.isLoadingParcels = true;
    this.parcelsSubscription?.unsubscribe();
    this.parcelsSubscription = this.parcelService.getParcels(bbox).subscribe({
      next: (parcels) => this.renderParcels(parcels),
      error: (err) => {
        console.error('Parcel load error', err);
        this.lastParcelRequestKey = '';
      },
      complete: () => {
        this.isLoadingParcels = false;
      },
    });
  }

  private renderParcels(parcels: Parcel[]): void {
    this.clearParcels();

    const geoJson = {
      type: 'FeatureCollection',
      features: parcels.map((p) => ({
        type: 'Feature',
        properties: {
          folio: p.folio,
        },
        geometry: p.geom,
      })),
    };

    this.geoJsonLayer = L.geoJSON(geoJson as any, {
      style: () => ({
        color: '#3388ff',
        weight: 1,
        fillOpacity: 0,
      }),
      onEachFeature: (feature, layer) => {
        layer.on('click', () => this.onParcelClick(layer, feature));
      },
    }).addTo(this.map);

    // Auto-fit the map once
    if (!this.hasInitializedView && parcels.length > 0) {
      const layer = L.geoJSON(geoJson as any);
      this.map.fitBounds(layer.getBounds());
      this.hasInitializedView = true;
    }
  }

  private onParcelClick(layer: any, feature: any): void {
    // Reset previous
    if (this.selectedLayer) {
      this.selectedLayer.setStyle({
        color: '#3388ff',
        fillOpacity: 0,
      });
    }

    // Highlight selected
    layer.setStyle({
      color: 'green',
      fillOpacity: 0.4,
    });

    this.selectedLayer = layer;

    const folio = feature.properties.folio;

    this.dialog.open(PropertyDetailComponent, {
      data: { folio },
      width: 'min(900px, 92vw)',
      maxWidth: '92vw',
      autoFocus: false,
      panelClass: 'property-detail-dialog-panel',
    });
  }

  private clearParcels(): void {
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }
  }
}