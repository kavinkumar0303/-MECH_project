import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Play, Compass } from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function WorkshopMap({ setActiveTab, setSelectedMachineId }) {
  const mountRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const hoveredIdRef = useRef(null);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  const handleEnterBay = (machineId) => {
    setSelectedMachineId(machineId);
    setActiveTab('machine_explorer');
  };

  useEffect(() => {
    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F0F9FF');

    const isSmall = window.innerWidth <= 768;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, isSmall ? 14 : 11, isSmall ? 18 : 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.touchAction = 'none';
    
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.target.set(0, 0, 0);

    // Neutral Workshop Mechanical lighting with subtle warm fill
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#FFFFFF', 2.0);
    dirLight.position.set(5, 15, 5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#E2E8F0', 1.0);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Industrial floor grids (Warm Peach & Orange Accents)
    const gridHelper = new THREE.GridHelper(24, 24, '#0077B6', '#BAE6FD');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const borderGeo = new THREE.BoxGeometry(24.2, 0.05, 24.2);
    const borderMat = new THREE.MeshBasicMaterial({ color: '#0096C7', wireframe: true });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = -0.5;
    scene.add(border);

    // Realistic CAD/Engineering Materials for machine preview stands
    const benchMat = new THREE.MeshStandardMaterial({ color: '#F0F9FF', roughness: 0.6, metalness: 0.05 });
    const machineMats = {
      lathe: new THREE.MeshStandardMaterial({ color: '#4A5D6E', metalness: 0.6, roughness: 0.35 }),
      welding: new THREE.MeshStandardMaterial({ color: '#2C343D', metalness: 0.7, roughness: 0.3 }),
      milling: new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.65, roughness: 0.35 }),
      shaper: new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6, roughness: 0.4 }),
      planer: new THREE.MeshStandardMaterial({ color: '#3F4E5A', metalness: 0.65, roughness: 0.35 }),
      casting: new THREE.MeshStandardMaterial({ color: '#566270', metalness: 0.5, roughness: 0.5 }),
      moulding: new THREE.MeshStandardMaterial({ color: '#C2A684', metalness: 0.1, roughness: 0.9 })
    };

    // Terminal layout positioning
    const terminals = [
      { id: 'lathe', pos: [-6, 0, -4] },
      { id: 'milling', pos: [0, 0, -4] },
      { id: 'shaper', pos: [6, 0, -4] },
      { id: 'welding', pos: [-6, 0, 2] },
      { id: 'casting', pos: [0, 0, 2] },
      { id: 'moulding', pos: [6, 0, 2] },
      { id: 'planer', pos: [0, 0, 7.5] }
    ];

    const terminalGroups = {};

    terminals.forEach((term) => {
      const group = new THREE.Group();
      group.name = term.id;
      group.position.set(term.pos[0], term.pos[1], term.pos[2]);
      scene.add(group);
      terminalGroups[term.id] = group;

      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.8), benchMat);
      bench.position.y = -0.1;
      group.add(bench);

      // Safety border lines in Warm Orange
      const stripGeo = new THREE.BoxGeometry(2.5, 0.05, 1.9);
      const stripMat = new THREE.MeshBasicMaterial({ color: '#0077B6', wireframe: true });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.y = 0.31;
      group.add(strip);

      if (term.id === 'lathe') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.6), machineMats.lathe);
        body.position.y = 0.6;
        const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: '#C8CFD8', metalness: 0.8, roughness: 0.2 }));
        spindle.rotateZ(Math.PI / 2);
        spindle.position.set(-0.6, 0.9, 0);
        group.add(body);
        group.add(spindle);
      } else if (term.id === 'welding') {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), machineMats.welding);
        box.position.y = 0.7;
        const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5), new THREE.MeshStandardMaterial({ color: '#C8CFD8', metalness: 0.8, roughness: 0.2 }));
        torch.position.set(0.3, 0.8, 0.2);
        group.add(box);
        group.add(torch);
      } else if (term.id === 'milling') {
        const baseBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 1.0), machineMats.milling);
        baseBox.position.y = 0.9;
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), new THREE.MeshStandardMaterial({ color: '#C8CFD8', metalness: 0.8, roughness: 0.2 }));
        head.position.set(0, 1.6, 0);
        group.add(baseBox);
        group.add(head);
      } else if (term.id === 'shaper') {
        const baseBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.4), machineMats.shaper);
        baseBox.position.y = 0.8;
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: '#C8CFD8', metalness: 0.8, roughness: 0.2 }));
        slide.position.set(0, 1.4, -0.2);
        group.add(baseBox);
        group.add(slide);
      } else if (term.id === 'planer') {
        const tableBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2.6), new THREE.MeshStandardMaterial({ color: '#C8CFD8', metalness: 0.8, roughness: 0.2 }));
        tableBox.position.y = 0.5;
        const columns = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 0.6), machineMats.planer);
        columns.position.set(0, 1.3, 0);
        group.add(tableBox);
        group.add(columns);
      } else if (term.id === 'casting') {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 0.8), machineMats.casting);
        bowl.position.y = 0.7;
        group.add(bowl);
      } else if (term.id === 'moulding') {
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8), machineMats.moulding);
        pipe.rotateZ(Math.PI / 2);
        pipe.position.y = 0.8;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8), machineMats.moulding);
        cone.position.set(-0.6, 1.5, 0);
        group.add(pipe);
        group.add(cone);
      }

      // Clear neutral spotlights
      const spot = new THREE.SpotLight('#FFFFFF', 1.5, 8, Math.PI / 6, 0.5, 1);
      spot.position.set(term.pos[0], 5, term.pos[2]);
      spot.target = group;
      scene.add(spot);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent.name !== 'scene') {
          obj = obj.parent;
        }
        if (terminals.some(t => t.id === obj.name)) {
          if (hoveredIdRef.current !== obj.name) {
            setHoveredId(obj.name);
          }
          return;
        }
      }
      setHoveredId(null);
    };

    const handleClick = (e) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent.name !== 'scene') {
          obj = obj.parent;
        }
        if (terminals.some(t => t.id === obj.name)) {
          handleEnterBay(obj.name);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controls) controls.update();
      
      terminals.forEach((term) => {
        const group = terminalGroups[term.id];
        if (group) {
          const isHovered = hoveredIdRef.current === term.id;
          const targetY = isHovered ? 0.35 : 0.0;
          group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.1);
          
          const modelParts = group.children.filter(c => c !== group.children[0] && c !== group.children[1]);
          modelParts.forEach(part => {
            part.rotation.y += isHovered ? 0.035 : 0.005;
          });
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 360;
      const h = mountRef.current.clientHeight || 360;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && mountRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div className="workshop-map-container">
      
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#1C1917', margin: 0 }}>
          3D Virtual Workshop Floor Plan
        </h2>
        <p style={{ color: '#574A40', fontSize: '14px', marginTop: '4px' }}>
          Drag to rotate the floor layout. Hover over terminal stands to load telemetry profiles. Click to enter.
        </p>
      </div>

      <div className="workshop-map-grid">
        
        {/* WebGL 3D Canvas mount frame */}
        <div 
          className="workshop-map-canvas-frame glass-panel"
          style={{
            position: 'relative',
            background: '#F0F9FF',
            padding: 0,
            overflow: 'hidden',
            border: hoveredId ? `2px solid #0077B6` : '1px solid #BAE6FD',
            boxShadow: hoveredId ? `0 8px 30px rgba(0, 119, 182, 0.2)` : '0 8px 32px rgba(0, 119, 182, 0.06)',
            borderRadius: '16px'
          }}
        >
          <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
        </div>

        {/* Dynamic Telemetry Deck */}
        <div 
          className="workshop-map-telemetry glass-panel"
          style={{
            background: '#FFFFFF',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: hoveredId ? `2px solid #0077B6` : '1px solid #BAE6FD',
            boxShadow: hoveredId ? `0 8px 30px rgba(0, 119, 182, 0.16)` : '0 8px 32px rgba(0, 119, 182, 0.05)',
            borderRadius: '16px'
          }}
        >
          {hoveredId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              <div>
                <span className="space-badge-pink" style={{ background: 'rgba(0, 119, 182, 0.12)', border: '1px solid #0077B6', color: '#023E8A' }}>
                  Active Terminal
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1F1F1F', marginTop: '10px' }}>
                  {MACHINES[hoveredId].name}
                </h3>
                <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#666666', marginTop: '4px' }}>
                  "{MACHINES[hoveredId].tagline}"
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid #BAE6FD', paddingTop: '16px' }}>
                <div>
                  <div className="telemetry-label" style={{ color: '#023E8A' }}>Kinematics Feed</div>
                  <div style={{ fontSize: '14px', color: '#1F1F1F', marginTop: '4px', fontWeight: '600' }}>
                    {MACHINES[hoveredId].workpieceMovement}
                  </div>
                </div>
                <div>
                  <div className="telemetry-label" style={{ color: '#023E8A' }}>Tolerance Target</div>
                  <div style={{ fontSize: '14px', color: '#023E8A', marginTop: '4px', fontFamily: 'var(--mono-font)', fontWeight: '800' }}>
                    {MACHINES[hoveredId].accuracyClass}
                  </div>
                </div>
                <div>
                  <div className="telemetry-label" style={{ color: '#023E8A' }}>Primary Output Shape</div>
                  <div style={{ fontSize: '14px', color: '#1F1F1F', marginTop: '4px' }}>
                    {MACHINES[hoveredId].output}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button
                  className="space-btn-primary"
                  onClick={() => handleEnterBay(hoveredId)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Configure Simulator →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: '16px' }}>
              <Compass size={48} className="animate-spin-slow" style={{ color: '#0077B6', filter: 'drop-shadow(0 0 10px rgba(0, 119, 182, 0.3))' }} />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1F1F1F' }}>Terminal Radar Grid</h4>
                <p style={{ fontSize: '13px', color: '#666666', maxWidth: '240px', margin: '6px auto 0', lineHeight: '1.5' }}>
                  Use mouse drag to rotate layout. Hover over terminal stands to capture machine specifications.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
