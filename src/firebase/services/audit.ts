import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  limit,
  where
} from 'firebase/firestore';
import { db } from '../config';

const auditCollection = collection(db, 'audit');

export const addAuditLog = async (data: {
  user: string;
  action: string;
  instrumentType: string;
  editNote: string;
  changes: any;
}) => {
  const auditData = {
    ...data,
    timestamp: serverTimestamp()
  };
  
  const docRef = await addDoc(auditCollection, auditData);
  return { id: docRef.id, ...auditData };
};

export const getAuditTrail = async (options: {
  limit?: number;
  instrumentType?: string;
  user?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) => {
  let q = query(auditCollection, orderBy('timestamp', 'desc'));

  if (options.instrumentType) {
    q = query(q, where('instrumentType', '==', options.instrumentType));
  }

  if (options.user) {
    q = query(q, where('user', '==', options.user));
  }

  if (options.startDate) {
    q = query(q, where('timestamp', '>=', options.startDate));
  }

  if (options.endDate) {
    q = query(q, where('timestamp', '<=', options.endDate));
  }

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getRecentAuditLogs = async (limitCount: number = 10) => {
  const q = query(
    auditCollection,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}; 