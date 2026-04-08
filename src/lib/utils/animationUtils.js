// epsilon values for floating point comparison
export const rotationThreshold = 3e-3;
export const scaleThreshold = 1e-4;

export const angleDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export const eulerDistance = (current, target) =>
  Math.abs(angleDelta(current.x, target.x)) +
  Math.abs(angleDelta(current.y, target.y)) +
  Math.abs(angleDelta(current.z, target.z));

export const wrap = (value, min, max) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}