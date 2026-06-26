(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`modulepreload`,t=function(e){return`/`+e},n={},r=function(r,i,a){let o=Promise.resolve();if(i&&i.length>0){let r=document.getElementsByTagName(`link`),s=document.querySelector(`meta[property=csp-nonce]`),c=s?.nonce||s?.getAttribute(`nonce`);function l(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}o=l(i.map(i=>{if(i=t(i,a),i in n)return;n[i]=!0;let o=i.endsWith(`.css`),s=o?`[rel="stylesheet"]`:``;if(a)for(let e=r.length-1;e>=0;e--){let t=r[e];if(t.href===i&&(!o||t.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${i}"]${s}`))return;let l=document.createElement(`link`);if(l.rel=o?`stylesheet`:e,o||(l.as=`script`),l.crossOrigin=``,l.href=i,c&&l.setAttribute(`nonce`,c),document.head.appendChild(l),o)return new Promise((e,t)=>{l.addEventListener(`load`,e),l.addEventListener(`error`,()=>t(Error(`Unable to preload CSS for ${i}`)))})}))}function s(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return o.then(e=>{for(let t of e||[])t.status===`rejected`&&s(t.reason);return r().catch(s)})},i=`false`,a=`false`,o=i===`true`,s=a===`true`;function c(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:i,onOfflineReady:a,onRegistered:c,onRegisteredSW:l,onRegisterError:u}=e,d,f,p,m=async(e=!0)=>{await f,o||p?.()};async function h(){if(`serviceWorker`in navigator){if(d=await r(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bb3SyqTu.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/sw.js`,{scope:`/`,type:`classic`})).catch(e=>{u?.(e)}),!d)return;if(p=()=>{d?.messageSkipWaiting()},!s)if(o)d.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),d.addEventListener(`installed`,e=>{e.isUpdate||a?.()});else{let e=!1,t=()=>{e=!0,d?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),i?.()};d.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&a?.():n.isExternal?t():!e&&a?.():n.isUpdate||a?.()}),d.addEventListener(`waiting`,t)}d.register({immediate:t}).then(e=>{l?l(`/sw.js`,e):c?.(e)}).catch(e=>{u?.(e)})}}return f=h(),m}var l=c({onNeedRefresh(){console.log(`🔄 Nova atualização detetada pelo Vite PWA!`),u()},onOfflineReady(){console.log(`✅ PWA pronto para uso offline.`)},onRegistered(e){console.log(`📡 Radar PWA ativado: A escutar novas versões em tempo real.`),e&&(setInterval(()=>{e.update().catch(e=>console.log(`Erro ao procurar atualizações PWA:`,e))},6e4),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&e.update().catch(e=>console.log(`Erro ao procurar atualizações PWA:`,e))}))}});function u(){if(document.getElementById(`global-pwa-update-prompt`))return;if(!document.getElementById(`pwa-keyframes`)){let e=document.createElement(`style`);e.id=`pwa-keyframes`,e.innerHTML=`
            @keyframes pwaSlideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pwaSlideUpMobile {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            /* Padrão Web/Desktop (Canto inferior direito) */
            .pwa-toast-desktop {
                bottom: 30px; right: 30px; left: auto; transform: none; animation: pwaSlideUp 0.4s ease-out;
            }
            /* Padrão Mobile (Centro inferior) */
            @media screen and (max-width: 768px) {
                .pwa-toast-mobile {
                    left: 50% !important; right: auto !important; transform: translateX(-50%) !important; 
                    width: 90% !important; bottom: 20px !important; animation: pwaSlideUpMobile 0.4s ease-out !important;
                }
            }
        `,document.head.appendChild(e)}let e=document.createElement(`div`);e.id=`global-pwa-update-prompt`,e.className=`pwa-toast-desktop pwa-toast-mobile`,e.style.cssText=`
        position: fixed; 
        background: #2c3e50; 
        color: white; 
        padding: 15px 25px; 
        border-radius: 12px; 
        box-shadow: 0 15px 35px rgba(0,0,0,0.4); 
        z-index: 9999999; 
        display: flex; 
        align-items: center; 
        gap: 20px; 
        font-family: 'Poppins', sans-serif; 
        max-width: 400px;
        border-left: 4px solid #3498db;
    `,e.innerHTML=`
        <div style="flex: 1;">
            <strong style="display: block; font-size: 15px; margin-bottom: 4px;">🚀 Nova Atualização Disponível!</strong>
            <span style="font-size: 12px; color: #bdc3c7;">Há uma nova versão disponível cheia de novidades e melhorias.</span>
        </div>
        <button id="btn-atualizar-global" style="background: #27ae60; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 6px rgba(39, 174, 96, 0.3);">
            Atualizar Agora
        </button>
    `,document.body.appendChild(e),document.getElementById(`btn-atualizar-global`).addEventListener(`click`,()=>{let e=document.getElementById(`btn-atualizar-global`);e.innerText=`Atualizando... ⏳`,e.style.background=`#f39c12`,e.style.boxShadow=`none`,setTimeout(()=>{l(!0)},800)})}export{c as t};