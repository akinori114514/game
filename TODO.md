# TODO

- [x] ゲームロジックの全体把握：主要なコンテキスト、hooks、UIコンポーネントを読み、進行フローを整理する
- [x] 日本語ドキュメント作成：ゲームのルール・数式・イベント・主要コマンドを md にまとめる（docs/game-overview.md を想定）
- [ ] リファクタリング計画と実施：状態管理/計算ロジックの分離、命名/コメントの整備、UI 周辺の整理ポイントを洗い出して適用する
- [x] デプロイ準備：akinori114514/game リポジトリへ push できる構成と GitHub Actions のビルド・デプロイ設定を用意する
- [x] 動作確認：npm install → npm run build / npm run dev で基本動作とビルドを確認する
- [x] 環境変数の統一：`VITE_GEMINI_API_KEY` に揃え、.env.local.example と README を更新する
- [x] 未実装補完：assignManager を実装して組織図操作を有効化する
