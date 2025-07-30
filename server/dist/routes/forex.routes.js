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
const forex_model_1 = __importDefault(require("../models/forex.model"));
const audit_model_1 = __importDefault(require("../models/audit.model"));
const notifications_model_1 = __importDefault(require("../models/notifications.model"));
const router = express_1.default.Router();
// Configure multer for file upload to ensure the uploads directory exists
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${sanitizedFilename}`);
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});
// Get all forex instruments
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instruments = yield forex_model_1.default.find();
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
// Create a new forex instrument
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const instrument = new forex_model_1.default(req.body);
    try {
        const newInstrument = yield instrument.save();
        // Audit log for creation
        const audit = new audit_model_1.default({
            user: 'Kshitij Kadam',
            action: 'Add Forex Instrument',
            instrumentType: 'Forex',
            editNote: `The instrument ${newInstrument.CurrencyPair} was added.`,
            changes: newInstrument.toObject()
        });
        yield audit.save();
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
// Import forex data from CSV
router.post('/import', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const results = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parse_1.parse)({ columns: true, trim: true }))
            .on('data', (data) => {
            console.log('Raw CSV row:', data); // Debug log
            results.push(data);
        })
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
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
                yield forex_model_1.default.insertMany(transformedData);
                // Create a notification for successful import
                const notification = new notifications_model_1.default({
                    type: 'success',
                    message: `Successfully imported ${transformedData.length} forex records`,
                    details: {
                        recordCount: transformedData.length,
                        fileName: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname
                    }
                });
                yield notification.save();
                res.json({
                    message: 'Data imported successfully',
                    count: transformedData.length
                });
            }
            catch (error) {
                console.error('Error in import route:', error);
                res.status(500).json({ message: 'Error importing data', error: error });
            }
        }));
    }
    catch (error) {
        console.error('Error in import route:', error);
        res.status(500).json({ message: 'Error importing data', error: error });
    }
}));
// Update a forex instrument
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = req.body, { editNote } = _b, updateData = __rest(_b, ["editNote"]);
        if (!editNote) {
            return res.status(400).json({ message: 'Edit note is required' });
        }
        const originalInstrument = yield forex_model_1.default.findById(req.params.id);
        if (!originalInstrument) {
            return res.status(404).json({ message: 'Forex instrument not found' });
        }
        const updatedForex = yield forex_model_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedForex) {
            return res.status(404).json({ message: 'Forex instrument not found' });
        }
        // Create an audit log
        const changes = {};
        for (const key in updateData) {
            if (JSON.stringify(originalInstrument.get(key)) !== JSON.stringify(updatedForex.get(key))) {
                changes[key] = {
                    old: originalInstrument.get(key),
                    new: updatedForex.get(key)
                };
            }
        }
        const audit = new audit_model_1.default({
            user: 'Kshitij Kadam',
            action: 'Update Forex Instrument',
            instrumentType: 'Forex',
            editNote: editNote,
            changes: changes
        });
        yield audit.save();
        res.json(updatedForex);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Delete a forex instrument
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instrument = yield forex_model_1.default.findByIdAndDelete(req.params.id);
        if (!instrument) {
            return res.status(404).json({ message: 'Forex instrument not found' });
        }
        const audit = new audit_model_1.default({
            user: 'Kshitij Kadam',
            action: 'Delete Forex Instrument',
            instrumentType: 'Forex',
            editNote: `The ${instrument.CurrencyPair} has been deleted.`,
            changes: instrument.toObject() // Log the deleted document
        });
        yield audit.save();
        res.json({ message: 'Forex instrument deleted' });
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
// Clear all forex instruments
router.delete('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield forex_model_1.default.deleteMany({});
        res.json({ message: 'All forex instruments cleared' });
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
// Download forex instruments as CSV
router.get('/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm } = req.query;
        // Build filter query
        const filter = {};
        if (searchTerm) {
            filter.$or = [
                { CurrencyPair: new RegExp(String(searchTerm), 'i') },
                { BaseCurrency: new RegExp(String(searchTerm), 'i') },
                { TermCurrency: new RegExp(String(searchTerm), 'i') },
                { ExecutionVenue: new RegExp(String(searchTerm), 'i') },
                { ProductType: new RegExp(String(searchTerm), 'i') }
            ];
        }
        const instruments = yield forex_model_1.default.find(filter);
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
    }
    catch (error) {
        console.error('Error downloading forex instruments:', error);
        res.status(500).json({
            message: 'Error downloading forex instruments',
            error: error.message
        });
    }
}));
exports.default = router;
