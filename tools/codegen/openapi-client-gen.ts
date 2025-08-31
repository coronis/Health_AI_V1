#!/usr/bin/env node

/**
 * OpenAPI Client Generator
 * Generates TypeScript clients from OpenAPI specifications
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface GeneratorConfig {
  specPath: string;
  outputPath: string;
  clientName: string;
  packageName: string;
}

const configs: GeneratorConfig[] = [
  {
    specPath: '../../data/schemas/openapi.yml',
    outputPath: '../../packages/api-client',
    clientName: 'HealthCoachAIClient',
    packageName: '@healthcoachai/api-client'
  },
  {
    specPath: '../../services/backend/openapi/schema.json',
    outputPath: '../../packages/backend-client',
    clientName: 'BackendClient', 
    packageName: '@healthcoachai/backend-client'
  }
];

function generateClient(config: GeneratorConfig) {
  console.log(`Generating client for ${config.clientName}...`);
  
  // Ensure output directory exists
  if (!existsSync(config.outputPath)) {
    mkdirSync(config.outputPath, { recursive: true });
  }
  
  // Check if spec file exists
  if (!existsSync(config.specPath)) {
    console.warn(`⚠️  Spec file not found: ${config.specPath}`);
    return;
  }
  
  try {
    // Generate client using openapi-generator-cli
    const command = [
      'npx openapi-generator-cli generate',
      `-i ${config.specPath}`,
      `-g typescript-axios`,
      `-o ${config.outputPath}`,
      `--additional-properties=modelPackage=models,apiPackage=api,npmName=${config.packageName}`
    ].join(' ');
    
    execSync(command, { stdio: 'inherit' });
    
    // Generate package.json
    const packageJson = {
      name: config.packageName,
      version: '0.1.0',
      description: `Generated API client for ${config.clientName}`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        clean: 'rm -rf dist'
      },
      dependencies: {
        axios: '^1.6.0'
      },
      devDependencies: {
        typescript: '^5.3.0',
        '@types/node': '^20.11.0'
      }
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      join(config.outputPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log(`✅ Generated ${config.clientName} successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to generate ${config.clientName}:`, error);
  }
}

function main() {
  console.log('🔧 Generating OpenAPI clients...\n');
  
  // Install openapi-generator-cli if not present
  try {
    execSync('npx openapi-generator-cli version', { stdio: 'pipe' });
  } catch {
    console.log('Installing openapi-generator-cli...');
    execSync('npm install -g @openapitools/openapi-generator-cli', { stdio: 'inherit' });
  }
  
  configs.forEach(generateClient);
  
  console.log('\n🎉 Client generation completed!');
}

if (require.main === module) {
  main();
}

export { generateClient, GeneratorConfig };