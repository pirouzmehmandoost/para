import { Euler, Vector3 } from 'three'

const groundConfigs = {
  groundProps: {
    materialID: 'ground',
    nodeName: 'Plane',
    url: '/env_ground_3-transformed.glb',
    position: new Vector3(0, -90, -15),
    rotation: new Euler(Math.PI / 4.5, Math.PI / 2, 0),
    scale: new Vector3(0.7, 0.6, 0.7),
  },
  groundGridProps: {
    materialID: 'ground',
    nodeName: 'ground',
    url: '/para_ground-transformed.glb',
    position: new Vector3(0, -130, -15),
    rotation: new Euler(0.5, Math.PI/2, 0),
    scale: new Vector3(1.25, 2, 1.25),
    gridColumns: 5,
    gridRows: 5,
    gridSpacing: 1,
  },
};

export default groundConfigs;