"use client";

import { useState } from "react";
// import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
// import TextField from '@mui/material/TextField';

export default function SearchBar() {
    const [searchQuery, setsearchQuery] = useState("invisible");

    return (
        <div
        id="searchbar"
        className="flex flex-row flex-grow grid text-center text-2xl text-clay_dark"
        >
            <div>
                <input 
                type="text" 
                id="search_products" 
                className= "text-center bg-transparent border-b border-clay_dark focus:outline-none placeholder-clay_dark" 
                placeholder="Search Products" 
                required
                />
            </div>
        </div>
    );
}
