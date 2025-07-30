"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const instrumentSchema = new mongoose_1.default.Schema({
    ISIN: {
        type: String,
        unique: true,
        sparse: true,
    },
    instrumentName: {
        type: String,
    },
    assetClass: {
        type: String,
        required: true,
        enum: ['Equity', 'Fixed Income', 'Derivatives', 'Treasury', 'Forex'],
    },
    issuer: {
        type: String,
    },
    sector: {
        type: String,
    },
    country: {
        type: String,
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'JPY'],
    },
    pricingSource: {
        type: String,
        enum: ['Bloomberg', 'Refinitiv', 'Exchange', 'Manual'],
    },
    // Equity specific fields
    symbol: {
        type: String,
    },
    clientId: {
        type: String,
    },
    counterparty: {
        type: String,
    },
    tradingVenue: {
        type: String,
    },
    countryOfTrade: {
        type: String,
    },
    kycStatus: {
        type: String,
    },
    referenceDataValidated: {
        type: Boolean,
        default: false,
    },
    collateralRequired: {
        type: Boolean,
        default: false,
    },
    marginType: {
        type: String,
    },
    marginStatus: {
        type: String,
    },
    fxRateApplied: {
        type: Number,
        default: 0,
    },
    // Forex specific fields
    currencyPair: {
        type: String,
    },
    baseCurrency: {
        type: String,
    },
    termCurrency: {
        type: String,
    },
    executionVenue: {
        type: String,
    },
    productType: {
        type: String,
    },
    bookingLocation: {
        type: String,
    },
    portfolio: {
        type: String,
    },
    tradeSourceSystem: {
        type: String,
    },
    custodian: {
        type: String,
    },
    settlementInstructions: {
        type: String,
    },
    nettingEligibility: {
        type: Boolean,
        default: false,
    },
    sanctionsScreening: {
        type: String,
    },
    settlementCurrency: {
        type: String,
    },
    costCenter: {
        type: String,
    },
    expenseApprovalStatus: {
        type: String,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Instrument', instrumentSchema);
