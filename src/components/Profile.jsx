
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
        <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#1C1917' }}>
          Student Profile Dashboard
        </h2>
        <p style={{ color: '#574A40', fontSize: '14px', marginTop: '4px' }}>
          View credentials, update institution affiliations, or manage local database resets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>

        {/* Left Card: Avatar and quick details */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: '#FFFFFF', border: '1px solid #FFDEC9', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 30px rgba(255, 120, 36, 0.08)' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '42px',
              background: 'linear-gradient(135deg, #FF7824 0%, #FF4500 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '34px',
              fontWeight: '900',
              color: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(255, 120, 36, 0.35)'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1917' }}>{user?.name}</h3>
            <span className="space-badge-cyan" style={{ marginTop: '6px' }}>
              ID: {user?.studentId}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid #FFDEC9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#574A40' }}>Rank Level</span>
              <strong style={{ color: '#FF7824' }}>{user?.level}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#574A40' }}>Total XP</span>
              <strong style={{ color: '#FF4500', fontFamily: 'var(--mono-font)' }}>{user?.xp} XP</strong>
            </div>
          </div>
        </div>

        {/* Right Form panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF', border: '1px solid #FFDEC9', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 30px rgba(255, 120, 36, 0.08)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1917' }}>Affiliation Settings</h3>

          {message && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 120, 36, 0.12)',
                border: '1px solid #FF7824',
                color: '#E65100',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#E65100', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                Full Name
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 241, 230, 0.7)', border: '1px solid #FFDEC9', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                <User size={18} style={{ color: '#FF7824' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '14px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#E65100', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 241, 230, 0.7)', border: '1px solid #FFDEC9', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                <Mail size={18} style={{ color: '#FF7824' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '14px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#E65100', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                  College / University
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 241, 230, 0.7)', border: '1px solid #FFDEC9', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                  <School size={18} style={{ color: '#FF7824' }} />
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '14px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#E65100', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700' }}>
                  Department
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 241, 230, 0.7)', border: '1px solid #FFDEC9', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                  <BookOpen size={18} style={{ color: '#FF7824' }} />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '14px', width: '100%', outline: 'none' }}
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
          <div style={{ borderTop: '1px solid #FFDEC9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Clear Database Cache
              </h4>
              <p style={{ fontSize: '12px', color: '#574A40', marginTop: '2px', maxWidth: '320px', lineHeight: '1.4' }}>
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
