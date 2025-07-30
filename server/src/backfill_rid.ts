import mongoose from 'mongoose';
import Instrument from './models/instrument.model';
import Equity from './models/equity.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reference-data';

async function generateNextRIDForModel(model: any, Symbol: string, ISIN: string) {
  const prefix = (Symbol || '') + (ISIN || '').substring(0, 5);
  const latest = await model.find({ RID: { $regex: `^${prefix}` } })
    .sort({ RID: -1 })
    .limit(1);
  let nextSeq = 1;
  if (latest.length > 0) {
    const lastRID = latest[0].RID;
    const lastSeqStr = lastRID.substring(prefix.length);
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }
  return prefix + nextSeq.toString().padStart(2, '0');
}

// Helper for batch RID assignment
async function assignBatchRIDs(rows: any[], model: any, symbolField: string) {
  // Group rows by prefix
  const prefixMap: Record<string, {rows: any[], startSeq: number}> = {};
  // First, collect all prefixes
  for (const row of rows) {
    const Symbol = row[symbolField] || '';
    const ISIN = row.ISIN || '';
    const prefix = (Symbol || '') + (ISIN || '').substring(0, 5);
    if (!prefixMap[prefix]) {
      prefixMap[prefix] = { rows: [], startSeq: 1 };
    }
    prefixMap[prefix].rows.push(row);
  }
  // For each prefix, get the max sequence from DB
  for (const prefix of Object.keys(prefixMap)) {
    const latest = await model.find({ RID: { $regex: `^${prefix}` } })
      .sort({ RID: -1 })
      .limit(1);
    let startSeq = 1;
    if (latest.length > 0) {
      const lastRID = latest[0].RID;
      const lastSeqStr = lastRID.substring(prefix.length);
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) {
        startSeq = lastSeq + 1;
      }
    }
    prefixMap[prefix].startSeq = startSeq;
  }
  // Assign RIDs
  for (const prefix of Object.keys(prefixMap)) {
    let seq = prefixMap[prefix].startSeq;
    for (const row of prefixMap[prefix].rows) {
      row.RID = prefix + seq.toString().padStart(2, '0');
      seq++;
    }
  }
  return rows;
}

async function backfillRIDs() {
  await mongoose.connect(MONGO_URI);
  let updatedInstruments = 0;
  let updatedEquities = 0;

  // Backfill Instruments
  const instruments = await Instrument.find({ $or: [{ RID: { $exists: false } }, { RID: null }] });
  await assignBatchRIDs(instruments, Instrument, 'symbol');
  for (const inst of instruments) {
    if (!inst.symbol || !inst.ISIN) continue;
    if (!inst.RID) continue;
    await inst.save();
    updatedInstruments++;
  }

  // Backfill Equities
  const equities = await Equity.find({ $or: [{ RID: { $exists: false } }, { RID: null }] });
  await assignBatchRIDs(equities, Equity, 'Symbol');
  for (const eq of equities) {
    if (!eq.Symbol || !eq.ISIN) continue;
    if (!eq.RID) continue;
    await eq.save();
    updatedEquities++;
  }

  console.log(`Backfill complete. Updated ${updatedInstruments} instruments and ${updatedEquities} equities.`);
  await mongoose.disconnect();
}

backfillRIDs().catch(err => {
  console.error('Error during backfill:', err);
  process.exit(1);
}); 