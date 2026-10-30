import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Bell, HelpCircle, Search, Settings, ShieldCheck, X } from 'lucide-react';
import { MACHINES } from '../data/machines';

const pageTitles = {
  dashboard: 'Overview',
  workshop_map: 'Workshop map',
  machine_explorer: 'Machine simulator',
  decision_assistant: 'Decision assistant',
  comparison: 'Compare machines',
  progress: 'My progress',
  profile: 'My profile'
};

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  setSelectedMachineId,
  setShowKeyboardHelp,
  showLabels,
  setShowLabels,
  highContrast,
  setHighContrast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const results = [];
    Object.values(MACHINES).forEach((machine) => {
      if (`${machine.name} ${machine.tagline}`.toLowerCase().includes(query)) {
        results.push({ type: 'Machine', label: machine.name, sub: machine.tagline, id: machine.id });
      }
      machine.parts.forEach((part) => {
        if (`${part.name} ${part.desc}`.toLowerCase().includes(query)) {
          results.push({ type: machine.name, label: part.name, sub: part.desc, id: machine.id });
        }
      });
    });
    return results.slice(0, 5);
  }, [searchQuery]);

  const openResult = (result) => {
    setSelectedMachineId(result.id);
    setActiveTab('machine_explorer');
    setSearchQuery('');
    setShowResults(false);
  };

  const handleSettingsBlur = (event) => {
    if (!settingsRef.current?.contains(event.relatedTarget)) setShowSettingsMenu(false);
  };

  return (
    <header className="app-topbar">
      <div className="topbar-page">
        <span className="topbar-kicker">MECHDRIVE WORKSHOP</span>
        <strong>{pageTitles[activeTab] || 'Workshop'}</strong>
      </div>

      <div className="topbar-search-wrap">
        <label className="topbar-search">
          <Search size={17} />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search machines, parts..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setShowResults(false);
              if (event.key === 'Enter' && searchResults[0]) openResult(searchResults[0]);
            }}
            aria-label="Search machines and parts"
          />
          {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search"><X size={15} /></button>}
          <kbd>⌘ K</kbd>
        </label>
        {showResults && searchQuery && (
          <div className="topbar-results">
            {searchResults.length ? searchResults.map((result, index) => (
              <button key={`${result.id}-${result.label}-${index}`} onClick={() => openResult(result)} className="topbar-result">
                <span className="result-icon"><Search size={15} /></span>
                <span><strong>{result.label}</strong><small>{result.type} · {result.sub}</small></span>
              </button>
            )) : <div className="topbar-no-results">No matching machines or parts.</div>}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <span className="topbar-stat"><Award size={16} /><span><small>WORKSHOP XP</small><strong>{(user?.xp || 0).toLocaleString()}</strong></span></span>
        <span className="topbar-stat safety-stat"><ShieldCheck size={17} /><span><small>SAFETY</small><strong>{user?.safetyScore ?? 100}%</strong></span></span>
        <button className="topbar-icon-button" onClick={() => setActiveTab('progress')} aria-label="View progress">
          <Bell size={18} /><span className="notification-dot" />
        </button>
        <div className="topbar-settings" ref={settingsRef} onBlur={handleSettingsBlur}>
          <button
            className={`topbar-icon-button${showSettingsMenu ? ' is-selected' : ''}`}
            onClick={() => setShowSettingsMenu((value) => !value)}
            aria-label="Accessibility and view settings"
            aria-haspopup="true"
            aria-expanded={showSettingsMenu}
          >
            <Settings size={18} />
          </button>
          {showSettingsMenu && (
            <div className="settings-menu">
              <span className="settings-title">Display & accessibility</span>
              <button onClick={() => setShowLabels(!showLabels)}>3D labels <strong>{showLabels ? 'On' : 'Off'}</strong></button>
              <button onClick={() => setHighContrast(!highContrast)}>High contrast <strong>{highContrast ? 'On' : 'Off'}</strong></button>
              <button onClick={() => { setShowKeyboardHelp(true); setShowSettingsMenu(false); }}><HelpCircle size={15} /> Keyboard shortcuts</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
