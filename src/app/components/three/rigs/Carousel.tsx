'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { Euler, Object3D, Quaternion, Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { easing as oldEasing } from 'maath'
import carouselConfigs from '@configs/carouselConfigs'
import useSelection from '@stores/selectionStore'
import useTargetRegistry from '@stores/targetRegistryStore'
import { getAABBCenterFast } from '@utils/positionUtils'
import { setTransformData } from '@utils/validation'
import type { Transform3 } from '../../../../types/Transform3'
import type { RegistryEntry } from '@/lib/targetRegistry/TargetRegistry'
import { quat, vec3, remapClamp } from 'math'
import type { Vec3, Quat } from 'math'
import { easing } from 'math/time'

const lookAtQuaternion: Quat = quat.create()
const currentQuaternion: Quat = quat.create()
const cameraForward: Vec3 = [0, 0, -1]
const restDirection: Vec3 = [0, 0, 0]
const aimDirection: Vec3 = [0, 0, 0]
const restQuat: Quat = quat.create()
const aimQuat: Quat = quat.create()
const inner = 100
const outer = 400

const {
  MANUAL_DWELL_SECONDS,
  AUTO_DWELL_SECONDS,
  SWIPE_DELTA_DISTANCE,
  SWIPE_DELTA_TIME_MS,
  DEFAULT_POSITION,
  OFFSET_POSITION,
  LOOKAT_POSITION
} = carouselConfigs

const positiveOr = (value: number, fallback: number): number => (value > 0 ? value : fallback)

interface PointerData {
  x: number
  y: number
  time: number
}

