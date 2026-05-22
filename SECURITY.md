# Security Policy

## Reporting a Vulnerability

Please do not create public issues for security vulnerabilities.

Report security concerns privately to the project maintainers. Include:

- Affected area.
- Steps to reproduce.
- Potential impact.
- Suggested fix, if known.

## Sensitive Data

Never commit:

- `.env` files.
- API keys.
- Database credentials.
- OAuth secrets.
- Private user data.

## Dependency Security

Run dependency checks during maintenance:

```bash
npm audit --audit-level=moderate
npm outdated
```

Do not run `npm audit fix --force` blindly. It may downgrade or make breaking framework changes. Prefer normal `npm update` first, then review any remaining advisories and upgrade framework packages only when compatible patched releases are available.

## AI and Civic Safety

Citizen Bill may process sensitive civic and legal text. Features should minimize unnecessary storage of personal data and clearly separate AI drafting assistance from legal advice.
