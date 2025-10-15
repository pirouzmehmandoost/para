import { Vector3 } from 'three';

export const scaleMeshAtBreakpoint = (width) => {
  if (width <= 360) return 0.7;
  if (width <= 400) return 0.7;
  if (width <= 480) return 0.75;
  if (width <= 640) return 0.8;  //sm
  if (width <= 768) return 0.9;  //md
  if (width <= 1024) return 1.0;  //lg
  if (width <= 1280) return 1.1;  //xl
  if (width <= 1536) return 1.15; //2xl
  if (width <= 1920) return 1.2;
  return 1.3;
};

export const scalePositionAtBreakPoint = (width) => {
  if (width <= 360) return 1.2;
  if (width <= 400) return 1.1;
  if (width <= 480) return 1.05;
  if (width <= 540) return 1.0;
  if (width <= 640) return 0.95;  //sm
  if (width <= 768) return 0.9;   //md
  if (width <= 900) return 0.85;
  if (width <= 1024) return 0.8;  //lg
  if (width <= 1280) return 0.7;  //xl
  if (width <= 1536) return 0.6;  //2xl
  return 0.5;
};

export const calculatePositions = (scaleFactor, numPositions, center) => {
  const positions = [];
  const xOffset = [];
  const yOffset = -25;

  if (numPositions === 1) return [new Vector3(center.x, yOffset, center.z)];

  if (numPositions % 2 === 1) xOffset.push(0);

  for (let i = 1; i < numPositions; i++) {
    const offset = 
      (scalePositionAtBreakPoint(scaleFactor) * parseInt(i * scaleFactor)) / 
      (numPositions * 2) * 
      (i % 2 === 0 ? 1 : -1);

    xOffset.push(offset);
    xOffset.push(-1 * offset);
  }

  for (let i = 0; i < numPositions; i++) {
    const pos = new Vector3(xOffset[i] + center.x, yOffset, center.z);
    positions.push(pos);
  }

  positions.sort((a, b) => a.x - b.x);

  positions.forEach((vec, i) => {
    vec.z += positions.length > 2 ? (i % 2 === 0 ? -50 : 0) : -50;
  });

  return positions;
};

// OLD, FOR REFERENCE

  // positions.map((vec, i) => {
  //   return positions.length > 2
  //     ? (vec.z += i % 2 === 0 ? -50 : 0)
  //     : (vec.z += -50);
  // });

// export const calculatePositions = (scaleFactor, numPositions, center) => {
//   const positions = [];
//   const xOffset = [];
//   const yOffset = -25;

//   if (numPositions === 1) {
//     return [new Vector3(center.x, yOffset, center.z)];
//   }

//   if (numPositions % 2 === 1) {
//     xOffset.push(0);
//   }

//   for (let i = 1; i < numPositions; i++) {
//     let offset =
//       ((scalePositionAtBreakPoint(scaleFactor) * (i * scaleFactor)) /
//         (numPositions * (2 + i))) *
//       (i % 2 === 0 ? 1 : -1);
//     xOffset.push(offset);
//     xOffset.push(-1 * offset);
//   }

//   for (let i = 0; i < numPositions; i++) {
//     const pos = new Vector3(xOffset[i] + center.x, yOffset, center.z);
//     positions.push(pos);
//   }

//   positions.sort((a, b) => a.x - b.x);

//   positions.map((vec, i) => {
//     return positions.length >= 3
//       ? (vec.z += i % 2 === 0 ? -50 : 0)
//       : (vec.z += -50);
//   });

//   return positions;
// };
