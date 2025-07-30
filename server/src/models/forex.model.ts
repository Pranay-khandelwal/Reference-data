import mongoose from 'mongoose';

const forexSchema = new mongoose.Schema({
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
    required: false,
  },
  Portfolio: {
    type: String,
    required: false,
  },
  TradeSourceSystem: {
    type: String,
    required: false,
  },
  Custodian: {
    type: String,
    required: false,
  },
  SettlementInstructions: {
    type: String,
    required: false,
  },
  NettingEligibility: {
    type: Boolean,
    required: false,
    default: false,
  },
  KYCStatus: {
    type: String,
    required: false,
  },
  SanctionsScreening: {
    type: String,
    required: false,
  },
  CostCenter: {
    type: String,
    required: false,
  },
  ExpenseApprovalStatus: {
    type: String,
    required: false,
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

const Forex = mongoose.model('Forex', forexSchema, 'forex');

export default Forex; 