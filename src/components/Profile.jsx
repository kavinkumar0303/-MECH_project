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
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-primary)' }}>
          Student Profile Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          View credentials, update institution affiliations, or manage local database resets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Card: Avatar and quick details */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              color: '#FFFFFF'
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{user?.name}</h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono-font)', color: 'var(--primary-blue)' }}>
              ID: {user?.studentId}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Level</span>
              <strong style={{ color: 'var(--text-primary)' }}>{user?.level}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total XP</span>
              <strong style={{ color: 'var(--primary-blue)', fontFamily: 'var(--mono-font)' }}>{user?.xp} XP</strong>
            </div>
          </div>
        </div>

        {/* Right Form panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Affiliation Settings</h3>

          {message && (
            <div 
              style={{ 
                padding: '10px 14px', 
                borderRadius: '4px', 
                background: 'rgba(46, 125, 50, 0.08)', 
                border: '1px solid var(--success)', 
                color: 'var(--success)',
                fontSize: '12px'
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Full Name
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px', gap: '8px' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  College / University
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px', gap: '8px' }}>
                  <School size={16} style={{ color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    name="college" 
                    value={formData.college} 
                    onChange={handleChange}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Department
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px', gap: '8px' }}>
                  <BookOpen size={16} style={{ color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              Save Configuration
            </button>
          </form>

          {/* Reset progress */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> Clear Database Cache
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '300px', lineHeight: '1.4' }}>
                Wipe your local storage progress parameters to verify onboarding walkthroughs.
              </p>
            </div>
            <button 
              onClick={handleResetProgress}
              style={{
                background: 'none',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(198, 40, 40, 0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Reset Data
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
