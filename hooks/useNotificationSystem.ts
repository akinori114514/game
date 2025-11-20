
import { useState, useMemo, useEffect } from 'react';
import { GameState, GameNotification, NotificationType, SocialPost, SocialReplyOption, Phase, NotificationTone } from '../types';

const SLACK_NORMAL = [
    "Wifiの調子が悪いんですが...",
    "Zoomのリンクどこでしたっけ？",
    "誰かこのPRのレビューお願いします",
    "UberEats頼んでいいですか？",
    "オフィス行かなくていいの最高ｗ",
    "今週末リリースいけますか？",
    "コーヒー豆切れました",
];

const SLACK_STRESSED = [
    "サーバーが重い気がします",
    "競合が似た機能リリースしてます...",
    "今月の給与振り込みまだですか？",
    "子供が泣いててMTG抜けさせてください",
    "Slackの通知音でノイローゼになりそう",
    "社長、ちょっとお話が...",
    "エンジニアが足りません...",
];

const MACHINE_LOGS = [
    "RESOURCE_ALLOCATION_OPTIMIZED",
    "HUMAN_EMOTION_IGNORED",
    "PROFIT_MAXIMIZATION_ROUTINE",
    "SLEEP_CYCLE_SKIPPED",
    "EMPATHY_MODULE_OFFLINE",
    "BURN_RATE_WITHIN_TOLERANCE",
    "WORKER_UNIT_ADDED",
    "INEFFICIENCY_DETECTED"
];

const FAMILY_LOVE = [
    "今週末は実家帰るの？",
    "たまには早く帰ってきてね。",
    "お母さんから野菜届いたよ。",
    "パパ、今度の日曜遊園地行く？",
    "無理しないでね。",
    "お弁当作っといたよ！",
];

const FAMILY_WORRY = [
    "最近全然会話ないね。",
    "顔色が悪いよ。大丈夫？",
    "ジロウが「パパの顔忘れた」って言ってるよ笑",
    "今週末も仕事？",
    "たまには子供と遊んであげて。",
    "本当にその会社、大丈夫なの？",
];

const FAMILY_ANGRY = [
    "家賃の振込、明日までだっけ？忘れないで。",
    "また朝帰り？",
    "結婚記念日、覚えてるよね？",
    "もう私の話聞く気ないでしょ。",
    "実家に帰らせてもらいます。",
    "あなたの会社のこと、もう応援できない。",
];

const FAMILY_SAD = [
    "もういいよ。勝手にして。",
    "……",
    "子供の誕生日だったの、知ってた？",
    "私たちはあなたの何なの？",
];

