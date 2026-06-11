# TargetRegistry — Technical Documentation

## Purpose

TargetRegistry is a framework-agnostic TypeScript class that tracks Three.js Object3D targets through a promotion/demotion/removal lifecycle. It maintains an ordered list of world-space positions and a UUID-keyed map of tracked targets, driven by Three.js `added`/`removed` events.

It is consumed by `SceneRigV3` (via a thin React hook wrapper, `useTargetRegistry`) but has no dependency on React, React Three Fiber, or Zustand.

## Files

| File | Role |
|------|------|
| `src/lib/targetRegistry/TargetRegistry.ts` | Framework-agnostic class. Depends only on Three.js. |
| `src/app/hooks/useTargetRegistry.ts` | Thin React hook wrapper. Bridges React lifecycle to the class. |

---

## Three.js Internals (source-verified)

All claims in this section are verified against the local Three.js clone at `/Users/pirouz/Documents/github/three.js`. Re-verify after any Three.js version upgrade.

### Object3D.add() — event timing

Source: `src/core/Object3D.js`, lines 746-787.

Sequence when `parent.add(child)` is called:

1. `child.removeFromParent()` — detach from any previous parent.
2. `child.parent = this` — parent reference is set.
3. `this.children.push(child)` — child is in the children array.
4. `child.dispatchEvent({ type: 'added' })` — `added` event fires on the child.
5. `this.dispatchEvent({ type: 'childadded', child })` — `childadded` event fires on the parent.

When an `added` listener fires, `child.parent` is already set and `child` is already in `parent.children`.

`childadded` fires only on the direct parent. There is no event bubbling in `EventDispatcher`. The scene root does NOT receive `childadded` when an object is added to an intermediate parent already in the scene.

### Object3D.remove() — event timing

Source: `src/core/Object3D.js`, lines 798-829.

Sequence when `parent.remove(child)` is called:

1. `child.parent = null` — parent reference is cleared.
2. `this.children.splice(index, 1)` — child is removed from the children array.
3. `child.dispatchEvent({ type: 'removed' })` — `removed` event fires on the child.
4. `this.dispatchEvent({ type: 'childremoved', child })` — `childremoved` event fires on the parent.

When a `removed` listener fires, `child.parent` is already `null`. The former parent cannot be discovered from the event object. The registry must store `parentUUID` at promotion time.

### EventDispatcher.dispatchEvent() — synchronous, no batching

Source: `src/core/EventDispatcher.js`, lines 101-126.

- Fully synchronous for-loop over a shallow-copied listener array.
- No `setTimeout`, `queueMicrotask`, or deferral.
- Listeners can mutate the object during dispatch.
- The listener array is copied before iteration, so removing a listener inside a callback does not corrupt the loop.

### Object3D.uuid — stable, generated once

Source: `src/core/Object3D.js`, line 97; `src/math/MathUtils.js`, lines 17-33.

- `uuid` is assigned once in the constructor via `generateUUID()` (Math.random-based UUID v4).
- Never reassigned by any Three.js method. Stable for the object's lifetime.
- `copy()` does NOT copy the uuid — cloned objects get fresh UUIDs.

### getObjectByProperty() — O(N) linear scan

Source: `src/core/Object3D.js`, lines 944-963.

- Recursive depth-first pre-order traversal. No index.
- `getObjectById()` and `getObjectByName()` are wrappers around it.
- The registry must maintain its own UUID-keyed maps to avoid O(N) lookups per frame.

### Scene — no additional event handling

Source: `src/scenes/Scene.js`.

- `Scene` extends `Object3D` (which extends `EventDispatcher`).
- Adds no event types or event handling beyond what Object3D provides.

---

## React Three Fiber Internals (source-verified)

All claims in this section are verified against the local R3F clone at `/Users/pirouz/Documents/github/react-three-fiber`. Re-verify after any R3F version upgrade.

### Reconciler mutations — synchronous, during React commit phase

Source: `packages/fiber/src/core/reconciler.tsx`.

- `appendChild` / `removeChild` call Three.js `object.add()` / `object.remove()` synchronously during React's commit phase.
- No batching or deferral of scene graph mutations.
- `insertBefore` manually splices into `parent.children` and dispatches `added`/`childadded` events directly (does not call `Object3D.add()`) when the child is new. For move operations (child already in parent), it splices without dispatching events. The registry's `added` listener fires correctly in the new-child case.

