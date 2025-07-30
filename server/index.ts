import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { parse } from 'csv-parse';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import Equity from './models/equity.model';
import Forex from './models/forex.model';
import ssiRoutes from './src/routes/ssi.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reference-data';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connection established');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/ssi', ssiRoutes);

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
};

// CSV Import Routes
app.post('/api/import/equity', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const importedData = await Equity.insertMany(results);
          fs.unlinkSync(req.file!.path); // Clean up uploaded file
          res.json({
            message: 'Equity data imported successfully',
            count: importedData.length,
          });
        } catch (error: any) {
          next(error);
        }
      })
      .on('error', (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
});

app.post('/api/import/forex', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const importedData = await Forex.insertMany(results);
          fs.unlinkSync(req.file!.path); // Clean up uploaded file
          res.json({
            message: 'Forex data imported successfully',
            count: importedData.length,
          });
        } catch (error: any) {
          next(error);
        }
      })
      .on('error', (error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
});

// Data Retrieval Routes
app.get('/api/equity', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const equities = await Equity.find();
    res.json(equities);
  } catch (error) {
    next(error);
  }
});

app.get('/api/forex', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const forexData = await Forex.find();
    res.json(forexData);
  } catch (error) {
    next(error);
  }
});

// Use error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 