import mongoose from 'mongoose';

const forexClientSchema = new mongoose.Schema({
  ClientID: {
    type: String,
    required: true,
  },
  Counterparty: {
    type: String,
    required: true,
  },
  Portfolio: {
    type: String,
    required: true,
  },
  Custodian: {
    type: String,
    required: true,
  },
  NettingEligibility: {
    type: String,
    required: true,
  },
  KYCStatus: {
    type: String,
    required: true,
  },
  SanctionsScreening: {
    type: String,
    required: true,
  },
  ExpenseApprovalStatus: {
    type: String,
    required: true,
  },
  ApprovalStatus: {
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

forexClientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ForexClient = mongoose.model('ForexClient', forexClientSchema, 'forexClients');

export default ForexClient; 