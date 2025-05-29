import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetCollection(collectionName: string) {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-map';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all documents in the collection
    const result = await mongoose.connection.collection(collectionName).deleteMany({});
    console.log(`Deleted ${result.deletedCount} documents from ${collectionName}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get collection name from command line argument
const collectionName = process.argv[2];
if (!collectionName) {
  console.error('Please provide a collection name');
  process.exit(1);
}

resetCollection(collectionName); 