export type IntegrationProvider = 'github' | 'notion' | 'slack' | 'calendar';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  created_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  github_connected: boolean;
  slack_connected: boolean;
  notion_connected: boolean;
  calendar_connected: boolean;
  github_token?: string;
  slack_token?: string;
  notion_token?: string;
  calendar_token?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: 'commit' | 'pr' | 'meeting' | 'task';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Summary {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  merged: boolean;
  created_at: string;
  url: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees?: string[];
}
