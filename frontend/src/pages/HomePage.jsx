import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function HomePage({ token, setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert('Enter email and password');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);

      // Send token to extension (with error handling)
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
      console.error(err);
      const errorMsg = err.response?.data?.error?.message || 
                      err.response?.data?.msg || 
                      'Login failed';
      alert(errorMsg);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) return alert('Enter all fields');
    try {
      await api.post('/auth/register', { username, email, password });
      alert('Registration successful! Please login.');
      setIsLogin(true);
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error?.message || 
                      err.response?.data?.msg || 
                      'Registration failed';
      alert(errorMsg);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)',
        padding: '6rem 2rem',
        textAlign: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          Beyond Distractions.<br />
          <span style={{ color: '#a78bfa' }}>Redefining Focus.</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          maxWidth: '700px',
          margin: '0 auto 3rem',
          lineHeight: '1.6'
        }}>
          Take control of your digital environment with FocusBlock. Block distracting websites, 
          schedule focus sessions, and track your productivity—all in one simple tool.
        </p>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            Block
          </div>
          <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Any Website Instantly
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            Schedule
          </div>
          <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Time-Based Blocking
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            Track
          </div>
          <div style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Your Productivity
          </div>
        </div>
      </div>

      {/* Login/Register Section */}
      {!token && (
        <div style={{
          maxWidth: '500px',
          margin: '4rem auto',
          padding: '2rem',
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', marginBottom: '2rem', gap: '0' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: isLogin ? '#a78bfa' : '#e5e7eb',
                color: isLogin ? '#000' : '#1f2937',
                border: 'none',
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: !isLogin ? '#a78bfa' : '#e5e7eb',
                color: !isLogin ? '#000' : '#1f2937',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Register
            </button>
          </div>

          <h2 style={{ color: '#1f2937', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          
          {!isLogin && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#f3e8ff',
                color: '#1f2937',
                fontSize: '1rem'
              }}
            />
          )}
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f3e8ff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f3e8ff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                isLogin ? handleLogin() : handleRegister();
              }
            }}
          />
          <button
            onClick={isLogin ? handleLogin : handleRegister}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#a78bfa',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </div>
      )}
    </div>
  );
}