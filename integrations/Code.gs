const SPREADSHEET_ID = '10bMMo6FAOlAmdUnTwgrJfSa43klfvTeeG4qM3gWEK2E';
const SHEET_NAME = 'Leads Landing';
const ALERT_EMAIL = 'rodriguezproyectos911@gmail.com';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true, service:'Rodriguez Proyectos CRM'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) throw new Error('No existe la hoja ' + SHEET_NAME);

    const now = new Date();
    const tipo = clean_(p.tipo);
    const servicio = clean_(p.servicio) || tipo;

    sh.appendRow([
      now,                            // Fecha/Hora
      clean_(p.nombre),               // Nombre
      clean_(p.empresa),              // Empresa
      clean_(p.rubro) || inferRubro_(tipo), // Rubro
      clean_(p.telefono),             // Teléfono / WhatsApp
      clean_(p.email),                // Email
      clean_(p.localidad),            // Localidad
      tipo,                           // Tipo de necesidad
      servicio,                       // Servicio
      clean_(p.contratista),          // ¿Tiene contratista?
      clean_(p.urgencia) || 'Media',  // Urgencia
      clean_(p.detalle),              // Descripción
      clean_(p.origen) || 'Landing web', // Origen campaña
      '',                             // Prospecto CRM
      'Nuevo lead',                   // Estado
      'Responder / calificar',        // Próxima acción
      '',                             // Responsable
      clean_(p.notas)                 // Notas
    ]);

    sendAlert_(p, tipo);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendAlert_(p, tipo) {
  const nombre = clean_(p.nombre) || 'Sin nombre';
  const empresa = clean_(p.empresa) || 'Sin empresa';
  const urgencia = clean_(p.urgencia) || 'Media';
  const subject = 'Nuevo lead web | ' + empresa + ' | ' + urgencia;
  const body = [
    'Nuevo contacto desde Rodriguez Proyectos',
    '',
    'Nombre: ' + nombre,
    'Empresa: ' + empresa,
    'Teléfono: ' + clean_(p.telefono),
    'Email: ' + clean_(p.email),
    'Localidad: ' + clean_(p.localidad),
    'Necesidad: ' + tipo,
    'Tiene contratista: ' + clean_(p.contratista),
    'Urgencia: ' + urgencia,
    '',
    'Descripción:',
    clean_(p.detalle),
    '',
    'El lead fue registrado automáticamente en la hoja "Leads Landing".'
  ].join('\n');

  MailApp.sendEmail(ALERT_EMAIL, subject, body);
}

function clean_(v) {
  return String(v == null ? '' : v).trim().slice(0, 5000);
}

function inferRubro_(tipo) {
  const t = String(tipo || '').toLowerCase();
  if (t.includes('laboratorio') || t.includes('farma')) return 'Laboratorios y Farma';
  if (t.includes('logística') || t.includes('depósito')) return 'Logística';
  if (t.includes('refrigeración') || t.includes('frío')) return 'Refrigeración / Frío';
  return 'Industria / Comercio';
}