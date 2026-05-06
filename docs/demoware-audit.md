# Demoware / Product Surface Area Audit

> Read-only audit. No code, types, or files were modified. All findings cite
> file paths and line numbers; classifications are best-effort and several
> items are explicitly flagged as **Needs product judgment** rather than
> "remove."

## Product Boundary Assumptions

The repo has no PRD, so the boundary below is inferred from `README.md`,
the route table in `src/App.tsx`, and the entity model. Treat as assumptions.

| Aspect              | Inferred boundary                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary user**    | Two roles: (a) *any C3 employee* who needs internal tooling built; (b) *SWAT engineers* who triage requests and ship solutions.                       |
| **Core actions**    | Submit a request → SWAT triages (Triaging / Accepted / Deferred / Rejected) → On Accept, a stub `SwatSolution` is created → SWAT fills it in, assigns builders, ships → Browse the catalog of shipped solutions. |
| **Required inputs** | Request title + problem + current process + requester name/team. Solution description + domain + stack + builders required to leave Queued.          |
| **Required outputs**| Catalog grid + detail view of solutions with impact metrics, request kanban, team roster, triage workspace.                                          |
| **Explicit non-goals** (inferred) | Not auth-gated (admin route note: *"Demo mode: Auth is mocked"*). Not a generic ticketing system, not a project planner, not multi-tenant. No external partner / customer access. |

The product is small. Three entity types (`SwatRequest`, `SwatSolution`,
`TeamMember`), one secondary entity (`SupportingMaterial`), three services,
and seven pages cover it. Anything materially beyond this is candidate
demoware.

---

## Executive Summary

The application's core (intake → triage → build → catalog) is intact and
internally consistent. Most of the demoware accretion sits in three places:

1. **A 384 KB starter-kit reference tree** at `aiMarketplace/ui/react/resources/examples/` that is not imported by `src/`. It contains demo dashboards (Analytics, Programs, Checklist, Overview…) inherited from the C3 React scaffold.
2. **Unused shadcn/Radix UI primitives** in `src/components/ui/`. Only `skeleton.tsx` is consumed by application code; the other ten files (`button`, `checkbox`, `collapsible`, `data-table`, `dialog`, `input`, `select`, `table`, `tabs`, `textarea`) plus their dependency `@tanstack/react-table` and `@radix-ui/*` packages are dead weight from the same scaffold.
3. **Decorative seed data and supporting-material rendering** that gives the catalog visual richness (Prism syntax-highlighted code snippets, demo-video iframes, dashboard screenshots from Unsplash, fake Confluence links). The product has *no ingest path* for adding supporting materials post-creation — there is no service method, no UI, no upload flow — so every renderer in `SupportingMaterialRenderer.tsx` only ever displays seed JSON.

Smaller pockets of demoware are scattered through the data model
(`relatedLinks`, `desiredOutcome`, `projectIds`, `featured` flag) where the
data is *captured* or *seeded* but never rendered or never settable through
the UI.

---

## High-Confidence Removal Candidates

### 1. `resources/examples/` reference scaffold

- **Files:** `aiMarketplace/ui/react/resources/examples/` (29 files, ~384 KB; pages: `AnalyticsPage`, `DashboardPage`, `ProgramsPage`, `OverviewPage`, `ChecklistPage`, `ChecklistDetailPage`, `CustomChecklistPage`; components: `Alert`, `Document`, `FilterSection`, `Map`, `Modal`, `NetworkGraph`, `OptionSelect`, `SideNav` (duplicate), `SkeletonLoader`, `TopNav`, `DocumentsFilterSidebar`, `ExampleLegendSwatch`; `shared/api.ts`, `constants.ts`, `documentFilters.ts`; `demo/c3-design-system.html`).
- **Evidence:**
  - `grep -rln "examples/\|@/shared\|fetchDocuments\|fetchPrograms" src/` returns nothing — `src/` does not import from `resources/examples/`.
  - `resources/examples/README.md` line 13 describes the duplicated `TopNav` / `SideNav` shell copies as existing so "teams can copy the examples tree without pulling all of `src/`." (The README does not generalize that claim to the whole tree, but the rest of the directory has the same standalone, demo-only character.)
  - The Vite alias `@/shared → resources/examples/shared` in `vite.config.mts:71-72` is configured *only* for these example pages.
