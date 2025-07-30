import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Equity from '../models/equity.model';

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
async function generateNextRID(Symbol: string, ISIN: string) {
  const prefix = (Symbol || '') + (ISIN || '').substring(0, 5);
  // Find the highest RID with this prefix
  const latest = await Equity.find({ RID: { $regex: `^${prefix}` } })
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

// Helper for batch RID assignment
async function assignBatchRIDs(rows: any[], model: any) {
  // Group rows by prefix
  const prefixMap: Record<string, {rows: any[], startSeq: number}> = {};

  // First, collect all prefixes
  for (const row of rows) {
    const Symbol = row.Symbol || '';
    const ISIN = row.ISIN || '';
    const prefix = (Symbol || '') + (ISIN || '').substring(0, 5);
    if (!prefixMap[prefix]) {
      prefixMap[prefix] = { rows: [], startSeq: 1 };
    }
    prefixMap[prefix].rows.push(row);
  }

  // For each prefix, get the max sequence from DB
  for (const prefix of Object.keys(prefixMap)) {
    const latest = await model.find({ RID: { $regex: `^${prefix}` } })
      .sort({ RID: -1 })
      .limit(1);
    let startSeq = 1;
    if (latest.length > 0) {
      const lastRID = latest[0].RID;
      const lastSeqStr = lastRID.substring(prefix.length);
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) {
        startSeq = lastSeq + 1;
      }
    }
    prefixMap[prefix].startSeq = startSeq;
  }

  // Assign RIDs
  for (const prefix of Object.keys(prefixMap)) {
    let seq = prefixMap[prefix].startSeq;
    for (const row of prefixMap[prefix].rows) {
      row.RID = prefix + seq.toString().padStart(2, '0');
      seq++;
    }
  }
  return rows;
}

// Get all equity instruments
router.get('/', async (_req: Request, res: Response) => {
  console.log('GET /api/equity - Fetching all equity instruments');
  try {
    const instruments = await Equity.find().sort({ RID: -1 });
    console.log(`Found ${instruments.length} equity instruments`);
    res.json(instruments);
  } catch (error: any) {
    console.error('Error fetching equity instruments:', error);
    res.status(500).json({ 
      message: 'Error fetching equity instruments',
      error: error.message 
    });
  }
});

// Create a new equity instrument
router.post('/', async (req: Request, res: Response) => {
  console.log('POST /api/equity - Creating new equity instrument');
  try {
    const { Symbol, ISIN } = req.body;
    if (!Symbol || !ISIN) {
      return res.status(400).json({ message: 'Symbol and ISIN are required to generate RID' });
    }
    const RID = await generateNextRID(Symbol, ISIN);
    const instrument = new Equity({ ...req.body, RID });
    const savedInstrument = await instrument.save();
    console.log('Created equity instrument:', savedInstrument._id);
    res.status(201).json(savedInstrument);
  } catch (error: any) {
    console.error('Error creating equity instrument:', error);
    res.status(400).json({ 
      message: 'Error creating equity instrument',
      error: error.message 
    });
  }
});

// Import CSV file
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  console.log('POST /api/equity/import - Importing CSV file');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);
    const results: any[] = [];
    let rowCount = 0;

    fs.createReadStream(req.file.path)
      .pipe(parse({ 
        columns: true, 
        trim: true,
        skipEmptyLines: true,
        skipRecordsWithError: true
      }))
      .on('data', (data) => {
        rowCount++;
        console.log(`Processing row ${rowCount}:`, Object.keys(data));
        results.push(data);
      })
      .on('end', async () => {
        try {
          console.log(`Finished reading CSV. Processing ${results.length} rows.`);
          
          // Transform CSV data to match our schema
          const batchRows = results.map(row => ({ ...row }));
          await assignBatchRIDs(batchRows, Equity);
          const transformedData = batchRows.map(row => ({
            ISIN: row.ISIN || '',
            Symbol: row.Symbol || '',
            RID: row.RID,
            ClientID: row['Client ID'] || '',
            Counterparty: row.Counterparty || '',
            TradingVenue: row['Trading Venue'] || '',
            Currency: row.Currency || '',
            CountryOfTrade: row['Country of Trade'] || '',
            KYCStatus: row['KYC Status'] || '',
            ReferenceData: {
              validated: row['Reference Data Validated'] === 'true'
            },
            Validated: row['Reference Data Validated'] === 'true',
            Collateral: parseFloat(row['Collateral Required'] || '0'),
            RequiredMargin: 0,
            TypeMargin: row['Margin Type'] || '',
            Status: row['Instrument Status'] || '',
          }));

          console.log('Inserting data into MongoDB...');
          const importedData = await Equity.insertMany(transformedData, { ordered: false });
          console.log(`Successfully imported ${importedData.length} records.`);
          
          // Clean up uploaded file
          fs.unlinkSync(req.file!.path);
          
          res.json({
            message: 'CSV data imported successfully',
            count: importedData.length,
            totalRows: results.length
          });
        } catch (error: any) {
          console.error('Error processing CSV data:', error);
          // Clean up uploaded file in case of error
          if (fs.existsSync(req.file!.path)) {
            fs.unlinkSync(req.file!.path);
          }
          res.status(400).json({ 
            message: 'Error processing CSV data',
            error: error.message,
            details: error.errors || {}
          });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        // Clean up uploaded file in case of error
        if (fs.existsSync(req.file!.path)) {
          fs.unlinkSync(req.file!.path);
        }
        res.status(400).json({ 
          message: 'Error reading CSV file',
          error: error.message
        });
      });
  } catch (error: unknown) {
    console.error('Unexpected error during file upload:', error);
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (error instanceof Error) {
      res.status(400).json({ 
        message: 'Error uploading file',
        error: error.message
      });
    } else {
      res.status(400).json({ 
        message: 'An unknown error occurred during file upload'
      });
    }
  }
});

