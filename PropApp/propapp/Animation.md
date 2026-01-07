# Animation Plan - Premium UI Enhancement

> **Goal**: Transform the UI from "Standard SaaS" to "Premium Product" through micro-choreography — animations that explain relationships and delight users without slowing them down.

## 📦 Dependencies to Install

```bash
npm install gsap @gsap/react canvas-confetti react-countup
```

| Package | Size | Purpose |
|---------|------|---------|
| `gsap` | ~27KB | Core animations, stagger, magnetic effects |
| `@gsap/react` | ~2KB | React hooks for GSAP |
| `canvas-confetti` | ~2KB | Success celebrations |
| `react-countup` | ~4KB | Rolling number counters |

---

## 🎬 Animation Patterns

### 1. Bento Grid Reveal (Staggered Load)
**Effect**: Cards spring up one-by-one with tactile bounce

```tsx
// Start: scale: 0.95, y: 20, opacity: 0
// End: scale: 1, y: 0, opacity: 1
// Stagger: 0.1s, Ease: Back.easeOut(1.7)
```

**Pages to Update:**
- [ ] LandlordDashboard (4 stats cards + property list)
- [ ] TenantDashboard (stats + sections)
- [ ] AgentEarnings (stats grid)
- [ ] LandlordFinancials (stats + chart areas)
- [ ] TenantPayments (payment sections)

---

### 2. Kinetic Typography (Rolling Counters)
**Effect**: Numbers count up rapidly from 0

**Components to Enhance:**
- [ ] `StatsCard` - Add `animateOnMount` prop
- [ ] `SectionCard` - Animate numeric headers if present

**Pages with Stats:**
- [ ] LandlordDashboard (4 stat values)
- [ ] TenantDashboard (balance, due date)
- [ ] AgentEarnings (earnings totals)
- [ ] LandlordFinancials (income, expenses, net)
- [ ] TenantPayments (amount due)
- [ ] AgentMyJobs (job counts)

---

### 3. Magnetic Button (Cursor Tracking)
**Effect**: Button subtly moves toward cursor on hover

**Create Component:**
- [ ] `MagneticButton.tsx` wrapper component

**Apply to Primary CTAs:**
- [ ] "Sign Contract" buttons
- [ ] "Pay Now" buttons
- [ ] "Submit Application" buttons
- [ ] "Add Property" buttons
- [ ] "Accept Job" buttons

**Pages with Key CTAs:**
- [ ] LandlordLeaseAgreement (Sign button)
- [ ] TenantPayments (Pay button)
- [ ] TenantApplications (Apply button)
- [ ] AgentJobDetail (Accept button)
- [ ] PropertyWizard (Submit button)

---

### 4. Glassmorphism Focus State
**Effect**: Input lifts, background dims, glow pulses

**Components to Enhance:**
- [ ] `SearchInput` - Add focus scale + glow
- [ ] Form inputs globally via CSS utility class

**Pages with Forms:**
- [ ] LandlordProfile (edit form)
- [ ] TenantProfile (edit form)
- [ ] AgentProfile (edit form)
- [ ] PropertyWizard (multi-step form)
- [ ] LandlordEditListing (property form)
- [ ] LandlordEditLeaseTerms (lease form)

---

### 5. Success Celebration (Confetti + Lock)
**Effect**: Button morphs → lock snaps → confetti bursts

**Create Component:**
- [ ] `SuccessCelebration.tsx` modal component

**Apply to Key Success Moments:**
- [ ] LandlordLeaseAgreement (contract signed)
- [ ] TenantPayments (payment successful)
- [ ] PropertyWizard (property listed)
- [ ] TenantApplications (application submitted)
- [ ] AgentJobDetail (job accepted)
- [ ] LandlordVerificationHub (verification complete)

---

## 📄 Page-by-Page Animation Checklist

### Landlord Pages (18)

| Page | Stagger | Counters | Magnetic | Focus | Celebration |
|------|---------|----------|----------|-------|-------------|
| [ ] LandlordDashboard | ✅ | ✅ | - | - | - |
| [ ] LandlordProperties | ✅ | - | ✅ | - | - |
| [ ] LandlordPropertyDetail | ✅ | ✅ | - | - | - |
| [ ] LandlordFinancials | ✅ | ✅ | - | - | - |
| [ ] LandlordTransactions | ✅ | - | - | - | - |
| [ ] LandlordLeaseAgreement | ✅ | - | ✅ | ✅ | ✅ |
| [ ] LandlordProfile | ✅ | - | - | ✅ | - |
| [ ] LandlordAlertCenter | ✅ | ✅ | - | - | - |
| [ ] LandlordVerificationHub | ✅ | - | ✅ | - | ✅ |
| [ ] LandlordPropertyTasks | ✅ | ✅ | - | - | - |
| [ ] LandlordMaintenanceDetail | ✅ | - | ✅ | - | - |
| [ ] LandlordEditListing | ✅ | - | - | ✅ | - |
| [ ] LandlordEditLeaseTerms | ✅ | - | - | ✅ | - |
| [ ] PropertyWizard | ✅ | - | ✅ | ✅ | ✅ |
| [ ] ApplicantManager | ✅ | ✅ | - | - | - |
| [ ] ApplicantDetail | ✅ | - | ✅ | - | - |
| [ ] LandlordApplicantDetail | ✅ | - | ✅ | - | - |
| [ ] TenantProfileLandlordView | ✅ | - | - | - | - |

