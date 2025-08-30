import { Entity, Column, OneToMany, ManyToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipeStep } from './recipe-step.entity';
import { RecipeTag } from './recipe-tag.entity';

export enum DietType {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  NON_VEGETARIAN = 'non_vegetarian',
  JAIN = 'jain',
  HALAL = 'halal',
  KOSHER = 'kosher',
  KETO = 'keto',
  PALEO = 'paleo',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
}

export enum CuisineType {
  INDIAN = 'indian',
  NORTH_INDIAN = 'north_indian',
  SOUTH_INDIAN = 'south_indian',
  MAHARASHTRIAN = 'maharashtrian',
  GUJARATI = 'gujarati',
  PUNJABI = 'punjabi',
  BENGALI = 'bengali',
  TAMIL = 'tamil',
  KERALA = 'kerala',
  RAJASTHANI = 'rajasthani',
  CHINESE = 'chinese',
  ITALIAN = 'italian',
  MEXICAN = 'mexican',
  MEDITERRANEAN = 'mediterranean',
  THAI = 'thai',
  JAPANESE = 'japanese',
  CONTINENTAL = 'continental',
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  BEVERAGE = 'beverage',
  DESSERT = 'dessert',
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

@Entity('recipes')
@Index(['name'])
@Index(['dietType'])
@Index(['cuisineType'])
@Index(['mealType'])
@Index(['difficultyLevel'])
@Index(['isActive'])
export class Recipe extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameHindi?: string; // Hindi name for Indian recipes

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: DietType,
  })
  dietType: DietType;

  @Column({
    type: 'enum',
    enum: CuisineType,
  })
  cuisineType: CuisineType;

  @Column({
    type: 'enum',
    enum: MealType,
  })
  mealType: MealType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficultyLevel: DifficultyLevel;

  @Column({ type: 'int' })
  prepTimeMinutes: number;

  @Column({ type: 'int' })
  cookTimeMinutes: number;

  @Column({ type: 'int' })
  totalTimeMinutes: number;

  @Column({ type: 'int', default: 4 })
  servings: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  caloriesPerServing?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  proteinPerServing?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  carbohydratesPerServing?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fatPerServing?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fiberPerServing?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  sugarPerServing?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  sodiumPerServing?: number; // mg

  // Glycemic Index and Load
  @Column({ type: 'int', nullable: true })
  glycemicIndex?: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  glycemicLoad?: number; // per serving

  // Images and media
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  images?: string; // JSON array of image URLs

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoUrl?: string;

  // Source and attribution
  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceName?: string;

  // Health and safety flags
  @Column({ type: 'text', nullable: true })
  allergens?: string; // JSON array of allergen types

  @Column({ type: 'text', nullable: true })
  healthBenefits?: string; // JSON array of health benefits

  @Column({ type: 'text', nullable: true })
  suitableConditions?: string; // JSON array: diabetes, hypertension, etc.

  @Column({ type: 'text', nullable: true })
  avoidConditions?: string; // JSON array of conditions to avoid

  // Recipe quality and curation
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // 0-5 stars

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  saveCount: number; // How many users saved this recipe

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean; // Verified by nutritionists

  @Column({ type: 'varchar', length: 255, nullable: true })
  verifiedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  // SEO and search
  @Column({ type: 'text', nullable: true })
  searchKeywords?: string; // Space-separated keywords

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription?: string;

  // Cultural and regional information
  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string; // Specific region within cuisine

  @Column({ type: 'varchar', length: 100, nullable: true })
  festival?: string; // Associated festival or occasion

  @Column({ type: 'varchar', length: 100, nullable: true })
  season?: string; // Best season for this recipe

  // Cost estimation
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  estimatedCostPerServing?: number; // in INR

  // Relationships
  @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe, {
    cascade: true,
  })
  ingredients: RecipeIngredient[];

  @OneToMany(() => RecipeStep, (step) => step.recipe, { cascade: true })
  steps: RecipeStep[];

  @ManyToMany(() => RecipeTag, (tag) => tag.recipes, { cascade: true })
  @JoinTable({
    name: 'recipe_tags_mapping',
    joinColumn: { name: 'recipe_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: RecipeTag[];

  // Helper methods
  getTotalTime(): number {
    return this.prepTimeMinutes + this.cookTimeMinutes;
  }

  getAllergens(): string[] {
    try {
      return this.allergens ? JSON.parse(this.allergens) : [];
    } catch {
      return [];
    }
  }

  setAllergens(allergens: string[]): void {
    this.allergens = JSON.stringify(allergens);
  }

  getHealthBenefits(): string[] {
    try {
      return this.healthBenefits ? JSON.parse(this.healthBenefits) : [];
    } catch {
      return [];
    }
  }

  setHealthBenefits(benefits: string[]): void {
    this.healthBenefits = JSON.stringify(benefits);
  }

  getSuitableConditions(): string[] {
    try {
      return this.suitableConditions ? JSON.parse(this.suitableConditions) : [];
    } catch {
      return [];
    }
  }

  setSuitableConditions(conditions: string[]): void {
    this.suitableConditions = JSON.stringify(conditions);
  }

  getImages(): string[] {
    try {
      return this.images ? JSON.parse(this.images) : [];
    } catch {
      return [];
    }
  }

  setImages(images: string[]): void {
    this.images = JSON.stringify(images);
  }

  // Check if recipe is suitable for specific dietary restrictions
  isSuitableForDiet(dietType: DietType): boolean {
    return this.dietType === dietType;
  }

  // Check if recipe contains specific allergen
  containsAllergen(allergen: string): boolean {
    return this.getAllergens().includes(allergen);
  }

  // Get nutritional summary
  getNutritionalSummary() {
    return {
      calories: this.caloriesPerServing,
      protein: this.proteinPerServing,
      carbohydrates: this.carbohydratesPerServing,
      fat: this.fatPerServing,
      fiber: this.fiberPerServing,
      sugar: this.sugarPerServing,
      sodium: this.sodiumPerServing,
      glycemicIndex: this.glycemicIndex,
      glycemicLoad: this.glycemicLoad,
    };
  }
}
