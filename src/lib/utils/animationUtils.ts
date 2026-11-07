import { Euler, Mesh, Group, PerspectiveCamera, Vector3 } from 'three'
import { spring3 } from 'math/time'
import type { Spring } from 'math/time'
import type { Vec3 } from 'math'
import type { Transform3 } from '../../types/Transform3'

export const EPSILON_1e7: number = 1e-7
export const EPSILON_3e3: number = 3e-3
export const EPSILON_10e4: number = 10e-4

const scaleSprings = new WeakMap<Mesh | Group, Spring<Vec3>>()
const scaleGoal: Vec3 = [0, 0, 0]

function setScaleSprings(target: Mesh | Group): Spring<Vec3> {
  let state = scaleSprings.get(target)
  if (state === undefined) {
    state = spring3.create([target.scale.x, target.scale.y, target.scale.z])
    scaleSprings.set(target, state)
  }
  return state
}

export const angleDelta = (a: number, b: number): number => {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b))
}

export const eulerDistance = (current: Euler | Transform3, target: Euler | Transform3): number => {
  return Math.abs(angleDelta(current.x, target.x)) +
    Math.abs(angleDelta(current.y, target.y)) +
    Math.abs(angleDelta(current.z, target.z))
}

export const wrap = (value: number, min: number, max: number): number => {
  const range: number = max - min
  return ((((value - min) % range) + range) % range) + min
}

export const fitToPerspectiveCameraFrustum = (
  camera: PerspectiveCamera,
  sizeVector: Vector3,
  scaleVector: Vector3,
  target: Mesh | Group,
  targetScale: number,
  isCallerAnEffect: boolean = false,
  frameDelta: number = 0.08,
  zOffset?: number,
  smoothTime: number = 0.3,
): void => {
  
  const cameraDistanceZ: number = typeof zOffset === 'number' ? zOffset : 1
  const maxBoundingBoxDimension: number = Math.max(sizeVector.x, (sizeVector.y > 0 ? sizeVector.y : 1))
  const verticalFOVinRadians: number = (camera.fov * Math.PI) / 180
  const visibleHeight: number = 2 * Math.tan(verticalFOVinRadians / 2) * cameraDistanceZ
  const visibleWidth: number = visibleHeight * camera.aspect
  const targetSize: number = Math.min(visibleHeight, visibleWidth)
  const scaleFactor: number = targetScale * targetSize / (maxBoundingBoxDimension > 0 ? maxBoundingBoxDimension : 1)

  if (isCallerAnEffect) {
    scaleVector.set(scaleFactor, scaleFactor, scaleFactor)
    target.scale.set(scaleFactor, scaleFactor, scaleFactor)
    return
  }

  scaleVector.set(scaleFactor, scaleFactor, scaleFactor)

  if (target.scale.distanceTo(scaleVector) > EPSILON_10e4) {
    // easing.damp3(target.scale, scaleVector, 0.3, frameDelta)
    const state = setScaleSprings(target)
    scaleGoal[0] = scaleFactor
    scaleGoal[1] = scaleFactor
    scaleGoal[2] = scaleFactor
    spring3.damp(state, scaleGoal, smoothTime, frameDelta)
    target.scale.set(state.value[0], state.value[1], state.value[2])
  }
}