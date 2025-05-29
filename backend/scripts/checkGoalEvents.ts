import mongoose from 'mongoose';
import GoalEvent from '../src/models/GoalEvent';
import dotenv from 'dotenv';

dotenv.config();

async function checkGoalEvents() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-map';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Query all goal events
    const events = await GoalEvent.find().sort({ date: 1 });
    console.log('\nFound goal events:', events.length);
    
    if (events.length > 0) {
      console.log('\nEvents:');
      events.forEach(event => {
        console.log(`- ${event.date.toISOString()}: ${event.status} (Goal ID: ${event.goalId})`);
      });
    } else {
      console.log('\nNo goal events found in the database.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkGoalEvents(); 