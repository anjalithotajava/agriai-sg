import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function Admin() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "ADMIN") { nav("/"); return; }
    api.get("/admin/users")
      .then(r => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const del = async id => {
    if (!window.confirm("Delete this user and all their data?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(u => u.filter(x => x.id !== id));
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg,#EA580C,#F59E0B)",
        borderRadius:20,padding:"22px 28px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        boxShadow:"0 8px 32px rgba(234,88,12,0.25)",
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",right:-20,top:-20,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
        <div style={{ zIndex:1 }}>
          <h2 style={{ fontSize:20,fontWeight:800,color:"#fff",marginBottom:2 }}>⚙️ Admin Panel</h2>
          <p style={{ color:"rgba(255,255,255,0.8)",fontSize:13 }}>{users.length} registered users</p>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.2)",borderRadius:12,
          padding:"10px 16px",zIndex:1,
        }}>
          <div style={{ fontSize:11,color:"rgba(255,255,255,0.7)" }}>Signed in as</div>
          <div style={{ fontSize:13,fontWeight:700,color:"#fff" }}>{user?.name} ⚙️</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
        {[
          { label:"Total Users",   value:users.length,                                          icon:"👥", grad:"linear-gradient(135deg,#EA580C,#F59E0B)" },
          { label:"Farmers",       value:users.filter(u=>u.role==="FARMER").length,             icon:"🌾", grad:"linear-gradient(135deg,#0D6B3F,#1A9456)" },
          { label:"Admins",        value:users.filter(u=>u.role==="ADMIN").length,              icon:"⚙️", grad:"linear-gradient(135deg,#7C3AED,#2563EB)" },
        ].map((s,i)=>(
          <div key={i} className="card" style={{ padding:22,position:"relative",overflow:"hidden" }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:s.grad}}/>
            <div style={{
              width:40,height:40,borderRadius:10,background:s.grad,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,marginBottom:10,
            }}>{s.icon}</div>
            <div style={{ fontSize:28,fontWeight:800,color:"#0F172A" }}>{s.value}</div>
            <div style={{ fontSize:12,color:"#94A3B8",marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid #F1F5F9" }}>
          <h3 style={{ fontSize:15,fontWeight:700,color:"#0F172A" }}>👥 All Users</h3>
        </div>
        {loading ? (
          <div style={{ padding:32,textAlign:"center",color:"#94A3B8" }}>Loading…</div>
        ) : (
          <table>
            <thead>
              <tr>
                {["ID","Name","Email","Role","Actions"].map(h=><th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td style={{ color:"#94A3B8",fontSize:12 }}>#{u.id}</td>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{
                        width:32,height:32,borderRadius:8,
                        background:"linear-gradient(135deg,#1A9456,#0D9488)",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,color:"#fff",fontWeight:700,flexShrink:0,
                      }}>{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight:600,color:"#0F172A" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color:"#64748B",fontSize:12 }}>{u.email}</td>
                  <td>
                    <span style={{
                      display:"inline-flex",alignItems:"center",gap:4,
                      padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:700,
                      background:u.role==="ADMIN"?"#FFF7ED":"#E8F8EE",
                      color:u.role==="ADMIN"?"#EA580C":"#0D6B3F",
                    }}>
                      {u.role==="ADMIN"?"⚙️ Admin":"🌾 Farmer"}
                    </span>
                  </td>
                  <td>
                    {u.id !== user?.id && (
                      <button onClick={()=>del(u.id)} style={{
                        background:"#FFF1F2",color:"#BE123C",
                        padding:"5px 10px",borderRadius:8,fontSize:11,fontWeight:600,
                      }}>🗑 Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
