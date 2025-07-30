import mongoose from 'mongoose';

const forexSchema = new mongoose.Schema({
  Counterparty: {
    type: String,
    required: true,
  },
  CurrencyPair: {
    type: String,
    required: true,
  },
  BaseCurrency: {
    type: String,
    required: true,
  },
  TermCurrency: {
    type: String,
    required: true,
  },
  ExecutionVenue: {
    type: String,
    required: true,
  },
  ProductType: {
    type: String,
    required: true,
  },
  BookingLocation: {
    type: String,
    required: true,
  },
  Portfolio: {
    type: String,
    required: true,
  },
  TradeSource: {
    type: String,
    required: true,
  },
  System: {
    type: String,
    required: true,
  },
  Custodian: {
    type: String,
    required: true,
  },
  SettlementInstructions: {
    type: Object,
    required: true,
  },
  NettingEligibility: {
    type: Boolean,
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
  CostCenter: {
    type: String,
    required: true,
  },
  ExpenseApprovalStatus: {
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

forexSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Forex = mongoose.model('Forex', forexSchema);

export default Forex; 