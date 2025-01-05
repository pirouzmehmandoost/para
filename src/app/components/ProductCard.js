"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useSelection from "../store/selection";

const ProductCard = (props) => {
  const { data, data: { imgUrls = {}, name, price } = {} } = props;

  const [increment, setIncrement] = useState(0);
  const setSelection = useSelection((state) => state.setSelection);
  const flattenedUrls = Object.values(imgUrls).flat();

  return (
    //1920x1080 images (16:9)
    <div className="relative flex flex-col w-full h-full justify-center items-center text-center text-clay_dark">
      <div className="flex flex-col justify-center items-center">
        <Link
          onMouseEnter={() => setIncrement(1)}
          onMouseLeave={() => setIncrement(0)}
          onClick={() => setSelection(data)}
          href="/shop/productView"
          rel="noopener noreferrer"
        >
          <Image
            priority
            className="relative w-auto h-auto bg-cover overflow-auto"
            src={flattenedUrls[0]}
            width={768}
            height={432}
            quality={100}
            alt={name}
          />
          <Image
            priority
            className={`absolute w-auto h-auto inset-0 bg-cover overflow-auto ${increment > 0 ? "opacity-1" : "opacity-0"} transition-all duration-700 ease-in-out hover:z-10 hover:opacity-100`}
            src={flattenedUrls[1]}
            width={768}
            height={432}
            quality={100}
            alt={name}
          />
          <div className="w-full">
            <p> {name} </p>
            <p> {price} </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
