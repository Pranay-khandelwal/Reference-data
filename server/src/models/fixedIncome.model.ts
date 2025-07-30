import mongoose, { Schema, Document } from 'mongoose';

export interface IFixedIncome extends Document {
  ISIN: string;
  Status: string;
  MaturityDate: string;
  CouponRate: number;
  CouponFrequency: string;
  IssuerName: string;
  RID: string;
}

const FixedIncomeSchema: Schema = new Schema({
  ISIN: { type: String, required: true },
  Status: { type: String, required: true },
  MaturityDate: { type: String, required: true },
  CouponRate: { type: Number, required: true },
  CouponFrequency: { type: String, required: true },
  IssuerName: { type: String, required: true },
  RID: { type: String, required: true, unique: true },
}, {
  timestamps: true
});

export default mongoose.model<IFixedIncome>('FixedIncome', FixedIncomeSchema); 