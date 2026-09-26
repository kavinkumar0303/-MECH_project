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
  Zap,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  selectedMachineId, 
  setSelectedMachineId, 
  user, 
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'workshop_map', label: '3D Workplane', icon: Map },
    
    // Machine simulation bays
    { id: 'lathe', label: 'Centre Lathe', icon: Settings, isMachine: true },
    { id: 'welding', label: 'Arc Welding', icon: Zap, isMachine: true },
    { id: 'shaper', label: 'Shaping Machine', icon: Layers, isMachine: true },
    { id: 'planer', label: 'Planing Machine', icon: Settings, isMachine: true },
    { id: 'milling', label: 'Milling Machine', icon: Settings, isMachine: true },
    { id: 'casting', label: 'Metal Casting', icon: Sparkles, isMachine: true },
    { id: 'moulding', label: 'Sand Moulding', icon: Layers, isMachine: true },
    
    { id: 'progress', label: 'Reports & XP', icon: TrendingUp },
    { id: 'profile', label: 'Student Profile', icon: User }
  ];

  const handleItemClick = (item) => {
    if (item.isMachine) {
      setSelectedMachineId(item.id);
      setActiveTab('machine_explorer');
    } else {
      setActiveTab(item.id);
    }
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
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
      className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
      style={{
        width: collapsed ? '72px' : '260px',
        background: '#FFFFFF',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(0, 119, 182, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: '4px 0 30px rgba(0, 119, 182, 0.06)'
      }}
    >
      {/* Brand Header & Gear + Lightning Logo */}
      <div 
        style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(0, 119, 182, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'stretch',
          gap: '12px',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Glowing Logo Icon */}
              <div 
                style={{ 
                  position: 'relative', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 18px rgba(0, 119, 182, 0.35)'
                }}
              >
                <Settings 
                  className="anim-slow-spin-float" 
                  size={20} 
                  style={{ color: '#FFFFFF', animation: 'slow-spin 15s linear infinite' }} 
                />
                <Zap 
                  size={10} 
                  style={{ 
                    position: 'absolute', 
                    color: '#E0F2FE', 
                    fill: '#E0F2FE' 
                  }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1C1917', letterSpacing: '0.5px', lineHeight: '1.1' }}>
                  MechWorkshop<span style={{ color: '#0077B6' }}>.</span>
                </span>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#023E8A', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Mechanical 3D
                </span>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div 
              style={{ 
                position: 'relative', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(0, 119, 182, 0.35)'
              }}
            >
              <Settings 
                className="anim-slow-spin-float" 
                size={20} 
                style={{ color: '#FFFFFF', animation: 'slow-spin 15s linear infinite' }} 
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hide-on-mobile"
              style={{
                background: 'rgba(0, 119, 182, 0.08)',
                border: '1px solid rgba(0, 119, 182, 0.2)',
                color: '#023E8A',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Mobile Drawer Close Button */}
            {setMobileMenuOpen && (
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: mobileMenuOpen ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close drawer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <div style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        <div style={{ padding: '0 10px 4px 10px', fontSize: '9px', fontWeight: '800', color: '#8C7A70', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {!collapsed && 'Main Modules'}
        </div>
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
                padding: '11px 14px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#574A40',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                fontWeight: isActive ? '700' : '600',
                boxShadow: isActive ? '0 4px 20px rgba(0, 119, 182, 0.35)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(0, 119, 182, 0.08)';
                  e.currentTarget.style.color = '#023E8A';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#574A40';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <Icon 
                size={17} 
                style={{ 
                  flexShrink: 0, 
                  color: isActive ? '#FFFFFF' : '#8C7A70',
                  transition: 'color 0.2s ease'
                }} 
              />
              {!collapsed && <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Logout Row */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(0, 119, 182, 0.15)' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 14px',
            width: '100%',
            fontWeight: '700',
            borderRadius: '10px',
            background: 'rgba(0, 119, 182, 0.08)',
            border: '1px solid rgba(0, 119, 182, 0.2)',
            color: '#023E8A',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 119, 182, 0.16)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 119, 182, 0.2)';
            e.currentTarget.style.color = '#00509D';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 119, 182, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.color = '#023E8A';
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: '13px' }}>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
