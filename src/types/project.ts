export type Project = {
  UIData: {
    care: string;
    description: string;
    dimensions: string;
    displayName: string;
    materialSpecs: string;
    weight: string;
    shortDescription: string;
    slug: string;
  },
  sceneData: {
    nodeName: string;
    url: string;
    defaultMaterialID: string;
    materialIDs: string[];
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    rotationSpeed: number;
    scale: number;
  };
}
