/**
 * Property Service
 * Handles property CRUD, search, drafts, and images
 * Per PRD Section 8
 */

import { Prisma } from '@prisma/client';
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

// ============================================
// TYPES
// ============================================

interface PropertyListResult {
    properties: PropertySummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface PropertySummary {
    id: string;
    name: string;
    propertyType: string;
    listingType: string;
    price: number;
    priceUnit: string;
    bedrooms: number | null;
    bathrooms: number | null;
    addressCity: string | null;
    addressState: string | null;
    addressNeighborhood: string | null;
    verificationTier: string;
    status: string;
    primaryImage: string | null;
    createdAt: Date;
}

interface PropertyDetail {
    id: string;
    name: string;
    description: string | null;
    propertyType: string;
    listingType: string;
    price: number;
    priceUnit: string;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    yearBuilt: number | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressState: string | null;
    addressZip: string | null;
    addressLga: string | null;
    addressNeighborhood: string | null;
    latitude: number | null;
    longitude: number | null;
    amenities: string[];
    status: string;
    verificationTier: string;
    media: {
        id: string;
        url: string;
        type: string;
        isPrimary: boolean;
        caption: string | null;
        orderIndex: number;
        metadata: Prisma.JsonValue;
    }[];
    owner: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
        verificationLevel: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

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
                select: {
                    id: true,
                    name: true,
                    propertyType: true,
                    listingType: true,
                    price: true,
                    priceUnit: true,
                    bedrooms: true,
                    bathrooms: true,
                    addressCity: true,
                    addressState: true,
                    addressNeighborhood: true,
                    verificationTier: true,
                    status: true,
                    createdAt: true,
                    media: {
                        where: { isPrimary: true, type: 'IMAGE' },
                        take: 1,
                        select: { url: true },
                    },
                },
            }),
            prisma.property.count({ where }),
        ]);

        return {
            properties: properties.map(p => ({
                ...p,
                price: Number(p.price),
                primaryImage: (p as any).media?.[0]?.url || null,
            })),
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
    async getPropertyById(propertyId: string, includeInactive = false): Promise<PropertyDetail> {
        const where: Prisma.PropertyWhereInput = { id: propertyId };
        if (!includeInactive) {
            where.status = { not: 'DELISTED' };
        }

        const property = await prisma.property.findFirst({
            where,
            include: {
                media: {
                    orderBy: { orderIndex: 'asc' },
                },
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        verificationLevel: true,
                    },
                },
            },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        return {
            ...property,
            price: Number(property.price),
            latitude: property.latitude ? Number(property.latitude) : null,
            longitude: property.longitude ? Number(property.longitude) : null,
        };
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
                p.addressCity?.toLowerCase().includes(needle) ||
                p.addressNeighborhood?.toLowerCase().includes(needle)
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
    async getFeaturedProperties(limit = 10): Promise<PropertySummary[]> {
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
            select: {
                id: true,
                name: true,
                propertyType: true,
                listingType: true,
                price: true,
                priceUnit: true,
                bedrooms: true,
                bathrooms: true,
                addressCity: true,
                addressState: true,
                addressNeighborhood: true,
                verificationTier: true,
                status: true,
                createdAt: true,
                media: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { url: true },
                },
            },
        });

        return properties.map(p => ({
            ...p,
            price: Number(p.price),
            primaryImage: p.media[0]?.url || null,
        }));
    }

    /**
     * Get nearby properties
     * GET /api/v1/properties/nearby
     */
    async getNearbyProperties(params: NearbyPropertiesDto): Promise<PropertySummary[]> {
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
                id: true,
                name: true,
                propertyType: true,
                listingType: true,
                price: true,
                priceUnit: true,
                bedrooms: true,
                bathrooms: true,
                addressCity: true,
                addressState: true,
                addressNeighborhood: true,
                verificationTier: true,
                status: true,
                latitude: true,
                longitude: true,
                createdAt: true,
                media: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { url: true },
                },
            },
        });

        // Calculate distances and filter
        const propertiesWithDistance = properties
            .map(p => ({
                ...p,
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

        return propertiesWithDistance.map(p => ({
            ...p,
            price: Number(p.price),
            primaryImage: p.media[0]?.url || null,
        }));
    }

    // ----------------------------------------
    // LANDLORD ENDPOINTS
    // ----------------------------------------

    /**
     * Create property
     * POST /api/v1/properties
     */
    async createProperty(ownerId: string, data: CreatePropertyDto): Promise<PropertyDetail> {
        const property = await prisma.property.create({
            data: {
                ...data,
                ownerId,
                status: 'PENDING_REVIEW',
                amenities: data.amenities || [],
            },
            include: {
                media: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        verificationLevel: true,
                    },
                },
            },
        });

        logger.info(`Property created: ${property.id} by ${ownerId}`);

        return {
            ...property,
            price: Number(property.price),
            latitude: property.latitude ? Number(property.latitude) : null,
            longitude: property.longitude ? Number(property.longitude) : null,
        };
    }

    /**
     * Update property
     * PUT /api/v1/properties/:id
     */
    async updateProperty(
        propertyId: string,
        ownerId: string,
        data: UpdatePropertyDto
    ): Promise<PropertyDetail> {
        await this.verifyOwnership(propertyId, ownerId);

        const property = await prisma.property.update({
            where: { id: propertyId },
            data: {
                ...data,
                amenities: data.amenities,
            },
            include: {
                media: {
                    orderBy: { orderIndex: 'asc' },
                },
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        verificationLevel: true,
                    },
                },
            },
        });

        logger.info(`Property updated: ${propertyId}`);

        return {
            ...property,
            price: Number(property.price),
            latitude: property.latitude ? Number(property.latitude) : null,
            longitude: property.longitude ? Number(property.longitude) : null,
        };
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
    async createDraft(ownerId: string, data: CreateDraftDto): Promise<PropertyDetail> {
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
            include: {
                media: true,
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        verificationLevel: true,
                    },
                },
            },
        });

        logger.info(`Draft created: ${property.id}`);

        return {
            ...property,
            price: Number(property.price),
            latitude: property.latitude ? Number(property.latitude) : null,
            longitude: property.longitude ? Number(property.longitude) : null,
        };
    }

    /**
     * Update draft property
     * PUT /api/v1/properties/draft/:id
     */
    async updateDraft(
        propertyId: string,
        ownerId: string,
        data: UpdateDraftDto
    ): Promise<PropertyDetail> {
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
    async publishDraft(propertyId: string, ownerId: string): Promise<PropertyDetail> {
        const property = await this.verifyOwnership(propertyId, ownerId);

        if (property.status !== 'DRAFT') {
            throw new ValidationError('Only draft properties can be published', [
                { field: 'status', message: 'Property is not a draft' },
            ]);
        }

        // Validate required fields for publishing
        if (!property.name || property.price.equals(0)) {
            throw new ValidationError('Property is missing required fields', [
                { field: 'name', message: 'Name is required' },
                { field: 'price', message: 'Price must be greater than 0' },
            ]);
        }

        const updated = await prisma.property.update({
            where: { id: propertyId },
            data: { status: 'PENDING_REVIEW' },
            include: {
                media: {
                    orderBy: { orderIndex: 'asc' },
                },
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        verificationLevel: true,
                    },
                },
            },
        });

        logger.info(`Draft published: ${propertyId}`);

        return {
            ...updated,
            price: Number(updated.price),
            latitude: updated.latitude ? Number(updated.latitude) : null,
            longitude: updated.longitude ? Number(updated.longitude) : null,
        };
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
    async getMyProperties(ownerId: string, status?: string): Promise<PropertySummary[]> {
        const where: Prisma.PropertyWhereInput = { ownerId };
        if (status) {
            where.status = status as Prisma.EnumPropertyStatusFilter;
        }

        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                propertyType: true,
                listingType: true,
                price: true,
                priceUnit: true,
                bedrooms: true,
                bathrooms: true,
                addressCity: true,
                addressState: true,
                addressNeighborhood: true,
                verificationTier: true,
                status: true,
                createdAt: true,
                media: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { url: true },
                },
            },
        });

        return properties.map(p => ({
            ...p,
            price: Number(p.price),
            primaryImage: p.media[0]?.url || null,
        }));
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
