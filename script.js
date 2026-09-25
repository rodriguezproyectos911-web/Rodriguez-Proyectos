const CRM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwFbrk8LHDGAm5Zfc_TVKm5rtRfcEgBzUh82evS6tMdiLnLkL-Na5XH_0wDxY74FOg/exec'; // Pegar aquí la URL /exec del Apps Script cuando quede desplegado.

function attribution_(){
  const q=new URLSearchParams(window.location.search);
  return {
    source:q.get('utm_source')||'directo',
    medium:q.get('utm_medium')||'web',
    campaign:q.get('utm_campaign')||'',
    company:q.get('utm_company')||''
  };
}

function sessionId_(){
  let id=localStorage.getItem('rp_session');
  if(!id){
    id='rp_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);
    localStorage.setItem('rp_session',id);
  }
  return id;
}

function trackLandingVisit_(){
  if(!CRM_ENDPOINT) return;
  const a=attribution_();
  const payload=new URLSearchParams();
  payload.append('event','visit');
  payload.append('source',a.source);
  payload.append('medium',a.medium);
  payload.append('campaign',a.campaign);
  payload.append('company',a.company);
  payload.append('url',window.location.href);
  payload.append('referrer',document.referrer||'');
  payload.append('session',sessionId_());
  fetch(CRM_ENDPOINT,{method:'POST',body:payload,mode:'no-cors'}).catch(()=>{});
}

trackLandingVisit_();

