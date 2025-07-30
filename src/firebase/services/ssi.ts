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

// Types
interface BaseSSI {
  _id: string;
  ClientID: string;
  createdAt: any;
  updatedAt: any;
}

interface EquitySSI extends BaseSSI {
  SettlementCurrency: string;
  BeneficiaryName?: string;
  aba_routing_number?: string;
  swift_bic_code?: string;
  account_number?: string;
  bsb_code?: string;
  zengin_code?: string;
  iban?: string;
  sort_code?: string;
}

interface ForexSSI extends BaseSSI {
  CurrencyPair: string;
  Counterparty: string;
  BookingLocation?: string;
  SettlementCurrency: string;
  SettlementDate: Date;
  SettlementInstruction: string;
  ConfirmationStatus: string;
  editNote?: string;
  aba_routing_number?: string;
  bsb_code?: string;
  zengin_code?: string;
  swift_bic_code?: string;
  iban?: string;
  sort_code?: string;
  beneficiary_name?: string;
  account_number?: string;
  settlement_method?: string;
}

// Collection references
const equitySSICollection = collection(db, 'equitySSI');
const forexSSICollection = collection(db, 'forexSSI');

// Equity SSI
export const addEquitySSI = async (data: Partial<EquitySSI>) => {
  // Currency-specific validation
  const currency = data.SettlementCurrency;
  const requiredFields: string[] = [];
  const optionalFields: string[] = [];

  switch (currency) {
    case 'USD':
      requiredFields.push('aba_routing_number');
      optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
      break;
    case 'AUD':
      requiredFields.push('bsb_code');
      optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
      break;
    case 'JPY':
      optionalFields.push('zengin_code');
      requiredFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
      break;
    case 'EUR':
      requiredFields.push('iban', 'swift_bic_code', 'beneficiary_name');
      optionalFields.push('account_number');
      break;
    case 'GBP':
      requiredFields.push('sort_code');
      optionalFields.push('swift_bic_code', 'beneficiary_name', 'account_number');
      break;
  }

  // Validate required fields
  for (const field of requiredFields) {
    if (!data[field as keyof EquitySSI] || data[field as keyof EquitySSI] === '') {
      throw new Error(`Missing required field for ${currency}: ${field}`);
    }
  }

  const ssiData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(equitySSICollection, ssiData);
  return { _id: docRef.id, ...ssiData } as unknown as EquitySSI;
};

export const getAllEquitySSI = async (options: {
  search?: string;
  clientId?: string;
} = {}) => {
  let q = query(equitySSICollection, orderBy('ClientID', 'desc'));

  if (options.clientId) {
    q = query(q, where('ClientID', '==', options.clientId));
  }
  
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    q = query(q, where('ClientID', '>=', searchLower), where('ClientID', '<=', searchLower + '\uf8ff'));
  }

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map(doc => ({
    _id: doc.id,
    ...doc.data()
  })) as unknown as EquitySSI[];

  return results;
};

export const updateEquitySSI = async (id: string, data: Partial<EquitySSI>) => {
  const docRef = doc(db, 'equitySSI', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { _id: id, ...updateData } as unknown as EquitySSI;
};

export const deleteEquitySSI = async (id: string) => {
  const docRef = doc(db, 'equitySSI', id);
  await deleteDoc(docRef);
  return id;
};

// Forex SSI
export const addForexSSI = async (data: Partial<ForexSSI>) => {
  const ssiData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(forexSSICollection, ssiData);
  return { _id: docRef.id, ...ssiData } as unknown as ForexSSI;
};

export const getAllForexSSI = async (options: {
  search?: string;
  clientId?: string;
  currencyPair?: string;
} = {}) => {
  let q = query(forexSSICollection, orderBy('ClientID', 'desc'));

  if (options.clientId) {
    q = query(q, where('ClientID', '==', options.clientId));
  }

  if (options.currencyPair) {
    q = query(q, where('CurrencyPair', '==', options.currencyPair));
  }
  
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    q = query(q, where('ClientID', '>=', searchLower), where('ClientID', '<=', searchLower + '\uf8ff'));
  }

  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map(doc => ({
    _id: doc.id,
    ...doc.data()
  })) as unknown as ForexSSI[];

  return results;
};

export const updateForexSSI = async (id: string, data: Partial<ForexSSI>) => {
  const docRef = doc(db, 'forexSSI', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { _id: id, ...updateData } as unknown as ForexSSI;
};

export const deleteForexSSI = async (id: string) => {
  const docRef = doc(db, 'forexSSI', id);
  await deleteDoc(docRef);
  return id;
}; 