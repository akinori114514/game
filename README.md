# Burn Rate Tokyo: 2020

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

This contains everything you need to run your app locally.

<div align="center">
  <a href="https://akinori114514.github.io/game/" target="_blank" rel="noopener noreferrer">
    <img alt="Play" src="https://img.shields.io/badge/%E3%82%B2%E3%83%BC%E3%83%A0%E9%96%8B%E5%A7%8B-%E2%96%B6%EF%B8%8F-orange?style=for-the-badge&logo=game-controller&logoColor=white" />
  </a>
</div>

View your app in AI Studio: https://ai.studio/apps/drive/1yZ871-wfW50uimZeyMwgHnFuiNKWvGpI

## Run Locally

**Prerequisites:** Node.js (推奨: v20+)

1. 依存をインストール  
   `npm ci`
2. 開発サーバー起動  
   `npm run dev`
   - Gemini APIキーは不要です（VC助言は内蔵ロジックで応答します）。

## Deploy (GitHub Pages 用)
- `main` ブランチへの push で `.github/workflows/deploy.yml` が動き、`dist` を Pages にデプロイします。
- リポジトリ名が `akinori114514/game` の想定で `vite.config.ts` の `base: './'` を指定し、サブパス配信にも対応済みです。
- 初回は GitHub Pages の設定で「Source: GitHub Actions」を選んでください。
