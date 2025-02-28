"use client";

const SearchBar = () => {
  return (
    // <div className="flex flex-row flex-grow text-center text-2xl text-clay_dark">
    <div className="flex flex-row grow text-center text-2xl text-clay_dark">
      <input
        type="text"
        id="search_input"
        className="text-center bg-transparent border-b border-clay_dark focus:outline-hidden placeholder-clay_dark"
        placeholder="Search Products"
        required
      />
    </div>
  );
};

export default SearchBar;
