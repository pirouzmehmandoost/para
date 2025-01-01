"use client";

import useSelection from "../store/selection";
import Link from "next/link";
import ModelPreview from "./ModelPreview";
import SceneViewer from "./SceneViewer";

const ProjectBanner = (props) => {
  const { data, data: { name, shortDescription } = {} } = props;
  const setSelection = useSelection((state) => state.setSelection);

  return (
    <div className="relative flex flex-col items-center justify-stretch w-full h-full min-h-48 ">
      <Link
        className="relative w-4/5 h-2/5 overflow-visible bg-red-500"
        onClick={() => setSelection(data)}
        href="/shop/productView"
        rel="noopener noreferrer"
      >
        <div className="flex flex-col w-full text-center">
          <p className="w-fit place-self-center max-sm:text-3xl text-4xl ">
            {name}
          </p>
          <p className="w-fit place-self-center text-2xl max-sm:text-2xl ">
            {shortDescription}
          </p>
        </div>
        <div className="absolute w-96 h-96 -my-8 md:-my-10 sm:-my-10 w-full">
          {/* <ModelPreview data={data} /> */}
          <SceneViewer data={data} />
        </div>
      </Link>
    </div>
  );
};


// const Banner = (props) => {
//   const { bannerUrl, name, shortDescription, imgUrls = {} } = props;

//   const setSelection = useSelection((state) => state.setSelection);
//   const flattenedUrls = Object.values(imgUrls).flat();

//   console.log(props);

//   return (
//     <div className=" relative flex flex-col w-full h-full my-10 place-self-center place-items-center">
//       <Link
//         onClick={() => setSelection(props)}
//         href="/shop/productView"
//         rel="noopener noreferrer"
//       >
//         <Image
//           priority
//           className="self-center w-full h-96 overflow-hidden bg-transparent transition-all duration-700 ease-in-out hover:skew-y-1 hover:skew-x-1"
//           src={bannerUrl}
//           width={768}
//           height={432}
//           quality={100}
//           alt={name}
//         />
//       </Link>
//     </div>
//   );
// };

// const ProjectBanner = (props) => {
//   const {
//     data,
//     data: { bannerUrl, name, shortDescription, imgUrls = {} } = {},
//   } = props;
//   const setSelection = useSelection((state) => state.setSelection);
//   const flattenedUrls = Object.entries(imgUrls).map((entry, el) => {
//     return entry[1].find((e) => e.includes("quarter") || e.includes("1"));
//   });

//   return (
//     <div className=" flex flex-col justify-stretch w-full min-h-48 h-full ">
//       <Link
//         className="absolute w-full h-full overflow-hidden "
//         onClick={() => setSelection(data)}
//         href="/shop/productView"
//         rel="noopener noreferrer"
//       >
//         <div className="flex flex-row w-full absolute inset-0 place-self-center ">
//           {flattenedUrls.map((url) => {
//             return (
//               <div>
//                 <Image
//                   priority
//                   className="overflow-hidden "
//                   src={url}
//                   width={768}
//                   height={432}
//                   quality={100}
//                   alt={name}
//                 />
//               </div>
//             );
//           })}
//         </div>

//         <div className=" relative flex flex-col w-full text-center">
//           <p className="w-fit place-self-center max-sm:text-xl text-3xl ">
//             {name}
//           </p>
//           <p className="w-fit place-self-center max-sm:text-2xl ">
//             {shortDescription}
//           </p>
//         </div>
//         <div className="fixed w-96 h-96 my-14">
//           <ModelPreview data={data} />
//         </div>
//       </Link>
//     </div>
//   );
// };

export default ProjectBanner;
