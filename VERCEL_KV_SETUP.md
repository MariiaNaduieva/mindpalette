# Vercel KV Setup Instructions

## Step 1: Create KV Database

1. Go to https://vercel.com/dashboard
2. Open your MindPalette project
3. Navigate to **Storage** → **Create Database**
4. Find **Upstash for Redis** (NOT Vector, QStash or Search)
5. Click **Continue**
6. Create a new Redis Database (choose a region close to your users)
7. Connect it to your project

## Alternative Providers

Instead of Upstash, you can use:
- **Redis** (Serverless Redis)
- **Neon**, **Supabase**, **Prisma Postgres** (if you want PostgreSQL instead of Redis)

For the current code, use **Upstash Redis** - it's the simplest option for KV storage.

## Step 2: Connect to Project

1. After installation through Marketplace, the database will automatically connect
2. Vercel will automatically add environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`

## Step 3: Local Development (Optional)

For local testing:

1. Copy `.env.local.example` to `.env.local`
2. Copy values from Vercel Dashboard → Settings → Environment Variables
3. Paste into `.env.local`:

```
KV_REST_API_URL=your_url_here
KV_REST_API_TOKEN=your_token_here
```

## Step 4: Deploy

```bash
git add .
git commit -m "Add Vercel KV support"
git push
```

Vercel will automatically rebuild the project with KV connection.

## Verification

After deployment, the game will work stably - data won't be lost between requests.

## Free Plan

- 256 MB storage
- 3000 commands/day
- Sufficient for ~10-20 simultaneous games
