import mongoose from 'mongoose';
import Goal from '../src/models/Goal';
import GoalEvent, { IGoalEvent } from '../src/models/GoalEvent';
import dotenv from 'dotenv';

dotenv.config();

async function generateGoalEvents() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-map';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing events
    await GoalEvent.deleteMany({});
    console.log('Deleted existing events');

    // Find goals with both start and end dates
    const goals = await Goal.find({
      start: { $exists: true, $nin: [null, ''] },
      end: { $exists: true, $nin: [null, ''] }
    });

    console.log(`\nFound ${goals.length} goals with start and end dates`);

    for (const goal of goals) {
      if (!goal.start || !goal.end) continue;
      
      console.log(`\nProcessing goal: ${goal.description}`);
      
      // Calculate date range
      const startDate = new Date(goal.start);
      const endDate = new Date(goal.end);
      
      // Generate events for each day
      const events: Partial<IGoalEvent>[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        events.push({
          goalId: goal._id,
          date: new Date(currentDate),
          status: 'planned' as const,
          notes: goal.description
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Insert events in bulk
      if (events.length > 0) {
        await GoalEvent.insertMany(events);
        console.log(`Created ${events.length} events for goal ${goal.description}`);
      }
    }

    // Verify total events created
    const totalEvents = await GoalEvent.countDocuments();
    console.log(`\nTotal goal events in database: ${totalEvents}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

generateGoalEvents(); 