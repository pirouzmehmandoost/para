'use client';

import * as THREE from 'three';
import { useFrame} from '@react-three/fiber';
import { useMemo } from 'react'
// import { easing } from 'maath';

THREE.Cache.enabled = true;

const SimpleCameraRig = (props) => {
    const {
      cameraPosition = [0,0,180],
      target,
    } = props;

  const cameraTargetPosition = useMemo(() => {
    const positionVector = new THREE.Vector3(...cameraPosition);

    if (!target) return positionVector;

    target.updateWorldMatrix();
    const modelBoundingBox = new THREE.Box3().setFromObject(target);
    positionVector.set(
      (modelBoundingBox.max.x + modelBoundingBox.min.x)/2,
      (modelBoundingBox.max.y + modelBoundingBox.min.y)/2,
      (modelBoundingBox.max.z + modelBoundingBox.min.z)/2,
    );
    return positionVector;
  },[target]);

    useFrame(({ clock, camera }, delta) => {
      const t = clock.elapsedTime;
      const sin = Math.sin(t/2)*5;
      const cos = Math.cos(t/2)*50;
      const x = cameraTargetPosition.x+sin;
      const y = cameraTargetPosition.y+cos;
      const z = cameraTargetPosition.z+100+sin;

      camera.lookAt(cameraTargetPosition);
      // easing.damp3(camera.position, [x,y,z], 0.5, delta);
      const v = new THREE.Vector3(x, y, z)
      camera.position.lerp(v, 0.06);

    });
  };

  export default SimpleCameraRig;