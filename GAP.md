# Pending Product Gaps

Last reconfirmed: August 2, 2026.

Authoritative open-product checklist for MattamUndo. The gaps table and near-term backlog in [`product.md`](product.md) should stay aligned with this file.

## High priority

- [ ] **Public legislative lifecycle:** Make `SUBMITTED_TO_MLA`, `INTRODUCED_AS_PRIVATE_BILL`, `REJECTED`, and `PASSED` publicly visible, and add author workflows for recording those outcomes. Today only `PUBLISHED`, `UNDER_DISCUSSION`, and `READY_FOR_REVIEW` are treated as public.
- [ ] **Petition signatures:** Schema and helpers exist (`BillSignature`, `bill-signatures.ts`), but there is no bill-page action or UI to sign a bill, update a signature note, or show the signature count.
- [ ] **Comment replies:** Use `Comment.parentId` to add threaded replies with appropriate moderation controls. Comments are flat in the UI today.
- [ ] **Discovery filters:** Add tag filtering; decide whether `Bill.region` should be exposed in authoring/discovery or removed. Browse currently filters by query, category, public status, and sort only.
- [ ] **Malayalam completeness:** Localized shared navigation, home, and bill discovery exist, but dashboard, notifications, profile, and much bill-detail copy remain English-first. Add Malayalam-aware search (discovery FTS is English `tsvector` today) and Unicode-capable PDF export (PDF uses Helvetica / Latin-focused).

## Product and workflow

- [ ] **Dashboard activity:** Dashboard shows a votes-given count only. Profile lists up to 10 recent votes; add a dedicated, fuller “bills I voted on” list (dashboard and/or paginated profile).
- [ ] **Attachment management:** Authors can upload PDF/DOCX after create, but cannot remove or replace files, including deleting the corresponding Vercel Blob object.
- [ ] **Suggestion provenance:** Record and display when a bill version was created from an accepted or merged amendment suggestion. Accept/merge updates the live bill, but version history does not label suggestion origin.
- [ ] **Public profiles:** Add public author pages so citizens, civic groups, researchers, and representatives can review an author's proposals and reputation. `/profile` is private to the signed-in user.
- [ ] **Notifications:** Mark-all-read exists and the page caps at 50 items. Add pagination (or load-more), per-notification read controls, and consider notification preferences.
- [ ] **Content quality:** Extend reports with spam/abuse controls, rate limits, and richer quality-review signals. Basic report + moderator queue already ships.
- [ ] **Admin user management:** Add a secure admin interface for finding users and managing roles or account restrictions. Roles exist (`USER` / `MODERATOR` / `ADMIN`); moderation tools do not cover user admin.

## Platform and operations

- [ ] **Email delivery:** Replace the `EMAIL_FROM` logging stub with a transactional provider such as Resend or SES.
- [ ] **Observability:** Add privacy-reviewed product analytics and error tracking (for example Vercel Analytics and Sentry).
- [ ] **Discovery scale:** Add pagination or cursor-based loading. Current unfiltered discovery loads all public bills and searched results cap at 100.
- [ ] **Test coverage:** Add database-backed tests for server actions/API routes and at least a small end-to-end user journey; CI currently runs helper-focused unit tests only.

## Intentional non-gaps

These are not open product work:

- **shadcn/ui:** Not adopted. Optional rather than required; retain custom Tailwind components unless the team chooses a migration.
