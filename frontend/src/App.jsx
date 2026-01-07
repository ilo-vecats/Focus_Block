import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import FocusSessions from './pages/FocusSessions';

// PrivateRoute wrapper
const PrivateRoute = ({ token, children }) => {
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf5ff' }}>
      <Navbar token={token} onLogout={() => { setToken(null); setUser(null); }} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage token={token} setToken={setToken} setUser={setUser} />} />
          <Route path="/login" element={<LoginPage setToken={setToken} setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setToken={setToken} setUser={setUser} />} />
          <Route path="/dashboard" element={<PrivateRoute token={token}><Dashboard user={user} setUser={setUser} setToken={setToken} /></PrivateRoute>} />
          <Route path="/sessions" element={<PrivateRoute token={token}><FocusSessions user={user} /></PrivateRoute>} />
          <Route path="/statistics" element={<PrivateRoute token={token}><Statistics user={user} /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}