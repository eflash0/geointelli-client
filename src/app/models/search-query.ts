export type SearchMode = 'folio' | 'address';

export interface SearchQuery {
  mode: SearchMode;
  value: string;
}