import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface INode extends Document {
  title: string;
  content: string;
  type: 'capability' | 'safety' | 'benchmark' | 'task';
  priority: number;
  lastAccessed: Date;
  tags: string[];
  relationships: {
    nodeId: mongoose.Types.ObjectId;
    type: string;
  }[];
  position: {
    x: number;
    y: number;
  };
  style: {
    color: string;
    size: number;
    icon: string;
  };
  metadata: {
    created: Date;
    updated: Date;
    status: 'active' | 'completed' | 'archived';
  };
  editHistory: {
    timestamp: Date;
    user: string;
    changes: Record<string, any>;
  }[];
}

// Mongoose Schema
const NodeSchema = new Schema<INode>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['capability', 'safety', 'benchmark', 'task'],
    required: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  relationships: [{
    nodeId: {
      type: Schema.Types.ObjectId,
      ref: 'Node',
      required: true
    },
    type: {
      type: String,
      required: true
    }
  }],
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  style: {
    color: {
      type: String,
      default: '#000000'
    },
    size: {
      type: Number,
      default: 1
    },
    icon: {
      type: String,
      default: 'default'
    }
  },
  metadata: {
    created: {
      type: Date,
      default: Date.now
    },
    updated: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active'
    }
  },
  editHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: String,
      required: true
    },
    changes: {
      type: Schema.Types.Mixed
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
NodeSchema.index({ title: 'text', content: 'text' });
NodeSchema.index({ type: 1 });
NodeSchema.index({ tags: 1 });
NodeSchema.index({ 'metadata.status': 1 });

// Pre-save middleware to update the 'updated' timestamp
NodeSchema.pre('save', function(next) {
  this.metadata.updated = new Date();
  next();
});

export const Node = mongoose.model<INode>('Node', NodeSchema); 