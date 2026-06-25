# Tlaolli-gua 🇳🇮

Tlaolli-gua es un portal web interactivo que exhibe la gastronomía típica de cada departamento de Nicaragua a través de un mapa dinámico vectorial. Está construido usando React y empaquetado con Vite bajo un modelo Jamstack y Single-Page Application (SPA).

## 🗂️ Estructura del Proyecto

El proyecto tiene una estructura puramente Frontend, sin requerir de una base de datos en tiempo real:

```text
📦 project/
 ┣ 📂 public/
 ┃ ┣ 📂 assets/       # Imágenes, iconos e ilustraciones de la interfaz
 ┃ ┗ 📂 data/         # nicaragua_gastronomy.json (Nuestra "base de datos" estática)
 ┣ 📂 src/
 ┃ ┣ 📂 components/   # Componentes modulares de React (ej. NicaraguaMap.jsx)
 ┃ ┣ 📂 data/         # mapVectors.js (Instrucciones matemáticas para el trazado SVG)
 ┃ ┣ 📜 App.jsx       # Orquestador del diseño Bento Grid y del estado global de la app
 ┃ ┣ 📜 App.css       # Estilos del layout de cajas y animaciones estructurales
 ┃ ┣ 📜 index.css     # Design Tokens, paleta HSL y efecto Glassmorphism general
 ┃ ┗ 📜 main.jsx      # Punto de entrada y montaje de React
 ┣ 📜 package.json    # Manifiesto de dependencias y scripts de terminal
 ┗ 📜 vite.config.js  # Configuración del entorno de desarrollo de Vite
```

## ⚙️ Instalación

Para ejecutar este proyecto de forma local en tu computadora, asegúrate de tener [Node.js](https://nodejs.org/) instalado. Luego, abre la terminal, ubícate en la carpeta del proyecto y descarga los paquetes de software requeridos:

```bash
# 1. Instalar todas las dependencias
npm install
```

## 🚀 Correr Localmente (Desarrollo)

Para iniciar el servidor de desarrollo local con recarga en caliente (Hot Module Replacement), ejecuta el siguiente comando:

```bash
npm run dev
```

El proyecto estará disponible por defecto en `http://localhost:5173`. Si realizas cualquier modificación en el código dentro de la carpeta `src/`, tu navegador reflejará los cambios instantáneamente sin recargar.

## 📦 Compilar para Producción

Cuando hayas finalizado tus pruebas y el código esté listo para el usuario final, debes compilar el proyecto. Esto toma tu código en React, lo comprime, minimiza su peso y lo prepara para ser servido por navegadores web rápidamente.

```bash
# Compilar, empaquetar y optimizar
npm run build
```

El resultado final se depositará automáticamente en una nueva carpeta llamada `dist/`. ¡Este es el único directorio que importa subir al internet público!

*(Opcional)* Puedes previsualizar exactamente cómo funcionará esa versión empaquetada ejecutando:
```bash
npm run preview
```

## 🌐 Proceso de Publicación (Despliegue)

Al ser una aplicación 100% de archivos estáticos (JS, CSS, HTML procesados por Vite), Tlaolli-gua puede ser alojado en cualquier plataforma moderna y de alto rendimiento (Hosting Estático CDNs) como **Cloudflare Pages**, **Vercel** o **Netlify**.

**Automatización de Despliegues (Flujo CI/CD):**
1. Asegúrate de que tus últimos cambios en el código (sin la carpeta `node_modules` ni `dist`) estén alojados en la rama principal de tu repositorio de **GitHub**.
2. En Cloudflare Pages (o similar), crea un nuevo proyecto apuntando a ese repositorio.
3. En la configuración de construcción *(Build Settings)*, llena los datos de la siguiente manera:
   - **Framework Preset**: Selecciona `Vite` o `React`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Guarda y despliega. El servidor en la nube hará el proceso de compilación de forma remota y publicará automáticamente tu proyecto. A partir de este momento, **cada nuevo `git push` a tu rama principal actualizará automáticamente tu sitio en vivo en cuestión de segundos**.

## 👥 Sobre Nosotros (Créditos)

Esta app web fue creada por el grupo de estudiantes de 11vo grado, de la escuela **Una Cita Con Dios**.

**Integrantes:**
- Lindsay
- Kate
- Brisa
- Lucila
- Rosa
- Jouset
- Keydi

**Apoyo Técnico:**
- Roberto Zepeda
