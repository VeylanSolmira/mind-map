import mongoose, { Document, Schema } from 'mongoose';
import { calculateEffectivePriority } from '../utils/priorityUtils';

export interface IGoal extends Document {
  hierarchyId: string;  // Hierarchical path (e.g. "1.1.1")
  description: string;
  goalType: string;
  done: boolean;
  priority: number;
  score: number;
  assessment: number;
  communityValue: number;
  start: string;
  end: string;
  lastSelected: Date;  // When the goal was last selected/worked on
  effectivePriority: number;  // Calculated priority value
  decayRate: number;  // How quickly priority decays over time
  autoIngest: boolean;  // Whether this goal was automatically ingested
  link: string;  // URL from CSV
  summary: string;  // Summary from CSV
  tier: string;  // Tier from CSV
  domain: string;  // Domain from CSV
  subtopic: string;  // Subtopic from CSV
  tags: string;  // Tags from CSV
  next_action_date: string;  // Next action date from CSV
  action_note: string;  // Action note from CSV
  date_added: string;  // Date added from CSV
  startDate?: Date;
  endDate?: Date;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>({
  hierarchyId: { type: String, required: true, unique: true },  // Hierarchical path
  description: { type: String, required: true },
  goalType: { type: String, required: true },
  done: { type: Boolean, default: false },
  priority: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  assessment: { type: Number, default: 0 },
  communityValue: { type: Number, default: 0 },
  start: { type: String },
  end: { type: String },
  lastSelected: { type: Date, default: Date.now },
  effectivePriority: { type: Number, default: 0 },
  decayRate: { type: Number, default: 0.001 },  // Default decay rate
  autoIngest: { type: Boolean, default: false },
  link: { type: String },
  summary: { type: String },
  tier: { type: String },
  domain: { type: String },
  subtopic: { type: String },
  tags: { type: String },
  next_action_date: { type: String },
  action_note: { type: String },
  date_added: { type: String },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Not Started'
  }
}, {
  timestamps: true
});

// Pre-save middleware to update effectivePriority
GoalSchema.pre('save', function(next) {
  this.effectivePriority = calculateEffectivePriority(
    this.priority,
    this.decayRate,
    this.lastSelected
  );
  next();
});

export default mongoose.model<IGoal>('Goal', GoalSchema); 