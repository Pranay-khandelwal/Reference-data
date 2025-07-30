"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'error', 'success']
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
notificationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const Notification = mongoose_1.default.model('Notification', notificationSchema);
exports.default = Notification;
