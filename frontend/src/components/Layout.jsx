import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const NAV = [
  { to:"/",           icon:"📊", label:"Dashboard",    end:true,  color:"#0EA5E9", bg:"#F0F9FF" },
  { to:"/farms",      icon:"🏗️", label:"Farms",                   color:"#0D6B3F", bg:"#E8F8EE" },
  { to:"/ai-insights",icon:"🤖", label:"AI Insights",             color:"#7C3AED", bg:"#F5F3FF" },
];

const ADMIN_NAV = { to:"/admin", icon:"⚙️", label:"Admin", color:"#EA580C", bg:"#FFF7ED" };

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const allNav = user?.role === "ADMIN" ? [...NAV, ADMIN_NAV] : NAV;

  // Page title from location
  const currentNav = allNav.find(n => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));
  const pageTitle = currentNav?.label || "AgriAI-SG";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8FAFC" }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 72 : 240,
        background:"linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        display:"flex", flexDirection:"column",
        position:"sticky", top:0, height:"100vh",
        transition:"width 0.25s ease",
        flexShrink:0, zIndex:100,
        boxShadow:"4px 0 24px rgba(0,0,0,0.12)",
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 0" : "20px 20px",
          borderBottom:"1px solid rgba(255,255,255,0.08)",
          display:"flex", alignItems:"center",
          gap:10, cursor:"pointer", justifyContent: collapsed ? "center" : "flex-start",
        }} onClick={()=>setCollapsed(!collapsed)}>
          <div style={{
            width:40, height:40, borderRadius:12, flexShrink:0,
            background:"linear-gradient(135deg,#1A9456,#0D9488)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, boxShadow:"0 4px 12px rgba(26,148,86,0.4)",
          }}>🌿</div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight:800, color:"#F1F5F9", fontSize:15, letterSpacing:"-0.01em" }}>
                AgriAI-SG
              </div>
              <div style={{ fontSize:10, color:"#64748B", marginTop:1 }}>
                Urban Farm Intelligence
              </div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {allNav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:10,
              padding: collapsed ? "10px 0" : "10px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius:10, textDecoration:"none",
              background: isActive ? item.bg : "transparent",
              color: isActive ? item.color : "#94A3B8",
              fontWeight: isActive ? 700 : 500,
              fontSize:13,
              transition:"all 0.15s",
              position:"relative",
            })}>
              {({ isActive }) => (<>
                {isActive && (
                  <div style={{
                    position:"absolute", left:0, top:"20%", bottom:"20%",
                    width:3, borderRadius:"0 2px 2px 0",
                    background:item.color,
                  }}/>
                )}
                <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </>)}
            </NavLink>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div style={{
          borderTop:"1px solid rgba(255,255,255,0.08)",
          padding: collapsed ? "12px 0" : "12px 12px",
        }}>
          {!collapsed ? (
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:"linear-gradient(135deg,#1A9456,#0D9488)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, color:"#fff", fontWeight:700,
              }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ overflow:"hidden" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#F1F5F9", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize:10, color:"#64748B" }}>
                  {user?.role === "ADMIN" ? "⚙️ Admin" : "🌾 Farmer"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              width:34, height:34, borderRadius:10, margin:"0 auto 8px",
              background:"linear-gradient(135deg,#1A9456,#0D9488)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:14, color:"#fff", fontWeight:700,
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <button onClick={()=>{logout();nav("/login");}} style={{
            width:"100%", background:"rgba(255,255,255,0.06)",
            color:"#94A3B8", fontSize:12, padding:"8px 0",
            borderRadius:8, justifyContent:"center",
            border:"1px solid rgba(255,255,255,0.08)",
          }}>
            {collapsed ? "↩" : "↩ Sign out"}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Top header bar */}
        <header style={{
          height:60, background:"#fff",
          borderBottom:"1px solid #E2E8F0",
          display:"flex", alignItems:"center",
          padding:"0 28px", gap:16,
          position:"sticky", top:0, zIndex:50,
          boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div>
            <h1 style={{ fontSize:18, fontWeight:700, color:"#0F172A", letterSpacing:"-0.01em" }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
            {/* Breadcrumb location indicator */}
            <div style={{
              background:"#E8F8EE", borderRadius:999, padding:"4px 12px",
              fontSize:12, fontWeight:600, color:"#0D6B3F",
              display:"flex", alignItems:"center", gap:4,
            }}>
              <span>🇸🇬</span> Singapore CEA Platform
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:"28px 32px", maxWidth:1280, width:"100%" }}>
          <div className="fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop:"1px solid #E2E8F0", padding:"12px 32px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ fontSize:11, color:"#94A3B8" }}>
            © 2026 AgriAI-SG · Geethanjali Thota · S1040006 · CN7000 MWPL
          </span>
          <span style={{ fontSize:11, color:"#94A3B8" }}>
            PyTorch DNN R²=0.9389 · Bouzid et al. (2024)
          </span>
        </footer>
      </div>
    </div>
  );
}
