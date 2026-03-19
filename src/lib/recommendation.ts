/**
 * AI Recommendation System
 * ระบบแนะนำแผนประกันที่เหมาะสมกับลูกค้า
 */

export interface CustomerProfile {
  age: number;
  gender: 'male' | 'female';
  budget: number;
  insuranceType: 'health' | 'life' | 'car';
  preferences?: {
    prioritizeCoverage?: boolean;  // ให้ความสำคัญกับความคุ้มครอง
    prioritizePrice?: boolean;     // ให้ความสำคัญกับราคา
    hasPreExisting?: boolean;      // มีโรคประจำตัว
    hasFamily?: boolean;           // มีครอบครัว
  };
}

export interface Plan {
  id: string;
  name: string;
  company?: { name: string };
  type: string;
  premium_yearly: number;
  sum_insured: number;
  coverage?: Record<string, any>;
  benefits?: string[];
  min_age?: number;
  max_age?: number;
  waiting_period_days?: number;
}

export interface RecommendedPlan extends Plan {
  score: number;
  matchPercentage: number;
  reasons: string[];
}

/**
 * คำนวณคะแนนความเหมาะสมของแผนประกัน
 */
export function calculatePlanScore(
  plan: Plan,
  profile: CustomerProfile
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Age compatibility (0-20 points)
  const ageMatch = checkAgeCompatibility(plan, profile.age);
  score += ageMatch.score;
  if (ageMatch.reason) reasons.push(ageMatch.reason);

  // 2. Budget fit (0-30 points)
  const budgetMatch = checkBudgetFit(plan, profile.budget);
  score += budgetMatch.score;
  if (budgetMatch.reason) reasons.push(budgetMatch.reason);

  // 3. Coverage value (0-25 points)
  const coverageScore = calculateCoverageScore(plan, profile);
  score += coverageScore.score;
  if (coverageScore.reason) reasons.push(coverageScore.reason);

  // 4. Value for money (0-15 points)
  const valueScore = calculateValueScore(plan);
  score += valueScore.score;
  if (valueScore.reason) reasons.push(valueScore.reason);

  // 5. Preference matching (0-10 points)
  const prefScore = matchPreferences(plan, profile);
  score += prefScore.score;
  reasons.push(...prefScore.reasons);

  return { score, reasons };
}

function checkAgeCompatibility(
  plan: Plan,
  age: number
): { score: number; reason?: string } {
  const minAge = plan.min_age || 0;
  const maxAge = plan.max_age || 99;

  if (age < minAge || age > maxAge) {
    return { score: 0 };
  }

  // Perfect age range (in the middle)
  const ageRange = maxAge - minAge;
  const agePosition = age - minAge;
  const middleDistance = Math.abs(agePosition - ageRange / 2);
  const ageScore = Math.max(0, 20 - (middleDistance / ageRange) * 10);

  return {
    score: ageScore,
    reason: age >= 45 ? 'เหมาะสำหรับวัยกลางคน' :
            age <= 30 ? 'เหมาะสำหรับคนรุ่นใหม่' : undefined,
  };
}

function checkBudgetFit(
  plan: Plan,
  budget: number
): { score: number; reason?: string } {
  const premium = plan.premium_yearly || 0;

  if (premium > budget) {
    // Over budget - reduce score proportionally
    const overBudgetRatio = (premium - budget) / budget;
    const score = Math.max(0, 15 - overBudgetRatio * 30);
    return {
      score,
      reason: overBudgetRatio < 0.2 ? 'เกินงบเล็กน้อย' : undefined,
    };
  }

  // Within budget - higher score for better fit
  const budgetUtilization = premium / budget;

  if (budgetUtilization >= 0.7 && budgetUtilization <= 1.0) {
    return {
      score: 30,
      reason: 'ราคาเหมาะสมกับงบประมาณ',
    };
  } else if (budgetUtilization >= 0.5) {
    return {
      score: 25,
      reason: 'ราคาประหยัดกว่างบที่ตั้งไว้',
    };
  } else {
    return {
      score: 20,
      reason: 'ราคาถูกกว่างบมาก อาจพิจารณาแผนที่คุ้มครองมากขึ้น',
    };
  }
}

