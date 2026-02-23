# Agent Instructions
- **ALWAYS** read and follow the guidelines in this file (`AGENTS.md`) before starting any task.
- **ALWAYS** run verification commands (`pnpm lint`, `pnpm typecheck`, `pnpm test`) after making code changes to ensure no regressions or errors were introduced.
- **CRITICAL: Run `pnpm test` after EVERY code change** - do not skip tests even if lint and typecheck pass. Update failing tests to match new behavior.

# Repository Guidelines

## Scope
- Next.js 15 CRM app (customer search/details/activities/notes/rewards/spend).
- Org selection == merchant selection. Feature docs live in `/docs`.

## Project Structure
- `src/app` App Router pages (`crm`, `account`, `user-management`, auth, errors).
- `src/components` shared UI, CRM, Account, and User Management components/hooks.
- `src/components/common` shared components (`PermissionBoundary`, `datagrid`, `inputs`).
- `src/components/icons` custom SVG icons (e.g., TikTokIcon).
- `src/services` API clients (CRM, Account, Users, auth, etc.).
- `src/contexts`, `src/lib`, `src/utils`, `src/types` support code.
- `public` static assets. Tests beside code in `__tests__`; Playwright E2E in `tests/`.
- Use `@/` alias for imports from `src`.
- Avoid unsafe casts (e.g., `as unknown as Type`); prefer proper typing patterns instead.

## Environment & Commands
- Prereqs: Node LTS per `.nvmrc`, `pnpm` 9+. Install: `pnpm install`.
- Dev: `pnpm dev` (or `pnpm dev:mock` if wired).
- Build/Run: `pnpm build` → `pnpm start`. Variants: `pnpm build:poc|prep|production` / `pnpm start:*` (copies `.env.*`).
- Quality: `pnpm lint`, `pnpm lint:fix`, `pnpm typecheck`, `pnpm format:check`, `pnpm format:write` (always run format before handing off).
- Tests: `pnpm test` (Jest). E2E: `HEADLESS=true pnpm e2e`, `pnpm e2e:ui`, `pnpm e2e:report`. **Always use `HEADLESS=true` when running E2E tests.**

## Auth & Organization (Merchant)
- Auth via Stytch → `jwtToken`; AppCard auth exchanges JWT for `authToken` for the selected org.
- Org selection (org == merchant) is required before CRM actions; no separate merchant picker.
- Base API headers: `X-Authentication-Token`, `AppCard-Merchant-Id` (org ID), `AppCard-Origin: ams`, JSON.
- Offers API headers (if needed): `X-AC-Authorization`, `X-AC-Organization`, `AppCard-Origin: ams`, JSON.

## CRM Routing
- `/crm/search` (search/export, grid to customer).
- `/crm/[customerId]` layout tabs: Details, Activities, Rewards, Spend, Notes, Global Data (stub).

## Account Routing
- `/[orgId]/account/hq/details` - HQ address and contact panels.
- `/[orgId]/account/hq/media` - Logo, terminal banner, mobile app banners.
- `/[orgId]/account/hq/settings` - Merchant settings (toll-free, timezone, loyalty program, keyword, social links).
- `/[orgId]/account/locations` - Locations list.
- `/[orgId]/account/locations/[locationId]/details` - Location address and contacts.
- `/[orgId]/account/locations/[locationId]/settings` - Location settings (keyword, nickname, website, hours).
- `/[orgId]/account/locations/[locationId]/media` - Location terminal banner.
- `/[orgId]/account/locations/[locationId]/devices` - Location devices.

## User Management Routing
- `/[orgId]/user-management/users` - Users list with invite/edit/delete.
- `/[orgId]/user-management/roles` - Roles permission matrix.

## Permissions
Available permissions in `UserPermissions` (derived from API resources in `organization-api.ts`):

