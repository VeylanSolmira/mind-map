import mongoose, { Schema, Document } from 'mongoose';

export interface IGoalEvent extends Document {
  goalId: mongoose.Types.ObjectId;
  date: Date;
  duration?: number;
  notes?: string;
  status: 'completed' | 'in-progress' | 'planned';
  createdAt: Date;
  updatedAt: Date;
}

const GoalEventSchema: Schema = new Schema({
  goalId: {
    type: Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'planned'],
    default: 'planned'
  }
}, {
  timestamps: true
});

// Index for efficient querying
GoalEventSchema.index({ goalId: 1, date: 1 });

export default mongoose.model<IGoalEvent>('GoalEvent', GoalEventSchema); 