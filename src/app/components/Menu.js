"use client";

import useSelection from "../stores/selectionStore";

const Menu = ({ setExpanded, expanded }) => {
  const selection = useSelection((state) => state.selection);
  const {
    sceneData: {
      materials: { colorWays },
    },
    description,
    name,
    price,
  } = selection;

  const colorSelectButtons = (
    <div className="flex flex-row">
      {Object.entries(colorWays).map((entry) => {
        return (
          <div
            key={entry[0]}
            className={`${entry[1].tailwindColor} w-6 h-6 mx-3 border-solid border-4 rounded-full border-neutral-600 cursor-pointer`}
          ></div>
        );
      })}
    </div>
  );

  return (
    <div
      id="shop_menu"
      className={`sticky bottom-0 z-20 right-0 sm:w-full md:w-full lg:w-1/2 place-self-end transition-all duration-700 ease-in-out ${expanded ? "mt-96" : "mt-0"}`}
    >
      <div className="flex z-20 w-full h-full bottom-0 right-0">
        <div className={`w-full h-full border-solid border-2 border-neutral-600`}>
          <div
            className={`flex flex-col text-neutral-600 backdrop-blur-xl backdrop-brightness-150 transition-all duration-500 ease-in-out ${expanded ? "backdrop-opacity-100" : "backdrop-opacity-0"}`}
          >
            <div
              className={`px-6 pt-0 justify-items-center transition-all duration-700 ease-in-out ${expanded ? "overflow-auto max-h-96" : "overflow-hidden max-h-0"}`}
            >
              <p
                className={` mt-5 transition-all duration-700 ease-in-out delay-75 ${expanded ? "opacity-100" : "opacity-0"}`}
              >
                {description}
              </p>
            </div>
            <div className="flex flex-row my-3 max-w-full">
              <div className="ml-5 justify-items-center basis-1/4 text-nowrap">
                <p className="cursor-pointer" onClick={setExpanded}>
                  {name}
                </p>
              </div>
              <div className="sm:ml-5s md:ml-5 lg:ml-5 justify-items-center basis-1/4">
                <p>{price}</p>
              </div>
              <div className="sm:mx-2 md:mx-2 justify-items-center basis-1/2">
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
