export * from './json-schemas/user.json';
export * from './json-schemas/meal-plan.json';

// Re-export schema validation utilities
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import userSchema from './json-schemas/user.json';
import mealPlanSchema from './json-schemas/meal-plan.json';

export const schemas = {
  user: userSchema,
  mealPlan: mealPlanSchema
};

export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    
    // Add schemas
    this.ajv.addSchema(userSchema, 'user');
    this.ajv.addSchema(mealPlanSchema, 'meal-plan');
  }

  validate(schemaName: string, data: any): { valid: boolean; errors?: any[] } {
    const validate = this.ajv.getSchema(schemaName);
    if (!validate) {
      throw new Error(`Schema '${schemaName}' not found`);
    }

    const valid = validate(data);
    return {
      valid,
      errors: validate.errors || undefined
    };
  }

  validateUser(data: any) {
    return this.validate('user', data);
  }

  validateMealPlan(data: any) {
    return this.validate('meal-plan', data);
  }
}

export default SchemaValidator;