interface CarouselTestProps {
  defaultPosition?: [x: number, y: number, z: number] | Transform3 | Vector3
  lookAtPosition?: [x: number, y: number, z: number] | Transform3 | Euler
  offsetPosition?: [x: number, y: number, z: number] | Transform3 | Vector3
  onSwipe?: (e: PointerEvent) => void
  autoDwellTime?: number
  manualDwellTime?: number
  swipeDistanceThreshold?: number
  swipeTimeThreshold?: number
}
const Carousel = ({
  defaultPosition = undefined,
  lookAtPosition = undefined,
  offsetPosition = undefined,
  onSwipe = undefined,
  autoDwellTime = AUTO_DWELL_SECONDS,
  manualDwellTime = MANUAL_DWELL_SECONDS,
  swipeDistanceThreshold = SWIPE_DELTA_DISTANCE,
  swipeTimeThreshold = SWIPE_DELTA_TIME_MS,
}: CarouselTestProps) => {
  const _scratchCenterRef = useRef<Vector3>(new Vector3())
  const _scratchLookAtRef = useRef<Vector3>(new Vector3())
  const _scratchPositionRef = useRef<Vector3>(new Vector3())
  const defaultPositionRef = useRef<Vector3>(new Vector3())
  const offsetPositionRef = useRef<Vector3>(new Vector3())
  const lookAtPositionRef = useRef<Vector3>(new Vector3())

  const lastSampleTargetRef = useRef<Object3D | null>(null)
  const lastSamplePositionRef = useRef<Vector3>(new Vector3())
  const lastSampleQuaternionRef = useRef<Quaternion>(new Quaternion())
  const lastSampleScaleRef = useRef<Vector3>(new Vector3())

  const domElement = useThree((state) => state.gl.domElement)
  const get = useThree((state) => state.get)

  const isCameraOrientationSet = useRef<boolean>(false)

  const autoDwellTimeRef = useRef<number>(AUTO_DWELL_SECONDS)
  const manualDwellTimeRef = useRef<number>(MANUAL_DWELL_SECONDS)
  const swipeDistanceThresholdRef = useRef<number>(SWIPE_DELTA_DISTANCE)
  const swipeDeltaTimeRef = useRef<number>(SWIPE_DELTA_TIME_MS)

  const activePointerIdRef = useRef<number>(null)
  const pointerStartRef = useRef<PointerData>(null)

  const dwellRemainingRef = useRef<number>(0)
  const phaseRef = useRef<number>(0)

  const targetIndexRef = useRef<number>(0)

  useLayoutEffect(() => {
    swipeDistanceThresholdRef.current = positiveOr(swipeDistanceThreshold, swipeDistanceThresholdRef.current)
    swipeDeltaTimeRef.current = positiveOr(swipeTimeThreshold, swipeDeltaTimeRef.current)
    manualDwellTimeRef.current = positiveOr(manualDwellTime, manualDwellTimeRef.current)
    autoDwellTimeRef.current = positiveOr(autoDwellTime, autoDwellTimeRef.current)
    dwellRemainingRef.current = autoDwellTimeRef.current
  }, [autoDwellTime, manualDwellTime, swipeDistanceThreshold, swipeTimeThreshold])

  useLayoutEffect(() => {
    if (!!defaultPosition) setTransformData(defaultPositionRef.current, defaultPosition)
    else setTransformData(defaultPositionRef.current, DEFAULT_POSITION)
  }, [defaultPosition])

  useLayoutEffect(() => {
    if (!!lookAtPosition) setTransformData(lookAtPositionRef.current, lookAtPosition)
    else setTransformData(lookAtPositionRef.current, LOOKAT_POSITION)

    isCameraOrientationSet.current = false
  }, [lookAtPosition])

  useLayoutEffect(() => {
    if (!!offsetPosition) setTransformData(offsetPositionRef.current, offsetPosition)
    else setTransformData(defaultPositionRef.current, OFFSET_POSITION)
  }, [offsetPosition])

  useEffect(() => {
    if (!domElement) return

    const onPointerDown = (e: PointerEvent): void => {
      if (!e.isPrimary) return

      activePointerIdRef.current = e.pointerId
      domElement.setPointerCapture?.(e.pointerId)
      const size = get().size
      const x: number = (e.offsetX / size.width) * 2 - 1
      const y: number = -(e.offsetY / size.height) * 2 + 1
      pointerStartRef.current = { x: x, y: y, time: Date.now() }
    }

    const finishPointer = (e: PointerEvent): void => {
      if (activePointerIdRef.current !== e.pointerId) return

      domElement.releasePointerCapture?.(e.pointerId)
      activePointerIdRef.current = null
      pointerStartRef.current = null
    }

    const onPointerCancel = (e: PointerEvent): void => finishPointer(e)

    const onPointerUp = (e: PointerEvent): void => {
      const start: PointerData | null = pointerStartRef.current
      if (!start || activePointerIdRef.current !== e.pointerId) return

      const registry = useTargetRegistry.getState().registry
      const positions: readonly Vector3[] = registry?.getPositions() ?? []
      const size = get().size
      const x: number = (e.offsetX / size.width) * 2 - 1
      const y: number = -(e.offsetY / size.height) * 2 + 1
      const deltaX: number = x - start.x
      const deltaY: number = y - start.y

      const deltaTime: number = Date.now() - start.time
      const isSwipe: boolean = (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > swipeDistanceThresholdRef.current &&
        deltaTime < swipeDeltaTimeRef.current
      )

      if (isSwipe) {
        const count = positions.length
        if (count > 0) {
          const step = deltaX > 0 ? 1 : -1
          targetIndexRef.current = (targetIndexRef.current + step + count) % count
          dwellRemainingRef.current = manualDwellTimeRef.current
          onSwipe?.(e)
        }
      };

      finishPointer(e)
    }

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointerup', onPointerUp)
    domElement.addEventListener('pointercancel', onPointerCancel)

    return () => {
      if (activePointerIdRef.current !== null) {
        domElement.releasePointerCapture?.(activePointerIdRef.current)
        activePointerIdRef.current = null
        pointerStartRef.current = null
      };

      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [domElement, get, onSwipe])

  useFrame(({ camera }, delta) => {
    const clampedDelta: number = Math.min(delta, 0.08)
    phaseRef.current += clampedDelta
    const sine = Math.sin(phaseRef.current)

    const registry = useTargetRegistry.getState().registry
    const positions = registry ? registry.getPositions() : []
    const promoted = registry ? registry.getPromoted() : null

    if (isCameraOrientationSet.current === false) {
      _scratchLookAtRef.current.set(
        camera.position.x + lookAtPositionRef.current.x,
        camera.position.y + lookAtPositionRef.current.y,
        camera.position.z + lookAtPositionRef.current.z
      )
      camera.lookAt(_scratchLookAtRef.current)
      isCameraOrientationSet.current = true
    };

    if (!registry || positions.length === 0 || !promoted) {
      _scratchPositionRef.current.set(
        defaultPositionRef.current.x + sine,
        defaultPositionRef.current.y - 2 * sine,
        defaultPositionRef.current.z + sine
      )
      oldEasing.damp3(camera.position, _scratchPositionRef.current, 1, clampedDelta)
      return
    };

    if (targetIndexRef.current >= positions.length || targetIndexRef.current < 0) {
      targetIndexRef.current = 0
    };

    dwellRemainingRef.current -= clampedDelta

    let nextPosition: Vector3 = positions[0]
    let focusedIndex = -1
    const focusedSlug: string | null = useSelection.getState().focusedSlug

    if (focusedSlug !== null) {
      for (const uuid in promoted) {
        if (promoted[uuid].target.userData.slug === focusedSlug) {
          focusedIndex = promoted[uuid].index
          break
        }
      }
    }

    if (focusedIndex >= 0 && positions[focusedIndex]) {
      targetIndexRef.current = focusedIndex
      dwellRemainingRef.current = autoDwellTimeRef.current
    }
    else {
      const currentIndex: number = targetIndexRef.current
      const nextIndex: number = currentIndex >= positions.length - 1 ? 0 : currentIndex + 1

      if (dwellRemainingRef.current <= 0) {
        dwellRemainingRef.current = autoDwellTimeRef.current
        targetIndexRef.current = nextIndex
      }
    }

    let currentEntry: RegistryEntry | undefined
    for (const uuid in promoted) {
      if (promoted[uuid].index === targetIndexRef.current) {
        currentEntry = promoted[uuid]
        break
      }
    }

    // old logic
    // if (currentEntry?.target?.isObject3D) {
    //   getAABBCenterFast(currentEntry.target, _scratchCenterRef.current)
    //   registry.refreshPosition(targetIndexRef.current, _scratchCenterRef.current)
    //   nextPosition = _scratchCenterRef.current
    // }

    //new logic
    if (currentEntry?.target?.isObject3D) {
      const target = currentEntry.target
      const targetChanged = lastSampleTargetRef.current !== target
      const positionChanged = lastSamplePositionRef.current.distanceTo(target.position) > 1
      const rotationChanged = lastSampleQuaternionRef.current.angleTo(target.quaternion) > 1
      const scaleChanged = lastSampleScaleRef.current.distanceTo(target.scale) > 10e-2

      if (targetChanged || positionChanged || rotationChanged || scaleChanged) {
        getAABBCenterFast(target, _scratchCenterRef.current)
        registry.refreshPosition(targetIndexRef.current, _scratchCenterRef.current)
        lastSampleTargetRef.current = target
        lastSamplePositionRef.current.copy(target.position)
        lastSampleQuaternionRef.current.copy(target.quaternion)
        lastSampleScaleRef.current.copy(target.scale)
      };

      nextPosition = _scratchCenterRef.current
    }
    else {
      nextPosition = positions[targetIndexRef.current] ?? positions[0]
    }

    _scratchPositionRef.current.set(
      nextPosition.x + offsetPositionRef.current.x + sine,
      nextPosition.y + offsetPositionRef.current.y + (-2 * sine),
      nextPosition.z + offsetPositionRef.current.z + sine
    )
    oldEasing.damp3(camera.position, _scratchPositionRef.current, 1, clampedDelta)

    const distanceToNextPosition = camera.position.distanceTo(nextPosition)
    const proximity = remapClamp(distanceToNextPosition, outer, inner, 0, 1)
    const t1 = easing.sineInOut(proximity)
    const turnTime = 1 - proximity // 0.6 * (1 - proximity) + 0.15

    restDirection[0] = lookAtPositionRef.current.x
    restDirection[1] = lookAtPositionRef.current.y
    restDirection[2] = lookAtPositionRef.current.z

    vec3.normalize(restDirection, restDirection)

    aimDirection[0] = nextPosition.x - camera.position.x
    aimDirection[1] = nextPosition.y - camera.position.y
    aimDirection[2] = nextPosition.z - camera.position.z

    vec3.normalize(aimDirection, aimDirection)
    quat.rotationTo(restQuat, cameraForward, restDirection)
    quat.rotationTo(aimQuat, cameraForward, aimDirection)
    quat.slerp(lookAtQuaternion, restQuat, aimQuat, t1)

    currentQuaternion[0] = camera.quaternion.x
    currentQuaternion[1] = camera.quaternion.y
    currentQuaternion[2] = camera.quaternion.z
    currentQuaternion[3] = camera.quaternion.w

    const t2 = 1 - Math.exp(-clampedDelta / (turnTime+1))
    quat.slerp(currentQuaternion, currentQuaternion, lookAtQuaternion, t2)

    camera.quaternion.set(...currentQuaternion)
  })

  return null
}

export default Carousel