import * as THREE from 'three';
import { Cloud, Clouds } from '@react-three/drei'
import { useThree } from '@react-three/fiber';
import { scaleMeshAtBreakpoint } from '@utils/scaleUtils';

/* 
// Example usage: 
<CloudGroup positions={[meshPositions[0], meshPositions[2]]} /> 
*/

const CloudGroup = (props) => {
  const { positions: [p1, p2] = [] } = props;
  const size = useThree((state) => state.size);
  const scale = Math.min(1.5, scaleMeshAtBreakpoint(size.width) * 1.5);

  return (
    <Clouds material={THREE.MeshPhysicalMaterial} limit={4}>
      <Cloud
        color={'black'}
        concentrate={'inside'}
        growth={200}
        opacity={0.6}
        position={[10, p1.y + 10, p1.z - 66]}
        seed={0.4}
        segments={2}
        speed={0.2}
        volume={20}
        scale={scale}
        fade={5}
      />
      <Cloud
        color={'black'}
        concentrate={'random'}
        growth={100}
        opacity={0.15}
        position={[0, p2.y - 50, p2.z - 20]}
        seed={0.4}
        segments={2}
        speed={0.2}
        volume={300}
        scale={scale}
        fade={5}
      />
    </Clouds>
  );
};

export default CloudGroup;