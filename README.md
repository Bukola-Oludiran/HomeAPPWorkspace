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

Each service manages its own dependencies and environment configuration. Start by copying the
tracked example environment files; never commit real credentials.

Frontend:

```bash
cd PropApp/propapp
npm install
npm run dev
```

Core backend:

```bash
cd PropApp-Backend/core-backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

AI service:

```bash
cd ai-service
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

Some integrations require local infrastructure and service credentials described by the example
environment files.

## Status

Rebuilding. The repository is useful as an architecture and product case study, but parts of the
runtime may require repair or integration work before the complete application can be served.

## Source access

This repository is private because it contains a broad application workspace and integration
surface. Portfolio review should focus on the architecture, contracts, and demonstrated product
scope rather than treating the snapshot as a supported release.
