import mongoose from 'mongoose';
import Goal from '../src/models/Goal';
import dotenv from 'dotenv';

dotenv.config();

async function checkGoals() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-map';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Query all goals
    const goals = await Goal.find().sort({ createdAt: -1 });
    console.log('\nFound goals:', goals.length);
    
    if (goals.length > 0) {
      console.log('\nGoals:');
      goals.forEach(goal => {
        console.log(`- ${goal.description} (ID: ${goal._id})`);
      });
    } else {
      console.log('\nNo goals found in the database.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkGoals(); 