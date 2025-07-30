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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const equity_model_1 = __importDefault(require("../models/equity.model"));
const audit_model_1 = __importDefault(require("../models/audit.model"));
const router = express_1.default.Router();
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
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
// Get all equity instruments
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('GET /api/equity - Fetching all equity instruments');
    try {
        const instruments = yield equity_model_1.default.find();
        console.log(`Found ${instruments.length} equity instruments`);
        res.json(instruments);
    }
    catch (error) {
        console.error('Error fetching equity instruments:', error);
        res.status(500).json({
            message: 'Error fetching equity instruments',
            error: error.message
        });
    }
}));
// Create a new equity instrument
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('POST /api/equity - Creating new equity instrument');
    try {
        const instrument = new equity_model_1.default(req.body);
        const savedInstrument = yield instrument.save();
        console.log('Created equity instrument:', savedInstrument._id);
        // Audit log for creation
        const audit = new audit_model_1.default({
            user: 'Kshitij Kadam',
            action: 'Add Equity Instrument',
            instrumentType: 'Equity',
            editNote: `The instrument ${savedInstrument.Symbol} was added.`,
            changes: savedInstrument.toObject()
        });
        yield audit.save();
        res.status(201).json(savedInstrument);
    }
    catch (error) {
        console.error('Error creating equity instrument:', error);
        res.status(400).json({
            message: 'Error creating equity instrument',
            error: error.message
        });
    }
}));
// Import CSV file
router.post('/import', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('POST /api/equity/import - Importing CSV file');
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log('Processing file:', req.file.originalname);
        const results = [];
        let rowCount = 0;
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parse_1.parse)({
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
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`Finished reading CSV. Processing ${results.length} rows.`);
                // Transform CSV data to match our schema
                const transformedData = results.map((row, index) => {
                    console.log(`Transforming row ${index + 1}:`, row);
                    return {
                        ISIN: row.ISIN || '',
                        Symbol: row.Symbol || '',
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
                        Status: row['Margin Status'] || '',
                        FXRateApplied: parseFloat(row['FX Rate Applied'] || '0'),
                        PricingSource: row['Pricing Source'] || ''
                    };
                });
                console.log('Inserting data into MongoDB...');
                const importedData = yield equity_model_1.default.insertMany(transformedData, { ordered: false });
                console.log(`Successfully imported ${importedData.length} records.`);
                // Clean up uploaded file
                fs_1.default.unlinkSync(req.file.path);
                res.json({
                    message: 'CSV data imported successfully',
                    count: importedData.length,
                    totalRows: results.length
                });
            }
            catch (error) {
                console.error('Error processing CSV data:', error);
                // Clean up uploaded file in case of error
                if (fs_1.default.existsSync(req.file.path)) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                res.status(400).json({
                    message: 'Error processing CSV data',
                    error: error.message,
                    details: error.errors || {}
                });
            }
        }))
            .on('error', (error) => {
            console.error('Error reading CSV file:', error);
            // Clean up uploaded file in case of error
            if (fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            res.status(400).json({
                message: 'Error reading CSV file',
                error: error.message
            });
        });
    }
    catch (error) {
        console.error('Unexpected error during file upload:', error);
        // Clean up uploaded file in case of error
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        if (error instanceof Error) {
            res.status(400).json({
                message: 'Error uploading file',
                error: error.message
            });
        }
        else {
            res.status(400).json({
                message: 'An unknown error occurred during file upload'
            });
        }
    }
}));
// Update an equity instrument
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { editNote } = _a, updateData = __rest(_a, ["editNote"]);
        if (!editNote) {
            return res.status(400).json({ message: 'Edit note is required' });
        }
        const originalInstrument = yield equity_model_1.default.findById(req.params.id);
        if (!originalInstrument) {
            return res.status(404).json({ message: 'Equity instrument not found' });
        }
        const updatedInstrument = yield equity_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedInstrument) {
            // This case should ideally not be hit if originalInstrument was found, but it's good practice
            return res.status(404).json({ message: 'Equity instrument not found' });
        }
        // Create an audit log
        const changes = {};
        for (const key in updateData) {
            if (JSON.stringify(originalInstrument.get(key)) !== JSON.stringify(updatedInstrument.get(key))) {
                changes[key] = {
                    old: originalInstrument.get(key),
                    new: updatedInstrument.get(key)
                };
            }
        }
        const audit = new audit_model_1.default({
            user: 'Kshitij Kadam',
            action: 'Update Equity Instrument',
            instrumentType: 'Equity',
            editNote: editNote,
            changes: changes
        });
        yield audit.save();
        res.json(updatedInstrument);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete an equity instrument
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedInstrument = yield equity_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedInstrument) {
            return res.status(404).json({ message: 'Equity instrument not found' });
        }
        const audit = new audit_model_1.default({
            user: 'Kshitij Kadam',
            action: 'Delete Equity Instrument',
            instrumentType: 'Equity',
            editNote: `The ${deletedInstrument.Symbol} has been deleted.`,
            changes: deletedInstrument.toObject() // Log the deleted document
        });
        yield audit.save();
        res.json({ message: 'Equity instrument deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Clear all equity instruments
router.delete('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield equity_model_1.default.deleteMany({});
        res.json({ message: 'All equity instruments cleared' });
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
// Get recent equity instruments
router.get('/recent', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('GET /api/equity/recent - Fetching recent equity instruments');
    try {
        const instruments = yield equity_model_1.default.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select('_id ISIN Symbol Currency');
        // Generate RID for each instrument (Symbol + first 5 characters of ISIN)
        const instrumentsWithRID = instruments.map(instrument => ({
            _id: instrument._id,
            RID: `${instrument.Symbol}_${instrument.ISIN.substring(0, 5)}`,
            ISIN: instrument.ISIN,
            Symbol: instrument.Symbol,
            Currency: instrument.Currency
        }));
        console.log(`Found ${instrumentsWithRID.length} recent equity instruments`);
        res.json(instrumentsWithRID);
    }
    catch (error) {
        console.error('Error fetching recent equity instruments:', error);
        res.status(500).json({
            message: 'Error fetching recent equity instruments',
            error: error.message
        });
    }
}));
// Download equity instruments as CSV
router.get('/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.query;
        // Build filter query
        const filter = {};
        if (searchTerm) {
            filter.$or = [
                { ISIN: new RegExp(String(searchTerm), 'i') },
                { Symbol: new RegExp(String(searchTerm), 'i') },
                { TradingVenue: new RegExp(String(searchTerm), 'i') },
                { ClientID: new RegExp(String(searchTerm), 'i') },
                { Counterparty: new RegExp(String(searchTerm), 'i') }
            ];
        }
        const instruments = yield equity_model_1.default.find(filter);
        // Convert to CSV
        const csvHeader = 'ISIN,Symbol,Client ID,Counterparty,Trading Venue,Currency,Country of Trade,KYC Status,Reference Data Validated,Collateral Required,Margin Type,Margin Status,FX Rate Applied,Pricing Source\n';
        const csvRows = instruments.map(instrument => {
            return `${instrument.ISIN || ''},${instrument.Symbol || ''},${instrument.ClientID || ''},${instrument.Counterparty || ''},${instrument.TradingVenue || ''},${instrument.Currency || ''},${instrument.CountryOfTrade || ''},${instrument.KYCStatus || ''},${instrument.Validated || false},${instrument.Collateral || 0},${instrument.TypeMargin || ''},${instrument.Status || ''},${instrument.FXRateApplied || 0},${instrument.PricingSource || ''}`;
        }).join('\n');
        const csvContent = csvHeader + csvRows;
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=equity_instruments.csv');
        res.send(csvContent);
    }
    catch (error) {
        console.error('Error downloading equity instruments:', error);
        res.status(500).json({
            message: 'Error downloading equity instruments',
            error: error.message
        });
    }
}));
exports.default = router;
