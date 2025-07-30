import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';
import Papa from 'papaparse';
import { CSVUploadResponse } from '../../types';

// Collection references
const equityCollection = collection(db, 'equity');
const forexCollection = collection(db, 'forex');
const fixedIncomeCollection = collection(db, 'fixedincome');
const futuresCollection = collection(db, 'futures');
const optionsCollection = collection(db, 'options');

// Generate RID function
const generateNextRID = async (Symbol: string, ISIN: string, collectionName: string) => {
  const prefix = (Symbol || '') + (ISIN || '').substring(0, 5);
  let coll;
  switch (collectionName) {
    case 'equity':
      coll = equityCollection;
      break;
    case 'forex':
      coll = forexCollection;
      break;
    case 'fixedincome':
      coll = fixedIncomeCollection;
      break;
    case 'futures':
      coll = futuresCollection;
      break;
    case 'options':
      coll = optionsCollection;
      break;
    default:
      coll = equityCollection;
  }
  const q = query(
    coll,
    where('RID', '>=', prefix),
    where('RID', '<', prefix + '\uf8ff'),
    orderBy('RID', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  let nextSeq = 1;
  
  if (!querySnapshot.empty) {
    const lastRID = querySnapshot.docs[0].data().RID;
    const lastSeqStr = lastRID.substring(prefix.length);
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }
  
  return prefix + nextSeq.toString().padStart(2, '0');
};

// Equity Instruments
export const addEquityInstrument = async (data: any) => {
  const RID = await generateNextRID(data.Symbol, data.ISIN, 'equity');
  const instrumentData = {
    ...data,
    RID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(equityCollection, instrumentData);
  return { id: docRef.id, ...instrumentData };
};

export const getAllEquityInstruments = async () => {
  const querySnapshot = await getDocs(query(equityCollection, orderBy('RID', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateEquityInstrument = async (id: string, data: any) => {
  const docRef = doc(db, 'equity', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteEquityInstrument = async (id: string) => {
  const docRef = doc(db, 'equity', id);
  await deleteDoc(docRef);
  return id;
};

// Forex Instruments
export const addForexInstrument = async (data: any) => {
  const RID = await generateNextRID(data.Symbol || data.CurrencyPair, data.ISIN || '', 'forex');
  const instrumentData = {
    ...data,
    RID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(forexCollection, instrumentData);
  return { id: docRef.id, ...instrumentData };
};

export const getAllForexInstruments = async () => {
  const querySnapshot = await getDocs(query(forexCollection, orderBy('RID', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateForexInstrument = async (id: string, data: any) => {
  const docRef = doc(db, 'forex', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteForexInstrument = async (id: string) => {
  const docRef = doc(db, 'forex', id);
  await deleteDoc(docRef);
  return id;
};

// Fixed Income Instruments
export const addFixedIncomeInstrument = async (data: any) => {
  const RID = await generateNextRID(data.Symbol, data.ISIN, 'fixedincome');
  const instrumentData = {
    ...data,
    RID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(fixedIncomeCollection, instrumentData);
  return { id: docRef.id, ...instrumentData };
};

export const getAllFixedIncomeInstruments = async () => {
  const querySnapshot = await getDocs(query(fixedIncomeCollection, orderBy('RID', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateFixedIncomeInstrument = async (id: string, data: any) => {
  const docRef = doc(db, 'fixedincome', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteFixedIncomeInstrument = async (id: string) => {
  const docRef = doc(db, 'fixedincome', id);
  await deleteDoc(docRef);
  return id;
};

// Futures Instruments
export const addFuturesInstrument = async (data: any) => {
  const RID = await generateNextRID(data.ContractCode, '', 'futures');
  const instrumentData = {
    ...data,
    RID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(futuresCollection, instrumentData);
  return { id: docRef.id, ...instrumentData };
};

export const getAllFuturesInstruments = async () => {
  const querySnapshot = await getDocs(query(futuresCollection, orderBy('RID', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateFuturesInstrument = async (id: string, data: any) => {
  const docRef = doc(db, 'futures', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteFuturesInstrument = async (id: string) => {
  const docRef = doc(db, 'futures', id);
  await deleteDoc(docRef);
  return id;
};

// Options Instruments
export const addOptionsInstrument = async (data: any) => {
  const RID = await generateNextRID(data.ContractCode, '', 'options');
  const instrumentData = {
    ...data,
    RID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(optionsCollection, instrumentData);
  return { id: docRef.id, ...instrumentData };
};

export const getAllOptionsInstruments = async () => {
  const querySnapshot = await getDocs(query(optionsCollection, orderBy('RID', 'desc')));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateOptionsInstrument = async (id: string, data: any) => {
  const docRef = doc(db, 'options', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteOptionsInstrument = async (id: string) => {
  const docRef = doc(db, 'options', id);
  await deleteDoc(docRef);
  return id;
};


// CSV Import Functions
export const importCSVData = async (file: File, type: 'equity' | 'forex' | 'fixedincome' | 'futures' | 'options'): Promise<CSVUploadResponse> => {
  try {
    // Parse the file using papaparse
    return new Promise<CSVUploadResponse>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Process records based on type
            const processedRecords = await Promise.all(
              results.data.map(async (record: any) => {
                if (type === 'equity') {
                  // Transform equity instrument field names to match expected format
                  const transformedRecord = {
                    ISIN: record.ISIN || '',
                    Symbol: record.Symbol || '',
                    TradingVenue: record['Trading Venue'] || record.TradingVenue || '',
                    Currency: record.Currency || '',
                    CountryOfTrade: record['Country of Trade'] || record.CountryOfTrade || '',
                    Status: record['Instrument Status'] || record.Status || 'Active'
                  };
                  return await addEquityInstrument(transformedRecord);
                } else if (type === 'forex') {
                  // Transform forex instrument field names to match expected format
                  const transformedRecord = {
                    CurrencyPair: record['Currency Pair'] || record.CurrencyPair || '',
                    BaseCurrency: record['Base Currency'] || record.BaseCurrency || '',
                    TermCurrency: record['Term Currency'] || record.TermCurrency || '',
                    ExecutionVenue: record['Execution Venue'] || record.ExecutionVenue || '',
                    ProductType: record['Product Type'] || record.ProductType || ''
                  };
                  return await addForexInstrument(transformedRecord);
                } else if (type === 'fixedincome') {
                  // Transform fixed income instrument field names to match expected format
                  const transformedRecord = {
                    ISIN: record.ISIN || '',
                    Status: record['Instrument Status'] || record.Status || 'Active',
                    MaturityDate: record['Maturity Date'] || record.MaturityDate || '',
                    CouponRate: record['Coupon Rate'] ? parseFloat(record['Coupon Rate']) : 0,
                    CouponFrequency: record['Coupon Frequency'] || record.CouponFrequency || '',
                    IssuerName: record['Issuer Name'] || record.IssuerName || ''
                  };
                  return await addFixedIncomeInstrument(transformedRecord);
                } else if (type === 'futures') {
                  // Transform futures instrument field names to match expected format
                  const transformedRecord = {
                    ContractCode: record['Contract Code'] || record.ContractCode || '',
                    UnderlyingAsset: record['Underlying Asset'] || record.UnderlyingAsset || '',
                    ExpiryDate: record['Expiry Date'] || record.ExpiryDate || '',
                    LotSize: record['Lot Size'] ? parseInt(record['Lot Size'], 10) : 0,
                    TradingVenue: record['Trading Venue'] || record.TradingVenue || '',
                    Currency: record.Currency || ''
                  };
                  return await addFuturesInstrument(transformedRecord);
                } else if (type === 'options') {
                  // Transform options instrument field names to match expected format
                  const transformedRecord = {
                    ContractCode: record['Contract Code'] || record.ContractCode || '',
                    UnderlyingAsset: record['Underlying Asset'] || record.UnderlyingAsset || '',
                    OptionType: record['Option Type'] || record.OptionType || '',
                    StrikePrice: record['Strike Price'] ? parseFloat(record['Strike Price']) : 0,
                    ExpiryDate: record['Expiry Date'] || record.ExpiryDate || '',
                    LotSize: record['Lot Size'] ? parseInt(record['Lot Size'], 10) : 0
                  };
                  return await addOptionsInstrument(transformedRecord);
                }
                return null; // Should not happen for valid types
              })
            );

            resolve({
              success: true,
              recordsProcessed: processedRecords.length,
              records: processedRecords
            });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw error;
  }
}; 