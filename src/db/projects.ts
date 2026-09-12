import { asc, eq } from 'drizzle-orm';
import { db } from './db';
import { projectsTable } from './schema';
import type { Project } from '../types/project';

export type ProjectRecord = Project;

type ProjectRow = typeof projectsTable.$inferSelect;

function toBlobUrl(pathname: string): string {
  const base = process.env.PARA_PUBLIC_BLOB_STORE_BASE_URL;

  if (!base) {
    throw new Error('PARA_PUBLIC_BLOB_STORE_BASE_URL is not set.');
  }

  return `${base.replace(/\/$/, '')}/${pathname.replace(/^\//, '')}`;
}

function toProject(row: ProjectRow): ProjectRecord {
  return {
    UIData: {
      care: row.care,
      description: row.description,
      dimensions: row.dimensions,
      displayName: row.displayName,
      materialSpecs: row.materialSpecs,
      shortDescription: row.shortDescription,
      slug: row.slug,
      weight: row.weight,
    },
    sceneData: {
      animateMaterial: row.animateMaterial,
      animatePosition: row.animatePosition,
      animateRotation: row.animateRotation,
      fileData: {
        nodeName: row.nodeName,
        url: toBlobUrl(row.url),
      },
      materials: {
        defaultMaterialID: row.defaultMaterialID,
        materialIDs: [...row.materialIDs],
      },
      rotation: {
        x: row.rotation.x,
        y: row.rotation.y,
        z: row.rotation.z,
      },
      rotationSpeed: row.rotationSpeed,
      scale: row.scale,
    },
  };
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  const rows = await db
    .select()
    .from(projectsTable)
    .orderBy(asc(projectsTable.displayOrder));

  return rows.map(toProject);
}

export async function getProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.slug, slug))
    .limit(1);

  return rows.length ? toProject(rows[0]) : null;
}

// node_name carries no unique constraint, so this returns the first matching row.
export async function getProjectByNodeName(nodeName: string): Promise<ProjectRecord | null> {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.nodeName, nodeName))
    .limit(1);

  return rows.length ? toProject(rows[0]) : null;
}
