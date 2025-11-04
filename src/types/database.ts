// Database types generated from Supabase schema

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  github_connected: boolean;
  github_token: string | null;
  github_username: string | null;
  slack_connected: boolean;
  slack_token: string | null;
  slack_channel_id: string | null;
  notion_connected: boolean;
  notion_token: string | null;
  notion_database_id: string | null;
  calendar_connected: boolean;
  calendar_token: string | null;
  calendar_refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  team_id: string | null;
  type: 'commit' | 'pr' | 'review' | 'meeting' | 'deployment';
  title: string;
  description: string | null;
  repository: string | null;
  url: string | null;
  metadata: Record<string, any> | null;
  status: 'success' | 'pending' | 'failed';
  created_at: string;
}

export interface Summary {
  id: string;
  user_id: string;
  team_id: string | null;
  date: string;
  summary: string;
  highlights: string[] | null;
  stats: Record<string, any> | null;
  created_at: string;
}

export interface Goal {
  id: string;
  team_id: string;
  owner_id: string | null;
  title: string;
  description: string | null;
  type: 'quarterly' | 'monthly' | 'ongoing';
  status: 'active' | 'on-track' | 'at-risk' | 'off-track' | 'completed';
  progress: number;
  target: number;
  unit: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  goal_id: string;
  title: string;
  progress: number;
  status: 'in-progress' | 'completed' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  description: string | null;
  trigger_type: 'schedule' | 'github_event' | 'slack_message' | 'webhook';
  trigger_config: TriggerConfig;
  actions: AutomationAction[];
  enabled: boolean;
  last_run_at: string | null;
  total_runs: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface TriggerConfig {
  schedule?: string; // cron expression
  event?: string; // github event type
  channel?: string; // slack channel
  webhook_url?: string;
  filters?: Record<string, any>;
}

export interface AutomationAction {
  type: 'send_slack' | 'create_notion' | 'send_email' | 'webhook' | 'ai_summary';
  config: Record<string, any>;
  order: number;
}

export interface AutomationRun {
  id: string;
  automation_id: string;
  status: 'success' | 'failed' | 'running';
  trigger_data: Record<string, any> | null;
  result: Record<string, any> | null;
  error: string | null;
  duration_ms: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface Webhook {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any> | null;
  read: boolean;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  team_id: string;
  date: string;
  commits: number;
  prs: number;
  reviews: number;
  meetings: number;
  lines_added: number;
  lines_deleted: number;
  productivity_score: number;
  streak_days: number;
  created_at: string;
}
