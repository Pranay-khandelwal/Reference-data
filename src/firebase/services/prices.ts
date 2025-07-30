import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit as limitQuery,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config';
import Papa from 'papaparse';

const priceCollection = collection(db, 'prices');

// Add new price
export const addPrice = async (data: {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date?: Date;
}) => {
  const priceData = {
    ...data,
    date: data.date || new Date(),
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(priceCollection, priceData);
  return { id: docRef.id, ...priceData };
};

// Get latest prices for all symbols
export const getLatestPrices = async () => {
  const symbols = new Set();
  const latestPrices = new Map();
  
  const querySnapshot = await getDocs(
    query(priceCollection, orderBy('date', 'desc'))
  );
  
  querySnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!symbols.has(data.symbol)) {
      symbols.add(data.symbol);
      latestPrices.set(data.symbol, {
        id: doc.id,
        ...data
      });
    }
  });
  
  return Array.from(latestPrices.values());
};

// Get price history for a symbol
export const getPriceHistory = async (symbol: string, limit?: number) => {
  const constraints: QueryConstraint[] = [
    where('symbol', '==', symbol),
    orderBy('date', 'asc')
  ];
  
  if (limit) {
    constraints.push(limitQuery(limit));
  }
  
  const q = query(priceCollection, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Import price history from CSV
export const importPriceHistory = async (file: File, symbol: string) => {
  try {
    // Parse the file using papaparse
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Process records
            const processedRecords = await Promise.all(
              results.data.map(async (record: any) => {
                let date;
                if (record.Date.includes('/')) {
                  const [d, m, y] = record.Date.split(/[ /:]/);
                  date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                } else if (record.Date.includes('-')) {
                  const [d, m, y] = record.Date.split(/[- :]/);
                  date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                } else {
                  date = new Date(record.Date);
                }

                if (!date || isNaN(date.getTime())) {
                  console.error('Invalid date:', record.Date);
                  return null;
                }

                const priceData = {
                  symbol,
                  date: date.toISOString(), // Convert to ISO string for Firestore
                  timestamp: date.getTime(), // Add timestamp for querying
                  open: parseFloat(record.Open),
                  high: parseFloat(record.High),
                  low: parseFloat(record.Low),
                  close: parseFloat(record.Close),
                  volume: parseInt(record.Volume, 10),
                  createdAt: serverTimestamp()
                };

                // Add validation to ensure all required fields are present and valid
                if (
                  !priceData.symbol ||
                  !priceData.date ||
                  isNaN(priceData.open) ||
                  isNaN(priceData.high) ||
                  isNaN(priceData.low) ||
                  isNaN(priceData.close) ||
                  isNaN(priceData.volume)
                ) {
                  console.error('Invalid price data:', priceData);
                  return null;
                }

                const docRef = await addDoc(priceCollection, priceData);
                return { id: docRef.id, ...priceData };
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
    console.error('Error importing price history:', error);
    throw error;
  }
}; 