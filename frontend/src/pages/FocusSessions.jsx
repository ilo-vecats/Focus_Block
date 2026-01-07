import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function FocusSessions({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 25,
    scheduledStart: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [pagination.page, filters.status]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      if (filters.status) params.append('status', filters.status);
      
      const res = await api.get(`/sessions?${params}`);
      if (res.data.success) {
        setSessions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      alert(err.response?.data?.error?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Prepare data for API
      const sessionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: parseInt(formData.duration) || 25
      };
      
      // Convert datetime-local to ISO8601 format if provided and valid
      if (formData.scheduledStart && formData.scheduledStart.trim() !== '') {
        try {
          // datetime-local returns "YYYY-MM-DDTHH:mm", convert to ISO8601
          const date = new Date(formData.scheduledStart);
          if (!isNaN(date.getTime()) && date > new Date()) {
            sessionData.scheduledStart = date.toISOString();
          } else if (date <= new Date()) {
            alert('Scheduled start time must be in the future');
            return;
          }
        } catch (err) {
          console.error('Date conversion error:', err);
          alert('Invalid date format');
          return;
        }
      }
      
      console.log('Sending session data:', sessionData);
      const res = await api.post('/sessions', sessionData);
      if (res.data.success) {
        setShowCreateForm(false);
        setFormData({ title: '', description: '', duration: 25, scheduledStart: '' });
        fetchSessions();
      }
    } catch (err) {
      console.error('Session creation error:', err.response?.data);
      // Show detailed validation errors
      let errorMsg = 'Failed to create session';
      if (err.response?.data?.error) {
        if (err.response.data.error.errors && Array.isArray(err.response.data.error.errors)) {
          const fieldErrors = err.response.data.error.errors
            .map(e => `${e.field}: ${e.message}`)
            .join('\n');
          errorMsg = fieldErrors || err.response.data.error.message;
        } else {
          errorMsg = err.response.data.error.message;
        }
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const transitionSession = async (sessionId, action) => {
    try {
      setLoading(true);
      const res = await api.put(`/sessions/${sessionId}/${action}`);
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || `Failed to ${action} session`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      setLoading(true);
      const res = await api.delete(`/sessions/${sessionId}`);
      if (res.data.success) {
        fetchSessions();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: '#6b7280',
      SCHEDULED: '#3b82f6',
      ACTIVE: '#10b981',
      COMPLETED: '#8b5cf6',
      CANCELLED: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#1f2937', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Focus <span style={{ color: '#a78bfa' }}>Sessions</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Manage your focus sessions and track productivity
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#a78bfa',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ New Session'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>Create Focus Session</h2>
          <form onSubmit={createSession}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '500' }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#f3e8ff',
                  color: '#1f2937',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#f3e8ff',
                  color: '#1f2937',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '500' }}>
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 25;
                    setFormData({ ...formData, duration: value });
                  }}
                  min={1}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f3e8ff',
                    color: '#1f2937',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '500' }}>
                  Schedule Start (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f3e8ff',
                    color: '#1f2937',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
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
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ color: '#1f2937', fontWeight: '500' }}>Filter by Status:</label>
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ status: e.target.value });
            setPagination({ ...pagination, page: 1 });
          }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#1f2937',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <option value="">All</option>
          <option value="CREATED">Created</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Sessions List */}
      {loading && sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            No focus sessions yet. Create one to get started!
          </p>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            {sessions.map((session, index) => (
              <div
                key={session._id}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < sessions.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3e8ff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ color: '#1f2937', fontSize: '1.25rem', margin: 0 }}>
                        {session.title}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(session.status),
                        color: '#ffffff'
                      }}>
                        {session.status}
                      </span>
                    </div>
                    {session.description && (
                      <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                        {session.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                      <span>Duration: {session.duration} min</span>
                      {session.scheduledStart && (
                        <span>Scheduled: {new Date(session.scheduledStart).toLocaleString()}</span>
                      )}
                      {session.actualStart && (
                        <span>Started: {new Date(session.actualStart).toLocaleString()}</span>
                      )}
                      {session.actualEnd && (
                        <span>Ended: {new Date(session.actualEnd).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {session.status === 'CREATED' && (
                      <>
                        <button
                          onClick={() => transitionSession(session._id, 'start')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}
                        >
                          Start
                        </button>
                        {session.scheduledStart && (
                          <button
                            onClick={() => {
                              const newDate = prompt('Enter new scheduled time (YYYY-MM-DDTHH:mm):', 
                                new Date(session.scheduledStart).toISOString().slice(0, 16));
                              if (newDate) {
                                api.put(`/sessions/${session._id}/schedule`, { scheduledStart: newDate })
                                  .then(() => fetchSessions())
                                  .catch(err => alert(err.response?.data?.error?.message || 'Failed to schedule'));
                              }
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#3b82f6',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '0.9rem'
                            }}
                          >
                            Reschedule
                          </button>
                        )}
                        <button
                          onClick={() => deleteSession(session._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {session.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => transitionSession(session._id, 'start')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}
                        >
                          Start Now
                        </button>
                        <button
                          onClick={() => transitionSession(session._id, 'cancel')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {session.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => transitionSession(session._id, 'complete')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#8b5cf6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => transitionSession(session._id, 'cancel')}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={!pagination.hasPrev || loading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: pagination.hasPrev ? '#a78bfa' : '#d1d5db',
                  color: pagination.hasPrev ? '#000' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                Previous
              </button>
              <span style={{ color: '#1f2937' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={!pagination.hasNext || loading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: pagination.hasNext ? '#a78bfa' : '#d1d5db',
                  color: pagination.hasNext ? '#000' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

