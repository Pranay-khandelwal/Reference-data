import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import Price from '../models/price.model';

const router = Router();
const upload = multer({ dest: 'server/uploads/' });

// Get all prices (most recent for each unique symbol)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const prices = await Price.aggregate([
      { $sort: { createdAt: -1 } }, // Sort by date descending
      {
        $group: {
          _id: "$symbol", // Group by symbol
          doc: { $first: "$$ROOT" } // Get the first document (most recent)
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }, // Promote the document to the root
      { $sort: { symbol: 1 } } // Optional: sort alphabetically by symbol
    ]);
    res.json(prices);
  } catch (error: any) {
    res.status(500).json({
      message: 'Error fetching prices',
      error: error.message,
    });
  }
});

// Add a new price (symbol)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { symbol, open = 0, high = 0, low = 0, close = 0, volume = 0, date } = req.body;
    const newPrice = new Price({
      symbol,
      open,
      high,
      low,
      close,
      volume,
      date: date ? new Date(date) : new Date()
    });
    await newPrice.save();
    res.status(201).json(newPrice);
  } catch (error: any) {
    res.status(400).json({
      message: 'Error creating price',
      error: error.message,
    });
  }
});

// Delete price by id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Price.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Price not found' });
    }
    res.json({ message: 'Price deleted', id });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error deleting price',
      error: error.message,
    });
  }
});

// Delete all price history for a symbol
router.delete('/history/:symbol', async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params;
        const result = await Price.deleteMany({ symbol });
        res.json({ message: `${result.deletedCount} records deleted for symbol ${symbol}.` });
    } catch (error: any) {
        res.status(500).json({
            message: 'Error deleting price history',
            error: error.message,
        });
    }
});

// Get all historical prices for a symbol
router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const history = await Price.find({ symbol }).sort({ date: 1 });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching price history', error: error.message });
  }
});

// Upload historical price data for a symbol via CSV
router.post('/upload/:symbol', upload.single('file'), async (req: Request, res: Response) => {
  const { symbol } = req.params;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const results: any[] = [];
  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      try {
        // Strict validation: only insert rows with all valid numbers and date
        const docs = results
          .map(row => {
            let date;
            try {
                if (!row.Date) {
                    console.error('No date provided in row:', row);
                    return null;
                }

                const dateStr = row.Date.trim();
                console.log('Processing date string:', dateStr);

                // Handle DD-MM-YYYY format
                if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    if (parts.length !== 3) {
                        console.error('Invalid date format (expected DD-MM-YYYY):', dateStr);
                        return null;
                    }
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
                    const year = parseInt(parts[2], 10);
                    
                    console.log('Parsed components:', { day, month: month + 1, year });
                    
                    if (isNaN(day) || isNaN(month) || isNaN(year)) {
                        console.error('Invalid date components:', { day, month, year });
                        return null;
                    }
                    
                    date = new Date(year, month, day);
                } else if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts.length !== 3) {
                        console.error('Invalid date format (expected DD/MM/YYYY):', dateStr);
                        return null;
                    }
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    
                    if (isNaN(day) || isNaN(month) || isNaN(year)) {
                        console.error('Invalid date components:', { day, month, year });
                        return null;
                    }
                    
                    date = new Date(year, month, day);
                } else {
                    console.error('Unsupported date format:', dateStr);
                    return null;
                }

                if (!date || isNaN(date.getTime())) {
                    console.error('Invalid date result:', date);
                    return null;
                }

                console.log('Successfully created date object:', date.toISOString());
            } catch (error) {
                console.error('Error parsing date:', error);
                return null;
            }

            // Validate other numeric fields
            if (
              isNaN(parseFloat(row.Open)) ||
              isNaN(parseFloat(row.High)) ||
              isNaN(parseFloat(row.Low)) ||
              isNaN(parseFloat(row.Close)) ||
              isNaN(parseInt(row.Volume, 10))
            ) {
              console.error('Invalid numeric data in row:', row);
              return null;
            }

            return {
              symbol,
              date,
              timestamp: date.getTime(), // Add timestamp for consistency
              open: parseFloat(row.Open),
              high: parseFloat(row.High),
              low: parseFloat(row.Low),
              close: parseFloat(row.Close),
              volume: parseInt(row.Volume, 10)
            };
          })
          .filter(Boolean);

        if (docs.length === 0) {
          return res.status(400).json({ 
            message: 'No valid rows found in CSV. Please ensure your CSV has:\n' +
                    '1. A "Date" column in DD-MM-YYYY format\n' +
                    '2. Valid numeric values for Open, High, Low, Close, and Volume'
          });
        }
        await Price.insertMany(docs);
        res.json({ message: 'Data uploaded', count: docs.length });
      } catch (err) {
        console.error('Error saving price data:', err);
        res.status(500).json({ message: 'Error saving data', error: err });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(400).json({ message: 'Error reading CSV file', error: err });
    });
});

export default router; 