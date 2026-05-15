# Search Functionality Gaps & Limitations

This document tracks limitations and missing features in the backend search implementation.

---

## Status Legend
- 🔴 **Critical** - Impacts core functionality or performance at scale
- 🟠 **Important** - Would significantly improve user experience
- 🟡 **Enhancement** - Nice-to-have features for future consideration

---

## Current Status: 🟠 Basic Search Working, Advanced Features Missing

The backend has functional search capabilities for properties and related entities, but lacks advanced search technologies and features needed for production scale.

---

## Critical Gaps

### 🔴 No Full-Text Search Engine

**Current Implementation:**
- Simple Prisma database queries with `contains` mode
- Case-insensitive substring matching only
- Searches property `name`, `city`, and `neighborhood` fields

**Location:** [properties.service.ts:248-276](core-backend/src/modules/properties/properties.service.ts#L248-L276)

**Problems:**
- Does not scale well with large datasets
- No relevance scoring or ranking
- Cannot handle typos or fuzzy matching
- No support for phrase searching or boolean operators
- Limited to exact substring matches

**Required Solution:**
Integrate **Elasticsearch** per PRD Section 8.2

**Benefits:**
- Full-text search with relevance scoring
- Fuzzy matching for typos
- Autocomplete/suggestions
- Advanced query DSL (boolean, phrase, wildcard)
- Fast performance even with millions of records
- Faceted search support

**Implementation Path:**
1. Set up Elasticsearch cluster
2. Create property index with appropriate mappings
3. Sync Prisma data to Elasticsearch (on create/update/delete)
4. Update search service to query Elasticsearch instead of Prisma
5. Add relevance scoring and ranking logic

---

### 🔴 No Geo-Spatial Database Indexing

**Current Implementation:**
- Geographic search uses Haversine formula calculated in application code
- Fetches ALL properties from database, then filters in memory

**Location:** [properties.service.ts:327-383, 787-808](core-backend/src/modules/properties/properties.service.ts#L327-L383)

**Problems:**
- Extremely inefficient - loads entire property table into memory
- Distance calculation happens in Node.js instead of database
- Does not scale beyond a few thousand properties
- No spatial indexing for fast radius queries

**Required Solution:**
Implement **PostGIS** extension for PostgreSQL

**Benefits:**
- Native geo-spatial indexing (GIST/BRIN indexes)
- Fast radius queries using `ST_DWithin`
- Accurate distance calculations with `ST_Distance`
- Supports complex geo queries (polygons, bounding boxes)
- Offloads computation to database layer

**Implementation Path:**
1. Enable PostGIS extension in PostgreSQL
2. Add `geography` or `geometry` column to Property table
3. Create spatial index on location column
4. Update Prisma schema (use raw SQL for geo queries)
5. Replace Haversine logic with PostGIS queries

**Example Query:**
```sql
SELECT * FROM properties
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  radius_in_meters
);
```

---

## Important Gaps

### 🟠 No Search Analytics

**What's Missing:**
- No tracking of search queries performed by users
- No analytics on popular searches, zero-result queries
- No conversion tracking (search → view → application)

**Impact:**
- Cannot identify trending neighborhoods/property types
- Cannot improve search relevance based on user behavior
- Cannot detect and fix common zero-result scenarios

**Suggested Implementation:**
1. Create `SearchLog` table to track queries
2. Log search parameters, result count, user actions
3. Build analytics dashboard for popular searches
4. Use data to improve search ranking and suggestions

**Table Schema:**
```typescript
model SearchLog {
  id          String   @id @default(uuid())
  userId      String?  // Null for anonymous searches
  query       String?  // Text search query
  filters     Json     // All search filters applied
  resultCount Int      // Number of results returned
  clickedIds  String[] // Property IDs user clicked
  createdAt   DateTime @default(now())
}
```

---

### 🟠 No Saved/Bookmarked Searches

**What's Missing:**
- Users cannot save search criteria for quick re-use
- No "notify me" alerts when new properties match saved searches

**Impact:**
- Users must re-enter complex search filters every time
- Missed opportunity for engagement (email alerts)

**Suggested Implementation:**
1. Create `SavedSearch` table
2. Add endpoints: `POST /users/me/saved-searches`, `GET /users/me/saved-searches`
3. Store search parameters as JSON
4. Optional: Background job to notify users when new matches appear

**Table Schema:**
```typescript
model SavedSearch {
  id          String   @id @default(uuid())
  userId      String
  name        String   // User-provided label "2BR in Lekki under ₦2M"
  filters     Json     // Complete search criteria
  alertsEnabled Boolean @default(false)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

---

### 🟠 No Advanced Text Search Features

**What's Missing:**
- **Fuzzy matching**: Cannot handle typos ("Leki" should match "Lekki")
- **Synonym expansion**: "apartment" should also match "flat"
- **Stemming**: "parking" should match "parked", "parks"
- **Phrase search**: Cannot search exact phrases like "ocean view"
- **Boolean operators**: No AND/OR/NOT logic
- **Field boosting**: Cannot prioritize matches in name over description

**Impact:**
- Poor search experience for users with typos
- Misses relevant results due to synonym differences
- Cannot handle natural language queries

**Solution:**
Requires Elasticsearch integration (see Critical Gap #1)

---

## Enhancement Gaps

### 🟡 No User/Profile Search

**What's Missing:**
- No endpoint to search for landlords by name
- No endpoint to search for agents by location/rating
- No tenant profile search (for landlord vetting)

**Potential Use Cases:**
- Landlords searching for verified agents in their area
- Tenants searching for properties by specific landlord
- Admin searching for users by email/phone

**Suggested Implementation:**
Add search endpoints:
- `GET /api/v1/users/search?q=&role=&city=`
- Respect privacy settings (only show public profiles)

---

### 🟡 No Autocomplete/Suggestions

**What's Missing:**
- No autocomplete for city names while typing
- No search suggestions based on partial input
- No "did you mean?" for misspelled queries

**Impact:**
- Users must type complete city/neighborhood names
- Higher friction in search experience

**Solution:**
- Elasticsearch supports autocomplete via completion suggester
- Can also build simple trie-based autocomplete for cities

---

### 🟡 No Search Facets/Aggregations

**What's Missing:**
- No count of results per property type ("Show 45 apartments, 12 houses")
- No price range distribution
- No "refine by" options in search results

**Impact:**
- Users cannot see available filters before applying them
- Harder to narrow down large result sets

**Solution:**
- Elasticsearch aggregations provide facet counts
- Can also implement via Prisma groupBy queries

---

### 🟡 No Recently Viewed Properties

**What's Missing:**
- No tracking of properties user has viewed
- No "Recently Viewed" section in dashboard

**Impact:**
- Users must re-search to find properties they looked at earlier

**Suggested Implementation:**
1. Create `ViewHistory` table or Redis cache
2. Track property views per user
3. Add endpoint: `GET /users/me/recent-views`

---

### 🟡 No Similar Properties Recommendation

**What's Missing:**
- No "Properties like this" feature on property detail page
- No recommendation engine

**Impact:**
- Missed opportunity to show relevant alternatives
- Lower property discovery

**Suggested Implementation:**
- Simple approach: Match by location + type + price range
- Advanced: Collaborative filtering or ML-based recommendations

---

## Implementation Priority

### Phase 1 (Critical - Before Launch)
1. ✅ Basic property search with filters (DONE)
2. 🔴 Elasticsearch integration for text search
3. 🔴 PostGIS for geo-spatial queries

### Phase 2 (Important - Post-Launch)
4. 🟠 Search analytics and logging
5. 🟠 Saved searches functionality
6. 🟠 Autocomplete for cities/neighborhoods

### Phase 3 (Enhancements - Future)
7. 🟡 User/profile search
8. 🟡 Search facets and aggregations
9. 🟡 Recently viewed tracking
10. 🟡 Similar properties recommendations

---

## Technical Debt Notes

### Current Haversine Implementation
**File:** [properties.service.ts:787-808](core-backend/src/modules/properties/properties.service.ts#L787-L808)

```typescript
// TODO: This is inefficient for production scale
// Should use PostGIS: ST_DWithin(geography, point, radius)
private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  // ... Haversine formula ...
}
```

**Action Required:** Replace with PostGIS queries before dataset exceeds 10,000 properties.

---

### Current Text Search Implementation
**File:** [properties.service.ts:248-276](core-backend/src/modules/properties/properties.service.ts#L248-L276)

```typescript
// TODO: Replace with Elasticsearch per PRD Section 8.2
const properties = await prisma.property.findMany({
  where: {
    OR: [
      { name: { contains: query.q, mode: 'insensitive' } },
      { addressCity: { contains: query.q, mode: 'insensitive' } },
      { neighborhood: { contains: query.q, mode: 'insensitive' } },
    ],
  },
});
```

**Action Required:** Migrate to Elasticsearch when search traffic exceeds 100 queries/minute or dataset exceeds 50,000 properties.

---

## Monitoring & Alerts

### Performance Metrics to Track
- Average search query response time (target: <200ms)
- 95th percentile response time (target: <500ms)
- Zero-result search rate (target: <15%)
- Search-to-click conversion rate

### Alert Thresholds
- 🚨 Alert if search response time > 1 second
- 🚨 Alert if zero-result rate > 30%
- 🚨 Alert if geo search triggers with >100,000 properties in DB

---

## Related Documentation
- [API Inadequacies](APIInadequacies.md) - Frontend/backend response mismatches
- [Backend Requirements](BACKEND_READMEV3.md) - Complete API specification
- PRD Section 8.2 - Search & Discovery requirements

---

## How to Update This Document

When search gaps are discovered:
1. Add to appropriate section (Critical/Important/Enhancement)
2. Include current implementation details and file locations
3. Describe impact and suggested solution
4. Update implementation priority if needed

---

**Last Updated:** 2026-01-30
**Maintained By:** Backend Team
