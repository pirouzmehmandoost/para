'use client'

import { useEffect, useMemo } from 'react'
import { Texture } from 'three'
import { useTexture, useKTX2 } from '@react-three/drei'
import useMaterial from '@/app/stores/materialStore'
import type { MaterialRecord } from '../../../../types/material'

interface Payload {
  img?: Record<string, string>
  ktx2?: Record<string, string>
}

const TextureInitializer = () => {
  const setMaterialTextures = useMaterial(state => state.setMaterialTextures)

  const texturesToLoad = useMemo((): Payload => {
    const materials: Record<string, MaterialRecord> = useMaterial.getState().materials

    const img: Record<string, string> = {}
    const ktx2: Record<string, string> = {}

    for (const materialID in materials) {
      const textures: Record<string, string> | undefined = materials[materialID]?.textures

      if (!!textures) {
        for (const key in textures) {
          if (textures[key].includes('ktx2')) ktx2[textures[key]] = textures[key]
          else img[textures[key]] = textures[key]
        }
      }
    }
    return {
      img: img,
      ktx2: ktx2
    }
  }, [])

  const textures = useTexture(texturesToLoad.img as Record<string, string>)
  const ktx2Textures = useKTX2(texturesToLoad.ktx2 as Record<string, string>)

  useEffect(() => {
    for (const url of Object.keys(texturesToLoad.img as Record<string, string>)) { if (!textures[url]) return }
    for (const url of Object.keys(texturesToLoad.ktx2 as Record<string, string>)) { if (!ktx2Textures[url]) return }

    setMaterialTextures({ ...textures, ...ktx2Textures } as Record<string, Texture>)
  }, [setMaterialTextures, textures, ktx2Textures, texturesToLoad])

  return null
}

export default TextureInitializer