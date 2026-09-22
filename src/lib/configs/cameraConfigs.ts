interface CameraConfigs {
  INITIAL_POSITION: number[]
  NEAR: number
  FAR: number
  FOV: number
}

const cameraConfigs: CameraConfigs = {
  INITIAL_POSITION: [0, 666, 666],
  NEAR: 1,
  FAR: 480,
  FOV: 35,
}

export default cameraConfigs