- **Why non-essential:** It is the C3 React starter kit's reference gallery. Not part of the SWAT marketplace product.
- **Dependencies:** Linted via `npm run lint` (see `package.json:13`). The `@/shared` Vite alias and `tsconfig` includes need follow-up.
- **Removal risk:** Low. Nothing in `src/` references it.
- **Suggested removal strategy:** Delete `resources/examples/`. Drop the `@/shared` alias in `vite.config.mts`. Update `lint` script in `package.json:13` to remove `resources/examples` argument. Remove the `proxy: "http://localhost:5555/"` line if it was only there for the example pages.
- **Keywords:** `resources/examples`, `@/shared`, `fetchDocuments`, `fetchPrograms`, `EXAMPLE_APP_TITLE`, `DocumentsFilterSidebar`, `c3-design-system`, `sync-example-shell`.
- **Verify if removed:** `npm run build` succeeds; `npm run lint` succeeds; `npm run dev` boots.

### 2. Unused shadcn UI primitives in `src/components/ui/`

- **Files:** `src/components/ui/button.tsx`, `checkbox.tsx`, `collapsible.tsx`, `data-table.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`. (`skeleton.tsx` is the one file actually used — by `CardGridSkeleton.tsx`.)
- **Evidence:**
  - `grep -rn "@/components/ui" src/` returns only two consumers: `CardGridSkeleton.tsx` (uses `skeleton`) and `data-table.tsx` (self-references `button`, `table`).
  - `grep -rn "DataTable\|Dialog\|Tabs\|Checkbox\|Collapsible" src/pages src/components/marketplace src/App.tsx` returns nothing.
  - All form controls in pages (`SubmitRequestPage`, `BrowseSolutionsPage`, `AdminTriagePage`) are raw `<input>`, `<textarea>`, `<select>` with Tailwind classes — none use the shadcn wrappers.
