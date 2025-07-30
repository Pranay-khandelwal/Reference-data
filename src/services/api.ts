import * as FirebaseServices from '../firebase/services';
import { collection, deleteDoc, getDocs, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CSVUploadResponse } from '../types';

// Instruments API
export const getEquityInstruments = () => FirebaseServices.getAllEquityInstruments();
export const getForexInstruments = () => FirebaseServices.getAllForexInstruments();
export const getFixedIncomeInstruments = () => FirebaseServices.getAllFixedIncomeInstruments();
export const getFuturesInstruments = () => FirebaseServices.getAllFuturesInstruments();
export const getOptionsInstruments = () => FirebaseServices.getAllOptionsInstruments();
export const addEquityInstrument = (data: any) => FirebaseServices.addEquityInstrument(data);
export const addForexInstrument = (data: any) => FirebaseServices.addForexInstrument(data);
export const addFixedIncomeInstrument = (data: any) => FirebaseServices.addFixedIncomeInstrument(data);
export const addFuturesInstrument = (data: any) => FirebaseServices.addFuturesInstrument(data);
export const addOptionsInstrument = (data: any) => FirebaseServices.addOptionsInstrument(data);
export const updateEquityInstrument = (data: any) => FirebaseServices.updateEquityInstrument(data._id, data);
export const updateForexInstrument = (data: any) => FirebaseServices.updateForexInstrument(data._id, data);
export const updateFixedIncomeInstrument = (data: any) => FirebaseServices.updateFixedIncomeInstrument(data._id, data);
export const updateFuturesInstrument = (data: any) => FirebaseServices.updateFuturesInstrument(data._id, data);
export const updateOptionsInstrument = (data: any) => FirebaseServices.updateOptionsInstrument(data._id, data);
export const deleteEquityInstrument = (id: string) => FirebaseServices.deleteEquityInstrument(id);
export const deleteForexInstrument = (id: string) => FirebaseServices.deleteForexInstrument(id);
export const deleteFixedIncomeInstrument = (id: string) => FirebaseServices.deleteFixedIncomeInstrument(id);
export const deleteFuturesInstrument = (id: string) => FirebaseServices.deleteFuturesInstrument(id);
export const deleteOptionsInstrument = (id: string) => FirebaseServices.deleteOptionsInstrument(id);
export const uploadEquityCSV = (file: File): Promise<CSVUploadResponse> => FirebaseServices.importCSVData(file, 'equity');
export const uploadForexCSV = (file: File): Promise<CSVUploadResponse> => FirebaseServices.importCSVData(file, 'forex');
export const uploadFixedIncomeCSV = (file: File): Promise<CSVUploadResponse> => FirebaseServices.importCSVData(file, 'fixedincome');
export const uploadFuturesCSV = (file: File): Promise<CSVUploadResponse> => FirebaseServices.importCSVData(file, 'futures');
export const uploadOptionsCSV = (file: File): Promise<CSVUploadResponse> => FirebaseServices.importCSVData(file, 'options');
export const downloadEquityInstrumentsCSV = (searchTerm?: string) => FirebaseServices.downloadEquityInstruments(searchTerm);
export const downloadForexInstrumentsCSV = (searchTerm?: string) => FirebaseServices.downloadForexInstruments(searchTerm);
export const downloadFixedIncomeInstrumentsCSV = (searchTerm?: string) => FirebaseServices.downloadInstruments('fixedincome', searchTerm);
export const downloadFuturesInstrumentsCSV = (searchTerm?: string) => FirebaseServices.downloadInstruments('futures', searchTerm);
export const downloadOptionsInstrumentsCSV = (searchTerm?: string) => FirebaseServices.downloadInstruments('options', searchTerm);

