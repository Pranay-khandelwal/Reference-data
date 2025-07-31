import React from 'react';

function AppSimple() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        Reference Data Management System
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
        ✅ App is working correctly!
      </p>
      <p style={{ fontSize: '16px', color: '#888' }}>
        This is a test page to verify the deployment is working.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Next Steps:</h3>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li>✅ Basic React app is loading</li>
          <li>✅ Vercel deployment is working</li>
          <li>🔧 Need to fix authentication setup</li>
          <li>🔧 Need to configure Firebase properly</li>
        </ul>
      </div>
    </div>
  );
}

export default AppSimple; 