import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Instrument from '../models/instrument.model';
import EquityInstrument from '../models/equityInstrument.model';
import ForexInstrument from '../models/forexInstrument.model';
import Notification from '../models/notifications.model';

const router: Router = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
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
  const latest = await Instrument.find({ RID: { $regex: `^${prefix}` } })
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
    const Symbol = row.Symbol || row.symbol || '';
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

// Get all instruments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const instruments = await Instrument.find();
    // Return the stored RID for each instrument
    const instrumentsWithRID = instruments.map(instrument => ({
      ...instrument.toObject(),
      RID: instrument.RID
    }));
    res.json(instrumentsWithRID);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

// Create a new instrument
router.post('/', async (req: Request, res: Response) => {
  try {
    const { Symbol, symbol, ISIN } = req.body;
    const symbolValue = Symbol || symbol;
    if (!symbolValue || !ISIN) {
      return res.status(400).json({ message: 'Symbol and ISIN are required to generate RID' });
    }
    const RID = await generateNextRID(symbolValue, ISIN);
    const instrument = new Instrument({ ...req.body, RID });
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

// Import CSV file
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
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
          // Transform CSV data to match our schema
          const batchRows = results.map(row => ({ ...row }));
          await assignBatchRIDs(batchRows, Instrument);
          const transformedData = batchRows.map(row => {
            const instrument: any = {
              assetClass: row.assetClass || row.AssetClass || 'General',
              ISIN: row.ISIN || '',
              RID: row.RID,
            };
            if (row.instrumentName) instrument.instrumentName = row.instrumentName;
            if (row.issuer) instrument.issuer = row.issuer;
            if (row.sector) instrument.sector = row.sector;
            if (row.country) instrument.country = row.country;
            if (row.currency) instrument.currency = row.currency;
            if (row.pricingSource) instrument.pricingSource = row.pricingSource;
            if (row.Symbol || row.symbol) instrument.Symbol = row.Symbol || row.symbol;
            if (row.ClientID || row.clientId) instrument.ClientID = row.ClientID || row.clientId;
            if (row.Counterparty || row.counterparty) instrument.Counterparty = row.Counterparty || row.counterparty;
            if (row.TradingVenue || row.tradingVenue) instrument.TradingVenue = row.TradingVenue || row.tradingVenue;
            if (row.Currency || row.currency) instrument.Currency = row.Currency || row.currency;
            if (row.CountryOfTrade || row.countryOfTrade) instrument.CountryOfTrade = row.CountryOfTrade || row.countryOfTrade;
            if (row.KYCStatus || row.kycStatus) instrument.KYCStatus = row.KYCStatus || row.kycStatus;
            if (row.ReferenceDataValidated || row.referenceDataValidated) instrument.Validated = (row.ReferenceDataValidated || row.referenceDataValidated) === 'true';
            if (row.CollateralRequired || row.collateralRequired) instrument.Collateral = parseFloat(row.CollateralRequired || row.collateralRequired);
            if (row.TypeMargin || row.marginType) instrument.TypeMargin = row.TypeMargin || row.marginType;
            if (Object.prototype.hasOwnProperty.call(row, 'Instrument Status')) {
              const statusValue = (row['Instrument Status'] || '').toString().trim().toLowerCase();
              if (statusValue !== 'active' && statusValue !== 'inactive') {
                console.warn(`Row: Invalid Instrument Status value detected: '${row['Instrument Status']}' (must be 'Active' or 'Inactive')`);
              } else {
                console.log('Instrument Status column detected:', row['Instrument Status']);
              }
            }
            if (row.PricingSource || row.pricingSource) instrument.PricingSource = row.PricingSource || row.pricingSource;
            if (row.currencyPair) instrument.currencyPair = row.currencyPair;
            if (row.baseCurrency) instrument.baseCurrency = row.baseCurrency;
            if (row.termCurrency) instrument.termCurrency = row.termCurrency;
            if (row.executionVenue) instrument.executionVenue = row.executionVenue;
            if (row.productType) instrument.productType = row.productType;
            if (row.bookingLocation) instrument.bookingLocation = row.bookingLocation;
            if (row.portfolio) instrument.portfolio = row.portfolio;
            if (row.tradeSourceSystem) instrument.tradeSourceSystem = row.tradeSourceSystem;
            if (row.custodian) instrument.custodian = row.custodian;
            if (row.settlementInstructions) instrument.settlementInstructions = row.settlementInstructions;
            if (row.nettingEligibility) instrument.nettingEligibility = row.nettingEligibility === 'true';
            if (row.sanctionsScreening) instrument.sanctionsScreening = row.sanctionsScreening;
            if (row.settlementCurrency) instrument.settlementCurrency = row.settlementCurrency;
            if (row.costCenter) instrument.costCenter = row.costCenter;
            if (row.expenseApprovalStatus) instrument.expenseApprovalStatus = row.expenseApprovalStatus;
            return instrument;
          });

          const importedData = await Instrument.insertMany(transformedData);
          fs.unlinkSync(req.file!.path); // Clean up uploaded file
          res.json({
            message: 'CSV data imported successfully',
            count: importedData.length,
          });
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      })
      .on('error', (error) => {
        res.status(400).json({ message: error.message });
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
});

// Update an instrument
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedInstrument = await Instrument.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedInstrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }
    res.json(updatedInstrument);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: 'An unknown error occurred' });
    }
  }
});

