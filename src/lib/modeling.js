
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

export const dumpObject = (obj, lines = [], isLast = true, prefix = "") => {
  const localPrefix = isLast ? "└─" : "├─";
  lines.push(
    `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${obj.type}]`,
  );
  const newPrefix = prefix + (isLast ? "  " : "│ ");
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
};

// export const loadGLTF = (path) => {
//   return new Promise((resolve, reject) => {
//     const loader = new THREE.GLTFLoader();
//     loader.load(path, (gltf) => {
//       resolve(gltf);
//     });
//   });
// }

// export const loadAudio = (path) => {
//   return new Promise((resolve, reject) => {
//     const loader = new THREE.AudioLoader();
//     loader.load(path, (buffer) => {
//       resolve(buffer);
//     });
//   });
// }

// export const loadVideo = (path) => {
//   return new Promise((resolve, reject) => {
//     const video = document.createElement("video");
//     //video.addEventListener('loadeddata', () => {
//     video.addEventListener('loadedmetadata', () => {
//       video.setAttribute('playsinline', '');
//       resolve(video);
//     });
//     video.src = path;
//   });
// }

// export const loadTexture = (path) => {
//   return new Promise((resolve, reject) => {
//     const loader = new THREE.TextureLoader();
//     loader.load(path, (texture) => {
//       resolve(texture);
//     }); 
//   });
// }

// export const loadTextures = (paths) => {
//   const loader = new THREE.TextureLoader();
//   const promises = [];
//   for (let i = 0; i < paths.length; i++) {
//     promises.push(new Promise((resolve, reject) => {
//       loader.load(paths[i], (texture) => {
// 	resolve(texture);
//       }); 
//     }));
//   }
//   return Promise.all(promises);
// }

// export const mockWithVideo = (path) => {
//   navigator.mediaDevices.getUserMedia = () => {
//     return new Promise((resolve, reject) => {
//       const video = document.createElement("video");

//       video.oncanplay = () => {
// 	const startButton = document.createElement("button");
// 	startButton.innerHTML = "start";
// 	startButton.style.position = 'fixed';
// 	startButton.style.zIndex = 10000;
// 	document.body.appendChild(startButton);

// 	startButton.addEventListener('click', () => {
// 	  const stream = video.captureStream();
// 	  video.play();
// 	  document.body.removeChild(startButton);
// 	  resolve(stream);
// 	});
//       };
//       video.setAttribute('loop', '');
//       video.setAttribute("src", path);
//     });
//   };
// }

// export const mockWithImage = (path) => {
//   navigator.mediaDevices.getUserMedia = () => {
//     return new Promise((resolve, reject) => {
//       const canvas = document.createElement("canvas");
//       const context = canvas.getContext('2d');

//       const image = new Image();
//       image.onload = () => {
// 	canvas.width = image.width;
// 	canvas.height = image.height;
// 	context.drawImage(image, 0, 0, image.width, image.height);
// 	const stream = canvas.captureStream();
// 	resolve(stream);
//       }
//       image.src = path;
//     });
//   };
// }