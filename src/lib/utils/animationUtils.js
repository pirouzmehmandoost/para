// Materials in materialStore have an intentionally imperceptible clearcoat value set to = 1e-7 and clearcoatRoughness = 1.
// This is to avoid a strangely sharp specular highlight when a clearcoat value eases from 1.0 > n > 0.0 to 0.0.

// If materials have transmissive properties, the following properties should be set for all materials: 
// thickness: 0, transmission: EPSILON_1e7, transparent: true, transmission: a transmission DataTexture, needsUpdate: true
// This is to avoid shader program recompilation when animating transmissive properties (easing or otherwise). 
// This is at the cost of having transmissive MeshPhysicalMaterial instances when property values are copied from materialStore or the default physical material config object.
// The materialStore no longer persists transmissive instances.

export const EPSILON_1e7 = 1e-7;
export const EPSILON_3e3 = 3e-3;
export const EPSILON_10e4 = 10e-4;

export const angleDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export const eulerDistance = (current, target) =>
  Math.abs(angleDelta(current.x, target.x)) +
  Math.abs(angleDelta(current.y, target.y)) +
  Math.abs(angleDelta(current.z, target.z));

export const wrap = (value, min, max) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export const RotationAnimationModes = {
  MODE_IDLE: 'MODE_IDLE',
  MODE_TURNTABLE: 'MODE_TURNTABLE',
  MODE_MANUAL: 'MODE_MANUAL'
}

export const PositionAnimationModes = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED'
}