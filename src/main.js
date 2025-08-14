import * as THREE from 'three';
import * as LocAR from 'locar';

const camera = new THREE.PerspectiveCamera(
    80, 
    window.innerWidth / window.innerHeight, 
    0.001, 
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const locar = new LocAR.LocationBased(scene, camera);

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
        // Configuração dos cubos direcionais
        const boxProperties = [
            {
                latDis: 0.0005,    // ~55m Norte
                lonDis: 0,
                colour: 0xff0000,  // Vermelho
                direction: 'Norte'
            },
            {
                latDis: -0.0005,   // ~55m Sul  
                lonDis: 0,
                colour: 0xffff00,  // Amarelo
                direction: 'Sul'
            },
            {
                latDis: 0,
                lonDis: -0.0005,   // ~55m Oeste
                colour: 0x00ffff,  // Ciano
                direction: 'Oeste'
            },
            {
                latDis: 0,
                lonDis: 0.0005,    // ~55m Leste
                colour: 0x00ff00,  // Verde
                direction: 'Leste'
            }
        ];

        const geometry = new THREE.BoxGeometry(10, 10, 10);

        // Criar e posicionar os cubos
        boxProperties.forEach(prop => {
            const mesh = new THREE.Mesh(
                geometry, 
                new THREE.MeshBasicMaterial({ color: prop.colour })
            );
        
            locar.add(
                mesh, 
                pos.coords.longitude + prop.lonDis, 
                pos.coords.latitude + prop.latDis
            );
            
            console.log(`Cubo ${prop.direction} adicionado:`, {
                lat: pos.coords.latitude + prop.latDis,
                lon: pos.coords.longitude + prop.lonDis
            });
        });
        
        firstLocation = false;
    }
});

locar.startGps();

renderer.setAnimationLoop(animate);

function animate() {
    deviceOrientationControls.update();
    renderer.render(scene, camera);
}