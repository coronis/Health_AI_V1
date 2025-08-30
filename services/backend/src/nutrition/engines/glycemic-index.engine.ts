import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FoodGIData {
  food: string;
  gi: number;
  category: 'low' | 'medium' | 'high';
  carbs_per_100g: number;
  serving_size: number;
  gl_per_serving: number;
  reliability: 'high' | 'medium' | 'low' | 'estimated';
}

export interface MealGIAnalysis {
  foods: FoodGIData[];
  meal_gi: number;
  meal_gl: number;
  total_carbs: number;
  gi_category: 'low' | 'medium' | 'high';
  gl_category: 'low' | 'medium' | 'high';
  recommendations: string[];
  modifications: Array<{
    suggestion: string;
    expected_gi_reduction: number;
    expected_gl_reduction: number;
  }>;
}

export interface CookingMethodImpact {
  method: string;
  gi_modifier: number; // Multiplier for GI
  gl_modifier: number; // Multiplier for GL
  explanation: string;
}

export interface PersonalizedGITarget {
  condition?: 'diabetes' | 'prediabetes' | 'weight_loss' | 'healthy';
  target_meal_gi: number;
  target_meal_gl: number;
  daily_gl_target: number;
  recommendations: string[];
}

@Injectable()
export class GlycemicIndexEngine {
  private readonly logger = new Logger(GlycemicIndexEngine.name);
  private readonly giDatabase: Map<string, FoodGIData>;

  constructor(private readonly configService: ConfigService) {
    this.giDatabase = this.initializeGIDatabase();
  }

  /**
   * Calculate GI and GL for a meal
   */
  calculateMealGI(foods: Array<{
    name: string;
    quantity: number; // in grams
    carbs_per_100g?: number;
    cooking_method?: string;
  }>): MealGIAnalysis {
    const analyzedFoods: FoodGIData[] = [];
    let totalCarbs = 0;
    let weightedGISum = 0;
    let totalGL = 0;

    foods.forEach(food => {
      const giData = this.getGIData(food.name);
      if (giData) {
        // Adjust for cooking method
        const cookingImpact = this.getCookingMethodImpact(food.cooking_method);
        const adjustedGI = giData.gi * cookingImpact.gi_modifier;

        // Calculate carbs for this portion
        const carbsInPortion = (food.carbs_per_100g || giData.carbs_per_100g) * (food.quantity / 100);
        
        // Calculate GL for this food
        const foodGL = (adjustedGI * carbsInPortion) / 100;

        analyzedFoods.push({
          ...giData,
          food: food.name,
          gi: Math.round(adjustedGI),
          gl_per_serving: Math.round(foodGL * 10) / 10,
          serving_size: food.quantity,
        });

        totalCarbs += carbsInPortion;
        weightedGISum += adjustedGI * carbsInPortion;
        totalGL += foodGL;
      }
    });

    const mealGI = totalCarbs > 0 ? Math.round(weightedGISum / totalCarbs) : 0;
    const mealGL = Math.round(totalGL * 10) / 10;

    const giCategory = this.categorizeGI(mealGI);
    const glCategory = this.categorizeGL(mealGL);

    const recommendations = this.generateRecommendations(mealGI, mealGL, analyzedFoods);
    const modifications = this.suggestModifications(analyzedFoods);

    return {
      foods: analyzedFoods,
      meal_gi: mealGI,
      meal_gl: mealGL,
      total_carbs: Math.round(totalCarbs * 10) / 10,
      gi_category: giCategory,
      gl_category: glCategory,
      recommendations,
      modifications,
    };
  }

