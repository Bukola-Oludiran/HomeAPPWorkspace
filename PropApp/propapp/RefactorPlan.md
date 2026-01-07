# PropApp Refactor Plan

> **Goal**: Make the codebase more DRY and maintainable by abstracting repeated patterns into reusable components.

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Pages Analyzed | 46 |
| Public/Shared Pages | 9 |
| Agent Dashboard Pages | 7 |
| Landlord Dashboard Pages | 18 |
| Tenant Dashboard Pages | 12 |
| Existing Shared Components | 32 |
| Existing UI Components | 8 |

---

## 🔴 High Priority - Repeated Across 20+ Pages

### 1. `PageContainer` Component
**Found in: 29+ pages**

Every dashboard page uses the same container pattern:
```tsx
<div className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 pb-32">
  <div className="max-w-[1400px] w-full mx-auto">
    {/* content */}
  </div>
</div>
```

**Proposed Component:**
```tsx
interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // default 1400px
  noPaddingBottom?: boolean;
}
```

**Pages to Update:**
- [ ] All Agent pages (7)
- [ ] All Landlord pages (18)
- [ ] All Tenant pages (12)
- [ ] Profile pages (3)

---

### 2. `PageHeader` Component
**Found in: 34+ pages**

Every page has a similar header structure:
```tsx
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
  <div>
    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      {title}
    </h1>
    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
      {subtitle}
    </p>
  </div>
  <div className="flex gap-3">
    {/* action buttons */}
  </div>
</div>
```

**Proposed Component:**
```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}
```

**Pages to Update:**
- [ ] LandlordDashboard, LandlordProperties, LandlordFinancials, LandlordProfile, etc.
- [ ] TenantDashboard, TenantPayments, TenantApplications, TenantMaintenance, etc.
- [ ] AgentEarnings, AgentJobBoard, AgentMyJobs, AgentProfile, etc.

---

### 3. `Card` / `SectionCard` Component
**Found in: 100+ instances**

Repeated pattern for content cards:
```tsx
<div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
  {/* content */}
</div>
```

**Proposed Component:**
```tsx
interface SectionCardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'interactive' | 'highlighted';
  header?: { title: string; action?: React.ReactNode };
}
```

**Note:** Already have `src/components/ui/card.tsx` but not being used consistently.

---

## 🟠 Medium Priority - Repeated Across 10-20 Pages

### 4. `Breadcrumb` Component
**Found in: 10+ pages**

Pattern for detail pages:
```tsx
<nav aria-label="Breadcrumb" className="flex mb-6">
  <ol className="flex items-center gap-2 text-sm">
    <li><Link to="/parent" className="text-slate-800 ...">Parent</Link></li>
    <li><span className="material-symbols-outlined ...">chevron_right</span></li>
    <li><span className="text-slate-800 ...">Current</span></li>
  </ol>
</nav>
```

**Proposed Component:**
```tsx
interface BreadcrumbItem {
  label: string;
  href?: string; // if undefined, treated as current page
}
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}
```

**Pages to Update:**
- [ ] LandlordApplicantDetail, LandlordMaintenanceDetail, LandlordAlertCenter
- [ ] TenantApplicationDetail
- [ ] AgentJobDetail
- [ ] ApplicantDetail
- [ ] All Public Profile pages

---

### 5. `StatsCard` Component
**Found in: 6+ pages**

Stats cards pattern:
```tsx
<div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border ... shadow-sm">
  <div className="flex items-center justify-between mb-2">
    <span className="material-symbols-outlined text-[color] text-[24px]">{icon}</span>
    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
      {change}
    </span>
  </div>
  <p className="text-xs text-slate-500 font-medium">{label}</p>
  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</h3>
</div>
```

**Proposed Component:**
```tsx
interface StatsCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  change?: { value: string; isPositive: boolean };
  subtext?: string;
}
```

**Pages to Update:**
- [ ] LandlordDashboard (3 cards)
- [ ] LandlordFinancials (4 cards)
- [ ] LandlordPropertyTasks (3 cards)
- [ ] TenantPayments (3 cards)
- [ ] AgentEarnings (3 cards)
- [ ] AgentJobBoard (4 cards)

---

### 6. `FilterDropdown` Component Enhancement
**Found in: 8+ pages, existing component underutilized**

Already have `src/components/FilterDropdown.tsx` but many pages have inline implementations.

**Pages Using Inline Filter:**
- [ ] LandlordDashboard (recently added)
- [ ] LandlordProperties (recently added)
- [ ] ApplicantManager (recently added)
- [ ] TenantApplications (recently added)
- [ ] TenantSavedProperties (recently added)
- [ ] AgentJobBoard

**Action:** Migrate all inline dropdowns to use standardized FilterDropdown component.

---

### 7. `TransactionTable` Component
**Found in: 4 pages with nearly identical structure**

Transaction table pattern:
- Table with header row
- Transaction rows with icon, description, date, status, amount
- Pagination or "Load More"

**Pages:**
- [ ] LandlordTransactions
- [ ] TenantTransactions  
- [ ] AgentTransactions
- [ ] AgentEarnings (Payout History table)

**Proposed Component:**
```tsx
interface Transaction {
  id: number;
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  date: string;
  status: string;
  statusColor: string;
  amount: string;
  isPositive?: boolean;
}
interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails?: (id: number) => void;
  emptyMessage?: string;
}
```

---

### 8. `PropertyCard` Component
**Found in: 10+ locations**

Property display card used in:
- Search results
- Dashboard property lists
- Saved properties
- Application detail sidebar

**Variants needed:**
- Grid view (compact)
- List view (horizontal)
- Mini/Preview (sidebar widget)

