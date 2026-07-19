const carouselConfigs = {
  // dwell times at carousel positions
  MANUAL_OVERRIDE_SECONDS: 15, // dwell time if a swipe gesture moves carousel
  MIN_DWELL_SECONDS: 12, // dwell time for for carousel automatic cycling
  //swipe gesture lengths
  SWIPE_DELTA_DISTANCE: 0.2, //percentage of viewport dimensions
  SWIPE_DELTA_PX: 50, // pixel distances, usage will be deprecated soon.
  //swipe gesture timing 
  SWIPE_DELAY_MS: 200, // wait time between calculating swipe gestures
  SWIPE_DELTA_TIME_MS: 600, // max time between start and end of a swipe gesture
};

export default carouselConfigs;