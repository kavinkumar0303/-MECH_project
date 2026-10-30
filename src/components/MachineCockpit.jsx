import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Play, 
  Eye, 
  RotateCcw, 
  Sliders, 
  Compass, 
  Wrench,
  HelpCircle,
  Activity,
  Layers,
  Crop,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Award,
  Printer
} from 'lucide-react';
import { MACHINES } from '../data/machines';
import ThreeVisualizer from './ThreeVisualizer';
import { SIMULATION_OPERATIONS } from '../simulation/simulationConfig';
import { SafetyEngine } from '../simulation/safetyEngine';
import { AssessmentEngine } from '../simulation/assessmentEngine';

const MACHINE_TOOLS = {
  lathe: ['Facing Tool', 'Turning Tool', 'Parting Tool', 'Threading Tool', 'Boring Bar', 'Twist Drill Bit', 'Knurling Tool', 'Form Tool', 'Chamfer Tool'],
  welding: ['SMAW Electrode', 'GTAW Torch', 'GMAW Gun', 'FCAW Torch'],
  shaper: ['Shaper Tool Bit', 'Slotting Tool Bit', 'Keyway Tool Bit'],
  planer: ['Planing Tool Bit', 'Broad-Nosed Tool', 'Grooving Tool'],
  milling: ['Face Mill', 'End Mill', 'Slab Mill', 'T-Slot Cutter', 'Ball-Nose End Mill'],
  casting: ['Graphite Crucible', 'Steel Ladle', 'Bottom Pour Ladle'],
  moulding: ['Hand Rammer', 'Pattern Lifter', 'Vent Wire', 'Sand Shovel']
};

const WORKPIECE_MATERIALS = {
  'Mild Steel': { name: 'Mild Steel (AISI 1018)', kc: 2100, density: 7.85, maxTemp: 600, optimalVc: '180-250 m/min' },
  'Aluminum 6061': { name: 'Aluminum Alloy (6061-T6)', kc: 750, density: 2.70, maxTemp: 350, optimalVc: '300-600 m/min' },
  'Cast Iron': { name: 'Gray Cast Iron (ASTM 35)', kc: 1350, density: 7.20, maxTemp: 550, optimalVc: '120-180 m/min' },
  'Brass C360': { name: 'Free-Cutting Brass (C36000)', kc: 900, density: 8.50, maxTemp: 400, optimalVc: '250-450 m/min' },
  'Stainless 304': { name: 'Stainless Steel (AISI 304)', kc: 2800, density: 8.00, maxTemp: 700, optimalVc: '90-140 m/min' }
};

const INSPECT_FEATURES = {
  od: { label: 'Outer Diameter (OD)', nominal: 36.000, tol: 0.025, usl: 36.025, lsl: 35.975, unit: 'mm' },
  length: { label: 'Overall Length (L)', nominal: 120.000, tol: 0.050, usl: 120.050, lsl: 119.950, unit: 'mm' },
  groove: { label: 'Step / Groove Width', nominal: 12.000, tol: 0.020, usl: 12.020, lsl: 11.980, unit: 'mm' }
};

