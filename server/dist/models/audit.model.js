"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuditSchema = new mongoose_1.Schema({
    timestamp: { type: Date, default: Date.now },
    user: { type: String, required: true },
    action: { type: String, required: true },
    instrumentType: { type: String, required: true },
    editNote: { type: String, required: true },
    changes: { type: mongoose_1.Schema.Types.Mixed, required: true },
});
exports.default = (0, mongoose_1.model)('Audit', AuditSchema);
