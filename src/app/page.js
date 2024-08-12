"use client";

import { ModelViewer } from "./components/ModelViewer"

export default function Home() {
    return (
        <main
        className="flex flex-col place-items-center items-center justify-around mix-w-screen min-h-screen"
        >
            
            <p className="text-5xl mb-10">
                Home.
            </p>
            
            <div 
            id="model_viewer_container"
            className="flex place-items-center items-center justify-around mix-w-screen min-h-screen"
            > 
            <ModelViewer />
            </div>
        </main>
    );
};
