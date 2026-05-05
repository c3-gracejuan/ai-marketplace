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

## Requirements

- Node.js 20.18+ (LTS), npm ≥ 10
- Access to a C3 environment with the `aiMarketplace` package provisioned
