import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Play, 
  Pause, 
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
  Flame,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { MACHINES } from '../data/machines';
import ThreeVisualizer from './ThreeVisualizer';
import { SIMULATION_OPERATIONS } from '../simulation/simulationConfig';
import { SafetyEngine } from '../simulation/safetyEngine';
import { AssessmentEngine } from '../simulation/assessmentEngine';

export default function MachineCockpit({ user, onUpdateUser, initialMachineId, showLabels, highContrast }) {
  const [selectedId, setSelectedId] = useState(initialMachineId || 'lathe');
  const [activeSubTab, setActiveSubTab] = useState('explorer');
  const machine = MACHINES[selectedId];

  // Operations and State Machine
  const [activeOperation, setActiveOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationState, setOperationState] = useState('IDLE'); // IDLE, SELECT_COMPONENT, SELECT_OPERATION, SETUP, SAFETY_CHECK, READY, RUNNING, COMPLETED, ASSESSMENT
  const [operationHistory, setOperationHistory] = useState([]);
  const [practiceMode, setPracticeMode] = useState(true);
  const [beforeAfterMode, setBeforeAfterMode] = useState('after');
  const [isOpRunning, setIsOpRunning] = useState(false);
  const [focusedOpIdx, setFocusedOpIdx] = useState(0);

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
  const [safetyReport, setSafetyReport] = useState(null);

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
  const [simElapsedTime, setSimElapsedTime] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [validationAlert, setValidationAlert] = useState(null);

  // Part selection & camera
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [focusedPartId, setFocusedPartId] = useState(null);
  const [isExploded, setIsExploded] = useState(false);
  const [isCutaway, setIsCutaway] = useState(false);
  const [cameraMode, setCameraMode] = useState('default');
  const [toolPosition, setToolPosition] = useState({ x: 0, y: 0, z: 0 });

  // Right sidebar tab (in operate mode)
  const [activeRightTab, setActiveRightTab] = useState('tools');
  const [selectedTool, setSelectedTool] = useState('Turning Tool');
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [spindleDirection, setSpindleDirection] = useState('Clockwise');
  const [chuckStatus, setChuckStatus] = useState('Closed');

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
  const [assemblyFeedback, setAssemblyFeedback] = useState('');
  const [assemblyComplete, setAssemblyComplete] = useState(false);

  const [expVariables, setExpVariables] = useState({});

  const MACHINE_TOOLS = {
    lathe: ['Facing Tool', 'Turning Tool', 'Parting Tool', 'Threading Tool', 'Boring Bar', 'Twist Drill Bit', 'Knurling Tool', 'Form Tool', 'Chamfer Tool'],
    welding: ['SMAW Electrode', 'GTAW Torch', 'GMAW Gun', 'FCAW Torch'],
    shaper: ['Shaper Tool Bit', 'Slotting Tool Bit', 'Keyway Tool Bit'],
    planer: ['Planing Tool Bit', 'Broad-Nosed Tool', 'Grooving Tool'],
    milling: ['Face Mill', 'End Mill', 'Slab Mill', 'T-Slot Cutter', 'Ball-Nose End Mill'],
    casting: ['Graphite Crucible', 'Steel Ladle', 'Bottom Pour Ladle'],
    moulding: ['Hand Rammer', 'Pattern Lifter', 'Vent Wire', 'Sand Shovel']
  };

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
  }, [initialMachineId]);

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
    setPracticeMode(true);
    setBeforeAfterMode('after');
    setIsOpRunning(false);
    setFocusedOpIdx(0);
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
    if (machine?.parts && machine.parts.length > 0) {
      const idx = Math.floor(Math.random() * machine.parts.length);
      setIdentifyTargetPart(machine.parts[idx]);
    }
    setIdentifySuccess(false);
    setIdentifyFeedback('');
    setInspectFeedback('');
    setInspectSuccess(false);
    setToolPosition({ x: 0, y: 0, z: 0 });
    setAssembledParts([]);
    setAssemblyComplete(false);
    setTroubleIdx(0);
    setSelectedOptionId('');
    setTroubleFeedback('');
    setTroublePassed(false);
  }, [selectedId]);

  // Identify sub-tab validation
  useEffect(() => {
    if (activeSubTab === 'identify' && selectedPartId && identifyTargetPart) {
      if (selectedPartId === identifyTargetPart.id) {
        setIdentifySuccess(true);
        setIdentifyFeedback(`✓ Correct! You identified the [ ${identifyTargetPart.name} ] component.`);
        if (user && onUpdateUser) {
          onUpdateUser({ ...user, xp: user.xp + 50 });
        }
      } else {
        setIdentifyFeedback(`✗ Try Again: That is the [ ${machine.parts.find(p=>p.id===selectedPartId)?.name || 'other'} ] component.`);
      }
    }
  }, [selectedPartId, activeSubTab]);

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

  const handlePartSelect = (partId) => {
    setSelectedPartId(partId);
    setValidationAlert(null);
    if (partId && !activeOperation) {
      setOperationState('SELECT_OPERATION');
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

            const elapsedSec = Math.max(8, Math.round((Date.now() - (simStartTime || Date.now())) / 1000));
            setSimElapsedTime(elapsedSec);

            // Calculate assessment score
            const currentSafety = SafetyEngine.validateSafety({
              machineId: selectedId,
              operation: activeOperation,
              selectedPartId,
              selectedTool,
              safetyItems,
              setupChecklist,
              simParams
            });

            const assessment = AssessmentEngine.calculateAssessment({
              machineId: selectedId,
              operation: activeOperation,
              safetyReport: currentSafety,
              setupChecklist,
              simParams,
              elapsedSeconds: elapsedSec,
              attempts: 1,
              errorCount: currentSafety.warnings.length
            });

            setAssessmentResult(assessment);

            // Record completed operation and update XP
            if (activeOperation && !operationHistory.includes(activeOperation.id)) {
              setOperationHistory(prev => [...prev, activeOperation.id]);
            }

            if (user && onUpdateUser) {
              onUpdateUser({
                ...user,
                xp: user.xp + assessment.xpAwarded,
                completedMissions: (user.completedMissions || 0) + 1
              });
            }

            return 100;
          }
          return p + 4;
        });
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isOpRunning, operationState, simStartTime]);

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
  useEffect(() => {
    const handleKeydown = (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isTyping) return;

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
        setActiveSubTab(keysMap[e.key]);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleAbortOperation();
        return;
      }

      if (e.key === ' ' && activeSubTab === 'operate') {
        e.preventDefault();
        if (operationState === 'RUNNING') {
          handlePauseResumeOperation();
        } else if (operationState === 'SETUP' || operationState === 'READY' || operationState === 'IDLE') {
          if (!activeOperation && machineOperations.length > 0) {
            handleSelectOperation(machineOperations[0]);
          } else {
            handleStartOperationSim();
          }
        }
      }

      if ((e.key === 'r' || e.key === 'R') && (operationState === 'COMPLETED' || operationState === 'RUNNING')) {
        e.preventDefault();
        handleResetOperation();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeSubTab, operationState, activeOperation, selectedId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* 1. Category Switcher (1-7 machines) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '10px 24px', 
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
          background: 'rgba(22, 6, 54, 0.95)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {Object.values(MACHINES).map((m) => {
          const isSelected = selectedId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: isSelected ? '1px solid #FF5376' : '1px solid rgba(168, 85, 247, 0.25)',
                background: isSelected ? 'var(--brand-gradient)' : 'rgba(35, 12, 75, 0.5)',
                color: isSelected ? '#FFFFFF' : '#D8B4FE',
                fontWeight: '700',
                textTransform: 'uppercase',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
                boxShadow: isSelected ? '0 0 15px rgba(255, 83, 118, 0.4)' : 'none'
              }}
            >
              {m.name.replace(' Machine', '').replace(' Station', '').replace(' Furnace', '').replace(' Bay', '')}
            </button>
          );
        })}
      </div>

      {/* 2. 9-Stage Learning Navigation Subtabs */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '8px 24px', 
          background: 'rgba(13, 2, 33, 0.95)',
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none'
        }}
      >
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
                border: isActive ? '1px solid #FF5376' : '1px solid rgba(168, 85, 247, 0.2)',
                background: isActive ? 'var(--brand-gradient)' : 'rgba(35, 12, 75, 0.4)',
                color: isActive ? '#FFFFFF' : '#D8B4FE',
                fontWeight: '600',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: isActive ? '0 0 15px rgba(255, 83, 118, 0.35)' : 'none'
              }}
            >
              <Icon size={12} style={{ color: isActive ? '#FFFFFF' : '#00F5D4' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Split Viewport */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '330px 1fr 340px', height: 'calc(100% - 92px)', overflow: 'hidden' }}>
        
        {/* COLUMN 1: OPERATIONS & CONTROLS */}
        <div 
          style={{ 
            borderRight: '1px solid rgba(168, 85, 247, 0.2)', 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '18px',
            background: 'rgba(18, 5, 45, 0.9)',
            backdropFilter: 'blur(16px)',
            overflowY: 'auto'
          }}
        >
          {activeSubTab === 'operate' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {machine.name.toUpperCase()}
                </h3>
                {isPowerOn ? (
                  <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '700', letterSpacing: '0.5px' }}>● POWER ON</span>
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>○ STANDBY</span>
                )}
              </div>

              {/* Machine Operations Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="telemetry-label">Select 3D Operation</span>
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
                          border: '1px solid ' + (isSelected ? '#FF5376' : isDone ? 'var(--accent-cyan)' : 'rgba(168, 85, 247, 0.25)'),
                          background: isSelected ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.3) 0%, rgba(121, 40, 202, 0.5) 100%)' : isDone ? 'rgba(0, 245, 212, 0.1)' : 'rgba(35, 12, 75, 0.5)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 15px rgba(255, 83, 118, 0.3)' : 'none'
                        }}
                      >
                        <span>{idx + 1}. {op.name}</span>
                        {isDone && <CheckCircle2 size={14} style={{ color: 'var(--accent-cyan)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Operation Parameters */}
              {activeOperation && (
                <div style={{ background: 'rgba(35, 12, 75, 0.7)', border: '1px solid rgba(224, 64, 251, 0.3)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12px', color: '#FF5376', textTransform: 'uppercase' }}>{activeOperation.name} CONFIG</strong>
                    <span style={{ fontSize: '10px', color: '#D8B4FE' }}>{activeOperation.targetPart}</span>
                  </div>

                  {/* Speed Parameter */}
                  {activeOperation.paramBounds?.speed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Speed / Power:</span>
                        <strong style={{ color: '#FFFFFF' }}>{simParams.speed} {activeOperation.paramBounds.speed.unit}</strong>
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
                        <strong style={{ color: '#FFFFFF' }}>{simParams.feed} {activeOperation.paramBounds.feed.unit}</strong>
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
                        <strong style={{ color: '#FFFFFF' }}>{simParams.doc} {activeOperation.paramBounds.doc.unit}</strong>
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
                        background: 'linear-gradient(135deg, rgba(255, 83, 118, 0.3) 0%, rgba(121, 40, 202, 0.5) 100%)',
                        border: '1px solid #FF5376',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 0 15px rgba(255, 83, 118, 0.3)'
                      }}
                    >
                      {isOpRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button
                      onClick={handleAbortOperation}
                      style={{
                        padding: '11px 18px',
                        background: 'rgba(255, 0, 85, 0.15)',
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
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>{machine.name}</h3>
                  <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#D8B4FE', lineHeight: '1.4' }}>"{machine.tagline}"</span>
                  <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.25)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="telemetry-label" style={{ color: '#00F5D4' }}>Operational Overview</span>
                    <p style={{ fontSize: '13px', color: '#F0EDE5', lineHeight: '1.5' }}>{machine.overview}</p>
                  </div>
                </div>
              )}

              {activeSubTab === 'identify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Part Challenge</h3>
                  {identifyTargetPart && (
                    <div style={{ padding: '14px', background: 'rgba(35, 12, 75, 0.7)', border: '1px solid rgba(224, 64, 251, 0.4)', borderRadius: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#F0EDE5', fontWeight: '600', lineHeight: '1.4' }}>
                        Click the component representing the <span style={{ color: '#00F5D4', textDecoration: 'underline', fontWeight: '700' }}>[ {identifyTargetPart.name} ]</span> in the 3D workplane.
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
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Safety Locker</h3>
                  <p style={{ fontSize: '12px', color: '#D8B4FE' }}>Configure safety gear parameters according to machine type.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(safetyItems).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSafetyToggle(key)}
                        style={{
                          padding: '12px 16px',
                          background: safetyItems[key] ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.25) 0%, rgba(121, 40, 202, 0.4) 100%)' : 'rgba(35, 12, 75, 0.4)',
                          border: '1px solid ' + (safetyItems[key] ? '#FF5376' : 'rgba(168, 85, 247, 0.2)'),
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: safetyItems[key] ? '0 0 15px rgba(255, 83, 118, 0.2)' : 'none'
                        }}
                      >
                        <span>{key.toUpperCase()}</span>
                        <span style={{ color: safetyItems[key] ? '#00F5D4' : '#9480B8', fontSize: '11px', fontWeight: '800' }}>
                          {safetyItems[key] ? '✓ EQUIPPED' : '○ NONE'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Clamping & Fixtures</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => toggleSetupChecklist('stockSecured')}
                      style={{
                        padding: '12px 16px',
                        background: setupChecklist.stockSecured ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.25) 0%, rgba(121, 40, 202, 0.4) 100%)' : 'rgba(35, 12, 75, 0.4)',
                        border: '1px solid ' + (setupChecklist.stockSecured ? '#FF5376' : 'rgba(168, 85, 247, 0.2)'),
                        color: '#FFFFFF', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>Mount Workpiece Stock</span>
                      <span style={{ color: setupChecklist.stockSecured ? '#00F5D4' : '#9480B8', fontSize: '11px', fontWeight: '800' }}>{setupChecklist.stockSecured ? '✓ CLAMPED' : '○ UNLOCKED'}</span>
                    </button>
                    <button
                      onClick={() => toggleSetupChecklist('toolClamped')}
                      style={{
                        padding: '12px 16px',
                        background: setupChecklist.toolClamped ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.25) 0%, rgba(121, 40, 202, 0.4) 100%)' : 'rgba(35, 12, 75, 0.4)',
                        border: '1px solid ' + (setupChecklist.toolClamped ? '#FF5376' : 'rgba(168, 85, 247, 0.2)'),
                        color: '#FFFFFF', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>Clamp Tool / Electrode</span>
                      <span style={{ color: setupChecklist.toolClamped ? '#00F5D4' : '#9480B8', fontSize: '11px', fontWeight: '800' }}>{setupChecklist.toolClamped ? '✓ SECURED' : '○ UNLOCKED'}</span>
                    </button>
                    <button
                      onClick={() => toggleSetupChecklist('safetyGuardAligned')}
                      style={{
                        padding: '12px 16px',
                        background: setupChecklist.safetyGuardAligned ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.25) 0%, rgba(121, 40, 202, 0.4) 100%)' : 'rgba(35, 12, 75, 0.4)',
                        border: '1px solid ' + (setupChecklist.safetyGuardAligned ? '#FF5376' : 'rgba(168, 85, 247, 0.2)'),
                        color: '#FFFFFF', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>Align Safety Shield</span>
                      <span style={{ color: setupChecklist.safetyGuardAligned ? '#00F5D4' : '#9480B8', fontSize: '11px', fontWeight: '800' }}>{setupChecklist.safetyGuardAligned ? '✓ ALIGNED' : '○ UNSET'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'experiments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Lab Variables</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#D8B4FE', fontWeight: '600' }}>Rotary / Linear Speed</span>
                      <input 
                        type="range" min={200} max={1500} defaultValue={simParams.speed}
                        onChange={(e) => setSimParams({ ...simParams, speed: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: '#FF5376' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#D8B4FE', fontWeight: '600' }}>Tool Feed Rate</span>
                      <input 
                        type="range" min={0.05} max={0.6} step={0.05} defaultValue={simParams.feed}
                        onChange={(e) => setSimParams({ ...simParams, feed: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: '#FF5376' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'troubleshooting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Defect Diagnostic</h3>
                  {machine.troubleshoot && machine.troubleshoot[troubleIdx] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <strong style={{ fontSize: '13px', color: '#00F5D4' }}>{machine.troubleshoot[troubleIdx].title}</strong>
                      <p style={{ fontSize: '12px', color: '#D8B4FE', lineHeight: '1.4' }}>{machine.troubleshoot[troubleIdx].desc}</p>
                      {machine.troubleshoot[troubleIdx].options.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedOptionId(opt.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid ' + (selectedOptionId === opt.id ? '#FF5376' : 'rgba(168, 85, 247, 0.25)'),
                            background: selectedOptionId === opt.id ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.25) 0%, rgba(121, 40, 202, 0.4) 100%)' : 'rgba(35, 12, 75, 0.5)',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '600',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: selectedOptionId === opt.id ? '0 0 15px rgba(255, 83, 118, 0.3)' : 'none'
                          }}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'inspect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Metrology Inspection</h3>
                  <p style={{ fontSize: '12px', color: '#D8B4FE', lineHeight: '1.4' }}>Measure machined workpiece tolerance dimensions using digital calipers and visual sensors.</p>
                  <button
                    onClick={() => {
                      setInspectSuccess(true);
                      setInspectFeedback("✓ Part tolerance verified! Dimensions within ±0.02 mm ISO accuracy standard.");
                    }}
                    className="space-btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    Run Metrology Scan
                  </button>
                </div>
              )}

              {activeSubTab === 'scorecard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Performance Overview</h3>
                  <p style={{ fontSize: '12px', color: '#D8B4FE', lineHeight: '1.4' }}>Real-time workshop assessment metrics based on simulation trials and safety compliance.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* COLUMN 2: 3D WORKPLANE VIEWPORT */}
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          
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
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--danger)',
              borderRadius: '6px',
              padding: '12px 18px',
              zIndex: 120,
              maxWidth: '480px',
              boxShadow: '0 0 20px rgba(198, 40, 40, 0.4)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              color: '#FFF'
            }}>
              <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--danger)' }}>{validationAlert.title}</div>
                <div style={{ fontSize: '11px', color: '#E2E8F0', marginTop: '2px', lineHeight: '1.4' }}>{validationAlert.message}</div>
              </div>
              <button 
                onClick={() => setValidationAlert(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Floating Workpiece Operations Panel */}
          {isWorkpieceComponent(selectedPartId, selectedId) && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '20px',
              width: '320px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--brand-primary)',
              borderRadius: '6px',
              padding: '16px',
              zIndex: 100,
              boxShadow: '0 0 20px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: '#FFF'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: 'var(--brand-primary)', fontFamily: 'var(--mono-font)' }}>
                  {machine.name.toUpperCase()} WORKPIECE
                </strong>
                <button
                  onClick={() => setSelectedPartId(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✕
                </button>
              </div>

              {operationState === 'RUNNING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Machining {activeOperation?.name}...</span>
                    <span style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{operationProgress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${operationProgress}%`, background: 'var(--brand-primary)', transition: 'width 0.1s' }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={handlePauseResumeOperation}
                      style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', borderRadius: '4px', color: '#FFF', cursor: 'pointer', fontSize: '10.5px', fontWeight: '700' }}
                    >
                      {isOpRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button
                      onClick={handleAbortOperation}
                      style={{ flex: 1, padding: '6px', background: 'rgba(198, 40, 40, 0.2)', border: '1px solid var(--danger)', borderRadius: '4px', color: 'var(--danger)', cursor: 'pointer', fontSize: '10.5px', fontWeight: '700' }}
                    >
                      ABORT
                    </button>
                  </div>
                </div>
              )}

              {operationState === 'COMPLETED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: 'rgba(46, 125, 50, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: '4px', fontSize: '11px', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: '800', marginBottom: '2px' }}>✓ {activeOperation?.name.toUpperCase()} COMPLETED!</div>
                    <div style={{ color: '#E2E8F0', fontSize: '10.5px' }}>{activeOperation?.educationalExplanation}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={toggleBeforeAfter}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: '#FFF',
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
                        background: 'rgba(10, 92, 255, 0.15)',
                        border: '1px solid var(--brand-primary)',
                        borderRadius: '4px',
                        color: 'var(--brand-primary)',
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
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Select operation to run:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                    {machineOperations.map(op => (
                      <button
                        key={op.id}
                        onClick={() => handleSelectOperation(op)}
                        style={{
                          padding: '6px 10px',
                          background: activeOperation?.id === op.id ? 'rgba(10, 92, 255, 0.2)' : 'rgba(255,255,255,0.04)',
                          border: '1px solid ' + (activeOperation?.id === op.id ? 'var(--brand-primary)' : 'rgba(255,255,255,0.08)'),
                          borderRadius: '4px',
                          color: '#FFF',
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
                        background: 'var(--brand-primary)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '800',
                        fontSize: '11px',
                        cursor: 'pointer',
                        marginTop: '4px'
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
          <div 
            style={{ 
              position: 'absolute', 
              top: '16px', 
              left: '16px', 
              right: '16px', 
              display: 'flex', 
              justifyContent: 'space-between',
              pointerEvents: 'none',
              zIndex: 30
            }}
          >
            <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
              <button
                onClick={() => setIsExploded(!isExploded)}
                style={{
                  background: isExploded ? 'rgba(10, 92, 255, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid ' + (isExploded ? 'var(--brand-primary)' : 'var(--border)'),
                  color: isExploded ? '#FFFFFF' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                EXPLODED VIEW
              </button>
              <button
                onClick={() => setIsCutaway(!isCutaway)}
                style={{
                  background: isCutaway ? 'rgba(10, 92, 255, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid ' + (isCutaway ? 'var(--brand-primary)' : 'var(--border)'),
                  color: isCutaway ? '#FFFFFF' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                CUTAWAY VIEW
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', pointerEvents: 'auto' }}>
              {[
                { id: 'default', label: '3D DEFAULT' },
                { id: 'close_up', label: 'CLOSE-UP' },
                { id: 'top_view', label: 'TOP PLAN' }
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setCameraMode(cam.id)}
                  style={{
                    background: cameraMode === cam.id ? 'rgba(10, 92, 255, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid ' + (cameraMode === cam.id ? 'var(--brand-primary)' : 'var(--border)'),
                    color: cameraMode === cam.id ? '#FFFFFF' : 'var(--text-secondary)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '10px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMN 3: STATUS / ASSESSMENT / METROLOGY INSPECTOR */}
        <div 
          style={{ 
            borderLeft: '1px solid rgba(168, 85, 247, 0.2)', 
            padding: activeSubTab === 'explorer' ? '16px' : '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '18px',
            background: 'rgba(18, 5, 45, 0.9)',
            backdropFilter: 'blur(16px)',
            overflowY: 'auto'
          }}
        >
          {activeSubTab === 'operate' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              
              {/* Right Sidebar Tab Switcher */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(168, 85, 247, 0.25)', paddingBottom: '4px', gap: '8px' }}>
                {['tools', 'telemetry', 'assessment'].map(tabId => (
                  <button
                    key={tabId}
                    onClick={() => setActiveRightTab(tabId)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeRightTab === tabId ? '2px solid #FF5376' : '2px solid transparent',
                      color: activeRightTab === tabId ? '#FF5376' : '#D8B4FE',
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
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Available Machine Tool Bits</span>
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
                          background: isSelected ? 'linear-gradient(135deg, rgba(255, 83, 118, 0.25) 0%, rgba(121, 40, 202, 0.4) 100%)' : 'rgba(35, 12, 75, 0.45)',
                          border: '1px solid ' + (isSelected ? '#FF5376' : 'rgba(168, 85, 247, 0.2)'),
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 15px rgba(255, 83, 118, 0.25)' : 'none'
                        }}
                      >
                        <Settings size={15} style={{ color: isSelected ? '#FF5376' : '#D8B4FE' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#FFFFFF' : '#F0EDE5' }}>
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
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Kinematic Diagnostics</span>
                  <div style={{ background: 'rgba(35, 12, 75, 0.7)', border: '1px solid rgba(224, 64, 251, 0.3)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Power State:</span>
                      <strong style={{ color: isPowerOn ? '#00F5D4' : '#9480B8' }}>{isPowerOn ? 'ACTIVE (RUN)' : 'STANDBY'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Spindle Axis:</span>
                      <strong style={{ color: '#FFFFFF' }}>{spindleDirection}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Speed:</span>
                      <strong style={{ color: '#FF5376' }}>{simParams.speed} RPM</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Feed:</span>
                      <strong style={{ color: '#00F5D4' }}>{simParams.feed} mm/rev</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Depth of Cut:</span>
                      <strong style={{ color: '#FFFFFF' }}>{simParams.doc} mm</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Tab */}
              {activeRightTab === 'assessment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Operation Assessment</span>
                  {assessmentResult ? (
                    <div style={{ background: 'rgba(35, 12, 75, 0.7)', border: '1px solid rgba(224, 64, 251, 0.3)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(168, 85, 247, 0.25)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#FF5376' }}>OVERALL SCORE</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#00F5D4' }}>{assessmentResult.overallScore}%</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#D8B4FE' }}>Safety Compliance:</span>
                        <strong style={{ color: '#00F5D4' }}>{assessmentResult.safetyScore}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#D8B4FE' }}>Setup Accuracy:</span>
                        <strong style={{ color: '#E040FB' }}>{assessmentResult.setupScore}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#D8B4FE' }}>Execution Quality:</span>
                        <strong style={{ color: '#FFFFFF' }}>{assessmentResult.executionScore}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#D8B4FE' }}>Tolerance Accuracy:</span>
                        <strong style={{ color: '#FF5376' }}>{assessmentResult.accuracyScore}%</strong>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.25)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#D8B4FE' }}>Workshop XP Earned:</span>
                        <strong style={{ color: '#00F5D4' }}>+{assessmentResult.xpAwarded} XP</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', background: 'rgba(35, 12, 75, 0.5)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', fontSize: '12px', color: '#D8B4FE', lineHeight: '1.5' }}>
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
                      <Layers size={16} style={{ color: '#00F5D4' }} />
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
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#D8B4FE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        All Machine Components
                      </span>
                      <span style={{ fontSize: '11px', color: '#00F5D4' }}>Click to inspect in 3D</span>
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
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Diagnostics Response</span>
                  {identifyFeedback && (
                    <div style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: identifySuccess ? 'rgba(0, 245, 212, 0.12)' : 'rgba(255, 0, 85, 0.12)',
                      border: '1px solid ' + (identifySuccess ? '#00F5D4' : 'var(--danger)'),
                      color: identifySuccess ? '#00F5D4' : '#FF758C',
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
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Safety Compliance Check</span>
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: safetyPassed ? 'rgba(0, 245, 212, 0.12)' : 'rgba(35, 12, 75, 0.6)',
                    border: '1px solid ' + (safetyPassed ? '#00F5D4' : 'rgba(168, 85, 247, 0.3)'),
                    color: safetyPassed ? '#00F5D4' : '#D8B4FE',
                    fontSize: '13px',
                    lineHeight: '1.5'
                  }}>
                    {safetyFeedback || "Review and equip appropriate safety PPE gear before starting machine operations."}
                  </div>
                </div>
              )}

              {activeSubTab === 'setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Setup Status</span>
                  <div style={{ padding: '14px', background: setupPassed ? 'rgba(0, 245, 212, 0.12)' : 'rgba(35, 12, 75, 0.6)', border: '1px solid ' + (setupPassed ? '#00F5D4' : 'rgba(168, 85, 247, 0.3)'), color: setupPassed ? '#00F5D4' : '#D8B4FE', borderRadius: '10px', fontSize: '13px' }}>
                    {setupPassed ? "✓ Workpiece stock and tool clamped. Ready for simulation." : "Clamp stock and tools to initiate setup assembly."}
                  </div>
                </div>
              )}

              {activeSubTab === 'experiments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Calculated MRR & Heat</span>
                  <div style={{ background: 'rgba(35, 12, 75, 0.7)', border: '1px solid rgba(224, 64, 251, 0.3)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Material Removal Rate:</span>
                      <strong style={{ color: '#FF5376' }}>{(simParams.speed * 0.1 * simParams.feed * simParams.doc * 5.5).toFixed(1)} mm³/s</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Estimated Heat Temp:</span>
                      <strong style={{ color: '#00F5D4' }}>{(100 + simParams.speed * 0.4 + simParams.feed * 300 + simParams.doc * 45).toFixed(0)} °C</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'inspect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Metrology Report</span>
                  {inspectFeedback && (
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0, 245, 212, 0.12)', border: '1px solid #00F5D4', color: '#00F5D4', fontSize: '13px', fontWeight: '600' }}>
                      {inspectFeedback}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'scorecard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label" style={{ color: '#00F5D4' }}>Student Performance Card</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(35, 12, 75, 0.7)', border: '1px solid rgba(224, 64, 251, 0.3)', padding: '16px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Operations Mastered:</span>
                      <strong style={{ color: '#FF5376' }}>{operationHistory.length} / {machineOperations.length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#D8B4FE' }}>Total Workshop XP:</span>
                      <strong style={{ color: '#00F5D4' }}>{user?.xp || 0} XP</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
}
