# Material and Texture Lifecycle in This App

This document describes how materials and textures are allocated, mutated, rendered, and eventually freed in this app. It is written for:

- The author, as a record of what was established during review.
- Future reviewers who need to understand why the store looks the way it does without repeating the investigation.

Every non-trivial claim cites either a file:line in the local Three.js clone (`/Users/pirouz/Documents/github/three.js`), the local React Three Fiber clone (`/Users/pirouz/Documents/github/react-three-fiber`), or a symbol in this repo. `AGENTS.md` is not used as a source; only the three library repositories and the repo's own source are.

Terms used throughout:

- **Scratch DataTexture** — a 32×32 RGBA8 `THREE.DataTexture` installed on a `MeshPhysicalMaterial` slot (`bumpMap`, `map`, `roughnessMap`, `transmissionMap`) at module load so the slot is never `null` even before real image files finish loading.
- **Loaded Texture** — a `THREE.Texture` produced by `useTexture()` (drei) from an image file on disk.
- **Loaded clone** — the result of `loadedTexture.clone()`. `Texture.copy()` reference-copies `source.source`, so the clone shares the `Source` (and therefore the underlying image/pixel data) with the original but has its own UUID.
- **Store material** — one of the `THREE.MeshPhysicalMaterial` or `THREE.MeshStandardMaterial` instances held under `materials[<id>].material` in `useMaterial` (`materialStore.js`). A store material is never attached to a rendered mesh; it is a slot holder that gets `.copy()`-ed into an `animateMaterialRef`.
- **animateMaterialRef** — the per-`<Model>` `THREE.MeshPhysicalMaterial` instance referenced by `animateMaterialRef.current` in `Model.js`. This is the material actually attached to `<mesh>` JSX and therefore the only `MeshPhysicalMaterial` the renderer ever sees.

---

## 1. Three.js disposal is a signal, not an action

In Three.js, `.dispose()` on a `Texture`, `Material`, or `BufferGeometry` does not free GPU memory directly. It dispatches a `'dispose'` event. The `WebGLRenderer` is the listener, and it registers lazily — only when the resource is first used by the renderer.

### 1.1. `dispose()` dispatches an event

`THREE.Texture.dispose()`:

```647:657:/Users/pirouz/Documents/github/three.js/src/textures/Texture.js
	dispose() {

		/**
		 * Fires when the texture has been disposed of.
		 *
		 * @event Texture#dispose
		 * @type {Object}
		 */
		this.dispatchEvent( { type: 'dispose' } );

	}
```

`THREE.Material.dispose()` follows the same pattern (`Material.js:989` calls `this.dispatchEvent({ type: 'dispose' })`). `THREE.BufferGeometry.dispose()` does the same. None of these call WebGL APIs directly.

### 1.2. The renderer registers a listener only on first GPU use

The texture listener is installed inside `WebGLTextures.initTexture`, which is called the first time the renderer needs to bind that texture:

```711:721:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLTextures.js
	function initTexture( textureProperties, texture ) {

		let forceUpload = false;

		if ( textureProperties.__webglInit === undefined ) {

			textureProperties.__webglInit = true;

			texture.addEventListener( 'dispose', onTextureDispose );

		}
```

`onTextureDispose` is what actually reaches into WebGL:

```358:394:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLTextures.js
	function deallocateTexture( texture ) {

		const textureProperties = properties.get( texture );

		if ( textureProperties.__webglInit === undefined ) return;

		// check if it's necessary to remove the WebGLTexture object

		const source = texture.source;
		const webglTextures = _sources.get( source );

		if ( webglTextures ) {

			const webglTexture = webglTextures[ textureProperties.__cacheKey ];
			webglTexture.usedTimes --;

			// the WebGLTexture object is not used anymore, remove it

			if ( webglTexture.usedTimes === 0 ) {

				deleteTexture( texture );
```

The material side is the same shape. `WebGLRenderer` attaches `onMaterialDispose` the first time it resolves a program for that material:

```2167:2176:/Users/pirouz/Documents/github/three.js/src/renderers/WebGLRenderer.js
			if ( programs === undefined ) {

				// new material

				material.addEventListener( 'dispose', onMaterialDispose );

				programs = new Map();
				materialProperties.programs = programs;

			}
```

```1130:1148:/Users/pirouz/Documents/github/three.js/src/renderers/WebGLRenderer.js
		function onMaterialDispose( event ) {

			const material = event.target;

			material.removeEventListener( 'dispose', onMaterialDispose );

			deallocateMaterial( material );

		}

		// Buffer deallocation

		function deallocateMaterial( material ) {

			releaseMaterialProgramReferences( material );

			properties.remove( material );

		}
```

### 1.3. Consequences

Three consequences follow directly:

1. **If a texture or material has never been used by the renderer, calling `.dispose()` on it is a no-op for GPU memory.** No listener was ever registered, so the dispatched event has no subscriber.
2. **Calling `.dispose()` more than once is safe.** After the first dispatch, the listener removes itself; subsequent dispatches have no subscriber.
3. **GPU cleanup for a resource happens synchronously during the `dispose()` call** once a listener is attached. By the time `.dispose()` returns, `gl.deleteTexture` / `programCache.releaseProgram` has already been called for that resource.

---

## 2. React Three Fiber disposal call-sites

R3F calls `.dispose()` in two places, with different semantics.

### 2.1. Per-object disposal on unmount — `disposeOnIdle`

When an instance is removed from the scene (component unmount, subtree unmount), `removeChild` in the reconciler calls `disposeOnIdle` on that instance's Three.js object:

```298:313:/Users/pirouz/Documents/github/react-three-fiber/packages/fiber/src/core/reconciler.tsx
function disposeOnIdle(object: any) {
  if (typeof object.dispose === 'function') {
    const handleDispose = () => {
      try {
        object.dispose()
      } catch {
        // no-op
      }
    }

    // In a testing environment, cleanup immediately
    if (typeof IS_REACT_ACT_ENVIRONMENT !== 'undefined') handleDispose()
    // Otherwise, using a real GPU so schedule cleanup to prevent stalls
    else scheduleCallback(idlePriority, handleDispose)
  }
}
```

`disposeOnIdle` calls `object.dispose()` on the object itself. It does not walk the object's properties.

For `<mesh>` this matters: `THREE.Mesh` inherits from `THREE.Object3D`, and neither class defines `dispose`. So when a `<mesh>` unmounts, `typeof object.dispose === 'function'` is `false` and nothing happens. The mesh's `geometry` and `material` are not disposed by R3F on mesh unmount. That is deliberate in R3F: geometries and materials are frequently shared across meshes and across remounts, so disposing them automatically on every unmount would be a correctness hazard.

