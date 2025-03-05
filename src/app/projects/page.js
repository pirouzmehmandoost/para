"use client";

import Link from "next/link";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import GlobalModelViewer from "../components/Three/GlobalModelViewer";
import DynamicMenu from "../components/DynamicMenu";

    const menuProps = {
            linkProps: {
            topLinks : [
                {
                    href: "/projects",
                    title: "Projects",
                },
                {
                    href:"/resume",
                    title: "Resume/CV",
                },
                {
                    href: "/about",
                    title: "About",
                },
            ],

            bottomLinks : [
                {
                    href:"https://www.linkedin.com/in/pirouzmehmandoost/",
                    title: "LinkedIn",
                },
                {
                    href:"https://github.com/pirouzmehmandoost/para/blob/main/README.md",
                    title:"Github"
                },
            ],
        },
    }

const ProjectsPage = () => {
    return (
        <div className="flex flex-col w-full h-full mt-14 uppercase text-neutral-600" >
            {/* <div className="w-full basis-1/2 bg-green-500 text-center sm:mt-8 md:mt-10 lg:mt-10 xl:mt-10 2xl:mt-10" >     
                 <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-5xl" >
                    Click Stuff
                </h1> 
            </div> 
            */}

            <div className="absolute p-8 z-100">
                <DynamicMenu {...menuProps}/>
            </div>

            <div className="flex flex-col justify-stretch w-screen h-screen min-h-96" >
                <GlobalModelViewer /> 
                {/* className="flex flex-row w-full h-full place-self-center" /> */}
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