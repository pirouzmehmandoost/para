"use client";

import ModelViewer from "./components/ModelViewer";
import useSelection  from "./store/selection";

export default function Home() {

    const selection = useSelection((state) => state.selection);

    const { modelUrl } = selection;

    return (
        <main
        className="flex flex-col place-items-center items-center w-screen h-screen"
        >
            <p className="text-5xl my-20">
                Model View Test
            </p>

            <p> model is {modelUrl}</p>
            
           <div className=" w-4/5 h-4/5" > 
                <ModelViewer modelUrl={modelUrl}/> 
           </div>
        </main>
    );
};
