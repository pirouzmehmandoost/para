"use client";

import Link from "next/link";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import GlobalModelViewer from "@/components/Three/GlobalModelViewer";
import DynamicMenu from "@/components/DynamicMenu";

const menuProps = {
    topLinks : [
        {
            href: "/",
            title: "Back",
        },
                {
            href: "/",
            title: "Back",
        },
                {
            href: "/",
            title: "Back",
        },

    ],
    bottomLinks : [
        {
            href: "/",
            title: "Back",
        },
                {
            href: "/",
            title: "Back",
        },
    ],
};

const ProjectsPage = () => {
    return (
        <div className="flex flex-col w-full h-full mt-14 uppercase text-neutral-600" >
            <div className="absolute p-8 z-100">
                <DynamicMenu {...menuProps}/>
            </div>

            <div className="flex flex-col justify-stretch w-screen h-screen min-h-96" >
                <GlobalModelViewer /> 
            </div>
            <div 
            className={`absolute top-96 z-100 left-10 p-8 rounded-full 
            text-neutral-600 bg-neutral-500/5 backdrop-blur-md
            transition-all duration-400 ease-in-out hover:text-neutral-300 hover:bg-neutral-500/10 hover:backdrop-blur-sm
            `}
            >  
                <Link href="/" rel="noopener noreferrer" >
                    <div className="flex flex-row w-full place-items-center cursor-pointer" >
                        <ArrowBackIosNewIcon fontSize="large" />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default ProjectsPage;