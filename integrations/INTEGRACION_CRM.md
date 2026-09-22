# Integración Landing → CRM

Este script recibe las consultas de la landing y las agrega a la pestaña **Leads Landing** del CRM Rodriguez.

## Despliegue
1. Abrir https://script.google.com y crear un proyecto nuevo.
2. Reemplazar el contenido de Code.gs con el archivo `integrations/Code.gs` de este repositorio.
3. Implementar > Nueva implementación > Aplicación web.
4. Ejecutar como: **Yo**.
5. Quién tiene acceso: **Cualquiera**.
6. Autorizar y copiar la URL terminada en `/exec`.
7. Esa URL se coloca en `script.js` como valor de `CRM_ENDPOINT`.

El formulario web seguirá usando el correo como respaldo hasta que se configure la URL del Web App.

El script:
- agrega el lead a **Leads Landing**;
- deja Estado = **Nuevo lead**;
- Próxima acción = **Responder / calificar**;
- envía una alerta por email a rodriguezproyectos911@gmail.com.
