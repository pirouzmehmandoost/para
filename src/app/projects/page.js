"use client";

import Link from "next/link";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import GlobalModelViewer from "../components/Three/GlobalModelViewer";

const Projects = () => {
    return (
        <div className="flex flex-col w-screen h-full mt-14 uppercase text-neutral-600" >
            <div className="w-full h-2/5 text-center sm:mt-8 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10" >     
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-5xl" >
                    Click Stuff
                </h1>
            </div>

            <div 
            className="absolute top-20 left-10 mt-10 p-2 rounded-full bg-neutral-200 transition-colors duration-200 ease-in-out hover:text-neutral-500"
            >  
                <Link href="/" rel="noopener noreferrer" >
                    <div 
                    className="flex flex-row w-full place-items-center cursor-pointer text-4xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-5xl"
                    >
                        <ArrowBackIosNewIcon/>
                    </div>
                </Link>
            </div>

            <div className="absolute w-full h-4/5 min-h-96 bottom-0" >
                <GlobalModelViewer className="flex flex-row w-full h-full place-self-center" />
            </div>
        </div>
    );
};

export default Projects;