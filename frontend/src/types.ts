export interface Goal {
  _id: string;
  hierarchyId: string;
  description: string;
  goalType: string;
  done: boolean;
  priority: number;
  score: number;
  assessment: number;
  communityValue: number;
  start: string;
  end: string;
  lastSelected: string;  // ISO date string
  effectivePriority: number;
  decayRate: number;
  autoIngest: boolean;
  link: string;
  summary: string;
  tier: string;
  domain: string;
  subtopic: string;
  tags: string;
  next_action_date: string;
  action_note: string;
  date_added: string;
  startDate?: string;  // ISO date string
  endDate?: string;    // ISO date string
  status: 'active' | 'completed' | 'archived';
  createdAt: string;   // ISO date string
  updatedAt: string;   // ISO date string
  children?: Goal[];
}

export interface GoalEvent {
  _id: string;
  goalId: string;
  date: string;
  duration?: number;
  notes?: string;
  status: 'completed' | 'in-progress' | 'planned';
  createdAt: string;
  updatedAt: string;
} 