If disposal of a geometry or material on unmount is required, the geometry/material must be declared as its own JSX instance (e.g. `<bufferGeometry ...>` or `<meshPhysicalMaterial ...>` as a child of `<mesh>`), so the reconciler tracks it as its own instance. `disposeOnIdle` will then run on it, and because `BufferGeometry.dispose` and `Material.dispose` exist (dispatching a `'dispose'` event as in §1.1), the renderer's listener will fire if the resource was ever rendered.

### 2.2. Scene-wide disposal on canvas teardown

When the `<Canvas>` itself unmounts, R3F runs:

```453:479:/Users/pirouz/Documents/github/react-three-fiber/packages/fiber/src/core/renderer.tsx
export function unmountComponentAtNode<TCanvas extends HTMLCanvasElement | OffscreenCanvas>(
  canvas: TCanvas,
  callback?: (canvas: TCanvas) => void,
): void {
  const root = _roots.get(canvas)
  const fiber = root?.fiber
  if (fiber) {
    const state = root?.store.getState()
    if (state) state.internal.active = false
    reconciler.updateContainer(null, fiber, null, () => {
      if (state) {
        setTimeout(() => {
          try {
            state.events.disconnect?.()
            state.gl?.renderLists?.dispose?.()
            state.gl?.forceContextLoss?.()
            if (state.gl?.xr) state.xr.disconnect()
            dispose(state.scene)
            _roots.delete(canvas)
            if (callback) callback(canvas)
          } catch (e) {
            /* ... */
          }
        }, 500)
      }
    })
  }
}
```

`state.gl.forceContextLoss()` is the one that actually reclaims GPU memory. It uses `WEBGL_lose_context`:

```584:592:/Users/pirouz/Documents/github/three.js/src/renderers/WebGLRenderer.js
		/**
		 * Simulates a loss of the WebGL context. This requires support for the `WEBGL_lose_context` extension.
		 */
		this.forceContextLoss = function () {

			const extension = extensions.get( 'WEBGL_lose_context' );
			if ( extension ) extension.loseContext();

		};
```

Losing the context invalidates every GL resource tied to it at the driver level, regardless of whether JS `.dispose()` was ever called.

The subsequent `dispose(state.scene)` call uses a separate utility:

```209:216:/Users/pirouz/Documents/github/react-three-fiber/packages/fiber/src/core/utils.tsx
// Disposes an object and all its properties
export function dispose<T extends Disposable>(obj: T): void {
  if (obj.type !== 'Scene') obj.dispose?.()
  for (const p in obj) {
    const prop = obj[p] as Disposable | undefined
    if (prop?.type !== 'Scene') prop?.dispose?.()
  }
}
```

This utility walks the object's own enumerable properties and calls `.dispose()` on each property that has one. Because it is called with `state.scene`, it iterates properties on the scene itself (`background`, `environment`, `fog`, `overrideMaterial`, `children`, `matrix`, etc.). It does not recurse into `scene.children`; for the `children` array, `prop.dispose` is undefined and nothing happens. So `dispose(state.scene)` disposes whatever is directly attached to the Scene instance (a background texture, an environment map, an override material), and nothing else.

For this app, `<Canvas>` is mounted unconditionally inside `src/app/layout.js`:

```18:32:/Users/pirouz/Documents/github/para/src/app/layout.js
export default function RootLayout({ children, modal }) {
  return (
    <html lang='en'>
      <body className={`${myFont.className} bg-cover bg-[${envColor}]`}>
        <GlobalKeyboardShortcuts />
        <MainMenu />
        {modal}
        {children}
        <div className='fixed -z-10 inset-0 flex flex-col grow w-full h-full'>
          <RootCanvas />
        </div>
      </body>
    </html>
  )
};
```

The canvas is persistent across client-side navigations within the app. It only unmounts on full document teardown (tab close, hard navigation, HMR). When it does unmount via `unmountComponentAtNode`, `forceContextLoss` is the path that actually frees GPU memory.

---

## 3. What this app allocates

### 3.1. Shared `Uint8Array` pixel buffers (CPU only)

Four module-scope `Uint8Array` buffers in `materialStore.js`:

```13:40:/Users/pirouz/Documents/github/para/src/app/stores/materialStore.js
const width = 32;
const height = 32;
const size = width * height;
const bumpData = new Uint8Array(4 * size);
const diffuseData = new Uint8Array(4 * size);
const roughnessData = new Uint8Array(4 * size);
const transmissionData = new Uint8Array(4 * size);

bumpData.fill(0);

for (let i = 0; i < size; i++) {
  const stride = i * 4;

  diffuseData[stride] = 255;
  diffuseData[stride + 1] = 255;
  diffuseData[stride + 2] = 255;
  diffuseData[stride + 3] = 255;

  roughnessData[stride] = 255;
  roughnessData[stride + 1] = 255;
  roughnessData[stride + 2] = 255;
  roughnessData[stride + 3] = 255;

  transmissionData[stride] = 255;
  transmissionData[stride + 1] = 255;
  transmissionData[stride + 2] = 255;
  transmissionData[stride + 3] = 255;
}
```

Each buffer is 32 × 32 × 4 = 4096 bytes. Total: 4 × 4096 = 16,384 bytes ≈ 16 KB on the JS heap. The buffers are filled once at module load and never mutated. Safety of sharing is established in §6.

### 3.2. Scratch DataTextures (CPU, and partially GPU — see §5)

`_generateDataTextures()` returns a set of four `THREE.DataTexture` instances, one per slot, each wrapping the matching shared `Uint8Array`:

```47:69:/Users/pirouz/Documents/github/para/src/app/stores/materialStore.js
function _generateDataTextures() {
  const bumpDataTexture = new THREE.DataTexture(bumpData, width, height);
  bumpDataTexture.name = '_scratchBumpTexture';
  bumpDataTexture.colorSpace = THREE.NoColorSpace;
  bumpDataTexture.needsUpdate = true;

  const diffuseDataTexture = new THREE.DataTexture(diffuseData, width, height);
  diffuseDataTexture.name = '_scratchDiffuseTexture';
  diffuseDataTexture.colorSpace = THREE.SRGBColorSpace;
  diffuseDataTexture.needsUpdate = true;

  const roughnessDataTexture = new THREE.DataTexture(roughnessData, width, height);
  roughnessDataTexture.name = '_scratchRoughnessTexture';
  roughnessDataTexture.colorSpace = THREE.NoColorSpace;
  roughnessDataTexture.needsUpdate = true;

  const transmissionDataTexture = new THREE.DataTexture(transmissionData, width, height);
  transmissionDataTexture.name = '_scratchTransmissionTexture';
  transmissionDataTexture.colorSpace = THREE.NoColorSpace;
  transmissionDataTexture.needsUpdate = true;

  return { bumpDataTexture, diffuseDataTexture, roughnessDataTexture, transmissionDataTexture };
};
```

