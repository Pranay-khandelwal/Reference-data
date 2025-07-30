"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const equitySSISchema = new mongoose_1.default.Schema({
    ClientID: { type: String, required: true },
    Counterparty: { type: String, required: true },
    CustodianName: { type: String, required: true },
    CustodianAccountNo: { type: String, required: true },
    BeneficiaryClientID: { type: String, required: true },
    SettlementCycle: { type: String, required: true },
    SettlementCurrency: { type: String, required: true },
    SettlementDate: { type: Date, required: true },
    SSIStatus: { type: String, required: true },
    MarginType: { type: String, required: true },
    MarginStatus: { type: String, required: true },
    editNote: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
equitySSISchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const EquitySSI = mongoose_1.default.model('EquitySSI', equitySSISchema, 'equitySSIs');
exports.default = EquitySSI;
