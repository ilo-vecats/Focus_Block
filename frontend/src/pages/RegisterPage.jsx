import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage({ setToken, setUser }){
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(''); 
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  
  const submit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setErr('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setErr('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setErr('');
      await api.post('/auth/register', { username, email, password });
      alert('Registration successful! Please login with your credentials.');
      nav('/');
    } catch(err) { 
      // Handle validation errors with field details
      if (err.response?.data?.error?.errors && Array.isArray(err.response.data.error.errors)) {
        const fieldErrors = err.response.data.error.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(', ');
        setErr(fieldErrors || err.response.data.error.message);
      } else {
        const errorMsg = err.response?.data?.error?.message || 
                        err.response?.data?.msg || 
                        'Registration failed';
        setErr(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ 
        backgroundColor: '#1f2937', 
        padding: '3rem', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#1f2937', textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Start your focus journey today</p>
        {err && <div style={{ color: '#ff6b6b', backgroundColor: '#2a1a1a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #ff6b6b', fontSize: '0.9rem' }}>{err}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>Username</label>
            <input 
              type="text"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f3e8ff', color: '#1f2937', fontSize: '1rem' }}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>Email</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f3e8ff', color: '#1f2937', fontSize: '1rem' }}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f3e8ff', color: '#1f2937', fontSize: '1rem' }}
              placeholder="Enter your password (min 6 characters)"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: loading ? '#d1d5db' : '#a78bfa', 
              color: loading ? '#6b7280' : '#000', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
          Already have an account? <Link to="/" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
