import React from 'react';
import { Award, ShieldAlert, CheckCircle } from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function MyProgress({ user }) {
  const allBadges = [
    { name: "Safety First", desc: "Successfully completed safety check on 3 machines.", color: "var(--success)" },
    { name: "Lathe Beginner", desc: "Manufactured your first cylindrical shaft.", color: "var(--accent-orange)" },
    { name: "Milling Master", desc: "Milled a perfect flat slot profile.", color: "var(--accent-orange)" },
    { name: "Troubleshooter", desc: "Identified and resolved 2 severe machine setup errors.", color: "var(--accent-amber)" },
    { name: "Workshop Expert", desc: "Explored all 7 workshop bays.", color: "var(--steel-light)" }
  ];

  const getMachineProgress = (machineId) => {
    if (user?.completedMissionsList?.includes(`${machineId}_01`)) {
      return 100;
    }
    if (machineId === 'lathe') return 80;
    if (machineId === 'welding') return 60;
    if (machineId === 'milling') return 90;
    if (machineId === 'casting') return 40;
    return 0;
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#FFFFFF' }}>
          My Workshop Progress
        </h2>
        <p style={{ color: '#D8B4FE', fontSize: '14px', marginTop: '4px' }}>
          Real-time performance meters, training progression, and unlocked certificates.
        </p>
      </div>

      {/* Telemetry charts row */}
      <div className="grid-cols-3">
        {/* XP Progress ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '24px' }}>
          <span className="space-badge-pink">Rank XP Status</span>
          <div style={{ position: 'relative', width: '130px', height: '130px', marginTop: '8px' }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <defs>
                <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5376" />
                  <stop offset="100%" stopColor="#E040FB" />
                </linearGradient>
              </defs>
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(121, 40, 202, 0.2)" strokeWidth="10" />
              <circle cx="65" cy="65" r="52" fill="none" stroke="url(#xpGrad)" strokeWidth="10" strokeDasharray="326.7" strokeDashoffset="80" strokeLinecap="round" transform="rotate(-90 65 65)" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--mono-font)' }}>{user?.xp || 6858}</span>
              <span style={{ fontSize: '10px', color: '#D8B4FE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current XP</span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#D8B4FE' }}>
            Rank Tier: <strong style={{ color: '#FF5376' }}>{user?.level || 'Apprentice'}</strong>
          </div>
        </div>

        {/* Safety Rating ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '24px' }}>
          <span className="space-badge-cyan">Safety Compliance</span>
          <div style={{ position: 'relative', width: '130px', height: '130px', marginTop: '8px' }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <defs>
                <linearGradient id="safetyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F5D4" />
                  <stop offset="100%" stopColor="#4CC9F0" />
                </linearGradient>
              </defs>
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(0, 245, 212, 0.2)" strokeWidth="10" />
              <circle cx="65" cy="65" r="52" fill="none" stroke="url(#safetyGrad)" strokeWidth="10" strokeDasharray="326.7" strokeDashoffset={326.7 * (1 - (user?.safetyScore || 94) / 100)} strokeLinecap="round" transform="rotate(-90 65 65)" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#00F5D4', fontFamily: 'var(--mono-font)' }}>{user?.safetyScore || 94}%</span>
              <span style={{ fontSize: '10px', color: '#D8B4FE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compliance</span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#D8B4FE' }}>
            Maintain &gt;85% to operate live machines
          </div>
        </div>

        {/* Accuracy ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '24px' }}>
          <span className="space-badge-purple">Machining Accuracy</span>
          <div style={{ position: 'relative', width: '130px', height: '130px', marginTop: '8px' }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <defs>
                <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E040FB" />
                  <stop offset="100%" stopColor="#7928CA" />
                </linearGradient>
              </defs>
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(224, 64, 251, 0.2)" strokeWidth="10" />
              <circle cx="65" cy="65" r="52" fill="none" stroke="url(#accGrad)" strokeWidth="10" strokeDasharray="326.7" strokeDashoffset={326.7 * (1 - (user?.accuracy || 88) / 100)} strokeLinecap="round" transform="rotate(-90 65 65)" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--mono-font)' }}>{user?.accuracy || 88}%</span>
              <span style={{ fontSize: '10px', color: '#D8B4FE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Caliper Rating</span>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#D8B4FE' }}>
            Based on finished component dimensions
          </div>
        </div>
      </div>

      {/* Split section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Machine progress */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>Training Bay Progression</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.values(MACHINES).map((m) => {
              const pct = getMachineProgress(m.id);
              return (
                <div key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#FFFFFF' }}>{m.name}</span>
                    <span style={{ color: '#00F5D4', fontWeight: '800', fontFamily: 'var(--mono-font)' }}>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(15, 3, 35, 0.6)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #FF5376 0%, #E040FB 50%, #00F5D4 100%)', transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges unlocked */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>Achievement Badges</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allBadges.map((badge, idx) => {
              const isUnlocked = user?.badges?.includes(badge.name) || idx < 3;
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid ' + (isUnlocked ? 'rgba(255, 83, 118, 0.4)' : 'rgba(168, 85, 247, 0.15)'),
                    background: isUnlocked ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.15) 0%, rgba(121, 40, 202, 0.3) 100%)' : 'rgba(15, 3, 35, 0.3)',
                    opacity: isUnlocked ? 1 : 0.45,
                    boxShadow: isUnlocked ? '0 0 15px rgba(255, 83, 118, 0.15)' : 'none'
                  }}
                >
                  <Award size={22} style={{ color: isUnlocked ? '#FF5376' : '#9480B8', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>
                      {badge.name} {isUnlocked && <span style={{ color: '#00F5D4', fontSize: '12px', marginLeft: '4px' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#D8B4FE', marginTop: '2px' }}>
                      {badge.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
