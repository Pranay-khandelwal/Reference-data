import mongoose, { Schema, Document } from 'mongoose';

export interface IFutures extends Document {
  ContractCode: string;
  UnderlyingAsset: string;
  ExpiryDate: string;
  LotSize: number;
  TradingVenue: string;
  Currency: string;
  RID: string;
}

const FuturesSchema: Schema = new Schema({
  ContractCode: { type: String, required: true },
  UnderlyingAsset: { type: String, required: true },
  ExpiryDate: { type: String, required: true },
  LotSize: { type: Number, required: true },
  TradingVenue: { type: String, required: true },
  Currency: { type: String, required: true },
  RID: { type: String, required: true, unique: true },
}, {
  timestamps: true
});

export default mongoose.model<IFutures>('Futures', FuturesSchema); 