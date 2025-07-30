"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PriceSchema = new mongoose_1.Schema({
    symbol: { type: String, required: true },
    date: { type: Date, required: true },
    open: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    close: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)('Price', PriceSchema);
