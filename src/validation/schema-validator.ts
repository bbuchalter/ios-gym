import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

export class SchemaValidator {
  private ajv: Ajv;
  private validate: ValidateFunction;
  
  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true,
      verbose: true 
    });
    addFormats(this.ajv);
    
    // Load and compile the exercise schema
    const schemaPath = path.join(process.cwd(), 'web/schemas/exercise.schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    
    this.validate = this.ajv.compile(schema);
  }
  
  validateExercise(exercise: unknown): { valid: boolean; errors: string[] } {
    const valid = this.validate(exercise);
    
    if (!valid && this.validate.errors) {
      const errors = this.validate.errors.map(err => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation error';
        
        // Include params for more context
        if (err.params) {
          if (err.params.missingProperty) {
            return `${path}: missing required property '${err.params.missingProperty}'`;
          }
          if (err.params.allowedValues) {
            return `${path}: ${message} (allowed: ${err.params.allowedValues.join(', ')})`;
          }
        }
        
        return `${path}: ${message}`;
      });
      
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  }
}

