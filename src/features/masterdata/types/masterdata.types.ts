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
