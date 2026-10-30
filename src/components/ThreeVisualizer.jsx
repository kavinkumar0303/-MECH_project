import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProceduralWorkpieceManager } from '../simulation/proceduralWorkpieces';
import { SIMULATION_OPERATIONS } from '../simulation/simulationConfig';
import { workshopAudio } from '../simulation/workshopAudio';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Flame, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

const labelsData = {
  lathe: [
    { id: 'bed', name: 'Bed' },
    { id: 'headstock', name: 'Headstock' },
    { id: 'gearbox_controls', name: 'Gearbox Controls' },
    { id: 'drive_controls', name: 'Drive Controls' },
    { id: 'chuck', name: 'Chuck' },
    { id: 'spindle', name: 'Spindle' },
    { id: 'workpiece', name: 'Workpiece' },
    { id: 'carriage', name: 'Carriage' },
    { id: 'cross_slide', name: 'Cross Slide' },
    { id: 'compound_rest', name: 'Compound Rest' },
    { id: 'tool_post', name: 'Tool Post' },
    { id: 'cutting_tool', name: 'Cutting Tool' },
    { id: 'tailstock', name: 'Tailstock' },
    { id: 'tailstock_base', name: 'Tailstock Base' },
    { id: 'lead_screw', name: 'Lead Screw' },
    { id: 'feed_box', name: 'Feed Box' },
    { id: 'rack', name: 'Rack' },
    { id: 'coolant_system', name: 'Coolant System' },
    { id: 'feed_rod', name: 'Feed Rod' },
    { id: 'handwheels', name: 'Hand Wheels' },
    { id: 'drive_system', name: 'Motor / Drive System' },
    { id: 'chip_tray', name: 'Chip Tray' },
    { id: 'splash_guard', name: 'Splash Guard' },
    { id: 'steady_rest', name: 'Steady Rest' }
  ],
  welding: [
    { id: 'welding_table', name: 'Welding Table' },
    { id: 'welding_machine', name: 'Welding Machine' },
    { id: 'electrode_holder', name: 'Torch / Holder' },
    { id: 'cables', name: 'Cables' },
    { id: 'ground_clamp', name: 'Ground Clamp' },
    { id: 'metal_plates', name: 'Metal Plates' },
    { id: 'clamps', name: 'Clamps' },
    { id: 'weld_joint', name: 'Weld Joint' },
    { id: 'ppe', name: 'PPE Shield' }
  ],
  shaper: [
    { id: 'base', name: 'Base' },
    { id: 'column', name: 'Column' },
    { id: 'ram', name: 'Ram' },
    { id: 'tool_head', name: 'Tool Head' },
    { id: 'cutting_tool', name: 'Cutting Tool' },
    { id: 'table', name: 'Table' },
    { id: 'vice', name: 'Vice' },
    { id: 'clapper_box', name: 'Clapper Box' },
    { id: 'workpiece', name: 'Workpiece' }
  ],
  planer: [
    { id: 'table', name: 'Large Table' },
    { id: 'workpiece', name: 'Workpiece' },
    { id: 'housing', name: 'Columns' },
    { id: 'cross_rail', name: 'Cross Rail' },
    { id: 'tool_head', name: 'Tool Head' },
    { id: 'cutting_tool', name: 'Cutting Tool' },
    { id: 'clamps', name: 'Clamps' }
  ],
  milling: [
    { id: 'base', name: 'Base' },
    { id: 'column', name: 'Column' },
    { id: 'spindle', name: 'Spindle' },
    { id: 'motor_head', name: 'Motor Head' },
    { id: 'cutter', name: 'Cutter' },
    { id: 'table', name: 'Table' },
    { id: 'vice', name: 'Vice' },
    { id: 'workpiece', name: 'Workpiece' },
    { id: 'handwheels', name: 'Hand Wheels' }
  ],
  casting: [
    { id: 'pattern', name: 'Pattern' },
    { id: 'cope_flask', name: 'Cope' },
    { id: 'drag_flask', name: 'Drag' },
    { id: 'sprue', name: 'Sprue' },
    { id: 'runner', name: 'Runner' },
    { id: 'riser', name: 'Riser' },
    { id: 'ladle', name: 'Ladle' },
    { id: 'casting_cavity', name: 'Casting Cavity' }
  ],
  moulding: [
    { id: 'pattern', name: 'Pattern' },
    { id: 'cope', name: 'Cope Box' },
    { id: 'drag', name: 'Drag Box' },
    { id: 'flask', name: 'Flask' },
    { id: 'sand', name: 'Mould Sand' },
    { id: 'cavity', name: 'Cavity' },
    { id: 'sprue', name: 'Sprue Pin' },
    { id: 'runner', name: 'Runner' },
    { id: 'riser', name: 'Riser' }
  ]
};

