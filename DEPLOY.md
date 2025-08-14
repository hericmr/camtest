# 🚀 Guia de Deploy - AR.js Hello World

## 📋 **Status do Deploy**

✅ **Deploy concluído com sucesso!**
- **Data**: 14 de Agosto de 2024
- **Versão**: 1.0.0
- **Status**: Produção

## 🎯 **Resumo do Projeto**

**AR.js Hello World** - Aplicação de realidade aumentada baseada em localização usando:
- **AR.js** - Biblioteca para AR baseada em localização
- **A-Frame** - Framework para realidade virtual/aumentada
- **Vite** - Build tool para desenvolvimento rápido

## 📍 **Localizações Configuradas**

- **👤 Usuário**: `-23.978824, -46.316374` (São Paulo, Brasil)
- **🎲 Objeto AR**: `-23.978687, -46.316649` (Caixa vermelha)
- **📏 Distância**: Aproximadamente 30m entre usuário e objeto

## 🔧 **Como Fazer Deploy**

### **1. Deploy Automático (Recomendado)**
```bash
# Usando npm script
npm run deploy

# Ou diretamente
./deploy.sh
```

### **2. Deploy no GitHub Pages**
```bash
npm run deploy:gh-pages
```

### **2. Deploy Manual**
```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Commit das mudanças
git add -A
git commit -m "🚀 Deploy: AR.js Hello World atualizado"

# Push para GitHub
git push origin main
```

## 📁 **Estrutura do Build**

```
dist/
├── index.html              # Página principal otimizada
└── assets/
    ├── index-*.js         # JavaScript otimizado
    └── index-*.js.map     # Source maps para debug
```

## 🌐 **URLs de Acesso**

### **Desenvolvimento**
- **Local**: `http://localhost:5175`
- **Comando**: `npm run dev`

### **Produção**
- **Pasta**: `dist/`
- **Servidor**: Qualquer servidor web estático

### **GitHub Pages**
- **URL**: `https://[seu-usuario].github.io/[seu-repositorio]`
- **Comando**: `npm run deploy:gh-pages`
- **Branch**: `gh-pages` (criado automaticamente)

## 📱 **Funcionalidades**

- **📍 Localização fake**: Usuário posicionado em São Paulo
- **🎲 Objeto 3D**: Caixa vermelha na nova localização
- **📱 Suporte mobile**: GPS real em dispositivos móveis
- **🖱️ Controles desktop**: Mouse para simular rotação
- **📹 Webcam**: Feed da câmera como fundo AR

## 🚀 **Comandos Úteis**

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Deploy completo
npm run deploy
# ou
./deploy.sh

# Deploy no GitHub Pages
npm run deploy:gh-pages
```

## 🔍 **Verificação do Deploy**

### **1. Build bem-sucedido**
```bash
npm run build
# ✓ 5 modules transformed
# ✓ built in 84ms
```

### **2. Pasta dist criada**
```bash
ls -la dist/
# index.html + assets/
```

### **3. Git atualizado**
```bash
git status
# Your branch is up to date with 'origin/main'
```

### **4. GitHub sincronizado**
```bash
git push origin main
# Everything up-to-date
```

## 📊 **Métricas do Build**

- **Tamanho total**: ~4.7 kB (gzipped)
- **JavaScript**: 2.81 kB (gzipped)
- **HTML**: 1.86 kB (gzipped)
- **Tempo de build**: ~84ms

## 🌟 **Próximos Passos**

Após o deploy bem-sucedido, você pode:
- **Testar** em dispositivos móveis com GPS
- **Personalizar** objetos AR e localizações
- **Adicionar** interatividade e animações
- **Expandir** para múltiplos objetos
- **Integrar** com APIs de localização real

## 🌐 **Configuração do GitHub Pages**

### **1. Primeira Configuração**
```bash
# Execute o deploy no GitHub Pages
npm run deploy:gh-pages
```

### **2. Configuração no GitHub**
1. Vá para **Settings** do seu repositório
2. Role até **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Selecione a branch **gh-pages**
5. Clique **Save**

### **3. URLs de Acesso**
- **Repositório**: `https://github.com/[usuario]/[repositorio]`
- **GitHub Pages**: `https://[usuario].github.io/[repositorio]`
- **Branch gh-pages**: Criada automaticamente pelo gh-pages

## 📞 **Suporte**

Se houver problemas com o deploy:
1. Verifique se o Node.js está instalado
2. Execute `npm install` para reinstalar dependências
3. Verifique se há erros no console
4. Use `./deploy.sh` para deploy automático

---

**🎉 Deploy concluído com sucesso!**

O projeto AR.js Hello World está pronto para uso em produção!
