import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { ParcelService } from '../../core/services/parcel-service';
import { MatDialog } from '@angular/material/dialog';
import { Parcel } from '../../models/parcel';
import { PropertyDetailComponent } from '../property/property-detail-component/property-detail-component';

@Component({
  selector: 'app-map-component',
  templateUrl: './map-component.html',
  styleUrls: ['./map-component.css'],
})
export class MapComponent implements AfterViewInit {
  private map!: L.Map;
  private geoJsonLayer!: L.GeoJSON;
  private selectedLayer: any;
  private moveTimeout: any;
  private zoomThreshold = 15;
  private hasInitializedView = false;

  // Tile Layers for switching
  private streetLayer!: L.TileLayer;
  private satelliteLayer!: L.TileLayer;
  private terrainLayer!: L.TileLayer;

  constructor(
    private parcelService: ParcelService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.handleEvents();
  }

  private initMap() {
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

    // Add default layer (Satellite)
    this.satelliteLayer.addTo(this.map);

    // Add Layer Control (User can choose between street, satellite, terrain)
    L.control
      .layers(
        {
          'Street': this.streetLayer,
          'Satellite': this.satelliteLayer,
          'Terrain': this.terrainLayer,
        },
        {},
        { position: 'topright' }
      )
      .addTo(this.map);
  }

  private setMiamiBounds() {
    const bounds = L.latLngBounds([25.138, -80.878], [25.996, -80.118]);
    this.map.setMaxBounds(bounds);
  }

  private handleEvents() {
    this.map.on('moveend', () => {
      clearTimeout(this.moveTimeout);

      this.moveTimeout = setTimeout(() => {
        if (this.map.getZoom() >= this.zoomThreshold) {
          this.loadParcels();
        } else {
          this.clearParcels();
        }
      }, 300);
    });
  }

  private loadParcels() {
    const bounds = this.map.getBounds();

    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]
      .join(',');

    this.parcelService.getParcels(bbox).subscribe({
      next: (parcels) => this.renderParcels(parcels),
      error: (err) => console.error('Parcel load error', err),
    });
  }

  private renderParcels(parcels: Parcel[]) {
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

  private onParcelClick(layer: any, feature: any) {
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
      width: '600px',
    });
  }

  private clearParcels() {
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }
  }
}