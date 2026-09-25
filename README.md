# PARA

PARA is a case study that consumes custom utilities I develop for building performant, interactive `Three.js` and `React Three Fiber` applications.

It's a Next.js app that renders interactive 3D models of objects that I design and 3D print for fun.

Para renders a 3D product carousel component that drives scene exploration and interaction with 3D models, flying the camera around in a closed loop. I designed the carousel as a 3D analogy 2D product carousels commonly found on retail websites. As far as I've been aware no functionality like this is available out of the box from React Three Fiber or Drei.

You control the carousel with right and left swipe gestures and pause it in front of any Model by clicking on them.

Swiping gestures cycle the carousel to the next in the direction of your swipe. They move it one step forward or back, regardless of where you position the objects/targets in your scene. Swiping and clicking the manual controls available to the user.

After a swipe the carousel will dwell at the new position for configurable period of time, after which it resumes auto-cycling behavior.

Dwell timing for automatic and manual/swipe cycling behavior are both configurable. In Para, carousel dwells for 15 seconds after a swipe and 12 seconds during automatic cycling. This means that if no interactions occur 15 seconds after swiping, then it resumes cycling in 12 second intervals.

You can also configure your camera's orientation/offset position. Your camera can point and be positioned anywhere, but positioning is relative to the AABB center of any object that you designate as a targets.

 Positioning logic does not invoke lookAt(). lookAt() is called once during the components's commit phase to set the camera quaternion before it positions relative any carousel items. This affords you the freedom to call your camera's lookAt() method at your own discretion under a contract:

- That camera is subject to the behavior of Carousel while Carousel is mounted.
- The optional `lookAtDirection` prop sets lookAt(). Provice a stable reference.
- The optional `offsetPosition` prop is used to tween your camera toward the first carousel item.
- Unmount Carousel to free controls for that camera.
- On mount, Carousel will smoothly position your camera toward the first carousel item no matter where it's currently positioned.

`onClick` events on a carousel item put you into `focus mode`: Carousel moves toward the clicked item and dwells at an offset position relative to the item's center. You can configure an offset from the center as well.

Swiping or clicking anything other than a carousel item exists you from focus mode. You can also exit with the escape key on desktop.
Clicking a different item while in focus mode shifts focus to that mesh. The carousel will move toward item that you just clicked until you exit from focus mode or refresh your browser tab.

Each model represents a 3D printing project. Entering `Focus mode`renders text including a link to enter `focused project view`.
`Focused project view` renders a modal with buttons for manipulating a model's animations, materials, and viewing details on the project.
Click the **`≡`** button to view details including technical specs.

Exit `Focused project view` either by clicking the **`⌂`** home button at the bottom left. On desktop, `Escape` also exits `focused project view`.

Exiting `Focused project view` does not return you to `focus mode`- the carousel resumes automatic cycling behavior after a short post-focus dwell time (shorter than the dwell time for swipe-based navigation).

**Note:** I opted to register swipes as mouse drag gestures on desktop. This is a personal preference, and a gesture configuration feature is under development.

## [Interact with the live app here](https://para-pi.vercel.app/)

---

## Tech Stack

| Scope | Dependencies |
|-------|----------|
| Application Layer | Next.js App Router |
| Data Access Layer | Node.js, Drizzle ORM, Neon Postgres, Vercel Blob |
| 3D Graphics | Three.js, React Three Fiber, Drei |
| Application State | Zustand |
| UI | React, Tailwind CSS v4, MUI, Framer Motion |
| Languages | TypeScript, JavaScript, SQL |

