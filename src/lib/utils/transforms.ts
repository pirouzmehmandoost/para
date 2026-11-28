import { Euler, InstancedMesh, Matrix4, Object3D, Vector3 } from 'three'
import type { Transform3 } from '../../types/transform3'
import { validateNumberArray } from './validation'

// the only reason why this function is not exported from validation.ts is to separate those which depend on three.js
export function validateTransformData(
  value: Vector3 | Euler | Transform3 | number[]
) {
  if (!!!value) return false
  else if (validateNumberArray(value) && value.length === 3) return true
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

// setTransformData defends against writing NaN and Infinity into values of target,
// It does not guard against passing a target with those values.
// Any that are NaN and Infinity may be overwritten, pending all conditions on value evaluate to true.
export function setTransformData(
  target: Vector3 | Euler,
  value: Vector3 | Euler | Transform3 | [x: number, y: number, z: number]
) {
  if (!value || !target) return
  else if (
    validateNumberArray(value) && value.length === 3 &&
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

const _scratchContainer = new Object3D()

export function setInstanceRotation(
  instancedMesh: InstancedMesh,
  instanceID: number,
  instanceMatrix: Matrix4,
  axis: Vector3,
  angleAmount: number
): void {
  if (!instancedMesh || !(instancedMesh instanceof InstancedMesh)) return
  if (!axis || !(axis instanceof Vector3)) return
  if (typeof angleAmount !== 'number' || Number.isNaN(angleAmount)) return
  if (typeof instanceID !== 'number' || Number.isNaN(instanceID)) return

  instancedMesh.getMatrixAt(instanceID, instanceMatrix)
  instanceMatrix.decompose(_scratchContainer.position, _scratchContainer.quaternion, _scratchContainer.scale)
  _scratchContainer.rotateOnAxis(axis, angleAmount)
  _scratchContainer.updateMatrix()
  instancedMesh.setMatrixAt(instanceID, _scratchContainer.matrix)
  instancedMesh.instanceMatrix.needsUpdate = true
}
