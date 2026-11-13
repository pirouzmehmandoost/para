import type { Transform3 } from '../../types/Transform3'

interface TerrainGridProps {
  TERRAIN_MATERIAL_ID: string
  TERRAIN_NODE_NAME: string
  TERRAIN_URL: string
  TERRAIN_POSITION: Transform3
  TERRAIN_ROTATION: Transform3
  TERRAIN_SCALE: Transform3
  TERRAIN_GRID_COLUMNS: number
  TERRAIN_GRID_ROWS: number
  TERRAIN_GRID_SPACING: [row: number, column: number]
}

const terrainConfigs: TerrainGridProps = {
  TERRAIN_MATERIAL_ID: 'terrain',
  TERRAIN_NODE_NAME: 'terrain_2_low_poly',
  TERRAIN_URL: 'https://5aihfmsahakbuihc.public.blob.vercel-storage.com/meshes/terrain_2.glb',
  TERRAIN_POSITION: { x: 0, y: 0, z: -80 },
  TERRAIN_ROTATION: { x: Math.PI / 2.5, y: 0, z: 0 },
  TERRAIN_SCALE: { x: 0.55, y: 0.55, z: 0.55 },
  TERRAIN_GRID_COLUMNS: 3,
  TERRAIN_GRID_ROWS: 3,
  TERRAIN_GRID_SPACING: [1, 0.989],
}


export default terrainConfigs