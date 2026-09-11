import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"FARMER" });
  useEffect(() => { setForm({ name:"", email:"", password:"", role:"FARMER" }); }, []);
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setErr(""); setBusy(true);
    try { await register(form); nav("/login"); }
    catch(ex){ setErr(ex.response?.data?.message || "Registration failed. Please try again."); }
    finally { setBusy(false); }
  };

  const steps = [
    { icon:"🏗️", title:"Set up your farms", desc:"Add growing units and plots" },
    { icon:"🌱", title:"Track your crops", desc:"Log planting and harvest cycles" },
    { icon:"🧠", title:"Get AI predictions", desc:"Deep Neural Network yield forecasting" },
  ];

  return (
    <div style={{
      minHeight:"100vh", display:"grid",
      gridTemplateColumns:"1fr 1fr",
      fontFamily:"'Inter', sans-serif",
    }}>
      {/* LEFT panel */}
      <div style={{
        background:"linear-gradient(145deg,#0F172A 0%,#1E3A5F 50%,#0D6B3F 100%)",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:52, position:"relative", overflow:"hidden",
      }}>
        {/* Grid pattern */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }}/>

        <div style={{ zIndex:1, width:"100%", maxWidth:360 }}>
          <div style={{
            width:64, height:64, borderRadius:16,
            background:"linear-gradient(135deg,#1A9456,#0D9488)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:30, marginBottom:28,
            boxShadow:"0 8px 24px rgba(26,148,86,0.4)",
          }}>🌿</div>

          <h2 style={{ fontSize:28, fontWeight:800, color:"#fff", marginBottom:8 }}>
            Join AgriAI-SG
          </h2>
          <p style={{ color:"#94A3B8", fontSize:14, marginBottom:40, lineHeight:1.7 }}>
            Singapore's intelligent urban farm management platform — backed by real hydroponic AI research
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {steps.map((s,i)=>(
              <div key={i} className="slide-in" style={{
                display:"flex", gap:14, alignItems:"flex-start",
                animationDelay:`${i*0.1}s`,
              }}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background:"rgba(255,255,255,0.08)",
                  border:"1px solid rgba(255,255,255,0.12)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontWeight:600, color:"#F1F5F9", fontSize:14 }}>{s.title}</div>
                  <div style={{ color:"#64748B", fontSize:12, marginTop:2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:48, background:"#F8FAFC",
      }}>
        <div className="fade-in" style={{ width:"100%", maxWidth:420 }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:26, fontWeight:800, color:"#0F172A", marginBottom:6 }}>
              Create your account
            </h2>
            <p style={{ color:"#64748B", fontSize:14 }}>Start managing your farms with AI</p>
          </div>

          <form onSubmit={submit} autoComplete="off" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              ["Full name","name","text","Geethanjali Thota"],
              ["Email address","email","email","you@farm.sg"],
              ["Password (min. 8 chars)","password","password","••••••••"],
            ].map(([label,name,type,ph])=>(
              <div key={name}>
                <label style={{ fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6 }}>
                  {label}
                </label>
                <input type={type} required value={form[name]} placeholder={ph}
                  autoComplete="off"
                  onChange={e=>setForm({...form,[name]:e.target.value})} />
              </div>
            ))}

            <div>
              <label style={{ fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6 }}>
                Account type
              </label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
                style={{
                  background:"#fff",
                  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%2364748B' d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
                  paddingRight:36, appearance:"none",
                }}>
                <option value="FARMER">🌾 Farm Operator</option>
                <option value="ADMIN">⚙️ Administrator</option>
              </select>
            </div>

            {err && (
              <div style={{
                background:"#FFF1F2", border:"1px solid #FECDD3",
                borderRadius:10, padding:"10px 14px",
                color:"#BE123C", fontSize:13,
              }}>⚠️ {err}</div>
            )}

            <button type="submit" disabled={busy} style={{
              background:"linear-gradient(135deg,#0D6B3F,#1A9456)",
              color:"#fff", padding:"13px 20px",
              fontSize:15, fontWeight:700, borderRadius:12, marginTop:4,
              boxShadow:"0 4px 14px rgba(13,107,63,0.35)",
            }}>
              {busy ? "⏳ Creating account…" : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign:"center",fontSize:13,color:"#64748B",marginTop:24 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:"#0D6B3F", fontWeight:700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
