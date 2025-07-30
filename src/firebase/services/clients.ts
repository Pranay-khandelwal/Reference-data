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

// Collection references
const equityClientCollection = collection(db, 'equityClients');
const forexClientCollection = collection(db, 'forexClients');

// Equity Clients
export const addEquityClient = async (data: any) => {
  const clientData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(equityClientCollection, clientData);
  return { id: docRef.id, ...clientData };
};

export const getAllEquityClients = async () => {
  const q = query(equityClientCollection, orderBy('ClientID', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateEquityClient = async (id: string, data: any) => {
  const docRef = doc(db, 'equityClients', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteEquityClient = async (id: string) => {
  const docRef = doc(db, 'equityClients', id);
  await deleteDoc(docRef);
  return id;
};

// Forex Clients
export const addForexClient = async (data: any) => {
  const clientData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(forexClientCollection, clientData);
  return { id: docRef.id, ...clientData };
};

export const getAllForexClients = async () => {
  const q = query(forexClientCollection, orderBy('ClientID', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateForexClient = async (id: string, data: any) => {
  const docRef = doc(db, 'forexClients', id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteForexClient = async (id: string) => {
  const docRef = doc(db, 'forexClients', id);
  await deleteDoc(docRef);
  return id;
};

// Search Clients
export const searchClients = async (type: 'equity' | 'forex', searchTerm: string) => {
  const collection = type === 'equity' ? equityClientCollection : forexClientCollection;
  
  // Search in multiple fields
  const querySnapshot = await getDocs(collection);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(client => {
      const searchableFields = ['ClientID', 'Counterparty', 'Portfolio', 'Custodian'];
      return searchableFields.some(field => {
        const value = (client as any)[field];
        return value ? String(value).toLowerCase().includes(searchTerm.toLowerCase()) : false;
      });
    });
};

// Import Client CSV
export const importClientCSV = async (file: File, type: 'equity' | 'forex') => {
  try {
    // Parse the file using papaparse
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Process records based on type
            const processedRecords = await Promise.all(
              results.data.map(async (record: any) => {
                if (type === 'equity') {
                  // Transform equity client field names to match expected format
                  const transformedRecord = {
                    ClientID: record['Client ID'] || record.ClientID || '',
                    ReferenceDataValidated: record['Reference Data Validated'] || record.ReferenceDataValidated || '',
                    MarginType: record['Margin Type'] || record.MarginType || '',
                    MarginStatus: record['Margin Status'] || record.MarginStatus || '',
                    ApprovalStatus: record['Approval Status'] || record.ApprovalStatus || '',
                    Counterparty: record.Counterparty || '',
                    KYCStatus: record['KYC Status'] || record.KYCStatus || '',
                  };
                  return await addEquityClient(transformedRecord);
                } else {
                  // Transform forex client field names to match expected format
                  const transformedRecord = {
                    ClientID: record['Client ID'] || record.ClientID || '',
                    Counterparty: record.Counterparty || '',
                    Portfolio: record.Portfolio || '',
                    Custodian: record.Custodian || '',
                    NettingEligibility: record['Netting Eligibility'] || record.NettingEligibility || '',
                    KYCStatus: record['KYC Status'] || record.KYCStatus || '',
                    SanctionsScreening: record['Sanctions Screening'] || record.SanctionsScreening || '',
                    ExpenseApprovalStatus: record['Expense Approval Status'] || record.ExpenseApprovalStatus || '',
                    ApprovalStatus: record['Approval Status'] || record.ApprovalStatus || '',
                  };
                  return await addForexClient(transformedRecord);
                }
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
    console.error('Error importing client CSV:', error);
    throw error;
  }
}; 