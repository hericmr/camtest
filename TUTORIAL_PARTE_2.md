# AR.js baseado em Localização com LocAR.js
## Parte 2 - Usando GPS e Orientação do Dispositivo

### Introdução

Neste segundo tutorial da série, vamos evoluir do uso de localização simulada para implementar **localização GPS real** e **controles de orientação do dispositivo**. Isso permitirá criar experiências de Realidade Aumentada verdadeiramente imersivas, onde objetos virtuais aparecem em posições geográficas específicas e respondem aos movimentos do dispositivo.

**Pré-requisitos:**
- Conclusão da Parte 1 deste tutorial
- Dispositivo móvel com GPS e sensores de orientação
- Navegador compatível (recomendado: Chrome no Android)
- Conexão HTTPS (necessária para APIs de geolocalização)

---

### 🌍 Implementando Rastreamento GPS Real

Na Parte 1, utilizamos a função `fakeGps()` para simular localização. Agora vamos trabalhar com coordenadas GPS reais.

#### Código Base com GPS Real

```javascript
import * as THREE from 'three';
import * as LocAR from 'locar';

// Configuração da cena Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.001, 
    100
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Responsividade para redimensionamento da tela
window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;    
    camera.updateProjectionMatrix();
});

// Criação do objeto 3D (cubo vermelho)
const box = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(
    box, 
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

// Inicialização do LocAR
const locar = new LocAR.LocationBased(scene, camera);

// Configuração da webcam
const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
});

// ✨ A mudança principal: usar GPS real
locar.startGps();

// Adicionar objeto em coordenadas reais (exemplo: Londres)
locar.add(cube, -0.72, 51.0501);

// Loop de renderização
renderer.setAnimationLoop(animate);

function animate() {
    renderer.render(scene, camera);
}
```

#### O que Mudou?

A única alteração necessária foi substituir:
```javascript
// Versão anterior (Parte 1)
locar.fakeGps();
```

Por:
```javascript
// Nova versão (GPS real)
locar.startGps();
```

#### Como Funciona Internamente?

Quando `startGps()` é chamado, o LocAR.js:

1. **Solicita permissão** para acessar a geolocalização do dispositivo
2. **Monitora continuamente** as atualizações de GPS usando a API de Geolocalização
3. **Converte coordenadas** de latitude/longitude para o sistema de coordenadas Mercator Esférico
4. **Inverte o eixo Z** para compatibilidade com OpenGL
5. **Atualiza automaticamente** as coordenadas X e Z da câmera conforme a posição muda

---

### 🧭 Controles de Orientação do Dispositivo

Para uma experiência de AR verdadeiramente realista, precisamos que os objetos apareçam apenas quando o dispositivo está orientado na direção correta.

#### Implementação Completa com Orientação

```javascript
import * as THREE from 'three';
import * as LocAR from 'locar';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.001, 
    100
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;    
    camera.updateProjectionMatrix();
});

const box = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(
    box, 
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

const locar = new LocAR.LocationBased(scene, camera);
const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
});

// ✨ Criação do controlador de orientação
const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

locar.startGps();
locar.add(cube, -0.72, 51.0501);

renderer.setAnimationLoop(animate);

function animate() {
    // ✨ Atualização essencial dos controles de orientação
    deviceOrientationControls.update();
    
    renderer.render(scene, camera);
}
```

#### Componentes-Chave da Orientação

1. **Inicialização do Controlador:**
   ```javascript
   const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);
   ```
   - Conecta os sensores do dispositivo à câmera Three.js
   - Baseado no `DeviceOrientationControls` original do Three.js, mas otimizado para orientação absoluta

2. **Atualização Contínua:**
   ```javascript
   deviceOrientationControls.update();
   ```
   - Deve ser chamado em cada frame do loop de renderização
   - Aplica as últimas leituras dos sensores à orientação da câmera

---

### ⚠️ Compatibilidade de Navegadores

**Limitações Importantes:**

| Navegador/OS | Suporte | Observações |
|-------------|---------|-------------|
| Chrome/Android | ✅ **Recomendado** | Suporte completo via `deviceorientationabsolute` event |
| Safari/iOS | 🔄 **Em desenvolvimento** | Possível via `webkitCompassHeading` (não implementado) |
| Firefox | ❌ **Não suportado** | Ausência de APIs de orientação absoluta |
| Chrome/iOS | 🤔 **Não testado** | Pode funcionar, necessário teste |

