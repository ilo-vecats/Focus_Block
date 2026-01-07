import React from 'react';
import api from '../api/axios';
export default function BlockedTable({ items = [], onDeleted = ()=>{} }){
  const del = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await api.delete('/blocked/' + id); onDeleted(id); } catch(e){ console.error(e); }
  };
  return (<table style={{width:'100%', borderCollapse:'collapse'}}>
    <thead><tr style={{textAlign:'left', borderBottom:'1px solid #eee'}}><th>Name</th><th>Type</th><th>Added</th><th>Action</th></tr></thead>
    <tbody>
      {items.map(it=>(
        <tr key={it._id} style={{borderBottom:'1px solid #f1f1f1'}}>
          <td>{it.name}</td>
          <td>{it.type}</td>
          <td>{new Date(it.createdAt).toLocaleString()}</td>
          <td><button onClick={()=>del(it._id)}>Delete</button></td>
        </tr>
      ))}
      {items.length===0 && <tr><td colSpan={4} style={{padding:12}}>No blocked items yet.</td></tr>}
    </tbody>
  </table>);
}
