"use client";

import GlobalScene from "./Experience/GlobalScene";

const ProjectBanner = () => {
  return (
    <div className="flex flex-col w-full h-full min-h-48 place-self-center place-content-center place-items-center">
      <div className="flex flex-col w-full h-96 place-self-center place-content-center -mt-12 sm:-mt-12 md:mt-0 lg:mt-8 xl:mt-10 2xl:mt-10 mb-5">
        <GlobalScene className="w-full h-full place-self-center place-content-center justify-around" />
      </div>
    </div>
  );
};

export default ProjectBanner;

//<div className={`flex flex-col w-full mb-0 py-0 text-center place-items-center drop-shadow transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]`}>
//           <p className="w-fit text-4xl max-sm:text-3xl">
//             {name}
//           </p>
//           <p className="w-fit mt-2 text-2xl max-sm:text-2xl ">
//             {shortDescription}
//           </p>
//         </div> 