(see [Libraries used](#libraries-used))

---

## Three.js Scene Architecture

The 3D scene is built from five component types, organized by directory under `src/app/components/three/`:

**Canvas** (`canvas/`) mounts the R3F `<Canvas>` once in the root layout. It persists across all client-side navigations. The frameloop toggles between `always` and `demand` based on the Next.js route — active on `/` and `/projects/*`, paused elsewhere — so there is no per-frame GPU work when the scene is not visible.

**Scenes** (`scenes/`) orchestrate everything else. `SceneComposer` mounts the models, the camera rig, lights, and post-processing. It owns the click and pointer-miss handlers that write to `selectionStore` when a user clicks a mesh or taps empty space. It provides a target filter function to the camera rig so the rig knows which meshes to track. SceneComposer does not contain animation logic or 3D object state.

**Meshes** (`meshes/`) load GLTF meshes via drei's `useGLTF`. `meshes/ProjectMesh.tsx` optionally animates rotation, position, and material properties, controlled by props (`animateRotation`, `animatePosition`, `animateMaterial`). When material animation is enabled and the user selects a different finish, Model eases scalar material properties per-frame toward the target values stored in the material store and swaps texture slot references. Model also computes viewport-relative scale per-frame so meshes maintain consistent visual size across aspect ratios. See [MaterialStore](#4---materialstore) below.

**instancedMeshes** (`instancedMeshes/`) load GLTF meshes via drei's `useGLTF`. `instancedMeshes/Terrain.tsx` is a grid of terrain mesh instances. Like all .glb files loaded in Para I designed it in Blender using node-based tools I've built. Upon export it is DRACO-compressed and run through meshopt.

**Rigs** (`cameras/rigs/`) Camera Rigs that control the scene camera. `Carousel` serves as an interactive 3D product carousel — it cycles a perspective camera between designated "target" objects on a dwell timer. It supports swipe gesture navigation, automatic and manual controls including pausing, and position computations. Consumers may provide camera orientation, offset position from targets, a default rest position, and target objects as an array or predicate function. It uses TargetRegistry to discover and track targets in the scene graph and `getAABBCenterFast()` for positon calculation. See [Carousel](#2---Carousel), [getAABBCenterFast](#3---getAABBCenterFast), and [TargetRegistry](#1---targetregistry).

**Textures** (`textures/`) contains `TextureInitializer`, which collects unique texture URLs from the material store, loads each texture once via drei's `useTexture`, and writes clones (with corrected color spaces) into the store's material instances before the first render. Multiple materials can reference the same image file; the texture is loaded once and cloned per-slot. This component is subject to change. The design is subject to change. It served as a quick way to expose Drei's `useKTX2` while designing `materialStore.js`.

---

## Custom Utilities and Components

### 1 - TargetRegistry

`TargetRegistry` (`src/lib/targetRegistry/TargetRegistry.ts`) is a framework-agnostic TypeScript class that lets consumers dynamically track, add, remove, and control the availability of Three.js `Object3D` targets without passing props through the React component tree. It depends only on Three.js — no React, R3F, or Zustand.

In a React Three Fiber app, objects enter and leave the scene graph as React mounts and unmounts components (Suspense boundaries resolving, conditional rendering, route changes). Passing target references as props to coordinate between components that need to know about each other — such as a camera rig that needs to know which meshes exist — couples those components and triggers re-renders in parts of the tree that should not re-render. TargetRegistry provides an event-driven alternative: it listens for Three.js `added`, `removed`, and `childadded` events on the scene graph, maintains a UUID-keyed map of tracked targets, and classifies them as **promoted** (in the scene graph, available) or **demoted** (registered but temporarily unavailable). Consumers can register targets by array or by filter predicate, and can promote or demote individual targets for application-specific reasons (visibility toggles, distance culling, LOD swaps) without touching the scene graph or React state.

See [`TargetRegistry.md`](src/lib/targetRegistry/TargetRegistry.md) for the full public API, source-verified Three.js and R3F internal mechanics, and design rationale.

### 2 - Carousel

`Carousel` (`src/app/components/three/cameras/Carousel.js`) is an interactive 3D product carousel. No existing React Three Fiber or drei component provides this behavior — a camera rig that automatically cycles through scene objects, responds to swipe gestures for manual navigation, and repositions the camera to a clicked object.

The component's props configure the carousel the same way a 2D carousel's props would configure its contents and layout:

- **`targets`** — which objects the rig should treat as carousel items. Accepts either an `Object3D[]` array or a filter predicate `(obj: Object3D) => boolean`. In a 2D carousel, this is analogous to the list of content items (images, cards). The rig passes `targets` to TargetRegistry, which discovers matching objects in the scene graph and tracks them as they mount and unmount.
- **`offsetPosition`** (`Vector3`) — the camera's offset from the current target. Controls how far and in what direction the camera sits relative to the object it is focused on.
- **`lookAtPosition`** (`Vector3`) — the initial direction the camera faces.
- **`defaultPosition`** (`Vector3`) — where the camera moves on mount or when no targets are available.
- **`onSwipe`** (callback, optional) — fired when a horizontal swipe gesture is detected, allowing the parent to respond (e.g. resetting selection state).

Carousel computes each target's world-space position every frame using `getAABBCenterFast` (see [getAABBCenterFast](#3---getaabbcenterfast) below) and writes the result back into the registry via `refreshPosition()`. This is what allows the camera to track targets whose world position changes between frames (e.g. a mesh whose parent is animating).

Carousel accesses TargetRegistry through `useTargetRegistry` (`src/app/stores/targetRegistryStore.ts`), which instantiates a global registry within a Zustand store. The ownership arrangement is:

- **SceneComposer:** Initializes registry, handles teardown. Passes a Three.js Scene reference and a predicate function to `initialize()`.
- **Carousel:** Consumer- reads the registry.
- **Model:** Adds Three.js Meshes to the scene graph, which are elligible entries in the registry.

The arrangement reflects their parent-child relationship and component lifecycles- though any module or component can initialize, consume, or reset the Zustand store.

Currently targetRegsitryStore has been tested in use cases with a single Three.js scene, single manager that handles teardown, and a variable quantity of consumers.

useTargetRegistryStore does not yet support initilizing multiple registries for a single scene and prevents attempts while an instance of `TargetRegistry` is already allocated. This decision was made initially to defend against haphazardly firing store setters in animation frame callbacks.

### 3 - getAABBCenterFast

`getAABBCenterFast` (`src/lib/utils/positionUtils.ts`) computes the world-space center of an `Object3D`'s axis-aligned bounding box. `Carousel` calls it every frame for the current target to determine where to position the camera. The function is designed to be called at 60-120 fps without CPU allocation overhead **- The design itself is NOT justification for flippantly calling it per-frame in production-** per-frame calls in this app are strictly for showcasing purposes.

Three.js provides `Box3.setFromObject(target)` for bounding box computation. `setFromObject` calls `expandByObject`, which copies the geometry's cached `boundingBox`, then calls `Box3.applyMatrix4(matrixWorld)`. `Box3.applyMatrix4` transforms all 8 corners of the bounding box through the world matrix (8 `Vector3.applyMatrix4` calls), rebuilds the box via `setFromPoints`, then the caller calls `getCenter()` to average `min` and `max`. For objects with children, `expandByObject` recurses into every child.

`getAABBCenterFast` replaces this with a fast path for target objects with no children in the scene graph ("targets that are leaf nodes"). It reads the geometry's cached `boundingBox`, computes its center in local space (`boundingBox.getCenter(out)` — one `addVectors` + `multiplyScalar`), then transforms that single point to world space (`out.applyMatrix4(target.matrixWorld)` — one matrix multiplication). This is 1 matrix multiplication on 1 point versus 8 matrix multiplications on 8 points, with no box reconstruction and no recursive traversal. In this app, all targets are Meshes which are not intermediate parents (they are leaf nodes).

For intermediate parent objects, the function has a recursive traversal path that handles `Mesh`, `InstancedMesh`, `Points`, `Line`, `Light`, and `Camera` node types. `InstancedMesh` bounds are cached in a `WeakMap` keyed by the mesh instance, invalidated when the instance count changes or when the caller explicitly calls `invalidateAABBCache()`. This avoids recomputing the union of all per-instance bounding boxes every frame.

The function writes into a caller-provided `out` `Vector3` and uses static scratch objects for all intermediate work. The `updateMatrices` option lets the caller skip `updateWorldMatrix` if matrices are already current (e.g. after R3F's render pass has already updated them).

### 4 - MaterialStore

The material store (`src/app/stores/materialStore.js`) is a Zustand store that centralizes ownership of Three.js Textures and Materials at the app state level. Any object that needs a material reads it from the store via the `useMaterial` hook. Any component that loads a texture uses that hook to load. Materials are defined once with their properties and texture URLs, keyed by ID, and locked after all textures have loaded and map slots are assigned.

Stored material's properties are treated as read-only and are read in order to mutate properties of local instances Any consumer that eases property values between two materials from this store will never cross a boundary that triggers shader program recompilation, because the store enforces ~~three~~ 2 constraints on every material it exposes:

1. **Scratch DataTextures on every map/texture slot.** Every material's `bumpMap`, `map`, `roughnessMap`, and `transmissionMap` is pre-filled with a 32x32 `DataTexture` before the `MeshPhysicalMaterial` constructor runs. Slots are never `null`, so the renderer's `HAS_*MAP` booleans are always `true`.

2. **Epsilon floors on zero-crossing properties.** `clearcoat` and `transmission` are floored at `1e-7` — too small to produce visible specular or transmission contribution, but strictly greater than zero. Because every material in the store uses `1e-7` as its floor, easing between any two materials never crosses zero, the setter never bumps `version`, and the cache key never changes.

**The app no longer uses any transmissive materials because they're not worth the overhead.**

~~3. **Uniform `transparent: true` on every material.** The cache key also encodes an `opaque` flag derived from `material.transparent`. Every store material sets `transparent: true`, so the flag is identical across all material variants and switching variants never alters the key.~~

~~The transmission floor has a fixed cost: because `transmission` is always greater than zero, the renderer places every model mesh in its transmissive render list and runs the transmission pre-pass on every frame, not only during material transitions. The design deliberately trades this constant per-frame GPU cost for the guarantee that no shader compilation ever occurs mid-session.~~

---

## The interaction logic flow

- From the homepage, a user taps or clicks a `ProjectMesh`. A click handler (attached to the canvas via `SceneComposer`) writes identifiers including Object3D `userData` to a Zustand store named `selectionStore.ts` → on the next frame, Carousel reads the store and moves the camera to that target.

- Clicking a mesh writes that target's default material ID to `selectionStore`, so focusing a model does not change its material — only position and rotation animation toggle with focus. Material easing runs when the user selects a different material variant in focused project view: Model reads the focused material ID from `selectionStore` and eases material property values toward the selected store material. UI buttons in focused project view allow animating mesh rotation and switching the material of the focused mesh.

- tapping empty space or clicking `Escape` on a keyboard resets `selectionStore`, susbequently Carousel resumes automatic cycling, dwelling for a moment until it moves the camera toward is next target. All the while the cleared selection eases its vector properties back t default defaults. material, position, and rotation.

---

### Libraries used

- [Three.js](https://threejs.org/) — WebGL rendering
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) — React renderer for Three.js, used primarily for its convenient hooks and `react-postprocessing`.
- [drei](https://github.com/pmndrs/drei) — R3F helpers and abstractions over three.js core, loaders, etc.
- [React Post-Processing](https://react-postprocessing.docs.pmnd.rs/) — Abstractions over three.js postpocessing.
- [Zustand](https://github.com/pmndrs/zustand) — state management framework that integrates seamlessly with R3F ecosystem and consumed internally.
- [math (formerly maath)](https://github.com/pmndrs/maath) — I use maath maath.easing in `ProjectMesh.tsx` and `Carousel.tsx` until I have time to sit with the math canary release.
- [Framer Motion](https://motion.dev/) — to animate a dwindling number of React components. Soon to be removed.
- [MUI](https://mui.com/)
- [GLTFJSX](https://github.com/pmndrs/gltfjsx) — CLI with abstractions over meshopt, etc. Used for DRACO compression
- [Tailwind CSS](https://tailwindcss.com/) - for effortless styling.
- [KTX-Software](https://github.com/donmccurdy/KTX2-Samples/blob/main/encode.sh) - Used for KTX2 Texture compression.

## Fonts Used

- [Halibut](https://www.collletttivo.it/typefaces/halibut)

---

## Personal Notes

### Fonts to remember

- [Diatype](https://abcdinamo.com/typefaces/diatype)
- [Hedvig Letters Serif](https://fonts.google.com/specimen/Hedvig+Letters+Serif?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*)
- [Amethysta](https://fonts.google.com/specimen/Amethysta?preview.text=Hey%20there!%20My%20name%20is%20Pirouz%20Mehmandoost%20H%20h%20M%20&categoryFilters=Serif:%2FSerif%2F*,%2FSlab%2F*)
- [Handjet](https://fonts.google.com/specimen/Handjet?preview.text=Pirouz%20Mehmandoost&categoryFilters=Feeling:%2FExpressive%2FFuturistic;Technology:%2FTechnology%2FVariable&specimen.preview.text=Pirouz+Mehmandoost&preview.script=Latn&preview.lang=en_Latn)
- [Ysabeau](https://fonts.google.com/specimen/Ysabeau?preview.text=Pirouz%20Mehmandoost&categoryFilters=Technology:%2FTechnology%2FVariable;Feeling:%2FExpressive%2FStiff&specimen.preview.text=Pirouz+Mehmandoost)
- [Cormorant Infant](https://fonts.google.com/specimen/Cormorant+Infant?preview.text=Pirouz%20Mehmandoost&categoryFilters=Technology:%2FTechnology%2FVariable;Feeling:%2FExpressive%2FVintage&specimen.preview.text=Pirouz+Mehmandoost)
- [Cormorant](https://fonts.google.com/specimen/Cormorant?preview.text=Pirouz%20Mehmandoost&categoryFilters=Technology:%2FTechnology%2FVariable;Feeling:%2FExpressive%2FVintage&specimen.preview.text=Pirouz+Mehmandoost)
- [Medieval Sharp](https://fonts.google.com/specimen/MedievalSharp?preview.text=Pirouz%20Mehmandoost&categoryFilters=Appearance:%2FTheme%2FMedieval&specimen.preview.text=Pirouz+Mehmandoost)
- [Jacquard 12](https://fonts.google.com/specimen/Jacquard+12?preview.text=Pirouz%20Mehmandoost&categoryFilters=Appearance:%2FTheme%2FMedieval&specimen.preview.text=Pirouz+Mehmandoost)

### Reading

- [Computer Graphics from Scratch](https://gabrielgambetta.com/computer-graphics-from-scratch/) - Gabriel Gambetta
- [The Book of Shaders](https://thebookofshaders.com/) - Patricio Gonzalez Vivo and Jen Lowe
- [The Study of Shaders with React Three Fiber](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/) - Maxime Heckel
- [Raymarching Distance Fields](https://iquilezles.org/articles/raymarchingdf/) - Inigo Quilez
- [Post Processing with WebGL](https://medium.com/@nicolasgiannantonio/post-processing-effect-18b9c3be1c80) - Nicolas Giannantonio

---

### ktx commands to remember
    ```
    ktx create --encode uastc --format R8G8B8_UNORM --assign-tf linear --zstd 18 --generate-mipmap para_ground_normal_map.png ground_normal_map_ktx2_2.ktx2

    ktx create --encode uastc --format R8G8B8A8_SRGB --assign-tf srgb --assign-primaries bt709 --generate-mipmap --zstd 9 stained_black_diffuse.png test_diffuse.ktx2

    ktx create --encode uastc --format R8_UNORM --assign-tf linear --assign-primaries none --generate-mipmap --zstd 9 stained_black_roughness.png test_roughness.ktx2

    ktx create --encode uastc --format R8_UNORM --assign-tf linear --assign-primaries none --generate-mipmap --zstd 9 lined-grip-foam1_height.png fdm_bump.ktx2

    ktx info ground_normal_map_ktx2_2.ktx2

    ```

---

<!-- 
/*

In MeshPhysicalMaterial, properties clearcoat, transmission, and dispersion have setter functions that increment
 material.version when the value crosses the zero boundary:

Example from the Three.js source (clearcoat setter):
    ```
    set clearcoat( value ) {
        if ( this._clearcoat > 0 !== value > 0 ) {
            this.version ++;
        }
        this._clearcoat = value;
    }
    ```

This is because clearcoat > 0 enables the USE_CLEARCOAT shader define, which changes the shader program. Same for USE_TRANSMISSION and USE_DISPERSION.
When the version increments, the renderer calls getProgram() and compiles a new GLSL program on the GPU - 
a synchronous, main-thread-blocking operation.

What happens in your code during a material switch
Consider switching from matte_black (clearcoat=0, transmission=0) to translucent_grey (clearcoat=0.8, transmission=1):

1 - In ProjectMesh, easeMaterialProperties calls easing.damp(animateMaterialRef.current, "clearcoat", 0.8, 0.3, delta). 
  On the first frame, clearcoat moves from 0 to ~0.04. The setter detects 0→positive → version++.
2 - Same frame: easing.damp(…, "transmission", 1, …) moves from 0 to ~0.05 → version++.
3 - Same frame: updateDeterministicMaterialProperties detects transparent changed → needsUpdate = true → version++.

4 - The renderer sees the version mismatch and compiles a new shader program with USE_CLEARCOAT, USE_TRANSMISSION, and different transparent handling. This compilation blocks the main thread for 100-300+ms on r183 due to the larger, restructured shader code.

with r180, the same recompilation happened but the shader was simpler and compiled faster. On r183, the added struct fields,
DFG LUT, and rewritten BRDF functions make the GLSL program larger, increasing GPU driver compilation time.

Why a small freeze between animation frames was not noticeable before upgrading from three.js v180:
    - The zero-boundary recompilation mechanism was identical in r180, the shader was just smaller and faster to compile, making the stall imperceptible or near-imperceptible.

How clearcoat is used in the fragment shader:

  The uniform is declared in meshphysical.glsl.js:
    material.clearcoat = saturate( material.clearcoat ); // Burley clearcoat model
    material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );

  The final blending line where material.clearcoat determines the visual contribution:
    ```
    outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
    ```

  The operations on 1e-7 here are:
    ```
    material.clearcoat * Fcc
    ```
   — where Fcc is a Schlick Fresnel term (vec3, components in range [0.04, 1.0]). Worst case: 1e-7 * 0.04 = 4e-9.
    1.0 - 4e-9 ≈ 0.999999996 — the base layer contribution is essentially 1.0.
    clearcoatSpecularDirect * 1e-7 — clearcoat specular scaled to near-zero.

Solutions Draft 1: (ordered from simplest to most robust):

1- Snap shader-affecting properties; ease only safe properties.
    - Split easeMaterialProperties into two categories:

    - Properties that trigger shader recompilation when crossing zero (clearcoat, transmission, dispersion): Set these to their target value immediately (no easing). This ensures all recompilations happen in a single frame rather than staggered across multiple frames.

    - Properties that never trigger recompilation (color, roughness, bumpScale, clearcoatRoughness, reflectivity, thickness): Continue easing these normally.

  This reduces the freeze to one frame instead of potentially 3, but does NOT eliminate the freeze entirely.

2- Pre-warm shader programs at initialization time
    - After the one-shot materialReadyRef initialization in useFrame, force-render the mesh once with each material variant that a Model might switch to. 
    This compiles and caches all shader programs during the loading phase (before the user interacts). When the user later switches materials, the cached program is reused - zero recompilation, zero freeze.
    - The standard technique is to render a tiny, invisible object with each material variant for one frame. This forces the GPU driver to compile and cache the program.

3- Override customProgramCacheKey to always include clearcoat/transmission
    - Call animateMaterialRef.current.customProgramCacheKey = () => 'physical-all-features' and set initial clearcoat/transmission to a tiny positive epsilon (e.g., 1e-10) instead of exactly 0.
    This forces the shader to always include the clearcoat and transmission code paths, even when the values are effectively zero. The trade-off is a slightly more expensive shader on every frame
    (the GPU evaluates the clearcoat/transmission branches even when their contribution is negligible), but eliminates all recompilation during material switches.

  The cost of clearcoat > 0 is not per-material-instance. It is per-shader-program-variant.
  Multiple MeshPhysicalMaterial instances share the same compiled shader program as long as their shader-affecting properties produce the same program cache key. 
  Whether Model and materialStore store 1 material or 50 with clearcoat > 0, the GPU compiles the clearcoat-enabled shader once and reuses it for all of them.

  The per-animation-frame cost of clearcoat > 0 is negligible. A few extra ALU  operations in the fragment shader: a second specular lobe, a Fresnel calculation, and a mix operation. 

2- Will the GPU flush 1e-7 to 0.0?
  No. There are three distinct concerns, and none apply:

  Uniform storage: WebGL uniforms are stored as IEEE 754 float32 values in GPU constant buffers.
  The smallest positive normal float32 is 2^-126 ≈ 1.175e-38. The value 1e-7 ≈ 2^-23.25 is 103 binary exponent units above the denormal threshold.
  It is stored with full precision. Uniform storage does not apply FTZ.

  On ALU FTZ: Some GPUs enable flush-to-zero for denormal (subnormal) intermediate results — values below ~1.18e-38.
  The intermediate results produced by 1e-7 in the clearcoat math are:

  1e-7 * 0.04 = 4e-9 ≈ 2^-28 — normal, 98 exponent units above denormal range
  1e-7 * vec3(specular) — worst case ~1e-8 ≈ 2^-26 — normal
  No intermediate result comes anywhere near the denormal range. FTZ does not affect this.

  Each step of the data path where 1e-7 is used:

    1- In JavaScript (where the zero-boundary check runs): 
      JavaScript uses IEEE 754 double-precision (64-bit) floats. The smallest representable positive normal double is ~2.2e-308. The value 1e-7 is 0.0000001, which is 301 orders of magnitude above the minimum. It is stored with full precision. The comparison 1e-7 > 0 evaluates to true unconditionally — there is no rounding, truncation, or flush-to-zero in this range.

    2- Three.js setter (as of v183):
      set clearcoat( value ) {
        if ( this._clearcoat > 0 !== value > 0 ) {
            this.version ++;
        }
        this._clearcoat = value;
      }

      Both operands of the comparison are JavaScript doubles. this._clearcoat > 0 and value > 0 produce boolean results.
      If both are true (both values are 1e-7 or larger), the !== evaluates to false, and version is NOT incremented. This is the entire purpose of the epsilon — keeping both the old and new values on the same side of zero.

    3- GLSL uniform on the GPU:
      The clearcoat value is passed to the GPU as a float uniform (32-bit single-precision IEEE 754).
      The smallest positive normal float32 is ~1.18e-38. The value 1e-7 is ~0x33D6BF95 in float32 representation — firmly in the normal range, not a subnormal.
      Even on GPUs with flush-to-zero (FTZ) mode enabled for subnormals, 1e-7 is unaffected because it is a normal number.

    4. Shader define (the part that controls shader compilation):
      The #ifdef USE_CLEARCOAT preprocessor directive in the GLSL shader is set on the JavaScript side based on the program parameters. 
      Three.js evaluates parameters.clearcoat as a boolean when building the program key — this check runs in JavaScript, not on the GPU. 
      So even in a hypothetical scenario where the GPU uniform was flushed to zero, the define would still be set because the JavaScript check already passed.

    5. easing.damp from pmndrs' maath:
      All arithmetic runs in JavaScript double precision. No numerical issue approaching or departing 1e-7.

Conclusion:

  Setting clearcoat initially to 1e-7 on every MeshPhysicalMaterial is safe, there is no precision concern.
  The smallest float32 normal is 1.175e-38, which is 31 orders of magnitude smaller than 1e-7.

  1e-5 or 1e-4 are equally valid, the visual contribution remains imperceptible at any of these values.
  clearcoat = 1e-4 adds at most 1e-4 *Fresnel* specularRadiance to the final pixel color,
  which is below the quantization step of an 8-bit framebuffer (1/255 ≈ 3.9e-3).

  animateMaterialRef in ProjectMesh is the single material instance associated with a mesh that does easing, so this ~epsilon principle~ only to~applies there.
  Properties of Instances in materialStore's never change and are only read from.

Implementation:
    import EPSILON_1e7 into ProjectMesh, materialStore.js

    1- In config objects like defaultMeshPhysicalMaterialConfig: 
      - Set the three zero-crossing properties (transmission, clearcoat, etc) to EPSILON_1e7 instead of 0 or 0.1.
      - This ensures animateMaterialRef is constructed with the "all features enabled" shader from the first render, so the program is compiled during initialization (during the Suspense loading phase), not during user interaction.

    2- In ProjectMesh (and wherever objects with animated materials enter scene graph), add a One-shot init (after .copy()) — after animateMaterialRef.current.copy(mat), clamp the three properties:
      ```
        animateMaterialRef.current.clearcoat = Math.max(animateMaterialRef.current.clearcoat, EPSILON_1e7);
        animateMaterialRef.current.transmission = Math.max(animateMaterialRef.current.transmission, EPSILON_1e7);
        animateMaterialRef.current.dispersion = Math.max(animateMaterialRef.current.dispersion, EPSILON_1e7);
      ```
      This prevents .copy() from setting these to 0 (which would be a zero-crossing from the initial non-zero value, triggering version++).

    3- easeMaterialProperties — clamp the easing target:

        const targetClearcoat = Math.max(materialToUpdate.clearcoat, EPSILON_1e7);
        easing.damp(animateMaterialRef.current, "clearcoat", targetClearcoat, 0.3, delta);
        const targetTransmission = Math.max(materialToUpdate.transmission, EPSILON_1e7;
        easing.damp(animateMaterialRef.current, "transmission", targetTransmission, 0.3, delta);
        const targetDispersion = Math.max(materialToUpdate.dispersion, EPSILON_1e7);
        easing.damp(animateMaterialRef.current, "dispersion", targetDispersion, 0.3, delta);

      This ensures that when easing toward a material with clearcoat: 0, the value settles at 1e-7 instead of exactly 0. 
      The visual contribution of clearcoat = 1e-7 is mathematically zero — it produces no perceptible specular reflection.

  What this achieves:
    - The "all features enabled" shader program is compiled once, during initialization, before any user interaction.
    - No zero-boundary crossings ever occur on animateMaterialRef, so version never increments from a property setter during easing.
    - No shader recompilation during material switches. The program cache key does not change because the shader defines (USE_CLEARCOAT, USE_TRANSMISSION, USE_DISPERSION) remain enabled throughout the material's lifetime.
    - The per-frame GPU cost is negligible — a few extra ALU operations per fragment for evaluating clearcoat/transmission/dispersion with effectively-zero contributions.
    - The "high-gloss/specular flash" is avoided.
*/

/*
console.log("\x1b[32m onPointerDown: \x1b[0m", pointerStartRef.current)
*/ -->

<!--
// const { animatePosition = true } = props;

  // const animatePositionRef = useRef(new THREE.Vector3(px, py, pz));
  // const positionModeRef = useRef(null);

  // export function updatePositionAnimation(positionMode, xOffset = 0, yOffset = 0, zOffset = 0, delta) {
  //   if (positionMode !== positionModeRef.current) positionModeRef.current = positionMode;

  //   if (positionMode === PositionAnimationModes.ENABLED) {
  //     animatePositionRef.current.set(
  //       defaultPositionRef.current.x + xOffset,
  //       defaultPositionRef.current.y + yOffset,
  //       defaultPositionRef.current.z + zOffset
  //     );
  //   }
  //   else if (positionMode === PositionAnimationModes.DISABLED) {
  //     animatePositionRef.current.set(
  //       defaultPositionRef.current.x,
  //       defaultPositionRef.current.y,
  //       defaultPositionRef.current.z
  //     );
  //   }

  //   if (meshRef.current.position.distanceTo(animatePositionRef.current) > EPSILON_3e3) {
  //     easing.damp3(meshRef.current.position, animatePositionRef.current, 1.15, delta);
  //   }
  // }; -->

<!-- This is a rough doc that holds prompts I've written in order to stop agents from generating AI slop. 


 lookAtPositionRef is used to define where the default scene camera will look. The camera will always face one specific direction even though its position does change, so Carousel.js behaves like a camera rig translates between positions while the camera always facs the exact same, single direction unless the value of lookAtPosition changes. That is why a one-shot is used: to snap the camera into the intended direction by looking at lookAtPositionRef.current once and never again unless lookAtPosition changes value. The ref is used to decouple animation state from React state, just like all of the other refs defined near the top of Carousel.   -->