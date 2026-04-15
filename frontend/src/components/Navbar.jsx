import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Order', path: '/order' },
    { name: 'Gate Entry', path: '/gate-entry' },
    { name: 'Receipt', path: '/receipt' },
    { name: 'Indent Add', path: '/indent/add' },
    { name: 'Indents', path: '/indent/list' },
    { name: 'PO Add', path: '/po/add' },
    { name: 'PO List', path: '/po/list' },
    { name: 'Issue', path: '/issue' },
    { name: 'Issue List', path: '/issue/list' },
    { name: 'Operations', path: '/operations' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Parties', path: '/vendors' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', width: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Logo icon placeholder */}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>P</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', letterSpacing: '-0.5px' }}>ProductUI</span>
          <span style={{ fontSize: '16px', color: '#4a5568', marginLeft: '15px', fontWeight: '500' }}>
            {location.pathname === '/products' ? 'Add Product' : location.pathname === '/categories' ? 'Manage Categories' : 'Dashboard'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#cbd5e1', overflow: 'hidden' }}>
            <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>{user?.name || 'Admin'}</span>
        </div>
      </div>

      {/* Sub Navbar Links */}
      <div style={{ padding: '10px 30px', display: 'flex', gap: '20px', overflowX: 'auto' }}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: location.pathname === link.path ? '#2b6cb0' : '#718096',
              borderBottom: location.pathname === link.path ? '2px solid #2b6cb0' : 'none',
              paddingBottom: '4px'
            }}
          >
            {link.name}
          </Link>
        ))}
        <button 
           onClick={logout} 
           style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0 }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
