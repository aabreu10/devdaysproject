# Execution Guide

Esta guía explica cómo ejecutar, probar y reproducir las funcionalidades del proyecto DevDays.

## Prerrequisitos

- **Node.js**: v18 o superior.
- **Docker & Docker Compose**: Recomendado para ejecutar la base de datos y la aplicación conjuntamente.
- **MongoDB**: Si se ejecuta localmente sin Docker.
- **Git**: Para clonar el repositorio.

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/aabreu10/devdaysproject.git
   cd devdaysproject
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configuración de variables de entorno**:
   Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example` si existe) con las siguientes variables:
   ```env
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/devdays
   # Claves API opcionales para servicios de IA
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=...
   ```

## Ejecución

### Opción A: Ejecución Local con Node.js

1. Asegúrate de tener una instancia de MongoDB corriendo localmente o actualiza `MONGO_URI` en el `.env`.
2. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   El servidor iniciará en `http://localhost:3001` (o el puerto configurado).

### Opción B: Ejecución con Docker Compose

1. Desde la carpeta `infrastructure` o la raíz (según dónde esté el archivo compose):
   ```bash
   docker-compose -f infrastructure/docker-compose-local.yml up --build
   ```
   Esto levantará tanto la base de datos MongoDB como la aplicación Node.js.

## Guía de Uso y Reproducción

### 1. Dashboard Principal (Repo Audit)
1. Abre tu navegador en `http://localhost:3001/index.html`.
2. Verás el "Audit Dashboard".
3. **Sincronizar Issues**: Introduce un Owner (ej. `glzr-io`) y Repo (ej. `glazewm`) y pulsa "Sync Issues" (requiere que el backend tenga configurada la conexión a GitHub o use datos simulados).
4. **Ejecutar Auditoría**: Pulsa "Run Audit". El sistema analizará las issues cargadas buscando la palabra "bug" en el título.
5. Los gráficos de "Compliance Rate" y "Bug Ratio History" se actualizarán.

### 2. Auditoría Meteorológica (Weather Audit)
Esta es la funcionalidad clave del entregable **N2-P2-A**.

1. Navega a `http://localhost:3001/weather-audit.html` usando el menú lateral.
2. **Formulario de Configuración**:
   - **City**: Nombre de la ciudad (meramente informativo).
   - **Latitude/Longitude**: Coordenadas geográficas (ej. Sevilla: 37.3891, -5.9845).
   - **Threshold**: Umbral de temperatura (ej. 18 °C).
   - **Operator**: Condición a cumplir (ej. `>`).
   - **Weeks**: Número de semanas hacia atrás a analizar.
3. Pulsa **"Run Audit"**.
4. **Resultados**:
   - Se mostrará un **Gráfico de Líneas** con la temperatura promedio semanal vs el umbral.
   - Se mostrará un **Gráfico de Donut** con el porcentaje de cumplimiento (semanas que pasaron la validación).
   - Una tabla inferior "Weather Audit History" registrará esta ejecución.

### 3. Documentación API
- Accede a `http://localhost:3001/docs` para ver la interfaz Swagger UI con todos los endpoints disponibles.

## Comandos Útiles

- `npm run dev`: Ejecuta el servidor con reinicio automático (watch mode).
- `git pull origin main`: Recibir últimas actualizaciones del repositorio.
