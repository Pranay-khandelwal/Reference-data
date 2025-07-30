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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const csv_parse_1 = require("csv-parse");
const fs_1 = __importDefault(require("fs"));
const price_model_1 = __importDefault(require("../models/price.model"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'server/uploads/' });
// Get all prices (most recent for each unique symbol)
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prices = yield price_model_1.default.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$symbol",
                    doc: { $first: "$$ROOT" } // Get the first document (most recent)
                }
            },
            { $replaceRoot: { newRoot: "$doc" } },
            { $sort: { symbol: 1 } } // Optional: sort alphabetically by symbol
        ]);
        res.json(prices);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching prices',
            error: error.message,
        });
    }
}));
// Add a new price (symbol)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, open = 0, high = 0, low = 0, close = 0, volume = 0, date } = req.body;
        const newPrice = new price_model_1.default({
            symbol,
            open,
            high,
            low,
            close,
            volume,
            date: date ? new Date(date) : new Date()
        });
        yield newPrice.save();
        res.status(201).json(newPrice);
    }
    catch (error) {
        res.status(400).json({
            message: 'Error creating price',
            error: error.message,
        });
    }
}));
// Delete price by id
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield price_model_1.default.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Price not found' });
        }
        res.json({ message: 'Price deleted', id });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error deleting price',
            error: error.message,
        });
    }
}));
// Delete all price history for a symbol
router.delete('/history/:symbol', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol } = req.params;
        const result = yield price_model_1.default.deleteMany({ symbol });
        res.json({ message: `${result.deletedCount} records deleted for symbol ${symbol}.` });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error deleting price history',
            error: error.message,
        });
    }
}));
// Get all historical prices for a symbol
router.get('/history/:symbol', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol } = req.params;
        const history = yield price_model_1.default.find({ symbol }).sort({ date: 1 });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching price history', error: error.message });
    }
}));
// Upload historical price data for a symbol via CSV
router.post('/upload/:symbol', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { symbol } = req.params;
    if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });
    const results = [];
    fs_1.default.createReadStream(req.file.path)
        .pipe((0, csv_parse_1.parse)({ columns: true, trim: true }))
        .on('data', (row) => results.push(row))
        .on('end', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Strict validation: only insert rows with all valid numbers and date
            const docs = results
                .map(row => {
                // Parse date in DD-MM-YYYY, DD/MM/YYYY, or with time
                let date;
                if (row.Date.includes('/')) {
                    // Format: DD/MM/YYYY or DD/MM/YYYY HH:mm:ss
                    const [d, m, y] = row.Date.split(/[ /:]/);
                    date = new Date(`${y}-${m}-${d}`);
                }
                else if (row.Date.includes('-')) {
                    // Format: DD-MM-YYYY or DD-MM-YYYY HH:mm:ss
                    const [d, m, y] = row.Date.split(/[- :]/);
                    date = new Date(`${y}-${m}-${d}`);
                }
                else {
                    date = new Date(row.Date);
                }
                if (!row.Date ||
                    isNaN(date.getTime()) ||
                    isNaN(parseFloat(row.Open)) ||
                    isNaN(parseFloat(row.High)) ||
                    isNaN(parseFloat(row.Low)) ||
                    isNaN(parseFloat(row.Close)) ||
                    isNaN(parseInt(row.Volume, 10))) {
                    return null;
                }
                return {
                    symbol,
                    date,
                    open: parseFloat(row.Open),
                    high: parseFloat(row.High),
                    low: parseFloat(row.Low),
                    close: parseFloat(row.Close),
                    volume: parseInt(row.Volume, 10)
                };
            })
                .filter(Boolean);
            if (docs.length === 0) {
                return res.status(400).json({ message: 'No valid rows found in CSV. Please check your file format.' });
            }
            yield price_model_1.default.insertMany(docs);
            res.json({ message: 'Data uploaded', count: docs.length });
        }
        catch (err) {
            console.error('Error saving price data:', err);
            res.status(500).json({ message: 'Error saving data', error: err });
        }
    }))
        .on('error', (err) => {
        console.error('Error reading CSV file:', err);
        res.status(400).json({ message: 'Error reading CSV file', error: err });
    });
}));
exports.default = router;