### Tenant Pages (12)

| Page | Stagger | Counters | Magnetic | Focus | Celebration |
|------|---------|----------|----------|-------|-------------|
| [ ] TenantDashboard | ✅ | ✅ | - | - | - |
| [ ] TenantMyHome | ✅ | ✅ | - | - | - |
| [ ] TenantPayments | ✅ | ✅ | ✅ | - | ✅ |
| [ ] TenantTransactions | ✅ | - | - | - | - |
| [ ] TenantApplications | ✅ | ✅ | ✅ | - | ✅ |
| [ ] TenantApplicationDetail | ✅ | - | - | - | - |
| [ ] TenantMaintenance | ✅ | ✅ | - | - | - |
| [ ] TenantMaintenanceDetail | ✅ | - | ✅ | - | - |
| [ ] TenantMessages | ✅ | - | - | - | - |
| [ ] TenantProfile | ✅ | - | - | ✅ | - |
| [ ] TenantSavedProperties | ✅ | ✅ | - | - | - |
| [ ] TenantLeaseDetails | ✅ | - | - | - | - |

### Agent Pages (7)

| Page | Stagger | Counters | Magnetic | Focus | Celebration |
|------|---------|----------|----------|-------|-------------|
| [ ] AgentEarnings | ✅ | ✅ | - | - | - |
| [ ] AgentJobBoard | ✅ | ✅ | - | - | - |
| [ ] AgentJobDetail | ✅ | - | ✅ | - | ✅ |
| [ ] AgentMyJobs | ✅ | ✅ | - | - | - |
| [ ] AgentProfile | ✅ | - | - | ✅ | - |
| [ ] AgentSchedule | ✅ | ✅ | - | - | - |
| [ ] AgentTransactions | ✅ | - | - | - | - |

### Public Pages (4+)

| Page | Stagger | Counters | Magnetic | Focus | Celebration |
|------|---------|----------|----------|-------|-------------|
| [ ] SearchPage | ✅ | ✅ | - | ✅ | - |
| [ ] PropertyDetail | ✅ | - | ✅ | - | - |
| [ ] AIChatPage | ✅ | - | - | - | - |
| [ ] Login/Signup | ✅ | - | ✅ | ✅ | - |

---

## 🧩 Component Animation Enhancements

### Common Components (12)

| Component | Animation Type | Status |
|-----------|---------------|--------|
| [ ] `StatsCard` | Rolling counter on mount | |
| [ ] `SectionCard` | Stagger child reveal | |
| [ ] `PropertyCard` | Hover lift + shadow | |
| [ ] `SearchInput` | Focus glow + scale | |
| [ ] `StatusBadge` | Subtle pulse on status change | |
| [ ] `EmptyState` | Gentle bounce in | |
| [ ] `TransactionTable` | Row stagger reveal | |
| [ ] `ViewToggle` | Smooth slide indicator | |
| [ ] `Breadcrumb` | Fade in sequence | |
| [ ] `PageHeader` | Slide down with title | |
| [ ] `PageContainer` | Orchestrate child animations | |
| [ ] `DateRangeFilter` | Dropdown slide | |

### New Components to Create

| Component | Purpose | Status |
|-----------|---------|--------|
| [ ] `MagneticButton.tsx` | Cursor-tracking button wrapper | |
| [ ] `AnimatedCard.tsx` | Stagger animation wrapper | |
| [ ] `CountUp.tsx` | Rolling number display | |
| [ ] `SuccessCelebration.tsx` | Confetti + lock modal | |

---

## 📋 Implementation Order

### Phase 1: Foundation (Quick Wins)
1. [ ] Install dependencies (gsap, @gsap/react, react-countup, canvas-confetti)
2. [ ] Create `AnimatedCard.tsx` wrapper component
3. [ ] Enhance `StatsCard` with rolling counter
4. [ ] Add stagger reveal to LandlordDashboard

### Phase 2: Interactive Polish
5. [ ] Create `MagneticButton.tsx` component
6. [ ] Add focus glow to `SearchInput`
7. [ ] Apply magnetic effect to key CTAs
8. [ ] Enhance form inputs with glassmorphism focus

### Phase 3: Celebration Moments
9. [ ] Create `SuccessCelebration.tsx` component
10. [ ] Integrate into LandlordLeaseAgreement
11. [ ] Integrate into TenantPayments
12. [ ] Integrate into PropertyWizard

### Phase 4: Full Rollout
13. [ ] Apply stagger to all dashboard pages
14. [ ] Apply counters to all stats displays
15. [ ] Polish and performance optimization
16. [ ] Accessibility: respect prefers-reduced-motion

---

## ⚙️ Technical Notes

### GSAP React Integration
```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);
```

### Respecting Reduced Motion
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Run animations
}
```

### Font for Counters
```css
.counter-text {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}
```

---

## ✅ Completion Checklist

- [ ] Phase 1: Foundation (4 items)
- [ ] Phase 2: Interactive Polish (4 items)
- [ ] Phase 3: Celebration Moments (4 items)
- [ ] Phase 4: Full Rollout (4 items)

**Total Animation Targets:**
- 37 Pages
- 12 Common Components
- 4 New Animation Components
- 5 Animation Patterns

---

*Created: 2026-01-02*
*Estimated Tasks: ~60+ animation integrations*
