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
const equityClient_model_1 = __importDefault(require("../models/equityClient.model"));
const forexClient_model_1 = __importDefault(require("../models/forexClient.model"));
const notifications_model_1 = __importDefault(require("../models/notifications.model"));
const audit_model_1 = __importDefault(require("../models/audit.model"));
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
// Import equity client data from CSV
router.post('/equity/import', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const results = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parse_1.parse)({ columns: true, trim: true }))
            .on('data', (data) => {
            console.log('Raw CSV row:', data);
            results.push(data);
        })
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
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
                    SettlementStatus: row.SettlementStatus || row['Settlement Status'] || ''
                }));
                if (transformedData.length > 0) {
                    console.log('First transformed row:', transformedData[0]);
                }
                yield equityClient_model_1.default.insertMany(transformedData);
                // Audit log for each new equity client
                for (const client of transformedData) {
                    const audit = new audit_model_1.default({
                        user: 'Kshitij Kadam',
                        action: 'Add Equity Client',
                        instrumentType: 'EquityClient',
                        editNote: `The client ${client.ClientID || client.Counterparty} was added via CSV import.`,
                        changes: client
                    });
                    yield audit.save();
                }
                // Create a notification for successful import
                const notification = new notifications_model_1.default({
                    type: 'success',
                    message: `Successfully imported ${transformedData.length} equity client records`,
                    details: {
                        recordCount: transformedData.length,
                        fileName: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname
                    }
                });
                yield notification.save();
                res.json({
                    message: 'Equity client data imported successfully',
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
// Import forex client data from CSV
router.post('/forex/import', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const results = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parse_1.parse)({ columns: true, trim: true }))
            .on('data', (data) => {
            console.log('Raw CSV row:', data);
            results.push(data);
        })
            .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            try {
                if (results.length > 0) {
                    console.log('First row from CSV:', results[0]);
                }
                const transformedData = results.map(row => ({
                    ClientID: row.ClientID || row['Client ID'] || '',
                    CurrencyPair: row.CurrencyPair || row['Currency Pair'] || '',
                    Counterparty: row.Counterparty || '',
                    BookingLocation: row.BookingLocation || row['Booking Location'] || '',
                    Portfolio: row.Portfolio || '',
                    Custodian: row.Custodian || '',
                    NettingEligibility: row.NettingEligibility || row['Netting Eligibility'] || '',
                    KYCStatus: row.KYCStatus || row['KYC Status'] || '',
                    SanctionsScreening: row.SanctionsScreening || row['Sanctions Screening'] || '',
                    ExpenseApprovalStatus: row.ExpenseApprovalStatus || row['Expense Approval Status'] || '',
                    SettlementStatus: row.SettlementStatus || row['Settlement Status'] || ''
                }));
                if (transformedData.length > 0) {
                    console.log('First transformed row:', transformedData[0]);
                }
                yield forexClient_model_1.default.insertMany(transformedData);
                // Audit log for each new forex client
                for (const client of transformedData) {
                    const audit = new audit_model_1.default({
                        user: 'Kshitij Kadam',
                        action: 'Add Forex Client',
                        instrumentType: 'ForexClient',
                        editNote: `The client ${client.CurrencyPair || client.Counterparty} was added via CSV import.`,
                        changes: client
                    });
                    yield audit.save();
                }
                // Create a notification for successful import
                const notification = new notifications_model_1.default({
                    type: 'success',
                    message: `Successfully imported ${transformedData.length} forex client records`,
                    details: {
                        recordCount: transformedData.length,
                        fileName: (_b = req.file) === null || _b === void 0 ? void 0 : _b.originalname
                    }
                });
                yield notification.save();
                res.json({
                    message: 'Forex client data imported successfully',
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
// Get all equity clients
router.get('/equity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield equityClient_model_1.default.find().sort({ createdAt: -1 });
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get all forex clients
router.get('/forex', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield forexClient_model_1.default.find().sort({ createdAt: -1 });
        res.json(clients);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update equity client
router.put('/equity/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedClient = yield equityClient_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClient) {
            return res.status(404).json({ message: 'Equity client not found' });
        }
        // Create a notification for the update
        const notification = new notifications_model_1.default({
            type: 'info',
            message: `Equity client ${updatedClient.ClientID} was updated`,
            details: {
                clientType: 'equity',
                clientId: updatedClient._id,
                changes: req.body
            }
        });
        yield notification.save();
        res.json(updatedClient);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update forex client
router.put('/forex/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedClient = yield forexClient_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClient) {
            return res.status(404).json({ message: 'Forex client not found' });
        }
        // Create a notification for the update
        const notification = new notifications_model_1.default({
            type: 'info',
            message: `Forex client ${updatedClient.Counterparty} was updated`,
            details: {
                clientType: 'forex',
                clientId: updatedClient._id,
                changes: req.body
            }
        });
        yield notification.save();
        res.json(updatedClient);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Clear all equity clients
router.delete('/equity/all', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield equityClient_model_1.default.deleteMany({});
        res.json({ message: 'All equity clients deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Clear all forex clients
router.delete('/forex/all', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield forexClient_model_1.default.deleteMany({});
        res.json({ message: 'All forex clients deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Delete equity client
router.delete('/equity/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield equityClient_model_1.default.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Equity client not found' });
        }
        res.json({ message: 'Equity client deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Delete forex client
router.delete('/forex/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield forexClient_model_1.default.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Forex client not found' });
        }
        res.json({ message: 'Forex client deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Download equity clients as CSV
router.get('/equity/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm, kycFilter, settlementStatusFilter } = req.query;
        // Build filter query
        const filter = {};
        if (searchTerm) {
            filter.$or = [
                { ClientID: new RegExp(String(searchTerm), 'i') },
                { Counterparty: new RegExp(String(searchTerm), 'i') }
            ];
        }
        if (kycFilter) {
            filter.KYCStatus = new RegExp(String(kycFilter), 'i');
        }
        if (settlementStatusFilter) {
            filter.SettlementStatus = new RegExp(String(settlementStatusFilter), 'i');
        }
        const clients = yield equityClient_model_1.default.find(filter);
        // Convert to CSV
        const csvHeader = 'ClientID,Counterparty,Currency,KYCStatus,ReferenceDataValidated,MarginType,MarginStatus,SettlementDate,SettlementStatus\n';
        const csvRows = clients.map(client => {
            return `${client.ClientID},${client.Counterparty},${client.Currency},${client.KYCStatus},${client.ReferenceDataValidated},${client.MarginType},${client.MarginStatus},${client.SettlementDate},${client.SettlementStatus}`;
        }).join('\n');
        const csvContent = csvHeader + csvRows;
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=equity_clients.csv');
        res.send(csvContent);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Download forex clients as CSV
router.get('/forex/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { searchTerm, kycFilter, settlementStatusFilter } = req.query;
        // Build filter query
        const filter = {};
        if (searchTerm) {
            filter.$or = [
                { Counterparty: new RegExp(String(searchTerm), 'i') },
                { Portfolio: new RegExp(String(searchTerm), 'i') }
            ];
        }
        if (kycFilter) {
            filter.KYCStatus = new RegExp(String(kycFilter), 'i');
        }
        if (settlementStatusFilter) {
            filter.SettlementStatus = new RegExp(String(settlementStatusFilter), 'i');
        }
        const clients = yield forexClient_model_1.default.find(filter);
        // Convert to CSV
        const csvHeader = 'CurrencyPair,Counterparty,BookingLocation,Portfolio,Custodian,SettlementInstructions,NettingEligibility,KYCStatus,SanctionsScreening,SettlementCurrency,CostCenter,ExpenseApprovalStatus,SettlementDate,SettlementMethod,SettlementStatus\n';
        const csvRows = clients.map(client => {
            return `${client.CurrencyPair},${client.Counterparty},${client.BookingLocation},${client.Portfolio},${client.Custodian},${client.SettlementInstructions},${client.NettingEligibility},${client.KYCStatus},${client.SanctionsScreening},${client.SettlementCurrency},${client.CostCenter},${client.ExpenseApprovalStatus},${client.SettlementDate},${client.SettlementMethod},${client.SettlementStatus}`;
        }).join('\n');
        const csvContent = csvHeader + csvRows;
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=forex_clients.csv');
        res.send(csvContent);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
