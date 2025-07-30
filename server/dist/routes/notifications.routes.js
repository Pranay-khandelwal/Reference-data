"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notifications_model_1 = __importDefault(require("../models/notifications.model"));
const router = express_1.default.Router();
// Get all notifications
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield notifications_model_1.default.find().sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Create a new notification
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = new notifications_model_1.default(req.body);
        const savedNotification = yield notification.save();
        res.status(201).json(savedNotification);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Mark notification as read
router.put('/:id/read', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notifications_model_1.default.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// Delete a notification
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notifications_model_1.default.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
