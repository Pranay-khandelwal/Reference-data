"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const equityClientSchema = new mongoose_1.default.Schema({
    ClientID: {
        type: String,
        required: true,
    },
    Counterparty: {
        type: String,
        required: true,
    },
    KYCStatus: {
        type: String,
        required: true,
    },
    ReferenceDataValidated: {
        type: String,
        required: true,
    },
    MarginType: {
        type: String,
        required: true,
    },
    MarginStatus: {
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
equityClientSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const EquityClient = mongoose_1.default.model('EquityClient', equityClientSchema, 'equityClients');
exports.default = EquityClient;
