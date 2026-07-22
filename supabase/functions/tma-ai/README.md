# TMA AI Edge Function

The browser never receives the Gemini API key. Configure and deploy once:

```powershell
npx.cmd supabase login
npx.cmd supabase secrets set GEMINI_API_KEY="YOUR_FREE_GOOGLE_AI_STUDIO_KEY" --project-ref jlnfnnrboozwywikxtel
npx.cmd supabase secrets set GEMINI_MODEL="gemini-3.5-flash" --project-ref jlnfnnrboozwywikxtel
npx.cmd supabase functions deploy tma-ai --project-ref jlnfnnrboozwywikxtel
```

Create the free key at <https://aistudio.google.com/apikey>. Do not put the key in HTML, JavaScript, `localStorage`, or Git.
