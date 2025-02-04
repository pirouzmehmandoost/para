"use client";

// import { useRouter } from 'next/navigation'
// import { useEffect, useState, useRef } from "react";
import { ColorManagement, Vector3 } from 'three';
import { useThree, } from "@react-three/fiber";
import { scaleMeshAtBreakpoint, scalePositionAtBreakPoint } from "../../../lib/utils"
// import useSelection from "../../store/selection";
import Model from "./Model";

ColorManagement.enabled = true;

const calculatePositions = (scaleFactor, numPositions, center) => {
  const positions = [];
  const xOffset = [];
  const yOffset = numPositions >= 2 ? -25 : -30;

  if (numPositions === 1) {
    return [new Vector3(center.x, yOffset, center.z)]
  };


  if (numPositions % 2 == 1) {
    xOffset.push(0)
  };

  for (let i = 1; i < numPositions; i++) {
    let offset = parseInt((scalePositionAtBreakPoint(scaleFactor) * parseInt(i * scaleFactor)) / (numPositions * 2)) * (i % 2 === 0 ? 1 : -1);
    xOffset.push(offset);
    xOffset.push(-1 * offset);
  };

  for (let i = 0; i < numPositions; i++) {
    const pos = new Vector3(xOffset[i] + center.x, yOffset, center.z)
    positions.push(pos)
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
    // data: selectedProject,
  } = data;

  const { size } = useThree();
  // const groupRef = useRef();
  let positions = calculatePositions(size.width, modelUrls.length, groupPosition)

  // const box = new BoxGeometry(5, 15, 5); // to visualize handle positions
  // const boxMaterial = new MeshBasicMaterial({ color: "yellow" });
  // const boxGeometry = new Mesh(box, boxMaterial);
  // boxGeometry.position.copy(groupPosition)
  // scene.add(boxGeometry)

  return (
    <>
      {
        modelUrls.map((url, index) => {
          let updateScale = modelUrls.length === 1 ? scale * 0.5 : scaleMeshAtBreakpoint(size.width) / modelUrls.length;
          const newProps = {
            modelUrl: url,
            material: modelUrls.length === 1 ? { ...colorCodes.defaultColor.material } : Object.values(colorCodes.colorWays)[index].material,
            scale: updateScale,
            autoRotate: modelUrls.length === 1 || index > -20 ? autoRotate : false,
            autoRotateSpeed: autoRotateSpeed,
            position: positions[index]
          };

          return <Model key={index} {...newProps} />;
        })
      }
    </>
  );
};

export default Group;


// const Group = (data) => {
//   const router = useRouter()
//   const [modelPosition, setModelPosition] = useState([]);
//   const { size } = useThree();
//   const setSelection = useSelection((state) => state.setSelection);

//   console.log("Group data: ", data)
//   const {
//     colorCodes,
//     modelUrls,
//     autoRotate,
//     scale,
//     position: groupPosition,
//     data: selectedProject,
//   } = data;

//   console.log("groupPosition: ", groupPosition?.x)

//   const positions = [];
//   const handles = [];
//   const bezierCurve = new EllipseCurve(0, 0, 40, 30, 0, 2 * Math.PI, false, 0);
//   bezierCurve.closed = true;

//   const bezierCurvePoints = bezierCurve.getPoints(modelUrls.length);
//   bezierCurvePoints.shift(); //remove an overlapping point

//   const bezierGeometry = new BufferGeometry().setFromPoints(bezierCurvePoints);

//   const ellipse = new Line(bezierGeometry, new MeshBasicMaterial());
//   ellipse.rotation.x = Math.PI * 0.5;

//   const vertex = new Vector3();
//   const positionAttribute = ellipse.geometry.getAttribute('position');

//   const handlePositions = [];

//   for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
//     const pt = vertex.fromBufferAttribute(positionAttribute, vertexIndex);

//     // const p = new Vector3(pt.x, 0, pt.y)
//     // handlePositions.push(p);

//     handlePositions.push({
//       x: pt.x,
//       y: 0,
//       z: pt.y
//     });
//   };

//   const boxGeometry = new BoxGeometry(2, 2, 2);
//   for (const handlePosition of handlePositions) {
//     const handle = new Mesh(boxGeometry);
//     handle.position.copy(handlePosition);
//     handles.push(handle);
//   }

//   useEffect(() => {
//     if (modelUrls.length > 1) {
//       for (const handlePosition of handlePositions) {
//         const p = [
//           handlePosition.x * 1.6,
//           handlePosition.y,
//           handlePosition.z * 1.5,
//         ]

//         // const p = new Vector3(
//         //   handlePosition.x * 1.6,
//         //   handlePosition.y,
//         //   handlePosition.z * 1.5
//         // );
//         positions.push(p);
//       }
//       setModelPosition(positions);
//     };

//   }, [modelUrls]);

//   return (
//     <group
//       position={groupPosition}
//       onClick={() => {
//         setSelection(selectedProject);
//         router.push('/project');
//       }}
//     >
//       {
//         modelUrls.map((url, index) => {
//           const updateScale = modelUrls.length === 1 ? (scale * 0.5) : (scaleMeshAtBreakpoint(size.width) / modelUrls.length);
//           const newProps = {
//             modelUrl: url,
//             material: modelUrls.length === 1 ? { ...colorCodes.defaultColor.material } : Object.values(colorCodes.colorWays)[index].material,
//             scale: updateScale,
//             autoRotate: modelUrls.length === 1 || index > 0 ? autoRotate : false,
//             position: modelPosition[index]
//           };

//           return (
//             <Model key={index} {...newProps} />
//           );
//         })
//       }
//     </group>
//   );
// };
