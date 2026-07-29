'use client';

import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import useMaterial, { groundMeshPhysicalMaterialConfig } from '@stores/materialStore';

const GroundGrid = (props) => {
  const {
    materialID,
    nodeName,
    url,
    position,
    rotation,
    scale,
    gridRows,
    gridColumns,
    gridSpacing,
  } = props;

  const _scratchSizeRef = useRef(new THREE.Vector3());
  const _scratchCenterRef = useRef(new THREE.Vector3());
  const instancedMeshRef = useRef(undefined);
  const instanceRef = useRef(new THREE.Object3D());
  const materialRef = useRef(new THREE.MeshPhysicalMaterial({ ...groundMeshPhysicalMaterialConfig }));

  const gridRef = useRef([]);
  const totalInstancesRef = useRef(1);
  const gridSpacingRef = useRef(1);

  const texturesReady = useMaterial((state) => state.texturesInitialized);
  const geometry = useGLTF(url).nodes?.[nodeName]?.geometry ?? null;

  useLayoutEffect(() => {
    if (texturesReady?.length > 0) {
      const readyMaterial = useMaterial.getState().materials[materialID].material;
      if (!!readyMaterial) {
        materialRef.current.copy(readyMaterial);
        materialRef.current.needsUpdate = true;
      }
    }
  }, [texturesReady]);


  useLayoutEffect(() => {
    if (typeof gridSpacing === 'number' && gridSpacingRef.current !== gridSpacing) {
      gridSpacingRef.current = gridSpacing
    }
  }, [gridSpacing]);

  useLayoutEffect(() => {
    if (!instancedMeshRef.current) return;

    let r = Number.isInteger(gridRows) && gridRows > 0 ? gridRows : 1;
    let c = Number.isInteger(gridColumns) && gridColumns > 0 ? gridColumns : 1;

    if (!gridRef.current?.length) {
      gridRef.current = [r, c];
    }
    else {
      const prevRows = gridRef.current[0];
      const prevCols = gridRef.current[1];

      if (prevRows !== r) gridRef.current[0] = r;
      if (prevCols !== c) gridRef.current[1] = c;
    }

    totalInstancesRef.current = r * c;
  }, [gridRows, gridColumns]);

  const totalInstances = useMemo(() => {
    if (totalInstancesRef.current !== (gridRows * gridColumns)) {
      totalInstancesRef.current = gridRows * gridColumns;
    };

    return totalInstancesRef.current;
  }, [gridRows, gridColumns]);

  useLayoutEffect(() => {
    if (!instancedMeshRef.current) return;

    let instanceIndex = 0;

    instancedMeshRef.current.geometry.computeBoundingBox();

    const box = instancedMeshRef.current.geometry.boundingBox;
    box.getSize(_scratchSizeRef.current);
    box.getCenter(_scratchCenterRef.current);

    const instanceSizeX = _scratchSizeRef.current.x;
    const instanceSizeZ = _scratchSizeRef.current.z;
    const rows = gridRef.current[0];
    const columns = gridRef.current[1];
    const gridSizeX = rows * instanceSizeX;
    const gridSizeZ = columns * instanceSizeZ;
    const gridCenterX = (((-1 * gridSizeX) + instanceSizeX) / 2);
    const gridCenterZ = (((-1 * gridSizeZ) + instanceSizeZ) / 2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = (r * instanceSizeX * gridSpacingRef.current) + gridCenterX;
        const y = 0;
        const z = (c * instanceSizeZ * gridSpacingRef.current) + gridCenterZ;

        instanceRef.current.position.set(x, y, z);
        instanceRef.current.updateMatrix();
        instancedMeshRef.current.setMatrixAt(instanceIndex, instanceRef.current.matrix);
        instanceIndex++;
      }
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      {geometry && (
        <group
          rotation={rotation}
          position={position}
          scale={scale}
        >
          <instancedMesh
            ref={instancedMeshRef}
            args={[geometry, null, totalInstances]}
            material={materialRef.current}
            castShadow={true}
            receiveShadow={true}
          />
        </group>
      )}
    </>
  );
}

export default memo(GroundGrid);