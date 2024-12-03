// "use client";

// import { useState } from "react";
// import useSelection from "../store/selection";

// const ShopMenu = (props) => {

//     const { expanded: myExpanded } = props
//     const [expanded, setExpanded] = useState(myExpanded);
//     const selection = useSelection(state => state.selection);
//     const {
//         name,
//         price,
//         colors,
//         description,
//     } = selection;


//     const tailWindColor = (col) => {
//         const cssColor = col.toLowerCase();

//         if (cssColor.includes("white")) return "bg-slate-100";
//         if (cssColor.includes("black")) return "bg-slate-950"
//         else return "bg-lime-200";
//     };


//     const colorSelection = (
//         <div className="flex flex-row">
//         {
//             colors.map((c) => {
//                 return (
//                     <div
//                         key={c}
//                         className={`${tailWindColor(c)} w-6 h-6 mx-3 border-solid border-4 rounded-full border-clay_dark cursor-pointer`} >
//                     </div>
//                 )
//             })
//         }
//         </div>
//     );


//     const toggleExpanded = () => setExpanded(current => !current);


//     return (
//         <div
//             id="shop_menu"
//             className="flex w-full bottom-0 right-0"
//         >
//             <div className={`w-full z-20 bottom-0 right-0 border-solid border-2 border-clay_dark transition-all duration-[2000ms] ease-in-out ${expanded ? "mb-10" : "mb-0"}`}>
//                 <div className={`flex flex-col text-clay_dark backdrop-blur-xl backdrop-brightness-150 transition-all duration-3000 ease-in-out  ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-0"}`} >
//                     <div className={`px-6 pt-0 justify-items-center transition-all duration-3000 ease-in-out ${expanded ? "overflow-auto max-h-20" : " overflow-hidden max-h-0"}`} >
//                         <p>{description}</p>
//                     </div>
//                     <div className="flex flex-row my-3 max-w-full" >
//                         <div
//                             className="justify-items-center basis-1/4 cursor-pointer"
//                             onClick={toggleExpanded}>
//                             <p>{name}</p>
//                         </div>

//                         <div className=" justify-items-center basis-1/4">
//                             <p>{price}</p>
//                         </div>
//                         <div className="justify-items-center basis-1/2">
//                         {/* <div className="group relative justify-items-center basis-1/2 overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-20 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10"> */}
//                             {colorSelection}
//                         {/* </div> */}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ShopMenu;