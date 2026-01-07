1. Information Architecture (Sitemap)
This structure is derived directly from the user personas (Adaeze, Chief Okonkwo, Agents) and the platform architecture defined in the PRD.



A. Public / Discovery

Home: Landing page with Unified Search/AI Toggle.

Search Results: List view / Map view toggle with filters.

Property Detail: Full listing info, galleries, AI chat context.

Content Pages: About Us, Blog, Trust & Safety.

B. Consumer Portal (Tenant/Buyer)

Dashboard: Overview of active rentals, applications, and shortcuts.

My Rentals: Current lease details, rent due dates.

Maintenance: Request log, submit new request (AI-assisted).

Applications: Status tracker (Pending, Approved, Escrow).

Saved/Favorites: Shortlisted properties.

Messages: Chat with landlords/agents.

C. Landlord / Seller Portal

Dashboard: Financial overview, occupancy rates, actionable alerts.

My Properties: List of assets with status (Active, Rented, Maintenance).

Verification Hub: 7-step progress tracker for property badges.

Listing Wizard: Flow to add new property (Sale/Rent).

Applicant Manager: Review tenants, run checks, approve/reject.

D. Agent Portal

Job Board: Available gigs (Inspection, Cleaning, Repairs).

My Schedule: Calendar view of accepted jobs.

Earnings: Wallet, payout history.

Profile: Certifications, ratings, service area.

2. Developer Handoff Specifications (Page-by-Page)
Global CSS/Theme Variables (Reference):

--primary-blue: #0052FF

--bg-gray: #F4F6F8

--text-primary: #1A1A1A

--spacing-m: 16px

--radius-card: 12px

Page 1: Homepage (Mobile)

Purpose: Primary entry point. Focus on immediate search or AI interaction.

Layout: Single Column Stack.

Header: Transparent/White transition. Logo (Left), Hamburger Menu (Right).

Hero Section:

Component: Unified Search Bar (Fixed position in Hero).

Specs: Height 56px, Radius 28px.

Interaction: Toggle Switch inside bar: [ 🔍 Search ] vs [ ✨ AI ].

State A (Search): Standard input "Location, price...".

State B (AI): Input changes to "Ask me... e.g. 2-bed in Lekki".

Category Pills: Horizontal Scroll.

Items: Buy, Rent, Short-let, Land.

Style: Pill shape, BG-White, Border-Gray-200. Active: BG-Blue-50, Border-Blue.

Featured Section:

Card Type: Vertical Property Card.

Image: 4:3 Aspect Ratio.

