'use client';

import { useRouter } from 'next/navigation';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import useSelection from '@/stores/selectionStore';
import {
  scaleMeshAtBreakpoint,
  calculatePositions,
} from '@/lib/utils/meshUtils';
import Model from './Model';

const Group = ({ children, ...data }) => {
  const router = useRouter();
  const { size } = useThree();
  const setSelection = useSelection((state) => state.setSelection);
  const resetSelection = useSelection((state) => state.reset);

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

  let updateScale =
    modelUrls.length === 1
      ? scale * 0.45
      : scaleMeshAtBreakpoint(size.width) / modelUrls.length;

  const handleUpdateSelection = (x) => {
    if (!x) {
      resetSelection();
    } else {
      const obj = {
        ...data,
        ...x,
        sceneData: {
          ...data,
          ...x,
        },
      };
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
              zIndexRange={[0, 0]}
              scale={[10, 10, 10]}
              position={[
                positions[index].x,
                positions[index].y + 40,
                positions[index].z,
              ]}
            >
              <div
                className={`flex grow p-4 cursor-pointer uppercase text-nowrap w-fit h-full text-center 
                    place-self-center place-items-center rounded-full bg-neutral-300/30 text-neutral-600
                    text-5xl transition-all duration-500 ease-in-out hover:text-neutral-500 hover:bg-neutral-200`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateSelection(props);
                  router.push('/project');
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
