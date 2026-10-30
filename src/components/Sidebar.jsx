import React from 'react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gauge,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  Wrench,
  Zap
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'workshop_map', label: 'Workshop map', icon: Compass },
  { id: 'lathe', label: 'Centre lathe', icon: Settings, isMachine: true },
  { id: 'welding', label: 'Arc welding', icon: Zap, isMachine: true },
  { id: 'milling', label: 'Milling machine', icon: Wrench, isMachine: true },
  { id: 'shaper', label: 'Shaping machine', icon: Gauge, isMachine: true },
  { id: 'planer', label: 'Planing machine', icon: Settings, isMachine: true },
  { id: 'casting', label: 'Metal casting', icon: Sparkles, isMachine: true },
  { id: 'moulding', label: 'Sand moulding', icon: Wrench, isMachine: true },
  { id: 'progress', label: 'My progress', icon: Award },
  { id: 'profile', label: 'My profile', icon: UserRound }
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedMachineId,
  setSelectedMachineId,
  user,
  onLogout
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  const handleItemClick = (item) => {
    if (item.isMachine) {
      setSelectedMachineId(item.id);
      setActiveTab('machine_explorer');
    } else {
      setActiveTab(item.id);
    }
  };

  const isActive = (item) => item.isMachine
    ? activeTab === 'machine_explorer' && selectedMachineId === item.id
    : activeTab === item.id;

  return (
    <aside className={`app-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <button className="brand-lockup" onClick={() => setActiveTab('dashboard')} aria-label="Go to overview">
          <span className="brand-mark"><Settings size={19} /><span /></span>
          {!collapsed && <span className="brand-name">MECH<span>DRIVE</span><small>VIRTUAL WORKSHOP</small></span>}
        </button>
        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="sidebar-section-label">{!collapsed && 'WORKSPACE'}</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);
          const showDivider = index === 2 || index === 9;
          return (
            <React.Fragment key={item.id}>
              {showDivider && !collapsed && <div className="sidebar-nav-divider" />}
              <button
                className={`sidebar-link${active ? ' is-active' : ''}${item.isMachine ? ' machine-link' : ''}`}
                onClick={() => handleItemClick(item)}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {!collapsed && <span>{item.label}</span>}
                {active && <span className="sidebar-active-mark" />}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <span className="profile-avatar">{(user?.name?.trim()?.[0] || user?.studentId?.[0] || 'S').toUpperCase()}</span>
          {!collapsed && <span className="profile-copy"><strong>{user?.name || 'Student'}</strong><small>Student workspace</small></span>}
        </div>
        <button className="sidebar-signout" onClick={onLogout} title={collapsed ? 'Sign out' : undefined}>
          <LogOut size={17} /> {!collapsed && <span>Sign out</span>}
        </button>
        {!collapsed && <div className="sidebar-safety"><Shield size={14} /> Safe practice. Real skills.</div>}
      </div>
    </aside>
  );
}
