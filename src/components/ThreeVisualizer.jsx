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
    { id: 'chuck', name: 'Chuck' },
    { id: 'spindle', name: 'Spindle' },
    { id: 'workpiece', name: 'Workpiece' },
    { id: 'carriage', name: 'Carriage' },
    { id: 'cross_slide', name: 'Cross Slide' },
    { id: 'compound_rest', name: 'Compound Rest' },
    { id: 'tool_post', name: 'Tool Post' },
    { id: 'cutting_tool', name: 'Cutting Tool' },
    { id: 'tailstock', name: 'Tailstock' },
    { id: 'lead_screw', name: 'Lead Screw' },
    { id: 'feed_rod', name: 'Feed Rod' },
    { id: 'handwheels', name: 'Hand Wheels' }
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
  isLogin = false
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
        camera.position.set(6, 4, 8);
        controls.target.set(0, 0, 0);
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
    scene.background = new THREE.Color('#0D0221');
    sceneRef.current = scene;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: '#150630', 
      roughness: 0.8, 
      metalness: 0.15 
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2;
    scene.add(floorMesh);

    // Cyber Grid on floor
    const gridHelper = new THREE.GridHelper(50, 50, 0x7928CA, 0x240A50);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    // Wall & pillars
    if (isDark) {
      const wallGeo = new THREE.PlaneGeometry(40, 20);
      const wallMat = new THREE.MeshStandardMaterial({
        color: '#1A083B',
        roughness: 0.8,
        metalness: 0.1
      });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(0, 4, -8);
      scene.add(wallMesh);

      const pillarGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: '#250B52',
        roughness: 0.6,
        metalness: 0.2
      });
      const pillar1 = new THREE.Mesh(pillarGeo, pillarMat);
      pillar1.position.set(-9, 4, -7.8);
      scene.add(pillar1);
      
      const pillar2 = new THREE.Mesh(pillarGeo, pillarMat);
      pillar2.position.set(9, 4, -7.8);
      scene.add(pillar2);

      // Conduit pipes
      const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 24, 16);
      const pipeMat = new THREE.MeshStandardMaterial({
        color: '#FF5376',
        metalness: 0.9,
        roughness: 0.2
      });
      
      const pipe1 = new THREE.Mesh(pipeGeo, pipeMat);
      pipe1.position.set(0, 5.0, -7.7);
      pipe1.rotation.z = Math.PI / 2;
      scene.add(pipe1);

      // Platform slab
      const platformGeo = new THREE.BoxGeometry(6.6, 0.15, 3.2);
      const platformMat = new THREE.MeshStandardMaterial({
        color: '#280E58',
        roughness: 0.4,
        metalness: 0.3
      });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(0, -1.92, 0);
      scene.add(platform);

      // Neon pink/cyan underglow strip
      const underglowGeo = new THREE.BoxGeometry(5.4, 0.04, 0.04);
      const underglowMat = new THREE.MeshStandardMaterial({
        color: '#FF5376',
        emissive: '#FF5376',
        emissiveIntensity: 6.0,
        roughness: 0.1
      });
      const underglow = new THREE.Mesh(underglowGeo, underglowMat);
      underglow.position.set(0, -1.83, 0.9);
      scene.add(underglow);

      const floorBounceGlow = new THREE.PointLight('#FF5376', 4.0, 10);
      floorBounceGlow.position.set(0, -1.88, 0);
      scene.add(floorBounceGlow);

      const cyanAccentLight = new THREE.PointLight('#00F5D4', 3.0, 8);
      cyanAccentLight.position.set(0, -1.88, -0.9);
      scene.add(cyanAccentLight);
    }

    // Radial shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(13, 2, 33, 0.8)');
    grad.addColorStop(0.5, 'rgba(13, 2, 33, 0.4)');
    grad.addColorStop(1, 'rgba(13, 2, 33, 0)');
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
    shadowMesh.position.y = -1.98;
    scene.add(shadowMesh);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 4, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    
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
    const ambientLight = new THREE.AmbientLight('#D8B4FE', highContrast ? 2.2 : 1.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#FFFFFF', highContrast ? 3.2 : 2.5);
    mainLight.position.set(8, 15, 8);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight('#00F5D4', highContrast ? 3.0 : 2.2);
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    const magentaSpotLight = new THREE.PointLight('#FF5376', highContrast ? 2.2 : 1.8, 18);
    magentaSpotLight.position.set(-3, 4, 3);
    scene.add(magentaSpotLight);

    // Materials dictionary
    const mats = {
      machineBody: new THREE.MeshStandardMaterial({ color: '#2B0F60', metalness: 0.9, roughness: 0.25 }),
      secondaryMetal: new THREE.MeshStandardMaterial({ color: '#E2E8F0', metalness: 0.98, roughness: 0.1 }),
      darkMechanicalParts: new THREE.MeshStandardMaterial({ color: '#160830', metalness: 0.85, roughness: 0.3 }),
      shafts: new THREE.MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.98, roughness: 0.08 }), 
      workpiece: new THREE.MeshStandardMaterial({ color: '#E0E7FF', metalness: 0.95, roughness: 0.18 }), 
      cuttingTool: new THREE.MeshStandardMaterial({ color: '#F8FAFC', metalness: 0.98, roughness: 0.12 }),
      safetyParts: new THREE.MeshStandardMaterial({ color: '#FF5376', metalness: 0.4, roughness: 0.3 }),
      sandMould: new THREE.MeshStandardMaterial({ color: '#4A3B63', roughness: 0.95, metalness: 0.05 }), 
      moltenMetal: new THREE.MeshStandardMaterial({ color: '#FF5376', emissive: '#FF5376', emissiveIntensity: 2.8, roughness: 0.1 }),
      moltenMetalCool: new THREE.MeshStandardMaterial({ color: '#250B48', metalness: 0.8, roughness: 0.6 })
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
    };

    // 1. LATHE
    if (machineId === 'lathe') {
      const bedGroup = new THREE.Group();
      const bedBase = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 1.4), mats.machineBody);
      bedGroup.add(bedBase);
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.08, 0.15), mats.secondaryMetal);
      rail1.position.set(0, 0.44, 0.4);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(7, 0.08, 0.15), mats.secondaryMetal);
      rail2.position.set(0, 0.44, -0.4);
      bedGroup.add(rail1, rail2);
      addPart('bed', bedGroup, [0, -1.2, 0]);

      const headstockGroup = new THREE.Group();
      const hsBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.4), mats.darkMechanicalParts);
      headstockGroup.add(hsBase);
      for (let i = 0; i < 2; i++) {
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12).rotateX(Math.PI / 2), mats.secondaryMetal);
        dial.position.set(-0.4 + i * 0.8, 0.4, 0.71);
        headstockGroup.add(dial);
      }
      addPart('headstock', headstockGroup, [-2.6, 0.2, 0]);

      const chuckGroup = new THREE.Group();
      const chuckBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 24).rotateZ(Math.PI / 2), mats.secondaryMetal);
      chuckGroup.add(chuckBase);
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.3), mats.shafts);
        jaw.position.set(-0.25, 0.62 * Math.sin(angle), 0.62 * Math.cos(angle));
        chuckGroup.add(jaw);
      }
      addPart('chuck', chuckGroup, [-1.8, 0.2, 0]);
      addPart('spindle', new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.0, 16).rotateZ(Math.PI / 2), mats.shafts), [-2.6, 0.2, 0]);

      const wpGroup = ProceduralWorkpieceManager.createLatheWorkpieceGroup(mats);
      addPart('workpiece', wpGroup, [0, -0.6, 0]);

      addPart('carriage', new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.6), mats.secondaryMetal), [0, 0.5, 1.2]);
      addPart('cross_slide', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.2), mats.darkMechanicalParts), [0, 0.8, 1.4]);
      addPart('compound_rest', new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), mats.secondaryMetal), [0, 1.0, 1.5]);

      const toolPostMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), mats.darkMechanicalParts);
      const toolBit = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.1), mats.cuttingTool);
      toolBit.position.set(0.1, 0.1, -0.15);
      toolPostMesh.add(toolBit);
      addPart('tool_post', toolPostMesh, [0.2, 1.2, 1.6]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.1), mats.cuttingTool), [0.3, 1.3, 1.8]);

      const tailstockGroup = new THREE.Group();
      const tsBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), mats.machineBody);
      tailstockGroup.add(tsBody);
      const quill = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.9, 12).rotateZ(Math.PI / 2), mats.shafts);
      quill.position.set(-0.4, 0.1, 0);
      tailstockGroup.add(quill);
      addPart('tailstock', tailstockGroup, [2.5, 0.2, 0]);

      addPart('lead_screw', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 16).rotateZ(Math.PI / 2), mats.shafts), [0, -0.6, 0.8]);
      addPart('feed_rod', new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 16).rotateZ(Math.PI / 2), mats.secondaryMetal), [0, -0.9, 0.8]);

      const hwGroup = new THREE.Group();
      hwGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12).rotateX(Math.PI / 2), mats.safetyParts));
      addPart('handwheels', hwGroup, [0, 0, 1.8]);

    // 2. WELDING
    } else if (machineId === 'welding') {
      const table = new THREE.Group();
      table.add(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 3.2), mats.darkMechanicalParts));
      addPart('welding_table', table, [0, -0.8, 0]);
      addPart('welding_machine', new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), mats.machineBody), [-2.2, 0.2, -0.6]);

      const holder = new THREE.Group();
      const torchHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7).rotateX(Math.PI / 2), mats.darkMechanicalParts);
      const electrodeRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5).rotateX(Math.PI / 4), mats.cuttingTool);
      electrodeRod.position.set(0, -0.25, 0.25);
      holder.add(torchHandle, electrodeRod);
      addPart('electrode_holder', holder, [0, 1.3, 0]);

      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.2, -0.2, -0.6), new THREE.Vector3(0, 0.2, 0.8), new THREE.Vector3(0.5, 0.9, 0.2)]);
      addPart('cables', new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.05, 8, false), mats.darkMechanicalParts), [0, 0, 0]);
      addPart('ground_clamp', new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.5), mats.secondaryMetal), [-1.4, 0.9, 0.8]);

      const plates = new THREE.Group();
      plates.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.8), mats.secondaryMetal));
      addPart('metal_plates', plates, [0, 0, 0]);
      addPart('clamps', new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.3), mats.darkMechanicalParts), [-1.2, 1.0, 0.3]);

      const weldAssembly = ProceduralWorkpieceManager.createWeldingAssembly(mats);
      addPart('weld_joint', weldAssembly, [0, 0.86, 0]);
      addPart('ppe', new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mats.darkMechanicalParts), [1.4, 0.9, -1.0]);

    // 3. SHAPER
    } else if (machineId === 'shaper') {
      addPart('base', new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 3.8), mats.darkMechanicalParts), [0, -1.8, 0]);
      addPart('column', new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 2.2), mats.machineBody), [0, -0.3, -0.6]);
      addPart('ram', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 3.4), mats.secondaryMetal), [0, 1.2, -0.2]);
      addPart('tool_head', new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.4), mats.darkMechanicalParts), [0, 0.8, 1.6]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), mats.cuttingTool), [0, 0.2, 1.8]);
      addPart('clapper_box', new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.25), mats.safetyParts), [0, 0.5, 1.7]);
      addPart('table', new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), mats.secondaryMetal), [0, -0.5, 1.2]);
      addPart('vice', new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 1.0), mats.darkMechanicalParts), [0, 0.2, 1.2]);

      const wpGroup = new THREE.Group();
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), mats.workpiece);
      mainBlock.name = 'main_block';
      wpGroup.add(mainBlock);

      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.41, 0.8), mats.darkMechanicalParts);
      slot.name = 'shaper_slot';
      slot.position.set(0, 0.1, 0);
      slot.visible = false;
      wpGroup.add(slot);

      addPart('workpiece', wpGroup, [0, 0.45, 1.2]);

    // 4. PLANER
    } else if (machineId === 'planer') {
      addPart('table', new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 5.0), mats.secondaryMetal), [0, -1.1, 0]);

      const wpGroup = new THREE.Group();
      const planerBlock = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 2.5), mats.workpiece);
      planerBlock.name = 'planer_block';
      wpGroup.add(planerBlock);

      const planerSlot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.62, 2.52), mats.darkMechanicalParts);
      planerSlot.name = 'planer_slot';
      planerSlot.position.set(0, 0.1, 0);
      planerSlot.visible = false;
      wpGroup.add(planerSlot);

      addPart('workpiece', wpGroup, [0, -0.65, 0]);
      addPart('housing', new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 1.4), mats.machineBody), [-1.6, 0.5, 0]);
      addPart('cross_rail', new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.6), mats.shafts), [0, 1.4, 0]);
      addPart('tool_head', new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), mats.darkMechanicalParts), [0, 1.2, 0.4]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), mats.cuttingTool), [0, 0.7, 0.5]);
      addPart('clamps', new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.3), mats.darkMechanicalParts), [-0.6, -0.3, -1.0]);

    // 5. MILLING
    } else if (machineId === 'milling') {
      addPart('base', new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 3.4), mats.darkMechanicalParts), [0, -1.8, 0]);
      addPart('column', new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 2.0), mats.machineBody), [0, -0.6, -1.2]);
      addPart('spindle', new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8), mats.shafts), [0, 1.2, 0.6]);
      addPart('motor_head', new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.6), mats.darkMechanicalParts), [0, 1.8, 0.2]);
      addPart('cutter', new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6, 12), mats.cuttingTool), [0, 0.5, 0.6]);
      addPart('table', new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.2), mats.secondaryMetal), [0, -0.4, 0.8]);
      addPart('vice', new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), mats.darkMechanicalParts), [0, -0.1, 0.8]);

      const wpGroup = new THREE.Group();
      const millBlock = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.6), mats.workpiece);
      millBlock.name = 'mill_block';
      wpGroup.add(millBlock);

      const millSlot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.62), mats.darkMechanicalParts);
      millSlot.name = 'mill_slot';
      millSlot.position.set(0, 0.1, 0);
      millSlot.visible = false;
      wpGroup.add(millSlot);

      addPart('workpiece', wpGroup, [0, 0.2, 0.8]);
      addPart('handwheels', new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12).rotateZ(Math.PI / 2), mats.safetyParts), [1.7, -0.4, 0.8]);

    // 6. CASTING
    } else if (machineId === 'casting') {
      const pattern = new THREE.Group();
      pattern.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16), mats.workpiece));
      addPart('pattern', pattern, [-1.6, 0.8, -1.0]);

      addPart('cope_flask', new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), mats.sandMould), [0, 0.1, 0]);
      addPart('drag_flask', new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), mats.sandMould), [0, -0.6, 0]);
      addPart('sprue', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.6), mats.shafts), [0.6, 0.1, 0]);
      addPart('runner', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.12), mats.moltenMetalCool), [0.2, -0.3, 0]);
      addPart('riser', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), mats.shafts), [-0.6, 0.1, 0]);
      
      const ladleGroup = new THREE.Group();
      ladleGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 16), mats.darkMechanicalParts));
      const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), mats.moltenMetal);
      stream.name = "molten_stream";
      stream.position.set(0.3, -0.4, 0);
      stream.visible = false;
      ladleGroup.add(stream);
      addPart('ladle', ladleGroup, [-1.8, 0.8, 0.6]);

      const cavityInner = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16), mats.moltenMetalCool);
      addPart('casting_cavity', cavityInner, [0, -0.3, 0]);

    // 7. MOULDING
    } else if (machineId === 'moulding') {
      addPart('pattern', new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 16), mats.workpiece), [0, -0.2, 0]);
      addPart('cope', new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 2.2), mats.safetyParts), [0, 0.4, 0]);
      addPart('drag', new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 2.2), mats.safetyParts), [0, -0.6, 0]);
      addPart('flask', new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.22, 2.3), mats.darkMechanicalParts), [0, -0.1, 0]);
      addPart('sand', new THREE.Mesh(new THREE.BoxGeometry(2.18, 1.2, 2.18), mats.sandMould), [0, -0.1, 0]);
      addPart('cavity', new THREE.Mesh(new THREE.CylinderGeometry(0.61, 0.61, 0.26, 16), mats.moltenMetalCool), [0, -0.2, 0]);
      addPart('sprue', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.8), mats.shafts), [0.6, 0.3, 0]);
      addPart('runner', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.15), mats.secondaryMetal), [0.2, -0.2, 0]);
      addPart('riser', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8), mats.shafts), [-0.6, 0.3, 0]);
    }

    // Cache translations
    Object.keys(groupsRef.current).forEach((key) => {
      const g = groupsRef.current[key];
      g.userData.basePosition.copy(g.position);
    });

    const selectedHelper = new THREE.BoxHelper(new THREE.Mesh(), '#0A5CFF');
    selectedHelper.visible = false;
    scene.add(selectedHelper);
    selectedHelperRef.current = selectedHelper;

    const focusedHelper = new THREE.BoxHelper(new THREE.Mesh(), '#3D72C1');
    focusedHelper.visible = false;
    scene.add(focusedHelper);
    focusedHelperRef.current = focusedHelper;

    const hoverHelper = new THREE.BoxHelper(new THREE.Mesh(), '#60A5FA');
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
      new THREE.PointsMaterial({ color: '#60A5FA', size: 0.14, transparent: true, opacity: 0.9 })
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
              child.material.emissive?.set('#0A5CFF');
              child.material.emissiveIntensity = 0.35;
            } else if (isFocused) {
              child.material.emissive?.set('#3D72C1');
              child.material.emissiveIntensity = 0.22;
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

        if (activeRunning) {
          const spinSpeed = 0.25;
          if (chuck) chuck.rotation.x += spinSpeed;
          if (spindle) spindle.rotation.x += spinSpeed;
          if (workpiece) workpiece.rotation.x += spinSpeed;
        }

        if (opState === 'RUNNING') {
          if (carriage && tool) {
            if (op === 'facing') {
              carriage.position.x = 0.6;
              tool.position.z = THREE.MathUtils.lerp(1.6, 0.6, progress);
            } else if (op === 'taper_turning' || op === 'contour_turning' || op === 'threading' || op === 'knurling') {
              carriage.position.x = THREE.MathUtils.lerp(0.8, -0.8, progress);
              tool.position.z = 1.0;
            } else if (op === 'forming' || op === 'parting_off' || op === 'chamfering') {
              carriage.position.x = op === 'parting_off' ? 0.3 : 0.6;
              tool.position.z = THREE.MathUtils.lerp(1.5, 0.8, progress);
            } else if (op === 'boring') {
              carriage.position.x = THREE.MathUtils.lerp(1.2, 0.0, progress);
              tool.position.z = 0.55;
            } else if (op === 'drilling') {
              if (tailstock) {
                tailstock.position.x = THREE.MathUtils.lerp(2.5, 1.6, progress);
              }
            }
            tool.position.x = carriage.position.x + 0.2;
          }
        } else {
          if (carriage) {
            carriage.position.x = THREE.MathUtils.lerp(carriage.position.x, currentToolPos.x, 0.15);
            if (tool) {
              tool.position.x = carriage.position.x + 0.2;
              tool.position.z = THREE.MathUtils.lerp(tool.position.z, currentToolPos.z + 1.6, 0.15);
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
              if (raw) raw.visible = false;
              if (taper) taper.visible = true;
            } else if (op === 'contour_turning') {
              if (raw) raw.visible = false;
              if (contour) contour.visible = true;
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
              sparks.position.set(tool ? tool.position.x : 0.6, 0.4, tool ? tool.position.z : 0.8);
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
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
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
        display: 'flex',
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
        display: 'flex',
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
