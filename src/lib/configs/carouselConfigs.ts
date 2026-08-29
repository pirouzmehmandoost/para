interface CarouselConfigs {
  AUTO_DWELL_SECONDS: number // Dwell time for Carousel automatic cycling.
  MANUAL_DWELL_SECONDS: number // Dwell time for manual cycling. how long Carousel will dwell after a swipe gesture moves it.
  SWIPE_DELAY_MS: number // Latency period between calculating swipe gestures.
  SWIPE_DELTA_DISTANCE: number // Min distance between pointerDown and pointerUp in NDC.
  SWIPE_DELTA_TIME_MS: number // max time duration for a swipe gesture (max time delta between pointerp and pointerdown.
  OFFSET_CAMERA_POSITION: number[] | [x: number, y: number, z: number] | Record<string, number>
};

const carouselConfigs: CarouselConfigs = {
  AUTO_DWELL_SECONDS: 12,
  MANUAL_DWELL_SECONDS: 15,
  SWIPE_DELAY_MS: 200,
  SWIPE_DELTA_DISTANCE: 0.2,
  SWIPE_DELTA_TIME_MS: 600,
  OFFSET_CAMERA_POSITION: [0, 10, 180],
}

export default carouselConfigs