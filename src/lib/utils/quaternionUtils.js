import { Euler, Matrix4, Quaternion } from 'three';

const _scratchMatrix = new Matrix4();
const _scratchQuat = new Quaternion();
const _scratchEuler = new Euler();

// euler.x = pitch (up/down tilt) 
// euler.y = yaw (left/right turn)
// euler.z = roll (tilt left/right)
export function dampCameraLookAt(camera, targetPoint, smoothTime, delta, pitchFactor = null, yawFactor = null, rollFactor = null) {
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
};



/* 
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';

const _dir = new Vector3();
const _scratchMatrix = new Matrix4();
const _scratchQuat = new Quaternion();
const _scratchEuler = new Euler();
const _deltaQuat = new Quaternion();
const _targetQuat = new Quaternion();
const _targetYawQuat = new Quaternion();
const _up = new Vector3(0, 1, 0);


// euler.x = pitch (up/down tilt) 
// euler.y = yaw (left/right turn)
// euler.z = roll (tilt left/right)

// export function dampCameraLookAt(camera, targetPoint, smoothTime, delta, pitchLimit = null, yawLimit = null, rollLimit = null) {
//   const st = Math.max(1e-4, smoothTime);
//   const t = 1 - Math.exp((-2 * delta) / st);

//   _scratchMatrix.lookAt(camera.position, targetPoint, camera.up);
//   _scratchQuat.setFromRotationMatrix(_scratchMatrix);
//   _scratchEuler.setFromQuaternion(_scratchQuat);

//   // Constrain angles if numeric values are provided
//   if (typeof pitchLimit === 'number') _scratchEuler.x = Math.max(-pitchLimit, Math.min(pitchLimit, _scratchEuler.x));
//   if (typeof yawLimit === 'number') _scratchEuler.y = Math.max(-yawLimit, Math.min(yawLimit, _scratchEuler.y));
//   if (typeof rollLimit === 'number') _scratchEuler.z = Math.max(-rollLimit, Math.min(rollLimit, _scratchEuler.z));

//   _scratchQuat.setFromEuler(_scratchEuler);
//   camera.quaternion.slerp(_scratchQuat, t);
// };






// export function dampCameraLookAt(camera, targetPoint, smoothTime, delta, pitchLimit = null, yawLimit = null, rollLimit = null) {
//   const st = Math.max(1e-4, smoothTime);
//   const t = 1 - Math.exp((-2 * delta) / st);

//   // 1) Target look-at orientation
//   _scratchMatrix.lookAt(camera.position, targetPoint, camera.up);
//   _targetQuat.setFromRotationMatrix(_scratchMatrix);

//   // 2) Delta from current -> target
//   _deltaQuat.copy(camera.quaternion).invert().multiply(_targetQuat);

//   // 3) Clamp delta in yaw-then-pitch order
//   _scratchEuler.setFromQuaternion(_deltaQuat, 'YXZ');

//   if (typeof yawLimit === 'number') _scratchEuler.y = Math.max(-yawLimit, Math.min(yawLimit, _scratchEuler.y));
//   if (typeof pitchLimit === 'number') _scratchEuler.x = Math.max(-pitchLimit, Math.min(pitchLimit, _scratchEuler.x));
//   if (typeof rollLimit === 'number') _scratchEuler.z = Math.max(-rollLimit, Math.min(rollLimit, _scratchEuler.z));

//   // 4) Apply clamped delta
//   _deltaQuat.setFromEuler(_scratchEuler);
//   _scratchQuat.copy(camera.quaternion).multiply(_deltaQuat);

//   // 5) Smooth toward it
//   camera.quaternion.slerp(_scratchQuat, t);
// }





export function dampCameraLookAt(camera, targetPoint, smoothTime, delta, pitchLimit = null, yawLimit = null, rollLimit = null) {
  const st = Math.max(1e-4, smoothTime);
  const t = 1 - Math.exp((-2 * delta) / st);

  // Horizontal direction camera -> target
  _dir.copy(targetPoint).sub(camera.position);
  _dir.y = 0;

  // If target is directly above/below, keep current orientation
  if (_dir.lengthSq() < 1e-8) return;

  _dir.normalize();

  // Target yaw around world up: atan2(x, z) matches three.js forward
  const targetYaw = Math.atan2(_dir.x, _dir.z);

  // Current yaw from camera forward projected to XZ
  const forward = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
  forward.y = 0;
  forward.normalize();
  const currentYaw = Math.atan2(forward.x, forward.z);

  // Delta yaw in [-pi, pi]
  let deltaYaw = targetYaw - currentYaw;
  deltaYaw = Math.atan2(Math.sin(deltaYaw), Math.cos(deltaYaw));

  // Clamp yaw delta if yawLimit is provided
  if (typeof yawLimit === 'number') {
    deltaYaw = Math.max(-yawLimit, Math.min(yawLimit, deltaYaw));
  }

  // Apply yaw delta only (no pitch, no roll)
  _targetYawQuat.setFromAxisAngle(_up, deltaYaw);
  _scratchQuat.copy(camera.quaternion).multiply(_targetYawQuat);

  camera.quaternion.slerp(_scratchQuat, t);
}




*/