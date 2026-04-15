# SlapMoji

Monorepo: **Next.js** frontend in [`web/`](web/) and **Spring Boot** API in [`backend/`](backend/).

## Getting Started

From the repo root, install and run the web app (requires [pnpm](https://pnpm.io)):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The UI lives under `web/app/`.

Run the API locally (Java 17+):

```bash
cd backend && ./mvnw spring-boot:run
```

Health check: [http://localhost:8080/api/health](http://localhost:8080/api/health).

## Deploy

### Vercel (frontend)

In the Vercel project, set **Root Directory** to `web` (Settings → General). The lockfile lives at the repo root for the pnpm workspace, so [`web/vercel.json`](web/vercel.json) uses `installCommand` to run `pnpm install` from the monorepo root. Connect the same Git repo as today.

Set **`NEXT_PUBLIC_API_URL`** to your Railway public URL (no trailing slash), e.g. `https://your-service.up.railway.app`, when the UI calls the API.

### Railway (API)

Create a service from this repo and set **Root Directory** to `backend`. Railway’s Nixpacks builder runs Maven and starts the executable JAR.

Set **`SLAPMOJI_CORS_ORIGINS`** to your Vercel origin (comma-separated if you have several), e.g. `https://your-app.vercel.app`, so browser requests from the deployed site are allowed.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load [Geist](https://vercel.com/font).
