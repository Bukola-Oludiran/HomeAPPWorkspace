# HomeAPP Workspace

HomeAPP is a multi-role property platform prototype spanning tenant, landlord, agent, payments,
maintenance, messaging, documents, leases, and AI-assisted workflows.

This repository is a private development snapshot. It demonstrates the breadth of the product and
its service boundaries, but the application is currently being rebuilt and is not presented as a
production-ready deployment.

## Workspace layout

```text
HomeAPPWorkspace/
├── PropApp/                         React/Vite product interface
├── PropApp-Backend/core-backend/   Express, Prisma, REST, WebSocket, and gRPC backend
├── ai-service/                     Controlled AI workflows and service integrations
├── contracts/                      Shared Zod and OpenAPI contracts
└── proto/                          Cross-service gRPC definitions
```

## Product surfaces

- Tenant, landlord, and agent workflows
- Property discovery and application management
- Leases, transactions, banking, and document flows
- Maintenance, messaging, notifications, and reporting
- Shared runtime validation across frontend and backend
- AI-assisted reads and controlled mutations through service boundaries

## Technology

- React 19, Vite, TypeScript, and Tailwind CSS
- Node.js, Express, Prisma, PostgreSQL, and Socket.IO
- gRPC and Protocol Buffers for internal service contracts
- Zod and generated OpenAPI descriptions
- S3-compatible object storage integrations
- A separate TypeScript AI service using explicit read/write boundaries

## Local development

Node 20+ and Docker are required. From a fresh checkout, copy the tracked examples and use the
same local JWT secret and database URL for both services:

```bash
cp PropApp-Backend/core-backend/.env.example PropApp-Backend/core-backend/.env
cp ai-service/.env.example ai-service/.env
cp PropApp/propapp/.env.example PropApp/propapp/.env
```

For the local Docker database, set `DATABASE_URL` and `DIRECT_URL` in the backend to
`postgresql://homeai:homeai_dev@localhost:5433/homeai_dev?schema=public`. Set the AI service
`DATABASE_URL` to the same value, and set both services' `JWT_SECRET` to the same 32+ character
value. Then run:

```bash
npm run setup
npm run dev
```

The frontend is served at `http://localhost:5173`, the API at `http://localhost:3000/api/v1`, and
the AI service at `http://localhost:4000`. Useful verification commands are `npm run build`,
`npm run lint`, `npm test`, `npm run test:integration`, and `npm run openapi`.

Email, payments, KYC, storage, push, and LLM credentials are optional in local development. Their
deterministic development adapters remain behind the same service interfaces. ComplyFlow telemetry
is also optional and defaults to a no-op internal adapter; no sibling repository is required.

## Status

The workspace includes a documented local integration workflow and additive database migrations.
Production infrastructure and production provider credentials remain outside this MVP.

## Source access

This repository is private because it contains a broad application workspace and integration
surface. Portfolio review should focus on the architecture, contracts, and demonstrated product
scope rather than treating the snapshot as a supported release.
