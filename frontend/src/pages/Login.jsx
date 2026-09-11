import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await login(form.email, form.password); nav("/"); }
    catch { setErr("Invalid email or password. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* ── LEFT: Hero Panel ───────────────────────────── */}
      <div style={{
        background: "linear-gradient(145deg, #0D6B3F 0%, #1A9456 35%, #0D9488 70%, #0EA5E9 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientMove 8s ease infinite",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        {[
          { size:320, top:-80,  left:-80,  opacity:0.08 },
          { size:200, bottom:60,right:-60, opacity:0.10 },
          { size:140, top:"40%",left:"60%",opacity:0.07 },
        ].map((c,i)=>(
          <div key={i} style={{
            position:"absolute", width:c.size, height:c.size,
            borderRadius:"50%", background:"#fff",
            top:c.top, bottom:c.bottom, left:c.left, right:c.right,
            opacity:c.opacity,
          }}/>
        ))}

        {/* Logo + title */}
        <div className="float-anim" style={{ textAlign:"center", zIndex:1 }}>
          <div style={{
            width:96, height:96, borderRadius:24,
            background:"rgba(255,255,255,0.15)",
            backdropFilter:"blur(12px)",
            border:"2px solid rgba(255,255,255,0.3)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:44, margin:"0 auto 24px",
            boxShadow:"0 8px 32px rgba(0,0,0,0.2)",
          }}>🌿</div>
          <h1 style={{ fontSize:36, fontWeight:800, color:"#fff", letterSpacing:"-0.02em", marginBottom:8 }}>
            AgriAI-SG
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.85)", fontWeight:400, maxWidth:320, lineHeight:1.7 }}>
            AI-Powered Yield Prediction for Singapore's Urban Farms
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:48, zIndex:1, width:"100%", maxWidth:340 }}>
          {[
            ["🌿", "Track your farms & growing units in one place"],
            ["🌱", "Monitor crops from planting to harvest"],
            ["🤖", "Get AI-powered yield predictions instantly"],
            ["📋", "Log irrigation, fertilisation & activities"],
          ].map(([icon, text]) => (
            <div key={text} style={{
              display:"flex", alignItems:"center", gap:12,
              background:"rgba(255,255,255,0.10)",
              backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:12, padding:"12px 16px",
            }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.88)", lineHeight:1.4 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Bottom tag */}
        <p style={{ position:"absolute", bottom:24, color:"rgba(255,255,255,0.5)", fontSize:11, zIndex:1 }}>
          UEL × LSBF · CN7000 Masters Dissertation · 2026
        </p>
      </div>

      {/* ── RIGHT: Login Form ──────────────────────────── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:48, background:"#F8FAFC",
      }}>
        <div className="fade-in" style={{ width:"100%", maxWidth:400 }}>
          {/* Header */}
          <div style={{ marginBottom:36 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"#E8F8EE", borderRadius:999, padding:"6px 14px",
              marginBottom:16,
            }}>
              <span style={{ fontSize:12 }}>🌱</span>
              <span style={{ fontSize:12, fontWeight:600, color:"#0D6B3F" }}>Welcome back</span>
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, color:"#0F172A", letterSpacing:"-0.02em", marginBottom:6 }}>
              Sign in to your account
            </h2>
            <p style={{ color:"#64748B", fontSize:14 }}>
              Manage your farms and get AI yield predictions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} autoComplete="off" style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>
                Email address
              </label>
              <input
                type="email" required
                value={form.email}
                placeholder="you@farm.sg"
                autoComplete="username"
                onChange={e=>setForm({...form,email:e.target.value})}
                style={{ fontSize:14 }}
              />
            </div>

            <div>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>
                Password
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={show?"text":"password"} required
                  value={form.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onChange={e=>setForm({...form,password:e.target.value})}
                  style={{ fontSize:14, paddingRight:44 }}
                />
                <button type="button" onClick={()=>setShow(!show)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", padding:4, color:"#94A3B8", fontSize:16,
                }}>
                  {show?"🙈":"👁"}
                </button>
              </div>
            </div>

            {err && (
              <div style={{
                background:"#FFF1F2", border:"1px solid #FECDD3",
                borderRadius:10, padding:"10px 14px",
                color:"#BE123C", fontSize:13, fontWeight:500,
                display:"flex", alignItems:"center", gap:8,
              }}>
                ⚠️ {err}
              </div>
            )}

            <button type="submit" disabled={busy} style={{
              background: busy
                ? "#64748B"
                : "linear-gradient(135deg, #0D6B3F, #1A9456)",
              color:"#fff", padding:"13px 20px", fontSize:15, fontWeight:700,
              borderRadius:12, marginTop:4,
              boxShadow: busy ? "none" : "0 4px 14px rgba(13,107,63,0.35)",
              transition:"all 0.2s",
            }}>
              {busy ? "⏳ Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign:"center", fontSize:13, color:"#64748B", marginTop:24 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"#0D6B3F", fontWeight:700 }}>
              Create one free
            </Link>
          </p>

          {/* Demo hint */}
          <div style={{
            marginTop:32, padding:16, borderRadius:12,
            background:"linear-gradient(135deg,#F0FDFA,#E8F8EE)",
            border:"1px solid #A7F3D0",
          }}>
            <p style={{ fontSize:12, color:"#065F46", fontWeight:600, marginBottom:4 }}>
              🔑 Demo credentials
            </p>
            <p style={{ fontSize:12, color:"#047857" }}>
              Register a new account to explore the full system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