Each `new THREE.DataTexture(...)` call produces a distinct `DataTexture` JS object with its own `Source`. `DataTexture.image = { data, width, height }` hits the `image` setter inherited from `Texture` (`Texture.js:420`), which assigns to `this.source.data`, so the Source wraps the shared `Uint8Array`. Two DataTextures that wrap the same `Uint8Array` still have distinct `Source` instances — `Source` instances are not deduplicated by `data`.

Two classes of scratch sets exist:

- **`_defaultMeshPhysicalMaterialConfigMaps`** — a single set created once at module load (`materialStore.js:71`) and attached to the four slots of `defaultMeshPhysicalMaterialConfig`. `Model.js:44` consumes this config to initialize each `animateMaterialRef`.
- **Per-config sets** — one set per entry in `_meshPhysicalMaterialConfigs`, produced by the backfill loop (`materialStore.js:149-172`):

  ```149:172:/Users/pirouz/Documents/github/para/src/app/stores/materialStore.js
  for (const materialConfig in _meshPhysicalMaterialConfigs) {

    // set clearcoat, clearcoatRoughness, and transmission if undefined or 0. 
    if (!_meshPhysicalMaterialConfigs[materialConfig]?.clearcoat) {
      _meshPhysicalMaterialConfigs[materialConfig].clearcoat = defaultMeshPhysicalMaterialConfig.clearcoat;
    }

    if (!_meshPhysicalMaterialConfigs[materialConfig]?.transmission) {
      _meshPhysicalMaterialConfigs[materialConfig].transmission = defaultMeshPhysicalMaterialConfig.transmission;
    }

    // set clearcoatRoughness to 1 if undefined or 0. 
    // If eased, transitioning from 0 will produce undesirable, highly concentrated specular highlights.
    // Materials that should have no perceivable clearcoat will have clearcoat=1e-7 and clearcoatRoughness=1.
    if (!_meshPhysicalMaterialConfigs[materialConfig]?.clearcoatRoughness) {
      _meshPhysicalMaterialConfigs[materialConfig].clearcoatRoughness = defaultMeshPhysicalMaterialConfig.clearcoatRoughness;
    }

    const dataTextures = _generateDataTextures();
    _meshPhysicalMaterialConfigs[materialConfig].bumpMap = dataTextures.bumpDataTexture;
    _meshPhysicalMaterialConfigs[materialConfig].map = dataTextures.diffuseDataTexture;
    _meshPhysicalMaterialConfigs[materialConfig].roughnessMap = dataTextures.roughnessDataTexture;
    _meshPhysicalMaterialConfigs[materialConfig].transmissionMap = dataTextures.transmissionDataTexture;
  }
  ```

  The per-config scratches land on the store `MeshPhysicalMaterial` instances via the constructor spread (e.g. `new THREE.MeshPhysicalMaterial({ ..._meshPhysicalMaterialConfigs.glossBlackMaterial })` at `materialStore.js:178`).

Counts: there are 4 entries in `_meshPhysicalMaterialConfigs`, so 4 per-config sets × 4 DataTextures = 16, plus 4 defaults = **20 scratch DataTexture JS objects total**. All 20 are kept alive for the session by module-scope references.

### 3.3. Loaded Textures and loaded clones

`MaterialTextureInitializer` collects unique URLs from every store material's `textures` field, calls `useTexture()` to load them, and invokes `setMaterialTextures()` in a layout effect:

```10:31:/Users/pirouz/Documents/github/para/src/app/components/three/textures/MaterialTextureInitializer.js
  const texturesToLoad = useMemo(() => {
    const materials = useMaterial.getState().materials;

    const texturesToLoad = {};
    for (const materialID in materials) {
      const materialTextureProps = materials[materialID]?.textures;

      if (materialTextureProps) {
        for (const materialProperty in materialTextureProps) {
          texturesToLoad[materialTextureProps[materialProperty]] = materialTextureProps[materialProperty];
        }
      }
    }
    return texturesToLoad;
  }, []);

  const textures = useTexture(texturesToLoad);

  useLayoutEffect(() => {
    for (const url of Object.keys(texturesToLoad)) { if (!textures[url]) return }
    setMaterialTextures(textures);
  }, [textures, setMaterialTextures, texturesToLoad]);
```

Because `texturesToLoad` is keyed by URL, each URL produces one `THREE.Texture` in drei's cache, regardless of how many materials reference it. `setMaterialTextures()` then installs a per-material `texture.clone()` on each declared slot:

```286:290:/Users/pirouz/Documents/github/para/src/app/stores/materialStore.js
    for (const { target, property, texture } of staged) {
      target[property] = texture.clone();
      target[property].flipY = false;
      target[property].colorSpace = getColorSpace(property);
    }
```

`Texture.clone()` is `new this.constructor().copy(this)`, and `Texture.copy()` reference-copies the `Source`:

```462:479:/Users/pirouz/Documents/github/three.js/src/textures/Texture.js
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Copies the values of the given texture to this instance.
	 *
	 * @param {Texture} source - The texture to copy.
	 * @return {Texture} A reference to this instance.
	 */
	copy( source ) {

		this.name = source.name;

		this.source = source.source;
		this.mipmaps = source.mipmaps.slice( 0 );
```

So a clone has its own UUID but shares the `Source` (and therefore the underlying image/pixel data) with the original.

GPU-side, two clones that share a `Source` and produce the same cache key under `getTextureCacheKey(texture)` share a single `WebGLTexture` with refcounting via `usedTimes`:

```528:549:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLTextures.js
	function getTextureCacheKey( texture ) {

		const array = [];

		array.push( texture.wrapS );
		array.push( texture.wrapT );
		array.push( texture.wrapR || 0 );
		array.push( texture.magFilter );
		array.push( texture.minFilter );
		array.push( texture.anisotropy );
		array.push( texture.internalFormat );
		array.push( texture.format );
		array.push( texture.type );
		array.push( texture.generateMipmaps );
		array.push( texture.premultiplyAlpha );
		array.push( texture.flipY );
		array.push( texture.unpackAlignment );
		array.push( texture.colorSpace );

		return array.join();

	}
```

