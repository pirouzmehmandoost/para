"use client";

import { useEffect, useState } from "react";
import useSelection from "../store/selection";
import ModelViewer from "../components/ModelViewer";

const ColorMenu = ({ callBack, setExpanded, expanded }) => {
  const selection = useSelection((state) => state.selection);
  const {
    sceneData: {
      colorCodes: { colorWays },
    },
    description,
    name,
  } = selection;

  const colorSelectButtons = (
    <div className="flex flex-row">
      {Object.entries(colorWays).map((entry) => {
        return (
          <div
            key={entry[0]}
            className={`${entry[1].tailwindColor} w-6 h-6 mx-3 border-solid border-4 rounded-full border-clay_dark cursor-pointer`}
            onClick={() => { callBack(entry[1].material) }}
          ></div>
        );
      })}
    </div>
  );

  return (
    <div
      id="shop_menu"
      className={`sticky bottom-0 z-20 right-0 sm:w-full md:w-full lg:w-1/2 place-self-end transition-all duration-700 ease-in-out ${expanded ? "mt-96" : "mt-0"}`}
    >
      <div className="flex z-20 w-full h-full bottom-0 right-0">
        <div className={`w-full h-full border-solid border-2 border-clay_dark`}>
          <div
            className={`flex flex-col text-clay_dark backdrop-blur-xl backdrop-brightness-150 transition-all duration-500 ease-in-out ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-0"}`}
          >
            <div
              className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? "overflow-auto max-h-96" : "overflow-hidden max-h-0"}`}
            >
              <p
                className={` mt-5 transition-all duration-700 ease-in-out delay-75 ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                {description}
              </p>
            </div>
            <div className="flex flex-row my-3 max-w-full">
              <div className="ml-5 justify-items-center basis-1/4 text-nowrap">
                <p className="cursor-pointer" onClick={setExpanded}>
                  {name}
                </p>
              </div>
              <div className="sm:mx-2 md:mx-2 justify-items-center basis-1/2">
                {colorSelectButtons}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProjectViewer = () => {
  const [expanded, setExpanded] = useState(false);
  const [material, setMaterial] = useState(null);

  const selection = useSelection((state) => state.selection);

  const {
    sceneData: {
      colorCodes: { colorWays },
    },
    description,
    name,
  } = selection;

  const data = {
    ...selection.sceneData,
    enablePan: true,
    enableZoom: false,
    enableRotate: true,
    autoRotate: false,
    autoRotateSpeed: 2,
    cameraPosition: [0, 10, 160],
    orthographic: false,
    autoUpdateMaterial: false,
    scale: 1.0,
    material: material
  };

  const colorSelectButtons = (
    <div className="flex flex-row">
      {Object.entries(colorWays).map((entry) => {
        return (
          <div
            key={entry[0]}
            className={`${entry[1].tailwindColor} w-6 h-6 mx-3 border-solid border-4 rounded-full border-clay_dark cursor-pointer`}
            onClick={() => { setMaterial(entry[1].material) }}
          ></div>
        );
      })}
    </div>
  );


  console.log("data in projectViewer:", data);
  console.log("materia;: ", material)

  return (
    <div
      id="project_viewer"
      className={"flex flex-col w-full h-full text-center text-clay_dark"}
    >
      <p className="w-full mt-28 text-3xl">
        {name}
      </p>
      <div className="w-full h-96 place-self-center place-content-center justify-stretch">
        <ModelViewer data={data} />
      </div>

      <div
        id="project_menu"
        className={`sticky bottom-0 z-20 right-0 sm:w-full md:w-full lg:w-1/2 place-self-end transition-all duration-700 ease-in-out ${expanded ? "mt-96" : "mt-0"}`}
      >
        <div className="flex z-20 w-full h-full bottom-0 right-0">
          <div className={`w-full h-full border-solid border-2 border-clay_dark`}>
            <div
              className={`flex flex-col text-clay_dark backdrop-blur-xl backdrop-brightness-150 transition-all duration-500 ease-in-out ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-0"}`}
            >
              <div
                className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? "overflow-auto max-h-96" : "overflow-hidden max-h-0"}`}
              >
                <p
                  className={` mt-5 transition-all duration-700 ease-in-out delay-75 ${expanded ? "opacity-100" : "opacity-0"}`}
                >
                  {description}
                </p>
              </div>
              <div className="flex flex-row my-3 max-w-full">
                <div className="ml-5 justify-items-center basis-1/4 text-nowrap">
                  <p
                    className="cursor-pointer"
                    onClick={() => {
                      setExpanded((current) => !current);
                    }}>
                    {name}
                  </p>
                </div>
                <div className="sm:mx-2 md:mx-2 justify-items-center basis-1/2">
                  {colorSelectButtons}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProjectViewer;
