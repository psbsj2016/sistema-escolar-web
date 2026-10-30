(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`modulepreload`,t=function(e){return`/`+e},n={},r=function(r,i,a){let o=Promise.resolve();if(i&&i.length>0){let r=document.getElementsByTagName(`link`),s=document.querySelector(`meta[property=csp-nonce]`),c=s?.nonce||s?.getAttribute(`nonce`);function l(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}o=l(i.map(i=>{if(i=t(i,a),i in n)return;n[i]=!0;let o=i.endsWith(`.css`),s=o?`[rel="stylesheet"]`:``;if(a)for(let e=r.length-1;e>=0;e--){let t=r[e];if(t.href===i&&(!o||t.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${i}"]${s}`))return;let l=document.createElement(`link`);if(l.rel=o?`stylesheet`:e,o||(l.as=`script`),l.crossOrigin=``,l.href=i,c&&l.setAttribute(`nonce`,c),document.head.appendChild(l),o)return new Promise((e,t)=>{l.addEventListener(`load`,e),l.addEventListener(`error`,()=>t(Error(`Unable to preload CSS for ${i}`)))})}))}function s(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return o.then(e=>{for(let t of e||[])t.status===`rejected`&&s(t.reason);return r().catch(s)})},i=`false`,a=`false`,o=i===`true`,s=a===`true`;function c(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:i,onOfflineReady:a,onRegistered:c,onRegisteredSW:l,onRegisterError:u}=e,d,f,p,m=async(e=!0)=>{await f,o||p?.()};async function h(){if(`serviceWorker`in navigator){if(d=await r(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-DS9QwQrZ.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/sw.js`,{scope:`/`,type:`classic`})).catch(e=>{u?.(e)}),!d)return;if(p=()=>{d?.messageSkipWaiting()},!s)if(o)d.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),d.addEventListener(`installed`,e=>{e.isUpdate||a?.()});else{let e=!1,t=()=>{e=!0,d?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),i?.()};d.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&a?.():n.isExternal?t():!e&&a?.():n.isUpdate||a?.()}),d.addEventListener(`waiting`,t)}d.register({immediate:t}).then(e=>{l?l(`/sw.js`,e):c?.(e)}).catch(e=>{u?.(e)})}}return f=h(),m}var l=`ptt_versao_build_instalada`,u=`1793321468867`,d=null,f=null,p=!1;u&&(localStorage.getItem(l)||localStorage.setItem(l,u)),`serviceWorker`in navigator&&navigator.serviceWorker.addEventListener(`controllerchange`,()=>{p&&window.location.reload()});var m=c({immediate:!0,onNeedRefresh(){console.log(`🔄 Nova atualização detetada pelo Service Worker!`),_()},onOfflineReady(){console.log(`✅ Sistema pronto para uso.`)},onRegisteredSW(e,t){d=t,t&&(t.waiting&&_(),t.update().catch(()=>{})),h()},onRegistered(e){d=e,e&&e.waiting&&_(),h()}});async function h(){if(!p)try{d&&typeof d.update==`function`&&(d.update().catch(()=>{}),d.waiting&&_());let e=await fetch(`/version.json?_t=${Date.now()}`,{method:`GET`,cache:`no-store`,headers:{"Cache-Control":`no-cache, no-store, must-revalidate`,Pragma:`no-cache`}});if(!e.ok)return;let t=await e.json();if(!t||!t.version)return;let n=String(t.version).trim();f=n;let r=u||localStorage.getItem(l);if(!r){localStorage.setItem(l,n);return}n===String(r).trim()?localStorage.setItem(l,n):(console.log(`🚀 Desatualização detetada! Aparelho: ${r} | Servidor: ${n}`),_())}catch{}}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>setTimeout(h,300)):setTimeout(h,300),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&h()}),window.addEventListener(`pageshow`,()=>{h()}),window.addEventListener(`focus`,()=>{h()}),window.addEventListener(`online`,()=>{h()}),setInterval(()=>{document.visibilityState===`visible`&&h()},3e4);async function g(){if(!p){p=!0;try{f?localStorage.setItem(l,f):u&&localStorage.setItem(l,u),d&&d.waiting&&d.waiting.postMessage({type:`SKIP_WAITING`});try{m(!0)}catch{}if(`caches`in window){let e=await caches.keys();await Promise.all(e.map(e=>caches.delete(e)))}if(`serviceWorker`in navigator){let e=await navigator.serviceWorker.getRegistrations();for(let t of e)try{await t.update()}catch{}}}catch(e){console.error(`Aviso durante limpeza de cache:`,e)}setTimeout(()=>{window.location.reload()},500)}}window.atualizarApp=g;function _(){if(document.getElementById(`global-pwa-update-prompt`))return;if(!document.getElementById(`pwa-keyframes`)){let e=document.createElement(`style`);e.id=`pwa-keyframes`,e.innerHTML=`
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
    `,document.body.appendChild(e),document.getElementById(`btn-atualizar-global`).addEventListener(`click`,()=>{let e=document.getElementById(`btn-atualizar-global`);e&&(e.innerText=`Atualizando... ⏳`,e.style.background=`#f59e0b`,e.style.boxShadow=`none`,e.disabled=!0),g()})}export{c as t};