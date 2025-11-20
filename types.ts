
/**
 * Use `as const` to define literal types for better type inference.
 */
export const Role = {
  ENGINEER: 'ENGINEER',
  SALES: 'SALES',
  CS: 'CS',
  MARKETER: 'MARKETER',
  MANAGER: 'MANAGER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export const Phase = {
  SEED: 'SEED',
  SERIES_A: 'SERIES_A',
  SERIES_B: 'SERIES_B',
} as const;

export type Phase = typeof Phase[keyof typeof Phase];

export const CoFounderType = {
  HACKER: 'HACKER',
  HUSTLER: 'HUSTLER',
} as const;

export type CoFounderType = typeof CoFounderType[keyof typeof CoFounderType];

export const InvestorType = {
  NONE: 'NONE',
  BLITZ: 'BLITZ',   // The Hyper-Growth (Softbank style)
  PRODUCT: 'PRODUCT', // The Product-Led (Engineer VC)
  FAMILY: 'FAMILY',  // The ESG/Stakeholder (Regional Bank)
} as const;

export type InvestorType = typeof InvestorType[keyof typeof InvestorType];

export const PricingStrategy = {
  PLG: 'PLG',             // Low Price, High Vol
  ENTERPRISE: 'ENTERPRISE', // High Price, Low Vol
  BLITZ: 'BLITZ',         // Free/Loss, Max Vol
} as const;

export type PricingStrategy = typeof PricingStrategy[keyof typeof PricingStrategy];

// Org Chart / Culture Types
export const CultureType = {
  INNOVATION: 'INNOVATION', // HACKER-like, Speed
  STABILITY: 'STABILITY',   // CORP-like, Reliability
} as const;

export type CultureType = typeof CultureType[keyof typeof CultureType];

// Market Trends (Economic Weather)
export const MarketTrend = {
  NORMAL: 'NORMAL',
  SAAS_BOOM: 'SAAS_BOOM',     // Easy Mode (2021 Bubble)
  RECESSION: 'RECESSION',     // Hard Mode (Tight budget)
  COMPETITOR_FUD: 'COMPETITOR_FUD', // Annoying Mode (Rumors)
} as const;

export type MarketTrend = typeof MarketTrend[keyof typeof MarketTrend];

export interface Employee {
  id: string;
  name: string;
  role: Role;
  stats: {
    tech: number;
    sales: number;
    management: number;
  };
  salary: number;
  motivation: number;
  is_new_hire: boolean; // For Brooks's Law tracking
  
  // Org Chart Fields
  manager_id: string | null; // null = Direct report to CEO
  culture: CultureType;
}

export interface CoFounder {
  name: string;
  type: CoFounderType;
  relationship: number; // 0-100
}

export interface KPI {
  MRR: number;
  churn_rate: number;
  CAC: number;
  LTV: number;
  growth_rate_mom: number; // New: For Blitz OS
}

export type SalesTarget = 'FRIENDS' | 'STARTUP' | 'ENTERPRISE' | 'WHALE';

export interface SalesCard {
  id: string;
  name: string;
  desc: string;
  damage: number;
  cost: number; // AP Cost (Moves)
  // Side Effects
  costType?: 'CASH' | 'SANITY';
  costAmount?: number;
  riskType?: 'TECH_DEBT' | 'CHURN_RISK';
  riskAmount?: number;
}

export interface PipelineMetrics {
  leads_generated: number;
  sales_capacity: number;
  leads_processed: number;
  leads_lost: number;
  new_deals: number;
  cs_capacity: number;
  required_cs: number;
  active_incidents: number;
  golden_leads_active: boolean;
  organic_growth_factor: number; // Virality based on PMF
}

export interface GameFlags {
  has_received_subsidy: boolean;
  cto_left: boolean;
  competitor_attacked: boolean;
  pmf_frozen: boolean; // True if side gig was done this week
  spaghetti_code_crisis: boolean;
  // OS Specific Flags
  down_round_count: number; // Blitz: If 2, Game Over
  feature_creep_months: number; // Product: If > 0, Dev frozen
  boiled_frog_months: number; // Family: Months with negative cash flow
  
  // Market
  market_trend_weeks_left: number;

  // Tutorial Flags
  is_interview_unlocked: boolean;
  is_side_gig_unlocked: boolean;
  is_recruit_unlocked: boolean;
}

// Narrative System Types
export interface PhilosophyProfile {
  ruthlessness: number;  // Money > People
  craftsmanship: number; // Product > Money
  dishonesty: number;    // Results > Rules
  loneliness: number;    // Success > Family/Friends
}

export interface LogEntry {
  id: string;
  week: number;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'EVENT';
  timestamp: number;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  effect: (state: GameState) => Partial<GameState>;
  description?: string;
  philosophy_delta?: Partial<PhilosophyProfile>; // Hidden Karma weights
}

export interface NarrativeEvent {
  id: string;
  title: string;
  description: string;
  choices: ScenarioChoice[];
  is_crisis?: boolean;
  severity?: 'NORMAL' | 'CRITICAL'; // Trigger for Decision Mode
}

// Notification System
export type NotificationType = 'SLACK' | 'SYSTEM' | 'NEWS' | 'ALERT' | 'DEATH' | 'SOCIAL' | 'FAMILY_DM';
export type NotificationTone = 'NORMAL' | 'URGENT' | 'COLD' | 'ROBOTIC' | 'FAMILY_LOVE' | 'FAMILY_ANGRY' | 'FAMILY_SAD';

export interface GameNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  relatedPostId?: string; // For SOCIAL types
  isRead: boolean; // New: For badge tracking
  tone?: NotificationTone;
}

// --- SNS / TIMELINE SYSTEM ---
export interface SocialReplyOption {
  id: string;
  label: string;
  riskDescription: string;
  effect: (state: GameState) => Partial<GameState>;
}

export interface SocialPost {
  id: string;
  author_name: string;
  handle: string;
  avatar_color: string; // tailwind class
  content: string;
  likes: number;
  retweets: number;
  type: 'URA_AKA' | 'ALUMNI' | 'MARKET';
  reply_options?: SocialReplyOption[];
}

// Visual Effects
export interface FloatingText {
  id: string;
  text: string;
  x: number; // random %
  y: number; // random %
  color: string; // tailwind class
}

export interface GameState {
  date: string;
  week: number;
  cash: number;
  runway_months: number;
  sanity: number;
  phase: Phase;
  pmf_score: number;
  co_founder: CoFounder | null;
  employees: Employee[];
  kpi: KPI;
  marketing_budget: number;
  leads: number;
  tech_debt: number;
  hiring_friction_weeks: number;
  
  // Investor System
  mentor_type: InvestorType; // Chosen in Seed
  investor_type: InvestorType; // Locks in Series A
  last_month_mrr: number; // To calculate MoM

  // Strategy
  pricing_strategy: PricingStrategy;
  
  // Economy
  market_trend: MarketTrend;

  flags: GameFlags;
  pipeline_metrics?: PipelineMetrics;
  active_event: NarrativeEvent | null; // If set, modal blocks game
  
  // New Systems
  philosophy: PhilosophyProfile;
  family_relationship: number; // 0-100, decays over time, recovered by private action
  is_machine_mode: boolean; // Sanity <= 0
  is_decision_mode: boolean; // Critical event or crisis
  is_game_over: boolean;
  
  notifications: GameNotification[];
  logs: LogEntry[]; // NARRATIVE TIMELINE

  whale_opportunity: boolean; // Series A+ Event

  // SNS / Timeline
  active_social_post: SocialPost | null;
  fired_employees_history: { name: string, role: Role, date: string }[];
}
