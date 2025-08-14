# LocAR.js - Desenvolva um App Simples de Pontos de Interesse

![LocAR.js](https://img.shields.io/badge/LocAR.js-v0.0.2-blue) ![Three.js](https://img.shields.io/badge/Three.js-v0.169.0-green) ![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange)

> **Realidade Aumentada baseada em localização de forma simples e poderosa**

O **LocAR.js** é a nova API baseada em localização para AR.js, ainda em desenvolvimento inicial, que permite criar experiências de Realidade Aumentada utilizando coordenadas GPS reais. Esta série de tutoriais te guiará desde conceitos básicos até a criação de um aplicativo funcional de **Pontos de Interesse** conectado a APIs web em tempo real.

---

##  **O que você vai construir**

Ao final desta série de tutoriais, você terá criado:

- ✅ **App AR básico** com objetos posicionados geograficamente
- ✅ **Sistema de GPS real** com orientação do dispositivo
- ✅ **App de Pontos de Interesse** consumindo APIs web
- ✅ **Interface responsiva** para dispositivos móveis
- ✅ **Sistema de calibração** de sensores

---

##  **Pré-requisitos**

### **Conhecimento Técnico Mínimo**

- **Three.js Básico**: Scene, Camera, Renderer, Geometries, Materials
  -  Recomendado: [Tutorial "Criando uma cena" do Three.js](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene)
  - ⚠️ **Nota**: Atualmente há problemas de formatação no Firefox com amostras de código-fonte

- **Vite e Build Tools**: Conceitos básicos de bundling e desenvolvimento
  -  Consulte: [Documentação do Vite](https://vitejs.dev/)

### **Compatibilidade de Navegadores**

| Plataforma | Navegador | Status | Observações |
|------------|-----------|--------|-------------|
|  **Android** | Chrome | ✅ **Recomendado** | Suporte completo a orientação |
|  **iOS** | Safari |  **Limitado** | Funciona mas com limitações |
|  **Android** | Firefox | ❌ **Não recomendado** | Limitações na API de orientação |
|  **Desktop** | Qualquer | ✅ **Suportado** | Para desenvolvimento e testes |

⚠️ **Importante**: Para melhor experiência em dispositivos móveis, use **Chrome no Android**.

---

## ⚡ **Instalação e Configuração**

### **1. Configuração do Projeto**

Crie o arquivo `package.json` na raiz do seu projeto:

```json
{
  "name": "meu-app-locar",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "three": "^0.169.0",
    "locar": "^0.0.2"
  },
  "devDependencies": {
    "vite": "^5.4.8"
  },
  "scripts": {
    "dev": "vite dev --host",
    "build": "vite build",
    "preview": "vite preview --host"
  }
}
```

### **2. Estrutura de Arquivos**

```
meu-projeto-locar/
├── index.html          # Página principal (na raiz!)
├── package.json        # Configurações do projeto
├── vite.config.js      # Configurações do Vite (opcional)
├── src/
│   ├── main.js         # Código JavaScript principal
│   ├── styles.css      # Estilos personalizados (opcional)
│   └── utils/          # Utilitários (opcional)
└── dist/               # Build de produção (gerado automaticamente)
```

### **3. Comandos de Desenvolvimento**

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (com live reload)
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

** Live Development:**
- Servidor local em `http://localhost:5173`
- Alterações aparecem instantaneamente
- Hot Module Replacement (HMR) ativado

---

##  **Série de Tutoriais**

### ** [Parte 1: Hello World](parte-1-hello-world.md)**
**Fundamentos do LocAR.js**

**O que você aprenderá:**
- ✅ Configuração básica Three.js + LocAR.js
- ✅ Posicionamento geográfico de objetos 3D
- ✅ GPS simulado para desenvolvimento
- ✅ Integração com webcam
- ✅ Controles de mouse para desktop

**Conceitos-chave:**
- `LocAR.LocationBased` - Gerenciamento de localização
- `LocAR.Webcam` - Configuração de câmera
- `fakeGps()` - GPS simulado para testes
- Sistema de coordenadas geográficas

---

### ** [Parte 2: GPS Real e Orientação](parte-2-gps-orientacao.md)**
**Localização Real e Sensores do Dispositivo**

**O que você aprenderá:**
- ✅ Substituir GPS simulado por localização real
- ✅ Controles de orientação do dispositivo
- ✅ Compatibilidade entre navegadores
- ✅ Sistema de calibração com 4 direções cardeais
- ✅ Debugging de sensores

**Conceitos-chave:**
- `startGps()` - GPS real
- `DeviceOrientationControls` - Orientação do dispositivo
- Eventos `gpsupdate` - Monitoramento de localização
- Calibração de sensores magnéticos

---

### ** [Parte 3: Pontos de Interesse](parte-3-pontos-interesse.md)** *(Em desenvolvimento)*
**App Completo com API Web**

**O que você vai construir:**
- ✅ Consumo de APIs de Pontos de Interesse
- ✅ Interface de usuário responsiva
- ✅ Sistema de filtragem de POIs
- ✅ Interação com objetos AR
- ✅ Otimização de performance

---

## ️ **Configuração Avançada do Vite**

Para projetos mais complexos, crie um `vite.config.js`:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  // Configuração para desenvolvimento
  server: {
    host: true,        // Permite acesso via rede local
    port: 5173,        // Porta customizada
    https: false,      // HTTPS necessário para GPS em produção
  },
  
  // Configuração para build
  build: {
    outDir: 'dist',
    sourcemap: true,   // Source maps para debugging
    minify: 'esbuild', // Minificação rápida
  },
  
  // Configuração de imports
  resolve: {
    alias: {
      '@': '/src',     // Alias para imports
    }
  },
  
  // Otimizações específicas para Three.js
  optimizeDeps: {
    include: ['three', 'locar']
  }
});
```

---

##  **Troubleshooting Comum**

### **❌ GPS não funciona**
**Soluções:**
- Use HTTPS em produção (`https://` obrigatório para geolocalização)
- Verifique permissões do navegador
- Teste em ambiente externo com boa recepção