```737:785:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLTextures.js
		const textureCacheKey = getTextureCacheKey( texture );

		if ( textureCacheKey !== textureProperties.__cacheKey ) {

			// if not, create a new instance of WebGLTexture

			if ( webglTextures[ textureCacheKey ] === undefined ) {

				// create new entry

				webglTextures[ textureCacheKey ] = {
					texture: _gl.createTexture(),
					usedTimes: 0
				};

				info.memory.textures ++;

				// when a new instance of WebGLTexture was created, a texture upload is required
				// even if the image contents are identical
```

In this app, `setMaterialTextures()` sets `flipY = false` and a slot-specific `colorSpace` on every clone immediately after cloning. Inputs to `getTextureCacheKey` are therefore identical across clones of the same `Source` used at the same slot role, which means such clones share a single `WebGLTexture` handle.

Clone inventory, from the `textures` entries in `materialState` (`materialStore.js:174-215`):

- `gloss_black.bumpMap` — clone of `/gloss_material_roughness.jpg`
- `matte_black.bumpMap` — clone of `/gloss_material_roughness.jpg` (same file as above → same `Source` → shared GL texture with `gloss_black.bumpMap`)
- `stained_matte_black.bumpMap` — clone of `/textured_bag_bump.jpg`
- `stained_matte_black.map` — clone of `/textured_bag_color.jpg`
- `stained_matte_black.roughnessMap` — clone of `/textured_bag_roughness.jpg`

**Loaded clones: 5.** Unique URLs / drei-cached originals: 4. Unique `Source` instances reaching GPU from this path: 4.

Three store materials have no `textures` field — `translucent_grey`, `ground` (MeshStandardMaterial, used by the `<Ground>` component), and the entries without one — so `setMaterialTextures()` does not touch them.

### 3.4. Material instances

- 5 store materials in `materialState`: 4 × `MeshPhysicalMaterial` (`gloss_black`, `matte_black`, `stained_matte_black`, `translucent_grey`) + 1 × `MeshStandardMaterial` (`ground`).
- 1 × `MeshPhysicalMaterial` per `<Model>` instance (`animateMaterialRef.current`). `BasicScene` renders one `<Model>` per entry in `portfolio.projects`. There are 3 projects in `src/lib/configs/globals.js` (Gerd, Sang, Pí), so 3 × `MeshPhysicalMaterial`.

**Total material instances: 9.** All are held by module-scope or per-`<Model>` references for the session.

Only the 3 `animateMaterialRef` materials and the 1 `ground` material are ever attached to rendered meshes. The 4 store `MeshPhysicalMaterial`s in `materialState` are never rendered directly; they are slot holders that `animateMaterialRef.current.copy(...)` pulls from.

---

## 4. Shader program cache-key stability is the driving design goal

Every design choice in §3 (scratch DataTextures filling every slot, `EPSILON_1e7` floors for `clearcoat` and `transmission`) exists to keep the WebGL shader program cache key for every rendered `MeshPhysicalMaterial` identical across material variants and across slot swaps. A stable cache key means `WebGLPrograms.getProgram` always returns the same cached program and never triggers synchronous GLSL compilation during interaction.

### 4.1. What goes into the program cache key

`WebGLPrograms.getProgramCacheKey()` assembles the key out of defines, per-parameter values, and two bitmask layers:

```416:426:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLPrograms.js
		if ( parameters.isRawShaderMaterial === false ) {

			getProgramCacheKeyParameters( array, parameters );
			getProgramCacheKeyBooleans( array, parameters );
			array.push( renderer.outputColorSpace );

		}

		array.push( parameters.customProgramCacheKey );

		return array.join();

	}
```

The parameters pushed are computed from the material earlier in `getParameters()`. The ones this app's materials can flip are:

```124:161:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLPrograms.js
		const HAS_MAP = !! material.map;
		const HAS_MATCAP = !! material.matcap;
		const HAS_ENVMAP = !! envMap;
		const HAS_AOMAP = !! material.aoMap;
		const HAS_LIGHTMAP = !! material.lightMap;
		const HAS_BUMPMAP = !! material.bumpMap;
		const HAS_NORMALMAP = !! material.normalMap;
		const HAS_DISPLACEMENTMAP = !! material.displacementMap;
		const HAS_EMISSIVEMAP = !! material.emissiveMap;

		const HAS_METALNESSMAP = !! material.metalnessMap;
		const HAS_ROUGHNESSMAP = !! material.roughnessMap;

		const HAS_ANISOTROPY = material.anisotropy > 0;
		const HAS_CLEARCOAT = material.clearcoat > 0;
		const HAS_DISPERSION = material.dispersion > 0;
		const HAS_IRIDESCENCE = material.iridescence > 0;
		const HAS_SHEEN = material.sheen > 0;
		const HAS_TRANSMISSION = material.transmission > 0;

		const HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !! material.anisotropyMap;

		const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !! material.clearcoatMap;
		const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !! material.clearcoatNormalMap;
		const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !! material.clearcoatRoughnessMap;

		const HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !! material.iridescenceMap;
		const HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !! material.iridescenceThicknessMap;

		const HAS_SHEEN_COLORMAP = HAS_SHEEN && !! material.sheenColorMap;
		const HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !! material.sheenRoughnessMap;

		const HAS_SPECULARMAP = !! material.specularMap;
		const HAS_SPECULAR_COLORMAP = !! material.specularColorMap;
		const HAS_SPECULAR_INTENSITYMAP = !! material.specularIntensityMap;

		const HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !! material.transmissionMap;
		const HAS_THICKNESSMAP = HAS_TRANSMISSION && !! material.thicknessMap;
```

Those booleans feed two categories of key contributors:

