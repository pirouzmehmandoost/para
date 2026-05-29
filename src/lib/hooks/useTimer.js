'use client';

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const timerRef = useRef(new THREE.Timer());

  useEffect(() => {
    timerRef.current.connect(document);
    return () => {
      timerRef.current.dispose();
    };
  }, []);

  const getElapsed = useCallback(() => timerRef.current.getElapsed(), []);
  const getDelta = useCallback(() => timerRef.current.getDelta(), []);

  useFrame(() => {
    timerRef.current.update();
  }, -1);

  return (
    <TimerContext.Provider value={{ getElapsed, getDelta }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
