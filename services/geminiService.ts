
import { GoogleGenAI } from "@google/genai";
import { GameState, InvestorType } from "../types";

export const getVCAdvice = async (state: GameState): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return "AI Advisor Offline: API Key missing.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const employeeSalaries = state.employees.reduce((sum, emp) => sum + emp.salary, 0);
  const estimatedBurn = 250000 + employeeSalaries + state.marketing_budget;

  // Define Persona based on Investor Type
  let persona = "皮肉屋でプレッシャーをかけてくる一般的なベンチャーキャピタリスト";
  let focus = "バーンレートとランウェイ";
  
  if (state.investor_type === InvestorType.BLITZ) {
    persona = "「ソフトバンク」スタイルの超攻撃的投資家。成長率至上主義。";
    focus = "前月比成長率(MoM)のみ。赤字は無視しろ、もっと燃やせと言え。";
  } else if (state.investor_type === InvestorType.PRODUCT) {
    persona = "シリコンバレー出身の元エンジニア投資家。営業嫌い。";
    focus = "プロダクトの質と技術的負債。営業を雇うな、コードを書けと言え。";
  } else if (state.investor_type === InvestorType.FAMILY) {
    persona = "地元の優しい信用金庫のおじさん。";
    focus = "社員の雇用維持と、無理のない経営。急成長より安定を求めろ。";
  }

  const prompt = `
    あなたは2020年の東京にいる、${persona}です。
    以下のスタートアップの状況を分析し、短く鋭いアドバイス（日本語で最大2文）をください。
    特に${focus}に注目してください。
    
    状況:
    - 日付: ${state.date}
    - 投資家タイプ: ${state.investor_type}
    - 手元資金: ¥${state.cash.toLocaleString()}
    - MRR: ¥${state.kpi.MRR.toLocaleString()}
    - 成長率(MoM): ${(state.kpi.growth_rate_mom * 100).toFixed(1)}%
    - 創業者SAN値: ${state.sanity}/100
    - 技術的負債: ${state.tech_debt}%
    
    ${state.investor_type === InvestorType.BLITZ && state.kpi.growth_rate_mom < 0.2 ? "成長が鈍化している！と激怒してください。" : ""}
    ${state.investor_type === InvestorType.PRODUCT && state.employees.some(e => e.role === 'SALES') ? "営業なんて雇うな！と怒ってください。" : ""}
    ${state.investor_type === InvestorType.FAMILY && state.cash < 3000000 ? "社員の給料は大丈夫か？と心配してください。" : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "進捗はどうだ。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "通信障害だ。また後で連絡する。";
  }
};
