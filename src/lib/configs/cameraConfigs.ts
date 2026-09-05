interface CameraConfigs {
  INITIAL_CAMERA_POSITION: number[]
  NEAR: number
  FAR: number
  FOV: number
  NONE: number
  ROTATE: number
  TRUCK: number
  OFFSET: number
  DOLLY: number
  ZOOM: number
  TOUCH_ROTATE: number
  TOUCH_TRUCK: number
  TOUCH_OFFSET: number
  TOUCH_DOLLY: number
  TOUCH_ZOOM: number
  TOUCH_DOLLY_TRUCK: number
  TOUCH_DOLLY_OFFSET: number
  TOUCH_DOLLY_ROTATE: number
  TOUCH_ZOOM_TRUCK: number
  TOUCH_ZOOM_OFFSET: number
  TOUCH_ZOOM_ROTATE: number
}

const cameraConfigs: CameraConfigs = {
  INITIAL_CAMERA_POSITION: [0, 666, 666],
  NEAR: 1,
  FAR: 480,
  FOV: 50,
  NONE: 0,
  ROTATE: 1,
  TRUCK: 2,
  OFFSET: 4,
  DOLLY: 8,
  ZOOM: 16,
  TOUCH_ROTATE: 32,
  TOUCH_TRUCK: 64,
  TOUCH_OFFSET: 128,
  TOUCH_DOLLY: 256,
  TOUCH_ZOOM: 0,
  TOUCH_DOLLY_TRUCK: 1024,
  TOUCH_DOLLY_OFFSET: 2048,
  TOUCH_DOLLY_ROTATE: 4096,
  TOUCH_ZOOM_TRUCK: 8192,
  TOUCH_ZOOM_OFFSET: 0,
  TOUCH_ZOOM_ROTATE: 0,
}

export default cameraConfigs