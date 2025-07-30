"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const forexInstrumentSchema = new mongoose_1.default.Schema({
    CurrencyPair: {
        type: String,
        required: true,
    },
    BaseCurrency: {
        type: String,
        required: true,
    },
    TermCurrency: {
        type: String,
        required: true,
    },
    ExecutionVenue: {
        type: String,
        required: true,
    },
    ProductType: {
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
forexInstrumentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const ForexInstrument = mongoose_1.default.model('ForexInstrument', forexInstrumentSchema, 'forexInstruments');
exports.default = ForexInstrument;
