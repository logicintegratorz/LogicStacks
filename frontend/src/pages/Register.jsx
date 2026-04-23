import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const res = await register(name, email, password, role);
        if (res.success) {
            setSuccess(`User "${name}" created successfully as ${role}.`);
            setName('');
            setEmail('');
            setPassword('');
            setRole('User');
        } else {
            setError(res.message);
        }
    };

    return (
        <div style={{ maxWidth: '420px', margin: '40px auto', padding: '28px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#1a202c' }}>Create New User</h2>
            <p style={{ textAlign: 'center', color: '#718096', fontSize: '14px', marginBottom: '24px' }}>Admin-only — create accounts for staff members</p>

            {error && <div style={{ color: '#c53030', padding: '10px', backgroundColor: '#fde0e0', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}
            {success && <div style={{ color: '#2f855a', padding: '10px', backgroundColor: '#c6f6d5', borderRadius: '6px', marginBottom: '15px' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                    >
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    Create Account
                </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/dashboard" style={{ color: '#718096', fontSize: '14px' }}>← Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default Register;
