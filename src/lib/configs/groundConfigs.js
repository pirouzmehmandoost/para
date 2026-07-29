const _groundConfigs = {
  GROUND_URL: '/env_ground_3-transformed.glb',
  GROUND_NODE_NAME: 'Plane',
  GROUND_MATERIAL_ID: 'ground',
  GROUND_POSITION: [0, -90, -15],
  GROUND_ROTATION: [Math.PI / 4.5, Math.PI / 2, 0],
  GROUND_SCALE: [0.7, 0.7, 0.7],

  GROUND_GRID_URL: '/ground.glb',
  GROUND_GRID_NODE_NAME: 'ground_plane_subdivided',
  GROUND_GRID_MATERIAL_ID: 'ground_grid',
  GROUND_GRID_POSITION: [0, -80, -160],
  GROUND_GRID_ROTATION: [Math.PI / 7, Math.PI, 0],
  GROUND_GRID_SCALE: [7, 7, 7],
  GROUND_GRID_ROWS: 1,
  GROUND_GRID_COLUMNS: 3,
  GROUND_GRID_SPACING: 1,
};

const groundConfigs = {
  groundProps: {
    materialID: _groundConfigs.GROUND_MATERIAL_ID,
    nodeName: _groundConfigs.GROUND_NODE_NAME,
    url: _groundConfigs.GROUND_URL,
    position: _groundConfigs.GROUND_POSITION,
    rotation: _groundConfigs.GROUND_ROTATION,
    scale: _groundConfigs.GROUND_SCALE,
  },
  groundGridProps: {
    materialID: _groundConfigs.GROUND_GRID_MATERIAL_ID,
    nodeName: _groundConfigs.GROUND_GRID_NODE_NAME,
    url: _groundConfigs.GROUND_GRID_URL,
    position: _groundConfigs.GROUND_GRID_POSITION,
    rotation: _groundConfigs.GROUND_GRID_ROTATION,
    scale: _groundConfigs.GROUND_GRID_SCALE,
    gridColumns: _groundConfigs.GROUND_GRID_COLUMNS,
    gridRows: _groundConfigs.GROUND_GRID_ROWS,
    gridSpacing: _groundConfigs.GROUND_GRID_SPACING,
  },
};

export default groundConfigs;