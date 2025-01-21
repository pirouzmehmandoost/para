
"use client";
// import React, { useRef, useEffect, useState } from 'react';

// export const IframeComponent = () => {
//   const iframeRef = useRef(null);
//   const containerRef = useRef(null);
//   const [scale, setScale] = useState(null);
//   useEffect(() => {
//     const iframe = iframeRef.current;
//     const container = containerRef.current;

//     const calculateScaleFactor = () => {
//       const containerWidth = container.offsetWidth;
//       const iframeWidth = iframe.contentWindow.document.body.offsetWidth;
//       return containerWidth / iframeWidth;
//     };

//     const scaleIframe = () => {
//       const scaleFactor = calculateScaleFactor();
//       iframe.style.transform = `scale(${scaleFactor})`;
//       setScale(scaleFactor)
//     };

//     scaleIframe();
//     window.addEventListener('resize', scaleIframe);

//     return () => window.removeEventListener('resize', scaleIframe);
//   }, []);

//   console.log(scale)
//   return (
//     <div ref={containerRef} className="w-4/5 h-screen py-16 mb-18">
//       <iframe
//         ref={iframeRef}
//         width="500px"
//         height="500px"
//         allow="fullscreen"
//         src="/pirouz_mehmandoost_resume.pdf"
//         className="mt-28 w-2/3 h-5/6 place-self-center"
//       />
//     </div>
//   );
// };

// export default function Resume() {
//   return (
//     < IframeComponent />
//   );
// }


export default function Resume() {
  return (
    <div className="flex flex-col w-screen h-screen">
      <iframe
        className="mt-28"
        src={"/pirouz_mehmandoost_resume.pdf"}
        width="100%"
        height="100%"
        allowFullScreen
      />
    </div>
  );
}
