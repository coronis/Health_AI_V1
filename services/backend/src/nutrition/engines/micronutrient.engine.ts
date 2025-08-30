import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NutrientRequirement {
  nutrient: string;
  amount: number;
  unit: string;
  dailyValue: number;
  tolerable_upper_limit?: number;
  deficiency_threshold?: number;
}

export interface MicronutrientProfile {
  age: number;
  gender: 'male' | 'female';
  lifecycle?: 'pregnancy' | 'lactation' | 'elderly';
  activityLevel?: 'low' | 'moderate' | 'high';
  healthConditions?: string[];
}

export interface MicronutrientRequirements {
  vitamins: {
    vitamin_a: NutrientRequirement;
    vitamin_d: NutrientRequirement;
    vitamin_e: NutrientRequirement;
    vitamin_k: NutrientRequirement;
    vitamin_c: NutrientRequirement;
    thiamine: NutrientRequirement;
    riboflavin: NutrientRequirement;
    niacin: NutrientRequirement;
    vitamin_b6: NutrientRequirement;
    folate: NutrientRequirement;
    vitamin_b12: NutrientRequirement;
    biotin: NutrientRequirement;
    pantothenic_acid: NutrientRequirement;
  };
  minerals: {
    calcium: NutrientRequirement;
    phosphorus: NutrientRequirement;
    magnesium: NutrientRequirement;
    iron: NutrientRequirement;
    zinc: NutrientRequirement;
    iodine: NutrientRequirement;
    selenium: NutrientRequirement;
    copper: NutrientRequirement;
    manganese: NutrientRequirement;
    chromium: NutrientRequirement;
    sodium: NutrientRequirement;
    potassium: NutrientRequirement;
  };
}

export interface NutrientIntakeAnalysis {
  nutrient: string;
  intake: number;
  requirement: number;
  percentage_of_requirement: number;
  status: 'deficient' | 'adequate' | 'excessive' | 'toxic';
  recommendations: string[];
}

export interface MicronutrientAnalysis {
  total_nutrients_analyzed: number;
  adequate_nutrients: number;
  deficient_nutrients: number;
  excessive_nutrients: number;
  vitamins: Record<string, NutrientIntakeAnalysis>;
  minerals: Record<string, NutrientIntakeAnalysis>;
  overall_score: number; // 0-100
  priority_recommendations: string[];
}

