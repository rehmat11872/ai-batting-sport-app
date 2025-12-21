// BetIntel AI Query System Types

export type PlanType = "free" | "starter" | "sharp" | "pro";

export interface PlanConfig {
  type: PlanType;
  name: string;
  queryLimit: number;
  price: number;
  features: string[];
  whopPlanId?: string;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    type: "free",
    name: "Free",
    queryLimit: 5,
    price: 0,
    features: ["5 queries/month", "Basic pre-game analysis"],
  },
  starter: {
    type: "starter",
    name: "Starter",
    queryLimit: 50,
    price: 29,
    features: ["50 queries/month", "Pre-game analysis only"],
  },
  sharp: {
    type: "sharp",
    name: "Sharp",
    queryLimit: 200,
    price: 99,
    features: [
      "200 queries/month",
      "Full game & market analysis",
      "Slate filtering",
      "Light live intel",
    ],
  },
  pro: {
    type: "pro",
    name: "Pro",
    queryLimit: 750,
    price: 179,
    features: [
      "750 queries/month",
      "Live game analysis",
      "Market movement insights",
      "Priority processing",
    ],
  },
};

export interface UserPlanInfo {
  planType: PlanType;
  queryLimit: number;
  queriesUsed: number;
  queriesRemaining: number;
  periodStart: Date;
  periodEnd: Date;
  daysUntilReset: number;
  usagePercent: number;
}

export interface QueryRequest {
  query: string;
  gameContext?: string;
  parentQueryId?: string;
}

export interface AIAnalysisResponse {
  id: string;
  matchup: string;
  sport: string;
  analysisType: "pre-game" | "live" | "slate";
  confidence: number;
  quickSummary: string;
  keyFactors: string[];
  noiseToIgnore: string[];
  potentialEdge: string;
  createdAt: string;
}

export interface QueryResponse {
  success: boolean;
  analysis?: AIAnalysisResponse;
  queryUsed: boolean;
  queriesRemaining: number;
  error?: string;
}

export interface UsageWarning {
  type: "none" | "low" | "critical" | "depleted";
  message: string;
  showUpgrade: boolean;
}

