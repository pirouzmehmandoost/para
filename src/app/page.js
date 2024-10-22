"use client";

import ModelViewer from "./components/ModelViewer";


export default function Home() {
    return (
        <main
        className="flex flex-col place-items-center items-center w-screen h-screen"
        >
            <p className="text-5xl my-20">
                This is the Home Page
            </p>
            
           <div className=" w-4/5 h-4/5" > <ModelViewer modelUrl={'/rock_tote_for_web.glb'}/> </div>
        </main>
    );
};
