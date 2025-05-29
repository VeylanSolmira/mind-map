import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  try {
    console.log('Starting MongoDB Memory Server...');
    mongoServer = await MongoMemoryServer.create({
      instance: {
        storageEngine: 'wiredTiger',
        port: 0 // Use random available port
      },
      binary: {
        downloadDir: './mongodb-binaries', // Cache binaries locally
        version: '6.0.9' // Use specific version to avoid downloads
      }
    });
    
    const mongoUri = mongoServer.getUri();
    console.log('MongoDB Memory Server started at:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 1, // Limit connection pool for tests
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB Memory Server');
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    throw error;
  }
}, 60000); // Increase timeout to 60 seconds

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