# Site News + Discord Webhook (No Bot)

This setup does not require a Discord bot.

You publish one news item, and it does two things:
- adds item to `assets/data/news.json` (site feed)
- sends same item to Discord via webhook

Files:
- workflow: `.github/workflows/sync-discord-news.yml`
- script: `tools/publish-news.mjs`

## 1) Create Discord webhook

In your Discord channel settings:
`Integrations -> Webhooks -> New Webhook -> Copy Webhook URL`

## 2) Add GitHub secret

In repository:
`Settings -> Secrets and variables -> Actions -> New repository secret`

Add:
- `DISCORD_WEBHOOK_URL` = your webhook URL

## 3) Publish news from GitHub Actions

Open:
`Actions -> Publish News (Site + Discord Webhook) -> Run workflow`

Fill fields:
- `type` (Анонс / Ивент / Вайп / Обновление)
- `title`
- `text`
- `url` (optional, example `guides.html` or `https://...`)

After run:
- `assets/data/news.json` is updated and committed
- message appears in Discord channel webhook is attached to

## 4) Optional local run

```powershell
$env:NEWS_TYPE="Анонс"
$env:NEWS_TITLE="Заголовок"
$env:NEWS_TEXT="Текст новости"
$env:NEWS_URL="https://discord.gg/Q8ZfawakxS"
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
node tools/publish-news.mjs
```
