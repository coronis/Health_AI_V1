import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeStep } from './entities/recipe-step.entity';
import { RecipeTag } from './entities/recipe-tag.entity';
import { RecipesController } from './controllers/recipes.controller';
import { RecipesService } from './services/recipes.service';
import { USDAApiClient } from '../../external/usda/usda-api.client';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeIngredient, RecipeStep, RecipeTag])],
  controllers: [RecipesController],
  providers: [RecipesService, USDAApiClient],
  exports: [RecipesService],
})
export class NutritionModule {}
