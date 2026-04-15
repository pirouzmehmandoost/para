import { create } from 'zustand';


const initialState =
{
  animateRotationEnabled: true,
  initialRotation: { x: 0, y: 0, z: 0 },
  deltaRotation: { x: 0, y: 0, z: 0 },
  rotationSpeed: 1,
  turntableRotation: true,
};

const animationRotationStore = (set, get) => ({
  animateRotationState: initialState,

  getAnimationController: () => get().animateRotationState,

  setRotation: (newRotation) => {
    const initialRotation = get().animateRotationState.initialRotation;

    const isRotationValid = !!newRotation && 'x' in newRotation && 'y' in newRotation && 'z' in newRotation;
    const isIdentical = initialRotation.x === newRotation.x && initialRotation.y === newRotation.y && initialRotation.z === newRotation.z;

    if (!isRotationValid || isIdentical) return;

    set((state) => ({
      animateRotationState: {
        ...state.animateRotationState,
        initialRotation: { ...state.animateRotationState.initialRotation },
        deltaRotation: { ...newRotation },
      }
    }));
  },

  setRotationSpeed: (speed) => {
    const rotationSpeed = get().animateRotationState.rotationSpeed;
    if (typeof speed !== 'number' || speed === rotationSpeed) return;

    set((state) => ({
      animateRotationState: {
        ...state.animateRotationState,
        initialRotation: { ...state.animateRotationState.initialRotation },
        deltaRotation: {  ...state.animateRotationState.deltaRotation },
        rotationSpeed: speed,
      }
    }));
  },

  setAnimateRotation: (flag) => {
    let currentState = get().animateRotationState.animateRotationEnabled;

    if (typeof flag === 'boolean') {
      if( flag === currentState) return
      else currentState = flag
    }
    else if (typeof flag === 'undefined') currentState = !currentState
    else return

    set((state) => ({
      animateRotationState: {
        ...state.animateRotationState,
        animateRotationEnabled: flag
      }
    }));
  },

  resetDeltaRotation: () => {
    set((state) => ({
      animateRotationState: {
        ...state.animateRotationState,
        deltaRotation: { ...initialState.initialRotation }
      }
    }));
  },


  setTurntableRotation: (flag) => {
    let currentState = get().animateRotationState.turntableRotation;

    if (typeof flag === 'boolean') {
      if( flag === currentState) return
      else currentState = flag
    }
    else if (typeof flag === 'undefined') currentState = !currentState
    else return

    set((state) => ({
      animateRotationState: {
        ...state.animateRotationState,
        turntableRotation: flag
      }
    }));
  },

  reset: () =>
    set({
      animateRotationState: {
        ...initialState,
        initialRotation: { ...initialState.initialRotation },
        deltaRotation: { ...initialState.deltaRotation },
      }
    }),
});

const useAnimateRotation = create(animationRotationStore);

export default useAnimateRotation;