1. Per-slot UV-channel integers pushed in `getProgramCacheKeyParameters`:

   ```436:458:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLPrograms.js
   		array.push( parameters.mapUv );
   		array.push( parameters.alphaMapUv );
   		array.push( parameters.lightMapUv );
   		array.push( parameters.aoMapUv );
   		array.push( parameters.bumpMapUv );
   		array.push( parameters.normalMapUv );
   		array.push( parameters.displacementMapUv );
   		array.push( parameters.emissiveMapUv );
   		array.push( parameters.metalnessMapUv );
   		array.push( parameters.roughnessMapUv );
   		array.push( parameters.anisotropyMapUv );
   		array.push( parameters.clearcoatMapUv );
   		array.push( parameters.clearcoatNormalMapUv );
   		array.push( parameters.clearcoatRoughnessMapUv );
   		array.push( parameters.iridescenceMapUv );
   		array.push( parameters.iridescenceThicknessMapUv );
   		array.push( parameters.sheenColorMapUv );
   		array.push( parameters.sheenRoughnessMapUv );
   		array.push( parameters.specularMapUv );
   		array.push( parameters.specularColorMapUv );
   		array.push( parameters.specularIntensityMapUv );
   		array.push( parameters.transmissionMapUv );
   		array.push( parameters.thicknessMapUv );
   ```

   Each `*MapUv` is derived from the corresponding `HAS_*MAP` boolean:

   ```269:297:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLPrograms.js
   			mapUv: HAS_MAP && getChannel( material.map.channel ),
   			...
   			bumpMapUv: HAS_BUMPMAP && getChannel( material.bumpMap.channel ),
   			normalMapUv: HAS_NORMALMAP && getChannel( material.normalMap.channel ),
   			...
   			roughnessMapUv: HAS_ROUGHNESSMAP && getChannel( material.roughnessMap.channel ),
   			...
   			transmissionMapUv: HAS_TRANSMISSIONMAP && getChannel( material.transmissionMap.channel ),
   ```

   If a slot flips from non-null to null (or vice versa), its `*MapUv` entry flips between `false` and an integer — the cache key changes, and `getProgram` compiles a new program for the new key.

2. Bitmask flags pushed in `getProgramCacheKeyBooleans`:

   ```483:534:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLPrograms.js
   	function getProgramCacheKeyBooleans( array, parameters ) {

   		_programLayers.disableAll();

   		if ( parameters.instancing )
   			_programLayers.enable( 0 );
   		...
   		if ( parameters.clearcoat )
   			_programLayers.enable( 7 );
   ```

   ```537:568:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLPrograms.js
   		if ( parameters.fog )
   			_programLayers.enable( 0 );
   		...
   		if ( parameters.transmission )
   			_programLayers.enable( 15 );
   ```

   `parameters.clearcoat = HAS_CLEARCOAT = material.clearcoat > 0`; `parameters.transmission = HAS_TRANSMISSION = material.transmission > 0`. Crossing zero toggles these bits and changes the cache key.

### 4.2. How the material-version setters align with the cache key

`MeshPhysicalMaterial` defines setters for `clearcoat` and `transmission` that bump `material.version` only when the value crosses the `>0` boundary:

```358:374:/Users/pirouz/Documents/github/three.js/src/materials/MeshPhysicalMaterial.js
	get clearcoat() {

		return this._clearcoat;

	}

	set clearcoat( value ) {

		if ( this._clearcoat > 0 !== value > 0 ) {

			this.version ++;

		}

		this._clearcoat = value;

	}
```

```462:478:/Users/pirouz/Documents/github/three.js/src/materials/MeshPhysicalMaterial.js
	get transmission() {

		return this._transmission;

	}

	set transmission( value ) {

		if ( this._transmission > 0 !== value > 0 ) {

			this.version ++;

		}

		this._transmission = value;

	}
```

A version bump forces `WebGLRenderer.setProgram` to re-resolve the program (see the dispatcher in `WebGLRenderer.js` around material program lookup). If the cache key has changed, a new compilation occurs. If the cache key is stable, the same cached program is returned and no compile happens.

The base `Material` class does not have setters for `map`, `bumpMap`, `roughnessMap`, or `transmissionMap`; those are plain properties (`MeshStandardMaterial.js:179, 258, 377, 389, 400`, among others). Assigning to a slot does not bump `version` by itself. However, `Model.js:178/183/191/197/203/209/253` sets `animateMaterialRef.current.needsUpdate = true` after slot swaps and after the one-shot `.copy()`:

```1000:1018:/Users/pirouz/Documents/github/three.js/src/materials/Material.js
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}
```

That forces program re-resolution. So slot swaps in this app do trigger a cache-key lookup on the next render — the design point is to arrange the key so that lookup always hits an existing entry.

### 4.3. What this app does to keep the key stable

Two arrangements in `materialStore.js` together keep every relevant `HAS_*` boolean true on every `MeshPhysicalMaterial` the renderer ever sees:

1. **Scratch DataTextures on every map slot of every config.** The backfill loop sets `bumpMap`, `map`, `roughnessMap`, and `transmissionMap` on every entry in `_meshPhysicalMaterialConfigs` before constructing the store `MeshPhysicalMaterial`s, and `defaultMeshPhysicalMaterialConfig` does the same for the `animateMaterialRef` constructor spread. So `HAS_MAP`, `HAS_BUMPMAP`, `HAS_ROUGHNESSMAP`, and (with §4.3.2) `HAS_TRANSMISSIONMAP` are true on every material.

2. **`EPSILON_1e7` floors for `clearcoat` and `transmission`.** `defaultMeshPhysicalMaterialConfig` sets both to `EPSILON_1e7`, and the backfill loop assigns that default to any config that left them falsy:

   ```73:86:/Users/pirouz/Documents/github/para/src/app/stores/materialStore.js
   export const defaultMeshPhysicalMaterialConfig = {
     color: '#2f2f2f',
     clearcoat: EPSILON_1e7,
     clearcoatRoughness: 1,
     flatShading: false,
     side: THREE.DoubleSide,
     thickness: 0,
     transmission: EPSILON_1e7,
     transparent: false,
     bumpMap: _defaultMeshPhysicalMaterialConfigMaps.bumpDataTexture,
     map: _defaultMeshPhysicalMaterialConfigMaps.diffuseDataTexture,
     roughnessMap: _defaultMeshPhysicalMaterialConfigMaps.roughnessDataTexture,
     transmissionMap: _defaultMeshPhysicalMaterialConfigMaps.transmissionDataTexture,
   };
   ```

   `EPSILON_1e7` is strictly greater than zero, so `HAS_CLEARCOAT` and `HAS_TRANSMISSION` are true. Because `HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !!material.transmissionMap`, both halves must be true at once for the `transmissionMapUv` entry in the cache key to be a channel integer rather than `false`. The scratch `transmissionMap` supplies the second half; the `EPSILON_1e7` transmission floor supplies the first.

`easeMaterialProperties` in `Model.js` never drives `clearcoat` or `transmission` to `0`:

```156:158:/Users/pirouz/Documents/github/para/src/app/components/three/models/Model.js
    if (Math.abs(animateMaterialRef.current.clearcoat - materialToUpdate.clearcoat) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "clearcoat", materialToUpdate.clearcoat, 0.3, delta);

    if (Math.abs(animateMaterialRef.current.transmission - materialToUpdate.transmission) > EPSILON_10e4) easing.damp(animateMaterialRef.current, "transmission", materialToUpdate.transmission, 0.3, delta);
```