### Timing chain for removals

When React unmounts a component that owns a Three.js Object3D:

1. **React commit phase** → R3F `removeChild` → `Object3D.remove()` → `removed` event fires synchronously.
2. **React `useLayoutEffect` cleanups** run.
3. **React `useEffect` cleanups** run.

Three.js `removed` events fire BEFORE both `useLayoutEffect` and `useEffect` cleanups. The registry's `_makeRemovedHandler` closure can safely read the registry's own state during the event — it runs while effects are still "live."

R3F's `removeChild` recursively removes all children of the unmounted subtree, calling `parent.object.remove(child.object)` at each level. This means `removed` events fire on every Object3D in the subtree, not just the root.

### useFrame — independent of React render cycle

Source: `packages/fiber/src/core/hooks.tsx`.

- `useFrame` callbacks run inside `requestAnimationFrame`, decoupled from React's render cycle.
- Can execute between React's commit phase and passive-effects phase.
- The registry's event-driven updates (`_makeAddedHandler`, `_makeRemovedHandler`) fire synchronously during commit, ensuring the registry is consistent before the next `useFrame` reads it.

---

## Target Lifecycle

### Classifications

**Promoted:** A target is registered with the TargetRegistry and considered available. The registry tracks its world-space position in the positions array. A target is promoted when:

- It is present in the scene graph at discovery time (`register()` or `registerByFilter()`), OR
- It re-enters the scene graph (the `added` event fires on a demoted target), OR
- The consumer explicitly calls `promote(uuid)`.

**Demoted:** A target is registered but considered unavailable. Its position is removed from the positions array. A target is demoted when:

- It is removed from the scene graph and the demotion heuristic classifies it as recoverable (see below), OR
- The consumer explicitly calls `demote(uuid)` for any application-specific reason (visibility change, distance culling, UI toggle, etc.).

A demoted target listens for the `added` event to auto-re-promote if it re-enters the scene graph. Consumer-demoted targets (via `demote()`) are not auto-re-promoted by `added` events — they require an explicit `promote()` call from the consumer, because the consumer owns the reason for demotion.

**Removed:** A target is permanently gone. Either:

- The former parent (`parentUUID`) is no longer in the scene graph, OR
- The target is no longer in the `_targets` map (the consumer dropped it between re-registrations), OR
- The consumer explicitly calls `removeTarget(uuid)`.

Removed targets are cleaned up immediately. No pending state.

### Why `parentUUID` must be stored at promotion time

The `removed` event fires after `child.parent = null` (Three.js `Object3D.remove()`, line 816). By the time the registry's `_makeRemovedHandler` listener runs, `event.target.parent` is `null`. The only way to check whether the former parent is still in the scene graph — and therefore distinguish demotion from removal — is to have stored the parent's UUID beforehand.

### Demotion vs. removal — the heuristic

When `_makeRemovedHandler` fires for a tracked target:

1. Look up the stored `parentUUID` for this target.
2. Call `scene.getObjectByProperty('uuid', parentUUID)` to check if the former parent is still in the scene graph.
3. Check if the target is still tracked: either `_activeFilter` is non-null (filter mode) or the UUID exists in `_targets` (array mode).
4. If the parent exists AND the target is still tracked → **demote**. Register an `added` listener on the target.
5. Otherwise → **remove**. Clean up the entry entirely.

Note: `scene.getObjectByProperty()` is O(N). This call happens inside a `removed` event handler, which fires during React's commit phase — not per frame. The O(N) cost is acceptable here because removals are infrequent. The per-frame hot path (`useFrame`) never calls `getObjectByProperty`.

---

## Public API

```typescript
interface RegistryEntry {
  target: THREE.Object3D;
  index: number;
  targetUUID: string;
  parentUUID: string;
  consumerDemoted: boolean;
}

class TargetRegistry {
  constructor(scene: THREE.Scene);

  register(targets: THREE.Object3D[]): void;
  registerByFilter(filter: (obj: THREE.Object3D) => boolean): void;

  getPositions(): readonly THREE.Vector3[];
  getPromoted(): Readonly<Record<string, RegistryEntry>>;
  getDemoted(): Readonly<Record<string, RegistryEntry>>;

  refreshPosition(index: number, position: THREE.Vector3): void;

  addTarget(target: THREE.Object3D): boolean;
  removeTarget(uuid: string): boolean;

  demote(uuid: string): boolean;
  promote(uuid: string): boolean;

  deregister(): void;
}
```

