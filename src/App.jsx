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
            background: 'rgba(22, 6, 54, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #FF5376',
            borderRadius: '24px',
            padding: '12px 28px',
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'bold',
            zIndex: 10005,
            boxShadow: '0 8px 32px rgba(255, 83, 118, 0.35), 0 0 20px rgba(0, 245, 212, 0.2)',
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'slideDown 0.25s ease-out'
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#00F5D4', letterSpacing: '0.5px' }}>
            {toastAlert.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px', textTransform: 'uppercase' }}>
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
            background: 'rgba(13, 2, 33, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10010
          }}
          onClick={() => setShowKeyboardHelp(false)}
        >
          <div 
            style={{
              background: 'rgba(22, 6, 54, 0.95)',
              border: '1px solid rgba(224, 64, 251, 0.35)',
              borderRadius: '20px',
              padding: '32px',
              width: '660px',
              maxWidth: '92%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(224, 64, 251, 0.25)',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(224, 64, 251, 0.2)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 83, 118, 0.2)', border: '1px solid #FF5376', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px' }}>⌨</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#FFFFFF', margin: 0 }}>Command Shortcuts</h3>
              </div>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', fontSize: '24px', cursor: 'pointer', fontWeight: '700' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxHeight: '440px', overflowY: 'auto' }}>
              <div>
                <h4 style={{ fontSize: '11px', color: '#00F5D4', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid rgba(224, 64, 251, 0.2)', paddingBottom: '6px', marginBottom: '10px', letterSpacing: '1px' }}>Navigation Controls</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>1 - 7</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select Machine</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>Q</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Parts Explorer</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>Z</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>How It Works</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>E</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Safety Locker</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>X</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Simulator Bay</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>C</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Troubleshoot</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>V</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Assemble It</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>B</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Experiment Lab</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '11px', color: '#00F5D4', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid rgba(224, 64, 251, 0.2)', paddingBottom: '6px', marginTop: '18px', marginBottom: '10px', letterSpacing: '1px' }}>Global Settings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>H</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>High Contrast</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>L</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Toggle Labels</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '11px', color: '#00F5D4', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid rgba(224, 64, 251, 0.2)', paddingBottom: '6px', marginBottom: '10px', letterSpacing: '1px' }}>3D Camera Controls</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>W / S / A / D</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Move Camera</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>↑ / ↓ / ← / →</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Rotate Orbit</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>+ / -</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Zoom In/Out</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>R</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Reset View</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>T</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Top View</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>F</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Front View</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>P</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Perspective View</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '11px', color: '#00F5D4', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', borderBottom: '1px solid rgba(224, 64, 251, 0.2)', paddingBottom: '6px', marginTop: '18px', marginBottom: '10px', letterSpacing: '1px' }}>Sub-Panel Interaction</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>TAB / SHIFT+TAB</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Next/Prev Field</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>SPACE</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select/Toggle/Play</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>ENTER</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Confirm/Select Part</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono-font)', color: '#FF5376', fontWeight: '700' }}>ESC</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Close/Cancel</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="space-btn-primary"
                style={{ fontSize: '12px', padding: '10px 24px', borderRadius: '20px' }}
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
