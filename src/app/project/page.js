"use client";
import MenuIcon from '@mui/icons-material/Menu';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useState } from "react";
import useSelection from "../store/selection";
import ModelViewer from "../components/ModelViewer";

const ProjectViewer = () => {
  const [expanded, setExpanded] = useState(false);
  const selection = useSelection((state) => state.selection);

  const {
    sceneData: {
      colorCodes: {
        defaultColor,
        colorWays,
      } = {},
    },
    description,
    name,
  } = selection;

  const [selectedMaterial, setMaterial] = useState(defaultColor ?? null);

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
    colorCodes: {
      colorWays,
      defaultColor: selectedMaterial
    }
  };

  const colorSelectButtons = (
    <div className="flex flex-row">

      <p className="text-nowrap">Select Color</p>

      {
        Object.entries(colorWays).map((entry) => {
          return (
            <div
              key={entry[0]}
              className={`flex ${entry[1].tailwindColor} w-6 h-6 mx-3 border-solid border-2 rounded-full ${selectedMaterial.label !== entry[1].label ? 'border-clay_light' : 'border-clay_dark border-4'} cursor-pointer`}
              onClick={() => { if (selectedMaterial.label !== entry[1].label) setMaterial(entry[1]) }}
            >
            </div>
          );
        })
      }
    </div>
  );

  return (
    <div
      id="project_viewer"
      className={"flex flex-col w-full h-full text-center text-clay_dark"}
    >
      <div className="w-full h-96 mt-20 place-self-center place-content-center justify-stretch">
        <ModelViewer data={data} />
      </div>

      <div
        id="project_menu"
        className={`fixed bottom-0 z-20 right-0 sm:w-full md:w-full lg:w-1/2 place-self-end transition-all duration-700 ease-in-out ${expanded ? "mt-96" : "mt-0"}`}
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
              <div className="flex flex-row my-3 max-w-full align-items-center justify-items-stretch">
                <div className="ml-5 justify-self-center align-items-center basis-1/3">
                  <div
                    className="cursor-pointer self-center"
                    onClick={() => {
                      setExpanded((current) => !current);
                    }}
                  >
                    {expanded ? <CloseFullscreenIcon /> : <MenuIcon />}
                  </div>
                </div>
                <div className="justify-self-center basis-1/3">
                  <p className="text-xl text-center justify-self-center ">
                    {name}
                  </p>
                </div>
                <div className="sm:mx-2 md:mx-2 justify-self-center self-center basis-1/3 ">
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
