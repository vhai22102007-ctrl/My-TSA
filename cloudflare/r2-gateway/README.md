# TMA Cloudflare gateway

This Worker keeps large files and AI traffic away from Supabase Storage and Supabase Edge Functions.

```powershell
npx.cmd wrangler deploy --config cloudflare/r2-gateway/wrangler.toml
npx.cmd wrangler secret put GEMINI_API_KEY --config cloudflare/r2-gateway/wrangler.toml
npx.cmd wrangler secret put CANDIDATE_SESSION_SECRET --config cloudflare/r2-gateway/wrangler.toml
```

The public site reads exams from `https://assets.tmastudy.io.vn/data/exams/`. Write, list and delete operations require a valid teacher JWT.

## Mock exam database

Candidate lists, private answer keys and attempts use Cloudflare D1. Exam JSON and images remain on R2.

```powershell
npx.cmd wrangler d1 create tma-mock-exams
npx.cmd wrangler d1 migrations apply tma-mock-exams --remote --config cloudflare/r2-gateway/wrangler.toml
```

Add the returned D1 binding to `wrangler.toml`, then deploy the Worker. To sync results directly to Google Sheets, set an optional Apps Script webhook:

```powershell
npx.cmd wrangler secret put GOOGLE_SHEETS_WEBHOOK_URL --config cloudflare/r2-gateway/wrangler.toml
```

Use `google-sheets-app-script.gs` as the Apps Script source. Deploy it as a Web app
that executes as the script owner and allows access to anyone with the deployment
URL. Paste that URL into the Worker secret above. The first sync creates a private
spreadsheet in the script owner's Drive; later syncs update one tab per exam and
the `TONG QUAN` summary tab. Without this optional secret, the teacher UI downloads
a CSV and opens a new Google Sheet for manual import.
