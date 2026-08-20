export const MACHINES = {
  lathe: {
    id: "lathe",
    name: "Centre Lathe Machine",
    color: "#F28C28", // Safety Orange
    tagline: "The King of Machining Operations",
    overview: "A machine tool that rotates a workpiece about an axis of rotation to perform various operations such as cutting, sanding, knurling, drilling, or deformation.",
    commonOperations: ["Turning", "Facing", "Threading", "Knurling", "Drilling"],
    workpieceMovement: "Rotates rapidly",
    toolMovement: "Feeds linearly parallel or perpendicular to rotation axis",
    output: "Cylindrical parts, shafts, threads, cones",
    accuracyClass: "Very High (±0.01 mm)",
    parts: [
      { id: "bed", name: "Bed", desc: "The heavy foundation supporting all components. Made of cast iron for damping vibrations." },
      { id: "headstock", name: "Headstock", desc: "The casting on the left end of the lathe bed housing the spindle, speed selector gears, and motor drive." },
      { id: "chuck", name: "Chuck", desc: "A clamping device that holds and rotates the workpiece securely during cutting." },
      { id: "spindle", name: "Spindle", desc: "The main rotating shaft that drives the chuck and workpiece." },
      { id: "workpiece", name: "Workpiece", desc: "The raw metal cylinder material mounted in the chuck to be machined." },
      { id: "carriage", name: "Carriage", desc: "Moves along the bed and carries the apron, cross-slide, and tool post to control tool movement." },
      { id: "cross_slide", name: "Cross Slide", desc: "Mounted on the carriage, moves perpendicular to the lathe bed axis to control depth of cut." },
      { id: "compound_rest", name: "Compound Rest", desc: "Mounted on the cross-slide, supports the tool post and can be rotated to turn tapers." },
      { id: "tool_post", name: "Tool Post", desc: "Holds the cutting tool securely. Mounted on the compound rest." },
      { id: "cutting_tool", name: "Cutting Tool", desc: "Single-point tool bit clamped in the tool post used to shave metal off the workpiece." },
      { id: "tailstock", name: "Tailstock", desc: "Supports the free end of long workpieces or holds drilling/reaming tools." },
      { id: "lead_screw", name: "Lead Screw", desc: "A threaded rod that converts rotary motion into linear carriage movement for thread cutting." },
      { id: "feed_rod", name: "Feed Rod", desc: "A smooth shaft that transmits power from the headstock gearbox to the carriage for automatic feeding." },
      { id: "handwheels", name: "Hand Wheels", desc: "Manual wheels used by the operator to position the carriage and cross-slide." }
    ],
    steps: [
      { step: 1, title: "Select Workpiece", desc: "Choose workpiece stock material (e.g. Mild Steel, Brass, Aluminium)." },
      { step: 2, title: "Secure Workpiece", desc: "Clamp the metal cylindrical stock firmly inside the three-jaw chuck." },
      { step: 3, title: "Select Tool", desc: "Choose and install the cutting tool bit (e.g. HSS single-point, carbide, or threading tool)." },
      { step: 4, title: "Safety Check", desc: "Inspect and complete the safety checklist. Wear goggles, proper clothes, but NO GLOVES." },
      { step: 5, title: "Set RPM", desc: "Configure spindle rotational speed (RPM) based on workpiece material hardness." },
      { step: 6, title: "Set Feed", desc: "Adjust gearboxes to set automatic tool linear feed rate (mm/rev)." },
      { step: 7, title: "Set Depth of Cut", desc: "Adjust cross-slide dial to set depth of metal removal per pass (mm)." },
      { step: 8, title: "Start Spindle", desc: "Turn on the motor drive to rotate the chuck and workpiece." },
      { step: 9, title: "Move Tool", desc: "Position the carriage and cross-slide to bring the cutting tool to the workpiece." },
      { step: 10, title: "Machine Workpiece", desc: "Engage automatic feed to feed the carriage longitudinally to shave off material." },
      { step: 11, title: "Inspect Finished Part", desc: "Stop spindle, clear chips, and measure the final diameter using digital calipers." }
    ],
    troubleshoot: [
      {
        id: "rough_finish",
        title: "Poor Surface Finish",
        desc: "The machined cylindrical shaft exhibits a rough, torn finish instead of a smooth finish.",
        options: [
          { id: "opt_a", text: "Feed rate is too high, or cutting speed is too low.", isCorrect: true, reason: "High feed rate creates large feed marks on the workpiece, and low speed prevents proper chip shear." },
          { id: "opt_b", text: "Workpiece is clamped too tightly.", isCorrect: false, reason: "Tight clamping prevents slip but does not cause tearing." },
          { id: "opt_c", text: "Coolant concentration is too high.", isCorrect: false, reason: "High coolant concentration increases lubrication, which improves surface finish." }
        ]
      }
    ],
    simulator: {
      mission: "Manufacture a Cylindrical Shaft",
      goal: "Turn a raw 40mm steel stock down to 36mm diameter with a smooth surface finish.",
      materialOptions: ["Mild Steel (Recommended)", "Aluminum (Soft)", "Cast Iron (Brittle)"],
      toolOptions: ["HSS Single-Point Tool (Recommended)", "Threading Tool", "Parting Tool"],
      paramRanges: {
        speed: { min: 200, max: 1200, opt: [600, 800] },
        feed: { min: 0.05, max: 0.5, opt: [0.1, 0.2] },
        doc: { min: 0.5, max: 3.0, opt: [1.0, 1.5] }
      }
    },
    experiments: {
      title: "Lathe Turning Parameters Analysis",
      variables: [
        { id: "speed", name: "Cutting Speed (RPM)", min: 200, max: 1500, step: 50, default: 800 },
        { id: "feed", name: "Feed Rate (mm/rev)", min: 0.05, max: 0.6, step: 0.05, default: 0.15 },
        { id: "doc", name: "Depth of Cut (mm)", min: 0.2, max: 3.0, step: 0.2, default: 1.0 }
      ],
      formulas: {
        mrr: (speed, feed, doc) => (speed * 0.1 * feed * doc * 5.5).toFixed(1),
        temp: (speed, feed, doc) => (100 + (speed * 0.4) + (feed * 300) + (doc * 45)).toFixed(0),
        roughness: (speed, feed) => {
          const base = (feed * feed * 125) / 0.8;
          const speedFactor = 1500 / speed;
          return (base * speedFactor).toFixed(2);
        }
      }
    },
    operations: [
      { id: "facing", name: "Facing", description: "Machining the end face of a workpiece to produce a flat surface.", workArea: "Front End Face", tool: "Facing Tool", educationalExplanation: "The cutting tool approaches the rotating end face radially, machining it flat." },
      { id: "taper_turning", name: "Taper Turning", description: "Machining a conical shape by feeding the tool at an angle.", workArea: "External Cylinder", tool: "Turning Tool", educationalExplanation: "The compound slide is angled to create a gradual decrease in diameter." },
      { id: "contour_turning", name: "Contour Turning", description: "Machining a curved profile along the workpiece.", workArea: "External Cylinder", tool: "Contour Tool", educationalExplanation: "The tool moves along a curved path to form organic details and curves." },
      { id: "forming", name: "Forming", description: "Plunging a shaped tool directly into the workpiece.", workArea: "External Cylinder", tool: "Form Tool", educationalExplanation: "A shaped tool bit plunges into the side of the metal to replicate its exact outline." },
      { id: "boring", name: "Boring", description: "Enlarging a pre-existing internal hole.", workArea: "Internal Hole", tool: "Boring Bar", educationalExplanation: "Boring tool moves inside a drilled hole to expand its size and improve concentricity." },
      { id: "chamfering", name: "Chamfering", description: "Beveling the sharp outer edges of the cylinder.", workArea: "External Edge", tool: "Chamfer Tool", educationalExplanation: "A 45-degree angle tool takes off the sharp edge for safe handling." },
      { id: "parting_off", name: "Parting Off", description: "Cutting off a finished section of the workpiece.", workArea: "Slice Section", tool: "Parting Tool", educationalExplanation: "A thin blade cuts deep into the rotating workpiece to separate the completed part." },
      { id: "threading", name: "Threading", description: "Machining helical threads on the cylinder.", workArea: "External Cylinder", tool: "Threading Tool", educationalExplanation: "Longitudinal movement is geared with chuck rotation to trace out thread grooves." },
      { id: "drilling", name: "Drilling", description: "Drilling a hole along the central rotational axis.", workArea: "Center Point", tool: "Twist Drill Bit", educationalExplanation: "The drill bit is held stationary in the tailstock and fed into the rotating chuck." },
      { id: "knurling", name: "Knurling", description: "Embossing a cross-pattern grip on the metal.", workArea: "External Cylinder", tool: "Knurling Tool", educationalExplanation: "Knurling rollers press hard to cold-deform the metal and form a textured grip." }
    ]
  },
  welding: {
    id: "welding",
    name: "Arc Welding Station",
    color: "#C96F16", // Warm Amber
    tagline: "Fusing Metals with Intense Heat",
    overview: "A fabrication process that joins materials, usually metals or thermoplastics, by using high heat to melt the parts together.",
    commonOperations: ["Butt Joint", "Lap Joint", "T-Joint", "Corner Joint"],
    workpieceMovement: "Stationary, clamped on welding table",
    toolMovement: "Electrode held by operator, fed at angle while maintaining arc gap",
    output: "Structural frames, piping, fabricated steel items",
    accuracyClass: "Medium (depends on welder skill)",
    parts: [
      { id: "welding_table", name: "Welding Table", desc: "A heavy steel work surface that is grounded to hold workpieces during operation." },
      { id: "welding_machine", name: "Welding Machine", desc: "The power source that provides constant current (CC) or constant voltage (CV) for the arc." },
      { id: "electrode_holder", name: "Electrode Holder (Torch)", desc: "An insulated clamping device held by the welder to grip the consumable welding electrode." },
      { id: "cables", name: "Cables", desc: "Heavy copper cables completing the welding circuit between machine, torch, and ground clamp." },
      { id: "ground_clamp", name: "Ground Clamp", desc: "Connected to the workpiece to complete the electrical circuit for current flow." },
      { id: "metal_plates", name: "Metal Plates", desc: "The raw steel sheets to be joined together using weld bead deposition." },
      { id: "clamps", name: "Clamps", desc: "Heavy duty C-clamps used to align and secure the metal plates to prevent warping." },
      { id: "weld_joint", name: "Weld Joint", desc: "The seam line interface between plates where molten filler metal fuses them." },
      { id: "ppe", name: "PPE Shield", desc: "Auto-darkening welding helmet to protect operator eyes from ultraviolet arc radiation." }
    ],
    steps: [
      { step: 1, title: "Prepare Joint", desc: "Bevel plate edges and clean off mill scale or rust using a wire brush." },
      { step: 2, title: "Clamp Plates", desc: "Position plates on the table and secure tightly using holding clamps." },
      { step: 3, title: "Attach Ground", desc: "Clamp the electrical ground cable securely to the steel table or workpiece." },
      { step: 4, title: "Safety Gear", desc: "Wear high-shade welding visor, heavy leather gloves, and protective apron." },
      { step: 5, title: "Select Electrode", desc: "Choose rod type (e.g. E6010 for penetration, E7018 for low-hydrogen strength)." },
      { step: 6, title: "Set Amperage", desc: "Configure welding current amperage (Amps) on the power source dial." },
      { step: 7, title: "Strike Arc", desc: "Scratch or tap the electrode tip on the plate to initiate the electrical arc." },
      { step: 8, title: "Weld Joint", desc: "Maintain a 2-3mm arc gap while dragging the electrode along the joint seam." },
      { step: 9, title: "Chip Slag", desc: "Allow bead to cool, then chip off slag coating using a chipping hammer." }
    ],
    troubleshoot: [
      {
        id: "weld_porosity",
        title: "Weld Bead Porosity (Holes)",
        desc: "The completed weld seam has small gas pockets or pinholes throughout the bead.",
        options: [
          { id: "opt_a", text: "Joint was contaminated with oil, rust, or moisture, or arc gap was too long.", isCorrect: true, reason: "Impurities burn and release gases that get trapped during solidification, and long arc lets atmosphere in." },
          { id: "opt_b", text: "Amperage was set too low.", isCorrect: false, reason: "Low current causes poor penetration and sticking, but not gas pockets." },
          { id: "opt_c", text: "Electrode was too thick.", isCorrect: false, reason: "Thick electrodes require more current but do not inherently introduce gas bubbles." }
        ]
      }
    ],
    simulator: {
      mission: "Weld Two Steel Plates",
      goal: "Join two 8mm mild steel plates with a continuous butt weld and full joint penetration.",
      materialOptions: ["A36 Mild Steel (Recommended)", "Stainless Steel (Difficult)", "Aluminum (High heat sink)"],
      toolOptions: ["E7018 Consumable Electrode (Recommended)", "E6013 Rutile Electrode", "TIG Torch (Argon gas)"],
      paramRanges: {
        speed: { min: 50, max: 200, opt: [100, 120] }, // Current (Amps)
        feed: { min: 2, max: 8, opt: [3, 4] },        // Arc Gap (mm)
        doc: { min: 5, max: 25, opt: [10, 15] }        // Travel Speed (mm/s)
      }
    },
    experiments: {
      title: "Arc Welding Heat & Penetration Analysis",
      variables: [
        { id: "current", name: "Welding Current (Amps)", min: 50, max: 180, step: 5, default: 110 },
        { id: "gap", name: "Arc Gap (mm)", min: 1.0, max: 6.0, step: 0.5, default: 3.0 },
        { id: "travelSpeed", name: "Travel Speed (mm/s)", min: 5, max: 30, step: 1, default: 15 }
      ],
      formulas: {
        mrr: (current, gap, travelSpeed) => ((current * 12 * 0.7) / travelSpeed).toFixed(1), // Heat input kJ/mm
        temp: (current, gap) => (1200 + current * 8 - gap * 40).toFixed(0), // Arc temperature °C
        roughness: (current, gap, travelSpeed) => (1.0 + (gap * 0.8) + (travelSpeed * 0.1)).toFixed(1) // Spatter index
      }
    },
    operations: [
      { id: "butt_joint", name: "Butt Joint", description: "Joining two plates end-to-end on the same plane.", workArea: "Edge Gap Seam", tool: "SMAW Electrode", educationalExplanation: "The arc fuses the parallel edges, depositing filler metal directly in the gap." },
      { id: "lap_joint", name: "Lap Joint", description: "Joining two overlapping metal plates.", workArea: "Overlap Edge", tool: "SMAW Electrode", educationalExplanation: "Electrode deposits a fillet weld along the seam where the top plate overlaps the bottom." },
      { id: "fillet_joint", name: "Fillet Joint", description: "Welding two plates at a right angle corner.", workArea: "90 Deg Corner Seam", tool: "SMAW Electrode", educationalExplanation: "Fuses the inside corner interface of perpendicular metal plates." },
      { id: "corner_joint", name: "Corner Joint", description: "Welding plates at their outer 90-degree corner.", workArea: "Outer Corner Edge", tool: "SMAW Electrode", educationalExplanation: "Fused along the outside corner, requiring careful arc control to avoid melt-off." },
      { id: "t_joint", name: "T-Joint", description: "Fusing plates perpendicular to form a 'T' shape.", workArea: "Vertical Joint Base", tool: "SMAW Electrode", educationalExplanation: "Welded along both sides of the vertical plate base interface." },
      { id: "groove_weld", name: "Groove Weld", description: "Depositing weld metal in a V-shaped groove.", workArea: "V-Groove Channel", tool: "SMAW Electrode", educationalExplanation: "The V bevel allows weld metal to reach the root for full penetration." },
      { id: "spot_weld", name: "Spot Weld", description: "Fusing plates at a single localized spot.", workArea: "Circular Spot", tool: "Spot Weld Gun", educationalExplanation: "Welds plates together at a circular point using localized resistance heat." },
      { id: "tack_weld", name: "Tack Weld", description: "Small temporary welds to hold plates in place.", workArea: "Point Seams", tool: "SMAW Electrode", educationalExplanation: "Short, quick welds spaced out to secure alignment before final run." },
      { id: "seam_weld", name: "Seam Weld", description: "A continuous leak-proof line weld.", workArea: "Continuous Seam", tool: "SMAW Electrode", educationalExplanation: "Electrode traces a continuous path to form an airtight seal." },
      { id: "circular_joint", name: "Pipe Joint", description: "Welding a cylindrical pipe seam.", workArea: "Pipe Circumference", tool: "SMAW Electrode", educationalExplanation: "Welded in a circular path, requiring continuous angle adjustments." }
    ]
  },
  shaper: {
    id: "shaper",
    name: "Shaping Machine",
    color: "#52B788", // Success Green / Teal
    tagline: "Reciprocating Surface Machining",
    overview: "A shaper is a type of machine tool that uses relative motion between a single-point cutting tool and the workpiece to machine flat surfaces.",
    commonOperations: ["Plain Shaping", "Step Shaping", "Slotting", "Keyway Cutting"],
    workpieceMovement: "Feeds crosswise slowly between strokes",
    toolMovement: "Reciprocates in a horizontal straight line (slow forward, fast return)",
    output: "Flat surfaces, steps, slots, keyways",
    accuracyClass: "High (±0.03 mm)",
    parts: [
      { id: "base", name: "Base", desc: "The heavy cast iron foot supporting the column and table." },
      { id: "column", name: "Column", desc: "Main housing containing the bull gear, crank arm, and ram drive mechanisms." },
      { id: "ram", name: "Ram", desc: "The reciprocating member that slides horizontally in the column guides, carrying the tool head." },
      { id: "tool_head", name: "Tool Head", desc: "Holds the clapper box and provides vertical downfeed control for depth of cut." },
      { id: "cutting_tool", name: "Cutting Tool", desc: "Single-point shaping tool bit that shaves metal off the block." },
      { id: "table", name: "Table", desc: "The T-slotted box table that holds the vice and feeds horizontally." },
      { id: "vice", name: "Vice", desc: "Holds the raw rectangular metal block workpiece firmly in place." },
      { id: "clapper_box", name: "Clapper Box", desc: "A hinged block that lets the tool tilt up on the return stroke to avoid dragging." }
    ],
    steps: [
      { step: 1, title: "Clamp Workpiece", desc: "Place rectangular block in vice, align horizontally using parallels, and clamp." },
      { step: 2, title: "Align Tool", desc: "Clamp the single-point tool bit vertically in the tool post." },
      { step: 3, title: "Adjust Stroke", desc: "Set stroke length and ram position to cover the workpiece length plus 20mm." },
      { step: 4, title: "Safety Checklist", desc: "Verify safety guards, tight clothes, goggles, and NO GLOVES." },
      { step: 5, title: "Set Ram Speed", desc: "Set motor gearbox speed (Strokes Per Minute) based on material." },
      { step: 6, title: "Set Table Feed", desc: "Engage automatic feed rate to advance table slightly per stroke." },
      { step: 7, title: "Start Machine", desc: "Start the ram reciprocating motion and position tool near work face." },
      { step: 8, title: "Machine Flat", desc: "Feed tool down to set depth, then engage feed to shave off horizontal metal." }
    ],
    troubleshoot: [
      {
        id: "tool_chipping",
        title: "Cutting Tool Tip Chipping",
        desc: "The cutting tool edge breaks off or chips rapidly during the return idle stroke.",
        options: [
          { id: "opt_a", text: "Clapper box is jammed or stuck, preventing tool from swinging up on return.", isCorrect: true, reason: "The clapper box must swing freely to let the tool lift; if stuck, the tool drags backward, chipping the tip." },
          { id: "opt_b", text: "Cutting speed is set too slow.", isCorrect: false, reason: "Slow speed increases cutting forces slightly but does not cause chipping on the return stroke." },
          { id: "opt_c", text: "Table feed was engaged at the wrong end.", isCorrect: false, reason: "Incorrect feed direction affects cutting sequence, not drag-induced return stroke chipping." }
        ]
      }
    ],
    simulator: {
      mission: "Shape a Flat Surface",
      goal: "Shave a rough steel block flat, reducing height by 1.5mm with horizontal strokes.",
      materialOptions: ["Structural Steel (Recommended)", "Brass", "Cast Iron"],
      toolOptions: ["Roughing Tool Bit (Recommended)", "Finishing Tool Bit", "Slotting Tool"],
      paramRanges: {
        speed: { min: 20, max: 80, opt: [40, 60] }, // Strokes Per Minute
        feed: { min: 0.1, max: 0.8, opt: [0.2, 0.4] }, // Table Feed per stroke (mm)
        doc: { min: 0.2, max: 2.0, opt: [0.5, 1.0] } // Downfeed cut depth (mm)
      }
    },
    experiments: {
      title: "Shaper Kinematics & MRR Analysis",
      variables: [
        { id: "spm", name: "Strokes Per Minute (SPM)", min: 10, max: 90, step: 5, default: 45 },
        { id: "feed", name: "Table Feed (mm/stroke)", min: 0.1, max: 1.0, step: 0.1, default: 0.3 },
        { id: "doc", name: "Depth of Cut (mm)", min: 0.2, max: 2.5, step: 0.1, default: 0.8 }
      ],
      formulas: {
        mrr: (spm, feed, doc) => (spm * feed * doc * 4.2).toFixed(1),
        temp: (spm, doc) => (80 + spm * 0.8 + doc * 35).toFixed(0),
        roughness: (spm, feed) => (1.8 + feed * 3.5 - spm * 0.01).toFixed(2)
      }
    },
    operations: [
      { id: "plain_shaping", name: "Plain Shaping", description: "Shaping a flat horizontal surface.", workArea: "Top Surface", tool: "Shaper Tool Bit", educationalExplanation: "The tool moves linearly over the surface, removing strips of metal with each stroke." },
      { id: "step_shaping", name: "Step Shaping", description: "Machining perpendicular stepped features.", workArea: "Stepped Face", tool: "Shaper Tool Bit", educationalExplanation: "Shapes horizontal and vertical surfaces in sequence to form steps." },
      { id: "slot_cutting", name: "Slot Cutting", description: "Cutting narrow straight slots.", workArea: "Center Groove", tool: "Slotting Tool Bit", educationalExplanation: "A narrow tool is fed vertically downwards to cut out a slot or channel." },
      { id: "keyway_cutting", name: "Keyway Cutting", description: "Cutting keyway channels for pulleys/gears.", workArea: "Shaft / Keyseat", tool: "Keyway Tool Bit", educationalExplanation: "Machines precise slots internally in hubs or externally on shafts." },
      { id: "groove_cutting", name: "Groove Cutting", description: "Machining narrow channels or grooves.", workArea: "Horizontal Groove", tool: "Groove Tool Bit", educationalExplanation: "Creates grooves on plates for slider rails or clamping bolts." },
      { id: "angular_shaping", name: "Angular Shaping", description: "Shaping flat surfaces at an angle.", workArea: "Inclined Face", tool: "Shaper Tool Bit", educationalExplanation: "The tool slide head is tilted to feed the cutter at a diagonal angle." },
      { id: "contour_shaping", name: "Contour Shaping", description: "Shaping curved profiles.", workArea: "Curved Face", tool: "Shaper Tool Bit", educationalExplanation: "Worktable coordinates are adjusted manually per stroke to trace curves." },
      { id: "vertical_shaping", name: "Vertical Shaping", description: "Shaping vertical side surfaces.", workArea: "Side Face", tool: "Shaper Tool Bit", educationalExplanation: "Tool head is fed downwards to machine a flat side face." }
    ]
  },
  planer: {
    id: "planer",
    name: "Planing Machine",
    color: "#E4572E", // Warning / Flame Orange
    tagline: "Machining Large-Scale Castings",
    overview: "A planer is a machine tool designed to produce flat surfaces on workpieces that are too large or heavy to be machined on a shaper.",
    commonOperations: ["Plain Planing", "Step Planing", "Slotting", "Multi-surface Planing"],
    workpieceMovement: "Reciprocates back and forth on a massive table",
    toolMovement: "Feeds crosswise slowly on cross-rails between table passes",
    output: "Large machine beds, columns, slides, flat plates",
    accuracyClass: "High (±0.04 mm)",
    parts: [
      { id: "table", name: "Large Table", desc: "A massive reciprocating bed that holds and moves the heavy workpiece under the cutting tool." },
      { id: "workpiece", name: "Workpiece", desc: "The large metal casting or plate bolted down to the table to be planed." },
      { id: "housing", name: "Columns", desc: "Two rigid vertical pillars supporting the cross-rail and tool heads." },
      { id: "cross_rail", name: "Cross Rail", desc: "A horizontal beam that can be raised or lowered and guides the cross-feed tool heads." },
      { id: "tool_head", name: "Tool Head", desc: "Holds the clapper box and provides cross-feed and downfeed for the tool." },
      { id: "cutting_tool", name: "Cutting Tool", desc: "Heavy single-point tool bit clamped in the tool head." },
      { id: "clamps", name: "Clamps", desc: "T-bolts and heavy clamps securing the workpiece directly to the table T-slots." }
    ],
    steps: [
      { step: 1, title: "Bolt Workpiece", desc: "Position the heavy workpiece casting on the planer table and secure with T-bolts." },
      { step: 2, title: "Setup Tool", desc: "Clamp the heavy planing tool bit in the cross-rail tool head." },
      { step: 3, title: "Adjust Table Stroke", desc: "Configure table stroke reversing dogs to match workpiece length." },
      { step: 4, title: "Safety Check", desc: "Wear safety goggles, tight clothes, steel shoes, but NO GLOVES." },
      { step: 5, title: "Set Table Speed", desc: "Adjust gear drives to set table reciprocating speed (m/min)." },
      { step: 6, title: "Set Tool Feed", desc: "Configure automatic feed to move tool head slightly per return stroke." },
      { step: 7, title: "Machine Workpiece", desc: "Start table reciprocating motion and feed tool down to shave off top skin." }
    ],
    troubleshoot: [
      {
        id: "table_chatter",
        title: "Severe Machine Chatter / Vibration",
        desc: "Severe vibrations rattle the workpiece and planer frame during the cutting pass.",
        options: [
          { id: "opt_a", text: "Workpiece clamping bolts are loose, or depth of cut is too deep.", isCorrect: true, reason: "Planing heavy castings generates high forces; loose clamps or excessive depth of cut causes workpiece shifting and chatter." },
          { id: "opt_b", text: "Cross-rail was raised too high.", isCorrect: false, reason: "Cross-rail height sets clearances but does not cause cutting chatter directly unless guide locks are loose." },
          { id: "opt_c", text: "Table stroke was set too short.", isCorrect: false, reason: "Short stroke causes short cutting lengths, not cutting vibrations." }
        ]
      }
    ],
    simulator: {
      mission: "Plane a Cast Iron Plate",
      goal: "Plane the top surface of a large 1.5-meter cast iron plate, removing 1.0mm.",
      materialOptions: ["Gray Cast Iron (Recommended)", "Structural Steel", "Manganese Steel"],
      toolOptions: ["Heavy-Duty Planing Tool (Recommended)", "Broad-Nosed Finishing Tool", "Grooving Tool"],
      paramRanges: {
        speed: { min: 10, max: 40, opt: [20, 30] }, // Table speed (m/min)
        feed: { min: 0.2, max: 1.5, opt: [0.5, 0.8] }, // Tool feed per stroke (mm)
        doc: { min: 0.5, max: 4.0, opt: [1.0, 2.0] } // Depth of cut (mm)
      }
    },
    experiments: {
      title: "Planer High-Force Planing Analysis",
      variables: [
        { id: "speed", name: "Table Speed (m/min)", min: 10, max: 50, step: 2, default: 25 },
        { id: "feed", name: "Tool Cross-Feed (mm/stroke)", min: 0.2, max: 2.0, step: 0.1, default: 0.6 },
        { id: "doc", name: "Depth of Cut (mm)", min: 0.5, max: 5.0, step: 0.5, default: 1.5 }
      ],
      formulas: {
        mrr: (speed, feed, doc) => (speed * feed * doc * 15.0).toFixed(1),
        temp: (speed, doc) => (120 + speed * 1.5 + doc * 55).toFixed(0),
        roughness: (speed, feed) => (2.0 + feed * 4.0 - speed * 0.02).toFixed(2)
      }
    },
    operations: [
      { id: "plain_planing", name: "Plain Planing", description: "Planing flat horizontal surfaces.", workArea: "Top Flat Face", tool: "Planing Tool Bit", educationalExplanation: "The large worktable moves back and forth carrying the heavy plate under the fixed tool." },
      { id: "step_planing", name: "Step Planing", description: "Planing vertical stepped shoulders.", workArea: "Stepped Shoulder", tool: "Planing Tool Bit", educationalExplanation: "The cross-feed is combined with vertical down-feed to plane perpendicular steps." },
      { id: "slot_planing", name: "Slot Planing", description: "Planing long slots along the workpiece.", workArea: "Center Slot", tool: "Planing Tool Bit", educationalExplanation: "A narrow grooving tool cuts long straight channels as the table strokes." },
      { id: "groove_planing", name: "Groove Planing", description: "Planing angled V-grooves.", workArea: "V-Groove Seam", tool: "Planing Tool Bit", educationalExplanation: "Machines guide grooves for sliding machine beds and tables." },
      { id: "angular_planing", name: "Angular Planing", description: "Planing angled inclined surfaces.", workArea: "Inclined Face", tool: "Planing Tool Bit", educationalExplanation: "Cross rail slide is rotated to plane angled guides." },
      { id: "vertical_surface_planing", name: "Vertical Planing", description: "Planing vertical side faces.", workArea: "Vertical Side Face", tool: "Planing Tool Bit", educationalExplanation: "Side column tool heads are fed vertically to plane side edges." },
      { id: "keyway_slot_work", name: "Keyway Work", description: "Planing keyways in large hubs.", workArea: "Hub Keyway", tool: "Planing Tool Bit", educationalExplanation: "Cuts long internal keyways in heavy industrial parts." },
      { id: "multi_surface_planing", name: "Multi-Surface Planing", description: "Planing top and side faces simultaneously.", workArea: "Top & Side Faces", tool: "Multiple Tool Bits", educationalExplanation: "Uses horizontal and side column tool heads to machine multiple faces at once." }
    ]
  },
  milling: {
    id: "milling",
    name: "Milling Machine",
    color: "#AEB5B7", // Industrial Silver / Grey
    tagline: "High-Precision Rotary Machining",
    overview: "A milling machine is a machine tool used to machine solid materials. Milling machines are often classified in two basic forms: horizontal and vertical.",
    commonOperations: ["Face Milling", "Slab Milling", "End Milling", "Slotting"],
    workpieceMovement: "Feeds horizontally along X, Y, and Z axes",
    toolMovement: "Cutter rotates rapidly in vertical or horizontal spindle",
    output: "Flat surfaces, slots, pockets, gears, profiles",
    accuracyClass: "Very High (±0.01 mm)",
    parts: [
      { id: "base", name: "Base", desc: "The heavy floor pedestal providing rigidity and damping." },
      { id: "column", name: "Column", desc: "The vertical column enclosing spindle gears and motor." },
      { id: "spindle", name: "Spindle", desc: "The rotating shaft driven by gears to rotate the cutter." },
      { id: "motor_head", name: "Motor Head", desc: "Main motor driving the spindle rotation." },
      { id: "cutter", name: "Cutter", desc: "Multi-point rotary tool that chips away metal." },
      { id: "table", name: "Table", desc: "Feeds crosswise and vertically to position workpiece." },
      { id: "vice", name: "Vice", desc: "Clamps the raw workpiece metal block firmly." },
      { id: "workpiece", name: "Workpiece", desc: "The raw rectangular block metal mounted in the vice." },
      { id: "handwheels", name: "Hand Wheels", desc: "Manual wheels used to adjust X, Y, and Z coordinates." }
    ],
    steps: [
      { step: 1, title: "Clamp Workpiece", desc: "Mount raw rectangular steel block in vice, align, and clamp tightly." },
      { step: 2, title: "Insert Cutter", desc: "Insert and secure the milling cutter (e.g. End Mill) in the spindle chuck." },
      { step: 3, title: "Safety Check", desc: "Complete safety checklist. Wear goggles, tight clothes, but NO GLOVES." },
      { step: 4, title: "Set Spindle RPM", desc: "Configure spindle rotating speed (RPM) based on cutter diameter." },
      { step: 5, title: "Set Table Feed", desc: "Configure automatic table feed rate (mm/min)." },
      { step: 6, title: "Touch Off", desc: "Start spindle, feed table up until cutter lightly touches workpiece surface." },
      { step: 7, title: "Machine Material", desc: "Set depth of cut on Z dial, feed table in X/Y axes to cut slots or faces." }
    ],
    troubleshoot: [
      {
        id: "cutter_breakage",
        title: "Milling Cutter Tool Breakage",
        desc: "The multi-point milling end mill snaps or breaks during a cutting pass.",
        options: [
          { id: "opt_a", text: "Feed rate is too high, or spindle speed is too slow, causing overload.", isCorrect: true, reason: "Too high feed overloads the flutes with excess chip load, and low spindle speed prevents clean cutting." },
          { id: "opt_b", text: "Workpiece was too soft.", isCorrect: false, reason: "Soft materials are easy to cut; they clog cutter teeth but do not snap tools unless fully packed." },
          { id: "opt_c", text: "Coolant concentration was too high.", isCorrect: false, reason: "Coolant lubricates and cools; higher concentration does not snap tools." }
        ]
      }
    ],
    simulator: {
      mission: "Mill a Keyway Slot",
      goal: "Mill a 12mm wide by 6mm deep slot along the center of a steel block.",
      materialOptions: ["Mild Steel (Recommended)", "Aluminum (Soft)", "Brass (Free-cutting)"],
      toolOptions: ["4-Flute Carbide End Mill (Recommended)", "Slab Mill Cutter", "Face Mill Cutter"],
      paramRanges: {
        speed: { min: 400, max: 2000, opt: [1000, 1200] }, // Spindle RPM
        feed: { min: 50, max: 300, opt: [100, 150] },     // Feed (mm/min)
        doc: { min: 0.5, max: 4.0, opt: [1.0, 2.0] }     // Depth of cut (mm)
      }
    },
    experiments: {
      title: "Milling MRR & Surface Roughness Analysis",
      variables: [
        { id: "rpm", name: "Spindle Speed (RPM)", min: 400, max: 2500, step: 100, default: 1200 },
        { id: "tableFeed", name: "Table Feed (mm/min)", min: 50, max: 400, step: 10, default: 150 },
        { id: "doc", name: "Depth of Cut (mm)", min: 0.5, max: 4.0, step: 0.5, default: 1.5 }
      ],
      formulas: {
        mrr: (rpm, tableFeed, doc) => (tableFeed * doc * 12 * 0.1).toFixed(1),
        temp: (rpm, doc) => (90 + rpm * 0.08 + doc * 45).toFixed(0),
        roughness: (rpm, tableFeed) => (1.2 + tableFeed * 0.01 - rpm * 0.0003).toFixed(2)
      }
    },
    operations: [
      { id: "face_milling", name: "Face Milling", description: "Milling a flat surface perpendicular to spindle axis.", workArea: "Top Face", tool: "Face Mill", educationalExplanation: "A large diameter cutter sweeps over the top surface to mill it flat." },
      { id: "plain_milling", name: "Plain Milling", description: "Milling a flat surface parallel to spindle axis.", workArea: "Top Face", tool: "Slab Mill", educationalExplanation: "Horizontal cylindrical cutter shaves metal off parallel to table." },
      { id: "end_milling", name: "End Milling", description: "Machining slots, shoulders, and flat faces.", workArea: "Side Shoulder", tool: "End Mill", educationalExplanation: "Performs cutting both with its end tip and peripheral teeth." },
      { id: "slot_milling", name: "Slot Milling", description: "Milling straight slots or key seats.", workArea: "Center Channel", tool: "End Mill", educationalExplanation: "Cutter mills a slot directly through the center of the block." },
      { id: "keyway_milling", name: "Keyway Milling", description: "Milling keyway channels for mechanical keys.", workArea: "Keyway Channel", tool: "Keyway Cutter", educationalExplanation: "Creates precise slots on shafts to align keys for gear assemblies." },
      { id: "pocket_milling", name: "Pocket Milling", description: "Milling internal closed cavity pockets.", workArea: "Workpiece Center", tool: "End Mill", educationalExplanation: "Cutter plunges and clears out rectangular or circular pockets inside the block." },
      { id: "profile_milling", name: "Profile Milling", description: "Milling outer profiles of the workpiece.", workArea: "Outer Edges", tool: "End Mill", educationalExplanation: "Cutter follows the outer path to shape the final profile." },
      { id: "contour_milling", name: "Contour Milling", description: "Milling 3D curved surfaces.", workArea: "Curved Face", tool: "Ball-Nose End Mill", educationalExplanation: "A ball-nosed cutter traces 3D contours to form curved surface contours." },
      { id: "drilling", name: "Drilling", description: "Drilling vertical holes.", workArea: "Top Face", tool: "Twist Drill Bit", educationalExplanation: "Spindle feeds a vertical drill bit downwards to drill holes." },
      { id: "boring", name: "Boring", description: "Enlarging vertical holes.", workArea: "Internal Hole", tool: "Boring Head", educationalExplanation: "Boring bar in adjustable head runs vertically to expand hole sizes." },
      { id: "chamfering", name: "Chamfering", description: "Milling beveled edges.", workArea: "Edge Corner", tool: "Chamfer Cutter", educationalExplanation: "Milling cutter with angled blades bevels sharp outer edges." },
      { id: "t_slot_cutting", name: "T-Slot Cutting", description: "Milling T-slots.", workArea: "T-Slot Channel", tool: "T-Slot Cutter", educationalExplanation: "Specialized T-cutter machines undercut grooves for clamping bolts." }
    ]
  },
  casting: {
    id: "casting",
    name: "Metal Casting Furnace",
    color: "#52B788", // Green
    tagline: "Pouring Molten Metal",
    overview: "Casting is a manufacturing process in which a liquid material is usually poured into a mould, which contains a hollow cavity of the desired shape, and then allowed to solidify.",
    commonOperations: ["Mould Filling", "Molten Pouring", "Casting Shakeout", "Cleaning"],
    workpieceMovement: "Liquid metal flows into mould cavity, then solidifies and cools",
    toolMovement: "Crucible ladle is tilted to pour molten metal at controlled flow rate",
    output: "Solid castings, engine blocks, pump housings, complex brackets",
    accuracyClass: "Medium (±0.15 mm)",
    parts: [
      { id: "pattern", name: "Pattern", desc: "A wood or metal replica of the part used to form the sand cavity." },
      { id: "cope_flask", name: "Cope", desc: "The top half of the sand moulding box containing sprue and riser entry holes." },
      { id: "drag_flask", name: "Drag", desc: "The bottom half of the sand moulding box containing the main casting cavity." },
      { id: "sprue", name: "Sprue", desc: "The vertical channel through which molten metal enters the runner gating system." },
      { id: "runner", name: "Runner", desc: "Horizontal channels that distribute molten metal from sprue to gates." },
      { id: "riser", name: "Riser", desc: "A reservoir that fills with metal to feed shrinkage as the casting solidifies." },
      { id: "ladle", name: "Ladle", desc: "An insulated crucible bucket used to carry and pour molten metal." },
      { id: "casting_cavity", name: "Casting Cavity", desc: "The hollow impression in sand that molten metal fills to replicate the pattern." }
    ],
    steps: [
      { step: 1, title: "Prepare mould", desc: "Assemble sand flasks with pattern, pack sand, and remove pattern to leave cavity." },
      { step: 2, title: "Preheat Ladle", desc: "Preheat ladle crucible to prevent thermal shock when receiving metal." },
      { step: 3, title: "Melt Metal", desc: "Melt aluminum or iron in the furnace crucible at high temp." },
      { step: 4, title: "Safety Checklist", desc: "Wear heat-resistant visor, heavy thermal apron, and safety boots." },
      { step: 5, title: "Skim Dross", desc: "Use a skimmer rod to remove oxidized dross impurities from molten metal surface." },
      { step: 6, title: "Pour Metal", desc: "Pour molten aluminum at 700°C into the sprue basin at a steady, continuous flow rate." },
      { step: 7, title: "Cooling Down", desc: "Let the mould sit undisturbed as metal solidifies, monitoring cooling color changes." },
      { step: 8, title: "Shakeout Mould", desc: "Separate sand flasks and shake out sand to retrieve solid casting." }
    ],
    troubleshoot: [
      {
        id: "shrinkage_cavity",
        title: "Shrinkage Cavity Defect",
        desc: "The solid casting has a hollow depression or internal void at its thickest section.",
        options: [
          { id: "opt_a", text: "Riser size was too small, or metal was poured at too low temperature.", isCorrect: true, reason: "The riser acts as a feed reservoir; if it solidifies before the casting, it cannot feed shrinkage voids." },
          { id: "opt_b", text: "Moulding sand had too much moisture.", isCorrect: false, reason: "High moisture causes steam blowholes, not shrinkage depressions." },
          { id: "opt_c", text: "The sprue pin was placed too deep.", isCorrect: false, reason: "Sprue depth affects flow velocity, not solidification shrinkage feeds." }
        ]
      }
    ],
    simulator: {
      mission: "Cast a Gear wheel",
      goal: "Melt aluminum and pour into mould to cast a gear wheel casting, avoiding shrinkage voids.",
      materialOptions: ["A356 Casting Aluminum (Recommended)", "Cast Iron", "Brass (Cast)"],
      toolOptions: ["Graphite Crucible Ladle (Recommended)", "Steel Ladle", "Bottom-Pour Ladle"],
      paramRanges: {
        speed: { min: 650, max: 800, opt: [700, 720] }, // Pouring Temp (°C)
        feed: { min: 2, max: 8, opt: [3, 4] },         // Pouring speed (kg/s)
        doc: { min: 2, max: 10, opt: [4, 6] }          // Mould moisture (%)
      }
    },
    experiments: {
      title: "Metal Casting Solidification Analysis",
      variables: [
        { id: "pouringTemp", name: "Pouring Temperature (°C)", min: 600, max: 900, step: 25, default: 720 },
        { id: "pourRate", name: "Pouring Rate (kg/s)", min: 1.0, max: 6.0, step: 0.5, default: 3.0 },
        { id: "moisture", name: "Sand Moisture (%)", min: 1.5, max: 8.5, step: 0.5, default: 4.5 }
      ],
      formulas: {
        mrr: (pouringTemp, pourRate, moisture) => {
          const tFactor = Math.max(0, 100 - Math.abs(pouringTemp - 720) * 0.5);
          const rFactor = Math.max(0, 100 - Math.abs(pourRate - 3.5) * 20);
          const mFactor = Math.max(0, 100 - Math.abs(moisture - 4.5) * 15);
          return ((tFactor + rFactor + mFactor) / 3).toFixed(0);
        },
        temp: (pouringTemp) => pouringTemp,
        roughness: (moisture) => (1.5 + moisture * 0.8).toFixed(1)
      }
    },
    operations: [
      { id: "pattern_preparation", name: "Pattern Preparation", description: "Preparing wooden pattern block.", workArea: "Workbench", tool: "Hand tools", educationalExplanation: "Shapes pattern replica to establish sand cavity outline." },
      { id: "mould_preparation", name: "Mould Preparation", description: "Packing moulding sand in flasks.", workArea: "Moulding flasks", tool: "Rammer", educationalExplanation: "Packs sand around pattern to hold final casting shape." },
      { id: "core_cavity_setup", name: "Core Setup", description: "Inserting sand cores for hollow profiles.", workArea: "Mould cavity", tool: "Core print", educationalExplanation: "Inserts sand cores to form internal hollow cavities." },
      { id: "pouring", name: "Pouring", description: "Pouring molten metal into mould.", workArea: "Pouring basin", tool: "Ladle crucible", educationalExplanation: "Pours molten aluminum down the sprue channel." },
      { id: "filling", name: "Filling", description: "Molten metal filling gating runner system.", workArea: "Runner system", tool: "Crucible", educationalExplanation: "Metal flows through runners, gates, and fills cavity." },
      { id: "solidification", name: "Solidification", description: "Solidification of metal inside mould.", workArea: "Internal cavity", tool: "Mould flask", educationalExplanation: "Liquid metal cools, solidifies, and adopts pattern form." },
      { id: "cooling", name: "Cooling", description: "Letting cast cools to safe temperature.", workArea: "Flask box", tool: "Temperature check", educationalExplanation: "Casting cools to ambient temp, undergoing contraction." },
      { id: "casting_removal", name: "Casting Removal", description: "Shaking out sand mould.", workArea: "Shakeout grate", tool: "Vibrator hammer", educationalExplanation: "Mould is vibrated to separate sand from final metal casting." },
      { id: "cleaning", name: "Cleaning", description: "Cutting gates and clearing sand.", workArea: "Cleaning bench", tool: "Angle grinder", educationalExplanation: "Cuts off gating runner sprues and grinds rough edges." },
      { id: "inspection", name: "Inspection", description: "Checking final casting quality.", workArea: "Inspection bench", tool: "Caliper scanner", educationalExplanation: "Checks casting dimensions and screens for voids." }
    ]
  },
  moulding: {
    id: "moulding",
    name: "Sand Moulding Bay",
    color: "#30363A", // Dark Grey
    tagline: "Preparing Sand Cavity Moulds",
    overview: "Sand moulding is the foundation process for metal casting. Silica sand mixtures are packed around a pattern inside flasks.",
    commonOperations: ["Sand Compaction", "Pattern Draw", "Cope Venting", "Mould Assembly"],
    workpieceMovement: "None (mould remains stationary)",
    toolMovement: "Manual compactors and pattern drawing screws",
    output: "Assembled sand mould flasks with cavity sprue and riser gates",
    accuracyClass: "Medium (±0.25 mm)",
    parts: [
      { id: "pattern", name: "Pattern", desc: "A dimensional model of the part to form the sand cavity." },
      { id: "cope", name: "Cope Flask", desc: "The top half of the mould box enclosing the sprue and riser." },
      { id: "drag", name: "Drag Flask", desc: "The bottom half of the mould box holding the core cavity pattern." },
      { id: "flask", name: "Flask Box", desc: "The metal frames holding the packed moulding sand." },
      { id: "sand", name: "Moulding Sand", desc: "A mixture of silica sand, clay, and water packed to bind tightly." },
      { id: "cavity", name: "Mould Cavity", desc: "The hollow impression left in the sand drag after pattern extraction." },
      { id: "sprue", name: "Sprue Pin", desc: "A tapered wooden pin to form the pouring entry channel." },
      { id: "runner", name: "Runner Gate", desc: "The horizontal flow track connecting the sprue to the cavity." },
      { id: "riser", name: "Riser Gate", desc: "The backup feeder vent that fills with metal to feed shrinkage." }
    ],
    steps: [
      { step: 1, title: "Place Pattern", desc: "Position the wooden pattern face down on the drag moulding board." },
      { step: 2, title: "Add Sand", desc: "Cover the pattern with silica sand mixture until the drag flask is full." },
      { step: 3, title: "Compact Sand", desc: "Use a hand rammer to compact the sand tightly around the pattern." },
      { step: 4, title: "Prepare Cope", desc: "Flip the drag, assemble the cope flask, insert sprue/riser pins, and pack cope sand." },
      { step: 5, title: "Remove Pattern", desc: "Separate flasks and carefully lift the pattern out of the sand drag." },
      { step: 6, title: "Inspect Cavity", desc: "Check the cavity walls for crumbling sand or defects. Toggle cutaway mode." },
      { step: 7, title: "Assemble Mould", desc: "Clamp the cope and drag flasks back together ready for pouring metal." }
    ],
    troubleshoot: [
      {
        id: "cavity_collapse",
        title: "Poor Mould Cavity (Sand Collapse)",
        desc: "Upon pattern removal, the sand walls crumble and cave in, destroying the cavity shape.",
        options: [
          { id: "opt_a", text: "Sand moisture is too low, or sand was not compacted enough.", isCorrect: true, reason: "Without water moisture and strong compaction, clay binders do not active, leaving sand loose and crumbly." },
          { id: "opt_b", text: "The pattern was made of aluminum.", isCorrect: false, reason: "Pattern material type does not cause sand collapse; sand binding properties are key." },
          { id: "opt_c", text: "Venting holes were too small.", isCorrect: false, reason: "Small vents affect metal flow and steam release, not pattern drawing strength." }
        ]
      }
    ],
    simulator: {
      mission: "Prepare a Sand Mould",
      goal: "Prepare a sand mould drag and cope with a clean cavity for casting a pulley.",
      materialOptions: ["Silica Sand + Bentonite (Recommended)", "Dry Sand", "Loam Sand"],
      toolOptions: ["Hand Tamper (Recommended)", "Pneumatic Squeezer", "Jolt-Squeeze Machine"],
      paramRanges: {
        speed: { min: 2, max: 10, opt: [4, 6] },
        feed: { min: 10, max: 50, opt: [20, 30] },
        doc: { min: 1, max: 5, opt: [2, 3] }
      }
    },
    experiments: {
      title: "Mould Permeability optimization",
      variables: [
        { id: "moisture", name: "Moisture Content (%)", min: 1.5, max: 8.5, step: 0.5, default: 4.5 },
        { id: "rammingForces", name: "Ramming Force (kPa)", min: 10, max: 100, step: 5, default: 50 },
        { id: "ventCount", name: "Venting Holes Count", min: 2, max: 15, step: 1, default: 6 }
      ],
      formulas: {
        mrr: (moisture, rammingForces, ventCount) => {
          const mFactor = Math.max(0, 100 - Math.abs(moisture - 4.5) * 20);
          const rFactor = Math.max(0, 100 - Math.abs(rammingForces - 60) * 1.5);
          const vFactor = Math.min(100, ventCount * 12);
          return ((mFactor + rFactor + vFactor) / 3).toFixed(0);
        },
        temp: (rammingForces) => (50 + rammingForces * 1.2).toFixed(0),
        roughness: (moisture, rammingForces) => (2.5 - (rammingForces * 0.01) + (moisture * 0.2)).toFixed(2)
      }
    },
    operations: [
      { id: "pattern_placement", name: "Pattern Placement", description: "Placing wooden pattern block.", workArea: "Drag board center", tool: "Pattern block", educationalExplanation: "Places model face down to start mould base cavity." },
      { id: "drag_preparation", name: "Drag Preparation", description: "Preparing drag flask box.", workArea: "Drag box frame", tool: "Parting sand", educationalExplanation: "Applies parting dust to prevent sand from sticking to pattern." },
      { id: "sand_filling", name: "Sand Filling", description: "Filling flask with moulding sand.", workArea: "Drag box sand", tool: "Sand riddle", educationalExplanation: "Fills drag box with a clay-bonded sand mixture." },
      { id: "sand_compaction", name: "Sand Compaction", description: "Compacting sand with rammer.", workArea: "Sand surface", tool: "Hand rammer", educationalExplanation: "Packs sand tightly around pattern to form rigid cavity." },
      { id: "cope_preparation", name: "Cope Preparation", description: "Assembling cope flask on top.", workArea: "Cope box frame", tool: "Sprue pins", educationalExplanation: "Positions cope flask, sprue, and riser pin channels." },
      { id: "pattern_removal", name: "Pattern Removal", description: "Drawing out pattern from sand.", workArea: "Mould cavity", tool: "Draw spikes", educationalExplanation: "Carefully pulls out pattern to leave clean hollow cavity." },
      { id: "cavity_inspection", name: "Cavity Inspection", description: "Checking sand mould cavity.", workArea: "Mould cavity", tool: "Trowel spatula", educationalExplanation: "Clears loose sand and verifies cavity wall strength." },
      { id: "runner_sprue_setup", name: "Runner Setup", description: "Cutting runner gating channels.", workArea: "Gate junction", tool: "Gate cutter", educationalExplanation: "Cuts horizontal channel to direct liquid metal into cavity." },
      { id: "mould_assembly", name: "Mould Assembly", description: "Assembling flasks back together.", workArea: "Flask clamps", tool: "Alignment pins", educationalExplanation: "Clamps cope and drag boxes together securely." },
      { id: "mould_inspection", name: "Mould Inspection", description: "Checking gating alignment.", workArea: "Assembled flasks", tool: "Vent wire", educationalExplanation: "Creates small steam venting holes and checks gating access." }
    ]
  }
};
