# 🎯 AR.js - Hello World

Um projeto básico de realidade aumentada baseada em localização usando **AR.js** e **A-Frame**.

## 🚀 **O que é?**

Este é um exemplo "Hello World" que demonstra como criar uma aplicação AR básica usando:
- **AR.js** - Biblioteca para AR baseada em localização
- **A-Frame** - Framework para realidade virtual/aumentada
- **Vite** - Build tool para desenvolvimento rápido

## 🎮 **Funcionalidades**

- **📍 Localização fake**: Usuário posicionado em `-23.978824, -46.316374`
- **🎲 Objeto 3D**: Caixa vermelha posicionada a 10m ao norte
- **📱 Suporte mobile**: Funciona em dispositivos com GPS
- **🖱️ Controles desktop**: Clique e arraste para rotacionar a câmera
- **📹 Webcam**: Feed da câmera como fundo da experiência AR

## 🛠️ **Tecnologias**

- **AR.js** - AR baseada em localização
- **A-Frame** v1.4.2 - Framework para realidade virtual/aumentada
- **Three.js** v0.158.0 - Renderização 3D (usado pelo A-Frame)
- **Vite** v5.0.0 - Build tool e dev server

## 📁 **Estrutura do Projeto**

```
locar-hello-world/
├── index.html          # Página principal
├── src/
│   └── main.js        # Código JavaScript principal
├── package.json        # Dependências e scripts
└── README.md          # Este arquivo
```

## 🚀 **Como Executar**

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Executar em Modo Desenvolvimento**
```bash
npm run dev
```

### 3. **Acessar no Navegador**
Abra `http://localhost:5173` no seu navegador

## 📱 **Como Usar**

### **Desktop:**
- Clique e arraste o mouse para rotacionar a câmera
- A caixa vermelha aparecerá a 10m ao norte da sua posição

### **Mobile:**
- Use em dispositivo com GPS ativo
- Gire o dispositivo para navegar
- A caixa aparecerá baseada na sua localização real

## 🎯 **Localizações**

- **👤 Usuário**: `-23.978824, -46.316374` (São Paulo, Brasil)
- **🎲 Caixa Vermelha**: `-23.978687, -46.316649` (aproximadamente 30m de distância)
- **🧭 Direção**: Norte (padrão)

## 🔧 **Desenvolvimento**

### **Build para Produção**
```bash
npm run build
```

### **Preview da Build**
```bash
npm run preview
```

## 📚 **Recursos de Aprendizado**

- [AR.js Documentation](https://ar-js-org.github.io/AR.js/)
- [A-Frame Documentation](https://aframe.io/docs/)
- [Three.js Manual](https://threejs.org/manual/)
- [Vite Documentation](https://vitejs.dev/)

## 🌟 **Próximos Passos**

Este é apenas o começo! Você pode expandir para:
- Múltiplos objetos AR
- Interatividade com objetos
- Animações e efeitos
- Integração com GPS real
- Modelos 3D personalizados

## 📄 **Licença**

MIT License - Sinta-se livre para usar e modificar!

---

**🎉 Divirta-se explorando o mundo da Realidade Aumentada!**
