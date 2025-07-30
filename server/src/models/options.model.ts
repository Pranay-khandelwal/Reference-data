import mongoose, { Schema, Document } from 'mongoose';

export interface IOptions extends Document {
  ContractCode: string;
  UnderlyingAsset: string;
  OptionType: 'Call' | 'Put';
  StrikePrice: number;
  ExpiryDate: string;
  LotSize: number;
  RID: string;
}

const OptionsSchema: Schema = new Schema({
  ContractCode: { type: String, required: true },
  UnderlyingAsset: { type: String, required: true },
  OptionType: { type: String, enum: ['Call', 'Put'], required: true },
  StrikePrice: { type: Number, required: true },
  ExpiryDate: { type: String, required: true },
  LotSize: { type: Number, required: true },
  RID: { type: String, required: true, unique: true },
}, {
  timestamps: true
});

export default mongoose.model<IOptions>('Options', OptionsSchema); 