**Pages to Update:**
- [ ] SearchPage
- [ ] LandlordProperties (already has local component)
- [ ] LandlordDashboard
- [ ] TenantSavedProperties
- [ ] TenantApplicationDetail
- [ ] AIChatPage

---

## 🟡 Lower Priority - Repeated Across 5-10 Pages

### 9. `EmptyState` Component
**Found in: 5+ pages**

Empty state pattern:
```tsx
<div className="text-center py-12">
  <span className="material-symbols-outlined text-3xl text-slate-400">{icon}</span>
  <h3 className="font-bold text-lg text-slate-700 mt-2">{title}</h3>
  <p className="text-slate-500 text-sm">{description}</p>
  <button className="...">{actionLabel}</button>
</div>
```

**Proposed Component:**
```tsx
interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Pages to Update:**
- [ ] AgentMyJobs
- [ ] TenantSavedProperties (grid/list versions)
- [ ] Any filtered list that can be empty

---

### 10. `StatusBadge` Component
**Found in: 20+ pages**

Status indicator pattern:
```tsx
<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
  <span className="size-1.5 rounded-full bg-current"></span>
  {status}
</span>
```

**Proposed Component:**
```tsx
type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
interface StatusBadgeProps {
  status: string;
  variant: BadgeVariant;
  showDot?: boolean;
}
```

**Note:** Already have `src/components/ui/badge.tsx` - need to extend and use consistently.

---

### 11. `Icon` Component Wrapper
**Found in: 700+ instances across codebase**

Material Symbols icon pattern:
```tsx
<span className="material-symbols-outlined text-[20px] text-slate-400">icon_name</span>
```

**Proposed Component:**
```tsx
interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string; // Tailwind color class
  filled?: boolean;
  className?: string;
}
```

---

### 12. `SearchInput` Component
**Found in: 12+ pages**

Search input pattern:
```tsx
<div className="relative">
  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
  <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 ... rounded-xl text-sm ..." placeholder="Search..." />
</div>
```

**Proposed Component:**
```tsx
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'compact';
}
```

---

### 13. `ViewToggle` Component
**Found in: 4+ pages**

Grid/List view toggle:
```tsx
<div className="flex bg-white dark:bg-[#1e293b] rounded-lg p-1 border ...">
  <button onClick={() => setViewMode('grid')} className={...}>
    <span className="material-symbols-outlined">grid_view</span>
  </button>
  <button onClick={() => setViewMode('list')} className={...}>
    <span className="material-symbols-outlined">view_list</span>
  </button>
</div>
```

**Pages to Update:**
- [ ] LandlordProperties
- [ ] TenantSavedProperties
- [ ] SearchPage

---

### 14. `ActionButton` Component
**Found in: 15+ pages**

Consistent action button styles:
- Primary (blue filled)
- Secondary (outline)
- Danger (red themed)
- Ghost (minimal)

**Proposed:** Extend existing `src/components/ui/button.tsx` with these variants.

---

### 15. `DateRangeFilter` / `FilterBar` Component
**Found in: 5+ pages**

Filter bar with date selector + status filter:
- LandlordTransactions
- TenantTransactions
- AgentTransactions
- AgentEarnings

---

## 📋 Implementation Order

### Phase 1: Foundation (High Impact, Many Pages)
1. `PageContainer` - affects all 46 pages
2. `PageHeader` - affects 34+ pages
3. `SectionCard` - affects 100+ instances
4. `Icon` wrapper - affects 700+ instances

### Phase 2: Data Display Components
5. `StatusBadge` enhancement
6. `StatsCard`
7. `TransactionTable`
8. `PropertyCard` (with 3 variants)

### Phase 3: Interactive Components  
9. `FilterDropdown` consolidation
10. `SearchInput`
11. `ViewToggle`
12. `Breadcrumb`

### Phase 4: Utility Components
13. `EmptyState`
14. `ActionButton` variants
15. `DateRangeFilter`

---

## 📂 Proposed File Structure

```
src/components/
├── common/
│   ├── PageContainer.tsx
│   ├── PageHeader.tsx
│   ├── Breadcrumb.tsx
│   ├── EmptyState.tsx
│   └── Icon.tsx
├── data-display/
│   ├── SectionCard.tsx
│   ├── StatsCard.tsx
│   ├── StatusBadge.tsx
│   ├── TransactionTable.tsx
│   └── PropertyCard/
│       ├── PropertyCardGrid.tsx
│       ├── PropertyCardList.tsx
│       └── PropertyCardMini.tsx
├── inputs/
│   ├── SearchInput.tsx
│   ├── FilterDropdown.tsx (existing, enhance)
│   ├── ViewToggle.tsx
│   └── DateRangeFilter.tsx
└── ui/ (existing)
    ├── avatar.tsx
    ├── badge.tsx (enhance)
    ├── button.tsx (enhance)
    ├── card.tsx
    └── ...
```

---

## ✅ Completion Checklist

- [ ] Phase 1: Foundation Components
  - [ ] Create PageContainer
  - [ ] Create PageHeader
  - [ ] Create/enhance SectionCard
  - [ ] Create Icon wrapper
  - [ ] Update all pages to use new components

- [ ] Phase 2: Data Display
  - [ ] Create StatsCard
  - [ ] Enhance StatusBadge
  - [ ] Create TransactionTable
  - [ ] Create PropertyCard variants

- [ ] Phase 3: Interactive
  - [ ] Consolidate FilterDropdown usage
  - [ ] Create SearchInput
  - [ ] Create ViewToggle
  - [ ] Create Breadcrumb

- [ ] Phase 4: Utilities
  - [ ] Create EmptyState
  - [ ] Enhance button variants
  - [ ] Create DateRangeFilter

---

*Last Updated: 2025-12-31*
*Total Estimated Refactoring Tasks: ~60+ component integrations*
