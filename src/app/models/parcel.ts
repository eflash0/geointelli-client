export interface Parcel {
  id: number;
  folio: string;
  lotSize: number;
  geom: MultiPolygonGeoJSON; 
}

export interface MultiPolygonGeoJSON {
  type: 'MultiPolygon';
  coordinates: number[][][][];
  crs?: {
    type: string;
    properties: { name: string };
  };
}