import React, { useState } from 'react';
import { 
  Settings, 
  BarChart2, 
  Target, 
  Clock, 
  ArrowRight,
  Play,
  Layers,
  Zap,
  Sparkles,
  ShieldAlert,
  Search,
  CheckCircle2,
  Compass,
  Cpu
} from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function Dashboard({ user, setActiveTab, setSelectedMachineId }) {
  const [searchFilter, setSearchFilter] = useState('');

  // SpaceDrive metrics
  const metrics = [
    { 
      label: 'Machines Available', 
      value: '7 Units', 
      desc: 'Full 3D Kinematics', 
      icon: Settings,
      color: '#1D49B4',
      badge: 'Interactive'
    },
    { 
      label: 'Simulations Completed', 
      value: `${(user?.completedMissions || 0) + 12}+`, 
      desc: 'Verified Workpieces', 
      icon: BarChart2,
      color: '#3D72C1',
      badge: 'Active'
    },
    { 
      label: 'Safety Compliance', 
      value: `${user?.safetyScore || 100}%`, 
      desc: 'OSHA & ISO Standards', 
      icon: ShieldAlert,
      color: '#3B4B6F',
      badge: 'Optimal'
    },
    { 
      label: 'Accuracy Performance', 
      value: `${user?.accuracy || 98}%`, 
      desc: '±0.02 mm Metrology', 
      icon: Target,
      color: '#9EB4E4',
      badge: 'Top Tier'
    }
  ];

  // Grid list of machine cards
  const machineCards = [
    { 
      id: 'lathe', 
      label: 'Centre Lathe Machine', 
      tag: '14 Components • Rotational Cutting', 
      desc: 'Precision turning, facing, chamfering, knurling & taper turning.',
      img: '/lathe.jpg', 
      isMachine: true,
      color: '#1D49B4'
    },
    { 
      id: 'welding', 
      label: 'Arc Welding Station', 
      tag: '9 Components • 1200°C Thermal Arc', 
      desc: 'Butt joints, lap joints, groove welds & electrode deposition.',
      img: '/welding.jpg', 
      isMachine: true,
      color: '#3D72C1'
    },
    { 
      id: 'milling', 
      label: 'Milling Machine', 
      tag: '9 Components • Multi-Axis Rotary', 
      desc: 'Face milling, end milling, slot cutting, profiling & keyseats.',
      img: '/milling.jpg', 
      isMachine: true,
      color: '#9EB4E4'
    },
    { 
      id: 'shaper', 
      label: 'Shaping Machine', 
      tag: '8 Components • Reciprocating Ram', 
      desc: 'Horizontal linear shaping, stepped shoulders, slots & keyways.',
      img: '/shaper.jpg', 
      isMachine: true,
      color: '#3B4B6F'
    },
    { 
      id: 'planer', 
      label: 'Planing Machine', 
      tag: '7 Components • Large Bed Kinematics', 
      desc: 'Heavy casting planing, cross-rail tool feeds & surface finishing.',
      img: '/planer.jpg', 
      isMachine: true,
      color: '#1D49B4'
    },
    { 
      id: 'casting', 
      label: 'Metal Casting Furnace', 
      tag: '8 Components • Molten Foundry 720°C', 
      desc: 'Crucible pouring, cope/drag gating, risers & mold solidification.',
      img: '/casting.jpg', 
      isMachine: true,
      color: '#3D72C1'
    },
    { 
      id: 'moulding', 
      label: 'Sand Moulding Bay', 
      tag: '7 Components • Cavity Preparation', 
      desc: 'Sand ramming, pattern extraction, sprue venting & mold assembly.',
      img: '/moulding.jpg', 
      isMachine: true,
      color: '#9EB4E4'
    },
    { 
      id: 'workshop_map', 
      label: 'Interactive 3D Workplane', 
      tag: 'Full Spatial Layout • Real-Time Nodes', 
      desc: 'Explore the complete factory floor layout with interactive camera controls.',
      img: '/workplane.jpg', 
      isMachine: false,
      color: '#3B4B6F'
    }
  ];

  const handleStart = (card) => {
    if (card.isMachine) {
      setSelectedMachineId(card.id);
      setActiveTab('machine_explorer');
    } else {
      setActiveTab('workshop_map');
    }
  };

  const filteredMachines = machineCards.filter(c => 
    c.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.tag.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '36px', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* 1. Hero Section */}
      <div className="space-hero-container" style={{ background: 'linear-gradient(135deg, #111C33 0%, #16233E 50%, #1D49B4 100%)', border: '1px solid rgba(61, 114, 193, 0.3)' }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
          
          {/* Left Column: Hero Copy & CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'flex-start' }}>
            <div className="space-badge-pink" style={{ background: 'rgba(29, 73, 180, 0.25)', border: '1px solid #1D49B4', color: '#9EB4E4' }}>
              <Sparkles size={13} />
              <span>Next-Gen Virtual Mechanical Workshop</span>
            </div>

            <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.15', letterSpacing: '-0.5px' }}>
              Powerful 3D Mechanical <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #9EB4E4 0%, #3D72C1 50%, #FFFFFF 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                Simulation System
              </span>
            </h1>

            <p style={{ color: '#C2CAD9', fontSize: '15px', lineHeight: '1.6', maxWidth: '540px', fontWeight: '400' }}>
              Engineering students and instructors rely on our real-time interactive 3D engine to master CNC machining, cutting tools, thermal kinematics, and metrology assessments.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
              <button 
                className="space-btn-primary"
                onClick={() => {
                  setSelectedMachineId('lathe');
                  setActiveTab('machine_explorer');
                }}
              >
                <Play size={16} fill="#FFF" />
                START 3D SIMULATION
              </button>

              <button 
                className="space-btn-secondary"
                onClick={() => setActiveTab('workshop_map')}
              >
                <Compass size={16} />
                EXPLORE WORKPLANE
              </button>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9EB4E4', fontSize: '12px', fontWeight: '700' }}>
                <CheckCircle2 size={15} color="#3D72C1" /> 7 Interactive Machines
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9EB4E4', fontSize: '12px', fontWeight: '700' }}>
                <CheckCircle2 size={15} color="#3D72C1" /> OSHA Safety Engine
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9EB4E4', fontSize: '12px', fontWeight: '700' }}>
                <CheckCircle2 size={15} color="#3D72C1" /> ISO Metrology Calipers
              </div>
            </div>
          </div>

          {/* Right Column: Isometric 3D Mechanical Grid SVG */}
          <div className="space-isometric-wrapper">
            <svg 
              className="animate-isometric"
              viewBox="0 0 500 400" 
              style={{ width: '100%', height: '100%', maxWidth: '440px', filter: 'drop-shadow(0 20px 40px rgba(29, 73, 180, 0.45))' }}
            >
              <defs>
                <linearGradient id="isoRoofBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9EB4E4" />
                  <stop offset="100%" stopColor="#3D72C1" />
                </linearGradient>
                <linearGradient id="isoWallBlue1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3D72C1" />
                  <stop offset="100%" stopColor="#1D49B4" />
                </linearGradient>
                <linearGradient id="isoWallBlue2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1D49B4" />
                  <stop offset="100%" stopColor="#111C33" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Base Pedestal Isometric Grid */}
              <path d="M250,330 L430,230 L250,130 L70,230 Z" fill="rgba(17, 28, 51, 0.7)" stroke="rgba(61, 114, 193, 0.4)" strokeWidth="2" />
              <path d="M250,350 L430,250 L430,230 L250,330 L70,230 L70,250 Z" fill="rgba(13, 21, 39, 0.85)" stroke="rgba(61, 114, 193, 0.3)" strokeWidth="1.5" />
              
              {/* Pedestal Guide Rails */}
              <line x1="120" y1="260" x2="380" y2="260" stroke="#9EB4E4" strokeWidth="3" filter="url(#glow)" strokeDasharray="8 4" />
              <line x1="70" y1="230" x2="250" y2="330" stroke="#1D49B4" strokeWidth="2" filter="url(#glow)" />
              <line x1="430" y1="230" x2="250" y2="330" stroke="#3D72C1" strokeWidth="2" filter="url(#glow)" />

              {/* Central Main Building Block (Tall) */}
              <path d="M250,90 L250,230 L180,270 L180,130 Z" fill="url(#isoWallBlue1)" />
              <path d="M250,90 L320,130 L320,270 L250,230 Z" fill="url(#isoWallBlue2)" />
              <path d="M250,50 L320,90 L250,130 L180,90 Z" fill="url(#isoRoofBlue)" />
              
              {/* Left Wing (Lower Block) */}
              <path d="M180,150 L180,250 L120,285 L120,185 Z" fill="url(#isoWallBlue1)" />
              <path d="M120,185 L180,150 L250,190 L190,225 Z" fill="url(#isoRoofBlue)" />

              {/* Right Wing (Lower Block) */}
              <path d="M320,150 L380,185 L380,285 L320,250 Z" fill="url(#isoWallBlue2)" />
              <path d="M320,150 L380,185 L310,225 L250,190 Z" fill="url(#isoRoofBlue)" />

              {/* LED Strips */}
              <rect x="200" y="145" width="35" height="6" transform="skewY(30)" fill="#9EB4E4" filter="url(#glow)" />
              <rect x="200" y="170" width="35" height="6" transform="skewY(30)" fill="#9EB4E4" filter="url(#glow)" />
              <rect x="200" y="195" width="35" height="6" transform="skewY(30)" fill="#9EB4E4" filter="url(#glow)" />
              <rect x="200" y="220" width="35" height="6" transform="skewY(30)" fill="#9EB4E4" filter="url(#glow)" />

              <rect x="265" y="145" width="35" height="6" transform="skewY(-30)" fill="#9EB4E4" filter="url(#glow)" />
              <rect x="265" y="170" width="35" height="6" transform="skewY(-30)" fill="#9EB4E4" filter="url(#glow)" />
              <rect x="265" y="195" width="35" height="6" transform="skewY(-30)" fill="#9EB4E4" filter="url(#glow)" />
              <rect x="265" y="220" width="35" height="6" transform="skewY(-30)" fill="#9EB4E4" filter="url(#glow)" />

              {/* Center Beam */}
              <line x1="250" y1="90" x2="250" y2="230" stroke="#FFFFFF" strokeWidth="3" filter="url(#glow)" />
              
              {/* Particle Nodes */}
              <circle cx="90" cy="120" r="3.5" fill="#9EB4E4" filter="url(#glow)" />
              <circle cx="390" cy="80" r="4" fill="#3D72C1" filter="url(#glow)" />
              <circle cx="280" cy="30" r="3" fill="#1D49B4" filter="url(#glow)" />
              <circle cx="160" cy="310" r="3.5" fill="#9EB4E4" filter="url(#glow)" />
              <circle cx="340" cy="320" r="4" fill="#3D72C1" filter="url(#glow)" />
            </svg>
          </div>

        </div>
      </div>

      {/* 2. Machine Bay Search Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#000000', letterSpacing: '-0.3px', margin: 0 }}>
          Search Your Machine Bay
        </h2>
        <p style={{ color: '#3B4B6F', fontSize: '13px', margin: 0 }}>
          Instantly filter machines, tooling packages, kinematics and simulation bays
        </p>

        <div style={{ width: '100%', maxWidth: '640px' }}>
          <div className="space-search-capsule" style={{ background: '#FFFFFF', border: '1px solid rgba(61, 114, 193, 0.25)' }}>
            <Search size={18} style={{ color: '#1D49B4', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Search Lathe, Welding, Milling, Shaper, Planer..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <span className="space-search-tag">.mech</span>
            <button 
              className="space-search-btn"
              onClick={() => {
                if (filteredMachines.length > 0) handleStart(filteredMachines[0]);
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* 3. Telemetry Stats Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
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
                background: '#FFFFFF',
                border: '1px solid rgba(61, 114, 193, 0.2)',
                borderRadius: '16px',
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                boxShadow: '0 4px 20px rgba(61, 114, 193, 0.08)'
              }}
            >
              {/* Icon Container */}
              <div 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(29, 73, 180, 0.08)',
                  border: '1px solid rgba(29, 73, 180, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <IconComponent size={24} style={{ color: m.color }} />
              </div>
              
              {/* Values */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#000000', lineHeight: '1.2', fontFamily: 'var(--mono-font)' }}>
                    {m.value}
                  </div>
                  <span style={{ fontSize: '10px', color: '#1D49B4', fontWeight: '700', textTransform: 'uppercase', background: 'rgba(29, 73, 180, 0.08)', padding: '2px 8px', borderRadius: '10px' }}>
                    {m.badge}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1D49B4', marginTop: '2px' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '11px', color: '#3B4B6F', marginTop: '1px' }}>
                  {m.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(61, 114, 193, 0.2)', paddingBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', marginBottom: '4px' }}>
            Machine Simulation Bays ({filteredMachines.length})
          </h3>
          <p style={{ color: '#3B4B6F', fontSize: '13px', margin: 0 }}>
            Select any mechanical simulation unit to launch full interactive 3D workplane
          </p>
        </div>

        <button 
          className="space-btn-secondary"
          onClick={() => setActiveTab('workshop_map')}
          style={{ padding: '8px 18px', fontSize: '12px' }}
        >
          View Full Workplane Map →
        </button>
      </div>

      {/* 5. Machine Cards Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          width: '100%'
        }}
      >
        {filteredMachines.map((card) => (
          <div 
            key={card.id}
            className="glass-panel"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(61, 114, 193, 0.2)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              boxShadow: '0 8px 24px rgba(61, 114, 193, 0.08)',
              transition: 'all 0.25s ease'
            }}
          >
            {/* Card Thumbnail Image */}
            <div 
              style={{
                height: '160px',
                width: '100%',
                backgroundImage: `url(${card.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderBottom: '1px solid rgba(61, 114, 193, 0.15)'
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(17, 28, 51, 0.1) 0%, rgba(17, 28, 51, 0.8) 100%)'
                }}
              />
              
              {/* Category Tag Badge */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 3 }}>
                <span 
                  style={{
                    background: 'rgba(17, 28, 51, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(61, 114, 193, 0.4)',
                    color: '#9EB4E4',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Cpu size={11} /> {card.isMachine ? '3D Kinematics' : 'Workshop Map'}
                </span>
              </div>
            </div>

            {/* Card Content & Action Button */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#000000', marginBottom: '6px' }}>
                  {card.label}
                </h4>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#1D49B4', marginBottom: '8px' }}>
                  {card.tag}
                </div>
                <p style={{ fontSize: '12px', color: '#3B4B6F', lineHeight: '1.4', margin: 0 }}>
                  {card.desc}
                </p>
              </div>
              
              {/* Start Simulation Pill Button */}
              <button 
                onClick={() => handleStart(card)}
                className="space-btn-primary"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '25px',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{card.isMachine ? 'Launch Simulator' : 'Open Workplane'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
