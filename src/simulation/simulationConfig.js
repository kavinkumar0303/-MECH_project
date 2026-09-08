/**
 * Comprehensive Mechanical Simulation Configurations
 * Covers Centre Lathe, Arc Welding, Shaper, Planer, Milling, Metal Casting, Sand Moulding
 */

export const SIMULATION_OPERATIONS = {
  lathe: [
    {
      id: "facing",
      name: "Facing",
      description: "Machining the end face of a rotating workpiece to produce a perfectly flat surface perpendicular to the axis of rotation.",
      targetPart: "workpiece",
      requiredTool: "Facing Tool",
      workArea: "Front End Face",
      defaultParams: { speed: 750, feed: 0.12, doc: 0.8 },
      paramBounds: {
        speed: { min: 300, max: 1200, unit: "RPM", step: 50 },
        feed: { min: 0.05, max: 0.35, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.2, max: 2.0, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "The cutting tool feeds radially from the outside diameter inward across the spinning end face, removing irregularities and flattening the reference surface.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"] // NO GLOVES!
    },
    {
      id: "taper_turning",
      name: "Taper Turning",
      description: "Machining a uniform conical surface along the workpiece by feeding the tool at a specific taper angle.",
      targetPart: "workpiece",
      requiredTool: "Turning Tool",
      workArea: "External Diameter",
      defaultParams: { speed: 650, feed: 0.15, doc: 1.0, angle: 8 },
      paramBounds: {
        speed: { min: 300, max: 1100, unit: "RPM", step: 50 },
        feed: { min: 0.05, max: 0.30, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.2, max: 2.0, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "The compound slide is swiveled to the half-taper angle, feeding the tool diagonally to generate a precise conical reduction.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "contour_turning",
      name: "Contour Turning",
      description: "Machining curved, ergonomic, or complex geometric profiles along the workpiece circumference.",
      targetPart: "workpiece",
      requiredTool: "Contour Tool",
      workArea: "External Profile",
      defaultParams: { speed: 600, feed: 0.10, doc: 0.8 },
      paramBounds: {
        speed: { min: 300, max: 1000, unit: "RPM", step: 50 },
        feed: { min: 0.05, max: 0.25, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.2, max: 1.5, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "Carriage and cross-slide motions are coordinated simultaneously to trace smooth 2D curved contours into the revolving steel.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "forming",
      name: "Forming",
      description: "Plunging a pre-ground forming tool radially into the workpiece to replicate the tool's exact reverse shape.",
      targetPart: "workpiece",
      requiredTool: "Form Tool",
      workArea: "External Groove",
      defaultParams: { speed: 450, feed: 0.06, doc: 1.2 },
      paramBounds: {
        speed: { min: 200, max: 700, unit: "RPM", step: 25 },
        feed: { min: 0.02, max: 0.12, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.5, max: 2.5, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "A broad-shaped tool bit plunges directly into the rotating cylinder without longitudinal feed, instantly imprinting custom radii and recesses.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "boring",
      name: "Boring",
      description: "Enlarging and truing a pre-existing drilled internal hole with high concentricity and dimensional tolerance.",
      targetPart: "workpiece",
      requiredTool: "Boring Bar",
      workArea: "Internal Diameter",
      defaultParams: { speed: 500, feed: 0.08, doc: 0.6 },
      paramBounds: {
        speed: { min: 250, max: 850, unit: "RPM", step: 25 },
        feed: { min: 0.04, max: 0.20, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.2, max: 1.5, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "A single-point boring bar mounted on the carriage enters the inner bore, removing internal metal to achieve precise internal diameters.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "chamfering",
      name: "Chamfering",
      description: "Beveling sharp 90-degree outer edges at a 45-degree angle to eliminate burrs and ease assembly.",
      targetPart: "workpiece",
      requiredTool: "Chamfer Tool",
      workArea: "Outer Front Edge",
      defaultParams: { speed: 700, feed: 0.10, doc: 0.8 },
      paramBounds: {
        speed: { min: 300, max: 1000, unit: "RPM", step: 50 },
        feed: { min: 0.05, max: 0.20, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.2, max: 1.5, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "A 45-degree cutting edge contacts the perimeter corner, beveling off hazardous sharp edges.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "parting_off",
      name: "Parting Off",
      description: "Deep radial plunge cut using a narrow parting blade to sever the finished component from the bar stock.",
      targetPart: "workpiece",
      requiredTool: "Parting Tool",
      workArea: "Radial Cut-off Point",
      defaultParams: { speed: 400, feed: 0.05, doc: 2.0 },
      paramBounds: {
        speed: { min: 200, max: 600, unit: "RPM", step: 25 },
        feed: { min: 0.02, max: 0.10, unit: "mm/rev", step: 0.01 },
        doc: { min: 1.0, max: 3.0, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "A thin blade tool plunges straight to the center of rotation until the completed part separates cleanly and drops into the collection bin.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "threading",
      name: "Threading",
      description: "Cutting accurate continuous helical screw threads along the workpiece exterior using lead-screw synchronization.",
      targetPart: "workpiece",
      requiredTool: "Threading Tool",
      workArea: "External Cylinder",
      defaultParams: { speed: 300, feed: 1.5, doc: 0.35, pitch: 1.75 },
      paramBounds: {
        speed: { min: 150, max: 450, unit: "RPM", step: 25 },
        feed: { min: 0.5, max: 3.0, unit: "mm/pitch", step: 0.25 },
        doc: { min: 0.1, max: 0.8, unit: "mm", step: 0.05 }
      },
      educationalExplanation: "The carriage is mechanically locked to the rotating lead screw via half-nuts, creating precise helical thread pitch grooves with each pass.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "drilling",
      name: "Drilling",
      description: "Producing a round cylindrical hole along the central rotational axis using a twist drill bit mounted in the tailstock.",
      targetPart: "workpiece",
      requiredTool: "Twist Drill Bit",
      workArea: "Center Hole",
      defaultParams: { speed: 600, feed: 0.12, doc: 1.5 },
      paramBounds: {
        speed: { min: 250, max: 1000, unit: "RPM", step: 50 },
        feed: { min: 0.05, max: 0.25, unit: "mm/rev", step: 0.01 },
        doc: { min: 0.5, max: 3.0, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "The workpiece rotates while the tailstock handwheel manually feeds the non-rotating drill bit axially into the center.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "knurling",
      name: "Knurling",
      description: "Embossing a diamond or straight cross-hatch textured gripping surface by cold metal plastic deformation.",
      targetPart: "workpiece",
      requiredTool: "Knurling Tool",
      workArea: "External Grip Surface",
      defaultParams: { speed: 250, feed: 0.25, doc: 0.5 },
      paramBounds: {
        speed: { min: 120, max: 400, unit: "RPM", step: 20 },
        feed: { min: 0.10, max: 0.50, unit: "mm/rev", step: 0.05 },
        doc: { min: 0.2, max: 1.0, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "Hardened steel serrated rollers are pressed with heavy force into the rotating stock, displacing metal into a raised diamond grip pattern.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    }
  ],

  welding: [
    {
      id: "butt_joint",
      name: "Butt Joint",
      description: "Joining two aligned flat steel plates end-to-end along their parallel seam with complete joint penetration.",
      targetPart: "weld_joint",
      requiredTool: "SMAW Electrode",
      workArea: "Seam Interface",
      defaultParams: { speed: 110, feed: 3.0, doc: 14 },
      paramBounds: {
        speed: { min: 60, max: 160, unit: "Amps", step: 5 },
        feed: { min: 1.5, max: 5.0, unit: "mm Gap", step: 0.5 },
        doc: { min: 6, max: 24, unit: "mm/s Speed", step: 1 }
      },
      educationalExplanation: "The electrical arc generates 3000°C concentrated heat, melting plate edges while depositing molten core filler wire into the seam.",
      spindleRequired: false,
      safePpe: ["shield", "gloves", "clothing", "shoes"]
    },
    {
      id: "lap_joint",
      name: "Lap Joint",
      description: "Fusing two overlapping metal plates along their stepped overlapping border seam.",
      targetPart: "weld_joint",
      requiredTool: "SMAW Electrode",
      workArea: "Overlap Edge",
      defaultParams: { speed: 115, feed: 2.8, doc: 12 },
      paramBounds: {
        speed: { min: 70, max: 170, unit: "Amps", step: 5 },
        feed: { min: 1.5, max: 5.0, unit: "mm Gap", step: 0.5 },
        doc: { min: 6, max: 24, unit: "mm/s Speed", step: 1 }
      },
      educationalExplanation: "Electrode angle directs heat equally into both the bottom surface and top plate corner edge to ensure balanced fusion.",
      spindleRequired: false,
      safePpe: ["shield", "gloves", "clothing", "shoes"]
    },
    {
      id: "t_joint",
      name: "T-Joint",
      description: "Depositing a structural fillet weld at the 90-degree intersection of two perpendicular plates.",
      targetPart: "weld_joint",
      requiredTool: "SMAW Electrode",
      workArea: "Perpendicular Base Corner",
      defaultParams: { speed: 125, feed: 3.0, doc: 10 },
      paramBounds: {
        speed: { min: 80, max: 180, unit: "Amps", step: 5 },
        feed: { min: 1.5, max: 5.0, unit: "mm Gap", step: 0.5 },
        doc: { min: 5, max: 20, unit: "mm/s Speed", step: 1 }
      },
      educationalExplanation: "The torch is held at 45 degrees, depositing an equilateral triangular bead that secures the vertical plate against bending forces.",
      spindleRequired: false,
      safePpe: ["shield", "gloves", "clothing", "shoes"]
    },
    {
      id: "groove_weld",
      name: "V-Groove Weld",
      description: "Filling a single-V beveled channel on thick plates to achieve 100% full-thickness joint penetration.",
      targetPart: "weld_joint",
      requiredTool: "SMAW Electrode",
      workArea: "V-Channel",
      defaultParams: { speed: 130, feed: 2.5, doc: 12 },
      paramBounds: {
        speed: { min: 80, max: 180, unit: "Amps", step: 5 },
        feed: { min: 1.5, max: 4.5, unit: "mm Gap", step: 0.5 },
        doc: { min: 6, max: 20, unit: "mm/s Speed", step: 1 }
      },
      educationalExplanation: "Beveled plate edges permit the arc to penetrate right to the bottom root gap before filling the upper V groove with weld metal.",
      spindleRequired: false,
      safePpe: ["shield", "gloves", "clothing", "shoes"]
    }
  ],

  shaper: [
    {
      id: "plain_shaping",
      name: "Plain Shaping",
      description: "Shaving flat horizontal surface layers using linear reciprocating ram cutting strokes.",
      targetPart: "workpiece",
      requiredTool: "Shaper Tool Bit",
      workArea: "Top Surface",
      defaultParams: { speed: 45, feed: 0.3, doc: 0.8 },
      paramBounds: {
        speed: { min: 15, max: 80, unit: "SPM", step: 5 },
        feed: { min: 0.1, max: 0.8, unit: "mm/stroke", step: 0.05 },
        doc: { min: 0.2, max: 2.0, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "The ram pushes the tool forward during the slow cutting stroke. On the fast return stroke, the clapper box tilts up so the tool does not drag.",
      spindleRequired: false,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "step_shaping",
      name: "Step Shaping",
      description: "Machining perpendicular right-angled steps by combining horizontal and vertical tool downfeeds.",
      targetPart: "workpiece",
      requiredTool: "Shaper Tool Bit",
      workArea: "Step Shoulder",
      defaultParams: { speed: 40, feed: 0.25, doc: 1.0 },
      paramBounds: {
        speed: { min: 15, max: 70, unit: "SPM", step: 5 },
        feed: { min: 0.1, max: 0.6, unit: "mm/stroke", step: 0.05 },
        doc: { min: 0.2, max: 2.0, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "Sequential horizontal surface cuts and vertical wall cuts create precise 90-degree step geometries on blocks.",
      spindleRequired: false,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "slot_cutting",
      name: "Slot Cutting",
      description: "Carving a narrow straight slot or keyway channel along the workpiece length.",
      targetPart: "workpiece",
      requiredTool: "Slotting Tool Bit",
      workArea: "Center Slot",
      defaultParams: { speed: 35, feed: 0.15, doc: 0.5 },
      paramBounds: {
        speed: { min: 15, max: 60, unit: "SPM", step: 5 },
        feed: { min: 0.05, max: 0.4, unit: "mm/stroke", step: 0.05 },
        doc: { min: 0.2, max: 1.5, unit: "mm", step: 0.1 }
      },
      educationalExplanation: "A narrow grooving tool is fed down incrementally per stroke, slicing out an exact slot channel.",
      spindleRequired: false,
      safePpe: ["goggles", "clothing", "shoes"]
    }
  ],

  planer: [
    {
      id: "plain_planing",
      name: "Plain Planing",
      description: "Machining wide horizontal planar faces on heavy casting plates via table reciprocation.",
      targetPart: "workpiece",
      requiredTool: "Planing Tool Bit",
      workArea: "Top Face",
      defaultParams: { speed: 25, feed: 0.6, doc: 1.5 },
      paramBounds: {
        speed: { min: 10, max: 45, unit: "m/min", step: 2 },
        feed: { min: 0.2, max: 1.5, unit: "mm/stroke", step: 0.1 },
        doc: { min: 0.5, max: 4.0, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "The massive workpiece table strokes back and forth under the stationary cross-rail tool head, taking heavy, rigid cuts.",
      spindleRequired: false,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "step_planing",
      name: "Step Planing",
      description: "Planing long stepped shoulders and guideways on large machine foundations.",
      targetPart: "workpiece",
      requiredTool: "Planing Tool Bit",
      workArea: "Side Step",
      defaultParams: { speed: 20, feed: 0.5, doc: 1.2 },
      paramBounds: {
        speed: { min: 10, max: 40, unit: "m/min", step: 2 },
        feed: { min: 0.2, max: 1.2, unit: "mm/stroke", step: 0.1 },
        doc: { min: 0.4, max: 3.5, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "Cross-rail feeds index the tool across the casting, carving long industrial guideway steps.",
      spindleRequired: false,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "slot_planing",
      name: "Slot Planing",
      description: "Planing long T-slots and guide channels down the length of machine beds.",
      targetPart: "workpiece",
      requiredTool: "Planing Tool Bit",
      workArea: "Center Channel",
      defaultParams: { speed: 18, feed: 0.4, doc: 1.0 },
      paramBounds: {
        speed: { min: 8, max: 35, unit: "m/min", step: 2 },
        feed: { min: 0.1, max: 1.0, unit: "mm/stroke", step: 0.1 },
        doc: { min: 0.3, max: 2.5, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "Tool head feeds down gradually to machine straight longitudinal clamping slots.",
      spindleRequired: false,
      safePpe: ["goggles", "clothing", "shoes"]
    }
  ],

  milling: [
    {
      id: "face_milling",
      name: "Face Milling",
      description: "Machining a broad flat plane perpendicular to the vertical milling spindle using a multi-tooth face mill cutter.",
      targetPart: "workpiece",
      requiredTool: "Face Mill",
      workArea: "Top Face",
      defaultParams: { speed: 1100, feed: 140, doc: 1.2 },
      paramBounds: {
        speed: { min: 400, max: 2000, unit: "RPM", step: 50 },
        feed: { min: 40, max: 300, unit: "mm/min", step: 10 },
        doc: { min: 0.4, max: 3.0, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "The rotating face mill sweeps over the raw block, producing a mirror-flat reference datum surface.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "slot_milling",
      name: "Slot Milling",
      description: "Cutting a precise rectangular slot or channel through the block using a high-speed end mill cutter.",
      targetPart: "workpiece",
      requiredTool: "End Mill",
      workArea: "Center Channel",
      defaultParams: { speed: 1200, feed: 120, doc: 1.5 },
      paramBounds: {
        speed: { min: 500, max: 2200, unit: "RPM", step: 50 },
        feed: { min: 30, max: 250, unit: "mm/min", step: 10 },
        doc: { min: 0.5, max: 3.5, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "Both the end face teeth and peripheral flutes of the cutter engage the stock to mill out slots in one or more passes.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "pocket_milling",
      name: "Pocket Milling",
      description: "Machining an enclosed hollow cavity pocket inside the perimeter of the workpiece.",
      targetPart: "workpiece",
      requiredTool: "End Mill",
      workArea: "Interior Cavity",
      defaultParams: { speed: 1300, feed: 110, doc: 1.0 },
      paramBounds: {
        speed: { min: 500, max: 2200, unit: "RPM", step: 50 },
        feed: { min: 30, max: 220, unit: "mm/min", step: 10 },
        doc: { min: 0.4, max: 2.5, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "The cutter plunges inside and clears material out spirally to generate a precise enclosed pocket.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    },
    {
      id: "end_milling",
      name: "End Milling",
      description: "Machining stepped side shoulders and outer contours using an end mill.",
      targetPart: "workpiece",
      requiredTool: "End Mill",
      workArea: "Side Shoulder",
      defaultParams: { speed: 1250, feed: 130, doc: 1.2 },
      paramBounds: {
        speed: { min: 500, max: 2000, unit: "RPM", step: 50 },
        feed: { min: 30, max: 250, unit: "mm/min", step: 10 },
        doc: { min: 0.4, max: 2.5, unit: "mm", step: 0.2 }
      },
      educationalExplanation: "Side teeth of the end mill machine flat vertical walls and square steps along the block.",
      spindleRequired: true,
      safePpe: ["goggles", "clothing", "shoes"]
    }
  ],

  casting: [
    {
      id: "pattern_preparation",
      name: "Pattern Setup",
      description: "Inspecting and positioning the wooden gear pattern inside the sand moulding flasks.",
      targetPart: "pattern",
      requiredTool: "Pattern block",
      workArea: "Drag Flask",
      defaultParams: { speed: 700, feed: 3.5, doc: 4.5 },
      paramBounds: {
        speed: { min: 600, max: 850, unit: "°C Temp", step: 25 },
        feed: { min: 1, max: 6, unit: "kg/s Flow", step: 0.5 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "The pattern replica sets the geometry of the hollow cavity to be filled by molten metal.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    },
    {
      id: "pouring",
      name: "Molten Pouring",
      description: "Tilting the preheated crucible ladle and pouring molten aluminum at 720°C into the sprue basin.",
      targetPart: "ladle",
      requiredTool: "Ladle crucible",
      workArea: "Sprue Basin",
      defaultParams: { speed: 720, feed: 3.0, doc: 4.5 },
      paramBounds: {
        speed: { min: 650, max: 800, unit: "°C Temp", step: 10 },
        feed: { min: 1.5, max: 5.5, unit: "kg/s Flow", step: 0.5 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Liquid metal streams down the vertical sprue channel, filling the runner gating system without turbulence.",
      spindleRequired: false,
      safePpe: ["shield", "gloves", "clothing", "shoes"]
    },
    {
      id: "filling",
      name: "Cavity Filling",
      description: "Molten metal rises evenly through runners and ingates, filling the casting cavity and riser.",
      targetPart: "casting_cavity",
      requiredTool: "Ladle crucible",
      workArea: "Internal Cavity",
      defaultParams: { speed: 710, feed: 3.0, doc: 4.5 },
      paramBounds: {
        speed: { min: 650, max: 800, unit: "°C Temp", step: 10 },
        feed: { min: 1.5, max: 5.5, unit: "kg/s Flow", step: 0.5 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Fluid metal reaches all thin sections and fills the riser reservoir to offset volumetric liquid contraction.",
      spindleRequired: false,
      safePpe: ["shield", "gloves", "clothing", "shoes"]
    },
    {
      id: "solidification",
      name: "Solidification",
      description: "Molten metal transitions through directional cooling from liquid to solid crystalline structure.",
      targetPart: "casting_cavity",
      requiredTool: "Mould flask",
      workArea: "Internal Cavity",
      defaultParams: { speed: 600, feed: 0, doc: 4.5 },
      paramBounds: {
        speed: { min: 400, max: 700, unit: "°C Temp", step: 25 },
        feed: { min: 0, max: 5, unit: "Cooling Rate", step: 1 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "The glowing metal cools, solidifies into solid casting, and locks in the final component shape.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    },
    {
      id: "casting_removal",
      name: "Casting Removal",
      description: "Shaking out sand mould flasks to retrieve the solid cast gear component.",
      targetPart: "casting_cavity",
      requiredTool: "Vibrator hammer",
      workArea: "Flask Separation",
      defaultParams: { speed: 150, feed: 0, doc: 0 },
      paramBounds: {
        speed: { min: 50, max: 300, unit: "°C Temp", step: 25 },
        feed: { min: 0, max: 5, unit: "Shakeout", step: 1 },
        doc: { min: 0, max: 5, unit: "Cleaning", step: 1 }
      },
      educationalExplanation: "Flasks are unpinned and sand is vibrated away, revealing the solid raw metal casting with attached sprues.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    }
  ],

  moulding: [
    {
      id: "pattern_placement",
      name: "Pattern Placement",
      description: "Placing pattern face-down on moulding board and applying parting powder.",
      targetPart: "pattern",
      requiredTool: "Pattern block",
      workArea: "Drag Box Base",
      defaultParams: { speed: 50, feed: 25, doc: 4.5 },
      paramBounds: {
        speed: { min: 20, max: 80, unit: "Force kPa", step: 5 },
        feed: { min: 10, max: 50, unit: "Sand mm", step: 5 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Pattern sets baseline orientation; parting powder prevents sand from bonding to pattern wood.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    },
    {
      id: "sand_filling",
      name: "Sand Filling",
      description: "Sieving facing sand over pattern and shoveling backing silica sand into the flask.",
      targetPart: "sand",
      requiredTool: "Sand riddle",
      workArea: "Drag Box",
      defaultParams: { speed: 50, feed: 30, doc: 4.5 },
      paramBounds: {
        speed: { min: 20, max: 80, unit: "Force kPa", step: 5 },
        feed: { min: 10, max: 50, unit: "Sand mm", step: 5 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Fine facing sand ensures smooth surface finish; clay and water content give green compressive strength.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    },
    {
      id: "sand_compaction",
      name: "Sand Compaction",
      description: "Tamping and ramming sand mixture firmly around pattern contours.",
      targetPart: "sand",
      requiredTool: "Hand rammer",
      workArea: "Drag Sand",
      defaultParams: { speed: 65, feed: 30, doc: 4.5 },
      paramBounds: {
        speed: { min: 30, max: 95, unit: "Ramming kPa", step: 5 },
        feed: { min: 10, max: 50, unit: "Compaction %", step: 5 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Ramming tightens sand grains around the pattern to withstand the static pressure of liquid metal.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    },
    {
      id: "pattern_removal",
      name: "Pattern Removal",
      description: "Vibrating and lifting the pattern out of the sand drag to leave a crisp hollow cavity.",
      targetPart: "pattern",
      requiredTool: "Draw spikes",
      workArea: "Cavity Drag",
      defaultParams: { speed: 60, feed: 0, doc: 4.5 },
      paramBounds: {
        speed: { min: 30, max: 80, unit: "Draw Force", step: 5 },
        feed: { min: 0, max: 10, unit: "Draft mm", step: 1 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Draw spikes gently rap pattern sides before lifting vertically, leaving undamaged sand cavity walls.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    },
    {
      id: "mould_assembly",
      name: "Mould Assembly",
      description: "Aligning cope and drag flasks with guide pins and clamping ready for metal pouring.",
      targetPart: "cavity",
      requiredTool: "Alignment pins",
      workArea: "Flask Joint",
      defaultParams: { speed: 70, feed: 6, doc: 4.5 },
      paramBounds: {
        speed: { min: 40, max: 90, unit: "Clamp Force", step: 5 },
        feed: { min: 2, max: 12, unit: "Vents Count", step: 1 },
        doc: { min: 2, max: 8, unit: "% Moisture", step: 0.5 }
      },
      educationalExplanation: "Cope and drag are locked together. Venting holes allow hot steam and gases to escape during pouring.",
      spindleRequired: false,
      safePpe: ["goggles", "gloves", "clothing", "shoes"]
    }
  ]
};
