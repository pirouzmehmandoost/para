import { MeshStandardMaterial, MeshPhysicalMaterial } from 'three'

export interface MaterialRecord {
  tailwindColor: string
  displayName: string
  material: MeshStandardMaterial | MeshPhysicalMaterial
  textures?: Record<string, string>
}