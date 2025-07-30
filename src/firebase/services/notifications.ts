import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../config';

const notificationCollection = collection(db, 'notifications');

// Add new notification
export const addNotification = async (data: {
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'unread' | 'read';
  userId?: string;
}) => {
  const notificationData = {
    ...data,
    priority: data.priority || 'low',
    status: data.status || 'unread',
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(notificationCollection, notificationData);
  return { id: docRef.id, ...notificationData };
};

// Get all notifications
export const getNotifications = async (options: {
  limit?: number;
  userId?: string;
  status?: 'unread' | 'read';
  type?: string;
} = {}) => {
  let q = query(notificationCollection, orderBy('createdAt', 'desc'));

  if (options.userId) {
    q = query(q, where('userId', '==', options.userId));
  }

  if (options.status) {
    q = query(q, where('status', '==', options.status));
  }

  if (options.type) {
    q = query(q, where('type', '==', options.type));
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

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, {
    status: 'read',
    updatedAt: serverTimestamp()
  });
  return notificationId;
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId?: string) => {
  let q = query(
    notificationCollection,
    where('status', '==', 'unread')
  );

  if (userId) {
    q = query(q, where('userId', '==', userId));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

// Get recent notifications
export const getRecentNotifications = async (limitCount: number = 5) => {
  const q = query(
    notificationCollection,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}; 