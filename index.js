import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { Sculpture } from "sculpture";

let container;
let camera, scene, renderer;
let controller;

let reticle;

let hitTestSource = null;
let hitTestSourceRequested = false;

const soundURLs = [
  "sound-1.ogg",
  "sound-2.ogg",
  "sound-3.ogg",
  "sound-4.ogg",
  "sound-5.ogg",
  "sound-6.ogg",
  "sound-7.ogg",
  "sound-8.ogg",
  "sound-9.ogg",
  "sound-10.ogg",
  "sound-11.ogg",
  "sound-12.ogg",
  "sound-13.ogg",
  "sound-14.ogg",
  "sound-15.ogg",
  "sound-16.ogg",
  "sound-17.ogg",
  "sound-18.ogg",
  "sound-19.ogg",
  "sound-20.ogg",
  "sound-21.ogg",
  "sound-22.ogg",
];

let sculptures = [];

init();
animate();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  //

  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
  );

  //

  const listener = new THREE.AudioListener();
  camera.add(listener);

  //

  function onSelect() {
    if (reticle.visible) {
      const sound = new THREE.PositionalAudio(listener);
      const audioLoader = new THREE.AudioLoader();
      const soundIndex = Math.floor(Math.random() * 22 + 1);
      audioLoader.load(
        "sounds/sound-" + soundIndex + ".ogg",
        function (buffer) {
          sound.setBuffer(buffer);
          sound.setRefDistance(0.1);
          sound.play();
        }
      );
      sculptures.push(
        new Sculpture(
          [3, 15, 3],
          new THREE.Vector3().setFromMatrixPosition(reticle.matrix),
          new THREE.Vector3(0.1, 0.1, 0.1),
          new THREE.Quaternion().setFromRotationMatrix(reticle.matrix),
          sound
        )
      );
      sculptures[sculptures.length - 1].addToScene(scene);
    }
  }

  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then(function (source) {
            hitTestSource = source;
          });
      });

      session.addEventListener("end", function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length) {
        const hit = hitTestResults[0];

        reticle.visible = true;
        reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }

  renderer.render(scene, camera);

  sculpture.forEach((s) => {
    s.update();
  });
}

function loadSounds(listener) {}
