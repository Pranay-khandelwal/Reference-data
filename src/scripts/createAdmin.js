const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../firebase/serviceAccount.json');

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function createAdminUser() {
  const adminUid = '9bk5ZSOcGGeyKZUTWk2b9Uld8Gh1'; // Your actual UID

  try {
    // First, delete the old admin documents if they exist
    await db.collection('admins').doc('admin_user').delete().catch(() => {});
    await db.collection('users').doc(adminUid).delete().catch(() => {});

    // Create admin document with the actual UID
    await db.collection('admins').doc(adminUid).set({
      email: 'kshitijkadam4@gmail.com',
      createdAt: new Date(),
      role: 'admin'
    });

    // Create user profile with the actual UID
    await db.collection('users').doc(adminUid).set({
      email: 'kshitijkadam4@gmail.com',
      displayName: 'Kshitij Kadam',
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date()
    });

    console.log('Admin user updated successfully with correct UID');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 