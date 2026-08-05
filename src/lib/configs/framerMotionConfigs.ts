import { type Easing } from 'framer-motion';

interface FramerMotionConfig {
  EASE_OUT: Easing;
  EASE_IN_OUT: Easing;
}

const framerMotionConfigs: FramerMotionConfig = {
  EASE_OUT:[0.215, 0.61, 0.355, 1],
  EASE_IN_OUT: [0.76, 0, 0.24, 1],
}

export default framerMotionConfigs;