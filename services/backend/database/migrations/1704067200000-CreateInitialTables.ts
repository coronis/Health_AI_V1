import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1704067200000 implements MigrationInterface {
  name = 'CreateInitialTables1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) UNIQUE NOT NULL,
        "phone_number" varchar(20) UNIQUE,
        "password_hash" varchar(255),
        "role" varchar(20) DEFAULT 'user' CHECK ("role" IN ('user', 'admin', 'moderator')),
        "status" varchar(20) DEFAULT 'active' CHECK ("status" IN ('active', 'inactive', 'suspended', 'deleted')),
        "email_verified" boolean DEFAULT false,
        "phone_verified" boolean DEFAULT false,
        "last_login_at" timestamp,
        "login_count" integer DEFAULT 0,
        "failed_login_attempts" integer DEFAULT 0,
        "locked_until" timestamp,
        "data_residency_region" varchar(10) DEFAULT 'IN',
        "pii_classification" varchar(20) DEFAULT 'PERSONAL',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" timestamp
      )
    `);

    // Create indexes for Users table
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_phone_number" ON "users" ("phone_number")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_created_at" ON "users" ("created_at")`);

    // Create User Profiles table
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "display_name" varchar(150),
        "birthday" date,
        "gender" varchar(20) CHECK ("gender" IN ('male', 'female', 'other', 'prefer_not_to_say')),
        "height" decimal(5,2),
        "weight" decimal(5,2),
        "activity_level" varchar(20) DEFAULT 'moderately_active' CHECK ("activity_level" IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
        "health_conditions" text[],
        "emergency_contact_name" varchar(100),
        "emergency_contact_phone" varchar(20),
        "city" varchar(100),
        "state" varchar(100),
        "country" varchar(10) DEFAULT 'IN',
        "timezone" varchar(50) DEFAULT 'Asia/Kolkata',
        "preferred_language" varchar(10) DEFAULT 'en',
        "supports_hinglish" boolean DEFAULT true,
        "avatar_url" varchar(500),
        "onboarding_completed" boolean DEFAULT false,
        "onboarding_step" integer DEFAULT 0,
        "phi_classification" varchar(20) DEFAULT 'HEALTH',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_profiles_user_id" ON "user_profiles" ("user_id")`);

    // Create User Preferences table
    await queryRunner.query(`
      CREATE TABLE "user_preferences" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "diet_type" varchar(20) DEFAULT 'vegetarian' CHECK ("diet_type" IN ('vegetarian', 'non_vegetarian', 'vegan', 'jain', 'halal')),
        "cuisines" text[],
        "allergies" text[],
        "food_dislikes" text[],
        "cooking_skill" varchar(20) DEFAULT 'beginner' CHECK ("cooking_skill" IN ('beginner', 'intermediate', 'advanced')),
        "meal_prep_time" varchar(20) DEFAULT 'medium' CHECK ("meal_prep_time" IN ('quick', 'medium', 'long')),
        "budget_range" varchar(20) DEFAULT 'moderate' CHECK ("budget_range" IN ('low', 'moderate', 'high')),
        "spice_tolerance" varchar(20) DEFAULT 'medium' CHECK ("spice_tolerance" IN ('mild', 'medium', 'high')),
        "notification_preferences" jsonb DEFAULT '{}',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_preferences_user_id" ON "user_preferences" ("user_id")`);

    // Create User Goals table
    await queryRunner.query(`
      CREATE TABLE "user_goals" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "primary_goal" varchar(20) DEFAULT 'maintenance' CHECK ("primary_goal" IN ('weight_loss', 'weight_gain', 'maintenance', 'muscle_gain')),
        "target_weight" decimal(5,2),
        "target_weight_timeline" varchar(20),
        "health_goals" text[],
        "fitness_goals" text[],
        "lifestyle_goals" text[],
        "current_weight" decimal(5,2),
        "starting_weight" decimal(5,2),
        "goal_notes" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_user_goals_user_id" ON "user_goals" ("user_id")`);

    // Create User Consents table
    await queryRunner.query(`
      CREATE TABLE "user_consents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "consent_type" varchar(50) NOT NULL,
        "consent_given" boolean DEFAULT false,
        "consent_text" text,
        "version" varchar(10),
        "consent_date" timestamp,
        "withdrawal_date" timestamp,
        "ip_address" varchar(45),
        "user_agent" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_user_consents_user_id" ON "user_consents" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_consents_type" ON "user_consents" ("consent_type")`);

    // Create Health Reports table
    await queryRunner.query(`
      CREATE TABLE "health_reports" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "report_type" varchar(50) NOT NULL,
        "file_name" varchar(255),
        "file_path" varchar(500),
        "file_size" integer,
        "file_type" varchar(50),
        "upload_status" varchar(20) DEFAULT 'uploaded' CHECK ("upload_status" IN ('uploaded', 'processing', 'processed', 'failed')),
        "processing_status" varchar(20) DEFAULT 'pending' CHECK ("processing_status" IN ('pending', 'processing', 'completed', 'failed')),
        "report_date" date,
        "lab_name" varchar(200),
        "doctor_name" varchar(200),
        "notes" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_health_reports_user_id" ON "health_reports" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_health_reports_type" ON "health_reports" ("report_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_health_reports_date" ON "health_reports" ("report_date")`);

    // Create Structured Entities table
    await queryRunner.query(`
      CREATE TABLE "structured_entities" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "health_report_id" uuid REFERENCES "health_reports"("id") ON DELETE CASCADE,
        "entity_type" varchar(50) NOT NULL,
        "entity_name" varchar(200) NOT NULL,
        "value" decimal(10,3),
        "unit" varchar(20),
        "reference_range_min" decimal(10,3),
        "reference_range_max" decimal(10,3),
        "is_normal" boolean,
        "is_flagged" boolean DEFAULT false,
        "confidence_score" decimal(3,2),
        "extracted_text" text,
        "position" jsonb,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_structured_entities_report_id" ON "structured_entities" ("health_report_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_structured_entities_type" ON "structured_entities" ("entity_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_structured_entities_name" ON "structured_entities" ("entity_name")`);

    // Create AI Decisions table
    await queryRunner.query(`
      CREATE TABLE "ai_decisions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "request_type" varchar(50) NOT NULL,
        "model_provider" varchar(50) NOT NULL,
        "model_name" varchar(100) NOT NULL,
        "model_version" varchar(20),
        "accuracy_level" varchar(10) CHECK ("accuracy_level" IN ('level_1', 'level_2')),
        "input_data" jsonb,
        "output_data" jsonb,
        "processing_time_ms" integer,
        "tokens_used" integer,
        "cost_usd" decimal(10,6),
        "confidence_score" decimal(3,2),
        "routing_reason" text,
        "fallback_used" boolean DEFAULT false,
        "request_ip" varchar(45),
        "session_id" varchar(100),
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_ai_decisions_user_id" ON "ai_decisions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_ai_decisions_type" ON "ai_decisions" ("request_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_ai_decisions_provider" ON "ai_decisions" ("model_provider")`);
    await queryRunner.query(`CREATE INDEX "IDX_ai_decisions_created_at" ON "ai_decisions" ("created_at")`);

    // Create updated_at trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    const tables = ['users', 'user_profiles', 'user_preferences', 'user_goals', 'user_consents', 'health_reports', 'structured_entities'];
    
    for (const table of tables) {
      await queryRunner.query(`
        CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON "${table}" 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    const tables = ['users', 'user_profiles', 'user_preferences', 'user_goals', 'user_consents', 'health_reports', 'structured_entities'];
    
    for (const table of tables) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON "${table}"`);
    }

    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Drop tables in reverse order (due to foreign key constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_decisions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "structured_entities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "health_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_consents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_goals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}