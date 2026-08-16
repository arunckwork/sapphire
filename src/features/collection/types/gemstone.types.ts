export type GemNature = 'Natural' | 'Synthetic';

export interface GemstoneRecord {
  id: string;
  serialNo: string; // mandatory
  type: string; // mandatory
  variety: string;
  nature: GemNature;
  treatment: string;
  origin: string;
  quantity: number; // mandatory
  weight: number; // mandatory
  weightUnit: string; // mandatory
  shape: string;
  cut: string;
  color: string;
  clarity: string;
  dimensions: string;
  certificationNo: string;
  certificationLab: string;
  createdAt: string;
}

export type GemstoneFormData = Omit<GemstoneRecord, 'id' | 'createdAt'>;

export type SortField = 'serialNo' | 'type' | 'weight' | 'quantity' | 'origin' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface GemstoneFilterState {
  search: string;
  type: string;
  origin: string;
  nature: string;
  treatment: string;
}
