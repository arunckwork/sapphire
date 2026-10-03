/**
 * Static fallback used when the masterdata API is unavailable.
 *
 * This is the exact same data that is hardcoded in the collection
 * gemstone.constants.ts file. It guarantees forms remain fully functional
 * even if the /api/masterdata call fails (network error, backend down, etc.).
 *
 * The live API response will silently replace these values on success.
 */
import {
  GEMSTONE_TYPES,
  GEMSTONE_VARIETIES,
  TREATMENT_OPTIONS,
  ORIGIN_OPTIONS,
  SHAPE_OPTIONS,
  CUT_OPTIONS,
  COLOR_OPTIONS,
  CLARITY_OPTIONS,
  CERTIFICATION_LABS,
  INDUSTRIAL_STONE_TYPES,
} from '@/features/collection/constants/gemstone.constants';
import type { MasterDataResponse } from '../types/masterdata.types';

export const STATIC_MASTERDATA_FALLBACK: MasterDataResponse = {
  gemstone_types:         [...GEMSTONE_TYPES],
  gemstone_varieties:     [...GEMSTONE_VARIETIES],
  treatment_options:      [...TREATMENT_OPTIONS],
  origin_options:         [...ORIGIN_OPTIONS],
  shape_options:          [...SHAPE_OPTIONS],
  cut_options:            [...CUT_OPTIONS],
  color_options:          [...COLOR_OPTIONS],
  clarity_options:        [...CLARITY_OPTIONS],
  certification_labs:     [...CERTIFICATION_LABS],
  industrial_stone_types: [...INDUSTRIAL_STONE_TYPES],
  location_options:       [], // populated from backend only — no hardcoded fallback
};
