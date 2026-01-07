# React Folder Structure Guide

Below are three proven layout options inspired by the transcript: beginner, intermediate, and advanced. Each section shows the recommended directory tree (in the requested style) plus the reasoning behind it.

---

## 1. Beginner Structure (Small Apps / Prototypes)
```
beginner-app/
├─ public/                     Static index.html, icons, etc.
├─ src/
│  ├─ components/              All UI (buttons, nav, entire pages)
│  │  ├─ Button.tsx
│  │  ├─ Navbar.tsx
│  │  └─ TodoList.tsx
│  ├─ hooks/                   Reusable hooks live together
│  │  └─ useLocalStorage.ts
│  ├─ tests/                   Optional central test bucket
│  │  ├─ Button.test.tsx
│  │  └─ hooks.test.ts
│  ├─ App.tsx                  Root component
│  ├─ main.tsx                 React/Vite entry point
│  ├─ styles.css               Global styles
│  ├─ formatDate.ts            Utility helpers (loose in src)
│  └─ todoContext.tsx          Contexts often live at root
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```
- **Why**: Minimum ceremony—ideal for proofs of concept or <10 component apps.
- **Cost**: `components/` quickly becomes a junk drawer; utilities/contexts clutter `src/`.
- **Notes**: Central `tests/` is acceptable here, but be ready to colocate tests as the app grows.

**Use when**: Building tiny demos, tutorials, or early spikes where reorganizing later is acceptable.

---

## 2. Intermediate Structure (Growing Products)
```
intermediate-app/
├─ public/
├─ src/
│  ├─ assets/                  Images, fonts, global CSS
│  │  ├─ images/
│  │  └─ styles/
│  ├─ components/
│  │  ├─ forms/
│  │  │  └─ TextInput.tsx
│  │  ├─ ui/
│  │  │  ├─ Modal.tsx
│  │  │  └─ Button.tsx
│  │  └─ navigation/
│  │     └─ Navbar.tsx
│  ├─ context/
│  │  └─ AuthContext/
│  │     ├─ AuthContext.tsx
│  │     └─ AuthContext.test.tsx
│  ├─ data/                    JSON seeds, constants
│  │  └─ products.json
│  ├─ hooks/
│  │  └─ useAuth.ts
│  ├─ pages/
│  │  ├─ Home/
│  │  │  ├─ Home.tsx
│  │  │  ├─ components/
│  │  │  │  └─ TodoList.tsx
│  │  │  └─ hooks/
│  │  │     └─ useHomeFilter.ts
│  │  ├─ Login/
│  │  │  ├─ Login.tsx
│  │  │  └─ components/
│  │  │     └─ LoginForm.tsx
│  │  └─ Settings/
│  │     └─ Settings.tsx
│  ├─ utils/                   Pure helpers used across pages
│  │  ├─ formatCurrency.ts
│  │  └─ validators.ts
│  ├─ router.tsx               Route config
│  ├─ App.tsx
│  └─ main.tsx
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ postcss.config.cjs
├─ tailwind.config.cjs
└─ vite.config.ts
```
- **Why**: Gives every concern a home. Shared UI stays in `components/` while `pages/<Page>/` encapsulates screen-specific components, hooks, contexts, and tests.
- **Benefits**:
  - Tests live beside implementation (e.g., `AuthContext.test.tsx`).
  - `src/` root remains tidy—only bootstrapping files sit outside folders.
  - Page folders clarify ownership: anything unique to Home lives in `pages/Home/`.
- **Limits**: As features multiply, page folders can balloon and cross-page sharing becomes harder to track.

**Use when**: Apps have ~10–20 screens with a mix of shared and page-only components, but teams are still compact.

---

## 3. Advanced Structure (Feature-Driven / Enterprise Scale)
```
advanced-app/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/              Truly global, presentation-only pieces
│  ├─ context/
│  ├─ features/                ⚡ Primary organization unit
│  │  ├─ authentication/
│  │  │  ├─ components/
│  │  │  │  └─ AuthModal.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useAuthGuard.ts
│  │  │  ├─ services/
│  │  │  │  └─ auth.api.ts
│  │  │  ├─ index.ts           Export surface for the feature
│  │  │  └─ tests/
│  │  │     └─ auth.integration.test.ts
│  │  ├─ projects/
│  │  │  ├─ components/
│  │  │  ├─ context/
│  │  │  └─ index.ts
│  │  └─ todos/
│  │     ├─ assets/
│  │     ├─ components/
│  │     ├─ hooks/
│  │     └─ index.ts
│  ├─ hooks/                   Global hooks shared everywhere
│  ├─ layouts/                 Navbars, sidebars, shells
│  │  ├─ DashboardLayout.tsx
│  │  └─ PublicLayout.tsx
│  ├─ lib/                     Facades around third-party deps
│  │  ├─ axios.ts              Wrap axios config/interceptors
│  │  └─ analytics.ts          Wrap analytics SDK
│  ├─ pages/
│  │  ├─ Home.tsx              Stitches together feature exports
│  │  ├─ Login.tsx
│  │  └─ Settings.tsx
│  ├─ services/                Cross-feature API/services (logging, analytics)
│  │  ├─ logger.service.ts
│  │  └─ featureFlags.service.ts
│  ├─ utils/
│  ├─ App.tsx
│  └─ main.tsx
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ postcss.config.cjs
├─ tailwind.config.cjs
└─ vite.config.ts
```
- **Why**: Encapsulates “features” (auth, projects, todos) so each acts like a mini app with its own components/hooks/services. Pages become thin wiring layers.
- **Key concepts**:
  - **Facade pattern via `lib/`** keeps third-party dependencies behind wrappers—update once, propagate everywhere.
  - **`features/<name>/index.ts`** exports only what the rest of the app should consume; never import deep files directly.
  - **Layouts/** isolates shared chrome; **services/** houses app-wide integrations (analytics, logging) separate from feature-specific APIs.
  - Most code lives inside `features/`, allowing teams to own domains independently.
- **Cost**: More scaffolding (index files, nested folders). Overkill for small apps but invaluable at scale.

**Use when**: Multiple teams contribute, domain boundaries matter, or you anticipate a large, long-lived product.

---

## Choosing the Right Structure
| Project Size / Needs | Recommended Structure | Why |
| --- | --- | --- |
| Prototype, PoC, or <10 components | **Beginner** | Minimal overhead; quick iteration |
| Mid-sized product, distinct pages, some reuse | **Intermediate** | Clear separation of shared vs. page-specific code |
| Enterprise app, numerous teams/features | **Advanced** | Feature encapsulation, scalable architecture, easier dependency management |

**Rule of thumb**: Start simple, graduate when pain appears. Move from beginner ➜ intermediate once `components/` feels chaotic. Adopt feature-driven layouts when page folders start leaking logic across the codebase or when multiple teams need isolation.

---

## Extra Best Practices
1. **Colocate tests** with the modules they cover; it keeps intent obvious.
2. **Encapsulate page-only logic** inside that page’s folder (intermediate) or the owning feature (advanced).
3. **Wrap third-party libraries** in `lib/` so refactors happen in one place.
4. **Keep shared utilities pure**; side-effect-heavy helpers belong closer to their feature/page.
5. **Document the chosen convention** (like this guide) to align future contributors and AI assistants.

Pick the structure that matches your current complexity, then evolve it deliberately as the product grows.
