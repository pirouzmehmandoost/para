"use client";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import splideConfig from "../../lib/splideConfig";
import portfolio from "../../lib/globals";
import useSelection from "../store/selection";
import ProductCard from "./ProductCard";

// export function Carousel() {
//   const { projects } = portfolio;

//   return (
//     <main className="flex flex-col w-screen min-w-screen h-screen min-h-screen text-center text-clay_dark">
//       <div className="flex flex-col-reverse">
//         <Splide options={splideConfig} aria-label="Projects Carousel">
//           {projects.map((item, index) => {
//             const rotation = index % 2 === 0 ? -1.0 : 1.0;
//             const props = {
//               ...item,
//               enableControls: false,
//               cameraPosition: [0, 10, 100],
//               rotate: true,
//               rotation,
//             };
//             return (
//               <SplideSlide key={index}>
//                 <div
//                   key={index}
//                   className={`flex w-4/5 h-5/6 my-40 place-self-center place-items-center self-center drop-shadow transition-all duration-500 ease-in-out hover:drop-shadow-[0_25px_25px_rgba(0,0,0,0.5)]`}
//                 >
//                   <ProjectBanner key={index} data={props} />
//                 </div>
//               </SplideSlide>
//             );
//           })}
//         </Splide>
//       </div>
//     </main>
//   );
// }

const ProductCarousel = () => {
  const selection = useSelection((state) => state.selection);
  const { products } = portfolio;
  const { name, productType } = selection;

  const splide = {
    type: "loop", // Loop back to the beginning when reaching the end
    perPage: 1, // Number of items visible per page
    perMove: 1, // Move one item at a time
    rewind: true, // Rewind to start when the end is reached
    pagination: false, // Enable pagination dots
    autoplays: true,
  };

  const carouselConfig = {
    ...splideConfig,
    perPage: 4, // Number of items visible per page
  };

  let relatedProducts = products.filter(
    (el) => el.productType === productType && el.name !== name,
  );
  let headerText = "Related";

  if (!relatedProducts.length) {
    relatedProducts = products.filter((el) => el.name !== name);
    headerText = "See Also";
  }

  return (
    <div className="flex flex-col w-screen h-full justify-between">
      <p className="ml-10 max-sm:ml-5  my-5 text-clay_dark max-sm:text-xl text-3xl">
        {headerText}
      </p>
      <div className="relative flex flex-row w-full h-full overflow-auto">
        <div className="flex flex-row flex-nowrap overflow-none">
          <Splide options={carouselConfig} aria-label="Projects Carousel">
            {relatedProducts.map((item, index) => {
              return (
                <SplideSlide key={index}>
                  <div className="mb-10">
                    <ProductCard data={item} />
                  </div>
                </SplideSlide>
              );
            })}
          </Splide>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
