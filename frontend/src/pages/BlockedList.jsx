import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import BlockedTable from '../components/BlockedTable';
import AddBlockedForm from '../components/AddBlockedForm';

export default function BlockedList(){
  const [list,setList]=useState([]);
  const load = async ()=>{ try{ const res = await api.get('/blocked'); setList(res.data); }catch(e){} };
  useEffect(()=>{ load(); }, []);
  const onAdded = (item)=> setList(prev=>[item,...prev]);
  const onDeleted = (id)=> setList(prev=>prev.filter(p=>p._id!==id));
  return (<div className="container">
    <div className="card" style={{marginTop:20}}>
      <h2>Blocked Items</h2>
      <div style={{display:'flex', gap:16}}>
        <div style={{flex:1}}>
          <BlockedTable items={list} onDeleted={onDeleted}/>
        </div>
        <div style={{width:320}}>
          <AddBlockedForm onAdded={onAdded}/>
        </div>
      </div>
    </div>
  </div>);
}
