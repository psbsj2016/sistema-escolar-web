import{t as e}from"./preload-helper-B83JGOQx.js";var t=`false`,n=`false`,r=t===`true`,i=n===`true`;function a(t={}){let{immediate:n=!1,onNeedReload:a,onNeedRefresh:o,onOfflineReady:s,onRegistered:c,onRegisteredSW:l,onRegisterError:u}=t,d,f,p,m=async(e=!0)=>{await f,r||p?.()};async function h(){if(`serviceWorker`in navigator){if(d=await e(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-8x20nBgX.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/sw.js`,{scope:`/`,type:`classic`})).catch(e=>{u?.(e)}),!d)return;if(p=()=>{d?.messageSkipWaiting()},!i)if(r)d.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(a?a():window.location.reload())}),d.addEventListener(`installed`,e=>{e.isUpdate||s?.()});else{let e=!1,t=()=>{e=!0,d?.addEventListener(`controlling`,e=>{e.isUpdate&&(a?a():window.location.reload())}),o?.()};d.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&s?.():n.isExternal?t():!e&&s?.():n.isUpdate||s?.()}),d.addEventListener(`waiting`,t)}d.register({immediate:n}).then(e=>{l?l(`/sw.js`,e):c?.(e)}).catch(e=>{u?.(e)})}}return f=h(),m}var o=`ptt_versao_build_instalada`,s=`1793161959955`,c=null,l=null,u=!1;s&&(localStorage.getItem(o)||localStorage.setItem(o,s)),`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`controllerchange`,()=>{u&&window.location.reload()});var d=a({immediate:!0,onNeedRefresh(){console.log(`🔄 Nova atualização detetada pelo Service Worker!`),m()},onOfflineReady(){console.log(`✅ Sistema pronto para uso.`)},onRegisteredSW(e,t){c=t,t&&(t.waiting&&m(),t.update().catch(()=>{})),f()},onRegistered(e){c=e,e&&e.waiting&&m(),f()}});async function f(){if(!u)try{c&&typeof c.update==`function`&&(c.update().catch(()=>{}),c.waiting&&m());let e=await fetch(`/version.json?_t=${Date.now()}`,{method:`GET`,cache:`no-store`,headers:{"Cache-Control":`no-cache, no-store, must-revalidate`,Pragma:`no-cache`}});if(!e.ok)return;let t=await e.json();if(!t||!t.version)return;let n=String(t.version).trim();l=n;let r=s||localStorage.getItem(o);if(!r){localStorage.setItem(o,n);return}n===String(r).trim()?localStorage.setItem(o,n):(console.log(`🚀 Desatualização detetada! Aparelho: ${r} | Servidor: ${n}`),m())}catch{}}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>setTimeout(f,300)):setTimeout(f,300),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&f()}),window.addEventListener(`pageshow`,()=>{f()}),window.addEventListener(`focus`,()=>{f()}),window.addEventListener(`online`,()=>{f()}),setInterval(()=>{document.visibilityState===`visible`&&f()},3e4);async function p(){if(!u){u=!0;try{l?localStorage.setItem(o,l):s&&localStorage.setItem(o,s),c&&c.waiting&&c.waiting.postMessage({type:`SKIP_WAITING`});try{d(!0)}catch{}if(`caches`in window){let e=await caches.keys();await Promise.all(e.map(e=>caches.delete(e)))}if(`serviceWorker`in navigator){let e=await navigator.serviceWorker.getRegistrations();for(let t of e)try{await t.update()}catch{}}}catch(e){console.error(`Aviso durante limpeza de cache:`,e)}setTimeout(()=>{window.location.reload()},500)}}window.atualizarApp=p;function m(){if(document.getElementById(`global-pwa-update-prompt`))return;if(!document.getElementById(`pwa-keyframes`)){let e=document.createElement(`style`);e.id=`pwa-keyframes`,e.innerHTML=`
            @keyframes pwaSlideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pwaSlideUpMobile {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            .pwa-toast-desktop {
                bottom: 30px; right: 30px; left: auto; transform: none; animation: pwaSlideUp 0.35s ease-out;
            }
            @media screen and (max-width: 768px) {
                .pwa-toast-mobile {
                    left: 50% !important; right: auto !important; transform: translateX(-50%) !important; 
                    width: 92% !important; bottom: 20px !important; animation: pwaSlideUpMobile 0.35s ease-out !important;
                }
            }
        `,document.head.appendChild(e)}let e=document.createElement(`div`);e.id=`global-pwa-update-prompt`,e.className=`pwa-toast-desktop pwa-toast-mobile`,e.style.cssText=`
        position: fixed; 
        background: #1e293b; 
        color: white; 
        padding: 18px 22px; 
        border-radius: 16px; 
        box-shadow: 0 20px 45px rgba(0,0,0,0.55); 
        z-index: 2147483647; 
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        gap: 16px; 
        font-family: 'Poppins', sans-serif; 
        max-width: 430px;
        border: 1px solid #334155;
        border-left: 5px solid #3b82f6;
    `,e.innerHTML=`
        <div style="flex: 1;">
            <strong style="display: block; font-size: 16px; margin-bottom: 4px; color: #ffffff;">🚀 Nova Atualização Disponível!</strong>
            <span style="font-size: 12px; color: #cbd5e1; line-height: 1.4; display: block;">Esta versão traz melhorias e ajustes recentes. Toque ao lado para atualizar o seu aparelho agora.</span>
        </div>
        <button id="btn-atualizar-global" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 18px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35); flex-shrink: 0;">
            Atualizar Agora
        </button>
    `,document.body.appendChild(e),document.getElementById(`btn-atualizar-global`).addEventListener(`click`,()=>{let e=document.getElementById(`btn-atualizar-global`);e&&(e.innerText=`Atualizando... ⏳`,e.style.background=`#f59e0b`,e.style.boxShadow=`none`,e.disabled=!0),p()})}export{a as t};