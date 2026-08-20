import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
  simParams,
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
  operationState = 'IDLE'
}) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const groupsRef = useRef({});
  const animFrameIdRef = useRef(null);

  const selectedHelperRef = useRef(null);
  const focusedHelperRef = useRef(null);

  const isPlayingRef = useRef(isPlaying);
  const simParamsRef = useRef(simParams);
  const simStepRef = useRef(simStep);
  const toolPositionRef = useRef(toolPosition);
  
  const activeOperationRef = useRef(activeOperation);
  const operationProgressRef = useRef(operationProgress);
  const operationStateRef = useRef(operationState);

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
  }, [isPlaying, simParams, simStep, toolPosition, activeOperation, operationProgress, operationState]);

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
        camera.position.set(4, 2.2, 5);
        controls.target.set(0.2, 0.4, 0.6);
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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101820'); // Premium Dark Workshop Background
    sceneRef.current = scene;

    // Solid floor
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: '#252B2F', roughness: 0.6, metalness: 0.1 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2;
    scene.add(floorMesh);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, '#F28C28', 'rgba(174, 181, 183, 0.08)');
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 4, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 3;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#A4AAAC', highContrast ? 1.0 : 0.45);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#F1F0EA', highContrast ? 3.0 : 1.5);
    mainLight.position.set(8, 15, 8);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight('#AEB5B7', highContrast ? 2.5 : 1.0);
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    const orangeSpotLight = new THREE.PointLight('#F28C28', highContrast ? 3.5 : 2.0, 15);
    orangeSpotLight.position.set(-3, 4, 3);
    scene.add(orangeSpotLight);

    // Materials
    const mats = {
      machineBody: new THREE.MeshStandardMaterial({ color: '#596166', metalness: 0.7, roughness: 0.35 }),
      secondaryMetal: new THREE.MeshStandardMaterial({ color: '#858D91', metalness: 0.8, roughness: 0.25 }),
      darkMechanicalParts: new THREE.MeshStandardMaterial({ color: '#30363A', metalness: 0.85, roughness: 0.35 }),
      shafts: new THREE.MeshStandardMaterial({ color: '#AEB5B7', metalness: 0.9, roughness: 0.2 }),
      workpiece: new THREE.MeshStandardMaterial({ color: '#B87333', metalness: 0.95, roughness: 0.15 }),
      cuttingTool: new THREE.MeshStandardMaterial({ color: '#D6D9DA', metalness: 0.95, roughness: 0.1 }),
      safetyParts: new THREE.MeshStandardMaterial({ color: '#F28C28', metalness: 0.2, roughness: 0.4 }),
      sandMould: new THREE.MeshStandardMaterial({ color: '#A08060', roughness: 0.95, metalness: 0.05 }),
      moltenMetal: new THREE.MeshStandardMaterial({ color: '#FF4D00', emissive: '#FF2200', emissiveIntensity: 1.5, roughness: 0.1 }),
      moltenMetalCool: new THREE.MeshStandardMaterial({ color: '#454B4E', metalness: 0.8, roughness: 0.6 })
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
        basePosition: new THREE.Vector3(0, 0, 0)
      };
      machineGroup.add(partGroup);
      groupsRef.current[partId] = partGroup;
    };

    // Lathe Machine
    if (machineId === 'lathe') {
      addPart('bed', new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 1.4), mats.machineBody), [0, -1.2, 0]);
      addPart('headstock', new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.4), mats.darkMechanicalParts), [-2.6, 0.2, 0]);
      addPart('chuck', new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16).rotateZ(Math.PI / 2), mats.secondaryMetal), [-1.8, 0.2, 0]);
      addPart('spindle', new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.0, 16).rotateZ(Math.PI / 2), mats.shafts), [-2.6, 0.2, 0]);

      // Workpiece Group
      const wpGroup = new THREE.Group();
      const mainCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.8, 16).rotateZ(Math.PI / 2), mats.workpiece);
      mainCyl.name = 'main_cylinder';
      wpGroup.add(mainCyl);

      const taperCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2.8, 16).rotateZ(Math.PI / 2), mats.workpiece);
      taperCyl.name = 'taper_cylinder';
      taperCyl.visible = false;
      wpGroup.add(taperCyl);

      const contourCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 2.8, 16).rotateZ(Math.PI / 2), mats.workpiece);
      contourCyl.name = 'contour_cylinder';
      contourCyl.visible = false;
      wpGroup.add(contourCyl);

      const boreHole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#101010', roughness: 0.9 }));
      boreHole.name = 'bore_hole';
      boreHole.position.set(0.6, 0, 0);
      boreHole.visible = false;
      wpGroup.add(boreHole);

      const partedPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16).rotateZ(Math.PI / 2), mats.workpiece);
      partedPiece.name = 'parted_piece';
      partedPiece.position.set(1.0, 0, 0);
      partedPiece.visible = false;
      wpGroup.add(partedPiece);

      const helixPoints = [];
      for (let t = 0; t < Math.PI * 16; t += 0.1) {
        helixPoints.push(new THREE.Vector3(-1.2 + (t / (Math.PI * 16)) * 2.4, 0.41 * Math.sin(t), 0.41 * Math.cos(t)));
      }
      const helixLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(helixPoints), new THREE.LineBasicMaterial({ color: '#F28C28', linewidth: 2 }));
      helixLine.name = 'helix_line';
      helixLine.visible = false;
      wpGroup.add(helixLine);

      addPart('workpiece', wpGroup, [0, -0.6, 0]);

      addPart('carriage', new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.6), mats.secondaryMetal), [0, 0.5, 1.2]);
      addPart('cross_slide', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.2), mats.darkMechanicalParts), [0, 0.8, 1.4]);
      addPart('compound_rest', new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), mats.secondaryMetal), [0, 1.0, 1.5]);

      const toolPostMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), mats.darkMechanicalParts);
      toolPostMesh.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), mats.cuttingTool));
      addPart('tool_post', toolPostMesh, [0.2, 1.2, 1.6]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.1), mats.cuttingTool), [0.3, 1.3, 1.8]);

      const tailstock = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), mats.machineBody);
      tailstock.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.8, 12).rotateZ(Math.PI / 2), mats.shafts));
      addPart('tailstock', tailstock, [2.5, 0.2, 0]);

      addPart('lead_screw', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 16).rotateZ(Math.PI / 2), mats.shafts), [0, -0.6, 0.8]);
      addPart('feed_rod', new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 16).rotateZ(Math.PI / 2), mats.secondaryMetal), [0, -0.9, 0.8]);

      const hwGroup = new THREE.Group();
      hwGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12).rotateX(Math.PI / 2), mats.safetyParts));
      addPart('handwheels', hwGroup, [0, 0, 1.8]);

    } else if (machineId === 'welding') {
      const table = new THREE.Group();
      table.add(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 3.2), mats.darkMechanicalParts));
      addPart('welding_table', table, [0, -0.8, 0]);
      addPart('welding_machine', new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), mats.machineBody), [-2.2, 0.2, -0.6]);

      const holder = new THREE.Group();
      holder.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7).rotateX(Math.PI / 2), mats.darkMechanicalParts));
      addPart('electrode_holder', holder, [0, 1.3, 0]);

      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.2, -0.2, -0.6), new THREE.Vector3(0, 0.2, 0.8), new THREE.Vector3(0.5, 0.9, 0.2)]);
      addPart('cables', new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.05, 8, false), mats.darkMechanicalParts), [0, 0, 0]);
      addPart('ground_clamp', new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.5), mats.secondaryMetal), [-1.4, 0.9, 0.8]);

      const plates = new THREE.Group();
      plates.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.8), mats.secondaryMetal));
      addPart('metal_plates', plates, [0, 0, 0]);
      addPart('clamps', new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.3), mats.darkMechanicalParts), [-1.2, 1.0, 0.3]);

      // Joint Group
      const jointGroup = new THREE.Group();
      jointGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.78), mats.darkMechanicalParts));
      
      const bead = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.78, 8).rotateZ(Math.PI / 2), mats.secondaryMetal);
      bead.name = 'weld_bead';
      bead.visible = false;
      jointGroup.add(bead);
      addPart('weld_joint', jointGroup, [0, 0.86, 0]);

      addPart('ppe', new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mats.darkMechanicalParts), [1.4, 0.9, -1.0]);

    } else if (machineId === 'shaper') {
      addPart('base', new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 3.8), mats.darkMechanicalParts), [0, -1.8, 0]);
      addPart('column', new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 2.2), mats.machineBody), [0, -0.3, -0.6]);
      addPart('ram', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 3.4), mats.secondaryMetal), [0, 1.2, -0.2]);
      addPart('tool_head', new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.4), mats.darkMechanicalParts), [0, 0.8, 1.6]);
      addPart('cutting_tool', new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), mats.cuttingTool), [0, 0.2, 1.8]);
      addPart('clapper_box', new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.25), mats.safetyParts), [0, 0.5, 1.7]);
      addPart('table', new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), mats.secondaryMetal), [0, -0.5, 1.2]);
      addPart('vice', new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 1.0), mats.darkMechanicalParts), [0, 0.2, 1.2]);

      // Workpiece
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

    } else if (machineId === 'planer') {
      addPart('table', new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 5.0), mats.secondaryMetal), [0, -1.1, 0]);

      // Workpiece
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

    } else if (machineId === 'milling') {
      addPart('base', new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 3.4), mats.darkMechanicalParts), [0, -1.8, 0]);
      addPart('column', new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 2.0), mats.machineBody), [0, -0.6, -1.2]);
      addPart('spindle', new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8), mats.shafts), [0, 1.2, 0.6]);
      addPart('motor_head', new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.6), mats.darkMechanicalParts), [0, 1.8, 0.2]);
      addPart('cutter', new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8), mats.cuttingTool), [0, 0.5, 0.6]);
      addPart('table', new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.2), mats.secondaryMetal), [0, -0.4, 0.8]);
      addPart('vice', new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), mats.darkMechanicalParts), [0, -0.1, 0.8]);

      // Workpiece
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
      addPart('handwheels', new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12).rotateZ(Math.PI/2), mats.safetyParts), [1.7, -0.4, 0.8]);

    } else if (machineId === 'casting') {
      const pattern = new THREE.Group();
      pattern.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12), mats.workpiece));
      addPart('pattern', pattern, [-1.6, 0.8, -1.0]);

      addPart('cope_flask', new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), mats.sandMould), [0, 0.1, 0]);
      addPart('drag_flask', new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), mats.sandMould), [0, -0.6, 0]);
      addPart('sprue', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.6), mats.shafts), [0.6, 0.1, 0]);
      addPart('runner', new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.12), mats.moltenMetalCool), [0.2, -0.3, 0]);
      addPart('riser', new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), mats.shafts), [-0.6, 0.1, 0]);
      addPart('ladle', new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 12), mats.darkMechanicalParts), [-1.8, 0.8, 0.6]);

      // Casting Cavity
      const cavityInner = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12), mats.moltenMetalCool);
      addPart('casting_cavity', cavityInner, [0, -0.3, 0]);

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

    const selectedHelper = new THREE.BoxHelper(new THREE.Mesh(), '#F28C28');
    selectedHelper.visible = false;
    scene.add(selectedHelper);
    selectedHelperRef.current = selectedHelper;

    const focusedHelper = new THREE.BoxHelper(new THREE.Mesh(), '#E4572E');
    focusedHelper.visible = false;
    scene.add(focusedHelper);
    focusedHelperRef.current = focusedHelper;

    // Sparks Particle System
    const sparkCount = 30;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2));
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: '#F28C28', size: 0.12, transparent: true, opacity: 0.8 }));
    sparks.visible = false;
    scene.add(sparks);

    setLoading(false);
    let clock = new THREE.Clock();

    // Workpiece Hover Tooltip Setup
    let hoveredPartId = null;
    const tooltipDiv = document.createElement('div');
    tooltipDiv.style.position = 'absolute';
    tooltipDiv.style.background = 'rgba(242, 140, 40, 0.95)';
    tooltipDiv.style.border = '1px solid #FFF';
    tooltipDiv.style.borderRadius = '4px';
    tooltipDiv.style.padding = '6px 10px';
    tooltipDiv.style.color = '#000';
    tooltipDiv.style.fontSize = '10px';
    tooltipDiv.style.fontWeight = 'bold';
    tooltipDiv.style.pointerEvents = 'none';
    tooltipDiv.style.display = 'none';
    tooltipDiv.style.zIndex = '100';
    tooltipDiv.innerHTML = '<div>WORKPIECE</div><div style="font-size:8px;font-weight:normal;">Click to select</div>';
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

      const isWP = (id) => {
        if (machineId === 'lathe' && id === 'workpiece') return true;
        if (machineId === 'welding' && id === 'weld_joint') return true;
        if (machineId === 'shaper' && id === 'workpiece') return true;
        if (machineId === 'planer' && id === 'workpiece') return true;
        if (machineId === 'milling' && id === 'workpiece') return true;
        if (machineId === 'casting' && id === 'casting_cavity') return true;
        if (machineId === 'moulding' && id === 'cavity') return true;
        return false;
      };

      if (foundPartId && isWP(foundPartId)) {
        hoveredPartId = foundPartId;
        tooltipDiv.style.left = `${e.clientX - rect.left + 15}px`;
        tooltipDiv.style.top = `${e.clientY - rect.top + 15}px`;
        tooltipDiv.style.display = 'block';
        
        const g = groupsRef.current[foundPartId];
        g.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.emissive?.set('#F28C28');
            child.material.emissiveIntensity = 0.5;
          }
        });
      } else {
        if (hoveredPartId) {
          const g = groupsRef.current[hoveredPartId];
          if (g && hoveredPartId !== selectedPartId) {
            g.traverse((child) => {
              if (child.isMesh && child.material) {
                child.material.emissive?.setHex(child.userData.originalEmissive || 0);
                child.material.emissiveIntensity = 0;
              }
            });
          }
          hoveredPartId = null;
        }
        tooltipDiv.style.display = 'none';
      }
    };

    const canvasEl = rendererRef.current.domElement;
    canvasEl.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      const currentToolPos = toolPositionRef.current || { x: 0, y: 0, z: 0 };
      const op = activeOperationRef.current;
      const progress = (operationProgressRef.current || 0) / 100;
      const opState = operationStateRef.current;

      // Exploded View Interpolation
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

      // Cutaway View Transparency
      Object.keys(groupsRef.current).forEach((key) => {
        const g = groupsRef.current[key];
        g.traverse((child) => {
          if (child.isMesh && child.material) {
            const isCasing = ['bed', 'column', 'cope', 'drag', 'housing', 'headstock', 'flask', 'sand', 'cope_flask', 'drag_flask'].includes(key);
            if (isCasing) {
              child.material.transparent = isCutaway;
              child.material.opacity = isCutaway ? 0.18 : 1.0;
            }
          }
        });
      });

      // Emissive and breathing highlights
      Object.keys(groupsRef.current).forEach((key) => {
        const g = groupsRef.current[key];
        const isFocused = focusedPartId === key;
        const isSelected = selectedPartId === key;
        
        g.traverse((child) => {
          if (child.isMesh && child.material) {
            if (!child.userData.originalEmissive) {
              child.userData.originalEmissive = child.material.emissive?.getHex() || 0;
            }
            if (isSelected) {
              child.material.emissive?.set('#F28C28');
              child.material.emissiveIntensity = 0.28;
            } else if (isFocused) {
              child.material.emissive?.set('#E4572E');
              child.material.emissiveIntensity = 0.2;
            } else {
              child.material.emissive?.setHex(child.userData.originalEmissive);
              child.material.emissiveIntensity = 0;
            }
          }
        });

        if (isFocused) {
          const sc = 1.0 + 0.02 * Math.sin(elapsed * 8);
          g.scale.set(sc, sc, sc);
        } else {
          g.scale.set(1, 1, 1);
        }
      });

      // Bounding Helpers update
      if (selectedPartId && groupsRef.current[selectedPartId] && selectedHelperRef.current) {
        selectedHelperRef.current.setFromObject(groupsRef.current[selectedPartId]);
        selectedHelperRef.current.visible = true;
      } else if (selectedHelperRef.current) {
        selectedHelperRef.current.visible = false;
      }

      if (focusedPartId && groupsRef.current[focusedPartId] && focusedPartId !== selectedPartId && focusedHelperRef.current) {
        focusedHelperRef.current.setFromObject(groupsRef.current[focusedPartId]);
        focusedHelperRef.current.visible = true;
      } else if (focusedHelperRef.current) {
        focusedHelperRef.current.visible = false;
      }

      // Kinematics operation loops
      const runningOrCompleted = (opState === 'RUNNING' || opState === 'COMPLETED');
      const activeRunning = isPlayingRef.current || opState === 'RUNNING';

      if (machineId === 'lathe') {
        const chuck = groupsRef.current['chuck'];
        const spindle = groupsRef.current['spindle'];
        const workpiece = groupsRef.current['workpiece'];
        const carriage = groupsRef.current['carriage'];
        const tool = groupsRef.current['tool_post'];

        if (activeRunning) {
          if (chuck) chuck.rotation.x += 0.15;
          if (spindle) spindle.rotation.x += 0.15;
          if (workpiece) workpiece.rotation.x += 0.15;
        }

        // Jog tool position
        if (carriage) {
          carriage.position.x = THREE.MathUtils.lerp(carriage.position.x, currentToolPos.x, 0.15);
          if (tool) {
            tool.position.x = carriage.position.x + 0.2;
            tool.position.z = THREE.MathUtils.lerp(tool.position.z, currentToolPos.z + 1.6, 0.15);
          }
        }

        // Dynamic workpiece transformations
        if (workpiece) {
          const mainC = workpiece.getObjectByName('main_cylinder');
          const taperC = workpiece.getObjectByName('taper_cylinder');
          const contourC = workpiece.getObjectByName('contour_cylinder');
          const boreHole = workpiece.getObjectByName('bore_hole');
          const partedPiece = workpiece.getObjectByName('parted_piece');
          const helixLine = workpiece.getObjectByName('helix_line');

          if (mainC) mainC.visible = true;
          if (taperC) taperC.visible = false;
          if (contourC) contourC.visible = false;
          if (boreHole) boreHole.visible = false;
          if (partedPiece) partedPiece.visible = false;
          if (helixLine) helixLine.visible = false;

          if (mainC) {
            mainC.scale.set(1, 1, 1);
            mainC.position.set(0, 0, 0);
          }

          if (runningOrCompleted) {
            if (op === 'facing') {
              if (mainC) mainC.scale.set(1.0 - progress * 0.15, 1, 1);
            } else if (op === 'taper_turning') {
              if (mainC) mainC.visible = false;
              if (taperC) taperC.visible = true;
            } else if (op === 'contour_turning') {
              if (mainC) mainC.visible = false;
              if (contourC) contourC.visible = true;
            } else if (op === 'boring' || op === 'drilling') {
              if (boreHole) {
                boreHole.visible = true;
                boreHole.scale.set(progress * 1.5, 1, 1);
              }
            } else if (op === 'parting_off') {
              if (mainC) mainC.scale.set(1.0 - progress * 0.35, 1, 1);
              if (partedPiece) {
                partedPiece.visible = true;
                if (progress >= 1.0) {
                  partedPiece.position.y = -2.0;
                  partedPiece.rotation.z = Math.PI / 3;
                }
              }
            } else if (op === 'threading') {
              if (helixLine) {
                helixLine.visible = true;
                helixLine.scale.set(progress, 1, 1);
              }
            } else if (op === 'knurling') {
              if (mainC) {
                mainC.material.roughness = 0.8;
                mainC.material.color.set('#A55A1A');
              }
            } else if (op === 'chamfering') {
              if (mainC) mainC.scale.set(1, 0.95, 0.95);
            }

            // Spark effects
            if (opState === 'RUNNING') {
              sparks.visible = true;
              sparks.position.set(tool ? tool.position.x : 0, 0.5, 0.6);
            } else {
              sparks.visible = false;
            }
          }
        }

      } else if (machineId === 'welding') {
        const torch = groupsRef.current['electrode_holder'];
        if (torch) {
          torch.position.x = THREE.MathUtils.lerp(torch.position.x, currentToolPos.x, 0.15);
          torch.position.z = THREE.MathUtils.lerp(torch.position.z, currentToolPos.z, 0.15);
        }

        const weldJoint = groupsRef.current['weld_joint'];
        if (weldJoint) {
          const bead = weldJoint.getObjectByName('weld_bead');
          if (bead) {
            if (runningOrCompleted) {
              bead.visible = true;
              bead.scale.set(progress, 1, 1);
              bead.position.set(-0.39 + progress * 0.39, 0, 0);
            } else {
              bead.visible = false;
            }
          }
        }

        if (opState === 'RUNNING') {
          sparks.visible = true;
          sparks.position.set(torch ? torch.position.x : 0, 0.9, torch ? torch.position.z : 0);
          orangeSpotLight.intensity = 5.0 + Math.sin(elapsed * 50) * 3.0;
          orangeSpotLight.color.set('#D0F0FF');
        } else {
          sparks.visible = false;
        }

      } else if (machineId === 'shaper') {
        const toolHead = groupsRef.current['tool_head'];
        const clapper = groupsRef.current['clapper_box'];
        const cuttingTool = groupsRef.current['cutting_tool'];
        const workpiece = groupsRef.current['workpiece'];

        if (activeRunning) {
          const strokeTime = (elapsed * 2.0) % (Math.PI * 2);
          let strokeRate = 0;
          if (strokeTime < Math.PI * 1.4) {
            strokeRate = -1.0 + (strokeTime / (Math.PI * 1.4)) * 2.0;
          } else {
            const retT = (strokeTime - Math.PI * 1.4) / (Math.PI * 0.6);
            strokeRate = 1.0 - retT * 2.0;
          }
          if (toolHead) toolHead.position.z = strokeRate * 0.8;
          if (clapper) {
            clapper.position.z = (toolHead ? toolHead.position.z : 0) + 0.1;
            clapper.rotation.x = strokeRate < 0 ? -0.22 : 0;
          }
          if (cuttingTool) cuttingTool.position.z = (toolHead ? toolHead.position.z : 0) + 0.2;
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
              if (block) block.scale.set(1, 1.0 - progress * 0.25, 1);
            } else if (op === 'step_shaping') {
              if (block) block.scale.set(1, 1, 1.0 - progress * 0.2);
            } else if (op === 'slot_cutting' || op === 'keyway_cutting' || op === 'groove_cutting') {
              if (slot) {
                slot.visible = true;
                slot.scale.set(1, 1, progress);
              }
            }
          }
        }

      } else if (machineId === 'planer') {
        const table = groupsRef.current['table'];
        const workpiece = groupsRef.current['workpiece'];
        const tHead = groupsRef.current['tool_head'];
        const pTool = groupsRef.current['cutting_tool'];

        if (activeRunning) {
          if (table) table.position.z = Math.sin(elapsed * 1.2) * 1.4;
          if (tHead) tHead.position.x = Math.sin(elapsed * 0.15) * 0.6;
          if (pTool) pTool.position.x = tHead.position.x;
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
              if (block) block.scale.set(1, 1.0 - progress * 0.25, 1);
            } else if (op === 'step_planing') {
              if (block) block.scale.set(1.0 - progress * 0.2, 1, 1);
            } else if (op === 'slot_planing' || op === 'groove_planing' || op === 'keyway_slot_work') {
              if (slot) {
                slot.visible = true;
                slot.scale.set(1, 1, progress);
              }
            }
          }
        }

      } else if (machineId === 'milling') {
        const cutter = groupsRef.current['cutter'];
        const spindle = groupsRef.current['spindle'];
        const table = groupsRef.current['table'];
        const vice = groupsRef.current['vice'];
        const workpiece = groupsRef.current['workpiece'];

        if (activeRunning) {
          if (cutter) cutter.rotation.y += 0.3;
          if (spindle) spindle.rotation.y += 0.3;
        }

        if (table) {
          table.position.x = THREE.MathUtils.lerp(table.position.x, currentToolPos.x, 0.15);
          table.position.y = THREE.MathUtils.lerp(table.position.y, currentToolPos.y - 0.4, 0.15);
          if (vice) {
            vice.position.x = table.position.x;
            vice.position.y = table.position.y + 0.3;
          }
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
              if (block) block.scale.set(1, 1.0 - progress * 0.3, 1);
            } else if (op === 'slot_milling' || op === 'keyway_milling' || op === 't_slot_cutting') {
              if (slot) {
                slot.visible = true;
                slot.scale.set(1, 1, progress);
              }
            } else if (op === 'pocket_milling') {
              if (block) block.scale.set(1.0 - progress * 0.2, 1.0 - progress * 0.2, 1);
            }
          }
        }

      } else if (machineId === 'casting') {
        const ladle = groupsRef.current['ladle'];
        const cavity = groupsRef.current['casting_cavity'];
        const cope = groupsRef.current['cope_flask'];
        const drag = groupsRef.current['drag_flask'];

        if (activeRunning) {
          if (ladle) {
            ladle.rotation.z = THREE.MathUtils.lerp(ladle.rotation.z, -0.6, 0.05);
            ladle.position.set(-0.6, 0.4, 0);
          }
        }

        if (cavity) {
          cavity.traverse((c) => {
            if (c.isMesh) {
              if (runningOrCompleted) {
                if (op === 'pouring' || op === 'filling' || op === 'solidification') {
                  c.material = mats.moltenMetal;
                  c.material.emissiveIntensity = 1.5;
                } else if (op === 'cooling') {
                  c.material = mats.moltenMetalCool;
                }
              } else {
                c.material = mats.moltenMetalCool;
              }
            }
          });
        }

        // casting removal stage explodes flasks
        if (op === 'casting_removal' && runningOrCompleted) {
          if (cope) cope.visible = false;
          if (drag) drag.visible = false;
        } else {
          if (cope) cope.visible = true;
          if (drag) drag.visible = true;
        }

      } else if (machineId === 'moulding') {
        const sand = groupsRef.current['sand'];
        const pattern = groupsRef.current['pattern'];
        
        if (op === 'sand_compaction' && runningOrCompleted) {
          if (sand) sand.scale.y = 0.82;
        } else {
          if (sand) sand.scale.y = 1.0;
        }

        if (op === 'pattern_removal' && runningOrCompleted) {
          if (pattern) pattern.position.y = 1.8;
        } else {
          if (pattern) pattern.position.y = -0.2;
        }
      }

      // Projects labels onto viewport
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
      if (tooltipDiv && tooltipDiv.parentNode) {
        tooltipDiv.parentNode.removeChild(tooltipDiv);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [machineId, isExploded, isCutaway, showLabels]);

  // Handle camera keys (WASD, Arrows, zoom)
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#101820', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-orange)', fontFamily: 'var(--mono-font)', letterSpacing: '1px' }}>
            CONNECTING 3D INDUSTRIAL ENGINE...
          </div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%', cursor: 'crosshair' }} 
      />

      {showLabels && (labelsData[machineId] || []).map((lbl) => (
        <div
          key={lbl.id}
          id={`label-${lbl.id}`}
          style={{
            position: 'absolute',
            background: 'rgba(16, 24, 32, 0.92)',
            border: '1px solid var(--accent-orange)',
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
            boxShadow: '0 0 5px rgba(242, 140, 40, 0.25)',
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
              stroke="#F28C28"
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
          padding: '6px 16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 25,
          backdropFilter: 'blur(4px)',
          fontSize: '9px',
          fontFamily: 'var(--mono-font)',
          color: 'var(--text-secondary)'
        }}>
          <span><strong style={{ color: 'var(--accent-orange)' }}>W A S D</strong> MOVE</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: 'var(--accent-orange)' }}>↑ ↓ ← →</strong> ROTATE</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: 'var(--accent-orange)' }}>+ -</strong> ZOOM</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: 'var(--accent-orange)' }}>R</strong> RESET</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: 'var(--accent-orange)' }}>T</strong> TOP</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><strong style={{ color: 'var(--accent-orange)' }}>F</strong> FRONT</span>
        </div>
      )}
    </div>
  );
}
