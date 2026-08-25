import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Settings, 
  BookOpen, 
  Compass, 
  TrendingUp, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workshop_map', label: 'Virtual Workshop', icon: Map },
    { id: 'machine_explorer', label: 'Machines Cockpit', icon: Settings },
    { id: 'decision_assistant', label: 'Decision Assistant', icon: Compass },
    { id: 'comparison', label: 'Compare Machines', icon: BookOpen },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div 
      style={{
        width: collapsed ? '70px' : '250px',
        background: 'var(--bg-secondary)', // Charcoal Steel
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
      {/* Brand Header */}
      <div 
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        {!collapsed && (
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary-blue)', margin: 0 }}>
              Virtual Workshop
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--mono-font)' }}>
              Core telemetry: Active
            </span>
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

      {/* Student Badge Card */}
      {!collapsed && (
        <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px 12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '16px', background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#FFFFFF' }}>
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                {user?.name || 'Student'}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--primary-blue)', fontFamily: 'var(--mono-font)' }}>
                {user?.level || 'Apprentice'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menus */}
      <div style={{ flex: 1, padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '4px',
                border: 'none',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s',
                fontWeight: isActive ? '700' : '500',
                borderLeft: isActive ? '3px solid var(--primary-blue)' : '3px solid transparent'
              }}
            >
              <Icon size={16} style={{ flexShrink: 0, color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)' }} />
              {!collapsed && <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Logout Row */}
      <div style={{ padding: '12px 6px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          className="btn-danger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            width: '100%',
            fontWeight: '600'
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: '13px' }}>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
