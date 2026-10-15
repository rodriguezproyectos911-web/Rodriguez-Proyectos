# Rodriguez Proyectos — Correcciones aisladas de landing (15/10/2026)

## Estado y alcance
- Rama de trabajo: `fix/landing-safe-feedback-2026-10-15`.
- Producción: rama `main`, **sin cambios**. No realizar merge ni publicar hasta aprobar y probar.
- La E2E real del 13/10/2026 en `main` ya quedó validada: solicitud HTTP, visita, lead en Google Sheets y alerta en Gmail. No repetirla sin necesidad.
- El código del backend Google Apps Script no está contenido en este repositorio; por tanto, **no** se ha corregido ni verificado en esta rama.

## Cambios front-end en la rama
1. La respuesta `fetch(..., {mode:'no-cors'})` es opaca: la interfaz ya **no** declara «Consulta recibida» como si fuese confirmación definitiva.
2. Un rechazo de red muestra una alternativa `mailto:` opcional, sin abrir el cliente de correo automáticamente.
3. Los campos ingresados no se borran ante un resultado opaco o un fallo de red. Tras un envío sin confirmación, se requiere una edición antes de volver a habilitar el botón, para reducir duplicados.
4. El formulario asistido deja explícito que el email es obligatorio (igual que el formulario principal), eliminando el flujo inconsistente de solo teléfono. La posibilidad de aceptar teléfono sin email requerirá acordar y probar previamente el contrato del backend.
5. El campo HTML de teléfono usa `type="tel"`. Esto **no garantiza** la conservación de ceros en Google Sheets.

## Pruebas aisladas completadas
- Compilación sintáctica de `script.js`: PASS.
- Verificación estructural de compatibilidad del `POST` existente: PASS (se preserva `mode:'no-cors'` y los nombres de campos).
- Simulación de respuesta opaca: PASS (se informa incertidumbre, se conservan datos y se desbloquea para reintento solo después de una edición).
- Simulación de error de red: PASS (muestra fallback de correo sin redirección automática y no borra el formulario).
- Comparación `main` vs rama: PASS (contenido distinto, sin modificación de `main`).

**No equivale a una nueva prueba E2E en navegador de la rama.** No hay despliegue en producción.

## Pendientes del backend (NO aplicados)
### Teléfonos como texto
En el Apps Script revisar cómo se escribe `telefono`; evitar `Number()`, y aplicar formato de texto a la celda ANTES de escribir:
```javascript
const phone = String(e.parameter.telefono || '').trim();
// Ubicar la columna de telefono usando el encabezado real.
const cell = sheet.getRange(rowIndex, phoneColumnIndex);
cell.setNumberFormat('@');
cell.setValue(phone);
```
Verificar que un número de prueba con ceros iniciales siga siendo idéntico en la hoja y el email. No reescribir los teléfonos existentes sin respaldo.

### Confirmación inequívoca
La página GitHub Pages y el Apps Script están en distintos orígenes; el `no-cors` produce respuesta opaca incluso cuando el servidor tiene errores. Para confirmar almacenamiento se necesita una respuesta verificable desde un endpoint de confianza compatible con CORS o un proxy/controlador de mismo origen, más identificador de solicitud y control de duplicados. **No quitar `no-cors` del sitio en producción sin comprobar el nuevo backend.**

### Zona horaria
La hoja CRM está configurada como `Etc/GMT`. Planificar migración controlada a `America/Argentina/Buenos_Aires`, comprobar fórmulas, Apps Script y timestamps históricos con respaldo previo. No cambiar propiedades del spreadsheet a ciegas.

### Fila 1001 para primer lead
Analizar por qué Apps Script anexó la prueba a la fila 1001. Comprobar `getLastRow()`, `appendRow()`, rangos con formatos hasta la fila 1000 y lógica de escritura. Evitar sobrescribir datos reales.

## Criterios de salida antes del merge
1. Abrir preview del branch; comprobar validaciones del formulario y recorrido del asistente en escritorio y móvil.
2. Probar falla de red y fallo del backend sin mostrar confirmación falsa.
3. Validar en entorno de pruebas del backend, y solo si resulta necesario ejecutar una nueva E2E controlada con marcador único; limpiar exclusivamente registros sintéticos.
4. Confirmar que no se alteran las métricas del CRM y no se generan duplicados.
5. Revisar el diff y solicitar aprobación antes de fusionar a `main`.

## Comercial paralelo
- LINDAL Garín: borrador preparado en Gmail el 15/10, **NO ENVIADO**. CRM fila 64, campo Próxima acción actualizado sin cambiar Último contacto.
- El agente «Embudo comercial diario» está activo, pero notificaciones y correo están desactivados a nivel de tarea/cuenta. Las herramientas disponibles no permiten cambiar esos controles; habilitarlos desde la interfaz del usuario.