// Update an equity instrument
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { editNote, ...updateData } = req.body;

    if (!editNote) {
      return res.status(400).json({ message: 'Edit note is required' });
    }

    const originalInstrument = await Equity.findById(req.params.id);
    if (!originalInstrument) {
      return res.status(404).json({ message: 'Equity instrument not found' });
    }

    const updatedInstrument = await Equity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedInstrument) {
      // This case should ideally not be hit if originalInstrument was found, but it's good practice
      return res.status(404).json({ message: 'Equity instrument not found' });
    }
    
    // Create an audit log
    const changes: any = {};
    for (const key in updateData) {
      if (JSON.stringify(originalInstrument.get(key)) !== JSON.stringify(updatedInstrument.get(key))) {
        changes[key] = {
          old: originalInstrument.get(key),
          new: updatedInstrument.get(key)
        };
      }
    }

    res.json(updatedInstrument);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an equity instrument
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedInstrument = await Equity.findByIdAndDelete(req.params.id);
    if (!deletedInstrument) {
      return res.status(404).json({ message: 'Equity instrument not found' });
    }

    res.json({ message: 'Equity instrument deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all equity instruments
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await Equity.deleteMany({});
    res.json({ message: 'All equity instruments cleared' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

// Get recent equity instruments
router.get('/recent', async (_req: Request, res: Response) => {
  console.log('GET /api/equity/recent - Fetching recent equity instruments');
  try {
    const instruments = await Equity.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id ISIN Symbol Currency RID Status');
    // Return the stored RID and Status
    const instrumentsWithRID = instruments.map(instrument => ({
      _id: instrument._id,
      RID: instrument.RID,
      ISIN: instrument.ISIN,
      Symbol: instrument.Symbol,
      Currency: instrument.Currency,
      Status: instrument.Status // Add Status field
    }));
    console.log(`Found ${instrumentsWithRID.length} recent equity instruments`);
    res.json(instrumentsWithRID);
  } catch (error: any) {
    console.error('Error fetching recent equity instruments:', error);
    res.status(500).json({ 
      message: 'Error fetching recent equity instruments',
      error: error.message 
    });
  }
});

// Download equity instruments as CSV
router.get('/download', async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req.query;
    
    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { ISIN: new RegExp(String(searchTerm), 'i') },
        { Symbol: new RegExp(String(searchTerm), 'i') },
        { TradingVenue: new RegExp(String(searchTerm), 'i') },
        { ClientID: new RegExp(String(searchTerm), 'i') },
        { Counterparty: new RegExp(String(searchTerm), 'i') }
      ];
    }

    const instruments = await Equity.find(filter);

    // Convert to CSV
    const csvHeader = 'ISIN,Symbol,Client ID,Counterparty,Trading Venue,Currency,Country of Trade,KYC Status,Reference Data Validated,Collateral Required,Margin Type,Margin Status\n';
    const csvRows = instruments.map(instrument => {
      return `${instrument.ISIN || ''},${instrument.Symbol || ''},${instrument.ClientID || ''},${instrument.Counterparty || ''},${instrument.TradingVenue || ''},${instrument.Currency || ''},${instrument.CountryOfTrade || ''},${instrument.KYCStatus || ''},${instrument.Validated || false},${instrument.Collateral || 0},${instrument.TypeMargin || ''},${instrument.Status || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=equity_instruments.csv');
    
    res.send(csvContent);
  } catch (error: any) {
    console.error('Error downloading equity instruments:', error);
    res.status(500).json({ 
      message: 'Error downloading equity instruments',
      error: error.message 
    });
  }
});

export default router; 