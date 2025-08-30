import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Recipe } from './recipe.entity';

export enum TagCategory {
  DIETARY = 'dietary',
  HEALTH = 'health',
  COOKING_METHOD = 'cooking_method',
  OCCASION = 'occasion',
  INGREDIENT = 'ingredient',
  TEXTURE = 'texture',
  FLAVOR = 'flavor',
  SEASON = 'season',
}

@Entity('recipe_tags')
@Index(['name'], { unique: true })
@Index(['category'])
export class RecipeTag extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nameHindi?: string;

  @Column({
    type: 'enum',
    enum: TagCategory,
  })
  category: TagCategory;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string; // Hex color for UI

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  usageCount: number; // How many recipes use this tag

  // Relationships
  @ManyToMany(() => Recipe, (recipe) => recipe.tags)
  recipes: Recipe[];
}