# Virtual Mechanical Workshop – Realistic 3D Upgrade

This version upgrades the interactive Three.js workshop, with special attention to the supplied 1M63-style centre-lathe reference.

## Lathe realism
The lathe scene now includes:
- long cast bed with guide rails and ribs
- light-blue/grey machine paint and light headstock/tailstock covers
- detailed headstock selector panel and gauges
- external motor / pulley / belt assembly
- three-jaw chuck with individual jaws
- saddle, apron controls, cross-slide, compound rest and tool post
- tailstock quill and handwheel
- lead screw, feed rod and chip tray
- rear splash guard
- steady rest
- hazard-strip details

## Student usability
The existing training flow remains active:
- click parts in the 3D scene
- select machining operations
- set speed/feed/depth parameters
- perform step-by-step simulated operations
- receive safety / assessment feedback
- use orbit, zoom, labels, exploded and cutaway views

## Important
The model is a reference-faithful procedural 3D reconstruction based on the supplied image. A mathematically exact manufacturer CAD replica would require the original CAD/engineering drawings or a dimensioned 3D model.

Run:

```powershell
npm install
npm run dev
```
