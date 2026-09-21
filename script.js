const form=document.getElementById('leadForm');
form.addEventListener('submit',e=>{
 e.preventDefault(); const d=new FormData(form);
 const subject=`Consulta web - ${d.get('tipo')} - ${d.get('empresa')||d.get('nombre')}`;
 const body=`Nombre: ${d.get('nombre')}\nEmpresa: ${d.get('empresa')}\nEmail: ${d.get('email')}\nTeléfono: ${d.get('telefono')}\nTipo de necesidad: ${d.get('tipo')}\n\nDetalle:\n${d.get('detalle')||''}`;
 window.location.href=`mailto:rodriguezproyectos911@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    ['nombre','empresa','telefono','email','detalle'].forEach(name=>{
      const target=form.elements[name];
      if(target) target.value=d.get(name)||'';
    });
    if(form.elements.tipo) form.elements.tipo.value=d.get('tipo');
    closeAssistant();
    document.getElementById('contacto').scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>form.elements.detalle?.focus(),600);
  };
}

document.querySelectorAll('.assistant-quick button').forEach(b=>b.onclick=()=>{
  if(b.dataset.q==='visita') return showVisitForm();
  messages.innerHTML+=`<p><b>${b.textContent}</b><br>${replies[b.dataset.q]}</p>`;
});