import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from '../firebase/serviceAccount.json';

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as any)
});

const db = getFirestore();

async function createAdminUser() {
  try {
    // Create admin document
    await db.collection('admins').doc('admin_user').set({
      email: 'kshitij.kadam@barclays.com', // Replace with your actual admin email
      createdAt: new Date(),
      role: 'admin'
    });

    // Create user profile
    await db.collection('users').doc('admin_user').set({
      email: 'kshitij.kadam@barclays.com', // Replace with your actual admin email
      displayName: 'Kshitij Kadam',
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 