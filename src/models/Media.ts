import { Model, Attributes } from '@fluentity/core';
import { HasOne, HasMany, BelongsTo, BelongsToMany, Relation } from '@fluentity/core';

/**
 * Interface defining the attributes for a Media model
 * @interface MediaAttributes
 * @extends {Attributes}
 */
export interface MediaAttributes extends Attributes {
id: number;
type: string;
url: string;
title?: string;
description?: string;
createdAt?: string;
userId: number;
}

/**
 * Media model class for interacting with the medias API endpoint
 * @class Media
 * @extends {Model<MediaAttributes>}
 */
export class Media extends Model<MediaAttributes> {
  /** The API endpoint resource name for this model */
  static resource = 'medias';

  declare id: number;
  declare type: string;
  declare url: string;
  declare title?: string;
  declare description?: string;
  declare createdAt?: string;
  declare userId: number;


}
