import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";

const StatCard = ({ label, value, icon, gradient, trend, sub }) => (
  <div className="card" style={{
    padding:24, position:"relative", overflow:"hidden",
  }}>
    {/* Gradient accent top */}
    <div style={{
      position:"absolute", top:0, left:0, right:0, height:3,
      background:gradient,
    }}/>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
      <div style={{
        width:44, height:44, borderRadius:12,
        background:gradient, display:"flex",
        alignItems:"center", justifyContent:"center",
        fontSize:22, boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
      }}>{icon}</div>
      {trend && (
        <span style={{
          fontSize:11, fontWeight:600,
          color:trend > 0 ? "#059669" : "#DC2626",
          background:trend > 0 ? "#D1FAE5" : "#FEE2E2",
          padding:"2px 8px", borderRadius:999,
        }}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div style={{ fontSize:32, fontWeight:800, color:"#0F172A", letterSpacing:"-0.02em" }}>
      {value ?? "—"}
    </div>
    <div style={{ fontSize:13, color:"#64748B", marginTop:4, fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"#fff", border:"1px solid #E2E8F0",
      borderRadius:10, padding:"10px 14px",
      boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
    }}>
      <p style={{ fontSize:12, color:"#64748B", marginBottom:4 }}>📅 {label}</p>
      <p style={{ fontSize:14, fontWeight:700, color:"#0D6B3F" }}>
        {payload[0].value} activities
      </p>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [summary, setSummary] = useState(null);
  const [chart,   setChart]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/dashboard/activity-chart?days=30"),
    ]).then(([s, c]) => {
      setSummary(s.data);
      setChart(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label:"Total Farms",          value:summary?.farms,             icon:"🏗️", gradient:"linear-gradient(135deg,#0D6B3F,#1A9456)", sub:"Active farm locations" },
    { label:"Growing Units",         value:summary?.growingUnits,      icon:"🌿", gradient:"linear-gradient(135deg,#0D9488,#0EA5E9)", sub:"Racks, plots & towers" },
    { label:"Active Crops",          value:summary?.activeCrops,       icon:"🌱", gradient:"linear-gradient(135deg,#F59E0B,#EA580C)", sub:"Currently growing" },
    { label:"Activities this week",  value:summary?.activitiesThisWeek,icon:"📋", gradient:"linear-gradient(135deg,#7C3AED,#2563EB)", sub:"Logged operations" },
  ];

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {[...Array(4)].map((_,i)=>(
          <div key={i} className="skeleton" style={{ height:120, borderRadius:16 }}/>
        ))}
      </div>
      <div className="skeleton" style={{ height:280, borderRadius:16 }}/>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* Welcome banner */}
      <div style={{
        background:"linear-gradient(135deg,#0D6B3F 0%,#1A9456 50%,#0D9488 100%)",
        borderRadius:20, padding:"28px 32px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        boxShadow:"0 8px 32px rgba(13,107,63,0.25)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", right:-20, top:-20,
          width:200, height:200, borderRadius:"50%",
          background:"rgba(255,255,255,0.06)",
        }}/>
        <div style={{
          position:"absolute", right:80, bottom:-40,
          width:140, height:140, borderRadius:"50%",
          background:"rgba(255,255,255,0.04)",
        }}/>
        <div style={{ zIndex:1 }}>
          <p style={{ color:"rgba(255,255,255,0.75)", fontSize:13, marginBottom:4 }}>
            Good morning 👋
          </p>
          <h2 style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-0.01em" }}>
            {user?.name?.split(" ")[0]}'s Farm Dashboard
          </h2>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginTop:6 }}>
            🇸🇬 Singapore Urban CEA Management · AI-powered insights
          </p>
        </div>
        <div style={{ display:"flex", gap:12, zIndex:1 }}>
          <button onClick={()=>nav("/farms")} style={{
            background:"rgba(255,255,255,0.15)",
            backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,0.25)",
            color:"#fff", padding:"10px 20px",
            borderRadius:10, fontSize:13, fontWeight:600,
          }}>
            + Add Farm
          </button>
          <button onClick={()=>nav("/ai-insights")} style={{
            background:"#fff", color:"#0D6B3F",
            padding:"10px 20px", borderRadius:10,
            fontSize:13, fontWeight:700,
            boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
          }}>
            🤖 AI Predict
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {stats.map((s,i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>

        {/* Activity chart */}
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#0F172A" }}>Activity Timeline</h3>
              <p style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Last 30 days</p>
            </div>
            <span style={{
              background:"#E8F8EE", color:"#0D6B3F",
              fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:999,
            }}>📈 Live data</span>
          </div>
          {chart.length === 0 ? (
            <div style={{
              height:220, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", color:"#94A3B8",
            }}>
              <span style={{ fontSize:32, marginBottom:8 }}>📋</span>
              <p style={{ fontSize:13 }}>No activities logged yet</p>
              <button onClick={()=>nav("/farms")} style={{
                marginTop:12, background:"#0D6B3F", color:"#fff",
                padding:"8px 16px", fontSize:12, borderRadius:8,
              }}>Log your first activity</button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chart} margin={{ left:-20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A9456" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#1A9456" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize:10, fill:"#94A3B8" }}
                       tickFormatter={d=>d.slice(5)} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="count" stroke="#1A9456" strokeWidth={2.5}
                      fill="url(#areaGrad)" dot={{ fill:"#1A9456", r:4, strokeWidth:2, stroke:"#fff" }}
                      activeDot={{ r:6, stroke:"#1A9456", strokeWidth:2 }}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#0F172A", marginBottom:16 }}>Quick Actions</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { icon:"🏗️", label:"Manage Farms",    sub:"Add or view farms",          color:"#0D6B3F", bg:"#E8F8EE",  path:"/farms" },
              { icon:"🤖", label:"AI Yield Predict", sub:"Get crop yield forecast",    color:"#7C3AED", bg:"#F5F3FF",  path:"/ai-insights" },
              { icon:"🌱", label:"Track Crops",      sub:"Log planting & harvest",     color:"#EA580C", bg:"#FFF7ED",  path:"/farms" },
              { icon:"📊", label:"View Analytics",   sub:"Charts & performance",       color:"#0EA5E9", bg:"#F0F9FF",  path:"/" },
            ].map((a,i)=>(
              <button key={i} onClick={()=>nav(a.path)} style={{
                display:"flex", alignItems:"center", gap:12,
                background:a.bg, border:`1px solid ${a.bg}`,
                borderRadius:10, padding:"10px 12px", textAlign:"left",
                color:a.color, transition:"all 0.15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}
              >
                <span style={{ fontSize:20 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{a.label}</div>
                  <div style={{ fontSize:11, opacity:0.7 }}>{a.sub}</div>
                </div>
                <span style={{ marginLeft:"auto", fontSize:14, opacity:0.5 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI model info banner */}
      <div style={{
        background:"linear-gradient(135deg,#F5F3FF,#EFF6FF)",
        border:"1px solid #DDD6FE", borderRadius:16, padding:"20px 24px",
        display:"flex", alignItems:"center", gap:16,
      }}>
        <div style={{
          width:48, height:48, borderRadius:12,
          background:"linear-gradient(135deg,#7C3AED,#2563EB)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:22, flexShrink:0,
        }}>🤖</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#4C1D95", marginBottom:2 }}>
            AI Model Status: Active
          </div>
          <div style={{ fontSize:12, color:"#6D28D9" }}>
            PyTorch Deep Neural Network trained on Bouzid et al. (2024) hydroponic dataset ·
            PyTorch Deep Neural Network · Bouzid et al. (2024) dataset ·
            MAE=0.1648 · RMSE=0.2057 · <strong>Test R²=0.9389</strong> · Overfit gap=0.0016
          </div>
        </div>
        <button onClick={()=>nav("/ai-insights")} style={{
          background:"linear-gradient(135deg,#7C3AED,#2563EB)",
          color:"#fff", padding:"10px 18px", fontSize:13, fontWeight:600,
          borderRadius:10, flexShrink:0,
          boxShadow:"0 4px 12px rgba(124,58,237,0.3)",
        }}>
          Get Prediction →
        </button>
      </div>
    </div>
  );
}
