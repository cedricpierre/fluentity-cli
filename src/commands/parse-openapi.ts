import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { OpenAPIV3 } from 'openapi-types';
import chalk from 'chalk';
import { AttributeDefinition, ModelDefinition, PropertyDefinition, RelationshipDefinition } from '../model.stub.js';
import modelStub from '../model.stub.js';

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
      console.log(error);
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

    const filteredProperties = Object.entries(schema.properties).filter(([_, propSchema]) => {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;
      return typedSchema.$ref || (typedSchema.type === 'array' && typedSchema.items?.$ref);
    });

    for (const [propName, propSchema] of filteredProperties) {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;
      if (typeof typedSchema === 'boolean') continue;

      // Handle array of references (HasMany or BelongsToMany)
      if (typedSchema.type === 'array' && typedSchema.items) {
        if (typedSchema.items.$ref) {
          const refModel = this.getModelNameFromRef(typedSchema.items.$ref);
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

  private generateProperties(schema: OpenAPIV3.SchemaObject): PropertyDefinition[] {
    if (!schema.properties) return [];
    const properties = [] as PropertyDefinition[];

    const filteredProperties = Object.entries(schema.properties).filter(([_, propSchema]) => {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;
      return !typedSchema.$ref && !(typedSchema.type === 'array' && typedSchema.items?.$ref);
    });
    for (let [propName, propSchema] of filteredProperties) {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;

      let type = 'any';
      let isArray = typedSchema.type === 'array';
      const isOptional = !schema.required?.includes(propName);

      
      properties.push({
        name: propName,
        type,
        isArray: isArray,
        required: !isOptional
      });
    
    }

    return properties;
  }

  private generateAttributesInterface(schema: OpenAPIV3.SchemaObject): AttributeDefinition[] {
    if (!schema.properties) return [];

    const attributes = [] as AttributeDefinition[];
    for (let [propName, propSchema] of Object.entries(schema.properties)) {
      const typedSchema = propSchema as OpenAPIV3.SchemaObject;

      let type = 'any';
      let isArray = typedSchema.type === 'array';
      let isOptional = false

      if (typedSchema.$ref) {
        type = this.getModelNameFromRef(typedSchema.$ref);
      } else if (typedSchema.type === 'array' && typedSchema.items?.$ref) {
        type = this.getModelNameFromRef(typedSchema.items.$ref);
      } else {
        type = this.mapOpenAPITypeToTypeScript(typedSchema.type as string);
        isOptional = !schema.required?.includes(propName);
      }

      attributes.push({
        name: propName,
        type,
        isArray: isArray,
        required: !isOptional
      });
    }

    return attributes
  }

  private mapOpenAPITypeToTypeScript(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      number: 'number',
      integer: 'number',
      boolean: 'boolean',
      object: 'Record<string, any>',
      array: 'any'
    };
    return typeMap[type] || 'any';
  }

  private generateModelFile(model: ModelDefinition): string {
    return modelStub(model);
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
        const properties = this.generateProperties(schema);
        const relationships = this.detectRelationships(schema, modelName);

        this.models.set(modelName, {
          name: modelName,
          attributes,
          properties,
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
