import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  query, 
  where, 
  orderBy,
  doc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config';
import { auth } from '../config';

const filesCollection = collection(db, 'files');
const priceDataCollection = collection(db, 'priceData');
const equityDataCollection = collection(db, 'equityData');
const forexDataCollection = collection(db, 'forexData');
const clientDataCollection = collection(db, 'clientData');

interface FileMetadata {
  name: string;
  size: number;
  contentType: string;
  uploadedBy: string;
  uploadedAt: Date;
  type: 'equity' | 'forex' | 'price' | 'client';
  status: 'processing' | 'completed' | 'error';
  rowCount: number;
}

const getCollectionForType = (type: 'equity' | 'forex' | 'price' | 'client') => {
  switch (type) {
    case 'equity':
      return equityDataCollection;
    case 'forex':
      return forexDataCollection;
    case 'price':
      return priceDataCollection;
    case 'client':
      return clientDataCollection;
    default:
      throw new Error('Invalid data type');
  }
};

// Store file metadata and content
export const uploadFile = async (
  file: File,
  type: 'equity' | 'forex' | 'price' | 'client'
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Read and parse CSV file
    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0].map(header => header.trim());
    const data = rows.slice(1)
      .filter(row => row.some(cell => cell.trim())) // Skip empty rows
      .map(row => {
        const obj: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          if (header) { // Only process non-empty headers
            obj[header] = row[index]?.trim() || '';
          }
        });
        return obj;
      });

    // Create file metadata
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      contentType: file.type,
      uploadedBy: user.uid,
      uploadedAt: new Date(),
      type,
      status: 'processing',
      rowCount: data.length
    };

    // Store file metadata
    const metadataDoc = await addDoc(filesCollection, {
      ...metadata,
      createdAt: serverTimestamp()
    });

    // Get the appropriate collection for the data type
    const dataCollection = getCollectionForType(type);

    // Store data in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const currentBatch = data.slice(i, i + batchSize);

      currentBatch.forEach((item) => {
        const docRef = doc(dataCollection);
        batch.set(docRef, {
          ...item,
          fileId: metadataDoc.id,
          uploadedBy: user.uid,
          uploadedAt: serverTimestamp(),
          batchIndex: Math.floor(i / batchSize)
        });
      });

      await batch.commit();
    }

    // Update file status to completed
    await addDoc(filesCollection, {
      id: metadataDoc.id,
      status: 'completed',
      updatedAt: serverTimestamp()
    });

    return {
      id: metadataDoc.id,
      ...metadata,
      status: 'completed'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (fileId: string) => {
  const docRef = doc(filesCollection, fileId);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as FileMetadata;
};

// Get all files for a type
export const getFiles = async (type: 'equity' | 'forex' | 'price' | 'client') => {
  const q = query(
    filesCollection,
    where('type', '==', type),
    orderBy('uploadedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get data for a specific file
export const getFileData = async (fileId: string, type: 'equity' | 'forex' | 'price' | 'client') => {
  const dataCollection = getCollectionForType(type);
  
  const q = query(
    dataCollection,
    where('fileId', '==', fileId),
    orderBy('batchIndex')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    delete data.fileId;
    delete data.uploadedBy;
    delete data.uploadedAt;
    delete data.batchIndex;
    return data;
  });
};

// Delete file and its data
export const deleteFile = async (fileId: string, type: 'equity' | 'forex' | 'price' | 'client') => {
  // Delete file metadata
  await deleteDoc(doc(filesCollection, fileId));

  // Delete all associated data
  const dataCollection = getCollectionForType(type);
  const q = query(dataCollection, where('fileId', '==', fileId));
  const querySnapshot = await getDocs(q);
  
  // Delete in batches
  const batchSize = 500;
  for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db);
    const currentBatch = querySnapshot.docs.slice(i, i + batchSize);
    
    currentBatch.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  return fileId;
}; 