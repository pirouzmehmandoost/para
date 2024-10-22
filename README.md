# para



Tools Used: 

React Three Fiber
React renderer for Threejs. For building 3D scenes as JSX components
https://github.com/pmndrs/react-three-fiber


Notes on RTF: 

On scaling performance: 
'Every resource that is loaded with useLoader is cached automatically!'

'If you access a resource via useLoader with the same URL, throughout the component tree, then you will always refer to the same asset and thereby re-use it. This is especially useful if you run your GLTF assets through GLTFJSX because it links up geometries and materials and thereby creates re-usable models.'
https://r3f.docs.pmnd.rs/advanced/scaling-performance








GLTFJSX
CLI tool that turns GLTF assets into declarative, reusable (react-three-fiber) JSX components. 
Used to manage mesh materials, animations, and rendering as state-dependent props 

https://github.com/pmndrs/gltfjsx








