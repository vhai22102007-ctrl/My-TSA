# TMA Cloudflare gateway

This Worker keeps large files and AI traffic away from Supabase Storage and Supabase Edge Functions.

```powershell
npx.cmd wrangler deploy --config cloudflare/r2-gateway/wrangler.toml
npx.cmd wrangler secret put GEMINI_API_KEY --config cloudflare/r2-gateway/wrangler.toml
```

The public site reads exams from `https://assets.tmastudy.io.vn/data/exams/`. Write, list and delete operations require a valid teacher JWT.
