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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', background: 'var(--bg-primary)' }}>
      
      {/* 1. Category Switcher (1-7 machines) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          padding: '12px 24px', 
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface)'
        }}
      >
        {Object.values(MACHINES).map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid ' + (selectedId === m.id ? m.color : 'var(--border-light)'),
              background: selectedId === m.id ? `${m.color}12` : 'transparent',
              color: selectedId === m.id ? m.color : 'var(--color-text-secondary)',
              fontWeight: '700',
              textTransform: 'uppercase',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {m.id.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main split viewport layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 3fr 1.5fr', height: '100%', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: 9-Stage Learning Navigation */}
        <div 
          style={{ 
            borderRight: '1px solid var(--border-light)', 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            background: 'var(--surface)',
            overflowY: 'auto'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{machine.name}</h3>
            <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.4' }}>"{machine.tagline}"</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeSubTab === tab.id ? 'rgba(29, 73, 180, 0.08)' : 'transparent',
                    color: activeSubTab === tab.id ? machine.color : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: activeSubTab === tab.id ? '700' : '500',
                    fontSize: '11.5px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            <strong>Safety/Workflow Status:</strong><br/>
            {safetyPassed ? '✓ Safety Compliant' : '⚠ Safety Verification Required'}<br/>
            {setupPassed ? '✓ Workpiece Clamped' : '⚠ Setup Mounting Required'}
          </div>
        </div>

        {/* CENTER COLUMN: Immersive 3D Viewport Window */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, width: '100%', height: '100%' }}>
            <ThreeVisualizer
              machineId={selectedId}
              selectedPartId={selectedPartId}
              focusedPartId={focusedPartId}
              onPartSelect={handlePartSelect}
              isExploded={isExploded}
              isCutaway={isCutaway}
              isPlaying={isPlaying}
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
            />
          </div>

          {/* Workpiece Operations Floating Panel */}
          {isWorkpieceSelected(selectedPartId, selectedId) && (
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '20px',
              width: '320px',
              background: 'rgba(16, 24, 32, 0.95)',
              border: '1px solid var(--accent-orange)',
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
                <strong style={{ fontSize: '12px', color: 'var(--accent-orange)', fontFamily: 'var(--mono-font)' }}>
                  {machine.name.toUpperCase()} OPERATIONS
                </strong>
                <button
                  onClick={() => handlePartSelect(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <button
                  onClick={() => setPracticeMode(true)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '9px',
                    borderRadius: '2px',
                    border: '1px solid ' + (practiceMode ? 'var(--accent-orange)' : 'var(--border)'),
                    background: practiceMode ? 'rgba(242,140,40,0.1)' : 'transparent',
                    color: practiceMode ? 'var(--accent-orange)' : 'var(--color-text-secondary)',
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
                    border: '1px solid ' + (!practiceMode ? 'var(--accent-orange)' : 'var(--border)'),
                    background: !practiceMode ? 'rgba(242,140,40,0.1)' : 'transparent',
                    color: !practiceMode ? 'var(--accent-orange)' : 'var(--color-text-secondary)',
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
                          background: isFocused ? 'rgba(242, 140, 40, 0.15)' : isCompleted ? 'rgba(82, 183, 136, 0.08)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid ' + (isFocused ? 'var(--accent-orange)' : isCompleted ? 'var(--color-green)' : isLocked ? 'var(--border-light)' : 'var(--border)'),
                          borderRadius: '4px',
                          color: isLocked ? '#555' : isCompleted ? 'var(--color-green)' : '#FFF',
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
                    <div style={{ fontSize: '9px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>PREVIEW OPERATION</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0' }}>{activeOperation.name.toUpperCase()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{activeOperation.description}</div>
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
                        background: 'var(--color-green)',
                        color: '#000',
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
                        border: '1px solid var(--color-red)',
                        borderRadius: '4px',
                        color: 'var(--color-red)',
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
                  <div style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid var(--color-green)', color: 'var(--color-green)', padding: '10px', borderRadius: '4px', fontSize: '11px', lineHeight: '1.4' }}>
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
                        border: '1px solid var(--accent-orange)',
                        borderRadius: '4px',
                        color: 'var(--accent-orange)',
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
                      background: machine.color,
                      color: '#000',
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

          {/* Viewport toggles */}
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
                  background: isExploded ? 'rgba(242, 140, 40, 0.12)' : 'rgba(21, 23, 25, 0.85)',
                  border: '1px solid ' + (isExploded ? 'var(--accent-orange)' : 'var(--border)'),
                  color: isExploded ? 'var(--accent-orange)' : 'var(--text-primary)',
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
                  background: isCutaway ? 'rgba(242, 140, 40, 0.12)' : 'rgba(21, 23, 25, 0.85)',
                  border: '1px solid ' + (isCutaway ? 'var(--accent-orange)' : 'var(--border)'),
                  color: isCutaway ? 'var(--accent-orange)' : 'var(--text-primary)',
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
                    background: cameraMode === cam.id ? 'rgba(242, 140, 40, 0.12)' : 'rgba(21, 23, 25, 0.85)',
                    border: '1px solid ' + (cameraMode === cam.id ? 'var(--accent-orange)' : 'var(--border)'),
                    color: cameraMode === cam.id ? 'var(--accent-orange)' : 'var(--text-primary)',
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

        {/* RIGHT COLUMN: Interactive Control Panels */}
        <div 
          style={{ 
            borderLeft: '1px solid var(--border-light)', 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            background: 'var(--surface)',
            overflowY: 'auto'
          }}
        >
          {isWorkpieceSelected(selectedPartId, selectedId) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-primary)' }}>
              <span className="telemetry-label">WORKPIECE / OPERATIONS</span>
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '12px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span>Material:</span>
                  <strong style={{ color: machine.color }}>Steel</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span>Status:</span>
                  <strong style={{ color: 'var(--color-green)' }}>{operationState}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span>Operations Available:</span>
                  <strong style={{ color: 'var(--primary-blue)' }}>{machine.operations.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span>Last Operation:</span>
                  <strong style={{ color: '#FFF' }}>
                    {operationHistory.length > 0 ? machine.operations.find(o=>o.id===operationHistory[operationHistory.length-1])?.name || 'None' : 'None'}
                  </strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <span className="telemetry-label">Select Action</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {machine.operations.map((op, idx) => {
                    const isCompleted = operationHistory.includes(op.id);
                    const isFocused = focusedOpIdx === idx;
                    return (
                      <button
                        key={op.id}
                        onClick={() => handleSelectOperation(op)}
                        style={{
                          padding: '8px 12px',
                          background: isCompleted ? 'rgba(82, 183, 136, 0.08)' : isFocused ? 'rgba(242,140,40,0.05)' : 'transparent',
                          border: '1px solid ' + (isFocused ? 'var(--accent-orange)' : 'var(--border)'),
                          color: isCompleted ? 'var(--color-green)' : '#FFF',
                          borderRadius: '4px',
                          fontSize: '11px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{op.name}</span>
                        {isCompleted && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeSubTab === 'explorer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="telemetry-label">3D Component Inspector</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                {machine.parts.map((p) => {
                  const isSelected = selectedPartId === p.id;
                  const isFocused = focusedPartId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePartSelect(p.id)}
                      onFocus={() => setFocusedPartId(p.id)}
                      onBlur={() => { if (focusedPartId === p.id) setFocusedPartId(null); }}
                      style={{
                        padding: '8px 12px',
                        background: isSelected ? 'rgba(29, 73, 180, 0.08)' : 'rgba(194, 202, 217, 0.08)',
                        border: isFocused ? '2px solid var(--primary-blue)' : '1px solid ' + (isSelected ? 'var(--primary-blue)' : 'var(--border)'),
                        borderRadius: '4px',
                        color: isSelected ? 'var(--primary-blue)' : 'var(--text-primary)',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: isSelected ? '700' : '500',
                        cursor: 'pointer',
                        boxShadow: isFocused ? '0 0 8px var(--primary-blue)' : 'none',
                        outline: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{p.name.toUpperCase()}</span>
                      {isSelected && <span style={{ fontSize: '10px' }}>●</span>}
                    </button>
                  );
                })}
              </div>

              {activePart && (
                <div style={{ borderLeft: `3px solid ${machine.color}`, paddingLeft: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{activePart.name}</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    {activePart.desc}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Identify Part Game */}
          {activeSubTab === 'identify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="telemetry-label">Part Identification Challenge</span>
              {identifyTargetPart && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <p style={{ fontSize: '12px', color: '#FFF', fontWeight: 'bold' }}>
                    Goal: Click the <span style={{ color: machine.color }}>[ {identifyTargetPart.name} ]</span> on the 3D model, or select it below.
                  </p>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {machine.parts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePartSelect(p.id)}
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: '#FFF',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {identifyFeedback && (
                <div style={{
                  padding: '10px',
                  borderRadius: '4px',
                  background: identifySuccess ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)',
                  border: '1px solid ' + (identifySuccess ? 'var(--color-green)' : 'var(--color-red)'),
                  color: identifySuccess ? 'var(--color-green)' : 'var(--color-red)',
                  fontSize: '11.5px',
                  lineHeight: '1.4'
                }}>
                  {identifyFeedback}
                </div>
              )}
            </div>
          )}

          {/* Safety Locker */}
          {activeSubTab === 'safety' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <span className="telemetry-label">Safety Compliance Check</span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Select required PPE before starting operations.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {[
                    { id: 'goggles', label: 'Safety Goggles' },
                    { id: 'gloves', label: 'Heavy Duty Leather Gloves' },
                    { id: 'clothing', label: 'Tight Shop Clothing' },
                    { id: 'shoes', label: 'Steel Safety Shoes' },
                    { id: 'shield', label: 'Welding UV Visor Mask' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSafetyToggle(item.id)}
                      style={{
                        padding: '10px',
                        background: safetyItems[item.id] ? 'rgba(242, 140, 40, 0.05)' : 'var(--surface)',
                        border: '1px solid ' + (safetyItems[item.id] ? 'var(--accent-orange)' : 'var(--border)'),
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left',
                        color: '#FFF',
                        transition: 'all 0.2s'
                      }}
                    >
                      {item.label} {safetyItems[item.id] ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {safetyFeedback && (
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '4px', 
                    background: safetyPassed ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)',
                    border: '1px solid ' + (safetyPassed ? 'var(--color-green)' : 'var(--color-red)'),
                    color: safetyPassed ? 'var(--color-green)' : 'var(--color-red)',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    marginBottom: '10px'
                  }}>
                    {safetyFeedback}
                  </div>
                )}
                <button 
                  onClick={checkSafety}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  VERIFY COMPLIANCE
                </button>
              </div>
            </div>
          )}

          {/* Setup Assembly */}
          {activeSubTab === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <span className="telemetry-label">Assembly & Clamping Workbench</span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Mount and clamp raw materials to get machine ready.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => toggleSetupChecklist('stockSecured')}
                    style={{
                      padding: '10px',
                      background: setupChecklist.stockSecured ? 'rgba(82, 183, 136, 0.08)' : 'transparent',
                      border: '1px solid ' + (setupChecklist.stockSecured ? 'var(--color-green)' : 'var(--border)'),
                      color: '#FFF', fontSize: '11.5px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    Mount Raw Workpiece Stock {setupChecklist.stockSecured ? '✓' : ''}
                  </button>
                  <button
                    onClick={() => toggleSetupChecklist('toolClamped')}
                    style={{
                      padding: '10px',
                      background: setupChecklist.toolClamped ? 'rgba(82, 183, 136, 0.08)' : 'transparent',
                      border: '1px solid ' + (setupChecklist.toolClamped ? 'var(--color-green)' : 'var(--border)'),
                      color: '#FFF', fontSize: '11.5px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    Clamp Cutting Tool bit {setupChecklist.toolClamped ? '✓' : ''}
                  </button>
                  <button
                    onClick={() => toggleSetupChecklist('safetyGuardAligned')}
                    style={{
                      padding: '10px',
                      background: setupChecklist.safetyGuardAligned ? 'rgba(82, 183, 136, 0.08)' : 'transparent',
                      border: '1px solid ' + (setupChecklist.safetyGuardAligned ? 'var(--color-green)' : 'var(--border)'),
                      color: '#FFF', fontSize: '11.5px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    Align Protective Shield Shield {setupChecklist.safetyGuardAligned ? '✓' : ''}
                  </button>
                </div>
              </div>

              <div>
                {setupPassed ? (
                  <div style={{ padding: '10px', background: 'rgba(0, 230, 118, 0.08)', border: '1px solid var(--color-green)', color: 'var(--color-green)', borderRadius: '4px', fontSize: '11px' }}>
                    ✓ Workpiece setup lock complete. Simulator ready!
                  </div>
                ) : (
                  <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', fontSize: '11px' }}>
                    Mount raw metal workpiece to proceed.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operate Simulator */}
          {activeSubTab === 'operate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="telemetry-label">Operation Simulator Cockpit</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Status:</span>
                {machineState === 'READY' && <span style={{ color: '#FFF', fontSize: '10px', fontWeight: 'bold' }}>● READY</span>}
                {machineState === 'RUNNING' && <span style={{ color: 'var(--color-green)', fontSize: '10px', fontWeight: 'bold' }}>● RUNNING</span>}
                {machineState === 'WARNING' && <span style={{ color: 'var(--color-red)', fontSize: '10px', fontWeight: 'bold' }}>⚠ WARNING</span>}
                {machineState === 'COMPLETED' && <span style={{ color: 'var(--color-green)', fontSize: '10px', fontWeight: 'bold' }}>✓ COMPLETED</span>}
              </div>

              {!safetyPassed || !setupPassed ? (
                <div style={{ padding: '12px', background: 'rgba(255, 109, 0, 0.08)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)', fontSize: '11px', borderRadius: '4px' }}>
                  ⚠ ACCESS LOCKED: Verify safety checklist (tab 3) and workpiece mounting (tab 4) before operation.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <h5 style={{ fontSize: '11px', color: '#FFF' }}>Workpiece Material:</h5>
                    <div style={{ padding: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '11px' }}>
                      {machine.simulator.materialOptions[0]}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>Cutting Parameters Speed (RPM / Current):</span>
                      <strong>{simParams.speed}</strong>
                    </div>
                    <input type="range" min={machine.simulator.paramRanges.speed.min} max={machine.simulator.paramRanges.speed.max} value={simParams.speed} onChange={(e) => setSimParams({...simParams, speed: parseInt(e.target.value)})} style={{ width: '100%', accentColor: machine.color }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>Feed Rate (mm/rev):</span>
                      <strong>{simParams.feed}</strong>
                    </div>
                    <input type="range" min={machine.simulator.paramRanges.feed.min*100} max={machine.simulator.paramRanges.feed.max*100} value={simParams.feed*100} onChange={(e) => setSimParams({...simParams, feed: parseFloat((parseInt(e.target.value)/100).toFixed(2))})} style={{ width: '100%', accentColor: machine.color }} />
                  </div>

                  {isSimRunning ? (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                        <span>Machining Progress...</span>
                        <span>{simProgressPercent}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${simProgressPercent}%`, background: machine.color }}></div>
                      </div>
                    </div>
                  ) : (
                     <button onClick={handleStartSim} className="btn-primary" style={{ background: 'var(--success)', border: '1px solid var(--success)', color: '#FFFFFF' }}>
                       START 3D OPERATION
                     </button>
                  )}
                </div>
              )}

              {simFeedback && (
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px' }}>
                  {simFeedback}
                </div>
              )}
            </div>
          )}

          {/* Experiment Lab */}
          {activeSubTab === 'experiments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="telemetry-label">Variables Optimization Lab</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {machine.experiments.variables.map(v => (
                  <div key={v.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span>{v.name}</span>
                      <strong style={{ color: machine.color }}>{expVariables[v.id] || v.default}</strong>
                    </div>
                    <input type="range" min={v.min} max={v.max} step={v.step} value={expVariables[v.id] || v.default} onChange={(e)=>handleVariableChange(v.id, e.target.value)} style={{ width: '100%', accentColor: machine.color }} />
                  </div>
                ))}
              </div>

              {expResults && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span className="telemetry-label">Lab Telemetry Outputs</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span>Material Removal Rate:</span>
                    <strong style={{ color: 'var(--accent-orange)' }}>{expResults.mrr} mm³/s</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span>Cutting Heat Temp:</span>
                    <strong style={{ color: 'var(--accent-amber)' }}>{expResults.temp} °C</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span>{expResults.roughnessLabel}:</span>
                    <strong style={{ color: 'var(--color-green)' }}>{expResults.roughness}</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Troubleshooting */}
          {activeSubTab === 'troubleshooting' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <span className="telemetry-label">Machine Fault Diagnostics</span>
                <h5 style={{ fontSize: '13px', color: '#FFF', marginTop: '6px' }}>{machine.troubleshoot[troubleIdx].title}</h5>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{machine.troubleshoot[troubleIdx].desc}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {machine.troubleshoot[troubleIdx].options.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedOptionId(opt.id)} style={{ padding: '10px', background: selectedOptionId === opt.id ? 'rgba(242, 140, 40, 0.05)' : 'transparent', border: '1px solid ' + (selectedOptionId === opt.id ? 'var(--accent-orange)' : 'var(--border)'), borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px', textAlign: 'left', color: '#FFF' }}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {troubleFeedback && (
                  <div style={{ padding: '10px', borderRadius: '4px', background: troublePassed ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)', border: '1px solid ' + (troublePassed ? 'var(--color-green)' : 'var(--color-red)'), color: troublePassed ? 'var(--color-green)' : 'var(--color-red)', fontSize: '11px', lineHeight: '1.4', marginBottom: '10px' }}>
                    {troubleFeedback}
                  </div>
                )}
                 <button onClick={handleCheckTroubleshoot} disabled={!selectedOptionId} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>SUBMIT DIAGNOSIS</button>
              </div>
            </div>
          )}

          {/* Inspect Part */}
          {activeSubTab === 'inspect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <span className="telemetry-label">Quality Control Metrology</span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Use digital calipers to measure target dimension tolerances of finished part.
                </p>

                 <button 
                   onClick={handleInspectCaliper}
                   className="btn-primary"
                   style={{ marginTop: '12px' }}
                 >
                   Measure Workpiece
                 </button>
              </div>

              {inspectFeedback && (
                <div style={{
                  padding: '12px',
                  borderRadius: '4px',
                  background: inspectSuccess ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)',
                  border: '1px solid ' + (inspectSuccess ? 'var(--color-green)' : 'var(--color-red)'),
                  color: inspectSuccess ? 'var(--color-green)' : 'var(--color-red)',
                  fontSize: '11.5px',
                  lineHeight: '1.4'
                }}>
                  {inspectFeedback}
                </div>
              )}
            </div>
          )}

          {/* Scorecard */}
          {activeSubTab === 'scorecard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className="telemetry-label">Completed Performance Scorecard</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Safety Rating:</span>
                  <strong style={{ color: 'var(--color-green)' }}>100% compliant</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Machining Accuracy:</span>
                  <strong style={{ color: 'var(--accent-orange)' }}>Within ±0.02 mm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>XP Awarded:</span>
                  <strong style={{ color: 'var(--accent-orange)' }}>+400 XP</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Earned Certification Badge:</span>
                  <strong style={{ color: 'var(--accent-amber)' }}>{selectedId.toUpperCase()} APPRENTICE</strong>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
