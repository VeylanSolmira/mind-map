export interface Goal {
  _id: string;
  hierarchyId: string;
  description: string;
  goalType: string;
  done: boolean;
  priority: number;
  effectivePriority: number;
  lastSelected: string;
  decayRate: number;
  score: number;
  assessment: number;
  communityValue: number;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
  children?: Goal[];
  // Research and bookmark related fields
  link?: string;
  summary?: string;
  autoIngest?: boolean;
  tier?: string;
  domain?: string;
  subtopic?: string;
  tags?: string;
  next_action_date?: string;
  action_note?: string;
  date_added?: string;
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