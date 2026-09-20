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
      
      {/* 1. Top Mini Utility Strip */}
      <div className="space-top-utility">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>support@mechdrive.edu</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>+91 90000 00000</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E65100' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF7824', boxShadow: '0 0 8px #FF7824' }}></span>
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

      {/* 2. Main Navbar */}
      <div 
        style={{
          height: '68px',
          borderBottom: '1px solid rgba(255, 120, 36, 0.18)',
          background: '#FFFFFF',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          boxShadow: '0 8px 30px rgba(234, 88, 12, 0.06)'
        }}
      >
        {/* Search Capsule */}
        <div style={{ position: 'relative', width: '380px' }}>
          <div className="space-search-capsule" style={{ background: '#FFFFFF' }}>
            <Search size={16} style={{ color: '#FF7824', flexShrink: 0 }} />
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
                background: '#FFFFFF',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 120, 36, 0.25)',
                borderRadius: '14px',
                boxShadow: '0 15px 40px rgba(234, 88, 12, 0.12)',
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
                    borderBottom: index === searchResults.length - 1 ? 'none' : '1px solid rgba(255, 120, 36, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 120, 36, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#E65100', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.6px' }}>
                    {res.type}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1917' }}>{res.label}</div>
                  <div style={{ fontSize: '11px', color: '#574A40', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {res.sub}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry Metrics Strip with Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <div className="space-badge-purple" style={{ padding: '8px 16px' }}>
            <Trophy size={16} style={{ color: '#FF7824' }} />
            <div>
              <div style={{ fontSize: '9px', color: '#8C7A70', letterSpacing: '0.5px' }}>WORKSHOP XP</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1C1917', fontFamily: 'var(--mono-font)' }}>
                {user?.xp?.toLocaleString() || '0'} XP
              </div>
            </div>
          </div>

          <div className="space-badge-cyan" style={{ padding: '8px 16px' }}>
            <ShieldAlert size={16} style={{ color: '#FF4500' }} />
            <div>
              <div style={{ fontSize: '9px', color: '#E65100', letterSpacing: '0.5px' }}>SAFETY SCORE</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1C1917', fontFamily: 'var(--mono-font)' }}>
                {user?.safetyScore || '100'}%
              </div>
            </div>
          </div>

          <div className="space-badge-pink" style={{ padding: '8px 16px' }}>
            <Award size={16} style={{ color: '#FF7824' }} />
            <div>
              <div style={{ fontSize: '9px', color: '#8C7A70', letterSpacing: '0.5px' }}>ACCURACY</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1C1917', fontFamily: 'var(--mono-font)' }}>
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
                background: showSettingsMenu ? 'rgba(255, 120, 36, 0.15)' : 'rgba(255, 120, 36, 0.08)',
                border: '1px solid ' + (showSettingsMenu ? '#FF7824' : 'rgba(255, 120, 36, 0.25)'),
                color: '#1C1917',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                outline: 'none',
                boxShadow: showSettingsMenu ? '0 0 15px rgba(255, 120, 36, 0.25)' : 'none'
              }}
            >
              <Settings size={16} style={{ color: '#E65100' }} />
            </button>

            {showSettingsMenu && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: '#FFFFFF',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 120, 36, 0.25)',
                  borderRadius: '12px',
                  padding: '14px',
                  boxShadow: '0 10px 30px rgba(234, 88, 12, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  width: '200px',
                  zIndex: 10005
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#E65100', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
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

          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 120, 36, 0.2)' }}></div>

          <div 
            style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: 'rgba(255, 120, 36, 0.08)' }}
            onClick={() => setActiveTab('progress')}
          >
            <Bell size={18} style={{ color: '#E65100' }} />
            <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#FF4500', borderRadius: '50%', boxShadow: '0 0 8px #FF4500' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
