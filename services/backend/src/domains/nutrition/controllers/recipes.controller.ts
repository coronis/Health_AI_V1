import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RecipesService } from '../services/recipes.service';
import { DietType, CuisineType, MealType } from '../entities/recipe.entity';

@ApiTags('Recipes')
@Controller({ path: 'recipes', version: '1' })
@UseGuards(ThrottlerGuard)
export class RecipesController {
  private readonly logger = new Logger(RecipesController.name);

  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'Get recipes with pagination and filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'diet',
    required: false,
    description: 'Filter by diet type',
    enum: DietType,
  })
  @ApiQuery({
    name: 'cuisine',
    required: false,
    description: 'Filter by cuisine type',
    enum: CuisineType,
  })
  @ApiQuery({
    name: 'meal',
    required: false,
    description: 'Filter by meal type',
    enum: MealType,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in recipe names and descriptions',
    example: 'dal curry',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipes retrieved successfully',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('diet') diet?: DietType,
    @Query('cuisine') cuisine?: CuisineType,
    @Query('meal') meal?: MealType,
    @Query('search') search?: string,
  ) {
    const maxLimit = Math.min(limit, 50);
    this.logger.log(`Getting recipes: page=${page}, limit=${maxLimit}`);

    return this.recipesService.findAll(page, maxLimit, {
      diet,
      cuisine,
      meal,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipe by ID with ingredients and steps' })
  @ApiParam({
    name: 'id',
    description: 'Recipe UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipe retrieved successfully',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Getting recipe: ${id}`);
    return this.recipesService.findOne(id);
  }

  @Get(':id/nutrition')
  @ApiOperation({ summary: 'Get detailed nutrition information for recipe' })
  @ApiParam({
    name: 'id',
    description: 'Recipe UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipe nutrition retrieved successfully',
  })
  async getNutrition(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Getting nutrition for recipe: ${id}`);
    return this.recipesService.getNutrition(id);
  }
}
