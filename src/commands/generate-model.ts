import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import modelStub, { AttributeDefinition, ModelDefinition, RelationshipDefinition } from '../model.stub.js';



export interface GenerateModelOptions {
  path: string;
  force: boolean;
}


export class GenerateModel {
  constructor(private name?: string, private options: GenerateModelOptions = { path: './models', force: false }) {
    
  }

  async execute(): Promise<void> {
    await this.generateModel();
  }
  
  async generateModel() {
    // If name is not provided, prompt for it
    const modelName = this.name || (await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'What is the name of your model?',
      validate: (input: string) => input.length > 0 ? true : 'Model name is required'
    }])).name;
  
    // Prompt for attributes
    const attributes = await promptForAttributes();
    
    // Prompt for relations
    const relations = await promptForRelations();
  
    const modelData: ModelDefinition = {
      name: modelName,
      resource: modelName.toLowerCase(),
      attributes: attributes,
      properties: attributes,
      relationships: relations
    };

    const content = modelStub(modelData);
  

    const filePath = path.join(this.options.path, `${modelName}.ts`);
    
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

async function promptForAttributes(): Promise<Array<AttributeDefinition>> {
  const attributes: Array<AttributeDefinition> = [];
  
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
        choices: ['string', 'number', 'boolean', 'any', 'other']
      },
      {
        type: 'input',
        name: 'typeName',
        message: 'Type name:',
        when: (answers) => answers.type === 'other',
        validate: (input: string) => input.length > 0 ? true : 'Type is required',
      },
      {
        type: 'confirm',
        name: 'isArray',
        message: 'Is this attribute an array?',
        default: false
      },      
      {
        type: 'confirm',
        name: 'required',
        message: 'Is this attribute required?',
        default: true
      }
    ]);

    attribute.name = attribute.name.toLowerCase();

    if (attribute.type === 'other') {
      attribute.type = attribute.typeName.charAt(0).toUpperCase() + attribute.typeName.slice(1);
    }

    attributes.push(attribute);
  }

  return attributes;
}

async function promptForRelations(): Promise<Array<RelationshipDefinition>> {
  const relations: Array<RelationshipDefinition> = [];
  
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
        choices: ['HasOne', 'HasMany', 'BelongsTo', 'BelongsToMany']
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
    relation.isArray = ['HasMany', 'BelongsToMany'].includes(relation.type);
    relation.required = true;

    relations.push(relation);
  }

  return relations;
} 