"use client";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import splideConfig from "../../lib/splideConfig";
import { portfolio } from "../../lib/globals";
import useSelection from "../stores/selectionStore";
import ProductCard from "./ProductCard";

const ProductCarousel = () => {
  const selection = useSelection((state) => state.selection);
  const { products } = portfolio;
  const { name, productType } = selection;

  const carouselConfig = {
    ...splideConfig,
    perPage: 3,
    autoplay: false,
    type: "slide",
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
    <div className="flex flex-col w-full h-full justify-between">
      <p className="ml-10 max-sm:ml-5  my-5 text-clay_dark max-sm:text-xl text-3xl">
        {headerText}
      </p>
      <div className="relative flex flex-row w-full h-full overflow-auto">
        <div className="flex flex-row flex-nowrap overflow-none">
          <Splide options={carouselConfig} aria-label="product carousel">
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
