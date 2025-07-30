"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const csv_parse_1 = require("csv-parse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const instrument_model_1 = __importDefault(require("../models/instrument.model"));
const router = express_1.default.Router();
// Multer configuration for file upload
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// Get all instruments
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instruments = yield instrument_model_1.default.find();
        res.json(instruments);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
// Create a new instrument
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const instrument = new instrument_model_1.default(req.body);
    try {
        const newInstrument = yield instrument.save();
        res.status(201).json(newInstrument);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
}));
// Import CSV file
router.post('/import', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const results = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parse_1.parse)({ columns: true, trim: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Transform CSV data to match our schema
                const transformedData = results.map(row => {
                    const instrument = {
                        assetClass: row.assetClass || row.AssetClass || 'General',
                    };
                    // Map general fields
                    if (row.ISIN)
                        instrument.ISIN = row.ISIN;
                    if (row.instrumentName)
                        instrument.instrumentName = row.instrumentName;
                    if (row.issuer)
                        instrument.issuer = row.issuer;
                    if (row.sector)
                        instrument.sector = row.sector;
                    if (row.country)
                        instrument.country = row.country;
                    if (row.currency)
                        instrument.currency = row.currency;
                    if (row.pricingSource)
                        instrument.pricingSource = row.pricingSource;
                    // Map Equity specific fields
                    if (row.Symbol || row.symbol)
                        instrument.Symbol = row.Symbol || row.symbol;
                    if (row.ClientID || row.clientId)
                        instrument.ClientID = row.ClientID || row.clientId;
                    if (row.Counterparty || row.counterparty)
                        instrument.Counterparty = row.Counterparty || row.counterparty;
                    if (row.TradingVenue || row.tradingVenue)
                        instrument.TradingVenue = row.TradingVenue || row.tradingVenue;
                    if (row.Currency || row.currency)
                        instrument.Currency = row.Currency || row.currency;
                    if (row.CountryOfTrade || row.countryOfTrade)
                        instrument.CountryOfTrade = row.CountryOfTrade || row.countryOfTrade;
                    if (row.KYCStatus || row.kycStatus)
                        instrument.KYCStatus = row.KYCStatus || row.kycStatus;
                    if (row.ReferenceDataValidated || row.referenceDataValidated)
                        instrument.Validated = (row.ReferenceDataValidated || row.referenceDataValidated) === 'true';
                    if (row.CollateralRequired || row.collateralRequired)
                        instrument.Collateral = parseFloat(row.CollateralRequired || row.collateralRequired);
                    if (row.TypeMargin || row.marginType)
                        instrument.TypeMargin = row.TypeMargin || row.marginType;
                    if (row.Status || row.marginStatus)
                        instrument.Status = row.Status || row.marginStatus;
                    if (row.FXRateApplied || row.fxRateApplied)
                        instrument.FXRateApplied = parseFloat(row.FXRateApplied || row.fxRateApplied);
                    if (row.PricingSource || row.pricingSource)
                        instrument.PricingSource = row.PricingSource || row.pricingSource;
                    // Map Forex specific fields
                    if (row.currencyPair)
                        instrument.currencyPair = row.currencyPair;
                    if (row.baseCurrency)
                        instrument.baseCurrency = row.baseCurrency;
                    if (row.termCurrency)
                        instrument.termCurrency = row.termCurrency;
                    if (row.executionVenue)
                        instrument.executionVenue = row.executionVenue;
                    if (row.productType)
                        instrument.productType = row.productType;
                    if (row.bookingLocation)
                        instrument.bookingLocation = row.bookingLocation;
                    if (row.portfolio)
                        instrument.portfolio = row.portfolio;
                    if (row.tradeSourceSystem)
                        instrument.tradeSourceSystem = row.tradeSourceSystem;
                    if (row.custodian)
                        instrument.custodian = row.custodian;
                    if (row.settlementInstructions)
                        instrument.settlementInstructions = row.settlementInstructions;
                    if (row.nettingEligibility)
                        instrument.nettingEligibility = row.nettingEligibility === 'true';
                    if (row.sanctionsScreening)
                        instrument.sanctionsScreening = row.sanctionsScreening;
                    if (row.settlementCurrency)
                        instrument.settlementCurrency = row.settlementCurrency;
                    if (row.costCenter)
                        instrument.costCenter = row.costCenter;
                    if (row.expenseApprovalStatus)
                        instrument.expenseApprovalStatus = row.expenseApprovalStatus;
                    return instrument;
                });
                const importedData = yield instrument_model_1.default.insertMany(transformedData);
                fs_1.default.unlinkSync(req.file.path); // Clean up uploaded file
                res.json({
                    message: 'CSV data imported successfully',
                    count: importedData.length,
                });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        }))
            .on('error', (error) => {
            res.status(400).json({ message: error.message });
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
}));
// Update an instrument
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedInstrument = yield instrument_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedInstrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }
        res.json(updatedInstrument);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'An unknown error occurred' });
        }
    }
}));
// Delete an instrument
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instrument = yield instrument_model_1.default.findByIdAndDelete(req.params.id);
        if (!instrument) {
            return res.status(404).json({ message: 'Instrument not found' });
        }
        res.json({ message: 'Instrument deleted' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
// Download equity instruments as CSV
router.get('/equity/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.query;
        // Build filter query
        const filter = { assetClass: 'Equity' };
        if (searchTerm) {
            filter.$or = [
                { ISIN: new RegExp(String(searchTerm), 'i') },
                { instrumentName: new RegExp(String(searchTerm), 'i') },
                { tradingVenue: new RegExp(String(searchTerm), 'i') },
                { symbol: new RegExp(String(searchTerm), 'i') },
                { Symbol: new RegExp(String(searchTerm), 'i') }
            ];
        }
        const instruments = yield instrument_model_1.default.find(filter);
        // Convert to CSV with symbol included
        const csvHeader = 'Symbol,ISIN,Instrument Name,Trading Venue,Currency,Country,Pricing Source,Sector,Issuer\n';
        const csvRows = instruments.map(instrument => {
            const symbol = instrument.symbol || instrument.Symbol || '';
            return `${symbol},${instrument.ISIN || ''},${instrument.instrumentName || ''},${instrument.tradingVenue || ''},${instrument.currency || ''},${instrument.country || ''},${instrument.pricingSource || ''},${instrument.sector || ''},${instrument.issuer || ''}`;
        }).join('\n');
        const csvContent = csvHeader + csvRows;
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=equity_instruments.csv');
        res.send(csvContent);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Download forex instruments as CSV
router.get('/forex/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.query;
        // Build filter query
        const filter = { assetClass: 'Forex' };
        if (searchTerm) {
            filter.$or = [
                { currencyPair: new RegExp(String(searchTerm), 'i') },
                { baseCurrency: new RegExp(String(searchTerm), 'i') },
                { termCurrency: new RegExp(String(searchTerm), 'i') },
                { symbol: new RegExp(String(searchTerm), 'i') },
                { Symbol: new RegExp(String(searchTerm), 'i') }
            ];
        }
        const instruments = yield instrument_model_1.default.find(filter);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
