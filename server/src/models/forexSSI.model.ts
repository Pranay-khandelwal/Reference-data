import mongoose from 'mongoose';

const forexSSISchema = new mongoose.Schema({
  ClientID: { type: String, required: true },
  Counterparty: { type: String, required: true },
  CurrencyPair: { type: String, required: true },
  BookingLocation: { type: String, required: false },
  SettlementCurrency: { type: String, required: true },
  SettlementDate: { type: Date, required: true },
  SettlementInstruction: { type: String, required: true },
  ConfirmationStatus: { type: String, required: true },
  editNote: { type: String, required: false },
  aba_routing_number: { type: String, required: false },
  bsb_code: { type: String, required: false },
  zengin_code: { type: String, required: false },
  swift_bic_code: { type: String, required: false },
  iban: { type: String, required: false },
  sort_code: { type: String, required: false },
  beneficiary_name: { type: String, required: false },
  account_number: { type: String, required: false },
  settlement_method: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

forexSSISchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ForexSSI = mongoose.model('ForexSSI', forexSSISchema, 'forexSSIs');

export default ForexSSI; 