Badge: Prominent Tier Badge (e.g., Gold #F1C40F) top-left of image.

Bottom Nav: Standard Navigation Menu.

Page 2: Search Results

Purpose: Browsing and filtering listings.

Layout: Split View (List/Map toggle) or Infinite Scroll List.

Header: Sticky Search Bar (Compressed version).

Filter Bar: Horizontal scroll below header.

Items: Price, Type, Beds, Verified Only.

Interaction: Tapping opens Sidebar (Drawer).

Property Cards:

Container: BG-White, Radius-12px, Shadow-sm.

Typography: Price (Heading-M, Bold), Address (Body-Base, Reg).

Verification Badge: CRITICAL. Must be solid pill style.

If Platinum: Background #2980B9, Text White. Icon: Shield Check.

Floating AI Bar:

Status: HIDDEN. (Search bar is already present at top).

Empty State:

Illustration: "No houses found."

Action: "Let AI find it for you" (Button switches Search Bar to AI Mode).

Page 3: Property Detail Page

Purpose: Conversion. High trust, detailed info.

Header: Transparent, back button over image gallery.

Hero Image: 100% width, carousel dots.

Title Block:

Price: Heading-XL (#0052FF).

Badge: Large Prominent Badge (e.g., "PLATINUM VERIFIED") below title. Tooltip on tap explaining requirements.

Action Panel (Sticky Bottom):

Container: White, Top Border.

Buttons: Two-up grid.

"Schedule Viewing" (Secondary/Outline).

"Rent Now / Apply" (Primary/Solid Blue).

Floating AI Bar:

Status: VISIBLE (Floating above Sticky Action Panel).

Context: Pre-seeded with context. User asks "Is this area safe?" -> AI answers specific to this property.

Z-Index: 999 (Above content, below Modals).

Page 4: Verification Dashboard (Landlord)

Purpose: Gamified progress tracker for property trust levels.

Header: "Get Verified".

Progress Card:

Visual: Circular Progress Ring (e.g., "40% Complete").

Current Tier: "Bronze" (Orange Pill).

Next Tier: "Silver" (Gray Pill - Ghost state).

Step List (Vertical Accordion):

Items: 1. Identity (Checked), 2. Address (Checked), 3. C of O (Pending), 4. Physical Audit (Locked).

Status Icons: Green Check (Done), Yellow Clock (Review), Gray Lock (Pending).

Action Area:

Upload: Drag & Drop zone for documents (C of O, Utility Bill).

Feedback: Toast message on success "Document Uploaded".

Page 5: Tenant Dashboard

Purpose: Management of current living situation.

Greeting: "Welcome home, Adaeze."

Quick Stats (Horizontal Scroll Cards):

Rent Due: "12 Days" (Color scale: Green > Yellow > Red).

Active Issues: "1 Open" (Maintenance).

Current Rental Card:

Image: Thumbnail of property.

Landlord: Profile pic + Name + Trust Badge.

Actions: "Pay Rent", "Report Issue".

Floating AI Bar:

Status: VISIBLE.

Suggested Chips: "Report a leak", "When is rent due?", "Message landlord".

Page 6: Maintenance Request (AI Flow)

Purpose: Reporting issues efficiently.

Entry: User taps microphone on Floating AI Bar and says "My sink is leaking."

UI Response: AI Bar expands to Bottom Sheet.

Form Auto-fill:

Category: Plumbing (Auto-selected).

Urgency: Medium (Suggested).

Description: "Sink leaking..." (Transcribed text).

Manual Override: Standard form inputs for user to edit AI suggestions.

Media Upload: Large "Add Photos" button (Required for Dispute Resolution).

Submit: "Send Request to [Landlord Name]".

Page 7: Agent Job Board

Purpose: Gig economy style feed for service providers.

Filter: "Near Me", "High Pay", "Urgent".

Job Cards:

Title: "AC Repair - Lekki Phase 1".

Pay: "₦15,000" (Bold/Green).

Time: "Today, 2:00 PM".

Action: "Accept Job" (Primary), "Decline" (Text Link).

Map View: Toggle to show pins of job locations relative to Agent's current location.

Page 8: Listing Creation Wizard (Seller)

Purpose: Data entry for new properties.

Layout: Stepper (Progress bar at top: 1 of 5).

Step 1: AI Assist:

Input: "Paste a description or upload a video tour."

Result: AI auto-fills fields (Beds, Baths, Amenities) based on input.

Manual Fields: Standard Inputs with 8px radius.

Verification Prompt:

Interruption: "Upload C of O now to get Gold Badge immediately?"

Visual: Gold Card shimmer effect to incentivize upload.

Preview: "See how your listing looks" button.

3. Shared Components (Global)

Menus (Drawers):

Profile Menu: Slide from right. Contains: Edit Profile, Verification Status, Switch Mode (Tenant/Landlord), Settings, Logout.

Modals:

Style: Bottom Sheet (Mobile), Centered Card (Desktop).

Usage: Confirmations ("Confirm Payment"), Filters, AI Detailed Responses.

Loaders:

Skeleton Screens: Gray pulsing blocks for loading cards.

AI Thinking: Three bouncing dots inside the Floating Bar.

Empty States:

Visual: Custom illustrations (e.g., empty house, quiet street).

Copy: "Nothing here yet."

CTA: Primary button to trigger action (e.g., "Search Properties").