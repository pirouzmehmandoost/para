"use client";

import { useState } from "react";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import useMaterial from "../stores/materialStore";
import useSelection from "../stores/selectionStore";
import SingularModelViewer from "../components/Three/SingularModelViewer";

const ProjectViewer = () => {
    const getMaterial = useMaterial((state) => state.getMaterial);
    const [expanded, setExpanded] = useState(false);
    const selection = useSelection((state) => state.getSelection());

    console.log("ProjectViewer data, which is selection: ", selection);

    const {
        sceneData: {
            groupName = "", 
            materialId = "",
            materials: { defaultMaterial = "", colorWays = {} } = {},
        } = {},
        description = "",
    } = selection;
    const [selectedMaterial, setMaterial] = useState(materialId.length ? materialId : defaultMaterial ?? null);
    const data = {
        ...selection.sceneData,
        autoRotate: true,
        autoRotateSpeed: 0.4,
        autoUpdateMaterial: false,
        enablePan: true,
        enableRotate: true,
        enableZoom: false,
        materialId: selectedMaterial,
        orthographic: false,
        position: undefined,
        scale: 0.4,
    };

    const colorSelectButtons = (
        <div className="flex flex-row place-content-center items-center" >
            <p className="text-nowrap text-2xl" > Select Color </p>
            {Object.entries(colorWays).map((entry) => {
                return (
                    <div
                    key={entry[0]}
                    className={`flex ${getMaterial(entry[1]).tailwindColor} w-6 h-6 mx-3 cursor-pointer rounded-full outline outline-offset-2 ${selectedMaterial !== entry[1] ? "outline-none" : "outline-neutral-900 outline-2"}`}
                    onClick={() => {
                    if (selectedMaterial !== entry[1]) setMaterial(entry[1]);
                    }}
                    />
                );
            })}
        </div>
    );

    return (
        <div id="project_viewer" className="flex flex-col w-full h-screen" >
            <div id="model_viewer_container" className="flex flex-col w-full h-full place-self-center place-content-center" >
                <SingularModelViewer
                className="w-full h-full self-center place-self-center place-content-center items-center"
                data={data}
                />
                <div 
                id="back-button"
                className="fixed bottom-40 left-10 mt-10 p-8 rounded-full bg-white/1  text-5xlbackdrop-blur-sm transition-all duration-500 ease-in-out text-neutral-900 hover:text-neutral-700"
                >  
                    <Link href="/projects" rel="noopener noreferrer" >
                        <div className="flex flex-row w-full place-items-center cursor-pointer" >
                            <ArrowBackIosNewIcon fontSize="large" />
                        </div>
                    </Link>
                </div>
            </div>
            <div
            id="project_menu"
            className={`fixed bottom-0 z-20 right-0 w-full place-self-end transition-all duration-700 ease-in-out ${expanded ? "mt-96" : "mt-0"}`}
            >
                <div className="flex z-20 w-full h-full bottom-0 right-0" >
                    <div className="w-full h-full border-solid border-2 border-neutral-900" >
                        <div
                        className={`flex flex-col backdrop-blur-xl backdrop-brightness-200 transition-all duration-500 ease-in-out ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-50"}`}
                        >
                            {/* collapsible menu items */}
                            <div
                            className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? "overflow-auto max-h-96" : "overflow-hidden max-h-0"}`}
                            >
                                <p 
                                className={`mt-5 text-neutral-900 transition-all duration-700 ease-in-out delay-75 ${expanded ? "opacity-100" : "opacity-0"}`}
                                >
                                    {description}
                                </p>
                            </div>
                            {/* permanently visible menu items */}
                            <div className="flex flex-row my-3 max-w-full align-items-center justify-items-stretch text-neutral-900"
                            >
                                <div className="ml-5 justify-self-center align-items-center basis-1/3" >
                                    <div
                                    className="cursor-pointer self-center"
                                    onClick={() => { setExpanded((current) => !current); }}
                                    >
                                        {expanded ? <CloseFullscreenIcon /> : <MenuIcon />}
                                    </div>
                                </div>
                                <div className="justify-self-center basis-1/3" >
                                    <p className="text-2xl text-center justify-self-center " >
                                    {groupName}
                                    </p>
                                </div>
                                <div className="sm:mx-2 md:mx-2 justify-self-center self-center basis-1/3" >
                                    {colorSelectButtons}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectViewer;
