import {
  boolean,
  check,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
// import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/typebox';
// import { Type } from 'typebox';
// import { Value } from 'typebox/value';

export const projectsTable = pgTable(
  'projects',
  {
    id: uuid().defaultRandom().primaryKey(),

    slug: text('slug').notNull().unique(),

    displayOrder: integer('display_order').notNull().unique(),

    displayName: text('display_name').notNull(),
    care: text('care').notNull().default(''),
    description: text('description').notNull().default(''),
    dimensions: text('dimensions').notNull().default(''),
    materialSpecs: text('material_specs').notNull().default(''),
    shortDescription: text('short_description').notNull().default(''),
    weight: text('weight').notNull().default(''),

    url: text('blob_pathname').notNull().unique(),
    nodeName: text('node_name').notNull(),
    defaultMaterialID: text('default_material_id').notNull(),
    materialIDs: text('material_ids').array().notNull(),

    animateMaterial: boolean('animate_material').notNull().default(true),
    animatePosition: boolean('animate_position').notNull().default(false),
    animateRotation: boolean('animate_rotation').notNull().default(true),

    rotation: jsonb('rotation')
      .$type<{ x: number; y: number; z: number }>()
      .notNull()
      .default({ x: 0, y: 0, z: 0 }),

    rotationSpeed: doublePrecision('rotation_speed').notNull().default(0.5),
    scale: doublePrecision('scale').notNull().default(1.0),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check('scale_safe_range', sql`${table.scale} > 0`),
    check('display_order_safe_range', sql`${table.displayOrder} >= 0`),

    check('default_material_id_length', sql`char_length(${table.defaultMaterialID}) > 0`),
    check('default_material_id_in_material_ids', sql`${table.defaultMaterialID} = ANY (${table.materialIDs})`),

    check('material_ids_not_empty', sql`cardinality(${table.materialIDs}) >= 1`),
    check('material_ids_no_blanks', sql`NOT ('' = ANY (${table.materialIDs}))`),

    check('slug_alphanumeric_characters', sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),

    check('display_name_length', sql`char_length(${table.displayName}) > 0`),
    check('blob_pathname_length', sql`char_length(${table.url}) > 0`),
    check('node_name_length', sql`char_length(${table.nodeName}) > 0`),

    check(
      'rotation_components_are_numbers',
      sql`jsonb_typeof(${table.rotation} -> 'x') = 'number'
        AND jsonb_typeof(${table.rotation} -> 'y') = 'number'
        AND jsonb_typeof(${table.rotation} -> 'z') = 'number'`,
    ),
  ],
);