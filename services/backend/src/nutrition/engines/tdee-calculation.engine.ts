import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TdeeCalculationInput {
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  bodyFatPercentage?: number;
}

export interface TdeeResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  activityMultiplier: number;
  method: 'mifflin_st_jeor' | 'harris_benedict' | 'katch_mcardle';
  macroTargets: {
    calories: number;
    protein: { grams: number; calories: number; percentage: number };
    carbohydrates: { grams: number; calories: number; percentage: number };
    fat: { grams: number; calories: number; percentage: number };
  };
}

export interface GoalAdjustment {
  goal: 'maintenance' | 'weight_loss' | 'weight_gain' | 'muscle_gain';
  targetWeightLossPerWeek?: number; // kg
  targetWeightGainPerWeek?: number; // kg
  adjustedCalories: number;
  adjustedMacros: TdeeResult['macroTargets'];
}

@Injectable()
export class TdeeCalculationEngine {
  private readonly logger = new Logger(TdeeCalculationEngine.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Calculate TDEE using multiple methods and return the most appropriate
   */
  calculateTdee(input: TdeeCalculationInput): TdeeResult {
    const { age, gender, height, weight, activityLevel, bodyFatPercentage } = input;

    // Use Katch-McArdle if body fat percentage is available, otherwise Mifflin-St Jeor
    let bmr: number;
    let method: TdeeResult['method'];

    if (bodyFatPercentage && bodyFatPercentage > 0) {
      bmr = this.calculateKatchMcArdleBmr(weight, bodyFatPercentage);
      method = 'katch_mcardle';
    } else {
      bmr = this.calculateMifflinStJeorBmr(age, gender, height, weight);
      method = 'mifflin_st_jeor';
    }

    const activityMultiplier = this.getActivityMultiplier(activityLevel);
    const tdee = bmr * activityMultiplier;

    // Calculate default macro targets (moderate approach)
    const macroTargets = this.calculateMacroTargets(tdee, 'maintenance');

    return {
      bmr,
      tdee,
      activityMultiplier,
      method,
      macroTargets,
    };
  }

  /**
   * Adjust calories and macros based on specific goals
   */
  adjustForGoal(tdeeResult: TdeeResult, goalConfig: {
    goal: GoalAdjustment['goal'];
    targetWeightLossPerWeek?: number;
    targetWeightGainPerWeek?: number;
    proteinTarget?: 'moderate' | 'high' | 'very_high';
    carbTarget?: 'low' | 'moderate' | 'high';
  }): GoalAdjustment {
    const { goal, targetWeightLossPerWeek, targetWeightGainPerWeek, proteinTarget, carbTarget } = goalConfig;
    
    let adjustedCalories = tdeeResult.tdee;
    let calorieAdjustment = 0;

    switch (goal) {
      case 'weight_loss':
        // 1 kg fat = ~7700 calories, safe loss is 0.5-1 kg per week
        const weeklyLoss = Math.min(targetWeightLossPerWeek || 0.5, 1.0);
        calorieAdjustment = -(weeklyLoss * 7700) / 7; // Daily deficit
        adjustedCalories = Math.max(tdeeResult.tdee + calorieAdjustment, tdeeResult.bmr * 1.2); // Don't go below 120% of BMR
        break;

      case 'weight_gain':
        // Safe gain is 0.25-0.5 kg per week
        const weeklyGain = Math.min(targetWeightGainPerWeek || 0.25, 0.5);
        calorieAdjustment = (weeklyGain * 7700) / 7; // Daily surplus
        adjustedCalories = tdeeResult.tdee + calorieAdjustment;
        break;

      case 'muscle_gain':
        // Slight surplus for muscle gain
        calorieAdjustment = 200; // Small surplus
        adjustedCalories = tdeeResult.tdee + calorieAdjustment;
        break;

      case 'maintenance':
      default:
        adjustedCalories = tdeeResult.tdee;
        break;
    }

    // Calculate adjusted macros based on goal
    const adjustedMacros = this.calculateMacroTargets(adjustedCalories, goal, proteinTarget, carbTarget);

    return {
      goal,
      targetWeightLossPerWeek,
      targetWeightGainPerWeek,
      adjustedCalories,
      adjustedMacros,
    };
  }

  /**
   * Calculate macros for Indian dietary preferences
   */
  calculateIndianMacroTargets(calories: number, dietType: 'vegetarian' | 'non_vegetarian' | 'vegan'): TdeeResult['macroTargets'] {
    let proteinPercentage: number;
    let carbPercentage: number;
    let fatPercentage: number;

    switch (dietType) {
      case 'vegan':
        // Higher carb, moderate protein from legumes/grains
        proteinPercentage = 15;
        carbPercentage = 60;
        fatPercentage = 25;
        break;

      case 'vegetarian':
        // Moderate protein from dairy/legumes
        proteinPercentage = 18;
        carbPercentage = 55;
        fatPercentage = 27;
        break;

      case 'non_vegetarian':
        // Higher protein availability
        proteinPercentage = 25;
        carbPercentage = 45;
        fatPercentage = 30;
        break;

      default:
        proteinPercentage = 20;
        carbPercentage = 50;
        fatPercentage = 30;
    }

    return this.calculateMacrosFromPercentages(calories, proteinPercentage, carbPercentage, fatPercentage);
  }

  /**
   * Validate if calorie target is safe and sustainable
   */
  validateCalorieTarget(bmr: number, targetCalories: number): {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const minimumCalories = bmr * 1.2; // Never go below 120% of BMR
    const maximumDeficit = bmr * 0.25; // Max 25% deficit from BMR

    if (targetCalories < minimumCalories) {
      warnings.push(`Target calories (${targetCalories}) is below safe minimum (${Math.round(minimumCalories)})`);
      recommendations.push('Increase calorie target to maintain metabolic health');
    }

    if (targetCalories < bmr) {
      warnings.push('Target calories is below BMR - this is not sustainable');
      recommendations.push('Increase physical activity instead of reducing calories further');
    }

    const deficitFromBmr = bmr - targetCalories;
    if (deficitFromBmr > maximumDeficit) {
      warnings.push('Calorie deficit is too aggressive');
      recommendations.push('Aim for more gradual weight loss to preserve muscle mass');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      recommendations,
    };
  }

  /**
   * Calculate weekly calorie cycling for better adherence
   */
  calculateWeeklyCycling(baseCalories: number, goal: 'weight_loss' | 'muscle_gain'): {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
    weeklyAverage: number;
  } {
    let highDays: number;
    let lowDays: number;

    if (goal === 'weight_loss') {
      // 5 low days, 2 moderate days
      highDays = baseCalories + 200;
      lowDays = baseCalories - 100;
    } else {
      // muscle_gain: 5 moderate days, 2 high days
      highDays = baseCalories + 300;
      lowDays = baseCalories;
    }

    const weekPlan = {
      monday: lowDays,    // Start week conservatively
      tuesday: lowDays,
      wednesday: highDays, // Mid-week boost
      thursday: lowDays,
      friday: lowDays,
      saturday: highDays,  // Weekend flexibility
      sunday: lowDays,
    };

    const weeklyAverage = Object.values(weekPlan).reduce((sum, cal) => sum + cal, 0) / 7;

    return {
      ...weekPlan,
      weeklyAverage,
    };
  }

  // Private helper methods

  private calculateMifflinStJeorBmr(age: number, gender: string, height: number, weight: number): number {
    const baseBmr = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? baseBmr + 5 : baseBmr - 161;
  }

  private calculateHarrisBenedictBmr(age: number, gender: string, height: number, weight: number): number {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  private calculateKatchMcArdleBmr(weight: number, bodyFatPercentage: number): number {
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
    return 370 + (21.6 * leanBodyMass);
  }

  private getActivityMultiplier(activityLevel: TdeeCalculationInput['activityLevel']): number {
    const multipliers = {
      sedentary: 1.2,           // Little to no exercise
      lightly_active: 1.375,    // Light exercise 1-3 days/week
      moderately_active: 1.55,  // Moderate exercise 3-5 days/week
      very_active: 1.725,       // Hard exercise 6-7 days/week
      extremely_active: 1.9,    // Very hard exercise, physical job
    };

    return multipliers[activityLevel] || 1.55;
  }

  private calculateMacroTargets(
    calories: number, 
    goal: string,
    proteinTarget: 'moderate' | 'high' | 'very_high' = 'moderate',
    carbTarget: 'low' | 'moderate' | 'high' = 'moderate'
  ): TdeeResult['macroTargets'] {
    let proteinPercentage: number;
    let carbPercentage: number;
    let fatPercentage: number;

    // Base percentages by goal
    switch (goal) {
      case 'weight_loss':
        proteinPercentage = 30; // Higher protein for satiety and muscle preservation
        carbPercentage = 35;
        fatPercentage = 35;
        break;

      case 'muscle_gain':
        proteinPercentage = 25; // High protein for muscle synthesis
        carbPercentage = 45;    // Adequate carbs for training
        fatPercentage = 30;
        break;

      case 'maintenance':
      default:
        proteinPercentage = 20;
        carbPercentage = 50;
        fatPercentage = 30;
        break;
    }

    // Adjust based on preferences
    if (proteinTarget === 'high') {
      proteinPercentage += 5;
      carbPercentage -= 3;
      fatPercentage -= 2;
    } else if (proteinTarget === 'very_high') {
      proteinPercentage += 10;
      carbPercentage -= 5;
      fatPercentage -= 5;
    }

    if (carbTarget === 'low') {
      carbPercentage -= 15;
      fatPercentage += 15;
    } else if (carbTarget === 'high') {
      carbPercentage += 10;
      fatPercentage -= 10;
    }

    return this.calculateMacrosFromPercentages(calories, proteinPercentage, carbPercentage, fatPercentage);
  }

  private calculateMacrosFromPercentages(
    calories: number,
    proteinPercentage: number,
    carbPercentage: number,
    fatPercentage: number
  ): TdeeResult['macroTargets'] {
    const proteinCalories = (calories * proteinPercentage) / 100;
    const carbCalories = (calories * carbPercentage) / 100;
    const fatCalories = (calories * fatPercentage) / 100;

    return {
      calories,
      protein: {
        grams: Math.round(proteinCalories / 4), // 4 cal/g
        calories: Math.round(proteinCalories),
        percentage: proteinPercentage,
      },
      carbohydrates: {
        grams: Math.round(carbCalories / 4), // 4 cal/g
        calories: Math.round(carbCalories),
        percentage: carbPercentage,
      },
      fat: {
        grams: Math.round(fatCalories / 9), // 9 cal/g
        calories: Math.round(fatCalories),
        percentage: fatPercentage,
      },
    };
  }
}