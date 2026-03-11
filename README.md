# PARA

I'm developing this app to explore my growing love 3D computer graphics and mathematics. I share my to-do list here as well as light, and feedback I get from folks who play around with the app.
PARA is a work in progress site. It displays 3D models and allows you to manipulate their animations, materials, and read about how I use them. 
The models are simplified versions of designes that I've made and 3D print for fun- I also love to 3D print, explore using experimental materials, and have been teaching myself how to use Blender for about a year. In the future this app will share how-to's for building the tools I make and use in CAD-like workflows.
For now, this app is mostly showcases of several implementations that I've had fun working on. These implementations can work as standalone React Three Fiber components and use cases for Zustand alongside Three.js and R3F.
I'll be working on this app more while reading the _Computer Graphics from Scratch_ by Gabriel Gambetta, since it's become a hobby to learn of the mathematics of 3D graphcs.

Interact with the live app [here](https://para-pi.vercel.app/). 

# Notable Implementations:

## 1. Materials and Textures

- The app allows users to focus a project and switch between a small set of intended material variants for that specific mesh. Because different projects support different finishes, I did not want project config to own full Three.js material objects.
- I also did not want 3D objects with materials to contain hard-coded logic for loading a fixed number of texture maps. Texture loading is handled outside the React Three Fiber mesh components (`BasicModel`) by `MaterialTextureInitializer`, which gathers the texture URLs referenced by the material registry, loads them separately, and writes them into the registered material instances with corrected texture color spaces via `src/lib/utils/materialUtils.js`.
- Instead, predefined material definitions live in the Zustand store `src/app/stores/materialStore.js`. That store acts as a registry for reusable material instances, texture assignments, and related material metadata. Projects in `src/lib/configs/globals.js` only reference material IDs, declare which ones are allowed for a given mesh, and choose a default.
- `selectionStore.js` is responsible for the active UI selection state, including which `materialID` is currently selected for the focused mesh. When a user changes materials in the UI, `selectionStore` updates that active `materialID`, and `BasicModel` resolves it against the predefined materials in `materialStore` before interpolating the rendered mesh material toward the selected finish.
- This structure gives material properties and texture assignments a single home, keeps project configuration separate from rendering logic, keeps texture-loading logic out of the scene's mesh components, and allows users to switch between intended finishes with smooth transitions instead of abrupt material swaps. Material definitions could also be shared across scenes if needed.

Interact with the live app [here](https://para-pi.vercel.app/). 

## 2. Dynamic Mesh Positioning

- After initial render, the position of a mesh is validated to ensure that no vertices intersect with a designated "ground" mesh, if it's defined. If there is intersection, it's translated up along the y-axis. There is no per-frame overhead since calculations only perform once. After rendering, the React Three Fiber component is forced to re-render if the mesh must be repositioned.

- This is implementation is WIP in `DynamicPositioningModel.js` and for now `BasicModel.js` is used instead.

  #### High level overview
  - Dimensions of a mesh's bounding box are derived. 
  - Points on a geometric circle are calculated, with the circle centered underneath the bounding box. As if the mesh is a packed in a box and set atop a circular pallet.
  - The points represent the lower limit for mesh positions on the y-axis.
  - A 3D vector is positioned at each point including the center.
  - A single ray is cast upward along the y axis from each vector position.
  - If a ray intersects with the ground mesh, then the vector is positioned below the ground. 
  - The intersecting ray that travels the longest distance is used to calculate a new mesh position.
  - The model is translated upward on the Y-axis to ensure that it will not intersect during animation.

  #### Raycasting strategy
  - Calculate the diagonal length of the underside of bounding box. This will be the circle radius:
  ```   
    x,z = bounding box size (3D Vector) x and z values  
    r = \sqrt{x^2 + z^2} \over 2  
  ```

  - Calculate a given number points on a circle using the angle method. The center is the x and z coordinates of the bounding box's center (Three.js space y-up):
  ```
    l = 10
    { a | 0 ≤ a < l, a ∈ ℤ}
    c = (c_x,c_z)
    θ = 2πa
    x = c_x + rcos(θ)
    z = c_z + rsin(θ)
  ```

  - Position a 3D Vector at each point including the center (11 Vectors).

  - Cast a ray upward from each vector. 
  
  - Ignore intersections with all meshes but the ground.

  - Ignore all rays that travel a distance > 2 * bounding box height.

  - If a ray intersects with the ground than the vector's position is below the ground.

  - If there are no intersections then a no mesh repositioning occurs. 

  - Derive the intersecting ray with longest travel distance.
    
  - Derive a fraction of bounding box height, to be used like padding.

  - Sum the two values, this is the new y-position for the mesh.

  - Set the new y-position for the mesh.

  - Animation Frame loop logic in `DynamicPositioningModel.js` interpolates positions between the old position and the new one.
  
  - ##### The visible effect is that the mesh floats up to its new position when the component re-renders.

- ##### This implementation was implemented in order to be a fun way to learn about raycasting, as well as handling some buck wild edge cases for using certain React Hooks. It wasn't meant to be useful, as there are a several 3D animation and physics libraries that implement more performant solutions.

- ##### This implementation is also a conservative approach to deriving a lower limit for mesh positions. If I refactor this logic, I'll likely update the logic that governs the y-position of all points/vectors.


## 3. Animated Camera Rigs

- ### Better description soon, this is a rough draft:

- Rigs in this project control a Three.js scene's camera (here it's a perspective camera), moving it along a circular path from one stopping position to another.
- The stopping positons are center-front of an object.
- A partifular Rig, `src/app/components/three/cameras/AnimatedRig.js` can move in either direction between stops along this path and hop from any stop to another.
- `AnimatedRig` has an automatic and manual behavior.
- The default behavior is automatic until the user interacts with the Rig. After a period of inactivity it defaults to automatic behavior. 
- Any React component can drive the rig since using Zustand selectors subcribing to `selectionStore`. 
- Pointer events also trigger Rig manual behavior namely for click events swipe gesture recognition. 
- Swipe gesture recognition logic is owned by this rig.
- Parents can govern manual behavior on swipe gestures by providing a callback that will fire on _pointerup_. 
- Parents can govern manual behavior on click events via event handlers by triggering updates to the mentioned Zustand store. 
- The Rig will return to automatic behavior after a predefined period of time which is set in a config object. See `/lib/configs/cameraConfigs.js`.
- The Rig moves the camera between stopping positons with offset that is also set in the config object. 
    - Here's how that works: 
      - The Rig stops the camera at position _p_ relative to an object _O_ by calculating a 3D Vector target _t_. 
      - If _O_ is a 3D Object then _t_ is the center the _O_'s bounding box.
      - If _O_ is a 3D Vector then _t_ is that Vector. 
      - In either cases is true then the camera's position is _p = {tx+sx, ty+sy, tz+sz}_ 
      - Otherwise t is _(0,0,0)_ and and the camera's position is _p = {sx, sy, sz}_
    - What this implies is elaborated at the end of section 3.

- Since the origin of an object could be anywhere within its computed bounds, positioning logic relies on bounding and if it's a mesh then it's scale can relative to the viewport dimensions.
- The rig positions the camera to look down the Z-axis at the center-front its target.

- There are several types of components with special relationships with Rigs, `AnimatedRig` in particular:
  - **Scenes**: Scene orchestrators, the parents of Rigs and Models. Any files in the directory `src/app/components/three/scenes/`
  - **Models**: Load meshes from files and adds them to scenes. Any files in the directory `src/app/components/three/models/`

- Following props are govern their relationships: 
  - **Rigs** 
    - Prop: _targets_: 
      - This is optional.
      - It is An array of Object3D refs. Scenes Own this and declare it as _meshRefs_. 
      - Each element is owned by a Model and declared internally as _meshRef_. It's defined when Models render and thus add geometry the Three.js scene.
      - These refs used to calculate the camera's target(s) as well as offset positions for the camera.
    - Prop: _fallbackPositions_:
      - This is optional. 
      - An array of 3D Vectors that it will swap with for any element of _targets_ that is not an Object3D.
      - This is useful when Rigs mount before Models, or for using Rigs in Scenes with no Models or Object3D's, or there's no need to use the _targets_ prop. 
    - Prop: _focusTarget_: 
      - This is optional. 
      - If defined it must be one of the Object3D elements provided to _targets_.
      - The Rig will orient the camera toward this Object if it is defined.
    - Prop: _onSwipe_: 
      - This optional prop exists for a specific type of Rig named `AnimatedRig`.
      - If defined it will fire on pointer events to calculate right and left swipe gestures, specifically on _pointerup_.
      - `AnimatedRig` handles the lifecycle of listeners. 
        - They are attached to the Canvas via `Drei`'s _useThree_ hook, which exposes gl.domElement.
        - It is safe to use in production as long as you understand when they're attached and removed from the context canvas to avoid conflicting listeners and overriding events.
        - See the effect defined in this component for more details.

    - _targets_ and _fallbackPositions_ do not have to be parallel arrays, however:
      - If _targets_[i] is not an Object3D and _fallbackPositions_[i] is a Vector3, the rig will operate on _fallbackPositions_[i] to orient the camera.
      - If Both elements are not of those types then the rig will orient itself relative to the origin. Internally the Rig will operate on a default Vector(0,0,0) declared as _defaultFallbackPositionRef_.

  - **Models** 
    -  Prop: _onMeshReady_: 
      - A callback function. This callback forwards a ref to the provider in the modern React fashion. _onMeshReady_ is conditionally fired from a Model's effect once _meshRef.current_ is defined.
      - Scenes provide a state setter as the callback.

  - **Scenes** 
    - Scenes set several internal state variables and refs: 
      - Prop: _meshrefs_: 
        - an array every ref forwarded from every Model. Scenes can also provide this to Rigs as the _targets_ prop.
      - Prop: _meshReadyFlags_ or _meshReadyFlag_: 
        - A boolean ref or an array refs of boolean refs. Used to track refs forwarded; for every Model in the scene, meshreadyFlags.current[i] is true if meshrefs[i].current is defined.
      - Prop: _meshesReady_ or _meshReady_:  
        - A state setter. Sets to true when all child Models forward their refs. Specifically, when the number of defined, forwarded refs matches the number quantity flags flipped to true within _meshReadyFlags_.
    - Scenes provide several props to Rigs: 
      - _meshRefs_ is provided to _targets_.
      - _meshPositions_ is provided to _fallbackPositions_.

    - One particular Rig named `BasicScene` uses a Rig named `AnimatedRig`: 
      - BasicScene provides _cameraTargets_ to _targets_.
        - _cameraTargets_ is a guarded wrapper that returns _meshRefs.current_ if _meshesReady_ is true, or an empty array.

- There is a current hack in use that I believe deems this component **not safe for use in production outside of this project**:
- The Rig makes the scene camera look at itself, which fixes the camera quaternion to eliminate pitch yaw and roll. That is the intent of the hack.
- Why I opted for this:
  - A Three.js camera's _lookAt()_ method and the `maath` library's _easing.dampLookat()_ mutate camera quaternions. 
  - I want complete control over these quaternions do mutate them as I see fit. 
  
- The visual result of this hack is: 
  - Quaternions don't mutate when the camera's changes positons, no pitch yaw or roll.
  - It faces directly down one designated axis (down the Z-axis to -z), position relative to an element of _targets_ or _fallbackPositions_. 

I've written alternative approaches to controlling the camera's quaternion in`/lub/utils/quaternionUtils.js`. 
My approaches to enable complete control over the quaternions are paused until I do more until I understand quaternions better.


## 4. On-demand rendering: Next.js Route-based Canvas frameloop invalidation

- Canvas frameloop toggles beween `demand`  and `interactive` depending on next.js routing, to invalidating the loop when the canvas is not visible to the user.

- This optimizes overall performance when a canvas is not the intended punctum for a view.
  
- This also allows me to display a single frame as if it's a static image.


---


## Graphics/Animation Libraries Used:

- [Three.js](https://threejs.org/) JavaScript API for implementing WebGL. For rendering 2D/3D computer graphics on browsers.

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) React renderer for Threejs.

- [React Post-Processing](https://react-postprocessing.docs.pmnd.rs/) Library of functionalities for post-processing graphics- ie special effects to rendered graphics.

- [Maath](https://github.com/pmndrs/maath) A collection of useful math helpers, random generators.

- [Framer Motion](https://motion.dev/)

- [GLTFJSX](https://github.com/pmndrs/gltfjsx) A CLI that turns GLTF assets into declarative and re-usable react-three-fiber JSX components. **I only use it for file compression and write all of my own React Three Fiber Components.**

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