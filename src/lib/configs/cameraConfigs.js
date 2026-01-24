const cameraConfigs = {
  POSITION: [0, 10, 180],
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
  MIN_DWELL_SECONDS: 12, // dwell time at each position
  MANUAL_OVERRIDE_SECONDS: 15, // additional dwell time if swipe gesture moves the rig
  SWIPE_DELTA_PX: 50,
  SWIPE_DELTA_TIME_MS: 600,
  SWIPE_DELAY_MS: 250,
};

export default cameraConfigs;