- **Why non-essential:** Pages use raw HTML elements. The shadcn primitives are dead exports.
- **Dependencies:** `@tanstack/react-table` (used only by `data-table.tsx`), `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `radix-ui`, `class-variance-authority` (used by `button.tsx:14` and `tabs.tsx:14`). **Keep** `clsx` and `tailwind-merge` — `skeleton.tsx:6` (the one primitive that *is* used) imports `cn` from `lib/utils.ts`, which depends on them.
- **Removal risk:** Low for the primitives themselves; the dependency cleanup is straightforward as long as `clsx`, `tailwind-merge`, and `lib/utils.ts` (specifically `cn`) are preserved for `skeleton.tsx`.
- **Suggested removal strategy:** Delete each unused `.tsx` in two passes — first the leaf components (`checkbox`, `collapsible`, `dialog`, `input`, `select`, `tabs`, `textarea`), then `data-table.tsx` + `table.tsx` + `button.tsx`. Then drop `@tanstack/react-table`, the `@radix-ui/*` packages, `radix-ui`, and `class-variance-authority` (no remaining `cva` consumer once `button.tsx` and `tabs.tsx` are gone). Leave `clsx`/`tailwind-merge`/`lib/utils.ts` in place.
- **Keywords:** `@/components/ui/`, `cva`, `Slot`, `RadixCheckbox`, `RadixDialog`, `useReactTable`, `flexRender`.
- **Verify if removed:** `tsc --noEmit` clean; `npm run build`; visit each page and confirm no broken imports.

### 3. `SolutionService.recentlyShipped` (orphan service method)

- **Files:** `aiMarketplace/src/SolutionService.c3typ:10`, `aiMarketplace/src/SolutionService.js:52-61`, `aiMarketplace/ui/react/src/api/marketplace.ts:115-118`.
- **Evidence:** Defined and exposed, but `recentlyShipped` is never called from any UI page. Recent commit `43e8c67 [update] prune Recently Shipped section of the Home Page` removed the only consumer; the backend method, the wrapper in `marketplace.ts`, and the generated `.d.ts` entry remained.
- **Why non-essential:** No caller. Same effect can be achieved by `listSolutions()` with a `dateShipped` sort if the section returns.
- **Removal risk:** Low.
- **Suggested removal strategy:** Delete `recentlyShipped` from `SolutionService.c3typ` line 10, from `SolutionService.js` lines 52-61, and from `marketplace.ts` lines 115-118.
- **Keywords:** `recentlyShipped`.
- **Verify if removed:** `c3 prov pkg` succeeds; UI builds; landing page still renders.

### 4. `c3Action.ts` unused helper exports

- **Files:** `aiMarketplace/ui/react/src/c3Action.ts` lines 82-122 — `c3GetAction`, `c3CreateAction`, `c3MemberAction`.
- **Evidence:** `grep -rn "c3GetAction\|c3CreateAction\|c3MemberAction" src/` returns only the definitions in `c3Action.ts` itself; no consumer.
- **Why non-essential:** Only `c3Action` (the default export) is used (by `api/marketplace.ts`). The other helpers are speculative API surface.
- **Removal risk:** Low.
- **Suggested removal strategy:** Delete lines 82-122 of `c3Action.ts` (and the JSDoc preceding each).
- **Keywords:** `c3GetAction`, `c3CreateAction`, `c3MemberAction`.
- **Verify if removed:** `tsc --noEmit` clean; `api/marketplace.ts` still resolves.

### 5. Navigation helpers + speculative `NavigationItem` fields

- **Files:** `src/config/navigation.ts:65-90` (`addNavigationItem`, `removeNavigationItem`, `updateNavigationBadge`); `src/types/navigation.ts:19-25` (`badge?`, `disabled?`, `NavigationConfig`); `src/components/SideNav/SideNav.tsx:62-66, 151-155` (badge rendering paths).
- **Evidence:**
  - `grep -rn "addNavigationItem\|removeNavigationItem\|updateNavigationBadge" src/` returns only the definitions.
  - No `navigationConfig` entry in `navigation.ts:14-63` sets `badge` or `disabled`.
  - The `NavigationConfig` interface (`navigation.ts:23-25`) is exported but never imported.
- **Why non-essential:** The navigation list is statically defined and consumed only by `SideNav.tsx`. The "dynamically add/remove items" API is speculative for a six-link sidebar.
- **Removal risk:** Low.
- **Suggested removal strategy:** Delete the three exported helpers; delete the `badge`, `disabled`, and `NavigationConfig` declarations; delete the two badge-rendering blocks in `SideNav.tsx`.
- **Keywords:** `addNavigationItem`, `removeNavigationItem`, `updateNavigationBadge`, `item.badge`, `NavigationConfig`.
- **Verify if removed:** Sidebar renders correctly on every route, including `/admin`.

### 6. `BuilderCard.compact` prop

- **File:** `src/components/marketplace/BuilderCard.tsx:11-29`.
- **Evidence:** The compact branch (`if (compact)`) has no caller. `SolutionDetailPage.tsx:199` is the only `<BuilderCard />` usage and it does not pass `compact`.
- **Why non-essential:** Dead branch.
- **Removal risk:** Low.
- **Suggested removal strategy:** Drop the `compact` prop and the early-return block.
- **Keywords:** `BuilderCard`, `compact?: boolean`.
- **Verify if removed:** Solution detail page still renders the builder sidebar.

### 7. `ErrorBoundary` unused exports (`useErrorReporter`, `useErrorBoundary`, `withErrorReporter`)

- **File:** `src/components/ErrorBoundary/ErrorBoundary.tsx`.
- **Evidence:** `App.tsx:29` wraps the tree in `<ErrorReporterProvider>`, but `grep -rn "useErrorReporter\|useErrorBoundary\|withErrorReporter\|reportError" src/` shows zero usages outside the file itself. No component ever calls `reportError`. The provider is effectively a no-op.
- **Why non-essential:** The hook + HOC + alias are speculative API. The provider itself is harmless infrastructure.
- **Removal risk:** Medium — keep the provider (it's legitimate infrastructure that may matter for future error wiring), but the `useErrorBoundary` alias and `withErrorReporter` HOC are dead exports.
- **Suggested removal strategy:** Delete `useErrorBoundary` (line 43) and `withErrorReporter` (lines 81-88). Keep `ErrorReporterProvider` and `useErrorReporter`.
- **Keywords:** `useErrorBoundary`, `withErrorReporter`, `WithErrorReporterWrapper`.
- **Verify if removed:** App tree still mounts. *(Needs product judgment whether to remove the entire `postMessage` Genesis hook in `ErrorReporterProvider` lines 53-68 — it's wired but unused.)*

---

## Medium-Confidence Candidates

### 8. `SupportingMaterial` rendering surface vs. ingest reality

- **Files:**
  - Type: `aiMarketplace/src/SupportingMaterial.c3typ`, `MaterialType.c3typ`.
  - Renderer: `src/components/marketplace/SupportingMaterialRenderer.tsx` (~260 lines) — six branch types: `app_link`, `confluence_doc`, `external_file`, `code_snippet`, `demo_video`, `image`, plus a default "other".
  - Seed data: `aiMarketplace/data/SupportingMaterial/SupportingMaterial.json` (19 entries, `sm1a`–`sm8a`).
  - Dependency: `react-syntax-highlighter` (~heavy) only used here.
- **Evidence:**
  - There is **no service method** that creates, updates, or deletes a `SupportingMaterial`. Searching for `SupportingMaterial.make`, `SupportingMaterial.fetch`, or any service entry returns nothing in `src/`.
  - `AdminTriagePage.tsx`'s "Queued Solutions" form has no UI for attaching materials; `updateDraft` (`SolutionService.js:73-87`) does not touch them.
  - The seed data also has a content/ID drift: `SupportingMaterial.json` `sm1a`-`sm1d` reference `sol1` and describe a "Live Headcount Dashboard" / "headcount variance" solution, but `SwatSolution.json` `sol1` is now "Pipeline coverage early-warning email" (a Queued draft with empty fields). Materials have rotated under solution IDs that no longer match.
- **Why this might be demoware:** Six rendering branches, syntax-highlighted code, embedded YouTube iframes, and `images.unsplash.com` thumbnails exist *only to make detail pages look published*. Without an ingest path, this is permanently a static decoration.
- **Removal risk:** Medium. The detail page genuinely uses the renderer; removing supporting materials wholesale would visibly thin out solution detail pages.
- **Suggested removal strategy (graduated):**
  - **Conservative:** Keep `app_link` and `confluence_doc` (real-world useful); drop `code_snippet` (and `react-syntax-highlighter`), `demo_video`, `image`, `external_file`, `other` and their seed data — until product decides to build an ingest UI.
  - **Aggressive:** Delete the `SupportingMaterial` entity, the `MaterialType` enum, `SupportingMaterial.json`, and the renderer; replace with a single `links: [string]` array on `SwatSolution`.
- **Keywords:** `SupportingMaterial`, `MaterialType`, `SupportingMaterialRenderer`, `app_link`, `confluence_doc`, `code_snippet`, `demo_video`, `react-syntax-highlighter`, `dQw4w9WgXcQ`, `images.unsplash.com`.
- **Verify if removed:** `SolutionDetailPage.tsx` still renders for solutions with no materials; tree-shaking drops the syntax-highlighter bundle.

### 9. `featured` boolean and `featuredSolutions` service method

- **Files:** `SwatSolution.c3typ:20`, `SolutionService.c3typ:9`, `SolutionService.js:41-50`, `api/marketplace.ts:110-113`, `pages/LandingPage.tsx:60` (consumer).
- **Evidence:** `featured` is only set in `SwatSolution.json` seed entries (3 of 9 marked `featured: true`). There is no admin UI to flip the flag — `assignBuilders` and `updateDraft` ignore it; `decide` defaults it to `false`. Once seed data is gone, no solution will ever appear in the landing page's "Featured" rail.
- **Why this might be demoware:** Without admin tooling, "featured" is permanently controlled by seed data — a demo affordance.
- **Removal risk:** Medium. The home page section is real surface; replacing "featured" with "most recent shipped, top 3" would preserve the slot.
- **Suggested removal strategy:** Either (a) add a "Mark as featured" toggle in `AdminTriagePage`'s shipped section to make it real, or (b) replace the home page rail with `recentlyShipped` (which already exists, see finding #3, ironically) and drop the `featured` field + service method.
- **Keywords:** `featured`, `featuredSolutions`.
- **Verify if removed:** Landing page top section still renders three solution cards.

### 10. Decorative request fields with no read path

- **Files:** Field definitions in `SwatRequest.c3typ:9-16`, capture in `SubmitRequestPage.tsx`, consumption check across all pages.
- **Evidence:**
  - `desiredOutcome`: captured at `SubmitRequestPage.tsx:259-268`, posted to `submitRequest`. **Never displayed** — `grep -n "desiredOutcome" src/pages/*.tsx` returns only `SubmitRequestPage`.
  - `relatedLinks`: captured at `SubmitRequestPage.tsx:303-312`. **Never rendered** in `AdminTriagePage`, `InFlightProjectsPage`, or `SolutionDetailPage`.
  - `affectedCount` is rendered (`AdminTriagePage.tsx:83`) but always as a parenthetical "~N people"; it has no filter or analytical use.
- **Why this might be demoware:** The fields make the submit form look thorough but the data is write-only. They flesh out the request form for a demo; in real use the analyst can't see the answer they prompted for.
- **Removal risk:** Medium — depends on intent. If the team plans to surface them in triage soon, keep them. Otherwise they're CRUD theater.
- **Suggested removal strategy:** Either render `desiredOutcome` and `relatedLinks` in `AdminTriagePage`'s expanded request row (cheap and obvious win) or remove them.
- **Keywords:** `desiredOutcome`, `relatedLinks`, `burdenEstimate`.
- **Verify if removed:** Submit form still validates; existing seed data still loads (these fields are nullable).

### 11. `TeamMember.projectIds` calc field

- **Files:** `aiMarketplace/src/TeamMember.c3typ:13` (`projectIds: [string] calc solutions.id`); `api/marketplace.ts:22` (mapped); types `marketplace.ts:42`.
- **Evidence:** Computed and serialized over the wire, but `grep -rn "projectIds" src/pages src/components` returns nothing — no UI surface consumes it. The team page uses `member.solutions[].title` directly.
- **Why this might be demoware:** A duplicate projection of `solutions.id` that no caller needs.
- **Removal risk:** Low at the type level (drop the calc); medium across the boundary because it's mapped through `api/marketplace.ts` and the `TeamMember` interface.
- **Suggested removal strategy:** Drop the calc from `TeamMember.c3typ`, the field from `TeamMember` in `marketplace.ts:42`, and the mapping in `api/marketplace.ts:22`.
- **Keywords:** `projectIds`, `calc solutions.id`.

### 12. `lastUpdated` on `SwatRequest`

- **Files:** `SwatRequest.c3typ:20`, `RequestService.js:35-36, 52`, `api/marketplace.ts:59`, type `marketplace.ts:81`.
- **Evidence:** Written on submit and on every `decide()` call. **Never displayed** — `grep "lastUpdated" src/pages` returns nothing.
- **Why this might be demoware:** Captured but unrendered. Either intended for "Last updated 3 days ago" UI that never shipped, or pure write-only book-keeping.
- **Removal risk:** Low. C3's framework already stamps `meta.updated`.
- **Suggested removal strategy:** Either render it in the InFlight kanban card (high-value addition) or drop the field and rely on `meta.updated`.
- **Keywords:** `lastUpdated`.

---

## Needs Product Judgment

### 13. Animated counter on landing page

- **File:** `src/hooks/useAnimatedCounter.ts`, `src/pages/LandingPage.tsx:15-45, 100-106`.
- **Status:** Renders real `landingStats()` numbers. Pure visual polish.
- **Verdict:** Optional UX. Removing the easing animation (just render the numbers) saves ~40 lines and one hook. Not bloat per se.

### 14. `MarketplaceStats.companyDollarsSaved` & `engineerHoursSaved`

- **Files:** `MarketplaceStats.c3typ`, `StatsService.js:7-37`.
- **Status:** Real aggregations over `SwatSolution.dollarsSaved`/`hoursSaved`. Numbers in seed data are demo-scaled (`$1.8M`, `$2.1M`). The math is real; the inputs are demo-flattering.
- **Verdict:** Keep the service. Validate the seed data with whoever owns the SWAT marketing story before the app demos to leadership.

### 15. `reusabilityNote` field

- **Files:** `SwatSolution.c3typ:19`, set via `updateDraft`, displayed at `SolutionDetailPage.tsx:159-165` with a 🔁 emoji.
- **Status:** Real (settable + displayed). Read consciously rather than as dead surface — it's a deliberate product choice to encourage forking.
- **Verdict:** Core. No action.

### 16. Theme toggle (light/dark)

- **Files:** `src/hooks/useTheme.ts`, `src/c3ui/c3SemanticTokens*.css`, used by `SideNav` and `SupportingMaterialRenderer` (for syntax highlight theme).
- **Verdict:** Optional UX. Real, costs little, leave it.

### 17. `MaterialType.OTHER` enum value

- **File:** `MaterialType.c3typ:16`, `SupportingMaterialRenderer.tsx:253-254`.
- **Verdict:** Reasonable last-resort bucket. Keep if `SupportingMaterial` stays.

### 18. Genesis `postMessage` error reporting

- **File:** `ErrorBoundary.tsx:53-68` (the one block of the file that's actually wired in via the provider).
- **Status:** `window.parent?.postMessage({ type: 'GENESIS_ERROR_REPORT', ... })` — only does anything when the app is iframed inside the C3 Genesis console. Genuine infrastructure for that mode; dead in the standalone dev/demo experience.
- **Verdict:** Keep — it's the legitimate hosting integration. But verify the message shape with the Genesis owner; the static `file: 'EventHandler', line: 0, column: 0` payload looks like placeholder.

---

## Suspected Dead Types / Fields

| Item                                       | Where defined                                | Where used                                | Status         |
| ------------------------------------------ | -------------------------------------------- | ----------------------------------------- | -------------- |
| `NavigationItem.badge`                     | `types/navigation.ts:19`                     | `SideNav.tsx:62-66, 151-155` (renders if set) — **never set anywhere**       | Dead           |
| `NavigationItem.disabled`                  | `types/navigation.ts:20`                     | Never read                                | Dead           |
| `NavigationConfig` interface               | `types/navigation.ts:23-25`                  | Never imported                            | Dead           |
| `addNavigationItem` / `removeNavigationItem` / `updateNavigationBadge` | `config/navigation.ts:65-90` | Never called                | Dead           |
| `BuilderCardProps.compact`                 | `BuilderCard.tsx:11`                         | Branch executes only when caller passes — no caller | Dead           |
| `useErrorBoundary` (alias)                 | `ErrorBoundary.tsx:43`                       | Never imported                            | Dead           |
| `withErrorReporter` HOC                    | `ErrorBoundary.tsx:81-88`                    | Never imported                            | Dead           |
| `useErrorReporter`                         | `ErrorBoundary.tsx:34-40`                    | Exported, never imported                  | Dead-ish       |
| `c3GetAction` / `c3CreateAction` / `c3MemberAction` | `c3Action.ts:82-122`                | Never imported                            | Dead           |
| `getCookieValue` (export)                  | `c3Action.ts:18`                             | Used internally only; no external import   | Internal       |
| `TeamMember.projectIds` (calc)             | `TeamMember.c3typ:13`                        | Mapped in `marketplace.ts`, never rendered | Likely dead    |
| `SwatRequest.lastUpdated`                  | `SwatRequest.c3typ:20`                       | Set, never rendered                       | Write-only     |
| `SwatRequest.desiredOutcome`               | `SwatRequest.c3typ:13`                       | Captured by submit form, never rendered   | Write-only     |
| `SwatRequest.relatedLinks`                 | `SwatRequest.c3typ:16`                       | Captured by submit form, never rendered   | Write-only     |
| `SwatSolution.featured`                    | `SwatSolution.c3typ:20`                      | Read by `featuredSolutions`; **never settable via UI** | Seed-controlled |
| `SolutionService.recentlyShipped`          | `SolutionService.c3typ:10`                   | Wrapped in api but no caller              | Dead service   |

---

## Mock Data and Placeholder Behavior

- **`SupportingMaterial.json` references stale solution IDs.** `sm1a`-`sm1d` are tagged `solution: {id: "sol1"}` and describe the *headcount variance* dashboard, but `SwatSolution.json` `sol1` is currently the *Pipeline coverage early-warning email* (Queued, empty fields). Materials likely shifted under solutions during a refactor — cross-reference and reseat IDs before demoing the catalog.
- **Mock auth banner.** `AdminTriagePage.tsx:454-461` displays a literal `Demo mode: Auth is mocked` banner. The `/admin` route has no guard; `useErrorReporter` does not surface a real role. This is fine for demo, but anyone hitting `/admin` can publish triage decisions.
- **Demo video URLs.** `SupportingMaterial.json` `sm2a` and `sm7b` both point to `https://www.youtube.com/embed/dQw4w9WgXcQ` (Rick Astley). Decorative — replace before any external demo.
- **Unsplash thumbnails.** `sm1d`, `sm2a`, `sm3a`, `sm5a`, `sm7b` use `images.unsplash.com` URLs. External dependency for "screenshots" of internal tools.
- **Avatar service.** `TeamMember.avatarUrl` uses `api.dicebear.com/7.x/initials/svg?...` for all six members. Fine for demo; real avatars would need an upload story.
- **Hardcoded `Q3 2026` revisit date.** `RESPONSE_TEMPLATES.Deferred` in `AdminTriagePage.tsx:26-27` writes a literal "Expected revisit: Q3 2026" string into every Deferred response. This will date badly.
- **`ALLOWED_TRANSITIONS` self-edges.** `RequestService.js:7-12` allows `'Triaging' → 'Triaging'`, `'Deferred' → 'Deferred'`, `'Accepted' → 'Accepted'`, `'Rejected' → 'Rejected'` — explicitly to support response-text edits and re-saves. Not bloat, but worth knowing the FSM is permissive on purpose.

---

## Routes / Pages / Components That May Be Demo-Only

The application's seven routes (`App.tsx:34-42`) all have a real product
purpose. None of the *application* pages read as demoware.

- `LandingPage.tsx` — Real, but the stats strip + featured rail rely on `featured` / impact numbers that are seed-only today (see #9, #14).
- `BrowseSolutionsPage.tsx` — Real. Filters work against real data.
- `SolutionDetailPage.tsx` — Real. Heavy with optional sections (impact metrics, reusability, supporting materials) — see #8.
- `SubmitRequestPage.tsx` — Real, but capture-only fields create demoware (see #10).
- `InFlightProjectsPage.tsx` — Real kanban over `SwatRequest` statuses.
- `TeamPage.tsx` — Real roster with the "How we work" four-step block at lines 91-133. The four-step block is decorative copy but cheap; OPTIONAL UX.
- `AdminTriagePage.tsx` — Real, but explicitly labeled `Demo mode`.

The only page-equivalents that are flat-out demoware are the **example
pages under `resources/examples/pages/`** (Analytics, Programs, Dashboard,
Overview, Checklist…) covered in finding #1.

---

## Recommended Pruning Order

Do the cheapest wins first to compact the codebase, then the data-model
items. Each step is independently shippable.

1. **Delete the entire `resources/examples/` tree** + drop `@/shared` Vite alias + remove `resources/examples` from the lint script (`package.json:13`). [Finding #1]
2. **Delete unused shadcn UI primitives** in `src/components/ui/` (everything except `skeleton.tsx`); drop dependencies on `@tanstack/react-table`, `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `radix-ui`, `class-variance-authority`. Verify `lib/utils.ts` `cn` is still needed (it isn't, after removal). [Finding #2]
3. **Remove dead helpers** — navigation helpers, `c3Action.ts` extras, `BuilderCard.compact`, `useErrorBoundary` alias, `withErrorReporter`. [Findings #4, #5, #6, #7]
4. **Remove `recentlyShipped`** from service + JS + API wrapper. [Finding #3]
5. **Decide and act on write-only fields**: render `desiredOutcome`/`relatedLinks` in admin/in-flight, or drop. Same for `lastUpdated`. [Findings #10, #12]
6. **Decide and act on `featured`**: add admin toggle, or replace with most-recent-shipped. [Finding #9]
7. **Decide on `SupportingMaterial`**: gradient-prune the renderer branches, or build a real ingest UI. [Finding #8]

Steps 1-4 are mechanical; step 5 onward needs product judgment.

---

## Verification Checklist for Future Removal

After any removal pass, run:

- [ ] `tsc --noEmit -p aiMarketplace/ui/react/tsconfig.build.json` — clean.
- [ ] `npm run build` from `aiMarketplace/ui/react/` — succeeds and writes `../content/aiMarketplace/`.
- [ ] `npm run lint` — quiet.
- [ ] `npm run dev` boots; manually visit each of `/`, `/solutions`, `/solutions/sol4`, `/submit`, `/projects`, `/team`, `/admin`.
- [ ] Submit a new request through `/submit` and verify it appears under Triaging in `/admin` and `/projects`.
- [ ] In `/admin`, accept a request — verify a `Queued` solution appears below; fill it in and assign builders; verify it transitions to `Building` and shows up at `/projects` and `/solutions`.
- [ ] Bundle size check: confirm `react-syntax-highlighter` is gone if `code_snippet` was removed; confirm `@tanstack/react-table` is gone if `data-table.tsx` was removed.
- [ ] Re-run `c3 prov pkg` (or whatever the C3 environment uses) to confirm types still register if `.c3typ` files changed.
- [ ] Re-seed and verify counts on the home page stats strip match expected aggregates.

If any of the **Needs Product Judgment** items above are touched, also
verify with the SWAT product owner that the affordance was intentionally
retired.
