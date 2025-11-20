# Burn Rate Tokyo: 2020 — ゲーム概要とロジック

## コアコンセプト
- 2020 年 4 月の東京が舞台のスタートアップ経営シム。1 週間を 1 ターンとして資金・MRR・SAN 値・組織を管理しながら生き残る。
- 目的はランウェイを保ちつつ PMF と成長を稼ぎ、シリーズ A/B を目指すこと。現金がマイナスになるとゲームオーバー。

## ターンの流れ（`useGameEngine.nextTurn`）
- 入力：前ターンの状態とターンボーナス（ゴールデンリード命中、インシデント消化数）。
- 1) SAN 値 ≤ 0 で Machine Mode へ（生産性 2 倍、UI 変化）。
- 2) 市況（MarketTrend）は一定期間後に確率で更新（BOOM/RECESSION/FUD/NORMAL）。
- 3) 共創者/投資家効果：HACKER→技術 1.5 倍、HUSTLER→営業 1.5 倍。FAMILY→SAN 週 +2、PRODUCT→技術 1.2 倍、BLITZ→マーケ効率強化。
- 4) 採用直後の摩擦（hiring_friction_weeks）で能力 0.9 倍。
- 5) リード生成：マーケ予算 `budget/10000 * 効率` + PMF 由来のバイラル（PMF > 40）。BLITZ や PLG/BLITZ 戦略で増幅。
- 6) 営業処理能力：セールス ×10 + 創業者ブースト（Seed 5件/週 → A 2件/週 → B 0件）をボーナス/摩擦で補正。`pmf_frozen` の週は 0 件。
- 7) 成約率：`0.05 * (PMF/100)` を戦略/市況/TechDebt/ゴールデンリードで補正。PRODUCT 投資家で PMF < 40 または TechDebt > 30 の場合 0。
- 8) 新規 MRR：成約件数 × ARPU（PLG 1.2 万×フェーズ係数 / 通常 5 万×係数 / エンプラ 12 万×係数 / BLITZ 0）。フェーズ係数: Seed 1 / SeriesA 1.6 / SeriesB 2.4。
- 9) CS/解約：CS キャパ不足や TechDebt、SAN 低下、市況で `churn_rate` を増減。FAMILY で 0.8 倍。インシデント解消で減算。
- 10) キャッシュ：`weeklyBurn = monthlyBurn/4`、`cash = cash - weeklyBurn + MRR/4`。`runway_months` を再計算（赤字で月数、黒字なら 99.9）。
- 11) 月次（4 週ごと）：MoM 成長計算。BLITZ で成長 < 20% は SAN -10、FAMILY は赤字月をカウント。
- 12) イベント・意思決定：`checkTriggers`（週 3/6/8 のチュートリアル、MRR 500 万で Series B）を発火、クリティカルは decision mode へ。ランウェイ <1.5 ヶ月や SAN <20 でも decision mode。
- 13) その他：従業員がいればフェーズ A 以降で TechDebt 微増、WHALE 案件の抽選、パイプラインメトリクス更新。`cash < 0` でゲームオーバー。

## 主要ステータスとパラメータ
- `cash`/`monthlyBurn`/`runway_months`: 焼却と手元資金。月次バーン=社長 30 万 + 給与 + オフィス賃料（A 50 万 / B 300 万）+ サーバー (MRR 5%) + マーケ。
- `kpi`: `MRR`, `churn_rate`, `growth_rate_mom` など。`pmf_score` が営業・バイラルに直結。
- `sanity`: 0 で Machine Mode（生産性上昇だが危険演出）。20 未満で慎重モード（decision mode）。
- `tech_debt`: 成約率・解約率に影響。副業や一部カードで増加。
- `family_relationship`: 毎ターン減少（Machine Mode 中は大きく減る）。FAMILY DM のトーンに反映。
- `flags`: チュートリアル解放、補助金取得、マーケット残週、PMF 凍結（副業した週は営業不可）など。
- `pipeline_metrics`: 生成リード、損失、成約、CS キャパ、ゴールデンリード、インシデント数などを UI 表示用に保持。
- `investor_type`: BLITZ/PRODUCT/FAMILY (Seed 後に選択)。資金注入と OS の制約（PRODUCT は SALES 禁止、FAMILY は FIRE 禁止）。
- `co_founder`: HACKER/HUSTLER で技術/営業ブースト。

