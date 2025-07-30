"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const forexClientSchema = new mongoose_1.default.Schema({
    ClientID: {
        type: String,
        required: true,
    },
    CurrencyPair: {
        type: String,
        required: true,
    },
    Counterparty: {
        type: String,
        required: true,
    },
    BookingLocation: {
        type: String,
        required: true,
    },
    Portfolio: {
        type: String,
        required: true,
    },
    Custodian: {
        type: String,
        required: true,
    },
    NettingEligibility: {
        type: String,
        required: true,
    },
    KYCStatus: {
        type: String,
        required: true,
    },
    SanctionsScreening: {
        type: String,
        required: true,
    },
    ExpenseApprovalStatus: {
        type: String,
        required: true,
    },
    SettlementStatus: {
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
forexClientSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const ForexClient = mongoose_1.default.model('ForexClient', forexClientSchema, 'forexClients');
exports.default = ForexClient;
