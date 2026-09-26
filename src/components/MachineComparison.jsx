import React, { useState } from 'react';
import ThreeVisualizer from './ThreeVisualizer';

export default function MachineComparison() {
  const [comparisonPair, setComparisonPair] = useState('lathe_milling');
  const [activePartId, setActivePartId] = useState(null);

  const getComparisonData = () => {
    switch (comparisonPair) {
      case 'casting_moulding':
        return {
          title: "Sand Casting vs Injection Moulding",
          m1: {
            id: "casting",
            name: "Sand Casting",
            color: "#D9E8E5",
            purpose: "Metal shaping by gravity pouring",
            movement: "Liquid metal flows freely under gravity into sand cavity",
            tool: "Manual pouring ladle, green sand flasks",
            output: "Heavy engine cylinder blocks, iron housings",
            productivity: "Low speed (requires custom cooling & shakeout time)",
            cost: "Low tooling cost, high manual cleaning labor"
          },
          m2: {
            id: "moulding",
            name: "Injection Moulding",
            color: "#003532",
            purpose: "High-volume polymer shape molding",
            movement: "Thermoplastic pellets are screw-fed, melted, and injected mechanically",
            tool: "Reciprocating cylinder screw inside heated barrel",
            output: "Plastic smartphone shells, syringes, caps, toy gears",
            productivity: "Extremely High (mould cycle takes 5-30 seconds)",
            cost: "Extremely high tooling cost (hardened steel die), low per-part cost"
          }
        };
      case 'shaper_planer':
        return {
          title: "Shaper vs Planer Machine",
          m1: {
            id: "shaper",
            name: "Shaper Machine",
            color: "#0A625D",
            purpose: "Machining flat planes on small workpieces",
            movement: "Workpiece feeds crosswise slowly, tool reciprocates",
            tool: "Single-point HSS tool clamped in reciprocating ram",
            output: "Horizontal/vertical slot planes, small keyway grooves",
            productivity: "Medium (cuts only on forward stroke, quick idle return)",
            cost: "Low machine capital, small shop workspace footprint"
          },
          m2: {
            id: "planer",
            name: "Planer Machine",
            color: "#003532",
            purpose: "Machining flat paths on massive/long workpieces",
            movement: "Workpiece reciprocates on massive bed table, tool feeds crosswise",
            tool: "Heavy tool heads locked stationary on horizontal cross rail",
            output: "Massive lathe bed guide rails, long industrial columns",
            productivity: "High load (can run multiple tools cutting simultaneously)",
            cost: "High machine installation capital, requires large floor space"
          }
        };
      case 'lathe_milling':
      default:
        return {
          title: "Lathe vs Milling Machine",
          m1: {
            id: "lathe",
            name: "Lathe Machine (Turning)",
            color: "#004643",
            purpose: "Generating cylindrical/conical shapes",
            movement: "Workpiece rotates rapidly, cutting tool feeds linearly",
            tool: "Single-point HSS/Carbide tip held in tool post",
            output: "Symmetrical shafts, custom bolts, tapered cylinders",
            productivity: "Very High for round shafts and threading operations",
            cost: "Standard basic machine in every engineering shop"
          },
          m2: {
            id: "milling",
            name: "Milling Machine",
            color: "#D9E8E5",
            purpose: "Generating flat surfaces, keyways, pockets, gears",
            movement: "Workpiece feeds linearly in X-Y-Z, cutting tool rotates",
            tool: "Multi-point rotating End Mill or Face Mill cutter",
            output: "Flat plates, slots, pockets, complex engine casings",
            productivity: "Highly versatile for complex shapes and vertical slots",
            cost: "High cost, complex indexing attachments and CNC units"
          }
        };
    }
  };

  const data = getComparisonData();

  return (
    <div className="comparison-page-container">
      
      {/* Selection Control Row */}
      <div className="comparison-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#1C1917' }}>
            Machine Comparison Matrix
          </h2>
          <p style={{ color: '#574A40', fontSize: '13px', marginTop: '4px' }}>
            Toggle comparisons to inspect dual animated 3D machines side-by-side.
          </p>
        </div>

        <div className="comparison-toggle-row" style={{ display: 'flex', gap: '8px', background: 'rgba(255, 253, 251, 0.95)', padding: '6px', borderRadius: '30px', border: '1px solid #BAE6FD', boxShadow: '0 2px 8px rgba(0, 119, 182, 0.08)', flexWrap: 'wrap' }}>
          {[
            { id: 'lathe_milling', label: 'Lathe vs Milling' },
            { id: 'casting_moulding', label: 'Casting vs Injection' },
            { id: 'shaper_planer', label: 'Shaper vs Planer' }
          ].map((pair) => {
            const isActive = comparisonPair === pair.id;
            return (
              <button
                key={pair.id}
                onClick={() => setComparisonPair(pair.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #0077B6 0%, #00509D 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#574A40',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 2px 10px rgba(0, 119, 182, 0.35)' : 'none'
                }}
              >
                {pair.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side by side 3D display split */}
      <div className="comparison-grid">
        
        {/* Machine Alpha */}
        <div className="glass-panel" style={{ borderTop: `4px solid #0077B6`, background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #BAE6FD', borderTopWidth: '4px', boxShadow: '0 8px 30px rgba(0, 119, 182, 0.08)' }}>
          <span className="space-badge-pink" style={{ fontSize: '10px' }}>
            COMPARATIVE BAY A
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1C1917', margin: '10px 0 16px' }}>{data.m1.name}</h3>
          
          {/* 3D Viewport container */}
          <div style={{ height: '240px', background: '#FFF5ED', borderRadius: '12px', border: '1px solid #BAE6FD', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
            <ThreeVisualizer
              machineId={data.m1.id}
              selectedPartId={activePartId}
              onPartSelect={setActivePartId}
              isPlaying={true}
              cameraMode="default"
              setCameraMode={() => {}}
            />
          </div>

          {/* Details specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <div className="telemetry-label" style={{ color: '#023E8A' }}>Primary kinematics</div>
              <div style={{ color: '#1C1917', fontWeight: '600', marginTop: '4px' }}>{data.m1.movement}</div>
            </div>
            <div>
              <div className="telemetry-label" style={{ color: '#023E8A' }}>Standard tooling setup</div>
              <div style={{ color: '#1C1917', fontWeight: '600', marginTop: '4px' }}>{data.m1.tool}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #BAE6FD', paddingTop: '14px' }}>
              <div>
                <div className="telemetry-label" style={{ color: '#023E8A' }}>Productivity</div>
                <div style={{ color: '#00509D', fontWeight: '800', fontSize: '13px', marginTop: '2px' }}>{data.m1.productivity}</div>
              </div>
              <div>
                <div className="telemetry-label" style={{ color: '#023E8A' }}>Financial footprint</div>
                <div style={{ color: '#574A40', fontWeight: '700', fontSize: '13px', marginTop: '2px' }}>{data.m1.cost}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Beta */}
        <div className="glass-panel" style={{ borderTop: `4px solid #00509D`, background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #BAE6FD', borderTopWidth: '4px', boxShadow: '0 8px 30px rgba(0, 119, 182, 0.08)' }}>
          <span className="space-badge-cyan" style={{ fontSize: '10px' }}>
            COMPARATIVE BAY B
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1C1917', margin: '10px 0 16px' }}>{data.m2.name}</h3>
          
          {/* 3D Viewport container */}
          <div style={{ height: '240px', background: '#FFF5ED', borderRadius: '12px', border: '1px solid #BAE6FD', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
            <ThreeVisualizer
              machineId={data.m2.id}
              selectedPartId={activePartId}
              onPartSelect={setActivePartId}
              isPlaying={true}
              cameraMode="default"
              setCameraMode={() => {}}
            />
          </div>

          {/* Details specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <div className="telemetry-label" style={{ color: '#023E8A' }}>Primary kinematics</div>
              <div style={{ color: '#1C1917', fontWeight: '600', marginTop: '4px' }}>{data.m2.movement}</div>
            </div>
            <div>
              <div className="telemetry-label" style={{ color: '#023E8A' }}>Standard tooling setup</div>
              <div style={{ color: '#1C1917', fontWeight: '600', marginTop: '4px' }}>{data.m2.tool}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #BAE6FD', paddingTop: '14px' }}>
              <div>
                <div className="telemetry-label" style={{ color: '#023E8A' }}>Productivity</div>
                <div style={{ color: '#00509D', fontWeight: '800', fontSize: '13px', marginTop: '2px' }}>{data.m2.productivity}</div>
              </div>
              <div>
                <div className="telemetry-label" style={{ color: '#023E8A' }}>Financial footprint</div>
                <div style={{ color: '#574A40', fontWeight: '700', fontSize: '13px', marginTop: '2px' }}>{data.m2.cost}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
