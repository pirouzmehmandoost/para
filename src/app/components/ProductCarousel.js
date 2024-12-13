"use client";

import portfolio from "../../lib/globals";
import useSelection from "../store/selection";
import ProductCard from "./ProductCard";

const ProductCarousel = () => {
  const selection = useSelection((state) => state.selection);
  const { products } = portfolio;
  const { name, productType } = selection;

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
          {relatedProducts.map((item, index) => {
            return <ProductCard key={index} data={item} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
