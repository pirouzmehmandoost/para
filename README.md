# PARA

PARA is a case study that consumes custom utilities I develop for building performant, interactive `Three.js` and `React Three Fiber` applications.

It's a Next.js app that renders interactive 3D models of objects that I design and 3D print for fun.

Para renders a 3D product carousel component that drives scene exploration and interaction with 3D models, flying the camera around in a closed loop. I designed the carousel as a 3D analogy 2D product carousels commonly found on retail websites. As far as I've been aware no functionality like this is available out of the box from React Three Fiber or Drei.

You control the carousel with right and left swipe gestures and pause it in front of any Model by clicking them.

Swiping moves the carousel along to the next or previous model. The Carousel will dwell at the new position for a short, configurable period after which auto-cycling resumes until your next interaction.

Clicking or tapping model puts you into `focus mode`.
While in `focus mode`, clicking on a different model shifts focus to it- the carousel will move toward the clicked model. Focus mode stays on since only the focus target has changed.
Exit `focus mode` by clicking or tapping empty space- anything that isn't a model or a text link. On desktop you can also use the `Escape` key.

Each model represents a 3D printing project. Entering `Focus mode`renders text including a link to enter `focused project view`.
`Focused project view` renders a modal with buttons for manipulating a model's animations, materials, and viewing details on the project.
Click the **`≡`** button to view details including technical specs.

Exit `Focused project view` either by clicking the **`⌂`** home button at the bottom left. On desktop, `Escape` also exits `focused project view`.

Exiting `Focused project view` does not return you to `focus mode`- the carousel resumes automatic cycling behavior after a short post-focus dwell time (shorter than the dwell time for swipe-based navigation).

## [Interact with the live app here](https://para-pi.vercel.app/)

---

## Tech Stack

| Scope | Dependencies |
|-------|----------|
| Application Layer | Next.js (App Router, Turbopack) |
| 3D Graphics | Three.js, React Three Fiber, drei |
| Application State | Zustand |
| UI | MUI, Framer Motion, Tailwind CSS v4 |
| Languages | TypeScript, JavaScript |

