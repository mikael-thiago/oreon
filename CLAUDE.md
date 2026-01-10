# CLAUDE.md - Oreon School Management System

This document provides essential information for AI assistants working with this codebase.

## Project Overview

**Oreon** is a comprehensive school management system built as a TurboRepo monorepo with TypeScript. The system handles school administration, staff management, student enrollments, and curriculum organization.

**Monorepo Structure:**
- `apps/api` - Backend REST API
- `apps/frontend` - React SPA frontend
- `packages/utils` - Shared utility functions

## Technology Stack

### Backend (apps/api)
- **Runtime:** Node.js + TypeScript 5.9
- **HTTP Framework:** Fastify 5.6 (HTTP server)
- **ORM:** Drizzle ORM 0.44 + PostgreSQL
- **DI:** InversifyJS 7.10
- **Validation:** Zod 4.1 with fastify-type-provider-zod
- **Auth:** @fastify/jwt (cookie-based tokens)
- **Password:** Argon2
- **Migrations:** Umzug 3.8 (SQL + TypeScript support)

### Frontend (apps/frontend)
- **Framework:** React 19.2 + TypeScript 5.9
- **Bundler:** Vite (rolldown-vite 7.2.5)
- **Router:** TanStack Router 1.139 (type-safe)
- **Data:** TanStack Query 5.90 (React Query)
- **Forms:** React Hook Form 7.67 + Zod
- **State:** Zustand 5.0 + Context API
- **Styling:** Tailwind CSS 4.1
- **UI:** Radix UI primitives (shadcn/ui style)
- **Icons:** Lucide React

### Shared
- **Package Manager:** npm@10.8.2
- **Monorepo:** Turborepo
- **Module System:** ESM (type: "module")

## Commands
- **npm start:** Start all projects in dev mode
- **npm run test:** Run tests of all projects
- **npm run build:** Build all projects