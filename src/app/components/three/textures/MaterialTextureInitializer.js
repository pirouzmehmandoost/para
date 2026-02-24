'use client';

import { useLayoutEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei'
import useMaterial from '@stores/materialStore';

const MaterialTextureInitializer = () => {
  const setMaterialTextures = useMaterial(state => state.setMaterialTextures);

  const texturesToLoad = useMemo(() => {
    const materials = useMaterial.getState().materials;

    const texturesToLoad = {};
    for (const materialID in materials) {
      const materialTextureProps = materials[materialID]?.textures;

      if (materialTextureProps) {
        for (const materialProperty in materialTextureProps) {
          texturesToLoad[materialTextureProps[materialProperty]] = materialTextureProps[materialProperty];
        }
      }
    }
    return texturesToLoad;
  }, []);

  const textures = useTexture(texturesToLoad);

  useLayoutEffect(() => {
    for (const url of Object.keys(texturesToLoad)) { if (!textures[url]) return }
    setMaterialTextures(textures);
  }, [textures, setMaterialTextures, texturesToLoad]);

  return null;
}

export default MaterialTextureInitializer;