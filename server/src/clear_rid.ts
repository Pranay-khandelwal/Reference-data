import mongoose from 'mongoose';
import Instrument from './models/instrument.model';
import Equity from './models/equity.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reference-data';

async function clearAllRIDs() {
  await mongoose.connect(MONGO_URI);
  
  try {
    // Drop unique index to avoid errors if it exists
    await Instrument.collection.dropIndex('RID_1').catch(err => console.log('Instrument RID index not found, skipping drop.'));
    await Equity.collection.dropIndex('RID_1').catch(err => console.log('Equity RID index not found, skipping drop.'));
  } catch (error) {
    console.error('Error dropping indexes:', error);
  }

  const instrumentResult = await Instrument.updateMany({}, { $unset: { RID: 1 } });
  const equityResult = await Equity.updateMany({}, { $unset: { RID: 1 } });
  console.log(`Cleared RID for ${instrumentResult.modifiedCount} instruments and ${equityResult.modifiedCount} equities.`);

  try {
    // Recreate unique index
    await Instrument.collection.createIndex({ RID: 1 }, { unique: true, sparse: true });
    await Equity.collection.createIndex({ RID: 1 }, { unique: true, sparse: true });
    console.log('Recreated unique indexes on RID.');
  } catch (error) {
    console.error('Error recreating indexes:', error);
  }

  await mongoose.disconnect();
}

clearAllRIDs().catch(err => {
  console.error('Error clearing RIDs:', err);
  process.exit(1);
}); 