'use client'

import { startTransition, useCallback, useLayoutEffect, useEffect, useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import { useThree } from '@react-three/fiber'
import carouselConfigs from '@configs/carouselConfigs'
import useProjectStore from '@stores/projectStore'
import useSelection from '@stores/selectionStore'
import useTargetRegistry from '@stores/targetRegistryStore'
import Carousel from '../cameras/rigs/Carousel'
import ProjectMesh from '../models/ProjectMesh'
import TerrainGrid from '../models/TerrainGrid'

const { SWIPE_DELAY_MS, OFFSET_POSITION, LOOKAT_POSITION, MANUAL_DWELL_SECONDS, AUTO_DWELL_SECONDS, SWIPE_DELTA_DISTANCE, SWIPE_DELTA_TIME_MS, } = carouselConfigs

const meshPositions = [new Vector3(-170, 75, -50), new Vector3(150, 100, -60), new Vector3(-5, -170, 15)]
const offsetCameraPosition = new Vector3(OFFSET_POSITION[0], OFFSET_POSITION[1], OFFSET_POSITION[2])
const lookAtPosition = new Vector3(LOOKAT_POSITION[0], LOOKAT_POSITION[1], LOOKAT_POSITION[2])
const defaultPosition = new Vector3(0, 50, 180)

const SceneComposer = () => {
  const set = useThree((state) => state.set)
  const get = useThree((state) => state.get)
  const scene = useThree((state) => state.scene)

  const projects = useProjectStore((state) => state.projects)
  // const setFocused = useSelection((state) => state.setFocused)
  const lastSwipeTimeRef = useRef(0)

  const targetKeys = useMemo(() =>
    new Set(projects !== null ? projects.map((p) => `${p.sceneData?.nodeName}`).filter((key) => key !== 'undefined') : [])
    , [projects])

  const targetFilter = useMemo(() => (obj) => targetKeys.has(obj.name), [targetKeys])

  const handlePointerMissed = useCallback((e) => {
    startTransition(() => { useSelection.getState().reset() })
  }, [])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (Date.now() - lastSwipeTimeRef.current < SWIPE_DELAY_MS) return

    // e.object.name is project.sceneData.nodeName
    const clickedName = e.object.name || null
    const clickedUUID = e.object.uuid || null
    if (!clickedName || !clickedUUID || useSelection.getState().focusedUUID === clickedUUID) return

    const project = useProjectStore.getState().getProjectByNodeName(clickedName)
    if (!project) return

    startTransition(() => {
      useSelection.getState().setFocused(clickedName, project.sceneData.defaultMaterialID, clickedUUID)
    })
  }, [])

  const onSwipe = useCallback((e) => {
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


  // this is just a test, I do not know whether this is sound or gains me anything. 
  const ProjectMeshes = useMemo(() => {
    if (projects === null) return <></>

    return (
      projects.map(({
        UIData: { slug } = {},
        sceneData: {
          url,
          nodeName,
          defaultMaterialID,
          materialIDs,
          rotation,
          rotationSpeed,
          scale
        } = {},
      }, index) => {
        return (
          <ProjectMesh
            key={slug}
            nodeName={nodeName}
            url={url}
            materialIDs={materialIDs}
            defaultMaterialID={defaultMaterialID}
            onClick={handleClick}
            position={meshPositions[index]}
            rotation={rotation}
            rotationSpeed={rotationSpeed}
            scale={scale}
          />
        )
      })
    )
  }, [projects])

  return (
    <>
      <directionalLight
        castShadow={true}
        color={'#bcbcbc'}
        intensity={1}
        position={[0, 300, 90]}
      />
      {ProjectMeshes}
      {/* {projects === null ? <></> : projects.map(({
        UIData: { slug } = {},
        sceneData: {
          url,
          nodeName,
          defaultMaterialID,
          materialIDs,
          rotation,
          rotationSpeed,
          scale
        } = {},
      }, index) => {
        return (
          <ProjectMesh
            key={slug}
            nodeName={nodeName}
            url={url}
            materialIDs={materialIDs}
            defaultMaterialID={defaultMaterialID}
            onClick={handleClick}
            position={meshPositions[index]}
            rotation={rotation}
            rotationSpeed={rotationSpeed}
            scale={scale}
          />
        )
      })} */}
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


// IGNORE THESE COMMENTED LINES
// import { EffectComposer, ToneMapping } from '@react-three/postprocessing'
// import { BlendFunction, ToneMappingMode } from 'postprocessing'

// <EffectComposer
//   autoClear={false}
//   enableNormalPass={true}
//   multisampling={200}
//   screenSpaceRadius
//   scene={scene}
//   camera={camera}
// >
//   <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
//   <ToneMapping
//     blendFunction={BlendFunction.VIVID_LIGHT} // blend mode
//     adaptive={true} // toggle adaptive luminance map usage
//     resolution={128} // texture resolution of the luminance map
//     middleGrey={1} // middle grey factor
//     maxLuminance={2.0} // maximum luminance
//     averageLuminance={1} // average luminance
//     adaptationRate={1} // luminance adaptation rate
//   />
// </EffectComposer>