import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Recipe } from './recipe.entity';

@Entity('recipe_steps')
@Index(['recipeId'])
@Index(['stepNumber'])
export class RecipeStep extends BaseEntity {
  @Column({ type: 'uuid' })
  recipeId: string;

  @Column({ type: 'int' })
  stepNumber: number;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ type: 'text', nullable: true })
  instructionHindi?: string; // Hindi instruction

  @Column({ type: 'int', nullable: true })
  timeMinutes?: number; // Time for this specific step

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string; // Step-specific image

  @Column({ type: 'text', nullable: true })
  tips?: string; // Cooking tips for this step

  @Column({ type: 'varchar', length: 100, nullable: true })
  cookingMethod?: string; // sauté, boil, fry, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  temperature?: string; // cooking temperature

  // Relationships
  @ManyToOne(() => Recipe, (recipe) => recipe.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;
}
