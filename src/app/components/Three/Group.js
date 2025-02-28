"use client";

import { useThree } from "@react-three/fiber";
import { scaleMeshAtBreakpoint, calculatePositions } from "../../../lib/utils";
import Model from "./Model";

const Group = ({ children, ...data }) => {
    const { size } = useThree();
    const {
        materials,
        modelUrls,
        autoRotate,
        scale,
        autoRotateSpeed,
        position: groupPosition,
        isPointerOver,
    } = data;

    let positions = calculatePositions(
        size.width,
        modelUrls.length,
        groupPosition,
    );

    let updateScale =
        modelUrls.length === 1
        ? scale * 0.45
        : scaleMeshAtBreakpoint(size.width) / modelUrls.length;

    return (
        <group>
            {modelUrls.map((modelData, index) => {
                const newProps = {
                    isPointerOver,
                    modelUrl: modelData,
                    materialId:
                        modelUrls.length === 1
                        ? materials.defaultMaterial
                        : Object.values(materials.colorWays)[index],
                    scale: updateScale,
                    autoRotate: autoRotate,
                    autoRotateSpeed: autoRotateSpeed,
                    position: positions[index],
                };
                
                return <Model key={index} {...newProps} />;
            })}
            {children}
        </group>
    );
};

export default Group;
