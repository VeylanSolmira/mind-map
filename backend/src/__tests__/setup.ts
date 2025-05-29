import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        storageEngine: 'wiredTiger'
      }
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    throw error;
  }
}, 30000); // Increase timeout to 30 seconds

// Clear all test data after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) { // Connected
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// Disconnect and stop server after all tests
afterAll(async () => {
  if (mongoose.connection.readyState === 1) { // Connected
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Add a dummy test to satisfy Jest
describe('Test Setup', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });
}); 