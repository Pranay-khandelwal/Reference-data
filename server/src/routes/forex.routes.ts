import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse as csvParse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Forex from '../models/forex.model';
import Notification from '../models/notifications.model';

const router: Router = express.Router();

// Configure multer for file upload to ensure the uploads directory exists
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Get all forex instruments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const instruments = await Forex.find().sort({ RID: -1 });
    res.json(instruments);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

// Create a new forex instrument
router.post('/', async (req: Request, res: Response) => {
  const instrument = new Forex(req.body);
  try {
    const newInstrument = await instrument.save();
    res.status(201).json(newInstrument);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
});

// Import forex data from CSV
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParse({ columns: true, trim: true }))
      .on('data', (data: any) => {
        console.log('Raw CSV row:', data); // Debug log
        results.push(data);
      })
      .on('end', async () => {
        try {
          if (results.length > 0) {
            console.log('First row from CSV:', results[0]); // Debug log
          }

          const transformedData = results.map(row => ({
            CurrencyPair: row.CurrencyPair || row['Currency Pair'] || '',
            Counterparty: row.Counterparty || '',
            BaseCurrency: row.BaseCurrency || row['Base Currency'] || '',
            TermCurrency: row.TermCurrency || row['Term Currency'] || '',
            ExecutionVenue: row.ExecutionVenue || row['Execution Venue'] || '',
            ProductType: row.ProductType || row['Product Type'] || '',
            BookingLocation: row.BookingLocation || row['Booking Location'] || '',
            Portfolio: row.Portfolio || '',
            TradeSourceSystem: row.TradeSourceSystem || row['Trade Source System'] || '',
            Custodian: row.Custodian || '',
            SettlementInstructions: row.SettlementInstructions || row['Settlement Instructions'] || '',
            NettingEligibility: row.NettingEligibility === 'Yes' || row['Netting Eligibility'] === 'Yes',
            KYCStatus: row.KYCStatus || row['KYC Status'] || '',
            SanctionsScreening: row.SanctionsScreening || row['Sanctions Screening'] || '',
            CostCenter: row.CostCenter || row['Cost Center'] || '',
            ExpenseApprovalStatus: row.ExpenseApprovalStatus || row['Expense Approval Status'] || ''
          }));

          if (transformedData.length > 0) {
            console.log('First transformed row:', transformedData[0]); // Debug log
          }

          await Forex.insertMany(transformedData);

          // Create a notification for successful import
          const notification = new Notification({
            type: 'success',
            message: `Successfully imported ${transformedData.length} forex records`,
            details: {
              recordCount: transformedData.length,
              fileName: req.file?.originalname
            }
          });
          await notification.save();

          res.json({ 
            message: 'Data imported successfully', 
            count: transformedData.length 
          });
        } catch (error: any) {
          console.error('Error in import route:', error);
          res.status(500).json({ message: 'Error importing data', error: error });
        }
      });
  } catch (error: any) {
    console.error('Error in import route:', error);
    res.status(500).json({ message: 'Error importing data', error: error });
  }
});

// Update a forex instrument
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { editNote, ...updateData } = req.body;

    if (!editNote) {
      return res.status(400).json({ message: 'Edit note is required' });
    }

    const originalInstrument = await Forex.findById(req.params.id);
    if (!originalInstrument) {
      return res.status(404).json({ message: 'Forex instrument not found' });
    }

    const updatedForex = await Forex.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedForex) {
      return res.status(404).json({ message: 'Forex instrument not found' });
    }

    res.json(updatedForex);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a forex instrument
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const instrument = await Forex.findByIdAndDelete(req.params.id);
    if (!instrument) {
      return res.status(404).json({ message: 'Forex instrument not found' });
    }
    
    res.json({ message: 'Forex instrument deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

// Clear all forex instruments
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await Forex.deleteMany({});
    res.json({ message: 'All forex instruments cleared' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

// Download forex instruments as CSV
router.get('/download', async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req.query;
    
    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { CurrencyPair: new RegExp(String(searchTerm), 'i') },
        { BaseCurrency: new RegExp(String(searchTerm), 'i') },
        { TermCurrency: new RegExp(String(searchTerm), 'i') },
        { ExecutionVenue: new RegExp(String(searchTerm), 'i') },
        { ProductType: new RegExp(String(searchTerm), 'i') }
      ];
    }

    const instruments = await Forex.find(filter);

    // Convert to CSV
    const csvHeader = 'Currency Pair,Base Currency,Term Currency,Execution Venue,Product Type,Booking Location,Portfolio,Trade Source System,Custodian,Settlement Instructions,Netting Eligibility,Sanctions Screening,Cost Center\n';
    const csvRows = instruments.map(instrument => {
      return `${instrument.CurrencyPair || ''},${instrument.BaseCurrency || ''},${instrument.TermCurrency || ''},${instrument.ExecutionVenue || ''},${instrument.ProductType || ''},${instrument.BookingLocation || ''},${instrument.Portfolio || ''},${instrument.TradeSourceSystem || ''},${instrument.Custodian || ''},${instrument.SettlementInstructions || ''},${instrument.NettingEligibility || false},${instrument.SanctionsScreening || ''},${instrument.CostCenter || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=forex_instruments.csv');
    
    res.send(csvContent);
  } catch (error: any) {
    console.error('Error downloading forex instruments:', error);
    res.status(500).json({ 
      message: 'Error downloading forex instruments',
      error: error.message 
    });
  }
});

export default router; 