# PARA

I'm developing this app to explore web development with NextJS 14 and explore a growing love computer graphics and rendering them on browsers.
I share my to-do list here as well as light notes on tools and feedback.

PARA is a work in progress portfolio site for sharing the fruits my learning process. As a basis for using graphics libraries the app showcases a few consumer products I've currently designed, 3D print from home, and use daily.

My objectives are to:

- Clearly express that I'm a professional software engineer, and not a designer (though I've worked as both).
- Display a well-formatted resume.
- Optimize performance of WebGL implementations and animations.
- Display an understanding of CSS, HTML, JavaScript, React, and Next.js (15).

My current development goals are :

- Refine the home page.
- Update Next.js, React, Tailwind CSS, and key packages- incoming chages from branch upgrade_packages handle migration.
- optimize Three.js implementation- Same branch introduces changes including:
  1.) Removal of R3F post-processing, replaced with vanilla three.js and R3F.
  2.) All .glb files are preloaded using useGLTF.preload().
  3.) All meshes are cached and reused throughout runtime.
  4.) All materials are cached and reused throughout runtime.

# Current To Do's:

- Linting- Configure linter with rules for Tailwind CSS.
- Resume page- iframe does not enable responsive styling on mobile screens, looks worse when device orientation tilts to landscape.
- Home page- Create a new spash page with a modal which may route to the current home page.
- Projects page (current home page) - at first glance it isn't clear what my "recent design projects" are.

- Issues when running on mobile- canvas pointer event handler logic needs refinement. meshes could be easier to select.
- No logic to conditionally enable routing.
- make a streamlined version of the app for interviews (different route).
- menus should have a visible toggle expand/collapse icon, and should upen up to screen width/height
- yarn exec prettier . --write

Libraries Extensively Used:

Three.js
https://threejs.org/
JavaScript API for implementing WebGL- for rendering 2D/3D computer graphics on browsers.

React Three Fiber
https://github.com/pmndrs/react-three-fiber
React renderer for Threejs. For building 3D scenes as JSX components, useful hooks, performance optimization- resources with the same URL (geometries, materials) that are loaded with useLoader are cached automatically.

'If you access a resource via useLoader with the same URL, throughout the component tree, then you will always refer to the same asset and thereby re-use it. This is especially useful if you run your GLTF assets through GLTFJSX because it links up geometries and materials and thereby creates re-usable models.'
https://r3f.docs.pmnd.rs/advanced/scaling-performance

React Three Fiber Post Processing
Library of functionalities for post-processing graphics- ie special effects to rendered graphics.
https://react-postprocessing.docs.pmnd.rs/introduction
https://medium.com/@nicolasgiannantonio/post-processing-effect-18b9c3be1c80

GLTFJSX
CLI tool that turns GLTF assets into declarative, reusable (react-three-fiber) JSX components. Trims .glb file size which is immensely helpful when staging static assets on github.
https://github.com/pmndrs/gltfjsx

GSAP
A JavaScript animation library, currently only using on feature branches. Thus far I've managed some nifty camera repositioning/manipulations with only Three and R3F.  
https://gsap.com/

JEasings
JavaScript engine for 3d graphics animations, currently only using on feature branches.
https://sbcode.net/threejs/jeasings/

#Typefaces used:
Diatype
https://abcdinamo.com/typefaces/diatype

Halibut
https://www.collletttivo.it/typefaces/halibut

I keep an eye on:

Hedvig Letters Serif
https://fonts.google.com/specimen/Hedvig+Letters+Serif?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*

Amethysta
https://fonts.google.com/specimen/Amethysta?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*
