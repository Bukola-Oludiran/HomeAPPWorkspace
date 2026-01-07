# HomeAI
## Product Requirements Document

**Comprehensive Real Estate Platform for Buying, Renting & Property Management**

| Field | Value |
|-------|-------|
| Version | 2.0 |
| Date | December 2025 |
| Status | Draft |
| Owner | Product Team |
| Platform | Web, Mobile (iOS/Android), Agent Portal |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Analysis & Market Context](#2-problem-analysis--market-context)
3. [Product Vision & Platform Overview](#3-product-vision--platform-overview)
4. [User Personas & Roles](#4-user-personas--roles)
5. [Platform Architecture](#5-platform-architecture)
6. [Core Features - Property Discovery](#6-core-features---property-discovery)
7. [Core Features - Buying & Sales](#7-core-features---buying--sales)
8. [Core Features - Renting](#8-core-features---renting)
9. [Core Features - Property Management](#9-core-features---property-management)
10. [Core Features - AI Assistant](#10-core-features---ai-assistant)
11. [Trust & Verification System](#11-trust--verification-system)
12. [Payment & Escrow System](#12-payment--escrow-system)
13. [Agent Platform](#13-agent-platform)
14. [Technical Architecture](#14-technical-architecture)
15. [Revenue Model](#15-revenue-model)
16. [Go-to-Market Strategy](#16-go-to-market-strategy)
17. [Success Metrics & KPIs](#17-success-metrics--kpis)
18. [Product Roadmap](#18-product-roadmap)
19. [Risks & Mitigations](#19-risks--mitigations)
20. [Appendices](#20-appendices)

---

## 1. Executive Summary

HomeAI Nigeria is a comprehensive AI-powered real estate platform designed to transform how Nigerians buy, rent, and manage properties. Building upon the foundation of fraud prevention pioneered by RentTrust, HomeAI expands into a full-service property ecosystem that serves landlords, tenants, buyers, sellers, and service agents.

**Vision:** Make every property transaction in Nigeria as trustworthy, transparent, and efficient as the best global platforms, powered by AI-first experiences.

**Tagline:** *"Your Future Home, Intelligently Found."*

### 1.1 Key Highlights

| Metric | Value |
|--------|-------|
| Target Market | ₦5B+ Nigerian PropTech sector |
| Problem Scale | 20-25% of property transactions involve fraud |
| Target Users | 15M+ Lagos residents (renters, buyers, landlords, agents) |
| Primary Features | Buy, Rent, Short-let, Land, Property Management |
| Unique Value | Integrated AI Assistant, 4-Tier Verification, Escrow Protection |
| Year 3 Target | ₦150B GMV, ₦6B revenue, 200K active listings |
| Platforms | Consumer App (Web/Mobile) + Agent Portal |

### 1.2 Core Differentiators

1. **AI-First Experience:** Conversational AI assistant seamlessly integrated into the search experience, capable of performing any action available in the UI
2. **Complete Verification:** 4-tier trust system with government integration (NIN, LASRERA, Land Registry)
3. **End-to-End Protection:** CBN-licensed escrow for all transactions (rent, purchase, services)
4. **Multi-Modal Platform:** Buy, rent, short-let, and land acquisition in one ecosystem
5. **Agent Ecosystem:** Dedicated portal for maintenance, inspection, and service professionals

---

## 2. Problem Analysis & Market Context

### 2.1 Market Overview

Lagos faces a severe housing crisis with a deficit of over 3 million units. Approximately 60% of the city's 20+ million population rents, and the city receives 600+ daily migrants seeking housing. This creates a high-pressure environment where both renters and buyers are vulnerable to exploitation. The Nigerian PropTech sector is projected to exceed ₦5B by 2025, yet remains fragmented and plagued by trust issues.

### 2.2 Fraud & Trust Issues

| Fraud Type | Description | Impact |
|------------|-------------|--------|
| Phantom Listings | Properties that don't exist or aren't available | Complete loss of funds |
| Multiple Collections | Rent/deposits collected from multiple parties | ₦21M documented single case |
| Excessive Commissions | 15-35% vs standard 5-10% | Financial exploitation |
| Document Forgery | Fake C of O, ownership papers | Legal complications |
| Post-Sale Disputes | Undisclosed encumbrances, ownership disputes | Years of litigation |
| Service Provider Fraud | Unvetted contractors, fake maintenance | Property damage, theft |

### 2.3 Current Market Gaps

- No single platform offers buy + rent + management in an integrated experience
- Existing platforms lack comprehensive verification (most stop at basic ID)
- No AI-powered property discovery or transaction assistance
- Service provider marketplace is unregulated and risky
- Diaspora investors lack reliable remote transaction capabilities

---

## 3. Product Vision & Platform Overview

### 3.1 Platform Pillars

| Pillar | Description | User Benefit |
|--------|-------------|--------------|
| Discovery | AI-powered property search across buy, rent, short-let, land | Find perfect properties through natural conversation |
| Transactions | End-to-end verified, escrow-protected deals | Complete transactions with confidence |
| Management | Full property lifecycle management tools | Manage properties, tenants, and maintenance effortlessly |
| Trust | 4-tier verification with government integration | Know every listing is real and verified |
| Services | Curated marketplace of verified service providers | Access trusted maintenance and inspection professionals |

### 3.2 Competitive Positioning

| Feature | PropertyPro | Spleet | RentSmallSmall | HomeAI |
|---------|-------------|--------|----------------|--------|
| Property Purchase | ✓ | ✗ | ✗ | ✓ |
| Rental Listings | ✓ | ✓ | ✓ | ✓ |
| Short-let/Airbnb | ✗ | ✓ | ✗ | ✓ |
| Land Sales | ✓ | ✗ | ✗ | ✓ |
| **Integrated AI Assistant** | ✗ | ✗ | ✗ | ✓ |
| Government ID (NIN) | ✗ | Partial | Partial | ✓ |
| Land Registry Integration | ✗ | ✗ | ✗ | ✓ |
| Physical Property Audit | ✗ | ✗ | ✗ | ✓ |
| Escrow Payments | ✗ | Partial | Partial | ✓ |
| Property Management | ✗ | Partial | ✗ | ✓ |
| Agent Marketplace | ✗ | ✗ | ✗ | ✓ |
| LASRERA Partnership | ✗ | ✗ | ✗ | ✓ |

*✓ = Full feature | Partial = Limited | ✗ = Not available*

---

## 4. User Personas & Roles

HomeAI serves three primary user categories, each with distinct needs and dedicated platform experiences.

### 4.1 Consumer Platform Users

#### 4.1.1 Tenants

| Attribute | Description |
|-----------|-------------|
| Primary Goal | Find safe, verified rental properties without fraud risk |
| Key Features | Property search, AI assistant, escrow payments, maintenance requests |
| Pain Points | Agent exploitation, phantom listings, hidden fees, deposit theft |
| Success Metric | Reputation Score (payment history, property care, verification) |
| Dashboard Access | My Rentals, Applications, Maintenance Requests, Payments, Messages |

**Persona - Adaeze:** 28-year-old marketing professional relocating to Lagos. Budget ₦800K-1.2M annually. Needs verified listings, secure payments, and legal protection. Values time-saving AI search.

#### 4.1.2 Landlords

| Attribute | Description |
|-----------|-------------|
| Primary Goal | List properties, find reliable tenants, manage rentals efficiently |
| Key Features | Property listing, tenant screening, rent collection, maintenance tracking |
| Pain Points | Unreliable tenants, rent defaults, property damage, management overhead |
| Success Metric | Reputation Score (response time, listing accuracy, dispute rate) |
| Dashboard Access | My Properties, Applicants, Payments, Messages, Reputation Profile |

**Persona - Chief Okonkwo:** 55-year-old property owner with 3 rental properties in Lekki. Wants verified tenants, guaranteed payments, and minimal management overhead. Values platform handling tenant vetting.

#### 4.1.3 Buyers/Sellers

| Attribute | Description |
|-----------|-------------|
| Primary Goal | Buy or sell property with verified ownership and secure transactions |
| Key Features | Property search/listing, document verification, escrow, legal support |
| Pain Points | Title fraud, ownership disputes, incomplete documentation, scams |
| Success Metric | Transaction completion rate, dispute-free closings |
| Dashboard Access | My Properties, Active Listings, Offers, Documents, Escrow Status |

**Persona - Emeka (Diaspora):** 35-year-old Nigerian in UK wanting to invest in Lagos property. Cannot physically verify properties. Needs remote verification, secure transactions, and ongoing property management.

### 4.2 Agent Platform Users

Agents access a separate dedicated portal (HomeAI Agent) with specialized tools for their service categories.

#### 4.2.1 Agent Categories

| Agent Type | Services | Verification Required | Payout Model |
|------------|----------|----------------------|--------------|
| Maintenance Technicians | Plumbing, electrical, HVAC, carpentry | Trade certification, NIN, background check | Per-job + rating bonus |
| Property Inspectors | Physical audits, 360° documentation | Training certification, NIN, equipment verification | Per-inspection fee |
| Cleaning Services | Move-in/out cleaning, regular maintenance | Business registration, NIN, insurance | Per-job + subscription |
| Security Personnel | Property checks, key handover supervision | Security license, NIN, background check | Hourly/per-visit |
| Legal Consultants | Document review, title verification | Bar association membership, NIN | Per-service fee |
| Property Managers | Full management services for landlords | Professional certification, NIN, bond | % of rent collected |

#### 4.2.2 Agent Portal Features

- **Job Management:** View available jobs, accept assignments, update status, upload completion evidence
- **Scheduling:** Calendar integration, availability settings, appointment management
- **Earnings Dashboard:** Track payments, view history, manage payouts, tax documentation
- **Reputation System:** Ratings, reviews, response time metrics, completion rate
- **Communication Hub:** Direct messaging with clients, support tickets, notifications
- **Training Center:** Certification courses, platform guidelines, best practices

---

## 5. Platform Architecture

### 5.1 Application Structure

| Platform | Primary Users | Key Screens | Technology |
|----------|---------------|-------------|------------|
| HomeAI Web | All consumer users | Home, Search, Listings, Dashboard, AI Chat | React, Next.js |
| HomeAI Mobile | All consumer users | Native mobile experience | React Native (iOS/Android) |
| HomeAI Agent | Service providers | Jobs, Schedule, Earnings, Profile | React, dedicated backend |
| Admin Portal | Platform operators | Moderation, analytics, support | Internal tooling |

### 5.2 Navigation Structure - Consumer App

#### 5.2.1 Global Navigation

- **Primary Nav:** Buy | Rent | About Us | Blog
- **Action Buttons:** List Your Property | Login / Sign Up
- **Persistent Elements:** Notifications bell, User profile menu

#### 5.2.2 Homepage Structure

1. **Hero Section:** Unified Search/AI Bar (with mode toggle) + Category filter pills
2. **Category Cards:** Buy a Home | Rent a Place | Short-let | Find Land
3. **Featured Properties:** Location-based recommendations with verification badges
4. **Trust Pillars:** Verified Properties | Escrow Protection | Smart Agreements
5. **Footer:** Company info, platform links, legal, resources

### 5.3 AI Assistant Integration (Unified Search/AI Bar)

The AI Assistant is seamlessly integrated into the property search experience through a **unified input bar with mode toggle**.

#### 5.3.1 Screens WITH Search Bar (Homepage, Search Results, Listings)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [🔍 Search] [✨ AI]  │  Search for location, price, property type...   │  🎤  │
└─────────────────────────────────────────────────────────────────────────┘
         ↑ Toggle                        ↑ Input area                      ↑ Voice
```

**Search Mode (Default):**
- Standard property search with autocomplete
- Filter pills appear below (Type, Price, Beds, etc.)
- Placeholder: "Search for location, price, property type..."

**AI Mode (Toggle Active):**
- Natural language input
- Suggested prompts appear below the bar
- Placeholder: "Ask me anything... e.g., Find me a 2-bed apartment in Lekki under ₦1.5M"
- AI responses appear in an expanding panel below the bar or as a slide-up sheet

**Toggle Behavior:**
- Single tap switches between Search ↔ AI mode
- Visual indicator: Search icon (🔍) vs AI sparkle icon (✨)
- Active mode is highlighted with primary color
- Smooth animation transition between modes
- Mode preference is remembered per session

#### 5.3.2 Screens WITHOUT Search Bar (Dashboard, Settings, Property Detail, Payments)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         [Main Screen Content]                           │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│  ✨  │  Ask AI anything...                                         │  🎤  │
└─────────────────────────────────────────────────────────────────────────┘
                    ↑ Floating AI Prompt Bar (bottom of screen)
```

**Floating AI Bar Specifications:**
- **Position:** Fixed at bottom of screen, above navigation bar (mobile) or bottom edge (web)
- **Height:** 56px collapsed, expands on focus
- **Behavior:** 
  - Tapping opens expanded input with keyboard
  - Conversation history accessible via swipe up or expand button
  - Dismissible but always accessible via minimized pill/icon
- **Visual:** Subtle shadow, rounded corners, branded AI icon
- **Responsive:** Adjusts for keyboard appearance, doesn't overlap critical actions

#### 5.3.3 AI Interaction States

| State | Search Bar Screens | Non-Search Screens |
|-------|-------------------|-------------------|
| Idle | Toggle visible, search mode default | Floating bar minimized at bottom |
| Active | AI mode selected, input focused | Floating bar expanded, keyboard open |
| Processing | Loading indicator in bar | Loading indicator in floating bar |
| Response | Results panel expands below | Slide-up sheet with response |
| Conversation | Full chat view available | Full chat view available |

#### 5.3.4 Contextual AI Awareness

The AI Assistant is context-aware based on the current screen:

| Current Screen | AI Context | Example Prompts |
|---------------|------------|-----------------|
| Homepage | General discovery | "Find me apartments in Lekki" |
| Search Results | Refine current search | "Show only Gold verified listings" |
| Property Detail | Current property | "Schedule a viewing for Saturday" |
| Landlord Dashboard | User's properties | "How is my Ikeja property performing?" |
| Tenant Dashboard | User's rental | "Report a maintenance issue" |
| Payments | Transaction context | "Pay my December rent" |
| Application Status | Current applications | "What's the status of my Yaba application?" |

---

## 6. Core Features - Property Discovery

### 6.1 Search & Filter System

| Filter Category | Options | Notes |
|-----------------|---------|-------|
| Transaction Type | Buy, Rent, Short-let, Land | Primary filter, affects available sub-filters |
| Location | City, LGA, Neighborhood, Address search | Autocomplete with map integration |
| Price Range | Min/Max slider with presets | Currency: NGN, USD for diaspora |
| Property Type | Apartment, House, Condo, Townhouse, Duplex, Land | Icons for visual clarity |
| Bedrooms/Baths | Studio, 1-5+, Any | Numeric selectors |
| Size (sqft) | Min/Max range | Optional filter |
| Amenities | Pool, Gym, Pet Friendly, Parking, Balcony, Security, etc. | Multi-select checkboxes |
| Verification Level | Bronze, Silver, Gold, Platinum, Any | Trust filter - key differentiator |
| Listing Date | Last 24h, 7 days, 30 days, Any | Freshness filter |

### 6.2 Search Results Interface

- **Split View:** Property list (left) + Interactive map (right) with price pins
- **Property Cards:** Photo, price, location, beds/baths, verification badge, favorite button
- **Sort Options:** Price (High-Low, Low-High), Newest, Most Verified, Distance
- **Verification Badges:** Color-coded (Bronze/Silver/Gold/Platinum) with tooltip explanation
- **AI Refinement:** Toggle to AI mode to refine results naturally ("Show me only properties with parking")

### 6.3 Property Detail Page

| Section | Content | Actions |
|---------|---------|---------|
| Photo Gallery | Primary image + grid, 360° view button, virtual tour | Fullscreen, share |
| Property Header | Title, address, price, verification badge | Favorite, share |
| Quick Stats | Beds, baths, sqft, property type | — |
| Description | Full property description | — |
| Amenities | Icon grid of available amenities | — |
| Floor Plan & Location | Floor plan image + embedded map | Expand map |
| Landlord/Seller Profile | Name, photo, join date, trust badges | Contact, message |
| Action Panel | Price, Apply/Buy Now, Schedule Viewing, Chat with AI | Primary conversion |
| Floating AI Bar | Context-aware assistant | Ask questions about this property |

---

## 7. Core Features - Buying & Sales

### 7.1 Property Purchase Flow

1. **Discovery:** Buyer searches/browses or uses AI assistant to find properties
2. **Verification Review:** Buyer reviews property verification tier and documentation
3. **Viewing/Inspection:** Schedule physical viewing or request inspection report from verified agent
4. **Offer Submission:** Submit offer through platform with pre-qualification (optional)
5. **Negotiation:** Secure in-app messaging for offer/counter-offer
6. **Agreement:** Smart purchase agreement generation with e-signatures
7. **Escrow Deposit:** Initial deposit to CBN-licensed escrow account
8. **Due Diligence:** Platform facilitates title search, survey, legal review
9. **Closing:** Final payment, document transfer, registration support
10. **Completion:** Funds released, ownership transferred, transaction recorded

### 7.2 Seller Listing Flow

1. **Initiate Listing:** Click "List Your Property" and select "For Sale"
2. **Property Details:** Address, type, size, bedrooms, bathrooms, description, price
3. **Media Upload:** Photos (min 5), optional video tour, floor plan
4. **Documentation:** Upload C of O, survey plan, building approval, tax receipts
5. **Verification:** Choose verification tier and complete requirements
6. **Review & Publish:** Platform review, badge assignment, listing goes live

### 7.3 Land Sales

Land transactions follow similar flow with additional requirements:
- Survey plan verification
- Gazette publication check
- Governor's consent status
- Environmental clearance (where applicable)
- Excision documentation

---

## 8. Core Features - Renting

The rental features are inherited from the original RentTrust platform, representing the core fraud-prevention and trust-building capabilities.

### 8.1 Rental Listing Flow

| Step | Landlord Action | Platform Support |
|------|-----------------|------------------|
| 1. Create Listing | Enter property details, upload photos, set rent | Auto-save, photo optimization, price suggestions |
| 2. Documentation | Upload C of O, utility bills, proof of ownership | Document type detection, validation |
| 3. Verification | Complete chosen verification tier | NIN verification, Land Registry API, audit scheduling |
| 4. Publish | Review and activate listing | Badge assignment, listing optimization tips |
| 5. Manage Applications | Review tenant applications, check scores | AI-powered tenant matching, background checks |
| 6. Accept Tenant | Approve application, initiate agreement | Smart agreement generation, escrow setup |

### 8.2 Tenant Application Flow

1. **Search:** Find properties using search, filters, map, or AI assistant
2. **Review:** Check property details, verification status, landlord reputation
3. **Apply:** Submit application with personal details, employment, references
4. **Verification:** Complete tenant verification (NIN, employment, credit check)
5. **Approval:** Receive landlord decision, view any counter-terms
6. **Agreement:** Review and e-sign smart tenancy agreement
7. **Payment:** Submit rent + caution fee to escrow
8. **Move-in:** Receive keys, confirm move-in within 48 hours
9. **Confirmation:** Escrow releases funds to landlord, tenancy begins

### 8.3 Short-let / Vacation Rentals

| Feature | Description |
|---------|-------------|
| Daily/Weekly Pricing | Flexible pricing with minimum stay requirements |
| Instant Booking | Pre-verified properties can enable instant booking |
| Cleaning Fee | Optional additional fee for turnover cleaning |
| Check-in Instructions | Automated delivery after booking confirmation |
| Calendar Sync | iCal integration for availability management |
| Guest Reviews | Two-way review system after stay completion |

---

## 9. Core Features - Property Management

### 9.1 Landlord Dashboard

| Section | Features |
|---------|----------|
| Overview Stats | Active rentals, pending applications, open maintenance, reputation score |
| My Properties | All properties with status filters (All, Active, Pending, In Escrow, Rented) |
| Property Detail | Listing performance (views, saves, inquiries), current tenant, lease dates, payments |
| Applicant Management | Application queue, verification status, approve/reject/message actions |
| Payments | Expected payouts, transaction history, payment methods, auto-withdrawal |
| Messages | Inbox with tenants, applicants, support |
| Reputation Profile | Overall score, response time, listing accuracy, tenant reviews |
| **Floating AI Bar** | "How are my properties performing?" "Draft a rent reminder for Unit 4B" |

### 9.2 Tenant Dashboard

| Section | Features |
|---------|----------|
| Overview Stats | Active rentals, pending applications, open maintenance, reputation score |
| My Rentals | Current rental with landlord info, rent due date, quick actions |
| Maintenance Requests | Request table with ID, category, date, status, view details |
| My Applications | Application status tracking (Under Review, Escrow Pending, Approved, Rejected) |
| Payments | Payment history, upcoming payments, payment methods |
| Reputation Score | Payment timeliness, property care rating, verification completeness, landlord reviews |
| **Floating AI Bar** | "When is my rent due?" "Report a broken AC" "Contact my landlord" |

### 9.3 Maintenance Request System

1. **Request Creation:** Tenant submits request with category, description, photos, urgency level
2. **Landlord Notification:** Push notification + email alert to property owner
3. **Agent Assignment:** Landlord assigns from verified agent marketplace or own contractor
4. **Scheduling:** Agent proposes times, tenant confirms availability
5. **Work Completion:** Agent marks complete with before/after photos
6. **Verification:** Tenant confirms resolution, rates agent
7. **Payment:** Agent paid via platform escrow

**AI-Assisted Maintenance:**
- Tenant can describe issue to AI in natural language
- AI categorizes issue, suggests urgency level
- AI can auto-fill maintenance request form
- Example: "My bathroom faucet has been leaking for 2 days" → Creates plumbing request, medium urgency

---

## 10. Core Features - AI Assistant

The AI Assistant is a core differentiator, providing conversational access to all platform capabilities. Users can accomplish any task available in the UI through natural language interaction.

### 10.1 AI Assistant Capabilities

| Capability Category | Example Actions | UI Equivalent |
|--------------------|-----------------|---------------|
| Property Discovery | "Find me 2-bedroom apartments in Lekki under ₦1.5M" | Search & Filter |
| Listing Management | "List my property at 123 Main St for ₦2M/year" | Create Listing Form |
| Application Actions | "Apply for the Gold verified flat in Ikeja" | Application Form |
| Scheduling | "Schedule a viewing for Saturday at 2pm" | Calendar Booking |
| Document Generation | "Generate a tenancy agreement for Maria" | Smart Agreement |
| Payment Actions | "Pay my rent for December" | Payment Flow |
| Maintenance | "Report a leaky faucet in my bathroom" | Maintenance Request |
| Information Queries | "Explain property verification levels" | Help/FAQ |
| Status Checks | "What's the status of my application?" | Dashboard View |
| Recommendations | "Suggest properties similar to the one I saved" | Recommendation Engine |
| Comparisons | "Compare these 3 properties I saved" | Side-by-side view |
| Negotiations | "Counter-offer ₦1.8M for the Lekki property" | Offer management |

### 10.2 AI Interface Specifications

#### Primary Access: Unified Search/AI Bar

**On Search-Enabled Screens:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [🔍][✨] │ Find me 3-bed apartments in VI with a pool...    │ 🎤 │
└──────────────────────────────────────────────────────────────────┘
     ↑ Mode Toggle (Search/AI)
```

**On Other Screens (Floating Bar):**
```
┌──────────────────────────────────────────────────────────────────┐
│  ✨  │ Ask me anything about your rental...               │ 🎤 │
└──────────────────────────────────────────────────────────────────┘
     ↑ Fixed at bottom, expands on tap
```

#### AI Response Patterns

**Property Results:**
- Inline property cards with photos, price, verification badge
- "View Details" button on each card
- "Show more" to expand results
- Voice readout option for accessibility

**Action Confirmations:**
- Clear confirmation dialog before executing transactions
- Summary of action to be taken
- "Confirm" / "Cancel" buttons
- Undo option where applicable

**Information Responses:**
- Concise, formatted text responses
- Expandable sections for detailed info
- Links to relevant help articles
- Follow-up suggestions

### 10.3 AI Technical Approach

| Component | Technology | Purpose |
|-----------|------------|---------|
| Language Model | Claude/GPT-4 via API | Natural language understanding and generation |
| Intent Classification | Fine-tuned classifier | Map user queries to platform actions |
| Entity Extraction | NER models | Extract locations, prices, dates, property attributes |
| Action Execution | Platform API integration | Execute searches, bookings, payments via internal APIs |
| Context Management | Conversation memory | Maintain multi-turn conversation context |
| Personalization | User profile integration | Tailor responses based on history and preferences |
| Voice Processing | Speech-to-text API | Enable voice input via microphone button |

### 10.4 AI Safety & Guardrails

- **Transaction Limits:** Require explicit confirmation for any financial transaction
- **Identity Verification:** Re-authenticate for sensitive actions (payments, agreements)
- **Fallback to Human:** Escalate to support for complex issues or disputes
- **Audit Trail:** Log all AI-initiated actions for accountability
- **Error Handling:** Graceful failure with clear error messages and alternatives

---

## 11. Trust & Verification System

### 11.1 4-Tier Property Verification

| Tier | Trust Level | Requirements | Badge Color |
|------|-------------|--------------|-------------|
| Bronze | 40% | NIN verification + phone verified + basic property details | Orange |
| Silver | 70% | Bronze + property photos + address confirmation + utility bills | Gray |
| Gold | 90% | Silver + C of O verification + Land Registry check | Gold |
| Platinum | 100% | Gold + physical audit (GPS, 360° photos) + LASRERA registered | Blue |

### 11.2 Verification Dashboard

Property owners access a dedicated Verification Dashboard showing their progress through verification steps. Each step has a status indicator (Completed, Under Review, Pending, Rejected) and clear next actions.

**Dashboard Elements:**
- **Progress Bar:** Visual indicator showing completion percentage (e.g., "3 of 7 steps complete - 42%")
- **Step List:** NIN Verification → Property Photos → Address Verification → C of O → Land Registry → Physical Audit → LASRERA Registration
- **Document Upload:** Drag-and-drop interface for required documents with status tracking
- **Rejection Handling:** Clear rejection reasons with "Upload New Document" option
- **Badge Preview:** Shows next achievable badge and remaining requirements

### 11.3 User Verification

| User Type | Required Verification | Optional Verification |
|-----------|----------------------|----------------------|
| Tenant | NIN, Phone, Email | Employment, Bank statement, References |
| Landlord | NIN, Phone, Email, Property ownership proof | LASRERA registration, Professional license |
| Buyer | NIN, Phone, Email | Pre-qualification, Bank verification |
| Seller | NIN, Phone, Email, Property documentation | Legal representation verification |
| Agent | NIN, Phone, Trade/professional certification | Insurance, Equipment verification, Background check |

---

## 12. Payment & Escrow System

### 12.1 Escrow Flow

| Step | Action | Timeline |
|------|--------|----------|
| 1. Payment Initiated | Buyer/tenant submits payment to platform escrow | Immediate |
| 2. Funds Secured | CBN-licensed escrow partner holds funds | Within 24 hours |
| 3. Condition Met | Property handover (rent) or closing complete (purchase) | Per agreement |
| 4. Confirmation Window | Receiving party has 48 hours to confirm or dispute | 48 hours |
| 5. Funds Released | Platform releases funds minus fees to seller/landlord | Within 24 hours |
| 6. Documentation | Receipt + agreement PDFs generated automatically | Immediate |

### 12.2 Payment Methods

- **Card Payments:** Visa, Mastercard, Verve via Paystack/Flutterwave
- **Bank Transfer:** Direct bank transfer with auto-verification
- **USSD:** Mobile banking codes for non-smartphone users
- **International:** USD payments for diaspora users with automatic NGN conversion

### 12.3 Dispute Resolution

| Phase | Timeline | Actions |
|-------|----------|---------|
| Dispute Raised | Within 48 hours of handover | User describes issue, uploads evidence photos/videos |
| Evidence Collection | 24 hours | Both parties submit supporting documentation |
| Mediation | 48 hours | Platform mediator reviews case, proposes resolution |
| Resolution | 24 hours | Agreement reached, funds distributed accordingly |
| Escalation | If mediation fails | LASRERA referral or legal arbitration |

### 12.4 AI-Assisted Payments

Users can initiate payments through the AI assistant:
- "Pay my rent for December" → Shows payment summary, requests confirmation
- "Set up automatic rent payments" → Guides through autopay setup
- "What's my payment history?" → Shows transaction summary

---

## 13. Agent Platform

The Agent Platform (HomeAI Agent) is a separate application serving verified service providers. It operates as a distinct UI but integrates seamlessly with the consumer platform for job routing and payments.

### 13.1 Agent Onboarding

1. **Registration:** Agent downloads HomeAI Agent app and creates account
2. **Category Selection:** Choose service category (maintenance, inspection, cleaning, etc.)
3. **Identity Verification:** NIN verification, photo upload, address confirmation
4. **Professional Verification:** Trade certification, license upload, experience documentation
5. **Background Check:** Criminal record check via integrated service
6. **Training:** Complete platform guidelines and safety training
7. **Activation:** Account activated, agent appears in marketplace

### 13.2 Agent Dashboard

| Section | Features |
|---------|----------|
| Available Jobs | List of jobs matching agent's skills and location with accept/decline options |
| My Jobs | Active assignments with status tracking, client details, property info |
| Schedule | Calendar view of appointments, availability settings, time blocking |
| Earnings | Current balance, pending payouts, transaction history, withdrawal options |
| Profile | Public profile, certifications, equipment, service area, rates |
| Ratings & Reviews | Customer feedback, response to reviews, performance metrics |
| Messages | Communication with clients, support tickets, platform announcements |
| Training Center | Certification courses, platform updates, best practice guides |

### 13.3 Agent Job Flow

1. **Job Posted:** Landlord/tenant requests service via consumer platform
2. **Matching:** Platform matches job to qualified agents based on skills, location, rating
3. **Notification:** Agent receives push notification with job details
4. **Acceptance:** Agent reviews job, accepts or declines
5. **Scheduling:** Agent proposes available times, client confirms
6. **Execution:** Agent arrives, completes work, uploads evidence photos
7. **Verification:** Client confirms completion and rates service
8. **Payment:** Agent paid via platform, minus commission

### 13.4 Agent Categories & Services

| Category | Services Offered | Typical Job Value |
|----------|-----------------|-------------------|
| Plumbing | Leak repair, pipe installation, drain clearing | ₦5,000 - ₦50,000 |
| Electrical | Wiring, fixture installation, fault diagnosis | ₦5,000 - ₦100,000 |
| HVAC | AC installation, repair, servicing | ₦10,000 - ₦150,000 |
| Cleaning | Deep cleaning, move-in/out, regular maintenance | ₦10,000 - ₦50,000 |
| Inspection | Property audit, 360° documentation, condition reports | ₦25,000 - ₦100,000 |
| Security | Key handover supervision, property checks | ₦5,000 - ₦20,000 |
| Legal | Document review, title verification, contract drafting | ₦50,000 - ₦500,000 |
| Property Management | Full management services | 8-12% of rent |

---

## 14. Technical Architecture

### 14.1 System Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| API Gateway | Kong / AWS API Gateway | Routing, rate limiting, authentication |
| Backend Services | Node.js / Python microservices | Business logic, API endpoints |
| Database | PostgreSQL (primary), Redis (cache) | Data persistence and caching |
| Search | Elasticsearch | Property search and filtering |
| Storage | AWS S3 | Media files, documents |
| CDN | CloudFront | Static asset delivery |
| Mobile | React Native | iOS and Android apps |
| Web | Next.js / React | Web application |
| AI/ML | Claude API / Custom models | AI assistant, fraud detection |
| Notifications | Firebase / Twilio | Push notifications, SMS, email |

### 14.2 External Integrations

| Integration | Provider | Purpose |
|-------------|----------|---------|
| Identity Verification | NIMC (NIN) | National identity verification |
| Property Registry | Lagos Land Registry | Ownership verification |
| Regulatory | LASRERA | Real estate regulatory compliance |
| Payments | Paystack / Flutterwave | Payment processing |
| Escrow | CBN-licensed partner | Secure fund holding |
| Maps | Google Maps | Location services, property mapping |
| SMS | Twilio / Africa's Talking | SMS notifications |
| Email | SendGrid | Transactional emails |
| Background Checks | Third-party provider | Agent verification |
| AI | Anthropic Claude API | Conversational AI assistant |

### 14.3 Security Requirements

- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Compliance:** PCI DSS for payments, NDPR for data protection
- **Authentication:** MFA (SMS OTP + TOTP), biometric authentication
- **Sessions:** JWT tokens (15min access / 7-day refresh), device fingerprinting
- **Fraud Prevention:** ML-based fraud scoring, continuous monitoring, anomaly detection
- **AI Safety:** Input sanitization, output filtering, action confirmation gates

### 14.4 API Design for AI Integration

The AI assistant requires access to all platform capabilities via internal APIs:

```
/api/v1/search          - Property search with filters
/api/v1/properties      - CRUD operations for listings
/api/v1/applications    - Rental/purchase applications
/api/v1/transactions    - Payment and escrow operations
/api/v1/maintenance     - Maintenance request management
/api/v1/users           - User profile and verification
/api/v1/messages        - Communication system
/api/v1/agents          - Agent marketplace operations
/api/v1/ai/execute      - AI action execution endpoint
```

---

## 15. Revenue Model

### 15.1 Fee Structure

| Revenue Stream | Rate/Amount | Paid By | % of Revenue |
|----------------|-------------|---------|--------------|
| Rental Transaction Fee | 3% of annual rent | Tenant | ~30% |
| Purchase Transaction Fee | 1.5% of sale price | Buyer | ~25% |
| Verification Fee (Gold) | ₦25,000 - ₦50,000 | Property Owner | ~15% |
| Verification Fee (Platinum) | ₦75,000 - ₦150,000 | Property Owner | ~10% |
| Premium Listing | ₦20,000 - ₦50,000/month | Property Owner | ~8% |
| Agent Commission | 15% of job value | Agent | ~7% |
| Financing Referral | Revenue share | Partner | ~3% |
| Featured Placement | ₦10,000 - ₦30,000/week | Property Owner | ~2% |

### 15.2 Financial Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active Listings | 10,000 | 50,000 | 200,000 |
| Rental Transactions | 3,000 | 20,000 | 80,000 |
| Purchase Transactions | 200 | 1,500 | 6,000 |
| Agent Jobs Completed | 5,000 | 40,000 | 150,000 |
| Total GMV | ₦5B | ₦40B | ₦150B |
| Revenue | ₦250M | ₦1.5B | ₦6B |
| Monthly Active Users | 100K | 500K | 2M |

### 15.3 Unit Economics

| Metric | Value |
|--------|-------|
| Average Rental Transaction | ₦1.2M |
| Average Purchase Transaction | ₦25M |
| Revenue per Rental | ₦61K |
| Revenue per Purchase | ₦375K |
| Customer Acquisition Cost | ₦5,000 |
| Lifetime Value (Landlord) | ₦180K |
| LTV:CAC Ratio Target | >3:1 |

---

## 16. Go-to-Market Strategy

### 16.1 Phased Rollout

#### Phase 1: Lagos Pilot (Months 1-6)

- **Focus Areas:** Lekki, Victoria Island, Ikoyi, Surulere, Yaba, Ikeja
- **Targets:** 5,000 listings, 500 rentals, 50 purchases, 100 verified agents
- **Marketing:** Instagram/TikTok, grassroots (church, markets), influencer partnerships
- **Key Milestone:** First 100 protected transactions completed

#### Phase 2: Lagos Expansion (Months 7-12)

- **Focus Areas:** All Lagos LGAs, LASRERA partnership live
- **Targets:** 25,000 listings, 3,000 rentals, 200 purchases, 500 agents
- **Marketing:** Radio (Wazobia FM, Cool FM), OOH advertising, corporate partnerships
- **Key Milestone:** ₦250M revenue, Series A ready

#### Phase 3: National Expansion (Year 2+)

- **Focus Areas:** Abuja, Port Harcourt, Ibadan, Kano
- **Targets:** 100,000+ listings, state housing partnerships
- **Marketing:** TV advertising, national PR campaign, diaspora outreach

### 16.2 Growth Strategies

| Target | Strategy | Incentive |
|--------|----------|-----------|
| Landlords | "First 50 list free" campaign | ₦20K referral bonus per verified listing |
| Tenants | "Protected First Rent" guarantee | ₦10K credit for verified applications |
| Buyers | "Safe Purchase" marketing | Free title search for Gold+ properties |
| Agents | "Join the Network" campaign | ₦15K sign-up bonus after 5 jobs |
| Diaspora | UK/US targeted digital ads | Multi-currency support, property management included |
| Corporate | B2B housing partnerships | Volume discounts, dedicated account management |

### 16.3 AI as Marketing Differentiator

The integrated AI assistant is a key marketing message:
- **Headline:** "Find your home by just asking"
- **Demo Videos:** Show natural language property search
- **Comparison:** "Why click through 50 filters when you can just say what you want?"
- **Trust Message:** "AI-verified properties, human-protected transactions"

---

## 17. Success Metrics & KPIs

### 17.1 North Star Metrics

- **Primary:** Successful Protected Transactions per Month (zero disputes)
- **Secondary:** Monthly Active Users on platform

### 17.2 Year 1 Targets

| Category | Metric | Target |
|----------|--------|--------|
| Growth | Monthly Active Users | 100,000 |
| Growth | Verified Listings | 10,000 |
| Growth | Rental Transactions | 3,000 |
| Growth | Purchase Transactions | 200 |
| Growth | Agent Jobs Completed | 5,000 |
| Quality | Fraud Rate | <0.1% |
| Quality | Dispute Resolution Rate | >95% within 5 days |
| Quality | Average Trust Score | >70 |
| Efficiency | Listing-to-Transaction Conversion | >12% |
| Efficiency | Agent Job Acceptance Rate | >80% |
| Retention | Landlord Retention (12mo) | >75% |
| Retention | Tenant Return Rate | >40% |
| Satisfaction | NPS Score | >50 |
| **AI Metrics** | AI Assistant Usage Rate | >30% of users |
| **AI Metrics** | AI Task Completion Rate | >85% |
| **AI Metrics** | AI-Initiated Transactions | >15% of total |
| Financial | Total GMV | ₦5B |
| Financial | Revenue | ₦250M |
| Financial | LTV:CAC Ratio | >3:1 |

---

## 18. Product Roadmap

### 18.1 MVP (Months 1-4)

- Core property listing and discovery (buy, rent)
- NIN verification integration
- Basic escrow payment system (Paystack)
- Smart tenancy agreement generation
- Mobile app (React Native) + web dashboard
- **Basic AI assistant (search mode only, FAQ responses)**
- WhatsApp notifications
- Unified search/AI bar (search mode default)

### 18.2 Version 1.0 (Months 5-8)

- Land Registry integration
- Physical verification workflow
- **Full AI assistant with transaction capabilities**
- **Floating AI bar on non-search screens**
- In-app messaging
- Review and rating system
- Maintenance request system
- Agent platform beta launch

### 18.3 Version 1.5 (Months 9-12)

- LASRERA API integration
- Short-let / vacation rental features
- Rent financing partnership
- AI fraud detection
- Virtual tours (360° photos)
- Diaspora experience (multi-currency)
- Full agent marketplace launch
- **Voice input for AI assistant**
- **AI-powered property recommendations**

### 18.4 Version 2.0 (Year 2+)

- Abuja, Port Harcourt, Ibadan expansion
- Property management dashboard (full feature)
- Tenant credit scoring
- Corporate partner API
- Mortgage integration
- Insurance partnerships
- Smart home integration
- **Proactive AI notifications** ("Your saved property dropped in price")
- **AI negotiation assistance**

### 18.5 Key Milestones

| Milestone | Target Date |
|-----------|-------------|
| MVP Launch | Month 4 |
| First 100 protected transactions | Month 4 |
| AI transaction capability live | Month 6 |
| LASRERA partnership live | Month 8 |
| Agent marketplace launch | Month 10 |
| 2,000 rentals completed | Month 12 |
| ₦250M revenue | Month 12 |
| Series A ready | Month 12 |

---

## 19. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Regulatory resistance | Medium | High | Early LASRERA partnership, compliance-first approach |
| Agent/broker backlash | High | Medium | Offer transition program (become verified agents) |
| Fraud despite verification | Low | High | ₦100M guarantee fund, insurance partnership, ML monitoring |
| Low landlord adoption | Medium | High | Zero-fee launch, corporate partnerships, diaspora focus |
| Payment provider issues | Low | High | Multiple provider redundancy, CBN-licensed escrow |
| Data breach | Low | Critical | SOC 2 compliance, penetration testing, bug bounty |
| AI assistant errors | Medium | Medium | Human review for transactions, clear AI limitations, confirmation gates |
| AI hallucinations | Medium | Medium | Grounded responses, fact-checking, source citation |
| Agent quality issues | Medium | Medium | Strict vetting, performance monitoring, quick removal |
| Competitor response | High | Medium | Focus on verification depth, AI differentiation |
| Economic downturn | Medium | Medium | Rental-focused (recession resilient), flexible pricing |

---

## 20. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| C of O | Certificate of Occupancy - legal document proving land ownership |
| LASRERA | Lagos State Real Estate Regulatory Authority |
| NIN | National Identification Number |
| NIMC | National Identity Management Commission |
| LGA | Local Government Area |
| GMV | Gross Merchandise Value - total value of transactions |
| NDPR | Nigeria Data Protection Regulation |
| KYC | Know Your Customer - identity verification process |
| Escrow | Third-party holding of funds until conditions are met |
| FAB | Floating Action Button - persistent UI element |
| Unified Search/AI Bar | Combined search and AI input with mode toggle |

### Appendix B: Data Models

#### User Entity
```
User {
  id: UUID
  nin: String (encrypted)
  phone: String
  email: String
  user_type: Enum (tenant, landlord, buyer, seller, agent)
  verification_level: Enum
  trust_score: Float
  ai_preferences: JSON
  created_at: Timestamp
}
```

#### Property Entity
```
Property {
  id: UUID
  owner_id: UUID
  listing_type: Enum (rent, sale, short-let, land)
  address: String
  lga: String
  verification_tier: Enum (bronze, silver, gold, platinum)
  price: Decimal
  photos: Array<URL>
  c_of_o_verified: Boolean
  physical_audit_date: Timestamp
  ai_description: String (AI-generated summary)
}
```

#### Transaction Entity
```
Transaction {
  id: UUID
  property_id: UUID
  buyer_tenant_id: UUID
  seller_landlord_id: UUID
  transaction_type: Enum (rental, purchase)
  amount: Decimal
  escrow_status: Enum
  agreement_url: URL
  initiated_via: Enum (ui, ai_assistant)
  created_at: Timestamp
}
```

#### Agent Entity
```
Agent {
  id: UUID
  user_id: UUID
  agent_type: Enum (maintenance, inspector, cleaner, security, legal, manager)
  certifications: Array<String>
  service_area: Array<LGA>
  rating: Float
  jobs_completed: Integer
  active: Boolean
}
```

#### AI Interaction Entity
```
AIInteraction {
  id: UUID
  user_id: UUID
  session_id: UUID
  input_text: String
  intent: String
  entities: JSON
  action_taken: String
  action_result: JSON
  screen_context: String
  created_at: Timestamp
}
```

### Appendix C: UI Design System

- **Color Palette:** Primary Blue (#1E88E5), Dark Background (#0D1B2A), Card Background (#1B263B)
- **Typography:** Inter (headings), System fonts (body)
- **Verification Badge Colors:** Bronze (#CD7F32), Silver (#A0AEC0), Gold (#F6AD55), Platinum (#4299E1)
- **Status Colors:** Success (#48BB78), Warning (#ECC94B), Error (#F56565), Info (#4299E1)
- **AI Accent:** Sparkle icon (✨), Gradient highlight for AI mode
- **Component Library:** Custom design system built on Tailwind CSS

### Appendix D: AI Assistant Prompt Examples

| User Intent | Example Prompts |
|-------------|-----------------|
| Property Search | "Show me 3-bedroom apartments in Lekki under 2 million naira" |
| | "I need a pet-friendly house with parking in Victoria Island" |
| | "Find Gold verified properties near my office in Ikeja" |
| Listing Creation | "I want to list my apartment for rent" |
| | "Help me create a listing for my house in Surulere" |
| Applications | "Apply for the first apartment you showed me" |
| | "What's the status of my applications?" |
| Scheduling | "Book a viewing for Saturday morning" |
| | "Reschedule my inspection to next week" |
| Payments | "Pay my December rent" |
| | "Show my payment history" |
| Maintenance | "The AC in my bedroom stopped working" |
| | "I need a plumber, there's a leak in the kitchen" |
| Information | "What does Gold verified mean?" |
| | "How does the escrow system work?" |
| Account | "Update my phone number" |
| | "Show my reputation score" |

---

*Document Version 2.0 | December 2025 | HomeAI Nigeria*
