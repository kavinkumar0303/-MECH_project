import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BookOpen,
  Box,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Expand,
  Eye,
  Gauge,
  HelpCircle,
  Layers3,
  Maximize2,
  Link2,
  Zap,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Settings2,
  ShieldCheck,
  Square,
  Wrench,
  X
} from 'lucide-react';
import { MACHINES } from '../data/machines';
import ThreeVisualizer from './ThreeVisualizer';

const NAV_ITEMS = [
  { id: 'explorer', label: '3D View', icon: Box },
  { id: 'identify', label: 'Parts Identification', icon: Layers3 },
  { id: 'operate', label: 'Operation Simulator', icon: Activity },
  { id: 'setup', label: 'Cutting Tools', icon: Wrench },
  { id: 'safety', label: 'Maintenance', icon: Settings2 },
  { id: 'experiments', label: 'Theory & PDF', icon: BookOpen },
  { id: 'scorecard', label: 'Quiz', icon: HelpCircle }
];

const TURNING_STEPS = [
  'Mount Workpiece in Chuck',
  'Select Cutting Tool',
  'Set Parameters',
  'Start Spindle',
  'Engage Feed',
  'Perform Turning',
  'Stop & Measure'
];

export default function LatheImmersiveCockpit({
  user,
  activeSubTab,
  setActiveSubTab,
  activeOperation,
  handleSelectOperation,
  handleStartOperationSim,
  handlePauseResumeOperation,
  handleAbortOperation,
  handleResetOperation,
  machineOperations,
  operationProgress,
  operationState,
  operationHistory,
  isOpRunning,
  simParams,
  setSimParams,
  selectedTool,
  setSelectedTool,
  selectedPartId,
  handlePartSelect,
  activePart,
  isExploded,
  setIsExploded,
  isCutaway,
  setIsCutaway,
  cameraMode,
  setCameraMode,
  showLabels,
  highContrast,
  onUpdateUser,
  toolPosition,
  setToolPosition,
  beforeAfterMode,
  toggleBeforeAfter,
  isPowerOn,
  safetyItems,
  handleSafetyToggle,
  setupChecklist,
  toggleSetupChecklist,
  safetyPassed,
  safetyFeedback,
  validationAlert,
  setValidationAlert,
  inspectFeedback,
  operationResult,
  setOperationResult
}) {
  const machine = MACHINES.lathe;
  const shellRef = useRef(null);
  const [material, setMaterial] = useState('Mild Steel');
  const [showReference, setShowReference] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const currentOperation = activeOperation || machineOperations[0];
  const currentStep = useMemo(() => {
    if (operationState === 'COMPLETED' || operationProgress >= 96) return 6;
    if (operationState === 'RUNNING') return Math.min(5, Math.floor(operationProgress / 18));
    if (operationState === 'SETUP') return 2;
    return 0;
  }, [operationProgress, operationState]);

  const spindleRpm = isPowerOn && operationState === 'RUNNING' ? Math.round(simParams.speed || 0) : 0;
  const feedValue = Number(simParams.feed || 0).toFixed(2);
  const docValue = Number(simParams.doc || 0).toFixed(1);
  const carriagePosition = (42.5 + operationProgress * 0.78).toFixed(1);
  const spindleSpeed = Math.max(0, spindleRpm);
  const workpieceDiameter = 68;
  const surfaceSpeed = ((Math.PI * workpieceDiameter * spindleSpeed) / 1000).toFixed(1);
  const feedMmMin = (Number(simParams.feed || 0) * spindleSpeed).toFixed(1);
  const loadPercent = Math.min(96, Math.round(operationState === 'RUNNING' ? 22 + Number(simParams.doc || 0) * 15 + Number(simParams.feed || 0) * 65 : 0));
  const powerKw = ((loadPercent / 100) * Math.max(spindleSpeed, 1) * 0.0048).toFixed(2);
  const cutDepth = Number(simParams.doc || 0);
  const chipRate = Math.max(0, Number(simParams.feed || 0) * cutDepth * Math.max(spindleSpeed, 1));
  const activeCutting = operationState === 'RUNNING' && isPowerOn;
  const machinePhase = operationState === 'COMPLETED' ? 'FINISH INSPECTION' : activeCutting ? 'MACHINING / CUTTING' : operationState === 'SETUP' ? 'SETUP & SAFETY CHECK' : 'STANDBY';

  useEffect(() => {
    if (!activeOperation && machineOperations[0]) {
      handleSelectOperation(machineOperations[0]);
    }
  }, [activeOperation, machineOperations, handleSelectOperation]);

  // Keyboard controls for the training lathe. Manual axes are disabled while a machining cycle is running.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
      if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const step = event.shiftKey ? 0.10 : 0.025;
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'x', 'r', '+', '=', '-', '_'].includes(key)) event.preventDefault();
      if (key === ' ') {
        if (operationState === 'RUNNING') handlePauseResumeOperation();
        else operationStart();
      } else if (key === 'x') {
        handleAbortOperation();
      } else if (key === 'r') {
        handleResetOperation();
      } else if (key === '+' || key === '=') {
        setSimParams(prev => ({ ...prev, speed: Math.min(2000, Number(prev.speed || 0) + 50) }));
      } else if (key === '-' || key === '_') {
        setSimParams(prev => ({ ...prev, speed: Math.max(0, Number(prev.speed || 0) - 50) }));
      } else if (operationState !== 'RUNNING' && setToolPosition) {
        setToolPosition(prev => {
          const p = prev || { x: 0, y: 0, z: 0 };
          if (key === 'arrowleft') return { ...p, x: Math.max(-0.65, p.x - step) };
          if (key === 'arrowright') return { ...p, x: Math.min(0.95, p.x + step) };
          if (key === 'arrowup') return { ...p, z: Math.max(-0.25, p.z - step) };
          if (key === 'arrowdown') return { ...p, z: Math.min(0.25, p.z + step) };
          return p;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [operationState, handlePauseResumeOperation, handleAbortOperation, handleResetOperation, handleStartOperationSim, handleSelectOperation, currentOperation, setSimParams, setToolPosition]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await shellRef.current?.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      setFullscreen(false);
    }
  };

  const operationStart = () => {
    if (!currentOperation) return;
    if (activeOperation?.id !== currentOperation.id) handleSelectOperation(currentOperation);
    handleStartOperationSim();
  };

  const progressBar = (
    <div className="lathe-progress">
      <div className="lathe-progress-fill" style={{ width: `${operationProgress}%` }} />
    </div>
  );

  return (
    <div ref={shellRef} className="lathe-immersive-shell">
      <header className="lathe-topbar">
        <div className="lathe-brand">
          <div className="lathe-brand-mark"><Settings2 size={20} /></div>
          <span>VIRTUAL MECHANICAL WORKSHOP</span>
        </div>
        <nav className="lathe-topnav">
          <button>Home</button>
          <button className="active">Machines</button>
          <button onClick={() => setActiveSubTab('operate')}>Simulations</button>
          <button onClick={() => setActiveSubTab('experiments')}>Theory</button>
          <button onClick={() => setActiveSubTab('safety')}>Safety</button>
          <button onClick={() => setActiveSubTab('scorecard')}>Quiz</button>
          <button>Resources</button>
        </nav>
        <div className="lathe-top-actions">
          <button className="lathe-icon-btn" onClick={toggleFullscreen} title="Fullscreen">
            {fullscreen ? <X size={18} /> : <Maximize2 size={18} />}
          </button>
          <span className="lathe-fullscreen-label">{fullscreen ? 'Exit' : 'Fullscreen'}</span>
          <button className="lathe-icon-btn" title="Settings"><Settings2 size={18} /></button>
        </div>
      </header>

      <div className="lathe-workspace">
        <aside className="lathe-left-rail">
          <div className="lathe-left-title">Lathe Machine (WM290)</div>
          <div className="lathe-left-nav">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeSubTab === id;
              return (
                <button key={id} className={`lathe-left-nav-item ${active ? 'active' : ''}`} onClick={() => setActiveSubTab(id)}>
                  <Icon size={18} />
                  <span>{label}</span>
                  {active && <span className="lathe-nav-arrow">›</span>}
                </button>
              );
            })}
          </div>
          <div className="lathe-left-footer">
            <div className="lathe-machine-status">
              <span className={`status-dot ${isPowerOn ? 'on' : ''}`} />
              <span>{isPowerOn ? 'SYSTEM ACTIVE' : 'SYSTEM STANDBY'}</span>
            </div>
            <div className="lathe-key-hints">SPACE&nbsp; RUN/PAUSE &nbsp;•&nbsp; R&nbsp; RESET</div>
          </div>
        </aside>

        <main className="lathe-stage">
          <div className="lathe-stage-header">
            <div>
              <span className="lathe-stage-kicker">INTERACTIVE 3D TRAINING MODEL</span>
              <h1>WM290 Centre Lathe</h1>
            </div>
            <div className="lathe-stage-tools">
              <button className={isExploded ? 'selected' : ''} onClick={() => setIsExploded(!isExploded)}><Expand size={14} /> Exploded</button>
              <button className={isCutaway ? 'selected' : ''} onClick={() => setIsCutaway(!isCutaway)}><Scissors size={14} /> Cutaway</button>
              <button onClick={() => setShowReference(true)}><Eye size={14} /> Reference</button>
              <button onClick={() => window.open('https://youtu.be/SuPmh23HUGY?si=VPUb2BKrkHpfMMvb', '_blank', 'noopener,noreferrer')}><Link2 size={14} /> Working Video</button>
            </div>
          </div>

          <div className="lathe-canvas-wrap">
            <div className="lathe-workshop-vignette" aria-hidden="true" />
            <div className="lathe-status-ribbon">
              <span className={`lathe-status-led ${activeCutting ? 'running' : operationState === 'COMPLETED' ? 'complete' : ''}`} />
              <span className="lathe-status-label">SIMULATED MACHINE STATE</span>
              <strong>{machinePhase}</strong>
              <span className="lathe-status-divider" />
              <span>{activeCutting ? 'SPINDLE COUPLED' : 'DRIVE DISENGAGED'}</span>
              <span className="lathe-status-divider" />
              <span>{isPowerOn ? 'POWER ON' : 'POWER OFF'}</span>
            </div>

            {activeSubTab === 'operate' && <div className={`lathe-operation-hud ${activeCutting ? 'running' : ''}`}>
              <div className="lathe-hud-top">
                <div>
                  <span className="lathe-panel-kicker">LIVE MACHINING FEED</span>
                  <strong>{currentOperation?.name || 'Turning'}</strong>
                </div>
                <div className="lathe-hud-progress"><span>{Math.round(operationProgress)}%</span><div><i style={{ width: `${operationProgress}%` }} /></div></div>
              </div>
              <div className="lathe-hud-grid">
                <div className="lathe-hud-readout"><span>SPINDLE</span><strong>{spindleSpeed}</strong><small>RPM</small></div>
                <div className="lathe-hud-readout"><span>V<sub>c</sub></span><strong>{surfaceSpeed}</strong><small>m/min</small></div>
                <div className="lathe-hud-readout"><span>FEED</span><strong>{feedMmMin}</strong><small>mm/min</small></div>
                <div className="lathe-hud-readout"><span>LOAD</span><strong>{loadPercent}</strong><small>%</small></div>
              </div>
              <div className="lathe-hud-cutline">
                <span><Zap size={13} /> CUTTING LOAD</span>
                <div className="lathe-hud-meter"><i style={{ width: `${loadPercent}%` }} /></div>
                <strong>{powerKw} kW <em>SIMULATED</em></strong>
              </div>
            </div>}

            {activeSubTab === 'operate' && (
              <div className="lathe-cutting-overlay">
                <div className="lathe-cutting-overlay-title"><span className="live-dot" /> CUTTING ZONE</div>
                <div className="lathe-cutting-visual">
                  <div className="cz-spindle"><span /><span /><span /></div>
                  <div className="cz-stock"><div className="cz-groove" /></div>
                  <div className="cz-tool"><span /></div>
                  <div className="cz-chip chip-a" /><div className="cz-chip chip-b" /><div className="cz-chip chip-c" />
                </div>
                <div className="lathe-cutting-meta"><span>DOC <strong>{cutDepth.toFixed(1)} mm</strong></span><span>Chip rate <strong>{chipRate.toFixed(0)} mm³/min</strong></span></div>
              </div>
            )}

            <div className="lathe-keyboard-guide" aria-label="Keyboard controls">
              <strong>KEYBOARD CONTROLS</strong>
              <span><kbd>←</kbd><kbd>→</kbd> Carriage</span>
              <span><kbd>↑</kbd><kbd>↓</kbd> Cross-slide</span>
              <span><kbd>Space</kbd> Start / Pause</span>
              <span><kbd>X</kbd> Stop</span>
              <span><kbd>R</kbd> Reset</span>
              <span><kbd>+</kbd><kbd>−</kbd> RPM</span>
              <small>Hold Shift with an axis key for larger steps. Manual movement is disabled during a running cycle.</small>
            </div>

            <ThreeVisualizer
              machineId="lathe"
              selectedPartId={selectedPartId}
              focusedPartId={null}
              onPartSelect={handlePartSelect}
              isExploded={isExploded}
              isCutaway={isCutaway}
              isPlaying={isOpRunning}
              simStep={1}
              simParams={simParams}
              activeSubTab={activeSubTab}
              assembledParts={[]}
              cameraMode={cameraMode}
              setCameraMode={setCameraMode}
              showLabels={activeSubTab === 'identify' ? true : false}
              highContrast={highContrast}
              toolPosition={toolPosition}
              activeOperation={beforeAfterMode === 'before' ? null : activeOperation}
              operationProgress={operationProgress}
              operationState={operationState}
              onSelectOperation={handleSelectOperation}
              onStartSimulation={handleStartOperationSim}
              onPauseResumeSimulation={handlePauseResumeOperation}
              onResetSimulation={handleResetOperation}
              onUpdateSimParams={setSimParams}
              beforeAfterMode={beforeAfterMode}
              onToggleBeforeAfter={toggleBeforeAfter}
              isLogin={false}
              immersiveUi={true}
            />

            <div className="lathe-camera-strip">
              {[
                ['default', '3D VIEW'],
                ['operation', 'OPERATION'],
                ['front_view', 'FRONT'],
                ['top_view', 'TOP']
              ].map(([id, label]) => (
                <button key={id} className={cameraMode === id ? 'active' : ''} onClick={() => setCameraMode(id)}>{label}</button>
              ))}
            </div>

            {validationAlert && (
              <div className="lathe-alert">
                <ShieldCheck size={18} />
                <div>
                  <strong>{validationAlert.title}</strong>
                  <span>{validationAlert.message}</span>
                </div>
                <button onClick={() => setValidationAlert(null)}><X size={15} /></button>
              </div>
            )}

            {activePart && (
              <div className="lathe-component-card">
                <div className="lathe-component-card-top">
                  <span>SELECTED COMPONENT</span>
                  <button onClick={() => handlePartSelect(null)}><X size={14} /></button>
                </div>
                <h3>{activePart.name}</h3>
                <p>{activePart.desc}</p>
                {selectedPartId === 'chuck' && <div className="lathe-component-chip">3-JAW SELF-CENTERING CHUCK</div>}
              </div>
            )}
          </div>

          <div className="lathe-operator-strip">
            <div><span className="lathe-strip-key">1</span><span>Mount stock</span></div>
            <div><span className="lathe-strip-key">2</span><span>Clamp & align tool</span></div>
            <div><span className="lathe-strip-key">3</span><span>Set RPM / feed / DOC</span></div>
            <div><span className="lathe-strip-key">4</span><span>Run spindle</span></div>
            <div><span className="lathe-strip-key">5</span><span>Engage feed</span></div>
            <div className="lathe-strip-note">All values shown here are simulated training telemetry.</div>
          </div>

          <div className="lathe-bottom-steps">
            <div className="lathe-steps-title">{currentOperation?.name || 'Turning'} Operation Steps</div>
            <div className="lathe-step-row">
              {TURNING_STEPS.map((step, idx) => (
                <button key={step} className={`lathe-step ${idx <= currentStep ? 'done' : ''} ${idx === currentStep ? 'current' : ''}`} onClick={() => idx === 0 && handlePartSelect('workpiece')}>
                  <span className="lathe-step-num">{idx === 6 ? <CheckCircle2 size={15} /> : idx + 1}</span>
                  <span>{step}</span>
                </button>
              ))}
              <div className="lathe-safe-reminder"><CheckCircle2 size={20} /><span>Follow the steps and complete the operation safely.</span></div>
            </div>
          </div>
        </main>

        <aside className="lathe-right-panel">
          <section className="lathe-control-card">
            <div className="lathe-panel-title-row">
              <div>
                <span className="lathe-panel-kicker">OPERATION CONTROL</span>
                <h2>Machine setup</h2>
                <div className="lathe-panel-sub">Interactive WM290 training console</div>
              </div>
              <Gauge size={20} />
            </div>

            <label className="lathe-field-label">Operation
              <div className="lathe-select-wrap">
                <select value={currentOperation?.id || ''} onChange={(e) => {
                  const op = machineOperations.find(item => item.id === e.target.value);
                  if (op) handleSelectOperation(op);
                }}>
                  {machineOperations.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
            </label>

            <label className="lathe-field-label">Material
              <div className="lathe-select-wrap">
                <select value={material} onChange={(e) => setMaterial(e.target.value)}>
                  <option>Mild Steel</option>
                  <option>Aluminium</option>
                  <option>Brass</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </label>

            <div className="lathe-slider-group">
              <div className="lathe-slider-head"><span>Spindle Speed (RPM)</span><strong>{Math.round(simParams.speed || 0)}</strong></div>
              <input type="range" min={currentOperation?.paramBounds?.speed?.min || 100} max={currentOperation?.paramBounds?.speed?.max || 1500} step={currentOperation?.paramBounds?.speed?.step || 50} value={simParams.speed || 0} onChange={e => setSimParams({ ...simParams, speed: Number(e.target.value) })} />
            </div>

            <div className="lathe-slider-group">
              <div className="lathe-slider-head"><span>Feed Rate (mm/rev)</span><strong>{feedValue}</strong></div>
              <input type="range" min={currentOperation?.paramBounds?.feed?.min || 0.05} max={currentOperation?.paramBounds?.feed?.max || 0.4} step={currentOperation?.paramBounds?.feed?.step || 0.01} value={simParams.feed || 0} onChange={e => setSimParams({ ...simParams, feed: Number(e.target.value) })} />
            </div>

            <div className="lathe-slider-group">
              <div className="lathe-slider-head"><span>Depth of Cut (mm)</span><strong>{docValue}</strong></div>
              <input type="range" min={currentOperation?.paramBounds?.doc?.min || 0.2} max={currentOperation?.paramBounds?.doc?.max || 3} step={currentOperation?.paramBounds?.doc?.step || 0.1} value={simParams.doc || 0} onChange={e => setSimParams({ ...simParams, doc: Number(e.target.value) })} />
            </div>

            <div className="lathe-main-controls">
              {operationState === 'RUNNING' ? (
                <button className="lathe-control pause" onClick={handlePauseResumeOperation}><Pause size={16} /> Pause</button>
              ) : (
                <button className="lathe-control start" onClick={operationStart}><Play size={16} fill="currentColor" /> Start</button>
              )}
              <button className="lathe-control stop" onClick={handleAbortOperation}><Square size={15} fill="currentColor" /> Stop</button>
            </div>
            <button className="lathe-reset" onClick={handleResetOperation}><RotateCcw size={14} /> Reset</button>

            <div className="lathe-live-card">
              <div className="lathe-panel-kicker">LIVE READINGS</div>
              <div className="lathe-metric"><span>Spindle Speed</span><strong>{spindleRpm} RPM</strong></div>
              <div className="lathe-metric"><span>Feed Rate</span><strong>{feedValue} mm/rev</strong></div>
              <div className="lathe-metric"><span>Cutting Depth</span><strong>{docValue} mm</strong></div>
              <div className="lathe-metric"><span>Carriage Position</span><strong>{carriagePosition} mm</strong></div>
              <div className="lathe-metric"><span>Surface Speed (V<sub>c</sub>)</span><strong>{surfaceSpeed} m/min</strong></div>
              <div className="lathe-metric"><span>Feed Rate (V<sub>f</sub>)</span><strong>{feedMmMin} mm/min</strong></div>
              <div className="lathe-metric"><span>Spindle Load</span><strong>{loadPercent}%</strong></div>
              <div className="lathe-progress-label"><span>Operation Progress</span><strong>{Math.round(operationProgress)}%</strong></div>
              {progressBar}
            </div>
          </section>

          <section className="lathe-info-card">
            <div className="lathe-info-icon"><ClipboardCheck size={18} /></div>
            <div>
              <span>TRAINING STATUS</span>
              <strong>{operationState === 'COMPLETED' ? 'Operation Complete' : operationState === 'RUNNING' ? 'Simulation Running' : 'Ready for Practice'}</strong>
              <p>{currentOperation?.description || 'Select an operation and use the 3D workplane to practice the machine procedure.'}</p>
            </div>
          </section>

          <section className="lathe-parts-card">
            <div className="lathe-parts-header"><span>QUICK PARTS</span><span>{machine.parts.length}</span></div>
            <div className="lathe-parts-list">
              {machine.parts.slice(0, 8).map(part => (
                <button key={part.id} className={selectedPartId === part.id ? 'active' : ''} onClick={() => handlePartSelect(part.id)}>
                  <span>{part.name}</span><span>›</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {showReference && (
        <div className="lathe-modal-backdrop" onClick={() => setShowReference(false)}>
          <div className="lathe-reference-modal" onClick={e => e.stopPropagation()}>
            <div className="lathe-reference-header"><div><span>REFERENCE</span><h3>WM290 Lathe Training View</h3></div><button onClick={() => setShowReference(false)}><X size={18} /></button></div>
            <img src="/lathe.jpg" alt="Lathe machine reference" />
            <p>Use the reference image together with the interactive 3D model. The linked working video is provided as an external learning reference for construction and working-principle study.</p>
          </div>
        </div>
      )}
    </div>
  );
}
