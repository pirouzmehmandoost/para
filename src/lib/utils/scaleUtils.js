export const scaleMeshAtBreakpoint = (width) => {
  if (width <= 320) return 0.4;
  if (width <= 360) return 0.45;
  if (width <= 384) return 0.5;
  if (width <= 400) return 0.55;
  if (width <= 448) return 0.6;
  if (width <= 480) return 0.65;
  if (width <= 512) return 0.7;
  if (width <= 576) return 0.75;
  if (width <= 640) return 0.8;
  if (width <= 672) return 0.85;
  if (width <= 768) return 0.9;
  if (width <= 896) return 0.95;
  if (width <= 1024) return 1.0;
  if (width <= 1152) return 1.05;
  if (width <= 1280) return 1.1;
  if (width <= 1536) return 1.15;
  if (width <= 1920) return 1.3;
  if (width <= 2048) return 1.25;
  return 1.3;
};

// export const scaleMeshAtBreakpoint = (width) => {
//   if (width <= 360) return 0.7;
//   if (width <= 400) return 0.7;
//   if (width <= 480) return 0.75;
//   if (width <= 640) return 0.8;  //sm
//   if (width <= 768) return 0.9;  //md
//   if (width <= 1024) return 1.0;  //lg
//   if (width <= 1280) return 1.1;  //xl
//   if (width <= 1536) return 1.15; //2xl
//   if (width <= 1920) return 1.2;
//   return 1.3;
// };

export const scalePositionAtBreakPoint = (width) => {
  if (width <= 360) return 1.2;
  if (width <= 400) return 1.1;
  if (width <= 480) return 1.05;
  if (width <= 540) return 1.0;
  if (width <= 640) return 0.95;  //sm
  if (width <= 768) return 0.9;   //md
  if (width <= 900) return 0.85;
  if (width <= 1024) return 0.8;  //lg
  if (width <= 1280) return 0.7;  //xl
  if (width <= 1536) return 0.6;  //2xl
  return 0.5;
};