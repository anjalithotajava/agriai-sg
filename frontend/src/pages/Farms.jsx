import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const FARM_EMOJIS = ["🏗️","🌾","🏭","🌿","🏡","🌱"];
const GRADIENTS = [
  "linear-gradient(135deg,#0D6B3F,#1A9456)",
  "linear-gradient(135deg,#0D9488,#0EA5E9)",
  "linear-gradient(135deg,#7C3AED,#2563EB)",
  "linear-gradient(135deg,#EA580C,#F59E0B)",
  "linear-gradient(135deg,#E11D48,#F59E0B)",
  "linear-gradient(135deg,#0D9488,#1A9456)",
];

export default function Farms() {
  const nav = useNavigate();
  const [farms,  setFarms]  = useState([]);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ name:"", location:"", totalArea:"" });
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);
  const [loading,setLoading]= useState(true);

  const load = () =>
    api.get("/farms").then(r => setFarms(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.location) { setErr("Farm name and location are required."); return; }
    setErr(""); setBusy(true);
    try {
      await api.post("/farms", { ...form, totalArea: Number(form.totalArea) || 0 });
      setModal(false); setForm({ name:"", location:"", totalArea:"" }); load();
    } catch { setErr("Failed to create farm. Please try again."); }
    finally { setBusy(false); }
  };

  const del = async id => {
    if (!window.confirm("Delete this farm and all its data?")) return;
    await api.delete(`/farms/${id}`); load();
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#0D6B3F,#1A9456,#52C97A)",
        borderRadius:20, padding:"24px 28px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        boxShadow:"0 8px 32px rgba(13,107,63,0.25)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{position:"absolute",right:-30,top:-30,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{ zIndex:1 }}>
          <h2 style={{ fontSize:22,fontWeight:800,color:"#fff",marginBottom:4 }}>🏗️ Farm Management</h2>
          <p style={{ color:"rgba(255,255,255,0.75)",fontSize:13 }}>
            {farms.length} farm{farms.length!==1?"s":""} registered · Click a farm to manage growing units
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{
          background:"#fff", color:"#0D6B3F",
          padding:"10px 22px", borderRadius:12,
          fontSize:14, fontWeight:700, zIndex:1,
          boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
        }}>
          + New Farm
        </button>
      </div>

      {/* Farm cards grid */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:200,borderRadius:16}}/>)}
        </div>
      ) : farms.length === 0 ? (
        <div className="card" style={{
          padding:64, textAlign:"center",
        }}>
          <div className="float-anim" style={{ fontSize:52, marginBottom:16 }}>🌱</div>
          <h3 style={{ fontSize:18,fontWeight:700,color:"#0F172A",marginBottom:8 }}>No farms yet</h3>
          <p style={{ fontSize:14,color:"#94A3B8",marginBottom:24 }}>
            Add your first farm to start managing growing units and crops
          </p>
          <button onClick={()=>setModal(true)} style={{
            background:"linear-gradient(135deg,#0D6B3F,#1A9456)",
            color:"#fff", padding:"12px 28px",
            borderRadius:12, fontSize:14, fontWeight:700,
            boxShadow:"0 4px 14px rgba(13,107,63,0.3)",
          }}>
            + Add Your First Farm
          </button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {farms.map((farm,i) => (
            <div key={farm.id} className="card" style={{
              padding:0, overflow:"hidden", cursor:"pointer",
            }}>
              {/* Card header with gradient */}
              <div style={{
                background: GRADIENTS[i % GRADIENTS.length],
                padding:"20px 20px 16px",
                position:"relative", overflow:"hidden",
              }}>
                <div style={{
                  position:"absolute", right:-16, top:-16,
                  width:80, height:80, borderRadius:"50%",
                  background:"rgba(255,255,255,0.1)",
                }}/>
                <div style={{ fontSize:32, marginBottom:8 }}>
                  {FARM_EMOJIS[i % FARM_EMOJIS.length]}
                </div>
                <h3 style={{ fontSize:17,fontWeight:800,color:"#fff",marginBottom:2 }}>
                  {farm.name}
                </h3>
                <p style={{ fontSize:12,color:"rgba(255,255,255,0.8)" }}>
                  📍 {farm.location}
                </p>
              </div>

              {/* Card body */}
              <div style={{ padding:"16px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#0D6B3F" }}>
                      {farm.totalArea || "—"}
                    </div>
                    <div style={{ fontSize:11,color:"#94A3B8" }}>Area (m²)</div>
                  </div>
                  <div style={{ width:1, background:"#F1F5F9" }}/>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#0D9488" }}>
                      Active
                    </div>
                    <div style={{ fontSize:11,color:"#94A3B8" }}>Status</div>
                  </div>
                  <div style={{ width:1, background:"#F1F5F9" }}/>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#7C3AED" }}>
                      {new Date(farm.createdAt||Date.now()).getFullYear()}
                    </div>
                    <div style={{ fontSize:11,color:"#94A3B8" }}>Year</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>nav(`/farms/${farm.id}/growing-units`)} style={{
                    flex:1, background:"#E8F8EE", color:"#0D6B3F",
                    padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700,
                  }}>
                    🌿 Growing Units
                  </button>
                  <button onClick={()=>nav(`/farms/${farm.id}/activities`)} style={{
                    flex:1, background:"#F0F9FF", color:"#0EA5E9",
                    padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700,
                  }}>
                    📋 Activities
                  </button>
                  <button onClick={()=>del(farm.id)} style={{
                    background:"#FFF1F2", color:"#BE123C",
                    padding:"9px 12px", borderRadius:10, fontSize:12,
                  }}>
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(15,23,42,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200,
          backdropFilter:"blur(4px)",
        }}>
          <div className="fade-in" style={{
            background:"#fff", borderRadius:20, padding:32, width:440,
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <div style={{
                width:44,height:44,borderRadius:12,
                background:"linear-gradient(135deg,#0D6B3F,#1A9456)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
              }}>🏗️</div>
              <div>
                <h3 style={{ fontSize:18,fontWeight:800,color:"#0F172A" }}>Add New Farm</h3>
                <p style={{ fontSize:12,color:"#94A3B8" }}>Enter your farm details below</p>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                ["Farm name","name","text","e.g. Tampines Rooftop Farm"],
                ["Location","location","text","e.g. Tampines, Singapore"],
                ["Total area (m²)","totalArea","number","e.g. 180"],
              ].map(([label,key,type,ph])=>(
                <div key={key}>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>{label}</label>
                  <input type={type} value={form[key]} placeholder={ph}
                    onChange={e=>setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
            </div>

            {err && (
              <div style={{
                marginTop:12, background:"#FFF1F2", border:"1px solid #FECDD3",
                borderRadius:10, padding:"9px 14px", color:"#BE123C", fontSize:13,
              }}>⚠️ {err}</div>
            )}

            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={()=>{setModal(false);setErr("");}} style={{
                flex:1, background:"#F1F5F9", color:"#64748B",
                padding:"11px 0", borderRadius:10, fontSize:14,
              }}>Cancel</button>
              <button onClick={save} disabled={busy} style={{
                flex:2, background:"linear-gradient(135deg,#0D6B3F,#1A9456)",
                color:"#fff", padding:"11px 0", borderRadius:10, fontSize:14, fontWeight:700,
                boxShadow:"0 4px 14px rgba(13,107,63,0.3)",
              }}>
                {busy ? "⏳ Saving…" : "✓ Create Farm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