export default function ThreeVisualizer({
  machineId,
  selectedPartId,
  focusedPartId,
  onPartSelect,
  isExploded,
  isCutaway,
  isPlaying,
  simStep,
  simParams = { speed: 750, feed: 0.12, doc: 0.8 },
  activeSubTab,
  assembledParts,
  onAssemblyComplete,
  onAssemblySuccess,
  cameraMode,
  setCameraMode,
  showLabels = true,
  highContrast = false,
  toolPosition = { x: 0, y: 0, z: 0 },
  activeOperation,
  operationProgress = 0,
  operationState = 'IDLE',
  onSelectOperation,
  onStartSimulation,
  onPauseResumeSimulation,
  onResetSimulation,
  onUpdateSimParams,
  beforeAfterMode = 'after',
  onToggleBeforeAfter,
  isLogin = false,
  immersiveUi = false
}) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isDraggingTool, setIsDraggingTool] = useState(false);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const groupsRef = useRef({});
  const animFrameIdRef = useRef(null);

  const selectedHelperRef = useRef(null);
  const focusedHelperRef = useRef(null);
  const hoverHelperRef = useRef(null);

  const isPlayingRef = useRef(isPlaying);
  const simParamsRef = useRef(simParams);
  const simStepRef = useRef(simStep);
  const toolPositionRef = useRef(toolPosition);
  
  const activeOperationRef = useRef(activeOperation);
  const operationProgressRef = useRef(operationProgress);
  const operationStateRef = useRef(operationState);
  const selectedPartIdRef = useRef(selectedPartId);

  const machineOperations = SIMULATION_OPERATIONS[machineId] || [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    simParamsRef.current = simParams;
    simStepRef.current = simStep;
    toolPositionRef.current = toolPosition;
    
    activeOperationRef.current = activeOperation;
    operationProgressRef.current = operationProgress;
    operationStateRef.current = operationState;
    selectedPartIdRef.current = selectedPartId;

    // Audio Synchronization
    if (operationState === 'RUNNING' && !isAudioMuted) {
      const opId = typeof activeOperation === 'object' ? activeOperation?.id : activeOperation;
      workshopAudio.playOperationSound(machineId, opId, simParams?.speed || 750);
    } else {
      workshopAudio.stopSound();
    }
  }, [isPlaying, simParams, simStep, toolPosition, activeOperation, operationProgress, operationState, selectedPartId, machineId, isAudioMuted]);

  // Adjust camera targets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (cameraMode) {
      case 'close_up':
        camera.position.set(3, 1.8, 3.5);
        controls.target.set(0, 0, 0);
        break;
      case 'top_view':
        camera.position.set(0, 10, 0.1);
        controls.target.set(0, 0, 0);
        break;
      case 'front_view':
        camera.position.set(0, 2, 7);
        controls.target.set(0, 0.2, 0);
        break;
      case 'operation':
        camera.position.set(3.8, 2.0, 4.5);
        controls.target.set(0.1, 0.3, 0.4);
        break;
      case 'default':
      default:
        camera.position.set(7.8, 4.6, 10.8);
        controls.target.set(0, -0.15, 0);
        break;
    }
    controls.update();
  }, [cameraMode]);

  // Center camera on selected part
  useEffect(() => {
    if (!selectedPartId || !groupsRef.current[selectedPartId] || !controlsRef.current || !cameraRef.current) return;
    const group = groupsRef.current[selectedPartId];
    const targetPos = new THREE.Vector3();
    group.getWorldPosition(targetPos);

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    controls.target.copy(targetPos);
    camera.position.set(targetPos.x + 2.5, targetPos.y + 1.8, targetPos.z + 2.5);
    controls.update();
  }, [selectedPartId]);

  useEffect(() => {
    setLoading(true);
    
    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 360;

    const isDark = !isLogin;
    const scene = new THREE.Scene();
    scene.background = machineId === 'lathe' ? new THREE.Color('#dfe7e6') : new THREE.Color('#0B1014');
    if (machineId === 'lathe') {
      scene.fog = new THREE.Fog('#dfe7e6', 12, 32);
    }
    sceneRef.current = scene;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: '#1B2329', 
      roughness: 0.8, 
      metalness: 0.15 
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.80;
    floorMesh.visible = machineId === 'lathe';
    if (machineId === 'lathe') {
      floorMesh.receiveShadow = true;
      floorMat.color.set('#8f9897');
      floorMat.roughness = 0.92;
      floorMat.metalness = 0.03;
    }
    scene.add(floorMesh);

    // Clean, light industrial workshop backdrop for the lathe view.
    if (machineId === 'lathe') {
      const wallMat = new THREE.MeshStandardMaterial({ color: '#cbd2d0', roughness: 0.92, metalness: 0.02 });
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(32, 15), wallMat);
      wall.position.set(0, 5.5, -7.0);
      wall.receiveShadow = true;
      scene.add(wall);

      const beamMat = new THREE.MeshStandardMaterial({ color: '#697477', roughness: 0.65, metalness: 0.2 });
      [-8, 0, 8].forEach((x) => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 10, 0.22), beamMat);
        beam.position.set(x, 3.2, -6.85);
        scene.add(beam);
      });

      const windowFrame = new THREE.MeshStandardMaterial({ color: '#56656a', metalness: 0.55, roughness: 0.35 });
      const glassMat = new THREE.MeshStandardMaterial({ color: '#a8c7cf', transparent: true, opacity: 0.55, roughness: 0.18, metalness: 0.05 });
      [-7.2, 7.2].forEach((x) => {
        const glass = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.8, 0.05), glassMat);
        glass.position.set(x, 5.1, -6.9);
        scene.add(glass);
        for (let i = -1; i <= 1; i++) {
          const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.85, 0.10), windowFrame);
          mullion.position.set(x + i * 1.1, 5.1, -6.84);
          scene.add(mullion);
        }
        const sill = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.10, 0.18), windowFrame);
        sill.position.set(x, 3.67, -6.82);
        scene.add(sill);
      });

      const cabinetMat = new THREE.MeshStandardMaterial({ color: '#405b62', metalness: 0.45, roughness: 0.48 });
      const benchMat = new THREE.MeshStandardMaterial({ color: '#6e6a5e', metalness: 0.2, roughness: 0.68 });
      const bench = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.18, 0.85), benchMat);
      bench.position.set(0, 1.0, -5.95);
      scene.add(bench);
      [-3.3, -1.1, 1.1, 3.3].forEach((x) => {
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 0.72), cabinetMat);
        cabinet.position.set(x, 0.08, -5.96);
        scene.add(cabinet);
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.045, 0.04), polishedPlaceholder());
        handle.position.set(x, 0.28, -5.56);
        scene.add(handle);
      });

      const lightMat = new THREE.MeshStandardMaterial({ color: '#e7eceb', emissive: '#fff3cf', emissiveIntensity: 1.8 });
      [-5, 0, 5].forEach((x) => {
        const fixture = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.10, 0.28), lightMat);
        fixture.position.set(x, 9.0, -1.8);
        scene.add(fixture);
        const lamp = new THREE.PointLight('#fff0cf', 2.1, 9);
        lamp.position.set(x, 8.7, -1.4);
        scene.add(lamp);
      });

      // Four visible floor anchor plates keep the lathe visually grounded.
      const anchorMat = new THREE.MeshStandardMaterial({ color: '#4b5354', metalness: 0.82, roughness: 0.30 });
      [[-1.78,-0.32],[-1.78,0.32],[1.78,-0.32],[1.78,0.32]].forEach(([x,z]) => {
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.055, 0.28), anchorMat);
        plate.position.set(x, -1.825, z);
        plate.receiveShadow = true;
        scene.add(plate);
      });

      function polishedPlaceholder() {
        return new THREE.MeshStandardMaterial({ color: '#aeb7b7', metalness: 0.85, roughness: 0.22 });
      }
    }

    // Grid is retained only for the non-immersive machine views.
    if (machineId !== 'lathe') {
      const gridHelper = new THREE.GridHelper(50, 50, 0x475569, 0x26323A);
      gridHelper.position.y = -1.99;
      gridHelper.visible = false;
    scene.add(gridHelper);
    }

    // Wall & pillars
    if (isDark && machineId !== 'lathe') {
      const wallGeo = new THREE.PlaneGeometry(40, 20);
      const wallMat = new THREE.MeshStandardMaterial({
        color: '#1B2329',
        roughness: 0.8,
        metalness: 0.1
      });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(0, 4, -8);
      wallMesh.visible = false;
      scene.add(wallMesh);

      const pillarGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: '#232D34',
        roughness: 0.6,
        metalness: 0.2
      });
      const pillar1 = new THREE.Mesh(pillarGeo, pillarMat);
      pillar1.position.set(-9, 4, -7.8);
      pillar1.visible = false;
      scene.add(pillar1);
      
      const pillar2 = new THREE.Mesh(pillarGeo, pillarMat);
      pillar2.position.set(9, 4, -7.8);
      pillar2.visible = false;
      scene.add(pillar2);

      // Conduit pipes
      const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 24, 16);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: '#6B7280',
        metalness: 0.9,
        roughness: 0.2
      });
      
      const pipe1 = new THREE.Mesh(pipeGeo, pipeMat);
      pipe1.position.set(0, 5.0, -7.7);
      pipe1.rotation.z = Math.PI / 2;
      pipe1.visible = false;
      scene.add(pipe1);

      // Platform slab
      const platformGeo = new THREE.BoxGeometry(6.6, 0.15, 3.2);
      const platformMat = new THREE.MeshStandardMaterial({
        color: '#29343C',
        roughness: 0.4,
        metalness: 0.3
      });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(0, -1.92, 0);
      platform.visible = false;
      scene.add(platform);

      // Neon pink/cyan underglow strip
      const underglowGeo = new THREE.BoxGeometry(5.4, 0.04, 0.04);
      const underglowMat = new THREE.MeshStandardMaterial({
        color: '#6B7280',
        emissive: '#FF5376',
        emissiveIntensity: 6.0,
        roughness: 0.1
      });
      const underglow = new THREE.Mesh(underglowGeo, underglowMat);
      underglow.position.set(0, -1.83, 0.9);
      underglow.visible = false;
      scene.add(underglow);

      const floorBounceGlow = new THREE.PointLight('#9CA3AF', 1.0, 10);
      floorBounceGlow.position.set(0, -1.88, 0);
      scene.add(floorBounceGlow);

      const cyanAccentLight = new THREE.PointLight('#CBD5E1', 0.9, 8);
      cyanAccentLight.position.set(0, -1.88, -0.9);
      scene.add(cyanAccentLight);
    }

    // Radial shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(15, 20, 22, 0.62)');
    grad.addColorStop(0.5, 'rgba(15, 20, 22, 0.28)');
    grad.addColorStop(1, 'rgba(15, 20, 22, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(8, 4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.805;
    scene.add(shadowMesh);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 4, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = machineId === 'lathe' ? 1.15 : 1.35;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2.5;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#E2DED4', highContrast ? 2.0 : (machineId === 'lathe' ? 1.55 : 1.15));
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#FFE8B8', highContrast ? 3.0 : (machineId === 'lathe' ? 2.65 : 2.35));
    mainLight.position.set(7, 12, 6);
    mainLight.castShadow = machineId === 'lathe';
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight('#8FB8C8', highContrast ? 1.8 : (machineId === 'lathe' ? 1.35 : 1.25));
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    const magentaSpotLight = new THREE.PointLight('#DDAE65', highContrast ? 1.0 : (machineId === 'lathe' ? 0.65 : 0.55), 18);
    magentaSpotLight.position.set(-3, 4, 3);
    scene.add(magentaSpotLight);
    const orangeSpotLight = new THREE.PointLight('#FFB45B', 0.7, 5);
    orangeSpotLight.position.set(0, 0.7, 0.9);
    scene.add(orangeSpotLight);

    // Materials dictionary
    const mats = {
      machineBody: new THREE.MeshStandardMaterial({ color: '#3E4A59', metalness: 0.86, roughness: 0.30 }),
      secondaryMetal: new THREE.MeshStandardMaterial({ color: '#B8C1CC', metalness: 0.96, roughness: 0.16 }),
      darkMechanicalParts: new THREE.MeshStandardMaterial({ color: '#20262D', metalness: 0.82, roughness: 0.34 }),
      shafts: new THREE.MeshStandardMaterial({ color: '#D7DEE6', metalness: 0.98, roughness: 0.10 }),
      workpiece: new THREE.MeshStandardMaterial({ color: '#8D99A6', metalness: 0.93, roughness: 0.20 }),
      cuttingTool: new THREE.MeshStandardMaterial({ color: '#E7ECEF', metalness: 0.99, roughness: 0.08 }),
      safetyParts: new THREE.MeshStandardMaterial({ color: '#D8A627', metalness: 0.50, roughness: 0.28 }),
      sandMould: new THREE.MeshStandardMaterial({ color: '#836B4B', roughness: 0.92, metalness: 0.04 }),
      moltenMetal: new THREE.MeshStandardMaterial({ color: '#FF7A18', emissive: '#FF4D00', emissiveIntensity: 3.2, roughness: 0.12 }),
      moltenMetalCool: new THREE.MeshStandardMaterial({ color: '#4A3024', metalness: 0.70, roughness: 0.52 })
    };

    const machineGroup = new THREE.Group();
    scene.add(machineGroup);
    groupsRef.current = {};

    const addPart = (partId, mesh, offsetVec = [0, 0, 0]) => {
      const partGroup = new THREE.Group();
      partGroup.name = partId;
      partGroup.add(mesh);
      partGroup.userData = { 
        explodedOffset: offsetVec, 
        basePosition: new THREE.Vector3(0, 0, 0),
        partId: partId
      };
      machineGroup.add(partGroup);
      groupsRef.current[partId] = partGroup;
      partGroup.traverse((child) => {
        if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
      });
    };


    // High-detail industrial modeling helpers
    const makeBolt = (radius = 0.055, height = 0.08, material = mats.secondaryMetal) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), material);
      return bolt;
    };

    const addBoltRow = (parent, axis, start, count, spacing, opts = {}) => {
      const { radius = 0.045, height = 0.07, material = mats.secondaryMetal } = opts;
      for (let i = 0; i < count; i++) {
        const b = makeBolt(radius, height, material);
        const p = start.clone();
        p[axis] += i * spacing;
        parent.add(b);
        b.position.copy(p);
      }
    };

    const addMachineFeet = (parent, width, depth, y = -0.25) => {
      const footMat = mats.darkMechanicalParts;
      const positions = [
        [-width / 2, y, -depth / 2],
        [ width / 2, y, -depth / 2],
        [-width / 2, y,  depth / 2],
        [ width / 2, y,  depth / 2]
      ];
      positions.forEach(([x, yy, z]) => {
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.16, 16), footMat);
        foot.position.set(x, yy, z);
        parent.add(foot);
      });
    };

    const addTSlotTable = (parent, width, depth, y, material = mats.secondaryMetal) => {
      const grooves = Math.max(3, Math.floor(width / 0.75));
      for (let i = 0; i < grooves; i++) {
        const z = -depth / 2 + 0.35 + i * ((depth - 0.7) / Math.max(1, grooves - 1));
        const slot = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.018, 0.07), mats.darkMechanicalParts);
        slot.position.set(0, y + 0.17, z);
        parent.add(slot);
        for (let x = -width * 0.35; x <= width * 0.35; x += 0.7) {
          const tnut = makeBolt(0.045, 0.05, material);
          tnut.position.set(x, y + 0.19, z);
          parent.add(tnut);
        }
      }
    };

    const addHandwheelDetail = (parent, radius = 0.3, ringColor = mats.safetyParts) => {
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, 0.12, 18).rotateX(Math.PI / 2), mats.darkMechanicalParts);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.055, 12, 32), ringColor);
      const handleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, radius * 0.8, 12).rotateZ(Math.PI / 2), mats.secondaryMetal);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12).rotateZ(Math.PI / 2), ringColor);
      handle.position.x = radius * 0.72;
      handleStem.position.x = radius * 0.5;
      parent.add(rim, hub, handleStem, handle);
    };

    const addMotor = (parent, pos, scale = 1) => {
      const g = new THREE.Group();
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 0.95 * scale, 0.8 * scale), mats.darkMechanicalParts);
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * scale, 0.28 * scale, 0.16 * scale, 20).rotateX(Math.PI / 2), mats.secondaryMetal);
      fan.position.z = 0.44 * scale;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.4 * scale, 14).rotateX(Math.PI / 2), mats.shafts);
      shaft.position.z = 0.58 * scale;
      g.add(housing, fan, shaft);
      g.position.set(...pos);
      parent.add(g);
      return g;
    };

    const addGauge = (parent, pos, radius = 0.16) => {
      const face = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.06, 24).rotateX(Math.PI / 2), mats.secondaryMetal);
      const bezel = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 10, 24), mats.darkMechanicalParts);
      const needle = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.75, 0.018, 0.018), mats.safetyParts);
      needle.position.z = 0.035;
      needle.rotation.z = -0.5;
      face.position.set(...pos);
      bezel.position.set(...pos);
      needle.position.x += pos[0];
      needle.position.y += pos[1];
      needle.position.z += pos[2] + 0.05;
      parent.add(face, bezel, needle);
    };

    const addGuard = (parent, size = [1, 1, 0.06], pos = [0, 0, 0]) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mats.safetyParts);
      const clearMat = new THREE.MeshStandardMaterial({
        color: '#C7D2FE',
        metalness: 0.05,
        roughness: 0.1,
        transparent: true,
        opacity: 0.18
      });
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(Math.max(0.08, size[0] - 0.12), Math.max(0.08, size[1] - 0.12), 0.025),
        clearMat
      );
      frame.position.set(...pos);
      window.position.set(pos[0], pos[1], pos[2] + size[2] * 0.6);
      parent.add(frame, window);
    };


    // 1. LATHE — reference-inspired 1M63-style centre lathe, modeled as an interactive training assembly
    if (machineId === 'lathe') {
      // The proportions and colour blocking are intentionally based on the user's supplied
      // 1M63-style reference: long blue/grey bed, white headstock cover, dark apron,
      // three-jaw chuck, external drive/pulley detail and a blue tailstock.
      const bluePaint = new THREE.MeshStandardMaterial({ color: '#708b94', metalness: 0.68, roughness: 0.31 });
      const blueDark = new THREE.MeshStandardMaterial({ color: '#465f67', metalness: 0.78, roughness: 0.34 });
      const ivory = new THREE.MeshStandardMaterial({ color: '#d6d3c9', metalness: 0.34, roughness: 0.39 });
      const castIron = new THREE.MeshStandardMaterial({ color: '#3b4345', metalness: 0.91, roughness: 0.25 });
      const polished = new THREE.MeshStandardMaterial({ color: '#BFC8CD', metalness: 0.98, roughness: 0.11 });
      const rubber = new THREE.MeshStandardMaterial({ color: '#11161A', metalness: 0.12, roughness: 0.76 });
      const yellow = new THREE.MeshStandardMaterial({ color: '#E8B62A', metalness: 0.35, roughness: 0.30 });

      const addHazardStrip = (parent, width, height, depth, pos, stripeCount = 8) => {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), yellow);
        group.add(base);
        for (let i = 0; i < stripeCount; i++) {
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(Math.max(width / (stripeCount * 2.1), 0.035), height + 0.006, depth + 0.008), castIron);
          stripe.position.x = -width / 2 + (i + 0.5) * (width / stripeCount);
          stripe.rotation.z = -0.55;
          group.add(stripe);
        }
        group.position.set(...pos);
        parent.add(group);
        return group;
      };

      const addPanelScrew = (parent, x, y, z, r = 0.035) => {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.04, 16), polished);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(x, y, z);
        parent.add(screw);
      };

      const addLever = (parent, base, dir = [0, 1, 0], len = 0.32, knob = 0.06) => {
        const g = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 12), polished);
        stem.position.y = len / 2;
        const ball = new THREE.Mesh(new THREE.SphereGeometry(knob, 14, 14), rubber);
        ball.position.y = len;
        g.add(stem, ball);
        g.position.set(...base);
        const v = new THREE.Vector3(...dir).normalize();
        const q = new THREE.Quaternion();
        q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
        g.quaternion.copy(q);
        parent.add(g);
        return g;
      };

      const addGear = (parent, position, radius = 0.24, thickness = 0.08, teeth = 14, material = polished, name) => {
        const g = new THREE.Group();
        if (name) g.name = name;
        const core = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.78, radius * 0.78, thickness, 24).rotateX(Math.PI / 2), material);
        g.add(core);
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * Math.PI * 2;
          const tooth = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.22, radius * 0.18, thickness), material);
          tooth.position.set(Math.cos(a) * radius * 0.90, Math.sin(a) * radius * 0.90, 0);
          tooth.rotation.z = a;
          g.add(tooth);
        }
        g.position.set(...position);
        parent.add(g);
        return g;
      };

      // --- Main cast-iron bed and pedestal/base ---
      const bedGroup = new THREE.Group();
      bedGroup.add(new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.65, 1.78), blueDark));
      const topRailL = new THREE.Mesh(new THREE.BoxGeometry(8.35, 0.16, 0.25), polished);
      topRailL.position.set(0, 0.34, -0.58);
      const topRailR = topRailL.clone();
      topRailR.position.z = 0.58;
      bedGroup.add(topRailL, topRailR);
      const guideV1 = new THREE.Mesh(new THREE.BoxGeometry(8.15, 0.14, 0.30), castIron);
      guideV1.position.set(0, 0.35, -0.25);
      const guideV2 = guideV1.clone();
      guideV2.position.z = 0.25;
      bedGroup.add(guideV1, guideV2);
      for (let x = -3.55; x <= 3.55; x += 0.38) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.42, 1.62), castIron);
        rib.position.set(x, -0.18, 0);
        bedGroup.add(rib);
      }
      // Feet / cabinet-like supports
      const leftCab = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.25, 1.58), castIron);
      leftCab.position.set(-2.65, -0.92, 0);
      const rightCab = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.08, 1.42), blueDark);
      rightCab.position.set(2.75, -0.82, 0);
      bedGroup.add(leftCab, rightCab);
      addMachineFeet(bedGroup, 3.55, 0.64, -1.52);
      addPart('bed', bedGroup, [0, -0.22, 0]);

      // --- Headstock: large gearbox, white/light cover, selector controls ---
      const headstockGroup = new THREE.Group();
      const headBase = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.05, 1.72), castIron);
      headBase.position.y = 0.35;
      headstockGroup.add(headBase);
      const headCover = new THREE.Mesh(new THREE.BoxGeometry(1.82, 1.28, 1.66), ivory);
      headCover.position.set(0, 1.15, 0);
      headstockGroup.add(headCover);
      const topCap = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.16, 1.70), ivory);
      topCap.position.y = 1.82;
      headstockGroup.add(topCap);
      // Manufacturer-style identification plate and inspection details.
      const plateMat = new THREE.MeshStandardMaterial({ color: '#ECE9DF', metalness: 0.25, roughness: 0.45 });
      const nameplate = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.30, 0.025), plateMat);
      nameplate.position.set(-0.34, 1.25, 0.855);
      headstockGroup.add(nameplate);
      const plateTextCanvas = document.createElement('canvas');
      plateTextCanvas.width = 512; plateTextCanvas.height = 180;
      const plateCtx = plateTextCanvas.getContext('2d');
      plateCtx.fillStyle = '#ECE9DF'; plateCtx.fillRect(0,0,512,180);
      plateCtx.fillStyle = '#1E2930'; plateCtx.font = 'bold 74px Arial';
      plateCtx.textAlign = 'center'; plateCtx.textBaseline = 'middle';
      plateCtx.fillText('WM290', 256, 90);
      const plateTex = new THREE.CanvasTexture(plateTextCanvas);
      const plateLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.26), new THREE.MeshBasicMaterial({ map: plateTex, transparent: true }));
      plateLabel.position.set(-0.34, 1.25, 0.872);
      headstockGroup.add(plateLabel);
      // Internal gearbox inspection gears become visible when cutaway mode is enabled.
      const gearboxWindow = new THREE.Group();
      gearboxWindow.name = 'gearbox_internals';
      for (let i = 0; i < 5; i++) {
        addGear(gearboxWindow, [-0.58 + i * 0.28, 0.78 + (i % 2) * 0.20, 0.965], 0.13 + (i % 2) * 0.04, 0.055, 12 + i, polished, `internal_gear_${i}`);
      }
      headstockGroup.add(gearboxWindow);
      // Front selector plate
      const selectorPlate = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.55, 0.08), castIron);
      selectorPlate.position.set(-0.06, 0.35, 0.90);
      headstockGroup.add(selectorPlate);
      for (let i = 0; i < 4; i++) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.10, 20).rotateX(Math.PI / 2), polished);
        knob.position.set(-0.55 + i * 0.37, 0.38, 0.96);
        headstockGroup.add(knob);
      }
      addGauge(headstockGroup, [0.30, 0.82, 0.94], 0.18);
      addGear(headstockGroup, [-0.45, 0.86, 0.95], 0.24, 0.08, 14, polished, 'gear_selector_a');
      addGear(headstockGroup, [0.18, 0.92, 0.95], 0.20, 0.08, 13, polished, 'gear_selector_b');
      addPanelScrew(headstockGroup, -0.74, 0.08, 0.95);
      addPanelScrew(headstockGroup, 0.68, 0.08, 0.95);
      addHazardStrip(headstockGroup, 1.55, 0.13, 0.05, [0, -0.70, 0.89], 10);
      addLever(headstockGroup, [-0.50, 1.30, 0.87], [0.15, 1, 0], 0.36);
      addLever(headstockGroup, [0.05, 1.40, 0.87], [-0.10, 1, 0], 0.30);
      addPart('headstock', headstockGroup, [-2.92, 0.05, 0]);

      const gearboxControls = new THREE.Group();
      const gearboxPanel = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.72, 0.08), castIron);
      gearboxPanel.position.set(-2.92, 0.02, 0.94);
      gearboxControls.add(gearboxPanel);
      for (let i = 0; i < 4; i++) {
        const lever = addLever(gearboxControls, [-3.42 + i * 0.34, 0.18, 0.99], [(-0.20 + i * 0.10), 1, 0], 0.26, 0.045);
        lever.children[1].material = rubber;
      }
      addPart('gearbox_controls', gearboxControls, [0, 0, 0]);

      const controlPedestal = new THREE.Group();
      const eStop = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.10, 20).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#B71C1C', metalness: 0.38, roughness: 0.25 }));
      eStop.position.set(-0.58, 0.38, 0.96);
      controlPedestal.add(eStop);
      const powerLamp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), new THREE.MeshStandardMaterial({ color: '#F1C65B', emissive: '#F1A41C', emissiveIntensity: 1.8 }));
      powerLamp.position.set(-0.36, 0.38, 0.97);
      controlPedestal.add(powerLamp);
      addPart('drive_controls', controlPedestal, [-2.95, -0.06, 0.03]);

      // External motor / pulley / belt detail visible on the left, as on the supplied reference.
      const driveGroup = new THREE.Group();
      const motorBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.86, 0.88), castIron);
      motorBody.position.set(0, -0.30, 0);
      driveGroup.add(motorBody);
      const drivePulley = new THREE.Group();
      const pulleyA = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 28).rotateX(Math.PI / 2), polished);
      const pulleyB = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.14, 28).rotateX(Math.PI / 2), polished);
      pulleyB.position.z = 0.14;
      drivePulley.name = 'drive_pulley';
      drivePulley.add(pulleyA, pulleyB);
      drivePulley.position.set(-0.70, 0.18, 0.60);
      driveGroup.add(drivePulley);
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.045, 10, 40), rubber);
      belt.name = 'drive_belt';
      belt.rotation.x = Math.PI / 2;
      belt.position.set(-0.70, -0.02, 0.60);
      driveGroup.add(belt);
      addPart('drive_system', driveGroup, [-3.18, -0.05, 0.30]);

      // --- Spindle, nose and three-jaw chuck ---
      const spindleGroup = new THREE.Group();
      const spindleShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.55, 36).rotateZ(Math.PI / 2), polished);
      spindleGroup.add(spindleShaft);
      const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.28, 36).rotateZ(Math.PI / 2), polished);
      nose.position.x = -0.68;
      spindleGroup.add(nose);
      addPart('spindle', spindleGroup, [-2.92, 0.52, 0]);

      const chuckGroup = new THREE.Group();
      const chuckBody = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.80, 0.52, 40).rotateZ(Math.PI / 2), castIron);
      const chuckFace = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.60, 0.10, 40).rotateZ(Math.PI / 2), polished);
      chuckFace.position.x = -0.27;
      chuckGroup.add(chuckBody, chuckFace);
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3 + 0.18;
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.52), castIron);
        jaw.position.set(-0.37, Math.sin(a) * 0.40, Math.cos(a) * 0.40);
        jaw.rotation.x = a;
        chuckGroup.add(jaw);
      }
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3 + 0.18;
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 16), polished);
        screw.rotation.z = Math.PI / 2;
        screw.position.set(-0.48, Math.sin(a) * 0.46, Math.cos(a) * 0.46);
        chuckGroup.add(screw);
        for (let t = 0; t < 4; t++) {
          const serration = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.16, 0.05), polished);
          serration.position.set(-0.49 + t * 0.035, Math.sin(a) * (0.42 + t * 0.012), Math.cos(a) * (0.42 + t * 0.012));
          serration.rotation.x = a;
          chuckGroup.add(serration);
        }
      }
      addPart('chuck', chuckGroup, [-2.05, 0.52, 0]);

      const workpieceGroup = ProceduralWorkpieceManager.createLatheWorkpieceGroup({ ...mats, machineBody: bluePaint, secondaryMetal: polished, darkMechanicalParts: castIron });
      // Increase the stock diameter and centre it between chuck and tailstock.
      workpieceGroup.scale.set(1.48, 1.06, 1.06);
      addPart('workpiece', workpieceGroup, [-0.15, 0.52, 0]);
      workpieceGroup.getObjectByName('raw_stock')?.traverse((o) => { if (o.isMesh) o.castShadow = true; });

      // --- Saddle / apron / cross-slide ---
      const carriageGroup = new THREE.Group();
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 1.58), bluePaint);
      saddle.position.y = 0.35;
      carriageGroup.add(saddle);
      const apron = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.18, 0.20), castIron);
      apron.position.set(0, -0.25, 0.86);
      carriageGroup.add(apron);
      // Front apron controls
      for (let i = 0; i < 3; i++) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24).rotateX(Math.PI / 2), polished);
        wheel.position.set(-0.45 + i * 0.42, -0.28, 0.98);
        carriageGroup.add(wheel);
      }
      const apronWheel = new THREE.Group();
      addHandwheelDetail(apronWheel, 0.34, polished);
      apronWheel.name = 'apron_handwheel';
      apronWheel.rotation.z = Math.PI / 2;
      apronWheel.position.set(0.48, -0.22, 1.02);
      carriageGroup.add(apronWheel);
      addHazardStrip(carriageGroup, 1.18, 0.12, 0.05, [0, 0.58, 0.82], 8);
      // Thread-dial indicator and feed/screw-cutting engagement levers.
      const threadDial = new THREE.Group();
      const dialFace = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.055, 24).rotateX(Math.PI / 2), ivory);
      const dialNeedle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.018, 0.018), yellow);
      dialNeedle.position.z = 0.04; dialNeedle.rotation.z = -0.65;
      threadDial.add(dialFace, dialNeedle);
      threadDial.position.set(-0.20, -0.10, 0.98);
      threadDial.name = 'thread_dial';
      carriageGroup.add(threadDial);
      addLever(carriageGroup, [0.15, -0.12, 0.98], [0, 1, 0], 0.28, 0.045);
      addLever(carriageGroup, [0.38, 0.05, 0.98], [0.18, 1, 0], 0.24, 0.045);
      addPart('carriage', carriageGroup, [0, 0.12, 0.0]);

      const crossSlideGroup = new THREE.Group();
      crossSlideGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.22, 1.06), castIron));
      const crossPlate = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.84), polished);
      crossPlate.position.y = 0.18;
      crossSlideGroup.add(crossPlate);
      const crossWheel = new THREE.Group();
      addHandwheelDetail(crossWheel, 0.27, polished);
      crossWheel.rotation.z = Math.PI / 2;
      crossWheel.position.set(0.62, 0.20, 0);
      crossSlideGroup.add(crossWheel);
      addPart('cross_slide', crossSlideGroup, [0, 0.42, 0.06]);

      const compoundGroup = new THREE.Group();
      const compoundBase = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.15, 0.72), polished);
      compoundGroup.add(compoundBase);
      const compoundRest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.26, 0.50), castIron);
      compoundRest.rotation.y = -0.16;
      compoundRest.position.y = 0.18;
      compoundGroup.add(compoundRest);
      addPart('compound_rest', compoundGroup, [0.02, 0.63, 0.06]);

      const toolPostGroup = new THREE.Group();
      const toolBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.34, 0.48), castIron);
      const toolTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.14, 18), polished);
      toolTurret.position.y = 0.25;
      const toolBit = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.10, 0.12), mats.cuttingTool);
      toolBit.position.set(0.24, 0.08, -0.10);
      toolPostGroup.add(toolBase, toolTurret, toolBit);
      addLever(toolPostGroup, [0.0, 0.38, 0.0], [0.2, 1, 0], 0.30, 0.05);
      addPart('tool_post', toolPostGroup, [0.18, 0.72, 0.46]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.10, 0.10), mats.cuttingTool), [0.44, 0.83, 0.36]);

      // --- Tailstock ---
      const tailstockGroup = new THREE.Group();
      const tailBase = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.70, 1.24), bluePaint);
      tailBase.position.y = 0.08;
      tailstockGroup.add(tailBase);
      const tailBody = new THREE.Mesh(new THREE.BoxGeometry(1.10, 1.30, 1.18), bluePaint);
      tailBody.position.y = 0.57;
      tailstockGroup.add(tailBody);
      const tailTop = new THREE.Mesh(new THREE.BoxGeometry(1.00, 0.17, 1.08), ivory);
      tailTop.position.y = 1.22;
      tailstockGroup.add(tailTop);
      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.00, 24).rotateZ(Math.PI / 2), polished);
      quill.position.x = -0.43;
      quill.position.y = 0.57;
      tailstockGroup.add(quill);
      const tailWheel = new THREE.Group();
      tailWheel.name = 'tail_handwheel';
      addHandwheelDetail(tailWheel, 0.30, polished);
      tailWheel.rotation.x = Math.PI / 2;
      tailWheel.position.set(0.48, 0.55, 0.70);
      tailstockGroup.add(tailWheel);
      addHazardStrip(tailstockGroup, 0.95, 0.12, 0.05, [0, 0.15, 0.63], 8);
      addPart('tailstock', tailstockGroup, [2.80, 0.05, 0]);

      const tailBaseDetail = new THREE.Group();
      tailBaseDetail.add(new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.16, 1.32), castIron));
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.10, 0.18), polished);
      clamp.position.set(0, 0.13, 0.35);
      tailBaseDetail.add(clamp);
      addPart('tailstock_base', tailBaseDetail, [2.80, 0.02, 0]);

      // --- Lead screw / feed rod / chip tray ---
      const leadScrewGroup = new THREE.Group();
      const leadScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 6.85, 24).rotateZ(Math.PI / 2), polished);
      leadScrew.position.y = -0.50;
      leadScrew.name = 'lead_screw_shaft';
      leadScrewGroup.add(leadScrew);
      const feedRod = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 6.85, 20).rotateZ(Math.PI / 2), castIron);
      feedRod.position.y = -0.68;
      feedRod.name = 'feed_rod_shaft';
      leadScrewGroup.add(feedRod);
      addPart('lead_screw', leadScrewGroup, [-0.02, 0.00, 0.0]);

      const tray = new THREE.Mesh(new THREE.BoxGeometry(7.55, 0.18, 1.45), castIron);
      tray.position.set(0, -0.84, 0);
      tray.rotation.x = 0.03;
      const chipTrayAssembly = new THREE.Group();
      chipTrayAssembly.add(tray);
      const chips = new THREE.Group(); chips.name = 'chips';
      for (let i = 0; i < 22; i++) {
        const chip = new THREE.Mesh(new THREE.TorusGeometry(0.045 + (i % 3) * 0.008, 0.010, 5, 12, Math.PI * 1.35), polished);
        chip.position.set(-2.6 + (i * 0.43) % 5.2, -0.72 + (i % 4) * 0.035, 0.20 + ((i * 0.29) % 0.95));
        chip.rotation.set((i % 5) * 0.4, (i % 7) * 0.35, (i % 4) * 0.5);
        chips.add(chip);
      }
      chipTrayAssembly.add(chips);
      addPart('chip_tray', chipTrayAssembly, [0, 0, 0]);

      const feedBox = new THREE.Group();
      const feedHousing = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.68, 0.42), castIron);
      feedHousing.position.set(-1.35, -0.05, 0.74);
      feedBox.add(feedHousing);
      for (let i = 0; i < 2; i++) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.08, 18).rotateX(Math.PI / 2), polished);
        wheel.position.set(-1.58 + i * 0.40, 0.02, 0.98);
        feedBox.add(wheel);
      }
      addPart('feed_box', feedBox, [0, 0, 0]);

      const rackGroup = new THREE.Group();
      const rackBar = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.08, 0.12), castIron);
      rackBar.position.set(0, 0.47, 0.76);
      rackGroup.add(rackBar);
      for (let x = -3.2; x <= 3.2; x += 0.18) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.12), polished);
        tooth.position.set(x, 0.55, 0.76);
        tooth.rotation.z = -0.45;
        rackGroup.add(tooth);
      }
      addPart('rack', rackGroup, [0, 0, 0]);

      const splash = new THREE.Group();
      const splashBack = new THREE.Mesh(new THREE.BoxGeometry(7.4, 2.1, 0.10), bluePaint);
      splashBack.position.set(0, 0.75, -0.94);
      splash.add(splashBack);
      const topLip = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.16, 0.18), ivory);
      topLip.position.set(0, 1.72, -0.91);
      splash.add(topLip);
      // Folded sheet-metal braces
      for (let x = -2.7; x <= 2.7; x += 1.35) {
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.65, 0.08), castIron);
        brace.position.set(x, 0.78, -0.84);
        brace.rotation.z = -0.12;
        splash.add(brace);
      }
      addPart('splash_guard', splash, [0, 0, 0]);

      const coolant = new THREE.Group();
      const hoseCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.10, 1.05, 0.72),
        new THREE.Vector3(0.32, 1.12, 0.72),
        new THREE.Vector3(0.50, 0.92, 0.56),
        new THREE.Vector3(0.48, 0.72, 0.46)
      ]);
      const hose = new THREE.Mesh(new THREE.TubeGeometry(hoseCurve, 24, 0.035, 10, false), rubber);
      coolant.add(hose);
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.22, 14), polished);
      nozzle.position.set(0.48, 0.68, 0.45);
      nozzle.rotation.z = Math.PI / 2;
      coolant.add(nozzle);
      const droplets = new THREE.Group();
      for (let i = 0; i < 8; i++) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshStandardMaterial({ color: '#9ED8E5', roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.85 }));
        drop.position.set(0.50 + i * 0.03, 0.66 - i * 0.018, 0.43 - i * 0.02);
        droplets.add(drop);
      }
      droplets.name = 'coolant_droplets';
      coolant.add(droplets);
      addPart('coolant_system', coolant, [0, 0, 0]);

      // Small steady-rest assembly, useful for explaining support of long workpieces.
      const steady = new THREE.Group();
      const steadyRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.10, 14, 36), polished);
      steadyRing.rotation.y = Math.PI / 2;
      steady.add(steadyRing);
      for (let i = 0; i < 3; i++) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.22), castIron);
        const a = (i * Math.PI * 2) / 3;
        pad.position.set(0, Math.sin(a) * 0.36, Math.cos(a) * 0.36);
        steady.add(pad);
      }
      addPart('steady_rest', steady, [0.90, 0.90, 0]);

      // Keep the exact clickable labels used by the rest of the simulator.
      // The extra components above are intentionally additive to preserve current training flows.
    } else if (machineId === 'welding') {
      const table = new THREE.Group();
      table.add(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.18, 3.3), mats.darkMechanicalParts));
      for (let x = -1.8; x <= 1.8; x += 0.45) {
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.19, 12), mats.machineBody);
        hole.position.set(x, 0.02, 0);
        hole.rotation.x = 0;
        table.add(hole);
      }
      addTSlotTable(table, 4.2, 2.8, -0.07);
      addMachineFeet(table, 1.9, 1.3, -1.0);
      addPart('welding_table', table, [0, -0.72, 0]);

      const machine = new THREE.Group();
      machine.add(new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.35, 1.55), mats.machineBody));
      machine.add(new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.58, 0.12), mats.secondaryMetal)).position.set(0, 0.18, 0.80);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20).rotateX(Math.PI / 2), mats.safetyParts);
      dial.position.set(-0.35, -0.05, 0.82);
      machine.add(dial);
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 0.04), mats.darkMechanicalParts);
      vent.position.set(0, -0.35, 0.8);
      machine.add(vent);
      addMotor(machine, [0, -0.05, -0.95], 0.75);
      addPart('welding_machine', machine, [-2.25, 0.15, -0.65]);

      const holder = new THREE.Group();
      const torchHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.75, 16).rotateX(Math.PI / 2), mats.darkMechanicalParts);
      holder.add(torchHandle);
      const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.12), mats.safetyParts);
      trigger.position.set(0.1, 0, 0);
      holder.add(trigger);
      const electrodeRod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 12), mats.cuttingTool);
      electrodeRod.position.set(0, -0.31, 0);
      electrodeRod.rotation.z = Math.PI / 10;
      holder.add(electrodeRod);
      addPart('electrode_holder', holder, [0, 1.15, 0]);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.25, -0.2, -0.65),
        new THREE.Vector3(-1.3, 0.15, -0.2),
        new THREE.Vector3(-0.35, 0.25, 0.1),
        new THREE.Vector3(0.0, 0.2, 0.0)
      ]);
      addPart('cables', new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.065, 10, false), mats.darkMechanicalParts), [0, 0, 0]);
      addPart('ground_clamp', new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.20, 0.55), mats.secondaryMetal), [-1.35, 0.95, 0.75]);

      const plates = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.09, 0.82), mats.secondaryMetal);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.09, 0.82), mats.secondaryMetal);
      p2.position.z = 0.68;
      plates.add(p1, p2);
      addBoltRow(plates, 'x', new THREE.Vector3(-0.8, 0.12, 0.18), 4, 0.55, { radius: 0.04 });
      addPart('metal_plates', plates, [0, 0.02, -0.34]);
      const clamps = new THREE.Group();
      for (const x of [-0.72, 0.72]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.44, 0.33), mats.darkMechanicalParts);
        c.position.set(x, 0.33, 0);
        clamps.add(c);
      }
      addPart('clamps', clamps, [-0.0, 1.0, 0.08]);

      const weldAssembly = ProceduralWorkpieceManager.createWeldingAssembly(mats);
      addPart('weld_joint', weldAssembly, [0, 0.88, 0]);

      const shield = new THREE.Group();
      addGuard(shield, [0.72, 0.54, 0.08], [0, 0, 0]);
      addPart('ppe', shield, [1.35, 0.95, -1.02]);

    // 3. SHAPER — crank-driven reciprocating machine
    } else if (machineId === 'shaper') {
      addPart('base', new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 4.0), mats.darkMechanicalParts), [0, -1.75, 0]);
      const column = new THREE.Group();
      column.add(new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.8, 2.25), mats.machineBody));
      column.add(new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.65, 0.18), mats.darkMechanicalParts)).position.set(0, 0.1, 1.12);
      addGauge(column, [0.0, 0.25, 1.25], 0.17);
      addPart('column', column, [0, -0.25, -0.7]);

      const ram = new THREE.Group();
      ram.add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.68, 3.65), mats.secondaryMetal));
      ram.add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.16, 2.9), mats.machineBody)).position.set(0, 0.38, 0);
      addPart('ram', ram, [0, 1.1, -0.1]);

      const toolHead = new THREE.Group();
      toolHead.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.68, 0.48), mats.darkMechanicalParts));
      addHandwheelDetail(toolHead, 0.20, mats.safetyParts);
      addPart('tool_head', toolHead, [0, 0.82, 1.55]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.16), mats.cuttingTool), [0, 0.22, 1.80]);
      const clapper = new THREE.Group();
      clapper.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.50, 0.30), mats.safetyParts));
      clapper.add(new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.34), mats.cuttingTool)).position.set(0, -0.28, 0.05);
      addPart('clapper_box', clapper, [0, 0.54, 1.68]);

      const table = new THREE.Group();
      table.add(new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.05, 1.75), mats.secondaryMetal));
      addTSlotTable(table, 1.55, 1.55, 0);
      addPart('table', table, [0, -0.42, 1.18]);

      const vice = new THREE.Group();
      vice.add(new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.32, 1.05), mats.darkMechanicalParts));
      const jawA = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.22, 0.10), mats.secondaryMetal);
      jawA.position.set(0, 0.25, -0.43);
      const jawB = jawA.clone();
      jawB.position.z = 0.43;
      vice.add(jawA, jawB);
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16).rotateZ(Math.PI / 2), mats.shafts);
      screw.position.set(0.5, 0.05, 0);
      vice.add(screw);
      addPart('vice', vice, [0, 0.10, 1.18]);

      const wpGroup = new THREE.Group();
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.42, 0.84), mats.workpiece);
      mainBlock.name = 'main_block';
      wpGroup.add(mainBlock);
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.84), mats.darkMechanicalParts);
      slot.name = 'shaper_slot';
      slot.position.set(0, 0.02, 0);
      slot.visible = false;
      wpGroup.add(slot);
      addPart('workpiece', wpGroup, [0, 0.46, 1.18]);

    // 4. PLANER — open-side planer with travelling table
    } else if (machineId === 'planer') {
      const table = new THREE.Group();
      table.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.34, 5.6), mats.secondaryMetal));
      addTSlotTable(table, 2.2, 5.0, -0.18);
      for (let z = -2.2; z <= 2.2; z += 0.55) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.42), mats.darkMechanicalParts);
        rail.position.set(0.95, -0.22, z);
        table.add(rail);
      }
      addMachineFeet(table, 1.15, 2.4, -1.0);
      addPart('table', table, [0, -1.08, 0]);

      const wpGroup = new THREE.Group();
      const planerBlock = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.68, 2.65), mats.workpiece);
      planerBlock.name = 'planer_block';
      wpGroup.add(planerBlock);
      const planerSlot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.70, 2.7), mats.darkMechanicalParts);
      planerSlot.name = 'planer_slot';
      planerSlot.position.set(0, 0.03, 0);
      planerSlot.visible = false;
      wpGroup.add(planerSlot);
      addPart('workpiece', wpGroup, [0, -0.56, 0]);

      const housing = new THREE.Group();
      housing.add(new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.3, 1.55), mats.machineBody));
      housing.add(new THREE.Mesh(new THREE.BoxGeometry(0.64, 2.9, 0.28), mats.darkMechanicalParts)).position.set(0.05, 0.2, 0.82);
      addPart('housing', housing, [-1.65, 0.52, 0]);

      const rail = new THREE.Group();
      rail.add(new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.62, 0.68), mats.shafts));
      for (let x = -1.7; x <= 1.7; x += 0.42) {
        const bolt = makeBolt(0.035, 0.06);
        bolt.position.set(x, -0.18, 0.36);
        rail.add(bolt);
      }
      addPart('cross_rail', rail, [0, 1.45, 0]);

      const toolHead = new THREE.Group();
      toolHead.add(new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.86, 0.52), mats.darkMechanicalParts));
      addHandwheelDetail(toolHead, 0.18, mats.safetyParts);
      addPart('tool_head', toolHead, [0, 1.20, 0.42]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.44, 0.18), mats.cuttingTool), [0, 0.66, 0.52]);

      const clamps = new THREE.Group();
      for (const z of [-0.95, 0.95]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.42), mats.darkMechanicalParts);
        c.position.set(-0.62, -0.22, z);
        clamps.add(c);
      }
      addPart('clamps', clamps, [0, 0, 0]);

    // 5. MILLING — vertical turret mill
    } else if (machineId === 'milling') {
      addPart('base', new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.48, 3.5), mats.darkMechanicalParts), [0, -1.78, 0]);

      const column = new THREE.Group();
      column.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.25, 2.15), mats.machineBody));
      const slide = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.6, 0.22), mats.darkMechanicalParts);
      slide.position.set(0, 0.0, 1.18);
      column.add(slide);
      addPart('column', column, [0, -0.55, -1.22]);

      const head = new THREE.Group();
      head.add(new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.2, 1.72), mats.darkMechanicalParts));
      const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.72, 24), mats.shafts);
      nose.position.y = -0.78;
      head.add(nose);
      addMotor(head, [0.0, 0.18, -0.95], 0.8);
      addPart('motor_head', head, [0, 1.72, 0.10]);

      const spindle = new THREE.Group();
      spindle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.92, 24), mats.shafts));
      spindle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 24), mats.secondaryMetal)).position.y = -0.43;
      addPart('spindle', spindle, [0, 0.98, 0.55]);

      const cutter = new THREE.Group();
      cutter.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.56, 20), mats.cuttingTool));
      for (let i = 0; i < 8; i++) {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.12, 0.10), mats.safetyParts);
        const a = (i / 8) * Math.PI * 2;
        tooth.position.set(Math.cos(a) * 0.19, -0.25, Math.sin(a) * 0.19);
        cutter.add(tooth);
      }
      addPart('cutter', cutter, [0, 0.52, 0.55]);

      const table = new THREE.Group();
      table.add(new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.34, 1.45), mats.secondaryMetal));
      addTSlotTable(table, 3.0, 1.2, -0.16);
      addPart('table', table, [0, -0.35, 0.82]);

      const vice = new THREE.Group();
      vice.add(new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 1.0), mats.darkMechanicalParts));
      for (const z of [-0.42, 0.42]) {
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.10), mats.secondaryMetal);
        jaw.position.set(0, 0.28, z);
        vice.add(jaw);
      }
      const viceScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.05, 16).rotateZ(Math.PI / 2), mats.shafts);
      viceScrew.position.x = 0.48;
      vice.add(viceScrew);
      addPart('vice', vice, [0, 0.02, 0.82]);

      const wpGroup = new THREE.Group();
      const millBlock = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.38, 0.70), mats.workpiece);
      millBlock.name = 'mill_block';
      wpGroup.add(millBlock);
      const millSlot = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.40, 0.72), mats.darkMechanicalParts);
      millSlot.name = 'mill_slot';
      millSlot.position.set(0, 0.02, 0);
      millSlot.visible = false;
      wpGroup.add(millSlot);
      addPart('workpiece', wpGroup, [0, 0.26, 0.82]);

      const wheels = new THREE.Group();
      addHandwheelDetail(wheels, 0.28, mats.safetyParts);
      wheels.rotation.z = Math.PI / 2;
      addPart('handwheels', wheels, [1.72, -0.35, 0.82]);

    // 6. CASTING — sand-casting station with furnace and gating system
    } else if (machineId === 'casting') {
      const furnace = new THREE.Group();
      furnace.add(new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.9, 1.65, 24), mats.darkMechanicalParts));
      furnace.add(new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.22, 24), mats.moltenMetalCool)).position.y = 0.82;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 12, 28), mats.secondaryMetal);
      rim.position.y = 0.74;
      furnace.add(rim);
      addPart('furnace', furnace, [-2.0, -0.15, -1.0]);

      const pattern = new THREE.Group();
      pattern.add(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.20, 24), mats.workpiece));
      addBoltRow(pattern, 'x', new THREE.Vector3(-0.22, 0.13, 0), 2, 0.44, { radius: 0.035 });
      addPart('pattern', pattern, [-1.55, 0.85, 0.95]);

      const cope = new THREE.Group();
      cope.add(new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.62, 2.55), mats.sandMould));
      const copeFrame = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.10, 2.65), mats.darkMechanicalParts);
      copeFrame.position.y = 0.28;
      cope.add(copeFrame);
      addPart('cope_flask', cope, [0, 0.12, 0]);

      const drag = new THREE.Group();
      drag.add(new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.62, 2.55), mats.sandMould));
      const dragFrame = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.10, 2.65), mats.darkMechanicalParts);
      dragFrame.position.y = -0.28;
      drag.add(dragFrame);
      addPart('drag_flask', drag, [0, -0.62, 0]);

      addPart('sprue', new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.06, 0.75), mats.shafts), [0.55, 0.14, 0]);
      addPart('runner', new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.07, 0.15), mats.moltenMetalCool), [0.15, -0.24, 0]);
      addPart('riser', new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.70), mats.shafts), [-0.60, 0.14, 0]);

      const ladleGroup = new THREE.Group();
      ladleGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.34, 0.68, 20), mats.darkMechanicalParts));
      const ladleRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 10, 24), mats.secondaryMetal);
      ladleRim.position.y = 0.30;
      ladleGroup.add(ladleRim);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 12).rotateZ(Math.PI / 2), mats.shafts);
      handle.position.set(0.56, 0.20, 0);
      ladleGroup.add(handle);
      const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.88, 10), mats.moltenMetal);
      stream.name = 'molten_stream';
      stream.position.set(0.32, -0.45, 0);
      stream.visible = false;
      ladleGroup.add(stream);
      addPart('ladle', ladleGroup, [-1.8, 0.88, 0.35]);

      const cavity = new THREE.Group();
      cavity.add(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.18, 24), mats.moltenMetalCool));
      const gate = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.15), mats.moltenMetalCool);
      gate.position.x = 0.22;
      cavity.add(gate);
      addPart('casting_cavity', cavity, [0, -0.30, 0]);

    // 7. MOULDING — two-part green-sand mould
    } else if (machineId === 'moulding') {
      const pattern = new THREE.Group();
      const patternDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.25, 24), mats.workpiece);
      pattern.add(patternDisk);
      pattern.add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.45, 20), mats.workpiece)).position.y = 0.32;
      addPart('pattern', pattern, [0, -0.18, 0]);

      const cope = new THREE.Group();
      cope.add(new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.64, 2.35), mats.safetyParts));
      for (let x = -0.82; x <= 0.82; x += 0.82) {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.10), mats.secondaryMetal);
        handle.position.set(x, 0.42, 1.08);
        cope.add(handle);
      }
      addPart('cope', cope, [0, 0.38, 0]);

      const drag = new THREE.Group();
      drag.add(new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.64, 2.35), mats.safetyParts));
      for (let x = -0.82; x <= 0.82; x += 0.82) {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.10), mats.secondaryMetal);
        handle.position.set(x, -0.42, 1.08);
        drag.add(handle);
      }
      addPart('drag', drag, [0, -0.56, 0]);

      addPart('flask', new THREE.Mesh(new THREE.BoxGeometry(2.48, 1.30, 2.48), mats.darkMechanicalParts), [0, -0.10, 0]);
      addPart('sand', new THREE.Mesh(new THREE.BoxGeometry(2.28, 1.20, 2.28), mats.sandMould), [0, -0.10, 0]);
      addPart('cavity', new THREE.Mesh(new THREE.CylinderGeometry(0.63, 0.63, 0.28, 24), mats.moltenMetalCool), [0, -0.20, 0]);
      addPart('sprue', new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.84), mats.shafts), [0.58, 0.32, 0]);
      addPart('runner', new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.16), mats.secondaryMetal), [0.18, -0.20, 0]);
      addPart('riser', new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.84), mats.shafts), [-0.60, 0.32, 0]);
    }

    // Cache translations
    Object.keys(groupsRef.current).forEach((key) => {
      const g = groupsRef.current[key];
      g.userData.basePosition.copy(g.position);
    });

    // Fit the complete lathe into the viewport and keep the floor visible.
    if (machineId === 'lathe') {
      const machineBox = new THREE.Box3().setFromObject(machineGroup);
      const machineCenter = machineBox.getCenter(new THREE.Vector3());
      const machineSize = machineBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(machineSize.x, machineSize.y, machineSize.z);
      const fitDistance = Math.max(8.5, maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))) * 1.28);
      camera.position.set(machineCenter.x + fitDistance * 0.72, machineCenter.y + fitDistance * 0.42, machineCenter.z + fitDistance);
      controls.target.set(machineCenter.x, machineCenter.y - 0.18, machineCenter.z);
      controls.maxDistance = fitDistance * 2.4;
      controls.minDistance = fitDistance * 0.55;
      controls.update();
    }

    const selectedHelper = new THREE.BoxHelper(new THREE.Mesh(), '#c59b55');
    selectedHelper.visible = false;
    scene.add(selectedHelper);
    selectedHelperRef.current = selectedHelper;

    const focusedHelper = new THREE.BoxHelper(new THREE.Mesh(), '#5b9fa8');
    focusedHelper.visible = false;
    scene.add(focusedHelper);
    focusedHelperRef.current = focusedHelper;

    const hoverHelper = new THREE.BoxHelper(new THREE.Mesh(), '#78959a');
    hoverHelper.visible = false;
    scene.add(hoverHelper);
    hoverHelperRef.current = hoverHelper;

    // Sparks Particle System
    const sparkCount = 40;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2 + 0.5, (Math.random() - 0.5) * 3));
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparks = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({ color: '#D6DEE3', size: 0.075, transparent: true, opacity: 0.88 })
    );
    sparks.visible = false;
    scene.add(sparks);

    setLoading(false);
    let clock = new THREE.Clock();

    // 3D Pointer Tooltip
    let hoveredPartId = null;
    const tooltipDiv = document.createElement('div');
    tooltipDiv.style.position = 'absolute';
    tooltipDiv.style.background = 'rgba(15, 23, 42, 0.95)';
    tooltipDiv.style.border = '1px solid #0A5CFF';
    tooltipDiv.style.borderRadius = '4px';
    tooltipDiv.style.padding = '5px 10px';
    tooltipDiv.style.color = '#FFF';
    tooltipDiv.style.fontSize = '10px';
    tooltipDiv.style.fontWeight = 'bold';
    tooltipDiv.style.pointerEvents = 'none';
    tooltipDiv.style.display = 'none';
    tooltipDiv.style.zIndex = '100';
    tooltipDiv.style.boxShadow = '0 0 10px rgba(10, 92, 255, 0.4)';
    tooltipDiv.innerHTML = '<div id="tt-title">PART</div><div style="font-size:8.5px;color:#94A3B8;font-weight:normal;">Click to operate on workplane</div>';
    mountRef.current.appendChild(tooltipDiv);

    const handleMouseMove = (e) => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      const canvas = rendererRef.current.domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      let foundPartId = null;
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !groupsRef.current[obj.name] && obj.parent.name !== 'scene') {
          obj = obj.parent;
        }
        if (groupsRef.current[obj.name]) {
          foundPartId = obj.name;
        }
      }

      if (foundPartId) {
        hoveredPartId = foundPartId;
        canvas.style.cursor = 'pointer';
        tooltipDiv.style.left = `${e.clientX - rect.left + 15}px`;
        tooltipDiv.style.top = `${e.clientY - rect.top + 15}px`;
        tooltipDiv.style.display = 'block';
        const titleEl = tooltipDiv.querySelector('#tt-title');
        if (titleEl) {
          titleEl.textContent = foundPartId.replace(/_/g, ' ').toUpperCase();
        }

        if (hoverHelperRef.current && groupsRef.current[foundPartId]) {
          hoverHelperRef.current.setFromObject(groupsRef.current[foundPartId]);
          hoverHelperRef.current.visible = true;
        }
      } else {
        canvas.style.cursor = 'crosshair';
        hoveredPartId = null;
        tooltipDiv.style.display = 'none';
        if (hoverHelperRef.current) {
          hoverHelperRef.current.visible = false;
        }
      }
    };

    const canvasEl = rendererRef.current.domElement;
    canvasEl.addEventListener('mousemove', handleMouseMove);

    // Animation Render Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const currentToolPos = toolPositionRef.current || { x: 0, y: 0, z: 0 };
      const op = typeof activeOperationRef.current === 'object' ? activeOperationRef.current?.id : activeOperationRef.current;
      const progress = (operationProgressRef.current || 0) / 100;
      const opState = operationStateRef.current;
      const curSelectedPart = selectedPartIdRef.current;

      // Exploded View
      Object.keys(groupsRef.current).forEach((key) => {
        const g = groupsRef.current[key];
        const base = g.userData.basePosition;
        const offset = g.userData.explodedOffset;
        
        const targetX = isExploded ? base.x + offset[0] : base.x;
        const targetY = isExploded ? base.y + offset[1] : base.y;
        const targetZ = isExploded ? base.z + offset[2] : base.z;
        
        g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, 0.08);
        g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.08);
        g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, 0.08);
      });

      // Cutaway View
      Object.keys(groupsRef.current).forEach((key) => {
        const g = groupsRef.current[key];
        g.traverse((child) => {
          if (child.isMesh && child.material) {
            const isCasing = ['bed', 'column', 'cope', 'drag', 'housing', 'headstock', 'flask', 'sand', 'cope_flask', 'drag_flask'].includes(key);
            if (isCasing) {
              child.material.transparent = isCutaway;
              child.material.opacity = isCutaway ? 0.22 : 1.0;
            }
          }
        });
      });

      // Selection and Focus Emissive Highlights
      Object.keys(groupsRef.current).forEach((key) => {
        const g = groupsRef.current[key];
        const isFocused = focusedPartId === key;
        const isSelected = curSelectedPart === key;
        
        g.traverse((child) => {
          if (child.isMesh && child.material) {
            if (!child.userData.originalEmissive) {
              child.userData.originalEmissive = child.material.emissive?.getHex() || 0;
            }
            if (isSelected) {
              child.material.emissive?.set('#c59b55');
              child.material.emissiveIntensity = 0.18;
            } else if (isFocused) {
              child.material.emissive?.set('#5b9fa8');
              child.material.emissiveIntensity = 0.12;
            } else {
              child.material.emissive?.setHex(child.userData.originalEmissive);
              child.material.emissiveIntensity = 0;
            }
          }
        });
      });

      // Bounding Box Helpers
      if (curSelectedPart && groupsRef.current[curSelectedPart] && selectedHelperRef.current) {
        selectedHelperRef.current.setFromObject(groupsRef.current[curSelectedPart]);
        selectedHelperRef.current.visible = true;
      } else if (selectedHelperRef.current) {
        selectedHelperRef.current.visible = false;
      }

      if (focusedPartId && groupsRef.current[focusedPartId] && focusedPartId !== curSelectedPart && focusedHelperRef.current) {
        focusedHelperRef.current.setFromObject(groupsRef.current[focusedPartId]);
        focusedHelperRef.current.visible = true;
      } else if (focusedHelperRef.current) {
        focusedHelperRef.current.visible = false;
      }

      // Spark Particles
      if (sparks.visible) {
        const posAttr = sparks.geometry.attributes.position;
        for (let i = 0; i < sparkCount; i++) {
          posAttr.array[i * 3] += sparkVelocities[i].x * 0.03;
          posAttr.array[i * 3 + 1] += sparkVelocities[i].y * 0.03 - 0.015;
          posAttr.array[i * 3 + 2] += sparkVelocities[i].z * 0.03;

          if (posAttr.array[i * 3 + 1] < -0.6) {
            posAttr.array[i * 3] = 0;
            posAttr.array[i * 3 + 1] = 0;
            posAttr.array[i * 3 + 2] = 0;
          }
        }
        posAttr.needsUpdate = true;
      }

      const runningOrCompleted = (opState === 'RUNNING' || opState === 'COMPLETED');
      const activeRunning = isPlayingRef.current || opState === 'RUNNING';

      // 1. CENTRE LATHE KINEMATICS & PROCEDURAL WORKPIECE
      if (machineId === 'lathe') {
        const chuck = groupsRef.current['chuck'];
        const spindle = groupsRef.current['spindle'];
        const workpiece = groupsRef.current['workpiece'];
        const carriage = groupsRef.current['carriage'];
        const tool = groupsRef.current['tool_post'];
        const tailstock = groupsRef.current['tailstock'];

        const drive = groupsRef.current['drive_system'];
        const feedAssembly = groupsRef.current['lead_screw'];
        const apronWheel = carriage?.getObjectByName('apron_handwheel');
        const drivePulley = drive?.getObjectByName('drive_pulley');
        const belt = drive?.getObjectByName('drive_belt');
        const coolantSystem = groupsRef.current['coolant_system'];
        const droplets = coolantSystem?.getObjectByName('coolant_droplets');
        const chipAssembly = groupsRef.current['chip_tray'];
        const chips = chipAssembly?.getObjectByName('chips');

        if (activeRunning) {
          const rpm = Math.max(60, Number(simParams?.speed || 750));
          const spinSpeed = THREE.MathUtils.clamp(rpm / 4200, 0.05, 0.85);
          if (chuck) chuck.rotation.x -= spinSpeed;
          if (spindle) spindle.rotation.x -= spinSpeed;
          if (workpiece) workpiece.rotation.x -= spinSpeed;
          if (drivePulley) drivePulley.rotation.z += spinSpeed * 1.12;
          if (belt) belt.rotation.z += spinSpeed * 1.12;
          if (feedAssembly) feedAssembly.rotation.x += spinSpeed * (Number(simParams.feed || 0.1) * 3.2);
          if (apronWheel && opState === 'RUNNING') apronWheel.rotation.z += spinSpeed * 0.7;
          if (droplets && opState === 'RUNNING') droplets.children.forEach((d, i) => {
            d.position.x = 0.50 + (((elapsed * 0.9 + i * 0.08) % 0.28));
            d.position.y = 0.66 - (((elapsed * 1.4 + i * 0.07) % 0.30));
          });
          if (chips) {
            chips.visible = true;
            chips.children.forEach((chip, i) => {
              chip.rotation.z += 0.015 + (i % 3) * 0.004;
              chip.position.y = -0.72 + ((Math.sin(elapsed * 2.0 + i) + 1) * 0.008);
            });
          }
        }

        orangeSpotLight.position.set(carriage ? carriage.position.x + 0.55 : 0.4, 0.65, 0.65);
        orangeSpotLight.intensity = opState === 'RUNNING' ? 1.6 + Math.sin(elapsed * 18) * 0.25 : 0.35;

        if (chips && opState !== 'RUNNING') chips.visible = operationProgress > 8;

        if (opState === 'RUNNING') {
          if (carriage && tool) {
            const feedTravel = THREE.MathUtils.lerp(0.92, -1.22, progress);
            if (op === 'facing') {
              carriage.position.x = 0.52;
              tool.position.z = THREE.MathUtils.lerp(0.54, 0.43, progress);
            } else if (op === 'taper_turning' || op === 'contour_turning' || op === 'threading' || op === 'knurling') {
              carriage.position.x = feedTravel;
              tool.position.z = 0.46;
            } else if (op === 'forming' || op === 'parting_off' || op === 'chamfering') {
              carriage.position.x = op === 'parting_off' ? 0.12 : 0.54;
              tool.position.z = THREE.MathUtils.lerp(0.50, 0.43, progress);
            } else if (op === 'boring') {
              carriage.position.x = THREE.MathUtils.lerp(0.95, -0.18, progress);
              tool.position.z = 0.42;
            } else if (op === 'drilling') {
              if (tailstock) tailstock.position.x = THREE.MathUtils.lerp(2.80, 1.85, progress);
            }
            tool.position.x = carriage.position.x + 0.18;
          }
        } else {
          if (carriage) {
            carriage.position.x = THREE.MathUtils.lerp(carriage.position.x, currentToolPos.x, 0.15);
            if (tool) {
              tool.position.x = carriage.position.x + 0.18;
              tool.position.z = THREE.MathUtils.lerp(tool.position.z, currentToolPos.z + 0.45, 0.15);
            }
          }
        }

        if (workpiece) {
          const raw = workpiece.getObjectByName('raw_stock');
          const facing = workpiece.getObjectByName('facing_mesh');
          const taper = workpiece.getObjectByName('taper_mesh');
          const contour = workpiece.getObjectByName('contour_mesh');
          const form = workpiece.getObjectByName('forming_mesh');
          const bore = workpiece.getObjectByName('bore_hole_mesh');
          const chamfer = workpiece.getObjectByName('chamfer_mesh');
          const partingRemain = workpiece.getObjectByName('parting_remain');
          const partedPiece = workpiece.getObjectByName('parted_piece');
          const helix = workpiece.getObjectByName('helix_mesh');
          const drill = workpiece.getObjectByName('drill_hole_mesh');
          const knurl = workpiece.getObjectByName('knurl_mesh');

          if (raw) raw.visible = true;
          if (facing) facing.visible = false;
          if (taper) taper.visible = false;
          if (contour) contour.visible = false;
          if (form) form.visible = false;
          if (bore) bore.visible = false;
          if (chamfer) chamfer.visible = false;
          if (partingRemain) partingRemain.visible = false;
          if (partedPiece) partedPiece.visible = false;
          if (helix) helix.visible = false;
          if (drill) drill.visible = false;
          if (knurl) knurl.visible = false;

          if (raw) {
            raw.scale.set(1, 1, 1);
            raw.position.set(0, 0, 0);
          }

          if (runningOrCompleted) {
            if (op === 'facing') {
              if (raw) raw.visible = false;
              if (facing) facing.visible = true;
            } else if (op === 'taper_turning') {
              if (raw) { raw.visible = progress < 0.96; raw.scale.set(1, 1 - progress * 0.16, 1 - progress * 0.16); }
              if (taper) { taper.visible = true; taper.scale.set(1, 0.84 + progress * 0.16, 0.84 + progress * 0.16); }
            } else if (op === 'contour_turning') {
              if (raw) { raw.visible = progress < 0.96; raw.scale.set(1, 1 - progress * 0.13, 1 - progress * 0.13); }
              if (contour) { contour.visible = true; contour.scale.set(1, 0.87 + progress * 0.13, 0.87 + progress * 0.13); }
            } else if (op === 'forming') {
              if (raw) raw.visible = false;
              if (form) form.visible = true;
            } else if (op === 'boring') {
              if (bore) {
                bore.visible = true;
                bore.scale.set(THREE.MathUtils.lerp(0.8, 1.3, progress), 1, THREE.MathUtils.lerp(0.8, 1.3, progress));
              }
            } else if (op === 'chamfering') {
              if (raw) raw.visible = false;
              if (chamfer) chamfer.visible = true;
            } else if (op === 'parting_off') {
              if (raw) raw.visible = false;
              if (partingRemain) partingRemain.visible = true;
              if (partedPiece) {
                partedPiece.visible = true;
                if (progress >= 0.95) {
                  partedPiece.position.y = -1.6;
                  partedPiece.rotation.z = Math.PI / 3;
                } else {
                  partedPiece.position.set(0.9, 0, 0);
                  partedPiece.rotation.z = 0;
                }
              }
            } else if (op === 'threading') {
              if (helix) {
                helix.visible = true;
                helix.scale.set(progress, 1, 1);
              }
            } else if (op === 'drilling') {
              if (drill) {
                drill.visible = true;
                drill.scale.set(1, 1, progress);
              }
            } else if (op === 'knurling') {
              if (knurl) {
                knurl.visible = true;
                knurl.scale.set(1, 1, progress);
              }
            }

            if (opState === 'RUNNING') {
              sparks.visible = true;
              sparks.position.set(tool ? tool.position.x : 0.6, 0.57, tool ? tool.position.z : 0.45);
            } else {
              sparks.visible = false;
            }
          }
        }

      // 2. WELDING
      } else if (machineId === 'welding') {
        const torch = groupsRef.current['electrode_holder'];
        const weldJoint = groupsRef.current['weld_joint'];

        if (opState === 'RUNNING') {
          if (torch) {
            torch.position.x = 0;
            torch.position.y = 1.0;
            torch.position.z = THREE.MathUtils.lerp(-0.38, 0.38, progress);
          }
        } else if (torch) {
          torch.position.x = THREE.MathUtils.lerp(torch.position.x, currentToolPos.x, 0.15);
          torch.position.z = THREE.MathUtils.lerp(torch.position.z, currentToolPos.z, 0.15);
        }

        if (weldJoint) {
          const bead = weldJoint.getObjectByName('weld_bead_mesh');
          const pool = weldJoint.getObjectByName('molten_pool');

          if (runningOrCompleted) {
            if (bead) {
              bead.visible = true;
              bead.scale.set(1, 1, Math.max(0.01, progress));
              bead.position.set(0, 0, THREE.MathUtils.lerp(-0.38, 0, progress));
            }
            if (pool && opState === 'RUNNING') {
              pool.visible = true;
              pool.position.set(0, 0.045, THREE.MathUtils.lerp(-0.38, 0.38, progress));
            } else if (pool) {
              pool.visible = false;
            }
          } else {
            if (bead) bead.visible = false;
            if (pool) pool.visible = false;
          }
        }

        if (opState === 'RUNNING') {
          sparks.visible = true;
          sparks.position.set(0, 0.9, THREE.MathUtils.lerp(-0.38, 0.38, progress));
          orangeSpotLight.intensity = 6.0 + Math.sin(elapsed * 45) * 3.5;
          orangeSpotLight.color.set('#60A5FA');
        } else {
          sparks.visible = false;
          orangeSpotLight.intensity = 1.4;
          orangeSpotLight.color.set('#FFFFFF');
        }

      // 3. SHAPER
      } else if (machineId === 'shaper') {
        const toolHead = groupsRef.current['tool_head'];
        const clapper = groupsRef.current['clapper_box'];
        const cuttingTool = groupsRef.current['cutting_tool'];
        const workpiece = groupsRef.current['workpiece'];

        if (activeRunning) {
          const strokeTime = (elapsed * 2.5) % (Math.PI * 2);
          let strokeRate = 0;
          let isCutting = false;
          if (strokeTime < Math.PI * 1.4) {
            strokeRate = -1.0 + (strokeTime / (Math.PI * 1.4)) * 2.0;
            isCutting = true;
          } else {
            const retT = (strokeTime - Math.PI * 1.4) / (Math.PI * 0.6);
            strokeRate = 1.0 - retT * 2.0;
            isCutting = false;
          }
          if (toolHead) toolHead.position.z = strokeRate * 0.8;
          if (clapper) {
            clapper.position.z = (toolHead ? toolHead.position.z : 0) + 0.1;
            clapper.rotation.x = !isCutting ? -0.28 : 0;
          }
          if (cuttingTool) cuttingTool.position.z = (toolHead ? toolHead.position.z : 0) + 0.2;

          if (isCutting && opState === 'RUNNING') {
            sparks.visible = true;
            sparks.position.set(0, 0.65, (toolHead ? toolHead.position.z : 0) + 1.2);
          } else {
            sparks.visible = false;
          }
        }

        if (workpiece) {
          const block = workpiece.getObjectByName('main_block');
          const slot = workpiece.getObjectByName('shaper_slot');
          
          if (block) {
            block.scale.set(1, 1, 1);
            block.visible = true;
          }
          if (slot) slot.visible = false;

          if (runningOrCompleted) {
            if (op === 'plain_shaping' || op === 'angular_shaping') {
              if (block) block.scale.set(1, Math.max(0.65, 1.0 - progress * 0.35), 1);
            } else if (op === 'step_shaping') {
              if (block) block.scale.set(1, 1, Math.max(0.7, 1.0 - progress * 0.3));
            } else if (op === 'slot_cutting' || op === 'keyway_cutting' || op === 'groove_cutting') {
              if (slot) {
                slot.visible = true;
                slot.scale.set(1, 1, progress);
              }
            }
          }
        }

      // 4. PLANER
      } else if (machineId === 'planer') {
        const table = groupsRef.current['table'];
        const workpiece = groupsRef.current['workpiece'];
        const tHead = groupsRef.current['tool_head'];
        const pTool = groupsRef.current['cutting_tool'];

        if (activeRunning) {
          if (table) table.position.z = Math.sin(elapsed * 1.5) * 1.6;
          if (tHead) tHead.position.x = Math.sin(elapsed * 0.2) * 0.6;
          if (pTool) pTool.position.x = tHead.position.x;
          if (opState === 'RUNNING') {
            sparks.visible = true;
            sparks.position.set(tHead ? tHead.position.x : 0, 0.2, 0.4);
          } else {
            sparks.visible = false;
          }
        }

        if (workpiece) {
          const block = workpiece.getObjectByName('planer_block');
          const slot = workpiece.getObjectByName('planer_slot');
          
          if (block) {
            block.scale.set(1, 1, 1);
            block.visible = true;
          }
          if (slot) slot.visible = false;

          if (runningOrCompleted) {
            if (op === 'plain_planing' || op === 'vertical_surface_planing') {
              if (block) block.scale.set(1, Math.max(0.7, 1.0 - progress * 0.3), 1);
            } else if (op === 'step_planing') {
              if (block) block.scale.set(Math.max(0.7, 1.0 - progress * 0.3), 1, 1);
            } else if (op === 'slot_planing' || op === 'groove_planing' || op === 'keyway_slot_work') {
              if (slot) {
                slot.visible = true;
                slot.scale.set(1, 1, progress);
              }
            }
          }
        }

      // 5. MILLING
      } else if (machineId === 'milling') {
        const cutter = groupsRef.current['cutter'];
        const spindle = groupsRef.current['spindle'];
        const table = groupsRef.current['table'];
        const vice = groupsRef.current['vice'];
        const workpiece = groupsRef.current['workpiece'];

        if (activeRunning) {
          if (cutter) cutter.rotation.y += 0.4;
          if (spindle) spindle.rotation.y += 0.4;
        }

        if (opState === 'RUNNING') {
          if (table) {
            table.position.x = THREE.MathUtils.lerp(-0.6, 0.6, progress);
            table.position.y = -0.3;
            if (vice) {
              vice.position.x = table.position.x;
              vice.position.y = table.position.y + 0.3;
            }
          }
          sparks.visible = true;
          sparks.position.set(0, 0.3, 0.7);
        } else {
          if (table) {
            table.position.x = THREE.MathUtils.lerp(table.position.x, currentToolPos.x, 0.15);
            table.position.y = THREE.MathUtils.lerp(table.position.y, currentToolPos.y - 0.4, 0.15);
            if (vice) {
              vice.position.x = table.position.x;
              vice.position.y = table.position.y + 0.3;
            }
          }
          sparks.visible = false;
        }

        if (workpiece) {
          const block = workpiece.getObjectByName('mill_block');
          const slot = workpiece.getObjectByName('mill_slot');
          
          if (block) {
            block.scale.set(1, 1, 1);
            block.visible = true;
          }
          if (slot) slot.visible = false;

          if (runningOrCompleted) {
            if (op === 'face_milling' || op === 'plain_milling') {
              if (block) block.scale.set(1, Math.max(0.65, 1.0 - progress * 0.35), 1);
            } else if (op === 'slot_milling' || op === 'keyway_milling' || op === 't_slot_cutting' || op === 'end_milling') {
              if (slot) {
                slot.visible = true;
                slot.scale.set(1, 1, progress);
              }
            } else if (op === 'pocket_milling') {
              if (block) block.scale.set(Math.max(0.7, 1.0 - progress * 0.3), Math.max(0.7, 1.0 - progress * 0.3), 1);
            }
          }
        }

      // 6. CASTING
      } else if (machineId === 'casting') {
        const ladle = groupsRef.current['ladle'];
        const cavity = groupsRef.current['casting_cavity'];
        const cope = groupsRef.current['cope_flask'];
        const drag = groupsRef.current['drag_flask'];

        if (ladle) {
          const stream = ladle.getObjectByName('molten_stream');
          if (opState === 'RUNNING' && (op === 'pouring' || op === 'filling')) {
            ladle.rotation.z = THREE.MathUtils.lerp(0, -0.65, Math.min(1, progress * 2));
            ladle.position.set(-0.5, 0.5, 0);
            if (stream) stream.visible = true;
          } else {
            ladle.rotation.z = THREE.MathUtils.lerp(ladle.rotation.z, 0, 0.1);
            ladle.position.set(-1.8, 0.8, 0.6);
            if (stream) stream.visible = false;
          }
        }

        if (cavity) {
          cavity.traverse((c) => {
            if (c.isMesh) {
              if (runningOrCompleted) {
                if (op === 'pouring' || op === 'filling') {
                  c.material = mats.moltenMetal;
                  c.material.emissiveIntensity = 3.0;
                } else if (op === 'solidification') {
                  c.material = mats.moltenMetal;
                  c.material.emissiveIntensity = THREE.MathUtils.lerp(3.0, 0.2, progress);
                } else if (op === 'casting_removal' || op === 'cooling' || op === 'cleaning' || op === 'inspection') {
                  c.material = mats.moltenMetalCool;
                  c.material.emissiveIntensity = 0;
                }
              } else {
                c.material = mats.moltenMetalCool;
                c.material.emissiveIntensity = 0;
              }
            }
          });
        }

        if (op === 'casting_removal' && runningOrCompleted) {
          if (cope) cope.position.y = THREE.MathUtils.lerp(cope.position.y, 2.2, 0.08);
          if (drag) drag.position.y = THREE.MathUtils.lerp(drag.position.y, -1.8, 0.08);
        } else {
          if (cope) cope.position.y = THREE.MathUtils.lerp(cope.position.y, 0.1, 0.1);
          if (drag) drag.position.y = THREE.MathUtils.lerp(drag.position.y, -0.6, 0.1);
        }

      // 7. MOULDING
      } else if (machineId === 'moulding') {
        const sand = groupsRef.current['sand'];
        const pattern = groupsRef.current['pattern'];
        const cope = groupsRef.current['cope'];

        if (op === 'sand_compaction' && runningOrCompleted) {
          if (sand) sand.scale.y = THREE.MathUtils.lerp(1.0, 0.82, progress);
        } else if (sand) {
          sand.scale.y = 1.0;
        }

        if (op === 'pattern_removal' && runningOrCompleted) {
          if (pattern) pattern.position.y = THREE.MathUtils.lerp(-0.2, 1.8, progress);
        } else if (pattern) {
          pattern.position.y = -0.2;
        }

        if (op === 'mould_assembly' && runningOrCompleted) {
          if (cope) cope.position.y = THREE.MathUtils.lerp(1.2, 0.4, progress);
        }
      }

      // 3D Labels
      const labels = labelsData[machineId] || [];
      if (showLabels && cameraRef.current) {
        labels.forEach((lbl) => {
          const g = groupsRef.current[lbl.id];
          const div = document.getElementById(`label-${lbl.id}`);
          const line = document.getElementById(`line-${lbl.id}`);
          if (g && div && line) {
            const pos = new THREE.Vector3();
            g.getWorldPosition(pos);
            
            pos.project(cameraRef.current);
            const x = (pos.x * 0.5 + 0.5) * rendererRef.current.domElement.clientWidth;
            const y = (-(pos.y * 0.5) + 0.5) * rendererRef.current.domElement.clientHeight;
            
            if (pos.z <= 1) {
              const angle = -Math.PI / 4;
              const len = 42;
              const labelX = x + Math.cos(angle) * len;
              const labelY = y + Math.sin(angle) * len;
              
              div.style.left = `${labelX}px`;
              div.style.top = `${labelY}px`;
              div.style.display = 'block';
              
              line.setAttribute('x1', x.toString());
              line.setAttribute('y1', y.toString());
              line.setAttribute('x2', labelX.toString());
              line.setAttribute('y2', labelY.toString());
              line.style.display = 'block';
            } else {
              div.style.display = 'none';
              line.style.display = 'none';
            }
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('mousemove', handleMouseMove);
      workshopAudio.stopSound();
      if (tooltipDiv && tooltipDiv.parentNode) {
        tooltipDiv.parentNode.removeChild(tooltipDiv);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [machineId, isExploded, isCutaway, showLabels]);

  // Handle camera keys
  useEffect(() => {
    const handleCameraKeydown = (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isTyping) return;

      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls) return;

      const moveStep = 0.25;
      const rotateAngle = 0.05;

      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        camera.position.y += moveStep;
        controls.target.y += moveStep;
        controls.update();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        camera.position.y -= moveStep;
        controls.target.y -= moveStep;
        controls.update();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
        camera.position.addScaledVector(right, -moveStep);
        controls.target.addScaledVector(right, -moveStep);
        controls.update();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
        camera.position.addScaledVector(right, moveStep);
        controls.target.addScaledVector(right, moveStep);
        controls.update();
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotateAngle);
        camera.position.copy(offset.add(controls.target));
        controls.update();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotateAngle);
        camera.position.copy(offset.add(controls.target));
        controls.update();
      }

      if (e.key === '+' || e.key === '=' || e.key === 'Add') {
        e.preventDefault();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        camera.position.addScaledVector(dir, 0.4);
        controls.update();
      } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
        e.preventDefault();
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        camera.position.addScaledVector(dir, -0.4);
        controls.update();
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setCameraMode('default');
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setCameraMode('top_view');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setCameraMode('front_view');
      }
    };

    window.addEventListener('keydown', handleCameraKeydown);
    return () => window.removeEventListener('keydown', handleCameraKeydown);
  }, [setCameraMode]);

  const handleCanvasClick = (e) => {
    if (!sceneRef.current || !cameraRef.current || !mountRef.current) return;
    const canvas = rendererRef.current.domElement;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && !groupsRef.current[obj.name] && obj.parent.name !== 'scene') {
        obj = obj.parent;
      }
      if (groupsRef.current[obj.name]) {
        onPartSelect(obj.name);
      }
    }
  };

  const currentOpName = typeof activeOperation === 'object' ? activeOperation?.name : activeOperation;

  return (
    <div className={`three-visualizer-shell machine-${machineId}${immersiveUi ? ' immersive-ui' : ''}`} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '11px', color: 'var(--primary-blue)', fontFamily: 'var(--mono-font)', letterSpacing: '1px' }}>
            CONNECTING 3D INDUSTRIAL ENGINE...
          </div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%', cursor: 'crosshair' }} 
      />

      {/* 1. ON-PLANE 3D TELEMETRY & AUDIO HUD (Top Center) */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: immersiveUi ? 'none' : 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.88)',
        border: '1px solid rgba(10, 92, 255, 0.3)',
        borderRadius: '30px',
        padding: '6px 16px',
        zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#FFF' }}>
          <Activity size={13} style={{ color: operationState === 'RUNNING' ? 'var(--color-green)' : 'var(--brand-primary)' }} />
          <span style={{ fontWeight: '800', fontFamily: 'var(--mono-font)' }}>
            {currentOpName ? currentOpName.toUpperCase() : machineId.toUpperCase()}
          </span>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

        <div style={{ fontSize: '10.5px', color: '#CBD5E1', display: 'flex', gap: '8px' }}>
          <span>{simParams?.speed || 750} {machineId === 'welding' ? 'A' : machineId === 'shaper' ? 'SPM' : 'RPM'}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span>{simParams?.feed || 0.12} mm</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span>{simParams?.doc || 0.8} cut</span>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            const muted = workshopAudio.toggleMute();
            setIsAudioMuted(muted);
          }}
          title="Toggle Procedural Workshop Audio"
          style={{
            background: 'transparent',
            border: 'none',
            color: isAudioMuted ? 'var(--text-secondary)' : 'var(--brand-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {/* 2. ON-PLANE 3D OPERATIONS DOCK (Bottom Center Floating Bar) */}
      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '90%',
        display: immersiveUi ? 'none' : 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(10, 92, 255, 0.35)',
        borderRadius: '8px',
        padding: '8px 14px',
        zIndex: 40,
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        pointerEvents: 'auto'
      }}>
        {/* Play / Pause / Reset Quick Buttons */}
        <div style={{ display: 'flex', gap: '6px', marginRight: '6px', borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: '8px' }}>
          {operationState === 'RUNNING' ? (
            <button
              onClick={onPauseResumeSimulation}
              title="Pause Simulation"
              style={{
                padding: '6px 10px',
                background: 'rgba(10, 92, 255, 0.2)',
                border: '1px solid var(--brand-primary)',
                borderRadius: '4px',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Pause size={12} fill="#FFF" />
              PAUSE
            </button>
          ) : (
            <button
              onClick={() => {
                if (onStartSimulation) onStartSimulation();
              }}
              title="Start Simulation"
              style={{
                padding: '6px 12px',
                background: 'var(--brand-primary)',
                border: 'none',
                borderRadius: '4px',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Play size={12} fill="#FFF" />
              RUN
            </button>
          )}

          <button
            onClick={() => {
              if (onResetSimulation) onResetSimulation();
            }}
            title="Reset Workpiece to Initial State"
            style={{
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              color: '#FFF',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Direct Operation Selection Chips */}
        <div style={{ display: 'flex', gap: '6px', whiteSpace: 'nowrap' }}>
          {machineOperations.map((op) => {
            const isSelected = activeOperation?.id === op.id || activeOperation === op.id;
            return (
              <button
                key={op.id}
                onClick={() => {
                  if (onSelectOperation) onSelectOperation(op);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: '1px solid ' + (isSelected ? 'var(--brand-primary)' : 'rgba(255,255,255,0.12)'),
                  background: isSelected ? 'rgba(10, 92, 255, 0.25)' : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#FFF' : '#CBD5E1',
                  fontSize: '10.5px',
                  fontWeight: isSelected ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {op.name}
              </button>
            );
          })}
        </div>
      </div>

      {showLabels && (labelsData[machineId] || []).map((lbl) => (
        <div
          key={lbl.id}
          id={`label-${lbl.id}`}
          style={{
            position: 'absolute',
            background: 'rgba(16, 24, 32, 0.92)',
            border: '1px solid #0A5CFF',
            borderRadius: '2px',
            padding: '2px 5px',
            fontSize: '8px',
            color: '#FFF',
            fontFamily: 'var(--mono-font)',
            fontWeight: 'bold',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            display: 'none',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 5px rgba(10, 92, 255, 0.35)',
            zIndex: 35
          }}
        >
          {lbl.name.toUpperCase()}
        </div>
      ))}

      {showLabels && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 30 }}>
          {(labelsData[machineId] || []).map((lbl) => (
            <line
              key={lbl.id}
              id={`line-${lbl.id}`}
              x1="0" y1="0" x2="0" y2="0"
              stroke="#0A5CFF"
              strokeWidth="1.2"
              strokeDasharray="2,2"
              style={{ display: 'none' }}
            />
          ))}
        </svg>
      )}

      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(16, 24, 32, 0.85)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '4px 14px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 25,
          backdropFilter: 'blur(4px)',
          fontSize: '9px',
          fontFamily: 'var(--mono-font)',
          color: 'var(--text-secondary)'
        }}>
          <span><strong style={{ color: '#0A5CFF' }}>W A S D</strong> MOVE</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: '#0A5CFF' }}>↑ ↓ ← →</strong> ROTATE</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: '#0A5CFF' }}>+ -</strong> ZOOM</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: '#0A5CFF' }}>R</strong> RESET</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: '#0A5CFF' }}>T</strong> TOP</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: '#0A5CFF' }}>F</strong> FRONT</span>
        </div>
      )}
    </div>
  );
}
