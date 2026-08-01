# Security Policy

## Supported Versions

Security fixes are applied to the latest `main` branch. If you are running a fork or older deployment, please rebase or cherry-pick fixes from `main` when possible.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Older commits / forks | Best effort |

## Reporting a Vulnerability

**Do not create public GitHub issues for security vulnerabilities.**

Please report security concerns privately using either:

1. [GitHub Security Advisories](https://github.com/linson007/citizen-bill/security/advisories/new)
2. Email: [linsonkurian007@gmail.com](mailto:linsonkurian007@gmail.com)

Include:

- Affected area (route, action, component, dependency)
- Steps to reproduce
- Potential impact
- Suggested fix, if known

We aim to acknowledge reports within 7 days and to share a remediation plan or status update as soon as practical.

## Sensitive Data

Never commit:

- `.env` files
- API keys, OAuth secrets, or database credentials
- Private user data, dumps, or production logs
- Personal information in fixtures, screenshots, or issue attachments

Use `.env.example` for non-secret placeholders only.

## Dependency Security

During maintenance:

```bash
npm audit --audit-level=moderate
npm outdated
```

Do not run `npm audit fix --force` blindly. Prefer normal `npm update`, then review remaining advisories and upgrade framework packages only when compatible patched releases are available.

## AI and Civic Safety

MattamUndo may process sensitive civic and legal text. Features should:

- Minimize unnecessary storage of personal data
- Keep AI drafting assistance clearly separated from legal advice
- Log blocked or unsafe prompts through existing safety mechanisms when applicable
- Require authentication and respect daily AI usage limits for AI endpoints
