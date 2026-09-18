import { DistrictInfo } from '../types';

export const SINGAPORE_DISTRICTS: DistrictInfo[] = [
  { code: 'D01', name: 'Raffles Place, Marina Bay, Suntec, Cecil', region: 'CCR', postalSectors: ['01', '02', '03', '04', '05', '06'] },
  { code: 'D02', name: 'Tanjong Pagar, Chinatown, Anson, Shenton Way', region: 'CCR', postalSectors: ['07', '08'] },
  { code: 'D03', name: 'Queenstown, Tiong Bahru, Alexandra', region: 'RCR', postalSectors: ['14', '15', '16'] },
  { code: 'D04', name: 'Telok Blangah, Harbourfront, Sentosa Cove', region: 'CCR', postalSectors: ['09', '10'] },
  { code: 'D05', name: 'Buona Vista, West Coast, Clementi New Town', region: 'RCR', postalSectors: ['11', '12', '13'] },
  { code: 'D06', name: 'City Hall, Clarke Quay, High Street', region: 'CCR', postalSectors: ['17'] },
  { code: 'D07', name: 'Bugis, Rochor, Beach Road, Middle Road', region: 'RCR', postalSectors: ['18', '19'] },
  { code: 'D08', name: 'Farrer Park, Little India, Serangoon Road', region: 'RCR', postalSectors: ['20', '21'] },
  { code: 'D09', name: 'Orchard, Cairnhill, River Valley', region: 'CCR', postalSectors: ['22', '23'] },
  { code: 'D10', name: 'Bukit Timah, Holland, Tanglin, Balmoral', region: 'CCR', postalSectors: ['24', '25', '26', '27'] },
  { code: 'D11', name: 'Newton, Novena, Dunearn, Watten', region: 'CCR', postalSectors: ['28', '29', '30'] },
  { code: 'D12', name: 'Balestier, Toa Payoh, Serangoon', region: 'RCR', postalSectors: ['31', '32', '33'] },
  { code: 'D13', name: 'Macpherson, Potong Pasir, Braddell', region: 'RCR', postalSectors: ['34', '35', '36', '37'] },
  { code: 'D14', name: 'Geylang, Paya Lebar, Eunos, Sims', region: 'RCR', postalSectors: ['38', '39', '40', '41'] },
  { code: 'D15', name: 'East Coast, Marine Parade, Katong, Tanjong Rhu', region: 'RCR', postalSectors: ['42', '43', '44', '45'] },
  { code: 'D16', name: 'Bedok, Upper East Coast, Bayshore, Eastwood', region: 'OCR', postalSectors: ['46', '47', '48'] },
  { code: 'D17', name: 'Changi, Loyang, Flora Drive', region: 'OCR', postalSectors: ['49', '50'] },
  { code: 'D18', name: 'Pasir Ris, Tampines', region: 'OCR', postalSectors: ['51', '52'] },
  { code: 'D19', name: 'Serangoon Garden, Hougang, Punggol, Sengkang', region: 'OCR', postalSectors: ['53', '54', '55', '82'] },
  { code: 'D20', name: 'Bishan, Ang Mo Kio, Thomson', region: 'RCR', postalSectors: ['56', '57'] },
  { code: 'D21', name: 'Upper Bukit Timah, Clementi Park, Ulu Pandan', region: 'RCR', postalSectors: ['58', '59'] },
  { code: 'D22', name: 'Jurong, Boon Lay, Tuas', region: 'OCR', postalSectors: ['60', '61', '62', '63', '64'] },
  { code: 'D23', name: 'Bukit Batok, Bukit Panjang, Choa Chu Kang, Hillview', region: 'OCR', postalSectors: ['65', '66', '67', '68'] },
  { code: 'D24', name: 'Lim Chu Kang, Tengah', region: 'OCR', postalSectors: ['69', '70', '71'] },
  { code: 'D25', name: 'Woodlands, Admiralty', region: 'OCR', postalSectors: ['72', '73'] },
  { code: 'D26', name: 'Mandai, Upper Thomson, Springleaf', region: 'OCR', postalSectors: ['77', '78'] },
  { code: 'D27', name: 'Yishun, Sembawang', region: 'OCR', postalSectors: ['75', '76'] },
  { code: 'D28', name: 'Seletar, Yio Chu Kang', region: 'OCR', postalSectors: ['79', '80'] },
];

export const PROPERTY_TYPES = [
  'Condominium',
  'Apartment',
  'Executive Condominium',
  'Terrace House',
  'Semi-Detached House',
  'Detached House',
  'Good Class Bungalow',
  'Strata Landed',
] as const;

export const TENURE_TYPES = [
  'Freehold',
  '99-year Leasehold',
  '999-year Leasehold',
] as const;

export const SALE_TYPES = [
  'New Sale',
  'Resale',
  'Sub Sale',
] as const;

export const REGION_DESCRIPTIONS: Record<string, { label: string; desc: string; badgeColor: string }> = {
  CCR: {
    label: 'Core Central Region (CCR)',
    desc: 'Prime luxury and high-end core (Districts 9, 10, 11, Downtown Core, Sentosa)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700',
  },
  RCR: {
    label: 'Rest of Central Region (RCR)',
    desc: 'City fringes and mid-tier prime precincts (Districts 3, 4, 5, 7, 8, 12, 13, 14, 15, 20)',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700',
  },
  OCR: {
    label: 'Outside Central Region (OCR)',
    desc: 'Suburban mass market residential zones (Districts 16-19, 22-28)',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700',
  },
};
