import { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingScreen() {
  const { active, progress, loaded, total, item } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [fading, setFading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    'ESTABLISHING ORBITAL UPLINK...',
    'SYNCHRONIZING CELESTIAL EPHEMERIS...'
  ]);

  // Update real-time console log messages when assets load
  useEffect(() => {
    if (item) {
      const fileName = item.split('/').pop() || item;
      setLogMessages((prev) => {
        const next = [...prev, `LOADED MODULE: ${fileName.toUpperCase()}`];
        return next.slice(-4); // keep last 4 lines
      });
    }
  }, [item]);

  // Smooth progress interpolation
  useEffect(() => {
    const target = Math.min(100, Math.max(progress, displayProgress));
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 100 || (!active && progress === 100)) {
          clearInterval(interval);
          return 100;
        }
        if (prev < target) {
          return prev + 1;
        }
        return prev;
      });
    }, 12);

    return () => clearInterval(interval);
  }, [progress, active, displayProgress]);

  // Fade out transition
  useEffect(() => {
    if (displayProgress >= 100 && !active) {
      const timer = setTimeout(() => {
        setFading(true);
        const hideTimer = setTimeout(() => {
          setHidden(true);
        }, 900);
        return () => clearTimeout(hideTimer);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [displayProgress, active]);

  if (hidden) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#030712',
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.15), transparent 70%), radial-gradient(ellipse 60% 50% at 50% 120%, rgba(14, 165, 233, 0.1), transparent)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: fading ? 'none' : 'auto',
        fontFamily: "'Courier New', Courier, monospace",
        color: '#f8fafc',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* Background Subtle Cyber Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          pointerEvents: 'none'
        }}
      />

      {/* Main HUD Card */}
      <div
        style={{
          width: '90vw',
          maxWidth: '520px',
          position: 'relative',
          padding: '40px 32px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        {/* HUD Corner Brackets */}
        <div style={{ position: 'absolute', top: 10, left: 12, fontSize: '14px', color: '#38bdf8', opacity: 0.8 }}>⌜</div>
        <div style={{ position: 'absolute', top: 10, right: 12, fontSize: '14px', color: '#38bdf8', opacity: 0.8 }}>⌝</div>
        <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: '14px', color: '#38bdf8', opacity: 0.8 }}>⌞</div>
        <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: '14px', color: '#38bdf8', opacity: 0.8 }}>⌟</div>

        {/* Top Telemetry Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8', animation: 'hudPulse 1.5s infinite' }} />
            <span style={{ fontSize: '11px', letterSpacing: '3px', fontWeight: 'bold', color: '#38bdf8' }}>MISSION SEQUENCE</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '2px' }}>VER 2.4 // 3D-R3F</div>
        </div>

        {/* Main Title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '20px', fontFamily: "'Press Start 2P', monospace", color: '#ffffff', letterSpacing: '1px', textShadow: '0 0 16px rgba(255, 255, 255, 0.4)', marginBottom: '8px' }}>
            ARNAV'S ODYSSEY
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '1px' }}>
            Compiling WebGL Shaders & Planetary Assets...
          </div>
        </div>

        {/* Dynamic Percentage Readout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '2px', fontFamily: 'monospace' }}>
            {displayProgress.toFixed(0)}<span style={{ fontSize: '18px', color: '#38bdf8' }}>%</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px' }}>
            [ {loaded} / {total || 14} CHUNKS ]
          </div>
        </div>

        {/* High-Tech Progress Track */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${displayProgress}%`,
              background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 80%, #ffffff 100%)',
              boxShadow: '0 0 12px #38bdf8, 0 0 24px #0284c7',
              borderRadius: '2px',
              transition: 'width 0.15s ease-out'
            }}
          />
        </div>

        {/* Live Terminal Output Box */}
        <div
          style={{
            background: 'rgba(2, 6, 23, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '8px',
            padding: '12px 14px',
            minHeight: '84px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: '4px'
          }}
        >
          {logMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                fontSize: '10px',
                color: i === logMessages.length - 1 ? '#38bdf8' : '#475569',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              <span style={{ color: '#0284c7', marginRight: '6px' }}>&gt;</span>
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Bottom Footer */}
      <div style={{ position: 'absolute', bottom: '24px', fontSize: '10px', color: '#475569', letterSpacing: '4px' }}>
        INITIALIZING DEEP SPACE PROTOCOLS
      </div>

      <style>{`
        @keyframes hudPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
