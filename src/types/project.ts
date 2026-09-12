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
    animateMaterial: boolean;
    animatePosition: boolean;
    animateRotation: boolean;
    fileData: {
      nodeName: string;
      url: string;
    };
    materials: {
      defaultMaterialID: string;
      materialIDs: string[];
    };
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    rotationSpeed: number;
    scale: number;
  };
}
