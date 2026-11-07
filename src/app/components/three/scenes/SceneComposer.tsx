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
import TerrainGrid from '../instancedMeshes/TerrainGrid'
import type { Transform3 } from '@/types/Transform3'

const {
  SWIPE_DELAY_MS,
  OFFSET_POSITION,
  LOOKAT_POSITION,
  MANUAL_DWELL_SECONDS,
  AUTO_DWELL_SECONDS,
  SWIPE_DELTA_DISTANCE,
  SWIPE_DELTA_TIME_MS,
} = carouselConfigs

// const testMesh = new CapsuleGeometry(10, 20, 4, 8, 1)
// const material = new MeshBasicMaterial({ color: 0x00ff00 })
// const capsule = new Mesh(testMesh, material)
// capsule.position.set(-50, 90, 0)
// capsule.name = "testmesh"
// capsule.userData.slug = 'testmesh'

const offsetCameraPosition = new Vector3((OFFSET_POSITION as Transform3).x, (OFFSET_POSITION as Transform3).y, (OFFSET_POSITION as Transform3).z)  
const lookAtPosition = new Vector3((LOOKAT_POSITION as Transform3).x, (LOOKAT_POSITION as Transform3).y, (LOOKAT_POSITION as Transform3).z)
const defaultPosition = new Vector3(0, 50, 180)
// const defaultPosition = new Vector3(10, 50, 350)

const SceneComposer = () => {
  const set = useThree((state) => state.set)
  const get = useThree((state) => state.get)
  const scene = useThree((state) => state.scene)
  const projects = useProjectStore((state) => state.projects)

  const lastSwipeTimeRef = useRef<number>(0)

  const targetKeys = useMemo((): Set<string> =>
    new Set(projects?.map((p) => p.sceneData.nodeName))//.add('testmesh')
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

  // useEffect(() => {
  //   if (scene && !!projects) {
  //     const parentMesh = scene.getObjectByProperty('name', 'gerd')

  //     setTimeout(() => {
  //       if (parentMesh) {
  //         parentMesh.attach(capsule)
  //       } else {
  //         console.error("Could not find one or both meshes in the scene.")
  //       }
  //     }, 5000)
  //   }
  // }, [scene, projects])

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
