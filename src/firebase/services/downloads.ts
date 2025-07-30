import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config';

// Helper function to convert object to CSV
const convertToCSV = (arr: any[]) => {
  if (arr.length === 0) return '';
  
  const headers = Object.keys(arr[0]);
  const rows = [
    headers.join(','),
    ...arr.map(obj =>
      headers.map(header => {
        let cell = obj[header];
        // Handle special cases
        if (cell === undefined || cell === null) cell = '';
        if (typeof cell === 'string' && cell.includes(',')) cell = `"${cell}"`;
        return cell;
      }).join(',')
    )
  ];
  
  return rows.join('\n');
};

// Download Equity Instruments
export const downloadEquityInstruments = async (searchTerm?: string) => {
  try {
    let q = query(collection(db, 'equity'));
    if (searchTerm) {
      q = query(q, where('Symbol', '>=', searchTerm), where('Symbol', '<=', searchTerm + '\uf8ff'));
    }
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'equity_instruments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading equity instruments:', error);
    throw error;
  }
};

// Download Forex Instruments
export const downloadForexInstruments = async (searchTerm?: string) => {
  try {
    let q = query(collection(db, 'forex'));
    if (searchTerm) {
      q = query(q, where('CurrencyPair', '>=', searchTerm), where('CurrencyPair', '<=', searchTerm + '\uf8ff'));
    }
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'forex_instruments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading forex instruments:', error);
    throw error;
  }
};

export const downloadInstruments = async (instrumentType: string, searchTerm?: string) => {
  try {
    let q = query(collection(db, instrumentType));
    let searchField = 'Symbol'; // Default search field

    switch (instrumentType) {
      case 'fixedincome':
        searchField = 'ISIN';
        break;
      case 'futures':
      case 'options':
        searchField = 'ContractCode';
        break;
      default:
        break;
    }

    if (searchTerm) {
      q = query(q, where(searchField, '>=', searchTerm), where(searchField, '<=', searchTerm + '\uf8ff'));
    }
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${instrumentType}_instruments.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(`Error downloading ${instrumentType} instruments:`, error);
    throw error;
  }
};

// Download Equity Clients
export const downloadEquityClients = async (filters: {
  searchTerm?: string;
  kycFilter?: string;
  settlementStatusFilter?: string;
}) => {
  try {
    let q = query(collection(db, 'equityClients'));
    if (filters.searchTerm) {
      q = query(q, where('ClientID', '>=', filters.searchTerm), where('ClientID', '<=', filters.searchTerm + '\uf8ff'));
    }
    if (filters.kycFilter) {
      q = query(q, where('KYCStatus', '==', filters.kycFilter));
    }
    if (filters.settlementStatusFilter) {
      q = query(q, where('SettlementStatus', '==', filters.settlementStatusFilter));
    }
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'equity_clients.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading equity clients:', error);
    throw error;
  }
};

// Download Forex Clients
export const downloadForexClients = async (filters: {
  searchTerm?: string;
  kycFilter?: string;
  settlementStatusFilter?: string;
}) => {
  try {
    let q = query(collection(db, 'forexClients'));
    if (filters.searchTerm) {
      q = query(q, where('ClientID', '>=', filters.searchTerm), where('ClientID', '<=', filters.searchTerm + '\uf8ff'));
    }
    if (filters.kycFilter) {
      q = query(q, where('KYCStatus', '==', filters.kycFilter));
    }
    if (filters.settlementStatusFilter) {
      q = query(q, where('SettlementStatus', '==', filters.settlementStatusFilter));
    }
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'forex_clients.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading forex clients:', error);
    throw error;
  }
}; 