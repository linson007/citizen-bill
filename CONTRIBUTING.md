# Contributing

Thanks for helping build Citizen Bill.

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Configure `DATABASE_URL` and any service credentials needed for the feature.
4. Run `npm run db:generate`.
5. Start the app with `npm run dev`.

## Development Standards

- Use TypeScript for application code.
- Keep changes focused and small.
- Run `npm run lint` before opening a pull request.
- Add or update documentation when behavior changes.
- Do not commit secrets, `.env` files, database dumps, or private credentials.
- Prefer accessible, mobile-friendly UI.

## Pull Requests

Include:

- What changed.
- Why it changed.
- Screenshots for UI changes.
- Migration notes for database changes.
- Any known limitations.

## Civic and Legal Content

AI-generated output in this project is draft assistance, not legal advice. Contributors should avoid presenting generated drafts as authoritative legal text without review.
