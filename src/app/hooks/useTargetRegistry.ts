import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import TargetRegistry from '@targetRegistry';

/*
IMPORTANT 
Consumers passing a function as `targets` should provide a stable reference. 
Neglecting to memoize the functions will create a new function reference on every React Render
and silently destroy and rebuild the entire registry per animation frame.
*/

type Targets = THREE.Object3D[] | ((obj: THREE.Object3D) => boolean);

export default function useTargetRegistry(
  scene: THREE.Scene | null,
  targets?: Targets,
  defaultFallback?: THREE.Vector3,
): React.RefObject<TargetRegistry | null> {
  const registryRef = useRef<TargetRegistry | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!scene || !targets || !scene.isScene) return;

    if (sceneRef.current === null) sceneRef.current = scene;

    if (scene.uuid !== sceneRef.current.uuid) {
      sceneRef.current = scene;
      registryRef.current = null;
    }

    if (!registryRef.current) {
      registryRef.current = new TargetRegistry(sceneRef.current, defaultFallback);
    }

    if (Array.isArray(targets)) {
      registryRef.current.register(targets);
    } else {
      registryRef.current.registerByFilter(targets);
    }

    return () => {
      registryRef.current?.deregister();
    };
  }, [scene, targets]);

  useEffect(() => {
    return () => {
      registryRef.current?.deregister();
      registryRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  return registryRef;
}
