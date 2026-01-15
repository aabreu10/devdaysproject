# DELIVERABLES

Lista de entregables resueltos en el proyecto DevDays.

## NIVEL 0

### N0-1: Proyecto Node.js base
- **Estado**: ✅ Resuelto
- **Implementación**: Estructura de proyecto modular (`src/controllers`, `src/services`, `src/routes`, `src/models`) utilizando Express y Mongoose.

## NIVEL 1

### N1-1: Recursividad (Paginación GitHub)
- **Estado**: ✅ Resuelto
- **Implementación**: Función recursiva `fetchGithubPaginatedData` en [src/services/issue.service.js](src/services/issue.service.js) que recupera todas las páginas de issues de la API de GitHub hasta completar la colección.

### N1-2: Telemetría (Métricas personalizadas)
- **Estado**: ✅ Resuelto
- **Implementación**: 
    - **Gauge**: `github_issue_freshness_seconds` en [src/controllers/issue.controller.js](src/controllers/issue.controller.js) que mide el tiempo desde la última sincronización.

### N1-3: Inteligencia Artificial
- **Estado**: ✅ Resuelto
- **Implementación**: Integración modular de proveedores en servicios dedicados:
    - `gemini.service.js` (Google Generative AI)
    - `ollama.service.js`
    - `openai.service.js`

### N1-4: Frontend (Visualización Base)
- **Estado**: ✅ Resuelto
- **Implementación**: Servidor de archivos estáticos configurado en `app.js` sirviendo el contenido de [src/public](src/public). Incluye `index.html` y dashboards básicos.

## NIVEL 2 (PROPUESTA 2)

### N2-P2-A: Auditoría Meteorológica
- **Estado**: ✅ Resuelto
- **Implementación**: 
    - Servicio `weather.service.js` que consume la API de OpenMeteo.
    - Calcula promedios semanales (`calculateWeeklyAverages`) y verifica umbrales (`verifyThreshold`).
    - Almacenamiento de resultados en MongoDB (`audit.model.js`).
    - Controlador `auditWeather` en `audit.controller.js`.

### N2-P2-C: Telemetría (API Weather)
- **Estado**: ✅ Resuelto
- **Implementación**: 
    - Instrumentación explícita en [src/services/weather.service.js](src/services/weather.service.js) usando `metrics.createHistogram`.
    - Métrica `weather_api_duration` que registra la latencia exacta de las llamadas a OpenMeteo, incluyendo etiquetas como la ciudad consultada y si hubo error.
    - Complementado con la instrumentación automática HTTP en `otel.js`.

## NIVEL 2 (RETOS ADICIONALES)

### N2-EX-3: Frontend Visualización (Weather Audit)
- **Estado**: ✅ Resuelto
- **Implementación**: 
    - Archivo [src/public/weather-audit.html](src/public/weather-audit.html).
    - Lógica en `js/weather-audit.js`.
    - Uso de **Chart.js** para renderizar:
        1. Gráfico de líneas con la evolución de temperatura vs umbral.
        2. Gráfico de donut mostrando el porcentaje de cumplimiento (Compliance Score).
