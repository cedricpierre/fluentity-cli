export interface ModelDefinition {
  name: string;
  attributes: AttributeDefinition[];
  properties: PropertyDefinition[];
  resource: string;
  relationships: RelationshipDefinition[];
}

export type AttributeDefinition = {
  name: string;
  type: string;
  isArray: boolean;
  required: boolean;
}

export type PropertyDefinition = AttributeDefinition;

export interface RelationshipDefinition {
  name: string;
  type: RelationshipType;
  model: string;
  foreignKey?: string;
}

export type RelationshipType = 'HasOne' | 'HasMany' | 'BelongsTo' | 'BelongsToMany';

export default (model: ModelDefinition) => `
import { Model, Attributes } from '@fluentity/core';
import { HasOne, HasMany, BelongsTo, BelongsToMany, Relation } from '@fluentity/core';

${model.relationships.map(rel => `import { ${rel.model} } from './${rel.model}';`).join('\n')}

/**
 * Interface defining the attributes for a ${model.name} model
 * @interface ${model.name}Attributes
 * @extends {Attributes}
 */
export interface ${model.name}Attributes extends Attributes {
${model.attributes.map(attr => `  ${attr.name}${attr.required ? '' : '?'}: ${attr.type}${attr.isArray ? '[]' : ''};`).join('\n')}
}

/**
 * ${model.name} model class for interacting with the ${model.resource} API endpoint
 * @class ${model.name}
 * @extends {Model<${model.name}Attributes>}
 */
export class ${model.name} extends Model<${model.name}Attributes> implements ${model.name}Attributes {
  /** The API endpoint resource name for this model */
  static resource = '${model.resource}';

${model.properties.map(attr => `  declare ${attr.name}${attr.required ? '' : '?'}: ${attr.type}${attr.isArray ? '[]' : ''};`).join('\n')}

${model.relationships.map(rel => {
  const decoratorName = rel.type;
  const decorator = `  @${decoratorName}(() => ${rel.model})`;

  const isArray = rel.type === 'HasMany' || rel.type === 'BelongsToMany';
  return `${decorator}\n  ${rel.name}: Relation<${rel.model}${isArray ? '[]' : ''}>;`;
}).join('\n\n')}
}
`;