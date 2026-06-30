# MANNA

## Setup

```bash
npm install
cp .env        # fill in RESEND_API_KEY and OWNER_EMAIL
npm run dev    # http://localhost:4321
```

## Environment variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | From resend.com/api-keys |
| `OWNER_EMAIL` | Receives new booking inquiries |

> **Note:** The `from` address in `src/pages/api/contact.ts` must use a domain verified in your Resend account.

## Docker

```bash
# Development (hot-reload, mounts src/)
docker compose up dev

# Production (built image)
docker compose up prod --build
```

## Build & run manually

```bash
npm run build
npm start       # http://localhost:3000
```
