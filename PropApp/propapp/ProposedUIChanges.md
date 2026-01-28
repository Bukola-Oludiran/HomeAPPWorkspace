# Proposed UI Changes

This document tracks UI modifications proposed during the backend integration process. Each change requires approval before implementation.

---

## Status Legend
- 🟡 **Pending** - Awaiting approval
- ✅ **Approved** - Ready for implementation
- ❌ **Rejected** - Will not implement
- 🔄 **Modified** - Approved with changes

---

## Proposed Changes

### 1. Add Loading States to All Data-Driven Pages
**Status**: 🟡 Pending

**Current Behavior**: Pages immediately render with mock data

**Proposed Change**: Add skeleton loading states while API data is being fetched

**Rationale**: 
- Real API calls take time; users need visual feedback
- Prevents layout shift when data loads
- Improves perceived performance

**Affected Pages**:
- All dashboard pages (Landlord, Tenant, Agent)
- SearchPage.tsx
- PropertyDetail.tsx
- Profile pages

**Implementation**: Add shimmer/skeleton components matching current card layouts

---

### 2. Add Empty States for Lists and Tables
**Status**: 🟡 Pending

**Current Behavior**: Lists always show mock data; no empty state design

**Proposed Change**: Add illustrated empty states with call-to-action buttons

**Rationale**:
- New users won't have properties, applications, or transactions
- Empty states guide users to take actions
- Better UX than showing blank sections

**Affected Components**:
- Property lists (Landlord dashboard, search results)
- Application lists (Tenant, Landlord applicants)
- Transaction tables
- Maintenance request lists

**Suggested Empty State Messages**:
| Component | Message | CTA |
|-----------|---------|-----|
| Landlord Properties | "No properties yet" | "Add Your First Property" |
| Tenant Saved | "No saved properties" | "Browse Properties" |
| Tenant Applications | "No applications yet" | "Search Properties" |
| Notifications | "All caught up!" | None |

---

### 3. Add Error State UI for API Failures
**Status**: 🟡 Pending

**Current Behavior**: No error handling UI exists

**Proposed Change**: Add error boundary components and inline error states

**Rationale**:
- API calls can fail; users need clear feedback
- Should offer retry options
- Prevents blank/broken pages

**Components to Add**:
- Global error boundary with "Something went wrong" page
- Inline error cards with "Retry" button
- Toast notifications for transient errors

---

### 4. Add Form Validation Feedback to Auth Pages
**Status**: 🟡 Pending

**Current Behavior**: Forms have no real-time validation feedback

**Proposed Change**: Add inline validation messages matching backend validation

**Rationale**:
- Backend enforces password strength, email format, etc.
- Showing validation before submit improves UX
- Reduces failed API calls

**Affected Pages**:
- LoginPage.tsx (email format, password required)
- SignUpStep1.tsx (email format)
- SignUpStep3.tsx (password strength indicator)
- PasswordResetPage.tsx (password match, strength)

---

### 5. Add Pagination Controls to List Pages
**Status**: 🟡 Pending

**Current Behavior**: Lists show all items (mock data is limited)

**Proposed Change**: Add pagination controls (page numbers, next/prev, items per page)

**Rationale**:
- Backend uses pagination (page, limit params)
- Large datasets need pagination for performance
- Matches backend response format (`{ items, total, page, totalPages }`)

**Affected Pages**:
- SearchPage.tsx
- LandlordTransactions.tsx
- TenantPayments.tsx
- AgentJobBoard.tsx

---

### 6. Add "Authentication Required" Modal for Guest Actions
**Status**: 🟡 Pending

**Current Behavior**: FavoriteButton works without auth; no auth prompts

**Proposed Change**: Show auth modal when non-logged-in users try protected actions

**Rationale**:
- Backend requires auth for favorites, applications, etc.
- Better UX than silent failures or redirects
- Encourages account creation

**Affected Components**:
- FavoriteButton.tsx (save property)
- "Apply" button on PropertyDetail.tsx
- "Contact Agent" functionality

---

### 7. Add Session Expiry Handling
**Status**: 🟡 Pending

**Current Behavior**: No session management exists

**Proposed Change**: 
- Detect 401 responses and show session expired modal
- Auto-refresh tokens before expiry
- "Session expired, please log in again" modal

**Rationale**:
- JWT tokens expire (15 min access, 7 day refresh)
- Users shouldn't lose work on token expiry
- Security best practice

---

### 8. Update Navbar to Show User Info When Logged In
**Status**: 🟡 Pending

**Current Behavior**: UnifiedNavbar is static, doesn't reflect auth state

**Proposed Change**: 
- Show user avatar and name when logged in
- Change "Sign In" to user dropdown menu
- Add quick links based on role

**Rationale**:
- Users need confirmation they're logged in
- Role-specific navigation improves UX
- Standard pattern for authenticated apps

---

## Notes

*Add new proposed changes below as they arise during implementation.*

