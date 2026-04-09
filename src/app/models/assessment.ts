export interface Assessment {
  id?: number;
  assessedValue: number;
  buildingOnlyValue: number;
  extraFeatureValue: number;
  landValue: number;
  totalValue: number;
  year: number;
  message: string;
}