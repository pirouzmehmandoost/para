"use client";
import { useState, useEffect } from "react";

const Resume = () => {
  const [screenSize, setScreenSize] = useState("");
  const [dimensions, setDimensions] = useState([0, 0]);

  useEffect(() => {
    console.log(window);
    const handleResize = () => {
      setDimensions([window.innerWidth, window.innerHeight]);
      const shortest =
        window.innerWidth < window.innerHeight
          ? window.innerWidth
          : window.innerHeight;

      if (shortest < 640) {
        setScreenSize("xs");
      } else if (shortest < 768) {
        setScreenSize("sm");
      } else if (shortest < 1024) {
        setScreenSize("md");
      } else if (shortest < 1280) {
        setScreenSize("lg");
      } else if (shortest < 1536) {
        setScreenSize("xl");
      } else if (shortest >= 1536) {
        setScreenSize("2xl");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed flex flex-col w-full h-full mt-24 place-content-center overflow-hidden bg-white">
      {/* <h1>
        Current screen size: {screenSize} {dimensions[0]}x{dimensions[1]}{" "}
        {screenSize === "xs" && <span> mobile </span>}
      </h1> */}
      <iframe
        className={`flex-col self-center object-center place-self-center justify-items-center place-items-center items-center place-content-center content-center border-0 border-none bg-contain overflow-hidden object-scale-down overscroll-x-none ${screenSize === "xs" ? "fixed top-0 scale-[0.75]" : "w-4/5  h-full"}`}
        src={"/pirouz_mehmandoost_resume.pdf"}
        allow="fullscreen"
        width={`${screenSize === "xs" ? `${dimensions[0] < dimensions[1] ? dimensions[0] * 1.3 : dimensions[0] * 1.1}px` : parseInt(dimensions[0] * 0.8)}`}
        height={`${screenSize === "xs" ? `${dimensions[1] < dimensions[0] ? dimensions[1] * 1.3 : dimensions[1] * 1.1}px` : parseInt(dimensions[1] * 0.8)}`}
      />
    </div>
  );
};

export default Resume;
