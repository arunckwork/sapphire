import type { CollectionType } from '../types/gemstone.types';

/* ─────────────────────────────────────────────────────────────────────────────
 * ALL dropdown constants are key-value pairs:
 *   label  — display text shown in the UI
 *   value  — lowercase string submitted to the API / stored in DB as master data
 * ───────────────────────────────────────────────────────────────────────────── */

export const COLLECTION_TYPE_OPTIONS: ReadonlyArray<{ label: string; value: CollectionType }> = [
  { label: 'Single Stone',      value: 'single_stone' },
  { label: 'Bulk Stones',       value: 'bulk_stones' },
  { label: 'Jewellery',         value: 'jewellery' },
  { label: 'Industrial Stones', value: 'industrial_stones' },
] as const;

export const GEMSTONE_TYPES = [
  { label: 'Sapphire',     value: 'sapphire' },
  { label: 'Ruby',         value: 'ruby' },
  { label: 'Emerald',      value: 'emerald' },
  { label: 'Spinel',       value: 'spinel' },
  { label: 'Alexandrite',  value: 'alexandrite' },
  { label: 'Tanzanite',    value: 'tanzanite' },
  { label: 'Tourmaline',   value: 'tourmaline' },
  { label: 'Garnet',       value: 'garnet' },
  { label: 'Aquamarine',   value: 'aquamarine' },
  { label: 'Topaz',        value: 'topaz' },
  { label: 'Chrysoberyl',  value: 'chrysoberyl' },
  { label: 'Zircon',       value: 'zircon' },
] as const;

export const GEMSTONE_VARIETIES = [
  { label: 'Blue Sapphire',          value: 'blue sapphire' },
  { label: 'Padparadscha Sapphire',  value: 'padparadscha sapphire' },
  { label: 'Pink Sapphire',          value: 'pink sapphire' },
  { label: 'Yellow Sapphire',        value: 'yellow sapphire' },
  { label: 'Green Sapphire',         value: 'green sapphire' },
  { label: 'White Sapphire',         value: 'white sapphire' },
  { label: 'Pigeon Blood Ruby',      value: 'pigeon blood ruby' },
  { label: 'Star Ruby',              value: 'star ruby' },
  { label: 'Tsavorite Garnet',       value: 'tsavorite garnet' },
  { label: 'Spessartite Garnet',     value: 'spessartite garnet' },
  { label: 'Rubellite Tourmaline',   value: 'rubellite tourmaline' },
  { label: 'Verdelite Tourmaline',   value: 'verdelite tourmaline' },
  { label: 'Indicolite Tourmaline',  value: 'indicolite tourmaline' },
  { label: 'Paraiba Tourmaline',     value: 'paraiba tourmaline' },
  { label: 'Alexandrite',            value: 'alexandrite' },
  { label: 'Cobalt Spinel',          value: 'cobalt spinel' },
] as const;

export const TREATMENT_OPTIONS = [
  { label: 'None / Unheated',          value: 'none / unheated' },
  { label: 'Heat Treated',             value: 'heat treated' },
  { label: 'Beryllium Treated',        value: 'beryllium treated' },
  { label: 'Fissure Filled / Oiled',   value: 'fissure filled / oiled' },
  { label: 'Irradiated',               value: 'irradiated' },
  { label: 'Diffusion Treated',        value: 'diffusion treated' },
  { label: 'Surface Coated',           value: 'surface coated' },
  { label: 'Unknown',                  value: 'unknown' },
] as const;

export const ORIGIN_OPTIONS = [
  { label: 'Madagascar (Ilakaka)',        value: 'madagascar (ilakaka)' },
  { label: 'Madagascar (Andranondambo)',  value: 'madagascar (andranondambo)' },
  { label: 'Madagascar (Didy)',           value: 'madagascar (didy)' },
  { label: 'Sri Lanka (Ratnapura)',       value: 'sri lanka (ratnapura)' },
  { label: 'Myanmar (Mogok)',             value: 'myanmar (mogok)' },
  { label: 'Kashmir (India)',             value: 'kashmir (india)' },
  { label: 'Tanzania (Tunduru)',          value: 'tanzania (tunduru)' },
  { label: 'Tanzania (Merelani)',         value: 'tanzania (merelani)' },
  { label: 'Colombia (Muzo)',             value: 'colombia (muzo)' },
  { label: 'Mozambique (Montepuez)',      value: 'mozambique (montepuez)' },
  { label: 'Brazil (Minas Gerais)',       value: 'brazil (minas gerais)' },
  { label: 'Thailand (Chanthaburi)',      value: 'thailand (chanthaburi)' },
  { label: 'Australia',                   value: 'australia' },
  { label: 'Unknown / Unspecified',       value: 'unknown / unspecified' },
] as const;

export const WEIGHT_UNITS = [
  { label: 'Carat (ct)',  value: 'ct' },
  { label: 'Gram (g)',    value: 'g' },
  { label: 'Ratti',       value: 'ratti' },
] as const;

export const SHAPE_OPTIONS = [
  { label: 'Cushion',         value: 'cushion' },
  { label: 'Oval',            value: 'oval' },
  { label: 'Round Brilliant', value: 'round brilliant' },
  { label: 'Emerald Cut',     value: 'emerald cut' },
  { label: 'Pear',            value: 'pear' },
  { label: 'Marquise',        value: 'marquise' },
  { label: 'Princess',        value: 'princess' },
  { label: 'Radiant',         value: 'radiant' },
  { label: 'Heart',           value: 'heart' },
  { label: 'Octagon',         value: 'octagon' },
  { label: 'Trillion',        value: 'trillion' },
  { label: 'Sugarloaf',       value: 'sugarloaf' },
  { label: 'Cabochon',        value: 'cabochon' },
] as const;

