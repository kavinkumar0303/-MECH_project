/**
 * Educational Safety Validation Engine
 * Evaluates workpiece clamping, tool selection, PPE gear compliance, and parameter safety bounds.
 */

export class SafetyEngine {
  /**
   * Validates safety for a specific machine and operation
   */
  static validateSafety({
    machineId,
    operation,
    selectedPartId,
    selectedTool,
    safetyItems = {},
    setupChecklist = {},
    simParams = {}
  }) {
    const issues = [];
    const warnings = [];

    // 1. Workpiece Component Selection Check
    if (!selectedPartId) {
      issues.push({
        code: "NO_PART_SELECTED",
        title: "Workpiece Not Selected",
        message: "Select the workpiece in the 3D workplane before starting the operation."
      });
    }

    // 2. Clamping / Setup Check
    if (!setupChecklist.stockSecured) {
      issues.push({
        code: "STOCK_UNCLAMPED",
        title: "Workpiece Not Clamped",
        message: "Secure and clamp the raw stock firmly before starting the machine."
      });
    }

    if (!setupChecklist.toolClamped) {
      issues.push({
        code: "TOOL_UNCLAMPED",
        title: "Tool Not Clamped",
        message: "Clamp the cutting tool bit / torch securely in the tool post."
      });
    }

    // 3. Tool Type Validation
    if (operation && operation.requiredTool && selectedTool) {
      const toolMatch = selectedTool.toLowerCase().includes(operation.requiredTool.toLowerCase()) ||
        operation.requiredTool.toLowerCase().includes(selectedTool.toLowerCase()) ||
        (machineId === 'lathe' && selectedTool.includes('Tool')) ||
        (machineId === 'welding' && (selectedTool.includes('Electrode') || selectedTool.includes('Torch'))) ||
        (machineId === 'milling' && (selectedTool.includes('Mill') || selectedTool.includes('Cutter'))) ||
        (machineId === 'shaper' && selectedTool.includes('Tool')) ||
        (machineId === 'planer' && selectedTool.includes('Tool')) ||
        (machineId === 'casting' && selectedTool.includes('Ladle')) ||
        (machineId === 'moulding' && (selectedTool.includes('Tamper') || selectedTool.includes('Rammer')));

      if (!toolMatch) {
        warnings.push({
          code: "TOOL_MISMATCH",
          title: "Incorrect Tool",
          message: `Operation requires [${operation.requiredTool}], but [${selectedTool}] is currently equipped.`
        });
      }
    }

    // 4. PPE Compliance Validation by Machine Category
    if (machineId === 'lathe' || machineId === 'milling' || machineId === 'shaper' || machineId === 'planer') {
      // Rotating / Reciprocating Machinery: NO GLOVES ALLOWED (entanglement risk)
      if (safetyItems.gloves) {
        issues.push({
          code: "GLOVES_HAZARD",
          title: "Critical Entanglement Hazard: Gloves Detected",
          message: "NEVER wear gloves while operating rotating machinery (lathe, milling spindle). Rotating parts can snag gloves and pull hands into the cutting zone."
        });
      }
      if (!safetyItems.goggles) {
        issues.push({
          code: "MISSING_GOGGLES",
          title: "Eye Protection Required",
          message: "Safety goggles must be worn to protect eyes from flying metal chips and coolant spray."
        });
      }
      if (!safetyItems.clothing || !safetyItems.shoes) {
        warnings.push({
          code: "IMPROPER_ATTIRE",
          title: "Workshop Attire Recommended",
          message: "Wear snug-fitting workshop clothing and steel-toed safety boots."
        });
      }
    } else if (machineId === 'welding') {
      // Arc Welding: Full Shield and Heavy Leather Gloves are MANDATORY
      if (!safetyItems.shield) {
        issues.push({
          code: "MISSING_SHIELD",
          title: "Arc Eye Radiation Hazard",
          message: "Auto-darkening welding helmet / face shield is strictly required to prevent optical UV/IR flash burn."
        });
      }
      if (!safetyItems.gloves) {
        issues.push({
          code: "MISSING_WELD_GLOVES",
          title: "Thermal Burn Hazard",
          message: "Heavy heat-resistant leather welding gloves must be worn to protect hands from intense arc heat and spatter."
        });
      }
      if (!safetyItems.clothing || !safetyItems.shoes) {
        issues.push({
          code: "MISSING_PPE",
          title: "Protective Gear Required",
          message: "Heavy protective clothing and safety footwear must be equipped."
        });
      }
    } else if (machineId === 'casting' || machineId === 'moulding') {
      // Foundry / Thermal: Visor/Goggles, Thermal Gloves, Boots required
      if (!safetyItems.gloves) {
        issues.push({
          code: "MISSING_THERMAL_GLOVES",
          title: "Foundry Burn Hazard",
          message: "Thermal insulated gloves must be worn when handling hot crucibles, flasks, and sand rammers."
        });
      }
      if (!safetyItems.goggles) {
        issues.push({
          code: "MISSING_GOGGLES",
          title: "Eye Protection Required",
          message: "Safety goggles or full face shield are required to guard against molten splashes and airborne sand particles."
        });
      }
    }

    // 5. Operating Parameter Bounds Check
    if (operation && operation.paramBounds && simParams) {
      if (simParams.speed && operation.paramBounds.speed) {
        const { min, max, unit } = operation.paramBounds.speed;
        if (simParams.speed > max * 1.25) {
          warnings.push({
            code: "SPEED_EXCESSIVE",
            title: "Excessive Operating Speed",
            message: `Speed (${simParams.speed} ${unit}) exceeds recommended upper safety limit (${max} ${unit}). Risk of tool chatter or plate burn.`
          });
        }
      }
      if (simParams.doc && operation.paramBounds.doc) {
        const { max, unit } = operation.paramBounds.doc;
        if (simParams.doc > max * 1.3) {
          warnings.push({
            code: "DOC_EXCESSIVE",
            title: "Depth of Cut Too Deep",
            message: `Depth (${simParams.doc} ${unit}) exceeds safe limits. Risk of tool breakage or stall.`
          });
        }
      }
    }

    const isCompliant = issues.length === 0;

    return {
      isCompliant,
      hasWarnings: warnings.length > 0,
      issues,
      warnings,
      statusMessage: isCompliant 
        ? "✓ Safety Check Passed: Machine and operator are in full safety compliance."
        : issues[0].message
    };
  }
}
