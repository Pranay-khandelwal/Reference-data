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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const equitySSI_model_1 = __importDefault(require("../models/equitySSI.model"));
const forexSSI_model_1 = __importDefault(require("../models/forexSSI.model"));
const audit_model_1 = __importDefault(require("../models/audit.model"));
const router = express_1.default.Router();
// Get all SSI records (with assetClass filter)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { assetClass, search, currencyPair } = req.query;
        let data = [];
        if (assetClass === 'equity') {
            const query = {};
            if (search)
                query.ClientID = { $regex: search, $options: 'i' };
            data = yield equitySSI_model_1.default.find(query).sort({ createdAt: -1 });
        }
        else if (assetClass === 'forex') {
            const query = {};
            if (search)
                query.ClientID = { $regex: search, $options: 'i' };
            if (currencyPair)
                query.CurrencyPair = { $regex: currencyPair, $options: 'i' };
            data = yield forexSSI_model_1.default.find(query).sort({ createdAt: -1 });
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Add new SSI record
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { assetClass } = _a, payload = __rest(_a, ["assetClass"]);
        let newRecord;
        if (assetClass === 'equity') {
            newRecord = new equitySSI_model_1.default(payload);
            yield newRecord.save();
            // Audit log for equity SSI add
            const audit = new audit_model_1.default({
                user: 'Kshitij Kadam',
                action: 'Added SSI',
                instrumentType: 'equity',
                editNote: `New SSI created for Client ID ${newRecord.ClientID}`,
                changes: newRecord.toObject()
            });
            yield audit.save();
        }
        else if (assetClass === 'forex') {
            // Remove Country from payload if present
            const { Country } = payload, forexPayload = __rest(payload, ["Country"]);
            newRecord = new forexSSI_model_1.default(forexPayload);
            yield newRecord.save();
            // Audit log for forex SSI add
            const audit = new audit_model_1.default({
                user: 'Kshitij Kadam',
                action: 'Added SSI',
                instrumentType: 'forex',
                editNote: `New SSI created for Client ID ${newRecord.ClientID}`,
                changes: newRecord.toObject()
            });
            yield audit.save();
        }
        else {
            return res.status(400).json({ message: 'Invalid asset class' });
        }
        res.status(201).json(newRecord);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Update SSI record
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _b = req.body, { assetClass, editNote } = _b, payload = __rest(_b, ["assetClass", "editNote"]);
        let updatedRecord;
        if (assetClass === 'equity') {
            updatedRecord = yield equitySSI_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, payload), { editNote }), { new: true });
            // Audit log for equity SSI update
            const audit = new audit_model_1.default({
                user: 'Kshitij Kadam',
                action: 'Edited SSI',
                instrumentType: 'equity',
                editNote: editNote || '',
                changes: updatedRecord ? updatedRecord.toObject() : {},
            });
            yield audit.save();
        }
        else if (assetClass === 'forex') {
            // Remove Country from payload if present
            const { Country } = payload, forexPayload = __rest(payload, ["Country"]);
            updatedRecord = yield forexSSI_model_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, forexPayload), { editNote }), { new: true });
            // Audit log for forex SSI update
            const audit = new audit_model_1.default({
                user: 'Kshitij Kadam',
                action: 'Edited SSI',
                instrumentType: 'forex',
                editNote: editNote || '',
                changes: updatedRecord ? updatedRecord.toObject() : {},
            });
            yield audit.save();
        }
        else {
            return res.status(400).json({ message: 'Invalid asset class' });
        }
        res.json(updatedRecord);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Delete SSI record
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { assetClass } = req.query;
        let deletedRecord;
        if (assetClass === 'equity') {
            deletedRecord = yield equitySSI_model_1.default.findByIdAndDelete(req.params.id);
            if (deletedRecord) {
                // Audit log for equity SSI delete
                const audit = new audit_model_1.default({
                    user: 'Kshitij Kadam',
                    action: 'Deleted SSI',
                    instrumentType: 'equity',
                    editNote: `SSI Deleted for Client ID ${deletedRecord.ClientID}`,
                    changes: deletedRecord.toObject()
                });
                yield audit.save();
            }
        }
        else if (assetClass === 'forex') {
            deletedRecord = yield forexSSI_model_1.default.findByIdAndDelete(req.params.id);
            if (deletedRecord) {
                // Audit log for forex SSI delete
                const audit = new audit_model_1.default({
                    user: 'Kshitij Kadam',
                    action: 'Deleted SSI',
                    instrumentType: 'forex',
                    editNote: `SSI Deleted for Client ID ${deletedRecord.ClientID}`,
                    changes: deletedRecord.toObject()
                });
                yield audit.save();
            }
        }
        else {
            return res.status(400).json({ message: 'Invalid asset class' });
        }
        res.json(deletedRecord);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
