import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RecipeCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  BEVERAGE = 'beverage',
  DESSERT = 'dessert',
}

export enum CuisineType {
  INDIAN = 'indian',
  SOUTH_INDIAN = 'south_indian',
  NORTH_INDIAN = 'north_indian',
  GUJARATI = 'gujarati',
  PUNJABI = 'punjabi',
  BENGALI = 'bengali',
  MAHARASHTRIAN = 'maharashtrian',
  CONTINENTAL = 'continental',
  CHINESE = 'chinese',
  ITALIAN = 'italian',
  MEXICAN = 'mexican',
  MEDITERRANEAN = 'mediterranean',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('recipes')
@Index(['category'])
@Index(['cuisineType'])
@Index(['prepTime'])
@Index(['isVegetarian'])
@Index(['isVegan'])
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 300, nullable: true })
  nameHindi?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: RecipeCategory,
  })
  category: RecipeCategory;

  @Column({
    type: 'enum',
    enum: CuisineType,
  })
  cuisineType: CuisineType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficulty: DifficultyLevel;

  // Timing
  @Column({ name: 'prep_time_minutes' })
  prepTimeMinutes: number;

  @Column({ name: 'cook_time_minutes' })
  cookTimeMinutes: number;

  @Column({ name: 'total_time_minutes' })
  totalTimeMinutes: number;

  // Servings
  @Column({ name: 'serving_size', default: 1 })
  servingSize: number;

  @Column({ name: 'servings_per_recipe', default: 4 })
  servingsPerRecipe: number;

  // Dietary flags
  @Column({ name: 'is_vegetarian', default: true })
  isVegetarian: boolean;

  @Column({ name: 'is_vegan', default: false })
  isVegan: boolean;

  @Column({ name: 'is_gluten_free', default: false })
  isGlutenFree: boolean;

  @Column({ name: 'is_dairy_free', default: false })
  isDairyFree: boolean;

  @Column({ name: 'is_low_carb', default: false })
  isLowCarb: boolean;

  @Column({ name: 'is_keto', default: false })
  isKeto: boolean;

  // Nutrition per serving
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  calories: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  protein: number; // grams

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  carbohydrates: number; // grams

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  fat: number; // grams

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  fiber: number; // grams

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sugar?: number; // grams

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodium?: number; // mg

  // Glycemic Index
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  glycemicIndex?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  glycemicLoad?: number;

  // Recipe content
  @Column({ type: 'json' })
  ingredients: {
    item: string;
    itemHindi?: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];

  @Column({ type: 'json' })
  instructions: {
    step: number;
    instruction: string;
    instructionHindi?: string;
    timeMinutes?: number;
    temperature?: number;
  }[];

  @Column({ type: 'json', nullable: true })
  nutritionBreakdown?: {
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
    aminoAcids?: Record<string, number>;
  };

  // Tags and allergens
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'simple-array', nullable: true })
  allergens?: string[];

  // Media
  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'video_url', length: 500, nullable: true })
  videoUrl?: string;

  // Source and attribution
  @Column({ length: 200, nullable: true })
  source?: string;

  @Column({ name: 'source_url', length: 500, nullable: true })
  sourceUrl?: string;

  @Column({ length: 100, nullable: true })
  author?: string;

  // User engagement
  @Column({ name: 'rating_average', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAverage: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  // Status and moderation
  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'moderation_status', length: 20, default: 'pending' })
  moderationStatus: string;

  // Data classification
  @Column({ name: 'data_source', length: 50, default: 'internal' })
  dataSource: string;

  @Column({ name: 'data_quality_score', type: 'decimal', precision: 3, scale: 2, default: 0.8 })
  dataQualityScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Computed properties
  get totalTime(): number {
    return this.prepTimeMinutes + this.cookTimeMinutes;
  }

  get caloriesPerGram(): number {
    const totalWeight = this.ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
    return totalWeight > 0 ? this.calories / totalWeight : 0;
  }

  get proteinPercentage(): number {
    return this.calories > 0 ? ((this.protein * 4) / this.calories) * 100 : 0;
  }

  get carbPercentage(): number {
    return this.calories > 0 ? ((this.carbohydrates * 4) / this.calories) * 100 : 0;
  }

  get fatPercentage(): number {
    return this.calories > 0 ? ((this.fat * 9) / this.calories) * 100 : 0;
  }
}
