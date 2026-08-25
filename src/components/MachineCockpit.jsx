import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { MACHINES } from '../data/machines';
import ThreeVisualizer from './ThreeVisualizer';

export default function MachineCockpit({ user, onUpdateUser, initialMachineId, showLabels, highContrast }) {
  const [selectedId, setSelectedId] = useState(initialMachineId || 'lathe');
  const [activeSubTab, setActiveSubTab] = useState('explorer');
  const machine = MACHINES[selectedId];

  const [activeOperation, setActiveOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationState, setOperationState] = useState('IDLE');
  const [operationHistory, setOperationHistory] = useState([]);
  const [practiceMode, setPracticeMode] = useState(true);
  const [beforeAfterMode, setBeforeAfterMode] = useState('after');
  const [isOpRunning, setIsOpRunning] = useState(false);
  const [focusedOpIdx, setFocusedOpIdx] = useState(0);

  const isWorkpieceSelected = (partId, machId) => {
    if (!partId) return false;
    if (machId === 'lathe' && partId === 'workpiece') return true;
    if (machId === 'welding' && partId === 'weld_joint') return true;
    if (machId === 'shaper' && partId === 'workpiece') return true;
    if (machId === 'planer' && partId === 'workpiece') return true;
    if (machId === 'milling' && partId === 'workpiece') return true;
    if (machId === 'casting' && partId === 'casting_cavity') return true;
    if (machId === 'moulding' && partId === 'cavity') return true;
    return false;
  };

  const handleSelectOperation = (op) => {
    setActiveOperation(op);
    setOperationState('PREVIEW');
    setBeforeAfterMode('after');
    setOperationProgress(0);
  };

  const handleStartOperationSim = () => {
    setOperationState('RUNNING');
    setIsOpRunning(true);
  };

  const handlePauseResumeOperation = () => {
    setIsOpRunning(prev => !prev);
  };

  const handleCancelOperation = () => {
    setActiveOperation(null);
    setOperationState('IDLE');
    setOperationProgress(0);
    setIsOpRunning(false);
  };

  const handleResetOperation = () => {
    setOperationProgress(0);
    setOperationState('PREVIEW');
    setBeforeAfterMode('after');
    setIsOpRunning(false);
  };

  const toggleBeforeAfter = () => {
    setBeforeAfterMode(p => p === 'after' ? 'before' : 'after');
  };

  const handleCloseOperationCard = () => {
    if (activeOperation && !operationHistory.includes(activeOperation.id)) {
      setOperationHistory(prev => [...prev, activeOperation.id]);
    }
    setActiveOperation(null);
    setOperationState('IDLE');
    setOperationProgress(0);
    setIsOpRunning(false);
  };

  useEffect(() => {
    let timer;
    if (isOpRunning && operationState === 'RUNNING') {
      timer = setInterval(() => {
        setOperationProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            setIsOpRunning(false);
            setOperationState('COMPLETED');
            return 100;
          }
          return p + 5;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isOpRunning, operationState]);

  // Visual Viewport Configuration
  const [isExploded, setIsExploded] = useState(false);
  const [isCutaway, setIsCutaway] = useState(false);
  const [cameraMode, setCameraMode] = useState('default');

  // Keyboard navigation & simulator tuning states
  const [focusedPartId, setFocusedPartId] = useState(null);
  const [focusedControl, setFocusedControl] = useState(null);
  const [machineState, setMachineState] = useState('READY');

  // 9-Stage Learning path custom states
  const [identifyTargetPart, setIdentifyTargetPart] = useState(null);
  const [identifySuccess, setIdentifySuccess] = useState(false);
  const [identifyFeedback, setIdentifyFeedback] = useState('');
  
  const [setupPassed, setSetupPassed] = useState(false);
  const [setupChecklist, setSetupChecklist] = useState({
    stockSecured: false,
    toolClamped: false,
    safetyGuardAligned: false
  });

  const [toolPosition, setToolPosition] = useState({ x: 0, y: 0, z: 0 });
  const [inspectFeedback, setInspectFeedback] = useState('');
  const [inspectSuccess, setInspectSuccess] = useState(false);

  // Safety items
  const [safetyItems, setSafetyItems] = useState({
    goggles: false,
    gloves: false,
    clothing: false,
    shoes: false,
    shield: false
  });
  const [safetySubmitted, setSafetySubmitted] = useState(false);
  const [safetyPassed, setSafetyPassed] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState('');

  // Simulator
  const [simStep, setSimStep] = useState(1);
  const [simMaterial, setSimMaterial] = useState('');
  const [simTool, setSimTool] = useState('');
  const [simParams, setSimParams] = useState({ speed: 600, feed: 0.15, doc: 0.8 });
  const [simFeedback, setSimFeedback] = useState('');
  const [simSuccess, setSimSuccess] = useState(false);
  const [simProgressPercent, setSimProgressPercent] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Troubleshooting
  const [troubleIdx, setTroubleIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [troubleFeedback, setTroubleFeedback] = useState('');
  const [troublePassed, setTroublePassed] = useState(false);

  // Assembly
  const [assembledParts, setAssembledParts] = useState([]);
  const [assemblyFeedback, setAssemblyFeedback] = useState('');
  const [assemblyComplete, setAssemblyComplete] = useState(false);

  // Experiment
  const [expVariables, setExpVariables] = useState({});

  const MACHINE_TOOLS = {
    lathe: ['Turning Tool', 'Facing Tool', 'Parting Tool', 'Threading Tool', 'Boring Tool'],
    welding: ['SMAW Electrode', 'GTAW Torch', 'GMAW Gun', 'FCAW Torch'],
    shaper: ['Shaper Tool Bit', 'Slotting Tool', 'Keyway Tool'],
    planer: ['Planing Tool', 'Broad-Nosed Tool', 'Grooving Tool'],
    milling: ['End Mill', 'Face Mill', 'Slab Mill', 'T-Slot Cutter'],
    casting: ['Graphite Crucible', 'Steel Ladle', 'Bottom Pour Ladle'],
    moulding: ['Compactor', 'Pattern Lifter', 'Vent Wire', 'Sand Shovel']
  };

  const [isPowerOn, setIsPowerOn] = useState(false);
  const [spindleDirection, setSpindleDirection] = useState('Clockwise');
  const [chuckStatus, setChuckStatus] = useState('Closed');
  const [activeRightTab, setActiveRightTab] = useState('tools');
  const [wavePhase, setWavePhase] = useState(0);
  const [selectedTool, setSelectedTool] = useState('Turning Tool');

  // Sync selectedTool and isPowerOn with simulator
  useEffect(() => {
    setSelectedTool(MACHINE_TOOLS[selectedId]?.[0] || 'Turning Tool');
    setIsPowerOn(false);
  }, [selectedId]);

  // Wave phase telemetry oscillator animation
  useEffect(() => {
    if (!isPowerOn) return;
    const interval = setInterval(() => {
      setWavePhase(p => (p + 15) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isPowerOn]);

  // Part selection
  const [selectedPartId, setSelectedPartId] = useState(null);
  const activePart = machine.parts.find(p => p.id === selectedPartId) || machine.parts[0];

  // Synchronize machine choice from global shortcut
  useEffect(() => {
    if (initialMachineId && initialMachineId !== selectedId) {
      setSelectedId(initialMachineId);
    }
  }, [initialMachineId]);

  // Reset viewport states on machine change
  useEffect(() => {
    setActiveSubTab('explorer');
    setIsExploded(false);
    setIsCutaway(false);
    setCameraMode('default');
    resetSafety();
    resetSimulator();
    resetTroubleshoot();
    resetAssembly();
    resetExperiment();
    
    setActiveOperation(null);
    setOperationProgress(0);
    setOperationState('IDLE');
    setOperationHistory([]);
    setPracticeMode(true);
    setBeforeAfterMode('after');
    setIsOpRunning(false);
    setFocusedOpIdx(0);

    // Choose a random part to identify
    if (machine.parts && machine.parts.length > 0) {
      const idx = Math.floor(Math.random() * machine.parts.length);
      setIdentifyTargetPart(machine.parts[idx]);
    }
    setIdentifySuccess(false);
    setIdentifyFeedback('');
    setSetupPassed(false);
    setSetupChecklist({ stockSecured: false, toolClamped: false, safetyGuardAligned: false });
    setInspectFeedback('');
    setInspectSuccess(false);
    setToolPosition({ x: 0, y: 0, z: 0 });
  }, [selectedId]);

  useEffect(() => {
    if (activeSubTab === 'identify' && selectedPartId && identifyTargetPart) {
      if (selectedPartId === identifyTargetPart.id) {
        setIdentifySuccess(true);
        setIdentifyFeedback(`✓ Correct! You identified the [ ${identifyTargetPart.name} ] component.`);
        if (user) {
          onUpdateUser({ ...user, xp: user.xp + 50 });
        }
      } else {
        setIdentifyFeedback(`✗ Try Again: That is the [ ${machine.parts.find(p=>p.id===selectedPartId)?.name || 'other'} ] part.`);
      }
    }
  }, [selectedPartId, activeSubTab]);

  // Handle Mode Navigation shortcuts (Q, E, Z, X, C, V, B, etc.)
  useEffect(() => {
    const handleModeKeydown = (e) => {
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

      // Machine-specific keyboard controls (in operate tab)
      if (activeSubTab === 'operate') {
        const speedMin = machine.simulator.paramRanges.speed.min;
        const speedMax = machine.simulator.paramRanges.speed.max;
        const feedMin = machine.simulator.paramRanges.feed.min;
        const feedMax = machine.simulator.paramRanges.feed.max;
        const docMin = machine.simulator.paramRanges.doc.min;
        const docMax = machine.simulator.paramRanges.doc.max;

        if (selectedId === 'lathe') {
          // Arrow keys move cutting tool: left/right (X), up/down with Alt (Z)
          if (e.key === 'ArrowLeft') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.max(-2.5, p.x - 0.1) })); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.min(2.5, p.x + 0.1) })); }
          else if (e.key === 'ArrowUp') {
            if (e.shiftKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, feed: Math.min(feedMax, parseFloat((p.feed + 0.02).toFixed(2))) }));
            } else if (e.ctrlKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, doc: Math.min(docMax, parseFloat((p.doc + 0.1).toFixed(1))) }));
            } else if (e.altKey) {
              e.preventDefault();
              setToolPosition(p => ({ ...p, z: Math.max(-0.6, p.z - 0.1) }));
            } else {
              e.preventDefault();
              setSimParams(p => ({ ...p, speed: Math.min(speedMax, p.speed + 50) }));
            }
          } else if (e.key === 'ArrowDown') {
            if (e.shiftKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, feed: Math.max(feedMin, parseFloat((p.feed - 0.02).toFixed(2))) }));
            } else if (e.ctrlKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, doc: Math.max(docMin, parseFloat((p.doc - 0.1).toFixed(1))) }));
            } else if (e.altKey) {
              e.preventDefault();
              setToolPosition(p => ({ ...p, z: Math.min(0.6, p.z + 0.1) }));
            } else {
              e.preventDefault();
              setSimParams(p => ({ ...p, speed: Math.max(speedMin, p.speed - 50) }));
            }
          }
        } else if (selectedId === 'welding') {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.max(-1.5, p.x - 0.1) })); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.min(1.5, p.x + 0.1) })); }
          else if (e.key === 'ArrowUp') {
            if (e.shiftKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, speed: Math.min(speedMax, p.speed + 5) })); // current
            } else {
              e.preventDefault();
              setToolPosition(p => ({ ...p, z: Math.max(-0.6, p.z - 0.1) }));
            }
          } else if (e.key === 'ArrowDown') {
            if (e.shiftKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, speed: Math.max(speedMin, p.speed - 5) }));
            } else {
              e.preventDefault();
              setToolPosition(p => ({ ...p, z: Math.min(0.6, p.z + 0.1) }));
            }
          }
        } else if (selectedId === 'milling') {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.max(-1.5, p.x - 0.1) })); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.min(1.5, p.x + 0.1) })); }
          else if (e.key === 'ArrowUp') {
            if (e.shiftKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, speed: Math.min(speedMax, p.speed + 100) })); // spindle speed
            } else {
              e.preventDefault();
              setToolPosition(p => ({ ...p, y: Math.min(1.0, p.y + 0.1) }));
            }
          } else if (e.key === 'ArrowDown') {
            if (e.shiftKey) {
              e.preventDefault();
              setSimParams(p => ({ ...p, speed: Math.max(speedMin, p.speed - 100) }));
            } else {
              e.preventDefault();
              setToolPosition(p => ({ ...p, y: Math.max(-1.0, p.y - 0.1) }));
            }
          }
        } else if (selectedId === 'shaper') {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.max(-1.2, p.x - 0.1) })); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.min(1.2, p.x + 0.1) })); }
        } else if (selectedId === 'planer') {
          if (e.key === 'ArrowLeft') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.max(-1.0, p.x - 0.1) })); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); setToolPosition(p => ({ ...p, x: Math.min(1.0, p.x + 0.1) })); }
        }
      }

      // Workpiece selected keyboard overrides
      if (isWorkpieceSelected(selectedPartId, selectedId)) {
        if (e.key === 'Escape') {
          e.preventDefault();
          handlePartSelect(null);
          handleCancelOperation();
          return;
        }

        if (operationState === 'IDLE') {
          if (e.key === 'Tab') {
            e.preventDefault();
            setFocusedOpIdx((prev) => (prev + 1) % machine.operations.length);
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            const selectedOp = machine.operations[focusedOpIdx];
            if (selectedOp) {
              handleSelectOperation(selectedOp);
            }
            return;
          }
        } else if (operationState === 'PREVIEW') {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleStartOperationSim();
            return;
          }
        } else if (operationState === 'RUNNING') {
          if (e.key === ' ') {
            e.preventDefault();
            handlePauseResumeOperation();
            return;
          }
        } else if (operationState === 'COMPLETED') {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleCloseOperationCard();
            return;
          }
          if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            handleResetOperation();
            return;
          }
        }
      }

      // SPACE = Perform action / play pause
      if (e.key === ' ') {
        e.preventDefault();
        if (activeSubTab === 'operate') {
          handleStartSim();
        }
      }

      // ESC = cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        resetSimulator();
      }

      // R = Reset
      if ((e.key === 'r' || e.key === 'R') && activeSubTab === 'operate') {
        e.preventDefault();
        resetSimulator();
      }
    };

    window.addEventListener('keydown', handleModeKeydown);
    return () => window.removeEventListener('keydown', handleModeKeydown);
  }, [activeSubTab, selectedId, simParams, selectedPartId, operationState, focusedOpIdx, activeOperation, isOpRunning]);

  const handlePartSelect = (partId) => {
    setSelectedPartId(partId);
    setFocusedPartId(partId);
  };

  // ==========================================
  // SAFETY CHECK MINI-GAME STATE
  // ==========================================
  // Safety check function defined below safetyItems configuration

  const resetSafety = () => {
    setSafetyItems({ goggles: false, gloves: false, clothing: false, shoes: false, shield: false });
    setSafetySubmitted(false);
    setSafetyPassed(false);
    setSafetyFeedback('');
  };

  const handleSafetyToggle = (item) => {
    if (safetySubmitted) return;
    setSafetyItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const checkSafety = () => {
    setSafetySubmitted(true);
    const isEntanglementHazard = ['lathe', 'milling', 'shaper', 'planer'].includes(selectedId);
    
    if (isEntanglementHazard) {
      if (safetyItems.gloves) {
        setSafetyPassed(false);
        setSafetyFeedback("⚠ SAFETY CHECK FAILED: Wearing gloves near rotating machine spindles is an entanglement hazard! Remove gloves.");
        if (user) {
          onUpdateUser({ ...user, safetyScore: Math.max(50, user.safetyScore - 10) });
        }
        return;
      }
      if (!safetyItems.goggles || !safetyItems.clothing || !safetyItems.shoes) {
        setSafetyPassed(false);
        setSafetyFeedback("⚠ SAFETY CHECK FAILED: Wear safety goggles, proper tight shop clothes, and safety shoes.");
        return;
      }
      setSafetyPassed(true);
      setSafetyFeedback("✓ SAFETY CHECK COMPLIANT: Rotating spindle hazard safety verified.");
    } else if (selectedId === 'welding') {
      if (!safetyItems.shield || !safetyItems.gloves || !safetyItems.shoes || !safetyItems.clothing) {
        setSafetyPassed(false);
        setSafetyFeedback("⚠ SAFETY CHECK FAILED: Welding requires auto-darkening shield face mask, heavy leather gloves, tight clothes, and safety shoes.");
        return;
      }
      setSafetyPassed(true);
      setSafetyFeedback("✓ SAFETY CHECK COMPLIANT: Welding shield UV rays protection verified.");
    } else {
      // Casting/Moulding
      if (!safetyItems.gloves || !safetyItems.goggles || !safetyItems.shoes || !safetyItems.clothing) {
        setSafetyPassed(false);
        setSafetyFeedback("⚠ SAFETY CHECK FAILED: Handling molten metal flasks requires safety goggles, thick heat-resistant gloves, and safety shoes.");
        return;
      }
      setSafetyPassed(true);
      setSafetyFeedback("✓ SAFETY CHECK COMPLIANT: Thermal safety checked.");
    }
  };

  // ==========================================
  // SETUP / MOUNTING CHECKLIST STATE
  // ==========================================
  const toggleSetupChecklist = (field) => {
    setSetupChecklist(p => {
      const next = { ...p, [field]: !p[field] };
      if (next.stockSecured && next.toolClamped && next.safetyGuardAligned) {
        setSetupPassed(true);
      } else {
        setSetupPassed(false);
      }
      return next;
    });
  };

  // ==========================================
  // OPERATE SIMULATOR STATE
  // ==========================================
  // Simulator states declared at top

  const resetSimulator = () => {
    setSimStep(1);
    setSimMaterial('');
    setSimTool('');
    setSimParams({ speed: 600, feed: 0.15, doc: 0.8 });
    setSimFeedback('');
    setSimSuccess(false);
    setSimProgressPercent(0);
    setIsSimRunning(false);
    setCameraMode('default');
  };

  // isPlaying declared at top

  const handleStartSim = () => {
    if (!safetyPassed) {
      setSimFeedback("⚠ SAFETY LOCKED: Complete safety checklist verification in safety tab first!");
      setMachineState('WARNING');
      return;
    }
    if (!setupPassed) {
      setSimFeedback("⚠ SETUP LOCKED: Complete raw material clamping in setup tab first!");
      setMachineState('WARNING');
      return;
    }

    if (selectedId === 'lathe') {
      if (simParams.speed > 1000 && simMaterial.includes('Mild Steel')) {
        setSimFeedback("⚠️ OPERATION WARNING: Spindle speed is too high. Metal chips are tearing the workpiece!");
        setMachineState('WARNING');
      }
      if (simParams.doc > 2.5) {
        setSimFeedback("⚠️ OPERATION WARNING: Too deep cut causing tool chatter!");
        setMachineState('WARNING');
      }
    } else if (selectedId === 'welding') {
      if (simParams.speed > 130) {
        setSimFeedback("⚠️ OPERATION WARNING: High current amperage causing metal plates burn-through!");
        setMachineState('WARNING');
      }
    }

    setIsSimRunning(true);
    setIsPlaying(true);
    setCameraMode('operation');
    setSimFeedback("3D Operation processing... tracking machine kinematics path.");
    setMachineState('RUNNING');
    
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 10;
      setSimProgressPercent(currentPct);
      if (currentPct >= 100) {
        clearInterval(interval);
        setIsSimRunning(false);
        setIsPlaying(false);
        setSimStep(4);
        setCameraMode('close_up');
        setSimFeedback("✓ Operation simulation completed. Proceed to Inspect Part tab.");
        setMachineState('READY');
      }
    }, 200);
  };

  // ==========================================
  // TROUBLESHOOTING STATE
  // ==========================================
  // Troubleshooting states declared at top

  const resetTroubleshoot = () => {
    setTroubleIdx(0);
    setSelectedOptionId('');
    setTroubleFeedback('');
    setTroublePassed(false);
  };

  const handleCheckTroubleshoot = () => {
    const scenario = machine.troubleshoot[troubleIdx];
    const option = scenario.options.find(o => o.id === selectedOptionId);
    
    if (!option) return;

    if (option.isCorrect) {
      setTroublePassed(true);
      setTroubleFeedback(`✓ CORRECT DIAGNOSIS: ${option.reason}`);
      if (user) {
        onUpdateUser({ ...user, xp: user.xp + 100 });
      }
    } else {
      setTroublePassed(false);
      setTroubleFeedback(`⚠️ INCORRECT DIAGNOSIS: ${option.reason}`);
    }
  };

  // ==========================================
  // ASSEMBLY / SETUP STATE
  // ==========================================
  // Assembly states declared at top

  const resetAssembly = () => {
    setAssembledParts([]);
    setAssemblyFeedback('');
    setAssemblyComplete(false);
    setIsExploded(false);
  };

  const handleInstallPart = (partId) => {
    if (assembledParts.includes(partId)) return;
    
    const requiredOrder = machine.parts.map(p => p.id);
    const nextRequiredPartId = requiredOrder.find(id => !assembledParts.includes(id));
    
    if (partId !== nextRequiredPartId) {
      setAssemblyFeedback(`⚠️ SEQUENCE ERROR: Mount the [${machine.parts.find(p=>p.id===nextRequiredPartId).name}] first to establish assembly base.`);
      return;
    }

    const updated = [...assembledParts, partId];
    setAssembledParts(updated);
    setAssemblyFeedback(`✓ Installed ${machine.parts.find(p=>p.id===partId).name}.`);

    if (updated.length === machine.parts.length) {
      setAssemblyComplete(true);
      setAssemblyFeedback("✓ SETUP COMPLETED: All physical clamps and attachments locked.");
      setSetupPassed(true);
      if (user) {
        onUpdateUser({ ...user, xp: user.xp + 100 });
      }
    }
  };

  // ==========================================
  // EXPERIMENT LAB STATE
  // ==========================================
  // expVariables declared at top

  const resetExperiment = () => {
    const initial = {};
    if (machine.experiments) {
      machine.experiments.variables.forEach(v => {
        initial[v.id] = v.default;
      });
    }
    setExpVariables(initial);
  };

  const handleVariableChange = (varId, value) => {
    setExpVariables(prev => ({ ...prev, [varId]: parseFloat(value) }));
  };

  const getExperimentResults = () => {
    if (!machine.experiments) return null;
    const formulas = machine.experiments.formulas;
    if (selectedId === 'lathe') {
      const mrr = formulas.mrr(expVariables.speed || 800, expVariables.feed || 0.15, expVariables.doc || 1.0);
      const temp = formulas.temp(expVariables.speed || 800, expVariables.feed || 0.15, expVariables.doc || 1.0);
      const roughness = formulas.roughness(expVariables.speed || 800, expVariables.feed || 0.15);
      return { mrr, temp, roughness, roughnessLabel: "Surface Roughness (Ra)" };
    } else if (selectedId === 'welding') {
      const mrr = formulas.mrr(expVariables.current || 110, expVariables.gap || 3, expVariables.travelSpeed || 15);
      const temp = formulas.temp(expVariables.current || 110, expVariables.gap || 3);
      const roughness = formulas.roughness(expVariables.current || 110, expVariables.gap || 3, expVariables.travelSpeed || 15);
      return { mrr, temp, roughness, roughnessLabel: "Spatter Index" };
    } else {
      const mrr = "15.0";
      const temp = "120";
      const roughness = "2.5";
      return { mrr, temp, roughness, roughnessLabel: "Roughness Indicator" };
    }
  };

  const expResults = getExperimentResults();

  // ==========================================
  // PART INSPECTION & COMPLETE
  // ==========================================
  const handleInspectCaliper = () => {
    setInspectSuccess(true);
    let scoreText = '';
    
    if (selectedId === 'lathe') {
      const deviation = Math.abs(simParams.doc - 1.0);
      if (deviation < 0.2) {
        scoreText = `✓ Part compliant! Caliper measures exactly 36.02 mm (tolerance ±0.05 mm). Finished workpiece is smooth and structural. +250 XP`;
        if (user) {
          onUpdateUser({
            ...user,
            xp: user.xp + 250,
            completedMissions: user.completedMissions + 1,
            badges: user.badges.includes('Lathe Apprentice') ? user.badges : [...user.badges, 'Lathe Apprentice']
          });
        }
      } else {
        scoreText = `⚠️ Part off tolerance! Caliper measures 35.10 mm. Over-cutting structural failure. Retry operation with depth 1.0mm.`;
      }
    } else if (selectedId === 'welding') {
      scoreText = `✓ Ultrasonic test scans reveal 98% bead penetration. Butt weld tensile strength optimal! +250 XP`;
      if (user) {
        onUpdateUser({
          ...user,
          xp: user.xp + 250,
          completedMissions: user.completedMissions + 1,
          badges: user.badges.includes('Arc Welder Pro') ? user.badges : [...user.badges, 'Arc Welder Pro']
        });
      }
    } else {
      scoreText = `✓ Inspection verified! Workpiece dimensions conform to engineering design parameters. +250 XP`;
      if (user) {
        onUpdateUser({
          ...user,
          xp: user.xp + 250,
          completedMissions: user.completedMissions + 1,
          badges: user.badges.includes(`${selectedId.toUpperCase()} Master`) ? user.badges : [...user.badges, `${selectedId.toUpperCase()} Master`]
        });
      }
    }
    setInspectFeedback(scoreText);
    setMachineState('COMPLETED');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* 1. Category Switcher (1-7 machines) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '12px 24px', 
          borderBottom: '1px solid var(--border)',
          background: 'rgba(11, 23, 51, 0.65)'
        }}
      >
        {Object.values(MACHINES).map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid ' + (selectedId === m.id ? 'var(--brand-primary)' : 'rgba(61, 114, 193, 0.15)'),
              background: selectedId === m.id ? 'rgba(29, 73, 180, 0.15)' : 'transparent',
              color: selectedId === m.id ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '700',
              textTransform: 'uppercase',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            {m.name.replace(' Machine', '').replace(' Station', '').replace(' Furnace', '').replace(' Bay', '')}
          </button>
        ))}
      </div>

      {/* 2. 9-Stage Learning Navigation (Horizontal Subtabs Bar) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '8px 24px', 
          background: 'rgba(11, 23, 51, 0.45)',
          borderBottom: '1px solid var(--border)',
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
          { id: 'scorecard', label: '9. Performance Card', icon: ShieldAlert }
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
                border: '1px solid ' + (isActive ? 'var(--brand-primary)' : 'rgba(61, 114, 193, 0.15)'),
                background: isActive ? 'var(--brand-primary)' : 'rgba(11, 23, 51, 0.25)',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--brand-secondary)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'rgba(61, 114, 193, 0.15)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={12} style={{ color: isActive ? '#FFFFFF' : 'var(--brand-secondary)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main split viewport layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 340px', height: 'calc(100% - 92px)', overflow: 'hidden' }}>
        
        {/* COLUMN 1: CONTROLS & INPUT PANELS */}
        <div 
          style={{ 
            borderRight: '1px solid var(--border)', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            background: 'rgba(11, 23, 51, 0.4)',
            overflowY: 'auto'
          }}
        >
          {activeSubTab === 'operate' ? (
            // CUSTOM SIMULATOR CONTROLS CARD
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Controls
                </h3>
                {isPowerOn ? (
                  <span style={{ fontSize: '10px', color: 'var(--color-green)', fontWeight: '700', letterSpacing: '0.5px' }}>● ACTIVE</span>
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>○ STANDBY</span>
                )}
              </div>
              
              {/* Power Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.2)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Power Drive</span>
                <button
                  onClick={() => setIsPowerOn(!isPowerOn)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: 'none',
                    background: isPowerOn ? 'var(--brand-primary)' : 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minWidth: '60px',
                    transition: 'all 0.2s'
                  }}
                >
                  {isPowerOn ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Spindle direction */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.2)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Spindle Axis</span>
                <button
                  onClick={() => setSpindleDirection(p => p === 'Clockwise' ? 'Counter-CW' : 'Clockwise')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(61, 114, 193, 0.25)',
                    background: 'transparent',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {spindleDirection}
                </button>
              </div>

              {/* Speed range */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.2)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Spindle Speed</span>
                  <span style={{ color: '#FFFFFF', fontWeight: '700', fontFamily: 'var(--mono-font)' }}>{simParams.speed} RPM</span>
                </div>
                <input 
                  type="range" 
                  min={machine.simulator.paramRanges.speed.min} 
                  max={machine.simulator.paramRanges.speed.max} 
                  value={simParams.speed} 
                  onChange={(e) => setSimParams({...simParams, speed: parseInt(e.target.value)})} 
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }} 
                />
              </div>

              {/* Feed Rate range */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.2)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Feed Rate</span>
                  <span style={{ color: '#FFFFFF', fontWeight: '700', fontFamily: 'var(--mono-font)' }}>{simParams.feed} mm/rev</span>
                </div>
                <input 
                  type="range" 
                  min={machine.simulator.paramRanges.feed.min*100} 
                  max={machine.simulator.paramRanges.feed.max*100} 
                  value={simParams.feed*100} 
                  onChange={(e) => setSimParams({...simParams, feed: parseFloat((parseInt(e.target.value)/100).toFixed(2))})} 
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }} 
                />
              </div>

              {/* Chuck status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.2)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Chuck Clamps</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setChuckStatus('Open')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      border: 'none',
                      background: chuckStatus === 'Open' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setChuckStatus('Closed')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '3px',
                      border: 'none',
                      background: chuckStatus === 'Closed' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Tool dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Cutting Tool Bit</span>
                <select
                  value={selectedTool}
                  onChange={(e) => {
                    setSelectedTool(e.target.value);
                    setSimTool(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(61, 114, 193, 0.25)',
                    background: 'rgba(11, 23, 51, 0.85)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {(MACHINE_TOOLS[selectedId] || ['Turning Tool']).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

            </div>
          ) : (
            // SIDEBAR CONTROLS FOR THE OTHER 8 SUB-TABS
            <>
              {activeSubTab === 'explorer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>{machine.name}</h3>
                  <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.4' }}>"{machine.tagline}"</span>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="telemetry-label">Operational Overview</span>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{machine.overview}</p>
                  </div>
                </div>
              )}

              {activeSubTab === 'identify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Part Challenge</h3>
                  {identifyTargetPart && (
                    <div style={{ padding: '12px', background: 'rgba(11,23,51,0.5)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      <p style={{ fontSize: '12px', color: '#FFF', fontWeight: 'bold' }}>
                        Click the component representing the <span style={{ color: 'var(--brand-secondary)' }}>[ {identifyTargetPart.name} ]</span>.
                      </p>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
                    {machine.parts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePartSelect(p.id)}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(11,23,51,0.25)',
                          border: '1px solid rgba(61,114,193,0.15)',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'safety' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Safety Locker</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Equip appropriate PPE gear parameters before engaging operations.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.keys(safetyItems).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleSafetyToggle(key)}
                        style={{
                          padding: '10px 14px',
                          background: safetyItems[key] ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
                          border: '1px solid ' + (safetyItems[key] ? 'var(--brand-primary)' : 'var(--border)'),
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        {key.toUpperCase()} {safetyItems[key] ? '✓' : '○'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Clamping Check</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => toggleSetupChecklist('stockSecured')}
                      style={{
                        padding: '10px 12px',
                        background: setupChecklist.stockSecured ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
                        border: '1px solid ' + (setupChecklist.stockSecured ? 'var(--brand-primary)' : 'var(--border)'),
                        color: '#FFFFFF', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      Mount Workpiece Stock {setupChecklist.stockSecured ? '✓' : '○'}
                    </button>
                    <button
                      onClick={() => toggleSetupChecklist('toolClamped')}
                      style={{
                        padding: '10px 12px',
                        background: setupChecklist.toolClamped ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
                        border: '1px solid ' + (setupChecklist.toolClamped ? 'var(--brand-primary)' : 'var(--border)'),
                        color: '#FFFFFF', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      Clamp Cutting Tool {setupChecklist.toolClamped ? '✓' : '○'}
                    </button>
                    <button
                      onClick={() => toggleSetupChecklist('safetyGuardAligned')}
                      style={{
                        padding: '10px 12px',
                        background: setupChecklist.safetyGuardAligned ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
                        border: '1px solid ' + (setupChecklist.safetyGuardAligned ? 'var(--brand-primary)' : 'var(--border)'),
                        color: '#FFFFFF', fontSize: '11px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      Align Safety Guard Shield {setupChecklist.safetyGuardAligned ? '✓' : '○'}
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'experiments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Variables</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {machine.experiments.variables.map(v => (
                      <div key={v.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{v.name}</span>
                          <strong style={{ color: 'var(--brand-secondary)' }}>{expVariables[v.id] || v.default}</strong>
                        </div>
                        <input type="range" min={v.min} max={v.max} step={v.step} value={expVariables[v.id] || v.default} onChange={(e)=>handleVariableChange(v.id, e.target.value)} style={{ width: '100%', accentColor: 'var(--brand-primary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'troubleshooting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Fault Diagnosis</h3>
                  <h5 style={{ fontSize: '12px', color: 'var(--brand-secondary)', marginTop: '4px' }}>{machine.troubleshoot[troubleIdx].title}</h5>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{machine.troubleshoot[troubleIdx].desc}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {machine.troubleshoot[troubleIdx].options.map(opt => (
                      <button 
                        key={opt.id} 
                        onClick={() => setSelectedOptionId(opt.id)} 
                        style={{ 
                          padding: '10px 12px', 
                          background: selectedOptionId === opt.id ? 'rgba(29,73,180,0.08)' : 'transparent', 
                          border: '1px solid ' + (selectedOptionId === opt.id ? 'var(--brand-primary)' : 'var(--border)'), 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontSize: '11px', 
                          textAlign: 'left', 
                          color: '#FFFFFF' 
                        }}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'inspect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>QC Metrology</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Trigger metrology tool caliper checks to evaluate finished workpiece size parameters.
                  </p>
                  <button 
                    onClick={handleInspectCaliper}
                    className="btn-login"
                    style={{ padding: '10px 16px', display: 'inline-flex', alignSelf: 'flex-start', marginTop: '8px' }}
                  >
                    Measure Workpiece
                  </button>
                </div>
              )}

              {activeSubTab === 'scorecard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Scorecard</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Review final simulation certification credits and compliancy ratings.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* CENTER COLUMN: Immersive 3D Viewport Window */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#050B1B' }}>
          
          {/* Main Visualizer viewport */}
          <div style={{ flex: 1, width: '100%', height: activeSubTab === 'operate' ? 'calc(100% - 220px)' : '100%' }}>
            <ThreeVisualizer
              machineId={selectedId}
              selectedPartId={selectedPartId}
              focusedPartId={focusedPartId}
              onPartSelect={handlePartSelect}
              isExploded={isExploded}
              isCutaway={isCutaway}
              isPlaying={isPowerOn}
              simStep={simStep}
              simParams={simParams}
              activeSubTab={activeSubTab}
              assembledParts={assembledParts}
              cameraMode={cameraMode}
              setCameraMode={setCameraMode}
              showLabels={showLabels}
              highContrast={highContrast}
              toolPosition={toolPosition}
              activeOperation={activeOperation?.id}
              operationProgress={beforeAfterMode === 'before' ? 0 : operationProgress}
              operationState={operationState}
              isLogin={false}
            />
          </div>

          {/* BOTTOM DOCK VIEWPORTS ROW */}
          {activeSubTab === 'operate' && (
            <div 
              style={{
                height: '220px',
                borderTop: '1px solid var(--border)',
                background: 'rgba(11, 23, 51, 0.75)',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1.2fr',
                gap: '16px',
                padding: '16px',
                boxSizing: 'border-box',
                zIndex: 10
              }}
            >
              {/* Card 1: Machine Status Telemetry */}
              <div 
                className="glass-panel"
                style={{
                  background: 'rgba(11, 23, 51, 0.45)',
                  border: '1px solid rgba(61, 114, 193, 0.2)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Machine Status</span>
                    <span style={{ fontSize: '10px', color: isPowerOn ? 'var(--color-green)' : 'var(--text-secondary)', fontWeight: '700' }}>
                      {isPowerOn ? '● Running' : '○ Standby'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Speed Dial</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '700' }}>{isPowerOn ? simParams.speed : 0} RPM</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Feed Depth</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '700' }}>{simParams.feed} mm/s</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Engine Temp</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '700' }}>{isPowerOn ? Math.round(35 + simParams.speed * 0.02) : 23} °C</span>
                    </div>
                  </div>
                </div>

                {/* Oscilloscope Real-time Telemetry wave */}
                <div style={{ height: '35px', width: '100%', marginTop: '6px', overflow: 'hidden' }}>
                  <svg width="100%" height="35" style={{ background: 'rgba(11, 23, 51, 0.85)', borderRadius: '4px' }}>
                    <path 
                      d={`M 0,17.5 L ${Array.from({ length: 25 }, (_, i) => {
                        const x = (i / 24) * 200;
                        const y = 17.5 + (isPowerOn ? Math.sin((i * 15 + wavePhase) * Math.PI / 180) * 12 : 0);
                        return `${x},${y}`;
                      }).join(' L ')}`}
                      fill="none" 
                      stroke="var(--brand-secondary)" 
                      strokeWidth="1.5" 
                    />
                  </svg>
                </div>
              </div>

              {/* Card 2: Spindle Close-up Live View */}
              <div 
                className="glass-panel"
                style={{
                  background: 'rgba(11, 23, 51, 0.45)',
                  border: '1px solid rgba(61, 114, 193, 0.2)',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live View</span>
                
                {/* Styled close-up chamber graphic */}
                <div 
                  style={{ 
                    flex: 1, 
                    background: 'radial-gradient(circle, #0F1A34 0%, #080E1C 100%)', 
                    borderRadius: '4px',
                    position: 'relative',
                    border: '1px solid rgba(61, 114, 193, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Spindle wheel */}
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '3px dashed var(--brand-secondary)',
                      transform: `rotate(${isPowerOn ? wavePhase * 2 : 0}deg)`,
                      transition: isPowerOn ? 'none' : 'transform 0.5s ease-out'
                    }}
                  />
                  {/* Cutter tooltip */}
                  <div 
                    style={{
                      position: 'absolute',
                      right: '15px',
                      width: '20px',
                      height: '8px',
                      background: 'var(--text-secondary)',
                      borderRadius: '2px'
                    }}
                  />
                  {/* sparks generator overlay */}
                  {isPowerOn && Array.from({ length: 4 }).map((_, idx) => (
                    <div 
                      key={idx}
                      style={{
                        position: 'absolute',
                        width: '3px',
                        height: '3px',
                        background: '#3D72C1',
                        boxShadow: '0 0 6px #9EB4E4',
                        borderRadius: '50%',
                        left: '42px',
                        top: '24px',
                        animation: `spark-fly 0.5s infinite linear`,
                        animationDelay: `${idx * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Card 3: Material Specifications info */}
              <div 
                className="glass-panel"
                style={{
                  background: 'rgba(11, 23, 51, 0.45)',
                  border: '1px solid rgba(61, 114, 193, 0.2)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Material Info</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Raw Material:</span>
                      <strong style={{ color: '#FFFFFF' }}>{machine.simulator.materialOptions[0]?.split(' ')[0] || 'Steel'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Width stock:</span>
                      <strong style={{ color: '#FFFFFF' }}>50 mm</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Length stock:</span>
                      <strong style={{ color: '#FFFFFF' }}>200 mm</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={resetSimulator}
                  className="btn-login"
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Reset Simulation
                </button>
              </div>

            </div>
          )}

          {/* Workpiece Operations Floating Panel */}
          {isWorkpieceSelected(selectedPartId, selectedId) && (
            <div style={{
              position: 'absolute',
              bottom: activeSubTab === 'operate' ? '240px' : '50px',
              left: '20px',
              width: '320px',
              background: 'rgba(11, 23, 51, 0.95)',
              border: '1px solid var(--brand-secondary)',
              borderRadius: '6px',
              padding: '16px',
              zIndex: 100,
              boxShadow: '0 0 15px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: '#FFF'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: 'var(--brand-secondary)', fontFamily: 'var(--mono-font)' }}>
                  {machine.name.toUpperCase()} OPERATIONS
                </strong>
                <button
                  onClick={() => handlePartSelect(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <button
                  onClick={() => setPracticeMode(true)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    borderRadius: '2px',
                    border: '1px solid ' + (practiceMode ? 'var(--brand-primary)' : 'var(--border)'),
                    background: practiceMode ? 'rgba(29, 73, 180, 0.1)' : 'transparent',
                    color: practiceMode ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono-font)'
                  }}
                >
                  FREE PRACTICE
                </button>
                <button
                  onClick={() => setPracticeMode(false)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    borderRadius: '2px',
                    border: '1px solid ' + (!practiceMode ? 'var(--brand-primary)' : 'var(--border)'),
                    background: !practiceMode ? 'rgba(29, 73, 180, 0.1)' : 'transparent',
                    color: !practiceMode ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono-font)'
                  }}
                >
                  LEARNING PATH
                </button>
              </div>

              {operationState === 'IDLE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {machine.operations.map((op, idx) => {
                    const isCompleted = operationHistory.includes(op.id);
                    const isLocked = !practiceMode && idx > 0 && !operationHistory.includes(machine.operations[idx - 1].id);
                    const isFocused = focusedOpIdx === idx;
                    return (
                      <button
                        key={op.id}
                        onClick={() => { if (!isLocked) handleSelectOperation(op); }}
                        disabled={isLocked}
                        style={{
                          padding: '6px 10px',
                          background: isFocused ? 'rgba(29, 73, 180, 0.15)' : isCompleted ? 'rgba(82, 183, 136, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid ' + (isFocused ? 'var(--brand-primary)' : isCompleted ? 'var(--success)' : isLocked ? 'var(--border)' : 'var(--border)'),
                          borderRadius: '4px',
                          color: isLocked ? '#555' : isCompleted ? 'var(--success)' : '#FFF',
                          fontSize: '11px',
                          textAlign: 'left',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{op.name}</span>
                        {isCompleted && <span style={{ fontSize: '10px' }}>✓</span>}
                        {isLocked && <span style={{ fontSize: '10px' }}>🔒</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeOperation && operationState === 'PREVIEW' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--brand-secondary)', fontWeight: 'bold' }}>PREVIEW OPERATION</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0' }}>{activeOperation.name.toUpperCase()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{activeOperation.description}</div>
                    <div style={{ fontSize: '11.5px', marginTop: '6px' }}>
                      <strong>Work Area:</strong> {activeOperation.workArea}<br/>
                      <strong>Required Tool:</strong> {activeOperation.tool}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleStartOperationSim}
                      style={{
                        flex: 1,
                        background: 'var(--success)',
                        color: '#FFF',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      START OPERATION
                    </button>
                    <button
                      onClick={() => handleCancelOperation()}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        color: '#FFF',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {activeOperation && operationState === 'RUNNING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Machining {activeOperation.name}...</span>
                    <span>{operationProgress}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${operationProgress}%`, background: machine.color }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={handlePauseResumeOperation}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: '#FFF',
                        cursor: 'pointer'
                      }}
                    >
                      {isOpRunning ? 'PAUSE' : 'RESUME'}
                    </button>
                    <button
                      onClick={() => handleCancelOperation()}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: 'rgba(255, 23, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: '4px',
                        color: 'var(--danger)',
                        cursor: 'pointer'
                      }}
                    >
                      ABORT
                    </button>
                  </div>
                </div>
              )}

              {activeOperation && operationState === 'COMPLETED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: '4px', fontSize: '11px', lineHeight: '1.4' }}>
                    ✓ {activeOperation.name.toUpperCase()} COMPLETED SUCCESSFUL!<br/>
                    <span style={{ color: '#FFF', fontSize: '10.5px' }}>{activeOperation.educationalExplanation}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button
                      onClick={toggleBeforeAfter}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: '#FFF',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      COMPARE {beforeAfterMode === 'after' ? '(BEFORE)' : '(AFTER)'}
                    </button>
                    <button
                      onClick={handleResetOperation}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 109, 0, 0.1)',
                        border: '1px solid var(--brand-secondary)',
                        borderRadius: '4px',
                        color: 'var(--brand-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      RESET
                    </button>
                  </div>

                  <button
                    onClick={() => handleCloseOperationCard()}
                    style={{
                      width: '100%',
                      background: 'var(--brand-primary)',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    CONTINUE WORKSHOP
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Viewport camera/mode toggles */}
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
                onClick={() => { setIsExploded(!isExploded); if (assemblyComplete) resetAssembly(); }}
                style={{
                  background: isExploded ? 'rgba(29, 73, 180, 0.15)' : 'rgba(11, 23, 51, 0.85)',
                  border: '1px solid ' + (isExploded ? 'var(--brand-primary)' : 'var(--border)'),
                  color: isExploded ? '#FFFFFF' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                EXPLODED VIEW
              </button>
              <button
                onClick={() => setIsCutaway(!isCutaway)}
                style={{
                  background: isCutaway ? 'rgba(29, 73, 180, 0.15)' : 'rgba(11, 23, 51, 0.85)',
                  border: '1px solid ' + (isCutaway ? 'var(--brand-primary)' : 'var(--border)'),
                  color: isCutaway ? '#FFFFFF' : 'var(--text-secondary)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
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
                    background: cameraMode === cam.id ? 'rgba(29, 73, 180, 0.15)' : 'rgba(11, 23, 51, 0.85)',
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

        {/* COLUMN 3: STATUS / DIALOGUE / METROLOGY FEEDBACK */}
        <div 
          style={{ 
            borderLeft: '1px solid var(--border)', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            background: 'rgba(11, 23, 51, 0.4)',
            overflowY: 'auto'
          }}
        >
          {activeSubTab === 'operate' ? (
            // OPERATE MODE SUB-TABS (Tools, Measurement, Settings)
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              
              {/* Sidebar Header Tabs switcher */}
              <div 
                style={{ 
                  display: 'flex', 
                  borderBottom: '1px solid rgba(61, 114, 193, 0.25)', 
                  paddingBottom: '4px',
                  gap: '8px'
                }}
              >
                {['tools', 'measurement', 'settings'].map(tabId => (
                  <button
                    key={tabId}
                    onClick={() => setActiveRightTab(tabId)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeRightTab === tabId ? '2px solid var(--brand-primary)' : '2px solid transparent',
                      color: activeRightTab === tabId ? '#FFFFFF' : 'var(--text-secondary)',
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

              {/* Tab Outputs Panel */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                {activeRightTab === 'tools' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(MACHINE_TOOLS[selectedId] || ['Turning Tool']).map(t => {
                      const isSelected = selectedTool === t;
                      return (
                        <div
                          key={t}
                          onClick={() => {
                            setSelectedTool(t);
                            setSimTool(t);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: isSelected ? 'rgba(29, 73, 180, 0.08)' : 'rgba(11, 23, 51, 0.45)',
                            border: '1px solid ' + (isSelected ? 'var(--brand-primary)' : 'rgba(61, 114, 193, 0.15)'),
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {/* Mini desaturated illustration box representing tool */}
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              background: 'rgba(29, 73, 180, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Settings size={16} style={{ color: 'var(--brand-secondary)' }} />
                          </div>
                          
                          <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#FFFFFF' : 'var(--text-secondary)' }}>
                            {t}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeRightTab === 'measurement' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'rgba(11,23,51,0.5)', border: '1px solid rgba(61, 114, 193, 0.25)', padding: '16px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Quality Standard</span>
                        <strong style={{ color: 'var(--brand-secondary)' }}>ISO 2768</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Target Depth</span>
                        <strong style={{ color: '#FFFFFF' }}>36.00 mm</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tolerance Range</span>
                        <strong style={{ color: '#FFFFFF' }}>± 0.05 mm</strong>
                      </div>
                    </div>
                  </div>
                )}

                {activeRightTab === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-primary)' }} />
                      Enable Lubricant Coolant
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-primary)' }} />
                      Engage Automatic Feed Gear
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ accentColor: 'var(--brand-primary)' }} />
                      Imperial Units system (in)
                    </label>
                  </div>
                )}
              </div>

            </div>
          ) : (
            // OUTPUT PANELS FOR THE OTHER 8 SUB-TABS
            <>
              {activeSubTab === 'explorer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label">Component Details</span>
                  {activePart && (
                    <div style={{ borderLeft: `3px solid var(--brand-primary)`, paddingLeft: '12px', background: 'rgba(11,23,51,0.25)', padding: '16px', borderRadius: '4px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px' }}>{activePart.name}</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{activePart.desc}</p>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'identify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label">Diagnostics Response</span>
                  {identifyFeedback && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '4px',
                      background: identifySuccess ? 'rgba(46, 125, 50, 0.08)' : 'rgba(198, 40, 40, 0.08)',
                      border: '1px solid ' + (identifySuccess ? 'var(--success)' : 'var(--danger)'),
                      color: identifySuccess ? 'var(--success)' : 'var(--danger)',
                      fontSize: '11.5px',
                      lineHeight: '1.4'
                    }}>
                      {identifyFeedback}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'safety' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <span className="telemetry-label">Compliance Evaluation</span>
                    {safetyFeedback && (
                      <div style={{
                        padding: '10px',
                        background: safetyPassed ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
                        border: '1px solid ' + (safetyPassed ? 'var(--success)' : 'var(--danger)'),
                        color: safetyPassed ? 'var(--success)' : 'var(--danger)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        lineHeight: '1.4',
                        marginTop: '10px'
                      }}>
                        {safetyFeedback}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={checkSafety}
                    className="btn-login"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Verify Safety Compliance
                  </button>
                </div>
              )}

              {activeSubTab === 'setup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label">Mounting Status</span>
                  {setupPassed ? (
                    <div style={{ padding: '12px', background: 'rgba(46,125,50,0.08)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '4px', fontSize: '11px' }}>
                      ✓ Workpiece stock clamping completed. Simulator ready to run!
                    </div>
                  ) : (
                    <div style={{ padding: '12px', background: 'rgba(11,23,51,0.25)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Mount and secure raw stock metal to initiate operation.
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'experiments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label">Lab Telemetry Outputs</span>
                  {expResults && (
                    <div style={{ background: 'rgba(11,23,51,0.5)', border: '1px solid rgba(61, 114, 193, 0.25)', padding: '16px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Material Removal Rate:</span>
                        <strong style={{ color: 'var(--brand-primary)' }}>{expResults.mrr} mm³/s</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Cutting Heat Temp:</span>
                        <strong style={{ color: 'var(--brand-secondary)' }}>{expResults.temp} °C</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{expResults.roughnessLabel}:</span>
                        <strong style={{ color: 'var(--accent-light)' }}>{expResults.roughness}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'troubleshooting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <span className="telemetry-label">Diagnostics Response</span>
                    {troubleFeedback && (
                      <div style={{ 
                        padding: '10px', 
                        borderRadius: '4px', 
                        background: troublePassed ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)', 
                        border: '1px solid ' + (troublePassed ? 'var(--success)' : 'var(--danger)'), 
                        color: troublePassed ? 'var(--success)' : 'var(--danger)', 
                        fontSize: '11px', 
                        lineHeight: '1.4', 
                        marginTop: '10px' 
                      }}>
                        {troubleFeedback}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleCheckTroubleshoot} 
                    disabled={!selectedOptionId} 
                    className="btn-login" 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Submit Diagnosis
                  </button>
                </div>
              )}

              {activeSubTab === 'inspect' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label">Metrology Report</span>
                  {inspectFeedback && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '4px',
                      background: inspectSuccess ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
                      border: '1px solid ' + (inspectSuccess ? 'var(--success)' : 'var(--danger)'),
                      color: inspectSuccess ? 'var(--success)' : 'var(--danger)',
                      fontSize: '11.5px',
                      lineHeight: '1.4'
                    }}>
                      {inspectFeedback}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'scorecard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span className="telemetry-label">Performance Scorecard</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(11,23,51,0.5)', border: '1px solid rgba(61, 114, 193, 0.25)', padding: '16px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Safety Rating:</span>
                      <strong style={{ color: 'var(--success)' }}>100% compliant</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Machining Accuracy:</span>
                      <strong style={{ color: 'var(--brand-secondary)' }}>Within ±0.02 mm</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>XP Awarded:</span>
                      <strong style={{ color: 'var(--brand-primary)' }}>+250 XP</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Badge Earned:</span>
                      <strong style={{ color: 'var(--accent-light)', textTransform: 'uppercase' }}>{selectedId} apprentice</strong>
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
