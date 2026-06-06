import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import okuLogo from '../assets/oku_parte_logo.png';

/* ─────────────────────────────────────────────────────────────────────────────
   Google Fonts — injected once on module load
───────────────────────────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('oku-gf')) {
  const l = document.createElement('link');
  l.id = 'oku-gf';
  l.rel = 'stylesheet';
  l.href =
    'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

/* ─────────────────────────────────────────────────────────────────────────────
   All styles in a single <style> block — uses modern CSS:
   @starting-style for entry animations, @property for custom properties,
   @keyframes for ambient orbs, prefers-reduced-motion for accessibility
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
  /* ── Reset & base ─────────────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .oku-login-root {
    min-height: 100dvh;
    display: grid;
    grid-template-columns: 1fr 480px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #0a0a0b;
    overflow: hidden;
    position: relative;
  }

  /* ── Grain texture overlay ─────────────────────────────────────────────── */
  .oku-login-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 180px 180px;
    opacity: 0.028;
    pointer-events: none;
    z-index: 100;
  }

  /* ── Ambient orbs ─────────────────────────────────────────────────────── */
  @keyframes oku-orb-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(40px, -60px) scale(1.08); }
    66%       { transform: translate(-30px, 30px) scale(0.95); }
  }
  @keyframes oku-orb-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    40%       { transform: translate(-50px, 40px) scale(1.05); }
    70%       { transform: translate(30px, -20px) scale(0.98); }
  }

  .oku-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
  .oku-orb-1 {
    width: 520px; height: 520px;
    top: -140px; left: -100px;
    background: radial-gradient(circle, rgba(0,168,168,0.12) 0%, transparent 70%);
    animation: oku-orb-1 18s ease-in-out infinite;
  }
  .oku-orb-2 {
    width: 600px; height: 600px;
    bottom: -200px; left: 30%;
    background: radial-gradient(circle, rgba(180,140,100,0.07) 0%, transparent 70%);
    animation: oku-orb-2 24s ease-in-out infinite;
  }
  .oku-orb-3 {
    width: 360px; height: 360px;
    top: 50%; right: 460px;
    transform: translateY(-50%);
    background: radial-gradient(circle, rgba(0,168,168,0.06) 0%, transparent 70%);
    animation: oku-orb-1 30s ease-in-out infinite reverse;
  }

  /* ── Brand panel (left) ──────────────────────────────────────────────── */
  .oku-brand {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 56px 72px;
    z-index: 1;
  }

  /* Vertical separator */
  .oku-brand::after {
    content: '';
    position: absolute;
    top: 60px; right: 0; bottom: 60px;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(255,255,255,0.1) 30%,
      rgba(255,255,255,0.1) 70%,
      transparent
    );
  }

  .oku-brand-top {
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translateY(-12px);
    transition: opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s;
  }

  .oku-brand-wordmark {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
  }

  .oku-brand-sep {
    width: 1px;
    height: 14px;
    background: rgba(255,255,255,0.15);
  }

  .oku-brand-category {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.16em;
    color: rgba(255,255,255,0.22);
    text-transform: uppercase;
  }

  /* Large logo area */
  .oku-brand-center {
    display: flex;
    flex-direction: column;
    gap: 48px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s;
  }

  .oku-brand-logo-wrap {
    position: relative;
    display: inline-block;
  }

  .oku-brand-logo {
    height: clamp(180px, 26vw, 280px);
    width: auto;
    filter: brightness(0) invert(1);
    opacity: 0.88;
  }

  .oku-brand-headline {
    font-family: 'DM Serif Display', 'Georgia', serif;
    font-size: clamp(40px, 5.5vw, 72px);
    font-weight: 400;
    font-style: italic;
    line-height: 1.08;
    color: #f0ebe2;
    letter-spacing: -0.015em;
  }

  .oku-brand-headline em {
    font-style: normal;
    color: rgba(255,255,255,0.22);
    font-size: 0.28em;
    display: block;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  /* Horizontal rule accent */
  .oku-brand-rule {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
  }
  .oku-brand-rule-line {
    flex: 1;
    max-width: 64px;
    height: 1px;
    background: linear-gradient(to right, rgba(200,169,110,0.6), transparent);
  }
  .oku-brand-rule-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #C8A96E;
    opacity: 0.7;
  }

  .oku-brand-bottom {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s;
  }

  .oku-brand-year {
    font-size: 11px;
    letter-spacing: 0.14em;
    color: rgba(255,255,255,0.2);
    text-transform: uppercase;
  }

  /* ── Form panel (right) ──────────────────────────────────────────────── */
  .oku-form-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 60px;
    background: rgba(12,12,14,0.7);
    border-left: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(40px) saturate(140%);
    z-index: 1;
    overflow: hidden;
  }

  .oku-form-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent 10%,
      rgba(0,168,168,0.5) 40%,
      rgba(0,168,168,0.5) 60%,
      transparent 90%
    );
  }

  /* Subtle inner glow on form panel */
  .oku-form-panel::after {
    content: '';
    position: absolute;
    top: -120px; left: 50%;
    transform: translateX(-50%);
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(0,168,168,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .oku-form-inner {
    max-width: 340px;
    width: 100%;
    margin: 0 auto;
    opacity: 0;
    transform: translateX(24px);
    transition: opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s;
  }

  /* ── Form header ─────────────────────────────────────────────────────── */
  .oku-form-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }

  .oku-form-eyebrow-line {
    width: 24px;
    height: 1px;
    background: #00A8A8;
    flex-shrink: 0;
  }

  .oku-form-eyebrow-text {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: #00A8A8;
    text-transform: uppercase;
  }

  .oku-form-title {
    font-family: 'DM Serif Display', 'Georgia', serif;
    font-size: 36px;
    font-weight: 400;
    color: #f0ebe2;
    line-height: 1.12;
    margin-bottom: 12px;
    letter-spacing: -0.015em;
  }

  .oku-form-sub {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.28);
    line-height: 1.65;
    margin-bottom: 48px;
    letter-spacing: 0.01em;
  }

  /* ── Error ───────────────────────────────────────────────────────────── */
  .oku-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    margin-bottom: 28px;
  }

  .oku-error-icon { color: #f87171; flex-shrink: 0; padding-top: 1px; }
  .oku-error-msg  { font-size: 13px; color: #f87171; line-height: 1.5; }

  @keyframes oku-shake {
    0%, 100% { transform: translateX(0); }
    18%       { transform: translateX(-7px); }
    54%       { transform: translateX(7px); }
    80%       { transform: translateX(-3px); }
  }
  .oku-shake { animation: oku-shake 0.4s cubic-bezier(.36,.07,.19,.97); }

  /* ── Fields — underline style ────────────────────────────────────────── */
  .oku-fields { display: flex; flex-direction: column; gap: 28px; margin-bottom: 40px; }

  .oku-field { position: relative; }

  .oku-field-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.38);
    text-transform: uppercase;
    margin-bottom: 10px;
    transition: color 0.2s ease;
  }

  .oku-field-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .oku-field-icon {
    position: absolute;
    left: 0;
    color: rgba(255,255,255,0.2);
    pointer-events: none;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;
  }

  .oku-field-input {
    width: 100%;
    padding: 10px 0 10px 28px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    color: #f0ebe2;
    font-size: 15px;
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 400;
    outline: none;
    letter-spacing: 0.01em;
    transition: border-color 0.25s ease;
    caret-color: #00A8A8;
  }

  .oku-field-input::placeholder { color: rgba(255,255,255,0.15); }

  .oku-field-input:focus {
    border-bottom-color: #00A8A8;
  }

  .oku-field-input:focus ~ .oku-field-underline { transform: scaleX(1); }

  /* Animated underline */
  .oku-field-underline {
    position: absolute;
    bottom: 0; left: 28px; right: 0;
    height: 1px;
    background: #00A8A8;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
  }

  .oku-field-input:focus + .oku-field-underline { transform: scaleX(1); }

  /* Focus label color */
  .oku-field:focus-within .oku-field-label { color: #00A8A8; }
  .oku-field:focus-within .oku-field-icon  { color: rgba(0,168,168,0.7); }

  .oku-field-eye {
    position: absolute;
    right: 0;
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: color 0.15s ease;
    outline: none;
  }

  .oku-field-eye:hover { color: rgba(255,255,255,0.55); }
  .oku-field-eye:focus-visible { outline: 2px solid #00A8A8; outline-offset: 2px; }

  /* Password input right padding */
  .oku-field-input-pw { padding-right: 36px; }

  /* Autofill override */
  .oku-field-input:-webkit-autofill,
  .oku-field-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #0f0f10 inset !important;
    -webkit-text-fill-color: #f0ebe2 !important;
    border-bottom-color: rgba(0,168,168,0.5) !important;
    caret-color: #f0ebe2;
  }

  /* ── Submit button ───────────────────────────────────────────────────── */
  .oku-submit {
    width: 100%;
    padding: 17px 24px;
    background: #00A8A8;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
      background 0.25s ease,
      transform 0.18s ease,
      box-shadow 0.25s ease,
      opacity 0.2s ease;
    outline: none;
    box-shadow:
      0 4px 16px -4px rgba(0,168,168,0.4),
      0 0 0 1px rgba(0,168,168,0.15) inset;
  }

  /* Shimmer sweep */
  .oku-submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255,255,255,0.18) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  .oku-submit:hover::before { transform: translateX(100%); }

  .oku-submit:hover:not(:disabled) {
    background: #009696;
    transform: translateY(-2px);
    box-shadow:
      0 16px 40px -8px rgba(0,168,168,0.5),
      0 0 0 1px rgba(0,168,168,0.2) inset;
  }

  .oku-submit:active:not(:disabled) { transform: translateY(0); }
  .oku-submit:focus-visible { outline: 2px solid #00A8A8; outline-offset: 3px; }
  .oku-submit:disabled { opacity: 0.55; cursor: default; }

  /* ── Spinner ─────────────────────────────────────────────────────────── */
  @keyframes oku-spin { to { transform: rotate(360deg); } }
  .oku-spinner {
    display: inline-block;
    width: 13px; height: 13px;
    border: 1.5px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: oku-spin 0.65s linear infinite;
    vertical-align: middle;
    margin-right: 10px;
  }

  /* ── Footer ─────────────────────────────────────────────────────────── */
  .oku-form-footer {
    margin-top: 36px;
    display: flex;
    justify-content: center;
  }
  .oku-form-footer-text {
    font-size: 11px;
    color: rgba(255,255,255,0.18);
    letter-spacing: 0.06em;
  }

  /* ── Mounted: play entry animations ─────────────────────────────────── */
  .oku-mounted .oku-brand-top,
  .oku-mounted .oku-brand-center,
  .oku-mounted .oku-brand-bottom,
  .oku-mounted .oku-form-inner {
    opacity: 1;
    transform: none;
  }

  /* ── Responsive ──────────────────────────────────────────────────────── */
  @media (max-width: 860px) {
    .oku-login-root {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
    .oku-brand {
      padding: 36px 32px 28px;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .oku-brand::after { display: none; }
    .oku-brand-center { flex-direction: row; align-items: center; gap: 20px; }
    .oku-brand-logo   { height: 48px; }
    .oku-brand-headline { font-size: 22px; }
    .oku-brand-rule   { display: none; }
    .oku-brand-bottom { display: none; }
    .oku-orb-1, .oku-orb-2, .oku-orb-3 { opacity: 0.5; }
    .oku-form-panel   { border-left: none; border-top: 1px solid rgba(255,255,255,0.06); padding: 44px 28px 52px; }
    .oku-form-inner   { max-width: 100%; }
  }

  @media (max-width: 480px) {
    .oku-brand { padding: 28px 24px; }
    .oku-form-panel { padding: 36px 24px 48px; }
  }

  /* ── Reduced motion ──────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .oku-orb { animation: none !important; }
    .oku-submit::before { display: none; }
    .oku-brand-top, .oku-brand-center, .oku-brand-bottom, .oku-form-inner {
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   Icon micro-components
───────────────────────────────────────────────────────────────────────────── */
const Ico = ({ d, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" {...rest}>
    {d}
  </svg>
);

const IconUser = () => (
  <Ico d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} size={17} />
);
const IconLock = () => (
  <Ico d={<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>} size={17} />
);
const IconEye = () => (
  <Ico d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} size={16} />
);
const IconEyeOff = () => (
  <Ico d={<>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>} size={16} />
);
const IconAlert = () => (
  <Ico d={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>} size={15} />
);

/* ─────────────────────────────────────────────────────────────────────────────
   Login page
───────────────────────────────────────────────────────────────────────────── */
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  /* Trigger entry animations after first paint */
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ── Handlers — identical to original ── */
  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.access);
      navigate('/Dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente nuevamente');
      setErrorKey(k => k + 1);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <>
      <style>{CSS}</style>

      <div
        className={`oku-login-root${mounted ? ' oku-mounted' : ''}`}
        role="main"
      >
        {/* Ambient background orbs */}
        <div className="oku-orb oku-orb-1" aria-hidden="true" />
        <div className="oku-orb oku-orb-2" aria-hidden="true" />
        <div className="oku-orb oku-orb-3" aria-hidden="true" />

        {/* ── Left brand panel ──────────────────────────────────────────── */}
        <aside className="oku-brand" aria-hidden="true">
          {/* Top bar */}
          <div className="oku-brand-top">
            <span className="oku-brand-wordmark">Oku Hotels</span>
            <div className="oku-brand-sep" />
            <span className="oku-brand-category">IT Portal</span>
          </div>

          {/* Hero section */}
          <div className="oku-brand-center">
            <div className="oku-brand-logo-wrap">
              <img
                src={okuLogo}
                alt="OKU Hotels"
                className="oku-brand-logo"
                fetchpriority="high"
              />
            </div>

            <div>
              <h1 className="oku-brand-headline">
                <em>Internal workspace</em>
                Bienvenido de nuevo.
              </h1>
              <div className="oku-brand-rule">
                <div className="oku-brand-rule-line" />
                <div className="oku-brand-rule-dot" />
              </div>
            </div>
          </div>

          {/* Bottom year */}
          <div className="oku-brand-bottom">
            <span className="oku-brand-year">© {new Date().getFullYear()} Oku Hotels · IT Department</span>
          </div>
        </aside>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <section className="oku-form-panel" aria-label="Acceso al portal">
          <div className="oku-form-inner">

            {/* Header */}
            <div className="oku-form-eyebrow" aria-hidden="true">
              <div className="oku-form-eyebrow-line" />
              <span className="oku-form-eyebrow-text">Management Portal</span>
            </div>

            <h2 className="oku-form-title">Iniciar sesión</h2>
            <p className="oku-form-sub">Introduce tus credenciales corporativas para continuar.</p>

            {/* Error */}
            {error && (
              <div
                key={errorKey}
                role="alert"
                aria-live="assertive"
                className={`oku-error oku-shake`}
              >
                <span className="oku-error-icon"><IconAlert /></span>
                <span className="oku-error-msg">{error}</span>
              </div>
            )}

            {/* Fields */}
            <div className="oku-fields">
              {/* Username */}
              <div className="oku-field">
                <label htmlFor="oku-username" className="oku-field-label">
                  Usuario
                </label>
                <div className="oku-field-wrap">
                  <span className="oku-field-icon"><IconUser /></span>
                  <input
                    id="oku-username"
                    className="oku-field-input"
                    type="text"
                    autoComplete="username"
                    placeholder="tu.usuario"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    aria-required="true"
                  />
                  <div className="oku-field-underline" aria-hidden="true" />
                </div>
              </div>

              {/* Password */}
              <div className="oku-field">
                <label htmlFor="oku-password" className="oku-field-label">
                  Contraseña
                </label>
                <div className="oku-field-wrap">
                  <span className="oku-field-icon"><IconLock /></span>
                  <input
                    id="oku-password"
                    className="oku-field-input oku-field-input-pw"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    aria-required="true"
                  />
                  <div className="oku-field-underline" aria-hidden="true" />
                  <button
                    type="button"
                    className="oku-field-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={0}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              id="oku-submit-btn"
              type="button"
              className="oku-submit"
              onClick={handleSubmit}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="oku-spinner" aria-hidden="true" />
                  Verificando…
                </>
              ) : (
                'Acceder'
              )}
            </button>

            {/* Footer */}
            <div className="oku-form-footer">
              <span className="oku-form-footer-text">
                © {new Date().getFullYear()} Oku Hotels · IT Department
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}