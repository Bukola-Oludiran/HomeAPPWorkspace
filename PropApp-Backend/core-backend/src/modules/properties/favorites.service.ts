/**
 * Favorites Service
 * Handles tenant property favorites
 * Per PRD Section 8.1 Favorites endpoints
 */

import { prisma } from '../../config/database';
import { logger } from '../../common/utils/logger';
import { PropertyNotFoundError, ValidationError } from '../../common/utils/errors';

// ============================================
// TYPES
// ============================================

interface FavoriteProperty {
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
    primaryImage: string | null;
    favoritedAt: Date;
}

// ============================================
// FAVORITES SERVICE CLASS
// ============================================

class FavoritesService {
    /**
     * Get user's favorite properties
     * GET /api/v1/users/me/favorites
     */
    async getFavorites(userId: string): Promise<FavoriteProperty[]> {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                property: {
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
                        status: true,
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                            select: { url: true },
                        },
                    },
                },
            },
        });

        return favorites
            .filter(f => f.property.status === 'ACTIVE') // Only show active properties
            .map(f => ({
                id: f.property.id,
                name: f.property.name,
                propertyType: f.property.propertyType,
                listingType: f.property.listingType,
                price: Number(f.property.price),
                priceUnit: f.property.priceUnit,
                bedrooms: f.property.bedrooms,
                bathrooms: f.property.bathrooms,
                addressCity: f.property.addressCity,
                addressState: f.property.addressState,
                addressNeighborhood: f.property.addressNeighborhood,
                primaryImage: f.property.images[0]?.url || null,
                favoritedAt: f.createdAt,
            }));
    }

    /**
     * Add property to favorites
     * POST /api/v1/users/me/favorites/:propertyId
     */
    async addFavorite(userId: string, propertyId: string): Promise<{ message: string }> {
        // Check if property exists and is active
        const property = await prisma.property.findFirst({
            where: { id: propertyId, status: 'ACTIVE' },
        });

        if (!property) {
            throw new PropertyNotFoundError();
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_propertyId: { userId, propertyId },
            },
        });

        if (existing) {
            return { message: 'Property already in favorites' };
        }

        await prisma.favorite.create({
            data: { userId, propertyId },
        });

        logger.info(`Property ${propertyId} added to favorites by ${userId}`);

        return { message: 'Property added to favorites' };
    }

    /**
     * Remove property from favorites
     * DELETE /api/v1/users/me/favorites/:propertyId
     */
    async removeFavorite(userId: string, propertyId: string): Promise<{ message: string }> {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_propertyId: { userId, propertyId },
            },
        });

        if (!favorite) {
            return { message: 'Property not in favorites' };
        }

        await prisma.favorite.delete({
            where: { userId_propertyId: { userId, propertyId } },
        });

        logger.info(`Property ${propertyId} removed from favorites by ${userId}`);

        return { message: 'Property removed from favorites' };
    }

    /**
     * Check if property is favorited
     */
    async isFavorited(userId: string, propertyId: string): Promise<boolean> {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_propertyId: { userId, propertyId },
            },
        });

        return !!favorite;
    }
}

export const favoritesService = new FavoritesService();
export { FavoritesService };