Because the target values come from store materials (all floored at `EPSILON_1e7`) and the animator starts at `EPSILON_1e7`, the value cannot cross zero during easing. The `>0` setter guards therefore never bump `material.version` on this path, and `HAS_CLEARCOAT` / `HAS_TRANSMISSION` stay stably true.

Result: the shader program cache key computed for any `animateMaterialRef.current` in this app is stable across material variants and slot swaps, and `getProgram` returns the same cached program after the first compile.

### 4.4. `clearcoatRoughness` is a separate concern

Unlike `clearcoat` and `transmission`, `clearcoatRoughness` is a plain property on `MeshPhysicalMaterial` — no custom setter, no version bump. It does not participate in the cache key. The floor at `1` exists for a visual reason, not a shader one: the GLSL clearcoat shader clamps `clearcoatRoughness` near zero to `0.0525`, which is a near-mirror clearcoat. Easing from `0` to a small value produces a very concentrated specular highlight during the transition. Starting at `1` (fully rough) avoids that spike.

---

## 5. Which scratch DataTextures actually reach the GPU

The scratch-texture design in §4.3.1 has a consequence: for every slot on a store material that is not replaced by a loaded clone, the store material still holds the scratch DataTexture from `_meshPhysicalMaterialConfigs[*]`. When `animateMaterialRef.current.copy(storeMaterial)` runs, those scratch references propagate to `animateMaterialRef.current`, and `animateMaterialRef.current` is what the renderer encounters. So those scratches reach the GPU. This is intentional — it is the mechanism by which the `HAS_*MAP` booleans of §4.1 stay true.

### 5.1. `_defaultMeshPhysicalMaterialConfigMaps` scratches: ephemeral, never reach the GPU

These 4 DataTextures are installed on `animateMaterialRef.current` by the constructor spread in `Model.js`:

```44:44:/Users/pirouz/Documents/github/para/src/app/components/three/models/Model.js
  const animateMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));
```

On the first RAF after Suspense resolves, `Model`'s `useFrame` callback runs before `state.gl.render(...)` per the loop in `loop.ts`:

```60:84:/Users/pirouz/Documents/github/react-three-fiber/packages/fiber/src/core/loop.ts
function update(timestamp: number, state: RootState, frame?: XRFrame) {
  // Run local effects
  let delta = state.clock.getDelta()
  ...
  // Call subscribers (useFrame)
  subscribers = state.internal.subscribers
  for (let i = 0; i < subscribers.length; i++) {
    subscription = subscribers[i]
    subscription.ref.current(subscription.store.getState(), delta, frame)
  }

  // Render content
  if (!state.internal.priority && state.gl.render) state.gl.render(state.scene, state.camera)
```

Inside that first `useFrame`, once `texturesReady` is true, `animateMaterialRef.current.copy(defaultMaterial)` runs and replaces all four slots with references from the store `defaultMaterial`:

```240:259:/Users/pirouz/Documents/github/para/src/app/components/three/models/Model.js
    // guard against premature access to materialStore
    if (!texturesReady) return;

    const selectedMaterialID = selectedAndFocused && selection.materialID?.length
      ? selection.materialID
      : defaultMaterialID;

    if (!materialReadyRef.current) {
      // One-shot: seed animateMaterialRef from the store's default material
      const variants = matState.getSelectedMaterials(materialIDs);
      const defaultMaterial = variants[defaultMaterialID];
      if (defaultMaterial) {
        animateMaterialRef.current.copy(defaultMaterial);
        animateMaterialRef.current.needsUpdate = true;
        targetMaterialIDRef.current = defaultMaterialID;
        targetMaterialRef.current = defaultMaterial;
        materialReadyRef.current = true;
      }
      return;
    }
```

`texturesReady` is true on that first `useFrame` because `MaterialTextureInitializer`'s layout effect runs during the commit that mounted the `<Model>` children, and `useFrame` is subscribed inside another layout effect within the same commit:

```46:53:/Users/pirouz/Documents/github/react-three-fiber/packages/fiber/src/core/hooks.tsx
export function useFrame(callback: RenderCallback, renderPriority: number = 0): null {
  // Local state
  const store = useStore()
  const subscribe = store.getState().internal.subscribe
  // Memoize ref
  const ref = useMutableCallback(callback)
  // Subscribe on mount, unsubscribe on unmount
  useIsomorphicLayoutEffect(() => subscribe(ref, renderPriority, store), [renderPriority, subscribe, store])
```

`RootCanvas.js` wraps `<BasicScene>` in one `<Suspense>` boundary, so `MaterialTextureInitializer` (which calls `useTexture`) and each `<Model>` (which calls `useGLTF`) commit together. `MaterialTextureInitializer` is the first child under that boundary (`BasicScene.js:88-90`), so its layout effect runs before any `<Model>`'s subscribe effect does. By the time the first RAF runs a `<Model>`'s `useFrame`, `useMaterial.getState().texturesInitialized` is a non-empty string, `texturesReady` is true, and the one-shot `.copy()` executes before the first render.

`MeshPhysicalMaterial.copy()` reference-copies all slots (the base `MeshStandardMaterial.copy()` handles `map`, `bumpMap`, `roughnessMap`; `MeshPhysicalMaterial.copy` handles `transmissionMap` and the clearcoat slots):

```480:520:/Users/pirouz/Documents/github/three.js/src/materials/MeshPhysicalMaterial.js
	copy( source ) {

		super.copy( source );

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};
		...
		this.clearcoat = source.clearcoat;
		this.clearcoatMap = source.clearcoatMap;
		this.clearcoatRoughness = source.clearcoatRoughness;
		...
		this.transmission = source.transmission;
		this.transmissionMap = source.transmissionMap;
```

So after the one-shot, `animateMaterialRef.current`'s slots reference whatever the store default material references, and the `_defaultMeshPhysicalMaterialConfigMaps` DataTextures are no longer reachable from any rendered material. They are never seen by the renderer and therefore never get a `'dispose'` listener registered per §1.2.

### 5.2. `_meshPhysicalMaterialConfigs[*]` scratches: intentionally GPU-resident

`setMaterialTextures()` only touches slots enumerated in a store material's `textures` field. Per `materialStore.js:174-215`:

- `gloss_black.textures = { bumpMap: '/gloss_material_roughness.jpg' }` — only `bumpMap` is replaced; `map`, `roughnessMap`, `transmissionMap` retain the per-config scratches.
- `matte_black.textures = { bumpMap: '/gloss_material_roughness.jpg' }` — only `bumpMap` is replaced.
- `stained_matte_black.textures = { map, roughnessMap, bumpMap }` — `map`, `roughnessMap`, `bumpMap` are replaced; `transmissionMap` retains the scratch.
- `translucent_grey` has no `textures` field — all four slots retain the per-config scratches.

