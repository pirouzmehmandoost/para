'use client'

import { startTransition, useCallback, useLayoutEffect, useEffect, useMemo, useRef } from 'react'
import { Vector3, Object3D } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import carouselConfigs from '@configs/carouselConfigs'
import useProjectStore from '@stores/projectStore'
import useSelection from '@stores/selectionStore'
import useTargetRegistry from '@stores/targetRegistryStore'
import type { Predicate } from '@stores/targetRegistryStore'
import Carousel from '../rigs/Carousel'
import ProjectMesh from '../meshes/ProjectMesh'
import TerrainGrid from '../groups/TerrainGrid'

const {
  SWIPE_DELAY_MS,
  OFFSET_POSITION,
  LOOKAT_POSITION,
  MANUAL_DWELL_SECONDS,
  AUTO_DWELL_SECONDS,
  SWIPE_DELTA_DISTANCE,
  SWIPE_DELTA_TIME_MS,
} = carouselConfigs

const offsetCameraPosition = new Vector3(OFFSET_POSITION[0], OFFSET_POSITION[1], OFFSET_POSITION[2])
const lookAtPosition = new Vector3(LOOKAT_POSITION[0], LOOKAT_POSITION[1], LOOKAT_POSITION[2])
const defaultPosition = new Vector3(0, 50, 180)

const SceneComposer = () => {
  const set = useThree((state) => state.set)
  const get = useThree((state) => state.get)
  const scene = useThree((state) => state.scene)
  const projects = useProjectStore((state) => state.projects)

  const lastSwipeTimeRef = useRef<number>(0)

  const targetKeys = useMemo((): Set<string> =>
    new Set(projects?.map((p) => p.sceneData.nodeName))
    , [projects])

  const targetFilter = useMemo((): Predicate => (obj: Object3D) => targetKeys.has(obj.name), [targetKeys])

  const handlePointerMissed = useCallback((): void => {
    startTransition(() => { useSelection.getState().reset() })
  }, [])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation()
    if (Date.now() - lastSwipeTimeRef.current < SWIPE_DELAY_MS) return

    const slug: string | null = e.object.userData?.slug || null
    if (!slug || useSelection.getState().focusedSlug === slug) return

    const project = useProjectStore.getState().getProjectBySlug(slug)
    if (!project) return

    startTransition(() => {
      useSelection.getState().setFocused(project.sceneData.defaultMaterialID, slug)
    })
  }, [])

  const onSwipe = useCallback((): void => {
    lastSwipeTimeRef.current = Date.now()
    startTransition(() => { useSelection.getState().reset() })
  }, [])

  useLayoutEffect(() => {
    useTargetRegistry.getState().initialize(scene, targetFilter)
    return () => useTargetRegistry.getState().reset()
  }, [scene, targetFilter])

  useEffect(() => {
    const prev = get().onPointerMissed
    set({ onPointerMissed: handlePointerMissed })

    return () => set({ onPointerMissed: prev })
  }, [set, get, handlePointerMissed])

  return (
    <>
      {projects && (
        projects.map(({
          UIData: { slug },
          sceneData: {
            url, nodeName, defaultMaterialID, materialIDs, position, rotation, rotationSpeed, scale
          },
        }) => {
          return (
            <ProjectMesh
              key={slug}
              defaultMaterialID={defaultMaterialID}
              materialIDs={materialIDs}
              nodeName={nodeName}
              onClick={handleClick}
              position={position}
              rotation={rotation}
              rotationSpeed={rotationSpeed}
              scale={scale}
              slug={slug}
              url={url}
            />
          )
        })
      )}
      <TerrainGrid />
      <Carousel
        defaultPosition={defaultPosition}
        lookAtPosition={lookAtPosition}
        offsetPosition={offsetCameraPosition}
        onSwipe={onSwipe}
        autoDwellTime={AUTO_DWELL_SECONDS}
        manualDwellTime={MANUAL_DWELL_SECONDS}
        swipeDistanceThreshold={SWIPE_DELTA_DISTANCE}
        swipeTimeThreshold={SWIPE_DELTA_TIME_MS}
      />
    </>
  )
}

export default SceneComposer
