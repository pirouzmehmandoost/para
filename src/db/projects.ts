import { asc, eq } from 'drizzle-orm'
import { db } from './db'
import { projectsTable } from './schema'
import type { Project } from '../types/project'
import { cacheLife, cacheTag } from 'next/cache'


type ProjectRow = typeof projectsTable.$inferSelect

function toBlobUrl(pathname: string): string {
  const base = process.env.PARA_PUBLIC_BLOB_STORE_BASE_URL

  if (!base) {
    throw new Error('PARA_PUBLIC_BLOB_STORE_BASE_URL is not set.')
  }

  return `${base.replace(/\/$/, '')}/${pathname.replace(/^\//, '')}`
}

function toProject(row: ProjectRow): Project {
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
      nodeName: row.nodeName,
      url: toBlobUrl(row.url),
      defaultMaterialID: row.defaultMaterialID,
      materialIDs: [...row.materialIDs],
      position: {
        x: row.position.x,
        y: row.position.y,
        z: row.position.z,
      },
      rotation: {
        x: row.rotation.x,
        y: row.rotation.y,
        z: row.rotation.z,
      },
      rotationSpeed: row.rotationSpeed,
      scale: row.scale,
    },
  }
}

export async function getAllProjects(): Promise<Project[]> {
  'use cache'
  cacheTag('projects')
  cacheLife('max')

  const rows = await db
    .select()
    .from(projectsTable)
    .orderBy(asc(projectsTable.displayOrder))

  return rows.map(toProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  'use cache'
  cacheTag('projects')
  cacheLife('max')

  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.slug, slug))
    .limit(1)

  return rows.length ? toProject(rows[0]) : null
}

// node_name carries no unique constraint, so this returns the first matching row.
export async function getProjectByNodeName(nodeName: string): Promise<Project | null> {
  'use cache'
  cacheTag('projects')
  cacheLife('max')

  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.nodeName, nodeName))
    .limit(1)

  return rows.length ? toProject(rows[0]) : null
}