export const CUT_OPTIONS = [
  { label: 'Excellent',         value: 'excellent' },
  { label: 'Very Good',         value: 'very good' },
  { label: 'Good',              value: 'good' },
  { label: 'Fair',              value: 'fair' },
  { label: 'Step Cut',          value: 'step cut' },
  { label: 'Brilliant Cut',     value: 'brilliant cut' },
  { label: 'Mixed Cut',         value: 'mixed cut' },
  { label: 'Checkerboard Cut',  value: 'checkerboard cut' },
  { label: 'Cabochon',          value: 'cabochon' },
] as const;

export const COLOR_OPTIONS = [
  { label: 'Cornflower Blue',           value: 'cornflower blue' },
  { label: 'Royal Blue',                value: 'royal blue' },
  { label: 'Deep Velvet Blue',          value: 'deep velvet blue' },
  { label: 'Pigeon Blood Red',          value: 'pigeon blood red' },
  { label: 'Padparadscha (Pinkish-Orange)', value: 'padparadscha (pinkish-orange)' },
  { label: 'Vivid Pink',                value: 'vivid pink' },
  { label: 'Pastel Pink',               value: 'pastel pink' },
  { label: 'Vivid Canary Yellow',       value: 'vivid canary yellow' },
  { label: 'Vivid Emerald Green',       value: 'vivid emerald green' },
  { label: 'Teal / Peacock',            value: 'teal / peacock' },
  { label: 'Vivid Violet',              value: 'vivid violet' },
  { label: 'Color Change (Teal to Purple)', value: 'color change (teal to purple)' },
] as const;

export const CLARITY_OPTIONS = [
  { label: 'FL / IF (Flawless / Internally Flawless)',       value: 'fl / if (flawless / internally flawless)' },
  { label: 'VVS1 (Very Very Slightly Included 1)',           value: 'vvs1 (very very slightly included 1)' },
  { label: 'VVS2 (Very Very Slightly Included 2)',           value: 'vvs2 (very very slightly included 2)' },
  { label: 'VS1 (Very Slightly Included 1)',                 value: 'vs1 (very slightly included 1)' },
  { label: 'VS2 (Very Slightly Included 2)',                 value: 'vs2 (very slightly included 2)' },
  { label: 'SI1 (Slightly Included 1)',                      value: 'si1 (slightly included 1)' },
  { label: 'SI2 (Slightly Included 2)',                      value: 'si2 (slightly included 2)' },
  { label: 'Eye Clean',                                      value: 'eye clean' },
  { label: 'Moderately Included',                            value: 'moderately included' },
] as const;

export const CERTIFICATION_LABS = [
  { label: 'GIA (Gemological Institute of America)',  value: 'gia (gemological institute of america)' },
  { label: 'GRS (GemResearch Swisslab)',              value: 'grs (gemresearch swisslab)' },
  { label: 'SSEF (Swiss Gemmological Institute)',     value: 'ssef (swiss gemmological institute)' },
  { label: 'Gübelin Gem Lab',                         value: 'gübelin gem lab' },
  { label: 'IGI (International Gemological Institute)', value: 'igi (international gemological institute)' },
  { label: 'CGL (Ceylon Gem Laboratory)',             value: 'cgl (ceylon gem laboratory)' },
  { label: 'AIGS (Asian Institute of Gemological Sciences)', value: 'aigs (asian institute of gemological sciences)' },
  { label: 'Self-Certified / In-house',               value: 'self-certified / in-house' },
  { label: 'Uncertified',                             value: 'uncertified' },
] as const;

export const INDUSTRIAL_STONE_TYPES = [
  { label: 'Abrasive Corundum',  value: 'abrasive corundum' },
  { label: 'Industrial Diamond', value: 'industrial diamond' },
  { label: 'Quartz',             value: 'quartz' },
  { label: 'Feldspar',           value: 'feldspar' },
  { label: 'Silicon Carbide',    value: 'silicon carbide' },
  { label: 'Garnet Abrasive',    value: 'garnet abrasive' },
  { label: 'Kyanite',            value: 'kyanite' },
  { label: 'Graphite',           value: 'graphite' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { label: 'Cash',           value: 'cash' },
  { label: 'Mobile Money',   value: 'mobile_money' },
  { label: 'Bank Transfer',  value: 'bank_transfer' },
] as const;

export const COLLECTION_STATUS_OPTIONS = [
  { label: 'All Status',  value: 'ALL' },
  { label: 'In Review',   value: 'review' },
  { label: 'Accepted',    value: 'accepted' },
] as const;

/* ── TypeScript helpers ───────────────────────────────────────────────────── */

/** Extract the union of value strings from a constant array */
export type OptionValue<T extends ReadonlyArray<{ label: string; value: string }>> =
  T[number]['value'];

export type GemstoneTypeValue       = OptionValue<typeof GEMSTONE_TYPES>;
export type TreatmentValue          = OptionValue<typeof TREATMENT_OPTIONS>;
export type OriginValue             = OptionValue<typeof ORIGIN_OPTIONS>;
export type WeightUnitValue         = OptionValue<typeof WEIGHT_UNITS>;
export type ShapeValue              = OptionValue<typeof SHAPE_OPTIONS>;
export type CutValue                = OptionValue<typeof CUT_OPTIONS>;
export type ColorValue              = OptionValue<typeof COLOR_OPTIONS>;
export type ClarityValue            = OptionValue<typeof CLARITY_OPTIONS>;
export type CertificationLabValue   = OptionValue<typeof CERTIFICATION_LABS>;
export type IndustrialStoneValue    = OptionValue<typeof INDUSTRIAL_STONE_TYPES>;
