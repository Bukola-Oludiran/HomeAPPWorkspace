// Property types
export type ListingType = 'rent' | 'buy' | 'short-let' | 'land'
export type VerificationTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type PropertyStatus = 'active' | 'pending' | 'rented' | 'sold' | 'maintenance' | 'off-market'

export interface Property {
    id: string
    ownerId: string
    listingType: ListingType
    title: string
    description: string
    address: string
    city: string
    state: string
    lga: string
    price: number
    pricePeriod?: 'month' | 'year' | 'day'
    bedrooms: number
    bathrooms: number
    size: number
    amenities: string[]
    photos: string[]
    verificationTier: VerificationTier
    status: PropertyStatus
    createdAt: string
}

// User types
export type UserType = 'tenant' | 'landlord' | 'agent' | 'buyer' | 'seller'

export interface User {
    id: string
    email: string
    phone: string
    firstName: string
    lastName: string
    avatar?: string
    userType: UserType
    verificationLevel: VerificationTier | 'unverified'
    trustScore: number
    createdAt: string
}

// Application types
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'escrow_pending'

export interface Application {
    id: string
    propertyId: string
    property?: Property
    applicantId: string
    status: ApplicationStatus
    applicationType: 'rental' | 'purchase'
    submittedAt: string
}

// Maintenance types
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other'
export type MaintenanceUrgency = 'low' | 'medium' | 'high' | 'emergency'
export type MaintenanceStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

export interface MaintenanceRequest {
    id: string
    propertyId: string
    tenantId: string
    category: MaintenanceCategory
    description: string
    urgency: MaintenanceUrgency
    status: MaintenanceStatus
    photos: string[]
    createdAt: string
}

// Agent job types
export type JobType = 'repair' | 'inspection' | 'tour' | 'admin' | 'cleaning'
export type JobTag = 'urgent' | 'high-pay' | 'near-me' | 'standard' | 'quick'

export interface Job {
    id: string
    title: string
    location: string
    jobType: JobType
    tags: JobTag[]
    payout: number
    scheduledTime: string
    distance: number
    status: 'available' | 'accepted' | 'in_progress' | 'completed'
}
