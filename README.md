# Burn Rate Tokyo: 2020

<div align="center">
  <a href="https://akinori114514.github.io/game/" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
    <div style="display:inline-flex;align-items:center;gap:10px;padding:14px 26px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#6366f1,#ec4899);color:#fff;font-weight:800;font-size:18px;letter-spacing:0.8px;box-shadow:0 12px 30px rgba(0,0,0,0.35);">
      <span style="font-size:22px;">🎮</span>
      <span>ゲーム開始</span>
      <span style="font-size:16px;">▶︎</span>
    </div>
  </a>
</div>

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
