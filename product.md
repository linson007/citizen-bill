# MattamUndo - Product Plan

Public brand: **MattamUndo** (മാറ്റം ഉണ്ടോ?) · [mattamundo.com](https://mattamundo.com)  
Repository: still hosted at `linson007/citizen-bill` until renamed.

Last reviewed against the codebase: August 2026 (`v0.1.0` / unreleased open-source polish).

## 1. Product Objective

MattamUndo is an open-source civic technology platform where people can draft, attach supporting files, discuss, improve, vote on, and share proposed legislative bills with help from an AI chatbot.

The platform is focused first on Kerala, where MLAs can introduce private member bills, but the success rate and public participation around such bills are low. MattamUndo aims to give people a structured way to turn public problems into draft bills that can be reviewed, supported, and potentially taken forward by elected representatives, civic groups, policy researchers, journalists, and the public.

## 2. Background

In Kerala, Members of the Legislative Assembly can introduce private member bills. However, these bills rarely succeed, and the public has limited practical channels to help shape legislative ideas into usable legal drafts.

MattamUndo is a public participation layer for legislative drafting:

- Anyone can draft a new bill with AI assistance or a structured editor.
- Authors can attach supporting bill documents after creating a bill.
- The community can vote, comment, suggest amendments, and improve proposals.
- Popular and well-drafted bills can be shared publicly and surfaced to representatives.

## 3. Target Users

- Citizens who want to propose legal or policy changes.
- Students, researchers, lawyers, and policy enthusiasts who want to draft better bills.
- Civil society groups collecting public support for reforms.
- MLAs, political workers, and legislative staff looking for public-backed ideas.
- Journalists and civic educators tracking public policy demands.

## 4. Core User Journey

1. A user signs in with Google.
2. The user creates a bill proposal with the structured editor and optional AI helper.
3. The user adds a title, short description, Kerala department-style category, tags, problem, solution, impact, body, and references.
4. The user may attach supporting PDF or DOCX files after the bill record exists (Vercel Blob).
5. The AI assistant helps improve structure, language, legal clarity, and public readability.
6. The bill is published to the public feed after field validation; public bills can later be reported and reviewed by moderators.
7. Other users can read, save/bookmark, follow for activity updates, vote, comment, suggest amendments, report content, and share the bill.
8. The dashboard and profile highlight drafts, published bills, saves, follows, votes, comments, reputation, notifications, trending bills, and discovery filters.

## 5. Implementation Status

### Done in the current app

| Area | What ships today |
| --- | --- |
| Auth | Google sign-in via Auth.js / NextAuth, Prisma adapter, roles `USER` / `MODERATOR` / `ADMIN` |
| Profiles | Display name, avatar from Google, reputation score/level, AI session history |
| Bill drafting | Structured form (title, description, category, tags, problem, solution, impact, body, references), draft save, publish validation |
| Categories | Kerala department-style category list plus free-text “Other” |
| AI drafting | Chat + outline helpers, modes (draft, legal structure, simplify, Malayalam, summarize, arguments), streaming, insert into form, optional session save, daily per-user limits, safety event logging, local fallbacks without `OPENAI_API_KEY` |
| Uploads | PDF/DOCX after bill creation via Vercel Blob, MIME/size/signature checks |
| Public bills | Detail pages with metadata, Open Graph / Twitter previews, analytics counts |
| Engagement | One vote per user, save/unsave, follow/unfollow, flat comments, amendment suggestions with author accept / reject / merge |
| Notifications | In-app notifications for votes, comments, suggestions, and followed-bill activity; mark-as-read |
| Discovery | `/bills` search (Postgres full-text), category filter, public status filter, sort (trending, newest, most supported, most discussed) |
| Status automation | Comment or suggestion on a `PUBLISHED` bill → `UNDER_DISCUSSION`; ≥25 votes → `READY_FOR_REVIEW` |
| Versions | Version snapshots on publish/update, version detail pages, side-by-side compare |
| Export | Public bill PDF and DOCX export |
| Sharing | WhatsApp, X, Facebook, LinkedIn, Telegram, copy link, share event tracking |
| Dashboard | Drafts, published, vote/comment/save/follow counts, saved and followed lists, recent comments on my bills, trending / most supported / recently published |
| Moderation | Report bill/comment, moderator queue (dismiss, resolve, remove bill), AI usage overview and reset |
| Legal | Terms, privacy, AI-not-legal-advice disclaimer |
| Open source | MIT license, README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, CHANGELOG, `.env.example`, CI, issue/PR templates |

### Gaps and incomplete work

Compared with this product plan and the schema, these items are still missing or only partial:

| Gap | Status | Notes |
| --- | --- | --- |
| Petition signatures (`BillSignature`) | Schema + helpers only | No bill-page action or UI to sign / update a petition note |
| Threaded comment replies | Schema has `parentId` | UI posts and lists flat comments only |
| Tag filters on discovery | Tags stored on bills | Browse/search filters by query, category, status, and sort — not by tag |
| Dedicated “bills I voted on” dashboard list | Partial | Dashboard shows vote **count**; profile lists recent votes |
| Email delivery | Stub | `EMAIL_FROM` logs queued events; no provider (Resend/SES/etc.) |
| Unused `Bill.region` field | Schema only | Not exposed in forms or discovery |
| shadcn/ui | Not adopted | Custom Tailwind UI + Lucide; React Hook Form + Zod are in use |
| Analytics / error tracking | Not wired | No Vercel Analytics, Sentry, or PostHog |
| Admin user management | Not built | Roles exist; no user admin UI beyond moderation tools |
| Content quality / abuse flags beyond reports | Partial | Report workflow exists; richer quality scoring is not built |
| Malayalam product UI | Partial | AI has a Malayalam drafting mode; app chrome and bills listing remain English-first |
| Accepted suggestions in version history | Partial | Accept/merge updates the live bill and can create versions on edit/publish; history does not explicitly label “from accepted suggestion” |
| Legislative outreach statuses in product UX | Enum only | `SUBMITTED_TO_MLA`, `INTRODUCED_AS_PRIVATE_BILL`, `REJECTED`, `PASSED` exist in Prisma but are not first-class author workflows |

## 6. MVP Feature Detail

### Authentication

- Sign in with Google.
- Basic user profile with name, email, avatar, and public display name.
- Role support for moderation and admin tools (`USER`, `MODERATOR`, `ADMIN`).
- Reputation score derived from published bills, votes received, comments, and amendment suggestions.

### Bill Creation

- Create bill manually using a structured editor.
- Attach bill files after creation, supporting PDF and DOCX.
- Metadata:
  - Title
  - Short description
  - Category (Kerala department list + Other)
  - Tags
  - Problem statement
  - Proposed solution
  - Expected public impact
  - Full draft body
  - References or supporting links

### AI Drafting Assistant

- Chat and one-shot draft helpers inside the bill editor.
- Modes for drafting, legal structure, simplifying language, summarizing, arguments, and early Malayalam drafting.
- Login-required AI access with per-user daily usage limits (`AI_DAILY_LIMIT`, default 20).
- AI safety event logging for blocked prompts.
- Optional conversation save; sessions visible on the profile.
- AI output is treated as a draft, not legal advice.

### Bill Pages

- Public page for each bill (drafts visible to author only).
- Display title, summary/description, full draft, references, author, status, votes, saves, followers, comments, suggestions, shares, created/updated dates.
- Export as PDF or DOCX.
- Compare bill versions to show what changed over time.

### Voting

- Authenticated users can upvote public bills (authors cannot vote on their own).
- One vote per authenticated user per bill.
- Vote count visible publicly.
- Future: reactions or priority scoring.

### Saved Bills

- Authenticated users can save or unsave public bills.
- One save per user per bill; save counts shown on bill pages.
- Dashboard includes saved-bill counts and a personal saved list.

### Followed Bills and Activity Notifications

- Authenticated users can follow or unfollow public bills.
- Followers get in-app notifications for new comments and amendment suggestions from others.
- Authors get notifications for votes, comments, and suggestions.
- Bill pages show follower counts; dashboard lists followed bills.
- Email hooks are prepared but not delivered yet.

### Comments and Amendments

- Authenticated users can comment on public bills.
- Threaded replies are planned next (schema ready).
- Amendment suggestions with section label; authors can accept, reject, or merge.
- Report bill and report comment actions feed the moderation queue.

### Sharing

- Share bill links to WhatsApp, X, Facebook, LinkedIn, and Telegram.
- Open Graph / Twitter metadata for previews.
- Copy link action and share event recording (`BillShare`).

### Dashboard and Discovery

Authenticated dashboard sections that exist today:

- My drafts and my published bills
- Vote / comment / save / follow counts
- Saved bills and followed bills lists
- Recent comments on my bills
- Trending, most supported, and recently published bills

Public discovery (`/bills` and home highlights):

- Search (PostgreSQL full-text)
- Category filters
- Public status filters
- Sort by trending, newest, most supported, most discussed

Moderator tools (`/moderation`):

- Reported bills and comments queue
- Resolve / dismiss / remove reported bill
- AI usage and safety event visibility

Still later for admin:

- User management
- Richer content quality flags

## 7. Tech Stack (as implemented)

Planned for Vercel-friendly open-source deployment.

### Frontend and Backend

- Framework: Next.js App Router (currently Next 16) + React 19
- Language: TypeScript
- Styling: Tailwind CSS (custom components; shadcn/ui not required)
- Icons: lucide-react
- Forms: React Hook Form
- Validation: Zod
- Tests: Vitest for `src/lib` helpers

### Authentication

- Auth.js / NextAuth.js with Google provider and Prisma adapter

### Database

- PostgreSQL (local via Docker Compose; hosted Neon / Supabase / Vercel Postgres compatible)
- ORM: Prisma 7 (`src/generated/prisma`)

### File Uploads

- Vercel Blob (`BLOB_READ_WRITE_TOKEN`)

### AI

- OpenAI API for chat and draft assistance (optional in development)
- Streaming responses where supported
- Deterministic local fallbacks when no API key is set
- Conversations stored only when the user opts to save history

### Search

- MVP: PostgreSQL full-text search (`websearch_to_tsquery` / `ts_rank_cd`)
- Later: Meilisearch, Typesense, or Algolia if search becomes central

### Deployment

- Hosting: Vercel-friendly
- Database: Neon or Supabase PostgreSQL (or local Docker)
- File storage: Vercel Blob
- Environment variables via `.env` / Vercel project settings

### Analytics and Observability (not yet)

- Planned: Vercel Analytics, Sentry, optional PostHog if the privacy policy supports it

## 8. Data Model

Core entities in `prisma/schema.prisma`:

- User (with `UserRole`)
- Account / Session / VerificationToken (Auth.js)
- Bill
- BillVersion
- Vote
- SavedBill
- BillFollow
- BillSignature *(schema ready; product UI pending)*
- BillShare
- Comment *(supports `parentId` for future threading)*
- Tag / BillTag / Category
- UploadedFile
- AiConversation / AiSafetyEvent / AiUsageEvent
- AmendmentSuggestion
- Report
- Notification

There is no separate `BillDraft` table; drafts are `Bill` rows with status `DRAFT`.

Important relationships:

- A user can create many bills.
- A bill can have many versions, votes, comments, saves, follows, shares, files, suggestions, and AI sessions.
- A user can vote, save, follow, or sign each bill at most once (unique constraints).
- Reports can target a bill or a comment.

## 9. Bill Status Flow

Current statuses in the enum:

- Draft
- Ready for Review *(auto when a public bill reaches 25 votes)*
- Published
- Under Discussion *(auto when comments or suggestions land on a published bill)*
- Archived
- Reported
- Removed
- Submitted to MLA *(enum reserved; no author workflow yet)*
- Introduced as Private Bill *(enum reserved)*
- Rejected *(enum reserved)*
- Passed *(enum reserved)*

Publicly listable statuses today: `PUBLISHED`, `UNDER_DISCUSSION`, `READY_FOR_REVIEW`.

Future product work should expose the legislative outreach statuses as deliberate author/moderator actions, not only database values.

## 10. Moderation and Safety

Included early and largely implemented:

- Report bill
- Report comment
- Basic moderator review page
- Terms of use
- Privacy policy
- Clear disclaimer that AI-generated drafts are not legal advice
- Login-required AI access with per-user daily usage limits
- AI safety event logging for blocked prompts

Content risks still to keep hardening against:

- Defamation
- Hate speech
- Spam
- Personal data exposure
- False claims
- AI hallucinations
- Impersonation

## 11. Open Source Standards

Present in the repository:

- `README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `LICENSE` (MIT)
- `.env.example`
- `SECURITY.md`
- `SUPPORT.md`
- `CHANGELOG.md`
- `product.md`
- `docs/OPEN_SOURCE_CHECKLIST.md`
- GitHub issue forms, PR template, CI workflow

Practices in use:

- TypeScript throughout
- Prettier and ESLint
- Small focused pull requests preferred
- Secrets kept out of git (`.env` gitignored)

## 12. Development Plan Progress

### Phase 1 - Foundation — done

- Next.js + TypeScript, Tailwind, ESLint, Prettier, Prisma, PostgreSQL, `.env.example`, open-source docs, CI.

### Phase 2 - Authentication and Profiles — done

- Google login, user records, profile page, protected dashboard, roles, reputation.

### Phase 3 - Bill Creation — done

- Creation form, draft save, metadata, detail page, published listing.

### Phase 4 - Uploads — done

- PDF/DOCX via Vercel Blob, validation, attachment to bill records.

### Phase 5 - AI Drafting Chatbot — done (MVP)

- Editor AI helper, prompt modes, streaming, insert into draft, usage limits, safety logging, optional history.

### Phase 6 - Public Participation — mostly done

- Voting, comments, amendment review, sharing, category filters, search, discovery sorts.
- Remaining: threaded replies, tag filters, petition signatures UI.

### Phase 7 - Dashboard — mostly done

- Authenticated dashboard for drafts, engagement, saves, follows, trending and support rankings.
- Remaining: richer “bills I voted on” list on the dashboard itself.

### Phase 8 - Moderation and Launch Readiness — mostly done

- Reports, moderation page, legal pages, notification hooks.
- Remaining: real email provider, analytics, Sentry, user management.

### Phase 9 - Document and Version Tools — done (MVP)

- PDF/DOCX export, version pages, compare view.
- Remaining: explicitly surface accepted amendments in version history labels.

## 13. Near-Term Product Backlog

Priority gaps to close next:

1. Wire petition signatures end-to-end (sign / update note / counts on bill page and dashboard).
2. Threaded comment replies using existing `parentId`.
3. Tag filter on public discovery.
4. Email provider for notification delivery.
5. Dashboard list of bills the user voted on.
6. Analytics and error tracking.
7. Optional: expose `region` or drop the unused column.
8. Optional: Malayalam UI strings for core chrome.

## 14. Future Enhancements

- Full Malayalam interface and bilingual bill drafting UX.
- Legislative format templates.
- Public petitions attached to bills (beyond the unfinished signature model).
- MLA outreach workflow using reserved statuses.
- Organization accounts for NGOs and civic groups.
- Verified expert review badges.
- API for public civic data access.
- Integration with public datasets and government references.

## 15. Success Metrics

MVP success can be measured through:

- Number of registered users.
- Number of bill drafts created.
- Number of published bills.
- Number of votes per bill.
- Number of comments, suggestions, and discussions.
- Number of social shares and saves/follows.
- Percentage of drafts improved with AI assistance.
- Number of bills moved toward MLA or civic organization follow-up.
- Contributor activity in the open-source repository.

## 16. Key Product Principles

- Public-first: Bills should be easy for ordinary people to understand.
- Drafts, not legal advice: AI should assist, not claim authority.
- Transparent: Public votes, comments, and version history should build trust.
- Open-source: The project should be easy to inspect, run, and contribute to.
- Accessible: The interface should work well on mobile, especially for users in Kerala.
- Practical: The platform should help move ideas toward real legislative action.
