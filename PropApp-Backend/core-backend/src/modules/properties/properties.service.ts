/**
 * Property Service
 * Handles property CRUD, search, drafts, and images
 * Per PRD Section 8
 */

import { MediaType, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import {
    PropertyNotFoundError,
    NotPropertyOwnerError,
    ValidationError,
} from '../../common/utils/errors';
import {
    CreatePropertyDto,
    UpdatePropertyDto,
    UpdatePropertyStatusDto,
    CreateDraftDto,
    UpdateDraftDto,
    SearchPropertiesDto,
    NearbyPropertiesDto,
} from './properties.dto';
import { serializeProperty, serializePropertySummary } from './properties.serializer';
import type {
    WireProperty,
    WirePropertySummary,
} from '@homeai/contracts/property.contract';

// ============================================
// TYPES
// ============================================

interface PropertyListResult {
    properties: WirePropertySummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Selection passed to every Prisma `findFirst` / `findMany` / `create`
 * that hands its row to `serializeProperty()`. Keep in sync with the
 * `PrismaPropertyForSerialize` type in `properties.serializer.ts`.
 */
const propertyDetailInclude = {
    media: { orderBy: { orderIndex: 'asc' as const } },
    owner: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            verificationLevel: true,
        },
    },
} satisfies Prisma.PropertyInclude;

/**
 * Selection passed to every Prisma `findMany` whose rows are mapped
 * through `serializePropertySummary()`.
 */
const propertySummarySelect = {
    id: true,
    name: true,
    propertyType: true,
    listingType: true,
    price: true,
    priceUnit: true,
    bedrooms: true,
    bathrooms: true,
    squareFeet: true,
    addressStreet: true,
    addressCity: true,
    addressState: true,
    addressNeighborhood: true,
    regionCode: true,
    verificationTier: true,
    status: true,
    createdAt: true,
    media: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
    },
} satisfies Prisma.PropertySelect;

// ============================================
// PROPERTY SERVICE CLASS
// ============================================

class PropertyService {
    // ----------------------------------------
    // PUBLIC ENDPOINTS
    // ----------------------------------------

