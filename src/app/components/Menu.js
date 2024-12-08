'use client'

import useSelection from '../store/selection';

const Menu = ({setExpanded, expanded} ) => {

    const selection = useSelection(state => state.selection);
    const {
        colors,
        description,
        name,
        price,
    } = selection;   

    const tailWindColor = (col) => {
        const cssColor = col.toLowerCase();

        if (cssColor.includes("white")) return "bg-slate-100";
        if (cssColor.includes("black")) return "bg-slate-950"
        else return "bg-lime-200";
    };


    const colorSelectButtons = (
        <div className="flex flex-row">
        {
            colors.map((c) => {
                return (
                    <div
                        key={c}
                        className={`${tailWindColor(c)} w-6 h-6 mx-3 border-solid border-4 rounded-full border-clay_dark cursor-pointer`} >
                    </div>
                )
            })
        }
        </div>
    );


    return (
         < div 
            id="shop_menu"
            className={`sticky bottom-0 z-20 right-0 w-1/2 place-self-end transition-all duration-700 ease-in-out ${expanded ? "mt-96" : "mt-0"}`}
        >
            <div className="flex z-20 w-full h-full bottom-0 right-0" >
                <div className={`w-full h-full border-solid border-2 border-clay_dark`} >
                    <div className={`flex flex-col text-clay_dark backdrop-blur-xl backdrop-brightness-150 transition-all duration-500 ease-in-out ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-0"}`} >
                        <div className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? "overflow-auto max-h-96" : "overflow-hidden max-h-0"}`} >
                            <p  className={`transition-all duration-700 ease-in-out delay-75 ${expanded ? "opacity-100" : "opacity-0"}`} >
                                {description}
                            </p>
                        </div>
                        <div className="flex flex-row my-3 max-w-full" >
                            <div
                                className="justify-items-center basis-1/4 cursor-pointer" >
                                <p onClick={setExpanded} >
                                    {name}
                                </p>
                            </div>
                            <div className=" justify-items-center basis-1/4" >
                                <p>{price}</p>
                            </div>
                            <div className="justify-items-center basis-1/2" >
                                {colorSelectButtons}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;