import { Box3, BufferGeometry, InstancedMesh, Matrix4, Mesh, Object3D, Vector3, } from 'three'

const _scratchCenter = new Vector3()
const _scratchBox = new Box3()
// WeakMap associates metadata with an object's identity without memory leaks. Automatic garbage collection of cached data
const _aabbCache = new WeakMap<InstancedMesh,{ box: Box3; count: number }>()
// Re-entrant object to avoid cross-call variable corruption (keep variables localized for re-entrancy)
class Scratch {
  static box = new Box3();
  static childBox = new Box3();
  static vec = new Vector3();
  static mat = new Matrix4();
}
export interface AABBCenterOptions {
  updateMatrices?: boolean // Caller controls the "hidden" cost of matrix updates
  preciseInstances?: boolean // Accuracy vs. speed toggle for InstancedMesh
}

/**
 * When getAABBCenterFast is called per-frame in a R3F component,
 * I'm comparing its computational and time complexity against GetAABBCenterSlow().
 * That's the basis for my claim in README.md about its performance. This is the basic block of logic that runs 
 * when calculating the bounding box of an upject per-frame and I'm trying to outperform it-
 * especially in cases where the target is a Mesh with no children.
 */
export function getAABBCenterSlow(
  target: Object3D,
  updateParents: boolean = true,
  updateChildren: boolean = false,
): Vector3 {
  if (!target) return

  _scratchBox.makeEmpty()
  target.updateWorldMatrix(updateParents, updateChildren)
  _scratchBox.setFromObject(target).getCenter(_scratchCenter)
  return _scratchCenter
}

/**
 * Manual cache invalidator for InstancedMeshes.
 * Call if instance matrices were modified without changing the instance count.
 * More Specifically, when you:
 *   - call .setMatrixAt()
 *   - Directly modify the .instanceMatrix.array (scale/rotate/translate instances)
 *   - Change the geometry of the InstancedMesh
 *   
 * No need to invalidate call if:
 *   - You change the position/rotation of the entire Mesh container (handled by .matrixWorld).
 *   - You never add InstancedMeshes to your scene. 
 *   - You modify the instance count. Won't hurt but getAABBCenterFast() handles it.
 * 
 * NOTE: 
 *  The caller must know when an instance moved. 
 *  By calling invalidateAABBCache(), the caller ensures the getAABBCenterFast() provides
 * data consistent with the current frame without having to perform its own change-detection logic.
 */
export function invalidateAABBCache(instanced: InstancedMesh): void { _aabbCache.delete(instanced) }

/** 
 * Set updateMatrices = default: true. setting to false exchanges perfomance gains with a potentially stale matrixWorld. 
 * Know the costs, use wisely, see "Fast path" in comments.
 * */
export function getAABBCenterFast(
  target: Object3D,
  out: Vector3,
  options: AABBCenterOptions = { updateMatrices: true, preciseInstances: true },
): Vector3 {
  if (!target?.isObject3D) return out

  const _s = Scratch
  _s.box.makeEmpty()

  // Best case: target is a leaf Mesh in the scene graph.
  if (target.children.length === 0 && 'geometry' in target && (target as any).isMesh) {
    if (options.updateMatrices) target.updateWorldMatrix(true, false)

    const geo = (target as Mesh).geometry as BufferGeometry

    if (!geo.boundingBox) geo.computeBoundingBox()

    // if (geo.boundingBox) {
    //   _s.box.copy(geo.boundingBox).applyMatrix4(target.matrixWorld);
    //   return _s.box.getCenter(out);
    // }
    if (geo.boundingBox) {
      geo.boundingBox.getCenter(out)
      return out.applyMatrix4(target.matrixWorld)
    }
  }

  const expand = (obj: Object3D) => {
    if (options.updateMatrices) obj.updateWorldMatrix(false, false)
    // Handle InstancedMesh
    if ('isInstancedMesh' in obj && (obj as any).isInstancedMesh) {
      const instanced = obj as InstancedMesh

      if (options.preciseInstances) {
        let cache = _aabbCache.get(instanced)

        if (!cache || cache.count !== instanced.count) {
          const fullBox = new Box3()
          const geo = instanced.geometry

          if (!geo.boundingBox) geo.computeBoundingBox()

          if (geo.boundingBox) {
            for (let i = 0; i < instanced.count; i++) {
              instanced.getMatrixAt(i, _s.mat)
              _s.childBox.copy(geo.boundingBox).applyMatrix4(_s.mat)
              fullBox.union(_s.childBox)
            }
            cache = { box: fullBox, count: instanced.count }
            _aabbCache.set(instanced, cache)
          }
        }

        if (cache) {
          _s.childBox.copy(cache.box).applyMatrix4(instanced.matrixWorld)
          _s.box.union(_s.childBox)
        }
      }
      // Fast path for InstancedMesh (Container only)
      else {
        const geo = instanced.geometry

        if (!geo.boundingBox) geo.computeBoundingBox()
        if (geo.boundingBox) {
          _s.childBox.copy(geo.boundingBox).applyMatrix4(instanced.matrixWorld)
          _s.box.union(_s.childBox)
        }
      }
    }
    // Handle Mesh, Points, Lines
    else if (
      'geometry' in obj &&
      (obj as any).geometry instanceof BufferGeometry
    ) {
      const geo = (obj as any).geometry as BufferGeometry

      if (!geo.boundingBox) geo.computeBoundingBox()

      if (geo.boundingBox) {
        _s.childBox.copy(geo.boundingBox).applyMatrix4(obj.matrixWorld)
        _s.box.union(_s.childBox)
      }
    }
    // Handle Leaf Nodes without Geometry (Lights/Cameras)
    // Only include the point if it's a leaf to avoid Group-origin pollution.
    else if (obj.children.length === 0 && ((obj as any).isLight || (obj as any).isCamera)) {
      _s.box.expandByPoint(obj.getWorldPosition(_s.vec))
    }

    for (let i = 0, l = obj.children.length; i < l; i++) {
      expand(obj.children[i])
    }
  }

  // One-time update of parent chain for the root target
  if (options.updateMatrices) target.updateWorldMatrix(true, false)

  expand(target)

  return _s.box.isEmpty() ? out.set(0, 0, 0) : _s.box.getCenter(out)
}