(see [Libraries used](#libraries-used))

---

## Three.js Scene Architecture

The 3D scene is built from five component types, organized by directory under `src/app/components/three/`:

**Canvas** (`canvas/`) mounts the R3F `<Canvas>` once in the root layout. It persists across all client-side navigations. The frameloop toggles between `always` and `demand` based on the Next.js route — active on `/` and `/projects/*`, paused elsewhere — so there is no per-frame GPU work when the scene is not visible.

**Scenes** (`scenes/`) orchestrate everything else. `SceneComposer` mounts the models, the camera rig, lights, and post-processing. It owns the click and pointer-miss handlers that write to `selectionStore` when a user clicks a mesh or taps empty space. It provides a target filter function to the camera rig so the rig knows which meshes to track. SceneComposer does not contain animation logic or 3D object state.

**Models** (`models/`) load GLTF meshes via drei's `useGLTF`. Some model components are static — `Ground` applies a material from the store and renders a mesh with no per-frame logic. `Model` optionally animates rotation, position, and material properties, controlled by props (`animateRotation`, `animatePosition`, `animateMaterial`). When material animation is enabled and the user selects a different finish, Model eases scalar material properties per-frame toward the target values stored in the material store and swaps texture slot references. Model also computes viewport-relative scale per-frame so meshes maintain consistent visual size across aspect ratios. See [MaterialStore](#1---materialstore) below.

**Rigs** (`cameras/rigs/`) Camera Rigs that control the scene camera. `Carousel` serves as an interactive 3D product carousel — it cycles a perspective camera between designated "target" objects on a dwell timer. It supports swipe gesture navigation, automatic and manual controls including pausing, and position computations. Consumers may provide camera orientation, offset position from targets, a default rest position, and target objects as an array or predicate function. It uses TargetRegistry to discover and track targets in the scene graph and `getAABBCenterFast()` for positon calculation. See [Carousel](#3---Carousel), [getAABBCenterFast](#4---getAABBCenterFast), and [TargetRegistry](#2---targetregistry).

**Textures** (`textures/`) contains `MaterialTextureInitializer`, which collects unique texture URLs from the material store, loads each texture once via drei's `useTexture`, and writes clones (with corrected color spaces) into the store's material instances before the first render. Multiple materials can reference the same image file; the texture is loaded once and cloned per-slot. This component is subject to change. The design is subject to change. It served as a quick way to expose Drei's `useTexture` while my focus was on designing `MaterialStore`.

---

## Custom Utilities and Components

### 1 - MaterialStore

The material store (`src/app/stores/materialStore.js`) is a Zustand store that centralizes ownership of all Three.js materials, their property values, and their texture map assignments at the application state level. Any component that needs a material reads it from the store via the `useMaterial` hook rather than constructing materials inline or loading textures locally. Materials are defined once with their properties and texture URLs, keyed by ID. Project configurations in `src/lib/configs/globals.js` declare which material IDs are allowed per mesh and which is the default — they do not contain Three.js objects or texture loading logic.

Every material property value in the store is defined within a range that is safe for per-frame animation. In Three.js, `MeshPhysicalMaterial` has custom setters on `clearcoat` and `transmission` that increment `material.version` when the value crosses zero (e.g. `0 → 0.04`). A version bump forces the renderer to recompute the shader program cache key. If the key changes — because `HAS_CLEARCOAT` flipped, or a texture slot went from `null` to non-null — the renderer compiles a new GLSL program synchronously on the main thread. On Three.js r183+, this blocks for 100–300+ ms due to the restructured PBR shader. Any consumer that eases property values between two materials from this store will never cross a boundary that triggers recompilation, because the store enforces two constraints on every material it exposes:

1. **Scratch DataTextures on every texture slot.** Every material's `bumpMap`, `map`, `roughnessMap`, and `transmissionMap` is pre-filled with a 32x32 `DataTexture` before the `MeshPhysicalMaterial` constructor runs. Slots are never `null`, so the renderer's `HAS_*MAP` booleans are always `true`.

2. **Epsilon floors on zero-crossing properties.** `clearcoat` and `transmission` are floored at `1e-7` — too small to produce visible specular or transmission contribution, but strictly greater than zero. Because every material in the store uses `1e-7` as its floor, easing between any two materials never crosses zero, the setter never bumps `version`, and the cache key never changes.

See [`materialStore.md`](src/app/stores/materialStore.md) for source-verified documentation of the full material and texture lifecycle, GPU resource accounting, and disposal strategy.

### 2 - TargetRegistry

`TargetRegistry` (`src/lib/targetRegistry/TargetRegistry.ts`) is a framework-agnostic TypeScript class that lets consumers dynamically track, add, remove, and control the availability of Three.js `Object3D` targets without passing props through the React component tree. It depends only on Three.js — no React, R3F, or Zustand.

In a React Three Fiber app, objects enter and leave the scene graph as React mounts and unmounts components (Suspense boundaries resolving, conditional rendering, route changes). Passing target references as props to coordinate between components that need to know about each other — such as a camera rig that needs to know which meshes exist — couples those components and triggers re-renders in parts of the tree that should not re-render. TargetRegistry provides an event-driven alternative: it listens for Three.js `added`, `removed`, and `childadded` events on the scene graph, maintains a UUID-keyed map of tracked targets, and classifies them as **promoted** (in the scene graph, available) or **demoted** (registered but temporarily unavailable). Consumers can register targets by array or by filter predicate, and can promote or demote individual targets for application-specific reasons (visibility toggles, distance culling, LOD swaps) without touching the scene graph or React state.

See [`TargetRegistry.md`](src/lib/targetRegistry/TargetRegistry.md) for the full public API, source-verified Three.js and R3F internal mechanics, and design rationale.

### 3 - Carousel

`Carousel` (`src/app/components/three/cameras/Carousel.js`) is an interactive 3D product carousel. No existing React Three Fiber or drei component provides this behavior — a camera rig that automatically cycles through scene objects, responds to swipe gestures for manual navigation, and repositions the camera to a clicked object.

The component's props configure the carousel the same way a 2D carousel's props would configure its contents and layout:

- **`targets`** — which objects the rig should treat as carousel items. Accepts either an `Object3D[]` array or a filter predicate `(obj: Object3D) => boolean`. In a 2D carousel, this is analogous to the list of content items (images, cards). The rig passes `targets` to TargetRegistry, which discovers matching objects in the scene graph and tracks them as they mount and unmount.
- **`offsetPosition`** (`Vector3`) — the camera's offset from the current target. Controls how far and in what direction the camera sits relative to the object it is focused on.
- **`lookAtPosition`** (`Vector3`) — the initial direction the camera faces.
- **`defaultPosition`** (`Vector3`) — where the camera moves on mount or when no targets are available.
- **`onSwipe`** (callback, optional) — fired when a horizontal swipe gesture is detected, allowing the parent to respond (e.g. resetting selection state).

Carousel computes each target's world-space position every frame using `getAABBCenterFast` (see [getAABBCenterFast](#4---getaabbcenterfast) below) and writes the result back into the registry via `refreshPosition()`. This is what allows the camera to track targets whose world position changes between frames (e.g. a mesh whose parent is animating).

Carousel currently accesses TargetRegistry through the `useTargetRegistry` hook (`src/app/hooks/useTargetRegistry.ts`), which instantiates and owns the registry. This ownership arrangement is temporary — a planned refactor will move registry ownership to a shared Zustand store so multiple consumers can access the same registry without each creating their own instance.

### 4 - getAABBCenterFast

`getAABBCenterFast` (`src/lib/utils/positionUtils.ts`) computes the world-space center of an `Object3D`'s axis-aligned bounding box. `Carousel` calls it every frame for the current target to determine where to position the camera. The function is designed to be called at 60-120 fps without CPU allocation overhead **- this is an endoresement for calling it per-frame in production contexts-** per-frame calls in this app are strictly for showcasing purposes.

Three.js provides `Box3.setFromObject(target)` for bounding box computation. `setFromObject` calls `expandByObject`, which copies the geometry's cached `boundingBox`, then calls `Box3.applyMatrix4(matrixWorld)`. `Box3.applyMatrix4` transforms all 8 corners of the bounding box through the world matrix (8 `Vector3.applyMatrix4` calls), rebuilds the box via `setFromPoints`, then the caller calls `getCenter()` to average `min` and `max`. For objects with children, `expandByObject` recurses into every child.

`getAABBCenterFast` replaces this with a fast path for target objects with no children in the scene graph ("targets that are leaf nodes"). It reads the geometry's cached `boundingBox`, computes its center in local space (`boundingBox.getCenter(out)` — one `addVectors` + `multiplyScalar`), then transforms that single point to world space (`out.applyMatrix4(target.matrixWorld)` — one matrix multiplication). This is 1 matrix multiplication on 1 point versus 8 matrix multiplications on 8 points, with no box reconstruction and no recursive traversal. In this app, all targets are Meshes which are not intermediate parents (they are leaf nodes).

For intermediate parent objects, the function has a recursive traversal path that handles `Mesh`, `InstancedMesh`, `Points`, `Line`, `Light`, and `Camera` node types. `InstancedMesh` bounds are cached in a `WeakMap` keyed by the mesh instance, invalidated when the instance count changes or when the caller explicitly calls `invalidateAABBCache()`. This avoids recomputing the union of all per-instance bounding boxes every frame.

The function writes into a caller-provided `out` `Vector3` and uses static scratch objects for all intermediate work. The `updateMatrices` option lets the caller skip `updateWorldMatrix` if matrices are already current (e.g. after R3F's render pass has already updated them).

---

## The interaction logic flow

- A user clicks a mesh → SceneComposer's click handler writes the mesh name, UUID, and default material ID into `selectionStore` → on the next frame, Carousel reads the focused UUID and moves the camera to that target.

- Model then reads the focused material ID and eases material property values toward the selected material, as well as any delta rotation and position values that toggle with focus. Only position and rotation values animate on click to a mesh. When in focued project view, UI buttons render to allow allow animating mesh rotation and material properties of the focused mesh.

- tapping empty space or clicking `Escape` on a keyboard resets `selectionStore`, causing the Carousel/rig to resume automatic cycling and the model to ease back to its default material, position, and rotation.

---

### Libraries used

- [Zustand](https://github.com/pmndrs/zustand) — state management framework.
- [Three.js](https://threejs.org/) — WebGL rendering
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) — React renderer for Three.js, used primarily for its convenient hooks and `react-postprocessing`.
- [drei](https://github.com/pmndrs/drei) — R3F helpers and abstractions, used primarily for loaders.
- [React Post-Processing](https://react-postprocessing.docs.pmnd.rs/) — for Post-processing effects used in `SceneComposer.js`.
- [maath](https://github.com/pmndrs/maath) — for the easing functions used in `Model.js` and `Carousel.js`.
- [Framer Motion](https://motion.dev/) — for UI animations on several React components.
- [MUI](https://mui.com/) — for out of the box icons.
- [GLTFJSX](https://github.com/pmndrs/gltfjsx) — for GLTF compression.
- [Tailwind CSS](https://tailwindcss.com/) - for effortless styling.

## Fonts Used

- [Diatype](https://abcdinamo.com/typefaces/diatype)
- [Halibut](https://www.collletttivo.it/typefaces/halibut)

---

## Developer Notes

### Fonts to remember

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
