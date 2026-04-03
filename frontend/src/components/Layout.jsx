import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '30px', margin: '0 auto', width: '100%', maxWidth: '1200px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
