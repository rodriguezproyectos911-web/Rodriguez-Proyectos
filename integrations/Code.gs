const SPREADSHEET_ID = '10bMMo6FAOlAmdUnTwgrJfSa43klfvTeeG4qM3gWEK2E';
const SHEET_NAME = 'Leads Landing';
const VISITS_SHEET_NAME = 'Visitas Landing';
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

    if (clean_(p.event) === 'visit') {
      const visits = ss.getSheetByName(VISITS_SHEET_NAME);
      if (!visits) throw new Error('No existe la hoja ' + VISITS_SHEET_NAME);
      visits.appendRow([
        new Date(),
        'Visita',
        clean_(p.source) || 'directo',
        clean_(p.medium) || 'web',
        clean_(p.campaign),
        clean_(p.company),
        clean_(p.url),
        clean_(p.referrer),
        clean_(p.session)
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ok:true,event:'visit'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

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
  const telefono = clean_(p.telefono);
  const email = clean_(p.email);
  const localidad = clean_(p.localidad);
  const contratista = clean_(p.contratista);
  const urgencia = clean_(p.urgencia) || 'Media';
  const detalle = clean_(p.detalle);
  const subject = 'Nuevo lead web | ' + empresa + ' | ' + urgencia;

  const body = [
    'Nuevo contacto desde Rodriguez Proyectos',
    '',
    'Nombre: ' + nombre,
    'Empresa: ' + empresa,
    'Teléfono: ' + telefono,
    'Email: ' + email,
    'Localidad: ' + localidad,
    'Necesidad: ' + tipo,
    'Tiene contratista: ' + contratista,
    'Urgencia: ' + urgencia,
    '',
    'Descripción:',
    detalle,
    '',
    'El lead fue registrado automáticamente en la hoja "Leads Landing".'
  ].join('\n');

  const waNumber = whatsappNumber_(telefono);
  const waText = encodeURIComponent(
    'Hola ' + nombre + ', ¿cómo estás? Soy de Rodriguez Proyectos. ' +
    'Recibimos tu consulta por ' + (tipo || 'nuestros servicios') +
    (empresa && empresa !== 'Sin empresa' ? ' para ' + empresa : '') +
    '. Para orientarte mejor, podemos coordinar una breve llamada o una visita técnica. ' +
    '¿Qué opción te resulta más cómoda?'
  );

  const waUrl = waNumber ? 'https://wa.me/' + waNumber + '?text=' + waText : '';
  const mailSubject = encodeURIComponent('Consulta Rodriguez Proyectos - ' + empresa);
  const mailBody = encodeURIComponent(
    'Hola ' + nombre + ',\n\n' +
    'Gracias por contactarte con Rodriguez Proyectos. Recibimos tu consulta por ' +
    (tipo || 'nuestros servicios') +
    (empresa && empresa !== 'Sin empresa' ? ' para ' + empresa : '') +
    '.\n\n' +
    'Para poder orientarte correctamente, nos gustaría conocer un poco más sobre el alcance, la etapa actual y los tiempos que están manejando. ' +
    'También podemos coordinar una llamada breve o una visita técnica.\n\n' +
    'Quedamos atentos para avanzar.\n\n' +
    'Saludos,\nRodriguez Proyectos\nServicios Industriales Integrales'
  );
  const mailUrl = email ? 'mailto:' + encodeURIComponent(email) + '?subject=' + mailSubject + '&body=' + mailBody : '';

  const buttonStyle = 'display:inline-block;padding:12px 18px;margin:6px 8px 6px 0;border-radius:6px;text-decoration:none;font-weight:700;color:#111;background:#ffc400;';
  const secondaryButtonStyle = 'display:inline-block;padding:12px 18px;margin:6px 8px 6px 0;border-radius:6px;text-decoration:none;font-weight:700;color:#fff;background:#2e2e33;';

  const actions = [
    waUrl ? '<a href="' + waUrl + '" style="' + buttonStyle + '">Abrir WhatsApp</a>' : '',
    mailUrl ? '<a href="' + mailUrl + '" style="' + secondaryButtonStyle + '">Responder por email</a>' : ''
  ].join('');

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:640px;color:#222">' +
      '<h2 style="margin-bottom:6px">Nuevo lead - Rodriguez Proyectos</h2>' +
      '<p style="margin-top:0"><strong>' + escHtml_(empresa) + '</strong> · Urgencia: <strong>' + escHtml_(urgencia) + '</strong></p>' +
      '<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">' +
        '<tr><td><strong>Nombre</strong></td><td>' + escHtml_(nombre) + '</td></tr>' +
        '<tr><td><strong>Empresa</strong></td><td>' + escHtml_(empresa) + '</td></tr>' +
        '<tr><td><strong>Teléfono</strong></td><td>' + escHtml_(telefono) + '</td></tr>' +
        '<tr><td><strong>Email</strong></td><td>' + escHtml_(email) + '</td></tr>' +
        '<tr><td><strong>Localidad</strong></td><td>' + escHtml_(localidad) + '</td></tr>' +
        '<tr><td><strong>Necesidad</strong></td><td>' + escHtml_(tipo) + '</td></tr>' +
        '<tr><td><strong>Contratista</strong></td><td>' + escHtml_(contratista) + '</td></tr>' +
        '<tr><td><strong>Urgencia</strong></td><td>' + escHtml_(urgencia) + '</td></tr>' +
      '</table>' +
      '<p><strong>Descripción</strong><br>' + escHtml_(detalle || 'Sin descripción') + '</p>' +
      '<div style="margin:18px 0">' + actions + '</div>' +
      '<p style="font-size:12px;color:#666">El lead fue registrado automáticamente en la hoja "Leads Landing".</p>' +
    '</div>';

  MailApp.sendEmail({
    to: ALERT_EMAIL,
    subject: subject,
    body: body,
    htmlBody: htmlBody
  });
}

function whatsappNumber_(telefono) {
  let n = String(telefono || '').replace(/\D/g, '');
  if (!n) return '';
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith('54')) return n;
  if (n.startsWith('0')) n = n.slice(1);
  return '54' + n;
}

function escHtml_(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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