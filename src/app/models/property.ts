import { Address } from "./address";
import { Assessment } from "./assessment";
import { Building } from "./building";
import { Land } from "./land";
import { Owner } from "./owner";
import { Parcel } from "./parcel";
import { Sale } from "./sale";
import { Tax } from "./tax";

export interface Property {
  id?: number;
  folio: string;
  parentFolio: string;
  
  bathroomCount: number;
  bedroomCount: number;
  halfBathroomCount: number;
  buildingActualArea: number;
  buildingBaseArea: number;
  buildingEffectiveArea: number;
  buildingGrossArea: number;
  buildingHeatedArea: number;
  
  dorCode: string;
  dorDescription: string;
  neighborhood: number;
  neighborhoodDescription: string;
  lotSize: number;
  floorCount: number;
  unitCount: number;
  yearBuilt: string;
  municipality: string;
  subdivision: string;
  primaryZone: string;
  primaryZoneDescription: string;
  
  status: string;
  showCurrentValuesFlag: string;
  message: string;

  address?: Address;
  owners: Owner[];
  assessments: Assessment[];
  buildings: Building[];
  lands: Land[];
  sales: Sale[];
  taxes: Tax[];
  parcels: Parcel[];
}