**Por que essas limitações existem?**

A orientação absoluta (relativa ao norte magnético) é complexa e requer APIs específicas que não são padronizadas entre navegadores. O LocAR.js foi modificado para usar o evento `deviceorientationabsolute` disponível no Chrome/Android.

---

### 🧪 Testando a Implementação

#### Requisitos para Teste

1. **Dispositivo móvel** com GPS e sensores de orientação
2. **Conexão HTTPS** (obrigatória para geolocalização)
3. **Permissões concedidas** para localização e sensores de movimento
4. **Coordenadas adequadas** - certifique-se de que o objeto não está muito distante

#### Exemplo de Teste Prático

```javascript
// Para teste, use coordenadas próximas à sua localização
// Exemplo: 0.001 graus ≈ 111 metros
const myLongitude = -46.6333; // São Paulo (exemplo)
const myLatitude = -23.5505;

locar.add(cube, myLongitude + 0.001, myLatitude); // ~111m a leste
```

#### O que Esperar

- **Sem orientação:** O cubo aparece independente da direção do dispositivo
- **Com orientação:** O cubo só aparece quando você aponta o dispositivo na direção correta
- **Com GPS real:** A posição do objeto se ajusta conforme você se move

---

### 🎯 Sistema de Calibração: Quatro Direções Cardeais

Para verificar se os sensores do dispositivo estão calibrados corretamente, implementamos um sistema que adiciona cubos nas quatro direções cardeais.

#### Implementação do Sistema de Calibração

```javascript
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
```

#### Como Interpretar os Resultados

**Calibração Correta:**
- 🔴 **Cubo Vermelho** aparece quando você aponta para o **Norte**
- 🟡 **Cubo Amarelo** aparece quando você aponta para o **Sul**  
- 🔵 **Cubo Ciano** aparece quando você aponta para o **Oeste**
- 🟢 **Cubo Verde** aparece quando você aponta para o **Leste**

**Problemas de Calibração:**
- Cubos aparecem em direções incorretas
- Objetos "flutuam" ou se movem inesperadamente
- Orientação não corresponde à bússola real

#### Dicas para Melhor Calibração

1. **Calibre a bússola** do dispositivo antes de usar (configurações do sistema)
2. **Afaste-se de interferências** magnéticas (metal, eletrônicos)
3. **Teste em ambiente aberto** para melhor sinal GPS
4. **Mova-se cerca de 10-15 metros** da posição inicial para ver diferenças

---

### 🔧 Troubleshooting Comum

#### Problema: GPS não funciona
**Soluções:**
- Verifique se está usando HTTPS
- Confirme permissões de geolocalização no navegador
- Teste em ambiente externo com boa recepção GPS

#### Problema: Orientação incorreta
**Soluções:**
- Use Chrome no Android (melhor suporte)
- Calibre a bússola do dispositivo
- Afaste-se de interferências magnéticas

#### Problema: Objetos não aparecem
**Soluções:**
- Verifique se as coordenadas estão próximas à sua localização
- Ajuste a distância dos objetos (use coordenadas menores para teste)
- Confirme se `deviceOrientationControls.update()` está sendo chamado

---

### 🚀 Próximos Passos

Com GPS real e orientação implementados, você pode:

1. **Criar tours virtuais** baseados em localização
2. **Implementar jogos de AR** com elementos no mundo real  
3. **Desenvolver aplicações educativas** com pontos de interesse
4. **Construir sistemas de navegação** aumentada

**Na Parte 3 (próximo tutorial), abordaremos:**
- Otimização de performance para múltiplos objetos
- Implementação de interações com objetos AR
- Técnicas avançadas de posicionamento
- Integração com APIs de mapas

---

### 📚 Recursos Adicionais

- [Documentação oficial LocAR.js](https://github.com/nickw1/locar)
- [API de Geolocalização MDN](https://developer.mozilla.org/docs/Web/API/Geolocation_API)
- [Device Orientation API](https://developer.mozilla.org/docs/Web/API/DeviceOrientationEvent)
- [Tabela de compatibilidade para orientação absoluta](https://caniuse.com/?search=deviceorientation)
