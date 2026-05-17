import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Parcel } from '../../../models/parcel';

@Injectable()
export class MapRenderService {
  private map!: L.Map;
  private geoJsonLayer!: L.GeoJSON;
  private selectedLayer: any;
  private streetLayer!: L.TileLayer;
  private satelliteLayer!: L.TileLayer;
  private terrainLayer!: L.TileLayer;
  private hasInitializedView = false;

  highlightedFolio: string | null = null;

  initMap(): void {
    this.map = L.map('map', { minZoom: 10 }).setView([25.7617, -80.1918], 12);
    this.setMiamiBounds();

    this.streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
    );

    this.satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri' }
    );

    this.terrainLayer = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; <a href="https://opentopomap.org/copyright">OpenTopoMap</a> contributors' }
    );

    this.setBaseLayer('satellite');
  }

  getMap(): L.Map {
    return this.map;
  }

  private setMiamiBounds(): void {
    const bounds = L.latLngBounds([25.138, -80.878], [25.996, -80.118]);
    this.map.setMaxBounds(bounds);
  }

  setBaseLayer(layer: 'street' | 'satellite' | 'terrain'): void {
    this.map.removeLayer(this.streetLayer);
    this.map.removeLayer(this.satelliteLayer);
    this.map.removeLayer(this.terrainLayer);

    if (layer === 'street') { this.streetLayer.addTo(this.map); return; }
    if (layer === 'terrain') { this.terrainLayer.addTo(this.map); return; }
    this.satelliteLayer.addTo(this.map);
  }

  resetView(): void {
    const bounds = L.latLngBounds([25.138, -80.878], [25.996, -80.118]);
    this.map.fitBounds(bounds);
  }

  renderParcels(
    parcels: Parcel[],
    onClickFn: (layer: any, feature: any) => void
  ): void {
    this.clearParcels();

    const geoJson = {
      type: 'FeatureCollection',
      features: parcels.map((p) => ({
        type: 'Feature',
        properties: { folio: p.folio },
        geometry: p.geom,
      })),
    };

    this.geoJsonLayer = L.geoJSON(geoJson as any, {
      style: () => ({ color: '#3388ff', weight: 1, fillOpacity: 0 }),
      onEachFeature: (feature, layer) => {
        layer.on('click', () => onClickFn(layer, feature));
      },
    }).addTo(this.map);

    if (this.highlightedFolio) {
      this.geoJsonLayer.eachLayer((layer: any) => {
        if (layer.feature?.properties?.folio === this.highlightedFolio) {
          layer.setStyle({ color: 'green', fillOpacity: 0.4, weight: 2 });
          this.selectedLayer = layer;
        }
      });
    }

    if (!this.hasInitializedView && parcels.length > 0) {
      const tempLayer = L.geoJSON(geoJson as any);
      this.map.fitBounds(tempLayer.getBounds());
      this.hasInitializedView = true;
    }
  }

  highlightAndZoomToFolio(folio: string): void {
    if (!this.geoJsonLayer) return;

    this.geoJsonLayer.eachLayer((layer: any) => {
      if (layer.feature?.properties?.folio === folio) {
        this.highlightLayer(layer);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    });
  }

  highlightLayer(layer: any): void {
    if (this.selectedLayer) {
      this.selectedLayer.setStyle({ color: '#3388ff', fillOpacity: 0, weight: 1 });
    }
    layer.setStyle({ color: 'green', fillOpacity: 0.4, weight: 2 });
    this.selectedLayer = layer;

    if (this.highlightedFolio !== null) {
      this.highlightedFolio = layer.feature?.properties?.folio ?? null;
    }
  }

  clearParcels(): void {
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }
  }

  getBounds(): L.LatLngBounds {
    return this.map.getBounds();
  }

  getZoom(): number {
    return this.map.getZoom();
  }

  onMoveEnd(fn: () => void): void {
    this.map.on('moveend', fn);
  }
}