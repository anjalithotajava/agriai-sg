import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const METHOD_META = {
  HYDROPONIC: { icon:"💧", color:"#0EA5E9", bg:"#F0F9FF", label:"Hydroponic" },
  AEROPONIC:  { icon:"💨", color:"#7C3AED", bg:"#F5F3FF", label:"Aeroponic"  },
  AQUAPONIC:  { icon:"🐟", color:"#0D9488", bg:"#F0FDFA", label:"Aquaponic"  },
  SOIL_BASED: { icon:"🌍", color:"#EA580C", bg:"#FFF7ED", label:"Soil-Based" },
};

export default function GrowingUnits() {
  const { farmId } = useParams();
  const nav = useNavigate();
  const [units,  setUnits]  = useState([]);
  const [farm,   setFarm]   = useState(null);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ name:"", areaSqm:"", growingMethod:"HYDROPONIC" });
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);
  const [loading,setLoading]= useState(true);

  const load = () => Promise.all([
    api.get(`/farms/${farmId}/growing-units`),
    api.get(`/farms/${farmId}`),
  ]).then(([u,f]) => { setUnits(u.data); setFarm(f.data); }).finally(()=>setLoading(false));

  useEffect(() => { load(); }, [farmId]);

  const save = async () => {
    if (!form.name || !form.areaSqm) { setErr("Name and area are required."); return; }
    setErr(""); setBusy(true);
    try {
      await api.post(`/farms/${farmId}/growing-units`, { ...form, areaSqm: Number(form.areaSqm) });
      setModal(false); setForm({ name:"", areaSqm:"", growingMethod:"HYDROPONIC" }); load();
    } catch { setErr("Failed to create growing unit."); }
    finally { setBusy(false); }
  };

  const del = async id => {
    if (!window.confirm("Delete this growing unit?")) return;
    await api.delete(`/farms/${farmId}/growing-units/${id}`); load();
  };

  const meta = m => METHOD_META[m] || METHOD_META.HYDROPONIC;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#0D9488,#0EA5E9)",
        borderRadius:20, padding:"22px 28px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        boxShadow:"0 8px 32px rgba(13,148,136,0.25)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{position:"absolute",right:-20,top:-20,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{ zIndex:1 }}>
          <button onClick={()=>nav("/farms")} style={{
            background:"rgba(255,255,255,0.15)", color:"#fff",
            padding:"5px 12px", borderRadius:8, fontSize:12, marginBottom:10,
          }}>← Back to Farms</button>
          <h2 style={{ fontSize:20,fontWeight:800,color:"#fff",marginBottom:2 }}>
            🌿 Growing Units
          </h2>
          <p style={{ color:"rgba(255,255,255,0.8)",fontSize:13 }}>
            {farm?.name} · {units.length} unit{units.length!==1?"s":""}
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{
          background:"#fff", color:"#0D9488",
          padding:"10px 22px", borderRadius:12,
          fontSize:14, fontWeight:700, zIndex:1,
          boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
        }}>+ Add Unit</button>
      </div>

      {/* Units grid */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
          {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:160,borderRadius:16}}/>)}
        </div>
      ) : units.length === 0 ? (
        <div className="card" style={{ padding:52,textAlign:"center" }}>
          <div className="float-anim" style={{ fontSize:44,marginBottom:14 }}>🌿</div>
          <h3 style={{ fontSize:16,fontWeight:700,color:"#0F172A",marginBottom:8 }}>No growing units yet</h3>
          <p style={{ fontSize:13,color:"#94A3B8",marginBottom:20 }}>Add racks, plots or towers for this farm</p>
          <button onClick={()=>setModal(true)} style={{
            background:"linear-gradient(135deg,#0D9488,#0EA5E9)",
            color:"#fff",padding:"10px 24px",borderRadius:12,fontSize:14,fontWeight:700,
            boxShadow:"0 4px 14px rgba(13,148,136,0.3)",
          }}>+ Add Growing Unit</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
          {units.map(u => {
            const m = meta(u.growingMethod);
            return (
              <div key={u.id} className="card" style={{ padding:20, position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    background:m.bg, borderRadius:999, padding:"4px 10px",
                  }}>
                    <span style={{ fontSize:13 }}>{m.icon}</span>
                    <span style={{ fontSize:11,fontWeight:700,color:m.color }}>{m.label}</span>
                  </div>
                  <button onClick={()=>del(u.id)} style={{
                    background:"#FFF1F2",color:"#BE123C",
                    padding:"4px 8px",borderRadius:8,fontSize:11,
                  }}>✕</button>
                </div>

                <h3 style={{ fontSize:15,fontWeight:700,color:"#0F172A",marginBottom:4 }}>{u.name}</h3>
                <p style={{ fontSize:12,color:"#94A3B8",marginBottom:16 }}>
                  📐 {u.areaSqm} m²
                </p>

                <button onClick={()=>nav(`/farms/${farmId}/growing-units/${u.id}/crops`)} style={{
                  width:"100%", background:"linear-gradient(135deg,#0D9488,#0EA5E9)",
                  color:"#fff", padding:"9px 0", borderRadius:10,
                  fontSize:12, fontWeight:700,
                  boxShadow:"0 2px 8px rgba(13,148,136,0.25)",
                }}>
                  🌱 Manage Crops →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,
          backdropFilter:"blur(4px)",
        }}>
          <div className="fade-in" style={{
            background:"#fff",borderRadius:20,padding:32,width:420,
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#0F172A",marginBottom:20 }}>🌿 Add Growing Unit</h3>

            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Unit name</label>
                <input value={form.name} placeholder="e.g. Rack A1, Rooftop Plot 1"
                  onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Area (m²)</label>
                <input type="number" value={form.areaSqm} placeholder="e.g. 12"
                  onChange={e=>setForm({...form,areaSqm:e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8 }}>Growing method</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {Object.entries(METHOD_META).map(([k,m])=>(
                    <button key={k} onClick={()=>setForm({...form,growingMethod:k})} style={{
                      padding:"10px 12px",borderRadius:10,fontSize:12,fontWeight:600,
                      background:form.growingMethod===k ? m.bg : "#F8FAFC",
                      color:form.growingMethod===k ? m.color : "#64748B",
                      border:form.growingMethod===k ? `2px solid ${m.color}` : "1.5px solid #E2E8F0",
                    }}>{m.icon} {m.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {err && <div style={{ marginTop:12,background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,padding:"9px 14px",color:"#BE123C",fontSize:13 }}>⚠️ {err}</div>}

            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={()=>{setModal(false);setErr("");}} style={{ flex:1,background:"#F1F5F9",color:"#64748B",padding:"11px 0",borderRadius:10 }}>Cancel</button>
              <button onClick={save} disabled={busy} style={{
                flex:2,background:"linear-gradient(135deg,#0D9488,#0EA5E9)",
                color:"#fff",padding:"11px 0",borderRadius:10,fontWeight:700,
                boxShadow:"0 4px 14px rgba(13,148,136,0.3)",
              }}>{busy?"⏳ Saving…":"✓ Create Unit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