const form=document.getElementById('leadForm');
form.addEventListener('submit',async e=>{
 e.preventDefault();
 const d=new FormData(form);
 const btn=form.querySelector('button[type="submit"]');
 const original=btn.textContent;
 btn.disabled=true;
 btn.textContent='Enviando...';

 try {
   if(CRM_ENDPOINT){
     const payload=new URLSearchParams();
     for(const [k,v] of d.entries()) payload.append(k,v);
     const a=attribution_();
    const originParts=['Landing web'];
    if(a.source && a.source!=='directo') originParts.push(a.source);
    if(a.campaign) originParts.push(a.campaign);
    if(a.company) originParts.push(a.company);
    payload.append('origen',originParts.join(' | '));
    payload.append('notas',[a.medium,a.campaign,a.company].filter(Boolean).join(' | '));
     await fetch(CRM_ENDPOINT,{method:'POST',body:payload,mode:'no-cors'});
     btn.textContent='Consulta recibida';
     form.reset();
     setTimeout(()=>{btn.disabled=false;btn.textContent=original;},2500);
     return;
   }
 } catch(err){ console.error('CRM submit error',err); }

 const subject=`Consulta web - ${d.get('tipo')} - ${d.get('empresa')||d.get('nombre')}`;
 const body=`Nombre: ${d.get('nombre')}\nEmpresa: ${d.get('empresa')}\nEmail: ${d.get('email')}\nTeléfono: ${d.get('telefono')}\nTipo de necesidad: ${d.get('tipo')}\n\nDetalle:\n${d.get('detalle')||''}`;
 window.location.href=`mailto:rodriguezproyectos911@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 btn.disabled=false;
 btn.textContent=original;
});

const panel=document.getElementById('assistantPanel');
const messages=document.getElementById('assistantMessages');
const quick=document.querySelector('.assistant-quick');
const openAssistant=()=>{panel.classList.add('open');panel.setAttribute('aria-hidden','false')};
const closeAssistant=()=>{panel.classList.remove('open');panel.setAttribute('aria-hidden','true')};
document.getElementById('assistantBtn').onclick=openAssistant;
document.getElementById('assistantClose').onclick=closeAssistant;
const assistantCloseBottom=document.getElementById('assistantCloseBottom');
if(assistantCloseBottom) assistantCloseBottom.onclick=closeAssistant;
document.addEventListener('click',e=>{
  if(!panel.classList.contains('open')) return;
  const clickedInside=panel.contains(e.target);
  const clickedTrigger=document.getElementById('assistantBtn').contains(e.target);
  if(!clickedInside && !clickedTrigger) closeAssistant();
});

const replies={
 estimacion:'Sí. Si nos enviás una descripción clara, medidas o cantidades aproximadas y, cuando corresponda, fotos o planos, podemos preparar una estimación preliminar de costo y plazo antes de coordinar una visita. Es orientativa y se confirma luego del relevamiento técnico.',
 obra:'Sí. Podemos tomar una obra completa y coordinar distintos rubros con un solo responsable, o dividirla por etapas.',
 contratista:'Perfecto. No necesitamos reemplazarlo. Podemos tomar adicionales, trabajos fuera de alcance, refuerzos, correcciones o partidas puntuales.',
 mantenimiento:'Trabajamos mantenimiento preventivo y correctivo, edilicio, eléctrico, mecánico, sanitario, refrigeración y atención de urgencias.'
};

function showVisitForm(){
  quick.style.display='none';
  messages.innerHTML+=`<p><b>Coordinar una visita técnica</b><br>Dejanos tus datos acá mismo. Después los pasamos al formulario principal ya completos.</p>
  <form id="assistantVisitForm" class="assistant-visit-form">
    <label>Nombre<input name="nombre" required autocomplete="name"></label>
    <label>Empresa<input name="empresa" autocomplete="organization"></label>
    <div class="assistant-two">
      <label>Teléfono<input name="telefono" autocomplete="tel"></label>
      <label>Email<input name="email" type="email" autocomplete="email"></label>
    </div>
    <label>¿Qué necesitan resolver?
      <select name="tipo">
        <option>Obra civil industrial</option>
        <option>Montaje industrial</option>
        <option>Instalaciones técnicas</option>
        <option>Mantenimiento industrial integral</option>
        <option>Laboratorios y Farma</option>
        <option>Logística y Depósitos</option>
        <option>Refrigeración y Frío Industrial</option>
        <option>Adicional / Post-obra / Urgencia</option>
      </select>
    </label>
    <label>Localidad<input name="localidad" placeholder="Ej. Garín, Escobar, Tigre"></label>
    <div class="assistant-two">
      <label>¿Ya tiene contratista?
        <select name="contratista">
          <option value="">Seleccionar</option>
          <option>Sí</option>
          <option>No</option>
          <option>Parcial / por rubros</option>
        </select>
      </label>
      <label>Urgencia
        <select name="urgencia">
          <option>Media</option>
          <option>Alta</option>
          <option>Baja</option>
          <option>Urgente</option>
        </select>
      </label>
    </div>
    <label>Breve descripción<textarea name="detalle" rows="3" placeholder="Ubicación, necesidad y etapa del proyecto."></textarea></label>
    <p class="assistant-error" id="assistantError" hidden>Ingresá al menos un teléfono o un email para poder contactarte.</p>
    <button class="assistant-submit" type="submit">Continuar con la solicitud</button>
    <button class="assistant-back" type="button" id="assistantBack">Volver</button>
  </form>`;

  const visitForm=document.getElementById('assistantVisitForm');
  document.getElementById('assistantBack').onclick=()=>{
    visitForm.remove();
    quick.style.display='grid';
  };
  visitForm.onsubmit=e=>{
    e.preventDefault();
    const d=new FormData(visitForm);
    if(!String(d.get('telefono')||'').trim() && !String(d.get('email')||'').trim()){
      document.getElementById('assistantError').hidden=false;
      return;
    }
    ['nombre','empresa','telefono','email','localidad','detalle'].forEach(name=>{
      const target=form.elements[name];
      if(target) target.value=d.get(name)||'';
    });
    if(form.elements.tipo) form.elements.tipo.value=d.get('tipo');
    if(form.elements.contratista && d.get('contratista')) form.elements.contratista.value=d.get('contratista');
    if(form.elements.urgencia && d.get('urgencia')) form.elements.urgencia.value=d.get('urgencia');
    closeAssistant();
    document.getElementById('contacto').scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>form.elements.detalle?.focus(),600);
  };
}

document.querySelectorAll('.assistant-quick button').forEach(b=>b.onclick=()=>{
  if(b.dataset.q==='visita') return showVisitForm();
  if(b.dataset.q==='estimacion'){
    messages.innerHTML+=`<p><b>${b.textContent}</b><br>${replies[b.dataset.q]}</p><p><a href="#contacto" id="assistantEstimateLink">Completar datos para evaluación inicial →</a></p>`;
    setTimeout(()=>{
      const link=document.getElementById('assistantEstimateLink');
      if(link) link.onclick=()=>{
        closeAssistant();
        if(form.elements.detalle && !form.elements.detalle.value) form.elements.detalle.value='Solicito una estimación preliminar de costo y plazo. ';
        document.getElementById('contacto').scrollIntoView({behavior:'smooth',block:'start'});
        setTimeout(()=>form.elements.detalle?.focus(),600);
      };
    },0);
    return;
  }
  messages.innerHTML+=`<p><b>${b.textContent}</b><br>${replies[b.dataset.q]}</p>`;
});