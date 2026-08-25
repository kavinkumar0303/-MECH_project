import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Settings, 
  TrendingUp, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  selectedMachineId, 
  setSelectedMachineId, 
  user, 
  onLogout 
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workshop_map', label: 'Workplane', icon: Map },
    
    // Machine simulation bays
    { id: 'lathe', label: 'Lathe Machine', icon: Settings, isMachine: true },
    { id: 'welding', label: 'Welding', icon: Zap, isMachine: true },
    { id: 'shaper', label: 'Shaper', icon: Settings, isMachine: true },
    { id: 'planer', label: 'Planer', icon: Settings, isMachine: true },
    { id: 'milling', label: 'Milling', icon: Settings, isMachine: true },
    { id: 'casting', label: 'Casting', icon: Settings, isMachine: true },
    { id: 'moulding', label: 'Moulding', icon: Settings, isMachine: true },
    
    { id: 'progress', label: 'Reports', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleItemClick = (item) => {
    if (item.isMachine) {
      setSelectedMachineId(item.id);
      setActiveTab('machine_explorer');
    } else {
      setActiveTab(item.id);
    }
  };

  const checkActive = (item) => {
    if (item.isMachine) {
      return activeTab === 'machine_explorer' && selectedMachineId === item.id;
    }
    return activeTab === item.id;
  };

  return (
    <div 
      style={{
        width: collapsed ? '70px' : '250px',
        background: 'var(--bg-secondary)', // Deep navy/charcoal secondary
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0
      }}
    >
      {/* Brand Header & Gear + Lightning Logo */}
      <div 
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'stretch',
          gap: '12px',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
              {/* Logo block with Gear and lightning Spark */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings 
                    className="anim-slow-spin-float" 
                    size={28} 
                    style={{ color: 'var(--brand-primary)', animation: 'slow-spin 15s linear infinite' }} 
                  />
                  <Zap 
                    size={11} 
                    style={{ 
                      position: 'absolute', 
                      color: '#FFFFFF', 
                      fill: 'var(--brand-primary)' 
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.8px', textTransform: 'uppercase', lineHeight: '1.1' }}>Mechanical</span>
                  <span style={{ fontSize: '8px', fontWeight: '700', color: 'var(--brand-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>Virtual Workshop</span>
                </div>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings 
                className="anim-slow-spin-float" 
                size={28} 
                style={{ color: 'var(--brand-primary)', animation: 'slow-spin 15s linear infinite' }} 
              />
              <Zap 
                size={11} 
                style={{ 
                  position: 'absolute', 
                  color: '#FFFFFF', 
                  fill: 'var(--brand-primary)' 
                }} 
              />
            </div>
          )}

          <button 
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Menus */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'var(--brand-primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '700' : '500'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(29, 73, 180, 0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon 
                size={16} 
                style={{ 
                  flexShrink: 0, 
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'color 0.2s ease'
                }} 
              />
              {!collapsed && <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Logout Row */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          className="btn-danger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            width: '100%',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: '13px' }}>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
