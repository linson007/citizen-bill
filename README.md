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

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env
```

For Google login, create OAuth credentials in Google Cloud Console and set:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Generate the Prisma client:

```bash
npm run db:generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Start local development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run unit tests in watch mode
npm run format       # Format the repository
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run local Prisma migrations
npm run db:studio    # Open Prisma Studio
```

## Testing

The project uses Vitest for fast unit tests. Add tests next to the code they
cover using `*.test.ts` or `*.test.tsx`.

```bash
npm run test
```

## Product Plan

See [product.md](./product.md) for the product scope, MVP phases, data model, dashboard plan, and future roadmap.

## Upload Limits

Bill attachments support PDF and DOCX files up to 10 MB. Configure
`BLOB_READ_WRITE_TOKEN` to enable Vercel Blob uploads.

## Legal Pages

The app includes public terms and privacy pages at `/terms` and `/privacy`.
AI-generated text is drafting assistance only and is not legal advice.

## AI Usage Limits

AI drafting endpoints require login and track per-user usage in the database.
The default limit is 20 AI requests per user per day. Override it with:

```bash
AI_DAILY_LIMIT=20
```

## License

MIT
