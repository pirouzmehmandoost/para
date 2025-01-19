"use client";

import useSelection from "../store/selection";
import Link from "next/link";
import SceneViewer from "./SceneViewer";
import portfolio from "../../lib/globals";

const ProjectBanner = (props) => {
  const setSelection = useSelection((state) => state.setSelection);
  const { projects } = portfolio;
  const { data: { name, autoRotateSpeed } = {} } = props;
  const selectedProject = projects.find(x => x.name === name)
  const { shortDescription } = selectedProject;
  const sceneConfigs = {
    ...selectedProject.sceneData,
    enablePan: false,
    enableZoom: false,
    enableRotate: false,
    autoRotate: false,
    autoRotateSpeed,
    cameraPosition: [0, 10, 160],
    orthographic: false,
    autoUpdateMaterial: true,
    scale: 1.0
  };

  return (
    <div className="flex flex-col w-full h-full min-h-48 place-self-center place-content-center place-items-center">
      <Link
        className="w-4/5 h-full place-self-center"
        onClick={() => setSelection(selectedProject)}
        href="/project"
        rel="noopener noreferrer"
      >
        <div className={`flex flex-col w-full mb-0 py-0 text-center place-items-center drop-shadow transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]`}>
          <p className="w-fit text-4xl max-sm:text-3xl">
            {name}
          </p>
          <p className="w-fit mt-2 text-2xl max-sm:text-2xl ">
            {shortDescription}
          </p>
        </div>
        <div className="flex flex-col w-full h-96 place-self-center place-content-center -mt-12 sm:-mt-12 md:mt-0 lg:mt-8 xl:mt-10 2xl:mt-10 mb-5">
          <SceneViewer data={sceneConfigs} className="w-96 h-full place-self-center place-content-center justify-around" />
        </div>
      </Link>
    </div>
  );
};

export default ProjectBanner;
