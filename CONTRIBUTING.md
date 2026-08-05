# Contributing to MattamUndo

Thanks for helping build open civic infrastructure. This guide covers how to set up the project, propose changes, and keep contributions reviewable.

## Ways to Contribute

- Fix bugs or improve accessibility
- Add or clarify documentation
- Improve unit tests around `src/lib`
- Propose product or UX improvements via issues
- Help with moderation, safety, and civic-content guardrails

If you are unsure where to start, open an issue and label it as a question, or look for issues tagged `good first issue`.

## Code of Conduct

Participation is governed by the [Code of Conduct](./CODE_OF_CONDUCT.md). Be respectful across political, legal, social, and regional viewpoints.

## Local Setup

1. Install Node.js 20+ and Docker (or provide your own PostgreSQL).
2. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/linson007/citizen-bill.git
   cd citizen-bill
   npm install
   ```

3. Copy environment defaults:

   ```bash
   cp .env.example .env
   ```

4. Set at least `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.
5. For Google login, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
6. Start Postgres and migrate:

   ```bash
   npm run db:up
   npm run db:migrate
   ```

7. Generate the Prisma client (required after clone and after schema changes):

   ```bash
   npm run db:generate
   ```

8. Start the app:

   ```bash
   npm run dev
   ```

OpenAI, Blob uploads, and email are optional for many local workflows. Without `OPENAI_API_KEY`, AI endpoints return deterministic development fallbacks.

## Development Standards

- Use TypeScript for application code.
- Keep pull requests focused and small.
- Prefer server actions and existing patterns in `src/app` and `src/lib`.
- Match nearby naming, formatting, and component style.
- Prefer accessible, mobile-friendly UI.
- Do not commit secrets, `.env` files, dumps, or private credentials.
- Do not commit generated Prisma output under `src/generated/prisma`.
- AI output in this project is draft assistance, not legal advice. Do not present generated drafts as authoritative legal text.

## Branching and Commits

1. Fork the repository (or create a branch if you have write access).
2. Create a branch from `main`:

   ```bash
   git checkout -b fix/short-description
   ```

3. Prefer conventional, readable commit messages:

   - `feat: add bill follow empty state`
   - `fix: prevent draft bills from appearing in discovery`
   - `docs: clarify local database setup`
   - `test: cover bill visibility helpers`
   - `chore: tighten CI env defaults`

## Tests and Checks

Add or update Vitest tests next to the code they cover (`*.test.ts` / `*.test.tsx`), especially for helpers in `src/lib`.

Before opening a pull request:

```bash
npm run db:generate
npm run lint
npm run test
npm run typecheck
npm run build
```

Optional formatting:

```bash
npm run format
```

## Pull Requests

Use the pull request template and include:

- What changed
- Why it changed
- Screenshots for UI changes
- Migration notes for Prisma schema or SQL changes
- Known limitations or follow-up work

CI must pass before merge. Maintainers may ask for smaller diffs if a PR mixes unrelated concerns.

## Database Changes

- Edit `prisma/schema.prisma`
- Create a migration with `npm run db:migrate`
- Commit the migration SQL under `prisma/migrations`
- Regenerate the client with `npm run db:generate`
- Document any backfill or operational steps in the PR

## Reporting Bugs and Ideas

- Bugs: use the Bug report issue template
- Features: use the Feature request template
- Security: follow [SECURITY.md](./SECURITY.md) — do not file public issues for vulnerabilities

## Civic and Legal Content

MattamUndo hosts civic drafting and discussion. Contributors should:

- Avoid hate speech, harassment, and doxxing in examples or fixtures
- Minimize personal data in seeds, screenshots, and logs
- Keep disclaimers intact where AI assistance is shown
- Prefer clear, plain-language copy for public-facing surfaces

## Questions

Open a GitHub issue with enough context for maintainers to help, or start from an existing related issue.
