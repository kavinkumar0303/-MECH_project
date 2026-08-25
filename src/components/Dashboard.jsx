import React from 'react';
import { 
  Settings, 
  BarChart2, 
  Target, 
  Clock, 
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ user, setActiveTab, setSelectedMachineId }) {
  
  // Custom metrics cards mapping
  const metrics = [
    { 
      label: 'Machines', 
      value: '7', 
      desc: 'Machines Available', 
      icon: Settings,
      color: '#1D49B4'
    },
    { 
      label: 'Simulations Completed', 
      value: '24+', 
      desc: 'Completed Tasks', 
      icon: BarChart2,
      color: '#3D72C1'
    },
    { 
      label: 'Accuracy Performance', 
      value: `${user?.accuracy || 98}%`, 
      desc: 'Performance Score', 
      icon: Target,
      color: '#4D72C1'
    },
    { 
      label: 'Time Spent This Week', 
      value: '12h', 
      desc: 'Total Activity', 
      icon: Clock,
      color: '#9EB4E4'
    }
  ];

  // Grid list of machine cards matching the image
  const machineCards = [
    { id: 'lathe', label: 'Lathe Machine', img: '/lathe.jpg', isMachine: true },
    { id: 'welding', label: 'Welding', img: '/welding.jpg', isMachine: true },
    { id: 'shaper', label: 'Shaper', img: '/shaper.jpg', isMachine: true },
    { id: 'planer', label: 'Planer', img: '/planer.jpg', isMachine: true },
    { id: 'milling', label: 'Milling', img: '/milling.jpg', isMachine: true },
    { id: 'casting', label: 'Casting', img: '/casting.jpg', isMachine: true },
    { id: 'moulding', label: 'Moulding', img: '/moulding.jpg', isMachine: true },
    { id: 'workshop_map', label: 'Workplane', img: '/workplane.jpg', isMachine: false }
  ];

  const handleStart = (card) => {
    if (card.isMachine) {
      setSelectedMachineId(card.id);
      setActiveTab('machine_explorer');
    } else {
      setActiveTab('workshop_map');
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* 1. Header Welcome Text */}
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', marginBottom: '6px', letterSpacing: '-0.3px' }}>
          Welcome Back, {user?.name || 'Kavin Kumar'}!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
          Continue your mechanical learning journey
        </p>
      </div>

      {/* 2. Metrics Telemetry Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px',
          width: '100%'
        }}
      >
        {metrics.map((m, idx) => {
          const IconComponent = m.icon;
          return (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                background: 'rgba(22, 38, 79, 0.25)',
                border: '1px solid rgba(61, 114, 193, 0.2)',
                borderRadius: '8px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              {/* Icon Container */}
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(29, 73, 180, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <IconComponent size={20} style={{ color: 'var(--brand-secondary)' }} />
              </div>
              
              {/* Values */}
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.2', fontFamily: 'var(--mono-font)' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {m.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Section Title */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', marginBottom: '6px' }}>
          Select a Machine
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          Choose a machine to start simulation
        </p>
      </div>

      {/* 4. Grid of Machine Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '24px',
          width: '100%'
        }}
      >
        {machineCards.map((card) => (
          <div 
            key={card.id}
            className="glass-panel"
            style={{
              background: 'rgba(11, 23, 51, 0.65)',
              border: '1px solid rgba(61, 114, 193, 0.25)',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--brand-secondary)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(29, 73, 180, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(61, 114, 193, 0.25)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Card Thumbnail Image */}
            <div 
              style={{
                height: '140px',
                width: '100%',
                backgroundImage: `url(${card.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderBottom: '1px solid rgba(61, 114, 193, 0.25)'
              }}
            />

            {/* Card Footer Content */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>
                {card.label}
              </div>
              
              {/* Start Button */}
              <button 
                onClick={() => handleStart(card)}
                className="btn-login"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                Start <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
