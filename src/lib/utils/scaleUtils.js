export const scaleMeshAtBreakpoint = (width) => {
  if (width <= 360) return 0.7;
  if (width <= 400) return 0.7;
  if (width <= 480) return 0.75;
  if (width <= 640) return 0.8;  //sm
  if (width <= 768) return 0.9;  //md
  if (width <= 1024) return 1.0;  //lg
  if (width <= 1280) return 1.1;  //xl
  if (width <= 1536) return 1.15; //2xl
  if (width <= 1920) return 1.2;
  return 1.3;
};

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