import mongoose from 'mongoose';

const equityClientSchema = new mongoose.Schema({
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

equityClientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EquityClient = mongoose.model('EquityClient', equityClientSchema, 'equityClients');

export default EquityClient; 