'use client'

import { useLayoutEffect, useMemo } from 'react'
import { useTexture, useKTX2 } from '@react-three/drei'
import useMaterial from '@stores/materialStore'

const setMaterialTextures = useMaterial.getState().setMaterialTextures

interface Payload {
  png_jpg: Record<string, string>
  ktx2: Record<string, string>
}

const TextureInitializer = () => {
  const texturesToLoad = useMemo((): Payload => {
    const png_jpg_urls: Record<string, string> = {}
    const ktx2_urls: Record<string, string> = {}

    for (const materialRecord of Object.values(useMaterial.getState().materials)) {
      if (!materialRecord?.textures) continue

      for (const url of Object.values(materialRecord.textures)) {
        if (url.endsWith('.ktx2')) ktx2_urls[url] = url
        else if (url.endsWith('.png') || url.endsWith('.jpg')) png_jpg_urls[url] = url
        else console.warn('TextureInitializer: Unsupported texture file format: ', url)
      }
    }
    return { png_jpg: png_jpg_urls, ktx2: ktx2_urls }
  }, [])

  const standardFormatTextures = useTexture(texturesToLoad.png_jpg)
  const ktx2Textures = useKTX2(texturesToLoad.ktx2)

  useLayoutEffect(() => {
    setMaterialTextures({ ...ktx2Textures, ...standardFormatTextures })
  }, [ktx2Textures, standardFormatTextures])

  return null
}

export default TextureInitializer