# AR.js com LocAR.js  
## Parte 3 – Conectando-se a uma API Web

Nesta etapa, vamos ver como integrar dados externos a partir de uma API web para exibir **Pontos de Interesse (POIs)** em um ambiente de Realidade Aumentada.  
Não há novos conceitos específicos de AR.js aqui, mas sim como trabalhar com dados dinâmicos.

---

## Passo a passo

### 1. Configuração inicial
Importe as bibliotecas e configure a câmera, renderizador e cena:

```javascript
import * as THREE from 'three';
import * as LocAR from 'locar';

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
document.body.appendChild(renderer.domElement);

// Ajustar ao redimensionar
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
````

---

### 2. Inicializar LocAR.js e câmera

```javascript
const locar = new LocAR.LocationBased(scene, camera);
const deviceControls = new LocAR.DeviceOrientationControls(camera);

const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
});
```

---

### 3. Buscar dados de POIs via API

```javascript
let firstPosition = true;
const indexedObjects = {};
const cube = new THREE.BoxGeometry(20, 20, 20);

locar.on("gpsupdate", async (pos, distMoved) => {
    if (firstPosition || distMoved > 100) {
        const url = `https://hikar.org/webapp/map?bbox=${pos.coords.longitude-0.02},${pos.coords.latitude-0.02},${pos.coords.longitude+0.02},${pos.coords.latitude+0.02}&layers=poi&outProj=4326`;
        
        const response = await fetch(url);
        const pois = await response.json();

        pois.features.forEach(poi => {
            if (!indexedObjects[poi.properties.osm_id]) {
                const mesh = new THREE.Mesh(
                    cube,
                    new THREE.MeshBasicMaterial({ color: 0xff0000 })
                );

                locar.add(
                    mesh,
                    poi.geometry.coordinates[0],
                    poi.geometry.coordinates[1]
                );

                indexedObjects[poi.properties.osm_id] = mesh;
            }
        });

        firstPosition = false;
    }
});
```

 **O que acontece aqui:**

* **`gpsupdate`**: evento disparado quando o GPS atualiza.
* **API Hikar.org**: retorna dados do OpenStreetMap no formato **GeoJSON** (somente Europa e Turquia).
* **Controle de requisições**: `firstPosition` impede downloads a cada atualização.

---

### 4. Iniciar GPS e animação

```javascript
locar.startGps();

renderer.setAnimationLoop(animate);
function animate() {
    deviceControls.update();
    renderer.render(scene, camera);
}
```

---

## Detectando cliques com Raycasting

Para interagir com os objetos AR, podemos usar **raycasting**.
O LocAR.js já fornece a classe `ClickHandler` para simplificar isso.

### 1. Criar o ClickHandler

```javascript
const clickHandler = new LocAR.ClickHandler(renderer);
```

---

### 2. Adicionar propriedades extras ao objeto

```javascript
locar.add(
    mesh,
    poi.geometry.coordinates[0],
    poi.geometry.coordinates[1],
    0, // elevação
    poi.properties // informações do POI
);
```

---

### 3. Detectar cliques no loop de animação

```javascript
function animate() {
    cam.update();
    deviceControls.update();

    const objects = clickHandler.raycast(camera, scene);
    if (objects.length) {
        alert(`Você clicou em: ${objects[0].object.properties.name}`);
    }

    renderer.render(scene, camera);
}
```

 **Dicas:**

* `raycast(camera, scene)` retorna um array de objetos clicados.
* O índice `0` é o mais próximo da câmera.
* As propriedades do POI estão em `object.properties`.

---

## ✅ Resumo

* **`gpsupdate`**: busca dados da API com base na posição.
* **`ClickHandler`**: permite interagir com objetos usando raycasting.
* **GeoJSON**: formato padrão para dados geográficos.

---

 **Próximos passos:**

* Implementar carregamento por *tiles* para otimizar buscas.
* Adicionar elevação real usando um **Modelo Digital de Elevação**.
