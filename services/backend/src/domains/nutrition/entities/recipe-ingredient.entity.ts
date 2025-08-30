import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Recipe } from './recipe.entity';

export enum IngredientUnit {
  // Weight
  GRAM = 'g',
  KILOGRAM = 'kg',
  OUNCE = 'oz',
  POUND = 'lb',
  
  // Volume
  MILLILITER = 'ml',
  LITER = 'l',
  CUP = 'cup',
  TABLESPOON = 'tbsp',
  TEASPOON = 'tsp',
  FLUID_OUNCE = 'fl_oz',
  
  // Count
  PIECE = 'piece',
  SLICE = 'slice',
  CLOVE = 'clove',
  BUNCH = 'bunch',
  
  // Indian measurements
  KATORI = 'katori', // Small bowl
  BOWL = 'bowl',
  PINCH = 'pinch',
  
  // Spoons (Indian style)
  CHOTI_CHAMMACH = 'choti_chammach', // Teaspoon
  BADI_CHAMMACH = 'badi_chammach', // Tablespoon
}

@Entity('recipe_ingredients')
@Index(['recipeId'])
@Index(['ingredientName'])
export class RecipeIngredient extends BaseEntity {
  @Column({ type: 'uuid' })
  recipeId: string;

  @Column({ type: 'varchar', length: 255 })
  ingredientName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ingredientNameHindi?: string; // Hindi name

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: IngredientUnit,
  })
  unit: IngredientUnit;

  @Column({ type: 'text', nullable: true })
  preparation?: string; // e.g., "chopped", "diced", "grated"

  @Column({ type: 'text', nullable: true })
  notes?: string; // Additional notes about the ingredient

  @Column({ type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  substitute?: string; // Alternative ingredient

  @Column({ type: 'int' })
  displayOrder: number; // Order in the recipe

  // Nutritional information per ingredient
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  protein?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  carbohydrates?: number; // grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fat?: number; // grams

  // External food database reference
  @Column({ type: 'varchar', length: 100, nullable: true })
  usdaFdcId?: string; // USDA FoodData Central ID

  @Column({ type: 'varchar', length: 100, nullable: true })
  ifctCode?: string; // Indian Food Composition Table code

  @Column({ type: 'text', nullable: true })
  nutritionData?: string; // JSON with complete nutrition data

  // Relationships
  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  // Helper methods
  getNutritionData(): any {
    try {
      return this.nutritionData ? JSON.parse(this.nutritionData) : {};
    } catch {
      return {};
    }
  }

  setNutritionData(data: any): void {
    this.nutritionData = JSON.stringify(data);
  }

  getDisplayName(): string {
    const name = this.ingredientNameHindi || this.ingredientName;
    const prep = this.preparation ? `, ${this.preparation}` : '';
    return `${name}${prep}`;
  }

  getQuantityDisplay(): string {
    return `${this.quantity} ${this.unit}`;
  }
}