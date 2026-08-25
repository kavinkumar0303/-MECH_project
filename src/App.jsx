import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import WorkshopMap from './components/WorkshopMap';
import MachineCockpit from './components/MachineCockpit';
import DecisionAssistant from './components/DecisionAssistant';
import MachineComparison from './components/MachineComparison';
import MyProgress from './components/MyProgress';
import Profile from './components/Profile';
import WorkshopAI from './components/WorkshopAI';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMachineId, setSelectedMachineId] = useState('lathe');
  const [isLoading, setIsLoading] = useState(true);

  // Global UX States
  const [highContrast, setHighContrast] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [toastAlert, setToastAlert] = useState(null);

  // Sync user state with localStorage
  useEffect(() => {
    const cachedSession = localStorage.getItem('active_student_session');
    if (cachedSession) {
      setUser(JSON.parse(cachedSession));
    }
    setIsLoading(false);
  }, []);

  // Handle High Contrast body class toggling
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Global Keys Handler (1-7 machines, high contrast toggle, labels toggle, keyboard help toggle)
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isTyping) return;

      const machineKeys = {
        '1': 'lathe',
        '2': 'welding',
        '3': 'milling',
        '4': 'shaper',
        '5': 'planer',
        '6': 'casting',
        '7': 'moulding'
      };

      // 1-7 Machine Quick Selector
      if (machineKeys[e.key]) {
        e.preventDefault();
        setSelectedMachineId(machineKeys[e.key]);
        setActiveTab('machine_explorer');
        triggerToast(`${machineKeys[e.key].toUpperCase()} SELECTED`, `Shortcut: ${e.key}`);
      }

      // H / h: Toggle High Contrast
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setHighContrast(prev => {
          const next = !prev;
          triggerToast(next ? 'HIGH CONTRAST ENABLED' : 'HIGH CONTRAST DISABLED', 'Shortcut: H');
          return next;
        });
      }

      // L / l: Toggle Labels
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setShowLabels(prev => {
          const next = !prev;
          triggerToast(next ? 'COMPONENT LABELS SHOWN' : 'COMPONENT LABELS HIDDEN', 'Shortcut: L');
          return next;
        });
      }

      // K / k or ?: Toggle Keyboard Shortcuts Panel
      if (e.key === 'k' || e.key === 'K' || e.key === '?') {
        e.preventDefault();
        setShowKeyboardHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  const triggerToast = (title, subText) => {
    setToastAlert({ title, subText });
    const timer = setTimeout(() => setToastAlert(null), 2500);
    return () => clearTimeout(timer);
  };

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem('active_student_session', JSON.stringify(loggedUser));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('active_student_session');
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('active_student_session', JSON.stringify(updatedUser));
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--brand-primary)', fontSize: '14px', fontFamily: 'var(--mono-font)', letterSpacing: '1px' }}>
          LOADING VIRTUAL FACTORY COCKPIT...
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Auth onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Render the currently selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            setActiveTab={setActiveTab} 
            setSelectedMachineId={setSelectedMachineId} 
          />
        );
      case 'workshop_map':
        return (
          <WorkshopMap 
            setActiveTab={setActiveTab} 
            setSelectedMachineId={setSelectedMachineId} 
          />
        );
      case 'machine_explorer':
        return (
          <MachineCockpit 
            user={user} 
            onUpdateUser={handleUpdateUser} 
            initialMachineId={selectedMachineId} 
            showLabels={showLabels}
            highContrast={highContrast}
          />
        );
      case 'decision_assistant':
        return <DecisionAssistant />;
      case 'comparison':
        return <MachineComparison />;
      case 'progress':
        return <MyProgress user={user} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            onUpdateUser={handleUpdateUser} 
            onLogout={handleLogout} 
          />
        );
      default:
        return <Dashboard user={user} setActiveTab={setActiveTab} setSelectedMachineId={setSelectedMachineId} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', width: '100vw', overflowX: 'hidden' }}>
      {/* Navigation sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedMachineId={selectedMachineId}
        setSelectedMachineId={setSelectedMachineId}
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main panel viewport area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <Navbar 
          user={user} 
          setActiveTab={setActiveTab} 
          setSelectedMachineId={setSelectedMachineId}
          showKeyboardHelp={showKeyboardHelp}
          setShowKeyboardHelp={setShowKeyboardHelp}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
        
        <div style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
          {renderTabContent()}
        </div>
      </div>

      {/* Floating Interactive Workshop AI Assistant */}
      <WorkshopAI />

      {/* Industrial Toast Alerts */}
      {toastAlert && (
        <div 
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: '2px solid var(--primary-blue)',
            borderRadius: '4px',
            padding: '12px 24px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--mono-font)',
            fontWeight: 'bold',
            zIndex: 10005,
            boxShadow: '0 4px 20px rgba(29, 73, 180, 0.15)',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'slideDown 0.25s ease-out'
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--primary-blue)' }}>
            {toastAlert.title}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'uppercase' }}>
            {toastAlert.subText}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Interactive Overlay Modal */}
      {showKeyboardHelp && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10010
          }}
          onClick={() => setShowKeyboardHelp(false)}
        >
          <div 
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--primary-blue)',
              borderRadius: '8px',
              padding: '28px',
              width: '640px',
              maxWidth: '90%',
              boxShadow: '0 10px 40px rgba(29, 73, 180, 0.15)',
              color: 'var(--text-primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⌨</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--primary-blue)' }}>Keyboard Shortcuts</h3>
              </div>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer', fontWeight: '700' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxHeight: '420px', overflowY: 'auto' }}>
              <div>
                <h4 style={{ fontSize: '11px', color: 'var(--secondary-blue)', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '8px' }}>Navigation Controls</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1 - 7</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Select Machine</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Q</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Parts Explorer</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Z</span>
                    <span style={{ color: 'var(--text-secondary)' }}>How It Works</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>E</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Safety Locker</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>X</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Simulator Bay</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>C</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Troubleshoot</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>V</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Assemble It</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>B</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Experiment Lab</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '11px', color: 'var(--secondary-blue)', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginTop: '16px', marginBottom: '8px' }}>Global Settings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>H</span>
                    <span style={{ color: 'var(--text-secondary)' }}>High Contrast</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>L</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Toggle Labels</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '11px', color: 'var(--secondary-blue)', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '8px' }}>3D Camera Controls</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>W / S / A / D</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Move Camera</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>↑ / ↓ / ← / →</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Rotate Orbit</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>+ / -</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Zoom In/Out</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>R</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Reset View</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>T</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Top View</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>F</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Front View</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>P</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Perspective View</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '11px', color: 'var(--secondary-blue)', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginTop: '16px', marginBottom: '8px' }}>Sub-Panel Interaction</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TAB / SHIFT+TAB</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Next/Prev Field</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SPACE</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Select/Toggle/Play</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ENTER</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Confirm/Select Part</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ESC</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Close/Cancel</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="btn-primary"
                style={{ fontSize: '11px', padding: '8px 16px' }}
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
