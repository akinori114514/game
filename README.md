# Burn Rate Tokyo: 2020

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yZ871-wfW50uimZeyMwgHnFuiNKWvGpI

## Run Locally

**Prerequisites:** Node.js (推奨: v20+)

1. 依存をインストール  
   `npm ci`
2. `.env.local.example` を `.env.local` にコピーし、`VITE_GEMINI_API_KEY` を設定  
   `cp .env.local.example .env.local`
3. 開発サーバー起動  
   `npm run dev`

## Deploy (GitHub Pages 用)
- `main` ブランチへの push で `.github/workflows/deploy.yml` が動き、`dist` を Pages にデプロイします。
- リポジトリ名が `akinori114514/game` の想定で `vite.config.ts` の `base: './'` を指定し、サブパス配信にも対応済みです。
- 初回は GitHub Pages の設定で「Source: GitHub Actions」を選んでください。
