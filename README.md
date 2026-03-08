# PARA

I'm developing this app to explore web development with NextJS 15 and explore a growing love computer graphics and rendering them on browsers.
I share my to-do list here as well as light notes on tools and feedback.

PARA is a work in progress site that shows my 3D printing projects. For now it only shows the 3d models, and allows you to manipulate positons and materials.

Interact with the live app [here](https://para-pi.vercel.app/). 

## Notable Technical Implementations: 

### 1. Materials and Textures** 
  - The app allows users to focus a project and switch between a small set of intended material variants for that specific mesh. Because different projects support different finishes, I did not want project config to own full Three.js material objects.

  - I also did not want 3D objects with materials to contain hard-coded logic for loading a fixed number of texture maps. Texture loading is handled outside the React Three Fiber mesh components (`BasicModel`) by `MaterialTextureInitializer`, which gathers the texture URLs referenced by the material registry, loads them separately, and writes them into the registered material instances with corrected texture color spaces via `src/lib/utils/materialUtils.js`.

  - Instead, predefined material definitions live in the Zustand store `src/app/stores/materialStore.js`. That store acts as a registry for reusable material instances, texture assignments, and related material metadata. Projects in `src/lib/configs/globals.js` only reference material IDs, declare which ones are allowed for a given mesh, and choose a default.

  - `selectionStore.js` is responsible for the active UI selection state, including which `materialID` is currently selected for the focused mesh. When a user changes materials in the UI, `selectionStore` updates that active `materialID`, and `BasicModel` resolves it against the predefined materials in `materialStore` before interpolating the rendered mesh material toward the selected finish.

  - This structure gives material properties and texture assignments a single home, keeps project configuration separate from rendering logic, keeps texture-loading logic out of the scene's mesh components, and allows users to switch between intended finishes with smooth transitions instead of abrupt material swaps. Material definitions could also be shared across scenes if needed.

### 2. Dynamic Mesh Positioning
  - After initial render, the position of the meshes are validated to ensure that they do not intersect with a designated "ground" mesh, if it's defined. If there is intersection, it's translated up along the y-axis. There is no per-frame overhead since calculations only perform once. After rendering, the React Three Fiber component is forced to re-render if the mesh must be repositioned. This is implementation is WIP in `DynamicPositioningModel.js` and for now `BasicModel.js` is used instead.

  **Implementation:**
    - Dimensions of a mesh's bounding box are derived. 
    - 3D Vectors are positioned like points on circle under a mesh's bounding box. 
    - From each Vector 2 rays are cast along the y axis, one up and down.
    - If a ray cast upward intersects with the ground, then the vector is positioned below the ground. 
    - If a ray cast downward intersects with the ground, then the vector is positioned above the ground.
    - The model is translated upward on the Y-axis to ensure that it will not intersect during animation. 

  **Raycasting and sampling strategy**: 
    - Calculate the diagonal length of the underside of bounding box:
    $$ 
      x,z = bounding box size (3D Vector) x and z values

      r = \sqrt{x^2 + z^2} \over 2
    $$

   - Calculate 11 points on a circle using the angle method. The center is the x and z coordinates of the boundign box center (Vector3)
    $$
      c = (c_x,c_y)
      a = {0 ≤ a ≤ 9, k ∈ ℤ}
      θ = 2πa
      x = c_x + rcos(θ)
      z = c_y + rsin(θ)
    $$

    - A 3D Vector is positioned at each point, from which a ray will be cast.

    -  rays are cast upward along the y-axis from each vector, to detect intersection with the designated ground object, a total of 11 rays cast.

    - If a ray intersects with the ground than the vector is positioned below the ground.

    - All rays that travel a distance greater than 2x bounding box height are ignored. 

    - Intersections with any mesh other than the ground are ignored.

    - If there are no intersections then a no mesh repositioning occurs. 
    
    - The longest travel distance for an intersection + a provided fraction of bounding box height are used as the new the mesh position y-coordinate.

    - Frame loop logic in `DynamicPositioningModel.js` enforce interpolating position values per frame. The visible effect is that the mesh floats upward to its new position.  
 
    ** This implementation was implemented in order to be a fun way to learn about raycasting, as well as handling some buck wild edge cases for using certain React Hooks. It wasn't meant to be useful, as there are a several 3D animation and physics libraries that implement more performant solutions.** 

    ** This implementation is also a conservative approach to deriving a lower limit for mesh positions. If I refactor this logic, I'll likely update the logic that governs the y-position of all points/vectors.

3.  ** Next.js Route Based, On-Demand Rendering**
  - Canvas frameloop toggles beween `demand`  and `interactive` depending on next.js routing, so that in the future I can implement an `About` page and halt animations. 


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