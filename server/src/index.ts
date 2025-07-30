import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationsRoutes from './routes/notifications.routes';
import equityRoutes from './routes/equity.routes';
import forexRoutes from './routes/forex.routes';
import fixedIncomeRoutes from './routes/fixedIncome.routes';
import futuresRoutes from './routes/futures.routes';
import optionsRoutes from './routes/options.routes';
import clientRoutes from './routes/client.routes';
import instrumentRoutes from './routes/instrument.routes';
import auditRoutes from './routes/audit.routes';
import priceRoutes from './routes/price.routes';
import ssiRoutes from './routes/ssi.routes';
import Equity from './models/equity.model';
import Forex from './models/forex.model';
import Notification from './models/notifications.model';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB databases
const connectToMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reference-data';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB database');
  } catch (err) {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1); // Exit if we can't connect to MongoDB
  }
};

// Connect to MongoDB before starting the server
connectToMongoDB().then(() => {
  // Routes
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/equity', equityRoutes);
  app.use('/api/forex', forexRoutes);
  app.use('/api/fixed-income', fixedIncomeRoutes);
  app.use('/api/futures', futuresRoutes);
  app.use('/api/options', optionsRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/instruments', instrumentRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/prices', priceRoutes);
  app.use('/api/ssi', ssiRoutes);

  // Start server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
};

// Use error handling middleware
app.use(errorHandler); 