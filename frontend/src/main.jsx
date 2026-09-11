import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #F8FAFC;
    color: #0F172A;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Inputs ─────────────────────────────────────── */
  input, select, textarea {
    font-family: inherit;
    font-size: 14px;
    padding: 10px 14px;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    outline: none;
    width: 100%;
    background: #fff;
    color: #0F172A;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: #1A9456;
    box-shadow: 0 0 0 3px rgba(26,148,86,0.15);
  }
  input::placeholder { color: #94A3B8; }
  textarea { resize: vertical; min-height: 80px; }

  /* ── Buttons ─────────────────────────────────────── */
  button {
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  button:disabled { opacity: 0.55; cursor: not-allowed; }

  /* ── Tables ─────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    background: linear-gradient(135deg, #0D6B3F, #1A9456);
    color: #fff;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  th:first-child { border-radius: 10px 0 0 0; }
  th:last-child  { border-radius: 0 10px 0 0; }
  td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; color: #334155; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #F8FAFC; }

  /* ── Scrollbar ───────────────────────────────────── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

  /* ── Animations ──────────────────────────────────── */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes gradientMove {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .fade-in    { animation: fadeIn  0.35s ease forwards; }
  .slide-in   { animation: slideIn 0.3s  ease forwards; }
  .float-anim { animation: float   3s ease-in-out infinite; }

  /* ── Card base ───────────────────────────────────── */
  .card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.10);
    transform: translateY(-1px);
  }

  /* ── Badge ───────────────────────────────────────── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
  }

  /* ── Gradient text ───────────────────────────────── */
  .grad-text {
    background: linear-gradient(135deg, #0D6B3F, #0D9488);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Loading skeleton ────────────────────────────── */
  .skeleton {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  a { text-decoration: none; color: inherit; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
