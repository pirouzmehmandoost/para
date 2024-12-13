"use client";

import useSelection from "../store/selection";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const ProductCard = (props) => {
  const { data, data: { imgUrls = {}, name, price } = {} } = props;

  const [increment, setIncrement] = useState(0);
  const setSelection = useSelection((state) => state.setSelection);
  const flattenedUrls = Object.values(imgUrls).flat();

  return (
    //1920x1080 images (16:9)
    <div className="w-full h-full flex flex-col">
      <div className="flex items-end">
        <div className="relative flex flex-row justify-center items-center">
          <Link
            onMouseEnter={() => setIncrement(1)}
            onMouseLeave={() => setIncrement(0)}
            onClick={() => setSelection(data)}
            href="/shop/productView"
            rel="noopener noreferrer"
          >
            <Image
              priority
              className="w-auto h-auto bg-cover overflow-auto"
              src={flattenedUrls[increment]}
              width={768}
              height={432}
              quality={100}
              alt={name}
            />
          </Link>
        </div>
      </div>

      <div className="max-sm:hidden w-full text-center text-clay_dark ">
        <p> {name} </p>
        <p> {price} </p>
      </div>
    </div>
  );
};

export default ProductCard;
