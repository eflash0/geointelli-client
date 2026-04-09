export interface Tax {
  id?: number;
  year: number;
  message: string;

  cityExemptionValue: number;
  cityTaxableValue: number;

  countyExemptionValue: number;
  countyTaxableValue: number;

  regionalExemptionValue: number;
  regionalTaxableValue: number;

  schoolExemptionValue: number;
  schoolTaxableValue: number;
}