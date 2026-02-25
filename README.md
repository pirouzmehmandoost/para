# PARA

I'm developing this app to explore web development with NextJS 15 and explore a growing love computer graphics and rendering them on browsers.
I share my to-do list here as well as light notes on tools and feedback.

PARA is a work in progress site that shows my 3D printing projects. For now it only shows the 3d models, and allows you to manipulate positons and materials.


## Notable Technical Implementations: 
  
 1. **Dynamic Model Positioning**
   - Meshes of 3D Models are dynamically positioned, translating along the y-axis to avoid intersection with a designated Ground mesh. Zero per-frame overhead. Repositioning happens only once, the Ground's position remains constant.
   - Files: `Model.js:30-144`, `Group.js`, `meshUtils.js`
   
   **Implementation:**
   - Raycasting: A circle geometry is positioned under each model mesh's bounding box. 2 rays are cast up and down each vertex of the circle. The model is translated up or down the Y-axis. The circle's dimensions ensure that the mesh will not intersect the ground while the model mesh rotates.

   - **Sampling Strategy**: 
   - Calculate the diagonal length of the underside of bounding box. As if the rectangle is triangulated, and you want the longest edge's length.
    - Instantiate a circle geometry, radius = diagonal length, position is centered under the bounding box. Vertex count is 11 (10 edges + center)
    - Raycast from each vertex (22 rays total). 
   - **Bidirectional raycasting**: 
    - **Hits against the model mesh itself are negated.**
    - Upward rays detect if a model is too low, since an intersection means the ground is above the circle.
    - The intersecting ray that travels the farthest matters most. If there is an intersection, the y-coordinate hit point is used to calculate how the model must move up the y axis.
    - Downward rays detect high-floating models. **This is not implemented yet, a nice feature if the ground is a giant cube or sphere**
   - **Hit Filtering**:
     - Upward Penetration threshold (2x model height) ignores distant terrain until further refinement revises this logic.
   - **Dynamic Clearance**: The longest ray cast travel distance + 5% of model height.
   - **Performance**: One-time computational cost per model on mount (bounding box calculation + 22 raycasts). It isn't expected that the user will be changing their browser's height and width unless they tilt a mobile device, in which case which the component re-renders and raycasts.


2.  **On-Demand Rendering**
  - Canvas frameloop toggles beween `demand`  and `interactive` depending on next.js routing, so that in the future I can implement an `About` page and halt animations. 


3. **Frustum Culling**
  - Shadow map size is optimized for optimal frame rate, cast shadows only render for meshes within frustum bounds. Shadow computations are the most computationally costly factor of the app.


4. **Materials and Textures**`
  - Visit `src/app/stores/materialStore.js` to see how to I manage textures and Materials with Zustand. I'll add more explanation to the readme soon.  


---


## UI to-do list: 

1.  **Resume page**
  - WIP

2.  **Home page**
  - Create new splash page
  - display instructions for user interactions (swipe gestures, navigation with ESC, etc).

3.  **Model Technical Specs**
  - Write more informative text about each design 

  ---

## Graphics/Animation Libraries Used:

- [Three.js](https://threejs.org/)
JavaScript API for implementing WebGL- for rendering 2D/3D computer graphics on browsers.

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
React renderer for Threejs. For building 3D scenes as JSX components, useful hooks, performance optimization- resources with the same URL (geometries, materials) that are loaded with useLoader are cached automatically.

['If you access a resource via useLoader with the same URL, throughout the component tree, then you will always refer to the same asset and thereby re-use it. This is especially useful if you run your GLTF assets through GLTFJSX because it links up geometries and materials and thereby creates re-usable models.'](https://r3f.docs.pmnd.rs/advanced/scaling-performance)


- [React Post-Processing](https://react-postprocessing.docs.pmnd.rs/)
Library of functionalities for post-processing graphics- ie special effects to rendered graphics.


- [Maath](https://github.com/pmndrs/maath)
A collection of useful math helpers, random generators


- [Motion](https://motion.dev/)


- [GLTFJSX](https://github.com/pmndrs/gltfjsx) CLI tool that I use to optimize file size. It's primarily advertised for generating R3F components, I use it for file compression and write my own. 


---


## Personal Notes:


### Fonts Used:
- [Diatype](https://abcdinamo.com/typefaces/diatype)
- [Halibut](https://www.collletttivo.it/typefaces/halibut)


### Fonts to remember:
- [Hedvig Letters Serif](https://fonts.google.com/specimen/Hedvig+Letters+Serif?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*)
- [Amethysta](https://fonts.google.com/specimen/Amethysta?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*)
- [Handjet](https://fonts.google.com/specimen/Handjet?preview.text=Pirouz%20Mehmandoost&categoryFilters=Feeling:%2FExpressive%2FFuturistic;Technology:%2FTechnology%2FVariable&specimen.preview.text=Pirouz+Mehmandoost&preview.script=Latn&preview.lang=en_Latn)
- [Ysabeau](https://fonts.google.com/specimen/Ysabeau?preview.text=Pirouz%20Mehmandoost&categoryFilters=Technology:%2FTechnology%2FVariable;Feeling:%2FExpressive%2FStiff&specimen.preview.text=Pirouz+Mehmandoost)
- [Cormorant Infant](https://fonts.google.com/specimen/Cormorant+Infant?preview.text=Pirouz%20Mehmandoost&categoryFilters=Technology:%2FTechnology%2FVariable;Feeling:%2FExpressive%2FVintage&specimen.preview.text=Pirouz+Mehmandoost)
- [Cormorant](https://fonts.google.com/specimen/Cormorant?preview.text=Pirouz%20Mehmandoost&categoryFilters=Technology:%2FTechnology%2FVariable;Feeling:%2FExpressive%2FVintage&specimen.preview.text=Pirouz+Mehmandoost)
- [Medieval Sharp](https://fonts.google.com/specimen/MedievalSharp?preview.text=Pirouz%20Mehmandoost&categoryFilters=Appearance:%2FTheme%2FMedieval&specimen.preview.text=Pirouz+Mehmandoost)
- [Jacquard 12](https://fonts.google.com/specimen/Jacquard+12?preview.text=Pirouz%20Mehmandoost&categoryFilters=Appearance:%2FTheme%2FMedieval&specimen.preview.text=Pirouz+Mehmandoost)


## Next.js routing: 

- **A Parallel route** gives you an extra place to render UI (modal slot). [docs](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes)
- **An Intercepting route** decides when a URL should render into that extra place (modal on in-app navigation) vs render normally (canonical page on refresh/deep link). [docs](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes)


## Reading list: 

- [Post processing with WebGL](https://medium.com/@nicolasgiannantonio/post-processing-effect-18b9c3be1c80)
- [The Study of Shaders with React Three Fiber](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/)
- [Inigo Quilez- Raymarching distance fields](https://iquilezles.org/articles/raymarchingdf/)
- [Metallic Flakes Material in Three.js and Next.js](https://www.sil3ntrunning.net/blog/metallic-flakes-material-in-three-js-and-next-js)
- [The Book of Shaders](https://thebookofshaders.com/)


---