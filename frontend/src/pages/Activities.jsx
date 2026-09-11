import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const TYPE_META = {
  IRRIGATION:   { icon:"💧", color:"#0EA5E9", bg:"#F0F9FF", label:"Irrigation" },
  FERTILISATION:{ icon:"🧪", color:"#7C3AED", bg:"#F5F3FF", label:"Fertilisation" },
  PLANTING:     { icon:"🌱", color:"#0D6B3F", bg:"#E8F8EE", label:"Planting" },
  HARVESTING:   { icon:"✂️", color:"#EA580C", bg:"#FFF7ED", label:"Harvesting" },
  PESTICIDE:    { icon:"🌿", color:"#0D9488", bg:"#F0FDFA", label:"Pesticide" },
};

export default function Activities() {
  const { farmId } = useParams();
  const nav = useNavigate();
  const [acts,   setActs]   = useState([]);
  const [units,  setUnits]  = useState([]);
  const [farm,   setFarm]   = useState(null);
  const [modal,  setModal]  = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [form,   setForm]   = useState({ type:"IRRIGATION", activityDate:"", growingUnitId:"", notes:"", quantity:"" });
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);
  const [loading,setLoading]= useState(true);

  const load = () => Promise.all([
    api.get(`/farms/${farmId}/activities`),
    api.get(`/farms/${farmId}/growing-units`),
    api.get(`/farms/${farmId}`),
  ]).then(([a,u,f])=>{ setActs(a.data); setUnits(u.data); setFarm(f.data); }).finally(()=>setLoading(false));

  useEffect(()=>{ load(); },[farmId]);

  const save = async () => {
    if (!form.activityDate) { setErr("Date is required."); return; }
    setErr(""); setBusy(true);
    try {
      await api.post(`/farms/${farmId}/activities`, {
        type: form.type,
        activityDate: form.activityDate,
        notes: form.notes || null,
        quantity: form.quantity || null,
        growingUnitId: form.growingUnitId ? Number(form.growingUnitId) : null,
      });
      setModal(false); setForm({ type:"IRRIGATION",activityDate:"",growingUnitId:"",notes:"",quantity:"" }); load();
    } catch { setErr("Failed to log activity."); }
    finally { setBusy(false); }
  };

  const del = async id => {
    if (!window.confirm("Delete this activity?")) return;
    await api.delete(`/farms/${farmId}/activities/${id}`); load();
  };

  const filtered = filter==="ALL" ? acts : acts.filter(a=>a.type===filter);

  const summary = Object.entries(TYPE_META).map(([k,m])=>({
    ...m, type:k, count: acts.filter(a=>a.type===k).length,
  }));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#0F172A,#1E3A5F,#0D6B3F)",
        borderRadius:20,padding:"22px 28px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        boxShadow:"0 8px 32px rgba(15,23,42,0.3)",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
        <div style={{ zIndex:1 }}>
          <button onClick={()=>nav("/farms")} style={{
            background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.8)",
            padding:"5px 12px",borderRadius:8,fontSize:12,marginBottom:10,
          }}>← Back to Farms</button>
          <h2 style={{ fontSize:20,fontWeight:800,color:"#fff",marginBottom:2 }}>📋 Activity Log</h2>
          <p style={{ color:"rgba(255,255,255,0.7)",fontSize:13 }}>
            {farm?.name} · {acts.length} total activities
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{
          background:"linear-gradient(135deg,#1A9456,#0D9488)",
          color:"#fff",padding:"10px 22px",borderRadius:12,
          fontSize:14,fontWeight:700,zIndex:1,
          boxShadow:"0 4px 14px rgba(26,148,86,0.4)",
        }}>+ Log Activity</button>
      </div>

      {/* Activity type summary cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
        {summary.map(s=>(
          <div key={s.type} onClick={()=>setFilter(filter===s.type?"ALL":s.type)}
            className="card" style={{
              padding:"14px 16px", cursor:"pointer",
              border: filter===s.type ? `2px solid ${s.color}` : "1px solid #E2E8F0",
              background: filter===s.type ? s.bg : "#fff",
            }}>
            <div style={{ fontSize:20,marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:20,fontWeight:800,color:s.color }}>{s.count}</div>
            <div style={{ fontSize:11,color:"#94A3B8",marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="skeleton" style={{ height:200,borderRadius:16 }}/>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding:48,textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>📋</div>
          <p style={{ color:"#94A3B8",fontSize:13 }}>No activities found</p>
        </div>
      ) : (
        <div className="card" style={{ overflow:"hidden" }}>
          {filtered.map((a,i)=>{
            const m = TYPE_META[a.type] || { icon:"📝",color:"#64748B",bg:"#F8FAFC",label:a.type };
            return (
              <div key={a.id} style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"14px 20px",
                borderTop:i>0?"1px solid #F1F5F9":"none",
                transition:"background 0.15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                <div style={{
                  width:40,height:40,borderRadius:10,flexShrink:0,
                  background:m.bg,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:18,border:`1px solid ${m.color}22`,
                }}>{m.icon}</div>

                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                    <span style={{ fontSize:13,fontWeight:700,color:"#0F172A" }}>{m.label}</span>
                    {a.growingUnitId && (
                      <span style={{
                        fontSize:10,fontWeight:600,color:"#0D9488",
                        background:"#F0FDFA",padding:"2px 7px",borderRadius:999,
                      }}>📍 {units.find(u=>u.id===a.growingUnitId)?.name||"Unit"}</span>
                    )}
                  </div>
                  <p style={{ fontSize:12,color:"#94A3B8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                    {a.notes||"No notes"}{a.quantity?` · ${a.quantity}`:""}
                  </p>
                </div>

                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:"#374151" }}>{a.activityDate}</div>
                  <div style={{ fontSize:11,color:"#94A3B8",marginTop:2 }}>
                    {a.loggedBy?.name||"Unknown"}
                  </div>
                </div>

                <button onClick={()=>del(a.id)} style={{
                  background:"#FFF1F2",color:"#BE123C",
                  padding:"6px 10px",borderRadius:8,fontSize:12,flexShrink:0,
                }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Activity Modal */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
          <div className="fade-in" style={{background:"#fff",borderRadius:20,padding:32,width:460,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#0F172A",marginBottom:20 }}>📋 Log Activity</h3>

            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8 }}>Activity type</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                  {Object.entries(TYPE_META).map(([k,m])=>(
                    <button key={k} onClick={()=>setForm({...form,type:k})} style={{
                      padding:"9px 10px",borderRadius:10,fontSize:12,fontWeight:600,
                      background:form.type===k ? m.bg : "#F8FAFC",
                      color:form.type===k ? m.color : "#64748B",
                      border:form.type===k ? `2px solid ${m.color}` : "1.5px solid #E2E8F0",
                    }}>{m.icon} {m.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Growing unit (optional)</label>
                <select value={form.growingUnitId} onChange={e=>setForm({...form,growingUnitId:e.target.value})}>
                  <option value="">— Farm-wide activity —</option>
                  {units.map(u=><option key={u.id} value={u.id}>{u.name} ({u.growingMethod?.replace("_"," ")}, {u.areaSqm} m²)</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Date *</label>
                <input type="date" value={form.activityDate} onChange={e=>setForm({...form,activityDate:e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Notes</label>
                <textarea rows={2} value={form.notes} placeholder="Describe what was done…"
                  onChange={e=>setForm({...form,notes:e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Quantity used</label>
                <input value={form.quantity} placeholder="e.g. 5 litres, 200 ml"
                  onChange={e=>setForm({...form,quantity:e.target.value})} />
              </div>
            </div>

            {err && <div style={{ marginTop:12,background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,padding:"9px 14px",color:"#BE123C",fontSize:13 }}>⚠️ {err}</div>}

            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={()=>{setModal(false);setErr("");}} style={{ flex:1,background:"#F1F5F9",color:"#64748B",padding:"11px 0",borderRadius:10 }}>Cancel</button>
              <button onClick={save} disabled={busy} style={{
                flex:2,background:"linear-gradient(135deg,#1A9456,#0D9488)",
                color:"#fff",padding:"11px 0",borderRadius:10,fontWeight:700,
                boxShadow:"0 4px 14px rgba(26,148,86,0.3)",
              }}>{busy?"⏳ Saving…":"✓ Log Activity"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
