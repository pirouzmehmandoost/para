"use client";

import { useRouter } from 'next/navigation';
import { ColorManagement, Vector3 } from 'three';
import { useThree, } from "@react-three/fiber";
import { scaleMeshAtBreakpoint, scalePositionAtBreakPoint } from "../../../lib/utils";
import useSelection from "../../store/selection";
import Model from "./Model";

ColorManagement.enabled = true;

const calculatePositions = (scaleFactor, numPositions, center) => {
  const positions = [];
  const xOffset = [];
  const yOffset = -25;

  if (numPositions === 1) {
    return [new Vector3(center.x, yOffset, center.z)];
  };


  if (numPositions % 2 == 1) {
    xOffset.push(0);
  };

  for (let i = 1; i < numPositions; i++) {
    let offset = parseInt((scalePositionAtBreakPoint(scaleFactor) * parseInt(i * scaleFactor)) / (numPositions * 2)) * (i % 2 === 0 ? 1 : -1);
    xOffset.push(offset);
    xOffset.push(-1 * offset);
  };

  for (let i = 0; i < numPositions; i++) {
    const pos = new Vector3(xOffset[i] + center.x, yOffset, center.z);
    positions.push(pos);
  };

  positions.sort((a, b) => a.x - b.x);

  if (numPositions > 2) {
    positions.forEach((vec, i) => {
      vec.z += (i % 2 === 0) ? -50 : 0
    })
  };

  return positions;
};

const Group = (data) => {
  const {
    colorCodes,
    modelUrls,
    autoRotate,
    scale,
    autoRotateSpeed,
    position: groupPosition,
    data: selectedProject,
    isPointerOver,
  } = data;

  const router = useRouter();
  const { size } = useThree();
  let positions = calculatePositions(size.width, modelUrls.length, groupPosition);
  const setSelection = useSelection((state) => state.setSelection);

  return (
    <group
      onClick={() => {
        setSelection(selectedProject);
        router.push('/project');
      }}
    >
      {
        modelUrls.map((url, index) => {
          let updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
          const newProps = {
            isPointerOver,
            modelUrl: url,
            material: modelUrls.length === 1 ? { ...colorCodes.defaultColor.material } : Object.values(colorCodes.colorWays)[index].material,
            scale: updateScale,
            autoRotate: modelUrls.length === 1 || index > -20 ? autoRotate : false,
            autoRotateSpeed: autoRotateSpeed,
            position: positions[index],
          };

          return <Model key={index} {...newProps} />
        })
      }
    </group>
  );
};

export default Group;
