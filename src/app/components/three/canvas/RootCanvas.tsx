'use client'

import { Suspense, useLayoutEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Cache, ColorManagement, PCFShadowMap, } from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, Html, useEnvironment, useGLTF } from '@react-three/drei'
import type { Project } from '@/types/project'
import cameraConfigs from '@configs/cameraConfigs'
import carouselConfigs from '@configs/carouselConfigs'
import sceneConfigs from '@configs/sceneConfigs'
import useProjectStore from '@stores/projectStore'
import SceneComposer from '../scenes/SceneComposer'
import TextureInitializer from '../textures/TextureInitializer'

ColorManagement.enabled = true
Cache.enabled = true

const { NEAR, FAR, FOV, INITIAL_CAMERA_POSITION } = cameraConfigs
const FOG_NEAR = carouselConfigs.OFFSET_CAMERA_POSITION[2]

const { BACKGROUND_COLOR, ENV_IMG_URL } = sceneConfigs

useEnvironment.preload({ files: ENV_IMG_URL })

export const Loader = () => {
  return (
    <Html center className='text-purple-500 top-1/2 right-6 text-center text-nowrap text-6xl'>
      RootLevelCanvas Loading
    </Html>
  )
}

const EnvLoader = () => {
  return (
    <Html center className='text-slate-500 bottom-16 text-nowrap text-8xl'>
      Suspense over Environment
    </Html>
  )
}

const TextureInitializerLoader = () => {
  return (
    <Html center className='text-yellow-700 bottom-16 text-nowrap text-8xl'>
      Suspense over TextureInitializer
    </Html>
  )
}

export const RootLevelCanvas = ({ projects = [] as Project[] }) => {
  const pathname = usePathname()
  // const interactive = pathname === '/' || pathname.startsWith('/projects/')
  const interactive = useMemo(() => (pathname === '/' || pathname.startsWith('/projects/')) as boolean, [pathname])
  const frameLoop = interactive ? 'always' : 'demand'
  const pointerEvents: string = interactive ? 'pointer-events-auto' : 'pointer-events-none'

  useLayoutEffect(() => {
    const check = !useProjectStore.getState().projects?.length || null

    if (projects.length && check) {
      for (const projectData of projects) {
        const {
          sceneData: {
            fileData: {
              url = ''
            } = {},
          } = {},
        } = projectData

        if (url.length > 0 && url.endsWith('.gltf')) useGLTF.preload(url)
      }
      useProjectStore.getState().setProjects(projects)
    }
  }, [projects])

  return (
    <div className={`fixed inset-0 bg-[${BACKGROUND_COLOR}] ${pointerEvents}`}>
      <Canvas
        camera={{
          near: NEAR,
          far: FAR,
          fov: FOV - 15,
          position: [INITIAL_CAMERA_POSITION[0], INITIAL_CAMERA_POSITION[1], INITIAL_CAMERA_POSITION[2]]
        }}
        dpr={[1, 1.5]}
        fallback={<div> Sorry, WebGL is not supported. </div>}
        frameloop={frameLoop}
        gl={{ antialias: true }}
        orthographic={false}
        shadows={{ type: PCFShadowMap }}
      >
        <color args={[BACKGROUND_COLOR]} attach='background' />
        <fog attach='fog' color={BACKGROUND_COLOR} near={FOG_NEAR} far={260} />
        <Suspense fallback={<EnvLoader />}>
          <Environment files={ENV_IMG_URL} environmentIntensity={0.45} />
        </Suspense>
        <Suspense fallback={<TextureInitializerLoader />}>
          <TextureInitializer />
        </Suspense>
        <SceneComposer />
      </Canvas>
    </div>
  )
}

export default RootLevelCanvas