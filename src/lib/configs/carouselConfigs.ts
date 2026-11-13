import type { Transform3 } from '../../types/Transform3'
import { Euler, Vector3 } from 'three'

interface CarouselConfigs {
  AUTO_DWELL_SECONDS: number // Dwell time for Carousel automatic cycling.
  MANUAL_DWELL_SECONDS: number // Dwell time for manual cycling. how long Carousel will dwell after a swipe gesture moves it.
  SWIPE_DELAY_MS: number // Latency period between calculating swipe gestures.
  SWIPE_DELTA_DISTANCE: number // Min distance between pointerDown and pointerUp in NDC.
  SWIPE_DELTA_TIME_MS: number // max time duration for a swipe gesture (max time delta between pointerp and pointerdown.
  DEFAULT_POSITION: [x: number, y: number, z: number] | Transform3 | Vector3 
  OFFSET_POSITION: [x: number, y: number, z: number] | Transform3 | Vector3
  LOOKAT_POSITION: [x: number, y: number, z: number] | Transform3 | Euler
}

const carouselConfigs: CarouselConfigs = {
  AUTO_DWELL_SECONDS: 12,
  MANUAL_DWELL_SECONDS: 15,
  SWIPE_DELAY_MS: 200,
  SWIPE_DELTA_DISTANCE: 0.2,
  SWIPE_DELTA_TIME_MS: 600,
  OFFSET_POSITION: {x:0, y:0, z:180} as Transform3,
  LOOKAT_POSITION: {x:0, y:0, z:-1} as Transform3,
  DEFAULT_POSITION: {x:0, y:50, z:180} as Transform3,
  // OFFSET_POSITION: [0, 0, 180],
  // LOOKAT_POSITION: [0, 0, -1],
  // DEFAULT_POSITION: [0, 50, 180]
}

export default carouselConfigs