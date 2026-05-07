# AI Marketplace

AI Marketplace for the SWAT Team — submit problems, track in-flight projects, and browse shipped AI solutions.

Built on the C3 AI Platform with a React frontend.

## What's here

- **Submit a request** — describe a problem worth solving
- **Browse solutions** — search shipped projects with impact data (hours/dollars saved)
- **In-flight projects** — see what's actively being built
- **Team page** — who's on the SWAT team and what they've shipped
- **Admin triage** — review and assign incoming requests

## Project layout

```
aiMarketplace/
  src/                 C3 type definitions and services (.c3typ, .js)
  data/                Seed data
  ui/react/            React + Vite frontend
```

Core entities: `SwatRequest`, `SwatSolution`, `TeamMember`, `SupportingMaterial`.

## Running the UI

```sh
cd aiMarketplace/ui/react
npm install
npm run dev          # http://localhost:8000
```

Create a `.env` in `ui/react/`:

```
VITE_C3_PKG=aiMarketplace
VITE_C3_ENV=<env_name>
VITE_C3_APP=<app_name>
VITE_C3_BASE_URL=<cluster_url>      # e.g. https://gkev8dev.c3dev.cloud
VITE_C3_AUTH_TOKEN=<auth_token>
```

Generate an auth token from the static console:

```js
Authenticator.generateActionAuthToken();
```

Other scripts: `npm run build`, `npm test`, `npm run lint`. See [`ui/react/README.md`](aiMarketplace/ui/react/README.md) for more.

## Deploying to a new environment

The app uses two roles, `aiMarketplace.User` and `aiMarketplace.Admin`. Every C3 employee with an Okta login should land in `aiMarketplace.User` automatically; admins (the SWAT team, ~10 people) are added by hand.

After the package deploys to a new env, run the following from the static console **once per env**.

### 1. Find the env's OIDC IdP id

```js
OidcIdpConfig.fetch().objs.map(c => c.id)
```

The runbook below uses `c3azcs.c3.ai` — substitute whatever your env returns.

### 2. Sanity-check that new users land in `UnMapped`

```js
User.fetch({ limit: 3 }).objs.map(u => u.idpAssignedGroups)

// At least one entry should look like:
// { "OidcIdpConfig::c3azcs.c3.ai": ["c3azcs.c3.ai/UnMapped"] }
```

If no user shows `UnMapped`, stop — the IdP isn't wired up the way the auto-onboarding flow expects.

### 3. Verify the marketplace UserGroups landed with the deploy

```js
UserGroup.fetch({ filter: Filter.startsWith("id", "aiMarketplace") }).objs.map(g => g.id)

// Expect: ["aiMarketplace.User", "aiMarketplace.Admin"]
```

### 4. Map `UnMapped` → `aiMarketplace.User`

```js
UserGroup.forId("aiMarketplace.User").addIdpGroupForIdp(
  OidcIdpConfig.forId("c3azcs.c3.ai"),
  "c3azcs.c3.ai/UnMapped"
)

// Confirm
UserGroup.forId("aiMarketplace.User").idpGroupIdsForIdp(OidcIdpConfig.forId("c3azcs.c3.ai"))
```

This is the step that gives every Okta-authenticated C3 employee `User` access. If you skip it, authenticated users will load the app and silently 403 on every API call.

### 5. Verify with a non-admin account

Have a teammate who is *not* yet in `aiMarketplace.Admin` open the app. They should see the catalog, requests, team, and submit pages — but no Admin tab. **Don't skip this step.** It's the only check that the IdP mapping in step 4 actually took.

### 6. Add admins

```js
User.forId("teammate@c3.ai").addToGroup("aiMarketplace.Admin")
```

Repeat for each SWAT team member who needs triage access.

## Requirements

- Node.js 20.18+ (LTS), npm ≥ 10
- Access to a C3 environment with the `aiMarketplace` package provisioned
