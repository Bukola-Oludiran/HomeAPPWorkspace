/**
 * properties bundle — public read (search, getById) + landlord/tenant
 * scoped reads (listMine, favorites).
 *
 * IDOR posture: tools that produce "my X" results MUST scope by
 * ctx.user.userId, never by an LLM-provided id. Public reads
 * (search, getById on an active listing) need no user scoping but still
 * project through PropertyCard to keep the response PII-bounded.
 */

import { z } from 'zod';
import {
    ListingTypeValues,
    PropertyStatusValues,
    PropertyTypeValues,
    VerificationTierValues,
} from '@homeai/contracts/enums';
import type {
    PropertyCardProps,
    PropertyGridProps,
} from '@homeai/contracts/ui-fragments';
import { prismaReadonly } from '../../db/client';
import type { ToolBundle } from '../types';
import { defineLocalTool } from '../types';

// ============================================
// shared projection
// ============================================

type PropertyForCard = {
    id: string;
    name: string;
    propertyType: string;
    listingType: string;
    addressCity: string | null;
    addressState: string | null;
    price: { toString(): string } | number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    verificationTier: string;
    media: { url: string }[];
};

function toCard(p: PropertyForCard): PropertyCardProps {
    const tier = VerificationTierValues.includes(p.verificationTier as never)
        ? (p.verificationTier as PropertyCardProps['verificationTier'])
        : 'UNVERIFIED';
    return {
        propertyId: p.id,
        title: p.name,
        propertyType: p.propertyType as PropertyCardProps['propertyType'],
        listingType: p.listingType as PropertyCardProps['listingType'],
        city: p.addressCity ?? '—',
        area: p.addressState ?? undefined,
        price: { amount: Number(p.price ?? 0), currency: 'NGN' },
        bedrooms: p.bedrooms ?? undefined,
        bathrooms: p.bathrooms ?? undefined,
        heroImageUrl: p.media[0]?.url ?? null,
        verificationTier: tier,
        actions: [
            { id: 'view', label: 'View details', kind: 'primary' as const },
            { id: 'save', label: 'Save', kind: 'secondary' as const },
        ],
    };
}

const heroInclude = {
    media: {
        where: { type: 'IMAGE' as const },
        take: 1,
        orderBy: [{ isPrimary: 'desc' as const }, { orderIndex: 'asc' as const }],
    },
};

// ============================================
// properties.search
// ============================================

const searchParams = z.object({
    propertyType: z.enum(PropertyTypeValues).optional(),
    listingType: z.enum(ListingTypeValues).optional(),
    city: z.string().min(1).max(80).optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    limit: z.number().int().min(1).max(25).default(10),
});

const search = defineLocalTool({
    name: 'properties.search',
    label: 'Search properties',
    description:
        'Search active property listings by type, city, price, bedrooms. Public reads — no user scoping. Returns a PropertyGrid fragment.',
    parameters: searchParams,
    async execute(params, ctx, sink) {
        const where: Record<string, unknown> = { status: 'ACTIVE' };
        if (params.propertyType) where.propertyType = params.propertyType;
        if (params.listingType) where.listingType = params.listingType;
        if (params.city)
            where.addressCity = { contains: params.city, mode: 'insensitive' };
        if (params.bedrooms !== undefined) where.bedrooms = params.bedrooms;
        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            where.price = {
                ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
                ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            };
        }

        const [items, total] = await Promise.all([
            prismaReadonly.property.findMany({
                where: where as never,
                take: params.limit,
                orderBy: { createdAt: 'desc' },
                include: heroInclude,
            }),
            prismaReadonly.property.count({ where: where as never }),
        ]);

        const cards = items.map(toCard);
        const grid: PropertyGridProps = {
            items: cards,
            total,
            note:
                cards.length === 0
                    ? 'No matching properties — try widening the filters.'
                    : undefined,
        };
        sink.ui({ type: 'PropertyGrid', props: grid });

        return {
            text: `Found ${cards.length} of ${total} matching properties.`,
            details: { count: cards.length, total, queriedBy: ctx.user.userId },
        };
    },
});

