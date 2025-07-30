"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const equityInstrumentSchema = new mongoose_1.default.Schema({
    ISIN: {
        type: String,
        required: true,
    },
    Symbol: {
        type: String,
        required: true,
    },
    TradingVenue: {
        type: String,
        required: true,
    },
    Currency: {
        type: String,
        required: true,
    },
    CountryOfTrade: {
        type: String,
        required: true,
    },
    FXRateApplied: {
        type: Number,
        required: true,
    },
    PricingSource: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
equityInstrumentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const EquityInstrument = mongoose_1.default.model('EquityInstrument', equityInstrumentSchema, 'equityInstruments');
exports.default = EquityInstrument;
