/**
 * Property wire-shape serializers.
 *
 * Every property-returning service method funnels its Prisma row(s)
 * through one of these adapters before returning. The output shape is
 * declared in `@homeai/contracts/property.contract` so the frontend can
 * import the exact wire type. Closes plan section B (response-shape
 * drift) and supersedes the frontend `transforms.ts` bridge.
 */

import type { Prisma } from '@prisma/client';
import type {
    WireProperty,
    WirePropertyAddress,
    WirePropertyMedia,
    WirePropertyOwner,
    WirePropertySummary,
} from '@homeai/contracts/property.contract';

const DEFAULT_COUNTRY = 'NG';

const decimalToNumber = (value: Prisma.Decimal | number | null | undefined): number | null => {
    if (value === null || value === undefined) return null;
    return typeof value === 'number' ? value : Number(value);
};

const nestAddress = (row: {
    addressStreet?: string | null;
    addressCity?: string | null;
    addressState?: string | null;
    addressLga?: string | null;
    addressNeighborhood?: string | null;
    addressZip?: string | null;
    latitude?: Prisma.Decimal | number | null;
    longitude?: Prisma.Decimal | number | null;
    regionCode?: string | null;
}): WirePropertyAddress => ({
    street: row.addressStreet ?? null,
    city: row.addressCity ?? null,
    state: row.addressState ?? null,
    lga: row.addressLga ?? null,
    neighborhood: row.addressNeighborhood ?? null,
    postalCode: row.addressZip ?? null,
    country: row.regionCode ?? DEFAULT_COUNTRY,
    latitude: decimalToNumber(row.latitude),
    longitude: decimalToNumber(row.longitude),
});

const deriveIsVerified = (tier: string): boolean => tier !== 'UNVERIFIED';

const mediaToWire = (
    media: Array<{
        id: string;
        url: string;
        type: string;
        isPrimary: boolean;
        caption: string | null;
        orderIndex: number;
        metadata: Prisma.JsonValue | null;
    }>
): WirePropertyMedia[] =>
    media.map(m => ({
        id: m.id,
        url: m.url,
        type: m.type as WirePropertyMedia['type'],
        isPrimary: m.isPrimary,
        caption: m.caption,
        orderIndex: m.orderIndex,
        metadata: m.metadata,
    }));

const ownerToWire = (owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    verificationLevel: string;
}): WirePropertyOwner => ({
    id: owner.id,
    firstName: owner.firstName,
    lastName: owner.lastName,
    avatarUrl: owner.avatarUrl,
    verificationLevel: owner.verificationLevel as WirePropertyOwner['verificationLevel'],
});

/**
 * Prisma row shape required by `serializeProperty`. Callers must
 * `include: { media: ..., owner: { select: ... } }` so this shape
 * is satisfied.
 */
type PrismaPropertyForSerialize = {
    id: string;
    name: string;
    description: string | null;
    propertyType: string;
    listingType: string;
    status: string;
    price: Prisma.Decimal | number;
    priceUnit: string;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    yearBuilt: number | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressState: string | null;
    addressLga: string | null;
    addressNeighborhood: string | null;
    addressZip: string | null;
    latitude: Prisma.Decimal | number | null;
    longitude: Prisma.Decimal | number | null;
    amenities: string[];
    verificationTier: string;
    regionCode?: string | null;
    createdAt: Date;
    updatedAt: Date;
    media: Array<{
        id: string;
        url: string;
        type: string;
        isPrimary: boolean;
        caption: string | null;
        orderIndex: number;
        metadata: Prisma.JsonValue | null;
    }>;
    owner: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
        verificationLevel: string;
    };
};

export const serializeProperty = (property: PrismaPropertyForSerialize): WireProperty => ({
    id: property.id,
    name: property.name,
    description: property.description,
    propertyType: property.propertyType as WireProperty['propertyType'],
    listingType: property.listingType as WireProperty['listingType'],
    status: property.status as WireProperty['status'],
    price: Number(property.price),
    priceUnit: property.priceUnit as WireProperty['priceUnit'],
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet,
    yearBuilt: property.yearBuilt,
    amenities: property.amenities,
    verificationTier: property.verificationTier as WireProperty['verificationTier'],
    isVerified: deriveIsVerified(property.verificationTier),
    address: nestAddress(property),
    media: mediaToWire(property.media),
    owner: ownerToWire(property.owner),
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
});

/**
 * Prisma row shape required by `serializePropertySummary`. Callers use
 * a narrower `select` so only the summary-relevant columns are loaded.
 */
type PrismaPropertyForSummary = {
    id: string;
    name: string;
    propertyType: string;
    listingType: string;
    status: string;
    price: Prisma.Decimal | number;
    priceUnit: string;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet?: number | null;
    addressStreet?: string | null;
    addressCity: string | null;
    addressState: string | null;
    addressNeighborhood: string | null;
    regionCode?: string | null;
    verificationTier: string;
    createdAt: Date;
    media?: Array<{ url: string }>;
    /** Optional pre-computed primary image url (some Prisma queries derive it inline). */
    primaryImage?: string | null;
};

export const serializePropertySummary = (
    property: PrismaPropertyForSummary
): WirePropertySummary => {
    const primaryImage =
        property.primaryImage !== undefined
            ? property.primaryImage
            : property.media?.[0]?.url ?? null;

    return {
        id: property.id,
        name: property.name,
        propertyType: property.propertyType as WirePropertySummary['propertyType'],
        listingType: property.listingType as WirePropertySummary['listingType'],
        status: property.status as WirePropertySummary['status'],
        price: Number(property.price),
        priceUnit: property.priceUnit as WirePropertySummary['priceUnit'],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet ?? null,
        address: {
            street: property.addressStreet ?? null,
            city: property.addressCity,
            state: property.addressState,
            neighborhood: property.addressNeighborhood,
            country: property.regionCode ?? DEFAULT_COUNTRY,
        },
        primaryImage,
        verificationTier: property.verificationTier as WirePropertySummary['verificationTier'],
        isVerified: deriveIsVerified(property.verificationTier),
        createdAt: property.createdAt.toISOString(),
    };
};
