/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 oval_bag_xl_v2.glb --instance --shadows --transform 
Files: oval_bag_xl_v2.glb [1.2MB] > /Users/pirouzm/Documents/github/para/public/oval_bag_xl_v2-transformed.glb [128.73KB] (89%)
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/oval_bag_xl_v2-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.bag_85.geometry} material={nodes.bag_85.material} />
    </group>
  )
}

useGLTF.preload('/oval_bag_xl_v2-transformed.glb')
