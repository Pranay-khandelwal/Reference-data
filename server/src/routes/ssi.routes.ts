import express, { Router, Request, Response } from 'express';
import EquitySSI from '../models/equitySSI.model';
import ForexSSI from '../models/forexSSI.model';

const router: Router = express.Router();

// Get all SSI records (with assetClass filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetClass, search, currencyPair } = req.query;
    let data = [];
    if (assetClass === 'equity') {
      const query: any = {};
      if (search) query.ClientID = { $regex: search, $options: 'i' };
      data = await EquitySSI.find(query).sort({ ClientID: -1 });
    } else if (assetClass === 'forex') {
      const query: any = {};
      if (search) query.ClientID = { $regex: search, $options: 'i' };
      if (currencyPair) query.CurrencyPair = { $regex: currencyPair, $options: 'i' };
      data = await ForexSSI.find(query).sort({ ClientID: -1 });
    }
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add new SSI record
router.post('/', async (req: Request, res: Response) => {
  try {
    const { assetClass, ...payload } = req.body;
    let newRecord;
    if (assetClass === 'equity') {
      // Currency-specific validation and defaults
      const currency = payload.SettlementCurrency;
      const requiredFields: string[] = [];
      const optionalFields: string[] = [];
      switch (currency) {
        case 'USD':
          requiredFields.push('aba_routing_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'AUD':
          requiredFields.push('bsb_code');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'JPY':
          optionalFields.push('zengin_code');
          requiredFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'EUR':
          requiredFields.push('iban', 'swift_bic_code', 'beneficiary_name');
          optionalFields.push('account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'GBP':
          requiredFields.push('sort_code');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
      }
      // Validate required fields
      for (const field of requiredFields) {
        if (!payload[field] || payload[field] === '') {
          return res.status(400).json({ message: `Missing required field for ${currency}: ${field}` });
        }
      }
      // Set 'N/A' for empty optional fields
      for (const field of optionalFields) {
        if (!payload[field] || payload[field] === '') {
          payload[field] = 'N/A';
        }
      }
      // Also set 'N/A' for account_number for EUR if not provided
      if (currency === 'EUR' && (!payload.account_number || payload.account_number === '')) {
        payload.account_number = 'N/A';
      }
      newRecord = new EquitySSI(payload);
      await newRecord.save();
    } else if (assetClass === 'forex') {
      // Currency-specific validation and defaults for Forex
      const currency = payload.SettlementCurrency;
      const requiredFields = [];
      const optionalFields = [];
      switch (currency) {
        case 'USD':
          requiredFields.push('aba_routing_number', 'account_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'AUD':
          requiredFields.push('bsb_code', 'account_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'JPY':
          requiredFields.push('swift_bic_code', 'account_number');
          optionalFields.push('zengin_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'EUR':
          requiredFields.push('iban');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'GBP':
          requiredFields.push('sort_code', 'account_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
      }
      // Validate required fields
      for (const field of requiredFields) {
        if (!payload[field] || payload[field] === '') {
          return res.status(400).json({ message: `Missing required field for ${currency}: ${field}` });
        }
      }
      // Set 'N/A' for empty optional fields
      for (const field of optionalFields) {
        if (!payload[field] || payload[field] === '') {
          payload[field] = 'N/A';
        }
      }
      // Also set 'N/A' for account_number for EUR if not provided
      if (currency === 'EUR' && (!payload.account_number || payload.account_number === '')) {
        payload.account_number = 'N/A';
      }
      newRecord = new ForexSSI(payload);
      await newRecord.save();
    } else {
      return res.status(400).json({ message: 'Invalid asset class' });
    }
    res.status(201).json(newRecord);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update SSI record
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { assetClass, editNote, ...payload } = req.body;
    let updatedRecord;
    let originalRecord;
    let changes = {};
    if (assetClass === 'equity') {
      // Currency-specific validation and defaults
      const currency = payload.SettlementCurrency;
      const requiredFields: string[] = [];
      const optionalFields: string[] = [];
      switch (currency) {
        case 'USD':
          requiredFields.push('aba_routing_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'AUD':
          requiredFields.push('bsb_code');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'JPY':
          optionalFields.push('zengin_code');
          requiredFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'EUR':
          requiredFields.push('iban', 'swift_bic_code', 'beneficiary_name');
          optionalFields.push('account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'GBP':
          requiredFields.push('sort_code');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
      }
      // Validate required fields
      for (const field of requiredFields) {
        if (!payload[field] || payload[field] === '') {
          return res.status(400).json({ message: `Missing required field for ${currency}: ${field}` });
        }
      }
      // Set 'N/A' for empty optional fields
      for (const field of optionalFields) {
        if (!payload[field] || payload[field] === '') {
          payload[field] = 'N/A';
        }
      }
      // Also set 'N/A' for account_number for EUR if not provided
      if (currency === 'EUR' && (!payload.account_number || payload.account_number === '')) {
        payload.account_number = 'N/A';
      }
      originalRecord = await EquitySSI.findById(req.params.id);
      updatedRecord = await EquitySSI.findByIdAndUpdate(req.params.id, { ...payload, editNote }, { new: true });
      if (originalRecord && updatedRecord) {
        changes = {};
        Object.keys(payload).forEach((key) => {
          if (originalRecord.get(key) !== updatedRecord.get(key)) {
            changes[key] = {
              old: originalRecord.get(key),
              new: updatedRecord.get(key)
            };
          }
        });
      }
    } else if (assetClass === 'forex') {
      // Currency-specific validation and defaults for Forex
      const currency = payload.SettlementCurrency;
      const requiredFields = [];
      const optionalFields = [];
      switch (currency) {
        case 'USD':
          requiredFields.push('aba_routing_number', 'account_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'AUD':
          requiredFields.push('bsb_code', 'account_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'JPY':
          requiredFields.push('swift_bic_code', 'account_number');
          optionalFields.push('zengin_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'EUR':
          requiredFields.push('iban');
          optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
          payload.settlement_method = payload.settlement_method || '';
          break;
        case 'GBP':
          requiredFields.push('sort_code', 'account_number');
          optionalFields.push('swift_bic_code', 'beneficiary_name');
          payload.settlement_method = payload.settlement_method || '';
          break;
      }
      // Validate required fields
      for (const field of requiredFields) {
        if (!payload[field] || payload[field] === '') {
          return res.status(400).json({ message: `Missing required field for ${currency}: ${field}` });
        }
      }
      // Set 'N/A' for empty optional fields
      for (const field of optionalFields) {
        if (!payload[field] || payload[field] === '') {
          payload[field] = 'N/A';
        }
      }
      // Also set 'N/A' for account_number for EUR if not provided
      if (currency === 'EUR' && (!payload.account_number || payload.account_number === '')) {
        payload.account_number = 'N/A';
      }
      originalRecord = await ForexSSI.findById(req.params.id);
      updatedRecord = await ForexSSI.findByIdAndUpdate(req.params.id, { ...payload, editNote }, { new: true });
      if (originalRecord && updatedRecord) {
        changes = {};
        Object.keys(payload).forEach((key) => {
          if (originalRecord.get(key) !== updatedRecord.get(key)) {
            changes[key] = {
              old: originalRecord.get(key),
              new: updatedRecord.get(key)
            };
          }
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid asset class' });
    }
    res.json(updatedRecord);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete SSI record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { assetClass } = req.query;
    let deletedRecord;
    if (assetClass === 'equity') {
      deletedRecord = await EquitySSI.findByIdAndDelete(req.params.id);
    } else if (assetClass === 'forex') {
      deletedRecord = await ForexSSI.findByIdAndDelete(req.params.id);
    } else {
      return res.status(400).json({ message: 'Invalid asset class' });
    }
    res.json(deletedRecord);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 