import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { OpenAPIV3 } from 'openapi-types';
import chalk from 'chalk';

interface ModelDefinition {
  name: string;
  attributes: string;
  relationships: RelationshipDefinition[];
  resource: string;
}

interface RelationshipDefinition {
  name: string;
  type: 'HasOne' | 'HasMany' | 'BelongsTo' | 'BelongsToMany';
  model: string;
  foreignKey?: string;
}

export class OpenAPIParser {
  private spec: OpenAPIV3.Document;
  private models: Map<string, ModelDefinition> = new Map();
  private outputDir: string;
  private options: any;
  private specPath: string;

  constructor(specPath: string, options: any) {
    this.specPath = specPath;
    this.outputDir = options.path
    this.options = options;
  }

  async execute() {
    try {
        this.spec = JSON.parse(readFileSync(this.specPath, 'utf-8')) as OpenAPIV3.Document;
        this.parse();
    } catch (error) {
        console.log(chalk.red("Error parsing OpenAPI schema"));
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/([-_][a-z])/g, group =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
  }

  private toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  private detectRelationships(schema: OpenAPIV3.SchemaObject, modelName: string): RelationshipDefinition[] {
    const relationships: RelationshipDefinition[] = [];
    
    if (!schema.properties) return relationships;

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;
      if (typeof typedSchema === 'boolean') continue;

      // Handle array of references (HasMany or BelongsToMany)
      if (typedSchema.type === 'array' && typedSchema.items) {
        const items = typedSchema.items as OpenAPIV3.SchemaObject;
        if (items.$ref) {
          const refModel = this.getModelNameFromRef(items.$ref);
          relationships.push({
            name: propName,
            type: 'HasMany',
            model: refModel,
          });
        }
      }
      // Handle single reference (HasOne or BelongsTo)
      else if (typedSchema.$ref) {
        const refModel = this.getModelNameFromRef(typedSchema.$ref);
        // Check if this is a belongs-to relationship by looking for foreign key
        const hasForeignKey = Object.keys(schema.properties).includes(`${this.toCamelCase(refModel)}Id`);
        
        relationships.push({
          name: propName,
          type: hasForeignKey ? 'BelongsTo' : 'HasOne',
          model: refModel,
        });
      }
    }

    return relationships;
  }

  private getModelNameFromRef(ref: string): string {
    const parts = ref.split('/');
    return this.toPascalCase(parts[parts.length - 1]);
  }

  private generateAttributesInterface(schema: OpenAPIV3.SchemaObject): string {
    if (!schema.properties) return '';

    const attributes: string[] = [];
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;
      if (typeof typedSchema === 'boolean') continue;

      let type = 'any';
      if (typedSchema.type === 'array') {
        const items = typedSchema.items as OpenAPIV3.SchemaObject;
        type = items.$ref ? `${this.getModelNameFromRef(items.$ref)}[]` : 'any[]';
      } else if (typedSchema.$ref) {
        type = this.getModelNameFromRef(typedSchema.$ref);
      } else {
        type = this.mapOpenAPITypeToTypeScript(typedSchema.type as string);
      }

      const isOptional = !schema.required?.includes(propName);
      attributes.push(`${propName}${isOptional ? '?' : ''}: ${type};`);
    }

    return attributes.join('\n');
  }

  private mapOpenAPITypeToTypeScript(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      object: 'Record<string, any>',
      array: 'any[]'
    };
    return typeMap[type] || 'any';
  }

  private generateModelFile(model: ModelDefinition): string {
    const imports = [
      "import { Model, Attributes } from '@fluentity/core';",
      "import { HasOne, HasMany, BelongsTo, BelongsToMany, Relation } from '@fluentity/core';"
    ];

    // Add imports for related models
    const relatedModels = new Set(model.relationships.map(r => r.model));
    relatedModels.forEach(relatedModel => {
      imports.push(`import { ${relatedModel} } from './${this.toCamelCase(relatedModel)}';`);
    });

    const properties = model.attributes.split('\n').map(attr => `  declare ${attr}`);

    const relationshipProperties = model.relationships.map(rel => {
      const decoratorName = rel.type;
      const decorator = `  @${decoratorName}(() => ${rel.model})`;

      const isArray = rel.type === 'HasMany' || rel.type === 'BelongsToMany';
      return `${decorator}\n  ${isArray ? this.pluralize(rel.name) : rel.name}: Relation<${rel.model}${isArray ? '[]' : ''}>;`;
    });

    return `${imports.join('\n')}

/**
 * Interface defining the attributes for a ${model.name} model
 * @interface ${model.name}Attributes
 * @extends {Attributes}
 */
export interface ${model.name}Attributes extends Attributes {
${model.attributes}
}

/**
 * ${model.name} model class for interacting with the ${model.resource} API endpoint
 * @class ${model.name}
 * @extends {Model<${model.name}Attributes>}
 */
export class ${model.name} extends Model<${model.name}Attributes> {
  /** The API endpoint resource name for this model */
  static resource = '${model.resource}';

${properties.join('\n')}

${relationshipProperties.join('\n\n')}
}
`;
  }

  public parse(): void {
    // Create output directory if it doesn't exist
    mkdirSync(this.outputDir, { recursive: true });

    // Process all schemas
    if (this.spec.components?.schemas) {
      for (const [schemaName, schema] of Object.entries(this.spec.components.schemas)) {
        if (typeof schema === 'boolean') continue;

        const modelName = this.toPascalCase(schemaName);
        const resource = this.pluralize(schemaName);
        const attributes = this.generateAttributesInterface(schema);
        const relationships = this.detectRelationships(schema, modelName);

        this.models.set(modelName, {
          name: modelName,
          attributes,
          relationships,
          resource
        });
      }
    }

    // Generate model files
    for (const model of this.models.values()) {
      const fileContent = this.generateModelFile(model);
      const filePath = join(this.outputDir, `${this.toCamelCase(model.name)}.ts`);
      writeFileSync(filePath, fileContent);
    }

    console.log(chalk.green("Successfully parsed OpenAPI schema"));
  }

  private pluralize(schemaName: string) {
    return schemaName.toLowerCase() + 's';
  }
}
