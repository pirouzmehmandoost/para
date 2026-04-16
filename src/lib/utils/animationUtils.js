/*
NOTES: 
In MeshPhysicalMaterial, properties clearcoat, transmission, and dispersion have setter functions that increment
 material.version when the value crosses the zero boundary:

// Example from the Three.js source (clearcoat setter):
set clearcoat( value ) {
    if ( this._clearcoat > 0 !== value > 0 ) {
        this.version ++;
    }
    this._clearcoat = value;
}

This is because clearcoat > 0 enables the USE_CLEARCOAT shader define, which changes the shader program. Same for USE_TRANSMISSION and USE_DISPERSION.
When the version increments, the renderer calls getProgram() and compiles a new GLSL program on the GPU - 
a synchronous, main-thread-blocking operation.

What happens in your code during a material switch
Consider switching from matte_black (clearcoat=0, transmission=0) to translucent_grey (clearcoat=0.8, transmission=1):

1- 
  In Model.js, easeMaterialProperties calls easing.damp(animateMaterialRef.current, "clearcoat", 0.8, 0.3, delta). 
  On the first frame, clearcoat moves from 0 to ~0.04. The setter detects 0→positive → version++.
2- 
  Same frame: easing.damp(…, "transmission", 1, …) moves from 0 to ~0.05 → version++.
3- 
  Same frame: updateDeterministicMaterialProperties detects transparent changed → needsUpdate = true → version++.

4-   
  The renderer sees the version mismatch and compiles a new shader program with USE_CLEARCOAT, USE_TRANSMISSION, 
  and different transparent handling. This compilation blocks the main thread for 100-300+ms on r183 due to the larger, restructured shader code.

On r180, the same recompilation happened but the shader was simpler and compiled faster. On r183, the added struct fields,
DFG LUT, and rewritten BRDF functions make the GLSL program larger, increasing GPU driver compilation time.


Why a small freeze between animation frames was not noticeable before upgrading from three.js v180:

  The zero-boundary recompilation mechanism was identical in r180, the shader was just smaller and faster to compile, making the stall imperceptible or near-imperceptible.


How clearcoat is used in the fragment shader:

  The uniform is declared in meshphysical.glsl.js:
    material.clearcoat = saturate( material.clearcoat ); // Burley clearcoat model
    material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );

  The final blending line where material.clearcoat determines the visual contribution:
    outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;

  The operations on 1e-7 here are:

  material.clearcoat * Fcc — where Fcc is a Schlick Fresnel term (vec3, components in range [0.04, 1.0]). Worst case: 1e-7 * 0.04 = 4e-9.
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


Concerns: 

1-  will setting clearcoat on every instance of MeshPhysicalMaterial become costly? 
  No. I'm ignorant to how "cost" works in this context.

  The cost of clearcoat > 0 is not per-material-instance. It is per-shader-program-variant.
  Multiple MeshPhysicalMaterial instances share the same compiled shader program as long as their shader-affecting properties produce the same program cache key. 
  Whether Model and materialStore store 1 material or 50 with clearcoat > 0, 
  the GPU compiles the clearcoat-enabled shader once and reuses it for all of them.

  The actual per-frame cost of clearcoat > 0 is a few extra ALU (arithmetic) operations in
  the fragment shader: a second specular lobe, a Fresnel calculation, and a mix operation. 
  On my laptop specifically (M4 Max GPU) this adds negligible time per fragment - 
  far less than the hundreds of milliseconds lost to a shader recompilation stall.

  Unknowingly, my previous approach to set all clearcoat values to non-zero was architecturally correct.
  The cost concern that led you to abandon it was not a real performance issue.

2- Will the GPU flush 1e-7 to 0.0?
  No. There are three distinct concerns, and none apply:

  Uniform storage: WebGL uniforms are stored as IEEE 754 float32 values in GPU constant buffers.
  The smallest positive normal float32 is 2^-126 ≈ 1.175e-38. The value 1e-7 ≈ 2^-23.25 is 103 binary exponent units above the denormal threshold.
  It is stored with full precision. Uniform storage does not apply flush-to-zero.

  ALU flush-to-zero (FTZ): Some GPUs enable FTZ for denormal (subnormal) intermediate results — values below ~1.18e-38.
  The intermediate results produced by 1e-7 in the clearcoat math are:

  1e-7 * 0.04 = 4e-9 ≈ 2^-28 — normal, 98 exponent units above denormal range
  1e-7 * vec3(specular) — worst case ~1e-8 ≈ 2^-26 — normal
  No intermediate result comes anywhere near the denormal range. FTZ does not affect this.

  Compiler constant propagation: GPU shader compilers do NOT perform runtime constant propagation based on uniform values.
  The compiler does not know what value the uniform will hold at execution time. uniform float clearcoat is treated as an opaque runtime variable.
  The compiler generates the full clearcoat code path regardless. There is no optimization that would detect "this uniform is small" and skip the computation.


  Each step of the data path where 1e-7 is used in Javascript: 

    1- In JavaScript (where the zero-boundary check runs): 
      JavaScript uses IEEE 754 double-precision (64-bit) floats. The smallest representable positive normal double is ~2.2e-308. The value 1e-7 is 0.0000001, which is 301 orders of magnitude above the minimum. It is stored with full precision. The comparison 1e-7 > 0 evaluates to true unconditionally — there is no rounding, truncation, or flush-to-zero in this range.

    2- Three.js setter (the critical gate):
      set clearcoat( value ) {
        if ( this._clearcoat > 0 !== value > 0 ) {
            this.version ++;
        }
        this._clearcoat = value;
      }

      Both operands of the comparison are JavaScript doubles. this._clearcoat > 0 and value > 0 produce boolean results. If both are true (both values are 1e-7 or larger), the !== evaluates to false, and version is NOT incremented. This is the entire purpose of the epsilon — keeping both the old and new values on the same side of zero.

    3- GLSL uniform on the GPU:
      The clearcoat value is passed to the GPU as a float uniform (32-bit single-precision IEEE 754). The smallest positive normal float32 is ~1.18e-38. The value 1e-7 is ~0x33D6BF95 in float32 representation — firmly in the normal range, not a subnormal. Even on GPUs with flush-to-zero (FTZ) mode enabled for subnormals, 1e-7 is unaffected because it is a normal number.

    4. Shader define (the part that controls shader compilation):
      The #ifdef USE_CLEARCOAT preprocessor directive in the GLSL shader is set on the JavaScript side based on the program parameters. 
      Three.js evaluates parameters.clearcoat as a boolean when building the program key — this check runs in JavaScript, not on the GPU. 
      So even in a hypothetical scenario where the GPU uniform was flushed to zero, the define would still be set because the JavaScript check already passed.

    5. easing.damp from maath:
      All arithmetic runs in JavaScript double precision. No numerical issue approaching or departing 1e-7.


Conclusion: 

  Setting clearcoat initially to 1e-7 on every MeshPhysicalMaterial is safe, there is no precision concern.
  It will not be resolved to 0.0 at any point in the pipeline: not in JavaScript, not in uniform upload, not in GPU ALU operations, 
  and not by compiler optimizations. The smallest float32 normal is 1.175e-38, which is 31 orders of magnitude smaller than 1e-7. 


  1e-5 or 1e-4 are equally valid, the visual contribution remains imperceptible at any of these values.
  clearcoat = 1e-4 adds at most 1e-4 * Fresnel * specularRadiance to the final pixel color, 
  which is below the quantization step of an 8-bit framebuffer (1/255 ≈ 3.9e-3).


  The cleanest fix applies the epsilon principle only to animateMaterialRef in Model.js - 
  The single material instance per Model that does the easing. Store materials remain unchanged.


Implementation:

  Three changes are required: 
  
    First import the constant EPSILON_1e7 into Model.js. 

    1- defaultMeshPhysicalMaterialConfig — 
      Set the three zero-crossing properties to SHADER_EPSILON instead of 0 or 0.1. This ensures animateMaterialRef is constructed with the "all features enabled" shader from the first render, 
      so the program is compiled during initialization (during the Suspense loading phase), not during user interaction.

    2- One-shot init (after .copy()) —
      after animateMaterialRef.current.copy(mat), clamp the three properties:

        animateMaterialRef.current.clearcoat = Math.max(animateMaterialRef.current.clearcoat, SHADER_EPSILON);
        animateMaterialRef.current.transmission = Math.max(animateMaterialRef.current.transmission, SHADER_EPSILON);
        animateMaterialRef.current.dispersion = Math.max(animateMaterialRef.current.dispersion, SHADER_EPSILON);

      This prevents .copy() from setting these to 0 (which would be a zero-crossing from the initial non-zero value, triggering version++).

    3- easeMaterialProperties — clamp the easing target:

        const targetClearcoat = Math.max(materialToUpdate.clearcoat, SHADER_EPSILON);
        easing.damp(animateMaterialRef.current, "clearcoat", targetClearcoat, 0.3, delta);
        const targetTransmission = Math.max(materialToUpdate.transmission, SHADER_EPSILON);
        easing.damp(animateMaterialRef.current, "transmission", targetTransmission, 0.3, delta);
        const targetDispersion = Math.max(materialToUpdate.dispersion, SHADER_EPSILON);
        easing.damp(animateMaterialRef.current, "dispersion", targetDispersion, 0.3, delta);

      This ensures that when easing toward a material with clearcoat: 0, the value settles at 1e-7 instead of exactly 0. 
      The visual contribution of clearcoat = 1e-7 is mathematically zero — it produces no perceptible specular reflection.

  What this achieves: 

  - The "all features enabled" shader program is compiled once, during initialization, before any user interaction.
  - No zero-boundary crossings ever occur on animateMaterialRef, so version never increments from a property setter during easing.
  - No shader recompilation during material switches. The program cache key does not change because the shader defines (USE_CLEARCOAT, USE_TRANSMISSION, USE_DISPERSION) remain enabled throughout the material's lifetime.
  - Store materials remain unchanged. Only the per-Model animated material is affected.
  - The per-frame GPU cost is negligible — a few extra ALU operations per fragment for evaluating clearcoat/transmission/dispersion with effectively-zero contributions.
  - The "high-gloss flash" I observed pre-upgrade will also be eliminated, because the clearcoat code path is always active — there is no frame where it suddenly appears.
*/

export const EPSILON_1e7 = 1e-7;
export const EPSILON_3e3 = 3e-3;
export const EPSILON_10e4 = 10e-4;

export const angleDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export const eulerDistance = (current, target) =>
  Math.abs(angleDelta(current.x, target.x)) +
  Math.abs(angleDelta(current.y, target.y)) +
  Math.abs(angleDelta(current.z, target.z));

export const wrap = (value, min, max) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

export const RotationAnimationModes = {
  MODE_IDLE: 'MODE_IDLE',
  MODE_TURNTABLE: 'MODE_TURNTABLE',
  MODE_MANUAL: 'MODE_MANUAL'
}

export const PositionAnimationModes = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED'
}