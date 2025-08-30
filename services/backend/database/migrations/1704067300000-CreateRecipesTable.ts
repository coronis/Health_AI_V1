import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecipesTable1704067300000 implements MigrationInterface {
  name = 'CreateRecipesTable1704067300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Recipes table
    await queryRunner.query(`
      CREATE TABLE "recipes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(200) NOT NULL,
        "name_hindi" varchar(300),
        "description" text,
        "category" varchar(20) CHECK ("category" IN ('breakfast', 'lunch', 'dinner', 'snack', 'beverage', 'dessert')),
        "cuisine_type" varchar(20) CHECK ("cuisine_type" IN ('indian', 'south_indian', 'north_indian', 'gujarati', 'punjabi', 'bengali', 'maharashtrian', 'continental', 'chinese', 'italian', 'mexican', 'mediterranean')),
        "difficulty" varchar(10) DEFAULT 'medium' CHECK ("difficulty" IN ('easy', 'medium', 'hard')),
        "prep_time_minutes" integer NOT NULL,
        "cook_time_minutes" integer NOT NULL,
        "total_time_minutes" integer NOT NULL,
        "serving_size" integer DEFAULT 1,
        "servings_per_recipe" integer DEFAULT 4,
        "is_vegetarian" boolean DEFAULT true,
        "is_vegan" boolean DEFAULT false,
        "is_gluten_free" boolean DEFAULT false,
        "is_dairy_free" boolean DEFAULT false,
        "is_low_carb" boolean DEFAULT false,
        "is_keto" boolean DEFAULT false,
        "calories" decimal(8,2) NOT NULL,
        "protein" decimal(8,2) NOT NULL,
        "carbohydrates" decimal(8,2) NOT NULL,
        "fat" decimal(8,2) NOT NULL,
        "fiber" decimal(8,2) NOT NULL,
        "sugar" decimal(8,2),
        "sodium" decimal(8,2),
        "glycemic_index" decimal(5,2),
        "glycemic_load" decimal(8,2),
        "ingredients" jsonb NOT NULL,
        "instructions" jsonb NOT NULL,
        "nutrition_breakdown" jsonb,
        "tags" text[],
        "allergens" text[],
        "image_url" varchar(500),
        "video_url" varchar(500),
        "source" varchar(200),
        "source_url" varchar(500),
        "author" varchar(100),
        "rating_average" decimal(3,2) DEFAULT 0,
        "rating_count" integer DEFAULT 0,
        "view_count" integer DEFAULT 0,
        "like_count" integer DEFAULT 0,
        "is_published" boolean DEFAULT false,
        "is_featured" boolean DEFAULT false,
        "moderation_status" varchar(20) DEFAULT 'pending',
        "data_source" varchar(50) DEFAULT 'internal',
        "data_quality_score" decimal(3,2) DEFAULT 0.8,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for Recipes table
    await queryRunner.query(`CREATE INDEX "IDX_recipes_category" ON "recipes" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_cuisine_type" ON "recipes" ("cuisine_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_prep_time" ON "recipes" ("prep_time_minutes")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_vegetarian" ON "recipes" ("is_vegetarian")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_vegan" ON "recipes" ("is_vegan")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_published" ON "recipes" ("is_published")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_featured" ON "recipes" ("is_featured")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_rating" ON "recipes" ("rating_average")`);
    await queryRunner.query(`CREATE INDEX "IDX_recipes_created_at" ON "recipes" ("created_at")`);
    
    // Full-text search index
    await queryRunner.query(`CREATE INDEX "IDX_recipes_search" ON "recipes" USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')))`);

    // Create trigger for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_recipes_updated_at 
      BEFORE UPDATE ON "recipes" 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create computed columns function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_recipe_computed_columns()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Update total time
          NEW.total_time_minutes = NEW.prep_time_minutes + NEW.cook_time_minutes;
          
          -- Update glycemic load if GI is provided
          IF NEW.glycemic_index IS NOT NULL THEN
              NEW.glycemic_load = (NEW.glycemic_index * NEW.carbohydrates) / 100.0;
          END IF;
          
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_recipe_computed_columns_trigger
      BEFORE INSERT OR UPDATE ON "recipes"
      FOR EACH ROW 
      EXECUTE FUNCTION update_recipe_computed_columns();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_recipe_computed_columns_trigger ON "recipes"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_recipe_computed_columns()`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_recipes_updated_at ON "recipes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "recipes"`);
  }
}