// ============================================
// properties.getById
// ============================================

const getByIdParams = z.object({
    propertyId: z.string().uuid(),
});

const getById = defineLocalTool({
    name: 'properties.getById',
    label: 'Get property details',
    description:
        'Fetch full details for a single property by id. Returns a PropertyCard fragment.',
    parameters: getByIdParams,
    async execute({ propertyId }, ctx, sink) {
        const p = await prismaReadonly.property.findUnique({
            where: { id: propertyId },
            include: heroInclude,
        });
        if (!p || p.status !== 'ACTIVE') {
            return {
                text: `Property ${propertyId} not found or not currently listed.`,
                ui: {
                    type: 'ErrorCard',
                    props: {
                        title: 'Property not found',
                        message: 'This property is not currently listed.',
                        code: 'PROP_001',
                    },
                },
            };
        }

        sink.ui({ type: 'PropertyCard', props: toCard(p) });
        return {
            text: `${p.name} in ${p.addressCity ?? '—'}, ${p.bedrooms ?? '?'} bed, ₦${Number(p.price).toLocaleString()}.`,
            details: { propertyId: p.id, queriedBy: ctx.user.userId },
        };
    },
});

// ============================================
// properties.listMine (landlord)
// ============================================

const listMineParams = z.object({
    status: z.enum(PropertyStatusValues).optional(),
    limit: z.number().int().min(1).max(50).default(20),
});

const listMine = defineLocalTool({
    name: 'properties.listMine',
    label: 'List my properties',
    description:
        'List properties owned by the authenticated landlord. Scoped by ctx.user.userId regardless of LLM-supplied filters.',
    parameters: listMineParams,
    async execute(params, ctx, sink) {
        // IDOR guard: ownerId comes from ctx, NOT from params.
        const where: Record<string, unknown> = { ownerId: ctx.user.userId };
        if (params.status) where.status = params.status;

        const items = await prismaReadonly.property.findMany({
            where: where as never,
            take: params.limit,
            orderBy: { createdAt: 'desc' },
            include: heroInclude,
        });

        const cards = items.map(toCard);
        const grid: PropertyGridProps = {
            items: cards,
            total: cards.length,
            note: cards.length === 0 ? 'You have no properties yet.' : undefined,
        };
        sink.ui({ type: 'PropertyGrid', props: grid });
        return {
            text: `You have ${cards.length} ${params.status ?? 'total'} property listing(s).`,
            details: { count: cards.length, ownedBy: ctx.user.userId },
        };
    },
});

// ============================================
// properties.favorites (tenant)
// ============================================

const favoritesParams = z.object({
    limit: z.number().int().min(1).max(50).default(20),
});

const favorites = defineLocalTool({
    name: 'properties.favorites',
    label: 'My favorite properties',
    description:
        'List properties the authenticated user has saved to favorites. Scoped by ctx.user.userId.',
    parameters: favoritesParams,
    async execute(params, ctx, sink) {
        const favs = await prismaReadonly.favorite.findMany({
            where: { userId: ctx.user.userId },
            take: params.limit,
            orderBy: { createdAt: 'desc' },
            include: { property: { include: heroInclude } },
        });

        const cards = favs
            .filter((f) => f.property.status === 'ACTIVE')
            .map((f) => toCard(f.property));

        const grid: PropertyGridProps = {
            items: cards,
            total: favs.length,
            note: cards.length === 0 ? 'No saved properties yet.' : undefined,
        };
        sink.ui({ type: 'PropertyGrid', props: grid });
        return {
            text: `You have ${cards.length} saved properties.`,
            details: { count: cards.length, userId: ctx.user.userId },
        };
    },
});

export const propertiesBundle: ToolBundle = {
    name: 'properties',
    description:
        'Search active listings, view details, and manage favorited / owned properties.',
    eligibleRoles: ['TENANT', 'LANDLORD', 'AGENT', 'ADMIN'],
    readTools: [search, getById, listMine, favorites],
    writeTools: [],
};
