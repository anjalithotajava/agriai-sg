import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) setUser(JSON.parse(u));
    setReady(true);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (form) => (await api.post("/auth/register", form)).data;

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, login, register, logout }}>
      {ready && children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
