#!/bin/bash

echo "🚀 Iniciando deploy do projeto AR.js Hello World..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Instale o Node.js primeiro."
    exit 1
fi

# Verifica se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instala dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Faz o build de produção
echo "🔨 Fazendo build de produção..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi

echo "✅ Build concluído com sucesso"

# Verifica se a pasta dist foi criada
if [ ! -d "dist" ]; then
    echo "❌ Pasta dist não foi criada"
    exit 1
fi

echo "📁 Pasta dist criada:"
ls -la dist/

# Faz commit das mudanças (se houver)
echo "📝 Verificando mudanças no Git..."
git add -A
git status

if git diff --staged --quiet; then
    echo "ℹ️ Nenhuma mudança para commitar"
else
    echo "📝 Fazendo commit das mudanças..."
    git commit -m "🚀 Deploy: AR.js Hello World atualizado"
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit realizado com sucesso"
        
        # Faz push para o GitHub
        echo "📤 Fazendo push para o GitHub..."
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Push realizado com sucesso"
        else
            echo "❌ Erro no push"
            exit 1
        fi
    else
        echo "❌ Erro no commit"
        exit 1
    fi
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Resumo do deploy:"
echo "   • Dependências: ✅ Instaladas"
echo "   • Build: ✅ Concluído"
echo "   • Git: ✅ Atualizado"
echo "   • GitHub: ✅ Sincronizado"
echo ""
echo "🌐 Para fazer deploy no GitHub Pages:"
echo "   npm run deploy:gh-pages"
echo ""
echo "🌐 Para testar localmente:"
echo "   npm run dev"
echo ""
echo "📱 Para produção, use a pasta dist/"
echo "   Acesse: http://localhost:5175"
echo ""
echo "🚀 Projeto AR.js Hello World pronto para uso!"
