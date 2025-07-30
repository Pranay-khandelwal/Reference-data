"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const forexSchema = new mongoose_1.default.Schema({
    CurrencyPair: {
        type: String,
        required: true,
    },
    Counterparty: {
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
    BookingLocation: {
        type: String,
        required: false,
    },
    Portfolio: {
        type: String,
        required: false,
    },
    TradeSourceSystem: {
        type: String,
        required: false,
    },
    Custodian: {
        type: String,
        required: false,
    },
    SettlementInstructions: {
        type: String,
        required: false,
    },
    NettingEligibility: {
        type: Boolean,
        required: false,
        default: false,
    },
    KYCStatus: {
        type: String,
        required: false,
    },
    SanctionsScreening: {
        type: String,
        required: false,
    },
    CostCenter: {
        type: String,
        required: false,
    },
    ExpenseApprovalStatus: {
        type: String,
        required: false,
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
forexSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Forex = mongoose_1.default.model('Forex', forexSchema, 'forex');
exports.default = Forex;
