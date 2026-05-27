import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import TargetRegistry from '@targetRegistry';

type TargetSource =
  | THREE.Object3D[]
  | ((obj: THREE.Object3D) => boolean);

export default function useTargetRegistry(
  scene: THREE.Scene | null,
  source?: TargetSource,
  defaultFallback?: THREE.Vector3 | number[],
): React.RefObject<TargetRegistry | null> {
  const registryRef = useRef<TargetRegistry | null>(null);

  useEffect(() => {
    if (!scene || !source) return;

    if (!registryRef.current) {
      registryRef.current = new TargetRegistry(scene, defaultFallback);
    }

    if (Array.isArray(source)) {
      registryRef.current.register(source);
    } else {
      registryRef.current.registerByFilter(source);
    }

    return () => {
      registryRef.current?.deregister();
    };
  }, [scene, source]);

  useEffect(() => {
    return () => {
      registryRef.current?.deregister();
      registryRef.current = null;
    };
  }, []);

  return registryRef;
}
