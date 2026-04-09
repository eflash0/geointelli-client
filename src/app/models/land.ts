export interface Land {
  id?: number;
  adjustedUnitPrice: number;
  calculatedValue: number;
  depth: number;
  frontFeet: number;
  landUse: string;
  landlineType: string;
  message: string;
  muniZone: string;
  muniZoneDescription: string;
  paZoneDescription: string;
  percentCondition: number;
  rollYear: number;
  totalAdjustments: number;
  unitType: string;
  units: number;
  useCode: string;
  zone: string;
}