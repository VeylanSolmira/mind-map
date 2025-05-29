import mongoose from 'mongoose';
import Goal from '../../models/Goal';

describe('Goal Model Test', () => {
  it('should create & save goal successfully', async () => {
    const validGoal = new Goal({
      hierarchyId: '1.1',
      description: 'Test Description',
      goalType: 'task',
      status: 'Not Started',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // tomorrow
      priority: 5,
      tags: 'test,automation',
      score: 0,
      assessment: 0,
      communityValue: 0,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 86400000).toISOString(),
      lastSelected: new Date(),
      effectivePriority: 0,
      decayRate: 0.001,
      autoIngest: false
    });
    const savedGoal = await validGoal.save();
    
    expect(savedGoal._id).toBeDefined();
    expect(savedGoal.hierarchyId).toBe(validGoal.hierarchyId);
    expect(savedGoal.description).toBe(validGoal.description);
    expect(savedGoal.goalType).toBe(validGoal.goalType);
    expect(savedGoal.status).toBe(validGoal.status);
    expect(savedGoal.priority).toBe(validGoal.priority);
    expect(savedGoal.tags).toBe(validGoal.tags);
  });

  it('should fail to save goal without required fields', async () => {
    const goalWithoutRequiredField = new Goal({ description: 'Test Description' });
    let err;
    
    try {
      await goalWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should update goal successfully', async () => {
    const goal = new Goal({
      hierarchyId: '1.1',
      description: 'Test Description',
      goalType: 'task',
      status: 'Not Started',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      priority: 5,
      tags: 'test',
      score: 0,
      assessment: 0,
      communityValue: 0,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 86400000).toISOString(),
      lastSelected: new Date(),
      effectivePriority: 0,
      decayRate: 0.001,
      autoIngest: false
    });
    
    await goal.save();
    
    const updatedGoal = await Goal.findByIdAndUpdate(
      goal._id,
      { priority: 8, status: 'Completed' },
      { new: true }
    );
    
    expect(updatedGoal?.priority).toBe(8);
    expect(updatedGoal?.status).toBe('Completed');
  });

  it('should delete goal successfully', async () => {
    const goal = new Goal({
      hierarchyId: '1.1',
      description: 'Test Description',
      goalType: 'task',
      status: 'Not Started',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      priority: 5,
      tags: 'test',
      score: 0,
      assessment: 0,
      communityValue: 0,
      start: new Date().toISOString(),
      end: new Date(Date.now() + 86400000).toISOString(),
      lastSelected: new Date(),
      effectivePriority: 0,
      decayRate: 0.001,
      autoIngest: false
    });
    
    await goal.save();
    await Goal.findByIdAndDelete(goal._id);
    
    const deletedGoal = await Goal.findById(goal._id);
    expect(deletedGoal).toBeNull();
  });
}); 