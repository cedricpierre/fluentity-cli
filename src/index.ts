#!/usr/bin/env node

import { Command } from 'commander';
import { GenerateModel } from './commands/generate-model.js';
import { OpenAPIParser } from './commands/parse-openapi.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('fluentity')
  .description('CLI tool for Fluentity model generation')
  .version('1.0.0');

program
  .command('generate:model')
  .description('Generate a new Fluentity model')
  .argument('[name]', 'Name of the model to generate')
  .option('-p, --path <path>', 'Path where the model should be generated', './models')
  .option('-f, --force', 'Overwrite existing model file if it exists')
  .action(async (name, options) => {
    try {
      const generate = new GenerateModel(name, options);
      generate.execute();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program
  .command('parse:openapi')
  .description('Parse an OpenAPI schema file and generate models')
  .argument('<schema>', 'Path to the OpenAPI schema file')
  .option('-p, --path <path>', 'Path where the model should be generated', './models')
  .action(async (schema, options) => {
    try {
      const parser = await new OpenAPIParser(schema, options)
      parser.execute();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse(); 