// Delete an instrument
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const instrument = await Instrument.findByIdAndDelete(req.params.id);
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }
    res.json({ message: 'Instrument deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

// Download equity instruments as CSV
router.get('/equity/download', async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req.query;
    
    // Build filter query
    const filter: any = { assetClass: 'Equity' };
    if (searchTerm) {
      filter.$or = [
        { ISIN: new RegExp(String(searchTerm), 'i') },
        { instrumentName: new RegExp(String(searchTerm), 'i') },
        { tradingVenue: new RegExp(String(searchTerm), 'i') },
        { symbol: new RegExp(String(searchTerm), 'i') },
        { Symbol: new RegExp(String(searchTerm), 'i') }
      ];
    }

    const instruments = await Instrument.find(filter);

    // Convert to CSV with symbol included
    const csvHeader = 'Symbol,ISIN,Instrument Name,Trading Venue,Currency,Country,Sector,Issuer\n';
    const csvRows = instruments.map(instrument => {
      const symbol = instrument.symbol || instrument.Symbol || '';
      return `${symbol},${instrument.ISIN || ''},${instrument.instrumentName || ''},${instrument.tradingVenue || ''},${instrument.currency || ''},${instrument.country || ''},${instrument.sector || ''},${instrument.issuer || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=equity_instruments.csv');
    
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Download forex instruments as CSV
router.get('/forex/download', async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req.query;
    
    // Build filter query
    const filter: any = { assetClass: 'Forex' };
    if (searchTerm) {
      filter.$or = [
        { currencyPair: new RegExp(String(searchTerm), 'i') },
        { baseCurrency: new RegExp(String(searchTerm), 'i') },
        { termCurrency: new RegExp(String(searchTerm), 'i') },
        { symbol: new RegExp(String(searchTerm), 'i') },
        { Symbol: new RegExp(String(searchTerm), 'i') }
      ];
    }

    const instruments = await Instrument.find(filter);

    // Convert to CSV with symbol included
    const csvHeader = 'Symbol,Currency Pair,Base Currency,Term Currency,Execution Venue,Product Type,Settlement Currency,Custodian\n';
    const csvRows = instruments.map(instrument => {
      const symbol = instrument.symbol || instrument.Symbol || '';
      return `${symbol},${instrument.currencyPair || ''},${instrument.baseCurrency || ''},${instrument.termCurrency || ''},${instrument.executionVenue || ''},${instrument.productType || ''},${instrument.settlementCurrency || ''},${instrument.custodian || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=forex_instruments.csv');
    
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 