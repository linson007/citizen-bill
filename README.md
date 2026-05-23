# Citizen Bill

Citizen Bill is an open-source civic technology platform for drafting, uploading, discussing, voting on, and sharing public bill proposals with AI assistance.

The first focus is Kerala, where MLAs can introduce private member bills, but public participation in the drafting process is limited. The project aims to help citizens convert public problems into structured legislative drafts that can be reviewed by the community and surfaced to representatives.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js / NextAuth.js
- OpenAI API
- Vercel Blob
- Vercel deployment

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment variables

```bash
cp .env.example .env
```

Edit `.env` and set the values needed for your environment.

Required for the app and database:

- `DATABASE_URL` - PostgreSQL connection string used by Prisma.
- `NEXTAUTH_SECRET` - random secret for NextAuth/Auth.js. Generate one with `openssl rand -base64 32`.
- `NEXTAUTH_URL` - local URL, usually `http://localhost:3000`.

Required for Google login:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional:

- `OPENAI_API_KEY` - enables real OpenAI responses. Without it, development fallback AI drafts are returned.
- `OPENAI_MODEL` - OpenAI chat/completions model. Defaults to `gpt-4.1-mini`.
- `AI_DAILY_LIMIT` - per-user daily AI request limit. Defaults to `20`.
- `BLOB_READ_WRITE_TOKEN` - enables Vercel Blob uploads for bill attachments.
- `EMAIL_FROM` - marks notification emails as queued. Without it, email events are logged in development.

### 3. Prepare PostgreSQL

For local development, start PostgreSQL with Docker Compose:

```bash
npm run db:up
```

This starts a PostgreSQL 16 container using the connection string from `.env.example`:

```bash
DATABASE_URL="postgresql://citizen_bill:citizen_bill_password@localhost:5432/citizen_bill?schema=public"
```

Then run migrations:

```bash
npm run db:migrate
```

If the database schema is already up to date and you only need generated Prisma types/client, run:

```bash
npm run db:generate
```

Important: `src/generated/prisma` is generated code and is intentionally ignored by git. Run `npm run db:generate` after cloning and before typechecking, testing, or building.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

Before committing, run:

```bash
npm run db:generate
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

## Scripts

```bash
npm run dev          # Start local development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run format       # Format the repository
npm run db:up        # Start local PostgreSQL with Docker Compose
npm run db:down      # Stop local PostgreSQL
npm run db:logs      # Follow local PostgreSQL logs
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run local Prisma migrations
npm run db:studio    # Open Prisma Studio
```

## Testing

The project uses Vitest for fast unit tests. Add tests next to the code they cover using `*.test.ts` or `*.test.tsx`.

```bash
npm run db:generate
npm run test
```

## Product Plan

See [product.md](./product.md) for the product scope, MVP phases, data model, dashboard plan, and future roadmap.

## Upload Limits

Bill attachments support PDF and DOCX files up to 10 MB. Configure `BLOB_READ_WRITE_TOKEN` to enable Vercel Blob uploads.

## Legal Pages

The app includes public terms and privacy pages at `/terms` and `/privacy`. AI-generated text is drafting assistance only and is not legal advice.

## AI Usage Limits

AI drafting endpoints require login and track per-user usage in the database. The default limit is 20 AI requests per user per day. Override it with:

```bash
AI_DAILY_LIMIT=20
```

## License

MIT
