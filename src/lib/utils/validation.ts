import { Euler, Vector3 } from 'three'
import type { Transform3 } from '../../types/Transform3'

export function isNumberArray(value: unknown): value is number[] {
  if (!Array.isArray(value) || value.length !== 3) return false
  for (let i = 0; i < 3; i++) {
    const item = value[i]
    if (
      typeof item !== 'number' ||
      Number.isNaN(item) ||
      item === Infinity ||
      item === -Infinity
    ) return false
  }
  return true
}

// setTransformData defends against writing NaN and Infinity into values of target,
// It does not guard against passing a target with those values.
// Any that are NaN and Infinity may be overwritten, pending all conditions on value evaluate to true.
export function setTransformData(
  target: Vector3 | Euler,
  value: Vector3 | Euler | Transform3 | [x: number, y: number, z: number]
) {
  if (!value || !target) return
  else if (
    isNumberArray(value) && value.length === 3 &&
    (value[0] !== target.x || value[1] !== target.y || value[2] !== target.z)
  ) {
    target.set(value[0], value[1], value[2])
  }
  else if (
    (
      value instanceof Euler ||
      value instanceof Vector3
    ) &&
    (
      (
        !Number.isNaN(value.x) && !(value.x === Infinity || value.x === -Infinity) &&
        !Number.isNaN(value.y) && !(value.y === Infinity || value.y === -Infinity) &&
        !Number.isNaN(value.z) && !(value.z === Infinity || value.z === -Infinity)
      ) &&
      (
        value.x !== target.x ||
        value.y !== target.y ||
        value.z !== target.z
      )
    )
  ) {
    target.set(value.x, value.y, value.z)
  }
  else if (
    ('x' in value && typeof (value as Transform3).x === 'number' && !Number.isNaN(value.x) && !(value.x === Infinity || value.x === -Infinity)) &&
    ('y' in value && typeof (value as Transform3).y === 'number' && !Number.isNaN(value.y) && !(value.y === Infinity || value.y === -Infinity)) &&
    ('z' in value && typeof (value as Transform3).z === 'number' && !Number.isNaN(value.z) && !(value.z === Infinity || value.z === -Infinity)) &&
    (value.x !== target.x || value.y !== target.y || value.z !== target.z)
  ) {
    target.set(value.x, value.y, value.z)
  }
}

export function validateTransformData(
  value: Vector3 | Euler | Transform3 | number[]
) {
  if (!!!value) return false
  else if (isNumberArray(value) && value.length === 3) return true
  else if (
    value instanceof Euler || value instanceof Vector3 ||
    (
      'x' in value && typeof (value as Transform3).x === 'number' &&
      'y' in value && typeof (value as Transform3).y === 'number' &&
      'z' in value && typeof (value as Transform3).z === 'number'
    )
  ) {
    if (
      !Number.isNaN(value.x) && !(value.x === Infinity || value.x === -Infinity) &&
      !Number.isNaN(value.y) && !(value.y === Infinity || value.y === -Infinity) &&
      !Number.isNaN(value.z) && !(value.z === Infinity || value.z === -Infinity)

    ) return true
    else return false
  }
  else return false
}