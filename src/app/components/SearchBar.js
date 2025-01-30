"use client";

// import { useState } from "react";

const SearchBar = () => {
    // const [searchQuery, setsearchQuery] = useState("invisible");

    return (
        <div className="flex flex-row flex-grow text-center text-2xl text-clay_dark" >
            <input
                type="text"
                id="search_input"
                className="text-center bg-transparent border-b border-clay_dark focus:outline-none placeholder-clay_dark"
                placeholder="Search Products"
                required
            />
        </div>
    );
};

export default SearchBar;