import React, { useState } from 'react';
import api from '../api/axios';
export default function Settings(){
  const [oldPass,setOld]=useState(''); const [newPass,setNew]=useState(''); const [msg,setMsg]=useState('');
  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('username'); window.location='/login'; };
  const changePassword = async (e)=>{ e.preventDefault(); setMsg('Not implemented in starter'); };
  return (<div className="container">
    <div className="card" style={{marginTop:20}}>
      <h2>Settings</h2>
      <p><strong>Account:</strong> {localStorage.getItem('username')}</p>
      <form onSubmit={changePassword}>
        <label>Old password</label><input type="password" value={oldPass} onChange={e=>setOld(e.target.value)} />
        <label>New password</label><input type="password" value={newPass} onChange={e=>setNew(e.target.value)} />
        <div style={{marginTop:10}}><button type="submit">Change password</button></div>
      </form>
      <div style={{marginTop:12}}><button onClick={logout}>Logout</button></div>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </div>
  </div>);
}