export default function MachineCockpit({ user, onUpdateUser, initialMachineId, showLabels, highContrast }) {
  const [selectedId, setSelectedId] = useState(initialMachineId || 'lathe');
  const [activeSubTab, setActiveSubTab] = useState('explorer');
  const machine = MACHINES[selectedId];

  // Operations and State Machine
  const [activeOperation, setActiveOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationState, setOperationState] = useState('IDLE'); // IDLE, SELECT_COMPONENT, SELECT_OPERATION, SETUP, SAFETY_CHECK, READY, RUNNING, COMPLETED, ASSESSMENT
  const [operationHistory, setOperationHistory] = useState([]);
  const [beforeAfterMode, setBeforeAfterMode] = useState('after');
  const [isOpRunning, setIsOpRunning] = useState(false);

  // Safety checklist & PPE states
  const [safetyItems, setSafetyItems] = useState({
    goggles: true,
    gloves: false,
    clothing: true,
    shoes: true,
    shield: false
  });
  const [safetyPassed, setSafetyPassed] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState('');
  const [_safetyReport, setSafetyReport] = useState(null);

  // Setup checklist
  const [setupChecklist, setSetupChecklist] = useState({
    stockSecured: true,
    toolClamped: true,
    safetyGuardAligned: true
  });
  const [setupPassed, setSetupPassed] = useState(true);

  // Simulation execution telemetry
  const [simParams, setSimParams] = useState({ speed: 750, feed: 0.12, doc: 0.8 });
  const [simStartTime, setSimStartTime] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [validationAlert, setValidationAlert] = useState(null);

  // Part selection & camera
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [focusedPartId, _setFocusedPartId] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [isCutaway, setIsCutaway] = useState(false);
  const [cameraMode, setCameraMode] = useState('default');
  const [toolPosition, setToolPosition] = useState({ x: 0, y: 0, z: 0 });

  // Right sidebar tab (in operate mode)
  const [activeRightTab, setActiveRightTab] = useState('tools');
  const [selectedTool, setSelectedTool] = useState('Turning Tool');
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [spindleDirection, _setSpindleDirection] = useState('Clockwise');

  // Sub-tab specific states
  const [identifyTargetPart, setIdentifyTargetPart] = useState(null);
  const [identifySuccess, setIdentifySuccess] = useState(false);
  const [identifyFeedback, setIdentifyFeedback] = useState('');

  const [inspectFeedback, setInspectFeedback] = useState('');
  const [inspectSuccess, setInspectSuccess] = useState(false);

  const [troubleIdx, setTroubleIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [troubleFeedback, setTroubleFeedback] = useState('');
  const [troublePassed, setTroublePassed] = useState(false);

  const [assembledParts, setAssembledParts] = useState([]);

  const [inspectFeature, setInspectFeature] = useState('od');
  const [caliperVal, setCaliperVal] = useState(36.012);
  const [showCertModal, setShowCertModal] = useState(false);
  const [expMaterial, setExpMaterial] = useState('Mild Steel');
  const [expNoseRadius, setExpNoseRadius] = useState(0.8);
  const simContextRef = useRef({});
  const keyboardActionsRef = useRef({});

  const machineOperations = SIMULATION_OPERATIONS[selectedId] || machine?.operations || [];
  const activePart = machine?.parts?.find(p => p.id === selectedPartId) || machine?.parts?.[0];

  const isWorkpieceComponent = (partId, machId) => {
    if (!partId) return false;
    if (machId === 'lathe' && partId === 'workpiece') return true;
    if (machId === 'welding' && (partId === 'weld_joint' || partId === 'metal_plates')) return true;
    if (machId === 'shaper' && partId === 'workpiece') return true;
    if (machId === 'planer' && partId === 'workpiece') return true;
    if (machId === 'milling' && partId === 'workpiece') return true;
    if (machId === 'casting' && (partId === 'casting_cavity' || partId === 'pattern' || partId === 'ladle')) return true;
    if (machId === 'moulding' && (partId === 'cavity' || partId === 'sand' || partId === 'pattern')) return true;
    return false;
  };

  // Synchronize machine choice from global shortcut
  useEffect(() => {
    if (initialMachineId && initialMachineId !== selectedId) {
      setSelectedId(initialMachineId);
    }
  }, [initialMachineId, selectedId]);

  // Reset viewport states on machine switch
  useEffect(() => {
    setActiveSubTab('explorer');
    setIsExploded(false);
    setIsCutaway(false);
    setCameraMode('default');
    setSelectedPartId(null);
    setSelectedTool(MACHINE_TOOLS[selectedId]?.[0] || 'Turning Tool');
    setIsPowerOn(false);
    
    // Reset operations
    setActiveOperation(null);
    setOperationProgress(0);
    setOperationState('IDLE');
    setOperationHistory([]);
    setBeforeAfterMode('after');
    setIsOpRunning(false);
    setValidationAlert(null);
    setAssessmentResult(null);

    // Default PPE preset based on machine
    if (selectedId === 'welding') {
      setSafetyItems({ goggles: false, gloves: true, clothing: true, shoes: true, shield: true });
    } else if (selectedId === 'casting' || selectedId === 'moulding') {
      setSafetyItems({ goggles: true, gloves: true, clothing: true, shoes: true, shield: false });
    } else {
      setSafetyItems({ goggles: true, gloves: false, clothing: true, shoes: true, shield: false });
    }

    setSetupChecklist({ stockSecured: true, toolClamped: true, safetyGuardAligned: true });
    setSetupPassed(true);

    // Simulator defaults
    const firstOp = (SIMULATION_OPERATIONS[selectedId] || [])[0];
    if (firstOp && firstOp.defaultParams) {
      setSimParams({ ...firstOp.defaultParams });
    } else {
      setSimParams({ speed: 750, feed: 0.12, doc: 0.8 });
    }

    // Sub-tab resets
    const curMachine = MACHINES[selectedId];
    if (curMachine?.parts && curMachine.parts.length > 0) {
      const idx = Math.floor(Math.random() * curMachine.parts.length);
      setIdentifyTargetPart(curMachine.parts[idx]);
    }
    setIdentifySuccess(false);
    setIdentifyFeedback('');
    setInspectFeedback('');
    setInspectSuccess(false);
    setToolPosition({ x: 0, y: 0, z: 0 });
    setAssembledParts([]);
    setTroubleIdx(0);
    setSelectedOptionId('');
    setTroubleFeedback('');
    setTroublePassed(false);
  }, [selectedId]);

  // Operation selection
  const handleSelectOperation = (op) => {
    setActiveOperation(op);
    setOperationState('SETUP');
    setBeforeAfterMode('after');
    setOperationProgress(0);
    setValidationAlert(null);
    setAssessmentResult(null);

    // Sync required tool
    if (op.requiredTool) {
      setSelectedTool(op.requiredTool);
    }
    if (op.defaultParams) {
      setSimParams({ ...op.defaultParams });
    }

    // Auto-select workpiece if not yet selected
    if (!selectedPartId) {
      if (selectedId === 'lathe') setSelectedPartId('workpiece');
      else if (selectedId === 'welding') setSelectedPartId('weld_joint');
      else if (selectedId === 'shaper') setSelectedPartId('workpiece');
      else if (selectedId === 'planer') setSelectedPartId('workpiece');
      else if (selectedId === 'milling') setSelectedPartId('workpiece');
      else if (selectedId === 'casting') setSelectedPartId('casting_cavity');
      else if (selectedId === 'moulding') setSelectedPartId('sand');
    }
  };

  // Validate and start operation simulation
  const handleStartOperationSim = () => {
    // 1. Workpiece Selection Check
    if (!selectedPartId) {
      setValidationAlert({
        title: "Workpiece Not Selected",
        message: "Workpiece not selected. Select the workpiece in the 3D workplane before starting the operation."
      });
      return;
    }

    // 2. Safety Validation Check
    const safetyCheck = SafetyEngine.validateSafety({
      machineId: selectedId,
      operation: activeOperation,
      selectedPartId,
      selectedTool,
      safetyItems,
      setupChecklist,
      simParams
    });

    setSafetyReport(safetyCheck);

    if (!safetyCheck.isCompliant) {
      setValidationAlert({
        title: safetyCheck.issues[0].title,
        message: safetyCheck.issues[0].message
      });
      return;
    }

    // Passed validations -> Start simulation
    setValidationAlert(null);
    setOperationState('RUNNING');
    setIsOpRunning(true);
    setIsPowerOn(true);
    setSimStartTime(Date.now());
    setCameraMode('operation');
  };

  const handlePauseResumeOperation = () => {
    setIsOpRunning(prev => !prev);
  };

  const handleAbortOperation = () => {
    setIsOpRunning(false);
    setOperationState('IDLE');
    setOperationProgress(0);
    setIsPowerOn(false);
    setCameraMode('default');
  };

  const handleResetOperation = () => {
    setIsOpRunning(false);
    setOperationProgress(0);
    setOperationState('SETUP');
    setBeforeAfterMode('after');
    setIsPowerOn(false);
    setCameraMode('default');
    setAssessmentResult(null);
    setValidationAlert(null);
  };

  const toggleBeforeAfter = () => {
    setBeforeAfterMode(p => p === 'after' ? 'before' : 'after');
  };

  simContextRef.current = {
    selectedId,
    activeOperation,
    selectedPartId,
    selectedTool,
    safetyItems,
    setupChecklist,
    simParams,
    user,
    onUpdateUser,
    operationHistory,
    simStartTime
  };

  const handlePartSelect = (partId) => {
    setSelectedPartId(partId);
    setValidationAlert(null);
    if (partId && !activeOperation) {
      setOperationState('SELECT_OPERATION');
    }
    if (activeSubTab === 'identify' && identifyTargetPart) {
      if (partId === identifyTargetPart.id) {
        setIdentifySuccess(true);
        setIdentifyFeedback(`✓ Correct! You identified the [ ${identifyTargetPart.name} ] component.`);
        if (user && onUpdateUser) {
          onUpdateUser({ ...user, xp: (user.xp || 0) + 50 });
        }
      } else {
        const found = machine?.parts?.find(p => p.id === partId)?.name || 'other';
        setIdentifyFeedback(`✗ Try Again: That is the [ ${found} ] component.`);
      }
    }
  };

  // Operation Timeline Progress Loop
  useEffect(() => {
    let timer;
    if (isOpRunning && operationState === 'RUNNING') {
      timer = setInterval(() => {
        setOperationProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            setIsOpRunning(false);
            setOperationState('COMPLETED');
            setCameraMode('close_up');

            const ctx = simContextRef.current;
            const elapsedSec = Math.max(8, Math.round((Date.now() - (ctx.simStartTime || Date.now())) / 1000));

            // Calculate assessment score
            const currentSafety = SafetyEngine.validateSafety({
              machineId: ctx.selectedId,
              operation: ctx.activeOperation,
              selectedPartId: ctx.selectedPartId,
              selectedTool: ctx.selectedTool,
              safetyItems: ctx.safetyItems,
              setupChecklist: ctx.setupChecklist,
              simParams: ctx.simParams
            });

            const assessment = AssessmentEngine.calculateAssessment({
              machineId: ctx.selectedId,
              operation: ctx.activeOperation,
              safetyReport: currentSafety,
              setupChecklist: ctx.setupChecklist,
              simParams: ctx.simParams,
              elapsedSeconds: elapsedSec,
              attempts: 1,
              errorCount: currentSafety.warnings.length
            });

            setAssessmentResult(assessment);

            // Record completed operation and update XP
            if (ctx.activeOperation && !ctx.operationHistory.includes(ctx.activeOperation.id)) {
              setOperationHistory(prev => [...prev, ctx.activeOperation.id]);
            }

            if (ctx.user && ctx.onUpdateUser) {
              ctx.onUpdateUser({
                ...ctx.user,
                xp: (ctx.user.xp || 0) + assessment.xpAwarded,
                completedMissions: (ctx.user.completedMissions || 0) + 1
              });
            }

            return 100;
          }
          return p + 4;
        });
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isOpRunning, operationState]);

  // Handle PPE toggle
  const handleSafetyToggle = (key) => {
    setSafetyItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      const report = SafetyEngine.validateSafety({
        machineId: selectedId,
        operation: activeOperation,
        selectedPartId,
        selectedTool,
        safetyItems: updated,
        setupChecklist,
        simParams
      });
      setSafetyPassed(report.isCompliant);
      setSafetyFeedback(report.statusMessage);
      return updated;
    });
  };

  // Handle Setup toggle
  const toggleSetupChecklist = (field) => {
    setSetupChecklist(prev => {
      const updated = { ...prev, [field]: !prev[field] };
      const isComplete = updated.stockSecured && updated.toolClamped && updated.safetyGuardAligned;
      setSetupPassed(isComplete);
      return updated;
    });
  };

  // Keyboard navigation
  keyboardActionsRef.current = {
    activeSubTab,
    operationState,
    activeOperation,
    machineOperations,
    handleAbortOperation,
    handlePauseResumeOperation,
    handleSelectOperation,
    handleStartOperationSim,
    handleResetOperation,
    setActiveSubTab
  };

  useEffect(() => {
    const handleKeydown = (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isTyping) return;

      const act = keyboardActionsRef.current;
      const keysMap = {
        'q': 'explorer', 'Q': 'explorer',
        'z': 'identify', 'Z': 'identify',
        'e': 'safety', 'E': 'safety',
        'v': 'setup', 'V': 'setup',
        'x': 'operate', 'X': 'operate',
        'b': 'experiments', 'B': 'experiments',
        'c': 'troubleshooting', 'C': 'troubleshooting',
        'n': 'inspect', 'N': 'inspect',
        'k': 'scorecard', 'K': 'scorecard'
      };

      if (keysMap[e.key]) {
        e.preventDefault();
        act.setActiveSubTab(keysMap[e.key]);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        act.handleAbortOperation();
        return;
      }

      if (e.key === ' ' && act.activeSubTab === 'operate') {
        e.preventDefault();
        if (act.operationState === 'RUNNING') {
          act.handlePauseResumeOperation();
        } else if (act.operationState === 'SETUP' || act.operationState === 'READY' || act.operationState === 'IDLE') {
          if (!act.activeOperation && act.machineOperations.length > 0) {
            act.handleSelectOperation(act.machineOperations[0]);
          } else {
            act.handleStartOperationSim();
          }
        }
      }

      if ((e.key === 'r' || e.key === 'R') && (act.operationState === 'COMPLETED' || act.operationState === 'RUNNING')) {
        e.preventDefault();
        act.handleResetOperation();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="cockpit-root-container">
      
      {/* 1. Category Switcher (1-7 machines) */}
      <div className="cockpit-machine-strip">
        {Object.values(MACHINES).map((m) => {
          const isSelected = selectedId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: isSelected ? '1px solid #0077B6' : '1px solid #BAE6FD',
                background: isSelected ? 'var(--brand-gradient)' : 'rgba(255, 241, 232, 0.7)',
                color: isSelected ? '#FFFFFF' : '#666666',
                fontWeight: '700',
                textTransform: 'uppercase',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
                boxShadow: isSelected ? '0 0 15px rgba(0, 119, 182, 0.35)' : 'none',
                flexShrink: 0
              }}
            >
              {m.name.replace(' Machine', '').replace(' Station', '').replace(' Furnace', '').replace(' Bay', '')}
            </button>
          );
        })}
      </div>

      {/* 2. 9-Stage Learning Navigation Subtabs */}
      <div className="cockpit-subtabs-strip">
        {[
          { id: 'explorer', label: '1. Explore Parts', icon: Eye },
          { id: 'identify', label: '2. Identify Part', icon: Compass },
          { id: 'safety', label: '3. Safety Locker', icon: ShieldAlert },
          { id: 'setup', label: '4. Setup Assembly', icon: Wrench },
          { id: 'operate', label: '5. Operate Simulator', icon: Activity },
          { id: 'experiments', label: '6. Experiment Lab', icon: Sliders },
          { id: 'troubleshooting', label: '7. Troubleshooting', icon: HelpCircle },
          { id: 'inspect', label: '8. Inspect Part', icon: Crop },
          { id: 'scorecard', label: '9. Performance Card', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: isActive ? '1px solid #0077B6' : '1px solid #BAE6FD',
                background: isActive ? 'var(--brand-gradient)' : 'rgba(255, 255, 255, 0.9)',
                color: isActive ? '#FFFFFF' : '#666666',
                fontWeight: '600',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: isActive ? '0 0 15px rgba(0, 119, 182, 0.3)' : 'none'
              }}
            >
              <Icon size={12} style={{ color: isActive ? '#FFFFFF' : '#0077B6' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Split Viewport */}
      <div className="cockpit-grid">
        
        {/* COLUMN 1: OPERATIONS & CONTROLS */}
        <div className="cockpit-col-1">
          {activeSubTab === 'operate' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1F1F1F', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {machine.name.toUpperCase()}
                </h3>
                {isPowerOn ? (
                  <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700', letterSpacing: '0.5px' }}>● POWER ON</span>
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>○ STANDBY</span>
                )}
              </div>

              {/* Machine Operations Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="telemetry-label" style={{ color: '#666666' }}>Select 3D Operation</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {machineOperations.map((op, idx) => {
                    const isSelected = activeOperation?.id === op.id;
                    const isDone = operationHistory.includes(op.id);
                    return (
                      <button
                        key={op.id}
                        onClick={() => handleSelectOperation(op)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid ' + (isSelected ? '#0077B6' : isDone ? '#10B981' : '#BAE6FD'),
                          background: isSelected ? 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(2, 62, 138, 0.18) 100%)' : isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 248, 242, 0.7)',
                          color: isSelected ? '#023E8A' : '#1F1F1F',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 15px rgba(0, 119, 182, 0.25)' : 'none'
                        }}
                      >
                        <span>{idx + 1}. {op.name}</span>
                        {isDone && <CheckCircle2 size={14} style={{ color: '#10B981' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Operation Parameters */}
              {activeOperation && (
                <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12px', color: '#023E8A', textTransform: 'uppercase' }}>{activeOperation.name} CONFIG</strong>
                    <span style={{ fontSize: '10px', color: '#666666' }}>{activeOperation.targetPart}</span>
                  </div>

                  {/* Speed Parameter */}
                  {activeOperation.paramBounds?.speed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Speed / Power:</span>
                        <strong style={{ color: '#1F1F1F' }}>{simParams.speed} {activeOperation.paramBounds.speed.unit}</strong>
                      </div>
                      <input 
                        type="range"
                        min={activeOperation.paramBounds.speed.min}
                        max={activeOperation.paramBounds.speed.max}
                        step={activeOperation.paramBounds.speed.step || 10}
                        value={simParams.speed || activeOperation.defaultParams.speed}
                        onChange={(e) => setSimParams({ ...simParams, speed: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>
                  )}

                  {/* Feed Parameter */}
                  {activeOperation.paramBounds?.feed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Feed Rate:</span>
                        <strong style={{ color: '#1F1F1F' }}>{simParams.feed} {activeOperation.paramBounds.feed.unit}</strong>
                      </div>
                      <input 
                        type="range"
                        min={activeOperation.paramBounds.feed.min}
                        max={activeOperation.paramBounds.feed.max}
                        step={activeOperation.paramBounds.feed.step || 0.01}
                        value={simParams.feed || activeOperation.defaultParams.feed}
                        onChange={(e) => setSimParams({ ...simParams, feed: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>
                  )}

                  {/* Depth of Cut Parameter */}
                  {activeOperation.paramBounds?.doc && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Depth of Cut:</span>
                        <strong style={{ color: '#1F1F1F' }}>{simParams.doc} {activeOperation.paramBounds.doc.unit}</strong>
                      </div>
                      <input 
                        type="range"
                        min={activeOperation.paramBounds.doc.min}
                        max={activeOperation.paramBounds.doc.max}
                        step={activeOperation.paramBounds.doc.step || 0.1}
                        value={simParams.doc || activeOperation.defaultParams.doc}
                        onChange={(e) => setSimParams({ ...simParams, doc: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Start / Action Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {operationState === 'RUNNING' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handlePauseResumeOperation}
                      style={{
                        flex: 1,
                        padding: '11px',
                        background: 'rgba(0, 119, 182, 0.12)',
                        border: '1px solid var(--brand-primary)',
                        color: 'var(--brand-primary)',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(0, 119, 182, 0.2)'
                      }}
                    >
                      {isOpRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button
                      onClick={handleAbortOperation}
                      style={{
                        padding: '11px 18px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ABORT
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartOperationSim}
                    disabled={!activeOperation}
                    className="space-btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      opacity: activeOperation ? 1 : 0.45,
                      cursor: activeOperation ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Play size={14} fill="#FFF" />
                    START 3D SIMULATION
                  </button>
                )}

                <button
                  onClick={handleResetOperation}
                  className="space-btn-secondary"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '11px'
                  }}
                >
                  <RotateCcw size={12} />
                  RESET SIMULATION
                </button>
              </div>

            </div>
          ) : (
            // SIDEBAR CONTROLS FOR THE OTHER 8 SUB-TABS
            <>
              {activeSubTab === 'explorer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F1F1F' }}>{machine.name}</h3>
                  <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#666666', lineHeight: '1.4' }}>"{machine.tagline}"</span>
                  <div style={{ borderTop: '1px solid #BAE6FD', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="telemetry-label" style={{ color: '#666666' }}>Operational Overview</span>
                    <p style={{ fontSize: '13px', color: '#1F1F1F', lineHeight: '1.5' }}>{machine.overview}</p>
                  </div>
                </div>
              )}

              {activeSubTab === 'identify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F1F1F' }}>Part Challenge</h3>
                  {identifyTargetPart && (
                    <div style={{ padding: '14px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#1F1F1F', fontWeight: '600', lineHeight: '1.4' }}>
                        Click the component representing the <span style={{ color: '#023E8A', textDecoration: 'underline', fontWeight: '700' }}>[ {identifyTargetPart.name} ]</span> in the 3D workplane.
                      </p>
                    </div>
                  )}
                  <div className="dark-inspector-list" style={{ maxHeight: '350px' }}>
                    {machine.parts.map((p) => {
                      const isSelected = selectedPartId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handlePartSelect(p.id)}
                          className={`dark-inspector-item ${isSelected ? 'selected' : ''}`}
                        >
                          <span>{p.name}</span>
                          {isSelected && <span className="dark-inspector-item-badge">● SELECTED</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSubTab === 'safety' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F1F1F' }}>Safety Locker</h3>
                  <p style={{ fontSize: '12px', color: '#666666' }}>Configure safety gear parameters according to machine type.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(safetyItems).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSafetyToggle(key)}
                        style={{
                          padding: '12px 16px',
                          background: safetyItems[key] ? 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(2, 62, 138, 0.18) 100%)' : '#F0F9FF',
                          border: '1px solid ' + (safetyItems[key] ? '#0077B6' : '#BAE6FD'),
                          borderRadius: '8px',
                          color: '#1F1F1F',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: safetyItems[key] ? '0 0 15px rgba(0, 119, 182, 0.2)' : 'none'
                        }}
                      >
                        <span>{key.toUpperCase()}</span>
                        <span style={{ color: safetyItems[key] ? '#10B981' : '#8C827A', fontSize: '11px', fontWeight: '800' }}>
                          {safetyItems[key] ? '✓ EQUIPPED' : '○ NONE'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1F1F1F' }}>Clamping & Fixtures</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => toggleSetupChecklist('stockSecured')}
                      style={{
                        padding: '12px 16px',
                        background: setupChecklist.stockSecured ? 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(2, 62, 138, 0.18) 100%)' : '#F0F9FF',
                        border: '1px solid ' + (setupChecklist.stockSecured ? '#0077B6' : '#BAE6FD'),
                        color: '#1F1F1F', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>Mount Workpiece Stock</span>
                      <span style={{ color: setupChecklist.stockSecured ? '#10B981' : '#8C827A', fontSize: '11px', fontWeight: '800' }}>{setupChecklist.stockSecured ? '✓ CLAMPED' : '○ UNLOCKED'}</span>
                    </button>
                    <button
                      onClick={() => toggleSetupChecklist('toolClamped')}
                      style={{
                        padding: '12px 16px',
                        background: setupChecklist.toolClamped ? 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(2, 62, 138, 0.18) 100%)' : '#F0F9FF',
                        border: '1px solid ' + (setupChecklist.toolClamped ? '#0077B6' : '#BAE6FD'),
                        color: '#1F1F1F', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>Clamp Tool / Electrode</span>
                      <span style={{ color: setupChecklist.toolClamped ? '#10B981' : '#8C827A', fontSize: '11px', fontWeight: '800' }}>{setupChecklist.toolClamped ? '✓ SECURED' : '○ UNLOCKED'}</span>
                    </button>
                    <button
                      onClick={() => toggleSetupChecklist('safetyGuardAligned')}
                      style={{
                        padding: '12px 16px',
                        background: setupChecklist.safetyGuardAligned ? 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(2, 62, 138, 0.18) 100%)' : '#F0F9FF',
                        border: '1px solid ' + (setupChecklist.safetyGuardAligned ? '#0077B6' : '#BAE6FD'),
                        color: '#1F1F1F', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>Align Safety Shield</span>
                      <span style={{ color: setupChecklist.safetyGuardAligned ? '#10B981' : '#8C827A', fontSize: '11px', fontWeight: '800' }}>{setupChecklist.safetyGuardAligned ? '✓ ALIGNED' : '○ UNSET'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'experiments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F1F1F', margin: 0 }}>MACHINING LAB</h3>
                    <span style={{ fontSize: '10px', background: 'rgba(0,119,182,0.1)', color: '#0077B6', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      PHYSICS SIM
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Material Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#666666', fontWeight: '700' }}>Workpiece Material</span>
                      <select
                        value={expMaterial}
                        onChange={(e) => setExpMaterial(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #BAE6FD',
                          background: '#FFFFFF',
                          color: '#1F1F1F',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      >
                        {Object.keys(WORKPIECE_MATERIALS).map((mat) => (
                          <option key={mat} value={mat}>{WORKPIECE_MATERIALS[mat].name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tool Nose Radius Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#666666', fontWeight: '700' }}>Tool Nose Radius (rε)</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[0.4, 0.8, 1.2].map((r) => (
                          <button
                            key={r}
                            onClick={() => setExpNoseRadius(r)}
                            style={{
                              flex: 1,
                              padding: '6px',
                              borderRadius: '6px',
                              border: expNoseRadius === r ? '1px solid #0077B6' : '1px solid #BAE6FD',
                              background: expNoseRadius === r ? 'rgba(0,119,182,0.15)' : '#FFFFFF',
                              color: expNoseRadius === r ? '#023E8A' : '#666666',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {r} mm
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speed Variable Slider */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#666666' }}>Spindle / Stroke Speed:</span>
                        <strong style={{ color: '#023E8A' }}>{simParams.speed} RPM</strong>
                      </div>
                      <input 
                        type="range" min={200} max={1800} step={25} value={simParams.speed}
                        onChange={(e) => setSimParams({ ...simParams, speed: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>

                    {/* Feed Variable Slider */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#666666' }}>Feed Rate (f):</span>
                        <strong style={{ color: '#0096C7' }}>{simParams.feed} mm/rev</strong>
                      </div>
                      <input 
                        type="range" min={0.04} max={0.60} step={0.02} value={simParams.feed}
                        onChange={(e) => setSimParams({ ...simParams, feed: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>

                    {/* Depth of Cut Slider */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: '#666666' }}>Depth of Cut (ap):</span>
                        <strong style={{ color: '#1F1F1F' }}>{simParams.doc} mm</strong>
                      </div>
                      <input 
                        type="range" min={0.2} max={3.5} step={0.1} value={simParams.doc}
                        onChange={(e) => setSimParams({ ...simParams, doc: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'troubleshooting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F1F1F', margin: 0 }}>DEFECT DIAGNOSTIC</h3>
                    <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      CASE {(troubleIdx || 0) + 1}
                    </span>
                  </div>

                  {/* Multi-scenario selector pills */}
                  {machine.troubleshoot && machine.troubleshoot.length > 1 && (
                    <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {machine.troubleshoot.map((s, sIdx) => (
                        <button
                          key={s.id || sIdx}
                          onClick={() => {
                            setTroubleIdx(sIdx);
                            setSelectedOptionId('');
                            setTroubleFeedback('');
                            setTroublePassed(false);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '14px',
                            border: troubleIdx === sIdx ? '1px solid #0077B6' : '1px solid #BAE6FD',
                            background: troubleIdx === sIdx ? 'var(--brand-gradient)' : '#FFFFFF',
                            color: troubleIdx === sIdx ? '#FFFFFF' : '#666666',
                            fontSize: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Defect {sIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {machine.troubleshoot && machine.troubleshoot[troubleIdx] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '12px', borderRadius: '8px' }}>
                        <strong style={{ fontSize: '12.5px', color: '#023E8A', display: 'block', marginBottom: '4px' }}>
                          {machine.troubleshoot[troubleIdx].title}
                        </strong>
                        <p style={{ fontSize: '11.5px', color: '#4B5563', lineHeight: '1.4', margin: 0 }}>
                          {machine.troubleshoot[troubleIdx].desc}
                        </p>
                      </div>

                      <span style={{ fontSize: '11px', color: '#666666', fontWeight: '700' }}>Select Corrective Mitigation:</span>

                      {machine.troubleshoot[troubleIdx].options.map(opt => {
                        const isChosen = selectedOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedOptionId(opt.id);
                              const isCorrect = opt.isCorrect ?? (opt.id === machine.troubleshoot[troubleIdx].correctOptionId);
                              setTroublePassed(isCorrect);
                              if (isCorrect) {
                                setTroubleFeedback(`✓ Correct! ${opt.explanation || "Root cause identified and corrective procedure executed according to ISO standards."}`);
                                onUpdateUser?.({ ...user, xp: (user?.xp || 0) + 25 });
                              } else {
                                setTroubleFeedback(`✗ Suboptimal response: ${opt.explanation || "This action does not address the underlying mechanical root cause. Review machine parameters."}`);
                              }
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid ' + (isChosen ? (troublePassed ? '#10B981' : '#0077B6') : '#BAE6FD'),
                              background: isChosen ? (troublePassed ? 'rgba(16, 185, 129, 0.12)' : 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(2, 62, 138, 0.18) 100%)') : '#FFFFFF',
                              color: '#1F1F1F',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: isChosen ? '0 0 12px rgba(0, 119, 182, 0.2)' : 'none'
                            }}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'inspect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F1F1F', margin: 0 }}>METROLOGY INSPECT</h3>
                    <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      ISO 1101
                    </span>
                  </div>

                  {/* Feature Selector Tabs */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Object.keys(INSPECT_FEATURES).map((fKey) => {
                      const feat = INSPECT_FEATURES[fKey];
                      const isSel = inspectFeature === fKey;
                      return (
                        <button
                          key={fKey}
                          onClick={() => {
                            setInspectFeature(fKey);
                            setCaliperVal(feat.nominal + 0.012);
                            setInspectFeedback('');
                            setInspectSuccess(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 4px',
                            borderRadius: '6px',
                            border: isSel ? '1px solid #0077B6' : '1px solid #BAE6FD',
                            background: isSel ? 'rgba(0,119,182,0.15)' : '#FFFFFF',
                            color: isSel ? '#023E8A' : '#666666',
                            fontSize: '10.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          {feat.label.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Digital Caliper HUD */}
                  <div className="metrology-workstation">
                    <div className="caliper-lcd-panel">
                      <div className="caliper-lcd-readout">
                        {caliperVal.toFixed(3)}
                      </div>
                      <div className="caliper-lcd-unit">
                        MM DIGITAL
                      </div>
                    </div>

                    {/* Fine Probe Slider */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666666' }}>
                        <span>Micro Probe Adjustment:</span>
                        <strong style={{ color: '#023E8A' }}>
                          {(caliperVal - INSPECT_FEATURES[inspectFeature].nominal >= 0 ? '+' : '')}
                          {(caliperVal - INSPECT_FEATURES[inspectFeature].nominal).toFixed(3)} mm
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={INSPECT_FEATURES[inspectFeature].nominal - 0.060}
                        max={INSPECT_FEATURES[inspectFeature].nominal + 0.060}
                        step={0.002}
                        value={caliperVal}
                        onChange={(e) => setCaliperVal(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                      />
                    </div>

                    {/* Tolerance Visual Bar (USL / Nominal / LSL) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#6B7280', fontWeight: '700' }}>
                        <span>LSL: {INSPECT_FEATURES[inspectFeature].lsl.toFixed(3)}</span>
                        <span style={{ color: '#023E8A' }}>NOMINAL: {INSPECT_FEATURES[inspectFeature].nominal.toFixed(3)}</span>
                        <span>USL: {INSPECT_FEATURES[inspectFeature].usl.toFixed(3)}</span>
                      </div>
                      <div className="tolerance-track">
                        <div className="tolerance-zone-lsl" />
                        <div className="tolerance-zone-pass">TOLERANCE ±{INSPECT_FEATURES[inspectFeature].tol}</div>
                        <div className="tolerance-zone-usl" />
                        {(() => {
                          const curFeat = INSPECT_FEATURES[inspectFeature];
                          const totalSpan = curFeat.tol * 4;
                          const ratio = 0.5 + (caliperVal - curFeat.nominal) / totalSpan;
                          const clampedPercent = Math.max(2, Math.min(98, ratio * 100));
                          return <div className="tolerance-pointer" style={{ left: `${clampedPercent}%` }} />;
                        })()}
                      </div>
                    </div>

                    {/* Pass / Fail Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#666666' }}>GO / NO-GO Status:</span>
                      {Math.abs(caliperVal - INSPECT_FEATURES[inspectFeature].nominal) <= INSPECT_FEATURES[inspectFeature].tol ? (
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#059669', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✓ GO (WITHIN TOLERANCE)
                        </span>
                      ) : (
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#DC2626', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                          ✗ NO-GO (OUT OF SPEC)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const curFeat = INSPECT_FEATURES[inspectFeature];
                      const diff = Math.abs(caliperVal - curFeat.nominal);
                      if (diff <= curFeat.tol) {
                        setInspectSuccess(true);
                        setInspectFeedback(`✓ Inspection Verified: ${curFeat.label} is ${caliperVal.toFixed(3)} mm (deviation: ${(caliperVal - curFeat.nominal > 0 ? '+' : '')}${(caliperVal - curFeat.nominal).toFixed(3)} mm). Quality Standard ISO 1101 Passed.`);
                        onUpdateUser?.({ ...user, xp: (user?.xp || 0) + 35 });
                      } else {
                        setInspectSuccess(false);
                        setInspectFeedback(`✗ Out of Tolerance: Measured ${caliperVal.toFixed(3)} mm exceeds upper/lower spec limit by ${(diff - curFeat.tol).toFixed(3)} mm. Rework or calibration required.`);
                      }
                    }}
                    className="space-btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '11.5px' }}
                  >
                    Verify & Log Metrology
                  </button>
                </div>
              )}

              {activeSubTab === 'scorecard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F1F1F', margin: 0 }}>COMPETENCY PROFILE</h3>
                    <span style={{ fontSize: '10px', background: 'rgba(0,119,182,0.1)', color: '#0077B6', padding: '3px 8px', borderRadius: '12px', fontWeight: '800' }}>
                      LEVEL {user?.level || 4}
                    </span>
                  </div>

                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#023E8A' }}>{user?.name || 'Candidate Engineer'}</div>
                        <div style={{ fontSize: '10.5px', color: '#666666' }}>ID: {user?.studentId || 'MECH-2026-01'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0077B6' }}>96%</div>
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#059669', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                          GRADE A+
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #BAE6FD', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666666' }}>Workshop Station:</span>
                        <strong style={{ color: '#1F1F1F' }}>{machine.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666666' }}>Operations Mastered:</span>
                        <strong style={{ color: '#023E8A' }}>{operationHistory.length} of {machineOperations.length} Complete</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666666' }}>Total Workshop XP:</span>
                        <strong style={{ color: '#059669' }}>{user?.xp || 2850} XP</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCertModal(true)}
                    className="space-btn-primary"
                    style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Award size={16} />
                    <span>View Official Certificate</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* COLUMN 2: 3D WORKPLANE VIEWPORT */}
        <div className="cockpit-col-2">
          
          <ThreeVisualizer
            machineId={selectedId}
            selectedPartId={selectedPartId}
            focusedPartId={focusedPartId}
            onPartSelect={handlePartSelect}
            isExploded={isExploded}
            isCutaway={isCutaway}
            isPlaying={isOpRunning}
            simStep={1}
            simParams={simParams}
            activeSubTab={activeSubTab}
            assembledParts={assembledParts}
            cameraMode={cameraMode}
            setCameraMode={setCameraMode}
            showLabels={showLabels}
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
          />

          {/* Validation / Educational Feedback Alert */}
          {validationAlert && (
            <div style={{
              position: 'absolute',
              top: '70px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#FFFFFF',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '12px 18px',
              zIndex: 120,
              maxWidth: '480px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              color: '#1F1F1F'
            }}>
              <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--danger)' }}>{validationAlert.title}</div>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '2px', lineHeight: '1.4' }}>{validationAlert.message}</div>
              </div>
              <button 
                onClick={() => setValidationAlert(null)}
                style={{ background: 'transparent', border: 'none', color: '#666666', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Floating Workpiece Operations Panel */}
          {isWorkpieceComponent(selectedPartId, selectedId) && (
            <div className="floating-workpiece-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: '#023E8A', fontFamily: 'var(--mono-font)' }}>
                  {machine.name.toUpperCase()} WORKPIECE
                </strong>
                <button
                  onClick={() => setSelectedPartId(null)}
                  style={{ background: 'transparent', border: 'none', color: '#666666', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✕
                </button>
              </div>

              {operationState === 'RUNNING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#1F1F1F' }}>
                    <span>Machining {activeOperation?.name}...</span>
                    <span style={{ fontWeight: '700', color: '#023E8A' }}>{operationProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#E0F2FE', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${operationProgress}%`, background: 'linear-gradient(90deg, #0077B6, #0096C7)', transition: 'width 0.1s' }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={handlePauseResumeOperation}
                      style={{ flex: 1, padding: '6px', background: '#FFFFFF', border: '1px solid #BAE6FD', borderRadius: '4px', color: '#1F1F1F', cursor: 'pointer', fontSize: '10.5px', fontWeight: '700' }}
                    >
                      {isOpRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button
                      onClick={handleAbortOperation}
                      style={{ flex: 1, padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--danger)', cursor: 'pointer', fontSize: '10.5px', fontWeight: '700' }}
                    >
                      ABORT
                    </button>
                  </div>
                </div>
              )}

              {operationState === 'COMPLETED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--success)', color: '#059669', padding: '10px', borderRadius: '6px', fontSize: '11px', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: '800', marginBottom: '2px' }}>✓ {activeOperation?.name.toUpperCase()} COMPLETED!</div>
                    <div style={{ color: '#1F1F1F', fontSize: '10.5px' }}>{activeOperation?.educationalExplanation}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={toggleBeforeAfter}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        background: '#FFFFFF',
                        border: '1px solid #BAE6FD',
                        borderRadius: '4px',
                        color: '#1F1F1F',
                        fontWeight: '700',
                        fontSize: '10.5px',
                        cursor: 'pointer'
                      }}
                    >
                      3D {beforeAfterMode === 'after' ? 'BEFORE' : 'AFTER'}
                    </button>
                    <button
                      onClick={handleResetOperation}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(0, 119, 182, 0.12)',
                        border: '1px solid #0077B6',
                        borderRadius: '4px',
                        color: '#023E8A',
                        fontWeight: '700',
                        fontSize: '10.5px',
                        cursor: 'pointer'
                      }}
                    >
                      RESET
                    </button>
                  </div>
                </div>
              )}

              {(operationState === 'IDLE' || operationState === 'SETUP' || operationState === 'SELECT_OPERATION') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#666666' }}>Select operation to run:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                    {machineOperations.map(op => (
                      <button
                        key={op.id}
                        onClick={() => handleSelectOperation(op)}
                        style={{
                          padding: '6px 10px',
                          background: activeOperation?.id === op.id ? 'rgba(0, 119, 182, 0.15)' : '#FFFFFF',
                          border: '1px solid ' + (activeOperation?.id === op.id ? '#0077B6' : '#BAE6FD'),
                          borderRadius: '4px',
                          color: '#1F1F1F',
                          fontSize: '11px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        {op.name}
                      </button>
                    ))}
                  </div>
                  {activeOperation && (
                    <button
                      onClick={handleStartOperationSim}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'linear-gradient(135deg, #0096C7 0%, #0077B6 100%)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '800',
                        fontSize: '11px',
                        cursor: 'pointer',
                        marginTop: '4px',
                        boxShadow: '0 2px 10px rgba(0, 119, 182, 0.25)'
                      }}
                    >
                      START {activeOperation.name.toUpperCase()}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Viewport Top Right Camera / View Toggles */}
          <div className="viewport-camera-toggles">
            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsExploded(!isExploded)}
                style={{
                  background: isExploded ? 'rgba(0, 119, 182, 0.15)' : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid ' + (isExploded ? '#0077B6' : '#BAE6FD'),
                  color: isExploded ? '#023E8A' : '#1F1F1F',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                }}
              >
                EXPLODED VIEW
              </button>
              <button
                onClick={() => setIsCutaway(!isCutaway)}
                style={{
                  background: isCutaway ? 'rgba(0, 119, 182, 0.15)' : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid ' + (isCutaway ? '#0077B6' : '#BAE6FD'),
                  color: isCutaway ? '#023E8A' : '#1F1F1F',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                }}
              >
                CUTAWAY VIEW
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              {[
                { id: 'default', label: '3D DEFAULT' },
                { id: 'close_up', label: 'CLOSE-UP' },
                { id: 'top_view', label: 'TOP PLAN' }
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setCameraMode(cam.id)}
                  style={{
                    background: cameraMode === cam.id ? 'rgba(0, 119, 182, 0.15)' : 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid ' + (cameraMode === cam.id ? '#0077B6' : '#BAE6FD'),
                    color: cameraMode === cam.id ? '#023E8A' : '#666666',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '10px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMN 3: STATUS / ASSESSMENT / METROLOGY INSPECTOR */}
        <div className="cockpit-col-3">
          {activeSubTab === 'operate' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              
              {/* Right Sidebar Tab Switcher */}
              <div style={{ display: 'flex', borderBottom: '1px solid #BAE6FD', paddingBottom: '4px', gap: '8px' }}>
                {['tools', 'telemetry', 'assessment'].map(tabId => (
                  <button
                    key={tabId}
                    onClick={() => setActiveRightTab(tabId)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeRightTab === tabId ? '2px solid #0077B6' : '2px solid transparent',
                      color: activeRightTab === tabId ? '#023E8A' : '#666666',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tabId}
                  </button>
                ))}
              </div>

              {/* Tools Tab */}
              {activeRightTab === 'tools' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Available Machine Tool Bits</span>
                  {(MACHINE_TOOLS[selectedId] || ['Turning Tool']).map(t => {
                    const isSelected = selectedTool === t;
                    return (
                      <div
                        key={t}
                        onClick={() => setSelectedTool(t)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '11px 14px',
                          background: isSelected ? 'linear-gradient(135deg, rgba(0, 119, 182, 0.15) 0%, rgba(255, 122, 0, 0.25) 100%)' : '#FFFFFF',
                          border: '1px solid ' + (isSelected ? '#0077B6' : '#BAE6FD'),
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 10px rgba(0, 119, 182, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <Settings size={15} style={{ color: isSelected ? '#023E8A' : '#666666' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#023E8A' : '#1F1F1F' }}>
                          {t}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Telemetry Tab */}
              {activeRightTab === 'telemetry' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Kinematic Diagnostics</span>
                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666666' }}>Power State:</span>
                      <strong style={{ color: isPowerOn ? '#059669' : '#666666' }}>{isPowerOn ? 'ACTIVE (RUN)' : 'STANDBY'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666666' }}>Spindle Axis:</span>
                      <strong style={{ color: '#1F1F1F' }}>{spindleDirection}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666666' }}>Speed:</span>
                      <strong style={{ color: '#023E8A' }}>{simParams.speed} RPM</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666666' }}>Feed:</span>
                      <strong style={{ color: '#0096C7' }}>{simParams.feed} mm/rev</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666666' }}>Depth of Cut:</span>
                      <strong style={{ color: '#1F1F1F' }}>{simParams.doc} mm</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Tab */}
              {activeRightTab === 'assessment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Operation Assessment</span>
                  {assessmentResult ? (
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #BAE6FD', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#023E8A' }}>OVERALL SCORE</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#0077B6' }}>{assessmentResult.overallScore}%</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#666666' }}>Safety Compliance:</span>
                        <strong style={{ color: '#059669' }}>{assessmentResult.safetyScore}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#666666' }}>Setup Accuracy:</span>
                        <strong style={{ color: '#023E8A' }}>{assessmentResult.setupScore}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#666666' }}>Execution Quality:</span>
                        <strong style={{ color: '#1F1F1F' }}>{assessmentResult.executionScore}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#666666' }}>Tolerance Accuracy:</span>
                        <strong style={{ color: '#023E8A' }}>{assessmentResult.accuracyScore}%</strong>
                      </div>

                      <div style={{ borderTop: '1px solid #BAE6FD', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#666666' }}>Workshop XP Earned:</span>
                        <strong style={{ color: '#059669' }}>+{assessmentResult.xpAwarded} XP</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', fontSize: '12px', color: '#666666', lineHeight: '1.5' }}>
                      Run a 3D operation to receive real-time automated assessment scores, parameter feedback, and Workshop XP.
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            // OUTPUT PANELS FOR THE OTHER 8 SUB-TABS
            <>
              {activeSubTab === 'explorer' && (
                <div className="dark-inspector-container">
                  <div className="dark-inspector-header">
                    <div className="dark-inspector-title">
                      <Layers size={16} style={{ color: '#0077B6' }} />
                      <span>Component Inspector</span>
                    </div>
                    <span className="dark-inspector-badge">{machine.parts.length} Components</span>
                  </div>

                  {/* Active Selected Component Card */}
                  {activePart && (
                    <div className="dark-inspector-card">
                      <div className="dark-inspector-card-tag">Selected Component</div>
                      <div className="dark-inspector-card-name">{activePart.name}</div>
                      <p className="dark-inspector-card-desc">{activePart.desc}</p>
                    </div>
                  )}

                  {/* Scrollable Component List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#023E8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        All Machine Components
                      </span>
                      <span style={{ fontSize: '11px', color: '#0096C7' }}>Click to inspect in 3D</span>
                    </div>

                    <div className="dark-inspector-list">
                      {machine.parts.map((p) => {
                        const isSelected = (selectedPartId === p.id) || (!selectedPartId && activePart?.id === p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => handlePartSelect(p.id)}
                            className={`dark-inspector-item ${isSelected ? 'selected' : ''}`}
                          >
                            <span>{p.name}</span>
                            <span className="dark-inspector-item-badge">
                              {isSelected ? '● ACTIVE' : '○ INSPECT'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'identify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Diagnostics Response</span>
                  {identifyFeedback && (
                    <div style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: identifySuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid ' + (identifySuccess ? '#059669' : 'var(--danger)'),
                      color: identifySuccess ? '#059669' : '#DC2626',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      fontWeight: '600'
                    }}>
                      {identifyFeedback}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'safety' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Safety Compliance Check</span>
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: safetyPassed ? 'rgba(16, 185, 129, 0.12)' : '#F0F9FF',
                    border: '1px solid ' + (safetyPassed ? '#059669' : '#BAE6FD'),
                    color: safetyPassed ? '#059669' : '#666666',
                    fontSize: '13px',
                    lineHeight: '1.5'
                  }}>
                    {safetyFeedback || "Review and equip appropriate safety PPE gear before starting machine operations."}
                  </div>
                </div>
              )}

              {activeSubTab === 'setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Setup Status</span>
                  <div style={{ padding: '14px', background: setupPassed ? 'rgba(16, 185, 129, 0.12)' : '#F0F9FF', border: '1px solid ' + (setupPassed ? '#059669' : '#BAE6FD'), color: setupPassed ? '#059669' : '#666666', borderRadius: '10px', fontSize: '13px' }}>
                    {setupPassed ? "✓ Workpiece stock and tool clamped. Ready for simulation." : "Clamp stock and tools to initiate setup assembly."}
                  </div>
                </div>
              )}

              {activeSubTab === 'troubleshooting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Diagnostic Case Audit</span>
                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>Active Machine:</span>
                      <strong style={{ color: '#1F1F1F' }}>{machine.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>Diagnosis Status:</span>
                      <strong style={{ color: troublePassed ? '#059669' : '#D97706' }}>
                        {troublePassed ? '✓ RESOLVED' : 'IN DIAGNOSIS'}
                      </strong>
                    </div>
                  </div>

                  {troubleFeedback && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: troublePassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid ' + (troublePassed ? '#059669' : '#EF4444'),
                      color: troublePassed ? '#059669' : '#DC2626',
                      fontSize: '11.5px',
                      lineHeight: '1.4',
                      fontWeight: '600'
                    }}>
                      {troubleFeedback}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'experiments' && (() => {
                const mat = WORKPIECE_MATERIALS[expMaterial] || WORKPIECE_MATERIALS['Mild Steel'];
                const Vc = (Math.PI * 50 * simParams.speed) / 1000;
                const MRR = (Vc * 1000 * simParams.feed * simParams.doc) / 1000;
                const Fc = mat.kc * simParams.doc * simParams.feed;
                const Pc = (Fc * Vc) / 60000;
                const Ra = ((simParams.feed * simParams.feed) / (32 * expNoseRadius)) * 1000;
                const estTemp = Math.min(850, 25 + Math.round(180 * Math.pow(Vc / 100, 0.45) * Math.pow(simParams.feed / 0.1, 0.25) * Math.pow(simParams.doc / 1.0, 0.15) * Math.pow(mat.kc / 1000, 0.3)));
                const isOverload = Pc > 3.7;
                const isThermalWear = estTemp > mat.maxTemp;

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <span className="telemetry-label" style={{ color: '#023E8A' }}>Machining Physics & Load</span>

                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Cutting Speed (Vc):</span>
                        <strong style={{ color: '#023E8A' }}>{Vc.toFixed(1)} m/min</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Specific Resistance (kc):</span>
                        <strong style={{ color: '#1F1F1F' }}>{mat.kc} N/mm²</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Tangential Cutting Force (Fc):</span>
                        <strong style={{ color: '#0077B6' }}>{Fc.toFixed(0)} N</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Cutting Power Demand (Pc):</span>
                        <strong style={{ color: isOverload ? '#DC2626' : '#059669' }}>{Pc.toFixed(2)} kW / 3.7 kW</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Material Removal Rate:</span>
                        <strong style={{ color: '#023E8A' }}>{MRR.toFixed(1)} cm³/min</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Surface Finish (Ra):</span>
                        <strong style={{ color: '#023E8A' }}>{Ra.toFixed(2)} µm</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Interface Temp:</span>
                        <strong style={{ color: isThermalWear ? '#DC2626' : '#0096C7' }}>{estTemp} °C</strong>
                      </div>
                    </div>

                    {(isOverload || isThermalWear) && (
                      <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '11px', color: '#DC2626', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <span>
                          {isOverload ? '⚠️ Motor Overload: Power demand exceeds 3.7 kW motor capacity.' : '⚠️ Thermal Alert: Interface temperature exceeds workpiece softening threshold.'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeSubTab === 'inspect' && (() => {
                const curFeat = INSPECT_FEATURES[inspectFeature];
                const dev = caliperVal - curFeat.nominal;
                const isPass = Math.abs(dev) <= curFeat.tol;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <span className="telemetry-label" style={{ color: '#023E8A' }}>Metrology QC Certificate</span>
                    <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Feature Name:</span>
                        <strong style={{ color: '#023E8A' }}>{curFeat.label}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Nominal Drawing Spec:</span>
                        <strong style={{ color: '#1F1F1F' }}>{curFeat.nominal.toFixed(3)} mm</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Measured Dimension:</span>
                        <strong style={{ color: '#0077B6' }}>{caliperVal.toFixed(3)} mm</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Deviation (Δ):</span>
                        <strong style={{ color: isPass ? '#059669' : '#DC2626' }}>
                          {(dev >= 0 ? '+' : '')}{dev.toFixed(3)} mm
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: '#666666' }}>Surface Roughness (Ra):</span>
                        <strong style={{ color: '#023E8A' }}>1.25 µm (N7 Finish)</strong>
                      </div>
                      <div style={{ borderTop: '1px solid #BAE6FD', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#666666' }}>QC Acceptance:</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: isPass ? '#059669' : '#DC2626' }}>
                          {isPass ? '✓ ISO 1101 ACCEPTED' : '✗ OUT OF SPEC (REJECT)'}
                        </span>
                      </div>
                    </div>

                    {inspectFeedback && (
                      <div style={{ padding: '12px', borderRadius: '8px', background: inspectSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: '1px solid ' + (inspectSuccess ? '#059669' : '#EF4444'), color: inspectSuccess ? '#059669' : '#DC2626', fontSize: '11.5px', lineHeight: '1.4', fontWeight: '600' }}>
                        {inspectFeedback}
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeSubTab === 'scorecard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span className="telemetry-label" style={{ color: '#023E8A' }}>Competency Audit Breakdown</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '14px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>Safety & PPE Protocol:</span>
                      <strong style={{ color: '#059669' }}>100% (Passed)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>Fixture & Clamping Setup:</span>
                      <strong style={{ color: '#059669' }}>100% (Passed)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>3D Operations Completed:</span>
                      <strong style={{ color: '#023E8A' }}>{operationHistory.length} / {machineOperations.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>Dimensional Metrology:</span>
                      <strong style={{ color: '#023E8A' }}>98.6% Accuracy</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: '#666666' }}>Diagnostic Troubleshooting:</span>
                      <strong style={{ color: '#059669' }}>Certified</strong>
                    </div>
                    <div style={{ borderTop: '1px solid #BAE6FD', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#666666', fontWeight: '700' }}>Overall Competency:</span>
                      <strong style={{ color: '#0077B6', fontSize: '14px' }}>96% (Grade A+)</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Official Certificate of Competency Modal */}
      {showCertModal && (
        <div className="cert-modal-backdrop" onClick={() => setShowCertModal(false)}>
          <div className="cert-modal-paper" onClick={(e) => e.stopPropagation()}>
            <div className="cert-ornate-border">
              <div className="cert-corner-accent top-left" />
              <div className="cert-corner-accent top-right" />
              <div className="cert-corner-accent bottom-left" />
              <div className="cert-corner-accent bottom-right" />

              <div className="cert-header">
                <span className="cert-authority">National Board of Technical & Industrial Engineering</span>
                <h2 className="cert-title">Certificate of Competency</h2>
                <span className="cert-subtitle">Virtual Mechanical Workshop & Digital Twin Laboratory</span>
              </div>

              <div className="cert-body">
                <p style={{ fontSize: '13px', color: '#4B5563', margin: 0 }}>This is proudly conferred upon</p>
                <div className="cert-candidate-name">{user?.name || 'Candidate Engineer'}</div>
                <p className="cert-award-statement">
                  For demonstrating outstanding practical mastery, strict compliance with industrial safety standards (ISO 45001), 
                  and dimensional precision in operating the <strong>{machine.name}</strong> digital twin.
                </p>

                <div className="cert-skills-pills">
                  <span className="cert-skill-pill">✓ Spindle Kinematics</span>
                  <span className="cert-skill-pill">✓ Clamping & Fixture Alignment</span>
                  <span className="cert-skill-pill">✓ Metrology Verification (±0.025 mm)</span>
                  <span className="cert-skill-pill">✓ Diagnostic Troubleshooting</span>
                  <span className="cert-skill-pill">✓ Grade A+ Distinction (96%)</span>
                </div>
              </div>

              <div className="cert-footer">
                <div className="cert-signature-box">
                  <span style={{ fontFamily: 'var(--mono-font)', fontSize: '11px', color: '#6B7280' }}>
                    CREDENTIAL ID: MECH-{machine.id.toUpperCase()}-2026-0842
                  </span>
                  <span style={{ fontSize: '10px', color: '#9CA3AF' }}>DIGITALLY VERIFIED VIA WORKSHOP ENGINE</span>
                </div>

                <div className="cert-seal-stamp">
                  <span>OFFICIAL</span>
                  <span style={{ fontSize: '10px' }}>★ MECH ★</span>
                  <span>SEAL</span>
                </div>

                <div className="cert-signature-box">
                  <div className="cert-signature-line" />
                  <span className="cert-signature-label">Director of Technical Training</span>
                </div>
              </div>
            </div>

            <div className="cert-actions-bar">
              <button
                onClick={() => window.print()}
                className="space-btn-primary"
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Printer size={15} />
                <span>PRINT / SAVE PDF</span>
              </button>
              <button
                onClick={() => setShowCertModal(false)}
                className="space-btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
