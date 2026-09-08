/**
 * Student Assessment & Performance Scoring Engine
 * Computes multi-criteria scores (Safety %, Setup %, Execution %, Accuracy %, Overall Score %)
 * Tracks attempts, errors, execution time, and updates Workshop XP.
 */

export class AssessmentEngine {
  /**
   * Calculates detailed assessment report
   */
  static calculateAssessment({
    machineId,
    operation,
    safetyReport,
    setupChecklist,
    simParams,
    elapsedSeconds = 12,
    errorCount = 0,
    attempts = 1
  }) {
    // 1. Safety Score (0 - 100%)
    let safetyScore = 100;
    if (!safetyReport.isCompliant) {
      safetyScore -= Math.min(60, safetyReport.issues.length * 30);
    }
    if (safetyReport.hasWarnings) {
      safetyScore -= Math.min(20, safetyReport.warnings.length * 10);
    }
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    // 2. Setup Score (0 - 100%)
    let setupScore = 0;
    if (setupChecklist.stockSecured) setupScore += 40;
    if (setupChecklist.toolClamped) setupScore += 40;
    if (setupChecklist.safetyGuardAligned) setupScore += 20;

    // 3. Execution Score (0 - 100%) based on errors and attempts
    let executionScore = 100;
    executionScore -= errorCount * 12;
    if (attempts > 1) {
      executionScore -= (attempts - 1) * 8;
    }
    if (elapsedSeconds > 45) {
      executionScore -= Math.min(15, Math.floor((elapsedSeconds - 45) / 5));
    }
    executionScore = Math.max(30, Math.min(100, executionScore));

    // 4. Accuracy Score (0 - 100%) based on parameter deviation from optimal
    let accuracyScore = 95;
    if (operation && operation.defaultParams && simParams) {
      let totalDeviation = 0;
      let paramCount = 0;

      if (operation.defaultParams.speed && simParams.speed) {
        const dev = Math.abs(simParams.speed - operation.defaultParams.speed) / operation.defaultParams.speed;
        totalDeviation += Math.min(1, dev);
        paramCount++;
      }
      if (operation.defaultParams.feed && simParams.feed) {
        const dev = Math.abs(simParams.feed - operation.defaultParams.feed) / operation.defaultParams.feed;
        totalDeviation += Math.min(1, dev);
        paramCount++;
      }
      if (operation.defaultParams.doc && simParams.doc) {
        const dev = Math.abs(simParams.doc - operation.defaultParams.doc) / operation.defaultParams.doc;
        totalDeviation += Math.min(1, dev);
        paramCount++;
      }

      if (paramCount > 0) {
        const avgDev = totalDeviation / paramCount;
        accuracyScore = Math.round(100 - avgDev * 35);
      }
    }
    accuracyScore = Math.max(50, Math.min(100, accuracyScore));

    // 5. Weighted Overall Score
    const overallScore = Math.round(
      safetyScore * 0.35 +
      setupScore * 0.25 +
      executionScore * 0.20 +
      accuracyScore * 0.20
    );

    // 6. XP Award Calculation
    let xpAwarded = Math.round(150 + (overallScore / 100) * 150);
    if (overallScore >= 90) {
      xpAwarded += 50; // Bonus for distinction
    }

    // 7. Badge & Level Determination
    let badgeEarned = null;
    if (overallScore >= 85) {
      badgeEarned = `${machineId.toUpperCase()} Specialist`;
    }

    return {
      overallScore,
      safetyScore,
      setupScore,
      executionScore,
      accuracyScore,
      xpAwarded,
      badgeEarned,
      elapsedSeconds,
      attempts,
      errorCount,
      summary: overallScore >= 85 
        ? "Exceptional machining execution with high precision and safety compliance."
        : overallScore >= 70
        ? "Good performance. Review optimal feed and safety parameters to maximize score."
        : "Operational defects or safety oversights encountered. Review procedure checklist."
    };
  }
}
