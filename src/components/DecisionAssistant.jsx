import React, { useState } from 'react';
import { Compass, RefreshCw } from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function DecisionAssistant() {
  const [shape, setShape] = useState('');
  const [material, setMaterial] = useState('');
  const [operation, setOperation] = useState('');
  const [step, setStep] = useState(1);

  const handleReset = () => {
    setShape('');
    setMaterial('');
    setOperation('');
    setStep(1);
  };

  const getRecommendation = () => {
    if (operation === 'welding') {
      return {
        machine: MACHINES.welding,
        explanation: "Since your goal is to join/fuse metal components (such as plates) together using intense localized heat, the Arc Welding Station is the correct choice. It uses a high electrical current to create an arc, melting raw metals and E6013 filler electrodes into a solid joint fillet.",
        tool: "E6013 Rutile Electrode"
      };
    }
    if (operation === 'casting') {
      return {
        machine: MACHINES.casting,
        explanation: "Creating complex hollow cavities, large housings, or engine blocks is best done by melting metal and pouring it. Sand Casting allows you to pour liquid aluminum or brass into a custom sand mold, solidifying into the target casting shape.",
        tool: "Silica Sand Mould Flasks"
      };
    }
    if (operation === 'moulding') {
      return {
        machine: MACHINES.moulding,
        explanation: "For high-volume production of thermoplastic housings, phone cases, or gears, Plastic Injection Moulding is the standard. It feeds ABS pellets through a heated barrel, injecting molten polymer into steel dies under extreme hydraulic pressure.",
        tool: "Dual-Cavity Steel Die"
      };
    }
    if (shape === 'cylindrical') {
      return {
        machine: MACHINES.lathe,
        explanation: "Because your workpiece is cylindrical and symmetrical about an axis of rotation, the Lathe Machine (turning) is recommended. It spins the workpiece rapidly while feeding a single-point HSS cutting tool to shave material down to size.",
        tool: "HSS Single-point Cutting Tool"
      };
    }
    if (operation === 'flat_groove' && shape === 'prismatic_large') {
      return {
        machine: MACHINES.planer,
        explanation: "Your part requires long flat surface machining but is too heavy/long for a shaper. The Planer Machine is recommended because the massive reciprocating table drives the heavy workpiece under a stationary cutting tool.",
        tool: "Heavy Duty HSS Planer Tool"
      };
    }
    if (operation === 'flat_groove' && shape === 'prismatic_small') {
      return {
        machine: MACHINES.shaper,
        explanation: "For small prismatic parts requiring straight flat plane cuts, the Shaper Machine is the most efficient choice. The reciprocating ram drives the cutting tool forward (slow cut, fast return) while the table feeds sideways.",
        tool: "Single-point Shaping Tool"
      };
    }
    return {
      machine: MACHINES.milling,
      explanation: "For flat surfaces, slotting, pockets, keyways, or gear tooth profiles, the Milling Machine is the most versatile. It feeds the workpiece on X-Y coordinates against a rapidly rotating multi-tooth end mill cutter.",
      tool: "Carbide End Mill Cutter"
    };
  };

  const rec = getRecommendation();

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* Title block */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-primary)' }}>
          Machine Decision Assistant
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Answer a few parameters about your project requirements to calculate the appropriate manufacturing machine.
        </p>
      </div>

      <div className="glass-panel" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '32px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontSize: '11px', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', marginBottom: '16px' }}>
              <Compass size={16} /> Step 1: Workpiece Geometry / Shape
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              What is the base shape or geometry of your target component?
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'cylindrical', title: "Cylindrical / Axis Symmetrical", desc: "Shafts, cylinders, cones, pins, threaded bolts" },
                { id: 'prismatic_small', title: "Prismatic / Flat (Small)", desc: "Small flat blocks, keyway slots, gear teeth, pockets" },
                { id: 'prismatic_large', title: "Prismatic / Flat (Large)", desc: "Long guide rails, structural beams, heavy machinery beds" },
                { id: 'hollow_metal', title: "Complex Hollow / Shell Metal", desc: "Engine blocks, pipe couplers, valves, brackets" },
                { id: 'plastic_housing', title: "Thermoplastic Case / Shell", desc: "Plastic housings, enclosures, containers, gear toys" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setShape(opt.id); setStep(2); }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = 'rgba(29, 73, 180, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{opt.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontSize: '11px', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', marginBottom: '16px' }}>
              <Compass size={16} /> Step 2: Workpiece Material
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              What material class will you be manufacturing?
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'steel', title: "Mild Steel / Alloys", desc: "Standard iron carbon alloy, high strength, ductile" },
                { id: 'cast_iron', title: "Cast Iron", desc: "Very brittle, excellent vibration damping capacity" },
                { id: 'aluminum', title: "Aluminum / Non-Ferrous Alloys", desc: "Lightweight, highly machineable, lower melting points" },
                { id: 'plastic', title: "ABS / Thermoplastics", desc: "Polymers that melt upon heating and solidifies upon cooling" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setMaterial(opt.id); setStep(3); }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = 'rgba(29, 73, 180, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{opt.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontSize: '11px', fontFamily: 'var(--mono-font)', textTransform: 'uppercase', marginBottom: '16px' }}>
              <Compass size={16} /> Step 3: Manufacturing Operation
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
              What specific operation is required for this part?
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'welding', title: "Join / Fuse Plates", desc: "Welding metal structural joints permanently together" },
                { id: 'flat_groove', title: "Machining Flat Surface or Channels", desc: "Shaving rails, facing blocks, slotting keyways" },
                { id: 'casting', title: "Metal Casting", desc: "Pouring molten metals into sand cavities" },
                { id: 'moulding', title: "Plastic Injection Moulding", desc: "Injecting polymers into steel dies under pressure" },
                { id: 'turning', title: "Rotary Turning / Threading", desc: "Tapering cylinders, cutting external screw threads" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setOperation(opt.id); setStep(4); }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.background = 'rgba(29, 73, 180, 0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{opt.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontSize: '11px', fontFamily: 'var(--mono-font)', textTransform: 'uppercase' }}>
              <Compass size={16} /> Decision Complete
            </div>
            
            <div style={{ borderLeft: `4px solid ${rec.machine.color}`, background: 'var(--surface)', padding: '20px', borderRadius: '4px', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: rec.machine.color, fontWeight: '700', fontFamily: 'var(--mono-font)' }}>
                Recommended Workshop Unit
              </span>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 12px' }}>
                {rec.machine.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {rec.explanation}
              </p>
            </div>

            {/* recommendation flowchart path */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px', 
                background: 'rgba(194, 202, 217, 0.15)', 
                padding: '16px', 
                borderRadius: '4px',
                border: '1px solid var(--border)',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                Shape: <strong style={{ color: 'var(--accent-orange)' }}>{shape}</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>→</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                Material: <strong style={{ color: 'var(--accent-orange)' }}>{material}</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>→</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono-font)' }}>
                Operation: <strong style={{ color: 'var(--accent-orange)' }}>{operation}</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>→</div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--mono-font)', color: 'var(--success)' }}>
                Tool: <strong>{rec.tool}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={handleReset}
                className="btn-secondary"
                style={{
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                <RefreshCw size={14} /> Start Over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
