import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function LoginPage({ setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);

      // Send JWT to Chrome extension (with error handling)
      try {
        if (window.chrome && window.chrome.runtime) {
          chrome.runtime.sendMessage({ type: 'SET_TOKEN', token }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Extension not available:', chrome.runtime.lastError.message);
            }
          });
        }
      } catch (err) {
        console.log('Extension communication error:', err);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed', err.response?.data || err);
      // Handle validation errors with field details
      if (err.response?.data?.error?.errors && Array.isArray(err.response.data.error.errors)) {
        const fieldErrors = err.response.data.error.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(', ');
        setError(fieldErrors || err.response.data.error.message);
      } else {
        const errorMsg = err.response?.data?.error?.message || 
                        err.response?.data?.msg || 
                        'Login failed';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
        <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '0.5rem', fontSize: '2rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>Login to your FocusBlock account</p>
        
        {error && (
          <div style={{ 
            color: '#ff6b6b', 
            backgroundColor: '#2a1a1a', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem', 
            border: '1px solid #ff6b6b',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            onKeyPress={handleKeyPress}
            placeholder="Enter your email" 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb', 
              background: '#f3e8ff',
              color: '#1f2937',
              fontSize: '1rem' 
            }}
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            onKeyPress={handleKeyPress}
            placeholder="Enter your password" 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              background: '#f3e8ff',
              color: '#1f2937',
              fontSize: '1rem' 
            }}
            disabled={loading}
          />
        </div>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: loading ? '#d1d5db' : '#a78bfa', 
            color: loading ? '#6b7280' : '#000', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '600', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}