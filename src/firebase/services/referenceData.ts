import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config';

const COLLECTION_NAME = 'unified_data';

// Helper to sanitize keys for Firestore field paths
function sanitizeKeys(obj: any) {
  const sanitized: any = {};
  for (const key in obj) {
    // Debug: Log the original key and its value
    console.log(`Processing field: "${key}" = "${obj[key]}"`);
    
    // ALLOW ALL FIELDS TO BE EDITED - INCLUDING ID
    // For the new field names, they should already be in the correct format
    // Only sanitize if there are actual spaces or special characters
    if (key.includes(' ') || /[^a-zA-Z0-9_]/.test(key)) {
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      sanitized[safeKey] = obj[key];
      console.log(`Sanitized field: "${key}" -> "${safeKey}"`);
    } else {
      // Keep the key as is if it's already in the correct format
      sanitized[key] = obj[key];
      console.log(`Kept field as is: "${key}"`);
    }
    
    // Ensure no undefined values are sent to Firestore
    if (sanitized[key] === undefined) {
      sanitized[key] = 'N/A';
      console.log(`Set undefined field "${key}" to "N/A"`);
    }
  }
  return sanitized;
}

export const getReferenceData = async () => {
  const ref = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
};

export const addReferenceData = async (data: any) => {
  const ref = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(ref, sanitizeKeys(data));
  return { id: docRef.id, ...data };
};

export const updateReferenceData = async (id: string, data: any) => {
  try {
    console.log('=== Firebase Update Operation ===');
    console.log('Document ID to update:', id);
    console.log('Raw update data:', data);
    
    const docRef = doc(db, COLLECTION_NAME, id);
    const sanitizedData = sanitizeKeys(data);
    console.log('Sanitized data for Firebase:', sanitizedData);
    
    // Verify the document exists before updating
    const docSnap = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', id)));
    if (docSnap.empty) {
      throw new Error(`Document with ID ${id} not found`);
    }
    
    await updateDoc(docRef, sanitizedData);
    console.log('Document updated successfully in Firebase');
    console.log('=== End Firebase Update Operation ===');
    return { id, ...data };
  } catch (error) {
    console.error('=== Firebase Update Error ===');
    console.error('Error updating document:', error);
    console.error('Document ID:', id);
    console.error('Data attempted:', data);
    console.error('=== End Firebase Update Error ===');
    throw error;
  }
};

export const deleteReferenceData = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
  return id;
}; 