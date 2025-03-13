'use client';

import { useThree } from '@react-three/fiber';
import {
  scaleMeshAtBreakpoint,
  calculatePositions,
} from '@/lib/utils/meshUtils';
import Model from './Model';

const Group = ({ children, ...data }) => {
  const { size } = useThree();
  // const setSelection = useSelection((state) => state.setSelection);
  // const resetSelection = useSelection((state) => state.reset);

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

  return (
    <>
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

        return <Model key={key} {...props} />;
      })}
      {/* {children} */}
    </>
  );
};

export default Group;

// <Model onHover={onHover} key={key} {...props} />

// <group key={key}>
// {
/* <Html
    occlude
    onOcclude={setHidden}
    castShadow={true}
    receiveShadow={true}
    transform
    zIndexRange={[0, 0]}
    scale={[10, 10, 10]}
    // style={{
    //   transition: 'all 0.5s',
    //   opacity: hidden ? 0 : 1,
    //   transform: `scale(${hidden ? 0.5 : 1})`,
    // }}
    position={[
      positions[index].x,
      positions[index].y + 40,
      positions[index].z,
    ]}
  >
    <div
      className={`flex grow p-4 cursor-pointer text-3xl uppercase w-fit h-full text-center 
          place-self-center place-items-center rounded-full bg-neutral-300/50 text-neutral-600
          transition-all transition-discrete duration-500 ease-in-out hover:text-neutral-500 hover:bg-neutral-200
          ${isPointerOver === modelUrl.name ? 'flex grow w-fit h-full opacity-100 scale-x-100' : ' w-1 h-1 min-w-1 min-h-1 opacity-0 scale-1 hidden'}`}
      onClick={(e) => {
        e.stopPropagation();
        handleUpdateSelection(props);
        router.push('/project');
      }}
    >
      Tap here to see more of this project
    </div>
  </Html> */
// }
// <Model key={key} {...props} />
// </group>
