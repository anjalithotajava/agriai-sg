import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout    from "./components/Layout";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Farms     from "./pages/Farms";
import GrowingUnits from "./pages/GrowingUnits";
import Crops     from "./pages/Crops";
import Activities from "./pages/Activities";
import AiInsights from "./pages/AiInsights";
import Admin     from "./pages/Admin";

const Private = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Private><Layout /></Private>}>
            <Route index                           element={<Dashboard />} />
            <Route path="farms"                    element={<Farms />} />
            <Route path="farms/:farmId/growing-units" element={<GrowingUnits />} />
            <Route path="farms/:farmId/growing-units/:unitId/crops" element={<Crops />} />
            <Route path="farms/:farmId/activities" element={<Activities />} />
            <Route path="ai-insights"              element={<AiInsights />} />
            <Route path="admin"                    element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
