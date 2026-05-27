// /** @type {import('tailwindcss').Config} */
// export default {
//   plugins: ["@tailwindcss/postcss"],
// };
/** @type {import('postcss-load-config').Config} */
const postcssConfig = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default postcssConfig;