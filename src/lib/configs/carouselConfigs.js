const carouselConfigs = {
  MIN_DWELL_SECONDS: 12, // Dwell time for Carousel automatic cycling.
  SWIPE_DELTA_DISTANCE: 0.2, // Min length of swipe gestures as a fraction of NDC width, delta x between pointerDown and pointerUp MouseEvents.
  SWIPE_DELTA_PX: 50, // Min distance between CSS pixels on pointerDown and pointerUp events, usage will be deprecated soon.
  MANUAL_OVERRIDE_SECONDS: 15, // Dwell time for manual cycling, i.e. how long Carousel will dwell after a swipe gesture moves it.
  SWIPE_DELAY_MS: 200, // Latency period between calculating swipe gestures.
  SWIPE_DELTA_TIME_MS: 600, // Max time between start and end of a swipe gesture.
};

export default carouselConfigs;