Per-Model, the scratches that reach the GPU depend on which store materials the `animateMaterialRef.current.copy(...)` / slot-swap paths expose to the renderer. With the project configs in `src/lib/configs/globals.js`:

- **Gerd** (`defaultMaterialID = 'stained_matte_black'`, variants `['stained_matte_black', 'matte_black', 'gloss_black']`): on mount, `.copy(stained_matte_black)` propagates 1 scratch (`transmissionMap`). If the user selects `matte_black` or `gloss_black` for Gerd, `updateDeterministicMaterialProperties` swaps slots to reference the scratches from those configs as well.
- **Sang** (`defaultMaterialID = 'matte_black'`, variants `['matte_black', 'translucent_grey']`): on mount, 3 scratches (`map`, `roughnessMap`, `transmissionMap`). Selecting `translucent_grey` can propagate all 4 `translucent_grey` scratches.
- **Pí** (`defaultMaterialID = 'gloss_black'`, variants `['gloss_black', 'matte_black']`): on mount, 3 scratches (`map`, `roughnessMap`, `transmissionMap`).

Counts:

- **Immediately after the first render in each Model:** `1 + 3 + 3 = 7` distinct scratch DataTextures are bound through `animateMaterialRef.current` and uploaded by `WebGLTextures`.
- **Maximum across a session where the user exercises every variant:** per-config scratches that remain non-replaced on each reachable store material:
  - `gloss_black`: `map`, `roughnessMap`, `transmissionMap` → 3
  - `matte_black`: `map`, `roughnessMap`, `transmissionMap` → 3
  - `stained_matte_black`: `transmissionMap` → 1
  - `translucent_grey`: `bumpMap`, `map`, `roughnessMap`, `transmissionMap` → 4

  Total: **11 distinct scratch DataTextures can reach the GPU.** The remaining 5 per-config scratches (those on slots replaced by loaded clones — `gloss_black.bumpMap`, `matte_black.bumpMap`, `stained_matte_black.bumpMap`, `stained_matte_black.map`, `stained_matte_black.roughnessMap`) are overwritten on their store materials before any `.copy()` or slot swap propagates them. They never appear on an `animateMaterialRef` that is rendered, and so never reach the GPU.

Because each scratch DataTexture has its own `Source` (§3.2), `WebGLTextures._sources` creates a distinct entry per scratch DataTexture; pixel-data identity does not deduplicate them. At 32 × 32 × 4 bytes per texture, the resident GPU footprint is at most 11 × 4096 bytes ≈ 44 KB.

### 5.3. Invariants that keep this picture correct

The §5.1 claim "`_defaultMeshPhysicalMaterialConfigMaps` scratches never reach the GPU" depends on three invariants. If any of them changes, that claim must be re-derived:

1. `MaterialTextureInitializer` and every `<Model>` remain inside the same `<Suspense>` boundary (currently the one in `RootCanvas.js`), so they commit in the same commit.
2. `MaterialTextureInitializer` is declared before the Models in source order (`BasicScene.js:90`), so its layout effect runs before any Model's `useFrame` subscription effect.
3. `Model.js`'s `useFrame` retains the `if (!texturesReady) return` gate and the one-shot `animateMaterialRef.current.copy(defaultMaterial)` before the first `state.gl.render(...)`.

The §5.2 claim ("`_meshPhysicalMaterialConfigs[*]` scratches reach the GPU for unreplaced slots") depends only on the `MeshPhysicalMaterial.copy` and `WebGLPrograms` mechanics in Three.js and on the current `materialStore.js` shape. It does not depend on React or R3F ordering.

---

## 6. Sharing `Uint8Array` buffers across DataTextures is safe

Sharing the four `Uint8Array` buffers across all 20 scratch DataTextures (§3.1, §3.2) is safe by the WebGL spec and by this app's usage pattern.

### 6.1. WebGL spec

`WebGLTextures.uploadTexture()` routes DataTextures to `gl.texImage2D` with the texture's `image.data` (the `Uint8Array`) as the pixel source:

```972:1028:/Users/pirouz/Documents/github/three.js/src/renderers/webgl/WebGLTextures.js
			} else if ( texture.isDataTexture ) {

				// use manually created mipmaps if available
				// if there are no manual mipmaps
				// set 0 level mipmap and then use GL to generate other mipmap levels

				if ( mipmaps.length > 0 ) {
					...
				} else {

					if ( useTexStorage ) {
						...
					} else {

						state.texImage2D( _gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, 0, glFormat, glType, image.data );

					}

				}
```

The WebGL spec defines `texImage2D` with an `ArrayBufferView`-typed `pixels` argument as "reading pixel data from the buffer at call time"; implementations are not permitted to hold the JS buffer beyond the call. After `texImage2D` returns, the JS `Uint8Array` and the GPU texture are independent. Mutating the `Uint8Array` afterwards has no effect on any already-uploaded texture unless `needsUpdate = true` is set and the texture is rendered again — at which point a fresh upload reads the current bytes.

### 6.2. This app

The four `Uint8Array`s are filled at module load (`materialStore.js:21-40`) and never mutated afterward. Of the 20 scratch DataTextures, 5 are overwritten before reaching the renderer (§5.2) and 4 (`_defaultMeshPhysicalMaterialConfigMaps`) are replaced by `.copy()` before the first render (§5.1), so only 11 ever reach the renderer. Whether all, some, or none of the scratches reach the renderer, sharing is safe because the `Uint8Array`s never change.

### 6.3. Memory savings from sharing

With sharing: 4 `Uint8Array`s × 4096 bytes = **16 KB** on the JS heap.
Without sharing (one `Uint8Array` per DataTexture): 20 DataTextures × 4096 bytes = **80 KB**.
Savings: **64 KB** (equivalently, the 16 `Uint8Array`s the design elides × 4096 bytes each).

---

## 7. Disposal strategy

### 7.1. Session end

Two session-end paths exist:

1. **Canvas unmounts while JS is still running** (full client-side navigation out of the layout that mounts `RootCanvas`, or HMR). R3F's `unmountComponentAtNode` runs `state.gl.forceContextLoss()` (§2.2), which uses `WEBGL_lose_context` to invalidate every GL resource tied to the context at the driver level. Whether the app previously called `.dispose()` on anything is irrelevant to GPU cleanup on this path.
2. **Tab close or hard navigation.** No JS runs. The browser tears down the WebGL context and the page's memory without calling `forceContextLoss` or any `.dispose()`.

