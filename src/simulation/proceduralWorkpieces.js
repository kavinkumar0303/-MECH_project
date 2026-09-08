import * as THREE from 'three';

/**
 * Procedural Workpiece and Mesh Generators for Three.js Simulation
 */

export class ProceduralWorkpieceManager {
  /**
   * Builds the comprehensive interactive Workpiece group for the Lathe
   */
  static createLatheWorkpieceGroup(materials) {
    const group = new THREE.Group();
    group.name = "workpiece_assembly";

    // 1. Standard Raw Stock Cylinder (Facing / Turning baseline)
    const rawGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.8, 32);
    rawGeo.rotateZ(Math.PI / 2);
    const rawMesh = new THREE.Mesh(rawGeo, materials.workpiece);
    rawMesh.name = "raw_stock";
    rawMesh.castShadow = true;
    rawMesh.receiveShadow = true;
    group.add(rawMesh);

    // 2. Facing Workpiece (Length trimmed, facing flat end disc)
    const facingGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.4, 32);
    facingGeo.rotateZ(Math.PI / 2);
    facingGeo.translate(-0.2, 0, 0);
    const facingMesh = new THREE.Mesh(facingGeo, materials.workpiece);
    facingMesh.name = "facing_mesh";
    facingMesh.visible = false;
    group.add(facingMesh);

    // 3. Taper Turning Conical Frustum
    const taperGeo = new THREE.CylinderGeometry(0.2, 0.4, 2.8, 32);
    taperGeo.rotateZ(Math.PI / 2);
    const taperMesh = new THREE.Mesh(taperGeo, materials.workpiece);
    taperMesh.name = "taper_mesh";
    taperMesh.visible = false;
    group.add(taperMesh);

    // 4. Contour Turning Spline (Ergonomic curved profile)
    const contourPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = (t - 0.5) * 2.8; // -1.4 to 1.4
      // Radius profile: undulating smooth curves
      const r = 0.32 + 0.08 * Math.sin(t * Math.PI * 2) - 0.04 * Math.cos(t * Math.PI * 4);
      contourPoints.push(new THREE.Vector2(Math.max(0.18, r), x));
    }
    const contourGeo = new THREE.LatheGeometry(contourPoints, 32);
    contourGeo.rotateZ(Math.PI / 2);
    const contourMesh = new THREE.Mesh(contourGeo, materials.workpiece);
    contourMesh.name = "contour_mesh";
    contourMesh.visible = false;
    group.add(contourMesh);

    // 5. Forming Plunge Profile (Recessed circular grooves)
    const formPoints = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const x = (t - 0.5) * 2.8;
      let r = 0.4;
      if (t > 0.4 && t < 0.7) {
        // Formed spherical radius groove
        const localT = (t - 0.55) / 0.15;
        r = 0.4 - 0.15 * Math.sqrt(Math.max(0, 1 - localT * localT));
      }
      formPoints.push(new THREE.Vector2(r, x));
    }
    const formGeo = new THREE.LatheGeometry(formPoints, 32);
    formGeo.rotateZ(Math.PI / 2);
    const formMesh = new THREE.Mesh(formGeo, materials.workpiece);
    formMesh.name = "forming_mesh";
    formMesh.visible = false;
    group.add(formMesh);

    // 6. Boring Internal Hole Sleeve
    const boreHole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 2.0, 32).rotateZ(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9, metalness: 0.1 })
    );
    boreHole.name = "bore_hole_mesh";
    boreHole.position.set(0.5, 0, 0);
    boreHole.visible = false;
    group.add(boreHole);

    // 7. Chamfered Workpiece
    const chamferPoints = [
      new THREE.Vector2(0, -1.4),
      new THREE.Vector2(0.4, -1.4),
      new THREE.Vector2(0.4, 1.25),
      new THREE.Vector2(0.3, 1.4), // 45 degree chamfer cut
      new THREE.Vector2(0, 1.4)
    ];
    const chamferGeo = new THREE.LatheGeometry(chamferPoints, 32);
    chamferGeo.rotateZ(Math.PI / 2);
    const chamferMesh = new THREE.Mesh(chamferGeo, materials.workpiece);
    chamferMesh.name = "chamfer_mesh";
    chamferMesh.visible = false;
    group.add(chamferMesh);

    // 8. Parting Off (Split into chuck stock + detached piece)
    const partingRemain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 1.6, 32).rotateZ(Math.PI / 2),
      materials.workpiece
    );
    partingRemain.name = "parting_remain";
    partingRemain.position.set(-0.6, 0, 0);
    partingRemain.visible = false;
    group.add(partingRemain);

    const partedPiece = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.8, 32).rotateZ(Math.PI / 2),
      materials.workpiece
    );
    partedPiece.name = "parted_piece";
    partedPiece.position.set(0.9, 0, 0);
    partedPiece.visible = false;
    group.add(partedPiece);

    // 9. Threading 3D Helical Thread Mesh
    const helixPoints = [];
    const turns = 18;
    for (let t = 0; t <= Math.PI * 2 * turns; t += 0.1) {
      const progressT = t / (Math.PI * 2 * turns);
      const x = -1.2 + progressT * 2.4;
      const y = 0.41 * Math.sin(t);
      const z = 0.41 * Math.cos(t);
      helixPoints.push(new THREE.Vector3(x, y, z));
    }
    const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
    const helixGeo = new THREE.TubeGeometry(helixCurve, 200, 0.02, 6, false);
    const helixMat = new THREE.MeshStandardMaterial({
      color: '#0A5CFF',
      metalness: 0.9,
      roughness: 0.2
    });
    const helixMesh = new THREE.Mesh(helixGeo, helixMat);
    helixMesh.name = "helix_mesh";
    helixMesh.visible = false;
    group.add(helixMesh);

    // 10. Drilling Axial Hole
    const drillHole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.8, 24).rotateZ(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.95 })
    );
    drillHole.name = "drill_hole_mesh";
    drillHole.position.set(0.6, 0, 0);
    drillHole.visible = false;
    group.add(drillHole);

    // 11. Knurled Band Texture Overlay
    const knurlGeo = new THREE.CylinderGeometry(0.405, 0.405, 1.4, 32).rotateZ(Math.PI / 2);
    const knurlCanvas = document.createElement('canvas');
    knurlCanvas.width = 128;
    knurlCanvas.height = 128;
    const kCtx = knurlCanvas.getContext('2d');
    kCtx.fillStyle = '#CBD5E1';
    kCtx.fillRect(0, 0, 128, 128);
    kCtx.strokeStyle = '#334155';
    kCtx.lineWidth = 3;
    for (let i = -128; i < 256; i += 8) {
      kCtx.beginPath();
      kCtx.moveTo(i, 0);
      kCtx.lineTo(i + 128, 128);
      kCtx.stroke();
      kCtx.beginPath();
      kCtx.moveTo(i + 128, 0);
      kCtx.lineTo(i, 128);
      kCtx.stroke();
    }
    const knurlTexture = new THREE.CanvasTexture(knurlCanvas);
    knurlTexture.wrapS = THREE.RepeatWrapping;
    knurlTexture.wrapT = THREE.RepeatWrapping;
    knurlTexture.repeat.set(8, 4);

    const knurlMat = new THREE.MeshStandardMaterial({
      map: knurlTexture,
      bumpMap: knurlTexture,
      bumpScale: 0.05,
      roughness: 0.6,
      metalness: 0.8
    });
    const knurlMesh = new THREE.Mesh(knurlGeo, knurlMat);
    knurlMesh.name = "knurl_mesh";
    knurlMesh.visible = false;
    group.add(knurlMesh);

    return group;
  }

  /**
   * Builds Welding Plates and Dynamic 3D Weld Bead
   */
  static createWeldingAssembly(materials) {
    const group = new THREE.Group();
    group.name = "weld_assembly";

    // Left plate
    const plateL = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.08, 0.8),
      materials.secondaryMetal
    );
    plateL.position.set(-0.45, 0, 0);
    group.add(plateL);

    // Right plate
    const plateR = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.08, 0.8),
      materials.secondaryMetal
    );
    plateR.position.set(0.45, 0, 0);
    group.add(plateR);

    // Weld bead line (Dynamic 3D Tube)
    const beadCurve = new THREE.LineCurve3(
      new THREE.Vector3(0, 0.045, -0.4),
      new THREE.Vector3(0, 0.045, 0.4)
    );
    const beadGeo = new THREE.TubeGeometry(beadCurve, 32, 0.045, 12, false);
    const beadMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      metalness: 0.9,
      roughness: 0.4
    });
    const beadMesh = new THREE.Mesh(beadGeo, beadMat);
    beadMesh.name = "weld_bead_mesh";
    beadMesh.visible = false;
    group.add(beadMesh);

    // Incandescent Molten Weld Pool
    const poolGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const poolMat = new THREE.MeshStandardMaterial({
      color: '#60A5FA',
      emissive: '#0A5CFF',
      emissiveIntensity: 6.0,
      roughness: 0.1
    });
    const poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.name = "molten_pool";
    poolMesh.visible = false;
    group.add(poolMesh);

    return group;
  }
}
