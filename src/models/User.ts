import { Model, Attributes } from '@fluentity/core';
import { HasOne, HasMany, BelongsTo, BelongsToMany, Relation } from '@fluentity/core';
import { Media } from './Media';
import { Thumbnail } from './Thumbnail';

/**
 * Interface defining the attributes for a User model
 * @interface UserAttributes
 * @extends {Attributes}
 */
export interface UserAttributes extends Attributes {
id: number;
name: string;
email: string;
media?: Media[];
thumbnail?: Thumbnail;
}

/**
 * User model class for interacting with the users API endpoint
 * @class User
 * @extends {Model<UserAttributes>}
 */
export class User extends Model<UserAttributes> {
  /** The API endpoint resource name for this model */
  static resource = 'users';

  declare id: number;
  declare name: string;
  declare email: string;
  declare media?: Media[];
  declare thumbnail?: Thumbnail;

  @HasMany(() => Media)
  medias: Relation<Media[]>;

  @HasOne(() => Thumbnail)
  thumbnail: Relation<Thumbnail>;
}