    /**
     * List properties with filters
     * GET /api/v1/properties
     */
    async listProperties(filters: SearchPropertiesDto): Promise<PropertyListResult> {
        const {
            propertyType,
            listingType,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            city,
            state,
            lga,
            neighborhood,
            verificationTier,
            page,
            limit,
            sortBy,
            sortOrder,
        } = filters;

        // Build where clause
        const where: Prisma.PropertyWhereInput = {
            status: 'ACTIVE',
        };

        if (propertyType) {
            where.propertyType = Array.isArray(propertyType)
                ? { in: propertyType }
                : propertyType;
        }
        if (listingType) where.listingType = listingType;
        if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };
        if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms };
        if (city) where.addressCity = { contains: city, mode: 'insensitive' };
        if (state) where.addressState = { contains: state, mode: 'insensitive' };
        if (lga) where.addressLga = { contains: lga, mode: 'insensitive' };
        if (neighborhood) where.addressNeighborhood = { contains: neighborhood, mode: 'insensitive' };
        if (verificationTier) where.verificationTier = verificationTier;

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        // Build orderBy
        const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder;
        } else {
            orderBy.createdAt = 'desc';
        }

        // Execute query
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                select: propertySummarySelect,
            }),
            prisma.property.count({ where }),
        ]);

        return {
            properties: properties.map(serializePropertySummary),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get property by ID
     * GET /api/v1/properties/:id
     */
    async getPropertyById(propertyId: string, includeInactive = false): Promise<WireProperty> {
        const where: Prisma.PropertyWhereInput = { id: propertyId };
        if (!includeInactive) {
            where.status = { not: 'DELISTED' };
        }

        const property = await prisma.property.findFirst({
            where,
            include: propertyDetailInclude,
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        return serializeProperty(property);
    }

    /**
     * Search properties (with text search)
     * GET /api/v1/properties/search
     */
    async searchProperties(filters: SearchPropertiesDto): Promise<PropertyListResult> {
        // For now, use database search
        // TODO: Integrate Elasticsearch per PRD 8.2

        const { query, ...otherFilters } = filters;

        if (query) {
            const result = await this.listProperties({
                ...otherFilters,
                page: filters.page,
                limit: filters.limit,
            });

            const needle = query.toLowerCase();
            result.properties = result.properties.filter(p =>
                p.name.toLowerCase().includes(needle) ||
                p.address.city?.toLowerCase().includes(needle) ||
                p.address.neighborhood?.toLowerCase().includes(needle)
            );
            result.total = result.properties.length;
            result.totalPages = Math.ceil(result.total / filters.limit);

            return result;
        }

        return this.listProperties(filters);
    }

    /**
     * Get featured properties
     * GET /api/v1/properties/featured
     */
    async getFeaturedProperties(limit = 10): Promise<WirePropertySummary[]> {
        const properties = await prisma.property.findMany({
            where: {
                status: 'ACTIVE',
                verificationTier: { in: ['GOLD', 'PLATINUM'] },
            },
            orderBy: [
                { verificationTier: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit,
            select: propertySummarySelect,
        });

        return properties.map(serializePropertySummary);
    }

    /**
     * Get nearby properties
     * GET /api/v1/properties/nearby
     */
    async getNearbyProperties(params: NearbyPropertiesDto): Promise<WirePropertySummary[]> {
        const { latitude, longitude, radius, limit } = params;

        // Simple distance calculation using Haversine formula
        // For production, use PostGIS or Elasticsearch geo queries
        const properties = await prisma.property.findMany({
            where: {
                status: 'ACTIVE',
                latitude: { not: null },
                longitude: { not: null },
            },
            select: {
                ...propertySummarySelect,
                latitude: true,
                longitude: true,
            },
        });

        const propertiesWithDistance = properties
            .map(p => ({
                row: p,
                distance: this.calculateDistance(
                    latitude,
                    longitude,
                    Number(p.latitude),
                    Number(p.longitude)
                ),
            }))
            .filter(p => p.distance <= radius)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);

        return propertiesWithDistance.map(p => serializePropertySummary(p.row));
    }

    // ----------------------------------------
    // LANDLORD ENDPOINTS
    // ----------------------------------------

    /**
     * Create property
     * POST /api/v1/properties
     */
    async createProperty(ownerId: string, data: CreatePropertyDto): Promise<WireProperty> {
        const property = await prisma.property.create({
            data: {
                ...data,
                ownerId,
                status: 'PENDING_REVIEW',
                amenities: data.amenities || [],
            },
            include: propertyDetailInclude,
        });

        logger.info(`Property created: ${property.id} by ${ownerId}`);

        return serializeProperty(property);
    }

    /**
     * Update property
     * PUT /api/v1/properties/:id
     */
    async updateProperty(
        propertyId: string,
        ownerId: string,
        data: UpdatePropertyDto
    ): Promise<WireProperty> {
        await this.verifyOwnership(propertyId, ownerId);

        const property = await prisma.property.update({
            where: { id: propertyId },
            data: {
                ...data,
                amenities: data.amenities,
            },
            include: propertyDetailInclude,
        });

        logger.info(`Property updated: ${propertyId}`);

        return serializeProperty(property);
    }

    /**
     * Delete property (soft delete)
     * DELETE /api/v1/properties/:id
     */
    async deleteProperty(propertyId: string, ownerId: string): Promise<{ message: string }> {
        await this.verifyOwnership(propertyId, ownerId);

        await prisma.property.update({
            where: { id: propertyId },
            data: { status: 'DELISTED' },
        });

        logger.info(`Property deleted: ${propertyId}`);

        return { message: 'Property deleted successfully' };
    }

    /**
     * Update property status
     * PATCH /api/v1/properties/:id/status
     */
    async updatePropertyStatus(
        propertyId: string,
        ownerId: string,
        data: UpdatePropertyStatusDto
    ): Promise<{ status: string }> {
        await this.verifyOwnership(propertyId, ownerId);

        await prisma.property.update({
            where: { id: propertyId },
            data: { status: data.status },
        });

        logger.info(`Property status updated: ${propertyId} -> ${data.status}`);

        return { status: data.status };
    }

    // ----------------------------------------
    // DRAFT/WIZARD ENDPOINTS
    // ----------------------------------------

    /**
     * Create draft property
     * POST /api/v1/properties/draft
     */
    async createDraft(ownerId: string, data: CreateDraftDto): Promise<WireProperty> {
        const property = await prisma.property.create({
            data: {
                ownerId,
                name: data.name || 'Untitled Property',
                propertyType: data.propertyType || 'APARTMENT',
                listingType: data.listingType || 'RENT',
                price: data.price || 0,
                priceUnit: data.priceUnit || 'PER_MONTH',
                description: data.description,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                squareFeet: data.squareFeet,
                yearBuilt: data.yearBuilt,
                addressStreet: data.addressStreet,
                addressCity: data.addressCity,
                addressState: data.addressState,
                addressZip: data.addressZip,
                addressLga: data.addressLga,
                addressNeighborhood: data.addressNeighborhood,
                latitude: data.latitude,
                longitude: data.longitude,
                amenities: data.amenities || [],
                status: 'DRAFT',
            },
            include: propertyDetailInclude,
        });

        logger.info(`Draft created: ${property.id}`);

        return serializeProperty(property);
    }

    /**
     * Update draft property
     * PUT /api/v1/properties/draft/:id
     */
    async updateDraft(
        propertyId: string,
        ownerId: string,
        data: UpdateDraftDto
    ): Promise<WireProperty> {
        const property = await this.verifyOwnership(propertyId, ownerId);

        if (property.status !== 'DRAFT') {
            throw new ValidationError('Only draft properties can be updated via this endpoint', [
                { field: 'status', message: 'Property is not a draft' },
            ]);
        }

        return this.updateProperty(propertyId, ownerId, data);
    }

    /**
     * Publish draft
     * POST /api/v1/properties/draft/:id/publish
     */
    async publishDraft(propertyId: string, ownerId: string): Promise<WireProperty> {
        const property = await this.verifyOwnership(propertyId, ownerId);

        if (property.status !== 'DRAFT') {
            throw new ValidationError('Only draft properties can be published', [
                { field: 'status', message: 'Property is not a draft' },
            ]);
        }

        if (!property.name || property.price.equals(0)) {
            throw new ValidationError('Property is missing required fields', [
                { field: 'name', message: 'Name is required' },
                { field: 'price', message: 'Price must be greater than 0' },
            ]);
        }

        const updated = await prisma.property.update({
            where: { id: propertyId },
            data: { status: 'PENDING_REVIEW' },
            include: propertyDetailInclude,
        });

        logger.info(`Draft published: ${propertyId}`);

        return serializeProperty(updated);
    }

    // ----------------------------------------
    // IMAGE ENDPOINTS
    // ----------------------------------------

    /**
     * Add images to property
     * POST /api/v1/properties/:id/images
     */
    async addImages(
        propertyId: string,
        ownerId: string,
        imageUrls: string[]
    ): Promise<{ media: { id: string; url: string }[] }> {
        await this.verifyOwnership(propertyId, ownerId);

        // Get current max order index
        const lastImage = await prisma.propertyMedia.findFirst({
            where: { propertyId },
            orderBy: { orderIndex: 'desc' },
        });
        const startIndex = (lastImage?.orderIndex || -1) + 1;

        // Check if this is the first image (should be primary)
        const imageCount = await prisma.propertyMedia.count({ where: { propertyId } });
        const isPrimary = imageCount === 0;

        const images = await prisma.propertyMedia.createMany({
            data: imageUrls.map((url, index) => ({
                propertyId,
                url,
                isPrimary: isPrimary && index === 0,
                orderIndex: startIndex + index,
            })),
        });

        const createdImages = await prisma.propertyMedia.findMany({
            where: { propertyId },
            orderBy: { orderIndex: 'asc' },
            select: { id: true, url: true },
        });

        logger.info(`${imageUrls.length} images added to property: ${propertyId}`);

        return { media: createdImages };
    }

    async addMedia(
        propertyId: string,
        ownerId: string,
        input: { url: string; type: MediaType; caption?: string; isPrimary?: boolean }
    ) {
        await this.verifyOwnership(propertyId, ownerId);
        const [lastMedia, count] = await Promise.all([
            prisma.propertyMedia.findFirst({ where: { propertyId }, orderBy: { orderIndex: 'desc' } }),
            prisma.propertyMedia.count({ where: { propertyId } }),
        ]);
        const shouldBePrimary = input.isPrimary ?? count === 0;
        return prisma.$transaction(async tx => {
            if (shouldBePrimary) await tx.propertyMedia.updateMany({ where: { propertyId }, data: { isPrimary: false } });
            return tx.propertyMedia.create({
                data: {
                    propertyId,
                    url: input.url,
                    type: input.type,
                    caption: input.caption,
                    isPrimary: shouldBePrimary,
                    orderIndex: (lastMedia?.orderIndex ?? -1) + 1,
                },
            });
        });
    }

    /**
     * Delete image from property
     * DELETE /api/v1/properties/:id/images/:imageId
     */
    async deleteImage(
        propertyId: string,
        imageId: string,
        ownerId: string
    ): Promise<{ message: string }> {
        await this.verifyOwnership(propertyId, ownerId);

        const image = await prisma.propertyMedia.findFirst({
            where: { id: imageId, propertyId },
        });

        if (!image) {
            throw new ValidationError('Image not found', [
                { field: 'imageId', message: 'Image not found' },
            ]);
        }

        await prisma.propertyMedia.delete({ where: { id: imageId } });

        // If deleted image was primary, set next image as primary
        if (image.isPrimary) {
            const nextImage = await prisma.propertyMedia.findFirst({
                where: { propertyId },
                orderBy: { orderIndex: 'asc' },
            });
            if (nextImage) {
                await prisma.propertyMedia.update({
                    where: { id: nextImage.id },
                    data: { isPrimary: true },
                });
            }
        }

        logger.info(`Image deleted: ${imageId} from property ${propertyId}`);

        return { message: 'Image deleted successfully' };
    }

    // ----------------------------------------
    // LANDLORD PROPERTIES
    // ----------------------------------------

    /**
     * Get properties owned by user
     */
    async getMyProperties(ownerId: string, status?: string): Promise<WirePropertySummary[]> {
        const where: Prisma.PropertyWhereInput = { ownerId };
        if (status) {
            where.status = status as Prisma.EnumPropertyStatusFilter;
        }

        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: propertySummarySelect,
        });

        return properties.map(serializePropertySummary);
    }

    // ----------------------------------------
    // HELPERS
    // ----------------------------------------

    private async verifyOwnership(propertyId: string, ownerId: string) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        if (property.ownerId !== ownerId) {
            throw new NotPropertyOwnerError();
        }

        return property;
    }

    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}

export const propertyService = new PropertyService();
export { PropertyService };
