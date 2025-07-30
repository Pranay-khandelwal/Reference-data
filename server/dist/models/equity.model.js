"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const EquitySchema = new mongoose_1.Schema({
    ISIN: { type: String, required: true },
    Symbol: { type: String, required: true },
    TradingVenue: { type: String, required: true },
    Currency: { type: String, required: true },
    CountryOfTrade: { type: String, required: true },
    FXRateApplied: { type: Number, required: true },
    PricingSource: { type: String, required: true },
    // The following fields are now optional
    ClientID: { type: String, required: false },
    Counterparty: { type: String, required: false },
    KYCStatus: { type: String, required: false },
    ReferenceData: {
        validated: { type: Boolean, default: false }
    },
    Validated: { type: Boolean, default: false },
    Collateral: { type: Number, default: 0 },
    RequiredMargin: { type: Number, default: 0 },
    TypeMargin: { type: String },
    Status: { type: String },
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Equity', EquitySchema);
