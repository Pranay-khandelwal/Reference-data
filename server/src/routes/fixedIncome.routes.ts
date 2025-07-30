import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import FixedIncome from '../models/fixedIncome.model';

const router: Router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads');
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

// Utility function to generate next available RID
async function generateNextRID(ISIN: string) {
  const prefix = (ISIN || '').substring(0, 5);
  // Find the highest RID with this prefix
  const latest = await FixedIncome.find({ RID: { $regex: `^${prefix}` } })
    .sort({ RID: -1 })
    .limit(1);
  let nextSeq = 1;
  if (latest.length > 0) {
    const lastRID = latest[0].RID;
    // The sequence is after the prefix
    const lastSeqStr = lastRID.substring(prefix.length);
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }
  return prefix + nextSeq.toString().padStart(2, '0');
}

// Get all fixed income instruments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const instruments = await FixedIncome.find();
    res.json(instruments);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching fixed income instruments',
      error: error.message 
    });
  }
});

// Create a new fixed income instrument
router.post('/', async (req: Request, res: Response) => {
  try {
    const { ISIN } = req.body;
    if (!ISIN) {
      return res.status(400).json({ message: 'ISIN is required to generate RID' });
    }
    const RID = await generateNextRID(ISIN);
    const instrument = new FixedIncome({ ...req.body, RID });
    const savedInstrument = await instrument.save();
    res.status(201).json(savedInstrument);
  } catch (error: any) {
    res.status(400).json({ 
      message: 'Error creating fixed income instrument',
      error: error.message 
    });
  }
});

// Update a fixed income instrument
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { editNote, ...updateData } = req.body;

    if (!editNote) {
      return res.status(400).json({ message: 'Edit note is required' });
    }

    const updatedInstrument = await FixedIncome.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedInstrument) {
      return res.status(404).json({ message: 'Fixed income instrument not found' });
    }
    
    res.json(updatedInstrument);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a fixed income instrument
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedInstrument = await FixedIncome.findByIdAndDelete(req.params.id);
    if (!deletedInstrument) {
      return res.status(404).json({ message: 'Fixed income instrument not found' });
    }

    res.json({ message: 'Fixed income instrument deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all fixed income instruments
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await FixedIncome.deleteMany({});
    res.json({ message: 'All fixed income instruments cleared' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

export default router; 