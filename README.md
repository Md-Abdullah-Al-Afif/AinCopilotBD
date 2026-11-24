# AinCopilot BD (আইন কপাইলট)

AI legal advisory and document risk analysis for Bangladeshi law. Grounded in `bdlaws.minlaw.gov.bd` through three server-side tools (no search API, no billing). One environment variable only.

## Run locally
```bash
npm install
cp .env.example .env.local      # then paste your key
npm run dev                     # http://localhost:3000
```
Node 22 or newer is required.

## Get the free API key
1. Open https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key**. No credit card is needed.
3. Copy the key.

## Deploy to Vercel (free Hobby plan)
1. Push this folder to a GitHub repository.
2. On https://vercel.com click **Add New → Project**, import the repository. Framework is detected as Next.js.
3. Before deploying, open **Environment Variables** and add:
   - Name: `GOOGLE_GENERATIVE_AI_API_KEY`
   - Value: your key
   - Environments: Production, Preview, Development
4. Click **Deploy**.
5. If you add or change the key later: **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.

Optional: `GEMINI_MODEL` overrides the default model on the server. It is never shown in the UI.

## How it works
- `app/api/copilot/route.ts`: streams the memorandum with AI SDK v7 (`instructions`, `isStepCount(6)`).
- `lib/tools/bdlaws-tools.ts`: `searchBangladeshStatutes`, `readOfficialStatutePage`, `searchBangladeshLegalNews` (fetch + cheerio, 24-hour cache).
- `lib/bd-fallback-index.ts`: English, Bengali and Banglish keyword map used if the live index is unreachable. Acts without a confirmed page are shown as unverified.
- `app/page.tsx`: homepage and split-screen workspace.

## Notes
Vercel Hobby functions time out at 60 seconds; a slow bdlaws response can cut a run short, so retry if it happens. This tool is AI-assisted legal research, not representation by an advocate.
