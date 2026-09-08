import React, { useState } from 'react';
import { Search, Trophy, ShieldAlert, Award, Bell, Settings, Sparkles, MessageSquare, HelpCircle } from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function Navbar({ 
  user, 
  setActiveTab, 
  setSelectedMachineId,
  showKeyboardHelp,
  setShowKeyboardHelp,
  showLabels,
  setShowLabels,
  highContrast,
  setHighContrast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const handleBlur = (e) => {
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        setShowSettingsMenu(false);
      }
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSettingsMenu(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length > 0);
  };

  const getSearchResults = () => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    const results = [];

    Object.values(MACHINES).forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q)) {
        results.push({ type: 'machine', label: m.name, sub: m.tagline, id: m.id });
      }
      m.parts.forEach((p) => {
        if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
          results.push({ type: 'part', label: `${m.name} - ${p.name}`, sub: p.desc, id: m.id });
        }
      });
      m.troubleshoot.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) {
          results.push({ type: 'troubleshoot', label: `${m.name} - Fix: ${t.title}`, sub: t.desc, id: m.id });
        }
      });
    });

    return results.slice(0, 5);
  };

  const handleResultClick = (res) => {
    setSearchQuery('');
    setShowResults(false);
    setSelectedMachineId(res.id);
    setActiveTab('machine_explorer');
  };

  const searchResults = getSearchResults();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'sticky', top: 0, zIndex: 90 }}>
      
      {/* 1. SpaceDrive Top Mini Utility Strip */}
      <div className="space-top-utility">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>support@mechdrive.edu</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>+91 90000 00000</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F5D4' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F5D4', boxShadow: '0 0 8px #00F5D4' }}></span>
            Live 3D Simulation Engine
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setShowKeyboardHelp(true)}>
            <HelpCircle size={12} /> Keyboard Guide (K)
          </span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setActiveTab('progress')}>
            <Trophy size={12} /> Leaderboard
          </span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
            Student ID: #{user?.studentId || 'MECH-704'}
          </span>
        </div>
      </div>

      {/* 2. Main SpaceDrive Navbar */}
      <div 
        style={{
          height: '68px',
          borderBottom: '1px solid rgba(168, 85, 247, 0.25)',
          background: 'rgba(22, 6, 54, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          boxShadow: '0 8px 30px rgba(13, 2, 33, 0.6)'
        }}
      >
        {/* SpaceDrive Search Capsule */}
        <div style={{ position: 'relative', width: '380px' }}>
          <div className="space-search-capsule" style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
            <Search size={16} style={{ color: '#7928CA', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Search machines, tools, operations..." 
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            <span className="space-search-tag">.3D</span>
            <button 
              className="space-search-btn"
              onClick={() => {
                if (searchResults.length > 0) handleResultClick(searchResults[0]);
              }}
            >
              Search
            </button>
          </div>

          {/* Dropdown Results */}
          {showResults && searchResults.length > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '52px',
                left: 0,
                right: 0,
                background: 'rgba(26, 8, 64, 0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(224, 64, 251, 0.35)',
                borderRadius: '14px',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)',
                overflow: 'hidden',
                zIndex: 1000
              }}
            >
              {searchResults.map((res, index) => (
                <div 
                  key={index}
                  onClick={() => handleResultClick(res)}
                  style={{
                    padding: '12px 18px',
                    borderBottom: index === searchResults.length - 1 ? 'none' : '1px solid rgba(168, 85, 247, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(121, 40, 202, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#FF5376', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.6px' }}>
                    {res.type}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{res.label}</div>
                  <div style={{ fontSize: '11px', color: '#D8B4FE', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {res.sub}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry Metrics Strip with Neon Glowing Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <div className="space-badge-purple" style={{ padding: '8px 16px' }}>
            <Trophy size={16} style={{ color: '#FF5376' }} />
            <div>
              <div style={{ fontSize: '9px', color: '#D8B4FE', letterSpacing: '0.5px' }}>WORKSHOP XP</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--mono-font)' }}>
                {user?.xp?.toLocaleString() || '0'} XP
              </div>
            </div>
          </div>

          <div className="space-badge-cyan" style={{ padding: '8px 16px' }}>
            <ShieldAlert size={16} style={{ color: '#00F5D4' }} />
            <div>
              <div style={{ fontSize: '9px', color: '#00F5D4', letterSpacing: '0.5px' }}>SAFETY SCORE</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--mono-font)' }}>
                {user?.safetyScore || '100'}%
              </div>
            </div>
          </div>

          <div className="space-badge-pink" style={{ padding: '8px 16px' }}>
            <Award size={16} style={{ color: '#FF5376' }} />
            <div>
              <div style={{ fontSize: '9px', color: '#FF758C', letterSpacing: '0.5px' }}>ACCURACY</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--mono-font)' }}>
                {user?.accuracy || '98'}%
              </div>
            </div>
          </div>

          {/* Settings & Accessibility Dropdown */}
          <div 
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '6px' }}
          >
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              aria-label="Settings and Accessibility Menu"
              aria-haspopup="true"
              aria-expanded={showSettingsMenu}
              style={{
                background: showSettingsMenu ? 'rgba(255, 83, 118, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid ' + (showSettingsMenu ? '#FF5376' : 'rgba(168, 85, 247, 0.3)'),
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                outline: 'none',
                boxShadow: showSettingsMenu ? '0 0 15px rgba(255, 83, 118, 0.4)' : 'none'
              }}
            >
              <Settings size={16} />
            </button>

            {showSettingsMenu && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'rgba(26, 8, 64, 0.98)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(224, 64, 251, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  width: '200px',
                  zIndex: 10005
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#D8B4FE', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                  Viewport Settings
                </div>
                
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={showLabels ? "space-btn-primary" : "space-btn-secondary"}
                  style={{ fontSize: '11px', padding: '8px 12px', width: '100%', borderRadius: '20px' }}
                >
                  3D Labels: {showLabels ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={highContrast ? "space-btn-primary" : "space-btn-secondary"}
                  style={{ fontSize: '11px', padding: '8px 12px', width: '100%', borderRadius: '20px' }}
                >
                  Contrast: {highContrast ? 'HIGH' : 'DEFAULT'}
                </button>

                <button
                  onClick={() => {
                    setShowKeyboardHelp(true);
                    setShowSettingsMenu(false);
                  }}
                  className="space-btn-secondary"
                  style={{ fontSize: '11px', padding: '8px 12px', width: '100%', borderRadius: '20px' }}
                >
                  Keyboard Shortcuts
                </button>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(168, 85, 247, 0.25)' }}></div>

          <div 
            style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)' }}
            onClick={() => setActiveTab('progress')}
          >
            <Bell size={18} style={{ color: '#D8B4FE' }} />
            <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#FF5376', borderRadius: '50%', boxShadow: '0 0 8px #FF5376' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