### Navigation Permissions (section-level)
| Permission | API Resource | Controls |
|------------|--------------|----------|
| `canViewDashboard` | `reports` (VIEW) | Dashboard page access |
| `canViewReports` | Any reports sub-section | Reports section visibility |
| `canViewReportsTransactions` | `transactions section` (VIEW) | Transactions report |
| `canViewReportsProducts` | `products section` (VIEW) | Products report |
| `canViewReportsEmployees` | `employees section` (VIEW) | Employees report |
| `canViewReportsCustomers` | `customers section` (VIEW) | Customers report, CRM Reports |
| `canViewCrm` | `customers` (VIEW) | CRM section visibility |
| `canEnrollCustomers` | `new users` (MANAGE) | Enroll customer feature |
| `canViewLocations` | `locations` (VIEW) | Locations nav item |
| `canViewCoupons` | `coupons` (VIEW) | Coupons nav item |
| `canViewCampaigns` | `campaigns` (VIEW) | Campaigns nav item |

### Feature Permissions
| Permission | API Resource | Controls |
|------------|--------------|----------|
| `canExportCustomers` | `export_customers` (VIEW) | Export customers action |
| `canEditCustomers` | `customers` (MANAGE) | Edit customer details |
| `canManageGlobalData` | `global_data` (MANAGE) | Edit global data |
| `canViewUsers` | `users` (VIEW/MANAGE) | User Management page access |
| `canManageUsers` | `users` (MANAGE) | Create/edit/delete users and roles |
| `canViewAccount` | `account settings` (VIEW) or `canEditCustomers` | Account page access |
| `canManageAccount` | `account settings` (MANAGE) or `canEditCustomers` | Edit account settings |

### Navigation Gating
- Navigation items are conditionally rendered based on permissions
- Parent sections show if ANY child has permission (e.g., Reports shows if any report sub-section is accessible)
- See `src/components/dashboard/layout/layout-config.tsx` for navigation filtering logic

Use `PermissionBoundary` component to gate pages. Check `userPermissions` from `useOrganizationContext()` for action-level gating.

## Coding Style
- TypeScript strict; Prettier + import sorting; 2-space indent, single quotes, semicolons.
- Avoid `any`; type mocks; prefix intentionally unused vars with `_`.
- **NEVER add `eslint-disable` comments** - fix the underlying issue instead of suppressing warnings/errors.
- **ZERO WARNINGS POLICY**: All lint warnings must be fixed or suppressed in ESLint config - no warnings are acceptable in the codebase.

## Date/Time Handling (CRITICAL)
- **ALWAYS use `dayjs` for ALL date operations** - NEVER use native JavaScript `Date` object.
- The merchant timezone is set globally via `dayjs.tz.setDefault()` in `src/contexts/organization.tsx`.
- Import dayjs: `import dayjs from 'dayjs';`
- Common patterns:
  - Get current date: `dayjs()` (NOT `new Date()`)
  - Parse date: `dayjs('2025-01-15')` (NOT `new Date('2025-01-15')`)
  - Format date: `dayjs(date).format('YYYY-MM-DD')` (NOT `date.toISOString()`)
  - Compare dates: `dayjs(date1).isBefore(date2)` (NOT `date1 < date2`)
  - Start/end of period: `dayjs().startOf('month')`, `dayjs().endOf('month')`
- This ensures all dates respect the merchant's timezone, not UTC or the user's local timezone.

## UI/Styling Guidelines
- **See `docs/architecture/styling-guide.md`** for comprehensive styling standards including theme colors, chip patterns, and component guidelines.

## Framework & Infrastructure
- Prefer i18n: route user-facing text through translations (add keys in `src/locales/*` rather than hard-coding strings).
- Sentry: use `instrumentation-client.ts` (not `sentry.client.config.ts`) for client init to avoid Turbopack deprecation; export `onRouterTransitionStart` from that file.
- Navigation: build routes with `paths.*` helpers and use `router.push`/`router.replace` directly; Next.js basePath is applied by the router, so do not prepend it yourself.

## Component Architecture
- **See `docs/component-architecture.md`** for detailed patterns and folder structure.
- **Structure:** keep one component per file; large tabs should be split into smaller files.
- **Page files are thin wrappers:** `page.tsx` files should only import and render the main component. All logic lives in components.
- **Folder structure:** `src/components/{feature}/common/` for shared components, `src/components/{feature}/{tab}/` for tab-specific components.
- **Custom icons:** Put custom SVG icons in `src/components/icons/`, not inline in components.
- **Export patterns:** Every folder has an `index.ts` that exports its public API.