## 行動コマンドと効果
- Interview: ¥5 万消費、PMF +5、SAN +5、クラフト志向 +2。
- Side Gig（週 3 解放）: Cash +60 万、TechDebt +5、SAN -10、当週 PMF 凍結。即座に次ターン進行。
- Recruit（週 6 解放）: 初期費 30 万、給与 60 万（BLITZ なら 90 万）/月、採用摩擦 4 週。マネージャーは 80 万。文化は役割で決定。
- Sales Pitch: カード制ミニゲーム。ターゲット別に抵抗値/手数・期待MRRがフェーズでスケール。Enterprise は SeriesA かつ PMF≧50 で解禁 + 営業人員必須、Whale は SeriesB & PMF≧70。成約で MRR 増、失注時は SAN ペナルティ。
- Private Action: WORK で SAN -10 / リード +5 / 孤独 +2（Machine Mode チェックあり）。FAMILY で SAN +20 / 関係+15 / 孤独 -5。
- Fire Employee: Cash -100 万、SAN -15、無慈悲 +10、孤独 +5。解雇履歴に追加（SNS で ALUMNI 投稿の材料に）。
- Apply for Subsidy: Cash +200 万（フラグセットのみで再取得不可）。
- パイプラインのインタラクション: ゴールデンリード（成約率+0.15）やインシデント（消火で churn 減）をクリック処理。

## イベント・フェーズ
- 週 3: 副業を受けるか拒否するチュートリアル。
- 週 6: スターエンジニア採用イベント。
- 週 8: 投資家 OS 選択（BLITZ 3 億 / PRODUCT 2 億 / FAMILY 1 億 + SAN 全回復）。
- Series B: MRR 500 万で発火、追加資金 + サニティ減。
- 市況イベント: BOOM/RECESSION/FUD が数週継続し、リード・解約率・成約率に影響。
- Whale: A フェーズ以降、低確率で巨大案件チャンスが有効化。

## モードと終了条件
- Machine Mode: SAN ≤ 0。通知が機械口調になり、生産性 2 倍だが家族行動不可。
- Decision Mode: クリティカルイベント、SAN 低下、ランウェイ逼迫で発火。解除条件は余裕ができるかイベント解消。
- Game Over: `cash < 0`。EndingScreen では哲学スコアと成果でエンディング分岐。

## 通知・SNS システム
- Slack/System/Alert/News/FAMILY DM/Social の通知を 8 秒ごとに抽選生成（決定モード中は停止）。
- FAMILY DM は関係値に応じて LOVE→WORRY→ANGRY→SAD へ遷移し、Smartphone UI で確認。
- Social 投稿（X 風）を開いて返信選択。解雇履歴や SAN 低下で裏垢/卒業勢のポストが増える。
- Machine Mode では通知がターミナル風ログに変化。

## UI と補足
- Dashboard 左: ログタイムライン。右: キャッシュ/MRR/SANITY とアクション、チーム一覧、PipelineView。
- Smartphone: 通知の既読管理、Slack ログ、FAMILY DM、Social を整理。
- OrgChart: ドラッグ＆ドロップで指揮系統を並べる（assignManager 実装済み、循環は自動防止）。
- VC助言: `services/geminiService.ts` が投資家タイプ/成長率/ランウェイなどの数値から定型アドバイスを返す。外部API不要。

## 実行方法
- Node.js 環境で `npm install` → `.env.local` に API キーを設定 → `npm run dev`。Vite + React/TypeScript 構成。`npm run build` で本番バンドル。
