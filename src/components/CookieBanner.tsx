import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check cookie or localStorage
    const hasConsent =
      document.cookie.split('; ').some((row) => row.startsWith('portfolio_consent=')) ||
      localStorage.getItem('portfolio_cookie_consent') === 'true';

    if (!hasConsent) {
      // Show with slight delay so it doesn't pop in aggressively
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Set 365 day cookie
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `portfolio_consent=true; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    localStorage.setItem('portfolio_cookie_consent', 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    // Save session-only refusal
    sessionStorage.setItem('portfolio_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        background: 'rgba(10, 16, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '16px',
        padding: '20px',
        color: '#fff',
        zIndex: 9999,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.2)',
        fontFamily: "'Courier New', Courier, monospace",
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>🍪</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '1px' }}>
            TELEMETRY & COOKIES
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>ORBITAL DATA PROTOCOLS</div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#cbd5e1', margin: 0 }}>
        We store telemetry cookies & local storage to cache 3D models for faster load times, maintain your orbital coordinates, and optimize graphic rendering.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={handleAccept}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #00e5ff 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#020617',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: "'Courier New', Courier, monospace",
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.4)';
          }}
        >
          ACCEPT PROTOCOLS
        </button>

        <button
          onClick={handleDecline}
          style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            color: '#94a3b8',
            fontSize: '12px',
            fontFamily: "'Courier New', Courier, monospace",
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          ESSENTIAL ONLY
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
