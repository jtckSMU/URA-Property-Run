import { PropertyTransaction } from '../types';

/**
 * Standard API Request & Response Schemas for Singapore Private Property Prices.
 * Developers can wire their backend (e.g. Express, FastAPI, URA API proxy, Spring Boot, etc.)
 * to return this structure.
 */

export const SAMPLE_API_TRANSACTION: PropertyTransaction = {
  id: 'SG-TX-2024-88912',
  projectName: 'THE SAIL @ MARINA BAY',
  streetName: 'MARINA BOULEVARD',
  district: 'D01',
  marketSegment: 'CCR',
  propertyType: 'Condominium',
  transactedPrice: 2450000,
  areaSqft: 936,
  areaSqm: 87,
  unitPricePsf: 2617,
  unitPricePsm: 28160,
  contractDate: '2024-05',
  tenure: '99-year Leasehold',
  leaseStartDate: '2002',
  floorRange: '36 to 40',
  typeOfSale: 'Resale',
  numberOfUnits: 1,
  postalCode: '018981',
  developer: 'City Developments Limited',
};

export const SAMPLE_API_RESPONSE_PAYLOAD = {
  status: 'success',
  meta: {
    totalRecords: 5,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    timestamp: '2024-06-01T12:00:00Z',
    source: 'Private Property Transaction Feed',
  },
  data: [
    {
      id: 'SG-TX-2024-88912',
      projectName: 'THE SAIL @ MARINA BAY',
      streetName: 'MARINA BOULEVARD',
      district: 'D01',
      marketSegment: 'CCR',
      propertyType: 'Condominium',
      transactedPrice: 2450000,
      areaSqft: 936,
      areaSqm: 87,
      unitPricePsf: 2617,
      unitPricePsm: 28160,
      contractDate: '2024-05',
      tenure: '99-year Leasehold',
      floorRange: '36 to 40',
      typeOfSale: 'Resale',
      numberOfUnits: 1,
      postalCode: '018981',
    },
    {
      id: 'SG-TX-2024-91204',
      projectName: 'LEEDON GREEN',
      streetName: 'LEEDON HEIGHTS',
      district: 'D10',
      marketSegment: 'CCR',
      propertyType: 'Condominium',
      transactedPrice: 3180000,
      areaSqft: 1044,
      areaSqm: 97,
      unitPricePsf: 3046,
      unitPricePsm: 32783,
      contractDate: '2024-05',
      tenure: 'Freehold',
      floorRange: '06 to 10',
      typeOfSale: 'New Sale',
      numberOfUnits: 1,
      postalCode: '267939',
    },
    {
      id: 'SG-TX-2024-93441',
      projectName: 'AMBER PARK',
      streetName: 'AMBER GARDENS',
      district: 'D15',
      marketSegment: 'RCR',
      propertyType: 'Apartment',
      transactedPrice: 2890000,
      areaSqft: 1109,
      areaSqm: 103,
      unitPricePsf: 2605,
      unitPricePsm: 28058,
      contractDate: '2024-04',
      tenure: 'Freehold',
      floorRange: '16 to 20',
      typeOfSale: 'Resale',
      numberOfUnits: 1,
      postalCode: '439973',
    },
    {
      id: 'SG-TX-2024-94552',
      projectName: 'LENTOR MODERN',
      streetName: 'LENTOR CENTRAL',
      district: 'D26',
      marketSegment: 'OCR',
      propertyType: 'Condominium',
      transactedPrice: 1980000,
      areaSqft: 969,
      areaSqm: 90,
      unitPricePsf: 2043,
      unitPricePsm: 22000,
      contractDate: '2024-04',
      tenure: '99-year Leasehold',
      floorRange: '11 to 15',
      typeOfSale: 'New Sale',
      numberOfUnits: 1,
      postalCode: '785312',
    },
    {
      id: 'SG-TX-2024-95880',
      projectName: 'TREASURE AT TAMPINES',
      streetName: 'TAMPINES LANE',
      district: 'D18',
      marketSegment: 'OCR',
      propertyType: 'Condominium',
      transactedPrice: 1560000,
      areaSqft: 915,
      areaSqm: 85,
      unitPricePsf: 1705,
      unitPricePsm: 18352,
      contractDate: '2024-03',
      tenure: '99-year Leasehold',
      floorRange: '06 to 10',
      typeOfSale: 'Resale',
      numberOfUnits: 1,
      postalCode: '528416',
    },
  ],
};

export const OPENAPI_SPEC_YAML = `openapi: 3.0.3
info:
  title: Singapore Private Property Prices API
  version: 1.0.0
  description: Endpoints for Singapore private residential property transaction prices, PSF trends, and district stats.
servers:
  - url: /api/properties
    description: Local or proxied property backend
paths:
  /transactions:
    get:
      summary: Get private property transactions
      description: Returns transacted Singapore private property records filtered by district, region, property type, and price.
      parameters:
        - name: district
          in: query
          schema:
            type: string
            example: D10
        - name: marketSegment
          in: query
          schema:
            type: string
            enum: [CCR, RCR, OCR]
        - name: propertyType
          in: query
          schema:
            type: string
            example: Condominium
        - name: minPrice
          in: query
          schema:
            type: integer
        - name: maxPrice
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Successful query
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/PropertyTransaction'
  /stats/summary:
    get:
      summary: Get market overview metrics
      responses:
        '200':
          description: Overall median price, PSF, and transaction count
  /ping:
    get:
      summary: Health check / ping
      responses:
        '200':
          description: Service active`;
