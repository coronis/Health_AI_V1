import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe, DietType, CuisineType, MealType } from '../entities/recipe.entity';
import { USDAApiClient } from '../../../external/usda/usda-api.client';

interface RecipeFilters {
  diet?: DietType;
  cuisine?: CuisineType;
  meal?: MealType;
  search?: string;
}

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    private readonly usdaClient: USDAApiClient,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters: RecipeFilters = {},
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.recipesRepository
      .createQueryBuilder('recipe')
      .where('recipe.isActive = :isActive', { isActive: true })
      .skip(skip)
      .take(limit)
      .orderBy('recipe.rating', 'DESC')
      .addOrderBy('recipe.createdAt', 'DESC');

    if (filters.diet) {
      queryBuilder.andWhere('recipe.dietType = :diet', { diet: filters.diet });
    }

    if (filters.cuisine) {
      queryBuilder.andWhere('recipe.cuisineType = :cuisine', { cuisine: filters.cuisine });
    }

    if (filters.meal) {
      queryBuilder.andWhere('recipe.mealType = :meal', { meal: filters.meal });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(recipe.name ILIKE :search OR recipe.description ILIKE :search OR recipe.searchKeywords ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const [recipes, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      recipes,
      total,
      page,
      totalPages,
      filters,
    };
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipesRepository.findOne({
      where: { id, isActive: true },
      relations: ['ingredients', 'steps', 'tags'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    // Increment view count
    await this.recipesRepository.increment({ id }, 'viewCount', 1);

    return recipe;
  }

  async getNutrition(id: string) {
    const recipe = await this.findOne(id);
    
    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: recipe.servings,
      perServing: recipe.getNutritionalSummary(),
      total: {
        calories: recipe.caloriesPerServing * recipe.servings,
        protein: recipe.proteinPerServing * recipe.servings,
        carbohydrates: recipe.carbohydratesPerServing * recipe.servings,
        fat: recipe.fatPerServing * recipe.servings,
        fiber: recipe.fiberPerServing * recipe.servings,
        sugar: recipe.sugarPerServing * recipe.servings,
        sodium: recipe.sodiumPerServing * recipe.servings,
      },
      glycemicIndex: recipe.glycemicIndex,
      glycemicLoad: recipe.glycemicLoad,
      healthBenefits: recipe.getHealthBenefits(),
      suitableConditions: recipe.getSuitableConditions(),
      allergens: recipe.getAllergens(),
    };
  }

  async searchUSDAFoods(query: string) {
    this.logger.log(`Searching USDA foods for: ${query}`);
    
    try {
      const result = await this.usdaClient.searchFoods({
        query,
        pageSize: 10,
      });

      return result;
    } catch (error) {
      this.logger.error(`USDA search failed for query: ${query}`, error);
      throw error;
    }
  }

  async getFeaturedRecipes(limit: number = 10) {
    return this.recipesRepository.find({
      where: { 
        isActive: true,
        isFeatured: true,
      },
      order: { rating: 'DESC' },
      take: limit,
    });
  }

  async getPopularRecipes(limit: number = 10) {
    return this.recipesRepository.find({
      where: { isActive: true },
      order: { 
        viewCount: 'DESC',
        rating: 'DESC',
      },
      take: limit,
    });
  }
}