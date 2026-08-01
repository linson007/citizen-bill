# MattamUndo

[![CI](https://github.com/linson007/citizen-bill/actions/workflows/ci.yml/badge.svg)](https://github.com/linson007/citizen-bill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

**മാറ്റം ഉണ്ടോ?** Open-source civic technology for drafting, uploading, discussing, voting on, and sharing public bill proposals — with AI assistance.

Site: [mattamundo.com](https://mattamundo.com)

The first focus is **Kerala**, where MLAs can introduce private member bills, but public participation in drafting is limited. MattamUndo helps people turn public problems into structured legislative drafts that the community can review and surface to representatives.

> AI-generated text is drafting assistance only. It is **not legal advice**.

## Features

- Google sign-in and basic profiles with roles (user / moderator / admin)
- Structured bill editor with categories, tags, and metadata
- Optional AI drafting chat and outline helpers (OpenAI, with local fallbacks)
- PDF / DOCX attachments via Vercel Blob
- Public bill pages with votes, comments, saves, follows, and shares
- Amendment suggestions with author review
- Version history, compare, and PDF / DOCX export
- Dashboard, notifications, and a moderation queue
- Terms, privacy, and legal disclaimer pages

## Tech Stack

| Area | Choice |
| --- | --- |
| App | Next.js App Router, React, TypeScript |
| UI | Tailwind CSS, Lucide icons |
| Auth | Auth.js / NextAuth (Google) |
| Database | PostgreSQL + Prisma |
| AI | OpenAI API (optional in development) |
| Files | Vercel Blob |
| Deploy | Vercel-friendly |

## Quick Start

### Requirements

- Node.js 20+
- npm 10+
- Docker (for local PostgreSQL) or another Postgres instance

### 1. Clone and install

```bash
git clone https://github.com/linson007/citizen-bill.git
cd citizen-bill
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Required:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `NEXTAUTH_SECRET` | Auth secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL, usually `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |

Optional:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Real AI responses (otherwise deterministic fallbacks) |
| `OPENAI_MODEL` | Defaults to `gpt-4.1-mini` |
| `AI_DAILY_LIMIT` | Per-user daily AI requests (default `20`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads |
| `EMAIL_FROM` | Marks notification emails as queued |

### 3. Database

```bash
npm run db:up
npm run db:migrate
```

`src/generated/prisma` is generated and gitignored. After cloning, always run:

```bash
npm run db:generate
```

### 4. Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:watch   # Vitest watch mode
npm run typecheck    # TypeScript check
npm run format       # Prettier
npm run db:up        # Start Postgres (Docker Compose)
npm run db:down      # Stop Postgres
npm run db:logs      # Follow Postgres logs
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Prisma Studio
```

## Project Layout

```text
src/app/           App Router pages, server actions, API routes
src/components/    Shared UI
src/lib/           Domain helpers (bills, AI, auth, uploads, export)
src/lib/__tests__/ Vitest unit tests for lib helpers
src/types/         Ambient TypeScript declarations
prisma/            Schema and migrations
docs/              Maintainer checklists and internal docs
.github/           CI, issue and PR templates
```

## Verification

Before opening a pull request:

```bash
npm run db:generate
npm run lint
npm run test
npm run typecheck
npm run build
```

## Contributing

Contributions are welcome — code, docs, design, and civic product feedback.

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Follow the [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Browse [open issues](https://github.com/linson007/citizen-bill/issues)
4. Prefer small, focused pull requests

Good first areas: docs clarity, UI accessibility, unit tests for `src/lib`, and bill discovery polish.

## Security

Please report vulnerabilities privately via [GitHub Security Advisories](https://github.com/linson007/citizen-bill/security/advisories/new) or email [linsonkurian007@gmail.com](mailto:linsonkurian007@gmail.com). See [SECURITY.md](./SECURITY.md).

## Support

For bugs, ideas, and setup help, see [SUPPORT.md](./SUPPORT.md).

## Product Plan

See [product.md](./product.md) for MVP scope, data model, dashboard plan, and roadmap.

Maintainer open-source checklist: [docs/OPEN_SOURCE_CHECKLIST.md](./docs/OPEN_SOURCE_CHECKLIST.md).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT](./LICENSE)
