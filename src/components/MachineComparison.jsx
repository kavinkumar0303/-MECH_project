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
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Selection Control Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Machine Comparison Matrix
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Toggle comparisons to inspect dual animated 3D machines side-by-side.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
          {[
            { id: 'lathe_milling', label: 'Lathe vs Milling' },
            { id: 'casting_moulding', label: 'Casting vs Injection' },
            { id: 'shaper_planer', label: 'Shaper vs Planer' }
          ].map((pair) => (
            <button
              key={pair.id}
              onClick={() => setComparisonPair(pair.id)}
              style={{
                background: comparisonPair === pair.id ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
                color: comparisonPair === pair.id ? 'var(--accent-orange)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side 3D display split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Machine Alpha */}
        <div className="glass-panel" style={{ borderTop: `4px solid ${data.m1.color}`, background: 'var(--surface)', padding: '20px' }}>
          <span style={{ fontSize: '9px', color: data.m1.color, fontWeight: '700', fontFamily: 'var(--mono-font)' }}>
            COMPARATIVE BAY A
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 16px' }}>{data.m1.name}</h3>
          
          {/* 3D Viewport container */}
          <div style={{ height: '220px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: '20px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div>
              <div className="telemetry-label">Primary kinematics</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>{data.m1.movement}</div>
            </div>
            <div>
              <div className="telemetry-label">Standard tooling setup</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>{data.m1.tool}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div>
                <div className="telemetry-label">Productivity</div>
                <div style={{ color: 'var(--accent-orange)', fontWeight: '700', fontSize: '12px' }}>{data.m1.productivity}</div>
              </div>
              <div>
                <div className="telemetry-label">Financial footprint</div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '12px' }}>{data.m1.cost}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Beta */}
        <div className="glass-panel" style={{ borderTop: `4px solid ${data.m2.color}`, background: 'var(--surface)', padding: '20px' }}>
          <span style={{ fontSize: '9px', color: data.m2.color, fontWeight: '700', fontFamily: 'var(--mono-font)' }}>
            COMPARATIVE BAY B
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 16px' }}>{data.m2.name}</h3>
          
          {/* 3D Viewport container */}
          <div style={{ height: '220px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: '20px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div>
              <div className="telemetry-label">Primary kinematics</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>{data.m2.movement}</div>
            </div>
            <div>
              <div className="telemetry-label">Standard tooling setup</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>{data.m2.tool}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div>
                <div className="telemetry-label">Productivity</div>
                <div style={{ color: 'var(--accent-orange)', fontWeight: '700', fontSize: '12px' }}>{data.m2.productivity}</div>
              </div>
              <div>
                <div className="telemetry-label">Financial footprint</div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '12px' }}>{data.m2.cost}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