### Constructor

**`constructor(scene)`** — `scene` is required and must be a `THREE.Scene`; throws `TypeError` otherwise.

### Method contracts

**`register(targets)`** — Called when the consumer's target list changes. Runs full discovery: traverses the scene graph, classifies each target as promoted or demoted, wires `added`/`removed` event listeners, initializes position slots to `(0, 0, 0)`. Cleans up listeners from the previous target set. Clears `_userRemoved`. Targets with falsy or empty `uuid` are skipped. Internal `_targets` is built as a UUID-keyed `Record` via `Object.fromEntries`, which deduplicates by UUID.

**`registerByFilter(filter)`** — Called when the consumer wants to track all scene objects matching a predicate. Traverses the scene graph at registration time and promotes every matching object. Attaches a `childadded` listener on the scene root to discover new matching objects added after registration. Clears `_userRemoved`. See "Filter mode discovery" below for coverage and limitations.

**`getPositions()`** — Returns the internal position array as `readonly`. The caller must not mutate the array structure (no push/splice). Individual `Vector3` values are readable; the registry updates them in-place via `refreshPosition()`.

**`getPromoted()`** — Returns the promoted targets map as `Readonly`. UUID-keyed.

**`getDemoted()`** — Returns the demoted targets map as `Readonly`. UUID-keyed.

**`refreshPosition(index, position)`** — Copies the given position into the internal positions array at the specified index. Called by the consumer's per-frame loop after computing the target's position (e.g., via `getAABBCenterFast`). Position computation is the consumer's responsibility — the registry does not depend on `positionUtils`.

**`addTarget(target)`** — Adds a single Object3D to the registry after initial registration. Returns `false` if the UUID already exists in `_promoted` or `_demoted`, or if the target has a falsy/empty UUID. If the target is in the scene, it is promoted immediately. If not, it is demoted with an `added` listener. Removes the UUID from `_userRemoved` if present (explicit re-addition overrides a previous `removeTarget`).

**`removeTarget(uuid)`** — Permanently removes a target from the registry. Cleans up the position slot (if promoted), adjusts indices, removes event listeners, deletes from `_targets`, and adds the UUID to `_userRemoved`. In filter mode, `_userRemoved` prevents the `childadded` handler from re-discovering and re-promoting the target. Returns `false` if the UUID is not found.

**`demote(uuid)`** — Moves a promoted target to demoted state. Removes its position from the positions array, adjusts indices of all entries with higher indices, and marks the entry as consumer-demoted (not auto-re-promotable by `added` events). Returns `true` if the target was found and demoted, `false` if the UUID was not in the promoted map.

**`promote(uuid)`** — Moves a demoted target back to promoted state. Verifies that both the target and its parent are in the scene graph before promoting; returns `false` if either check fails. Appends a position slot initialized to `(0, 0, 0)`, clears the consumer-demoted flag, and wires a `removed` listener. Returns `true` on success.

**`deregister()`** — Removes all `added`/`removed`/`childadded` event listeners from all tracked targets and the scene, clears internal state including `_userRemoved`. The instance is reusable — `register()` or `registerByFilter()` can be called again after `deregister()`.

### Filter mode discovery

`registerByFilter(filter)` attaches a `childadded` listener on the scene root via `_attachSceneChildAddedListener`. When `childadded` fires on the scene, the handler traverses `event.child` and its descendants, promoting any object that matches the filter and is not already tracked.

The handler has two passes:

1. **New-object pass:** Traverses `event.child` and its descendants. Any object that matches the filter and is not already in `_promoted` or `_demoted` is promoted via `_promoteByObject`.
2. **Demoted re-check pass:** Iterates all existing `_demoted` entries. For each non-consumer-demoted entry, checks whether the target's parent is now in the scene graph (via `getObjectByProperty`). If so, promotes the entry via `_promoteEntry`. This handles the case where a demoted target's parent was removed and later re-added — the `childadded` event from the parent's return triggers the handler, and the second pass discovers that the demoted target's parent is now available.

**Coverage**: Subtrees added as direct children of the scene are fully covered (the traverse reaches all descendants). This is the R3F mounting pattern — components render Object3Ds that are added to the scene root during React's commit phase.

