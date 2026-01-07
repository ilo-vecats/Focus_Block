import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Statistics({ user }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/stats?days=${days}`);
      setStats(res.data.success ? res.data.data : res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalBlockedAttempts = stats.reduce((sum, stat) => sum + (stat.blockedAttempts || 0), 0);
  const totalFocusTime = stats.reduce((sum, stat) => sum + (stat.focusTime || 0), 0);
  const uniqueSites = new Set();
  stats.forEach(stat => {
    if (stat.sitesBlocked) {
      stat.sitesBlocked.forEach(site => uniqueSites.add(site));
    }
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#1f2937', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Your <span style={{ color: '#a78bfa' }}>Statistics</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Track your productivity and blocked attempts
        </p>
      </div>

      {/* Time Range Selector */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: days === d ? '#a78bfa' : '#e5e7eb',
              color: days === d ? '#000' : '#1f2937',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            {totalBlockedAttempts}
          </div>
          <div style={{ color: '#6b7280' }}>Blocked Attempts</div>
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            {totalFocusTime}
          </div>
          <div style={{ color: '#6b7280' }}>Focus Time (minutes)</div>
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            {uniqueSites.size}
          </div>
          <div style={{ color: '#6b7280' }}>Unique Sites Blocked</div>
        </div>
      </div>

      {/* Daily Stats */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Daily Breakdown</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Loading statistics...
          </div>
        ) : stats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            No statistics available for this period.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ color: '#1f2937', fontWeight: '600', fontSize: '1.1rem' }}>
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ color: '#a78bfa', fontWeight: '600' }}>
                    {stat.blockedAttempts || 0} attempts blocked
                  </div>
                </div>
                {stat.sitesBlocked && stat.sitesBlocked.length > 0 && (
                  <div>
                    <div style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sites blocked:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {stat.sitesBlocked.map((site, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#e5e7eb',
                            color: '#1f2937',
                            borderRadius: '12px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {site}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

