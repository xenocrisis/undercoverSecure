#!/bin/bash

echo "🔍 Verificando si Node.js está instalado..."
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js está instalado: $(node -v)"
echo "📦 Instalando dependencias con npm..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ Error al instalar dependencias. Abortando."
  exit 1
fi

echo "🚀 Iniciando la aplicación..."
npm run start
