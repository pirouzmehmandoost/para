'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import carouselConfigs from '@configs/carouselConfigs'
import useSelection from '@stores/selectionStore'
import useTargetRegistry from '@stores/targetRegistryStore'
import { getAABBCenterFast } from '@utils/positionUtils'
import type { RegistryEntry } from '@/lib/targetRegistry/TargetRegistry'

const { MANUAL_DWELL_SECONDS, AUTO_DWELL_SECONDS, SWIPE_DELTA_DISTANCE, SWIPE_DELTA_TIME_MS, OFFSET_POSITION } = carouselConfigs

const positiveOr = (value: number, fallback: number): number => (value > 0 ? value : fallback)

interface PointerData {
  x: number
  y: number
  time: number
}

interface CarouselTestProps {
  defaultPosition?: Vector3
  lookAtPosition?: Vector3
  offsetPosition?: Vector3
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
  const offsetPositionRef = useRef<Vector3>(new Vector3(OFFSET_POSITION[0], OFFSET_POSITION[1], OFFSET_POSITION[2]))
  const lookAtPositionRef = useRef<Vector3>(new Vector3(0, 0, -1))

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
    if (!defaultPosition?.isVector3) return

    if (!defaultPositionRef.current.equals(defaultPosition)) {
      defaultPositionRef.current.copy(defaultPosition)
    }
  }, [defaultPosition])

  useLayoutEffect(() => {
    if (!lookAtPosition?.isVector3) return

    if (!lookAtPositionRef.current.equals(lookAtPosition)) {
      lookAtPositionRef.current.copy(lookAtPosition)
      isCameraOrientationSet.current = false
    }

  }, [lookAtPosition])

  useLayoutEffect(() => {
    if (!offsetPosition?.isVector3) return

    if (!offsetPositionRef.current.equals(offsetPosition)) {
      offsetPositionRef.current.copy(offsetPosition)
    }
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
      easing.damp3(camera.position, _scratchPositionRef.current, 1, clampedDelta)
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

    if (currentEntry?.target?.isObject3D) {
      getAABBCenterFast(currentEntry.target, _scratchCenterRef.current)
      registry.refreshPosition(targetIndexRef.current, _scratchCenterRef.current)
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
    easing.damp3(camera.position, _scratchPositionRef.current, 1, clampedDelta)
  })

  return null
}

export default Carousel