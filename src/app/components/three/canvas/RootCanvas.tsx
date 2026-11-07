'use client'

import { Suspense, useLayoutEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Cache, ColorManagement, PCFShadowMap } from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, useEnvironment, useGLTF } from '@react-three/drei'
import type { Project } from '@/types/project'
import cameraConfigs from '@configs/cameraConfigs'
import sceneConfigs from '@configs/sceneConfigs'
import useProjectStore from '@stores/projectStore'
import { GenericLoader, ThreeLoader } from '@ui/skeletons/Loader'
import SceneComposer from '../scenes/SceneComposer'
import TextureInitializer from '../textures/TextureInitializer'

ColorManagement.enabled = true
Cache.enabled = true

const { NEAR: near, FAR: far, FOV: fov, INITIAL_POSITION } = cameraConfigs
const { BACKGROUND_COLOR, ENVIRONMENT_HDR_URL, ENVIRONMENT_INTENSITY, FOG_FAR, FOG_NEAR } = sceneConfigs

useEnvironment.preload({ files: ENVIRONMENT_HDR_URL })

interface RenderMode {
  frameLoop: 'always' | 'demand'
  pointerEvents: 'pointer-events-auto' | 'pointer-events-none'
}

interface RootCanvasProps {
  projects: Project[]
}
export const RootCanvas = ({ projects = [] as Project[] }: RootCanvasProps) => {
  const pathname = usePathname()

  const renderMode: RenderMode = useMemo(() => {
    const check: boolean = pathname === '/' || pathname.startsWith('/projects/')
    return check
      ? { frameLoop: 'always', pointerEvents: 'pointer-events-auto' }
      : { frameLoop: 'demand', pointerEvents: 'pointer-events-none' }
  }, [pathname])

  useLayoutEffect(() => {
    const checkProp: boolean = projects !== null && projects.length > 0
    const stored = useProjectStore.getState().projects
    const checkProjectStore: boolean = stored === null || stored.length === 0
    if (checkProp && checkProjectStore) useProjectStore.getState().setProjects(projects)
  }, [projects])

  useLayoutEffect(() => {
    const check: boolean = projects !== null && projects.length > 0
    if (check) {
      for (const { sceneData: { url = '' } = {} } of projects) {
        if (url.length > 0 && url.endsWith('.glb')) useGLTF.preload(url)
      }
    }
  }, [projects])

  return (
    <div className={`flex grow flex-row w-full h-full min-h-1/2 select-none touch-none ${renderMode.pointerEvents}`}>
      <Suspense fallback={<GenericLoader />}>
        <Canvas
          camera={{ near, far, fov, position: [INITIAL_POSITION[0], INITIAL_POSITION[1], INITIAL_POSITION[2]] }}
          dpr={[1, 1.5]}
          fallback={<GenericLoader />}
          frameloop={renderMode.frameLoop}
          orthographic={false}
          shadows={{ enabled: true, autoUpdate: true, type: PCFShadowMap }}
        >
          <color args={[BACKGROUND_COLOR]} attach='background' />
          <fog attach='fog' args={[BACKGROUND_COLOR, FOG_NEAR, FOG_FAR]} />
          <directionalLight color={'#FFFFFF'} intensity={1} position={[0, 100, 90]} />
          <Environment files={ENVIRONMENT_HDR_URL} environmentIntensity={ENVIRONMENT_INTENSITY} />
          <Suspense fallback={<ThreeLoader str={'Textures'} injectStyle={'text-blue-500 text-nowrap'} />}>
            <TextureInitializer />
          </Suspense>
          <Suspense fallback={<ThreeLoader str={'Scene'} injectStyle={'mt-32 text-red-500 text-nowrap'} />}>
            <SceneComposer />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  )
}

export default RootCanvas