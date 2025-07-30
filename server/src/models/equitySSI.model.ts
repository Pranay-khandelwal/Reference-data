import mongoose from 'mongoose';

const equitySSISchema = new mongoose.Schema({
  ClientID: { type: String, required: true },
  Counterparty: { type: String, required: true },
  CustodianName: { type: String, required: true },
  CustodianAccountNo: { type: String, required: true },
  BeneficiaryClientID: { type: String, required: true },
  SettlementCycle: { type: String, required: true },
  SettlementCurrency: { type: String, required: true },
  SettlementDate: { type: Date, required: true },
  ConfirmationStatus: { type: String, required: true },
  MarginType: { type: String, required: true },
  MarginStatus: { type: String, required: true },
  editNote: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Currency-specific fields (all optional, required at runtime based on currency)
  aba_routing_number: { type: String, required: false },
  bsb_code: { type: String, required: false },
  zengin_code: { type: String, required: false },
  swift_bic_code: { type: String, required: false },
  iban: { type: String, required: false },
  sort_code: { type: String, required: false },
  beneficiary_name: { type: String, required: false },
  account_number: { type: String, required: false },
  settlement_method: { type: String, required: false },
});

equitySSISchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const EquitySSI = mongoose.model('EquitySSI', equitySSISchema, 'equitySSIs');

export default EquitySSI; 