import type { Listing, Property } from "@workspace/shared";

/**
 * In-memory sample data so the API responds before a database is provisioned.
 * Shapes are the real @workspace/shared types, so swapping these for Drizzle
 * queries later is a drop-in change with no contract drift.
 */

const NOW = "2026-01-01T00:00:00.000Z";
const ORG = "00000000-0000-0000-0000-000000000001";
const OWNER = "00000000-0000-0000-0000-0000000000a1";

export const properties: Property[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    organizationId: ORG,
    ownerId: OWNER,
    address: { line1: "1042 Guerrero St", city: "San Francisco", state: "CA", postalCode: "94110" },
    unit: "2",
    type: "apartment",
    beds: 2,
    baths: 1,
    sqft: 900,
    status: "listed",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    organizationId: ORG,
    ownerId: OWNER,
    address: { line1: "88 Prospect Ave", city: "Oakland", state: "CA", postalCode: "94610" },
    type: "condo",
    beds: 1,
    baths: 1,
    sqft: 620,
    status: "listed",
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const listings: Listing[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    propertyId: "10000000-0000-0000-0000-000000000001",
    priceCents: 3_200_00,
    forSale: false,
    criteria: {
      minIncomeMultiple: 2.5,
      minCreditScore: 680,
      vouchersAccepted: true,
      notes: "Posted criteria frozen at publish per AB 2493.",
    },
    photoUrls: [],
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    propertyId: "10000000-0000-0000-0000-000000000002",
    priceCents: 2_450_00,
    forSale: false,
    criteria: {
      minIncomeMultiple: 2.5,
      vouchersAccepted: true,
    },
    photoUrls: [],
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
];
