import { Vector3 } from 'three';
import { scalePositionAtBreakPoint } from './scaleUtils';

export const calculateXZPositions = (scaleFactor, numPositions, center, yPosition=0) => {
    const positions = [];
    const xOffset = [];
  
    if (numPositions === 1) return [new Vector3(center.x, yPosition, center.z)];
  
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
      const pos = new Vector3(xOffset[i] + center.x, yPosition, center.z);
      positions.push(pos);
    }
  
    positions.sort((a, b) => a.x - b.x);
  
    positions.forEach((vec, i) => {
      vec.z += positions.length > 2 ? (i % 2 === 0 ? -50 : 0) : -50;
    });
  
    return positions;
  };
  