@Injectable()
export class MicronutrientEngine {
  private readonly logger = new Logger(MicronutrientEngine.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Calculate micronutrient requirements based on user profile
   */
  calculateRequirements(profile: MicronutrientProfile): MicronutrientRequirements {
    const { age, gender, lifecycle, healthConditions } = profile;

    // Base requirements (Indian Council of Medical Research guidelines + international standards)
    let requirements = this.getBaseRequirements(age, gender);

    // Adjust for lifecycle
    if (lifecycle === 'pregnancy') {
      requirements = this.adjustForPregnancy(requirements);
    } else if (lifecycle === 'lactation') {
      requirements = this.adjustForLactation(requirements);
    } else if (lifecycle === 'elderly') {
      requirements = this.adjustForElderly(requirements);
    }

    // Adjust for health conditions
    if (healthConditions && healthConditions.length > 0) {
      requirements = this.adjustForHealthConditions(requirements, healthConditions);
    }

    return requirements;
  }

  /**
   * Analyze nutrient intake against requirements
   */
  analyzeIntake(
    nutrientIntake: Record<string, number>,
    requirements: MicronutrientRequirements
  ): MicronutrientAnalysis {
    const vitaminAnalysis: Record<string, NutrientIntakeAnalysis> = {};
    const mineralAnalysis: Record<string, NutrientIntakeAnalysis> = {};

    let adequateCount = 0;
    let deficientCount = 0;
    let excessiveCount = 0;

    // Analyze vitamins
    Object.entries(requirements.vitamins).forEach(([vitamin, requirement]) => {
      const intake = nutrientIntake[vitamin] || 0;
      const analysis = this.analyzeNutrientIntake(intake, requirement);
      vitaminAnalysis[vitamin] = analysis;

      if (analysis.status === 'adequate') adequateCount++;
      else if (analysis.status === 'deficient') deficientCount++;
      else if (analysis.status === 'excessive' || analysis.status === 'toxic') excessiveCount++;
    });

    // Analyze minerals
    Object.entries(requirements.minerals).forEach(([mineral, requirement]) => {
      const intake = nutrientIntake[mineral] || 0;
      const analysis = this.analyzeNutrientIntake(intake, requirement);
      mineralAnalysis[mineral] = analysis;

      if (analysis.status === 'adequate') adequateCount++;
      else if (analysis.status === 'deficient') deficientCount++;
      else if (analysis.status === 'excessive' || analysis.status === 'toxic') excessiveCount++;
    });

    const totalNutrients = Object.keys(requirements.vitamins).length + Object.keys(requirements.minerals).length;
    const overallScore = Math.round((adequateCount / totalNutrients) * 100);

    // Generate priority recommendations
    const priorityRecommendations = this.generatePriorityRecommendations(
      vitaminAnalysis,
      mineralAnalysis
    );

    return {
      total_nutrients_analyzed: totalNutrients,
      adequate_nutrients: adequateCount,
      deficient_nutrients: deficientCount,
      excessive_nutrients: excessiveCount,
      vitamins: vitaminAnalysis,
      minerals: mineralAnalysis,
      overall_score: overallScore,
      priority_recommendations: priorityRecommendations,
    };
  }

  /**
   * Get food sources rich in specific nutrients
   */
  getNutrientFoodSources(nutrient: string): {
    indian_sources: Array<{ food: string; content: number; unit: string; serving: string }>;
    global_sources: Array<{ food: string; content: number; unit: string; serving: string }>;
  } {
    const foodSources = {
      // Vitamins
      vitamin_a: {
        indian_sources: [
          { food: 'Carrot (गाजर)', content: 16706, unit: 'IU', serving: '1 large' },
          { food: 'Sweet Potato (शकरकंद)', content: 21909, unit: 'IU', serving: '1 medium' },
          { food: 'Spinach (पालक)', content: 2813, unit: 'IU', serving: '1 cup cooked' },
          { food: 'Papaya (पपीता)', content: 1532, unit: 'IU', serving: '1 cup cubed' },
        ],
        global_sources: [
          { food: 'Beef Liver', content: 53444, unit: 'IU', serving: '100g' },
          { food: 'Cod Liver Oil', content: 4080, unit: 'IU', serving: '1 tsp' },
        ],
      },
      vitamin_d: {
        indian_sources: [
          { food: 'Paneer (पनीर)', content: 0.1, unit: 'mcg', serving: '100g' },
          { food: 'Egg Yolk (अंडे की जर्दी)', content: 2.0, unit: 'mcg', serving: '2 yolks' },
          { food: 'Mushrooms (मशरूम)', content: 0.2, unit: 'mcg', serving: '1 cup' },
        ],
        global_sources: [
          { food: 'Salmon', content: 11.0, unit: 'mcg', serving: '100g' },
          { food: 'Fortified Milk', content: 2.5, unit: 'mcg', serving: '1 cup' },
        ],
      },
      iron: {
        indian_sources: [
          { food: 'Lentils (मसूर दाल)', content: 6.6, unit: 'mg', serving: '1 cup cooked' },
          { food: 'Chickpeas (चना)', content: 4.7, unit: 'mg', serving: '1 cup cooked' },
          { food: 'Jaggery (गुड़)', content: 2.8, unit: 'mg', serving: '2 tbsp' },
          { food: 'Sesame Seeds (तिल)', content: 4.1, unit: 'mg', serving: '2 tbsp' },
        ],
        global_sources: [
          { food: 'Beef', content: 3.2, unit: 'mg', serving: '100g' },
          { food: 'Tofu', content: 5.4, unit: 'mg', serving: '1/2 cup' },
        ],
      },
      calcium: {
        indian_sources: [
          { food: 'Milk (दूध)', content: 276, unit: 'mg', serving: '1 cup' },
          { food: 'Yogurt (दही)', content: 245, unit: 'mg', serving: '1 cup' },
          { food: 'Sesame Seeds (तिल)', content: 88, unit: 'mg', serving: '1 tbsp' },
          { food: 'Ragi (Finger Millet)', content: 344, unit: 'mg', serving: '100g' },
        ],
        global_sources: [
          { food: 'Cheese', content: 200, unit: 'mg', serving: '30g' },
          { food: 'Sardines', content: 325, unit: 'mg', serving: '100g' },
        ],
      },
      // Add more nutrients as needed
    };

    return foodSources[nutrient] || { indian_sources: [], global_sources: [] };
  }

  /**
   * Calculate nutrient density score for foods
   */
  calculateNutrientDensity(foodNutrients: Record<string, number>, calories: number): {
    score: number;
    high_density_nutrients: string[];
    low_density_nutrients: string[];
  } {
    let totalDensityScore = 0;
    let nutrientCount = 0;
    const highDensityNutrients: string[] = [];
    const lowDensityNutrients: string[] = [];

    Object.entries(foodNutrients).forEach(([nutrient, amount]) => {
      if (amount > 0) {
        const densityScore = (amount / calories) * 100; // per 100 calories
        totalDensityScore += densityScore;
        nutrientCount++;

        // Classify based on density thresholds
        if (densityScore > 10) {
          highDensityNutrients.push(nutrient);
        } else if (densityScore < 2) {
          lowDensityNutrients.push(nutrient);
        }
      }
    });

    const averageScore = nutrientCount > 0 ? totalDensityScore / nutrientCount : 0;

    return {
      score: Math.round(averageScore),
      high_density_nutrients: highDensityNutrients,
      low_density_nutrients: lowDensityNutrients,
    };
  }

  /**
   * Generate meal plan to address deficiencies
   */
  generateDeficiencyMealPlan(deficiencies: string[]): {
    foods_to_include: Array<{ food: string; nutrients: string[]; serving: string }>;
    meal_suggestions: Array<{ meal: string; foods: string[]; target_nutrients: string[] }>;
    supplement_recommendations: Array<{ nutrient: string; dosage: string; notes: string }>;
  } {
    const foodsToInclude: Array<{ food: string; nutrients: string[]; serving: string }> = [];
    const mealSuggestions: Array<{ meal: string; foods: string[]; target_nutrients: string[] }> = [];
    const supplementRecommendations: Array<{ nutrient: string; dosage: string; notes: string }> = [];

    deficiencies.forEach(nutrient => {
      const sources = this.getNutrientFoodSources(nutrient);
      
      // Add top Indian sources
      sources.indian_sources.slice(0, 2).forEach(source => {
        foodsToInclude.push({
          food: source.food,
          nutrients: [nutrient],
          serving: source.serving,
        });
      });

      // Generate supplement recommendation if needed
      if (this.shouldRecommendSupplement(nutrient)) {
        supplementRecommendations.push({
          nutrient,
          dosage: this.getSupplementDosage(nutrient),
          notes: this.getSupplementNotes(nutrient),
        });
      }
    });

    // Generate meal suggestions
    mealSuggestions.push(
      {
        meal: 'Breakfast',
        foods: ['Ragi Porridge', 'Mixed Seeds', 'Seasonal Fruits'],
        target_nutrients: deficiencies.filter(n => ['calcium', 'iron', 'vitamin_c'].includes(n)),
      },
      {
        meal: 'Lunch',
        foods: ['Dal', 'Green Leafy Vegetables', 'Whole Grain Roti'],
        target_nutrients: deficiencies.filter(n => ['iron', 'folate', 'vitamin_a'].includes(n)),
      },
      {
        meal: 'Dinner',
        foods: ['Paneer/Tofu', 'Mixed Vegetables', 'Brown Rice'],
        target_nutrients: deficiencies.filter(n => ['calcium', 'vitamin_d', 'magnesium'].includes(n)),
      }
    );

    return {
      foods_to_include: foodsToInclude,
      meal_suggestions: mealSuggestions,
      supplement_recommendations: supplementRecommendations,
    };
  }

  // Private helper methods

  private getBaseRequirements(age: number, gender: string): MicronutrientRequirements {
    // Based on ICMR-NIN 2020 guidelines for Indians
    const isAdult = age >= 18;
    const isMale = gender === 'male';

    return {
      vitamins: {
        vitamin_a: { nutrient: 'vitamin_a', amount: isAdult ? (isMale ? 600 : 600) : 400, unit: 'mcg', dailyValue: 900 },
        vitamin_d: { nutrient: 'vitamin_d', amount: 15, unit: 'mcg', dailyValue: 20 },
        vitamin_e: { nutrient: 'vitamin_e', amount: isAdult ? 8 : 6, unit: 'mg', dailyValue: 15 },
        vitamin_k: { nutrient: 'vitamin_k', amount: isAdult ? (isMale ? 55 : 55) : 30, unit: 'mcg', dailyValue: 120 },
        vitamin_c: { nutrient: 'vitamin_c', amount: 40, unit: 'mg', dailyValue: 90 },
        thiamine: { nutrient: 'thiamine', amount: isAdult ? (isMale ? 1.2 : 1.0) : 0.9, unit: 'mg', dailyValue: 1.2 },
        riboflavin: { nutrient: 'riboflavin', amount: isAdult ? (isMale ? 1.4 : 1.1) : 1.0, unit: 'mg', dailyValue: 1.3 },
        niacin: { nutrient: 'niacin', amount: isAdult ? (isMale ? 16 : 12) : 12, unit: 'mg', dailyValue: 16 },
        vitamin_b6: { nutrient: 'vitamin_b6', amount: isAdult ? 1.3 : 1.0, unit: 'mg', dailyValue: 1.7 },
        folate: { nutrient: 'folate', amount: isAdult ? 200 : 150, unit: 'mcg', dailyValue: 400 },
        vitamin_b12: { nutrient: 'vitamin_b12', amount: 1.0, unit: 'mcg', dailyValue: 2.4 },
        biotin: { nutrient: 'biotin', amount: 30, unit: 'mcg', dailyValue: 30 },
        pantothenic_acid: { nutrient: 'pantothenic_acid', amount: 5, unit: 'mg', dailyValue: 5 },
      },
      minerals: {
        calcium: { nutrient: 'calcium', amount: isAdult ? 600 : 600, unit: 'mg', dailyValue: 1000 },
        phosphorus: { nutrient: 'phosphorus', amount: isAdult ? 600 : 600, unit: 'mg', dailyValue: 700 },
        magnesium: { nutrient: 'magnesium', amount: isAdult ? (isMale ? 340 : 310) : 160, unit: 'mg', dailyValue: 420 },
        iron: { nutrient: 'iron', amount: isAdult ? (isMale ? 17 : 21) : 10, unit: 'mg', dailyValue: 18 },
        zinc: { nutrient: 'zinc', amount: isAdult ? (isMale ? 12 : 10) : 7, unit: 'mg', dailyValue: 11 },
        iodine: { nutrient: 'iodine', amount: 150, unit: 'mcg', dailyValue: 150 },
        selenium: { nutrient: 'selenium', amount: isAdult ? 40 : 25, unit: 'mcg', dailyValue: 55 },
        copper: { nutrient: 'copper', amount: isAdult ? 1.05 : 0.7, unit: 'mg', dailyValue: 0.9 },
        manganese: { nutrient: 'manganese', amount: isAdult ? 2.5 : 1.5, unit: 'mg', dailyValue: 2.3 },
        chromium: { nutrient: 'chromium', amount: isAdult ? 33 : 15, unit: 'mcg', dailyValue: 35 },
        sodium: { nutrient: 'sodium', amount: 2300, unit: 'mg', dailyValue: 2300, tolerable_upper_limit: 2300 },
        potassium: { nutrient: 'potassium', amount: 3500, unit: 'mg', dailyValue: 4700 },
      },
    };
  }

  private adjustForPregnancy(requirements: MicronutrientRequirements): MicronutrientRequirements {
    // Increase key nutrients for pregnancy
    requirements.vitamins.folate.amount += 200; // Critical for neural tube development
    requirements.vitamins.vitamin_b12.amount += 0.2;
    requirements.minerals.iron.amount += 10; // Increased blood volume
    requirements.minerals.calcium.amount += 200;
    
    return requirements;
  }

  private adjustForLactation(requirements: MicronutrientRequirements): MicronutrientRequirements {
    // Increase nutrients for breastfeeding
    requirements.vitamins.vitamin_a.amount += 300;
    requirements.vitamins.vitamin_c.amount += 25;
    requirements.minerals.calcium.amount += 250;
    requirements.minerals.zinc.amount += 3;
    
    return requirements;
  }

  private adjustForElderly(requirements: MicronutrientRequirements): MicronutrientRequirements {
    // Adjust for age-related changes
    requirements.vitamins.vitamin_d.amount += 5; // Reduced synthesis
    requirements.vitamins.vitamin_b12.amount += 1; // Reduced absorption
    requirements.minerals.calcium.amount += 200; // Bone health
    
    return requirements;
  }

  private adjustForHealthConditions(
    requirements: MicronutrientRequirements,
    conditions: string[]
  ): MicronutrientRequirements {
    conditions.forEach(condition => {
      switch (condition.toLowerCase()) {
        case 'diabetes':
          requirements.minerals.chromium.amount += 10;
          requirements.minerals.magnesium.amount += 50;
          break;
        case 'hypertension':
          requirements.minerals.potassium.amount += 500;
          requirements.minerals.sodium.tolerable_upper_limit = 1500; // Lower limit
          break;
        case 'anemia':
          requirements.minerals.iron.amount += 10;
          requirements.vitamins.vitamin_c.amount += 25; // Enhances iron absorption
          requirements.vitamins.folate.amount += 100;
          break;
        case 'osteoporosis':
          requirements.minerals.calcium.amount += 300;
          requirements.vitamins.vitamin_d.amount += 10;
          requirements.minerals.magnesium.amount += 100;
          break;
      }
    });
    
    return requirements;
  }

  private analyzeNutrientIntake(
    intake: number,
    requirement: NutrientRequirement
  ): NutrientIntakeAnalysis {
    const percentageOfRequirement = (intake / requirement.amount) * 100;
    let status: NutrientIntakeAnalysis['status'];
    const recommendations: string[] = [];

    if (requirement.tolerable_upper_limit && intake > requirement.tolerable_upper_limit) {
      status = 'toxic';
      recommendations.push(`Reduce intake. Current level may be harmful.`);
    } else if (intake > requirement.dailyValue * 1.5) {
      status = 'excessive';
      recommendations.push(`Intake is higher than needed. Consider reducing.`);
    } else if (intake >= requirement.amount * 0.8) {
      status = 'adequate';
      recommendations.push(`Good intake level. Maintain current consumption.`);
    } else {
      status = 'deficient';
      const shortfall = requirement.amount - intake;
      recommendations.push(`Increase intake by ${shortfall.toFixed(1)} ${requirement.unit}.`);
      
      // Add food source recommendations
      const sources = this.getNutrientFoodSources(requirement.nutrient);
      if (sources.indian_sources.length > 0) {
        recommendations.push(`Good sources: ${sources.indian_sources.slice(0, 2).map(s => s.food).join(', ')}.`);
      }
    }

    return {
      nutrient: requirement.nutrient,
      intake,
      requirement: requirement.amount,
      percentage_of_requirement: Math.round(percentageOfRequirement),
      status,
      recommendations,
    };
  }

  private generatePriorityRecommendations(
    vitaminAnalysis: Record<string, NutrientIntakeAnalysis>,
    mineralAnalysis: Record<string, NutrientIntakeAnalysis>
  ): string[] {
    const priorities: string[] = [];
    const allAnalysis = { ...vitaminAnalysis, ...mineralAnalysis };

    // Find critical deficiencies (< 50% of requirement)
    const criticalDeficiencies = Object.values(allAnalysis)
      .filter(a => a.status === 'deficient' && a.percentage_of_requirement < 50)
      .sort((a, b) => a.percentage_of_requirement - b.percentage_of_requirement);

    if (criticalDeficiencies.length > 0) {
      priorities.push(`Critical: Address ${criticalDeficiencies[0].nutrient} deficiency immediately.`);
    }

    // Find excessive intakes
    const excessiveIntakes = Object.values(allAnalysis)
      .filter(a => a.status === 'excessive' || a.status === 'toxic');

    if (excessiveIntakes.length > 0) {
      priorities.push(`Reduce ${excessiveIntakes.map(a => a.nutrient).join(', ')} intake.`);
    }

    // General recommendations
    const deficientCount = Object.values(allAnalysis).filter(a => a.status === 'deficient').length;
    
    if (deficientCount > 5) {
      priorities.push('Consider a comprehensive multivitamin under medical supervision.');
    }

    if (priorities.length === 0) {
      priorities.push('Your nutrient intake appears well-balanced. Continue current dietary pattern.');
    }

    return priorities.slice(0, 3); // Return top 3 priorities
  }

  private shouldRecommendSupplement(nutrient: string): boolean {
    // Only recommend supplements for nutrients difficult to get from food
    const supplementCandidates = ['vitamin_d', 'vitamin_b12', 'iron', 'omega_3'];
    return supplementCandidates.includes(nutrient);
  }

  private getSupplementDosage(nutrient: string): string {
    const dosages = {
      vitamin_d: '1000-2000 IU daily',
      vitamin_b12: '250-500 mcg daily',
      iron: '18-25 mg daily (with medical supervision)',
      omega_3: '500-1000 mg EPA+DHA daily',
    };
    
    return dosages[nutrient] || 'Consult healthcare provider';
  }

  private getSupplementNotes(nutrient: string): string {
    const notes = {
      vitamin_d: 'Best taken with fat-containing meal. Monitor vitamin D levels.',
      vitamin_b12: 'Sublingual forms may be better absorbed. Important for vegetarians.',
      iron: 'Take with vitamin C, avoid with tea/coffee. Monitor iron levels.',
      omega_3: 'Choose high-quality fish oil or algae-based for vegetarians.',
    };
    
    return notes[nutrient] || 'Follow healthcare provider guidance';
  }
}