import * as THREE from 'three';

const _scratchMatrix = new THREE.Matrix4();
const _scratchQuat = new THREE.Quaternion();
const _scratchEuler = new THREE.Euler();

// euler.x = pitch (up/down tilt) 
// euler.y = yaw (left/right turn)
// euler.z = roll (tilt left/right)
function dampCameraLookAt(camera, targetPoint, smoothTime, delta, pitchFactor = null, yawFactor = null, rollFactor = null) {
  const st = Math.max(1e-4, smoothTime);
  const t = 1 - Math.exp((-2 * delta) / st);

  _scratchMatrix.lookAt(camera.position, targetPoint, camera.up);
  _scratchQuat.setFromRotationMatrix(_scratchMatrix);
  _scratchEuler.setFromQuaternion(_scratchQuat);
  
  // Constrain angles if numeric values are provided
  if (typeof pitchFactor === 'number') _scratchEuler.x *= pitchFactor;
  if (typeof yawFactor === 'number') _scratchEuler.y *= yawFactor;
  if (typeof rollFactor === 'number') _scratchEuler.z *= rollFactor;

  _scratchQuat.setFromEuler(_scratchEuler);
  camera.quaternion.slerp(_scratchQuat, t);
}

export default dampCameraLookAt;