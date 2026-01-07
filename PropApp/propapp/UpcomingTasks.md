# Upcoming Tasks: Non-Functional UI Elements Analysis

This document lists buttons, links, and clickable elements across the PropertyApp project that don't currently trigger any action (no modal, menu, or navigation).

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Buttons without onClick handlers | 250+ | High |
| Links pointing to `#` | 8 | Medium |
| Buttons with only `e.preventDefault()` | 5 | Low |
| Footer links to non-existent pages | 3 | Medium |

---

## High Priority Issues

### 1. Home Page (`HomePage.tsx`)

| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Search button | 221 | No action | Navigate to `/search` with query params |
| Notifications button | 123 | No action | Open notifications dropdown/modal |
| Category pills (Buy/Rent/Short-let/Land) | 230-241 | Toggle state only | Filter featured properties or navigate to `/search?type=X` |
| Favorite buttons on cards | 307-312 | `e.preventDefault()` only | Toggle favorite, show login modal if not logged in |
| Privacy Policy link | 372 | Links to `/privacy` | Create PrivacyPolicy page |
| Terms of Service link | 375 | Links to `/terms` | Create TermsOfService page |
| Support link | 378 | Links to `/support` | Create Support page |

---

### 2. Search Page (`SearchPage.tsx`)

| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "List your property" button | ~262 | No action | Link to `/landlord/properties/add` or open modal |
| Notifications button | ~265 | No action | Open notifications dropdown |
| Favorite buttons on cards | ~757 | `e.preventDefault()` only | Toggle favorite, save to user's saved properties |

---

### 3. Landlord Dashboard (`LandlordDashboard.tsx`)

| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Property card "View" spans | 216 | `e.preventDefault()` only | Link to property detail page |
| Property carousel arrows | 226, 230 | `e.preventDefault()` only | Navigate carousel |

---

### 4. Agent Pages

#### AgentMyJobs.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Filter button | 161 | No action | Open filter dropdown |
| "Message" button | 238 | No action | Open messaging modal |
| "Navigate" button | 241 | No action | Open maps/directions |
| More options button | 250 | No action | Open actions dropdown |
| "Apply" button | 260 | No action | Apply for job |
| "Skip" button | 287 | No action | Skip/dismiss job |

#### AgentSchedule.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Calendar nav arrows | 138, 141 | No action | Navigate months |
| "Call" button | 249 | No action | Initiate call |
| "Directions" button | 253 | No action | Open maps |
| "Add Availability" button | 284 | No action | Open modal |
| "Sync Calendar" button | 289 | No action | Open sync settings |
| "Notification Preferences" | 293 | No action | Open notification settings |

#### AgentTransactions.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Export button | 132 | No action | Export transactions to CSV/PDF |
| Quick filter buttons | 306, 309 | No action | Filter transactions |

---

### 5. Profile Pages

#### LandlordPublicProfile.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "Message Landlord" button | 246 | No action | Open messaging modal |
| Quick filter buttons | 287, 290, 293 | No action | Filter reviews |
| Write review input | 302 | No action | Open review modal |
| Breadcrumb "Landlords" link | 81 | Links to `#` | Link to landlords directory |

#### AgentPublicProfile.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "Share Profile" button | 93 | No action | Copy link / share modal |
| "Contact Agent" button | 97 | No action | Open contact modal |
| "Request Viewing" button | 174 | No action | Open scheduling modal |
| "View All Reviews" button | 293 | No action | Navigate to reviews section |
| Review filter buttons | 332, 335, 338 | No action | Filter reviews |
| Write review input | 347 | No action | Open review modal |

#### TenantPublicProfile.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "Community" nav link | 68, 80 | Links to `#` | Create community page or remove |

---

### 6. Modals & Components

#### MakePaymentModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "Change" payment method | 92 | No action | Open payment method selector |
| Submit payment button | 166 | No action | Process payment (show confirmation) |

#### DocumentViewerModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "View Full Screen" button | 115 | No action | Toggle fullscreen mode |
| "Download" button | 193 | No action | Download document |
| "Print" button | 197 | No action | Print document |
| "Sign Document" button | 212 | No action | Open signature flow |

#### SignLeaseRenewalModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Zoom buttons | 94, 97 | No action | Zoom in/out on document |
| "Add ID Upload" button | 152 | No action | Open file picker |
| Remove uploaded file | 211 | No action | Remove from queue |

#### ScheduleViewingModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Calendar nav arrows | 125, 129 | No action | Navigate months |
| Mic button | 323 | No action | Voice input |
| Send button | 326 | No action | Send message to agent |

#### BuyFlowModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| Mic button in AI chat | 540 | No action | Voice input |

#### MaintenanceRequestModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| File upload button | 145 | No action | Open file picker |

#### LeaseRenewalModal.tsx
| Element | Line | Current State | Suggestion |
|---------|------|---------------|------------|
| "View Current Lease" button | 190 | No action | Open DocumentViewerModal |

---

### 7. Other Feature Pages with Non-Functional Buttons

#### LandlordApplicantDetail.tsx
- Property link (line 98) links to `#` - should link to `/landlord/properties/:id`

#### ApplicantDetail.tsx
- "Listings" link (line 34) links to `#`
- "Tenants" link (line 36) links to `#`
- "Messages" link (line 37) links to `#`

#### RentalApplicationWizard.tsx
- "Terms & Conditions" link (line 383) links to `#` - should open terms modal or page

---

## Recommended Implementation Order

### Phase 1: Critical Navigation (High Impact)
1. Fix footer links (Privacy/Terms/Support pages)
2. Home page Search button → navigate to `/search`
3. Profile pages message/contact buttons → open modals
4. Breadcrumb links → proper navigation

### Phase 2: Interactive Elements (Medium Impact)
1. Notifications buttons → dropdown menu
2. Favorite/heart buttons → toggle + save to user data
3. Filter buttons → filter dropdowns (partially done on Search page)
4. Calendar navigation arrows

### Phase 3: Document Actions (Lower Priority)
1. Document viewer actions (download, print, fullscreen)
2. File upload handlers
3. Voice input stubs (can be placeholder)

### Phase 4: Future Features
1. Payment processing flow
2. Review submission system
3. Calendar sync integrations
4. Community features

---

## Notes

- Many buttons are styled correctly but lack functionality - prioritize UX-critical paths
- Some elements may be intentional placeholders for future features
- Consider adding toast notifications for stubbed features ("Coming soon!")
- Breaking change risk: LOW - these are additive changes
