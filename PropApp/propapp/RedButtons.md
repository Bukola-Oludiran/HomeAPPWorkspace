# Red-Themed Buttons & Clickables

A comprehensive list of all red-themed buttons, clickables, and interactive elements in the PropApp application.

---

## Settings Page
**File:** `src/pages/Home/SettingsPage.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 286 | `Remove` button | Profile photo remove button |
| 502 | `Deactivate Account` button | Account deactivation in Login & Security |
| 572 | `Delete My Data` button | Data deletion in Privacy section |

---

## AI Chat Page
**File:** `src/pages/Home/AIChatPage.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 249 | Clear chat button | Button to clear conversation history |

---

## Landlord Dashboard Pages

### LandlordApplicantDetail.tsx
**File:** `src/features/landlord/pages/LandlordApplicantDetail.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 91 | `Reject` button | Reject applicant button in header |

### LandlordEditListing.tsx
**File:** `src/features/landlord/pages/LandlordEditListing.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 25 | `Delete Listing` button | Header delete listing button |
| 135, 148, 161, 174 | Delete image buttons | Remove buttons on property images |

### LandlordEditLeaseTerms.tsx
**File:** `src/features/landlord/pages/LandlordEditLeaseTerms.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 192 | Delete clause button | Remove clause from lease |
| 213 | Delete clause button | Remove clause from lease |

### LandlordLeaseAgreement.tsx
**File:** `src/features/landlord/pages/LandlordLeaseAgreement.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 318 | `Decline Renewal` button | Decline lease renewal option |

### ApplicantManager.tsx
**File:** `src/features/landlord/pages/ApplicantManager.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 412 | `Reject` button | Reject applicant in card |

### ApplicantDetail.tsx
**File:** `src/features/landlord/pages/ApplicantDetail.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 77 | `Reject` button | Reject applicant button in header |

### PropertyWizard.tsx
**File:** `src/features/landlord/pages/PropertyWizard.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 249 | Delete image button | Remove uploaded property image |

---

## Tenant Dashboard Pages

### TenantApplications.tsx
**File:** `src/features/tenant/pages/TenantApplications.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 232 | `Withdraw` button | Withdraw application button |

### TenantApplicationDetail.tsx
**File:** `src/features/tenant/pages/TenantApplicationDetail.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 93 | `Withdraw Application` button | Withdraw application in header |

### TenantMaintenanceDetail.tsx
**File:** `src/features/tenant/pages/TenantMaintenanceDetail.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 298 | `Cancel Request` button | Cancel maintenance request |

### TenantSavedProperties.tsx
**File:** `src/features/tenant/pages/TenantSavedProperties.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 291 | Remove favorite button | Remove property from saved list |

---

## Agent Dashboard Pages

### AgentProfile.tsx
**File:** `src/features/agent/pages/AgentProfile.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 250 | Delete certification button | Remove certification |
| 301 | Delete service area button | Remove service area |

---

## Modals

### LeaseRenewalModal.tsx
**File:** `src/components/LeaseRenewalModal.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 202 | `Decline` button | Decline lease renewal offer |

### RejectOfferModal.tsx
**File:** `src/components/RejectOfferModal.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 143 | `Reject Offer` button | Confirm rejection button |

### WithdrawApplicationModal.tsx
**File:** `src/components/WithdrawApplicationModal.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 70 | `Withdraw Application` button | Confirm withdrawal button |

### VirtualTourModal.tsx
**File:** `src/components/VirtualTourModal.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 36 | Close button | Modal close with hover:text-red-500 |

### SignLeaseRenewalModal.tsx
**File:** `src/components/SignLeaseRenewalModal.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 209 | Remove signature button | Delete uploaded signature |

---

## Other Interactive Elements

### PropertyDetail.tsx
**File:** `src/pages/Property/PropertyDetail.tsx`

| Line | Element | Description |
|------|---------|-------------|
| 105 | Favorite heart icon | Active favorite state (icon-filled) |

---

## Summary by Category

### Destructive Actions
- Delete / Remove buttons (images, data, items)
- Reject / Decline buttons (applicants, offers)
- Withdraw buttons (applications)
- Cancel buttons (requests)
- Deactivate buttons (accounts)

### Styling Patterns Used
- `text-red-600 dark:text-red-400` - Standard red text
- `bg-red-50 dark:bg-red-900/10` - Light red background
- `border-red-200 dark:border-red-900/30` - Red border
- `hover:bg-red-100 dark:hover:bg-red-900/20` - Red hover state
