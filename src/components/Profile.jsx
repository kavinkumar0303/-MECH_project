
import React, { useState } from 'react';
import { User, Mail, School, BookOpen, AlertTriangle, LogOut } from 'lucide-react';

export default function Profile({ user, onUpdateUser, onLogout }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    department: user?.department || '',
    email: user?.email || ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      ...formData
    });
    setMessage('✓ Profile updated successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResetProgress = () => {
    if (window.confirm("WARNING: This will reset all your XP, completed missions, safety scores, and unlocked badges to demo values. Proceed?")) {
      const resetUser = {
        ...user,
        xp: 1240,
        level: 'Workshop Apprentice',
        safetyScore: 94,
        accuracy: 88,
        completedMissions: 12,
        machinesExplored: 4,
        completedMissionsList: ['lathe_01', 'welding_01', 'milling_01'],
        badges: ['Lathe Beginner', 'Safety First', 'Milling Master']
      };
      onUpdateUser(resetUser);
      setMessage('✓ Progress reset to default benchmark simulation values');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>

      {/* Title */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#FFFFFF' }}>
          Student Profile Dashboard
        </h2>
        <p style={{ color: '#D8B4FE', fontSize: '14px', marginTop: '4px' }}>
          View credentials, update institution affiliations, or manage local database resets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>

        {/* Left Card: Avatar and quick details */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '28px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '42px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '34px',
              fontWeight: '900',
              color: '#FFFFFF',
              boxShadow: '0 0 25px rgba(255, 83, 118, 0.45)'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>{user?.name}</h3>
            <span className="space-badge-cyan" style={{ marginTop: '6px' }}>
              ID: {user?.studentId}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid rgba(168, 85, 247, 0.25)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#D8B4FE' }}>Rank Level</span>
              <strong style={{ color: '#FF5376' }}>{user?.level}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#D8B4FE' }}>Total XP</span>
              <strong style={{ color: '#00F5D4', fontFamily: 'var(--mono-font)' }}>{user?.xp} XP</strong>
            </div>
          </div>
        </div>

        {/* Right Form panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(28, 10, 58, 0.75)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '16px', padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>Affiliation Settings</h3>

          {message && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(0, 245, 212, 0.12)',
                border: '1px solid #00F5D4',
                color: '#00F5D4',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#D8B4FE', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                Full Name
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 3, 35, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                <User size={18} style={{ color: '#FF5376' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '14px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#D8B4FE', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 3, 35, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                <Mail size={18} style={{ color: '#00F5D4' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '14px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#D8B4FE', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                  College / University
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 3, 35, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                  <School size={18} style={{ color: '#E040FB' }} />
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '14px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#D8B4FE', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                  Department
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 3, 35, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                  <BookOpen size={18} style={{ color: '#7928CA' }} />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '14px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="space-btn-primary"
              style={{ padding: '14px', justifyContent: 'center', width: '100%', marginTop: '8px' }}
            >
              Save Configuration
            </button>
          </form>

          {/* Reset progress */}
          <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.25)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Clear Database Cache
              </h4>
              <p style={{ fontSize: '12px', color: '#D8B4FE', marginTop: '2px', maxWidth: '320px', lineHeight: '1.4' }}>
                Wipe your local storage progress parameters to verify onboarding walkthroughs.
              </p>
            </div>
            <button
              onClick={handleResetProgress}
              className="space-btn-secondary"
              style={{
                borderColor: 'var(--danger)',
                color: 'var(--danger)',
                padding: '8px 16px',
                fontSize: '11px'
              }}
            >
              Reset Data
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
