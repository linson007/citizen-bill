# Citizen Bill - Product Plan

## 1. Product Objective

Citizen Bill is an open-source civic technology platform where people can draft, attach supporting files, discuss, improve, vote on, and share proposed legislative bills with help from an AI chatbot.

The platform is focused first on Kerala, where MLAs can introduce private member bills, but the success rate and public participation around such bills are low. Citizen Bill aims to give people a structured way to turn public problems into draft bills that can be reviewed, supported, and potentially taken forward by elected representatives, civic groups, policy researchers, journalists, and the public.

## 2. Background

In Kerala, Members of the Legislative Assembly can introduce private member bills. However, these bills rarely succeed, and the public has limited practical channels to help shape legislative ideas into usable legal drafts.

Citizen Bill will become a public participation layer for legislative drafting:

- Anyone can draft a new bill with AI assistance or a structured editor.
- Authors can attach supporting bill documents after creating a bill.
- The community can vote, comment, and improve proposals.
- Popular and well-drafted bills can be shared publicly and surfaced to representatives.

## 3. Target Users

- Citizens who want to propose legal or policy changes.
- Students, researchers, lawyers, and policy enthusiasts who want to draft better bills.
- Civil society groups collecting public support for reforms.
- MLAs, political workers, and legislative staff looking for public-backed ideas.
- Journalists and civic educators tracking public policy demands.

## 4. Core User Journey

1. A user signs in with Google.
2. The user creates a bill proposal with the structured editor and optional AI chatbot support.
3. The user adds a title, short description, category, tags, summary, and supporting notes.
4. The user may attach supporting PDF or DOCX files after the bill record exists.
5. The AI assistant helps improve structure, language, legal clarity, and public readability.
6. The bill is published to the public feed after validation and moderation checks.
7. Other users can read, save/bookmark, vote, comment, suggest improvements, and share the bill.
8. The dashboard highlights trending bills, most supported bills, saved bills, recent activity, and draft status.

## 5. MVP Features

### Authentication

- Sign in with Google.
- Basic user profile with name, email, avatar, and public display name.
- Role support for future moderation and admin tools.

### Bill Creation

- Create bill manually using a structured editor.
- Attach bill files after creation, initially supporting PDF and DOCX.
- Add metadata:
  - Title
  - Short description
  - Category
  - Tags
  - Problem statement
  - Proposed solution
  - Expected public impact
  - References or supporting links

### AI Drafting Assistant

- Chatbot to help users draft bills from plain language.
- Assistant should help with:
  - Converting a problem statement into a draft bill outline.
  - Improving clarity and structure.
  - Creating summaries for the public.
  - Suggesting missing sections.
  - Rewriting in simpler language.
  - Translating or preparing bilingual drafts in a later phase.
- AI output must be treated as a draft, not legal advice.

### Bill Pages

- Public page for each bill.
- Display:
  - Title
  - Summary
  - Full bill draft
  - References and supporting links
  - Author
  - Status
  - Votes
  - Comments
  - Share buttons
  - Created and updated dates
- Export bills as PDF or DOCX for offline review and sharing.
- Compare bill versions to show what changed over time.

### Voting

- Users can upvote bills.
- One vote per authenticated user per bill.
- Vote count visible publicly.
- Future support for reactions or priority scoring can be added later.

### Saved Bills

- Authenticated users can save or unsave public bills from the bill page.
- Each user can save a bill only once.
- Bill pages show how many people saved the proposal.
- The dashboard includes saved-bill counts and a personal saved bills list for later reading and follow-up.

### Comments

- Authenticated users can comment on bills.
- Threaded replies can be added after MVP.
- Basic moderation support should be planned from the start.
- Authors can accept, reject, or merge public amendment suggestions.

### Sharing

- Share bill links to social media.
- Generate metadata previews for platforms like WhatsApp, X, Facebook, LinkedIn, and Telegram.
- Copy link action.

### Dashboard

The dashboard should help both creators and readers understand what is happening.

MVP dashboard sections:

- My drafts
- My published bills
- Bills I voted on
- Saved bills
- Recent comments on my bills
- Trending bills
- Most supported bills
- Recently published bills
- Category filters
- Search
- Kerala-wide discovery for public bills by topic, support, and recency.

Admin or moderator dashboard, later phase:

- Reported bills and comments
- Pending moderation queue
- User management
- Content quality flags
- Abuse reports

## 6. Recommended Tech Stack

The project is planned for Vercel deployment and should remain open-source friendly.

### Frontend and Backend

- Framework: Next.js with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI components: shadcn/ui
- Icons: lucide-react
- Forms: React Hook Form
- Validation: Zod

### Authentication

- Auth.js / NextAuth.js with Google provider

### Database

- PostgreSQL
- Recommended hosted options:
  - Neon
  - Supabase
  - Vercel Postgres, if preferred
- ORM: Prisma

### File Uploads

- Vercel Blob for MVP
- Alternative: UploadThing or Supabase Storage

### AI

- OpenAI API for chat-based drafting assistance
- Use streaming responses for a better chat experience
- Store AI conversations only when useful for drafts and with clear user consent

### Search

- MVP: PostgreSQL full-text search
- Later: Meilisearch, Typesense, or Algolia if search becomes central

### Deployment

