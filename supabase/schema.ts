export type MembershipStatus = "active" | "expired" | "trial" | "canceled";

export interface User {
  id: string;
  whop_customer_id: string | null;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  whop_plan_id: string | null;
  status: MembershipStatus;
  access_expires_at: string | null;
  updated_at: string;
}

export interface PredictionRow {
  id: string;
  event_id: string | null;
  league: string | null;
  match: string | null;
  kickoff: string | null;
  odds_home: number | null;
  odds_draw: number | null;
  odds_away: number | null;
  ai_win_probability: number | null;
  ai_confidence: number | null;
  tier: "free" | "premium";
  created_at: string;
}

export interface UserSession {
  token: string;
  user_id: string;
  expires_at: string | null;
  created_at: string;
}

export interface AlertRow {
  id: string;
  tweet_id: string;
  author: string;
  author_handle: string;
  sport: string;
  text: string;
  matched_keywords: string[];
  tweeted_at: string;
  created_at: string;
  url: string | null;
  urgency_score: number;
  window_tag: string | null;
  is_premium: boolean;
  raw_json: any | null;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at"> & Partial<Pick<User, "id" | "created_at">>;
        Update: Partial<User>;
      };
      memberships: {
        Row: Membership;
        Insert: Omit<Membership, "id" | "updated_at"> & Partial<Pick<Membership, "id" | "updated_at">>;
        Update: Partial<Membership>;
      };
      predictions: {
        Row: PredictionRow;
        Insert: Omit<PredictionRow, "id" | "created_at"> & Partial<Pick<PredictionRow, "id" | "created_at">>;
        Update: Partial<PredictionRow>;
      };
      user_sessions: {
        Row: UserSession;
        Insert: UserSession;
        Update: Partial<UserSession>;
      };
      alerts: {
        Row: AlertRow;
        Insert: Omit<AlertRow, "id" | "created_at"> & Partial<Pick<AlertRow, "id" | "created_at">>;
        Update: Partial<AlertRow>;
      };
    };
  };
}

export type Tables = Database["public"]["Tables"];

export type TablesInsert<T extends keyof Tables> = Tables[T]["Insert"];
export type TablesUpdate<T extends keyof Tables> = Tables[T]["Update"];
export type TablesRow<T extends keyof Tables> = Tables[T]["Row"];