### **❌ Webcam não inicializa**
**Soluções:**
- Permissões de câmera concedidas
- Navegador compatível com WebRTC
- HTTPS em produção

### **❌ Orientação incorreta/instável**
**Soluções:**
- Use Chrome no Android (melhor compatibilidade)
- Calibre a bússola do dispositivo
- Evite interferências magnéticas

### **❌ Objetos não aparecem**
**Soluções:**
- Verifique coordenadas (não muito distantes)
- Confirme que está "olhando" na direção certa
- Use console.log para debug de posições

---

##  **Deploy e Produção**

### **Build de Produção**
```bash
npm run build
```

### **Configurações Importantes para Produção**

1. **HTTPS Obrigatório**: APIs de geolocalização requerem conexão segura
2. **Permissões**: Configure headers apropriados para câmera e localização
3. **Performance**: Otimize texturas e geometrias para dispositivos móveis
4. **Compatibilidade**: Teste em diferentes dispositivos e navegadores

### **Exemplo de Deploy (Vercel)**
```json
{
  "functions": {
    "app/api/**/*.js": {
      "runtime": "@vercel/node"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

##  **Roadmap de Desenvolvimento**

### **Versão Atual (0.0.2)**
- ✅ GPS básico e orientação
- ✅ Integração Three.js
- ✅ Webcam support

### **Próximas Versões**
-  **v0.1.0**: API de Pontos de Interesse
-  **v0.2.0**: Melhor compatibilidade iOS
-  **v0.3.0**: Ferramentas de calibração
-  **v1.0.0**: API estável e documentação completa

---

##  **Contribuição**

O LocAR.js está em desenvolvimento ativo e aceita contribuições:

-  **Bug Reports**: [GitHub Issues](https://github.com/nickw1/locar/issues)
-  **Feature Requests**: Discussões na comunidade
-  **Documentação**: Melhorias e exemplos
-  **Código**: Pull requests bem-vindos

---

##  **Licença**

Este projeto está licenciado sob [MIT License](LICENSE).

---

##  **Suporte**

-  **Documentação**: Tutoriais neste repositório
-  **Issues**: [GitHub Issues](https://github.com/nickw1/locar/issues)  
-  **Comunidade**: Discussões no GitHub
-  **Contato**: Para questões específicas do projeto

---

## ⭐ **Agradecimentos**

- **Three.js Community** - Base sólida para renderização 3D
- **AR.js Team** - Pioneiros em Web AR
- **Vite Team** - Ferramenta de desenvolvimento incrível

---

** Comece agora!** 

Siga para a **[Parte 1: Hello World](parte-1-hello-world.md)** e crie sua primeira experiência de AR baseada em localização!