  /**
   * Get personalized GI/GL targets based on health condition
   */
  getPersonalizedTargets(condition?: string): PersonalizedGITarget {
    let target_meal_gi: number;
    let target_meal_gl: number;
    let daily_gl_target: number;
    const recommendations: string[] = [];

    switch (condition?.toLowerCase()) {
      case 'diabetes':
        target_meal_gi = 45;
        target_meal_gl = 15;
        daily_gl_target = 100;
        recommendations.push('Focus on low GI foods to maintain stable blood sugar');
        recommendations.push('Combine carbs with protein and healthy fats');
        recommendations.push('Monitor blood glucose after meals');
        break;

      case 'prediabetes':
        target_meal_gi = 50;
        target_meal_gl = 18;
        daily_gl_target = 120;
        recommendations.push('Choose predominantly low GI foods');
        recommendations.push('Limit high GI foods to small portions');
        recommendations.push('Include fiber-rich foods with each meal');
        break;

      case 'weight_loss':
        target_meal_gi = 55;
        target_meal_gl = 20;
        daily_gl_target = 140;
        recommendations.push('Low GI foods help control hunger');
        recommendations.push('Stable blood sugar reduces cravings');
        recommendations.push('Combine with portion control for best results');
        break;

      case 'healthy':
      default:
        target_meal_gi = 60;
        target_meal_gl = 25;
        daily_gl_target = 160;
        recommendations.push('Mix of low and medium GI foods is healthy');
        recommendations.push('Limit high GI foods to around exercise');
        recommendations.push('Focus on whole foods over processed options');
        break;
    }

    return {
      condition: condition as any,
      target_meal_gi,
      target_meal_gl,
      daily_gl_target,
      recommendations,
    };
  }

