"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { dumpObject } from "../../lib/modeling";

const url = "rock_bag_red.gltf";

// const url = "/bag_for_web2.gltf";
const loader = new GLTFLoader();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

export const frameArea = (sizeToFitOnScreen, boxSize, boxCenter, camera) => {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .multiply(new THREE.Vector3(1, 0, 1))
    .normalize();
  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  camera.updateProjectionMatrix();
  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
};


export const ModelViewer = () => {
  loader.load(
    url,
    (gltf) => {
      const root = gltf.scene;
      const light = new THREE.HemisphereLight(0xffffff, 0x080820, 5);
      scene.add(light);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      camera.position.set(-30, 0, 0.1);
      camera.lookAt(new THREE.Vector3());
      scene.add(camera);

      // renderer.xr.enabled = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      // document.body.appendChild(renderer.domElement);
      document
        .getElementById(`model_container`)
        .appendChild(renderer.domElement);

      const box = new THREE.Box3().setFromObject(root);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);

      controls.update();
      scene.add(root);

      console.log(dumpObject(root).join("\n"));

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }

      animate();
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  return (
    <div
      className=" flex-column items-center justify-center  text-center"
      key="69"
    >
      <canvas className="items-center justify-center" key="3"></canvas>
    </div>
  );
};