- Hosting: Vercel
- Database: Neon or Supabase PostgreSQL
- File storage: Vercel Blob or Supabase Storage
- Environment variables managed through Vercel project settings

### Analytics and Observability

- Vercel Analytics
- Sentry for error tracking
- Optional: PostHog for product analytics if privacy policy supports it

## 7. Suggested Data Model

Core entities:

- User
- Bill
- BillDraft
- BillVersion
- Vote
- SavedBill
- Comment
- Tag
- Category
- UploadedFile
- AiConversation
- Report

Important relationships:

- A user can create many bills.
- A bill can have many versions.
- A bill can have many votes and comments.
- A user can vote once per bill.
- A user can save each public bill once for later reading.
- A bill can have multiple uploaded files.
- A bill can have AI conversation history attached to drafting sessions.

## 8. Bill Status Flow

Recommended statuses:

- Draft
- Ready for Review
- Published
- Under Discussion
- Archived
- Reported
- Removed

Future statuses:

- Submitted to MLA
- Accepted for Review
- Introduced as Private Bill
- Rejected
- Passed

## 9. Moderation and Safety

Since this is a civic platform, moderation must be included early.

MVP requirements:

- Report bill
- Report comment
- Basic admin review page
- Terms of use
- Privacy policy
- Clear disclaimer that AI-generated drafts are not legal advice
- Login-required AI access with per-user daily usage limits
- AI safety event logging for blocked prompts

Content risks to handle:

- Defamation
- Hate speech
- Spam
- Personal data exposure
- False claims
- AI hallucinations
- Impersonation

## 10. Open Source Standards

The repository should be easy for contributors to understand and run locally.

Recommended files:

- `README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `LICENSE`
- `.env.example`
- `SECURITY.md`
- `product.md`

Recommended practices:

- Use TypeScript throughout.
- Keep formatting automated with Prettier.
- Use ESLint.
- Add meaningful issue templates.
- Add pull request template.
- Document local setup clearly.
- Avoid committing secrets.
- Use conventional commits if possible.
- Keep feature work in small pull requests.

Recommended license:

- MIT License for maximum adoption, or
- AGPL-3.0 if the goal is to ensure hosted modifications remain open-source.

## 11. MVP Development Plan

### Phase 1 - Foundation

- Create Next.js app with TypeScript.
- Configure Tailwind CSS and shadcn/ui.
- Add ESLint, Prettier, and basic project scripts.
- Set up Prisma and PostgreSQL.
- Add `.env.example`.
- Add open-source repository documents.

### Phase 2 - Authentication and Profiles

- Add Google login using Auth.js.
- Create user records in the database.
- Build basic account/profile page.
- Protect dashboard routes.

### Phase 3 - Bill Creation

- Build bill creation form.
- Add draft save support.
- Add bill metadata fields.
- Add bill detail page.
- Add published bill listing page.

### Phase 4 - Uploads

- Add PDF and DOCX uploads for existing bill records.
- Store files in Vercel Blob or Supabase Storage.
- Attach uploaded files to bill records.
- Add file validation and size limits.

### Phase 5 - AI Drafting Chatbot

- Add AI chat interface inside the bill editor.
- Support prompt templates for:
  - Drafting a bill from a problem statement
  - Summarizing a bill
  - Improving structure
  - Simplifying language
- Add streaming responses.
- Let users insert AI output into their draft.

### Phase 6 - Public Participation

- Add voting.
- Add comments.
- Add public amendment suggestion review workflow.
- Add social sharing.
- Add category and tag filters.
- Add search.
- Add improved Kerala-wide discovery and category navigation.

### Phase 7 - Dashboard

- Build authenticated user dashboard.
- Show draft bills, published bills, votes, comments, and activity.
- Build public dashboard for trending and most supported bills.

### Phase 8 - Moderation and Launch Readiness

- Add report actions.
- Add basic admin moderation dashboard.
- Add legal disclaimer, privacy policy, and terms pages.
- Add email notification hooks for important user activity.
- Add analytics and error tracking.
- Prepare Vercel deployment.

### Phase 9 - Document and Version Tools

- Export public bills as PDF and DOCX.
- Compare previous bill versions.
- Surface accepted amendment suggestions in version history.

## 12. Future Enhancements

- Malayalam interface.
- Malayalam and English bilingual bill drafting.
- Legislative format templates.
- Public petitions attached to bills.
- MLA outreach workflow.
- Organization accounts for NGOs and civic groups.
- Verified expert review badges.
- API for public civic data access.
- Integration with public datasets and government references.

## 13. Success Metrics

MVP success can be measured through:

- Number of registered users.
- Number of bill drafts created.
- Number of published bills.
- Number of votes per bill.
- Number of comments and discussions.
- Number of social shares.
- Percentage of drafts improved with AI assistance.
- Number of bills submitted to MLAs or civic organizations.
- Contributor activity in the open-source repository.

## 14. Key Product Principles

- Public-first: Bills should be easy for ordinary people to understand.
- Drafts, not legal advice: AI should assist, not claim authority.
- Transparent: Public votes, comments, and version history should build trust.
- Open-source: The project should be easy to inspect, run, and contribute to.
- Accessible: The interface should work well on mobile, especially for users in Kerala.
- Practical: The platform should help move ideas toward real legislative action.
