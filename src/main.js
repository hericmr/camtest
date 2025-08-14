import * as THREE from 'three';
import * as LocAR from 'locar';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const locar = new LocAR.LocationBased(scene, camera);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);


// Responsividade
window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Configuração da webcam
const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
});

let firstLocation = true; // Flag para executar apenas uma vez

const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

// ✨ Listener para atualizações de GPS
locar.on("gpsupdate", (pos, distMoved) => {
    if (firstLocation) {
        const loader = new GLTFLoader();

        loader.load(
            '/trozoba.glb',
            function (gltf) {
                const model = gltf.scene;
                model.scale.set(10, 10, 10); // Adjust scale if necessary
                locar.add(
                    model,
                    pos.coords.longitude,
                    pos.coords.latitude + 0.0005 // ~55m North
                );
                console.log('Modelo trozoba.glb adicionado ao norte.');
            },
            undefined,
            function (error) {
                console.error(error);
            }
        );

        firstLocation = false;
    }
});

locar.startGps();

renderer.setAnimationLoop(animate);

function animate() {
    deviceOrientationControls.update();
    renderer.render(scene, camera);
}
