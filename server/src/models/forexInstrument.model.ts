import mongoose from 'mongoose';

const forexInstrumentSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

forexInstrumentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ForexInstrument = mongoose.model('ForexInstrument', forexInstrumentSchema, 'forexInstruments');

export default ForexInstrument; 