import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const CROP_ICONS = { Kale:"🥬","Bok Choy":"🥦",Lettuce:"🥗",Spinach:"🍃","Chinese Cabbage":"🥬",Tomato:"🍅",Cucumber:"🥒",Herbs:"🌿" };

const StatusBadge = ({ harvested }) => (
  <span style={{
    display:"inline-flex",alignItems:"center",gap:4,
    padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:700,
    background:harvested?"#D1FAE5":"#FEF3C7",
    color:harvested?"#065F46":"#92400E",
  }}>
    {harvested?"✅ Harvested":"🌱 Growing"}
  </span>
);

export default function Crops() {
  const { farmId, unitId } = useParams();
  const nav = useNavigate();
  const [crops,  setCrops]  = useState([]);
  const [unit,   setUnit]   = useState(null);
  const [modal,  setModal]  = useState(false);
  const [harvestModal, setHarvestModal] = useState(null);
  const [form,   setForm]   = useState({ cropType:"Kale", plantingDate:"", expectedYieldPerSqm:"", expectedHarvestDate:"" });
  const [actualYield, setActualYield] = useState("");
  const [err,    setErr]    = useState("");
  const [busy,   setBusy]   = useState(false);
  const [loading,setLoading]= useState(true);

  const load = () => Promise.all([
    api.get(`/farms/${farmId}/growing-units/${unitId}/crops`),
    //api.get(`/farms/${farmId}/growing-units/${unitId}`),
  ]).then(([c,u]) => { setCrops(c.data); setUnit(u.data); }).finally(()=>setLoading(false));

  useEffect(() => { load(); }, [unitId]);

  const save = async () => {
    if (!form.cropType || !form.plantingDate) { setErr("Crop type and planting date are required."); return; }
    setErr(""); setBusy(true);
    try {
      await api.post(`/farms/${farmId}/growing-units/${unitId}/crops`, {
        ...form,
        expectedYieldPerSqm: Number(form.expectedYieldPerSqm) || null,
      });
      setModal(false); setForm({ cropType:"Kale",plantingDate:"",expectedYieldPerSqm:"",expectedHarvestDate:"" }); load();
    } catch { setErr("Failed to add crop."); }
    finally { setBusy(false); }
  };

  const harvest = async () => {
    if (!actualYield) { setErr("Enter actual yield."); return; }
    await api.patch(`/farms/${farmId}/growing-units/${unitId}/crops/${harvestModal}/harvest`, {
      actualYield: Number(actualYield),
    });
    setHarvestModal(null); setActualYield(""); load();
  };

  const del = async id => {
    if (!window.confirm("Delete this crop?")) return;
    await api.delete(`/farms/${farmId}/growing-units/${unitId}/crops/${id}`); load();
  };

  const CROP_TYPES = Object.keys(CROP_ICONS);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#F59E0B,#EA580C)",
        borderRadius:20,padding:"22px 28px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        boxShadow:"0 8px 32px rgba(245,158,11,0.25)",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",right:-20,top:-20,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{ zIndex:1 }}>
          <button onClick={()=>nav(`/farms/${farmId}/growing-units`)} style={{
            background:"rgba(255,255,255,0.15)",color:"#fff",
            padding:"5px 12px",borderRadius:8,fontSize:12,marginBottom:10,
          }}>← Growing Units</button>
          <h2 style={{ fontSize:20,fontWeight:800,color:"#fff",marginBottom:2 }}>🌱 Crop Management</h2>
          <p style={{ color:"rgba(255,255,255,0.8)",fontSize:13 }}>
            {unit?.name} · {crops.length} crop{crops.length!==1?"s":""}
          </p>
        </div>
        <button onClick={()=>setModal(true)} style={{
          background:"#fff",color:"#EA580C",
          padding:"10px 22px",borderRadius:12,
          fontSize:14,fontWeight:700,zIndex:1,
          boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
        }}>+ Plant Crop</button>
      </div>

      {/* Crops table */}
      {loading ? (
        <div className="skeleton" style={{ height:200,borderRadius:16 }}/>
      ) : crops.length === 0 ? (
        <div className="card" style={{ padding:52,textAlign:"center" }}>
          <div className="float-anim" style={{ fontSize:44,marginBottom:14 }}>🌱</div>
          <h3 style={{ fontSize:16,fontWeight:700,color:"#0F172A",marginBottom:8 }}>No crops planted yet</h3>
          <p style={{ fontSize:13,color:"#94A3B8",marginBottom:20 }}>Plant your first crop to start tracking the growth cycle</p>
          <button onClick={()=>setModal(true)} style={{
            background:"linear-gradient(135deg,#F59E0B,#EA580C)",
            color:"#fff",padding:"10px 24px",borderRadius:12,fontSize:14,fontWeight:700,
            boxShadow:"0 4px 14px rgba(245,158,11,0.3)",
          }}>+ Plant First Crop</button>
        </div>
      ) : (
        <div className="card" style={{ overflow:"hidden" }}>
          <table>
            <thead>
              <tr>
                {["Crop","Planted","Expected Harvest","Exp. Yield (kg/m²)","Status","Actions"].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crops.map(c=>(
                <tr key={c.id}>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontSize:18 }}>{CROP_ICONS[c.cropType]||"🌱"}</span>
                      <span style={{ fontWeight:600,color:"#0F172A" }}>{c.cropType}</span>
                    </div>
                  </td>
                  <td style={{ color:"#64748B",fontSize:12 }}>{c.plantingDate}</td>
                  <td style={{ color:"#64748B",fontSize:12 }}>{c.expectedHarvestDate||"—"}</td>
                  <td style={{ fontWeight:600,color:"#0D6B3F" }}>
                    {c.expectedYieldPerSqm ? `${c.expectedYieldPerSqm} kg/m²` : "—"}
                  </td>
                  <td><StatusBadge harvested={c.harvested}/></td>
                  <td>
                    <div style={{ display:"flex",gap:6 }}>
                      {!c.harvested && (
                        <button onClick={()=>setHarvestModal(c.id)} style={{
                          background:"#D1FAE5",color:"#065F46",
                          padding:"5px 10px",borderRadius:8,fontSize:11,fontWeight:700,
                        }}>✂️ Harvest</button>
                      )}
                      <button onClick={()=>del(c.id)} style={{
                        background:"#FFF1F2",color:"#BE123C",
                        padding:"5px 8px",borderRadius:8,fontSize:11,
                      }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add crop modal */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
          <div className="fade-in" style={{background:"#fff",borderRadius:20,padding:32,width:440,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#0F172A",marginBottom:20 }}>🌱 Plant New Crop</h3>

            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:8 }}>Crop type</label>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {CROP_TYPES.map(t=>(
                    <button key={t} onClick={()=>setForm({...form,cropType:t})} style={{
                      padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,
                      background:form.cropType===t?"linear-gradient(135deg,#F59E0B,#EA580C)":"#F8FAFC",
                      color:form.cropType===t?"#fff":"#374151",
                      border:form.cropType===t?"none":"1.5px solid #E2E8F0",
                    }}>{CROP_ICONS[t]} {t}</button>
                  ))}
                </div>
              </div>
              {[
                ["Planting date","plantingDate","date"],
                ["Expected harvest date","expectedHarvestDate","date"],
                ["Expected yield (kg/m²)","expectedYieldPerSqm","number"],
              ].map(([label,key,type])=>(
                <div key={key}>
                  <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
            </div>

            {err && <div style={{ marginTop:12,background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,padding:"9px 14px",color:"#BE123C",fontSize:13 }}>⚠️ {err}</div>}

            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={()=>{setModal(false);setErr("");}} style={{ flex:1,background:"#F1F5F9",color:"#64748B",padding:"11px 0",borderRadius:10 }}>Cancel</button>
              <button onClick={save} disabled={busy} style={{
                flex:2,background:"linear-gradient(135deg,#F59E0B,#EA580C)",
                color:"#fff",padding:"11px 0",borderRadius:10,fontWeight:700,
              }}>{busy?"⏳ Saving…":"🌱 Plant Crop"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Harvest modal */}
      {harvestModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
          <div className="fade-in" style={{background:"#fff",borderRadius:20,padding:32,width:380,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <h3 style={{ fontSize:18,fontWeight:800,color:"#0F172A",marginBottom:6 }}>✂️ Mark as Harvested</h3>
            <p style={{ fontSize:13,color:"#94A3B8",marginBottom:20 }}>Record the actual yield from this crop</p>
            <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:6 }}>Actual yield (kg/m²)</label>
            <input type="number" step="0.1" value={actualYield} placeholder="e.g. 4.7"
              onChange={e=>setActualYield(e.target.value)} />
            {err && <div style={{ marginTop:12,background:"#FFF1F2",border:"1px solid #FECDD3",borderRadius:10,padding:"9px 14px",color:"#BE123C",fontSize:13 }}>⚠️ {err}</div>}
            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={()=>{setHarvestModal(null);setErr("");setActualYield("");}} style={{ flex:1,background:"#F1F5F9",color:"#64748B",padding:"11px 0",borderRadius:10 }}>Cancel</button>
              <button onClick={harvest} style={{
                flex:2,background:"linear-gradient(135deg,#059669,#0D6B3F)",
                color:"#fff",padding:"11px 0",borderRadius:10,fontWeight:700,
              }}>✅ Confirm Harvest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
