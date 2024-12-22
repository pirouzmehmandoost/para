# PARA

I'm developing this app to explore web development with NextJS 14 and exploe my love for interactive design, typography, and web graphics.
I share my to-do list here as well as light notes on tools and feedback.

PARA is a work in progress portfolio site which showcases my learning process as well as a few products I'm currently designing.

My goals while developing are to:

- Clearly express the functionality of the site from the home page.
- Display a well-formatted resume.
- Employ straightforward file structure compliant to NextJS design patterns.
- Optimize app performance of WebGL implementations- ie managing resources such as 3D geometries, textures, materials image files as state-dependent props.
- Develop greater comfort using Tailwind CSS.
- Develop a personal web design style through practice, research, and feedback.

My long term goals are to:

- Deploy a functional web store.
- Implement blog functionality.
- Take better product photos.

# Current To Do's:

- Add resume page and enable pdf downloads.
- make a streamlined version of the app for interviews (different route)
- Expand Menus/modals by default
- Product menu should have a toggle expand/collapse icon that's easy to spot
- product menu should be full width to divide the two full width elements above and below
- images for products seem like they would be draggable, as some 3D models enable panning/orbit controls
- make all text bigger
- remove commented code
- get eslint set up (in terminal, vscode).

Tools Used:
React Three Fiber
https://github.com/pmndrs/react-three-fiber
React renderer for Threejs. For building 3D scenes as JSX components, useful hooks, performance optimization- resources with the same URL (geometries, materials) that are loaded with useLoader are cached automatically.

'If you access a resource via useLoader with the same URL, throughout the component tree, then you will always refer to the same asset and thereby re-use it. This is especially useful if you run your GLTF assets through GLTFJSX because it links up geometries and materials and thereby creates re-usable models.'
https://r3f.docs.pmnd.rs/advanced/scaling-performance

GLTFJSX
CLI tool that turns GLTF assets into declarative, reusable (react-three-fiber) JSX components. I relied on this tool more while learning the ropes with R3F.
https://github.com/pmndrs/gltfjsx

GSAP
A Javascript animation library, not currently using it but may.
https://gsap.com/

#Fonts used:

Diatype
https://abcdinamo.com/typefaces/diatype

Halibut
https://www.collletttivo.it/typefaces/halibut

Fonts I'm keeping an eye on:

Hedvig Letters Serif
https://fonts.google.com/specimen/Hedvig+Letters+Serif?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*

Amethysta
https://fonts.google.com/specimen/Amethysta?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*