## i18n Guidelines
- All user-facing strings MUST be in both `src/locales/en/index.ts` and `src/locales/es/index.ts`.
- **ALWAYS update BOTH locale files when adding new translations.**
- **NEVER use `common.` prefix in translation keys** - the `t()` function already uses the `common` namespace. Use `t('actions.close')` NOT `t('common.actions.close')`.
- **Reuse existing translation keys** - check `src/locales/en/index.ts` for existing shared keys (e.g., `actions.*`, `errors.*`, `labels.*`) before adding new ones.
- Use shared validation messages in `crmValidation` namespace for form validation errors.
- Use `src/utils/customer-validation.ts` for shared customer form validation schemas (enroll and edit forms).
- Field length constants are in `src/constants/field-lengths.ts`.

## Testing
- **CRITICAL: READ `docs/architecture/testing-guide.md` BEFORE writing ANY tests.** This is MANDATORY.
- **Key patterns you MUST follow**:
  - Always call `unmount()` at the end of EVERY hook test
  - Wait for `loading` to be `false` before assertions
  - Use `fillInput()` instead of `userEvent.type()` for form inputs
  - Never suppress console errors/warnings - fix the underlying issues
- **See `docs/architecture/testing-guide.md`** for comprehensive testing patterns, including:
  - Test support utilities and helpers
  - Testing async hooks (waiting for state, cleanup with `unmount()`)
  - Avoiding `act()` warnings
  - Form input testing with `fillInput()`
  - Mock patterns
  - Common pitfalls and solutions
  - E2E testing with Playwright
- **Quick reference**:
  - Unit tests: `pnpm test`
  - E2E tests: `pnpm e2e:chromium` (quick) or `pnpm e2e` (all browsers)
  - Test utilities: `@/test-support`
- **CRITICAL: ZERO WARNINGS IN TESTS**:
  - Tests must pass with NO console warnings or errors in output
  - Fix MUI warnings (e.g., wrap disabled buttons in `<span>` for Tooltips)
  - Mock `console.error` in error handling tests: `jest.spyOn(console, 'error').mockImplementation(() => {})`
  - Always restore mocks: `consoleErrorSpy.mockRestore()`
  - Run `pnpm test:ci 2>&1 | grep -E "console\.(warn|error)"` to check for warnings

## Git Workflow
- **Feature branches should be compared against `next-release`**, not `main`.
- When restoring files to original state, use: `git checkout next-release -- path/to/file`
- When checking diffs: `git diff next-release -- path/to/file`

## CI/PR Hygiene
- Run `pnpm lint`, `pnpm typecheck`, `pnpm format:write` before PRs.
- Conventional Commits with ticket IDs when applicable.
- Include screenshots/GIFs for UI changes; document verification steps.

## Security
- Do not commit secrets or `.env*`. Use build/start scripts to select env (`poc`, `prep`, `production`).
- Respect `basePath` in `next.config.mjs` when testing URLs.

## Documentation
- All feature docs live in `/docs/`. When changing behavior, flows, or APIs, update the relevant docs in the same PR.
- **PRD files (`*-prd.md`)**: Product-focused. Describe user stories, acceptance criteria, functional requirements, permissions (what they control), and non-functional requirements. No code or implementation details.
- **SDD files (`*-sdd.md`)**: Technical implementation. Describe code structure, API integration, state management, permission gating implementation, and component architecture.
- **STP files (`*-stp.md`)**: Test plans. Describe test scenarios, coverage matrix, and track test implementation status. Mark tests with `✓` when implemented, `V` when planned.
- Both doc types describe current state only (no change logs or historical notes).

### When to Update Documentation

| Change Type | PRD | SDD | STP |
|-------------|-----|-----|-----|
| New feature / behavior | ✓ | ✓ | ✓ |
| Bug fix (design changed) | | ✓ | |
| Tests added/updated | | | ✓ |
| API changes | | ✓ | ✓ |
| Requirements change | ✓ | | ✓ |
| Architecture refactor | | ✓ | |

## Skills
- Skills folder location in this repo: `./.claude/skills`
