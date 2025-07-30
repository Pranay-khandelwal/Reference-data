import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse as csvParse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import EquityClient from '../models/equityClient.model';
import ForexClient from '../models/forexClient.model';
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

// Import equity client data from CSV
router.post('/equity/import', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParse({ columns: true, trim: true }))
      .on('data', (data: any) => {
        console.log('Raw CSV row:', data);
        results.push(data);
      })
      .on('end', async () => {
        try {
          if (results.length > 0) {
            console.log('First row from CSV:', results[0]);
          }

          const transformedData = results.map(row => ({
            ClientID: row.ClientID || row['Client ID'] || '',
            Counterparty: row.Counterparty || '',
            KYCStatus: row.KYCStatus || row['KYC Status'] || '',
            ReferenceDataValidated: row.ReferenceDataValidated || row['Reference Data Validated'] || '',
            MarginType: row.MarginType || row['Margin Type'] || '',
            MarginStatus: row.MarginStatus || row['Margin Status'] || '',
            ApprovalStatus: row.ApprovalStatus || row['Approval Status'] || '',
          }));

          if (transformedData.length > 0) {
            console.log('First transformed row:', transformedData[0]);
          }

          await EquityClient.insertMany(transformedData);

          // Create a notification for successful import
          const notification = new Notification({
            type: 'success',
            message: `Successfully imported ${transformedData.length} equity client records`,
            details: {
              recordCount: transformedData.length,
              fileName: req.file?.originalname
            }
          });
          await notification.save();

          res.json({ 
            message: 'Equity client data imported successfully', 
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

// Import forex client data from CSV
router.post('/forex/import', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParse({ columns: true, trim: true }))
      .on('data', (data: any) => {
        console.log('Raw CSV row:', data);
        results.push(data);
      })
      .on('end', async () => {
        try {
          if (results.length > 0) {
            console.log('First row from CSV:', results[0]);
          }

          const transformedData = results.map(row => ({
            ClientID: row.ClientID || row['Client ID'] || '',
            Counterparty: row.Counterparty || '',
            Portfolio: row.Portfolio || '',
            Custodian: row.Custodian || '',
            NettingEligibility: row.NettingEligibility || row['Netting Eligibility'] || '',
            KYCStatus: row.KYCStatus || row['KYC Status'] || '',
            SanctionsScreening: row.SanctionsScreening || row['Sanctions Screening'] || '',
            ExpenseApprovalStatus: row.ExpenseApprovalStatus || row['Expense Approval Status'] || '',
            ApprovalStatus: row.ApprovalStatus || row['Approval Status'] || '',
          }));

          if (transformedData.length > 0) {
            console.log('First transformed row:', transformedData[0]);
          }

          await ForexClient.insertMany(transformedData);

          // Create a notification for successful import
          const notification = new Notification({
            type: 'success',
            message: `Successfully imported ${transformedData.length} forex client records`,
            details: {
              recordCount: transformedData.length,
              fileName: req.file?.originalname
            }
          });
          await notification.save();

          res.json({ 
            message: 'Forex client data imported successfully', 
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

// Add a single equity client
router.post('/equity', async (req: Request, res: Response) => {
  try {
    const newClient = new EquityClient(req.body);
    const savedClient = await newClient.save();

    // Notification for new equity client
    const notification = new Notification({
      type: 'success',
      message: `Equity client ${savedClient.ClientID} added`,
      details: {
        clientType: 'equity',
        clientId: savedClient._id
      }
    });
    await notification.save();

    res.status(201).json(savedClient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add a single forex client
router.post('/forex', async (req: Request, res: Response) => {
  try {
    const newClient = new ForexClient(req.body);
    const savedClient = await newClient.save();

    // Notification for new forex client
    const notification = new Notification({
      type: 'success',
      message: `Forex client ${savedClient.ClientID} added`,
      details: {
        clientType: 'forex',
        clientId: savedClient._id
      }
    });
    await notification.save();

    res.status(201).json(savedClient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all equity clients
router.get('/equity', async (req: Request, res: Response) => {
  try {
    const clients = await EquityClient.find().sort({ ClientID: -1 });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all forex clients
router.get('/forex', async (req: Request, res: Response) => {
  try {
    const clients = await ForexClient.find().sort({ ClientID: -1 });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update equity client
router.put('/equity/:id', async (req: Request, res: Response) => {
  try {
    const { editNote, ...updateData } = req.body;
    if (!editNote) {
      return res.status(400).json({ message: 'Edit note is required' });
    }
    const originalClient = await EquityClient.findById(req.params.id);
    if (!originalClient) {
      return res.status(404).json({ message: 'Equity client not found' });
    }
    const updatedClient = await EquityClient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: 'Equity client not found' });
    }
    // Detect changes
    const changes: any = {};
    for (const key in updateData) {
      if (JSON.stringify(originalClient.get(key)) !== JSON.stringify(updatedClient.get(key))) {
        changes[key] = {
          old: originalClient.get(key),
          new: updatedClient.get(key)
        };
      }
    }
    // Notification (existing)
    const notification = new Notification({
      type: 'info',
      message: `Equity client ${updatedClient.ClientID} was updated`,
      details: {
        clientType: 'equity',
        clientId: updatedClient._id,
        changes: req.body
      }
    });
    await notification.save();
    res.json(updatedClient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update forex client
router.put('/forex/:id', async (req: Request, res: Response) => {
  try {
    const { editNote, ...updateData } = req.body;
    if (!editNote) {
      return res.status(400).json({ message: 'Edit note is required' });
    }
    const originalClient = await ForexClient.findById(req.params.id);
    if (!originalClient) {
      return res.status(404).json({ message: 'Forex client not found' });
    }
    const updatedClient = await ForexClient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: 'Forex client not found' });
    }
    // Detect changes
    const changes: any = {};
    for (const key in updateData) {
      if (JSON.stringify(originalClient.get(key)) !== JSON.stringify(updatedClient.get(key))) {
        changes[key] = {
          old: originalClient.get(key),
          new: updatedClient.get(key)
        };
      }
    }
    // Notification (existing)
    const notification = new Notification({
      type: 'info',
      message: `Forex client ${updatedClient.Counterparty} was updated`,
      details: {
        clientType: 'forex',
        clientId: updatedClient._id,
        changes: req.body
      }
    });
    await notification.save();
    res.json(updatedClient);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all equity clients
router.delete('/equity/all', async (_req: Request, res: Response) => {
  try {
    await EquityClient.deleteMany({});
    res.json({ message: 'All equity clients deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all forex clients
router.delete('/forex/all', async (_req: Request, res: Response) => {
  try {
    await ForexClient.deleteMany({});
    res.json({ message: 'All forex clients deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete equity client
router.delete('/equity/:id', async (req: Request, res: Response) => {
  try {
    const client = await EquityClient.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Equity client not found' });
    }
    // Notification for deleted equity client
    const notification = new Notification({
      type: 'info',
      message: `Equity client ${client.ClientID} deleted`,
      details: {
        clientType: 'equity',
        clientId: client._id
      }
    });
    await notification.save();
    res.json({ message: 'Equity client deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete forex client
router.delete('/forex/:id', async (req: Request, res: Response) => {
  try {
    const client = await ForexClient.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Forex client not found' });
    }
    // Notification for deleted forex client
    const notification = new Notification({
      type: 'info',
      message: `Forex client ${client.ClientID} deleted`,
      details: {
        clientType: 'forex',
        clientId: client._id
      }
    });
    await notification.save();
    res.json({ message: 'Forex client deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Download equity clients as CSV
router.get('/equity/download', async (req: Request, res: Response) => {
  try {
    const { searchTerm, kycFilter } = req.query;
    
    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { ClientID: new RegExp(String(searchTerm), 'i') },
        { Counterparty: new RegExp(String(searchTerm), 'i') }
      ];
    }
    if (kycFilter) {
      filter.KYCStatus = new RegExp(String(kycFilter), 'i');
    }

    const clients = await EquityClient.find(filter);

    // Convert to CSV
    const csvHeader = 'ClientID,Counterparty,Currency,KYCStatus,ReferenceDataValidated,MarginType,MarginStatus,ApprovalStatus\n';
    const csvRows = clients.map(client => {
      return `${client.ClientID},${client.Counterparty},${client.Currency || ''},${client.KYCStatus},${client.ReferenceDataValidated},${client.MarginType},${client.MarginStatus},${client.ApprovalStatus || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=equity_clients.csv');
    
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Download forex clients as CSV
router.get('/forex/download', async (req: Request, res: Response) => {
  try {
    const { searchTerm, kycFilter } = req.query;
    
    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { Counterparty: new RegExp(String(searchTerm), 'i') },
        { Portfolio: new RegExp(String(searchTerm), 'i') }
      ];
    }
    if (kycFilter) {
      filter.KYCStatus = new RegExp(String(kycFilter), 'i');
    }

    const clients = await ForexClient.find(filter);

    // Convert to CSV
    const csvHeader = 'Counterparty,Portfolio,Custodian,NettingEligibility,KYCStatus,SanctionsScreening,ExpenseApprovalStatus,ApprovalStatus\n';
    const csvRows = clients.map(client => {
      return `${client.Counterparty},${client.Portfolio},${client.Custodian},${client.NettingEligibility},${client.KYCStatus},${client.SanctionsScreening},${client.ExpenseApprovalStatus},${client.ApprovalStatus || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=forex_clients.csv');
    
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 