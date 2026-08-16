document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());

(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .siteMenuToggle{border:1px solid var(--gold,#d79a18);background:#0b0b0b;color:#f5f3ed;padding:10px 14px;border-radius:2px;font-weight:900;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center}
    .siteMenuPanel{position:fixed;top:76px;right:18px;left:18px;z-index:120;display:none;background:rgba(10,10,10,.98);border:1px solid #3b301b;box-shadow:0 18px 55px #000b;padding:10px}
    .siteMenuPanel.open{display:grid}
    .siteMenuPanel a{padding:15px 16px;border-bottom:1px solid #272727;font-weight:800}
    .siteMenuPanel a:last-child{border-bottom:0;background:var(--gold,#d79a18);color:#111;margin-top:8px}
    .budgetFloat{position:fixed;right:18px;bottom:78px;z-index:80;background:#fff;color:#111;border:0;border-radius:999px;padding:12px 16px;font-weight:900;box-shadow:0 8px 30px #0008;width:200px;text-align:center}
    @media(min-width:801px){.siteMenuToggle,.siteMenuPanel{display:none!important}}
    @media(max-width:800px){
      .navin{gap:8px!important}
      .brand{gap:8px!important;min-width:0;flex:1 1 auto}
      .brand>div:last-child{font-size:16px!important;line-height:1.02!important;min-width:0}
      .brand small{font-size:9px!important;letter-spacing:1.15px!important}
      .langMobile{margin-left:0!important;margin-right:0!important;max-width:74px!important;padding:9px 8px!important;flex:0 0 74px}
      .siteMenuToggle{width:78px;height:46px;padding:0 8px;font-size:14px;flex:0 0 78px}
      .siteMenuPanel{top:74px}
      .budgetFloat{right:18px;bottom:78px;width:200px}
      .whatsapp{width:200px;text-align:center}
    }
  `;
  document.head.appendChild(style);

  const navin=document.querySelector('.navin');
  if(navin){
    let toggle=navin.querySelector('.mobile.cta');
    if(toggle){
      toggle.className='mobile siteMenuToggle';
      toggle.removeAttribute('data-i18n');
    }else{
      toggle=document.createElement('a');
      toggle.className='mobile siteMenuToggle';
      navin.appendChild(toggle);
    }
    toggle.href='#site-menu';
    toggle.textContent='☰ Menú';
    toggle.setAttribute('role','button');
    toggle.setAttribute('aria-controls','siteMenuPanel');
    toggle.setAttribute('aria-expanded','false');

    const panel=document.createElement('nav');
    panel.id='siteMenuPanel';
    panel.className='siteMenuPanel';
    panel.setAttribute('aria-label','Menú principal');
    panel.innerHTML=`
      <a href="index.html">Inicio</a>
      <a href="proyectos.html">Proyectos</a>
      <a href="servicios.html">Servicios</a>
      <a href="disena-tu-bano-ia.html">Diseña con IA</a>
      <a href="empresa.html">Empresa</a>
      <a href="contacto.html">Contacto</a>
      <a href="presupuesto.html">Presupuesto técnico</a>
    `;
    document.body.appendChild(panel);

    const close=()=>{panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');};
    toggle.addEventListener('click',e=>{
      e.preventDefault();
      const open=!panel.classList.contains('open');
      panel.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',String(open));
    });
    panel.addEventListener('click',e=>{if(e.target.closest('a')) close();});
    document.addEventListener('click',e=>{if(!panel.contains(e.target)&&e.target!==toggle) close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
  }

  const path=(location.pathname||'').toLowerCase();
  if(!path.endsWith('/presupuesto.html')&&!path.endsWith('presupuesto.html')){
    const budget=document.createElement('a');
    budget.className='budgetFloat';
    budget.href='presupuesto.html';
    budget.textContent='Presupuesto';
    budget.setAttribute('aria-label','Abrir presupuesto técnico');
    document.body.appendChild(budget);
  }

  document.querySelectorAll('a[data-i18n="navQuote"]').forEach(a=>a.href='presupuesto.html');
})();
