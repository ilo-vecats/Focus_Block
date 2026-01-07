import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard({ user, setUser, setToken }) {
  const [newSite, setNewSite] = useState('');
  const [blockedSites, setBlockedSites] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedule, setSchedule] = useState({
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
    days: []
  });
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch blocked sites on load
  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        setLoading(true);
        const res = await api.get('/blocked');
        setBlockedSites(res.data.success ? res.data.data : res.data);
      } catch (err) {
        console.error('Fetch blocked sites error:', err.response?.data || err);
        const errorMsg = err.response?.data?.error?.message || 
                         err.response?.data?.msg || 
                         err.message || 
                         'Failed to load blocked sites';
        alert(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocked();
  }, []);

  // Add new blocked site
  const addSite = async () => {
    if (!newSite.trim()) return alert('Enter a website URL');
    
    const url = newSite.trim();
    if (!url.includes('.') && !url.startsWith('http')) {
      return alert('Please enter a valid website URL (e.g., facebook.com, youtube.com)');
    }

    try {
      setLoading(true);
      const res = await api.post('/blocked', { 
        url: url,
        schedule: schedule.enabled ? schedule : { enabled: false }
      });
      const newSite = res.data.success ? res.data.data : res.data;
      setBlockedSites([...blockedSites, newSite]);
      setNewSite('');
      setSchedule({ enabled: false, startTime: '09:00', endTime: '17:00', days: [] });
      setShowSchedule(false);
      setNote(`"${url}" has been added to your blocked sites!`);
      setTimeout(() => setNote(''), 3000);
    } catch (err) {
      console.error('Add site error:', err.response?.data || err);
      const errorMsg = err.response?.data?.error?.message || 
                       err.response?.data?.msg || 
                       err.message || 
                       'Failed to add site';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Delete a blocked site
  const deleteSite = async (site) => {
    if (!confirm(`Are you sure you want to remove "${site.url}" from your blocked sites?`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/blocked/${site._id}`);
      setBlockedSites(blockedSites.filter(s => s._id !== site._id));
      setNote(`"${site.url}" has been removed from your blocked sites.`);
      setTimeout(() => setNote(''), 3000);
    } catch (err) {
      console.error('Delete site error:', err.response?.data || err);
      const errorMsg = err.response?.data?.error?.message || 
                       err.response?.data?.msg || 
                       err.message || 
                       'Failed to delete site';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (site) => {
    try {
      const res = await api.put(`/blocked/${site._id}`, { isActive: !site.isActive });
      const updatedSite = res.data.success ? res.data.data : res.data;
      setBlockedSites(blockedSites.map(s => s._id === site._id ? updatedSite : s));
    } catch (err) {
      console.error('Toggle active error:', err);
      alert('Failed to update site');
    }
  };

  // Update schedule
  const updateSchedule = async (siteId, newSchedule) => {
    try {
      const res = await api.put(`/blocked/${siteId}`, { schedule: newSchedule });
      const updatedSite = res.data.success ? res.data.data : res.data;
      setBlockedSites(blockedSites.map(s => s._id === siteId ? updatedSite : s));
      setEditingSite(null);
      setNote('Schedule updated successfully!');
      setTimeout(() => setNote(''), 3000);
    } catch (err) {
      console.error('Update schedule error:', err);
      alert('Failed to update schedule');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  };

  // Send token to extension (with error handling)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
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
    }
  }, []);

  if (!user) {
    navigate('/');
    return null;
  }

  const activeCount = blockedSites.filter(s => s.isActive).length;

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ color: '#1f2937', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Welcome back, <span style={{ color: '#a78bfa' }}>{user.username}</span>!
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
          Manage your blocked websites and stay focused
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            {blockedSites.length}
          </div>
          <div style={{ color: '#6b7280' }}>Total Sites</div>
        </div>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.5rem' }}>
            {activeCount}
          </div>
          <div style={{ color: '#6b7280' }}>Active Blocks</div>
        </div>
      </div>

      {/* Add Site Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Add Website to Block
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Enter the website URL you want to block (e.g., facebook.com, youtube.com)
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter website to block (e.g., facebook.com)"
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f3e8ff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
            disabled={loading}
          />
          <button
            onClick={addSite}
            disabled={loading || !newSite.trim()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading ? '#d1d5db' : '#a78bfa',
              color: loading ? '#6b7280' : '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {/* Schedule Toggle */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={schedule.enabled}
              onChange={(e) => {
                setSchedule({ ...schedule, enabled: e.target.checked });
                setShowSchedule(e.target.checked);
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Enable schedule (block only during specific times)</span>
          </label>
        </div>

        {/* Schedule Options */}
        {showSchedule && (
          <div style={{
            backgroundColor: '#f3e8ff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginTop: '1rem'
          }}>
            <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.1rem' }}>Schedule Settings</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#1f2937'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Days of Week
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => {
                      const newDays = schedule.days.includes(day)
                        ? schedule.days.filter(d => d !== day)
                        : [...schedule.days, day];
                      setSchedule({ ...schedule, days: newDays });
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: schedule.days.includes(day) ? '#a78bfa' : '#e5e7eb',
                      color: schedule.days.includes(day) ? '#000' : '#1f2937',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Popular Sites */}
        {blockedSites.length === 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>Popular sites to block:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['facebook.com', 'youtube.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'reddit.com'].map(site => (
                <button
                  key={site}
                  onClick={() => setNewSite(site)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#3a3a3a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blocked Sites List */}
      <div>
        <h2 style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          Your Blocked Websites
        </h2>
        
        {loading && blockedSites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Loading your blocked sites...
          </div>
        ) : blockedSites.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              No websites blocked yet.
            </p>
            <p style={{ color: '#6b7280' }}>
              Add websites above to start blocking distractions!
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {blockedSites.map((site, index) => (
              <div
                key={site._id}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < blockedSites.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3e8ff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '1.1rem' }}>
                        {site.url}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: site.isActive ? '#a78bfa' : '#d1d5db',
                        color: site.isActive ? '#000' : '#6b7280'
                      }}>
                        {site.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {site.schedule && site.schedule.enabled && (
                      <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        📅 Scheduled: {site.schedule.startTime} - {site.schedule.endTime} on {site.schedule.days.join(', ')}
                      </div>
                    )}
                    
                    {site.createdAt && (
                      <div style={{ color: '#6a6a6a', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Added: {new Date(site.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleActive(site)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: site.isActive ? '#d1d5db' : '#a78bfa',
                        color: site.isActive ? '#1f2937' : '#000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                      }}
                    >
                      {site.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setEditingSite(editingSite === site._id ? null : site._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#e5e7eb',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                      }}
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => deleteSite(site)}
                      disabled={loading}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Edit Schedule */}
                {editingSite === site._id && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    backgroundColor: '#f3e8ff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>Edit Schedule</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={site.schedule?.startTime || '09:00'}
                          onChange={(e) => {
                            const newSchedule = {
                              ...site.schedule,
                              enabled: true,
                              startTime: e.target.value
                            };
                            updateSchedule(site._id, newSchedule);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            color: '#1f2937'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          End Time
                        </label>
                        <input
                          type="time"
                          value={site.schedule?.endTime || '17:00'}
                          onChange={(e) => {
                            const newSchedule = {
                              ...site.schedule,
                              enabled: true,
                              endTime: e.target.value
                            };
                            updateSchedule(site._id, newSchedule);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: '#ffffff',
                            color: '#1f2937'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Days of Week
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {daysOfWeek.map(day => (
                          <button
                            key={day}
                            onClick={() => {
                              const currentDays = site.schedule?.days || [];
                              const newDays = currentDays.includes(day)
                                ? currentDays.filter(d => d !== day)
                                : [...currentDays, day];
                              updateSchedule(site._id, {
                                ...site.schedule,
                                enabled: true,
                                days: newDays
                              });
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: (site.schedule?.days || []).includes(day) ? '#a78bfa' : '#e5e7eb',
                              color: (site.schedule?.days || []).includes(day) ? '#000' : '#1f2937',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: '500'
                            }}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => updateSchedule(site._id, { enabled: false, startTime: '', endTime: '', days: [] })}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Disable Schedule
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Message */}
      {note && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '1rem 1.5rem',
          backgroundColor: '#ffffff',
          color: '#a78bfa',
          borderRadius: '8px',
          border: '1px solid #a78bfa',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          {note}
        </div>
      )}
    </div>
  );
}
