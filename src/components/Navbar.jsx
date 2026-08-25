import React, { useState } from 'react';
import { Search, Trophy, ShieldAlert, Award, Bell, Settings } from 'lucide-react';
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
    <div 
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90
      }}
    >
      {/* Search Bar - styled as Brushed Steel slot */}
      <div style={{ position: 'relative', width: '320px' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px 14px', gap: '8px' }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search parts, machines, defects..." 
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>

        {/* Dropdown Results */}
        {showResults && searchResults.length > 0 && (
          <div 
            style={{
              position: 'absolute',
              top: '45px',
              left: 0,
              right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 1000
            }}
          >
            {searchResults.map((res, index) => (
              <div 
                key={index}
                onClick={() => handleResultClick(res)}
                style={{
                  padding: '12px 16px',
                  borderBottom: index === searchResults.length - 1 ? 'none' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {res.type}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{res.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {res.sub}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Telemetry Metrics Strip (Cyan details removed) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={16} style={{ color: 'var(--secondary-blue)' }} />
          <div>
            <div className="telemetry-label">Workshop XP</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-blue)', fontFamily: 'var(--mono-font)' }}>
              {user?.xp?.toLocaleString() || '0'} XP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} style={{ color: 'var(--secondary-blue)' }} />
          <div>
            <div className="telemetry-label">Safety Rating</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: user?.safetyScore >= 85 ? 'var(--success)' : 'var(--primary-blue)', fontFamily: 'var(--mono-font)' }}>
              {user?.safetyScore || '100'}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} style={{ color: 'var(--secondary-blue)' }} />
          <div>
            <div className="telemetry-label">Accuracy</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-blue)', fontFamily: 'var(--mono-font)' }}>
              {user?.accuracy || '90'}%
            </div>
          </div>
        </div>

        {/* Compact Settings & Accessibility Dropdown */}
        <div 
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '12px' }}
        >
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            aria-label="Settings and Accessibility Menu"
            aria-haspopup="true"
            aria-expanded={showSettingsMenu}
            style={{
              background: showSettingsMenu ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
              border: '1px solid ' + (showSettingsMenu ? 'var(--primary-blue)' : 'var(--border)'),
              color: showSettingsMenu ? 'var(--primary-blue)' : 'var(--text-secondary)',
              borderRadius: '4px',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.outline = '2px solid var(--primary-blue)'}
            onBlur={(e) => e.currentTarget.style.outline = 'none'}
          >
            <Settings size={16} />
          </button>

          {showSettingsMenu && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                boxShadow: '0 4px 20px rgba(59, 75, 111, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '180px',
                zIndex: 10005
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Accessibility
              </div>
              
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={showLabels ? "btn-primary" : "btn-outline"}
                style={{ fontSize: '11px', padding: '6px 10px', width: '100%', textTransform: 'uppercase' }}
              >
                Labels: {showLabels ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setHighContrast(!highContrast)}
                className={highContrast ? "btn-primary" : "btn-outline"}
                style={{ fontSize: '11px', padding: '6px 10px', width: '100%', textTransform: 'uppercase' }}
              >
                Contrast: {highContrast ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => {
                  setShowKeyboardHelp(true);
                  setShowSettingsMenu(false);
                }}
                className="btn-outline"
                style={{ fontSize: '11px', padding: '6px 10px', width: '100%', textTransform: 'uppercase' }}
              >
                Keyboard Help
              </button>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '6px', height: '6px', background: 'var(--primary-blue)', borderRadius: '3px' }}></div>
        </div>
      </div>
    </div>
  );
}
