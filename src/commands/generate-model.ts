import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

// Move template to a separate file to avoid minification issues
const modelTemplate = `
import { Model, attribute, hasOne, hasMany } from '@fluentity/core';

{{#each relations}}
import { {{model}} } from './{{model}}';
{{/each}}

interface {{name}}Attributes {
  {{#each attributes}}
  {{name}}{{#unless required}}?{{/unless}}: {{type}};
  {{/each}}
}

export class {{name}} extends Model<{{name}}Attributes> {
  static resource = '{{resourceName}}';

  {{#each relations}}
  @{{type}}(() => {{model}})
  {{name}}!: {{#if (eq type 'hasOne')}}{{model}}{{else}}{{model}}[]{{/if}};
  {{/each}}
}
`.trim();

// Register handlebars helper
Handlebars.registerHelper('eq', function(a: unknown, b: unknown): boolean {
  return a === b;
});

const template = Handlebars.compile(modelTemplate);

export interface GenerateModelOptions {
  path: string;
  force: boolean;
}

export interface ModelAttributes {
  name: string;
  attributes: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  relations: Array<{
    name: string;
    type: 'hasOne' | 'hasMany';
    model: string;
  }>;
}

export class GenerateModel {
  constructor(private name?: string, private options: GenerateModelOptions = { path: './src/models', force: false }) {}

  async execute(): Promise<void> {
    await this.generateModel();
  }
  
  async generateModel(name?: string, options: GenerateModelOptions = { path: './src/models', force: false }): Promise<void> {
    // If name is not provided, prompt for it
    const modelName = name || (await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'What is the name of your model?',
      validate: (input: string) => input.length > 0 ? true : 'Model name is required'
    }])).name;
  
    // Prompt for attributes
    const attributes = await promptForAttributes();
    
    // Prompt for relations
    const relations = await promptForRelations();
  
    const modelData: ModelAttributes = {
      name: modelName,
      attributes,
      relations
    };
  
    // Generate the model file
    const content = template({
      ...modelData,
      resourceName: modelName.toLowerCase() + 's'
    });
  
    const filePath = path.join(options.path, `${modelName}.ts`);
    
    // Create directory if it doesn't exist
    await fs.ensureDir(path.dirname(filePath));
  
    // Check if file exists
    if (await fs.pathExists(filePath) && !options.force) {
      const { overwrite } = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: `Model file ${filePath} already exists. Overwrite?`,
        default: false
      }]);
  
      if (!overwrite) {
        console.log(chalk.yellow('Model generation cancelled.'));
        return;
      }
    }
  
    await fs.writeFile(filePath, content);
    console.log(chalk.green(`✓ Model ${modelName} generated successfully at ${filePath}`));
  }
}

async function promptForAttributes(): Promise<Array<{ name: string; type: string; required: boolean }>> {
  const attributes: Array<{ name: string; type: string; required: boolean }> = [];
  
  while (true) {
    const { addAttribute } = await inquirer.prompt([{
      type: 'confirm',
      name: 'addAttribute',
      message: 'Add an attribute?',
      default: false
    }]);

    if (!addAttribute) break;

    const attribute = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Attribute name:',
        validate: (input: string) => input.length > 0 ? true : 'Attribute name is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Attribute type:',
        choices: ['string', 'number', 'boolean', 'Date', 'object', 'type']
      },
      {
        type: 'input',
        name: 'typeName',
        message: 'Type name:',
        when: (answers) => answers.type === 'type',
        validate: (input: string) => input.length > 0 ? true : 'Type name is required'
      },
      {
        type: 'confirm',
        name: 'required',
        message: 'Is this attribute required?',
        default: true
      }
    ]);

    attribute.name = attribute.name.toLowerCase();

    if (attribute.type === 'type') {
      attribute.type = attribute.typeName.charAt(0).toUpperCase() + attribute.typeName.slice(1);
    }

    attributes.push(attribute);
  }

  return attributes;
}

async function promptForRelations(): Promise<Array<{ name: string; type: 'hasOne' | 'hasMany'; model: string }>> {
  const relations: Array<{ name: string; type: 'hasOne' | 'hasMany'; model: string }> = [];
  
  while (true) {
    const { addRelation } = await inquirer.prompt([{
      type: 'confirm',
      name: 'addRelation',
      message: 'Add a relation?',
      default: false
    }]);

    if (!addRelation) break;

    const relation = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Relation name:',
        validate: (input: string) => input.length > 0 ? true : 'Relation name is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Relation type:',
        choices: ['hasOne', 'hasMany']
      },
      {
        type: 'input',
        name: 'model',
        message: 'Related model name:',
        validate: (input: string) => input.length > 0 ? true : 'Related model name is required'
      }
    ]);

    relation.model = relation.model.charAt(0).toUpperCase() + relation.model.slice(1);
    relation.name = relation.name.toLowerCase();

    relations.push(relation);
  }

  return relations;
} 