'use client';

import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react'

THREE.Cache.enabled = true;

const SimpleCameraRig = (props) => {
    const { 
      cameraPosition = [0, 10, 180],
    } = props;

    const positionVector = useMemo(() => new THREE.Vector3(), []);
  
    useFrame(({ clock, camera }) => {
      const t = clock.elapsedTime;
      const sin = Math.sin(t/2);
      const cos = Math.cos(t/2);

      positionVector.set(sin, (cos*100), (sin+1)*cameraPosition[2]);
      camera.position.lerp(positionVector, 0.06);
      camera.lookAt(0,0,0);
    });
  };

  export default SimpleCameraRig;