"use client";

import ModelViewer from "./components/ModelViewer";
import useSelection from "./store/selection";

export default function Home() {
    return (
        <main className={`flex flex-col place-items-center items-center w-screen max-w-screen h-screen max-h-screen" bg-cover bg-[url("/oval_bag_hero_2.png")]`}>
            <div className=" w-4/5 h-4/5" >
                <ModelViewer />
            </div>
        </main>
    );
};