  /**
   * Estimate GI for unknown foods based on composition
   */
  estimateGI(foodComposition: {
    carb_type: 'starch' | 'sugar' | 'fiber';
    processing_level: 'whole' | 'refined' | 'highly_processed';
    fiber_content: number; // g per 100g
    fat_content: number; // g per 100g
    protein_content: number; // g per 100g
    particle_size: 'large' | 'medium' | 'small' | 'powder';
  }): { estimated_gi: number; confidence: 'high' | 'medium' | 'low'; factors: string[] } {
    let baseGI = 50; // Start with medium GI
    const factors: string[] = [];

    // Carbohydrate type impact
    switch (foodComposition.carb_type) {
      case 'sugar':
        baseGI += 20;
        factors.push('Simple sugars increase GI');
        break;
      case 'starch':
        baseGI += 0; // Neutral
        factors.push('Starch has moderate GI impact');
        break;
      case 'fiber':
        baseGI -= 15;
        factors.push('High fiber content lowers GI');
        break;
    }

    // Processing level impact
    switch (foodComposition.processing_level) {
      case 'whole':
        baseGI -= 10;
        factors.push('Whole foods have lower GI');
        break;
      case 'refined':
        baseGI += 10;
        factors.push('Refined foods have higher GI');
        break;
      case 'highly_processed':
        baseGI += 25;
        factors.push('Highly processed foods have very high GI');
        break;
    }

    // Fiber content impact (additional to carb type)
    if (foodComposition.fiber_content > 5) {
      baseGI -= Math.min(15, foodComposition.fiber_content * 2);
      factors.push(`High fiber (${foodComposition.fiber_content}g) significantly lowers GI`);
    }

    // Fat content impact
    if (foodComposition.fat_content > 10) {
      baseGI -= Math.min(10, foodComposition.fat_content * 0.5);
      factors.push('Fat content slows carbohydrate absorption');
    }

    // Protein content impact
    if (foodComposition.protein_content > 15) {
      baseGI -= Math.min(8, foodComposition.protein_content * 0.3);
      factors.push('Protein content moderates blood sugar response');
    }

    // Particle size impact
    switch (foodComposition.particle_size) {
      case 'large':
        baseGI -= 5;
        factors.push('Large particle size slows digestion');
        break;
      case 'medium':
        baseGI += 0; // Neutral
        break;
      case 'small':
        baseGI += 5;
        factors.push('Small particle size speeds digestion');
        break;
      case 'powder':
        baseGI += 15;
        factors.push('Powder form allows rapid absorption');
        break;
    }

    // Ensure GI stays within reasonable bounds
    const estimatedGI = Math.max(15, Math.min(95, Math.round(baseGI)));

    // Determine confidence based on factors
    let confidence: 'high' | 'medium' | 'low';
    if (factors.length >= 4) {
      confidence = 'high';
    } else if (factors.length >= 2) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      estimated_gi: estimatedGI,
      confidence,
      factors,
    };
  }

  /**
   * Get GI-friendly alternatives for high GI foods
   */
  getGIFriendlyAlternatives(highGIFood: string): Array<{
    alternative: string;
    gi_difference: number;
    gl_difference: number;
    explanation: string;
  }> {
    const alternatives = {
      'white rice': [
        {
          alternative: 'Brown rice',
          gi_difference: -15,
          gl_difference: -3,
          explanation: 'Higher fiber content slows digestion',
        },
        {
          alternative: 'Quinoa',
          gi_difference: -20,
          gl_difference: -4,
          explanation: 'Complete protein and lower carb content',
        },
        {
          alternative: 'Cauliflower rice',
          gi_difference: -65,
          gl_difference: -18,
          explanation: 'Very low carbohydrate vegetable substitute',
        },
      ],
      'white bread': [
        {
          alternative: 'Whole grain bread',
          gi_difference: -25,
          gl_difference: -5,
          explanation: 'Intact grains and fiber slow absorption',
        },
        {
          alternative: 'Oat bread',
          gi_difference: -20,
          gl_difference: -4,
          explanation: 'Beta-glucan fiber helps control blood sugar',
        },
        {
          alternative: 'Lettuce wraps',
          gi_difference: -60,
          gl_difference: -15,
          explanation: 'Eliminates high-GI carbohydrates entirely',
        },
      ],
      'potato': [
        {
          alternative: 'Sweet potato',
          gi_difference: -10,
          gl_difference: -2,
          explanation: 'Lower GI and higher fiber content',
        },
        {
          alternative: 'Steamed broccoli',
          gi_difference: -70,
          gl_difference: -15,
          explanation: 'Very low carb, high nutrient vegetable',
        },
      ],
      // Add more alternatives as needed
    };

    return alternatives[highGIFood.toLowerCase()] || [];
  }

  /**
   * Calculate post-meal blood sugar impact
   */
  predictBloodSugarImpact(mealGL: number, personalFactors: {
    has_diabetes?: boolean;
    insulin_sensitivity?: 'high' | 'normal' | 'low';
    recent_exercise?: boolean;
    stress_level?: 'low' | 'normal' | 'high';
    sleep_quality?: 'good' | 'fair' | 'poor';
  }): {
    expected_peak_time: number; // minutes after meal
    expected_duration: number; // minutes
    blood_sugar_category: 'minimal' | 'moderate' | 'significant' | 'high';
    recommendations: string[];
  } {
    let basePeakTime = 60; // Base peak at 60 minutes
    let baseDuration = 120; // Base duration 2 hours
    let impactMultiplier = 1;

    // Adjust for personal factors
    if (personalFactors.has_diabetes) {
      basePeakTime += 30;
      baseDuration += 60;
      impactMultiplier *= 1.5;
    }

    if (personalFactors.insulin_sensitivity === 'low') {
      basePeakTime += 20;
      baseDuration += 30;
      impactMultiplier *= 1.3;
    } else if (personalFactors.insulin_sensitivity === 'high') {
      basePeakTime -= 10;
      baseDuration -= 20;
      impactMultiplier *= 0.8;
    }

    if (personalFactors.recent_exercise) {
      impactMultiplier *= 0.7;
      baseDuration -= 30;
    }

    if (personalFactors.stress_level === 'high') {
      impactMultiplier *= 1.2;
      baseDuration += 20;
    }

    if (personalFactors.sleep_quality === 'poor') {
      impactMultiplier *= 1.15;
      basePeakTime += 15;
    }

    // Calculate final impact
    const adjustedGL = mealGL * impactMultiplier;
    
    let bloodSugarCategory: 'minimal' | 'moderate' | 'significant' | 'high';
    const recommendations: string[] = [];

    if (adjustedGL < 10) {
      bloodSugarCategory = 'minimal';
      recommendations.push('Excellent meal choice for blood sugar control');
    } else if (adjustedGL < 20) {
      bloodSugarCategory = 'moderate';
      recommendations.push('Good meal choice, blood sugar should remain stable');
    } else if (adjustedGL < 30) {
      bloodSugarCategory = 'significant';
      recommendations.push('Consider reducing portion size or adding protein/fat');
      recommendations.push('A short walk after eating may help');
    } else {
      bloodSugarCategory = 'high';
      recommendations.push('Consider substituting some high-GI components');
      recommendations.push('Adding fiber, protein, or healthy fats can help');
      recommendations.push('Physical activity after eating is recommended');
    }

    return {
      expected_peak_time: basePeakTime,
      expected_duration: baseDuration,
      blood_sugar_category: bloodSugarCategory,
      recommendations,
    };
  }

  // Private helper methods

  private initializeGIDatabase(): Map<string, FoodGIData> {
    const database = new Map<string, FoodGIData>();

    // Indian staples
    database.set('white rice', {
      food: 'White Rice (सफेद चावल)',
      gi: 73,
      category: 'high',
      carbs_per_100g: 80,
      serving_size: 150,
      gl_per_serving: 29,
      reliability: 'high',
    });

    database.set('brown rice', {
      food: 'Brown Rice (भूरे चावल)',
      gi: 68,
      category: 'medium',
      carbs_per_100g: 77,
      serving_size: 150,
      gl_per_serving: 16,
      reliability: 'high',
    });

    database.set('roti', {
      food: 'Wheat Roti (गेहूं की रोटी)',
      gi: 62,
      category: 'medium',
      carbs_per_100g: 71,
      serving_size: 60,
      gl_per_serving: 15,
      reliability: 'medium',
    });

    database.set('chapati', {
      food: 'Chapati (चपाती)',
      gi: 58,
      category: 'medium',
      carbs_per_100g: 71,
      serving_size: 60,
      gl_per_serving: 14,
      reliability: 'medium',
    });

    database.set('poha', {
      food: 'Poha (पोहा)',
      gi: 77,
      category: 'high',
      carbs_per_100g: 76,
      serving_size: 100,
      gl_per_serving: 18,
      reliability: 'medium',
    });

    database.set('upma', {
      food: 'Upma (उपमा)',
      gi: 69,
      category: 'medium',
      carbs_per_100g: 72,
      serving_size: 150,
      gl_per_serving: 20,
      reliability: 'medium',
    });

    // Legumes and lentils
    database.set('moong dal', {
      food: 'Moong Dal (मूंग दाल)',
      gi: 38,
      category: 'low',
      carbs_per_100g: 59,
      serving_size: 150,
      gl_per_serving: 11,
      reliability: 'high',
    });

    database.set('chickpeas', {
      food: 'Chickpeas (चना)',
      gi: 28,
      category: 'low',
      carbs_per_100g: 61,
      serving_size: 150,
      gl_per_serving: 8,
      reliability: 'high',
    });

    // Vegetables
    database.set('potato', {
      food: 'Potato (आलू)',
      gi: 78,
      category: 'high',
      carbs_per_100g: 17,
      serving_size: 150,
      gl_per_serving: 14,
      reliability: 'high',
    });

    database.set('sweet potato', {
      food: 'Sweet Potato (शकरकंद)',
      gi: 54,
      category: 'medium',
      carbs_per_100g: 20,
      serving_size: 150,
      gl_per_serving: 11,
      reliability: 'high',
    });

    // Fruits
    database.set('banana', {
      food: 'Banana (केला)',
      gi: 51,
      category: 'medium',
      carbs_per_100g: 23,
      serving_size: 120,
      gl_per_serving: 12,
      reliability: 'high',
    });

    database.set('apple', {
      food: 'Apple (सेब)',
      gi: 36,
      category: 'low',
      carbs_per_100g: 14,
      serving_size: 120,
      gl_per_serving: 5,
      reliability: 'high',
    });

    database.set('mango', {
      food: 'Mango (आम)',
      gi: 51,
      category: 'medium',
      carbs_per_100g: 17,
      serving_size: 120,
      gl_per_serving: 8,
      reliability: 'medium',
    });

    // Add more foods as needed...

    return database;
  }

  private getGIData(foodName: string): FoodGIData | null {
    const normalized = foodName.toLowerCase().trim();
    return this.giDatabase.get(normalized) || null;
  }

  private getCookingMethodImpact(method?: string): CookingMethodImpact {
    const impacts = {
      'boiled': { gi_modifier: 1.0, gl_modifier: 1.0, explanation: 'Standard boiling has minimal GI impact' },
      'steamed': { gi_modifier: 0.95, gl_modifier: 0.95, explanation: 'Steaming preserves structure, slightly lower GI' },
      'pressure_cooked': { gi_modifier: 1.1, gl_modifier: 1.1, explanation: 'High pressure breaks down starches more' },
      'fried': { gi_modifier: 0.9, gl_modifier: 0.85, explanation: 'Fat coating slows carbohydrate absorption' },
      'roasted': { gi_modifier: 1.05, gl_modifier: 1.05, explanation: 'Dry heat may increase GI slightly' },
      'raw': { gi_modifier: 0.8, gl_modifier: 0.8, explanation: 'Raw foods generally have lower GI' },
      'fermented': { gi_modifier: 0.85, gl_modifier: 0.85, explanation: 'Fermentation reduces available carbohydrates' },
    };

    return impacts[method?.toLowerCase()] || impacts['boiled'];
  }

  private categorizeGI(gi: number): 'low' | 'medium' | 'high' {
    if (gi <= 55) return 'low';
    if (gi <= 70) return 'medium';
    return 'high';
  }

  private categorizeGL(gl: number): 'low' | 'medium' | 'high' {
    if (gl <= 10) return 'low';
    if (gl <= 20) return 'medium';
    return 'high';
  }

  private generateRecommendations(
    mealGI: number, 
    mealGL: number, 
    foods: FoodGIData[]
  ): string[] {
    const recommendations: string[] = [];

    if (mealGI > 70) {
      recommendations.push('This meal has a high GI. Consider adding protein or healthy fats to slow absorption.');
    }

    if (mealGL > 20) {
      recommendations.push('High GL meal. Consider reducing portion sizes or substituting some ingredients.');
    }

    const highGIFoods = foods.filter(f => f.gi > 70);
    if (highGIFoods.length > 0) {
      recommendations.push(`High GI foods in this meal: ${highGIFoods.map(f => f.food).join(', ')}`);
    }

    if (mealGI <= 55 && mealGL <= 15) {
      recommendations.push('Excellent meal choice for blood sugar control!');
    }

    return recommendations;
  }

  private suggestModifications(foods: FoodGIData[]): Array<{
    suggestion: string;
    expected_gi_reduction: number;
    expected_gl_reduction: number;
  }> {
    const modifications: Array<{
      suggestion: string;
      expected_gi_reduction: number;
      expected_gl_reduction: number;
    }> = [];

    const highGIFoods = foods.filter(f => f.gi > 70);
    
    highGIFoods.forEach(food => {
      const alternatives = this.getGIFriendlyAlternatives(food.food);
      alternatives.slice(0, 1).forEach(alt => {
        modifications.push({
          suggestion: `Replace ${food.food} with ${alt.alternative}`,
          expected_gi_reduction: Math.abs(alt.gi_difference),
          expected_gl_reduction: Math.abs(alt.gl_difference),
        });
      });
    });

    // General modifications
    modifications.push({
      suggestion: 'Add 1 tbsp of healthy fat (nuts, olive oil, or avocado)',
      expected_gi_reduction: 5,
      expected_gl_reduction: 2,
    });

    modifications.push({
      suggestion: 'Include a source of protein with the meal',
      expected_gi_reduction: 8,
      expected_gl_reduction: 3,
    });

    return modifications.slice(0, 3); // Return top 3 modifications
  }
}