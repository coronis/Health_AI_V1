import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe, RecipeCategory, CuisineType } from '../entities/recipe.entity';

export interface CreateRecipeDto {
  name: string;
  nameHindi?: string;
  description?: string;
  category: RecipeCategory;
  cuisineType: CuisineType;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servingSize?: number;
  servingsPerRecipe?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  ingredients: Array<{
    item: string;
    itemHindi?: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    instruction: string;
    instructionHindi?: string;
    timeMinutes?: number;
    temperature?: number;
  }>;
}

export interface FindRecipesFilters {
  category?: RecipeCategory;
  cuisineType?: CuisineType;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  maxCalories?: number;
  maxPrepTime?: number;
  tags?: string[];
}

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const recipe = this.recipeRepository.create({
      ...createRecipeDto,
      totalTimeMinutes: createRecipeDto.prepTimeMinutes + createRecipeDto.cookTimeMinutes,
    });

    return this.recipeRepository.save(recipe);
  }

  async findAll(filters?: FindRecipesFilters, page = 1, limit = 20): Promise<Recipe[]> {
    const queryBuilder = this.recipeRepository.createQueryBuilder('recipe');

    if (filters) {
      if (filters.category) {
        queryBuilder.andWhere('recipe.category = :category', { category: filters.category });
      }
      if (filters.cuisineType) {
        queryBuilder.andWhere('recipe.cuisineType = :cuisineType', {
          cuisineType: filters.cuisineType,
        });
      }
      if (filters.isVegetarian !== undefined) {
        queryBuilder.andWhere('recipe.isVegetarian = :isVegetarian', {
          isVegetarian: filters.isVegetarian,
        });
      }
      if (filters.isVegan !== undefined) {
        queryBuilder.andWhere('recipe.isVegan = :isVegan', { isVegan: filters.isVegan });
      }
      if (filters.isGlutenFree !== undefined) {
        queryBuilder.andWhere('recipe.isGlutenFree = :isGlutenFree', {
          isGlutenFree: filters.isGlutenFree,
        });
      }
      if (filters.maxCalories) {
        queryBuilder.andWhere('recipe.calories <= :maxCalories', {
          maxCalories: filters.maxCalories,
        });
      }
      if (filters.maxPrepTime) {
        queryBuilder.andWhere('recipe.prepTimeMinutes <= :maxPrepTime', {
          maxPrepTime: filters.maxPrepTime,
        });
      }
    }

    return queryBuilder
      .where('recipe.isPublished = :isPublished', { isPublished: true })
      .orderBy('recipe.ratingAverage', 'DESC')
      .addOrderBy('recipe.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async findOne(id: string): Promise<Recipe | null> {
    return this.recipeRepository.findOne({
      where: { id },
    });
  }

  async findByCategory(category: RecipeCategory): Promise<Recipe[]> {
    return this.recipeRepository.find({
      where: { category, isPublished: true },
      order: { ratingAverage: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByCuisine(cuisineType: CuisineType): Promise<Recipe[]> {
    return this.recipeRepository.find({
      where: { cuisineType, isPublished: true },
      order: { ratingAverage: 'DESC', createdAt: 'DESC' },
    });
  }

  async searchRecipes(searchTerm: string): Promise<Recipe[]> {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .where('recipe.isPublished = :isPublished', { isPublished: true })
      .andWhere(
        '(recipe.name ILIKE :searchTerm OR recipe.nameHindi ILIKE :searchTerm OR recipe.description ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('recipe.ratingAverage', 'DESC')
      .addOrderBy('recipe.createdAt', 'DESC')
      .getMany();
  }

  async updateRating(id: string, rating: number): Promise<Recipe | null> {
    const recipe = await this.findOne(id);
    if (!recipe) return null;

    // Simple rating update - in production, this would be more sophisticated
    const newRatingCount = recipe.ratingCount + 1;
    const newRatingAverage = (recipe.ratingAverage * recipe.ratingCount + rating) / newRatingCount;

    await this.recipeRepository.update(id, {
      ratingAverage: Number(newRatingAverage.toFixed(2)),
      ratingCount: newRatingCount,
    });

    return this.findOne(id);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.recipeRepository.increment({ id }, 'viewCount', 1);
  }

  async remove(id: string): Promise<void> {
    await this.recipeRepository.delete(id);
  }

  // Nutrition calculation methods
  calculateNutritionForServings(
    recipe: Recipe,
    servings: number,
  ): {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  } {
    const multiplier = servings / recipe.servingSize;

    return {
      calories: Number((recipe.calories * multiplier).toFixed(2)),
      protein: Number((recipe.protein * multiplier).toFixed(2)),
      carbohydrates: Number((recipe.carbohydrates * multiplier).toFixed(2)),
      fat: Number((recipe.fat * multiplier).toFixed(2)),
      fiber: Number((recipe.fiber * multiplier).toFixed(2)),
    };
  }

  async getRecommendedRecipes(
    preferences: {
      isVegetarian?: boolean;
      isVegan?: boolean;
      preferredCuisines?: CuisineType[];
      maxCalories?: number;
    },
    limit = 10,
  ): Promise<Recipe[]> {
    const queryBuilder = this.recipeRepository.createQueryBuilder('recipe');

    queryBuilder.where('recipe.isPublished = :isPublished', { isPublished: true });

    if (preferences.isVegetarian) {
      queryBuilder.andWhere('recipe.isVegetarian = :isVegetarian', { isVegetarian: true });
    }

    if (preferences.isVegan) {
      queryBuilder.andWhere('recipe.isVegan = :isVegan', { isVegan: true });
    }

    if (preferences.preferredCuisines && preferences.preferredCuisines.length > 0) {
      queryBuilder.andWhere('recipe.cuisineType IN (:...cuisines)', {
        cuisines: preferences.preferredCuisines,
      });
    }

    if (preferences.maxCalories) {
      queryBuilder.andWhere('recipe.calories <= :maxCalories', {
        maxCalories: preferences.maxCalories,
      });
    }

    return queryBuilder
      .orderBy('recipe.ratingAverage', 'DESC')
      .addOrderBy('recipe.viewCount', 'DESC')
      .take(limit)
      .getMany();
  }
}
