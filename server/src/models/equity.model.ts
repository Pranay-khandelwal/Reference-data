import mongoose, { Schema, Document } from 'mongoose';

export interface IEquity extends Document {
  ISIN: string;
  Symbol: string;
  ClientID: string;
  Counterparty: string;
  TradingVenue: string;
  Currency: string;
  CountryOfTrade: string;
  KYCStatus: string;
  ReferenceData: {
    validated: boolean;
  };
  Validated: boolean;
  Collateral: number;
  RequiredMargin: number;
  TypeMargin: string;
  Status: string;
  RID: string;
}

const EquitySchema: Schema = new Schema({
  ISIN: { type: String, required: true },
  Symbol: { type: String, required: true },
  TradingVenue: { type: String, required: true },
  Currency: { type: String, required: true },
  CountryOfTrade: { type: String, required: true },
  RID: { type: String, required: true, unique: true },
  // The following fields are now optional
  ClientID: { type: String, required: false },
  Counterparty: { type: String, required: false },
  KYCStatus: { type: String, required: false },
  ReferenceData: {
    validated: { type: Boolean, default: false }
  },
  Validated: { type: Boolean, default: false },
  Collateral: { type: Number, default: 0 },
  RequiredMargin: { type: Number, default: 0 },
  TypeMargin: { type: String },
  Status: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IEquity>('Equity', EquitySchema); 