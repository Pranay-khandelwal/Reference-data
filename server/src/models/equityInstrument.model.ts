import mongoose from 'mongoose';

const equityInstrumentSchema = new mongoose.Schema({
  ISIN: {
    type: String,
    required: true,
  },
  Symbol: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

equityInstrumentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EquityInstrument = mongoose.model('EquityInstrument', equityInstrumentSchema, 'equityInstruments');

export default EquityInstrument; 