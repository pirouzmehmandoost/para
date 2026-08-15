'use client'

import { Suspense, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Environment, Html, useGLTF } from '@react-three/drei'
import cameraConfigs from '@configs/cameraConfigs'
import sceneConfigs from '@configs/sceneConfigs'
import useProjectStore from '@stores/projectStore'
import SceneComposer from '../scenes/SceneComposer'

THREE.ColorManagement.enabled = true
THREE.Cache.enabled = true

const { NEAR, FAR, FOV, INITIAL_CAMERA_POSITION } = cameraConfigs
const { BACKGROUND_COLOR, ENV_IMG_URL } = sceneConfigs

export const Loader = () => {
  return (
    <Html center className='text-black text-nowrap text-5xl'>
      Loading...
    </Html>
  )
}

export const RootCanvas = ({ projects = []}) => {
  const pathname = usePathname()
  const interactive = pathname === '/' || pathname.startsWith('/projects/')

  useLayoutEffect(() => {
    if (projects.length && (!useProjectStore.getState().projects?.length || null)) {
      for (const projectData of projects) {
        const { sceneData: { fileData: { url = '' } = {} } = {} } = projectData
        if (url.length) useGLTF.preload(url)
      }
      useProjectStore.getState().setProjects(projects)
    }
  }, [projects])

  return (
    <div className={`fixed inset-0 bg-[${BACKGROUND_COLOR}] ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={interactive ? 'always' : 'demand'}
        gl={{ antialias: true }}
        camera={{ position: INITIAL_CAMERA_POSITION, near: NEAR, far: FAR, fov: FOV - 15 }}
        fallback={<div> Sorry, WebGL is not supported. </div>}
        orthographic={false}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <color args={[BACKGROUND_COLOR]} attach='background' />
        <fog attach='fog' color={BACKGROUND_COLOR} near={180} far={270} />
        <Environment shadows files={ENV_IMG_URL} environmentIntensity={0.5} />
        <Suspense fallback={<Loader />}>
          <SceneComposer />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default RootCanvas