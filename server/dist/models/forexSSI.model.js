"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const forexSSISchema = new mongoose_1.default.Schema({
    ClientID: { type: String, required: true },
    CurrencyPair: { type: String, required: true },
    BeneficiaryBank: { type: String, required: true },
    BeneficiaryAccountNo: { type: String, required: true },
    SWIFTBIC: { type: String, required: true },
    SettlementCurrency: { type: String, required: true },
    SettlementMethod: { type: String, required: true },
    SettlementDate: { type: Date, required: true },
    SettlementInstruction: { type: String, required: true },
    SSIStatus: { type: String, required: true },
    editNote: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
forexSSISchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const ForexSSI = mongoose_1.default.model('ForexSSI', forexSSISchema, 'forexSSIs');
exports.default = ForexSSI;