export const useNotificationSystem = (
    gameState: GameState, 
    setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    playSound: (type: 'notification' | 'error' | 'success' | 'click') => void
) => {
    const [socialPostsCache, setSocialPostsCache] = useState<SocialPost[]>([]);

    const unreadCount = useMemo(() => {
        return gameState.notifications.filter(n => !n.isRead).length;
    }, [gameState.notifications]);
  
    const markAllAsRead = () => {
        setGameState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
        }));
    };
  
    const addNotification = (type: NotificationType, message: string, relatedPostId?: string, tone: NotificationTone = 'NORMAL') => {
        const newNote: GameNotification = {
            id: Date.now().toString() + Math.random().toString(),
            type,
            message,
            timestamp: Date.now(),
            relatedPostId,
            isRead: false,
            tone
        };
        playSound('notification');
        setGameState(prev => ({
            ...prev,
            notifications: [...prev.notifications.slice(-20), newNote] 
        }));
    };

    const generateSocialPost = (state: GameState) => {
        let type: 'URA_AKA' | 'ALUMNI' | 'MARKET' = 'MARKET';
        
        if (state.fired_employees_history.length > 0 && Math.random() > 0.7) type = 'ALUMNI';
        else if (state.employees.length > 2 && Math.random() > 0.6) type = 'URA_AKA';
  
        let author = "TechUser";
        let handle = "@tech_fan_2020";
        let content = "最近のSaaS、似たようなのばっかりだな。";
        let avatar = "bg-slate-600";
        const id = `post_${Date.now()}`;
        const likes = Math.floor(Math.random() * 500);
        const retweets = Math.floor(Math.random() * 100);
        let reply_options: SocialReplyOption[] = [];
  
        if (type === 'URA_AKA') {
            author = "名無しの労働者";
            handle = "@worker_no1";
            avatar = "bg-purple-600";
            const complaints = [
                "うちの社長、またアーロンチェア買ってるよ。給料上げろ。",
                "方針転換多すぎてコード書く気失せるわ。",
                "リモートワークなのに監視ツール入れられた。最悪。",
                "今週末もリリース作業か...。転職したい。",
                "「ビジョン」とか言う前にバグ直させてくれ。"
            ];
            content = complaints[Math.floor(Math.random() * complaints.length)];
            if (state.sanity < 30) content = "もう限界かも。明日バックれようかな。";
        } 
        else if (type === 'ALUMNI') {
            const exEmp = state.fired_employees_history[Math.floor(Math.random() * state.fired_employees_history.length)];
            author = exEmp.name;
            handle = `@ex_${exEmp.role.toLowerCase()}`;
            avatar = "bg-red-600";
            content = `前の会社(${state.phase === Phase.SEED ? 'あのスタートアップ' : 'BurnRate社'})を辞めて正解だった。エンジニアを大事にしない会社に未来はない。`;
            if (state.philosophy.ruthlessness > 40) content = "あの社長、サイコパスだったな。いつか訴えてやる。";
        }
        else {
            author = "SaaS Critic";
            handle = "@saas_watcher";
            avatar = "bg-blue-500";
            const msgs = [
                "BurnRate社の新機能、UIが使いにくすぎる。#BurnRateApp",
                "サポートからの返信が遅い。解約検討中。",
                "このサービス、最近よく見るけど実際どうなの？",
                "バグだらけで仕事にならない。金返せ。",
                "機能リクエスト送っても無視されるんだけど。"
            ];
            content = msgs[Math.floor(Math.random() * msgs.length)];
            
            reply_options = [
                {
                    id: 'apologize',
                    label: '謝罪する (Apologize)',
                    riskDescription: '弱腰に見えるが、炎上は防げる',
                    effect: (s) => ({ sanity: Math.max(0, s.sanity - 5) })
                },
                {
                    id: 'argue',
                    label: '反論する (Argue)',
                    riskDescription: 'SAN値は回復するが、炎上リスク(Churn増)がある',
                    effect: (s) => {
                        const isFlame = Math.random() > 0.7;
                        return {
                            sanity: Math.min(100, s.sanity + 5),
                            kpi: isFlame ? { ...s.kpi, churn_rate: s.kpi.churn_rate + 0.01 } : s.kpi,
                            notifications: isFlame ? [...s.notifications, { id: Date.now().toString(), type: 'ALERT', message: 'Refuted tweet caused a FLAME WAR!', timestamp: Date.now(), isRead: false }] : s.notifications
                        };
                    }
                }
            ];
        }
  
        const post: SocialPost = { id, author_name: author, handle, content, avatar_color: avatar, likes, retweets, type, reply_options };
        
        setSocialPostsCache(prev => [...prev, post]);
        addNotification('SOCIAL', `${handle} mentioned you: "${content.substring(0, 20)}..."`, id);
    };

    useEffect(() => {
        if (gameState.is_game_over || gameState.is_decision_mode) return;
  
        const interval = setInterval(() => {
            const roll = Math.random();
            
            if (gameState.is_machine_mode) {
                 const log = MACHINE_LOGS[Math.floor(Math.random() * MACHINE_LOGS.length)];
                 addNotification('SYSTEM', log, undefined, 'ROBOTIC');
                 return;
            }

            // Family Logic
            let familyProb = 0.20; 
            if (gameState.phase === Phase.SERIES_A) familyProb = 0.10;
            
            if (roll < familyProb) {
                const rel = gameState.family_relationship;
                if (rel <= 0) return;
                let msgPool = FAMILY_LOVE;
                let tone: NotificationTone = 'FAMILY_LOVE';
                if (rel < 30) { msgPool = FAMILY_SAD; tone = 'FAMILY_SAD'; }
                else if (rel < 50) { msgPool = FAMILY_ANGRY; tone = 'FAMILY_ANGRY'; }
                else if (rel < 70) { msgPool = FAMILY_WORRY; tone = 'NORMAL'; }
                const msg = msgPool[Math.floor(Math.random() * msgPool.length)];
                addNotification('FAMILY_DM', msg, undefined, tone);
                return;
            }

            // Slack / Social
            if (roll < 0.6 && gameState.employees.length > 0) {
                const isStressed = gameState.sanity < 40 || gameState.tech_debt > 50;
                const msgPool = isStressed ? SLACK_STRESSED : SLACK_NORMAL;
                const tone: NotificationTone = isStressed ? 'URGENT' : 'NORMAL';
                const msg = msgPool[Math.floor(Math.random() * msgPool.length)];
                addNotification('SLACK', msg, undefined, tone);
            } else if (roll < 0.75) {
                generateSocialPost(gameState); 
            }

        }, 8000);
  
        return () => clearInterval(interval);
    }, [gameState.is_game_over, gameState.is_decision_mode, gameState.is_machine_mode, gameState.employees.length, gameState.tech_debt, gameState.family_relationship, gameState.phase]);

    return {
        addNotification,
        unreadCount,
        markAllAsRead,
        generateSocialPost,
        socialPostsCache,
    };
}
