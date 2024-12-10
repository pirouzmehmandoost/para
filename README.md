#PARA

I'm developing this app to explore web development with NextJS 14 and share my love for 3D modeling and interactive design. I share my to-do list here as well as light notes on personal goals:  

PARA is a work in progress portfolio site which showcases my 3D printed designs and enables interaction with the models.
My goals while developing are to:
- Clearly express the functionality of the site from the home page. 
- Display a well-formatted resume. 
- Employ straightforward file structure compliant to NextJS 14 design patterns.
- Refine functionality of the most commonly used web components namely all menus and canvases (JS files with "Menu" or  "Viewer" in the name).
- Optimize app performance by managing 3D models, materials, animations, renderers as components or state-dependent props.
- Develop comfort styling with Tailwind CSS.
- Develop a personal style for web design through practice, research, and feedback.

My long term goals are to: 
- Deploy a functional web store.
- Implement blog functionality.

Other goals include: 
- import high-res photos of 3D printed projects.
- Design and import logo and headshot.

# Current To Do's: 
- Add resume page and route.
- make more streamlined version of the app for interviews (different route)
- more Menus/modals expanded by default
- product menu should have expand/collapse toggle instead of clicking text
- product menu should be full width to divide the two full width elements above and below
- images for products seem like they would be draggable
- make all text bigger

- eliminate all comments
- get eslint set up (in terminal, vscode)

Tools Used: 
React Three Fiber (R3F)
https://github.com/pmndrs/react-three-fiber
React renderer for Threejs. For building 3D scenes as JSX components, useful hooks, performance optimization- resources with the same URL (geometries, materials) that are loaded with useLoader are cached automatically.

'If you access a resource via useLoader with the same URL, throughout the component tree, then you will always refer to the same asset and thereby re-use it. This is especially useful if you run your GLTF assets through GLTFJSX because it links up geometries and materials and thereby creates re-usable models.'
https://r3f.docs.pmnd.rs/advanced/scaling-performance


GLTFJSX
CLI tool that turns GLTF assets into declarative, reusable (react-three-fiber) JSX components. Though I do 
https://github.com/pmndrs/gltfjsx