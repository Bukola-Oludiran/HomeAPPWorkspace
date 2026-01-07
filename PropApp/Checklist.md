# HomeAI Nigeria Frontend - Development Checklist

## Project Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS
- [x] Set up React Router
- [x] Install shadcn/ui and configure
- [x] Set up project file structure (Advanced/Feature-driven)

---

## Global Components (src/components/)
- [/] Create core UI components library
  - [x] Button component
  - [x] Avatar component
  - [x] Badge component (verification tiers: Bronze, Silver, Gold, Platinum)
  - [x] Card component
  - [x] Input component
  - [x] Modal/Dialog component
  - [ ] PropertyCard component
  - [ ] StatCard component
  - [ ] AIAssistant floating bar component

---

## Layouts (src/layouts/)
- [ ] PublicLayout (floating centered navbar for homepage)
- [ ] LandlordDashboardLayout (sticky header: Dashboard, Properties, Tenants, Financials, Verification Hub)
- [ ] TenantDashboardLayout (sticky header: Dashboard, My Home, Applications, Saved, Messages)
- [ ] AgentDashboardLayout (sticky header: Job Board, My Jobs, Earnings, Schedule, Profile)

---

## Home(TopLevel) Flow - Public Pages
- [x] Homepage (`/`)
  - [x] Hero section with background image
  - [x] Unified search bar with AI toggle
  - [x] Category pills (Buy, Rent, Short-let, Land)
  - [x] Featured properties grid
  - [x] Footer
- [x] Search Results - Grid View (`/search`)
- [ ] Search Results - Map View (`/search?view=map`)
- [x] Property Detail Page (`/property/:id`)
- [ ] Property Images Modal
- [ ] 3D Tour Modal
- [ ] Schedule Viewing Flow
- [ ] Apply Flow (Steps 1-4)
- [ ] Buy Flow (Steps 1-3)
- [ ] Landlord Profile - 3rd Person View (`/landlord/:id`)
- [ ] Tenant Profile - 3rd Person View (`/tenant/:id`)
- [ ] Agent Profile - 3rd Person View (`/agent/:id`)

---

## Landlord Dashboard Flow (`/landlord/*`)
- [x] Dashboard Home (`/landlord/dashboard`)
- [ ] Properties List (`/landlord/properties`)
- [x] Property Detail - Verified (`/landlord/properties/:id`)
- [ ] Property Detail - Verification Pending
- [ ] Property Detail - Edit Listing
- [ ] Property Detail - Schedule Maintenance
- [ ] Property Tasks
- [ ] Property Verification Hub
- [ ] Property Wizard (Steps 1-4 + Final)
- [x] Tenants/Applicant Manager (`/landlord/tenants`)
- [ ] Applicant Detail
- [ ] Applicant Manager - New Application Flow (Steps 1-2)
- [ ] Tenant Profile (Landlord View)
- [ ] Financials (`/landlord/financials`)
- [ ] Lease Agreement
- [ ] Lease Agreement - Draft Renewal Offer
- [ ] Lease Details - Edit Lease Terms
- [ ] Landlord Profile (`/landlord/profile`)

---

## Tenant Dashboard Flow (`/tenant/*`)
- [x] Tenant Dashboard Home (`/tenant/dashboard`)
- [x] My Home (`/tenant/my-home`)
  - [ ] My Home - Lease Details
  - [ ] My Home - Maintenance Requests
  - [ ] My Home - Respond to Offer
  - [ ] My Home - Offer Response Accept/Reject
- [ ] Applications Tracker (`/tenant/applications`)
- [ ] Application Details
- [ ] Application Details - Withdraw Application Popup
- [ ] Saved Properties - Grid View (`/tenant/saved`)
- [ ] Saved Properties - List View
- [ ] Payments History (`/tenant/payments`)
  - [ ] Payments History - Billing Details Modal
  - [ ] Payments History - Make Payment
- [ ] Maintenance Request Detail
- [ ] Tenant Profile (`/tenant/profile`)
- [ ] Messages (`/tenant/messages`)

---

## Agent Dashboard Flow (`/agent/*`)
- [x] Agent Job Board (`/agent/jobs`)
- [ ] My Jobs/Schedule (`/agent/schedule`)
  - [ ] Schedule - Add Personal Event Modal
  - [ ] Schedule - Report Job Issue
- [ ] Earnings Dashboard (`/agent/earnings`)
- [ ] Agent Profile (`/agent/profile`)

---

## General/Shared Screens
- [ ] Document Viewer
- [ ] Message/Chat Page (`/messages`)
  - [ ] Message - Profile Open
- [ ] Transaction History

---

## Integrations & Polish
- [ ] Dark mode support
- [ ] Responsive design (mobile-first)
- [ ] Loading/skeleton states
- [ ] Error states
- [ ] Form validation
- [ ] Navigation guards (auth simulation)

---

## Testing & Verification
- [ ] Visual review of all screens against design PNGs
- [ ] Route navigation testing
- [ ] Responsive breakpoint testing
- [ ] Component library review
