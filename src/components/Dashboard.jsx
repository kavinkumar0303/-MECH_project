import React from 'react';
import { Play, ShieldAlert, Award, FileText, ChevronRight, CheckCircle } from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function Dashboard({ user, setActiveTab, setSelectedMachineId }) {
  const badgeColors = {
    'Lathe Beginner': 'var(--accent-orange)',
    'Milling Master': 'var(--accent-orange)',
    'Safety First': 'var(--success)',
    'Troubleshooter': 'var(--accent-amber)',
    'Workshop Expert': 'var(--accent-orange)'
  };

  const handleQuickLink = (machineId) => {
    setSelectedMachineId(machineId);
    setActiveTab('machine_explorer');
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header control center banner */}
      <div 
        className="glass-panel"
        style={{
          background: 'var(--bg-secondary)',
          borderLeft: '4px solid var(--primary-blue)',
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Welcome back, {user?.name || 'Engineer'}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '600px', lineHeight: '1.4' }}>
            Operational parameters calibrated. Navigate the 3D workshop layout benches, run machining operations, or solve industrial troubleshooting diagnostics.
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setActiveTab('workshop_map')}
          style={{ 
            padding: '12px 24px', 
            fontSize: '13px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Enter 3D Workshop <Play size={14} fill="currentColor" />
        </button>
      </div>

      {/* Metrics telemetry grid */}
      <div className="grid-cols-4">
        {/* Level */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="telemetry-label">Engine Level</span>
            <Award size={16} style={{ color: 'var(--accent-orange)' }} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{user?.level || 'Apprentice'}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Total score: <strong style={{ color: 'var(--accent-orange)', fontFamily: 'var(--mono-font)' }}>{user?.xp?.toLocaleString()} XP</strong>
          </div>
        </div>

        {/* Safety */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="telemetry-label">Safety score</span>
            <ShieldAlert size={16} style={{ color: 'var(--accent-orange)' }} />
          </div>
          <div>
            <span style={{ fontSize: '28px', fontWeight: '800', color: user?.safetyScore >= 85 ? 'var(--success)' : 'var(--accent-orange)', fontFamily: 'var(--mono-font)' }}>
              {user?.safetyScore || '100'}%
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Compliance parameters aligned
          </div>
        </div>

        {/* Missions solved */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="telemetry-label">Missions completed</span>
            <FileText size={16} style={{ color: 'var(--steel-light)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>
              {user?.completedMissions || '0'}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Runs</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Across all mechanical bays
          </div>
        </div>

        {/* Completion */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="telemetry-label">Bays completed</span>
            <CheckCircle size={16} style={{ color: 'var(--accent-orange)' }} />
          </div>
          <div>
            <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--mono-font)' }}>
              {user?.machinesExplored || '0'} / 7
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Workshop units unlocked
          </div>
        </div>
      </div>

      {/* Main split dashboard section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Machine Bay Quicklinks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Machining training console
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.values(MACHINES).map((m) => {
              const isExplored = user?.completedMissionsList?.includes(`${m.id}_01`) || false;
              return (
                <div 
                  key={m.id}
                  className={`glass-panel machine-row ${isExplored ? 'explored' : ''}`}
                  style={{
                    borderLeft: `3px solid ${isExplored ? 'var(--primary-blue)' : 'var(--border)'}`,
                    padding: '14px 20px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{m.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {m.tagline}
                    </p>
                  </div>
                  <div>
                    {isExplored ? (
                      <span style={{ fontSize: '10px', color: 'var(--success)', fontFamily: 'var(--mono-font)', background: 'rgba(46, 125, 80, 0.08)', padding: '2px 6px', borderRadius: '3px' }}>
                        ✓ Compliant
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--mono-font)' }}>
                        Calibrating
                      </span>
                    )}
                  </div>
                  <div style={{ justifySelf: 'end' }}>
                    <button 
                      onClick={() => handleQuickLink(m.id)}
                      className="btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        width: '100px'
                      }}
                    >
                      Enter Bay <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges and milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.8px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Earned Credentials
          </h3>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-secondary)' }}>
            {user?.badges?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {user.badges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '12px 8px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Award size={20} style={{ color: badgeColors[badge] || 'var(--accent-orange)' }} />
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '12px' }}>No credentials unlocked.</p>
                <p style={{ fontSize: '10px', marginTop: '4px' }}>Complete simulation checks to unlock certificates.</p>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '16px', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <span>Next Milestone</span>
                <span style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>Troubleshooter</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--primary-blue)' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
