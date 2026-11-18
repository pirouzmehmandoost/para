# AGENTS Guidelines for This Repository

## Coding Conventions

* Prefer TypeScript (`.tsx`/`.ts`) for new components and utilities.
* React Three Fiber components are located in `src/app/components/three/.`
* Reusable React components are located in `src/app/components/ui/.`


### R3F (@react-three/fiber)

* `useFrame` runs a callback on each animation frame in R3F components. Keep
  continuous animation updates out of React state. Do not drive animation by
  calling React state setters on every frame in `useFrame` or on every pointer
  movement in `onPointerMove`; mutate the relevant objects through refs instead.
  React state updates go through React's scheduler and can trigger component
  renders, although React can skip an update when the state is unchanged.

* Reuse objects across frames instead of allocating new objects on every
  `useFrame` call. This includes allocations made by functions called from
  `useFrame`. Allocate reusable objects outside the callback where possible.
  Necessary allocations inside the callback must be limited to one-time
  initialization or infrequent resource changes, with a comment explaining the
  condition that prevents allocation on every frame.

* Avoid React subscriptions to rapidly changing animation values in Zustand.
  Read those values directly inside `useFrame`, for example:
  `useFrame(() => (ref.current.position.x = api.getState().x))`.
  Calling `getState()` reads the current state without subscribing. It does not
  prevent other subscribed components from receiving store updates.
