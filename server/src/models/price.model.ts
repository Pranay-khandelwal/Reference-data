import { Schema, model, Document } from 'mongoose';

export interface IPrice extends Document {
  symbol: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const PriceSchema = new Schema({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  open: { type: Number, default: 0 },
  high: { type: Number, default: 0 },
  low: { type: Number, default: 0 },
  close: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default model<IPrice>('Price', PriceSchema); 