Both paths free GPU memory. **Recommendation: do nothing on session end.** An explicit app-level `.dispose()` pass would be redundant with path 1 and unreachable on path 2.

### 7.2. In-session

The `<Canvas>` is mounted unconditionally in `src/app/layout.js` and not unmounted during client-side navigation. Within a session:

- Store materials and `animateMaterialRef` materials are created once and never replaced.
- Loaded clones assigned to store materials by `setMaterialTextures()` are assigned once and never replaced.
- `animateMaterialRef.current.copy(defaultMaterial)` runs once per `<Model>` when textures become ready. After that, `updateDeterministicMaterialProperties` (`Model.js:173-211`) swaps slot references between textures that already live on the store materials (loaded clones or per-config scratches). No new Textures are constructed after `setMaterialTextures()` returns.

The only objects that could be eagerly disposed mid-session are the scratches. Per §5:

- Disposing a `_meshPhysicalMaterialConfigs[*]` scratch that a live `animateMaterialRef.current` references would invoke `onTextureDispose` on the registered listener (§1.2), `gl.deleteTexture` the handle, and the next render would have to re-upload a fresh GL texture (because the DataTexture is still referenced by materials and still has `needsUpdate`/`version` state). This wastes a GL upload without reducing steady-state GPU residency.
- Disposing a scratch and then setting the slot to `null` to avoid re-upload would flip `HAS_*MAP` to `false` and change the shader program cache key (§4.1), triggering a synchronous GLSL compilation on the next render — the exact outcome the design in §4.3 exists to prevent.
- Disposing `_defaultMeshPhysicalMaterialConfigMaps` scratches is moot: they never reach the GPU (§5.1), so `.dispose()` has no GPU side effect (§1.3, consequence 1), and the `Uint8Array` storage persists as long as the module-scope references persist.

**Recommendation: do not eagerly dispose scratch DataTextures.** The per-config scratches are intentionally GPU-resident and should stay resident for the session; the default scratches are already GC-reachable only via module-scope references and carry no GPU footprint.

If a future refactor makes scratch DataTextures actually leave the scene (for example, by replacing all per-config slots with loaded clones so the scratches become truly unreferenced), that is when eager disposal becomes meaningful. In that case, capture each previously-assigned scratch before reassignment and call `.dispose()` on it after the reassignment; once a new GL texture is uploaded on the next render, the old scratch's `onTextureDispose` listener will be registered and can eventually fire.

---

## 8. Minor observations

### 8.1. `useRef(new THREE.MeshPhysicalMaterial(...))` allocates on every render

`Model.js:44` uses the `useRef(initialValue)` shorthand:

```44:44:/Users/pirouz/Documents/github/para/src/app/components/three/models/Model.js
  const animateMaterialRef = useRef(new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig }));
```

`useRef(initialValue)` evaluates `initialValue` on every render but only keeps the value from the first render. Subsequent re-renders construct a `MeshPhysicalMaterial` that is immediately discarded. Because `Model` is wrapped in `memo` and its props are stable, re-renders should be rare, but any discarded material still allocates. The discarded materials never reach the scene and are GC candidates as soon as the render returns, so the leak is bounded by GC timing rather than permanent.

If this becomes measurable, the standard fix is a lazy initializer:

```jsx
const animateMaterialRef = useRef(null);
if (animateMaterialRef.current === null) {
  animateMaterialRef.current = new THREE.MeshPhysicalMaterial({ ...defaultMeshPhysicalMaterialConfig });
}
```

### 8.2. `getSelectedMaterials` caches per `materialIDs` set

`_selectedMaterialsCache` in `materialStore.js` is keyed by a pipe-joined string of `materialIDs`:

```223:259:/Users/pirouz/Documents/github/para/src/app/stores/materialStore.js
  getSelectedMaterials: (materialIDs = []) => {
    const texturesInitialized = get().texturesInitialized;
    ...
    const cacheKey = _buildCacheKey(materialIDs);

    if (_selectedMaterialsCache.has(cacheKey)) return _selectedMaterialsCache.get(cacheKey);
```

In the current app there is one `materialIDs` set per `<Model>` (three sets total), and the sets are stable across the session. Cache misses occur only on the first call for each set; subsequent calls return the same object reference. This is correct as-is.

### 8.3. `THREE.ColorManagement.enabled` and `THREE.Cache.enabled`

These are set once in `RootCanvas.js:12-13` at module load. They are global Three.js flags and do not interact with the material store.

---

## 9. Non-goals

- **Disposing on per-mesh unmount.** R3F does not dispose geometry or material on `<mesh>` unmount (§2.1), and meshes in this app do not unmount mid-session.
- **Disposing loaded Textures from drei's cache.** drei owns that cache; manual disposal would fight it and risk double-dispose if the cache is re-consulted.
- **Reference-counting clones across material instances.** Each store material owns its own clone, and the per-material clones of the same source that reach the GPU are refcounted at the `WebGLTextures._sources[textureCacheKey].usedTimes` level inside Three.js (§3.3). The app does not need to add its own refcount layer.

---

## 10. Quick reference

| Object                                                          | Count            | Reaches GPU?                                         | Freed by                                              | Action needed |
| --------------------------------------------------------------- | ---------------- | ---------------------------------------------------- | ----------------------------------------------------- | ------------- |
| Shared `Uint8Array` buffers                                     | 4                | No (copied by `texImage2D` when a scratch uploads)   | GC on page unload                                     | None          |
| Scratch DataTextures — `_defaultMeshPhysicalMaterialConfigMaps` | 4                | No (§5.1)                                            | Module unload / page unload                           | None          |
| Scratch DataTextures — `_meshPhysicalMaterialConfigs[*]`        | 16               | Up to 11 resident across a full-exercise session (§5.2); kept intentionally to stabilize the shader program cache key (§4.3) | `forceContextLoss` on session end; never in-session   | None          |
| Loaded Textures (drei cache)                                    | 4                | Yes (indirectly, via their clones)                   | `forceContextLoss` on session end                     | None          |
| Loaded clones on store materials                                | 5                | Yes (through `animateMaterialRef.current.copy(...)`) | `forceContextLoss` on session end                     | None          |
| Store materials                                                 | 5 (4 MP + 1 MS)  | No (slot holders only)                               | GC once store references drop, never in-session       | None          |
| `animateMaterialRef` materials                                  | 3                | Yes (attached to `<mesh>`)                           | `forceContextLoss` on session end                     | None          |

"MP" = MeshPhysicalMaterial; "MS" = MeshStandardMaterial.
