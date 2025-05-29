import { Request, Response } from 'express';
import { Node, INode } from '../models/Node';

// Create a new node
export const createNode = async (req: Request, res: Response) => {
  try {
    const node = new Node({
      ...req.body,
      editHistory: [{
        user: req.body.user || 'system',
        changes: req.body
      }]
    });
    await node.save();
    res.status(201).json(node);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all nodes with optional filtering
export const getNodes = async (req: Request, res: Response) => {
  try {
    const { type, tag, status, search } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (tag) query.tags = tag;
    if (status) query['metadata.status'] = status;
    if (search) {
      query.$text = { $search: search as string };
    }

    const nodes = await Node.find(query)
      .populate('relationships.nodeId')
      .sort({ priority: -1, 'metadata.updated': -1 });
    
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single node by ID
export const getNode = async (req: Request, res: Response) => {
  try {
    const node = await Node.findById(req.params.id)
      .populate('relationships.nodeId');
    
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }
    
    // Update last accessed timestamp
    node.lastAccessed = new Date();
    await node.save();
    
    res.json(node);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a node
export const updateNode = async (req: Request, res: Response) => {
  try {
    const node = await Node.findById(req.params.id);
    
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    // Record changes in edit history
    const changes = Object.keys(req.body).reduce((acc, key) => {
      if (node[key] !== req.body[key]) {
        acc[key] = {
          from: node[key],
          to: req.body[key]
        };
      }
      return acc;
    }, {});

    if (Object.keys(changes).length > 0) {
      node.editHistory.push({
        user: req.body.user || 'system',
        changes
      });
    }

    // Update node
    Object.assign(node, req.body);
    await node.save();
    
    res.json(node);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a node
export const deleteNode = async (req: Request, res: Response) => {
  try {
    const node = await Node.findById(req.params.id);
    
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    // Remove references to this node from other nodes
    await Node.updateMany(
      { 'relationships.nodeId': node._id },
      { $pull: { relationships: { nodeId: node._id } } }
    );

    await node.remove();
    res.json({ message: 'Node deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nodes by priority with stochastic sampling
export const getPriorityQueue = async (req: Request, res: Response) => {
  try {
    const { limit = 10, minPriority = 0 } = req.query;
    
    // Get high priority nodes
    const highPriorityNodes = await Node.find({
      priority: { $gte: minPriority },
      'metadata.status': 'active'
    })
    .sort({ priority: -1, lastAccessed: 1 })
    .limit(Number(limit) * 0.7);

    // Get random lower priority nodes
    const lowPriorityNodes = await Node.aggregate([
      {
        $match: {
          priority: { $lt: minPriority },
          'metadata.status': 'active'
        }
      },
      { $sample: { size: Math.ceil(Number(limit) * 0.3) } }
    ]);

    const nodes = [...highPriorityNodes, ...lowPriorityNodes];
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update node positions (for graph/tree view)
export const updatePositions = async (req: Request, res: Response) => {
  try {
    const { positions } = req.body;
    
    const updates = Object.entries(positions).map(([id, pos]) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position: pos } }
      }
    }));

    await Node.bulkWrite(updates);
    res.json({ message: 'Positions updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 