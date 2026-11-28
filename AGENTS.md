# AGENTS Guidelines for This Repository

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Coding Conventions

* Prefer TypeScript (`.tsx`/`.ts`) for new components and utilities.
* React Three Fiber components are located in `src/app/components/three/.`
* Reusable React components are located in `src/app/components/ui/`

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