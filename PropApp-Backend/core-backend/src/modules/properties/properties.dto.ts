/**
 * Property Module - DTO Re-exports
 *
 * Source-of-truth lives in `@homeai/contracts/property.contract`. This
 * file is a back-compat re-export so existing module imports
 * (`./properties.dto`) keep resolving while callers migrate to direct
 * `@homeai/contracts/property.contract` imports.
 */

export {
    PropertyTypeEnum,
    ListingTypeEnum,
    PriceUnitEnum,
    PropertyStatusEnum,
    createPropertySchema,
    updatePropertySchema,
    updatePropertyStatusSchema,
    createDraftSchema,
    updateDraftSchema,
    searchPropertiesSchema,
    nearbyPropertiesSchema,
    reorderImagesSchema,
    type CreatePropertyDto,
    type UpdatePropertyDto,
    type UpdatePropertyStatusDto,
    type CreateDraftDto,
    type UpdateDraftDto,
    type SearchPropertiesDto,
    type NearbyPropertiesDto,
    type ReorderImagesDto,
} from '@homeai/contracts/property.contract';
