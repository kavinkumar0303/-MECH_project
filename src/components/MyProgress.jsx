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
        <h2 style={{ fontSize: '22px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-primary)' }}>
          My Workshop Progress
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Real-time performance meters, training progression, and unlocked certificates.
        </p>
      </div>

      {/* Telemetry charts row */}
      <div className="grid-cols-3">
        {/* XP Progress ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <span className="telemetry-label">Rank XP Status</span>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-orange)" strokeWidth="8" strokeDasharray="314.16" strokeDashoffset="80" strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>{user?.xp}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current XP</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Level: <strong style={{ color: 'var(--accent-orange)' }}>{user?.level}</strong>
          </div>
        </div>

        {/* Safety Rating ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <span className="telemetry-label">Safety Compliance</span>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent-orange)" strokeWidth="8" strokeDasharray="314.16" strokeDashoffset={314.16 * (1 - (user?.safetyScore || 100) / 100)} strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>{user?.safetyScore}%</span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Compliance</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Maintain &gt;85% to operate live machines
          </div>
        </div>

        {/* Accuracy ring */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <span className="telemetry-label">Machining Accuracy</span>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--success)" strokeWidth="8" strokeDasharray="314.16" strokeDashoffset={314.16 * (1 - (user?.accuracy || 90) / 100)} strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>{user?.accuracy}%</span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Caliper Rating</span>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Based on finished component dimensions
          </div>
        </div>
      </div>

      {/* Split section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Machine progress */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Training Bay Progression</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.values(MACHINES).map((m) => {
              const pct = getMachineProgress(m.id);
              return (
                <div key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{m.name}</span>
                    <span style={{ color: m.color, fontWeight: '700', fontFamily: 'var(--mono-font)' }}>{pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: m.color, transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges unlocked */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Achievement Badges</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allBadges.map((badge, idx) => {
              const isUnlocked = user?.badges?.includes(badge.name) || false;
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid ' + (isUnlocked ? badge.color + '30' : 'var(--border)'),
                    background: isUnlocked ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.15)',
                    opacity: isUnlocked ? 1 : 0.4
                  }}
                >
                  <Award size={20} style={{ color: isUnlocked ? badge.color : 'var(--text-secondary)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {badge.name} {isUnlocked && '✓'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
