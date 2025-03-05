"use client";

import { useThree } from "@react-three/fiber";
import { scaleMeshAtBreakpoint, calculatePositions } from "../../../lib/utils";
import Model from "./Model";
import { Html } from "@react-three/drei";
import useSelection from "../../stores/selectionStore";
import { useRouter } from "next/navigation";


const Group = ({ children, ...data }) => {
    const router = useRouter();
    const setSelection = useSelection((state) => state.setSelection);
    const resetSelection = useSelection((state) => state.reset);

    const { size } = useThree();

    console.log("Group. Data: ",  data)

    const {
            autoRotate,
            autoRotateSpeed,
            materials,
            modelUrls,
            isPointerOver,
            position: groupPosition,
            scale,
    } = data;

    let positions = calculatePositions(
        size.width,
        modelUrls.length,
        groupPosition,
    );

    let updateScale = modelUrls.length === 1
        ? scale * 0.45
        : scaleMeshAtBreakpoint(size.width) / modelUrls.length;

    const handleUpdateSelection = (x) => {
        if (!x) {
            resetSelection();
        }
        else {
            const obj = {
                ...data, 
                ...x,
                sceneData: {
                    ...data,
                    ...x,
                },
            };

            console.log("handleUpdateSelection\ndata is :" , data, "\nobj is ", obj, "\n");
            setSelection(obj);
        }
    };

    return (
        <group>
            {modelUrls.map((modelUrl, index) => {
                const key = modelUrl.name;
                const props = {
                    ...data,
                    autoRotate: autoRotate,
                    autoRotateSpeed: autoRotateSpeed,
                    isPointerOver,
                    materialId:
                    modelUrls.length === 1
                        ? materials.defaultMaterial
                        : Object.values(materials.colorWays)[index],
                    modelUrl: modelUrl,
                    position: positions[index],
                    scale: updateScale,
                };

                return ( 
                    <group key={key}> 
                    <Html
                        // occlude="blending"
                        transform
                        zIndexRange={[0,0]}
                        scale={[10, 10, 10]}
                        position={[
                            positions[index].x,
                            positions[index].y + 40,
                            positions[index].z,
                        ]}
                    >
                        <div
                            className={`flex grow cursor-pointer uppercase text-nowrap w-fit h-full text-center 
                                p-4 place-self-center place-items-center rounded-full bg-neutral-300 text-neutral-600
                                text-5xl transition-all duration-500 ease-in-out w-96 opacity-90 transition-all duration-500 
                                ease-in-out hover:text-neutral-500 hover:bg-neutral-200`}

                            onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateSelection(props);
                                router.push("/project");
                            }}
                        >
                            See More
                        </div>
                    </Html>
                    <Model key={key} {...props} />
                    </group>
                );
            })}

            {children}

        </group>
    );
};

export default Group;
