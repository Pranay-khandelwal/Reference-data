import mongoose from 'mongoose';

const equitySchema = new mongoose.Schema({
  ISIN: {
    type: String,
    required: true,
    unique: true,
  },
  Symbol: {
    type: String,
    required: true,
  },
  ClientID: {
    type: String,
    required: true,
  },
  Counterparty: {
    type: String,
    required: true,
  },
  TradingVenue: {
    type: String,
    required: true,
  },
  Currency: {
    type: String,
    required: true,
  },
  CountryOfTrade: {
    type: String,
    required: true,
  },
  KYCStatus: {
    type: String,
    required: true,
  },
  ReferenceData: {
    type: Object,
    required: true,
  },
  Validated: {
    type: Boolean,
    default: false,
  },
  Collateral: {
    type: Number,
    required: true,
  },
  RequiredMargin: {
    type: Number,
    required: true,
  },
  TypeMargin: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    required: true,
  },
  PricingSource: {
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

equitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Equity = mongoose.model('Equity', equitySchema);

export default Equity; 