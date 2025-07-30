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
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const equity_routes_1 = __importDefault(require("./routes/equity.routes"));
const forex_routes_1 = __importDefault(require("./routes/forex.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const instrument_routes_1 = __importDefault(require("./routes/instrument.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const price_routes_1 = __importDefault(require("./routes/price.routes"));
const ssi_routes_1 = __importDefault(require("./routes/ssi.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Configure CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Connect to MongoDB databases
const connectToMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reference-data';
        yield mongoose_1.default.connect(mongoURI);
        console.log('Connected to MongoDB database');
    }
    catch (err) {
        console.error('Could not connect to MongoDB:', err);
        process.exit(1); // Exit if we can't connect to MongoDB
    }
});
// Connect to MongoDB before starting the server
connectToMongoDB().then(() => {
    // Routes
    app.use('/api/notifications', notifications_routes_1.default);
    app.use('/api/equity', equity_routes_1.default);
    app.use('/api/forex', forex_routes_1.default);
    app.use('/api/clients', client_routes_1.default);
    app.use('/api/instruments', instrument_routes_1.default);
    app.use('/api/audit', audit_routes_1.default);
    app.use('/api/prices', price_routes_1.default);
    app.use('/api/ssi', ssi_routes_1.default);
    // Start server
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!', details: err.message });
};
// Use error handling middleware
app.use(errorHandler);
