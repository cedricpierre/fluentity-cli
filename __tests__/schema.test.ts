import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { test, expect, describe, beforeEach } from 'bun:test';

const execAsync = promisify(exec);

describe('fluentity parse:openapi', () => {
  const cliPath = path.join(__dirname, '../dist/index.js');
  
  beforeEach(() => {
    // Ensure the CLI is built
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  test('should exist as a command', async () => {
    const { stdout } = await execAsync(`${cliPath} --help`);
    expect(stdout).toContain('parse:openapi');
  });

  test('should require a filename argument', async () => {
    await expect(execAsync(`${cliPath} parse:openapi`))
      .rejects
      .toThrow();
  });

  test('should parse a valid OpenAPI schema file', async () => {
    // Create a temporary OpenAPI schema file
    const schemaPath = path.join(__dirname, 'test-schema.json');
    const modelsDir = path.join(__dirname, '../models');
    
    try {
      const { stdout } = await execAsync(`${cliPath} parse:openapi "${schemaPath}" --path "${modelsDir}"`);
      
      // Verify the command executed successfully
      expect(stdout).toContain('Successfully parsed OpenAPI schema');
      
      // Verify that model files were generated
      const userModelPath = path.join(modelsDir, 'User.ts');
      
      expect(fs.existsSync(userModelPath)).toBe(true);
      
      // Verify the generated model content
      const modelContent = await fs.readFile(userModelPath, 'utf-8');
      
      expect(modelContent).toContain('export class User extends Model');
      expect(modelContent).toContain('id: number');
      expect(modelContent).toContain('name: string');
      expect(modelContent).toContain('email?: string');
    } finally {
      // Cleanup
      //await fs.remove(modelsDir);
    }
  });

  test('should handle invalid OpenAPI schema files', async () => {
    const tempDir = path.join(__dirname, 'temp');
    const invalidSchemaPath = path.join(__dirname, 'invalid-test-schema.json');
    
    const { stdout } = await execAsync(`${cliPath} parse:openapi "${invalidSchemaPath}"`);

    expect(stdout).toContain('Error parsing OpenAPI schema');
  });
});
