import mongoose from 'mongoose';
import dotenv from 'dotenv';
import csv from 'csvtojson';
import path from 'path';
import Goal from '../src/models/Goal';

dotenv.config();

async function seedFromCSV() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmap');
    console.log('Connected to MongoDB');

    // Clear existing goals
    await Goal.deleteMany({});
    console.log('Cleared existing goals');

    // Read CSV file
    const csvFilePath = path.join(__dirname, '../../data/goals.csv');
    const jsonArray = await csv().fromFile(csvFilePath);
    console.log(`Found ${jsonArray.length} records in CSV`);

    // Transform data
    const goals = jsonArray.map(record => ({
      hierarchyId: record.Naming,  // Use Naming as hierarchyId
      description: record.Description,
      goalType: record['Goal Type'] || 'General', // Default to 'General' if missing
      done: record.Done === '1',
      priority: record.Priority ? parseInt(record.Priority) : 0,
      score: record.Score ? parseFloat(record.Score) : 0,
      assessment: record.Assessment ? parseFloat(record.Assessment) : 0,
      communityValue: record['Community Value'] ? parseFloat(record['Community Value']) : 0,
      start: record.Start || '',
      end: record.End || ''
    }));

    // Insert all goals
    const result = await Goal.insertMany(goals);
    console.log(`Successfully inserted ${result.length} goals`);

    // Verify the insert
    const count = await Goal.countDocuments();
    console.log(`Total goals in database: ${count}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

seedFromCSV(); 