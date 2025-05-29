import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import goalsRouter from './src/routes/goalRoutes';
import goalEventsRouter from './src/routes/goalEventRoutes';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mind-map';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
app.use('/api/goals', goalsRouter);
app.use('/api/goal-events', goalEventsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 