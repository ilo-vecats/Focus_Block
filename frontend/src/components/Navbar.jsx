import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ token, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout?.();
    navigate('/');
  };

  return (
    <nav
      style={{
        padding: '1.5rem 2rem',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link 
          to="/" 
          style={{ 
            color: '#a78bfa', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            letterSpacing: '0.5px'
          }}
        >
          FocusBlock
        </Link>
        {token && (
          <>
            <Link 
              to="/dashboard" 
              style={{ 
                color: '#1f2937', 
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s'
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/sessions" 
              style={{ 
                color: '#1f2937', 
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s'
              }}
            >
              Sessions
            </Link>
            <Link 
              to="/statistics" 
              style={{ 
                color: '#1f2937', 
                textDecoration: 'none',
                fontSize: '1rem',
                transition: 'color 0.2s'
              }}
            >
              Statistics
            </Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {token ? (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#f3e8ff',
              color: '#8b5cf6',
              border: '1px solid #e9d5ff',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e9d5ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f3e8ff';
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link 
              to="/login" 
              style={{ 
                color: '#1f2937', 
                textDecoration: 'none',
                fontSize: '1rem'
              }}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{ 
                color: '#1f2937', 
                textDecoration: 'none',
                fontSize: '1rem'
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}