import React, { useState } from 'react';
import api from '../api/axios';
export default function AddBlockedForm({ onAdded }){
  const [name,setName]=useState(''); const [type,setType]=useState('Website'); const [reason,setReason]=useState('');
  const submit = async (e)=>{ e.preventDefault();
    try {
      const res = await api.post('/blocked', { name, type, reason });
      setName(''); setReason('');
      if (onAdded) onAdded(res.data);
    } catch(err){ console.error(err); }
  };
  return (<div className="card">
    <h3>Add blocked item</h3>
    <form onSubmit={submit}>
      <label>Name (e.g. facebook.com)</label>
      <input value={name} onChange={e=>setName(e.target.value)} required />
      <label>Type</label>
      <select value={type} onChange={e=>setType(e.target.value)}><option>Website</option><option>App</option></select>
      <label>Reason (optional)</label>
      <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} />
      <div style={{marginTop:8}}><button type="submit">Block Now</button></div>
    </form>
  </div>);
}
