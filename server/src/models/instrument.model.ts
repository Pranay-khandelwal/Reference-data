import mongoose from 'mongoose';

const instrumentSchema = new mongoose.Schema({
  ISIN: {
    type: String,
    unique: true,
    sparse: true,
  },
  instrumentName: {
    type: String,
  },
  assetClass: {
    type: String,
    required: true,
    enum: ['Equity', 'Fixed Income', 'Derivatives', 'Treasury', 'Forex'],
  },
  issuer: {
    type: String,
  },
  sector: {
    type: String,
  },
  country: {
    type: String,
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY'],
  },
  pricingSource: {
    type: String,
    enum: ['Bloomberg', 'Refinitiv', 'Exchange', 'Manual'],
  },
  // Equity specific fields
  symbol: {
    type: String,
  },
  clientId: {
    type: String,
  },
  counterparty: {
    type: String,
  },
  tradingVenue: {
    type: String,
  },
  countryOfTrade: {
    type: String,
  },
  kycStatus: {
    type: String,
  },
  referenceDataValidated: {
    type: Boolean,
    default: false,
  },
  collateralRequired: {
    type: Boolean,
    default: false,
  },
  marginType: {
    type: String,
  },
  marginStatus: {
    type: String,
  },
  fxRateApplied: {
    type: Number,
    default: 0,
  },
  // Forex specific fields
  currencyPair: {
    type: String,
  },
  baseCurrency: {
    type: String,
  },
  termCurrency: {
    type: String,
  },
  executionVenue: {
    type: String,
  },
  productType: {
    type: String,
  },
  bookingLocation: {
    type: String,
  },
  portfolio: {
    type: String,
  },
  tradeSourceSystem: {
    type: String,
  },
  custodian: {
    type: String,
  },
  settlementInstructions: {
    type: String,
  },
  nettingEligibility: {
    type: Boolean,
    default: false,
  },
  sanctionsScreening: {
    type: String,
  },
  settlementCurrency: {
    type: String,
  },
  costCenter: {
    type: String,
  },
  expenseApprovalStatus: {
    type: String,
  },
  RID: {
    type: String,
    unique: true,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Instrument', instrumentSchema); 