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
    scene.background = new THREE.Color('#F0EDE5'); // Clean Mechanical Lab Light Sand Dune Background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 11, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 6;
    controls.maxDistance = 25;
    controls.target.set(0, 0, 0);

    // Warm cinematic lighting
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 0.75); // Neutral Fill Light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#FFFFFF', 1.5); // Overhead light
    dirLight.position.set(5, 15, 5);
    scene.add(dirLight);

    // Industrial floor grids (Safety Cyprus Light and Sand Dune Dark)
    const gridHelper = new THREE.GridHelper(24, 24, '#0A625D', '#D8D2C5');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const borderGeo = new THREE.BoxGeometry(24.2, 0.05, 24.2);
    const borderMat = new THREE.MeshBasicMaterial({ color: '#D8D2C5', wireframe: true });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = -0.5;
    scene.add(border);

    // Materials
    const benchMat = new THREE.MeshStandardMaterial({ color: '#003532', roughness: 0.6 }); // Cyprus Dark benches
    const machineMats = {
      lathe: new THREE.MeshStandardMaterial({ color: '#004643', metalness: 0.8, roughness: 0.2 }),
      welding: new THREE.MeshStandardMaterial({ color: '#0A625D', metalness: 0.7, roughness: 0.3 }),
      milling: new THREE.MeshStandardMaterial({ color: '#D9E8E5', metalness: 0.8, roughness: 0.2 }),
      shaper: new THREE.MeshStandardMaterial({ color: '#0A625D', metalness: 0.8, roughness: 0.2 }),
      planer: new THREE.MeshStandardMaterial({ color: '#003532', metalness: 0.8, roughness: 0.2 }),
      casting: new THREE.MeshStandardMaterial({ color: '#D8D2C5', metalness: 0.7, roughness: 0.4 }),
      moulding: new THREE.MeshStandardMaterial({ color: '#003532', metalness: 0.7, roughness: 0.4 })    // Cyprus Dark moulding
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

      // Safety border lines in Cyprus Light
      const stripGeo = new THREE.BoxGeometry(2.5, 0.05, 1.9);
      const stripMat = new THREE.MeshBasicMaterial({ color: '#0A625D', wireframe: true });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.y = 0.31;
      group.add(strip);

      let modelMesh;
      if (term.id === 'lathe') {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.6), machineMats.lathe);
        body.position.y = 0.6;
        const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8), machineMats.lathe);
        spindle.rotateZ(Math.PI / 2);
        spindle.position.set(-0.6, 0.9, 0);
        group.add(body);
        group.add(spindle);
      } else if (term.id === 'welding') {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), machineMats.welding);
        box.position.y = 0.7;
        const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5), machineMats.welding);
        torch.position.set(0.3, 0.8, 0.2);
        group.add(box);
        group.add(torch);
      } else if (term.id === 'milling') {
        const baseBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 1.0), machineMats.milling);
        baseBox.position.y = 0.9;
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), machineMats.milling);
        head.position.set(0, 1.6, 0);
        group.add(baseBox);
        group.add(head);
      } else if (term.id === 'shaper') {
        const baseBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.4), machineMats.shaper);
        baseBox.position.y = 0.8;
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 1.2), machineMats.shaper);
        slide.position.set(0, 1.4, -0.2);
        group.add(baseBox);
        group.add(slide);
      } else if (term.id === 'planer') {
        const tableBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2.6), machineMats.planer);
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

      // Warm spotlights
      const spot = new THREE.SpotLight('#D0F0FF', 2.0, 8, Math.PI / 6, 0.5, 1);
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
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-primary)' }}>
          3D Virtual Workshop Floor Plan
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Drag to rotate the floor layout. Hover over terminal stands to load telemetry profiles. Click to enter.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', minHeight: '480px' }}>
        
        {/* WebGL 3D Canvas mount frame */}
        <div 
          className="glass-panel"
          style={{
            position: 'relative',
            background: 'var(--bg-secondary)',
            padding: 0,
            overflow: 'hidden',
            border: hoveredId ? `1px solid var(--primary-blue)` : '1px solid var(--border)',
            boxShadow: hoveredId ? `0 4px 20px rgba(29, 73, 180, 0.15)` : 'none',
            height: '450px'
          }}
        >
          <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
        </div>

        {/* Dynamic Telemetry Deck */}
        <div 
          className="glass-panel"
          style={{
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: hoveredId ? `1px solid var(--primary-blue)` : '1px solid var(--border)',
            boxShadow: hoveredId ? `0 4px 20px rgba(29, 73, 180, 0.15)` : 'none'
          }}
        >
          {hoveredId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--mono-font)' }}>
                  Active Terminal
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-blue)', marginTop: '4px' }}>
                  {MACHINES[hoveredId].name}
                </h3>
                <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  "{MACHINES[hoveredId].tagline}"
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  <div className="telemetry-label">Kinematics Feed</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', fontWeight: '600' }}>
                    {MACHINES[hoveredId].workpieceMovement}
                  </div>
                </div>
                <div>
                  <div className="telemetry-label">Tolerance Target</div>
                  <div style={{ fontSize: '13px', color: 'var(--primary-blue)', marginTop: '2px', fontFamily: 'var(--mono-font)', fontWeight: '700' }}>
                    {MACHINES[hoveredId].accuracyClass}
                  </div>
                </div>
                <div>
                  <div className="telemetry-label">Primary Output shape</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {MACHINES[hoveredId].output}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleEnterBay(hoveredId)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Configure Simulator →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: '16px' }}>
              <Compass size={40} className="animate-spin-slow" style={{ color: 'var(--primary-blue)', opacity: 0.5 }} />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Terminal Radar Grid</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px', margin: '4px auto 0', lineHeight: '1.4' }}>
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