**Limitation**: Objects added to a parent that is already in the scene do NOT trigger `childadded` on the scene root. `childadded` fires on the direct parent only (Three.js `Object3D.js` line 776, no event bubbling). For these, the consumer must call `addTarget()` explicitly.

---

## React Hook Wrapper

```typescript
type Targets = THREE.Object3D[] | ((obj: THREE.Object3D) => boolean);

function useTargetRegistry(
  scene: THREE.Scene | null,
  targets?: Targets,
): React.RefObject<TargetRegistry | null>;
```

**File:** `src/app/hooks/useTargetRegistry.ts`

**Responsibilities:**

- Creates a `TargetRegistry` instance on mount (stored in a `useRef`).
- If `targets` is an array, calls `registry.register(targets)`. If `targets` is a function, calls `registry.registerByFilter(targets)`.
- Calls `registry.register()` or `registry.registerByFilter()` when `targets` or `scene` changes (`useEffect`). The effect cleanup calls `registry.deregister()` before each re-registration.
- Tracks scene identity via `sceneRef`. When `scene.uuid` changes, nulls `registryRef.current` to force reconstruction on the next effect run.
- Calls `registry.deregister()` and nulls both refs on unmount (separate empty-deps effect).
- Returns a ref to the registry instance. Not a state value — avoids re-renders. The consumer reads the registry imperatively in `useFrame`.

**Function reference stability:** Consumers passing a function as `targets` must provide a stable (memoized) reference. An unstable function reference creates a new reference on every React render, causing the `[scene, targets]` effect to re-run every render — silently destroying and rebuilding the entire registry each time. Use `useMemo` or `useCallback` to stabilize the function.

---

## Design rationale for consumer-driven demotion

Scene graph membership is not the only criterion for target availability. Production applications need to exclude targets for reasons the registry cannot anticipate:

- **Visibility filtering:** A product configurator hides meshes by category. Hidden products should not be camera targets.
- **Distance culling:** A large scene excludes targets beyond a camera distance threshold.
- **UI toggles:** A scene editor (such as one using [Leva](https://github.com/pmndrs/leva)) lets users enable/disable individual targets via a checkbox panel.
- **LOD swaps:** A consumer replaces a high-detail mesh with a low-detail mesh at runtime.

The `demote(uuid)` and `promote(uuid)` methods let the consumer drive availability transitions for any application-specific reason. The registry handles all bookkeeping (positions array, index adjustment, listener management). Consumers that only need scene-graph-driven lifecycle never call these methods — they are additive, not mandatory.

Consumer-demoted targets are distinguished from scene-graph-demoted targets internally. A scene-graph-demoted target auto-re-promotes when it re-enters the scene graph (the `added` event fires). A consumer-demoted target does not auto-re-promote — the consumer owns the demotion reason and must explicitly call `promote(uuid)` to reverse it.

---

## Design constraints

1. **Zero CPU allocation for per-frame operations.** `getPositions()` returns the internal array by reference. `refreshPosition()` copies into existing Vector3 objects. No `new Vector3()`, no `clone()`, no object spread.

2. **Event listeners must be cleaned up.** Every `addEventListener` call must have a corresponding `removeEventListener` in `deregister()` and in `register()`/`registerByFilter()` (when replacing a previous target set).

3. **`parentUUID` must be captured at promotion time.** Cannot be recovered after `removed` fires.

4. **The registry does not own position computation logic.** The registry offers the option to centralize computed Vector3 values. Position computation is the consumer's responsibility via `refreshPosition()`.

5. **The registry does not depend on React, R3F, or Zustand.** Only Three.js.

---

## Relationship to SceneRigV3 and SceneRig

`SceneRigV3.js` is a copy of `SceneRig.js` wired to consume the registry via `useTargetRegistry`. `SceneComposer.js` mounts `SceneRigV3` with a filter function, so `registerByFilter` is the production path.

After extraction, `SceneRigV3` retains:

- Gesture/pointer handling (swipe detection, manual override)
- Camera animation loop (`useFrame`)
- Target cycling logic (dwell time, auto-advance, focus override)
- Per-frame position computation via `getAABBCenterFast` and `registry.refreshPosition()`

`SceneRigV3` does not own:

- Target discovery (scene traversal, target classification)
- Event listener wiring for `added`/`removed`/`childadded`

These are handled by the registry.

---

## Known issues and pending work

Tracked in `REFACTOR.md`.