// Clear all instruments
export const clearAllEquityInstruments = async () => {
  const equityCollection = collection(db, 'equity');
  const querySnapshot = await getDocs(equityCollection);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const clearAllForexInstruments = async () => {
  const forexCollection = collection(db, 'forex');
  const querySnapshot = await getDocs(forexCollection);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const clearAllFixedIncomeInstruments = async () => {
  const collectionRef = collection(db, 'fixedincome');
  const querySnapshot = await getDocs(collectionRef);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const clearAllFuturesInstruments = async () => {
  const collectionRef = collection(db, 'futures');
  const querySnapshot = await getDocs(collectionRef);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const clearAllOptionsInstruments = async () => {
  const collectionRef = collection(db, 'options');
  const querySnapshot = await getDocs(collectionRef);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Clients API
export const getEquityClients = () => FirebaseServices.getAllEquityClients();
export const getForexClients = () => FirebaseServices.getAllForexClients();
export const addEquityClient = (data: any) => FirebaseServices.addEquityClient(data);
export const addForexClient = (data: any) => FirebaseServices.addForexClient(data);
export const updateEquityClient = (data: any) => FirebaseServices.updateEquityClient(data._id, data);
export const updateForexClient = (data: any) => FirebaseServices.updateForexClient(data._id, data);
export const deleteEquityClient = (id: string) => FirebaseServices.deleteEquityClient(id);
export const deleteForexClient = (id: string) => FirebaseServices.deleteForexClient(id);
export const uploadEquityClientCSV = (file: File) => FirebaseServices.importClientCSV(file, 'equity');
export const uploadForexClientCSV = (file: File) => FirebaseServices.importClientCSV(file, 'forex');
export const searchClients = (type: 'equity' | 'forex', searchTerm: string) => FirebaseServices.searchClients(type, searchTerm);
export const downloadEquityClientCSV = (filters: any) => FirebaseServices.downloadEquityClients(filters);
export const downloadForexClientCSV = (filters: any) => FirebaseServices.downloadForexClients(filters);

// Clear all clients
export const clearAllEquityClients = async () => {
  const equityClientCollection = collection(db, 'equityClients');
  const querySnapshot = await getDocs(equityClientCollection);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

export const clearAllForexClients = async () => {
  const forexClientCollection = collection(db, 'forexClients');
  const querySnapshot = await getDocs(forexClientCollection);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// SSI API
export const getSSIRecords = (type: 'equity' | 'forex', searchTerm?: string, currencyPair?: string) => {
  if (type === 'equity') {
    return FirebaseServices.getAllEquitySSI({ search: searchTerm });
  }
  return FirebaseServices.getAllForexSSI({ search: searchTerm, currencyPair });
};
export const addSSIRecord = (type: 'equity' | 'forex', data: any) => {
  if (type === 'equity') {
    return FirebaseServices.addEquitySSI(data);
  }
  return FirebaseServices.addForexSSI(data);
};
export const updateSSIRecord = (type: 'equity' | 'forex', id: string, data: any) => {
  if (type === 'equity') {
    return FirebaseServices.updateEquitySSI(id, data);
  }
  return FirebaseServices.updateForexSSI(id, data);
};
export const deleteSSIRecord = (type: 'equity' | 'forex', id: string) => {
  if (type === 'equity') {
    return FirebaseServices.deleteEquitySSI(id);
  }
  return FirebaseServices.deleteForexSSI(id);
};

// Price API
export const getPrices = () => FirebaseServices.getLatestPrices();
export const addPrice = (data: any) => FirebaseServices.addPrice(data);
export const getLatestPrices = () => FirebaseServices.getLatestPrices();
export const getPriceHistory = (symbol: string, limit?: number) => FirebaseServices.getPriceHistory(symbol, limit);
export const uploadPriceCSV = (file: File, symbol: string) => FirebaseServices.importPriceHistory(file, symbol);
export const deletePrice = async (id: string) => {
  const docRef = doc(db, 'prices', id);
  await deleteDoc(docRef);
  return id;
};

export const deletePriceHistory = async (symbol: string) => {
  const priceCollection = collection(db, 'prices');
  const q = query(priceCollection, where('symbol', '==', symbol));
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Audit API
export const getAuditTrail = (options?: any) => FirebaseServices.getAuditTrail(options);
export const getRecentAuditLogs = (limit?: number) => FirebaseServices.getRecentAuditLogs(limit);

// Notifications API
export const getNotifications = (options?: any) => FirebaseServices.getNotifications(options);
export const addNotification = (data: any) => FirebaseServices.addNotification(data);
export const markNotificationAsRead = (id: string) => FirebaseServices.markNotificationAsRead(id);
export const getUnreadNotificationsCount = (userId?: string) => FirebaseServices.getUnreadNotificationsCount(userId);
export const getRecentNotifications = (limit?: number) => FirebaseServices.getRecentNotifications(limit);

// Recent Instruments
export const getRecentEquityInstruments = async () => {
  const equityCollection = collection(db, 'equity');
  const q = query(equityCollection, orderBy('RID', 'desc'), limit(3));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Reference Data API
export const getReferenceData = () => FirebaseServices.getReferenceData();
export const addReferenceData = (data: any) => FirebaseServices.addReferenceData(data);
export const updateReferenceData = (id: string, data: any) => FirebaseServices.updateReferenceData(id, data);
export const deleteReferenceData = (id: string) => FirebaseServices.deleteReferenceData(id); 