function calculateCoverageScore(
  plan: Plan,
  profile: CustomerProfile
): { score: number; reason?: string } {
  const sumInsured = plan.sum_insured || 0;

  // For health insurance, recommend coverage based on age
  if (profile.insuranceType === 'health') {
    const recommendedCoverage = profile.age >= 50 ? 1000000 : 500000;
    const coverageRatio = sumInsured / recommendedCoverage;

    if (coverageRatio >= 1) {
      return {
        score: 25,
        reason: 'ความคุ้มครองเพียงพอสำหรับค่ารักษาพยาบาล',
      };
    } else if (coverageRatio >= 0.7) {
      return {
        score: 20,
        reason: 'ความคุ้มครองระดับมาตรฐาน',
      };
    }
    return { score: 15 };
  }

  // For life insurance, recommend coverage based on income
  if (profile.insuranceType === 'life') {
    if (sumInsured >= 1000000) {
      return {
        score: 25,
        reason: 'ทุนประกันสูง เหมาะสำหรับผู้มีภาระครอบครัว',
      };
    }
    return { score: 20 };
  }

  return { score: 20 };
}

function calculateValueScore(
  plan: Plan
): { score: number; reason?: string } {
  const premium = plan.premium_yearly || 1;
  const sumInsured = plan.sum_insured || 0;

  // Value ratio: coverage per baht spent
  const valueRatio = sumInsured / premium;

  if (valueRatio >= 100) {
    return {
      score: 15,
      reason: 'คุ้มค่ามาก - ความคุ้มครองสูงเมื่อเทียบกับเบี้ย',
    };
  } else if (valueRatio >= 50) {
    return {
      score: 12,
      reason: 'คุ้มค่า - สมราคา',
    };
  } else if (valueRatio >= 20) {
    return { score: 8 };
  }

  return { score: 5 };
}

function matchPreferences(
  plan: Plan,
  profile: CustomerProfile
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const prefs = profile.preferences || {};

  // Short waiting period is good
  if (plan.waiting_period_days && plan.waiting_period_days <= 30) {
    score += 3;
    reasons.push('ระยะรอคอยสั้น');
  }

  // Many benefits
  if (plan.benefits && plan.benefits.length >= 5) {
    score += 4;
    reasons.push('มีสิทธิประโยชน์หลากหลาย');
  }

  // Price priority
  if (prefs.prioritizePrice && plan.premium_yearly) {
    const isPriceFriendly = plan.premium_yearly <= profile.budget * 0.8;
    if (isPriceFriendly) {
      score += 3;
      reasons.push('ราคาประหยัด');
    }
  }

  return { score, reasons };
}

/**
 * แนะนำแผนประกันที่เหมาะสม
 */
export function getRecommendations(
  plans: Plan[],
  profile: CustomerProfile,
  limit: number = 3
): RecommendedPlan[] {
  // Filter plans by type
  const filteredPlans = plans.filter(
    (plan) => plan.type === profile.insuranceType
  );

  // Calculate scores for each plan
  const scoredPlans: RecommendedPlan[] = filteredPlans.map((plan) => {
    const { score, reasons } = calculatePlanScore(plan, profile);
    return {
      ...plan,
      score,
      matchPercentage: Math.min(100, Math.round(score)),
      reasons,
    };
  });

  // Sort by score descending
  scoredPlans.sort((a, b) => b.score - a.score);

  // Return top recommendations
  return scoredPlans.slice(0, limit);
}

/**
 * สร้างคำอธิบายการแนะนำ
 */
export function generateRecommendationSummary(
  plan: RecommendedPlan,
  profile: CustomerProfile
): string {
  const lines = [`แผน ${plan.name} ได้คะแนนความเหมาะสม ${plan.matchPercentage}%`];

  if (plan.reasons.length > 0) {
    lines.push('เหตุผลที่แนะนำ:');
    plan.reasons.forEach((reason) => {
      lines.push(`• ${reason}`);
    });
  }

  return lines.join('\n');
}
