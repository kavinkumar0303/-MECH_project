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
  Layers
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
        width: collapsed ? '72px' : '260px',
        background: 'rgba(18, 5, 46, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(168, 85, 247, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: '4px 0 30px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Brand Header & Gear + Lightning Logo */}
      <div 
        style={{
          padding: '22px 18px',
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
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
                  background: 'linear-gradient(135deg, #FF5376 0%, #7928CA 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 18px rgba(255, 83, 118, 0.5)'
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
                    color: '#00F5D4', 
                    fill: '#00F5D4' 
                  }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px', lineHeight: '1.1' }}>
                  SpaceDrive<span style={{ color: '#FF5376' }}>.</span>
                </span>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#D8B4FE', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
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
                background: 'linear-gradient(135deg, #FF5376 0%, #7928CA 100%)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(255, 83, 118, 0.5)'
              }}
            >
              <Settings 
                className="anim-slow-spin-float" 
                size={20} 
                style={{ color: '#FFFFFF', animation: 'slow-spin 15s linear infinite' }} 
              />
            </div>
          )}

          <button 
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              color: '#D8B4FE',
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
        </div>
      </div>

      {/* Navigation Menus */}
      <div style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        <div style={{ padding: '0 10px 4px 10px', fontSize: '9px', fontWeight: '800', color: '#9480B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
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
                background: isActive ? 'linear-gradient(135deg, #FF5376 0%, #7928CA 100%)' : 'transparent',
                color: isActive ? '#FFFFFF' : '#D8B4FE',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                fontWeight: isActive ? '700' : '600',
                boxShadow: isActive ? '0 4px 20px rgba(255, 83, 118, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(121, 40, 202, 0.25)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#D8B4FE';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <Icon 
                size={17} 
                style={{ 
                  flexShrink: 0, 
                  color: isActive ? '#FFFFFF' : '#D8B4FE',
                  transition: 'color 0.2s ease'
                }} 
              />
              {!collapsed && <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Logout Row */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(168, 85, 247, 0.2)' }}>
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
            background: 'rgba(255, 0, 85, 0.12)',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            color: '#FF758C',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.25)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 85, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 0, 85, 0.12)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: '13px' }}>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
