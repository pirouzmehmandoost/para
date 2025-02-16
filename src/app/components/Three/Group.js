"use client";

import { useRouter } from "next/navigation";
import { ColorManagement } from "three";
import { useThree } from "@react-three/fiber";
import { scaleMeshAtBreakpoint, calculatePositions } from "../../../lib/utils";
import useSelection from "../../store/selection";
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
    data: selectedProject,
    isPointerOver,
  } = data;

  const router = useRouter();
  const { size } = useThree();
  let positions = calculatePositions(
    size.width,
    modelUrls.length,
    groupPosition,
  );
  const setSelection = useSelection((state) => state.setSelection);

  return (
    <group
      onClick={() => {
        setSelection(selectedProject);
        router.push("/project");
      }}
    >
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
