#!/usr/bin/env node

import { Command } from 'commander';
import { generateModel } from './commands/generate-model.js';
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
  .option('-p, --path <path>', 'Path where the model should be generated', './src/models')
  .option('-f, --force', 'Overwrite existing model file if it exists')
  .action(async (name, options) => {
    try {
      await generateModel(name, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse(); 