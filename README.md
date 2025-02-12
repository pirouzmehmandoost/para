# PARA

I'm developing this app to explore web development with NextJS 14 and explore a growing love computer graphics and rendering them on browsers.
I share my to-do list here as well as light notes on tools and feedback.

PARA is a work in progress portfolio site for sharing the fruits my learning process. As a basis for using graphics libraries the app showcases a few consumer products I've currently designed, 3D print from home, and use daily.

My objectives are to:

- Clearly express that I'm a professional software engineer, and not a designer (though I've worked as both).
- Display a well-formatted resume.
- Optimize performance of Web graphics and animations 
- Display an understanding of CSS, HTML, JavaScript, React, and Next.js (14).

My current development goals are :
- Refine the home page- latest feature branch significantly optimizes use of Three.js, but isn't ready to merge.
- Present PDF resume's without the use of paid API's.
- Implement blog functionality.
- optimize Three.js implementation- i.e. swap usage post-processing library for alternatives.
- Host large asset files on the web and outsie of this repo.

# Current To Do's:

- Refine the Resume page- it currently uses an iframe which does not enable responsive styling on mobile screens.
- Refine home page- at first glance it isn't clear what my "recent design projects" are.
- make a streamlined version of the app for interviews (different route).
- menus should have a visible toggle expand/collapse icon, and should upen up to screen width/height

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
A JavaScript animation library, currently only using on feature branches.
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
