import{t as e}from"./preload-helper-B83JGOQx.js";var t=`false`,n=`false`,r=t===`true`,i=n===`true`;function a(t={}){let{immediate:n=!1,onNeedReload:a,onNeedRefresh:o,onOfflineReady:s,onRegistered:c,onRegisteredSW:l,onRegisterError:u}=t,d,f,p,m=async(e=!0)=>{await f,r||p?.()};async function h(){if(`serviceWorker`in navigator){if(d=await e(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-8x20nBgX.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/sw.js`,{scope:`/`,type:`classic`})).catch(e=>{u?.(e)}),!d)return;if(p=()=>{d?.messageSkipWaiting()},!i)if(r)d.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(a?a():window.location.reload())}),d.addEventListener(`installed`,e=>{e.isUpdate||s?.()});else{let e=!1,t=()=>{e=!0,d?.addEventListener(`controlling`,e=>{e.isUpdate&&(a?a():window.location.reload())}),o?.()};d.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&s?.():n.isExternal?t():!e&&s?.():n.isUpdate||s?.()}),d.addEventListener(`waiting`,t)}d.register({immediate:n}).then(e=>{l?l(`/sw.js`,e):c?.(e)}).catch(e=>{u?.(e)})}}return f=h(),m}var o=a({onNeedRefresh(){console.log(`🔄 Nova atualização detetada pelo Vite PWA!`),s()},onOfflineReady(){console.log(`✅ PWA pronto para uso offline.`)},onRegistered(e){console.log(`📡 Radar PWA ativado: A escutar novas versões em tempo real.`),e&&(setInterval(()=>{e.update().catch(e=>console.log(`Erro ao procurar atualizações PWA:`,e))},6e4),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&e.update().catch(e=>console.log(`Erro ao procurar atualizações PWA:`,e))}))}});function s(){if(document.getElementById(`global-pwa-update-prompt`))return;if(!document.getElementById(`pwa-keyframes`)){let e=document.createElement(`style`);e.id=`pwa-keyframes`,e.innerHTML=`
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
            <strong style="display: block; font-size: 20px; margin-bottom: 5px;">🚀 Atualização Disponível</strong>
            <span style="font-size: 12px; color: #bdc3c7;">Foram feitos alguns ajustes no site para que sua experiência aqui seja ainda melhor. Para atualizar, basta clicar no botão verde.</span>
        </div>
        <button id="btn-atualizar-global" style="background: #27ae60; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 6px rgba(39, 174, 96, 0.3);">
            Atualizar Agora
        </button>
    `,document.body.appendChild(e),document.getElementById(`btn-atualizar-global`).addEventListener(`click`,()=>{let e=document.getElementById(`btn-atualizar-global`);e.innerText=`Atualizando... ⏳`,e.style.background=`#f39c12`,e.style.boxShadow=`none`,setTimeout(()=>{o(!0)},800)})}export{a as t};