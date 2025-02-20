"use client";

import { ColorManagement } from "three";
import { useThree } from "@react-three/fiber";
import { scaleMeshAtBreakpoint, calculatePositions } from "../../../lib/utils";
import Model from "./Model";

ColorManagement.enabled = true;

const Group = (data) => {
  const {
    colorCodes,
    modelUrls,
    autoRotate,
    scale,
    autoRotateSpeed,
    position: groupPosition,
    isPointerOver,
  } = data;
  const { size } = useThree();
  let positions = calculatePositions(
    size.width,
    modelUrls.length,
    groupPosition,
  );

  return (
    <group>
      {modelUrls.map((url, index) => {
        let updateScale =
          modelUrls.length === 1
            ? scale * 0.45
            : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
        const newProps = {
          isPointerOver,
          modelUrl: url,
          material:
            modelUrls.length === 1
              ? { ...colorCodes.defaultColor.material }
              : Object.values(colorCodes.colorWays)[index].material,
          scale: updateScale,
          autoRotate:
            modelUrls.length === 1 || index > -20 ? autoRotate : false,
          autoRotateSpeed: autoRotateSpeed,
          position: positions[index],
        };

        return <Model key={index} {...newProps} />;
      })}
    </group>
  );
};

export default Group;
