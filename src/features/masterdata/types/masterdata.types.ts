export interface MasterDataOption {
  label: string;
  value: string;
}

export interface MasterDataResponse {
  gemstone_types:         MasterDataOption[];
  gemstone_varieties:     MasterDataOption[];
  treatment_options:      MasterDataOption[];
  origin_options:         MasterDataOption[];
  shape_options:          MasterDataOption[];
  cut_options:            MasterDataOption[];
  color_options:          MasterDataOption[];
  clarity_options:        MasterDataOption[];
  certification_labs:     MasterDataOption[];
  industrial_stone_types: MasterDataOption[];
}

/* ── Admin CRUD types ─────────────────────────────────────────────────────── */

export type MasterDataCategoryKey =
  | 'gemstone_types'
  | 'gemstone_varieties'
  | 'treatment_options'
  | 'origin_options'
  | 'shape_options'
  | 'cut_options'
  | 'color_options'
  | 'clarity_options'
  | 'certification_labs'
  | 'industrial_stone_types';

/** Full item shape returned by admin list/detail endpoints */
export interface MasterDataItem {
  id:         number;
  category:   MasterDataCategoryKey;
  label:      string;
  value:      string;
  sort_order: number;
  is_active:  boolean;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}

/** Payload to create a new item */
export interface MasterDataCreateDto {
  category:    MasterDataCategoryKey;
  label:       string;
  value:       string;
  sort_order?: number;  // defaults to end of list if omitted
}

/** Payload to update an existing item (all fields optional) */
export interface MasterDataUpdateDto {
  label?:      string;
  sort_order?: number;
  is_active?:  boolean;
}

/** Paginated list response from admin endpoint */
export interface MasterDataListResponse {
  data:  MasterDataItem[];
  total: number;
  page:  number;
  limit: number;
}

/** Human-readable category tab definitions used by the Masterdata management page */
export const MASTERDATA_CATEGORY_TABS: { key: MasterDataCategoryKey; label: string }[] = [
  { key: 'gemstone_types',         label: 'Gemstone Types' },
  { key: 'gemstone_varieties',     label: 'Varieties' },
  { key: 'treatment_options',      label: 'Treatments' },
  { key: 'origin_options',         label: 'Origins' },
  { key: 'shape_options',          label: 'Shapes' },
  { key: 'cut_options',            label: 'Cuts' },
  { key: 'color_options',          label: 'Colors' },
  { key: 'clarity_options',        label: 'Clarity Grades' },
  { key: 'certification_labs',     label: 'Cert. Labs' },
  { key: 'industrial_stone_types', label: 'Industrial Types' },
];
