import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Patch,
} from '@nestjs/common';
import { RecipeService, CreateRecipeDto, FindRecipesFilters } from '../services/recipe.service';
import { Recipe, RecipeCategory, CuisineType } from '../entities/recipe.entity';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return await this.recipeService.create(createRecipeDto);
  }

  @Get()
  async findAll(
    @Query('category') category?: RecipeCategory,
    @Query('cuisineType') cuisineType?: CuisineType,
    @Query('isVegetarian') isVegetarian?: string,
    @Query('isVegan') isVegan?: string,
    @Query('isGlutenFree') isGlutenFree?: string,
    @Query('maxCalories') maxCalories?: string,
    @Query('maxPrepTime') maxPrepTime?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Recipe[]> {
    const filters: FindRecipesFilters = {};

    if (category) filters.category = category;
    if (cuisineType) filters.cuisineType = cuisineType;
    if (isVegetarian !== undefined) filters.isVegetarian = isVegetarian === 'true';
    if (isVegan !== undefined) filters.isVegan = isVegan === 'true';
    if (isGlutenFree !== undefined) filters.isGlutenFree = isGlutenFree === 'true';
    if (maxCalories) filters.maxCalories = parseInt(maxCalories, 10);
    if (maxPrepTime) filters.maxPrepTime = parseInt(maxPrepTime, 10);

    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.recipeService.findAll(filters, pageNum, limitNum);
  }

  @Get('search')
  async search(@Query('q') searchTerm: string): Promise<Recipe[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new HttpException('Search term is required', HttpStatus.BAD_REQUEST);
    }

    return this.recipeService.searchRecipes(searchTerm.trim());
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: RecipeCategory): Promise<Recipe[]> {
    if (!Object.values(RecipeCategory).includes(category)) {
      throw new HttpException('Invalid recipe category', HttpStatus.BAD_REQUEST);
    }

    return this.recipeService.findByCategory(category);
  }

  @Get('cuisine/:cuisineType')
  async findByCuisine(@Param('cuisineType') cuisineType: CuisineType): Promise<Recipe[]> {
    if (!Object.values(CuisineType).includes(cuisineType)) {
      throw new HttpException('Invalid cuisine type', HttpStatus.BAD_REQUEST);
    }

    return this.recipeService.findByCuisine(cuisineType);
  }

  @Get('recommended')
  async getRecommendations(
    @Query('isVegetarian') isVegetarian?: string,
    @Query('isVegan') isVegan?: string,
    @Query('cuisines') cuisines?: string,
    @Query('maxCalories') maxCalories?: string,
    @Query('limit') limit?: string,
  ): Promise<Recipe[]> {
    const preferences: {
      isVegetarian?: boolean;
      isVegan?: boolean;
      preferredCuisines?: CuisineType[];
      maxCalories?: number;
    } = {};

    if (isVegetarian !== undefined) preferences.isVegetarian = isVegetarian === 'true';
    if (isVegan !== undefined) preferences.isVegan = isVegan === 'true';
    if (maxCalories) preferences.maxCalories = parseInt(maxCalories, 10);

    if (cuisines) {
      const cuisineList = cuisines.split(',').map((c) => c.trim() as CuisineType);
      const validCuisines = cuisineList.filter((c) => Object.values(CuisineType).includes(c));
      if (validCuisines.length > 0) {
        preferences.preferredCuisines = validCuisines;
      }
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.recipeService.getRecommendedRecipes(preferences, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Recipe> {
    const recipe = await this.recipeService.findOne(id);

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    // Increment view count
    await this.recipeService.incrementViewCount(id);

    return recipe;
  }

  @Get(':id/nutrition')
  async getNutritionForServings(
    @Param('id') id: string,
    @Query('servings') servings?: string,
  ): Promise<{
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    servings: number;
  }> {
    const recipe = await this.recipeService.findOne(id);

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    const requestedServings = servings ? parseInt(servings, 10) : recipe.servingSize;

    if (requestedServings <= 0) {
      throw new HttpException('Servings must be greater than 0', HttpStatus.BAD_REQUEST);
    }

    const nutrition = this.recipeService.calculateNutritionForServings(recipe, requestedServings);

    return {
      ...nutrition,
      servings: requestedServings,
    };
  }

  @Patch(':id/rating')
  async updateRating(
    @Param('id') id: string,
    @Body() ratingDto: { rating: number },
  ): Promise<Recipe> {
    if (!ratingDto.rating || ratingDto.rating < 1 || ratingDto.rating > 5) {
      throw new HttpException('Rating must be between 1 and 5', HttpStatus.BAD_REQUEST);
    }

    const recipe = await this.recipeService.updateRating(id, ratingDto.rating);

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    return recipe;
  }
}
