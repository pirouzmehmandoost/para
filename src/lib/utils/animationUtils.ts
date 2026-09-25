import { Euler, Mesh, PerspectiveCamera, Vector3 } from 'three'
import { easing } from 'maath'
import type { EulerValue } from '../../types/EulerValue'
// Materials in materialStore have an intentionally imperceptible clearcoat value set to = 1e-7 and clearcoatRoughness = 1.
// This is to avoid a strangely sharp specular highlight when a clearcoat value eases from 1.0 > n > 0.0 to 0.0.

// If materials have transmissive properties, the following properties should be set for all materials: 
// thickness: 0, transmission: EPSILON_1e7, transparent: true, transmission: a transmission DataTexture, needsUpdate: true
// This is to avoid shader program recompilation when animating transmissive properties (easing or otherwise). 
// This is at the cost of having transmissive MeshPhysicalMaterial instances when property values are copied from materialStore or the default physical material config object.
// The materialStore no longer persists transmissive instances.

export const EPSILON_1e7: number = 1e-7
export const EPSILON_3e3: number = 3e-3
export const EPSILON_10e4: number = 10e-4

export const angleDelta = (a: number, b: number): number => {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b))
}

export const eulerDistance = (
  current: Euler | EulerValue,
  target: Euler | EulerValue
): number => {
  return Math.abs(angleDelta(current.x, target.x)) +
    Math.abs(angleDelta(current.y, target.y)) +
    Math.abs(angleDelta(current.z, target.z))
}

export const wrap = (value: number, min: number, max: number): number => {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

export const fitToPerspectiveCameraFrustum = (
  camera: PerspectiveCamera,
  sizeVector: Vector3,
  scaleVector: Vector3,
  target: Mesh,
  targetScale: number,
  isCallerAnEffect: boolean = false,
  frameDelta: number,
  zOffset?: number
): void => {
  const cameraDistanceZ = typeof zOffset === 'number' ? zOffset : 1
  const maxBoundingBoxDimension: number = Math.max(sizeVector.x, sizeVector.y)
  const verticalFOVinRadians = (camera.fov * Math.PI) / 180
  const visibleHeight = 2 * Math.tan(verticalFOVinRadians / 2) * cameraDistanceZ
  const visibleWidth = visibleHeight * camera.aspect
  const targetSize = Math.min(visibleHeight, visibleWidth)
  const scaleFactor: number = targetScale * targetSize / (maxBoundingBoxDimension > 0 ? maxBoundingBoxDimension : 1)

  if (isCallerAnEffect) {
    scaleVector.set(scaleFactor, scaleFactor, scaleFactor)
    target.scale.set(scaleFactor, scaleFactor, scaleFactor)
    return
  }

  scaleVector.set(scaleFactor, scaleFactor, scaleFactor)

  if (target.scale.distanceTo(scaleVector) > EPSILON_10e4) {
    easing.damp3(target.scale, scaleVector, 0.3, frameDelta)
  }
}