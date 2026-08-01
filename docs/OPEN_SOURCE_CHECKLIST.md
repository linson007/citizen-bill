# Open Source Checklist

Use this list when preparing releases or reviewing repository health.

## Repository basics

- [x] MIT `LICENSE`
- [x] Clear `README.md` with setup and contribution links
- [x] `CONTRIBUTING.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `SECURITY.md` with private reporting path
- [x] `SUPPORT.md`
- [x] `CHANGELOG.md`
- [x] `.env.example` with no secrets
- [x] Issue templates and PR template
- [x] CI for lint, test, typecheck, and build

## Maintainer follow-ups on GitHub

- [ ] Enable **Private vulnerability reporting** (Settings → Code security)
- [ ] Add Topics: `civic-tech`, `legislation`, `nextjs`, `open-source`, `kerala`
- [ ] Confirm repository description matches README
- [ ] Create labels: `bug`, `enhancement`, `good first issue`, `help wanted`, `docs`, `security`
- [ ] Review branch protection for `main` (require CI, discourage force-push)
- [ ] Add a maintainer contact email in CoC/Security if you prefer email over GitHub advisories

## Before each public release

- [ ] Update `CHANGELOG.md`
- [ ] Confirm `npm run lint`, `test`, `typecheck`, and `build` pass
- [ ] Scan for secrets (`git status`, `.env` not tracked)
- [ ] Confirm migrations in the PR are intentional and reviewed
