import{t as e}from"./pwa-updater-CxO2LyCZ.js";import"./site-DaSd-N01.js";var t=Object.defineProperty,n=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r};window.CONFIG=window.CONFIG||{},window.App=window.App||{},window.Admin=window.Admin||{};var r=window.CONFIG,i=window.App;r.API_URL,window.LISTA_FUNCIONALIDADES=[{id:`novo_aluno`,nome:`Novo Aluno`,icon:`👨‍🎓`,acao:`App.abrirModalCadastro('aluno')`,roles:[`Gestor`,`Secretaria`]},{id:`fin_carne`,nome:`Gerar Carnê`,icon:`💸`,acao:`App.renderizarTela('mensalidades')`,roles:[`Gestor`,`Secretaria`]},{id:`ped_chamada`,nome:`Fazer Chamada`,icon:`📋`,acao:`App.renderizarTela('chamada')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_notas`,nome:`Lançar Nota`,icon:`📝`,acao:`App.renderizarTela('avaliacoes')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_plan`,nome:`Planejamento`,icon:`📅`,acao:`App.renderizarTela('planejamento')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_bol`,nome:`Boletins`,icon:`🖨️`,acao:`App.renderizarTela('boletins')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`fin_inad`,nome:`Inadimplência`,icon:`⚠️`,acao:`App.renderizarTela('inadimplencia')`,roles:[`Gestor`,`Secretaria`]},{id:`fin_rel`,nome:`Rel. Financeiro`,icon:`📊`,acao:`App.renderizarRelatorio('financeiro')`,roles:[`Gestor`,`Secretaria`]},{id:`doc_ficha`,nome:`Ficha Matrícula`,icon:`📄`,acao:`App.renderizarRelatorio('ficha')`,roles:[`Gestor`,`Secretaria`]},{id:`doc_dossie`,nome:`Dossiê Executivo`,icon:`📁`,acao:`App.renderizarRelatorio('dossie')`,roles:[`Gestor`]},{id:`doc_gerador`,nome:`Documentos`,icon:`📄`,acao:`App.renderizarRelatorio('documentos')`,roles:[`Gestor`,`Secretaria`]},{id:`gerir_workspace`,nome:`Workspace`,icon:`🎓`,acao:`App.renderizarWorkspaceAdmin()`,roles:[`Gestor`,`Secretaria`]}],Object.assign(i,{usuario:null,entidadeAtual:null,idEdicao:null,idEdicaoUsuario:null,listaCache:[],salvarRascunhoModal:()=>{let e=document.getElementById(`modal-form-content`);if(!e)return;let t=e.querySelectorAll(`input, select, textarea`),n={};t.forEach(e=>{e.id&&e.type!==`password`&&(n[e.id]=e.type===`checkbox`?e.checked:e.value)}),sessionStorage.setItem(`ws_rascunho_modal`,JSON.stringify(n))},restaurarRascunhoModal:()=>{let e=sessionStorage.getItem(`ws_rascunho_modal`);if(e)try{let t=JSON.parse(e),n=document.getElementById(`modal-form-content`);if(!n)return;let r=!1;for(let[e,i]of Object.entries(t)){let t=n.querySelector(`#${e}`);t&&(t.type===`checkbox`?t.checked=i:t.value=i,r=!0)}r&&!i._rascunhoAvisado&&(i.showToast(`Rascunho recuperado automaticamente! 📝`,`info`),i._rascunhoAvisado=!0,setTimeout(()=>{i._rascunhoAvisado=!1},3500))}catch{console.warn(`Erro ao ler rascunho.`)}},iniciarRastreadorRascunho:()=>{document.addEventListener(`input`,e=>{let t=document.getElementById(`modal-form-content`);t&&t.contains(e.target)&&i.salvarRascunhoModal()});let e=document.getElementById(`modal-form-content`);e&&new MutationObserver(e=>{e.forEach(e=>{e.addedNodes&&e.addedNodes.length>0&&i.restaurarRascunhoModal()})}).observe(e,{childList:!0,subtree:!0})},adicionarFilaOffline:(e,t,n,r)=>{let a=JSON.parse(localStorage.getItem(`escola_fila_offline`))||[];a.push({rota:e,metodo:t,payload:n,tipoAcao:r,timestamp:Date.now()}),localStorage.setItem(`escola_fila_offline`,JSON.stringify(a)),i.showToast(`📶 Salvo offline: ${r}. Sincronizará automaticamente.`,`info`)},processarFilaOffline:async()=>{let e=JSON.parse(localStorage.getItem(`escola_fila_offline`))||[];if(e.length===0)return;i.showToast(`🔄 A sincronizar ${e.length} dados pendentes com o servidor...`,`info`);let t=[];for(let n of e)try{let e=await i.api(n.rota,n.metodo,n.payload);e&&e.success?console.log(`✅ Sincronizado: ${n.tipoAcao}`):console.warn(`⚠️ Sincronizado com aviso: ${n.tipoAcao}`,e)}catch{t.push(n)}localStorage.setItem(`escola_fila_offline`,JSON.stringify(t)),t.length===0?i.showToast(`✨ Todas as ações offline foram sincronizadas!`,`success`):i.showToast(`⚠️ Ainda faltam sincronizar ${t.length} ações.`,`warning`)},sanitizeHTML:e=>e?typeof DOMPurify>`u`?(console.warn(`DOMPurify não carregado. Usando escapeHTML como fallback.`),i.escapeHTML(e)):DOMPurify.sanitize(e,{USE_PROFILES:{html:!0},ALLOWED_TAGS:[`p`,`br`,`strong`,`b`,`em`,`i`,`u`,`h1`,`h2`,`h3`,`h4`,`ul`,`ol`,`li`,`div`,`span`,`table`,`thead`,`tbody`,`tr`,`td`,`th`,`blockquote`],ALLOWED_ATTR:[`style`,`class`]}):``,motorTempoRealLigado:!1,calendarState:{month:new Date().getMonth(),year:new Date().getFullYear()},salvarEstadoNavegacao:(e,t)=>{if(!i.usuario)return;let n=JSON.parse(localStorage.getItem(i.getTenantKey(`estado_navegacao`)))||{};e===`fundo`?n.fundo=t:e===`modal`&&(t?n.modal=t:delete n.modal),localStorage.setItem(i.getTenantKey(`estado_navegacao`),JSON.stringify(n))},iniciarRoteadorGlobal:()=>{if(!i.usuario)return;let e=localStorage.getItem(i.getTenantKey(`estado_navegacao`));if(e){let t=JSON.parse(e);t.fundo&&t.fundo.tipo===`lista`?i.renderizarLista(t.fundo.alvo,!0):t.fundo&&t.fundo.tipo===`tela`?i.renderizarTela(t.fundo.alvo,!0):i.renderizarInicio(),t.modal&&t.modal.tipo&&setTimeout(()=>{i.abrirModalCadastro(t.modal.tipo,t.modal.id)},500)}else{let e=window.location.hash.replace(`#`,``).trim();e&&e!==`login`?i.renderizarTela(e,!0):i.renderizarInicio()}},escapeHTML:e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),unescapeHTML:e=>e==null?``:String(e).replace(/&amp;/g,`&`).replace(/&lt;/g,`<`).replace(/&gt;/g,`>`).replace(/&quot;/g,`"`).replace(/&#039;/g,`'`),criarElemento:(e,t=[],n={},r=``)=>{let i=document.createElement(e);t.length>0&&i.classList.add(...t);for(let e in n)if(e.startsWith(`on`)&&typeof n[e]==`function`){let t=e.substring(2).toLowerCase();i.addEventListener(t,n[e])}else i.setAttribute(e,n[e]);return r!==``&&(i.textContent=r),i},getTenantKey:e=>`${e}_${i.usuario&&i.usuario.id?i.usuario.id:`convidado`}`,getPlanoAtual:()=>localStorage.getItem(i.getTenantKey(`escola_plano`))||`Teste`,getDeviceId:()=>{let e=localStorage.getItem(`ptt_device_id`);return e||(e=`dev_`+window.crypto.randomUUID(),localStorage.setItem(`ptt_device_id`,e)),e},aplicarPermissoesDeUsuario:()=>{if(!i.usuario)return;let e=i.usuario.tipo||`Gestor`;document.querySelectorAll(`.sidebar button, .sidebar .menu-item`).forEach(t=>{let n=t.getAttribute(`onclick`)||``,r=!0;e===`Professor`?(n.includes(`mensalidade`)||n.includes(`financeiro`)||n.includes(`inadimplencia`)||n.includes(`relatorio`)||n.includes(`configuracoes`)||n.includes(`aparencia`)||n.includes(`backup`)||n.includes(`plano`)||n.includes(`conta`))&&(r=!1):e===`Secretaria`&&(n.includes(`configuracoes`)||n.includes(`aparencia`)||n.includes(`backup`)||n.includes(`plano`)||n.includes(`dossie`)||n.includes(`conta`))&&(r=!1),t.style.display=r?``:`none`})},verificarBloqueioGeral:e=>{if(!e)return!1;let t=e.plano?e.plano:`Teste`;if(t===`Bloqueado`||e.status===`Bloqueado`)return!0;let n=new Date;if(e.dataExpiracao){let t=new Date(e.dataExpiracao);if(!isNaN(t.getTime()))return n>=t}let r=e.dataCriacao?new Date(e.dataCriacao):n,i=Math.floor((n-r)/(1e3*60*60*24));return t===`Teste`?i>=7:t!==`Premium`&&i>=30},verificarLimites:async e=>{let t=i.getPlanoAtual();if(t===`Premium`||t===`Teste`)return!0;try{if(e===`aluno`){let e=await i.api(`/alunos`),n=(Array.isArray(e)?e:[]).filter(e=>e.status?e.status===`Ativo`:!0),r=t===`Essencial`?20:t===`Profissional`?80:0;if(n.length>=r)return i.showToast(`⚠️ Limite de ${r} alunos ativos atingido no plano ${t}. Faça o upgrade para continuar a crescer!`,`warning`),setTimeout(()=>i.renderizarMeuPlano(),2e3),!1}else if(e===`usuario`){let e=await i.api(`/usuarios`),n=(Array.isArray(e)?e:[]).filter(e=>e.tipo!==`Aluno`&&!e.alunoRefId),r=t===`Essencial`?2:t===`Profissional`?4:0;if(n.length>=r)return i.showToast(`⚠️ Limite de ${r} acessos de equipa atingido no plano ${t}. Faça o upgrade para adicionar mais membros!`,`warning`),setTimeout(()=>i.renderizarMeuPlano(),2e3),!1}return!0}catch{return!1}},verificarPermissao:e=>{let t=i.getPlanoAtual();return t===`Premium`||t===`Teste`?!0:e===`whatsapp`&&t===`Essencial`?(i.showToast(`💎 Funcionalidade disponível a partir do Plano Profissional. Faça o upgrade!`,`warning`),setTimeout(()=>i.renderizarMeuPlano(),1500),!1):e===`dossie`&&t!==`Premium`?(i.showToast(`💎 Exclusivo do Plano Premium. Faça o upgrade para aceder ao Dossiê Executivo!`,`warning`),setTimeout(()=>i.renderizarMeuPlano(),1500),!1):!0},api:async(e,t=`GET`,n=null,r=!1)=>{let a={method:t,headers:{"Content-Type":`application/json`},credentials:`include`,cache:`no-store`};n&&(a.body=JSON.stringify(n));let o=e.replace(/^\/api/,``),s=o.startsWith(`/`)?o:`/${o}`,c=`/api${s}`;if((window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`)&&window.location.port!==`5173`&&(c=`http://localhost:3000${s}`),!navigator.onLine)if([`POST`,`PUT`,`DELETE`].includes(t.toUpperCase())){let r=`Ação de Sistema`;return e.includes(`chamada`)?r=`Registo de Presença`:e.includes(`avaliacoes`)||e.includes(`notas`)?r=`Lançamento de Notas`:e.includes(`alunos`)?r=`Registo de Aluno`:(e.includes(`mensalidades`)||e.includes(`financeiro`))&&(r=`Registo Financeiro`),typeof i.adicionarFilaOffline==`function`&&i.adicionarFilaOffline(e,t,n,r),{success:!0,offline:!0,message:`Salvo no telemóvel aguardando internet.`}}else return r||i.showToast(`Sem conexão para carregar dados novos.`,`warning`),{error:`Sem internet.`,offline:!0};try{let e=await fetch(c,a);if(!e.ok){let t=(await e.json().catch(()=>({}))).error||`Erro no servidor (${e.status})`;return!r&&document.visibilityState===`visible`&&i.showToast(t,`error`),{error:t}}let n=await e.json();return t!==`GET`&&i.usuario&&(typeof i.verificarNotificacoes==`function`&&setTimeout(i.verificarNotificacoes,800),typeof i.sincronizarPerfilUsuarioHeader==`function`&&i.sincronizarPerfilUsuarioHeader()),n}catch(e){if(console.error(`❌ Falha na API [${t} ${c}]:`,e.message),document.visibilityState===`hidden`||r)return t===`GET`?[]:{error:`Rejeitado silenciosamente em background`};let n=e.message===`Failed to fetch`||e.message.includes(`NetworkError`)?`Sem ligação ao servidor Backend (Porta 3000 desligada?)`:e.message;return i.showToast(n,`error`),t===`GET`?[]:{error:n}}},setTitulo:e=>{let t=document.getElementById(`titulo-pagina`);t&&(t.innerText=e)},toggleSub:e=>{document.querySelectorAll(`.submenu`).forEach(t=>{t.id!==e&&(t.style.display=`none`)});let t=document.getElementById(e);t&&(t.style.display=t.style.display===`block`?`none`:`block`)},fecharModal:()=>{document.getElementById(`modal-overlay`).style.display=`none`,typeof i.salvarEstadoNavegacao==`function`&&i.salvarEstadoNavegacao(`modal`,null),sessionStorage.removeItem(`ws_rascunho_modal`);let e=document.querySelector(`.btn-confirm`);e&&(e.style.display=`inline-flex`,e.setAttribute(`onclick`,`App.salvarCadastro()`),e.innerHTML=`💾 Salvar Registro`)},abrirTelaCadastroInst:()=>{document.getElementById(`modal-cadastro-inst`).style.display=`flex`,i.voltarEtapa1()},fecharModalInst:()=>{document.getElementById(`modal-cadastro-inst`).style.display=`none`},voltarEtapa1:()=>{document.getElementById(`etapa-1-email`).style.display=`block`,document.getElementById(`etapa-2-validacao`).style.display=`none`,document.getElementById(`etapa-3-sucesso`).style.display=`none`},enviarCodigoInst:async()=>{console.log(`🔥 Clique recebido no botão de Cadastro!`);let e=document.getElementById(`novo-inst-email`).value,t=document.querySelector(`#etapa-1-email button`);if(!e||!e.includes(`@`))return i.showToast(`Digite um e-mail válido.`,`error`);let n=t.innerText;t.innerText=`Enviando... ⏳`,t.disabled=!0;try{let t=await i.api(`/auth/enviar-codigo`,`POST`,{email:e});t&&t.success?(i.showToast(`Código enviado!`,`success`),document.getElementById(`etapa-1-email`).style.display=`none`,document.getElementById(`etapa-2-validacao`).style.display=`block`):i.showToast(`Erro ao enviar e-mail.`,`error`)}catch{i.showToast(`Erro de servidor.`,`error`)}finally{t.innerText=n,t.disabled=!1}},validarCadastroInst:async()=>{let e=document.getElementById(`novo-inst-email`).value,t=document.getElementById(`novo-inst-codigo`).value.trim(),n=document.getElementById(`novo-inst-pin`).value.trim(),r=document.querySelector(`#etapa-2-validacao button`);if(!t||!n)return i.showToast(`Preencha Código e PIN.`,`error`);let a=r.innerText;r.innerText=`A Validar... ⏳`,r.disabled=!0;try{let r=await i.api(`/auth/validar-cadastro`,`POST`,{email:e,codigo:t,pin:n});r&&r.success?(document.getElementById(`etapa-2-validacao`).style.display=`none`,document.getElementById(`etapa-3-sucesso`).style.display=`block`,typeof confetti==`function`&&confetti(),typeof gtag==`function`&&gtag(`event`,`generate_lead`,{currency:`BRL`,value:0,tipo_conta:`App Gestão PTT`})):i.showToast(r.error||`Dados incorretos.`,`error`)}catch{i.showToast(`Erro de servidor.`,`error`)}finally{r.innerText=a,r.disabled=!1}},renderizarTela:async(e,t=!1)=>{if(!i.usuario&&e!==`login`){i.showToast(`Sessão expirada. Faça login novamente.`,`error`),i.logout();return}document.querySelector(`.sidebar`)&&document.querySelector(`.sidebar`).classList.remove(`active`),document.querySelector(`.mobile-overlay`)&&document.querySelector(`.mobile-overlay`).classList.remove(`active`);let n=i.usuario?i.usuario.tipo:`Gestor`,r=[`mensalidades`,`financeiro`,`inadimplencia`,`configuracoes`,`aparencia`,`backup`,`plano`,`dossie`,`documentos`,`ficha`,`conta`],a=[`configuracoes`,`aparencia`,`backup`,`plano`,`dossie`,`conta`];if(n===`Professor`&&r.includes(e))return i.showToast(`🚫 Acesso restrito. Perfil de Professor não tem permissão para esta área.`,`error`),i.renderizarInicio();if(n===`Secretaria`&&a.includes(e))return i.showToast(`🚫 Acesso restrito. Perfil de Secretaria não tem permissão para esta área.`,`error`),i.renderizarInicio();if(!t&&e!==`login`&&e!==`inicio`?window.history.pushState({tela:e},``,`#${e}`):!t&&e===`inicio`&&window.history.pushState({tela:`inicio`},``,window.location.pathname),e!==`login`&&i.salvarEstadoNavegacao(`fundo`,{tipo:`tela`,alvo:e}),typeof gtag==`function`&&gtag(`event`,`page_view`,{page_title:`Tela: `+e,page_location:window.location.href+`#`+e,page_path:`/`+e}),e===`chamada`)i.setTitulo(`Chamada`),i.renderizarChamadaPro();else if(e===`avaliacoes`||e===`notas`)i.setTitulo(`Notas`),i.renderizarAvaliacoesPro();else if(e===`calendario`)i.setTitulo(`Calendário`),i.renderizarCalendarioPro();else if(e===`planejamento`)i.setTitulo(`Planejamento`),i.renderizarPlanejamentoPro();else if(e===`boletins`)i.setTitulo(`Boletim`),i.renderizarBoletimVisual();else if(e===`mensalidades`||e===`financeiro`)i.setTitulo(`Financeiro`),i.renderizarFinanceiroPro();else if(e===`inadimplencia`)i.setTitulo(`Inadimplência`),i.renderizarInadimplencia();else if(e===`configuracoes`)i.setTitulo(`Configurações`),i.renderizarConfiguracoes();else if(e===`aparencia`)i.renderizarConfiguracoesAparencia();else if(e===`backup`)i.renderizarBackup();else if(e===`plano`)i.renderizarMeuPlano();else if(e===`conta`)typeof i.renderizarMinhaConta==`function`&&i.renderizarMinhaConta();else if(e.startsWith(`rel_`)){let t=e.replace(`rel_`,``);if(t===`dossie`&&typeof i.verificarPermissao==`function`&&!i.verificarPermissao(`dossie`))return i.renderizarInicio();typeof i.renderizarRelatorioModulo==`function`&&i.renderizarRelatorioModulo(t)}else i.renderizarInicio()},renderizarConfig:e=>{e===`perfil`?i.renderizarTela(`configuracoes`):e===`aparencia`?i.renderizarTela(`aparencia`):e===`conta`?i.renderizarTela(`conta`):e===`backup`&&i.renderizarTela(`backup`)},renderizarRelatorio:e=>{i.renderizarTela(`rel_`+e)},renderizarMeuPlano:async()=>{i.setTitulo(`Gerenciar Assinatura`);let e=document.getElementById(`app-content`),t=0,n=1;try{let[e,r,a]=await Promise.all([i.api(`/escola`,`GET`,null,!0),i.api(`/alunos`,`GET`,null,!0),i.api(`/usuarios`,`GET`,null,!0)]);e&&!e.error&&(e.plano&&localStorage.setItem(i.getTenantKey(`escola_plano`),e.plano),localStorage.setItem(i.getTenantKey(`escola_perfil`),JSON.stringify(e)),typeof i.atualizarUIHeader==`function`&&i.atualizarUIHeader(e)),Array.isArray(r)&&(t=r.filter(e=>e.status?e.status===`Ativo`:!0).length),Array.isArray(a)&&(n=a.filter(e=>e.tipo!==`Aluno`&&!e.alunoRefId).length||1)}catch{}let r=localStorage.getItem(i.getTenantKey(`escola_perfil`)),a=r?JSON.parse(r):{},o=a.plano?a.plano:i.getPlanoAtual(),s=0,c=``,l=new Date().getTime();if(a.dataExpiracao){let e=new Date(a.dataExpiracao);if(!isNaN(e.getTime())){let t=e.getTime()-l;s=Math.ceil(t/(1e3*60*60*24)),c=` • Vencimento: ${e.toLocaleDateString(`pt-BR`)}`}}else if(o===`Teste`){let e=l-(a.dataCriacao?new Date(a.dataCriacao).getTime():l);s=7-Math.floor(e/(1e3*60*60*24))}else if(a.dataCriacao){let e=l-new Date(a.dataCriacao).getTime();s=30-Math.floor(e/(1e3*60*60*24))}s<0&&(s=0);let u=o===`Premium`?`#f39c12`:o===`Profissional`?`#3498db`:`#27ae60`,d=o===`Teste`?`<strong style="color:var(--warning); background:rgba(243,156,18,0.1); padding:8px 20px; border-radius:20px; border:2px solid var(--warning); font-size:16px; display:inline-block;">⏳ Plano Teste (${s} dias restantes${c})</strong>`:`<strong style="color:${u}; background:rgba(0,0,0,0.02); padding:8px 20px; border-radius:20px; border:2px solid ${u}; font-size:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05); display:inline-block;">💎 PLANO ATUAL: ${i.escapeHTML(o).toUpperCase()} (${s} dias restantes${c})</strong>`,f=o===`Essencial`?20:o===`Profissional`?80:0,p=f>0?Math.min(100,Math.round(t/f*100)):25,m=f>0&&p>=85?`#e74c3c`:`#3498db`,h=o===`Essencial`?2:o===`Profissional`?4:0,g=h>0?Math.min(100,Math.round(n/h*100)):25,_=h>0&&g>=100?`#f39c12`:`#27ae60`,v=Math.min(100,Math.max(5,Math.round(s/(o===`Teste`?7:30)*100))),y=s<=5?`#e74c3c`:`#8e44ad`,b=Array.isArray(a.historicoLicencas)?a.historicoLicencas:[],x=b.length>0?`
            <div class="card" style="margin-top: 35px; padding: 25px;">
                <h3 style="margin: 0 0 15px 0; color: var(--card-text); font-size: 18px;">📜 Histórico de Ativações e Renovações</h3>
                <div class="table-responsive-wrapper">
                    <table style="width:100%; border-collapse:collapse; font-size:13px;">
                        <thead>
                            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left; color:#475569;">
                                <th style="padding:10px 12px;">Recibo</th>
                                <th style="padding:10px 12px;">Data da Ativação</th>
                                <th style="padding:10px 12px;">Plano</th>
                                <th style="padding:10px 12px;">Período Somado</th>
                                <th style="padding:10px 12px;">Chave / Modo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${b.map(e=>`
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:10px 12px; font-family:monospace; font-weight:bold; color:#64748b;">${i.escapeHTML(e.id||`-`)}</td>
                                    <td style="padding:10px 12px;">${e.data?new Date(e.data).toLocaleDateString(`pt-BR`):`-`}</td>
                                    <td style="padding:10px 12px; font-weight:bold; color:#2563eb;">${i.escapeHTML(e.plano||`-`)}</td>
                                    <td style="padding:10px 12px; color:#16a34a; font-weight:bold;">+${e.diasAdicionados||30} dias</td>
                                    <td style="padding:10px 12px; font-family:monospace;">${i.escapeHTML(e.pin||e.origem||`PIN`)}</td>
                                </tr>
                            `).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>
        `:``;e.innerHTML=`
            <div class="card" style="text-align:center; padding: 35px 20px; border-top: 5px solid var(--accent);">
                <h2 style="margin: 0 0 15px 0; color: var(--card-text);">Evolua a sua Instituição</h2>
                <div style="margin-bottom: 25px;">${d}</div>

                <!-- TERMÓMETRO DE CONSUMO DA ASSINATURA -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:15px; max-width:820px; margin: 0 auto 30px auto; text-align:left;">
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; color:#475569; margin-bottom:8px;">
                            <span>👨‍🎓 Alunos Ativos</span>
                            <span style="color:${m};">${t} / ${f>0?f:`Ilimitado`}</span>
                        </div>
                        <div style="width:100%; height:8px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                            <div style="width:${p}%; height:100%; background:${m}; border-radius:10px; transition:width 0.4s ease;"></div>
                        </div>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; color:#475569; margin-bottom:8px;">
                            <span>👥 Equipa Administrativa</span>
                            <span style="color:${_};">${n} / ${h>0?h:`Ilimitado`}</span>
                        </div>
                        <div style="width:100%; height:8px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                            <div style="width:${g}%; height:100%; background:${_}; border-radius:10px; transition:width 0.4s ease;"></div>
                        </div>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; color:#475569; margin-bottom:8px;">
                            <span>⏳ Ciclo de Validade</span>
                            <span style="color:${y};">${s} dia(s)</span>
                        </div>
                        <div style="width:100%; height:8px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                            <div style="width:${v}%; height:100%; background:${y}; border-radius:10px; transition:width 0.4s ease;"></div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #eee;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Já efetuou o pagamento ou recebeu um PIN?</h4>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <input type="text" id="input-novo-pin" placeholder="Insira a sua Chave de Ativação (PIN)" style="flex:1; min-width: 200px; padding:12px; border-radius:6px; border:1px solid #ccc; text-align:center; letter-spacing:2px; font-weight:bold; font-size:16px;">
                        
                        <button class="btn-primary" style="width:auto; margin:0;" onclick="App.ativarNovoPlano(event)">Validar PIN</button>
                    </div>
                    <p style="font-size:11px; color:#999; margin: 10px 0 0 0;">Os dias do novo PIN são somados automaticamente à sua validade atual.</p>
                </div>
            </div>

            <h3 style="text-align: center; color: var(--card-text); margin-top: 40px;">Escolha o pacote ideal para a sua escola</h3>
            
            <div class="pricing-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:20px;">
                <div class="pricing-card" style="background:#fff; border:1px solid #eee; border-radius:12px; padding:30px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Essencial</h3>
                    <div style="font-size:32px; font-weight:bold; color:#27ae60; margin:15px 0;">R$ 97<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">Para pequenos cursos e professores particulares.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Até 20 Alunos Ativos</li>
                        <li style="margin-bottom:10px;">✅ 2 Acessos (Gestor + 1 Equipe)</li>
                        <li style="margin-bottom:10px;">✅ Gestão Pedagógica</li>
                        <li style="margin-bottom:10px;">✅ Controle Financeiro</li>
                        <li style="margin-bottom:10px; color:#ccc;">❌ Cobrança via WhatsApp</li>
                        <li style="color:#ccc;">❌ Dossiê Executivo</li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:transparent; color:#27ae60; border:2px solid #27ae60; justify-content:center;" onclick="App.comprarPlano('Essencial', 'https://mpago.la/2LcgaA1')">Assinar Essencial</button>
                </div>

                <div class="pricing-card featured" style="background:#fff; border:2px solid #3498db; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(52,152,219,0.15); position:relative; transform:scale(1.02);">
                    <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#3498db; color:#fff; font-size:11px; font-weight:bold; padding:4px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:1px;">Mais Vendido</div>
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Profissional</h3>
                    <div style="font-size:32px; font-weight:bold; color:#3498db; margin:15px 0;">R$ 147<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">A solução completa para acabar com a inadimplência.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Até 80 Alunos Ativos</li>
                        <li style="margin-bottom:10px;">✅ 4 Acessos (Gestor + 3 Equipe)</li>
                        <li style="margin-bottom:10px;">✅ Gestão Pedagógica</li>
                        <li style="margin-bottom:10px;">✅ Financeiro Completo</li>
                        <li style="margin-bottom:10px;">✅ <strong>Cobrança WhatsApp</strong></li>
                        <li style="color:#ccc;">❌ Dossiê Executivo</li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:#3498db; justify-content:center;" onclick="App.comprarPlano('Profissional', 'https://mpago.la/1KmmwZf')">Assinar Profissional</button>
                </div>

                <div class="pricing-card" style="background:#fff; border:1px solid #eee; border-radius:12px; padding:30px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Premium</h3>
                    <div style="font-size:32px; font-weight:bold; color:#f39c12; margin:15px 0;">R$ 297<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">Para escolas estruturadas e sem limites operacionais.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Alunos Ilimitados</li>
                        <li style="margin-bottom:10px;">✅ Acessos Ilimitados</li>
                        <li style="margin-bottom:10px;">✅ Gestão Pedagógica</li>
                        <li style="margin-bottom:10px;">✅ Financeiro Completo</li>
                        <li style="margin-bottom:10px;">✅ Cobrança WhatsApp</li>
                        <li>✅ <strong>Dossiê Executivo</strong></li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:transparent; color:#f39c12; border:2px solid #f39c12; justify-content:center;" onclick="App.comprarPlano('Premium', 'https://mpago.la/1DNyscL')">Assinar Premium</button>
                </div>
            </div>

            ${x}
        `},comprarPlano:(e,t)=>{i.showToast(`A redirecionar para o pagamento seguro do plano ${e}...`,`info`),setTimeout(()=>{window.open(t,`_blank`)},1500)},ativarNovoPlano:async e=>{e&&e.preventDefault();let t=document.getElementById(`input-novo-pin`);if(!t)return;let n=t.value.trim().toUpperCase();if(!n)return i.showToast(`Por favor, insira o PIN recebido.`,`warning`);let r=document.querySelector(`button[onclick="App.ativarNovoPlano(event)"]`),a=r?r.innerText:`Validar PIN`;r&&(r.innerText=`A validar... ⏳`,r.disabled=!0);try{let e=await i.api(`/escola/validar-pin`,`POST`,{pin:n});if(!e||!e.success||!e.plano){i.showToast(e&&e.error?e.error:`PIN inválido, expirado ou já utilizado.`,`error`);return}let r=e.plano,a=e.dataExpiracao;localStorage.setItem(i.getTenantKey(`escola_plano`),r);let o=localStorage.getItem(i.getTenantKey(`escola_perfil`)),s=o?JSON.parse(o):{};s.plano=r,a&&(s.dataExpiracao=a),localStorage.setItem(i.getTenantKey(`escola_perfil`),JSON.stringify(s)),i.atualizarUIHeader(s),i.showToast(`🎉 PIN validado! Plano ${r} ativo (+${e.diasAdicionados||30} dias).`,`success`),t.value=``,await i.carregarDadosEscola(!0),i.renderizarInicio()}catch{i.showToast(`Erro ao comunicar com a base de dados.`,`error`)}finally{r&&(r.innerText=a,r.disabled=!1)}},abrirModalCadastro:async(e,t)=>{!t&&e===`aluno`&&!await i.verificarLimites(`aluno`)||(i.salvarEstadoNavegacao(`modal`,{tipo:e,id:t||null}),typeof i.abrirModalCadastroModulo==`function`&&i.abrirModalCadastroModulo(e,t))},abrirRelatorioFrequencia:async(e,t)=>{let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Frequência Escolar: ${i.escapeHTML(t)}`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A processar o planejamento atual... ⏳</p>`;let r=document.querySelector(`.btn-confirm`);r&&(r.style.display=`none`),i.contextoFrequencia={idAluno:e,nomeAluno:t},await i.renderizarFrequenciaView(`ativo`)},renderizarFrequenciaView:async(e,t=null)=>{let{idAluno:n,nomeAluno:r}=i.contextoFrequencia,a=document.getElementById(`modal-form-content`);try{if(!i.contextoFrequencia.dadosCache){let[e,t]=await Promise.all([i.api(`/chamadas`),i.api(`/planejamentos`)]);i.contextoFrequencia.dadosCache={chamadas:e,planejamentos:t}}let o=i.contextoFrequencia.dadosCache.chamadas,s=i.contextoFrequencia.dadosCache.planejamentos,c=o.filter(e=>e.idAluno===n).sort((e,t)=>new Date(t.data)-new Date(e.data)),l=s.filter(e=>e.idAluno===n),u=l.filter(e=>e.status!==`Arquivado`),d=l.filter(e=>e.status===`Arquivado`),f=document.querySelector(`#modal-overlay .btn-cancel`);if(f){let t=f.parentNode;if(document.querySelectorAll(`.btn-modal-dinamico`).forEach(e=>e.remove()),!f.dataset.limpezaAtiva){let e=f.onclick;f.onclick=function(t){document.querySelectorAll(`.btn-modal-dinamico`).forEach(e=>e.remove()),e&&e.apply(this,arguments)},f.dataset.limpezaAtiva=`true`}if(e===`ativo`||e===`ver_arquivado`){let e=document.createElement(`button`);e.className=`btn-modal-dinamico`,e.innerHTML=`🖨️ Imprimir`,e.style.cssText=`background:#27ae60; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease;`,e.onmouseover=()=>e.style.background=`#1e8449`,e.onmouseout=()=>e.style.background=`#27ae60`,e.onclick=()=>i.imprimirDossieFrequencia(),t.insertBefore(e,f)}if(e===`ativo`&&d.length>0){let e=document.createElement(`button`);e.className=`btn-modal-dinamico`,e.innerHTML=`🗄️ Arquivados`,e.style.cssText=`background:#7f8c8d; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;`,e.onmouseover=()=>e.style.background=`#95a5a6`,e.onmouseout=()=>e.style.background=`#7f8c8d`,e.onclick=e=>{e.target.innerHTML=`⏳ A abrir...`,e.target.style.opacity=`0.8`,setTimeout(()=>i.renderizarFrequenciaView(`lista_arquivados`),10)},t.insertBefore(e,f)}else if(e===`lista_arquivados`||e===`ver_arquivado`){let n=e===`lista_arquivados`,r=document.createElement(`button`);r.className=`btn-modal-dinamico`,r.innerHTML=n?`⬅️ Voltar ao Atual`:`⬅️ Voltar à Lista`,r.style.cssText=`background:#3498db; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;`,r.onmouseover=()=>r.style.background=`#2980b9`,r.onmouseout=()=>r.style.background=`#3498db`,r.onclick=e=>{e.target.innerHTML=`⏳ A voltar...`,e.target.style.opacity=`0.8`,setTimeout(()=>i.renderizarFrequenciaView(n?`ativo`:`lista_arquivados`),10)},t.insertBefore(r,f)}}if(e===`lista_arquivados`){if(document.getElementById(`modal-titulo`).innerText=`🗄️ Histórico Arquivado: ${i.escapeHTML(r)}`,d.length===0){a.innerHTML=`<p style="text-align:center; padding:30px; color:#999;">Nenhum planejamento arquivado encontrado para este aluno.</p>`;return}a.innerHTML=`
                    <div style="max-height:50vh; overflow-y:auto; padding-right:10px;">
                        <p style="font-size:13px; color:#666; margin-bottom:15px; text-align:center;">Selecione um planejamento antigo para ver o dossiê de presenças.</p>
                        ${d.map(e=>{let t=`Sem datas registadas`;return e.aulas&&e.aulas.length>0&&(t=`${e.aulas[0].data} até ${e.aulas[e.aulas.length-1].data}`),`
                    <div onclick="App.renderizarFrequenciaView('ver_arquivado', '${e.id}')" style="background:#f9f9f9; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='#f9f9f9'">
                        <div>
                            <div style="font-weight:bold; color:#2c3e50; font-size:14px;">📄 ${i.escapeHTML(e.disciplina||`Curso Geral`)}</div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">📅 Período: ${t}</div>
                        </div>
                        <span style="font-size:20px; color:#aaa;">➡️</span>
                    </div>`}).join(``)}
                    </div>
                `;return}let p=null,m=`Frequência Escolar: ${i.escapeHTML(r)}`;e===`ativo`?p=u.length>0?u[0]:null:e===`ver_arquivado`&&(p=d.find(e=>e.id===t),m=`🗄️ Arquivo: ${i.escapeHTML(r)}`),document.getElementById(`modal-titulo`).innerText=m;let h=e=>e.split(`/`).reverse().join(`-`),g=c;if(p&&p.aulas&&p.aulas.length>0){let e=p.aulas.map(e=>h(e.data)).sort(),t=e[0],n=e[e.length-1];g=c.filter(e=>e.data>=t&&e.data<=n)}else if(e===`ativo`&&d.length>0){let e=d.map(e=>{if(!e.aulas||e.aulas.length===0)return null;let t=e.aulas.map(e=>h(e.data)).sort();return{inicio:t[0],fim:t[t.length-1]}}).filter(e=>e);g=c.filter(t=>!e.some(e=>t.data>=e.inicio&&t.data<=e.fim))}let _=0,v=0,y=0,b=``;if(g.length===0)b=`<p style="text-align:center; padding:30px; color:#999; font-size:14px;">Nenhum registo de chamada encontrado para este ${e===`ativo`?`período letivo`:`arquivo`}.</p>`;else{let e={},t=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`];g.forEach(n=>{let r=new Date(n.data+`T00:00:00`),i=`${t[r.getMonth()]} de ${r.getFullYear()}`;e[i]||(e[i]=[]),e[i].push(n);let a=0;if(n.duracao){let[e,t]=n.duracao.split(`:`);a=(parseInt(e)||0)*60+(parseInt(t)||0)}n.status===`Presença`||n.status===`Reposição`?_+=a:n.status===`Falta Justificada`||n.status===`Justificada`?y+=a:n.status===`Falta`&&(v+=a)});for(let t in e)b+=`<div style="background:#f4f6f7; padding:10px 15px; margin-top:15px; border-radius:8px 8px 0 0; font-weight:bold; color:#2c3e50; border:1px solid #eee; border-bottom:none; font-size:13px; text-transform:uppercase;">📅 ${t}</div>`,b+=`<table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #eee; margin-bottom:10px; background:#fff;"><tbody>`,e[t].forEach(e=>{let t=e.data.split(`-`).reverse().join(`/`),n=e.status===`Presença`||e.status===`Reposição`?`#27ae60`:e.status===`Falta`?`#e74c3c`:`#f39c12`;b+=`<tr style="border-bottom:1px solid #eee;">
                                        <td style="padding:10px 15px; width:30%; font-weight:500;">${t}</td>
                                        <td style="padding:10px 15px; font-weight:bold; color:${n};">${e.status}</td>
                                        <td style="padding:10px 15px; text-align:right; color:#666; font-weight:500;">${e.duracao||`00:00`} h</td>
                                      </tr>`}),b+=`</tbody></table>`}let x=e=>`${String(Math.floor(e/60)).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)} h`,S=`
                <div class="kpi-container" style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap; page-break-inside: avoid;">
                    <div style="flex:1; min-width:90px; background:#eafaf1; border:1px solid #27ae60; padding:15px 10px; border-radius:8px; text-align:center;">
                        <div style="font-size:10px; color:#27ae60; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Presenças</div>
                        <div style="font-size:18px; font-weight:bold; color:#1e8449;">${x(_)}</div>
                    </div>
                    <div style="flex:1; min-width:90px; background:#fef5e7; border:1px solid #f39c12; padding:15px 10px; border-radius:8px; text-align:center;">
                        <div style="font-size:10px; color:#d68910; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Justificadas</div>
                        <div style="font-size:18px; font-weight:bold; color:#b9770e;">${x(y)}</div>
                    </div>
                    <div style="flex:1; min-width:90px; background:#fdedec; border:1px solid #e74c3c; padding:15px 10px; border-radius:8px; text-align:center;">
                        <div style="font-size:10px; color:#e74c3c; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Faltas</div>
                        <div style="font-size:18px; font-weight:bold; color:#c0392b;">${x(v)}</div>
                    </div>
                </div>`;a.innerHTML=`
                ${e===`ativo`&&p?`<div style="background:#e8f4f8; border:1px solid #3498db; color:#2980b9; padding:8px 12px; border-radius:6px; margin-bottom:15px; font-size:12px; font-weight:bold; text-align:center;">🟢 Dossiê do Planejamento Letivo Atual</div>`:``}
                ${e===`ver_arquivado`?`<div style="background:#fdf2f2; border:1px solid #e74c3c; color:#c0392b; padding:8px 12px; border-radius:6px; margin-bottom:15px; font-size:12px; font-weight:bold; text-align:center;">🗄️ Exibindo Frequência do Histórico Arquivado</div>`:``}
                <div style="max-height:45vh; overflow-y:auto; padding-right:10px;">${b}</div>
                ${S}
            `}catch{a.innerHTML=`<p style="color:red; text-align:center;">Erro ao processar as horas de frequência.</p>`}},imprimirDossieFrequencia:()=>{let e=JSON.parse(localStorage.getItem(i.getTenantKey(`escola_perfil`)))||{},t=e.nome||`Instituição de Ensino`,n=e.cnpj?`CNPJ: ${e.cnpj}`:``,r=e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?`<img src="${e.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">`:``,a=document.getElementById(`modal-titulo`).innerText,o=document.getElementById(`modal-form-content`).cloneNode(!0);o.querySelectorAll(`div[style*="max-height"]`).forEach(e=>{e.style.maxHeight=`none`,e.style.overflowY=`visible`,e.style.paddingRight=`0`});let s=document.createElement(`iframe`);s.style.position=`absolute`,s.style.width=`0px`,s.style.height=`0px`,s.style.border=`none`,document.body.appendChild(s);let c=s.contentWindow.document;c.open(),c.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impressão - ${a}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 30px; 
                        color: #333; 
                        line-height: 1.5;
                    }
                    .header-escola {
                        display: flex; 
                        align-items: center; 
                        border-bottom: 2px solid #3498db; 
                        padding-bottom: 15px; 
                        margin-bottom: 25px;
                    }
                    .header-escola img { margin-right: 20px; }
                    .header-escola h2 { margin: 0; color: #2c3e50; font-size: 24px; }
                    .header-escola p { margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; }
                    
                    .titulo-doc {
                        text-align: center; 
                        color: #2c3e50; 
                        margin-bottom: 30px;
                        text-transform: uppercase;
                        font-size: 18px;
                        background: #f4f6f7;
                        padding: 10px;
                        border-radius: 8px;
                        font-weight: bold;
                    }
                    
                    /* Configurações perfeitas para folha A4 */
                    @media print {
                        body { padding: 0; }
                        @page { margin: 15mm; }
                        /* Evita que o resumo fique dividido em duas folhas */
                        .kpi-container { page-break-inside: avoid !important; margin-top: 30px !important; }
                        table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="header-escola">
                    ${r}
                    <div>
                        <h2>${i.escapeHTML(t)}</h2>
                        <p>${i.escapeHTML(n)}</p>
                    </div>
                </div>
                
                <div class="titulo-doc">📄 ${a}</div>
                
                ${o.innerHTML}
                
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento gerado em ${new Date().toLocaleString(`pt-BR`)} pelo Sistema Escolar
                </div>
            </body>
            </html>
        `),c.close(),setTimeout(()=>{s.contentWindow.focus(),s.contentWindow.print(),setTimeout(()=>{document.body.removeChild(s)},1500)},500)},abrirModalVenda:async(e,t)=>{let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Registrar Venda - ${i.escapeHTML(t)}`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Carregando estoque... ⏳</p>`;try{let n=await i.api(`/estoques`),r=Array.isArray(n)?n:[],a=`<option value="">-- Selecione um Produto/Serviço --</option>`;r.forEach(e=>{let t=parseInt(e.quantidade)||0,n=parseFloat(e.valor)||0;a+=`<option value="${e.id}" data-nome="${i.escapeHTML(e.nome)}" data-valor="${n}">📦 ${i.escapeHTML(e.nome)} (Estoque: ${t} | R$ ${n.toFixed(2)})</option>`}),a+=`<option value="avulso">✏️ Outro Item (Digitar Manualmente)</option>`;let o=new Date().toISOString().split(`T`)[0],s=`
                <div style="background:#f4f6f7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #27ae60;">
                    <h4 style="margin:0 0 10px 0; color:#2c3e50;">🛒 Detalhes da Compra</h4>
                    
                    <div class="input-group">
                        <label>Item / Serviço Comprado</label>
                        <select id="v-item-select" onchange="App.selecionarItemVenda(this)" style="font-weight:bold; padding:12px; width:100%; border-radius:8px; border:1px solid #ccc; margin-bottom:5px; cursor:pointer;">
                            ${a}
                        </select>
                        <input type="text" id="v-item" placeholder="Digite o nome do item avulso..." style="display:none; width:100%; padding:12px; border-radius:8px; border:1px solid #ccc; margin-top:5px;">
                        <input type="hidden" id="v-item-id" value="">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top:10px;">
                        <div class="input-group"><label>Valor (R$)</label><input type="number" id="v-valor" step="0.01" placeholder="0.00" style="padding:12px; border-radius:8px;"></div>
                        <div class="input-group"><label>Data da Venda</label><input type="date" id="v-data" value="${o}" style="padding:12px; border-radius:8px;"></div>
                    </div>
                    
                    <div class="input-group"><label>Forma de Pagamento</label>
                        <select id="v-forma" style="font-weight:bold; padding:12px; border-radius:8px; cursor:pointer;">
                            <option value="PIX">PIX</option>
                            <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                            <option value="Cartão de Débito">💳 Cartão de Débito</option>
                            <option value="Dinheiro">💵 Dinheiro</option>
                            <option value="Pendente (Fiado)">⚠️ Deixar Pendente (Fiado)</option>
                        </select>
                    </div>
                    <div class="input-group"><label>Descrição / Observação Adicional</label><textarea id="v-desc" rows="2" placeholder="Detalhes opcionais..." style="padding:12px; border-radius:8px;"></textarea></div>
                    <input type="hidden" id="v-idaluno" value="${i.escapeHTML(e)}">
                    <input type="hidden" id="v-nomealuno" value="${i.escapeHTML(t)}">
                </div>`;document.getElementById(`modal-form-content`).innerHTML=s;let c=document.querySelector(`.btn-confirm`);c.setAttribute(`onclick`,`App.salvarVenda()`),c.innerHTML=`💾 Registrar Venda`,c.style.display=`inline-flex`}catch{document.getElementById(`modal-form-content`).innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o estoque.</p>`}},selecionarItemVenda:e=>{let t=document.getElementById(`v-item`),n=document.getElementById(`v-valor`),r=document.getElementById(`v-item-id`);if(e.value===`avulso`)t.style.display=`block`,t.value=``,n.value=``,r.value=``,t.focus();else if(e.value!==``){t.style.display=`none`;let i=e.options[e.selectedIndex];t.value=i.getAttribute(`data-nome`),n.value=i.getAttribute(`data-valor`),r.value=e.value}else t.style.display=`none`,t.value=``,n.value=``,r.value=``},salvarVenda:async()=>{let e=document.getElementById(`v-idaluno`).value,t=document.getElementById(`v-nomealuno`).value,n=document.getElementById(`v-item`).value.trim(),r=document.getElementById(`v-item-id`).value,a=document.getElementById(`v-valor`).value,o=document.getElementById(`v-data`).value,s=document.getElementById(`v-forma`).value,c=document.getElementById(`v-desc`).value;if(!n||!a||!o)return i.showToast(`Preencha o item, valor e data.`,`error`);let l=s===`Pendente (Fiado)`?`Pendente`:`Pago`,u=`Venda: ${n} | Pagto: ${s} ${c?` | Obs: `+c:``}`,d={id:window.crypto.randomUUID(),idCarne:`VENDA_${window.crypto.randomUUID().split(`-`)[0].toUpperCase()}`,idAluno:e,alunoNome:t,valor:a,vencimento:o,status:l,descricao:u,tipo:`Receita`,dataGeracao:new Date().toLocaleDateString(`pt-BR`)},f=document.querySelector(`.btn-confirm`),p=f?f.innerHTML:`💾 Registrar Venda`;f&&(f.innerHTML=`⏳ Registrando...`,f.disabled=!0),document.body.style.cursor=`wait`;try{if(await i.api(`/financeiro`,`POST`,d),r){let e=await i.api(`/estoques/${r}`);if(e&&e.id){let t=parseInt(e.quantidade)||0;t>0&&--t,await i.api(`/estoques/${r}`,`PUT`,{...e,quantidade:t})}}i.showToast(`Venda registrada e baixa no estoque efetuada!`,`success`),i.fecharModal()}catch{i.showToast(`Erro ao registrar venda.`,`error`)}finally{f&&(f.innerHTML=p,f.disabled=!1),document.body.style.cursor=`default`}},renderizarLista:async(e,t=!1)=>{if(!i.usuario){i.logout();return}document.querySelector(`.sidebar`)&&document.querySelector(`.sidebar`).classList.remove(`active`),document.querySelector(`.mobile-overlay`)&&document.querySelector(`.mobile-overlay`).classList.remove(`active`),i.salvarEstadoNavegacao(`fundo`,{tipo:`lista`,alvo:e}),t||window.history.pushState({lista:e},``,`#${e}`),i.entidadeAtual=e;let n=e.charAt(0).toUpperCase()+e.slice(1)+`s`;i.setTitulo(`Gerenciar ${n}`);let r=document.getElementById(`app-content`),a=e===`financeiro`?`financeiro`:e+`s`,o=`
            <div class="toolbar" style="max-width: 800px; margin: 0 auto; display: flex; gap: 15px; text-align: left; flex-wrap:wrap;">
                <div class="search-wrapper" style="flex: 1; min-width:250px; position: relative;">
                    <span class="search-icon" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                    <input type="text" id="input-busca" class="search-input-modern" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee;" placeholder="Pesquisar..." oninput="App.filtrarTabelaReativa()">
                </div>
                <button class="btn-cancel" style="color:#c0392b; border: 1px solid #c0392b; background: transparent; padding: 0 20px; height: 45px; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" onclick="App.excluirEmLoteCadastros('${e}')">🗑️ Excluir Vários</button>
                <button class="btn-new-modern" onclick="${e===`financeiro`?`App.renderizarTela('mensalidades')`:`App.abrirModalCadastro('${e}')`}"><span>＋</span> NOVO REGISTRO</button>
            </div>`;r.innerHTML=`
            <div style="text-align:center; margin-bottom:30px;">
                ${i.UI?i.UI.card(`Consultar ${n}`,`Utilize o campo abaixo para localizar registros.`,o,`100%`):o}
            </div>
            <div id="container-tabela">
                <div style="text-align:center; padding: 60px; color:#94a3b8;">
                    <span style="font-size: 35px; display: block; margin-bottom: 15px; animation: piscarSuave 1s infinite;">⏳</span>
                    <span style="font-weight: bold;">A buscar dados no servidor...</span>
                </div>
            </div>`;let s=sessionStorage.getItem(`ws_filtro_${e}`);if(s){let e=document.getElementById(`input-busca`);e&&(e.value=s)}try{i.listaCache=await i.api(`/${a}`),i.filtrarTabelaReativa()}catch{let e=document.getElementById(`container-tabela`);e&&(e.innerHTML=`<p style="text-align:center; padding:30px; color:#e74c3c;">Falha na comunicação com o servidor.</p>`)}},filtrarTabelaReativa:()=>{let e=document.querySelector(`input[placeholder*="Pesquisar"], #busca-tabela`),t=document.getElementById(`container-tabela`);if(!e||!t)return;if(i.listaCache&&i.listaCache.error){t.innerHTML=`<p style="text-align:center; padding:30px; color:#e74c3c;"><b>Erro de Servidor:</b> ${i.escapeHTML(i.listaCache.error)}</p>`;return}let n=e.value.toLowerCase();if(i.entidadeAtual&&sessionStorage.setItem(`ws_filtro_${i.entidadeAtual}`,e.value),!Array.isArray(i.listaCache)){t.innerHTML=`<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado ou carregamento falhou.</p>`;return}let r=n.length===0?i.listaCache:i.listaCache.filter(e=>(e.nome||e.alunoNome||e.descricao||``).toLowerCase().includes(n));t.innerHTML=`<div class="card" style="animation: fadeIn 0.3s ease; padding:0; overflow:hidden;">${i.gerarTabelaHTML(r)}</div>`},gerarTabelaHTML:e=>{if(!e.length)return`<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado.</p>`;let t=i.entidadeAtual,n={estrutura:(e,t)=>`<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse;"><thead><tr>${e}</tr></thead><tbody>${t}</tbody></table></div>`,th:(e,t=`left`)=>`<th style="text-align:${t}; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; color:#2c3e50;">${e}</th>`,td:(e,t=`left`)=>`<td style="text-align:${t}; padding:15px; border-bottom:1px solid #eee; color:#333;">${e}</td>`,tr:e=>`<tr style="transition: background 0.2s;">${e}</tr>`,acoes:e=>`<div style="display:flex; gap:5px; justify-content:flex-end; align-items:center;">${e.join(``)}</div>`,btn:(e,t,n,r)=>`<button class="btn-edit" style="background:${t}; border:none; color:white; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="${n}" title="${r}">${e}</button>`},r=`<th style="width:40px; text-align:center; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheckCadastros(this)" style="cursor:pointer; transform:scale(1.2);"></th>`,a=``;t===`aluno`&&(a=r+n.th(`Nome`)+n.th(`Turma`)+n.th(`Status`)+n.th(`WhatsApp`)+n.th(`Ações`,`right`)),t===`turma`&&(a=r+n.th(`Turma`)+n.th(`Dia`)+n.th(`Horário`)+n.th(`Curso`)+n.th(`Ações`,`right`)),t===`curso`&&(a=r+n.th(`Curso`)+n.th(`Carga`)+n.th(`Ações`,`right`)),t===`financeiro`&&(a=r+n.th(`Ref (Aluno)`)+n.th(`Descrição`)+n.th(`Vencimento`)+n.th(`Valor`)+n.th(`Status`)+n.th(`Ações`,`right`)),t===`estoque`&&(a=r+n.th(`Item`)+n.th(`Código`)+n.th(`Qtd Atual`)+n.th(`Mínimo (Alerta)`)+n.th(`Valor`)+n.th(`Status`)+n.th(`Ações`,`right`));let o=e.map(e=>{let r=``,a=`<td style="text-align:center; padding:15px; border-bottom:1px solid #eee;"><input type="checkbox" class="chk-cadastro" value="${e.id}" style="cursor:pointer; transform:scale(1.2);"></td>`;if(r+=a,t===`aluno`){let t=e.status||`Ativo`,a=t===`Ativo`?`#27ae60`:t===`Trancado`?`#f39c12`:`#e74c3c`,o=`<span style="background:${a}20; color:${a}; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; border: 1px solid ${a}50;">${t}</span>`,s=`<a href="javascript:void(0)" onclick="App.abrirFichaAluno('${e.id}')" style="color:#2980b9; font-weight:bold; text-decoration:none; border-bottom:1px dashed #3498db; transition:color 0.2s;" onmouseover="this.style.color='#1abc9c'" onmouseout="this.style.color='#2980b9'">${i.escapeHTML(e.nome)}</a>`;r+=n.td(s)+n.td(i.escapeHTML(e.turma||`-`))+n.td(o)+n.td(i.escapeHTML(e.whatsapp||`-`))}else if(t===`turma`){let t=`<a href="javascript:void(0)" onclick="App.abrirFichaTurma('${e.id}')" style="color:#2980b9; font-weight:bold; text-decoration:none; border-bottom:1px dashed #3498db; transition:color 0.2s;" onmouseover="this.style.color='#1abc9c'" onmouseout="this.style.color='#2980b9'">${i.escapeHTML(e.nome)}</a>`;r+=n.td(t)+n.td(i.escapeHTML(e.dia||`-`))+n.td(i.escapeHTML(e.horario||`-`))+n.td(i.escapeHTML(e.curso||`-`))}else if(t===`curso`){let t=`<a href="javascript:void(0)" onclick="App.abrirFichaCurso('${e.id}')" style="color:#2980b9; font-weight:bold; text-decoration:none; border-bottom:1px dashed #3498db; transition:color 0.2s;" onmouseover="this.style.color='#1abc9c'" onmouseout="this.style.color='#2980b9'">${i.escapeHTML(e.nome)}</a>`;r+=n.td(t)+n.td(i.escapeHTML(e.carga||`-`))}else if(t===`financeiro`){let t=e.vencimento?e.vencimento.split(`-`).reverse().join(`/`):`-`,a=`R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,o=`<span style="color:${e.status===`Pago`?`#27ae60`:`#e74c3c`}; font-weight:bold; background:${e.status===`Pago`?`#eafaf1`:`#fdedec`}; padding:4px 8px; border-radius:4px; font-size:12px;">${i.escapeHTML(e.status)}</span>`;r+=n.td(i.escapeHTML(e.alunoNome||`Sem Nome`))+n.td(i.escapeHTML(e.descricao))+n.td(i.escapeHTML(t))+n.td(i.escapeHTML(a))+n.td(o)}else if(t===`estoque`){let t=parseInt(e.quantidade)||0,a=parseInt(e.quantidadeMinima)||0,o=t<=a?`<span style="color:#e74c3c; font-weight:bold; background:#fdedec; padding:4px 8px; border-radius:4px; font-size:12px;">⚠️ Baixo</span>`:`<span style="color:#27ae60; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:4px; font-size:12px;">✅ Normal</span>`,s=e.valor?`R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`:`-`;r+=n.td(i.escapeHTML(e.nome))+n.td(i.escapeHTML(e.codigo||`-`))+n.td(t,`center`)+n.td(a,`center`)+n.td(s)+n.td(o,`center`)}let o=t===`financeiro`?`financeiro`:t+`s`,s=t===`financeiro`?`App.abrirEdicaoFinanceiro('${e.id}')`:`App.abrirModalCadastro('${t}', '${e.id}')`,c=(e.nome||``).replace(/'/g,`\\'`),l=[];if(t===`aluno`){let t=e.status||`Ativo`;l.push(n.btn(`🔄`,`#8e44ad`,`App.alterarStatusAluno('${e.id}', '${t}')`,`Alterar Status (Ativo/Trancado/Cancelado)`)),l.push(n.btn(`⏱️`,`#3498db`,`App.abrirRelatorioFrequencia('${e.id}', '${i.escapeHTML(c)}')`,`Ver Histórico de Horas / Frequência`)),i.usuario.tipo!==`Professor`&&t===`Ativo`&&l.push(n.btn(`🛒`,`#27ae60`,`App.abrirModalVenda('${e.id}', '${i.escapeHTML(c)}')`,`Registrar Venda / Extra`))}return t===`financeiro`&&l.push(n.btn(`💬`,`#25D366`,`if(App.verificarPermissao('whatsapp')) App.enviarWhatsApp('${e.id}')`,`Avisar por WhatsApp`)),l.push(n.btn(`✏️`,`#f39c12`,s,`Editar`)),l.push(n.btn(`🗑️`,`#e74c3c`,`App.excluir('${o}', '${e.id}')`,`Excluir`)),r+=n.td(n.acoes(l),`right`),n.tr(r)}).join(``);return n.estrutura(a,o)},excluir:(e,t)=>{i.abrirModalConfirmacao(`Tem a certeza absoluta?`,`Esta ação apagará este registro permanentemente. Não é possível desfazer.`,async n=>{document.body.style.cursor=`wait`;try{let n=await i.api(`/${e}/${t}`,`DELETE`);if(n&&n.error)i.showToast(n.error,`error`);else{i.showToast(`Excluído com sucesso!`,`success`);let t=e===`financeiro`?`financeiro`:e.slice(0,-1),n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),await i.renderizarLista(t)}}catch{i.showToast(`Erro ao excluir.`,`error`)}finally{document.body.style.cursor=`default`,n.style.opacity=`0`,setTimeout(()=>n.style.display=`none`,300)}})},alterarStatusAluno:(e,t)=>{let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Atualizar Status de Matrícula`;let r={Ativo:{icon:`🟢`,color:`#27ae60`,desc:`Aluno matriculado e assistindo aulas.`},Trancado:{icon:`🟡`,color:`#f39c12`,desc:`Matrícula pausada. Histórico financeiro preservado.`},Cancelado:{icon:`🔴`,color:`#e74c3c`,desc:`Vínculo encerrado com a instituição.`}},a=Object.entries(r).map(([e,t])=>`
            <div class="status-option-card" data-status="${e}" onclick="App.selecionarOpcaoStatus(this)" style="border: 2px solid #eee; border-radius: 8px; padding: 15px; cursor: pointer; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: all 0.2s;">
                <span style="font-size: 32px; filter: grayscale(1); transition: filter 0.2s;">${t.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: ${t.color}; font-size: 16px;">${e}</div>
                    <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.4;">${t.desc}</p>
                </div>
                <div class="selection-indicator" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center;"></div>
            </div>
        `).join(``),o=`
            <div style="background: #fdf2f2; border: 1px solid #f5b7b1; padding: 10px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
                <span style="font-size: 12px; color: #7f8c8d; text-transform: uppercase;">Status Atual:</span>
                <span style="font-size: 14px; font-weight: bold; color: ${r[t]?r[t].color:`#333`}; margin-left: 5px;">${t}</span>
            </div>
            
            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom:10px;">Selecione o novo status:</h4>
            <div id="status-options-container" data-selecionado="">
                ${a}
            </div>
            <input type="hidden" id="status-student-id" value="${e}">
            <input type="hidden" id="status-student-orig" value="${t}">
        `;if(document.getElementById(`modal-form-content`).innerHTML=o,r[t]){let e=document.querySelector(`.status-option-card[data-status="${t}"]`);e&&i.selecionarOpcaoStatus(e)}let s=document.querySelector(`.btn-confirm`);s.setAttribute(`onclick`,`App.confirmarAlteracaoStatus()`),s.innerText=`💾 Salvar Novo Status`,s.style.display=`inline-flex`},selecionarOpcaoStatus:e=>{document.querySelectorAll(`.status-option-card`).forEach(e=>{e.style.borderColor=`#eee`,e.style.background=`white`,e.querySelector(`span[style*="font-size: 32px"]`).style.filter=`grayscale(1)`,e.querySelector(`.selection-indicator`).innerHTML=``,e.querySelector(`.selection-indicator`).style.borderColor=`#ccc`,e.querySelector(`.selection-indicator`).style.background=`white`});let t=e.getAttribute(`data-status`),n=e.querySelector(`div[style*="font-weight: bold"]`).style.color;e.style.borderColor=n,e.style.background=`${n}05`,e.querySelector(`span[style*="font-size: 32px"]`).style.filter=`grayscale(0)`,e.querySelector(`.selection-indicator`).innerHTML=`<div style="width: 12px; height: 12px; border-radius: 50%; background: ${n};"></div>`,e.querySelector(`.selection-indicator`).style.borderColor=n,document.getElementById(`status-options-container`).setAttribute(`data-selecionado`,t)},confirmarAlteracaoStatus:async()=>{let e=document.getElementById(`status-student-id`),t=document.getElementById(`status-student-orig`),n=document.getElementById(`status-options-container`);if(!e||!n)return i.showToast(`Erro: Janela não abriu corretamente.`,`error`);let r=e.value,a=t?t.value:``,o=n.getAttribute(`data-selecionado`);if(!o)return i.showToast(`Selecione um status para prosseguir.`,`warning`);if(o===a)return i.showToast(`O status selecionado é o mesmo que o atual.`,`warning`);let s=document.querySelector(`.btn-confirm`),c=s?s.innerText:`Salvar`;s&&(s.innerText=`A atualizar... ⏳`,s.disabled=!0),document.body.style.cursor=`wait`;try{let e=await i.api(`/alunos/${r}`);if(!e||e.error)throw Error(`Erro ao buscar dados do aluno`);if(await i.api(`/alunos/${r}`,`PUT`,{...e,status:o}),i.showToast(`Sucesso! Aluno agora está como ${o}.`,`success`),i.fecharModal(),Array.isArray(i.cacheAlunos)){let e=i.cacheAlunos.findIndex(e=>e.id===r);e!==-1&&(i.cacheAlunos[e].status=o)}if(Array.isArray(i.listaCache)){let e=i.listaCache.findIndex(e=>e.id===r);e!==-1&&(i.listaCache[e].status=o)}typeof i.filtrarTabelaReativa==`function`?i.filtrarTabelaReativa():typeof i.renderizarLista==`function`?i.renderizarLista(`aluno`):setTimeout(()=>window.location.reload(),500),i.verificarNotificacoes(),document.getElementById(`titulo-pagina`)&&document.getElementById(`titulo-pagina`).innerText===`Visão Geral`&&i.renderizarInicio()}catch(e){console.error(`Erro na atualização:`,e),i.showToast(`Não foi possível atualizar o status. Tente novamente.`,`error`)}finally{s&&(s.innerText=c,s.disabled=!1),document.body.style.cursor=`default`}},desenharDadosUsuarioNoTopo:()=>{if(!i.usuario)return;let e=(i.usuario.nome||i.usuario.login||`Usuário`).trim(),t=i.usuario.email||i.usuario.login||``,n=i.usuario.tipo||`Gestor`,r=i.usuario.avatar||i.usuario.foto||``,a=e.split(` `).filter(Boolean),o=`US`;a.length>=2?o=(a[0][0]+a[a.length-1][0]).toUpperCase():e.length>=2&&(o=e.substring(0,2).toUpperCase());let s=document.getElementById(`dropdown-user-name`);s&&(s.innerText=e);let c=document.getElementById(`dropdown-user-email`);c&&(c.innerText=t);let l=document.getElementById(`dropdown-user-role`);l&&(l.innerText=n);let u=document.getElementById(`avatar-img-top`),d=document.getElementById(`avatar-iniciais`),f=document.getElementById(`dropdown-avatar-img`),p=document.getElementById(`dropdown-avatar-iniciais`);r&&r.length>15&&!r.includes(`placehold`)?(u&&(u.src=r,u.style.display=`block`),d&&(d.style.display=`none`),f&&(f.src=r,f.style.display=`block`),p&&(p.style.display=`none`)):(u&&(u.src=``,u.style.display=`none`),d&&(d.innerText=o,d.style.display=`inline`),f&&(f.src=``,f.style.display=`none`),p&&(p.innerText=o,p.style.display=`inline`))},sincronizarPerfilUsuarioHeader:async()=>{if(i.usuario)try{let e=await i.api(`/usuarios`,`GET`,null,!0);if(!Array.isArray(e))return;let t=e.find(e=>e.id&&i.usuario.id&&String(e.id)===String(i.usuario.id)||e.login&&i.usuario.login&&e.login.toLowerCase()===i.usuario.login.toLowerCase()),n=e.find(e=>e.avatar&&(e.id&&String(e.id)===String(i.usuario.id)||e.login&&i.usuario.login&&e.login.toLowerCase()===i.usuario.login.toLowerCase()||e.nome&&i.usuario.nome&&e.nome.trim().toLowerCase()===i.usuario.nome.trim().toLowerCase()));if(t||n){let e=n||t;e.nome&&(i.usuario.nome=e.nome),e.avatar||e.foto?i.usuario.avatar=e.avatar||e.foto:t&&!t.avatar&&!n&&(i.usuario.avatar=null),localStorage.setItem(`usuario_logado`,JSON.stringify(i.usuario)),i.desenharDadosUsuarioNoTopo()}}catch{}},atualizarUIHeader:e=>{if(!e)return;let t=document.querySelector(`.logo-area`);if(t){let n=t.querySelector(`img`);e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?(n||(n=document.createElement(`img`),n.style.cssText=`width:65px; height:65px; border-radius:12px; object-fit:cover; display:block; margin: 0 auto 10px auto; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 4px 6px rgba(0,0,0,0.2);`,t.insertBefore(n,t.firstChild)),n.src=e.foto):n&&n.remove();let r=t.querySelector(`h2`);r&&(r.innerHTML=`Gestão Escolar`)}let n=e.plano||`Teste`,r=document.getElementById(`dropdown-plan-name`);r&&(r.innerText=n,r.style.color=n===`Premium`?`#f39c12`:n===`Profissional`?`#3498db`:`#27ae60`),i.desenharDadosUsuarioNoTopo(),i.sincronizarPerfilUsuarioHeader();let a=document.getElementById(`data-hoje`);if(a){let e=new Date().toLocaleDateString(`pt-BR`,{weekday:`long`,year:`numeric`,month:`long`,day:`numeric`});a.innerText=e.charAt(0).toUpperCase()+e.slice(1)}},irParaItemLista:(e,t=``)=>{t?sessionStorage.setItem(`ws_filtro_${e}`,t):sessionStorage.removeItem(`ws_filtro_${e}`),i.renderizarLista(e)},fecharOmnibox:()=>{let e=document.getElementById(`global-search-input`),t=document.getElementById(`global-search-results`),n=document.getElementById(`global-search-clear`);t&&t.classList.remove(`active`),e&&(e.value=``),n&&(n.style.display=`none`)},configurarPesquisaGlobal:()=>{let e=document.getElementById(`global-search-input`),t=document.getElementById(`global-search-results`),n=document.getElementById(`global-search-clear`);if(!e||!t)return;let r=[{nome:`Dashboard / Painel Geral`,cat:`Tela Principal`,icon:`📊`,keys:`inicio dashboard painel geral home resumo graficos`,acao:`App.renderizarInicio()`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Hub de Contratos e Matrículas`,cat:`Secretaria`,icon:`🗃️`,keys:`hub contratos matriculas assinatura digital link`,acao:`App.renderizarHubContratos()`,roles:[`Gestor`,`Secretaria`]},{nome:`Workspace`,cat:`Administração`,icon:`🌐`,keys:`workspace espaco equipe sala administracao`,acao:`App.renderizarWorkspaceAdmin()`,roles:[`Gestor`,`Secretaria`]},{nome:`Novo Aluno (Cadastrar)`,cat:`Alunos`,icon:`➕`,keys:`novo aluno cadastrar criar matricular estudante`,acao:`App.abrirModalCadastro('aluno')`,roles:[`Gestor`,`Secretaria`]},{nome:`Gerenciar Alunos (Lista)`,cat:`Alunos`,icon:`👩‍🎓`,keys:`alunos gerenciar lista estudantes matriculados trancados`,acao:`App.irParaItemLista('aluno', '')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Nova Turma (Cadastrar)`,cat:`Turmas`,icon:`➕`,keys:`nova turma cadastrar criar classe horario`,acao:`App.abrirModalCadastro('turma')`,roles:[`Gestor`,`Secretaria`]},{nome:`Gerenciar Turmas (Lista)`,cat:`Turmas`,icon:`🏫`,keys:`turmas gerenciar lista classes horarios`,acao:`App.irParaItemLista('turma', '')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Novo Curso (Cadastrar)`,cat:`Cursos`,icon:`➕`,keys:`novo curso cadastrar criar disciplina`,acao:`App.abrirModalCadastro('curso')`,roles:[`Gestor`,`Secretaria`]},{nome:`Gerenciar Cursos (Lista)`,cat:`Cursos`,icon:`📚`,keys:`cursos gerenciar lista carga horaria disciplinas`,acao:`App.irParaItemLista('curso', '')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Planejamento Pedagógico`,cat:`Pedagógico`,icon:`📋`,keys:`planejamento pedagogico plano de aula cronograma`,acao:`App.renderizarTela('planejamento')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Calendário e Agenda Escolar`,cat:`Pedagógico`,icon:`📆`,keys:`calendario agenda eventos feriados datas reunioes`,acao:`App.renderizarTela('calendario')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Gestão de Frequência (Chamada)`,cat:`Pedagógico`,icon:`📝`,keys:`chamada frequencia presenca falta faltas reposicao matriz`,acao:`App.renderizarTela('chamada')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Notas e Avaliações`,cat:`Pedagógico`,icon:`✅`,keys:`notas avaliacoes provas testes media lancar nota`,acao:`App.renderizarTela('avaliacoes')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Emitir Boletins`,cat:`Pedagógico`,icon:`📊`,keys:`boletins boletim escolar imprimir notas desempenho`,acao:`App.renderizarTela('boletins')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Controle de Mensalidades / Gerar Carnê`,cat:`Financeiro`,icon:`💸`,keys:`mensalidades carne carnes gerar parcelas cobranca`,acao:`App.renderizarTela('mensalidades')`,roles:[`Gestor`,`Secretaria`]},{nome:`Consultar Lançamentos Financeiros`,cat:`Financeiro`,icon:`🔍`,keys:`financeiro lancamentos consultar caixa pagamentos vendas`,acao:`App.irParaItemLista('financeiro', '')`,roles:[`Gestor`,`Secretaria`]},{nome:`Relatório de Inadimplência`,cat:`Financeiro`,icon:`⚠️`,keys:`inadimplencia atrasados devedores pendentes cobranca`,acao:`App.renderizarTela('inadimplencia')`,roles:[`Gestor`,`Secretaria`]},{nome:`Ficha de Matrícula`,cat:`Documentos`,icon:`📄`,keys:`ficha de matricula documento imprimir cadastro`,acao:`App.renderizarRelatorio('ficha')`,roles:[`Gestor`,`Secretaria`]},{nome:`Relatório Financeiro Detalhado`,cat:`Documentos`,icon:`📈`,keys:`relatorio financeiro detalhado balanco extrato`,acao:`App.renderizarRelatorio('fin_detalhado')`,roles:[`Gestor`,`Secretaria`]},{nome:`Dossiê Executivo`,cat:`Documentos`,icon:`📁`,keys:`dossie executivo diretoria indicadores bi`,acao:`App.renderizarRelatorio('dossie')`,roles:[`Gestor`]},{nome:`Certificados e Documentos`,cat:`Documentos`,icon:`🎓`,keys:`certificados certificado diploma declaracao documentos`,acao:`App.renderizarRelatorio('documentos')`,roles:[`Gestor`,`Secretaria`]},{nome:`Controle de Estoque e Materiais`,cat:`Estoque`,icon:`📦`,keys:`estoque produtos materiais apostilas livros itens`,acao:`App.irParaItemLista('estoque', '')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{nome:`Perfil da Instituição (Dados da Escola)`,cat:`Configurações`,icon:`🏢`,keys:`configuracoes perfil instituicao escola cnpj logo pix qr code endereco banco`,acao:`App.renderizarConfig('perfil')`,roles:[`Gestor`]},{nome:`Aparência do Sistema (Temas e Cores)`,cat:`Configurações`,icon:`🎨`,keys:`aparencia cores tema escuro claro design layout`,acao:`App.renderizarConfig('aparencia')`,roles:[`Gestor`]},{nome:`Backup e Segurança de Dados`,cat:`Configurações`,icon:`💾`,keys:`backup restaurar seguranca baixar json resetar apagar tudo`,acao:`App.renderizarConfig('backup')`,roles:[`Gestor`]},{nome:`Logs e Auditoria do Sistema`,cat:`Configurações`,icon:`👁️`,keys:`logs auditoria historico seguranca acoes rastreamento`,acao:`App.renderizarAuditoria()`,roles:[`Gestor`]},{nome:`Meu Plano e Assinatura`,cat:`Conta`,icon:`💎`,keys:`meu plano assinatura pin upgrade premium profissional essencial`,acao:`App.renderizarTela('plano')`,roles:[`Gestor`]},{nome:`Minha Conta (Senha e Equipe)`,cat:`Conta`,icon:`🔒`,keys:`minha conta senha usuarios acessos equipe biometria login`,acao:`App.renderizarMinhaConta()`,roles:[`Gestor`]}],a=e=>String(e||``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).toLowerCase().trim();n&&n.addEventListener(`click`,()=>{i.fecharOmnibox(),e.focus()}),document.addEventListener(`click`,r=>{!e.contains(r.target)&&!t.contains(r.target)&&(!n||!n.contains(r.target))&&t.classList.remove(`active`)}),e.addEventListener(`keydown`,e=>{if(e.key===`Escape`)t.classList.remove(`active`);else if(e.key===`Enter`){let n=t.querySelector(`.omnibox-item-acao`);n&&(e.preventDefault(),n.click())}}),e.addEventListener(`input`,async e=>{let o=e.target.value.trim(),s=a(o);if(n&&(n.style.display=o.length>0?`flex`:`none`),s.length<2){t.classList.remove(`active`);return}let c=i.usuario&&i.usuario.tipo?i.usuario.tipo:`Gestor`,l=``,u=!1,d=r.filter(e=>e.roles.includes(c)?a(e.nome).includes(s)||a(e.cat).includes(s)||a(e.keys).includes(s):!1).slice(0,6);d.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">⚡ Áreas e Funcionalidades do Sistema</div>`,d.forEach(e=>{l+=`
                        <div class="omnibox-item-acao" onclick="${e.acao}; App.fecharOmnibox();" 
                             style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                             onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                            <span style="font-size: 20px; width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${e.icon}</span>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${e.nome}</div>
                                <div style="font-size: 11px; color: #64748b;">Módulo: ${e.cat}</div>
                            </div>
                            <span style="font-size: 11px; color: #2563eb; font-weight: 700;">Abrir ➔</span>
                        </div>
                    `}));try{let e=Date.now();if(!i._omniboxCache||e-i._omniboxCacheTime>2e4){let[t,n,r,a,o,s,l]=await Promise.all([i.api(`/alunos`,`GET`,null,!0),i.api(`/turmas`,`GET`,null,!0),i.api(`/cursos`,`GET`,null,!0),i.api(`/planejamentos`,`GET`,null,!0),i.api(`/estoques`,`GET`,null,!0),i.api(`/eventos`,`GET`,null,!0),c===`Professor`?Promise.resolve([]):i.api(`/financeiro`,`GET`,null,!0)]);i._omniboxCache={alunos:Array.isArray(t)?t:[],turmas:Array.isArray(n)?n:[],cursos:Array.isArray(r)?r:[],planos:Array.isArray(a)?a:[],estoques:Array.isArray(o)?o:[],eventos:Array.isArray(s)?s:[],financeiro:Array.isArray(l)?l:[]},i._omniboxCacheTime=e}let t=i._omniboxCache,n=t.alunos.filter(e=>a(e.nome).includes(s)||a(e.turma).includes(s)||a(e.curso).includes(s)||a(e.whatsapp).includes(s)).slice(0,5);n.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">👩‍🎓 Alunos Encontrados</div>`,n.forEach(e=>{let t=(e.nome||``).replace(/'/g,`\\'`),n=typeof i.abrirFichaAluno==`function`?`App.abrirFichaAluno('${e.id}')`:`App.irParaItemLista('aluno', '${t}')`;l+=`
                            <div class="omnibox-item-acao" onclick="${n}; App.fecharOmnibox();" 
                                 style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                 onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">
                                    ${(e.nome||`AL`).substring(0,2).toUpperCase()}
                                </div>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${i.escapeHTML(e.nome)}</div>
                                    <div style="font-size: 11px; color: #64748b;">🏫 Turma: ${i.escapeHTML(e.turma||`-`)} | Status: ${i.escapeHTML(e.status||`Ativo`)}</div>
                                </div>
                                <span style="font-size: 11px; color: #3b82f6; font-weight: 700;">Ver Ficha ➔</span>
                            </div>
                        `}));let r=t.turmas.filter(e=>a(e.nome).includes(s)||a(e.curso).includes(s)||a(e.dia).includes(s)).slice(0,4);r.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">🏫 Turmas</div>`,r.forEach(e=>{let t=(e.nome||``).replace(/'/g,`\\'`),n=typeof i.abrirFichaTurma==`function`?`App.abrirFichaTurma('${e.id}')`:`App.irParaItemLista('turma', '${t}')`;l+=`
                            <div class="omnibox-item-acao" onclick="${n}; App.fecharOmnibox();" 
                                 style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                 onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                <span style="font-size: 18px; width: 32px; height: 32px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">🏫</span>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${i.escapeHTML(e.nome)}</div>
                                    <div style="font-size: 11px; color: #64748b;">📚 ${i.escapeHTML(e.curso||`-`)} | ⏰ ${i.escapeHTML(e.dia||``)} ${i.escapeHTML(e.horario||``)}</div>
                                </div>
                                <span style="font-size: 11px; color: #d97706; font-weight: 700;">Abrir ➔</span>
                            </div>
                        `}));let o=t.cursos.filter(e=>a(e.nome).includes(s)).slice(0,4);o.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">📚 Cursos</div>`,o.forEach(e=>{let t=(e.nome||``).replace(/'/g,`\\'`),n=typeof i.abrirFichaCurso==`function`?`App.abrirFichaCurso('${e.id}')`:`App.irParaItemLista('curso', '${t}')`;l+=`
                            <div class="omnibox-item-acao" onclick="${n}; App.fecharOmnibox();" 
                                 style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                 onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                <span style="font-size: 18px; width: 32px; height: 32px; background: #e0e7ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">📚</span>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${i.escapeHTML(e.nome)}</div>
                                    <div style="font-size: 11px; color: #64748b;">Carga Horária: ${i.escapeHTML(e.carga||`-`)}</div>
                                </div>
                                <span style="font-size: 11px; color: #4338ca; font-weight: 700;">Abrir ➔</span>
                            </div>
                        `}));let d=t.planos.filter(e=>e.status!==`Arquivado`&&(a(e.nomeAluno).includes(s)||a(e.curso).includes(s))).slice(0,4);if(d.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">📋 Planejamentos Ativos</div>`,d.forEach(e=>{let t=typeof i.abrirDashboardProgresso==`function`?`App.abrirDashboardProgresso('${e.id}')`:`App.renderizarTela('planejamento')`;l+=`
                            <div class="omnibox-item-acao" onclick="${t}; App.fecharOmnibox();" 
                                 style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                 onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                <span style="font-size: 18px; width: 32px; height: 32px; background: #dcfce7; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">👁️</span>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600;">Plano: ${i.escapeHTML(e.nomeAluno)}</div>
                                    <div style="font-size: 11px; color: #64748b;">Curso: ${i.escapeHTML(e.curso||`-`)}</div>
                                </div>
                                <span style="font-size: 11px; color: #16a34a; font-weight: 700;">Progresso ➔</span>
                            </div>
                        `})),c!==`Professor`){let e=t.financeiro.filter(e=>a(e.alunoNome).includes(s)||a(e.descricao).includes(s)).slice(0,4);e.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">💰 Financeiro</div>`,e.forEach(e=>{let t=(e.alunoNome||e.descricao||``).replace(/'/g,`\\'`);l+=`
                                <div class="omnibox-item-acao" onclick="App.irParaItemLista('financeiro', '${t}'); App.fecharOmnibox();" 
                                     style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                     onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                    <span style="font-size: 18px; width: 32px; height: 32px; background: #fef9c3; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">💸</span>
                                    <div style="flex:1; min-width:0;">
                                        <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${i.escapeHTML(e.alunoNome||`Lançamento`)} - R$ ${parseFloat(e.valor||0).toFixed(2)}</div>
                                        <div style="font-size: 11px; color: #64748b;">${i.escapeHTML(e.descricao||``)} (${i.escapeHTML(e.status||``)})</div>
                                    </div>
                                    <span style="font-size: 11px; color: #ca8a04; font-weight: 700;">Filtrar ➔</span>
                                </div>
                            `}))}let f=t.estoques.filter(e=>a(e.nome).includes(s)||a(e.codigo).includes(s)).slice(0,4);f.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">📦 Estoque</div>`,f.forEach(e=>{let t=(e.nome||``).replace(/'/g,`\\'`);l+=`
                            <div class="omnibox-item-acao" onclick="App.irParaItemLista('estoque', '${t}'); App.fecharOmnibox();" 
                                 style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                 onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                <span style="font-size: 18px; width: 32px; height: 32px; background: #f3e8ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">📦</span>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${i.escapeHTML(e.nome)}</div>
                                    <div style="font-size: 11px; color: #64748b;">Qtd: ${e.quantidade||0} | Cód: ${i.escapeHTML(e.codigo||`-`)}</div>
                                </div>
                                <span style="font-size: 11px; color: #9333ea; font-weight: 700;">Ver Item ➔</span>
                            </div>
                        `}));let p=t.eventos.filter(e=>a(e.titulo||e.nome||e.descricao).includes(s)).slice(0,3);p.length>0&&(u=!0,l+=`<div style="padding: 8px 15px; background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0;">📆 Agenda e Eventos</div>`,p.forEach(e=>{l+=`
                            <div class="omnibox-item-acao" onclick="App.renderizarTela('calendario'); App.fecharOmnibox();" 
                                 style="padding: 12px 15px; cursor: pointer; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #f1f5f9; transition: 0.2s;"
                                 onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='transparent'">
                                <span style="font-size: 18px; width: 32px; height: 32px; background: #fee2e2; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">📅</span>
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${i.escapeHTML(e.titulo||e.nome||e.descricao)}</div>
                                    <div style="font-size: 11px; color: #64748b;">Data: ${i.escapeHTML(e.data||`-`)}</div>
                                </div>
                                <span style="font-size: 11px; color: #ef4444; font-weight: 700;">Agenda ➔</span>
                            </div>
                        `}))}catch{}u||(l=`
                    <div style="padding: 30px 20px; text-align: center; color: #94a3b8;">
                        <div style="font-size: 26px; margin-bottom: 8px;">🔍</div>
                        <div style="font-size: 13px;">Nenhum resultado encontrado para "<b>${i.escapeHTML(o)}</b>"</div>
                    </div>`),t.innerHTML=l,t.classList.add(`active`)})},abrirModalBloqueioComPin:e=>{let t=document.getElementById(`modal-bloqueio-assinatura-pin`);t||(t=document.createElement(`div`),t.id=`modal-bloqueio-assinatura-pin`,t.style.cssText=`position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.96); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; backdrop-filter:blur(8px);`,document.body.appendChild(t)),t.innerHTML=`
            <div style="background:#ffffff; max-width:460px; width:100%; border-radius:20px; padding:35px 25px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.5);">
                <div style="font-size:48px; margin-bottom:10px;">🔒</div>
                <h2 style="margin:0 0 8px 0; color:#1e293b; font-size:22px;">Assinatura Expirada ou Bloqueada</h2>
                <p style="color:#64748b; font-size:13.5px; line-height:1.5; margin:0 0 22px 0;">
                    O ciclo atual do plano <b>${i.escapeHTML(e.plano||`Escolar`)}</b> encerrou. Insira abaixo o seu <b>PIN de Renovação</b> para destravar o acesso imediatamente:
                </p>

                <div style="background:#f8fafc; padding:18px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:20px;">
                    <input type="text" id="input-novo-pin" placeholder="DIGITE O SEU PIN AQUI" style="width:100%; padding:13px; border:2px solid #cbd5e1; border-radius:8px; text-align:center; font-size:17px; font-weight:bold; letter-spacing:2px; margin-bottom:12px; box-sizing:border-box; text-transform:uppercase;">
                    <button type="button" class="btn-primary" style="width:100%; justify-content:center; padding:13px; font-size:15px; font-weight:bold;" onclick="App.ativarNovoPlano(event); setTimeout(() => { const m = document.getElementById('modal-bloqueio-assinatura-pin'); if(m) m.remove(); }, 1800);">🔓 Validar PIN e Destravar Agora</button>
                </div>

                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button type="button" onclick="window.open('https://mpago.la/1KmmwZf', '_blank')" style="flex:1; padding:11px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;">💳 Renovar Online</button>
                    <button type="button" onclick="App.logout()" style="flex:1; padding:11px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;">🚪 Sair da Conta</button>
                </div>
            </div>
        `,t.style.display=`flex`},carregarDadosEscola:async(e=!1)=>{try{let t=localStorage.getItem(i.getTenantKey(`escola_perfil`)),n=t?JSON.parse(t):null;n&&typeof i.atualizarUIHeader==`function`&&i.atualizarUIHeader(n);let r=await i.api(`/escola`,`GET`,null,e);if(!r||r.error)return;if(r.dataCriacao||(r.dataCriacao=new Date().toISOString(),await i.api(`/escola`,`PUT`,r,e)),r.plano&&localStorage.setItem(i.getTenantKey(`escola_plano`),r.plano),localStorage.setItem(i.getTenantKey(`escola_perfil`),JSON.stringify(r)),typeof i.atualizarUIHeader==`function`&&i.atualizarUIHeader(r),typeof i.verificarBloqueioGeral==`function`&&i.verificarBloqueioGeral(r)){i.abrirModalBloqueioComPin(r);return}else{let e=document.getElementById(`modal-bloqueio-assinatura-pin`);e&&e.remove()}if(r.dataExpiracao&&!i._avisoVencimentoMostrado){let e=Math.ceil((new Date(r.dataExpiracao).getTime()-Date.now())/(1e3*60*60*24));e>=0&&e<=5&&typeof i.showToast==`function`&&(i._avisoVencimentoMostrado=!0,i.showToast(`⏳ A assinatura da escola vence em ${e} dia(s). Aceda a "💎 Meu Plano" para renovar sem perder dias!`,`warning`))}}catch{console.log(`Carregando perfil silenciosamente...`)}},verificarNovidadesSilenciosamente:async()=>{if(i.usuario)try{let e=await fetch(`${r.API_URL}/sistema/notificacoes/nao-lidas`,{credentials:`include`});if(!e.ok)return;let t=await e.json(),n=Array.isArray(t)?t.filter(e=>e.tipo!==`aviso_workspace_aluno`):[],a=document.getElementById(`noti-badge`);a&&(a.innerText=n.length,a.style.display=n.length>0?`flex`:`none`);let o=i.notificacoesAtuais?i.notificacoesAtuais:[],s=n.map(e=>e.id);s.some(e=>!o.includes(e))&&(i.notificacoesAtuais=s,typeof i.renderizarNotificacoes==`function`&&i.renderizarNotificacoes(n),n.some(e=>(e.tipo===`matricula`?!0:e.tipo===`matricula_contrato`)&&!o.includes(e.id))&&(typeof i.carregarDadosEscola==`function`&&await i.carregarDadosEscola(),i.entidadeAtual===`aluno`&&typeof i.renderizarLista==`function`&&i.renderizarLista(`aluno`),typeof i.showToast==`function`&&i.showToast(`🎉 Nova matrícula online recebida agora!`,`success`)))}catch{}},renderizarNotificacoes:e=>{let t=document.getElementById(`noti-list`);if(t){if(!e||e.length===0){t.innerHTML=`
                <div style="padding:20px; text-align:center; color:#94a3b8;">
                    <div style="font-size:30px; margin-bottom:10px;">✅</div>
                    <div style="font-weight:600; font-size:14px;">Tudo resolvido por aqui!</div>
                    <div style="font-size:12px; opacity:0.7;">Nenhuma pendência pendente.</div>
                </div>`;return}t.innerHTML=e.map(e=>`
            <div class="noti-item" id="noti-${e.id}" style="display:flex; gap:12px; padding:15px; border-bottom:1px solid rgba(0,0,0,0.05); align-items: flex-start; transition: background 0.2s;">
                <div class="noti-icon" style="font-size:20px; margin-top:2px;">🔔</div>
                <div style="flex:1;">
                    <strong style="color: var(--accent); display:block; margin-bottom:3px; font-size:14px;">${e.titulo}</strong>
                    <span style="font-size: 13px; color:#555; line-height:1.4; display:block; margin-bottom:10px;">${e.mensagem}</span>
                    
                    <button onclick="App.resolverNotificacao('${e.id}')" 
                            style="background: #27ae60; color: white; border: none; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 5px; transition: 0.2s;"
                            onmouseover="this.style.background='#219150'" 
                            onmouseout="this.style.background='#27ae60'">
                        <span>✅</span> Marcar como Resolvido
                    </button>
                </div>
            </div>
        `).join(``)}},resolverNotificacao:async e=>{try{await fetch(`${r.API_URL}/sistema/notificacoes/lida/${e}`,{method:`PUT`,credentials:`include`});let t=document.getElementById(`noti-${e}`);t&&t.remove();let n=document.getElementById(`noti-badge`);if(n){let e=parseInt(n.innerText)||0;if(--e,e>0)n.innerText=e;else{n.style.display=`none`;let e=document.getElementById(`noti-list`);e&&(e.innerHTML=`<div style="padding:15px; text-align:center; color:#999;">Tudo resolvido! ✅</div>`)}}i.notificacoesAtuais&&=i.notificacoesAtuais.filter(t=>t!==e)}catch(e){console.error(`Erro ao resolver:`,e),typeof i.showToast==`function`&&i.showToast(`Erro ao comunicar com o servidor.`,`error`)}},otimizarImagem:(e,t,n)=>{let r=new FileReader;r.readAsDataURL(e),r.onload=e=>{let r=new Image;r.src=e.target.result,r.onload=()=>{let e=document.createElement(`canvas`),i=r.width,a=r.height;i>t&&(a*=t/i,i=t),e.width=i,e.height=a,e.getContext(`2d`).drawImage(r,0,0,i,a),n(e.toDataURL(`image/jpeg`,.8))}}},renderizarConfiguracoes:async()=>{i.setTitulo(`Perfil da Escola`);let e=document.getElementById(`app-content`);try{let t=await i.api(`/escola`)||{};e.innerHTML=`
                <div class="card" style="max-width:850px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-bottom:30px;">
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-preview" src="${t.foto||`https://placehold.co/100?text=LOGO`}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">Logotipo Oficial</label>
                                <input type="file" id="conf-file" accept="image/*" onchange="App.previewImagemLocal(this, 'conf-preview')" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerImagemLocal('conf-preview')">🗑️ Remover Imagem</button>
                                </div>
                            </div>
                        </div>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-qr-preview" src="${t.qrCodeImagem||`https://placehold.co/100?text=QR+CODE`}" style="width:100px; height:100px; object-fit:contain; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">QR Code PIX</label>
                                <input type="file" id="conf-qr-file" accept="image/*" onchange="App.previewImagemLocal(this, 'conf-qr-preview')" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerImagemLocal('conf-qr-preview')">🗑️ Remover Imagem</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📋 Dados Principais</h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${i.escapeHTML(t.nome||``)}"></div>
                        <div class="input-group"><label>CNPJ / NIF</label><input id="conf-cnpj" value="${i.escapeHTML(t.cnpj||``)}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Dados Bancários (Carnê)</label><input id="conf-banco" value="${i.escapeHTML(t.banco||``)}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${i.escapeHTML(t.chavePix||``)}"></div>
                    </div>

                    <h4 style="margin: 25px 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📍 Endereço da Instituição</h4>
                    <div style="display:grid; grid-template-columns: 1fr 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>CEP</label><input id="conf-cep" value="${i.escapeHTML(t.cep||``)}" oninput="App.mascaraCEP(this)" maxlength="9"></div>
                        <div class="input-group"><label>Endereço (Rua, Av.)</label><input id="conf-endereco" value="${i.escapeHTML(t.endereco||``)}"></div>
                        <div class="input-group"><label>Número</label><input id="conf-numero" value="${i.escapeHTML(t.numero||``)}"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Bairro</label><input id="conf-bairro" value="${i.escapeHTML(t.bairro||``)}"></div>
                        <div class="input-group"><label>Cidade</label><input id="conf-cidade" value="${i.escapeHTML(t.cidade||``)}"></div>
                        <div class="input-group"><label>Estado (UF)</label><input id="conf-estado" value="${i.escapeHTML(t.estado||``)}" maxlength="2" style="text-transform: uppercase;"></div>
                    </div>

                    <button class="btn-primary" style="width:100%; margin-top:25px; padding:15px; justify-content:center;" onclick="App.salvarConfiguracoes()">💾 ATUALIZAR DADOS DA ESCOLA</button>
                </div>`}catch{e.innerHTML=`Erro ao carregar.`}},previewImagemLocal:(e,t)=>{!e.files||e.files.length===0||i.otimizarImagem(e.files[0],400,e=>{let n=document.getElementById(t);n.src=e,n.setAttribute(`data-nova`,`true`)})},removerImagemLocal:e=>{let t=document.getElementById(e);t.src=e===`conf-preview`?`https://placehold.co/100?text=LOGO`:`https://placehold.co/100?text=QR+CODE`,t.setAttribute(`data-nova`,`true`);let n=document.getElementById(e===`conf-preview`?`conf-file`:`conf-qr-file`);n&&(n.value=``)},salvarConfiguracoes:async()=>{let e={nome:document.getElementById(`conf-nome`).value,cnpj:document.getElementById(`conf-cnpj`).value,banco:document.getElementById(`conf-banco`).value,chavePix:document.getElementById(`conf-pix`).value,cep:document.getElementById(`conf-cep`).value,endereco:document.getElementById(`conf-endereco`).value,numero:document.getElementById(`conf-numero`).value,bairro:document.getElementById(`conf-bairro`).value,cidade:document.getElementById(`conf-cidade`).value,estado:document.getElementById(`conf-estado`).value.toUpperCase()},t=document.getElementById(`conf-preview`);t&&t.hasAttribute(`data-nova`)&&(e.foto=t.src.includes(`placehold`)?``:t.src);let n=document.getElementById(`conf-qr-preview`);n&&n.hasAttribute(`data-nova`)&&(e.qrCodeImagem=n.src.includes(`placehold`)?``:n.src);let r=document.querySelector(`button[onclick="App.salvarConfiguracoes()"]`),a=r.innerText;r.innerText=`A atualizar... ⏳`,r.disabled=!0;try{let r=await i.api(`/escola`)||{};await i.api(`/escola`,`PUT`,{...r,...e}),await i.carregarDadosEscola(),t&&t.removeAttribute(`data-nova`),n&&n.removeAttribute(`data-nova`),i.showToast(`Configurações atualizadas com sucesso!`,`success`)}catch{i.showToast(`Erro ao salvar perfil da escola.`,`error`)}finally{r.innerText=a,r.disabled=!1}},toggleSenhaVisibilidade:e=>{let t=document.getElementById(e);t.type=t.type===`password`?`text`:`password`},renderizarBackup:()=>{i.setTitulo(`Backup de Dados`);let e=document.getElementById(`app-content`);e.innerHTML=`
            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:30px;">
                <div class="card" style="flex:1; border-left: 5px solid #27ae60; padding:25px;">
                    <h3 style="color:#27ae60; border:none; margin-top:0;">📥 Fazer Backup</h3>
                    <p style="opacity:0.7; margin-bottom:20px; font-size:13px;">Baixe uma cópia completa de todos os dados do sistema.</p>
                    <button class="btn-primary" style="width:100%; background:#27ae60; justify-content:center;" onclick="App.realizarDownloadBackup()">⬇️ BAIXAR DADOS (.JSON)</button>
                </div>
                <div class="card" style="flex:1; border-left: 5px solid #f39c12; padding:25px;">
                    <h3 style="color:#f39c12; border:none; margin-top:0;">📤 Restaurar</h3>
                    <p style="opacity:0.7; margin-bottom:15px; font-size:13px;">Carregue um arquivo de backup para recuperar dados.</p>
                    <input type="file" id="input-backup-file" accept=".json" style="width:100%; margin-bottom:15px; border:1px solid #ddd; padding:10px; border-radius:5px;">
                    <button class="btn-primary" style="width:100%; background:#f39c12; justify-content:center;" onclick="App.processarRestauracao()">⬆️ RESTAURAR DADOS</button>
                </div>
            </div>
            <div class="card" style="border:2px solid #e74c3c; background:#fff5f5; padding:30px; text-align:center;">
                <h3 style="color:#c0392b; border:none; font-size:22px; margin-top:0;">⚠️ ZONA DE PERIGO</h3>
                <p style="color:#c0392b; margin-bottom:20px;">Esta ação apagará <strong>TODOS</strong> os dados operacionais e resetará o <strong>PERFIL DA ESCOLA</strong>.<br>O seu usuário será mantido para login.</p>
                <button class="btn-primary" style="background:#c0392b; width:100%; max-width:250px; margin: 0 auto; padding:15px; font-weight:bold; border:2px solid #c0392b; justify-content:center;" onclick="App.resetarSistema()">🗑️ RESETAR TUDO</button>
            </div>
        `},resetarSistema:async()=>{if(!confirm(`⚠️ ATENÇÃO EXTREMA: ISSO APAGARÁ TODOS OS DADOS DA ESCOLA. Deseja continuar?`))return;if(prompt(`Para confirmar a exclusão TOTAL, digite: APAGAR TUDO`)!==`APAGAR TUDO`)return i.showToast(`Ação cancelada. Código incorreto.`,`error`);let e=document.querySelector(`button[onclick="App.resetarSistema()"]`);e&&(e.disabled=!0,e.innerText=`⏳ APAGANDO...`),document.body.style.cursor=`wait`;try{for(let e of[`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`]){let t=await i.api(`/${e}`);Array.isArray(t)&&t.length>0&&await Promise.all(t.map(t=>i.api(`/${e}/${t.id}`,`DELETE`)))}await i.api(`/escola`,`PUT`,{nome:`Escola`,cnpj:``,foto:``,qrCodeImagem:``,banco:``,chavePix:``}),localStorage.removeItem(i.getTenantKey(`escola_perfil`)),alert(`✅ Sistema resetado com sucesso!`),location.reload()}catch{alert(`Erro ao limpar dados.`),e&&(e.disabled=!1,e.innerText=`🗑️ RESETAR TUDO`)}finally{document.body.style.cursor=`default`}},realizarDownloadBackup:async()=>{try{let e=[`escola`,`usuarios`,`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`],t={};for(let n of e)t[n]=await i.api(`/${n}`);let n=new Blob([JSON.stringify(t,null,2)],{type:`application/json`}),r=document.createElement(`a`);r.href=URL.createObjectURL(n),r.download=`backup_${new Date().toISOString().split(`T`)[0]}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r)}catch{alert(`Erro no backup.`)}},processarRestauracao:async()=>{let e=document.getElementById(`input-backup-file`);if(!e.files.length)return i.showToast(`Por favor, selecione o ficheiro de backup.`,`warning`);if(!confirm(`Tem a certeza absoluta que deseja substituir os dados atuais? Esta ação não pode ser desfeita.`))return;let t=document.querySelector(`button[onclick="App.processarRestauracao()"]`);t&&(t.disabled=!0,t.innerText=`A Ler ficheiro... ⏳`),document.body.style.cursor=`wait`;let n=new FileReader;n.onload=async e=>{try{let n=JSON.parse(e.target.result),r=[`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`,`usuarios`,`escola`],a=0,o=0;for(let e of r)n[e]&&(Array.isArray(n[e])?a+=n[e].length:a+=1);if(a===0){i.showToast(`O ficheiro de backup parece estar vazio.`,`warning`),t&&(t.disabled=!1,t.innerText=`⬆️ RESTAURAR DADOS`),document.body.style.cursor=`default`;return}for(let e of r)if(n[e])if(Array.isArray(n[e]))for(let r of n[e])await i.api(`/${e}`,`POST`,r),o++,t&&(t.innerText=`A Restaurar: ${o} de ${a} ⏳`);else await i.api(`/escola`,`PUT`,n[e]),o++,t&&(t.innerText=`A Restaurar: ${o} de ${a} ⏳`);i.showToast(`Dados restaurados com sucesso! A reiniciar...`,`success`),setTimeout(()=>location.reload(),1500)}catch(e){console.error(`Erro na restauração:`,e),i.showToast(`Ficheiro inválido ou erro de comunicação.`,`error`),t&&(t.disabled=!1,t.innerText=`⬆️ RESTAURAR DADOS`),document.body.style.cursor=`default`}},n.readAsText(e.files[0])},abrirModalConfirmacao:(e,t,n)=>{let r=document.getElementById(`modal-confirmacao-bonito`);r||(r=document.createElement(`div`),r.id=`modal-confirmacao-bonito`,r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:0; transition:opacity 0.3s ease;`,document.body.appendChild(r)),r.innerHTML=`
            <div style="background:#fff; padding:30px; border-radius:24px; width:90%; max-width:380px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform:scale(0.8); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="box-confirmacao-interno">
                <div style="width:80px; height:80px; border-radius:50%; background:#fdedec; color:#e74c3c; font-size:40px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto; border:4px solid #f9ebea;">🗑️</div>
                <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size:22px; font-weight:800;">${e}</h3>
                <p style="color:#7f8c8d; font-size:14px; margin-bottom:25px; line-height:1.5;">${t}</p>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <button onclick="document.getElementById('modal-confirmacao-bonito').style.opacity='0'; setTimeout(()=>document.getElementById('modal-confirmacao-bonito').style.display='none', 300);" style="flex:1; padding:12px; background:#f4f6f7; color:#7f8c8d; border:1px solid #d5dbdb; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; transition:background 0.2s;" onmouseover="this.style.background='#e5e8e8'" onmouseout="this.style.background='#f4f6f7'">Cancelar</button>
                    <button id="btn-confirmar-acao-bonita" style="flex:1; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow:0 4px 15px rgba(231,76,60,0.3); transition:background 0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Sim, Apagar</button>
                </div>
            </div>
        `,r.style.display=`flex`,setTimeout(()=>{r.style.opacity=`1`,document.getElementById(`box-confirmacao-interno`).style.transform=`scale(1)`},10),document.getElementById(`btn-confirmar-acao-bonita`).onclick=function(){let e=this;e.innerHTML=`A apagar... ⏳`,e.style.opacity=`0.8`,e.disabled=!0,n(r)}},dragState:{isDragging:!1,startX:0,startY:0,bgX:50,bgY:50},iniciarArraste:e=>{i.dragState.isDragging=!0,i.dragState.startX=e.type.includes(`touch`)?e.touches[0].clientX:e.clientX,i.dragState.startY=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,i.configTemp=i.configTemp||{};let t=(i.configTemp.imagemPosicao||`50% 50%`).split(` `);i.dragState.bgX=parseFloat(t[0])||50,i.dragState.bgY=parseFloat(t[1])||50;let n=document.getElementById(`preview-header-img`);n&&(n.style.cursor=`grabbing`),document.addEventListener(`mousemove`,i.arrastarImagem),document.addEventListener(`mouseup`,i.pararArraste),document.addEventListener(`touchmove`,i.arrastarImagem,{passive:!1}),document.addEventListener(`touchend`,i.pararArraste)},arrastarImagem:e=>{if(!i.dragState.isDragging)return;e.preventDefault();let t=e.type.includes(`touch`)?e.touches[0].clientX:e.clientX,n=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,r=t-i.dragState.startX,a=n-i.dragState.startY,o=.2,s=i.dragState.bgX-r*o,c=i.dragState.bgY-a*o;s=Math.max(0,Math.min(100,s)),c=Math.max(0,Math.min(100,c)),i.configTemp.imagemPosicao=`${s.toFixed(2)}% ${c.toFixed(2)}%`;let l=document.getElementById(`preview-header-img`);l&&(l.style.backgroundPosition=i.configTemp.imagemPosicao),i.dragState.startX=t,i.dragState.startY=n,i.dragState.bgX=s,i.dragState.bgY=c},pararArraste:()=>{if(i.dragState.isDragging){i.dragState.isDragging=!1;let e=document.getElementById(`preview-header-img`);e&&(e.style.cursor=`grab`),document.removeEventListener(`mousemove`,i.arrastarImagem),document.removeEventListener(`mouseup`,i.pararArraste),document.removeEventListener(`touchmove`,i.arrastarImagem),document.removeEventListener(`touchend`,i.pararArraste)}}});var a=()=>{typeof i.init==`function`?i.init():setTimeout(a,50)};document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,a):a(),window.addEventListener(`popstate`,e=>{if(i.usuario){let e=window.location.hash.replace(`#`,``);e?i.renderizarTela(e,!0):typeof i.renderizarInicio==`function`&&i.renderizarInicio()}}),window.addEventListener(`hashchange`,()=>{if(i.usuario){let e=window.location.hash.replace(`#`,``);e&&i.renderizarTela(e,!0)}}),document.addEventListener(`keydown`,function(e){e.key===`Escape`&&(i.fecharModal(),typeof i.fecharModalInst==`function`&&i.fecharModalInst())}),window.addEventListener(`focus`,()=>{let e=document.getElementById(`tela-sistema`);i.usuario&&e&&e.style.display!==`none`&&(typeof i.verificarNotificacoes==`function`&&i.verificarNotificacoes(),typeof i.sincronizarPerfilUsuarioHeader==`function`&&i.sincronizarPerfilUsuarioHeader())}),window.addEventListener(`storage`,e=>{if(e.key===`usuario_logado`&&e.newValue)try{i.usuario=JSON.parse(e.newValue),typeof i.desenharDadosUsuarioNoTopo==`function`&&i.desenharDadosUsuarioNoTopo()}catch{}}),document.addEventListener(`click`,e=>{let t=document.querySelector(`.notification-container`);if(t&&!t.contains(e.target)){let e=document.getElementById(`noti-dropdown`);e&&e.classList.remove(`active`)}let n=document.getElementById(`dropdown-perfil-usuario`),r=document.getElementById(`btn-avatar-profile`);n&&r&&n.classList.contains(`active`)&&!n.contains(e.target)&&!r.contains(e.target)&&n.classList.remove(`active`)}),window.addEventListener(`offline`,()=>{let e=document.getElementById(`offline-banner`);e&&(e.style.display=`block`,e.innerHTML=`⚠️ Está sem internet. O sistema guardará os seus dados no aparelho até voltar a ligar-se.`),typeof i.showToast==`function`&&i.showToast(`Sem ligação à Internet!`,`error`)}),window.addEventListener(`online`,()=>{let e=document.getElementById(`offline-banner`);e&&(e.style.display=`none`),typeof i.showToast==`function`&&i.showToast(`Ligação à Internet restaurada!`,`success`),setTimeout(()=>{typeof i.processarFilaOffline==`function`&&i.processarFilaOffline()},2e3)}),document.addEventListener(`DOMContentLoaded`,()=>{setTimeout(()=>{navigator.onLine&&typeof i.processarFilaOffline==`function`&&(JSON.parse(localStorage.getItem(`escola_fila_offline`))||[]).length>0&&i.processarFilaOffline()},3e3)});var o;window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),o=e;let t=document.getElementById(`pwa-install-banner`);t&&(t.style.display=`block`)});var s=document.getElementById(`pwa-btn-install`);s&&s.addEventListener(`click`,async()=>{let e=document.getElementById(`pwa-install-banner`);if(e.style.display=`none`,o){o.prompt();let{outcome:e}=await o.userChoice;o=null}});var c=document.getElementById(`pwa-btn-cancel`);c&&c.addEventListener(`click`,()=>{let e=document.getElementById(`pwa-install-banner`);e.style.display=`none`}),window.addEventListener(`appinstalled`,()=>{let e=document.getElementById(`pwa-install-banner`);e&&(e.style.display=`none`),o=null,typeof gtag==`function`&&gtag(`event`,`app_install`,{platform:`PWA Web`}),i.showToast(`App instalada com sucesso! 🎉`,`success`)}),document.addEventListener(`DOMContentLoaded`,()=>{typeof i.iniciarRastreadorRascunho==`function`&&i.iniciarRastreadorRascunho(),typeof i.configurarPesquisaGlobal==`function`&&i.configurarPesquisaGlobal()}),window.App=window.App||{};var l=window.App;Object.assign(l,{mascaraCNPJ:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/^(\d{2})(\d)/,`$1.$2`),t=t.replace(/^(\d{2})\.(\d{3})(\d)/,`$1.$2.$3`),t=t.replace(/\.(\d{3})(\d)/,`.$1/$2`),t=t.replace(/(\d{4})(\d)/,`$1-$2`),e.value=t},mascaraCPF:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/(\d{3})(\d)/,`$1.$2`),t=t.replace(/(\d{3})(\d)/,`$1.$2`),t=t.replace(/(\d{3})(\d{1,2})$/,`$1-$2`),e.value=t},mascaraCelular:e=>{let t=e.value;t.startsWith(`+`)?e.value=`+`+t.replace(/\D/g,``):(t=t.replace(/\D/g,``),t=t.replace(/^(\d{2})(\d)/g,`($1) $2`),t=t.replace(/(\d)(\d{4})$/,`$1-$2`),e.value=t)},mascaraCEP:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/^(\d{5})(\d)/,`$1-$2`),e.value=t},mascaraValor:e=>{let t=e.value.replace(/\D/g,``);t=(t/100).toFixed(2)+``,e.value=t},showToast:(e,t=`info`)=>{let n=document.getElementById(`toast-container`);n||(n=l.criarElemento(`div`,[],{id:`toast-container`}),document.body.appendChild(n));let r=t===`success`?`✅`:t===`error`?`❌`:t===`warning`?`⚠️`:`ℹ️`,i=l.criarElemento(`div`,[`toast`,t]),a=l.criarElemento(`span`,[`toast-icon`],{},r),o=l.criarElemento(`span`,[],{},e);i.appendChild(a),i.appendChild(o),n.appendChild(i),setTimeout(()=>{i.style.animation=`fadeOut 0.5s ease forwards`,setTimeout(()=>i.remove(),500)},3e3)},setupMobileMenu:()=>{let e=document.getElementById(`tela-sistema`),t=e?e.querySelector(`header`):document.querySelector(`header`),n=document.querySelector(`.sidebar`);if(!t||!n){console.warn(`Menu mobile não iniciado: header ou sidebar não encontrado.`);return}if(!document.getElementById(`btn-mobile-menu`)){let e=document.createElement(`button`);e.id=`btn-mobile-menu`,e.className=`mobile-menu-btn`,e.type=`button`,e.innerHTML=`☰`,e.onclick=()=>{n.classList.toggle(`active`),(document.querySelector(`.mobile-overlay`)||l.criarOverlay()).classList.toggle(`active`)},t.insertBefore(e,t.firstChild)}l.criarOverlay()},criarOverlay:()=>{let e=document.querySelector(`.mobile-overlay`);if(e)return e;let t=document.createElement(`div`);return t.className=`mobile-overlay`,t.onclick=()=>{let e=document.querySelector(`.sidebar`);e&&e.classList.remove(`active`),t.classList.remove(`active`)},document.body.appendChild(t),t},UI:{card:(e,t,n,r=`100%`)=>`<div class="card" style="max-width: ${r}; margin: 0 auto;">${e?`<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${e}</h3>`:``}${t?`<p style="color:#666; margin-bottom:20px; font-size:13px;">${t}</p>`:``}${n}</div>`,input:(e,t,n=``,r=``,i=`text`,a=``)=>`<div class="input-group"><label>${e}</label><input type="${i}" id="${t}" value="${n}" placeholder="${r}" ${a}></div>`,botao:(e,t,n=`primary`,r=``)=>`<button class="${n===`primary`?`btn-primary`:n===`cancel`?`btn-cancel`:`btn-edit`}" style="width: auto; padding: 10px 20px;" onclick="${t}">${r} ${e}</button>`,colorPicker:(e,t,n)=>`<div class="theme-row"><label>${e}</label><input type="color" value="${(e=>{if(!e)return`#000000`;e=String(e).trim();let t={"#fff":`#ffffff`,"#000":`#000000`,"#333":`#333333`,"#666":`#666666`,"#999":`#999999`,"#ccc":`#cccccc`,"#eee":`#eeeeee`};return t[e.toLowerCase()]?t[e.toLowerCase()]:/^#[0-9A-Fa-f]{6}$/.test(e)?e:`#000000`})(t)}" oninput="App.previewCor('${n}', this.value)"></div>`}}),window.App=window.App||{};var u=window.App;Object.assign(u,{aplicarTemaSalvo:()=>{let e=JSON.parse(localStorage.getItem(u.getTenantKey(`escola_tema`)));if(e){let t=document.documentElement;e.sidebarBg&&t.style.setProperty(`--sidebar-bg`,e.sidebarBg),e.sidebarText&&t.style.setProperty(`--sidebar-text`,e.sidebarText),e.bodyBg&&t.style.setProperty(`--body-bg`,e.bodyBg),e.textMain&&t.style.setProperty(`--text-main`,e.textMain),e.cardBg&&t.style.setProperty(`--card-bg`,e.cardBg),e.cardText&&t.style.setProperty(`--card-text`,e.cardText),e.zoomLevel&&t.style.setProperty(`--zoom-level`,e.zoomLevel)}else document.documentElement.removeAttribute(`style`)},renderizarConfiguracoesAparencia:()=>{u.setTitulo(`Aparência do Sistema`);let e=document.getElementById(`app-content`),t=getComputedStyle(document.documentElement),n=JSON.parse(localStorage.getItem(u.getTenantKey(`escola_tema`)))||{},r={sbBg:t.getPropertyValue(`--sidebar-bg`).trim(),sbTxt:t.getPropertyValue(`--sidebar-text`).trim(),bdBg:t.getPropertyValue(`--body-bg`).trim(),txtMain:t.getPropertyValue(`--text-main`).trim(),cdBg:t.getPropertyValue(`--card-bg`).trim(),cdTxt:t.getPropertyValue(`--card-text`).trim(),zoomAtual:n.zoomLevel||`1`},i=JSON.parse(localStorage.getItem(u.getTenantKey(`escola_atalhos`)))||[],a=`<div class="theme-section"><h4 style="margin:0 0 15px 0;">1. Cores do Sistema</h4><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;"><div><div style="font-weight:bold; margin-bottom:10px;">Menu Lateral</div>${u.UI.colorPicker(`Fundo:`,r.sbBg,`--sidebar-bg`)}${u.UI.colorPicker(`Texto:`,r.sbTxt,`--sidebar-text`)}</div><div><div style="font-weight:bold; margin-bottom:10px;">Área Principal</div>${u.UI.colorPicker(`Fundo:`,r.bdBg,`--body-bg`)}${u.UI.colorPicker(`Texto:`,r.txtMain,`--text-main`)}</div><div><div style="font-weight:bold; margin-bottom:10px;">Dashboard / Cards</div>${u.UI.colorPicker(`Fundo:`,r.cdBg,`--card-bg`)}${u.UI.colorPicker(`Texto:`,r.cdTxt,`--card-text`)}</div></div></div>`,o=`<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">2. Atalhos no Dashboard</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Selecione os atalhos (Mínimo: 1 | Máximo: 8).</p><div class="shortcut-selector" style="display:flex; flex-wrap:wrap; gap:10px;">${(window.LISTA_FUNCIONALIDADES||[]).map(e=>`<label class="shortcut-item" style="background:#f9f9f9; padding:8px 12px; border-radius:6px; cursor:pointer;"><input type="checkbox" class="sc-check" value="${e.id}" ${i.includes(e.id)?`checked`:``} onchange="App.validarLimiteAtalhos(this)"> ${e.icon} ${e.nome}</label>`).join(``)}</div></div>`,s=`<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">3. Tamanho da Fonte (Zoom)</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Ajuste o tamanho geral para facilitar a leitura.</p><div class="input-group" style="max-width: 300px;"><select id="theme-zoom" style="font-weight:bold; cursor:pointer;" onchange="App.previewZoom(this.value)"><option value="0.9" ${r.zoomAtual===`0.9`?`selected`:``}>Pequena (90%)</option><option value="1" ${r.zoomAtual===`1`?`selected`:``}>Padrão (100%)</option><option value="1.1" ${r.zoomAtual===`1.1`?`selected`:``}>Maior (110%)</option></select></div></div>`,c=`<div style="display:flex; gap:10px; margin-top: 25px; flex-wrap:wrap;">${u.UI.botao(`💾 SALVAR ALTERAÇÕES`,`App.salvarTema()`,`primary`,``)}${u.UI.botao(`✖️ RESTAURAR PADRÃO`,`App.resetarTema()`,`cancel`,``)}</div>`;e.innerHTML=u.UI.card(`🎨 Personalizar Aparência`,`Personalize as cores, zoom e atalhos da tela inicial.`,a+s+o+c,`800px`)},previewCor:(e,t)=>{document.documentElement.style.setProperty(e,t)},previewZoom:e=>{document.documentElement.style.setProperty(`--zoom-level`,e)},validarLimiteAtalhos:e=>{document.querySelectorAll(`.sc-check:checked`).length>8&&(e.checked=!1,u.showToast(`O limite máximo é de 8 atalhos.`,`warning`))},salvarTema:()=>{let e=getComputedStyle(document.documentElement),t={sidebarBg:e.getPropertyValue(`--sidebar-bg`).trim(),sidebarText:e.getPropertyValue(`--sidebar-text`).trim(),bodyBg:e.getPropertyValue(`--body-bg`).trim(),textMain:e.getPropertyValue(`--text-main`).trim(),cardBg:e.getPropertyValue(`--card-bg`).trim(),cardText:e.getPropertyValue(`--card-text`).trim(),zoomLevel:document.getElementById(`theme-zoom`).value},n=Array.from(document.querySelectorAll(`.sc-check:checked`)).map(e=>e.value);if(n.length===0)return u.showToast(`Selecione pelo menos 1 atalho.`,`warning`);if(n.length>8)return u.showToast(`Máximo de 8 atalhos permitidos.`,`warning`);localStorage.setItem(u.getTenantKey(`escola_tema`),JSON.stringify(t)),localStorage.setItem(u.getTenantKey(`escola_atalhos`),JSON.stringify(n)),u.aplicarTemaSalvo(),u.showToast(`Configurações salvas com sucesso! 🎉`,`success`),setTimeout(()=>{u.renderizarInicio()},800)},resetarTema:()=>{confirm(`Deseja restaurar as cores e fontes padrão?`)&&(localStorage.removeItem(u.getTenantKey(`escola_tema`)),localStorage.setItem(u.getTenantKey(`escola_atalhos`),JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`])),document.documentElement.removeAttribute(`style`),u.showToast(`Aparência restaurada com sucesso! 🔄`,`success`),setTimeout(()=>{location.reload()},1e3))}});function d(e){let t=new Uint8Array(e),n=``;for(let e of t)n+=String.fromCharCode(e);return btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=/g,``)}function f(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`),n=(4-t.length%4)%4,r=t.padEnd(t.length+n,`=`),i=atob(r),a=new ArrayBuffer(i.length),o=new Uint8Array(a);for(let e=0;e<i.length;e++)o[e]=i.charCodeAt(e);return a}function p(){return m.stubThis(globalThis?.PublicKeyCredential!==void 0&&typeof globalThis.PublicKeyCredential==`function`)}var m={stubThis:e=>e};function h(e){let{id:t}=e;return{...e,id:f(t),transports:e.transports}}function g(e){return e===`localhost`||/^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(e)}var _=class extends Error{constructor({message:e,code:t,cause:n,name:r}){super(e,{cause:n}),Object.defineProperty(this,`code`,{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.name=r??n.name,this.code=t}};function v({error:e,options:t}){let{publicKey:n}=t;if(!n)throw Error(`options was missing required publicKey property`);if(e.name===`AbortError`){if(t.signal instanceof AbortSignal)return new _({message:`Registration ceremony was sent an abort signal`,code:`ERROR_CEREMONY_ABORTED`,cause:e})}else if(e.name===`ConstraintError`){if(n.authenticatorSelection?.requireResidentKey===!0)return new _({message:`Discoverable credentials were required but no available authenticator supported it`,code:`ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT`,cause:e});if(t.mediation===`conditional`&&n.authenticatorSelection?.userVerification===`required`)return new _({message:`User verification was required during automatic registration but it could not be performed`,code:`ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE`,cause:e});if(n.authenticatorSelection?.userVerification===`required`)return new _({message:`User verification was required but no available authenticator supported it`,code:`ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT`,cause:e})}else if(e.name===`InvalidStateError`)return new _({message:`The authenticator was previously registered`,code:`ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED`,cause:e});else if(e.name===`NotAllowedError`)return new _({message:e.message,code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:e});else if(e.name===`NotSupportedError`)return n.pubKeyCredParams.filter(e=>e.type===`public-key`).length===0?new _({message:`No entry in pubKeyCredParams was of type "public-key"`,code:`ERROR_MALFORMED_PUBKEYCREDPARAMS`,cause:e}):new _({message:`No available authenticator supported any of the specified pubKeyCredParams algorithms`,code:`ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG`,cause:e});else if(e.name===`SecurityError`){let t=globalThis.location.hostname;if(!g(t))return new _({message:`${globalThis.location.hostname} is an invalid domain`,code:`ERROR_INVALID_DOMAIN`,cause:e});if(n.rp.id!==t)return new _({message:`The RP ID "${n.rp.id}" is invalid for this domain`,code:`ERROR_INVALID_RP_ID`,cause:e})}else if(e.name===`TypeError`){if(n.user.id.byteLength<1||n.user.id.byteLength>64)return new _({message:`User ID was not between 1 and 64 characters`,code:`ERROR_INVALID_USER_ID_LENGTH`,cause:e})}else if(e.name===`UnknownError`)return new _({message:`The authenticator was unable to process the specified options, or could not create a new credential`,code:`ERROR_AUTHENTICATOR_GENERAL_ERROR`,cause:e});return e}var y=new class{constructor(){Object.defineProperty(this,`controller`,{enumerable:!0,configurable:!0,writable:!0,value:void 0})}createNewAbortSignal(){if(this.controller){let e=Error(`Cancelling existing WebAuthn API call for new one`);e.name=`AbortError`,this.controller.abort(e)}let e=new AbortController;return this.controller=e,e.signal}cancelCeremony(){if(this.controller){let e=Error(`Manually cancelling existing WebAuthn API call`);e.name=`AbortError`,this.controller.abort(e),this.controller=void 0}}},b=[`cross-platform`,`platform`];function x(e){if(e&&!(b.indexOf(e)<0))return e}async function S(e){!e.optionsJSON&&e.challenge&&(console.warn(`startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.`),e={optionsJSON:e});let{optionsJSON:t,useAutoRegister:n=!1}=e;if(!p())throw Error(`WebAuthn is not supported in this browser`);let r={...t,challenge:f(t.challenge),user:{...t.user,id:f(t.user.id)},excludeCredentials:t.excludeCredentials?.map(h)},i={};n&&(i.mediation=`conditional`),i.publicKey=r,i.signal=y.createNewAbortSignal();let a;try{a=await navigator.credentials.create(i)}catch(e){throw v({error:e,options:i})}if(!a)throw Error(`Registration was not completed`);let{id:o,rawId:s,response:c,type:l}=a,u;typeof c.getTransports==`function`&&(u=c.getTransports());let m;if(typeof c.getPublicKeyAlgorithm==`function`)try{m=c.getPublicKeyAlgorithm()}catch(e){C(`getPublicKeyAlgorithm()`,e)}let g;if(typeof c.getPublicKey==`function`)try{let e=c.getPublicKey();e!==null&&(g=d(e))}catch(e){C(`getPublicKey()`,e)}let _;if(typeof c.getAuthenticatorData==`function`)try{_=d(c.getAuthenticatorData())}catch(e){C(`getAuthenticatorData()`,e)}return{id:o,rawId:d(s),response:{attestationObject:d(c.attestationObject),clientDataJSON:d(c.clientDataJSON),transports:u,publicKeyAlgorithm:m,publicKey:g,authenticatorData:_},type:l,clientExtensionResults:a.getClientExtensionResults(),authenticatorAttachment:x(a.authenticatorAttachment)}}function C(e,t){console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${e}. You should report this error to them.\n`,t)}function w(){if(!p())return T.stubThis(new Promise(e=>e(!1)));let e=globalThis.PublicKeyCredential;return e?.isConditionalMediationAvailable===void 0?T.stubThis(new Promise(e=>e(!1))):T.stubThis(e.isConditionalMediationAvailable())}var T={stubThis:e=>e};function E({error:e,options:t}){let{publicKey:n}=t;if(!n)throw Error(`options was missing required publicKey property`);if(e.name===`AbortError`){if(t.signal instanceof AbortSignal)return new _({message:`Authentication ceremony was sent an abort signal`,code:`ERROR_CEREMONY_ABORTED`,cause:e})}else if(e.name===`NotAllowedError`)return new _({message:e.message,code:`ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY`,cause:e});else if(e.name===`SecurityError`){let t=globalThis.location.hostname;if(!g(t))return new _({message:`${globalThis.location.hostname} is an invalid domain`,code:`ERROR_INVALID_DOMAIN`,cause:e});if(n.rpId!==t)return new _({message:`The RP ID "${n.rpId}" is invalid for this domain`,code:`ERROR_INVALID_RP_ID`,cause:e})}else if(e.name===`UnknownError`)return new _({message:`The authenticator was unable to process the specified options, or could not create a new assertion signature`,code:`ERROR_AUTHENTICATOR_GENERAL_ERROR`,cause:e});return e}async function D(e){!e.optionsJSON&&e.challenge&&(console.warn(`startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.`),e={optionsJSON:e});let{optionsJSON:t,useBrowserAutofill:n=!1,verifyBrowserAutofillInput:r=!0}=e;if(!p())throw Error(`WebAuthn is not supported in this browser`);let i;t.allowCredentials?.length!==0&&(i=t.allowCredentials?.map(h));let a={...t,challenge:f(t.challenge),allowCredentials:i},o={};if(n){if(!await w())throw Error(`Browser does not support WebAuthn autofill`);if(document.querySelectorAll(`input[autocomplete$='webauthn']`).length<1&&r)throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');o.mediation=`conditional`,a.allowCredentials=[]}o.publicKey=a,o.signal=y.createNewAbortSignal();let s;try{s=await navigator.credentials.get(o)}catch(e){throw E({error:e,options:o})}if(!s)throw Error(`Authentication was not completed`);let{id:c,rawId:l,response:u,type:m}=s,g;return u.userHandle&&(g=d(u.userHandle)),{id:c,rawId:d(l),response:{authenticatorData:d(u.authenticatorData),clientDataJSON:d(u.clientDataJSON),signature:d(u.signature),userHandle:g},type:m,clientExtensionResults:s.getClientExtensionResults(),authenticatorAttachment:x(s.authenticatorAttachment)}}window.App=window.App||{};var O=window.App;window.App=O,Object.assign(O,{mostrarTelaBloqueioLogin:e=>{document.documentElement.removeAttribute(`style`),document.getElementById(`tela-sistema`).style.display=`none`;let t=document.getElementById(`tela-login`);t&&(t.style.display=t.classList.contains(`login-wrapper`)?`flex`:`block`);let n=t.querySelectorAll(`.login-box, .box-login`);n.forEach(e=>{e.id!==`box-bloqueio-conta`&&(e.style.display=`none`)});let r=document.getElementById(`box-bloqueio-conta`);r||(r=document.createElement(`div`),r.id=`box-bloqueio-conta`,r.className=n.length>0?n[0].className:`login-box`,r.style.maxWidth=`400px`,r.style.margin=`0 auto`,r.style.background=`#fff`,r.style.padding=`30px`,r.style.borderRadius=`12px`,r.style.boxShadow=`0 10px 25px rgba(0,0,0,0.1)`,t.appendChild(r)),r.style.display=`block`,r.innerHTML=`
            <div style="text-align:center;">
                <span style="font-size: 45px; display:block; margin-bottom: 10px;">🔒</span>
                <h2 style="color: #e74c3c; margin-top:0; font-size:22px;">Acesso Bloqueado</h2>
                <p style="color: #666; font-size: 13px; margin-bottom: 20px;">O seu acesso foi bloqueado por falta de pagamento ou o seu período de teste expirou.</p>

                <div style="background: #fdf2f2; padding: 20px; border-radius: 8px; border: 1px solid #f5b7b1; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #c0392b; font-size: 15px;">Já efetuou o pagamento?</h4>
                    <p style="font-size:12px; color:#c0392b; margin-bottom: 15px;">Insira a sua Chave de Ativação (PIN) para liberar o sistema imediatamente.</p>

                    <input type="text" id="input-pin-login" placeholder="Digite o PIN recebido" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #ccc; text-align: center; font-weight: bold; letter-spacing: 2px; margin-bottom: 15px; font-size: 16px; box-sizing:border-box;">

                    <button class="btn-primary" style="width: 100%; justify-content: center; background: #27ae60; border:none; padding:12px; border-radius:6px; color:white; font-weight:bold; cursor:pointer;" onclick="App.ativarPinLogin(event)">🔓 Validar e Desbloquear</button>
                </div>

                <button class="btn-cancel" style="width: 100%; justify-content: center; background:transparent; border:1px solid #ccc; padding:10px; border-radius:6px; cursor:pointer;" onclick="App.sairDaTelaDeBloqueio()">Sair e Voltar ao Login</button>
            </div>
        `},sairDaTelaDeBloqueio:()=>{O.logout()},ativarPinLogin:async e=>{e&&e.preventDefault();let t=document.getElementById(`input-pin-login`);if(!t)return;let n=t.value.trim().toUpperCase();if(!n)return O.showToast(`Por favor, insira o PIN recebido no e-mail.`,`warning`);let r=e.target,i=r.innerText;r&&(r.innerText=`A validar... ⏳`,r.disabled=!0);try{let e=await O.api(`/escola/validar-pin`,`POST`,{pin:n}),t=e&&e.success?e.plano:null;if(!t)if(n.includes(`PRE`))t=`Premium`;else if(n.includes(`ESS`))t=`Essencial`;else if(n.includes(`PRO`))t=`Profissional`;else{O.showToast(e.error||`PIN inválido ou formato incorreto.`,`error`),r&&(r.innerText=i,r.disabled=!1);return}let a=await O.api(`/escola`)||{},o=new Date;o.setDate(o.getDate()+30),await O.api(`/escola`,`PUT`,{...a,plano:t,pinUsado:n,dataExpiracao:o.toISOString()}),localStorage.setItem(O.getTenantKey(`escola_plano`),t);let s=JSON.parse(localStorage.getItem(O.getTenantKey(`escola_perfil`)))||{};s.plano=t,s.dataExpiracao=o.toISOString(),localStorage.setItem(O.getTenantKey(`escola_perfil`),JSON.stringify(s)),typeof O.atualizarUIHeader==`function`&&O.atualizarUIHeader(s),O.showToast(`🎉 PIN validado! Sistema desbloqueado por mais 30 dias.`,`success`);let c=document.getElementById(`box-bloqueio-conta`);c&&(c.style.display=`none`),O.entrarNoSistema()}catch{O.showToast(`Erro ao comunicar com a base de dados.`,`error`)}finally{r&&(r.innerText=i,r.disabled=!1)}},init:async()=>{localStorage.removeItem(`escola_tema`),localStorage.removeItem(`escola_atalhos`),localStorage.removeItem(`escola_perfil`);let e=new URLSearchParams(window.location.search).get(`reset`);if(e){document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`,setTimeout(()=>{O.abrirModalNovaSenha(e)},300);return}let t=localStorage.getItem(`usuario_logado`);if(localStorage.getItem(`escola_bio_id`)&&window.PublicKeyCredential){document.getElementById(`tela-login`).style.display=`none`,document.getElementById(`tela-sistema`).style.display=`none`,O.entrarComBiometria(!0);return}if(t){O.usuario=JSON.parse(t),typeof O.aplicarTemaSalvo==`function`&&O.aplicarTemaSalvo();let e=O.getTenantKey(`escola_atalhos`);localStorage.getItem(e)||localStorage.setItem(e,JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`])),document.getElementById(`tela-login`)?.style.setProperty(`display`,`none`),document.getElementById(`tela-sistema`)?.style.setProperty(`display`,`flex`);let n=document.getElementById(`user-name`);n&&O.usuario&&(n.innerText=O.usuario.nome||O.usuario.login),typeof O.aplicarPermissoesDeUsuario==`function`&&O.aplicarPermissoesDeUsuario(),typeof O.setupMobileMenu==`function`&&O.setupMobileMenu(),typeof O.iniciarRoteadorGlobal==`function`?setTimeout(()=>{O.iniciarRoteadorGlobal()},50):typeof O.renderizarInicio==`function`&&O.renderizarInicio(),setTimeout(async()=>{let e=await O.api(`/escola`,`GET`,null,!0);if(!e||e.error){if(e?.error===`Sessão não encontrada.`||e?.error===`Sessão expirada.`){O.showToast(`Sessão expirada por segurança. Faça login novamente.`,`warning`),await O.logout();return}}else localStorage.setItem(O.getTenantKey(`escola_plano`),e.plano),localStorage.setItem(O.getTenantKey(`escola_perfil`),JSON.stringify(e)),typeof O.atualizarUIHeader==`function`&&O.atualizarUIHeader(e),typeof O.verificarBloqueioGeral==`function`&&O.verificarBloqueioGeral(e)&&(document.documentElement.removeAttribute(`style`),O.mostrarTelaBloqueioLogin(e))},1e3)}else document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`;let n=document.getElementById(`data-hoje`);n&&(n.innerText=new Date().toLocaleDateString(`pt-BR`));let r=document.getElementById(`login-pass`);if(r&&r.addEventListener(`keypress`,function(e){e.key===`Enter`&&O.fazerLogin()}),!O.motorTempoRealLigado){let e=()=>{let e=document.getElementById(`tela-sistema`);O.usuario&&e&&e.style.display!==`none`&&document.visibilityState===`visible`&&(typeof O.verificarNovidadesSilenciosamente==`function`&&O.verificarNovidadesSilenciosamente(),typeof O.carregarDadosEscola==`function`&&O.carregarDadosEscola(!0))};setTimeout(e,2e3),setInterval(e,1e4),O.motorTempoRealLigado=!0}},fazerLogin:async()=>{let e=document.getElementById(`login-user`).value.trim(),t=document.getElementById(`login-pass`).value.trim();if(!e||!t)return O.showToast(`Preencha utilizador e senha`,`warning`);let n=document.querySelector(`#tela-login button[type="submit"]`),r=n.innerText;n.innerText=`Acessando... ⏳`,n.disabled=!0;try{let n=O.getDeviceId?O.getDeviceId():`dev_web`,r=await O.api(`/auth/login`,`POST`,{login:e,senha:t,deviceId:n});if(r&&r.success){O.usuario=r.usuario,localStorage.setItem(`usuario_logado`,JSON.stringify(r.usuario)),typeof gtag==`function`&&gtag(`event`,`login`,{method:`Sistema PTT`}),typeof O.aplicarTemaSalvo==`function`&&O.aplicarTemaSalvo();let e=O.getTenantKey(`escola_atalhos`);localStorage.getItem(e)||localStorage.setItem(e,JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]));let t=await O.api(`/escola`);if(!t||t.error){if(t?.error===`Sessão não encontrada.`||t?.error===`Sessão expirada.`){await O.logout();return}t=JSON.parse(localStorage.getItem(O.getTenantKey(`escola_perfil`)))||{}}if(typeof O.verificarBloqueioGeral==`function`&&O.verificarBloqueioGeral(t))O.mostrarTelaBloqueioLogin(t);else{O.entrarNoSistema(),Notification.permission===`granted`&&O.configurarNotificacoesPush();let e=window.location.hash.replace(`#`,``);e&&e!==`login`&&setTimeout(()=>{typeof O.renderizarTela==`function`&&O.renderizarTela(e,!0)},100),O.showToast(`Bem-vindo ao sistema!`,`success`)}}else O.showToast(r.error||`Login ou senha incorretos`,`error`)}catch{O.showToast(`Erro ao conectar no servidor`,`error`)}finally{n.innerText=r,n.disabled=!1}},entrarNoSistema:async()=>{document.getElementById(`tela-login`)?.style.setProperty(`display`,`none`),document.getElementById(`tela-sistema`)?.style.setProperty(`display`,`flex`);let e=document.getElementById(`user-name`);e&&O.usuario&&(e.innerText=O.usuario.nome||O.usuario.login),typeof O.aplicarPermissoesDeUsuario==`function`&&O.aplicarPermissoesDeUsuario(),typeof O.setupMobileMenu==`function`&&O.setupMobileMenu(),typeof O.carregarDadosEscola==`function`&&await O.carregarDadosEscola(!0);let t=document.getElementById(`tela-sistema`);t&&t.style.display!==`none`&&(typeof O.iniciarRoteadorGlobal==`function`?O.iniciarRoteadorGlobal():typeof O.renderizarInicio==`function`&&O.renderizarInicio())},logout:async()=>{O.radarAtivo&&clearInterval(O.radarAtivo);try{typeof O.api==`function`?await O.api(`/auth/logout`,`POST`):await fetch(`/api/auth/logout`,{method:`POST`,credentials:`include`})}catch{console.warn(`Logout silencioso.`)}localStorage.clear(),sessionStorage.clear();let e=O.getTenantKey?O.getTenantKey(`ultima_tela`):`ultima_tela_convidado`;localStorage.removeItem(e),O.usuario=null,O.listaCache=[],window.location.href=window.location.pathname},toggleSenhaLogin:()=>{let e=document.getElementById(`login-pass`);e&&(e.type=e.type===`password`?`text`:`password`)},abrirModalRecuperacao:e=>{e&&e.preventDefault();let t=document.getElementById(`modal-recuperacao-senha`);t||(t=document.createElement(`div`),t.id=`modal-recuperacao-senha`,t.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;`,t.innerHTML=`
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:400px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔐</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Recuperar Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Insira o e-mail registado na sua conta. Enviaremos um link seguro.</p>
                    <input type="email" id="recuperar-email-input" placeholder="O seu e-mail de acesso" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.enviarRecuperacaoSenha()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✉️ Enviar Link</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-recuperacao-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar</button>
                </div>
            `,document.body.appendChild(t)),document.getElementById(`recuperar-email-input`).value=``,t.style.display=`flex`},enviarRecuperacaoSenha:async()=>{let e=document.getElementById(`recuperar-email-input`)?.value.trim();if(!e)return O.showToast(`Informe o e-mail de acesso.`,`warning`);let t=document.querySelector(`#modal-recuperacao-senha .btn-primary`),n=t.innerText;t.innerText=`Enviando... ⏳`,t.disabled=!0;try{let t=await O.api(`/auth/recuperar-senha`,`POST`,{email:e});t&&t.success?(O.showToast(t.message||`Link enviado com sucesso.`,`success`),document.getElementById(`modal-recuperacao-senha`).style.display=`none`):O.showToast(t.error||`Erro ao solicitar.`,`error`)}catch{O.showToast(`Erro de comunicação.`,`error`)}finally{t.innerText=n,t.disabled=!1}},abrirModalNovaSenha:e=>{let t=document.getElementById(`modal-nova-senha`);t||(t=document.createElement(`div`),t.id=`modal-nova-senha`,t.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:10000;`,t.innerHTML=`
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:420px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔑</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Criar Nova Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Digite a sua nova senha de acesso.</p>
                    <input type="password" id="nova-senha-reset" placeholder="Nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:12px; text-align:center;">
                    <input type="password" id="confirma-senha-reset" placeholder="Confirmar nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.confirmarNovaSenhaReset()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✅ Salvar Senha</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-nova-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar</button>
                </div>
            `,document.body.appendChild(t)),O.tokenResetSenha=e,t.style.display=`flex`},confirmarNovaSenhaReset:async()=>{let e=document.getElementById(`nova-senha-reset`)?.value||``,t=document.getElementById(`confirma-senha-reset`)?.value||``;if(e.length<6)return O.showToast(`Mínimo de 6 caracteres.`,`warning`);if(e!==t)return O.showToast(`As senhas não conferem.`,`warning`);let n=document.querySelector(`#modal-nova-senha .btn-primary`),r=n.innerText;n.innerText=`Salvando... ⏳`,n.disabled=!0;try{let t=await O.api(`/auth/redefinir-senha`,`POST`,{token:O.tokenResetSenha,novaSenha:e});if(t&&t.success){O.showToast(`Senha redefinida! Faça login agora.`,`success`),document.getElementById(`modal-nova-senha`).style.display=`none`,O.tokenResetSenha=null;let e=window.location.origin+window.location.pathname;window.history.replaceState({},document.title,e)}else O.showToast(t.error||`Erro ao redefinir.`,`error`)}catch{O.showToast(`Erro de comunicação.`,`error`)}finally{n.innerText=r,n.disabled=!1}},bufferToBase64:function(e){for(var t=new Uint8Array(e),n=``,r=0;r<t.byteLength;r++)n+=String.fromCharCode(t[r]);return btoa(n)},base64ToBuffer:function(e){for(var t=atob(e),n=t.length,r=new Uint8Array(n),i=0;i<n;i++)r[i]=t.charCodeAt(i);return r},renderizarMinhaConta:async(e=!1)=>{e||window.history.pushState({tela:`conta`},``,`#conta`),typeof O.salvarEstadoNavegacao==`function`&&O.salvarEstadoNavegacao(`fundo`,{tipo:`tela`,alvo:`conta`}),typeof O.setTitulo==`function`&&O.setTitulo(`Gestão de Usuários`);let t=document.getElementById(`app-content`);O.idEdicaoUsuario=null;let n=O.usuario?O.usuario.login:``,r=O.usuario&&O.usuario.email?O.usuario.email:``,i=(e,t)=>`<div class="input-group" style="position:relative;"><label>${t}</label><input type="password" id="${e}" style="width:100%; padding-right:40px;"><span onclick="App.toggleSenhaVisibilidade('${e}')" style="position:absolute; right:12px; top:32px; cursor:pointer; font-size:16px; opacity:0.6; user-select:none;" title="Mostrar/Ocultar Senha">👁️</span></div>`;try{let e=await O.api(`/usuarios`),a=(Array.isArray(e)?e:[]).filter(e=>e.id===O.usuario.id||String(e.donoId)===String(O.usuario.id)),o=localStorage.getItem(`escola_bio_id`)?`<div style="background: #eafaf1; border: 1px solid #27ae60; color: #27ae60; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-weight: bold; text-align: center; font-size:13px;">✅ Biometria Ativada neste Aparelho</div>
                   <button class="btn-cancel" style="width: 100%; justify-content:center; border: 1px solid #e74c3c; color: #e74c3c; background: transparent;" onclick="App.desativarBiometria()">🗑️ Remover Biometria</button>`:`<div style="background: #fdf2f2; border: 1px solid #e74c3c; color: #e74c3c; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-weight: bold; text-align: center; font-size:13px;">❌ Biometria Não Configurada</div>
                   <button class="btn-primary" style="background: #27ae60; width: 100%; justify-content:center;" onclick="App.configurarBiometria()">👆 Configurar Biometria</button>`;t.innerHTML=`
                <div style="display:flex; gap:30px; flex-wrap:wrap;">
                    <div class="card" style="flex:1; height:fit-content; min-width:300px;">
                        <h3>Meus Dados de Acesso</h3>
                        <p style="font-size:12px; color:#666; margin-bottom:15px;">A senha atual é sempre obrigatória para salvar as alterações.</p>
                        <div class="input-group"><label>E-mail Dono da Conta</label><input type="email" id="user-novo-email" value="${O.escapeHTML(r)}" placeholder="Ex: gestor@escola.com" style="width:100%; border-left: 4px solid #f39c12;"></div>
                        <div class="input-group"><label>Login de Acesso</label><input type="text" id="user-novo-login" value="${O.escapeHTML(n)}" style="width:100%; border-left: 4px solid #3498db;"></div>
                        ${i(`user-senha-atual`,`Senha Atual (Obrigatória)`)}
                        ${i(`user-nova-senha`,`Nova Senha (Opcional)`)}
                        ${i(`user-conf-senha`,`Confirmar Nova Senha`)}
                        
                        <button class="btn-primary" style="width:100%; margin-top:10px; justify-content:center;" onclick="App.atualizarMeusDados()">ATUALIZAR DADOS</button>

                        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">🔒 Segurança Avançada</h4>
                            <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Use o sensor de rosto (FaceID) ou impressão digital para entrar sem senha.</p>
                            ${o}
                        </div>
                    </div>
                    <div class="card" style="flex:2; min-width:300px;">
                        <h3>Equipe e Acessos</h3>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; margin-bottom:20px; border:1px solid #eee;">
                            <h4 id="titulo-form-user" style="margin:0 0 15px 0; color:#2c3e50;">Novo Usuário</h4>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
                                <div class="input-group"><label>Nome</label><input id="new-nome" placeholder="Ex: Maria"></div>
                                <div class="input-group"><label>Login</label><input id="new-login" placeholder="Ex: maria"></div>
                                <div class="input-group"><label>Senha</label><input id="new-senha" type="password" placeholder="******"></div>
                                <div class="input-group"><label>Permissão</label><select id="new-tipo"><option value="Gestor">Gestor</option><option value="Secretaria">Secretaria</option><option value="Professor">Professor</option></select></div>
                            </div>
                            <div style="text-align:right; margin-top:10px; display:flex; justify-content:flex-end; gap:10px;">
                                <button id="btn-cancel-user" class="btn-cancel" onclick="App.cancelarEdicaoUsuario()" style="display:none; margin-top:0;">✖️ CANCELAR</button>
                                <button id="btn-save-user" class="btn-primary" style="width:auto; margin-top:0;" onclick="App.salvarNovoUsuario()">CRIAR USUÁRIO</button>
                            </div>
                        </div>
                        <div class="table-responsive-wrapper">
                            <table style="width:100%; text-align:left; border-collapse:collapse;">
                                <thead><tr><th style="padding-bottom:10px;">Nome</th><th style="padding-bottom:10px;">Login</th><th style="padding-bottom:10px;">Tipo</th><th style="text-align:right;">Ações</th></tr></thead>
                                <tbody>${a.map(e=>`<tr><td style="padding:10px 0; border-top:1px solid #eee;">${O.escapeHTML(e.nome)} ${e.isDono?`👑`:``}</td><td style="padding:10px 0; border-top:1px solid #eee;">${O.escapeHTML(e.login)}</td><td style="padding:10px 0; border-top:1px solid #eee;"><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${O.escapeHTML(e.tipo)}</span></td><td style="text-align:right; border-top:1px solid #eee;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${e.id}', '${O.escapeHTML(e.nome)}', '${O.escapeHTML(e.login)}', '${O.escapeHTML(e.tipo)}')">✏️</button>${e.isDono?``:`<button class="btn-del" onclick="App.excluirUsuario('${e.id}')">🗑️</button>`}</td></tr>`).join(``)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>`;let s=O.getTenantKey?O.getTenantKey(`estado_navegacao`):`estado_navegacao`,c=JSON.parse(localStorage.getItem(s))||{};if(c.subtela_conta&&c.subtela_conta.acao===`editar`){let e=a.find(e=>e.id===c.subtela_conta.id);e&&O.preencherEdicaoUsuario(e.id,e.nome,e.login,e.tipo,!0)}}catch{t.innerHTML=`Erro ao carregar usuários.`}},configurarNotificacoesPush:async()=>{if(!(`serviceWorker`in navigator)||!(`PushManager`in window))return console.warn(`Este dispositivo não suporta Notificações Push.`);try{if(await Notification.requestPermission()!==`granted`)return O.showToast(`Permissão de notificações negada pelo utilizador.`,`warning`);let e=await O.api(`/push/public-key`,`GET`);if(!e||!e.publicKey)throw Error(`Chave VAPID não encontrada.`);let t=await navigator.serviceWorker.ready,n=`=`.repeat((4-e.publicKey.length%4)%4),r=(e.publicKey+n).replace(/\-/g,`+`).replace(/_/g,`/`),i=window.atob(r),a=new Uint8Array(i.length);for(let e=0;e<i.length;++e)a[e]=i.charCodeAt(e);let o=await t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:a}),s=await O.api(`/push/subscribe`,`POST`,o);s&&s.success&&(O.showToast(`🔔 Notificações ativadas com sucesso neste aparelho!`,`success`),setTimeout(()=>{O.api(`/push/teste`,`POST`)},1500))}catch(e){console.error(`Erro ao ativar Push:`,e),O.showToast(`Falha ao ligar notificações com o servidor.`,`error`)}},desativarBiometria:async()=>{try{let e=localStorage.getItem(`escola_bio_id`)||(O.usuario?O.usuario.login:null);e&&await O.api(`/auth/biometria/remover`,`POST`,{login:e})}catch(e){console.warn(e)}localStorage.removeItem(`escola_bio_id`),O.showToast(`Acesso biométrico desativado.`,`success`),typeof O.renderizarMinhaConta==`function`&&O.renderizarMinhaConta()},configurarBiometria:async()=>{try{O.exibirOverlayBiometria(`Configurar Acesso`,`A aguardar a leitura do seu sensor...`);let e=await O.api(`/auth/biometria/gerar-registo`,`POST`,{login:O.usuario.login});if(e.error)throw Error(e.error);let t=await S(e),n=await O.api(`/auth/biometria/verificar-registo`,`POST`,{login:O.usuario.login,respostaBio:t});if(n&&n.success)localStorage.setItem(`escola_bio_id`,O.usuario.login),O.removerOverlayBiometria(),O.showToast(`✅ Biometria ativada e registada no servidor!`,`success`),typeof O.renderizarMinhaConta==`function`&&O.renderizarMinhaConta();else throw Error(`O servidor rejeitou a assinatura.`)}catch(e){O.removerOverlayBiometria(),console.error(e),O.showToast(`Configuração biométrica cancelada ou bloqueada.`,`warning`)}},exibirTelaTouchBiometria:()=>{let e=document.getElementById(`bio-touch-screen`);e||(e=document.createElement(`div`),e.id=`bio-touch-screen`,e.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:99999; cursor:pointer; color:white; transition: opacity 0.3s;`,e.innerHTML=`
                <div style="width: 90px; height: 90px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: pulseBio 2s infinite;">
                    <span style="font-size: 45px;">🛡️</span>
                </div>
                <h2 id="bio-tela-titulo" style="margin:0 0 10px 0; font-size:24px; font-weight:700; letter-spacing: 1px;">Bem-vindo de volta!</h2>
                <p id="bio-tela-sub" style="opacity:0.9; margin:0 0 40px 0; font-size:15px; text-align:center; padding: 0 20px; font-weight:300;">Toque em qualquer lugar da tela<br>para aceder com FaceID / Digital.</p>
                
                <button style="padding:10px 20px; background:rgba(0,0,0,0.2); border:none; color:rgba(255,255,255,0.7); border-radius:20px; font-size:12px; z-index: 100000; transition:0.2s;" onclick="App.cancelarTouchBiometria(event)">Aceder com Senha</button>
                <style>
                    @keyframes pulseBio { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255,255,255,0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
                </style>
            `,document.body.appendChild(e));let t=document.getElementById(`bio-tela-titulo`),n=document.getElementById(`bio-tela-sub`);t&&(t.innerText=`Bem-vindo de volta!`),n&&(n.innerHTML=`Toque em qualquer lugar da tela<br>para aceder com FaceID / Digital.`),e.style.display=`flex`,e.onclick=e=>{e.target.tagName!==`BUTTON`&&(t&&(t.innerText=`A iniciar sensor...`),n&&(n.innerHTML=`Aguarde um momento.`),O.entrarComBiometria(!0))}},cancelarTouchBiometria:e=>{e&&e.stopPropagation();let t=document.getElementById(`bio-touch-screen`);t&&(t.style.display=`none`),document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`},entrarComBiometria:async(e=!1)=>{let t=localStorage.getItem(`escola_bio_id`);if(t)try{let e=await O.api(`/auth/biometria/gerar-login`,`POST`,{login:t});if(e.error)throw Error(e.error);let n=await D(e),r=await O.api(`/auth/biometria/verificar-login`,`POST`,{login:t,respostaBio:n});if(r&&r.success){let e=document.getElementById(`bio-touch-screen`);e&&(e.style.display=`none`),O.usuario=r.usuario,localStorage.setItem(`usuario_logado`,JSON.stringify(r.usuario)),O.showToast(`🔓 Bem-vindo de volta!`,`success`),O.entrarNoSistema()}else throw Error(`Credenciais recusadas pelo servidor.`)}catch(t){console.error(`Biometria bloqueada ou falhou:`,t),t.name===`NotAllowedError`||t.message.includes(`user activation`)?O.exibirTelaTouchBiometria():e||O.showToast(`A leitura falhou. Por favor, use a sua senha.`,`error`)}},exibirOverlayBiometria:(e,t)=>{let n=document.getElementById(`bio-overlay-premium`);n||(n=document.createElement(`div`),n.id=`bio-overlay-premium`,n.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); display:flex; justify-content:center; align-items:center; z-index:100000;`,document.body.appendChild(n)),n.innerHTML=`
            <div style="background:white; padding:40px; border-radius:28px; text-align:center; width:85%; max-width:320px; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                <div style="font-size:65px; margin-bottom:20px;">👤</div>
                <h2 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${e}</h2>
                <p style="color:#7f8c8d; font-size:14px; line-height:1.5; margin-bottom:25px;">${t}</p>
                <div style="font-size:11px; color:#3498db; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">App Gestão PTT</div>
            </div>
        `,n.style.display=`flex`},removerOverlayBiometria:()=>{let e=document.getElementById(`bio-overlay-premium`);e&&(e.style.display=`none`)},atualizarMeusDados:async()=>{let e=document.getElementById(`user-novo-login`).value.trim(),t=document.getElementById(`user-novo-email`).value.trim(),n=document.getElementById(`user-senha-atual`).value,r=document.getElementById(`user-nova-senha`).value,i=document.getElementById(`user-conf-senha`).value;if(!e)return O.showToast(`O login não pode ficar em branco.`,`error`);if(!n)return O.showToast(`Digite sua senha atual para autorizar as alterações.`,`error`);if(r&&r!==i)return O.showToast(`A nova senha e a confirmação não conferem.`,`error`);let a=document.querySelector(`button[onclick="App.atualizarMeusDados()"]`),o=a.innerText;a.innerText=`Atualizando... ⏳`,a.disabled=!0;try{let i={novoLogin:e,novoEmail:t,senhaAtual:n};r&&(i.novaSenha=r);let a=await O.api(`/usuarios/atualizar-conta`,`PUT`,i);a&&a.success?(O.showToast(`Dados atualizados com sucesso! Faça login novamente.`,`success`),setTimeout(()=>O.logout(),2500)):O.showToast(a.error||`Erro ao atualizar os dados.`,`error`)}catch{O.showToast(`Erro de conexão.`,`error`)}finally{a.innerText=o,a.disabled=!1}},salvarNovoUsuario:async()=>{let e=document.getElementById(`new-nome`).value,t=document.getElementById(`new-login`).value,n=document.getElementById(`new-senha`).value,r=document.getElementById(`new-tipo`).value;if(!e||!t)return O.showToast(`Preencha nome e login.`,`error`);if(!O.idEdicaoUsuario&&!n)return O.showToast(`Digite uma senha.`,`error`);let i={nome:e,login:t,tipo:r};if(n&&(i.senha=n),!O.idEdicaoUsuario){if(!await O.verificarLimites(`usuario`))return;i.donoId=O.usuario.id}let a=document.getElementById(`btn-save-user`),o=a?a.innerText:`CRIAR USUÁRIO`;a&&(a.innerText=`Salvando... ⏳`,a.disabled=!0),document.body.style.cursor=`wait`;try{let e;e=O.idEdicaoUsuario?await O.api(`/usuarios/${O.idEdicaoUsuario}`,`PUT`,i):await O.api(`/usuarios`,`POST`,i),e&&e.error?O.showToast(e.error,`error`):(O.showToast(O.idEdicaoUsuario?`Atualizado com sucesso!`:`Criado com sucesso!`,`success`),typeof O.salvarEstadoNavegacao==`function`&&O.salvarEstadoNavegacao(`subtela_conta`,null),O.renderizarMinhaConta())}catch{O.showToast(`Erro crítico ao salvar.`,`error`)}finally{a&&(a.innerText=o,a.disabled=!1),document.body.style.cursor=`default`}},preencherEdicaoUsuario:(e,t,n,r,i=!1)=>{O.idEdicaoUsuario=e,i||(document.getElementById(`new-nome`).value=t,document.getElementById(`new-login`).value=n,document.getElementById(`new-senha`).value=``,document.getElementById(`new-tipo`).value=r),document.getElementById(`titulo-form-user`).innerText=`Editar Usuário`,document.getElementById(`btn-save-user`).innerText=`ATUALIZAR`,document.getElementById(`btn-cancel-user`).style.display=`inline-flex`,typeof O.salvarEstadoNavegacao==`function`&&!i&&O.salvarEstadoNavegacao(`subtela_conta`,{acao:`editar`,id:e})},cancelarEdicaoUsuario:()=>{O.idEdicaoUsuario=null,document.getElementById(`new-nome`).value=``,document.getElementById(`new-login`).value=``,document.getElementById(`new-senha`).value=``,document.getElementById(`new-tipo`).value=`Gestor`,document.getElementById(`titulo-form-user`).innerText=`Novo Usuário`,document.getElementById(`btn-save-user`).innerText=`CRIAR USUÁRIO`,document.getElementById(`btn-cancel-user`).style.display=`none`,typeof O.salvarEstadoNavegacao==`function`&&O.salvarEstadoNavegacao(`subtela_conta`,null)},excluirUsuario:e=>{O.abrirModalConfirmacao(`Apagar Utilizador?`,`Deseja remover o acesso deste membro da equipe? A ação não pode ser desfeita.`,async t=>{document.body.style.cursor=`wait`;try{let t=await O.api(`/usuarios/${e}`,`DELETE`);t&&t.error?O.showToast(t.error,`error`):(O.showToast(`Utilizador excluído.`,`success`),O.renderizarMinhaConta(),O.registrarLog(`EXCLUSÃO DE UTILIZADOR`,`O utilizador com o ID ${e} foi removido do sistema.`))}catch{O.showToast(`Erro ao excluir.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},registrarLog:async(e,t)=>{try{await O.api(`/auditoria`,`POST`,{acao:e,detalhes:t})}catch(e){console.warn(`Aviso: Falha ao registar auditoria.`,e)}},renderizarAuditoria:async()=>{typeof O.setTitulo==`function`&&O.setTitulo(`Logs de Auditoria`);let e=document.getElementById(`app-content`);e.innerHTML=`<div style="text-align:center; padding:40px;"><span style="font-size:40px;">⏳</span><br>A carregar o histórico de segurança...</div>`;try{let t=await O.api(`/auditoria`,`GET`);if(!t||t.length===0){e.innerHTML=`
                    <div style="text-align:center; padding:40px; background:#fff; border-radius:12px;">
                        <span style="font-size:40px; display:block; margin-bottom:15px;">🛡️</span>
                        <h3 style="color:#2c3e50;">Ambiente Seguro</h3>
                        <p style="color:#666;">Ainda não existem registos de atividades críticas na sua instituição.</p>
                    </div>`;return}let n=`
            <div class="card" style="overflow-x:auto;">
                <h3 style="margin-top:0; color:#2c3e50;">Histórico de Atividades</h3>
                <p style="font-size:12px; color:#666; margin-bottom:20px;">Os últimos 100 eventos realizados por membros da equipa.</p>
                <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
                    <thead>
                        <tr style="background:#f9f9f9; border-bottom:2px solid #eee;">
                            <th style="padding:12px 10px; color:#333;">Data / Hora</th>
                            <th style="padding:12px 10px; color:#333;">Utilizador</th>
                            <th style="padding:12px 10px; color:#333;">Ação Realizada</th>
                            <th style="padding:12px 10px; color:#333;">Detalhes Adicionais</th>
                        </tr>
                    </thead>
                    <tbody>
            `;t.forEach(e=>{let t=new Date(e.data).toLocaleString(`pt-PT`);n+=`
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px 10px; color:#666; white-space:nowrap;">${t}</td>
                        <td style="padding:12px 10px;">
                            <strong>${e.usuarioNome}</strong><br>
                            <span style="font-size:10px; background:#eee; padding:2px 6px; border-radius:4px;">${e.usuarioTipo}</span>
                        </td>
                        <td style="padding:12px 10px;">
                            <span style="background:#e8f4f8; color:#2980b9; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">
                                ${e.acao}
                            </span>
                        </td>
                        <td style="padding:12px 10px; color:#555; max-width: 300px; line-height:1.4;">${e.detalhes}</td>
                    </tr>
                `}),n+=`</tbody></table></div>`,e.innerHTML=n}catch{e.innerHTML=`<div style="color:red; text-align:center; padding:20px;">Erro ao carregar o relatório de auditoria. Tente novamente.</div>`}}}),document.addEventListener(`DOMContentLoaded`,()=>{let e=localStorage.getItem(`escola_bio_id`),t=document.getElementById(`btn-biometria`);if(e&&t){t.style.display=`flex`;let n=document.getElementById(`login-user`);n&&(n.value=e)}}),document.addEventListener(`visibilitychange`,()=>{if(!(!localStorage.getItem(`escola_bio_id`)||!window.PublicKeyCredential)){if(document.visibilityState===`hidden`)localStorage.setItem(`app_locked_timestamp`,Date.now());else if(document.visibilityState===`visible`){let e=localStorage.getItem(`app_locked_timestamp`);e&&Date.now()-parseInt(e)>60*1e3&&(document.getElementById(`tela-sistema`).style.display=`none`,setTimeout(()=>{O.entrarComBiometria(!0)},300))}}});var k=n({cobrarWhatsAppDashboard:()=>P,renderizarInicio:()=>N});window.App=window.App||{};var A=window.App,j=(e,t,n)=>`
    <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">${n}</span>
            <span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">${e}</span>
        </div>
        <span style="font-size:20px; font-weight:bold; color:#3498db;">${t}</span>
    </div>
`,M=(e,t,n,r,i)=>`
    <div onclick="App.irParaFinanceiroDestacado('${e}')" style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02); cursor:pointer; transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(231,76,60,0.2)'; this.style.borderColor='#e74c3c';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)'; this.style.borderColor='#f5b7b1';">
        <div>
            <div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${A.escapeHTML(t)}</div>
            <div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${n} • R$ ${r}</div>
        </div>
        <button onclick="event.stopPropagation(); App.cobrarWhatsAppDashboard('${A.escapeHTML(t)}', '${i}', '${n}', '${r}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <span>💬</span> Cobrar
        </button>
    </div>
`,N=async(e=!1)=>{typeof A.salvarEstadoNavegacao==`function`&&A.salvarEstadoNavegacao(`fundo`,{tipo:`tela`,alvo:`inicio`}),e||window.history.pushState({tela:`inicio`},``,`#inicio`),A.verificarNotificacoes(),A.setTitulo(`Dashboard`);let t=document.getElementById(`app-content`);t.innerHTML=`
        <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${A.escapeHTML(A.usuario?A.usuario.nome:`Gestor`)}! 👋</h3>
        <div id="dashboard-dinamico">
            <div style="text-align:center; padding: 60px; color:#94a3b8; background: #fff; border-radius: 12px; border: 1px solid #eee;">
                <span style="font-size: 35px; display: block; margin-bottom: 15px; animation: piscarSuave 1s infinite;">⏳</span>
                <span style="font-weight: bold; font-size: 15px;">A processar métricas e gráficos...</span>
                <p style="font-size: 12px; color: #aaa; margin-top: 5px;">Isto leva apenas um segundo.</p>
            </div>
        </div>
    `;try{let[e,t,n,r]=await Promise.all([A.api(`/alunos`),A.api(`/financeiro`),A.api(`/turmas`),A.api(`/cursos`)]),i=(Array.isArray(e)?e:[]).filter(e=>!e.status||e.status===`Ativo`),a=Array.isArray(t)?t:[],o=Array.isArray(n)?n:[],s=Array.isArray(r)?r:[],c=new Date,l=c.getMonth()+1,u=c.getFullYear(),d=i.map(e=>e.id),f=a.filter(e=>{if(!e.vencimento)return!1;let t=e.vencimento.split(`-`);return parseInt(t[1])===l&&parseInt(t[0])===u}),p=f.filter(e=>e.status===`Pago`).reduce((e,t)=>e+parseFloat(t.valor),0),m=f.filter(e=>e.status!==`Pago`&&d.includes(e.idAluno)).reduce((e,t)=>e+parseFloat(t.valor),0),h=a.filter(e=>e.status===`Pendente`&&new Date(e.vencimento+`T00:00:00`)<c&&d.includes(e.idAluno)).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),g=e=>e.toLocaleString(`pt-BR`,{minimumFractionDigits:2,maximumFractionDigits:2}),_=A.usuario?A.usuario.tipo:`Gestor`,v=_!==`Professor`,y=h.length===0?`<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>`:h.map(e=>{let t=(i.find(t=>t.id===e.idAluno)||{}).whatsapp||``,n=e.vencimento.split(`-`).reverse().join(`/`),r=g(parseFloat(e.valor));return M(e.id,e.alunoNome||`Desconhecido`,n,r,t)}).join(``),b=JSON.parse(localStorage.getItem(A.getTenantKey(`escola_atalhos`)));(!b||!Array.isArray(b)||b.length===0)&&(b=[`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]);let x=b.map(e=>{let t=(window.LISTA_FUNCIONALIDADES||[]).find(t=>t.id===e);return t&&t.roles.includes(_)?`<div class="shortcut-btn" onclick="${t.acao}"><div>${t.icon}</div><span>${t.nome}</span></div>`:``}).join(``),S=document.getElementById(`dashboard-dinamico`);if(S&&(S.innerHTML=`
                <div class="dashboard-grid">
                    <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                        ${j(`Total Alunos`,i.length,`🎓`)}
                        ${j(`Total Turmas`,o.length,`🏫`)}
                        ${j(`Total Cursos`,s.length,`📚`)}
                    </div>
                    ${v?`
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <div class="stat-info"><h4>Receita (${l}/${u})</h4><p style="color:#27ae60; font-size:20px;">R$ ${g(p)}</p></div>
                            <div class="stat-icon" style="font-size:24px;">💰</div>
                        </div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${g(m)}</span></div>
                    </div>
                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; height:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;">
                            <h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${h.length})</h4>
                        </div>
                        <div class="lista-atrasados" style="flex:1; overflow-y:auto; max-height: 300px; display:flex; flex-direction:column; gap:10px; padding-right:5px;">
                            ${y}
                        </div>
                    </div>
                    `:``}
                </div>
                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${x||`<p style="color:#666;">Nenhum atalho selecionado ou permitido.</p>`}</div>`,v)){let e=document.getElementById(`graficoFinanceiro`);e&&(p>0||m>0)?new Chart(e,{type:`doughnut`,data:{labels:[`Recebido`,`Pendente`],datasets:[{data:[p,m],backgroundColor:[`#27ae60`,`#e74c3c`],borderWidth:0,hoverOffset:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},cutout:`75%`}}):e&&new Chart(e,{type:`doughnut`,data:{datasets:[{data:[1],backgroundColor:[`#eee`],borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{enabled:!1}},cutout:`75%`}})}}catch(e){console.error(e);let t=document.getElementById(`dashboard-dinamico`);t&&(t.innerHTML=`<p style='color:red;'>Erro ao carregar dashboard. Tente atualizar a página.</p>`)}},P=(e,t,n,r)=>{if(!A.verificarPermissao(`whatsapp`))return;if(!t||t.trim()===``||t===`undefined`){A.showToast(`Este aluno não tem um número de WhatsApp registado no sistema!`,`error`);return}let i=t.replace(/\D/g,``);t.trim().startsWith(`+`)?i=t.replace(/\D/g,``):(i.length===10||i.length===11)&&(i=`55`+i);let a=JSON.parse(localStorage.getItem(A.getTenantKey(`escola_perfil`)))||{},o=a.nome||`Nossa Instituição`,s=a.chavePix||`Não informada`,c=`🔔 *LEMBRETE DE VENCIMENTO*\nOlá, ${e}!\n\nConsta no nosso sistema que a sua mensalidade venceu no dia ${n}. Para realizar o pagamento de forma rápida, basta enviar o valor de *R$ ${r}* para a chave PIX abaixo:\n\n*Instituição:* ${o}\n*Banco:* ${a.banco||`Não informado`}\n*Chave PIX:* ${s}\n\n*Obs.:* _Após o pagamento, por favor, envie o comprovante por aqui para podermos dar baixa no sistema._\n\n🙏 Agradecemos desde já e desejamos-lhe um excelente dia! 😉✅`;window.open(`https://wa.me/${i}?text=${encodeURIComponent(c)}`,`_blank`)};A.irParaFinanceiroDestacado=async e=>{typeof A.renderizarHistoricoFinanceiro==`function`?await A.renderizarHistoricoFinanceiro():typeof A.renderizarLista==`function`&&await A.renderizarLista(`financeiro`);let t=``;if(A.financeiroCache&&A.financeiroCache.length>0){let n=A.financeiroCache.find(t=>t.id===e);n&&(t=n.alunoNome||``)}let n=document.getElementById(`fin-busca`);n&&t&&(n.value=t,typeof A.filtrarFinanceiro==`function`&&A.filtrarFinanceiro()),setTimeout(()=>{let t=document.querySelector(`.fin-check[value="${e}"]`);if(t){let e=t.closest(`tr`);if(e){e.scrollIntoView({behavior:`smooth`,block:`center`});let t=e.querySelectorAll(`td`);t.forEach(e=>{e.style.transition=`background-color 0.4s ease, border 0.4s ease`,e.style.backgroundColor=`#fff3cd`,e.style.borderTop=`2px solid #f1c40f`,e.style.borderBottom=`2px solid #f1c40f`}),setTimeout(()=>{t.forEach(e=>{e.style.backgroundColor=`transparent`,e.style.borderTop=`1px solid #eee`,e.style.borderBottom=`1px solid #eee`})},3e3)}}},300)},window.App=window.App||{};var F=window.App;Object.assign(F,{alertasAtuaisLista:[],filtroNotificacaoAtual:`todos`,idsAlertasJaConhecidos:new Set,radarPrimeiraLeituraConcluida:!1,injetarEstilosNotificacoes:()=>{if(document.getElementById(`noti-modern-styles`))return;let e=document.createElement(`style`);e.id=`noti-modern-styles`,e.innerHTML=`
            /* Garante que o contentor do sininho é a âncora exata da caixa */
            .notification-container {
                position: relative !important;
            }

            /* Computadores e Tablets: Caixa colada exatamente abaixo do sininho */
            header.header-moderno .notification-container #noti-dropdown,
            #noti-dropdown.noti-dropdown {
                position: absolute !important;
                top: calc(100% + 10px) !important;
                right: 0 !important;
                left: auto !important;
                transform: none !important;
                width: 370px !important;
                max-width: calc(100vw - 32px) !important;
                min-width: 0 !important;
                margin: 0 !important;
                border-radius: 16px !important;
                border: 1px solid #cbd5e1 !important;
                background: #ffffff !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18) !important;
                z-index: 9999 !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            }

            #noti-dropdown #noti-list {
                max-height: 65vh !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
            }

            /* Mini-abas de Filtro dentro do Sininho */
            .noti-tabs-bar {
                display: flex;
                gap: 4px;
                padding: 8px 10px;
                background: #f1f5f9;
                border-bottom: 1px solid #e2e8f0;
                overflow-x: auto;
                scrollbar-width: none;
            }
            .noti-tabs-bar::-webkit-scrollbar { display: none; }

            .noti-tab-btn {
                flex: 1;
                border: none;
                background: transparent;
                color: #64748b;
                padding: 6px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
                text-align: center;
            }
            .noti-tab-btn:hover {
                background: rgba(255, 255, 255, 0.6);
                color: #1e293b;
            }
            .noti-tab-btn.active {
                background: #ffffff;
                color: #2563eb;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
            }

            /* 🔔 Animação do Sininho a Abanar quando chega novidade */
            @keyframes sinoAbanar {
                0% { transform: rotate(0deg) scale(1); }
                15% { transform: rotate(18deg) scale(1.12); }
                30% { transform: rotate(-16deg) scale(1.12); }
                45% { transform: rotate(12deg) scale(1.08); }
                60% { transform: rotate(-10deg) scale(1.05); }
                75% { transform: rotate(6deg) scale(1.02); }
                100% { transform: rotate(0deg) scale(1); }
            }

            .sino-animando {
                animation: sinoAbanar 0.9s ease-in-out 2 !important;
                border-color: #3b82f6 !important;
                background: #eff6ff !important;
            }

            /* 📱 Telemóveis: Compensa os 50px do Avatar ao lado para nunca cortar na esquerda */
            @media (max-width: 600px) {
                header.header-moderno .notification-container #noti-dropdown,
                #noti-dropdown.noti-dropdown {
                    position: absolute !important;
                    top: calc(100% + 10px) !important;
                    right: -50px !important;
                    left: auto !important;
                    width: calc(100vw - 24px) !important;
                    max-width: 360px !important;
                }
            }
        `,document.head.appendChild(e)},isSomNotificacaoAtivo:()=>{let e=typeof F.getTenantKey==`function`?F.getTenantKey(`noti_som_ativo`):`noti_som_ativo`,t=localStorage.getItem(e);return t===null?!0:t===`true`},alternarSomNotificacoes:e=>{e&&e.stopPropagation();let t=typeof F.getTenantKey==`function`?F.getTenantKey(`noti_som_ativo`):`noti_som_ativo`,n=!F.isSomNotificacaoAtivo();localStorage.setItem(t,String(n)),n?(F.tocarSomNotificacao(!0),typeof F.showToast==`function`&&F.showToast(`🔔 Som de notificações ativado!`,`success`)):typeof F.showToast==`function`&&F.showToast(`🔕 Som de notificações silenciado.`,`info`),F.renderizarPainelNotificacoes()},tocarSomNotificacao:(e=!1)=>{if(!(!e&&!F.isSomNotificacaoAtivo()))try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return;let t=new e,n=t.currentTime,r=(e,n,r)=>{let i=t.createOscillator(),a=t.createGain();i.type=`sine`,i.frequency.setValueAtTime(e,n),a.gain.setValueAtTime(1e-4,n),a.gain.exponentialRampToValueAtTime(.12,n+.02),a.gain.exponentialRampToValueAtTime(1e-4,n+r),i.connect(a),a.connect(t.destination),i.start(n),i.stop(n+r)};r(587.33,n,.22),r(880,n+.14,.45)}catch{}},animarSininhoTopo:()=>{let e=document.querySelector(`.btn-bell-moderno`);e&&(e.classList.remove(`sino-animando`),e.offsetWidth,e.classList.add(`sino-animando`),setTimeout(()=>e.classList.remove(`sino-animando`),2e3))},getChaveAlertasOcultosHoje:()=>{let e=new Date,t=`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`;return`${typeof F.getTenantKey==`function`?F.getTenantKey(`alertas_ocultos`):`alertas_ocultos`}_${t}`},obterAlertasOcultos:()=>{try{let e=JSON.parse(localStorage.getItem(F.getChaveAlertasOcultosHoje()))||[];return new Set(e)}catch{return new Set}},salvarAlertaOculto:e=>{try{let t=F.obterAlertasOcultos();t.add(e),localStorage.setItem(F.getChaveAlertasOcultosHoje(),JSON.stringify([...t]))}catch{}},restaurarAlertasOcultosHoje:async e=>{e&&e.stopPropagation(),localStorage.removeItem(F.getChaveAlertasOcultosHoje()),F.filtroNotificacaoAtual=`todos`,typeof F.showToast==`function`&&F.showToast(`🔄 Alertas ocultos de hoje foram restaurados!`,`info`),await F.verificarNotificacoes()},mudarAbaNotificacao:(e,t)=>{t&&t.stopPropagation(),F.filtroNotificacaoAtual=e,F.renderizarPainelNotificacoes()},verificarNovidadesSilenciosamente:async()=>{typeof F.verificarNotificacoes==`function`&&await F.verificarNotificacoes()},abrirWhatsAppRapidoNotificacao:(e,t,n,r,i)=>{if(i&&i.stopPropagation(),typeof F.verificarPermissao==`function`&&!F.verificarPermissao(`whatsapp`))return;let a=String(e||``).replace(/\D/g,``);if(!a||a.length<8){typeof F.showToast==`function`&&F.showToast(`Este aluno não possui um número de WhatsApp válido cadastrado.`,`warning`);return}(a.length===10||a.length===11)&&(a=`55`+a);let o=`nossa instituição`;try{let e=JSON.parse(localStorage.getItem(F.getTenantKey(`escola_perfil`)))||{};e.nome&&(o=e.nome)}catch{}let s=``;t===`aniversario`?s=`Olá, *${n}*! 🎂🎉\n\nPassando em nome de toda a equipa da *${o}* para lhe desejar um Feliz Aniversário! Muita saúde, alegria e sucesso nos seus estudos! 🚀✨`:t===`renovacao`?s=`Olá, *${n}*! Tudo bem? 😊\n\nAqui é da *${o}*. Notámos que o seu ciclo atual de parcelas está na reta final e ainda temos cerca de *${r}* de aulas pela frente para a conclusão do seu curso.\n\nPodemos programar a renovação do seu carnê para manter o seu horário garantido?`:t===`acolhimento_faltas`&&(s=`Olá, *${n}*! Tudo bem consigo? 😊\n\nAqui é da *${o}*. Sentimos a sua falta nas últimas *${r}* aulas! Está tudo bem? Conte connosco para o ajudar a manter o ritmo dos seus estudos! 📚✨`);let c=`https://wa.me/${a}?text=${encodeURIComponent(s)}`;window.open(c,`_blank`)},verificarNotificacoes:async()=>{if(F.usuario)try{F.injetarEstilosNotificacoes();let e=F.usuario.tipo||`Gestor`,t=F.obterAlertasOcultos(),[n,r,i,a,o,s,c,l,u]=await Promise.all([F.api(`/sistema/notificacoes/nao-lidas`,`GET`,null,!0),F.api(`/alunos`,`GET`,null,!0),F.api(`/eventos`,`GET`,null,!0),e===`Professor`?Promise.resolve([]):F.api(`/financeiro`,`GET`,null,!0),F.api(`/planejamentos`,`GET`,null,!0),F.api(`/estoques`,`GET`,null,!0),F.api(`/escola`,`GET`,null,!0),F.api(`/cursos`,`GET`,null,!0),F.api(`/chamadas`,`GET`,null,!0)]),d=Array.isArray(r)?r.filter(e=>!e.status||e.status===`Ativo`):[];if(F.entidadeAtual===`aluno`&&Array.isArray(r)&&Array.isArray(F.listaCache)){let e=F.listaCache.map(e=>e.id);r.some(t=>!e.includes(t.id))&&(typeof F.showToast==`function`&&F.showToast(`🎉 Novo aluno recebido pela matrícula online!`,`success`),F.listaCache=r,typeof F.filtrarTabelaReativa==`function`&&F.filtrarTabelaReativa())}let f=[],p=e=>{t.has(String(e.id))||f.push(e)};Array.isArray(n)&&n.filter(e=>!e.lida&&e.tipo!==`aviso_workspace_aluno`).sort((e,t)=>new Date(t.dataCriacao||0)-new Date(e.dataCriacao||0)).slice(0,10).forEach(e=>{p({id:String(e.id),oficial:!0,grupo:`pedagogico`,categoria:`Sistema`,corCat:`#3b82f6`,icon:e.tipo===`matricula_contrato`?`📝`:`🔔`,texto:`<b>${F.escapeHTML(e.titulo||`Nova notificação`)}</b><br>${F.escapeHTML(e.mensagem||``)}`,acao:`App.renderizarHubContratos()`})});let m=new Date,h=m.getFullYear(),g=String(m.getMonth()+1).padStart(2,`0`),_=String(m.getDate()).padStart(2,`0`),v=`${h}-${g}-${_}`,y=m.getTime(),b=new Date(m);b.setDate(b.getDate()+1);let x=`${b.getFullYear()}-${String(b.getMonth()+1).padStart(2,`0`)}-${String(b.getDate()).padStart(2,`0`)}`;if(c&&!c.error&&e===`Gestor`){let e=c.plano||`Teste`,t=0;if(c.dataExpiracao){let e=new Date(c.dataExpiracao).getTime();t=Math.ceil((e-y)/(1e3*60*60*24))}else{let n=c.dataCriacao?new Date(c.dataCriacao).getTime():y,r=Math.floor(Math.abs(y-n)/(1e3*60*60*24));t=(e===`Teste`?7:30)-r}e!==`Premium`&&e!==`Bloqueado`&&(t<=3&&t>0?p({id:`alerta_plano_vence`,grupo:`urgente`,categoria:`Assinatura`,corCat:`#f59e0b`,icon:`⏳`,texto:`<b>Atenção Gestor:</b> O seu plano <b>${F.escapeHTML(e)}</b> expira em <b>${t} dia(s)</b>! Renove agora.`,acao:`App.renderizarTela('plano')`}):t<=0&&p({id:`alerta_plano_venceu`,grupo:`urgente`,categoria:`Urgente`,corCat:`#ef4444`,icon:`🚫`,texto:`<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar a usar o sistema.`,acao:`App.renderizarTela('plano')`}))}if(d.forEach(e=>{if(e.nascimento&&(e.nascimento.includes(`/`)?e.nascimento.split(`/`).reverse().join(`-`):e.nascimento).substring(5)===`${g}-${_}`){let t=typeof F.abrirFichaAluno==`function`?`App.abrirFichaAluno('${e.id}')`:`App.renderizarLista('aluno')`,n=F.escapeHTML(e.nome||``).replace(/'/g,`\\'`),r=F.escapeHTML(e.whatsapp||``).replace(/'/g,`\\'`),i=r?`
                            <div style="margin-top: 8px;">
                                <button onclick="App.abrirWhatsAppRapidoNotificacao('${r}', 'aniversario', '${n}', '', event)" 
                                        style="background: #25D366; color: #ffffff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 5px rgba(37, 211, 102, 0.25); transition: 0.2s;"
                                        onmouseover="this.style.background='#1da851'" onmouseout="this.style.background='#25D366'">
                                    💬 Dar Parabéns no WhatsApp
                                </button>
                            </div>`:``;p({id:`alerta_niver_${e.id}`,grupo:`pedagogico`,categoria:`Aniversário`,corCat:`#ec4899`,icon:`🎂`,texto:`Hoje é o aniversário de <b>${F.escapeHTML(e.nome)}</b>! Clique para ver a ficha.${i}`,acao:t})}e.dataMatricula&&e.dataMatricula.startsWith(v)&&p({id:`alerta_matr_${e.id}`,grupo:`pedagogico`,categoria:`Matrícula`,corCat:`#10b981`,icon:`🎉`,texto:`<b>Nova Matrícula!</b> O aluno <b>${F.escapeHTML(e.nome)}</b> foi registado hoje.`,acao:`App.renderizarHubContratos()`})}),e!==`Professor`&&Array.isArray(a)){let e=a.filter(e=>e.vencimento===v&&e.status===`Pendente`);if(e.length>0){let t=e.map(e=>F.escapeHTML(e.alunoNome||`Aluno`)).slice(0,3).join(`, `),n=e.length>3?` e mais ${e.length-3}`:``;p({id:`alerta_caixa_${v}`,grupo:`financeiro`,categoria:`Financeiro`,corCat:`#16a34a`,icon:`💲`,texto:`<b>Caixa de Hoje:</b> <b>${e.length}</b> mensalidade(s) a vencer hoje (${t}${n}).
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    <button onclick="event.stopPropagation(); App.renderizarTela('mensalidades'); App.toggleNotificacoes();" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">💸 Receber no Caixa</button>
                                </div>`,acao:`App.renderizarTela('mensalidades')`})}}Array.isArray(i)&&i.forEach(e=>{let t=e.descricao||e.titulo||e.nome||`Evento Escolar`;e.data===v?p({id:`alerta_evt_hoje_${e.id}`,grupo:`urgente`,categoria:`Agenda Hoje`,corCat:`#ef4444`,icon:`🚨`,texto:`<b>Hoje (${F.escapeHTML(e.tipo||`Agenda`)}):</b> ${F.escapeHTML(t)}`,acao:`App.renderizarTela('calendario')`}):e.data===x&&p({id:`alerta_evt_amanha_${e.id}`,grupo:`pedagogico`,categoria:`Agenda Amanhã`,corCat:`#f59e0b`,icon:`📅`,texto:`<b>Amanhã (${F.escapeHTML(e.tipo||`Agenda`)}):</b> ${F.escapeHTML(t)}`,acao:`App.renderizarTela('calendario')`})});let S=Array.isArray(u)?u:[],C=Array.isArray(o)?o.filter(e=>e.status!==`Arquivado`):[];d.forEach(e=>{let t=S.filter(t=>t.idAluno===e.id&&t.data).sort((e,t)=>new Date(t.data)-new Date(e.data)),n=0;for(let e of t)if(e.status===`Falta`)n++;else break;if(n>=2){let t=F.escapeHTML(e.nome||``).replace(/'/g,`\\'`),r=F.escapeHTML(e.whatsapp||``).replace(/'/g,`\\'`),i=r?`
                        <button onclick="App.abrirWhatsAppRapidoNotificacao('${r}', 'acolhimento_faltas', '${t}', '${n}', event)" 
                                style="background: #25D366; color: #ffffff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            💬 Falar com Aluno
                        </button>`:``;p({id:`alerta_evasao_${e.id}_${n}`,grupo:`urgente`,categoria:`Anti-Evasão`,corCat:`#ef4444`,icon:`⚠️`,texto:`<div style="line-height:1.45;"><b>Risco de Evasão:</b> O aluno <b>${F.escapeHTML(e.nome)}</b> acumulou <b>${n} faltas seguidas</b>!
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    ${i}
                                    <button onclick="event.stopPropagation(); App.abrirRelatorioFrequencia('${e.id}', '${t}'); App.toggleNotificacoes();" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">⏱️ Ver Frequência</button>
                                </div></div>`,acao:`App.abrirRelatorioFrequencia('${e.id}', '${t}')`})}});let w=y-10080*60*1e3;if(C.forEach(t=>{let n=d.find(e=>e.id===t.idAluno);if(!n||!Array.isArray(t.aulas)||t.aulas.length===0)return;let r=t.aulas.length,i=t.aulas.filter(e=>e.visto).length,a=r-i;if(r>=4&&i>0&&a<=2){let r=a===0?`concluiu <b>100% das aulas</b> planeadas!`:`está a apenas <b>${a} aula(s)</b> de concluir o planeamento!`,i=e===`Professor`?``:`
                        <button onclick="event.stopPropagation(); App.renderizarRelatorio('documentos'); App.toggleNotificacoes();" style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">🎓 Emitir Certificado</button>
                    `;p({id:`alerta_fimcurso_${t.id}_${a}`,grupo:`pedagogico`,categoria:`Pedagógico`,corCat:`#0ea5e9`,icon:`🎓`,texto:`<div style="line-height:1.45;"><b>Reta Final de Curso:</b> <b>${F.escapeHTML(n.nome)}</b> ${r}
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    ${i}
                                    <button onclick="event.stopPropagation(); App.renderizarTela('planejamento'); App.toggleNotificacoes();" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">📋 Ver Plano</button>
                                </div></div>`,acao:`App.renderizarTela('planejamento')`})}let o=0;t.aulas.forEach(e=>{if(e.visto||!e.data)return;let t=e.data.includes(`/`)?e.data.split(`/`):null,n=t?`${t[2]}-${t[1]}-${t[0]}`:e.data,r=new Date(n+`T00:00:00`).getTime();!isNaN(r)&&r<y&&r>=w&&n!==v&&o++}),o>0&&p({id:`alerta_semvisto_${t.id}_${v}`,grupo:`pedagogico`,categoria:`Diário de Classe`,corCat:`#f59e0b`,icon:`📋`,texto:`<div style="line-height:1.45;"><b>Aula Pendente de Visto:</b> <b>${F.escapeHTML(n.nome)}</b> possui <b>${o} aula(s)</b> recente(s) sem registo de conclusão no planeamento.
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    <button onclick="event.stopPropagation(); App.renderizarTela('planejamento'); App.toggleNotificacoes();" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">📝 Atualizar Plano</button>
                                    <button onclick="event.stopPropagation(); App.renderizarTela('chamada'); App.toggleNotificacoes();" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">📋 Ir à Chamada</button>
                                </div></div>`,acao:`App.renderizarTela('planejamento')`})}),e!==`Professor`&&Array.isArray(a)&&Array.isArray(o)){let e=new Date(y-720*60*60*1e3),t=Array.isArray(l)?l:[];d.forEach(n=>{let r=C.find(e=>e.idAluno===n.id),i=null;if(a.forEach(e=>{e.idAluno===n.id&&e.status!==`Cancelado`&&(!e.idCarne||!e.idCarne.includes(`VENDA`))&&(!i||e.vencimento>i)&&(i=e.vencimento)}),i&&r&&Array.isArray(r.aulas)){let a=new Date(i),o=Math.ceil((a.getTime()-y)/(1e3*3600*24));if(o<=30){let i=t.find(e=>e.id===n.cursoId||e.nome===n.planoCurso||e.nome===r.curso),a=i&&(i.cargaHoraria||i.carga)?parseInt(i.cargaHoraria||i.carga):r.aulas.length*2,s=0,c=0,l=0,u=y;r.aulas.forEach(t=>{if(!t.data)return;let n=t.data.includes(`/`)?t.data.split(`/`):null,r=n?new Date(`${n[2]}-${n[1]}-${n[0]}`):new Date(t.data);isNaN(r.getTime())&&(r=new Date);let i=parseFloat(t.duracao)||2;t.visto&&(u=Math.max(u,r.getTime()),t.status===`Falta`||t.status===`Justificada`||t.status===`Faltou`||t.presenca===!1||(s+=i),r>=e&&r<=y&&(c++,l+=i))});let d=a-s;if(d>0){let e=l>0?l:8,t=c>0?l/c:2,r=Math.ceil(d/t),i=d/e,a=new Date(u);a.setDate(a.getDate()+Math.ceil(i*30));let s=`${String(a.getDate()).padStart(2,`0`)}/${String(a.getMonth()+1).padStart(2,`0`)}/${a.getFullYear()}`,f=o<0?`venceu há ${Math.abs(o)} dias`:o===0?`vence hoje`:`vence em ${o} dias`,m=F.escapeHTML(n.nome||``).replace(/'/g,`\\'`),h=F.escapeHTML(n.whatsapp||``).replace(/'/g,`\\'`),g=h?`
                                    <button onclick="App.abrirWhatsAppRapidoNotificacao('${h}', 'renovacao', '${m}', '${d}h', event)" 
                                            style="background: #25D366; color: #ffffff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                                        💬 Avisar Aluno
                                    </button>`:``;p({id:`alerta_preditiva_${n.id}`,grupo:`financeiro`,categoria:`IA Preditiva`,corCat:`#8b5cf6`,icon:`🎯`,texto:`<div style="line-height:1.45;"><b>Renovação de Carnê (${F.escapeHTML(n.nome)}):</b><br>
                                    Última parcela ${f}. Faltam <b>${d}h</b> (~${r} aulas). Previsão de término: <b style="color:#e74c3c;">${s}</b>.
                                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                        ${g}
                                        <button onclick="event.stopPropagation(); App.renderizarTela('mensalidades'); App.toggleNotificacoes();" style="background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">💸 Gerar Novo Carnê</button>
                                    </div></div>`,acao:`App.renderizarTela('mensalidades')`})}}}})}Array.isArray(s)&&s.forEach(e=>{let t=parseInt(e.quantidade)||0;t<=(parseInt(e.quantidadeMinima)||0)&&p({id:`alerta_estoque_${e.id}`,grupo:`urgente`,categoria:`Estoque`,corCat:`#d97706`,icon:`📦`,texto:`<b>Estoque Baixo:</b> Restam apenas <b>${t}</b> unid. de <b>${F.escapeHTML(e.nome)}</b>.`,acao:`App.renderizarLista('estoque')`})});let T=!1;f.forEach(e=>{let t=String(e.id);F.idsAlertasJaConhecidos.has(t)||(F.idsAlertasJaConhecidos.add(t),F.radarPrimeiraLeituraConcluida&&(T=!0))}),F.radarPrimeiraLeituraConcluida?T&&(F.tocarSomNotificacao(!1),F.animarSininhoTopo()):F.radarPrimeiraLeituraConcluida=!0,F.alertasAtuaisLista=f,F.renderizarPainelNotificacoes()}catch(e){console.error(`Erro silencioso nas notificações:`,e)}},renderizarPainelNotificacoes:()=>{let e=document.getElementById(`noti-badge`),t=document.getElementById(`noti-list`),n=F.alertasAtuaisLista||[],r=F.usuario&&F.usuario.tipo?F.usuario.tipo:`Gestor`,i=F.obterAlertasOcultos().size,a=F.isSomNotificacaoAtivo();if(e&&(n.length>0?(e.innerText=n.length,e.style.display=`flex`):e.style.display=`none`),!t)return;let o=n.filter(e=>e.grupo===`urgente`).length,s=n.filter(e=>e.grupo===`financeiro`).length,c=n.filter(e=>e.grupo===`pedagogico`).length,l=F.filtroNotificacaoAtual||`todos`,u=l===`todos`?n:n.filter(e=>e.grupo===l),d=`
            <div class="noti-tabs-bar" onclick="event.stopPropagation();">
                <button class="noti-tab-btn ${l===`todos`?`active`:``}" onclick="App.mudarAbaNotificacao('todos', event)">
                    Todos (${n.length})
                </button>
                <button class="noti-tab-btn ${l===`urgente`?`active`:``}" onclick="App.mudarAbaNotificacao('urgente', event)">
                    🚨 Urgentes (${o})
                </button>
                ${r===`Professor`?``:`
                <button class="noti-tab-btn ${l===`financeiro`?`active`:``}" onclick="App.mudarAbaNotificacao('financeiro', event)">
                    💰 Finanças (${s})
                </button>`}
                <button class="noti-tab-btn ${l===`pedagogico`?`active`:``}" onclick="App.mudarAbaNotificacao('pedagogico', event)">
                    🍎 Pedag. (${c})
                </button>
            </div>
        `,f=`
            <div style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 6px; background: #f8fafc; flex-wrap: wrap;" onclick="event.stopPropagation();">
                ${n.length>0?`
                <button onclick="App.marcarNotificacoesComoLidas(); event.stopPropagation();" style="flex: 1; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'">
                    ✅ Limpar
                </button>`:``}
                <button onclick="App.alternarSomNotificacoes(event)" style="flex: 1; border: 1px solid ${a?`#bbf7d0`:`#e2e8f0`}; background: ${a?`#f0fdf4`:`#f1f5f9`}; color: ${a?`#15803d`:`#64748b`}; padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" title="Ativar ou silenciar o toque sonoro de novas notificações">
                    ${a?`🔔 Som: On`:`🔕 Mudo`}
                </button>
                <button onclick="App.testarPushNoAparelho(event)" style="flex: 1; border: none; background: #eff6ff; color: #2563eb; padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'" title="Enviar notificação de teste para este telemóvel/PC">
                    📲 Push
                </button>
            </div>
        `,p=i>0?`
            <div style="padding: 10px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0;" onclick="event.stopPropagation();">
                <button onclick="App.restaurarAlertasOcultosHoje(event)" style="background: transparent; border: 1px dashed #94a3b8; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; width: 100%; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='transparent'; this.style.color='#475569'">
                    🔄 Restaurar ${i} alerta(s) oculto(s) hoje
                </button>
            </div>
        `:``;if(u.length>0)t.innerHTML=d+f+u.map(e=>`
                <div id="box-alerta-${e.id}" class="noti-item" style="cursor:pointer; transition:background 0.2s; display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'" onclick="${e.acao}; App.toggleNotificacoes();">
                    <span class="noti-icon" style="font-size: 20px; margin-top: 2px;">${e.icon}</span>
                    <div style="flex: 1; min-width: 0; font-size: 13px; color: #334155;">
                        <span style="display:inline-block; background:${e.corCat||`#3b82f6`}18; color:${e.corCat||`#3b82f6`}; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; text-transform:uppercase; margin-bottom:4px;">${e.categoria||`Aviso`}</span>
                        <div>${e.texto}</div>
                    </div>
                    <button onclick="App.dispensarAlerta('${e.id}', event)" style="background:transparent; border:none; cursor:pointer; color:#94a3b8; padding:4px 6px; font-size:13px; border-radius:6px; transition:0.2s; align-self: flex-start;" onmouseover="this.style.color='#ef4444'; this.style.background='#fee2e2'" onmouseout="this.style.color='#94a3b8'; this.style.background='transparent'" title="Ocultar este aviso">✖</button>
                </div>
            `).join(``)+p;else{let e=l===`todos`?`Nenhum alerta pendente!`:`Nenhum alerta nesta categoria!`;t.innerHTML=d+f+`
                <div class="noti-item" style="justify-content:center; text-align:center; color:#94a3b8; padding: 30px 15px; flex-direction:column; gap:8px;">
                    <span style="font-size:26px;">🎉</span>
                    <span style="font-size:13px; font-weight:600; color:#475569;">${e}</span>
                    <span style="font-size:11px;">Tudo em dia por aqui.</span>
                </div>`+p}},dispensarAlerta:async(e,t)=>{if(t&&t.stopPropagation(),F.salvarAlertaOculto(String(e)),F.alertasAtuaisLista=(F.alertasAtuaisLista||[]).filter(t=>String(t.id)!==String(e)),F.renderizarPainelNotificacoes(),!String(e).startsWith(`alerta_`))try{await F.api(`/sistema/notificacoes/lida/${e}`,`PUT`,null,!0)}catch{}},toggleNotificacoes:()=>{F.injetarEstilosNotificacoes();let e=document.getElementById(`noti-dropdown`);e&&e.classList.toggle(`active`)},marcarNotificacoesComoLidas:async()=>{try{Array.isArray(F.alertasAtuaisLista)&&F.alertasAtuaisLista.forEach(e=>F.salvarAlertaOculto(String(e.id)));let e=await F.api(`/sistema/notificacoes/nao-lidas`,`GET`,null,!0);if(Array.isArray(e)){let t=e.filter(e=>!e.lida);t.length>0&&await Promise.all(t.map(e=>F.api(`/sistema/notificacoes/lida/${e.id}`,`PUT`,null,!0)))}typeof F.showToast==`function`&&F.showToast(`Todos os alertas foram limpos! ✅`,`success`),await F.verificarNotificacoes()}catch{typeof F.showToast==`function`&&F.showToast(`Erro ao limpar notificações.`,`error`)}},testarPushNoAparelho:async e=>{e&&e.stopPropagation();try{let e=await F.api(`/push/teste`,`POST`);e&&e.success?F.showToast(`📲 Notificação Push enviada! Verifique o seu aparelho.`,`success`):e&&e.error&&typeof F.configurarNotificacoesPush==`function`&&(F.showToast(`Ativando notificações neste aparelho...`,`info`),F.configurarNotificacoesPush())}catch{F.showToast(`Não foi possível disparar o teste Push.`,`error`)}},iniciarRadar:()=>{F.radarAtivo&&clearInterval(F.radarAtivo);let e=async()=>{!F.usuario||document.visibilityState===`hidden`||typeof F.verificarNotificacoes==`function`&&await F.verificarNotificacoes()};e(),F.radarAtivo=setInterval(e,15e3)}}),window.App=window.App||{},window.CONFIG=window.CONFIG||{};var I=window.App;window.CONFIG,Object.assign(I,{abrirVisualizacaoContrato:async function(e){let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`A abrir Ficha Completa... ⏳`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:30px; color:#666;">A extrair todos os dados do aluno e contrato da base de dados...</p>`;let n=document.querySelector(`.btn-confirm`);n&&(n.style.display=`none`);try{let t=await I.api(`/contratos/${e}`);if(!t||t.error)throw Error(t?t.error:`Documento não encontrado`);let r=t.nomeAluno||t.nome||`Aluno não identificado`,i=t.cpf||`Não informado`,a=t.rg||`Não informado`,o=t.nascimento||`Não informada`;if(o!==`Não informada`&&o.includes(`-`)){let e=o.split(`-`);e.length===3&&(o=`${e[2]}/${e[1]}/${e[0]}`)}let s=t.sexo||`Não informado`,c=t.profissao||`Não informada`,l=t.email||`Não informado`,u=t.whatsapp||`Não informado`,d=t.enderecoCompleto||`Não informado`,f=t.curso||`Não informado`,p=t.turma||`Não informada`,m=t.planoCurso||`Não informado`,h=t.diaVencimento||`Não informado`,g=t.horarioPreferencia||`Não informado`,_=t.resp_nome||`O Próprio / Não informado`,v=t.resp_parentesco||`Não informado`,y=t.resp_cpf||`Não informado`,b=t.resp_zap||`Não informado`,x=t.conteudoHTML?I.sanitizeHTML(I.unescapeHTML(t.conteudoHTML)):`<p>O contrato não possui texto legível.</p>`,S=t.dataHoraRegistro||t.dataCriacao||t.dataHora||t.createdAt?new Date(t.dataHoraRegistro||t.dataCriacao||t.dataHora||t.createdAt).toLocaleString(`pt-BR`):`Data não registada`;document.getElementById(`modal-titulo`).innerText=`Matrícula: ${r}`,document.getElementById(`modal-form-content`).innerHTML=`
                <div id="area-impressao-contrato" style="padding: 30px; border: 1px solid #ccc; background: #fff; position:relative; color: #333; font-family: Arial, sans-serif;">
                    
                    <div style="text-align:center; margin-bottom:20px; border-bottom:2px solid #2c3e50; padding-bottom:15px;">
                        <h2 style="margin:0; color:#2c3e50; font-size:22px; text-transform:uppercase;">Ficha de Matrícula e Contrato</h2>
                        <div style="color:#27ae60; font-size:12px; font-weight:bold; margin-top:8px; display:inline-block; border:1px solid #27ae60; padding:4px 12px; border-radius:20px; background:#eafaf1;">
                            ✅ AUTENTICADO DIGITALMENTE
                        </div>
                    </div>
                    
                    <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #3498db; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">📋 Dados do Aluno</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; line-height: 1.6;">
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Nome:</b> ${r}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Data de Nascimento:</b> ${o}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>CPF:</b> ${i}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>RG:</b> ${a}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Sexo:</b> ${s}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Profissão:</b> ${c}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>WhatsApp:</b> ${u}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>E-mail:</b> ${l}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 6px; border-bottom: 1px solid #eee;"><b>Endereço Completo:</b> ${d}</td>
                        </tr>
                    </table>

                    <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #9b59b6; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">👨‍👩‍👧 Dados do Responsável</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; line-height: 1.6;">
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Nome:</b> ${_}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Parentesco:</b> ${v}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>CPF:</b> ${y}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>WhatsApp:</b> ${b}</td>
                        </tr>
                    </table>

                    <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #2ecc71; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">🎓 Dados Acadêmicos e Financeiros</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px; line-height: 1.6;">
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Curso:</b> ${f}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Turma:</b> ${p}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Curso Adquirido:</b> ${m}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Dia de Vencimento:</b> ${h}</td>
                            <td colspan="2" style="padding: 6px; border-bottom: 1px solid #eee; color: #27ae60;"><b>🕒 Horário de Preferência:</b> ${g}</td>
                        </tr>
                    </table>
                    
                    <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #e67e22; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">📜 Termos do Contrato</h4>
                    <div class="box-contrato-print" style="font-size:11px; text-align:justify; line-height:1.6; padding:10px; max-height:350px; overflow-y:auto; border: 1px solid #eee; background: #fafafa; border-radius: 4px; margin-bottom:20px;">
                        ${x}
                    </div>
                    
                    <div style="padding:15px; background:#eafaf1; border:1px solid #27ae60; text-align:center; font-size:12px; border-radius:6px; page-break-inside: avoid;">
                        <p style="margin:0 0 5px 0; color:#333;">Pelo presente instrumento, as partes concordam com todos os termos acima descritos.</p>
                        ✅ <b>ACEITE DIGITAL REGISTRADO COM VALIDADE JURÍDICA:</b><br>
                        <span style="font-size:16px; font-weight:bold; color:#1e8449; display:block; margin-top:5px;">📅 ${S}</span>
                        <p style="margin:10px 0 0 0; font-size:10px; color:#7f8c8d;">ID da Transação: ${t._id||e}</p>
                    </div>
                    
                    <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 12px; page-break-inside: avoid; color: #333;">
                        <div style="width: 45%;">
                            <div style="border-top: 1px solid #333; padding-top: 5px;">Assinatura do Responsável / Aluno</div>
                        </div>
                        <div style="width: 45%;">
                            <div style="border-top: 1px solid #333; padding-top: 5px;">Assinatura da Instituição</div>
                        </div>
                    </div>

                </div>
            `,n&&(n.style.display=`inline-flex`,n.style.background=`#2c3e50`,n.innerHTML=`🖨️ Imprimir Ficha`,n.setAttribute(`onclick`,`App.imprimirContrato()`))}catch(e){console.error(`Falha ao abrir contrato:`,e),document.getElementById(`modal-titulo`).innerText=`Erro de Leitura`,document.getElementById(`modal-form-content`).innerHTML=`<p style="color:red; text-align:center;">Não foi possível carregar a ficha completa.<br><small>${e.message}</small></p>`}},renderizarHubContratos:()=>{I.setTitulo(`Hub de Contratos e Matrículas`);let e=document.getElementById(`app-content`);e.innerHTML=`
            <div class="card" style="margin-bottom: 20px; border-bottom: 3px solid #34495e;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                    <button class="btn-primary" onclick="App.mostrarAreaLinks()" style="background:#3498db; border:none;">🔗 Link de Matrícula</button>
                    <button class="btn-primary" onclick="App.renderizarContratos()" style="background:#2c3e50; border:none;">🗄️ Cofre de Contratos</button>
                    <button class="btn-primary" onclick="App.renderizarConfiguradorMatricula()" style="background:#f39c12; border:none;">⚙️ Configurar Formulário</button>
                    <button class="btn-primary" onclick="App.renderizarConfiguradorHub()" style="background:#8e44ad; border:none;">🎨 Configurar Hub</button>
                </div>
            </div>
            <div id="area-dinamica-hub">
                <div class="card" style="text-align:center; padding:50px; opacity:0.6;">
                    <span style="font-size:40px;">📂</span>
                    <p>Selecione uma das opções acima para gerenciar.</p>
                </div>
            </div>
        `},mostrarAreaLinks:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Carregando links... ⏳</p>`;try{let t=await I.api(`/escola`);if(!t||t.error||!t.escolaId){e.innerHTML=`
                    <div class="card" style="text-align:center; color:#e74c3c;">
                        <h3>Erro ao carregar links</h3>
                        <p>Não foi possível identificar o ID da instituição.</p>
                    </div>
                `;return}let n=t.escolaId,r=`${window.location.origin}/hub-matriculas.html?escola=${encodeURIComponent(n)}`,i=Array.isArray(t.linksMatricula)?t.linksMatricula:[];e.innerHTML=`
                <div class="card">
                    <h3>🔗 Links de Matrícula</h3>
                    <p style="font-size:13px; color:#666;">
                        Gere links públicos para matrícula. Cada link abre o <strong>Hub de Seleção (Presencial/Online)</strong> com o ID desta instituição.
                    </p>

                    <div style="background:#f8f9fa; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                        <label style="font-weight:bold; display:block; margin-bottom:8px;">Link principal da instituição</label>
                        <input id="link-principal-matricula" value="${r}" readonly style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button type="button" class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('link-principal-matricula').value); App.showToast('Link principal copiado!', 'success');" style="width:auto;">
                                📋 Copiar Link Principal
                            </button>

                            <button type="button" class="btn-cancel" onclick="window.open(document.getElementById('link-principal-matricula').value, '_blank')" style="width:auto;">
                                🔎 Abrir Link
                            </button>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                        <label style="font-weight:bold; display:block; margin-bottom:8px;">Criar link personalizado / campanha</label>
                        <input id="nome-novo-link-matricula" placeholder="Ex: Instagram, WhatsApp, Turma Sábado, Campanha Maio..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                        <button type="button" class="btn-primary" onclick="App.criarLinkMatriculaCampanha()" style="width:auto;">
                            ➕ Gerar Link Personalizado
                        </button>
                    </div>

                    <h4>Links gerados</h4>
                    ${i.length===0?`<p style="text-align:center; color:#999; font-size:13px; padding:20px; border:1px dashed #ccc; border-radius:8px;">
                        Nenhum link/campanha gerado ainda.
                   </p>`:i.map(e=>{let t=`${r}&ref=${encodeURIComponent(e.id)}`;return`
                        <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:12px;">
                            <strong>${I.escapeHTML(e.nome||`Link sem nome`)}</strong>
                            <p style="font-size:12px; color:#777; margin:6px 0;">
                                Criado em: ${I.escapeHTML(e.criadoEm||`-`)}
                            </p>

                            <input value="${t}" readonly style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; font-size:12px; margin-bottom:10px;">

                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <button type="button" class="btn-primary" onclick="navigator.clipboard.writeText('${t}'); App.showToast('Link copiado!', 'success');" style="width:auto;">
                                    📋 Copiar
                                </button>

                                <button type="button" class="btn-cancel" onclick="window.open('${t}', '_blank')" style="width:auto;">
                                    🔎 Abrir
                                </button>

                                <button type="button" onclick="App.excluirLinkMatricula('${e.id}')" style="width:auto; background-color:#e74c3c; color:white; border:none; padding:10px 15px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.3s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                    🗑️ Excluir
                                </button>
                            </div>
                        </div>
                    `}).join(``)}
                </div>
            `}catch(t){console.error(t),e.innerHTML=`
                <div class="card" style="text-align:center; color:#e74c3c;">
                    <h3>Erro</h3>
                    <p>Não foi possível carregar a área de links.</p>
                </div>
            `}},criarLinkMatriculaCampanha:async()=>{let e=document.getElementById(`nome-novo-link-matricula`)?.value?.trim();if(!e)return I.showToast(`Digite um nome para o link.`,`warning`);try{let t=await I.api(`/escola`);if(!t||t.error||!t.escolaId)return I.showToast(`Não foi possível carregar os dados da instituição.`,`error`);let n=Array.isArray(t.linksMatricula)?t.linksMatricula:[],r={id:`REF_`+Date.now(),nome:e,criadoEm:new Date().toLocaleString(`pt-BR`)},i={...t,linksMatricula:[r,...n]},a=await I.api(`/escola`,`PUT`,i);if(a&&a.error)return I.showToast(a.error,`error`);I.showToast(`Link personalizado criado com sucesso!`,`success`),I.mostrarAreaLinks()}catch(e){console.error(e),I.showToast(`Erro ao criar link personalizado.`,`error`)}},excluirLinkMatricula:e=>{I.abrirModalConfirmacao(`🗑️ Excluir Link Personalizado?`,`Tem a certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.`,async t=>{document.body.style.cursor=`wait`;try{let t=await I.api(`/escola`)||{};t.linksMatricula&&(t.linksMatricula=t.linksMatricula.filter(t=>t.id!==e),await I.api(`/escola`,`PUT`,t),I.showToast(`Link excluído com sucesso!`,`success`),I.mostrarAreaLinks())}catch(e){console.error(e),I.showToast(`Erro ao excluir o link.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},renderizarContratos:async()=>{let e=document.getElementById(`area-dinamica-hub`)||document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar o cofre... ⏳</p>`;try{let t=await I.api(`/contratos`),n=Array.isArray(t)?t:[];if(n.length===0){e.innerHTML=`<div style="text-align:center; padding:40px;"><span style="font-size:50px;">🗄️</span><h3 style="color:#666;">Cofre Vazio</h3><p style="font-size:13px; color:#999;">Os recibos imutáveis aparecerão aqui quando os alunos preencherem a matrícula.</p></div>`;return}n.sort((e,t)=>new Date(t.dataHoraRegistro||t.dataCriacao)-new Date(e.dataHoraRegistro||e.dataCriacao)),I.contratosSelecionados=[];let r=(e,t,n)=>{let r=e.dataHoraRegistro||e.dataCriacao||new Date().toISOString(),i=new Date(r).toLocaleString(`pt-BR`),a=I.escapeHTML(e.nomeAluno||e.nome||`Aluno Indefinido`);return`
                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid ${t}; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <input type="checkbox" class="chk-contrato" value="${e.id}" onchange="App.toggleSelecaoContrato(this)" style="width:18px; height:18px; cursor:pointer; accent-color: #e74c3c; flex-shrink: 0;">
                        <div>
                            <div style="font-weight:bold; color:#2c3e50; font-size:15px;">${n} ${a}</div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">⏱️ Recebido em: <strong style="color:#2c3e50;">${i}</strong></div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="App.abrirVisualizacaoContrato('${e.id}')" style="padding:8px 15px; font-size:12px; background:${t}; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">👁️ Ver</button>
                        <button onclick="App.excluirContrato('${e.id}')" style="padding:8px 15px; font-size:12px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">🗑️ Apagar</button>
                    </div>
                </div>`},i=n.filter(e=>e.modalidade===`Online`||e.modalidade_escolhida===`Online`||e.planoCurso&&e.planoCurso.toLowerCase().includes(`online`)),a=n.filter(e=>!(e.modalidade===`Online`||e.modalidade_escolhida===`Online`||e.planoCurso&&e.planoCurso.toLowerCase().includes(`online`))),o=i.length>0?i.map(e=>r(e,`#27ae60`,`💻`)).join(``):`<p style="text-align:center; color:#999; font-size:12px; padding:20px; border:1px dashed #bbf7d0; border-radius:8px;">Nenhuma matrícula online.</p>`,s=a.length>0?a.map(e=>r(e,`#2c3e50`,`🏫`)).join(``):`<p style="text-align:center; color:#999; font-size:12px; padding:20px; border:1px dashed #e2e8f0; border-radius:8px;">Nenhuma matrícula presencial.</p>`;e.innerHTML=`
            <div>
                <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; background:#fdf2f2; border:1px solid #f5b7b1; color:#c0392b; padding:12px 15px; border-radius:6px; margin-bottom:15px; font-size:13px; gap: 10px;">
                    <div>🔒 <strong>Zona de Segurança Jurídica:</strong> Documentos imutáveis.</div>
                    <button onclick="App.selecionarTodosContratos()" style="background:transparent; border:1px solid #c0392b; color:#c0392b; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold; transition: 0.2s;">
                        ☑️ Marcar / Desmarcar Todos
                    </button>
                </div>
                
                <div id="barra-exclusao-massa" style="display:none; flex-wrap:wrap; gap:10px; background:#ffe5e5; border:1px solid #ffb3b3; color:#d93025; padding:12px 20px; border-radius:8px; margin-bottom:20px; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(217,48,37,0.15);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">⚠️</span>
                        <span id="texto-exclusao-massa" style="font-weight:bold; font-size:14px;">0 contratos selecionados</span>
                    </div>
                    <button onclick="App.excluirContratosMassa()" style="background:#d93025; color:white; border:none; padding:10px 18px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.2s; box-shadow:0 2px 5px rgba(217,48,37,0.3);">
                        🗑️ Apagar Selecionados
                    </button>
                </div>
                
                <div style="display:flex; gap:20px; flex-wrap:wrap; align-items: flex-start;">
                    <div style="flex:1; min-width:300px; background:#f8f9fa; padding:15px; border-radius:10px; border-top: 4px solid #2c3e50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="text-align:center; color:#2c3e50; margin-top:0; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">
                            🏫 Curso Presencial 
                            <span style="font-size:12px; background:#2c3e50; color:white; padding:3px 8px; border-radius:12px; vertical-align:middle; margin-left:5px;">${a.length}</span>
                        </h3>
                        ${s}
                    </div>

                    <div style="flex:1; min-width:300px; background:#f0fdf4; padding:15px; border-radius:10px; border-top: 4px solid #27ae60; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="text-align:center; color:#27ae60; margin-top:0; border-bottom:2px solid #bbf7d0; padding-bottom:10px;">
                            💻 Curso Online 
                            <span style="font-size:12px; background:#27ae60; color:white; padding:3px 8px; border-radius:12px; vertical-align:middle; margin-left:5px;">${i.length}</span>
                        </h3>
                        ${o}
                    </div>
                </div>
            </div>`,I.listaCacheContratos=n}catch(t){console.error(t),e.innerHTML=`<p style='color:red;'>Erro ao carregar cofre.</p>`}},imprimirContrato:()=>{let e=JSON.parse(localStorage.getItem(I.getTenantKey(`escola_perfil`)))||{},t=e.nome||`Instituição de Ensino`,n=e.cnpj?`CNPJ: ${e.cnpj}`:``,r=e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?`<img src="${e.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">`:``,i=document.getElementById(`area-impressao-contrato`).cloneNode(!0),a=document.createElement(`iframe`);a.style.position=`absolute`,a.style.top=`-10000px`,a.style.width=`800px`,a.style.height=`1000px`,a.style.border=`none`,document.body.appendChild(a);let o=a.contentWindow.document;o.open(),o.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impressão - Contrato</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; background: #fff; }
                    .header-escola { display: flex; align-items: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 25px; }
                    .header-escola img { margin-right: 20px; }
                    .header-escola h2 { margin: 0; color: #2c3e50; font-size: 24px; }
                    .header-escola p { margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; }
                    .box-contrato-print { max-height: none !important; overflow: visible !important; border: none !important; padding: 0 !important; background: transparent !important; }
                    @media print { body { padding: 0; } @page { margin: 15mm; } }
                </style>
            </head>
            <body>
                <div class="header-escola">
                    ${r}
                    <div>
                        <h2>${I.escapeHTML(t)}</h2>
                        <p>${I.escapeHTML(n)}</p>
                    </div>
                </div>
                ${i.innerHTML}
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento impresso em ${new Date().toLocaleString(`pt-BR`)} pelo SISTEMA PTT
                </div>
            </body>
            </html>
        `),o.close(),setTimeout(()=>{a.contentWindow.focus(),a.contentWindow.print(),setTimeout(()=>{document.body.removeChild(a)},1500)},800)},excluirContrato:e=>{I.abrirModalConfirmacao(`Apagar Contrato Oficial?`,`Tem a certeza que deseja apagar este documento assinado? Esta ação é irreversível.`,async t=>{document.body.style.cursor=`wait`;try{let t=await I.api(`/contratos/${e}`,`DELETE`);t&&t.error?I.showToast(t.error,`error`):(I.showToast(`Contrato apagado com sucesso!`,`success`),I.renderizarContratos())}catch{I.showToast(`Erro ao apagar o contrato.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},toggleSelecaoContrato:e=>{I.contratosSelecionados||=[],e.checked?I.contratosSelecionados.includes(e.value)||I.contratosSelecionados.push(e.value):I.contratosSelecionados=I.contratosSelecionados.filter(t=>t!==e.value),I.atualizarBarraExclusaoMassa()},selecionarTodosContratos:()=>{let e=document.querySelectorAll(`.chk-contrato`),t=!0;e.forEach(e=>{e.checked||(t=!1)}),I.contratosSelecionados=[],e.forEach(e=>{e.checked=!t,t||I.contratosSelecionados.push(e.value)}),I.atualizarBarraExclusaoMassa()},atualizarBarraExclusaoMassa:()=>{let e=document.getElementById(`barra-exclusao-massa`),t=document.getElementById(`texto-exclusao-massa`);if(!e||!t)return;let n=I.contratosSelecionados?I.contratosSelecionados.length:0;n>0?(e.style.display=`flex`,t.innerText=`${n} contrato(s) selecionado(s)`):e.style.display=`none`},excluirContratosMassa:()=>{let e=I.contratosSelecionados||[];e.length!==0&&I.abrirModalConfirmacao(`🗑️ Excluir em Massa?`,`Tem a certeza absoluta que deseja apagar <b>${e.length}</b> contrato(s)?<br><br><span style="color:red; font-size:12px;">⚠️ Esta ação é irreversível e excluirá os registos permanentemente do banco de dados.</span>`,async t=>{document.body.style.cursor=`wait`;try{let t=0,n=e.map(e=>I.api(`/contratos/${e}`,`DELETE`));(await Promise.allSettled(n)).forEach(e=>{e.status===`fulfilled`&&e.value&&!e.value.error&&t++}),t===e.length?I.showToast(`✅ ${t} contratos apagados com sucesso!`,`success`):I.showToast(`⚠️ Excluídos: ${t} de ${e.length}. Atualize a página e tente de novo.`,`warning`),I.contratosSelecionados=[],I.renderizarContratos()}catch(e){console.error(e),I.showToast(`Erro crítico durante a exclusão em massa.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},renderizarConfiguradorMatricula:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do contrato... ⏳</p>`;try{let t=await I.api(`/escola`)||{},n={imagemHeader:`https://placehold.co/1000x500?text=Sua+Imagem+de+Cabecalho`,imagemPosicao:`50% 50%`,tituloHeader:`Matrícula Digital`,descHeader:`Preencha os dados abaixo com atenção para garantir a sua vaga.`,opcoesPlano:`Padrão, Intensivo, Personalizado`,opcoesVencimento:`08, 20`,horarios:``,textoContrato:`TERMO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS<br><br>CLÁUSULA PRIMEIRA...`},r=t.configMatricula||{},i={...r};delete i.online,i.tituloHeader||(i={...n}),i.textoContrato&&=I.unescapeHTML(i.textoContrato);let a=r.online||{...n,tituloHeader:`Matrícula Digital EAD`,opcoesPlano:`Curso Online VIP, Curso Online Básico`,horarios:`100% Online`};a.textoContrato&&=I.unescapeHTML(a.textoContrato),I.configTemp={presencial:i,online:a},I.abaAtiva=`presencial`,e.innerHTML=`
                <div style="display:flex; gap:10px; margin-bottom: 20px; justify-content: center; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <button id="btn-aba-presencial" onclick="App.alternarAbaConfig('presencial')" style="flex:1; max-width: 200px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; background: #2c3e50; color: white;">🏫 Contrato Presencial</button>
                    <button id="btn-aba-online" onclick="App.alternarAbaConfig('online')" style="flex:1; max-width: 200px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; background: #e0e6ed; color: #2c3e50;">💻 Contrato Online</button>
                </div>
                <div id="container-config-interno"></div>
            `,I.alternarAbaConfig(`presencial`)}catch(t){console.error(t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o configurador.</p>`}},alternarAbaConfig:e=>{I.abaAtiva=e;let t=document.getElementById(`btn-aba-presencial`),n=document.getElementById(`btn-aba-online`);e===`presencial`?(t&&(t.style.background=`#2c3e50`,t.style.color=`white`),n&&(n.style.background=`#e0e6ed`,n.style.color=`#2c3e50`)):(n&&(n.style.background=`#27ae60`,n.style.color=`white`),t&&(t.style.background=`#e0e6ed`,t.style.color=`#2c3e50`));let r=document.getElementById(`container-config-interno`);r.innerHTML=`
            <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                    <h3 style="margin-top:0; color:#2c3e50; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🛠️ Ferramentas (${e===`presencial`?`Presencial`:`Online`})</h3>
                    
                    <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:5px; justify-content:flex-start;" onclick="App.editarConfig('imagem')">🖼️ Imagem do Cabeçalho</button>
                    <div style="font-size:11px; color:#7f8c8d; text-align:center; margin-bottom:15px; line-height:1.4;">Tamanho recomendado:<br><b style="color:#2c3e50;">1000 x 500px</b></div>

                    <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('titulo')">✏️ Título do Cabeçalho</button>
                    <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('descricao')">📝 Descrição do Cabeçalho</button>
                    <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('opcoes')">⚙️ Alterar Dados Editáveis</button>
                    <button class="btn-primary" style="width:100%; background:#34495e; color:white; border:none; margin-bottom:25px; justify-content:flex-start;" onclick="App.editarConfig('contrato')">📑 Editar Contrato Digital</button>
                    <button class="btn-primary" style="width:100%; background:#27ae60; border:none; justify-content:center; padding:15px; font-weight:bold;" onclick="App.salvarConfiguradorMatricula()">💾 Salvar Tudo</button>
                </div>

                <div style="flex: 1; min-width: 0;">
                    <div style="background:#e0e6ed; padding:20px; border-radius:12px; display:flex; justify-content:center; width:100%; box-sizing: border-box;">
                        <div id="preview-word-doc" style="background:white; width:100%; max-width:100%; min-height:600px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border-radius:8px;">
                        </div>
                    </div>
                </div>
            </div>
        `,I.atualizarPreviewConfigurador()},atualizarPreviewConfigurador:()=>{let e=document.getElementById(`preview-word-doc`),t=I.configTemp[I.abaAtiva];e&&(e.innerHTML=`
                <div id="preview-header-img" 
                     onmousedown="App.iniciarArraste(event)" 
                     ontouchstart="App.iniciarArraste(event)"
                     style="width:100%; height:250px; background:url('${t.imagemHeader}') no-repeat; background-size: cover; background-position: ${t.imagemPosicao}; border-radius:8px 8px 0 0; cursor:grab; position:relative; overflow:hidden; user-select:none;">
                     <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px; pointer-events:none; backdrop-filter:blur(2px); border:1px solid rgba(255,255,255,0.2);">🖐️ Arraste para reposicionar</div>
                </div>
                <div style="padding: 25px; text-align: center; border-bottom: 2px dashed #eee;">
                    <h2 style="color:#2c3e50; margin:0 0 10px 0;">${I.escapeHTML(t.tituloHeader)}</h2>
                    <p style="color:#7f8c8d; font-size:14px; margin:0;">${I.escapeHTML(t.descHeader)}</p>
                </div>
                <div style="padding: 25px;">
                    <h4 style="color:#2980b9; margin-top:0;">📋 Dados Editáveis (Preview)</h4>
                    <div style="display:flex; gap:10px; margin-bottom: 15px;">
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Plano de Curso: ${t.opcoesPlano}</option>
                        </select>
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Vencimento: ${t.opcoesVencimento}</option>
                        </select>
                    </div>
                    <h4 style="color:#2980b9;">📑 Texto do Contrato</h4>
                    <div style="font-size:11px; color:#555; background:#f9f9f9; padding:15px; border-radius:6px; border:1px solid #eee; height:300px; overflow-y:auto; text-align:justify;">${t.textoContrato}</div>
                </div>
            `)},editarConfig:e=>{let t=I.configTemp[I.abaAtiva];if(e===`imagem`){let e=document.createElement(`input`);e.type=`file`,e.accept=`image/*`,e.onchange=e=>{let t=e.target.files[0];t&&(I.showToast(`A processar e otimizar a imagem... ⏳`,`info`),I.otimizarImagem(t,1e3,e=>{I.configTemp[I.abaAtiva].imagemHeader=e,I.atualizarPreviewConfigurador(),I.showToast(`Imagem aplicada com sucesso!`,`success`)}))},e.click()}else if(e===`titulo`||e===`descricao`||e===`opcoes`){let n=(e,t,n)=>{let r=document.createElement(`div`);r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;`;let i=document.createElement(`div`);i.style.cssText=`background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;`,i.innerHTML=`
                    <style>
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                        .modal-custom-input { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 15px; margin-top: 6px; transition: border-color 0.2s; }
                        .modal-custom-input:focus { border-color: #0d6efd; outline: none; box-shadow: 0 0 0 3px rgba(13,110,253,0.2); }
                        .modal-custom-label { font-weight: 600; color: #495057; font-size: 14px; }
                        .modal-btn-cancel { padding: 10px 18px; background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                        .modal-btn-cancel:hover { background: #e2e6ea; }
                        .modal-btn-save { padding: 10px 18px; background: #0d6efd; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                        .modal-btn-save:hover { background: #0b5ed7; }
                    </style>
                    <h3 style="margin-top:0; color:#212529; font-size:20px; border-bottom:1px solid #f1f3f5; padding-bottom:15px; margin-bottom:20px;">${e}</h3>
                    <div style="margin-bottom:24px;">
                        ${t}
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:12px;">
                        <button id="btnCancelarModal" class="modal-btn-cancel">Cancelar</button>
                        <button id="btnSalvarModal" class="modal-btn-save">Salvar Alterações</button>
                    </div>
                `,r.appendChild(i),document.body.appendChild(r);let a=()=>{r.style.animation=`fadeIn 0.2s ease reverse forwards`,i.style.animation=`scaleUp 0.2s ease reverse forwards`,setTimeout(()=>document.body.removeChild(r),200)};i.querySelector(`#btnCancelarModal`).onclick=a,i.querySelector(`#btnSalvarModal`).onclick=()=>{n(i),a()}};e===`titulo`?n(`✏️ Editar Título`,`<label class="modal-custom-label">Título do Documento:</label>
                     <input type="text" id="inputTitulo" class="modal-custom-input" placeholder="Ex: Contrato de Prestação de Serviços" value="${t.tituloHeader||``}">`,e=>{I.configTemp[I.abaAtiva].tituloHeader=e.querySelector(`#inputTitulo`).value,I.atualizarPreviewConfigurador()}):e===`descricao`?n(`📝 Editar Descrição`,`<label class="modal-custom-label">Subtítulo ou Descrição:</label>
                     <textarea id="inputDescricao" class="modal-custom-input" style="height:110px; resize:vertical;" placeholder="Digite aqui uma breve descrição...">${t.descHeader||``}</textarea>`,e=>{I.configTemp[I.abaAtiva].descHeader=e.querySelector(`#inputDescricao`).value,I.atualizarPreviewConfigurador()}):e===`opcoes`&&n(`⚙️ Dados Complementares`,`<div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Curso Adquirido</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputCursos" class="modal-custom-input" placeholder="Ex: Inglês, Informática" value="${t.opcoesPlano||``}">
                     </div>
                     <div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Dia de Vencimento</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputDias" class="modal-custom-input" placeholder="Ex: 5, 10, 15" value="${t.opcoesVencimento||``}">
                     </div>
                     <div>
                        <label class="modal-custom-label">Horários Disponíveis</label><br>
                        <span style="font-size:12px; color:#6c757d;">Ex: Manhã (08h às 10h), Noite (19h às 21h)</span>
                        <input type="text" id="inputHorarios" class="modal-custom-input" placeholder="Separe por vírgula" value="${t.horarios||``}">
                     </div>`,e=>{I.configTemp[I.abaAtiva].opcoesPlano=e.querySelector(`#inputCursos`).value,I.configTemp[I.abaAtiva].opcoesVencimento=e.querySelector(`#inputDias`).value,I.configTemp[I.abaAtiva].horarios=e.querySelector(`#inputHorarios`).value,I.atualizarPreviewConfigurador()})}else if(e===`contrato`){let e=document.getElementById(`modal-overlay`);e&&(e.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Editar Texto do Contrato (${I.abaAtiva===`presencial`?`Presencial`:`Online`})`,document.getElementById(`modal-form-content`).innerHTML=`
                <div id="editor-contrato-quill" style="height:350px; background:#fff; font-family:sans-serif; line-height:1.5;">${I.sanitizeHTML(t.textoContrato||``)}</div>
            `,setTimeout(()=>{window.quillContrato=new Quill(`#editor-contrato-quill`,{theme:`snow`,modules:{toolbar:[[`bold`,`italic`,`underline`],[{list:`ordered`},{list:`bullet`}],[{align:[]}],[{size:[`small`,!1,`large`,`huge`]}],[`clean`]]}})},100);let n=document.querySelector(`.btn-confirm`);n.style.display=`inline-flex`,n.innerHTML=`Aplicar ao Preview`,n.onclick=()=>{I.configTemp[I.abaAtiva].textoContrato=window.quillContrato.root.innerHTML,I.atualizarPreviewConfigurador(),I.fecharModal()}}},iniciarArraste:e=>{let t=document.getElementById(`preview-header-img`);if(!t)return;e.preventDefault();let n=!0,[r,i]=(I.configTemp[I.abaAtiva].imagemPosicao||`50% 50%`).split(` `).map(e=>parseFloat(e)||50),a=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,o=i,s=e=>{if(!n)return;i=o-((e.type.includes(`touch`)?e.touches[0].clientY:e.clientY)-a)*.2,i<0&&(i=0),i>100&&(i=100);let r=`50% ${i}%`;t.style.backgroundPosition=r},c=()=>{n=!1,I.configTemp[I.abaAtiva].imagemPosicao=t.style.backgroundPosition,document.removeEventListener(`mousemove`,s),document.removeEventListener(`mouseup`,c),document.removeEventListener(`touchmove`,s),document.removeEventListener(`touchend`,c)};document.addEventListener(`mousemove`,s),document.addEventListener(`mouseup`,c),document.addEventListener(`touchmove`,s,{passive:!1}),document.addEventListener(`touchend`,c)},salvarConfiguradorMatricula:async()=>{let e=document.querySelector(`button[onclick="App.salvarConfiguradorMatricula()"]`),t=e?e.innerHTML:`💾 Salvar Tudo`;e&&(e.innerHTML=`A salvar... ⏳`,e.disabled=!0,e.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let e=await I.api(`/escola`)||{};e.configMatricula={...I.configTemp.presencial,online:I.configTemp.online},await I.api(`/escola`,`PUT`,e),I.showToast(`Configurações salvas para Presencial e Online!`,`success`)}catch{I.showToast(`Erro ao guardar as configurações.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1,e.style.opacity=`1`),document.body.style.cursor=`default`}},renderizarConfiguradorHub:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do Hub... ⏳</p>`;try{let t=await I.api(`/escola`)||{},n={tituloHeader:`Bem-vindo(a) à Área de Matrículas`,descHeader:`Estamos muito felizes em tê-lo(a) connosco! Por favor, selecione abaixo a modalidade do curso que pretende frequentar.`,iconePresencial:`🏫`,tituloPresencial:`Curso Presencial`,descPresencial:`Aulas presenciais na nossa unidade física. Acesso completo à infraestrutura, laboratórios e contacto direto com os nossos professores.`,btnPresencial:`Matrícula Presencial`,iconeOnline:`💻`,tituloOnline:`Curso Online (EAD)`,descOnline:`Estude a partir de casa e ao seu próprio ritmo. Acesso imediato à plataforma virtual de aprendizagem, materiais e suporte 100% online.`,btnOnline:`Matrícula Online`};I.configHubTemp=t.configHub?{...n,...t.configHub}:{...n},e.innerHTML=`
                <div id="container-config-interno">
                    <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                        <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                            <h3 style="margin-top:0; color:#8e44ad; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🎨 Ferramentas da Vitrine</h3>
                            
                            <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfigHub('header')">📝 Textos do Topo</button>
                            <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfigHub('presencial')">🏫 Cartão Presencial</button>
                            <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:25px; justify-content:flex-start;" onclick="App.editarConfigHub('online')">💻 Cartão Online</button>
                            
                            <button class="btn-primary" style="width:100%; background:#8e44ad; border:none; justify-content:center; padding:15px; font-weight:bold;" onclick="App.salvarConfiguradorHub()">💾 Salvar Hub</button>
                        </div>

                        <div style="flex: 1; min-width: 0;">
                            <div style="background:#e0e6ed; padding:20px; border-radius:12px; display:flex; justify-content:center; width:100%; box-sizing: border-box;">
                                <div id="preview-hub-page" style="background:#f4f7f6; width:100%; max-width:100%; min-height:500px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border-radius:8px; padding: 30px; font-family: 'Segoe UI', sans-serif; position: relative;">
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,I.atualizarPreviewHub()}catch(t){console.error(t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o configurador do Hub.</p>`}},atualizarPreviewHub:()=>{let e=document.getElementById(`preview-hub-page`);if(!e)return;let t=I.configHubTemp;e.innerHTML=`
            <div style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px;">👁️ Pré-visualização ao Vivo</div>
            
            <div style="text-align: center; padding: 20px 10px 20px; max-width: 600px; margin: 20px auto 0;">
                <h1 style="color: #2c3e50; font-size: 1.8rem; margin-bottom: 10px; margin-top:0;">${I.escapeHTML(t.tituloHeader)}</h1>
                <p style="color: #666; font-size: 0.95rem; line-height: 1.5;">${I.escapeHTML(t.descHeader)}</p>
            </div>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                <div style="background: #fff; border-radius: 20px; padding: 25px 20px; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 45px; margin-bottom: 10px;">${I.escapeHTML(t.iconePresencial)}</div>
                    <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem; margin-top:0;">${I.escapeHTML(t.tituloPresencial)}</h2>
                    <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 0.85rem; flex-grow: 1;">${I.escapeHTML(t.descPresencial)}</p>
                    <div style="background-color: #3498db; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem;">${I.escapeHTML(t.btnPresencial)}</div>
                </div>

                <div style="background: #fff; border-radius: 20px; padding: 25px 20px; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 45px; margin-bottom: 10px;">${I.escapeHTML(t.iconeOnline)}</div>
                    <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem; margin-top:0;">${I.escapeHTML(t.tituloOnline)}</h2>
                    <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 0.85rem; flex-grow: 1;">${I.escapeHTML(t.descOnline)}</p>
                    <div style="background-color: #3498db; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem;">${I.escapeHTML(t.btnOnline)}</div>
                </div>
            </div>
        `},editarConfigHub:e=>{let t=I.configHubTemp,n=(e,t,n)=>{let r=document.createElement(`div`);r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;`;let i=document.createElement(`div`);i.style.cssText=`background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;`,i.innerHTML=`
                <style>
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .modal-custom-input { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 15px; margin-top: 6px; margin-bottom: 15px; transition: border-color 0.2s; }
                    .modal-custom-input:focus { border-color: #8e44ad; outline: none; box-shadow: 0 0 0 3px rgba(142,68,173,0.2); }
                    .modal-custom-label { font-weight: 600; color: #495057; font-size: 14px; display:block; }
                    .modal-btn-cancel { padding: 10px 18px; background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                    .modal-btn-cancel:hover { background: #e2e6ea; }
                    .modal-btn-save { padding: 10px 18px; background: #8e44ad; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                    .modal-btn-save:hover { background: #732d91; }
                </style>
                <h3 style="margin-top:0; color:#212529; font-size:20px; border-bottom:1px solid #f1f3f5; padding-bottom:15px; margin-bottom:20px;">${e}</h3>
                <div style="margin-bottom:24px; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                    ${t}
                </div>
                <div style="display:flex; justify-content:flex-end; gap:12px;">
                    <button id="btnCancelarModal" class="modal-btn-cancel">Cancelar</button>
                    <button id="btnSalvarModal" class="modal-btn-save">Aplicar</button>
                </div>
            `,r.appendChild(i),document.body.appendChild(r);let a=()=>{r.style.animation=`fadeIn 0.2s ease reverse forwards`,i.style.animation=`scaleUp 0.2s ease reverse forwards`,setTimeout(()=>document.body.removeChild(r),200)};i.querySelector(`#btnCancelarModal`).onclick=a,i.querySelector(`#btnSalvarModal`).onclick=()=>{n(i),a()}};e===`header`?n(`📝 Textos do Topo`,`<label class="modal-custom-label">Título Principal:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${t.tituloHeader||``}">
                 <label class="modal-custom-label">Mensagem de Boas-vindas:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${t.descHeader||``}</textarea>`,e=>{I.configHubTemp.tituloHeader=e.querySelector(`#iTitulo`).value,I.configHubTemp.descHeader=e.querySelector(`#iDesc`).value,I.atualizarPreviewHub()}):e===`presencial`?n(`🏫 Cartão Presencial`,`<label class="modal-custom-label">Ícone (Emoji):</label>
                 <input type="text" id="iIcone" class="modal-custom-input" value="${t.iconePresencial||``}" maxlength="5" style="width: 80px; text-align: center; font-size: 20px;">
                 <label class="modal-custom-label">Título do Cartão:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${t.tituloPresencial||``}">
                 <label class="modal-custom-label">Descrição Curta:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${t.descPresencial||``}</textarea>
                 <label class="modal-custom-label">Texto do Botão:</label>
                 <input type="text" id="iBtn" class="modal-custom-input" value="${t.btnPresencial||``}">`,e=>{I.configHubTemp.iconePresencial=e.querySelector(`#iIcone`).value,I.configHubTemp.tituloPresencial=e.querySelector(`#iTitulo`).value,I.configHubTemp.descPresencial=e.querySelector(`#iDesc`).value,I.configHubTemp.btnPresencial=e.querySelector(`#iBtn`).value,I.atualizarPreviewHub()}):e===`online`&&n(`💻 Cartão Online`,`<label class="modal-custom-label">Ícone (Emoji):</label>
                 <input type="text" id="iIcone" class="modal-custom-input" value="${t.iconeOnline||``}" maxlength="5" style="width: 80px; text-align: center; font-size: 20px;">
                 <label class="modal-custom-label">Título do Cartão:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${t.tituloOnline||``}">
                 <label class="modal-custom-label">Descrição Curta:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${t.descOnline||``}</textarea>
                 <label class="modal-custom-label">Texto do Botão:</label>
                 <input type="text" id="iBtn" class="modal-custom-input" value="${t.btnOnline||``}">`,e=>{I.configHubTemp.iconeOnline=e.querySelector(`#iIcone`).value,I.configHubTemp.tituloOnline=e.querySelector(`#iTitulo`).value,I.configHubTemp.descOnline=e.querySelector(`#iDesc`).value,I.configHubTemp.btnOnline=e.querySelector(`#iBtn`).value,I.atualizarPreviewHub()})},salvarConfiguradorHub:async()=>{let e=document.querySelector(`button[onclick="App.salvarConfiguradorHub()"]`),t=e?e.innerHTML:`💾 Salvar Hub`;e&&(e.innerHTML=`A salvar... ⏳`,e.disabled=!0,e.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let e=await I.api(`/escola`)||{};e.configHub=I.configHubTemp,await I.api(`/escola`,`PUT`,e),I.showToast(`Vitrine salva e pronta para os alunos!`,`success`)}catch{I.showToast(`Erro ao guardar as configurações da vitrine.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1,e.style.opacity=`1`),document.body.style.cursor=`default`}}});var L=`/api`,R=[],z={escapeHTML:e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),escapeJS:e=>e==null?``:String(e).replace(/\\/g,`\\\\`).replace(/'/g,`\\'`),init:()=>{if(sessionStorage.getItem(`token_master`)){let e=document.getElementById(`login-screen`),t=document.getElementById(`dashboard`);e&&t&&(e.style.display=`none`,t.style.display=`flex`,z.carregarDados())}},showToast:(e,t=`success`)=>{let n=document.getElementById(`toast-container`);if(!n)return;let r=document.createElement(`div`);r.innerHTML=`<span>${t===`success`?`✅`:t===`error`?`❌`:`ℹ️`}</span> <span>${z.escapeHTML(e)}</span>`,r.style.background=`var(--card)`,r.style.borderLeft=`4px solid ${t===`success`?`var(--success)`:t===`error`?`var(--danger)`:`var(--warning)`}`,r.style.color=`white`,r.style.padding=`15px 20px`,r.style.borderRadius=`6px`,r.style.boxShadow=`0 10px 15px rgba(0,0,0,0.5)`,r.style.display=`flex`,r.style.alignItems=`center`,r.style.gap=`10px`,r.style.fontSize=`14px`,r.style.animation=`fadeIn 0.3s ease`,n.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,setTimeout(()=>r.remove(),300)},3500)},ajustarDiasPadrao:e=>{let t=document.getElementById(`${e}-plano`),n=document.getElementById(`${e}-dias`);!t||!n||(n.value=t.value===`Teste`?`7`:`30`)},login:async()=>{let e=document.getElementById(`master-pwd`).value;if(!e)return z.showToast(`Digite a senha.`,`warning`);let t=document.querySelector(`.login-box button`),n=t.innerText;t.innerText=`Autenticando... ⏳`,t.disabled=!0;let r=document.getElementById(`login-error`);r.style.display=`none`;try{let t=await fetch(`${L}/master/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({senha:e})}),n;try{n=await t.json()}catch{n={error:`Erro crítico no servidor.`}}t.ok&&n.success&&n.token?(sessionStorage.setItem(`token_master`,n.token),document.getElementById(`master-pwd`).value=``,z.init()):(r.innerText=n.error?n.error:`Acesso negado!`,r.style.display=`block`)}catch{z.showToast(`Erro de rede. O servidor pode estar a iniciar, aguarde...`,`error`)}finally{t.innerText=n,t.disabled=!1}},logout:()=>{sessionStorage.removeItem(`token_master`),window.location.reload()},carregarDados:async()=>{let e=sessionStorage.getItem(`token_master`);try{let t=`${L}/master/ativacoes?t=${new Date().getTime()}`,n=await fetch(t,{headers:{Authorization:`Bearer ${e}`},cache:`no-store`});if(n.status===500){z.showToast(`Erro 500: Falha interna no servidor (Backend).`,`error`);return}if(n.status===401||n.status===403)return z.logout();let r=await n.json();if(Array.isArray(r)){R=r;let e=r.filter(e=>(e.status===`Verificado`||e.status===`Ativo`)&&(e.diasRestantes===null||e.diasRestantes>=0)),t=r.filter(e=>e.status===`Pendente`||e.status===`Aguardando Ativação`||e.status===`Aguardando`||typeof e.diasRestantes==`number`&&e.diasRestantes>=0&&e.diasRestantes<=5),n=r.filter(e=>e.status===`Bloqueado`||e.plano===`Bloqueado`||typeof e.diasRestantes==`number`&&e.diasRestantes<0),i={Essencial:97,Profissional:147,Premium:297},a=0;e.forEach(e=>{i[e.plano]&&(a+=i[e.plano])}),document.getElementById(`kpi-total`).innerText=r.length,document.getElementById(`kpi-ativas`).innerText=e.length,document.getElementById(`kpi-pendentes`).innerText=t.length,document.getElementById(`kpi-bloqueados`).innerText=n.length;let o=document.getElementById(`kpi-mrr`);o&&(o.innerText=`R$ ${a.toLocaleString(`pt-BR`)}`);let s=document.getElementById(`busca-tabela-escolas`)?document.getElementById(`busca-tabela-escolas`):document.getElementById(`pesquisa-admin`);s&&(s.value=``);let c=document.getElementById(`etiqueta-filtro-ativo`);c&&(c.style.display=`none`),z.desenharTabela(R),z.carregarNotificacoes()}}catch(e){console.error(`🚨 Erro no carregarDados:`,e),z.showToast(`Erro de comunicação: O servidor não está a responder.`,`error`)}},filtrarPorKPI:e=>{let t=document.getElementById(`etiqueta-filtro-ativo`);if(e===`TODOS`)return t&&(t.style.display=`none`),z.desenharTabela(R);let n=[],r=``;e===`ATIVOS`?(r=`Ativos em Dia`,n=R.filter(e=>(e.status===`Verificado`||e.status===`Ativo`)&&(e.diasRestantes===null||e.diasRestantes>=0))):e===`PENDENTES`?(r=`Pendentes / A Vencer (≤ 5d)`,n=R.filter(e=>e.status===`Pendente`||e.status===`Aguardando Ativação`||e.status===`Aguardando`||typeof e.diasRestantes==`number`&&e.diasRestantes>=0&&e.diasRestantes<=5)):e===`BLOQUEADOS`?(r=`Bloqueados / Vencidos`,n=R.filter(e=>e.status===`Bloqueado`||e.plano===`Bloqueado`||typeof e.diasRestantes==`number`&&e.diasRestantes<0)):e===`UPSELL`&&(r=`Oportunidades de Upgrade`,n=R.filter(e=>{let t=e.plano===`Essencial`?20:e.plano===`Profissional`?80:0;return t>0&&(e.alunosAtivos||0)>=t*.75||e.plano===`Teste`})),t&&(t.innerText=`Filtro: ${r} (${n.length}) ✖`,t.style.display=`inline-block`),z.desenharTabela(n)},toggleNotificacoes:()=>{let e=document.getElementById(`dropdown-notificacoes`);e.style.display===`none`||e.style.display===``?(e.style.display=`block`,e.style.animation=`fadeIn 0.2s ease`):e.style.display=`none`},carregarNotificacoes:async()=>{let e=sessionStorage.getItem(`token_master`);try{let t=await fetch(`${L}/master/notificacoes?t=${new Date().getTime()}`,{headers:{Authorization:`Bearer ${e}`},cache:`no-store`});if(t.ok){let e=await t.json(),n=document.getElementById(`badge-notificacao`),r=document.getElementById(`lista-notificacoes`);e.length>0?(n.innerText=e.length,n.style.display=`block`,r.innerHTML=e.map(e=>{let t=`🔔`,n=`#94a3b8`,r=`transparent`;return e.tipo===`perigo`&&(t=`🚨`,n=`var(--danger)`,r=`rgba(239, 68, 68, 0.05)`),e.tipo===`aviso`&&(t=`⚠️`,n=`var(--warning)`,r=`rgba(245, 158, 11, 0.05)`),e.tipo===`info`&&(t=`💡`,n=`#3b82f6`,r=`rgba(59, 130, 246, 0.05)`),`
                        <div style="padding: 15px; border-bottom: 1px solid #334155; display: flex; gap: 15px; align-items: start; background: ${r}; transition: 0.2s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='${r}'">
                            <span style="font-size: 20px;">${t}</span>
                            <div>
                                <div style="color: ${n}; font-size: 13px; font-weight: bold; margin-bottom: 4px;">${e.titulo}</div>
                                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">${e.mensagem}</div>
                            </div>
                        </div>`}).join(``)):(n.style.display=`none`,r.innerHTML=`
                    <div style="padding: 30px 20px; text-align: center;">
                        <div style="font-size: 30px; margin-bottom: 10px;">🎉</div>
                        <div style="color: #94a3b8; font-size: 13px;">Tudo tranquilo!<br>Nenhum alerta no momento.</div>
                    </div>`)}}catch(e){console.error(`Erro ao carregar notificações`,e)}},desenharTabela:e=>{let t=document.getElementById(`tabela-clientes`);if(t.innerHTML=``,!e||e.length===0){t.innerHTML=`<tr><td colspan="4" style="padding:20px; text-align:center; color:#64748b;">Nenhuma escola encontrada.</td></tr>`;return}e.forEach(e=>{try{let n=(e.email?e.email:``).trim().toLowerCase(),r=z.escapeHTML(n),i=e.nomeEscola?z.escapeHTML(e.nomeEscola):``,a=z.escapeJS(n),o=e.pinAtivacao?z.escapeJS(e.pinAtivacao):``,s=z.escapeHTML(e.status?e.status:`Pendente`),c=s===`Bloqueado`||e.plano===`Bloqueado`,l=typeof e.diasRestantes==`number`&&e.diasRestantes<0,u=typeof e.diasRestantes==`number`&&e.diasRestantes>=0&&e.diasRestantes<=5,d=`color:var(--warning); background:rgba(245, 158, 11, 0.2);`;(s===`Verificado`||s===`Ativo`)&&!c&&!l?d=`color:var(--success); background:rgba(16, 185, 129, 0.2);`:(c||l)&&(d=`color:var(--danger); background:rgba(239, 68, 68, 0.2);`);let f=``;f=c?`<span style="color:var(--danger); font-weight:bold;">🚫 BLOQUEADO</span>`:o?`<span style="font-weight:bold; letter-spacing: 1px; color:#38bdf8;" title="PIN aguardando uso">${z.escapeHTML(e.pinAtivacao)}</span>`:s===`Verificado`||s===`Ativo`?`<span style="color:var(--success); font-weight:bold;">✅ ATIVO</span>`:`<span style="color:#f59e0b; font-weight:bold; font-size:11px;">⚠️ AGUARDANDO PIN</span>`;let p=e.plano?e.plano:`Pendente`;if(p===`Aguardando`||p===`Pendente`)if(e.pinAtivacao){let t=String(e.pinAtivacao).toUpperCase();p=t.includes(`PRE`)?`Premium`:t.includes(`PRO`)?`Profissional`:t.includes(`ESS`)?`Essencial`:t.includes(`TES`)?`Teste`:`Liberado`}else p=`Pendente`;let m=z.escapeJS(p===`Bloqueado`?`Profissional`:p),h=`bg-gray`,g=p;p===`Essencial`?h=`plan-essencial`:p===`Profissional`?h=`plan-profissional`:p===`Premium`?h=`plan-premium`:p===`Liberado`&&(h=`plan-liberado`,g=`💎 Liberado`);let _=e.alunosAtivos||0,v=e.equipaAtiva||1,y=p===`Essencial`?20:p===`Profissional`?80:`∞`,b=`
                    <div style="font-size:11px; color:#94a3b8; margin-top:5px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                        <span>👨‍🎓 <b>${_}/${y}</b> alunos</span>
                        <span>👥 <b>${v}</b> equipa</span>
                        ${y!==`∞`&&_>=y*.8?`<span style="color:#f59e0b; font-weight:bold;" title="Escola perto do limite! Ótimo momento para oferecer Upgrade.">🔥 Quase cheio!</span>`:``}
                    </div>
                `,x=``;if(e.dataExpiracao&&!c){let t=new Date(e.dataExpiracao).toLocaleDateString(`pt-BR`);typeof e.diasRestantes==`number`&&(x=e.diasRestantes<0?`<div style="font-size:11px; color:#ef4444; margin-top:4px; font-weight:bold;">🚨 Venceu há ${Math.abs(e.diasRestantes)}d (${t})</div>`:e.diasRestantes<=5?`<div style="font-size:11px; color:#f59e0b; margin-top:4px; font-weight:bold;">⏳ Vence em ${e.diasRestantes}d (${t})</div>`:`<div style="font-size:11px; color:#94a3b8; margin-top:4px;">📅 ${e.diasRestantes}d restantes (${t})</div>`)}let S=``;if(o){let e=`https://wa.me/?text=${encodeURIComponent(`Olá! O seu PIN de acesso ao sistema escolar é: `+o)}`;S+=`
                        <button onclick="Admin.abrirModalMudarPlano('${a}', '${m}')" style="background:var(--warning); color:#0f172a; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; cursor:pointer; transition:0.2s;">🔄 Plano</button>
                        <button onclick="window.open('${e}', '_blank')" style="background:#25D366; color:white; border:none; cursor:pointer; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;">💬 Zap</button>
                        <button onclick="Admin.copiarAcesso('${a}', '${o}', '${m===`Liberado`?`VIP`:m}')" style="background:#475569; color:white; border:none; cursor:pointer; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;">📋 Copiar</button>
                    `}else S+=`
                        <button onclick="Admin.abrirModalMudarPlano('${a}', '${m}')" style="background:var(--warning); color:#0f172a; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; cursor:pointer; transition:0.2s;">🔄 Plano / Renovar</button>
                    `;if(u||l){let t=l?`Olá! Notámos que a assinatura do plano *${p}* da sua escola (${n}) venceu. Deseja renovar agora para manter o acesso ativo?`:`Olá! Passando para lembrar que a assinatura do plano *${p}* da sua escola (${n}) vence em *${e.diasRestantes} dia(s)*. Se desejar renovar antecipadamente, os novos dias são somados sem perder nenhum dia atual!`,r=`https://wa.me/?text=${encodeURIComponent(t)}`;S+=`
                        <button onclick="window.open('${r}', '_blank')" style="background:#0ea5e9; color:white; border:none; padding:8px 11px; cursor:pointer; border-radius:5px; font-size:12px; font-weight:bold; margin-right:5px; transition:0.2s;" title="Enviar lembrete amigável de renovação no WhatsApp">📲 Lembrar</button>
                    `}c||l?S+=`
                        <button onclick="Admin.desbloquear('${a}')" style="background:#10b981; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; font-weight:bold; margin-right:5px; transition:0.2s;" title="Reativar acesso imediatamente (+30 dias se estiver vencido)">🔓 Reativar</button>
                    `:S+=`
                        <button onclick="Admin.bloquear('${a}')" style="background:var(--danger); color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; transition:0.2s;">🚫 Bloq</button>
                    `,S+=`
                    <button onclick="Admin.excluir('${a}')" style="background:#000000; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; transition:0.2s; margin-left: 5px;">🗑️ Excluir</button>
                `;let C=document.createElement(`tr`);C.style.borderBottom=`1px solid #334155`,C.style.transition=`background 0.2s`,C.onmouseover=()=>C.style.background=`#1e293b`,C.onmouseout=()=>C.style.background=`transparent`,C.innerHTML=`
                    <td style="padding:15px; max-width: 260px; word-break: break-all; white-space: normal;">
                        ${i?`<div style="font-weight:700; color:#f8fafc; font-size:14px; margin-bottom:2px;">🏫 ${i}</div>`:``}
                        <div style="font-weight:600; color:${i?`#94a3b8`:`#ffffff`}; font-size:${i?`12px`:`14px`};">${r}</div>
                        ${b}
                    </td>
                    <td style="padding:15px;">
                        <span class="${h}">${z.escapeHTML(g)}</span>${x}
                    </td>
                    <td style="padding:15px; font-family:monospace;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; ${d}">${l&&!c?`VENCIDO`:s}</span>
                            ${f}
                        </div>
                    </td>
                    <td style="padding:15px; text-align:right; white-space: nowrap;">${S}</td>
                `,t.appendChild(C)}catch(t){console.error(`🚨 ERRO AO DESENHAR A LINHA:`,e.email,t)}})},filtrarTabela:e=>{if(!e||e.trim()===``){z.desenharTabela(R);return}let t=e.toLowerCase().trim(),n=R.filter(e=>{let n=e.email?String(e.email).toLowerCase():``,r=e.nomeEscola?String(e.nomeEscola).toLowerCase():``,i=e.plano?String(e.plano).toLowerCase():``,a=e.status?String(e.status).toLowerCase():``,o=e.pinAtivacao?String(e.pinAtivacao).toLowerCase():``;return n.includes(t)||r.includes(t)||i.includes(t)||a.includes(t)||o.includes(t)});z.desenharTabela(n)},abrirModalMudarPlano:(e,t)=>{document.getElementById(`mp-email`).value=e;let n=document.getElementById(`mp-plano`);for(let e=0;e<n.options.length;e++)n.options[e].value===t&&(n.selectedIndex=e);z.ajustarDiasPadrao(`mp`),document.getElementById(`modal-mudar-plano`).style.display=`flex`},fecharModalMudarPlano:()=>{document.getElementById(`modal-mudar-plano`).style.display=`none`},confirmarMudancaPlano:async()=>{let e=document.getElementById(`mp-email`).value.trim().toLowerCase(),t=document.getElementById(`mp-plano`).value,n=document.getElementById(`mp-dias`)?document.getElementById(`mp-dias`).value:30,r=document.getElementById(`mp-modo`)?document.getElementById(`mp-modo`).value:`direto`,i=sessionStorage.getItem(`token_master`),a=document.getElementById(`btn-confirmar-mp`);a.innerText=`A atualizar... ⏳`,a.disabled=!0;try{let a=await(await fetch(`${L}/master/gerar-pin`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${i}`},body:JSON.stringify({email:e,plano:t,diasValidade:n,modoAtivacao:r})})).json();a.success?(a.modo===`direto`?z.showToast(`⚡ Plano ${t} ativado diretamente (+${n}d) e e-mail enviado!`,`success`):z.showToast(`🔑 Novo PIN gerado (${a.pin}) e enviado por e-mail!`,`success`),z.fecharModalMudarPlano(),z.carregarDados()):z.showToast(a.error?a.error:`Erro ao atualizar plano.`,`error`)}catch{z.showToast(`Erro de comunicação com o servidor.`,`error`)}finally{a.innerText=`Confirmar`,a.disabled=!1}},abrirModalVip:()=>{document.getElementById(`vip-email`).value=``,document.getElementById(`vip-zap`).value=``,document.getElementById(`vip-plano`).value=`Essencial`,document.getElementById(`vip-dias`)&&(document.getElementById(`vip-dias`).value=`30`),document.getElementById(`vip-form-area`).style.display=`block`,document.getElementById(`vip-result-area`).style.display=`none`,document.getElementById(`modal-vip`).style.display=`flex`},fecharModalVip:()=>{document.getElementById(`modal-vip`).style.display=`none`},gerarAcessoVip:async()=>{let e=document.getElementById(`vip-email`).value.trim().toLowerCase(),t=document.getElementById(`vip-zap`).value.replace(/\D/g,``),n=document.getElementById(`vip-plano`).value,r=document.getElementById(`vip-dias`)?document.getElementById(`vip-dias`).value:n===`Teste`?7:30;if(!e)return z.showToast(`E-mail é obrigatório!`,`error`);let i=document.getElementById(`btn-gerar-vip`);i.innerText=`A processar... ⏳`,i.disabled=!0;let a=sessionStorage.getItem(`token_master`);try{let i=await(await fetch(`${L}/master/gerar-pin`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${a}`},body:JSON.stringify({email:e,plano:n,diasValidade:r,modoAtivacao:`pin`})})).json();if(i.success){let a=i.pin,o=window.location.origin+window.location.pathname.replace(`admin.html`,`index.html`),s=`Olá! A sua conta VIP foi criada no plano *${n.toUpperCase()}* (${r} dias) 🚀\n\n*Para ativar o seu sistema agora mesmo:* \n1. Aceda ao portal: ${o}\n2. Clique em "Nova Instituição" e coloque o seu e-mail: *${e}*\n3. O sistema enviará um código de segurança rápido para o seu e-mail.\n4. Insira esse código junto com o seu PIN de Ativação VIP: ${a}\n\nPronto! O seu sistema será destravado automaticamente. Boas vendas!`,c=t?`https://wa.me/${t.length<=11?`55`+t:t}?text=${encodeURIComponent(s)}`:`https://wa.me/?text=${encodeURIComponent(s)}`;document.getElementById(`vip-pin-display`).innerText=a,document.getElementById(`vip-zap-link`).href=c,document.getElementById(`vip-form-area`).style.display=`none`,document.getElementById(`vip-result-area`).style.display=`block`,z.showToast(`Acesso VIP gerado e enviado por e-mail!`,`success`),z.carregarDados()}else z.showToast(i.error?i.error:`Erro ao gerar PIN da API.`,`error`)}catch{z.showToast(`Erro de comunicação com o servidor.`,`error`)}finally{i.innerText=`Gerar PIN e Enviar por E-mail`,i.disabled=!1}},copiarAcesso:(e,t,n)=>{let r=window.location.origin+window.location.pathname.replace(`admin.html`,`index.html`),i=`Olá! A sua conta foi atualizada para o plano *${n.toUpperCase()}* 🚀\n\n*Para ativar:* \n1. Aceda a: ${r}\n2. Vá ao menu "💎 Meu Plano"\n3. Insira o PIN Exclusivo: ${t}\n\nQualquer dúvida, estamos à disposição!`;if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(i).then(()=>{z.showToast(`Copiado! Só colar no WhatsApp do cliente.`,`success`)}).catch(()=>{z.showToast(`Erro ao copiar.`,`error`)});else{let e=document.createElement(`textarea`);e.value=i,e.style.position=`fixed`,e.style.top=`0`,e.style.left=`-9999px`,document.body.appendChild(e),e.focus(),e.select();try{document.execCommand(`copy`),z.showToast(`Copiado! Só colar no WhatsApp do cliente.`,`success`)}catch{z.showToast(`Erro ao copiar. Use o botão do WhatsApp.`,`error`)}document.body.removeChild(e)}},bloquear:async e=>{if(!confirm(`Tem a certeza que deseja bloquear o acesso de ${e}?`))return;let t=sessionStorage.getItem(`token_master`);try{(await(await fetch(`${L}/master/bloquear`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${t}`},body:JSON.stringify({email:e.trim().toLowerCase()})})).json()).success&&(z.showToast(`Conta bloqueada.`,`success`),z.carregarDados())}catch{z.showToast(`Erro ao bloquear.`,`error`)}},desbloquear:async e=>{if(!confirm(`Deseja reativar imediatamente o acesso de ${e}? (Se estiver vencido, receberá +30 dias automaticamente).`))return;let t=sessionStorage.getItem(`token_master`);try{let n=await(await fetch(`${L}/master/desbloquear`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${t}`},body:JSON.stringify({email:e.trim().toLowerCase(),diasExtras:30})})).json();n.success?(z.showToast(`🔓 Conta reativada no plano ${n.plano}!`,`success`),z.carregarDados()):z.showToast(n.error?n.error:`Erro ao reativar conta.`,`error`)}catch{z.showToast(`Erro ao comunicar com o servidor.`,`error`)}},abrirModalExcluir:e=>{document.getElementById(`excluir-email`).value=e,document.getElementById(`excluir-email-display`).innerText=e,document.getElementById(`input-confirmar-exclusao`).value=``,document.getElementById(`modal-excluir`).style.display=`flex`},fecharModalExcluir:()=>{document.getElementById(`modal-excluir`).style.display=`none`},excluir:e=>{z.abrirModalExcluir(e)},confirmarExclusao:async()=>{let e=document.getElementById(`excluir-email`).value;if(document.getElementById(`input-confirmar-exclusao`).value.trim().toUpperCase()!==`EXCLUIR`)return z.showToast(`Palavra de segurança incorreta. Digite EXCLUIR.`,`warning`);let t=sessionStorage.getItem(`token_master`),n=document.getElementById(`btn-confirmar-exclusao`);n.innerText=`Apagando... ⏳`,n.disabled=!0;try{let n=await(await fetch(`${L}/master/excluir-conta`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${t}`},body:JSON.stringify({email:e})})).json();n.success?(z.showToast(`Conta obliterada com sucesso!`,`success`),z.fecharModalExcluir(),z.carregarDados()):z.showToast(n.error?n.error:`Erro ao excluir conta.`,`error`)}catch{z.showToast(`Erro crítico de comunicação com o servidor.`,`error`)}finally{n.innerText=`Apagar Tudo`,n.disabled=!1}}};document.addEventListener(`DOMContentLoaded`,z.init),window.Admin=z,window.App=window.App||{};var B=window.App,V=e=>{let t=document.getElementById(e);return t?t.value.trim():``},H=e=>{let t=document.getElementById(e);if(!t||!t.value)return 0;let n=parseFloat(t.value);return isNaN(n)?0:n};B.verificarMaioridade=()=>{let e=document.getElementById(`alu-nasc`),t=document.getElementById(`box-responsavel`);if(!e||!t)return;if(!e.value){t.style.display=`none`;return}let n=new Date,r=new Date(e.value),i=n.getFullYear()-r.getFullYear(),a=n.getMonth()-r.getMonth();(a<0||a===0&&n.getDate()<r.getDate())&&i--,i<18?(t.style.display=`block`,t.style.animation=`fadeIn 0.5s`):t.style.display=`none`},B.atualizarDisplayDias=()=>{let e=document.querySelectorAll(`.turma-dia-chk:checked`),t=Array.from(e).map(e=>e.value),n=document.getElementById(`tur-dia-display`);n&&(n.innerText=t.length>0?t.join(`, `):`-- Selecione os dias --`)},document.addEventListener(`click`,function(e){let t=document.getElementById(`tur-dia-wrapper`),n=document.getElementById(`tur-dia-options`);n&&t&&!t.contains(e.target)&&(n.style.display=`none`)}),B.abrirModalCadastroModulo=async(e,t)=>{B.entidadeAtual=e,B.idEdicao=t;let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`);let r=document.getElementById(`modal-titulo`),i=document.getElementById(`modal-form-content`);r&&(r.innerText=t?`Editar ${e.charAt(0).toUpperCase()+e.slice(1)}`:`Novo ${e.charAt(0).toUpperCase()+e.slice(1)}`),i&&(i.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando formulário... ⏳</p>`);let a={},o={cursos:[],turmas:[]};try{if(t){let n=e===`financeiro`?`financeiro`:e+`s`;a=await B.api(`/${n}/${t}`)}if(e===`aluno`||e===`turma`){let[e,t]=await Promise.all([B.api(`/cursos`),B.api(`/turmas`)]);o.cursos=Array.isArray(e)?e:[],o.turmas=Array.isArray(t)?t:[]}let n=B.UI,r=``;if(e===`aluno`){let e=o.turmas.length>0?`<option value="">-- Selecione a Turma --</option>`+o.turmas.map(e=>`<option value="${e.nome}" ${a.turma===e.nome?`selected`:``}>${B.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre uma Turma Primeiro --</option>`,t=o.cursos.length>0?`<option value="">-- Selecione o Curso --</option>`+o.cursos.map(e=>`<option value="${e.nome}" ${a.curso===e.nome?`selected`:``}>${B.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre um Curso Primeiro --</option>`;r=`
                <h4 style="margin: 0 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; color:#2c3e50;">1. Dados Pessoais</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`Nome Completo *`,`alu-nome`,a.nome)}
                    ${n.input(`E-mail`,`alu-email`,a.email,`email@exemplo.com`,`email`)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`WhatsApp *`,`alu-zap`,a.whatsapp,`(00) 00000-0000`,`text`,`oninput="App.mascaraCelular(this)"`)}
                    ${n.input(`CPF`,`alu-cpf`,a.cpf,`000.000.000-00`,`text`,`oninput="App.mascaraCPF(this)"`)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`RG`,`alu-rg`,a.rg,`00.000.000-0`,`text`)}
                    ${n.input(`Data de Nascimento`,`alu-nasc`,a.nascimento,``,`date`,`onchange="App.verificarMaioridade()" onblur="App.verificarMaioridade()"`)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                    <div class="input-group">
                        <label>Sexo</label>
                        <select id="alu-sexo">
                            <option value="">-- Selecione --</option>
                            <option value="Masculino" ${a.sexo===`Masculino`?`selected`:``}>Masculino</option>
                            <option value="Feminino" ${a.sexo===`Feminino`?`selected`:``}>Feminino</option>
                        </select>
                    </div>
                    ${n.input(`Profissão / Ocupação`,`alu-prof`,a.profissao,`Ex: Estudante`)}
                </div>

                <div id="box-responsavel" style="display: none; background: #fff3e0; padding: 15px; border-radius: 8px; border: 1px dashed #e67e22; margin-bottom: 20px;">
                    <h4 style="margin-top: 0; color: #d35400; margin-bottom: 10px;">👤 Dados do Responsável Legal (Menor de Idade)</h4>
                    <div style="display:grid; grid-template-columns:2fr 1fr; gap:15px; margin-bottom:10px;">
                        ${n.input(`Nome do Responsável`,`alu-resp-nome`,a.resp_nome,`Ex: Maria da Silva`)}
                        <div class="input-group">
                            <label>Grau de Parentesco</label>
                            <select id="alu-resp-parentesco">
                                <option value="">-- Selecione --</option>
                                <option value="Pai" ${a.resp_parentesco===`Pai`?`selected`:``}>Pai</option>
                                <option value="Mãe" ${a.resp_parentesco===`Mãe`?`selected`:``}>Mãe</option>
                                <option value="Avô/Avó" ${a.resp_parentesco===`Avô/Avó`?`selected`:``}>Avô/Avó</option>
                                <option value="Tio/Tia" ${a.resp_parentesco===`Tio/Tia`?`selected`:``}>Tio/Tia</option>
                                <option value="Outro" ${a.resp_parentesco===`Outro`?`selected`:``}>Outro</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        ${n.input(`CPF do Responsável`,`alu-resp-cpf`,a.resp_cpf,`000.000.000-00`,`text`,`oninput="App.mascaraCPF(this)"`)}
                        ${n.input(`WhatsApp do Responsável`,`alu-resp-zap`,a.resp_zap,`(00) 00000-0000`,`text`,`oninput="App.mascaraCelular(this)"`)}
                    </div>
                </div>

                <h4 style="margin: 0 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; color:#2c3e50;">2. Endereço Completo</h4>
                <div style="display:grid; grid-template-columns:2fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`Logradouro (Rua/Av)`,`alu-rua`,a.rua,`Ex: Rua das Flores`)}
                    ${n.input(`Número`,`alu-num`,a.numero,`123`,`text`)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`Bairro`,`alu-bairro`,a.bairro)}
                    ${n.input(`Cidade`,`alu-cidade`,a.cidade)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                    ${n.input(`Estado (UF)`,`alu-uf`,a.estado,`Ex: SP`,`text`,`maxlength="2"`)}
                    ${n.input(`País`,`alu-pais`,a.pais||`Brasil`)}
                </div>

                <h4 style="margin: 0 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; color:#2c3e50;">3. Matrícula</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="input-group"><label>Turma / Horário</label><select id="alu-turma">${e}</select></div>
                    <div class="input-group"><label>Curso Vinculado</label><select id="alu-curso">${t}</select></div>
                </div>
                <div class="input-group">
                    <label>Status de Matrícula</label>
                    <select id="alu-status">
                        <option value="Ativo" ${!a.status||a.status===`Ativo`?`selected`:``}>🟢 Ativo (Estudando)</option>
                        <option value="Trancado" ${a.status===`Trancado`?`selected`:``}>🟡 Trancado (Matrícula Pausada)</option>
                        <option value="Cancelado" ${a.status===`Cancelado`?`selected`:``}>🔴 Cancelado (Desistente)</option>
                    </select>
                </div>
            `}else if(e===`turma`){let e=o.cursos.length>0?`<option value="">-- Sem Curso Específico --</option>`+o.cursos.map(e=>`<option value="${e.nome}" ${a.curso===e.nome?`selected`:``}>${B.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre um Curso Primeiro --</option>`,t=a.dia?a.dia.split(`,`).map(e=>e.trim()):[],i=e=>`
                <label style="display:flex; align-items:center; gap:8px; padding:10px; cursor:pointer; border-bottom:1px solid #f0f0f0; margin:0; transition: background 0.2s;" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" class="turma-dia-chk" value="${e}" ${t.includes(e)?`checked`:``} onchange="App.atualizarDisplayDias()">
                    <span style="font-weight: normal;">${e}</span>
                </label>
            `;r=`
                <div class="input-group">${n.input(`Nome da Turma *`,`tur-nome`,a.nome,`Ex: Inglês Kids T1`)}</div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="input-group" id="tur-dia-wrapper" style="position: relative;">
                        <label>Dia(s) da Aula</label>
                        <div id="tur-dia-display" 
                             style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: #fff url('data:image/svg+xml;utf8,<svg fill=%22%23333%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>') no-repeat right 10px center; cursor: pointer; min-height: 41px; display: flex; align-items: center; padding-right: 30px; font-size: 14px; box-sizing: border-box;" 
                             onclick="const opt = document.getElementById('tur-dia-options'); opt.style.display = opt.style.display === 'block' ? 'none' : 'block';">
                            ${t.length>0?t.join(`, `):`-- Selecione os dias --`}
                        </div>
                        <div id="tur-dia-options" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #ccc; border-radius: 5px; z-index: 999; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 2px;">
                            ${i(`Segunda-feira`)}
                            ${i(`Terça-feira`)}
                            ${i(`Quarta-feira`)}
                            ${i(`Quinta-feira`)}
                            ${i(`Sexta-feira`)}
                            ${i(`Sábado`)}
                            ${i(`Diversos (Flexível)`)}
                        </div>
                    </div>
                    ${n.input(`Horário`,`tur-hora`,a.horario,`Ex: 14:00 às 16:00`)}
                </div>

                <div class="input-group"><label>Curso Padrão desta Turma</label><select id="tur-curso">${e}</select></div>
            `}else e===`curso`?r=`
                <div class="input-group">${n.input(`Nome do Curso *`,`cur-nome`,a.nome,`Ex: Informática Essencial`)}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`Carga Horária (Horas)`,`cur-carga`,a.carga,`Ex: 80`,`number`)}
                    ${n.input(`Valor Padrão (Mensalidade) R$`,`cur-valor`,a.valor||`0.00`,`0.00`,`number`)}
                </div>
                <div class="input-group"><label>Descrição Breve</label><textarea id="cur-desc" rows="3" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;">${a.descricao||``}</textarea></div>
            `:e===`estoque`&&(r=`
                <div class="input-group">${n.input(`Nome do Produto/Serviço *`,`est-nome`,a.nome,`Ex: Apostila Módulo 1`)}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`Código / SKU`,`est-codigo`,a.codigo,`Ex: APOST01`)}
                    ${n.input(`Valor de Venda (R$)`,`est-valor`,a.valor||`0.00`,`0.00`,`number`)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${n.input(`Quantidade Atual`,`est-qtd`,a.quantidade||`0`,`0`,`number`)}
                    ${n.input(`Alerta de Mínimo`,`est-min`,a.quantidadeMinima||`5`,`5`,`number`)}
                </div>
                <div class="input-group"><label>Observações</label><textarea id="est-obs" rows="2" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;">${a.obs||``}</textarea></div>
            `);i&&(i.innerHTML=r,e===`aluno`&&setTimeout(()=>B.verificarMaioridade(),100));let s=document.querySelector(`.btn-confirm`);s&&(s.setAttribute(`onclick`,`App.salvarCadastro()`),s.innerHTML=`💾 Salvar Registro`)}catch(e){console.error(`Erro no formulário:`,e),i&&(i.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o formulário. Verifique a internet.</p>`)}},B.salvarCadastro=async()=>{let e=B.entidadeAtual,t=e===`financeiro`?`financeiro`:e+`s`,n={},r=document.querySelector(`.btn-confirm`),i=r?r.innerText:`Salvar`;r&&(r.innerText=`Salvando... ⏳`,r.disabled=!0),document.body.style.cursor=`wait`;try{if(e===`aluno`){n.nome=V(`alu-nome`),n.email=V(`alu-email`),n.whatsapp=V(`alu-zap`),n.cpf=V(`alu-cpf`),n.rg=V(`alu-rg`),n.nascimento=V(`alu-nasc`),n.sexo=V(`alu-sexo`),n.profissao=V(`alu-prof`),n.rua=V(`alu-rua`),n.numero=V(`alu-num`),n.bairro=V(`alu-bairro`),n.cidade=V(`alu-cidade`),n.estado=V(`alu-uf`),n.pais=V(`alu-pais`),n.turma=V(`alu-turma`),n.curso=V(`alu-curso`),n.status=V(`alu-status`)||`Ativo`;let e=document.getElementById(`box-responsavel`);if(e&&e.style.display!==`none`?(n.resp_nome=V(`alu-resp-nome`),n.resp_parentesco=V(`alu-resp-parentesco`),n.resp_cpf=V(`alu-resp-cpf`),n.resp_zap=V(`alu-resp-zap`)):(n.resp_nome=``,n.resp_parentesco=``,n.resp_cpf=``,n.resp_zap=``),!n.nome||!n.whatsapp)throw B.showToast(`Nome e WhatsApp são obrigatórios!`,`error`),Error(`Validação Falhou`)}else if(e===`turma`){n.nome=V(`tur-nome`),n.horario=V(`tur-hora`),n.curso=V(`tur-curso`);let e=document.querySelectorAll(`.turma-dia-chk:checked`);if(n.dia=Array.from(e).map(e=>e.value).join(`, `),!n.nome)throw B.showToast(`O nome da turma é obrigatório!`,`error`),Error(`Validação Falhou`)}else if(e===`curso`){if(n.nome=V(`cur-nome`),n.carga=V(`cur-carga`),n.valor=H(`cur-valor`),n.descricao=V(`cur-desc`),!n.nome)throw B.showToast(`O nome do curso é obrigatório!`,`error`),Error(`Validação Falhou`)}else if(e===`estoque`&&(n.nome=V(`est-nome`),n.codigo=V(`est-codigo`),n.obs=V(`est-obs`),n.valor=H(`est-valor`),n.quantidade=parseInt(V(`est-qtd`))||0,n.quantidadeMinima=parseInt(V(`est-min`))||0,!n.nome))throw B.showToast(`O nome do item é obrigatório!`,`error`),Error(`Validação Falhou`);let r=B.idEdicao?`/${t}/${B.idEdicao}`:`/${t}`,i=B.idEdicao?`PUT`:`POST`,a=await B.api(r,i,n);if(!a||a.error)throw Error(a?a.error:`Erro de comunicação com a API`);B.showToast(`Registo salvo com sucesso! 🎉`,`success`),B.fecharModal();let o=document.getElementById(`app-content`);o&&(o.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),typeof B.renderizarLista==`function`?await B.renderizarLista(e):typeof B.renderizarInicio==`function`&&await B.renderizarInicio()}catch(e){e.message!==`Validação Falhou`&&(B.showToast(e.message||`Ocorreu um erro ao salvar.`,`error`),console.error(`Erro completo:`,e))}finally{r&&(r.innerText=i,r.disabled=!1),document.body.style.cursor=`default`}},B.toggleCheckCadastros=e=>{document.querySelectorAll(`.chk-cadastro`).forEach(t=>t.checked=e.checked)},B.excluirEmLoteCadastros=e=>{let t=document.querySelectorAll(`.chk-cadastro:checked`);if(t.length===0)return B.showToast(`Selecione pelo menos um registo para excluir.`,`warning`);let n=e===`financeiro`?`financeiro`:e+`s`,r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`);let i=document.getElementById(`modal-titulo`),a=document.getElementById(`modal-form-content`),o=document.querySelector(`.btn-confirm`);i&&(i.innerText=`Excluir Registos (${t.length} itens)`);let s=`
        <div style="text-align:center; padding:10px 10px 20px 10px;">
            <div style="font-size:55px; margin-bottom:10px; animation: scaleIn 0.3s ease-out;">🗑️</div>
            <h3 style="color:#2c3e50; margin-bottom:15px; font-size:22px;">Tem a certeza absoluta?</h3>
            <p style="color:#555; font-size:15px; margin-bottom:10px; line-height:1.5;">
                Está prestes a <b>excluir permanentemente</b> <br>
                <span style="display:inline-block; margin-top:10px; background:#c0392b; color:white; padding:5px 15px; border-radius:20px; font-weight:bold; font-size:16px;">${t.length} item(ns)</span> selecionado(s).
            </p>
            <div style="background:#fdf2f2; border:1px solid #fadbd8; border-left:4px solid #c0392b; padding:12px; border-radius:6px; color:#c0392b; font-size:13px; text-align:left; margin-top:20px;">
                <b>⚠️ ATENÇÃO:</b> Esta ação é irreversível. Os dados apagados não poderão ser recuperados do sistema.
            </div>
        </div>
        <style>@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }</style>
    `;if(a&&(a.innerHTML=s),o){o.innerText=`SIM, EXCLUIR 🗑️`,o.style.background=`#c0392b`;let r=o.cloneNode(!0);o.parentNode.replaceChild(r,o),r.onclick=async()=>{let i=r.innerText;r.innerText=`A excluir... ⏳`,r.disabled=!0,document.body.style.cursor=`wait`;try{let r=Array.from(t).map(e=>B.api(`/${n}/${e.value}`,`DELETE`));await Promise.all(r),B.showToast(`Registos excluídos com sucesso!`,`success`),B.fecharModal();let i=document.getElementById(`app-content`);i&&(i.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),await B.renderizarLista(e)}catch{B.showToast(`Erro ao processar exclusão.`,`error`),r.innerText=i,r.disabled=!1}finally{document.body.style.cursor=`default`,setTimeout(()=>{r&&(r.style.background=``)},500)}}}},B.abrirFichaAluno=async e=>{let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`),i=document.querySelector(`.btn-confirm`);n&&(n.innerText=`Ficha do Aluno`),r&&(r.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">A carregar ficha completa... ⏳</p>`),i&&(i.style.display=`none`);try{let t=await B.api(`/alunos/${e}`),n=e=>e?B.escapeHTML(e):`<span style="color:#aaa;">Não informado</span>`,i=t.status===`Cancelado`?`#e74c3c`:t.status===`Trancado`?`#f39c12`:`#27ae60`;r.innerHTML=`
            <div style="padding: 5px;">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; border-bottom:2px solid #eee; padding-bottom:15px;">
                    <div style="font-size:35px; background:#f4f6f7; width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:2px solid #bdc3c7;">🎓</div>
                    <div>
                        <h2 style="margin:0; color:#2c3e50; font-size:20px;">${n(t.nome)}</h2>
                        <div style="margin-top:4px;">
                            <span style="background:${i}20; color:${i}; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; border: 1px solid ${i}50;">${n(t.status||`Ativo`)}</span>
                            <span style="color:#7f8c8d; font-size:12px; margin-left:10px;"><b>Matrícula:</b> ${t.id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">📞 Contactos</h4>
                        <div style="font-size:13px; color:#555; line-height:1.6;">
                            <div><b>WhatsApp:</b> ${n(t.whatsapp)}</div>
                            <div><b>E-mail:</b> ${n(t.email)}</div>
                        </div>
                    </div>
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">🏫 Turma / Curso</h4>
                        <div style="font-size:13px; color:#555; line-height:1.6;">
                            <div><b>Turma:</b> ${n(t.turma)}</div>
                            <div><b>Curso:</b> ${n(t.curso)}</div>
                        </div>
                    </div>
                </div>

                <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom:15px;">
                    <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">📄 Documentos & Pessoal</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px; color:#555;">
                        <div><b>CPF:</b> ${n(t.cpf)}</div>
                        <div><b>RG:</b> ${n(t.rg)}</div>
                        <div><b>Nascimento:</b> ${t.nascimento?t.nascimento.split(`-`).reverse().join(`/`):`<span style="color:#aaa;">Não informada</span>`}</div>
                        <div><b>Sexo:</b> ${n(t.sexo)}</div>
                        <div><b>Profissão:</b> ${n(t.profissao)}</div>
                    </div>
                </div>

                <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee; margin-bottom: ${t.resp_nome?`15px`:`0`};">
                    <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">📍 Endereço</h4>
                    <div style="font-size:13px; color:#555; line-height:1.5;">
                        ${n(t.rua)}, Nº ${n(t.numero)}<br>
                        ${n(t.bairro)} - ${n(t.cidade)} / ${n(t.estado)}
                    </div>
                </div>
                
                ${t.resp_nome?`
                <div style="background:#fff3e0; padding:15px; border-radius:8px; border:1px solid #fdebd0;">
                    <h4 style="margin:0 0 10px 0; color:#d35400; font-size:12px; text-transform:uppercase;">👤 Responsável Legal (Menor)</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px; color:#555;">
                        <div><b>Nome:</b> ${n(t.resp_nome)}</div>
                        <div><b>Vínculo:</b> ${n(t.resp_parentesco)}</div>
                        <div><b>CPF:</b> ${n(t.resp_cpf)}</div>
                        <div><b>WhatsApp:</b> ${n(t.resp_zap)}</div>
                    </div>
                </div>`:``}
            </div>
        `}catch{r.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar a ficha do aluno.</p>`}},B.abrirFichaTurma=async e=>{let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`),i=document.querySelector(`.btn-confirm`);n&&(n.innerText=`Detalhes da Turma`),r&&(r.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">A processar turma e alunos... ⏳</p>`),i&&(i.style.display=`none`);try{let[t,n]=await Promise.all([B.api(`/turmas/${e}`),B.api(`/alunos`)]),i=n.filter(e=>e.turma===t.nome&&(!e.status||e.status===`Ativo`)),a=e=>e?B.escapeHTML(e):`<span style="color:#aaa;">Não informado</span>`,o=i.length===0?`<div style="padding:15px; text-align:center; color:#999; background:#fff; border:1px solid #eee; border-radius:8px; font-size:13px;">Nenhum aluno ativo matriculado nesta turma de momento.</div>`:`<div style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; background: #fff;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead style="background: #f9f9f9; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee; color: #555;">Nome do Aluno</th>
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee; color: #555;">WhatsApp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${i.map(e=>`
                            <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#fdfdfd'" onmouseout="this.style.background='transparent'">
                                <td style="padding: 10px; color: #333; font-weight: 500;">
                                    <span style="font-size:14px; margin-right:5px;">👤</span> ${B.escapeHTML(e.nome)}
                                </td>
                                <td style="padding: 10px; color: #27ae60; font-weight: 500;">
                                    <a href="https://wa.me/${(e.whatsapp||``).replace(/\D/g,``)}" target="_blank" style="color:#27ae60; text-decoration:none;">
                                        ${B.escapeHTML(e.whatsapp||`-`)}
                                    </a>
                                </td>
                            </tr>
                        `).join(``)}
                    </tbody>
                </table>
               </div>`;r.innerHTML=`
            <div style="padding: 5px;">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; border-bottom:2px solid #eee; padding-bottom:15px;">
                    <div style="font-size:35px; background:#e8f4f8; width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:12px; border:2px solid #3498db;">🏫</div>
                    <div>
                        <h2 style="margin:0; color:#2c3e50; font-size:20px;">${a(t.nome)}</h2>
                        <div style="margin-top:4px; color:#7f8c8d; font-size:12px;">
                            <b>Curso Vinculado:</b> ${a(t.curso)}
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">📅 Dias de Aula</h4>
                        <div style="font-size:13px; color:#555; line-height:1.5; font-weight:500;">
                            ${a(t.dia)}
                        </div>
                    </div>
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">⏰ Horário</h4>
                        <div style="font-size:14px; font-weight:bold; color:#e67e22; margin-top:5px;">
                            ${a(t.horario)}
                        </div>
                    </div>
                </div>

                <h4 style="margin:0 0 10px 0; color:#2c3e50; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
                    <span>👨‍🎓 Alunos Matriculados</span>
                    <span style="background:#3498db; color:white; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:bold;">${i.length} Aluno(s)</span>
                </h4>
                ${o}
            </div>
        `}catch{r.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar a ficha da turma.</p>`}},B.abrirFichaCurso=async e=>{let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`),i=document.querySelector(`.btn-confirm`);n&&(n.innerText=`Detalhes do Curso`),r&&(r.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">A processar curso e turmas... ⏳</p>`),i&&(i.style.display=`none`);try{let[t,n]=await Promise.all([B.api(`/cursos/${e}`),B.api(`/turmas`)]),i=n.filter(e=>e.curso===t.nome),a=e=>e?B.escapeHTML(e):`<span style="color:#aaa;">Não informado</span>`,o=t.valor?parseFloat(t.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2}):`0,00`,s=i.length===0?`<div style="padding:15px; text-align:center; color:#999; background:#fff; border:1px solid #eee; border-radius:8px; font-size:13px;">Nenhuma turma vinculada a este curso de momento.</div>`:`<div style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; background: #fff;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead style="background: #f9f9f9; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee; color: #555;">Nome da Turma</th>
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee; color: #555;">Dias e Horário</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${i.map(e=>`
                            <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#fdfdfd'" onmouseout="this.style.background='transparent'">
                                <td style="padding: 10px; color: #333; font-weight: 500;">
                                    <span style="font-size:14px; margin-right:5px;">🏫</span> ${B.escapeHTML(e.nome)}
                                </td>
                                <td style="padding: 10px; color: #555;">
                                    <div style="font-size: 11px; font-weight: bold; color: #2980b9;">${B.escapeHTML(e.dia||`-`)}</div>
                                    <div style="font-size: 12px; color: #e67e22;">${B.escapeHTML(e.horario||`-`)}</div>
                                </td>
                            </tr>
                        `).join(``)}
                    </tbody>
                </table>
               </div>`;r.innerHTML=`
            <div style="padding: 5px;">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px; border-bottom:2px solid #eee; padding-bottom:15px;">
                    <div style="font-size:35px; background:#fff4e6; width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:12px; border:2px solid #e67e22;">📚</div>
                    <div>
                        <h2 style="margin:0; color:#2c3e50; font-size:20px;">${a(t.nome)}</h2>
                        <div style="margin-top:4px; color:#7f8c8d; font-size:12px;">
                            <b>Carga Horária:</b> ${a(t.carga)} Horas
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">💰 Mensalidade Padrão</h4>
                        <div style="font-size:16px; color:#27ae60; font-weight:bold; margin-top:5px;">
                            R$ ${o}
                        </div>
                    </div>
                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                        <h4 style="margin:0 0 10px 0; color:#2980b9; font-size:12px; text-transform:uppercase;">📝 Descrição</h4>
                        <div style="font-size:13px; color:#555; line-height:1.5;">
                            ${t.descricao?B.escapeHTML(t.descricao):`<i>Sem descrição.</i>`}
                        </div>
                    </div>
                </div>

                <h4 style="margin:0 0 10px 0; color:#2c3e50; font-size:14px; display:flex; justify-content:space-between; align-items:center;">
                    <span>🏫 Turmas deste Curso</span>
                    <span style="background:#e67e22; color:white; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:bold;">${i.length} Turma(s)</span>
                </h4>
                ${s}
            </div>
        `}catch{r.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar a ficha do curso.</p>`}},window.App=window.App||{};var U=window.App,W=U.renderizarTela;U.renderizarTela=async(e,t=!1)=>{if(e===`workspace_admin`)return U.renderizarWorkspaceAdmin(t);if(e===`workspace_acessos`)return U.renderizarWorkspaceAcessos(t);if(e===`workspace_monitoramento`)return U.renderizarWorkspaceMonitoramento(t);if(W)return W(e,t)};var G=U.abrirModalCadastroModulo;U.abrirModalCadastroModulo=(e,t)=>{if(e===`ws_acesso`&&U.workspaceCache){let e=U.workspaceCache.alunos.find(e=>e.id===t);if(e)return U.abrirModalAcessoWorkspace(e.id,e.nome)}if(G)return G(e,t)},Object.assign(U,{mensagensSalvasWorkspace:[],renderizarWorkspaceAdmin:(e=!1)=>{e||window.history.pushState({tela:`workspace_admin`},``,`#workspace_admin`),typeof U.salvarEstadoNavegacao==`function`&&U.salvarEstadoNavegacao(`fundo`,{tipo:`tela`,alvo:`workspace_admin`}),U.setTitulo(`Gestão do Workspace`);let t=document.getElementById(`app-content`);t.innerHTML=`
            <p style="color: #7f8c8d; font-size: 15px; margin-bottom: 20px; text-align: center;">Escolha a área que deseja aceder para administrar o ambiente virtual dos alunos.</p>
            
            <div style="text-align: center; margin-bottom: 25px;">
                <button class="btn-primary" style="background: #2563eb; border: none; padding: 12px 22px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);" onclick="App.abrirModalAvisoWorkspace('TODOS', '', 'Todos os Alunos do Workspace')">
                    📢 Enviar Aviso Push para Todos os Alunos
                </button>
            </div>

            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content: center;">
                <!-- BOTÃO 1: ACESSOS -->
                <div class="card" style="flex:1; min-width:280px; max-width: 450px; text-align:center; cursor:pointer; transition:all 0.3s ease; border:2px solid transparent; padding: 40px 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" 
                     onmouseover="this.style.borderColor='#3498db'; this.style.transform='translateY(-5px)';" 
                     onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)';" 
                     onclick="App.renderizarWorkspaceAcessos()">
                    <div style="font-size:55px; margin-bottom:15px;">🔐</div>
                    <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size: 20px;">Gerir Acessos e Avisos</h3>
                    <p style="color:#7f8c8d; font-size:14px; margin:0; line-height: 1.5;">Criar logins, revogar senhas ou enviar notificações individuais para alunos no Workspace.</p>
                </div>

                <!-- BOTÃO 2: MONITORAMENTO -->
                <div class="card" style="flex:1; min-width:280px; max-width: 450px; text-align:center; cursor:pointer; transition:all 0.3s ease; border:2px solid transparent; padding: 40px 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" 
                     onmouseover="this.style.borderColor='#27ae60'; this.style.transform='translateY(-5px)';" 
                     onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)';" 
                     onclick="App.renderizarWorkspaceMonitoramento()">
                    <div style="font-size:55px; margin-bottom:15px;">📡</div>
                    <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size: 20px;">Monitoramento Online</h3>
                    <p style="color:#7f8c8d; font-size:14px; margin:0; line-height: 1.5;">Acompanhe em tempo real quem está a navegar no Workspace e envie alertas rápidos.</p>
                </div>
            </div>
        `},garantirCacheWorkspace:async()=>{if(U.workspaceCache&&Array.isArray(U.workspaceCache.usuarios)&&U.workspaceCache.usuarios.length>0)return U.workspaceCache;try{let[e,t]=await Promise.all([U.api(`/alunos`,`GET`,null,!0),U.api(`/usuarios`,`GET`,null,!0)]),n=Array.isArray(e)?e:[],r=Array.isArray(t)?t:[];U.workspaceCache={alunos:n.filter(e=>e.status?e.status===`Ativo`:!0),usuarios:r.filter(e=>e.tipo===`Aluno`?!0:!!e.alunoRefId)}}catch{U.workspaceCache={alunos:[],usuarios:[]}}return U.workspaceCache},renderizarWorkspaceAcessos:async(e=!1)=>{e||window.history.pushState({tela:`workspace_acessos`},``,`#workspace_acessos`),typeof U.salvarEstadoNavegacao==`function`&&U.salvarEstadoNavegacao(`fundo`,{tipo:`tela`,alvo:`workspace_acessos`}),U.setTitulo(`Acessos ao Portal`);let t=document.getElementById(`app-content`);t.innerHTML=`<p style="text-align:center; padding:40px; color:#666;">Carregando lista de alunos e acessos... ⏳</p>`;try{let e=await U.api(`/alunos`),n=await U.api(`/usuarios`),r=Array.isArray(e)?e:[],i=Array.isArray(n)?n:[];U.workspaceCache={alunos:r.filter(e=>e.status?e.status===`Ativo`:!0),usuarios:i.filter(e=>e.tipo===`Aluno`?!0:!!e.alunoRefId)},t.innerHTML=`
                <div style="margin-bottom: 20px;">
                    <button class="btn-cancel" style="padding: 8px 15px; font-weight: bold;" onclick="App.renderizarWorkspaceAdmin()">⬅️ Voltar ao Hub</button>
                </div>
                <div style="text-align:center; margin-bottom:20px;">
                    <div class="card" style="padding:20px;">
                        <h3 style="margin:0 0 10px 0; color:#2c3e50;">Acessos ao Portal do Aluno</h3>
                        <p style="font-size:13px; color:#7f8c8d; margin:0 0 20px 0;">Crie credenciais ou envie notificações diretas para os alunos no Workspace.</p>
                        
                <div class="toolbar" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; gap: 15px; flex-wrap: wrap;">
                    <div class="search-wrapper" style="flex: 1; min-width: 240px; position: relative;">
                        <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="ws-busca-aluno" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee; outline:none; box-sizing: border-box;" placeholder="Pesquisar aluno pelo nome..." oninput="App.filtrarWorkspaceAdmin()">
                    </div>
                    <button class="btn-primary" style="background: #2563eb; border: none; padding: 12px 18px; border-radius: 8px; font-weight: bold; cursor: pointer;" onclick="App.abrirModalAvisoWorkspace('TODOS', '', 'Todos os Alunos do Workspace')">
                        📢 Avisar Todos
                    </button>
                </div>
                    </div>
                </div>
                <div class="card" style="padding:0; overflow:hidden;" id="ws-admin-tabela-container">
                </div>
            `;let a=sessionStorage.getItem(`ws_filtro_admin_acessos`);if(a){let e=document.getElementById(`ws-busca-aluno`);e&&(e.value=a)}U.filtrarWorkspaceAdmin()}catch(e){console.error(`Erro na gestão:`,e),t.innerHTML=`<p style="color:#e74c3c; text-align:center; padding:40px;">Erro ao carregar a lista de alunos.</p>`}},filtrarWorkspaceAdmin:()=>{let e=document.getElementById(`ws-busca-aluno`),t=e&&e.value?e.value:``,n=t.toLowerCase();sessionStorage.setItem(`ws_filtro_admin_acessos`,t);let r=document.getElementById(`ws-admin-tabela-container`);if(!r||!U.workspaceCache)return;let{alunos:i,usuarios:a}=U.workspaceCache,o=i.filter(e=>(e.nome?e.nome:``).toLowerCase().includes(n));if(o.length===0){r.innerHTML=`<p style="text-align:center; padding:30px; color:#666;">Nenhum aluno encontrado com este nome.</p>`;return}let s=`
            <div class="table-responsive-wrapper">
                <table style="width:100%; text-align:left; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #eee; background:#f8f9fa;">
                            <th style="padding:15px; color:#2c3e50;">Nome do Aluno</th>
                            <th style="padding:15px; color:#2c3e50;">Login no Workspace</th>
                            <th style="padding:15px; text-align:right; color:#2c3e50;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;o.forEach(e=>{let t=a.find(t=>String(t.alunoRefId)===String(e.id)),n=t?`<span style="background:#eafaf1; color:#27ae60; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #2ecc71;">✅ ${U.escapeHTML(t.login)}</span>`:`<span style="background:#fdf2f2; color:#e74c3c; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #e74c3c;">❌ Sem Acesso</span>`,r=t?t.nome?t.nome:e.nome?e.nome:t.login:e.nome,i=U.escapeHTML(r).replace(/'/g,`\\'`),o=t?`<div style="display:inline-flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                       <button class="btn-primary" style="padding:8px 12px; font-size:12px; width:auto; font-weight:bold; background:#2563eb; border:none; border-radius:6px; cursor:pointer;" onclick="App.abrirModalAvisoWorkspace('${t.id}', '${e.id}', '${i}')">🔔 Avisar</button>
                       <button class="btn-cancel" style="padding:8px 12px; font-size:12px; width:auto; font-weight:bold; color:#e74c3c; border-color:#e74c3c;" onclick="App.excluirAcessoWorkspace('${t.id}')">🗑️ Revogar</button>
                   </div>`:`<button class="btn-primary" style="padding:8px 15px; font-size:12px; width:auto; font-weight:bold; background:#8e44ad; border-color:#8e44ad;" onclick="App.abrirModalAcessoWorkspace('${e.id}', '${i}')">🔑 Gerar Acesso</button>`;s+=`
                <tr style="border-bottom:1px solid #f9f9f9; transition: background 0.2s;" onmouseover="this.style.background='#f4f6f7'" onmouseout="this.style.background='transparent'">
                    <td style="padding:15px; font-size:14px; font-weight:500; color:#333;">${U.escapeHTML(e.nome)}</td>
                    <td style="padding:15px;">${n}</td>
                    <td style="padding:15px; text-align:right;">${o}</td>
                </tr>
            `}),s+=`</tbody></table></div>`,r.innerHTML=s},getChaveLocalAvisosSalvos:()=>typeof U.getTenantKey==`function`?U.getTenantKey(`ws_avisos_salvos_cache`):`ws_avisos_salvos_cache`,carregarMensagensSalvasWS:async()=>{let e=document.getElementById(`ws-lista-mensagens-salvas`);e&&(e.innerHTML=`<div style="font-size:12px; color:#94a3b8; text-align:center; padding:10px;">A carregar mensagens salvas... ⏳</div>`);try{let e=await U.api(`/push/avisos-salvos`,`GET`,null,!0);if(Array.isArray(e))U.mensagensSalvasWorkspace=e,localStorage.setItem(U.getChaveLocalAvisosSalvos(),JSON.stringify(e));else{let e=JSON.parse(localStorage.getItem(U.getChaveLocalAvisosSalvos())?localStorage.getItem(U.getChaveLocalAvisosSalvos()):`[]`);U.mensagensSalvasWorkspace=Array.isArray(e)?e:[]}}catch{let e=JSON.parse(localStorage.getItem(U.getChaveLocalAvisosSalvos())?localStorage.getItem(U.getChaveLocalAvisosSalvos()):`[]`);U.mensagensSalvasWorkspace=Array.isArray(e)?e:[]}U.renderizarListaMensagensSalvasWS()},renderizarListaMensagensSalvasWS:()=>{let e=document.getElementById(`ws-lista-mensagens-salvas`),t=document.getElementById(`ws-count-mensagens-salvas`);if(!e)return;let n=U.mensagensSalvasWorkspace?U.mensagensSalvasWorkspace:[];if(t&&(t.innerText=n.length),n.length===0){e.innerHTML=`
                <div style="text-align:center; padding:12px; color:#94a3b8; font-size:12px; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">
                    Nenhuma mensagem salva ainda. As mensagens que enviar ou guardar aparecerão aqui para reutilizar com 1 clique!
                </div>`;return}e.innerHTML=n.map((e,t)=>{let n=e.mensagem&&e.mensagem.length>70?e.mensagem.substring(0,70)+`...`:e.mensagem?e.mensagem:``;return`
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:8px; margin-bottom:6px; transition:0.2s;" onmouseover="this.style.borderColor='#93c5fd'" onmouseout="this.style.borderColor='#e2e8f0'">
                    <div style="flex:1; min-width:0; cursor:pointer;" onclick="App.usarMensagemSalvaWS(${t})" title="Clique para preencher este aviso">
                        <div style="font-size:12px; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📌 ${U.escapeHTML(e.titulo)}</div>
                        <div style="font-size:11px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${U.escapeHTML(n)}</div>
                    </div>
                    <div style="display:flex; gap:4px; flex-shrink:0;">
                        <button type="button" onclick="App.usarMensagemSalvaWS(${t})" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" title="Carregar texto nos campos">📂 Usar</button>
                        <button type="button" onclick="App.excluirMensagemSalvaWS('${e.id}', ${t})" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca; padding:4px 7px; border-radius:6px; font-size:11px; cursor:pointer;" title="Apagar das salvas">🗑️</button>
                    </div>
                </div>
            `}).join(``)},usarMensagemSalvaWS:e=>{let t=U.mensagensSalvasWorkspace&&U.mensagensSalvasWorkspace[e];if(!t)return;let n=document.getElementById(`ws-aviso-titulo`),r=document.getElementById(`ws-aviso-mensagem`);n&&(n.value=t.titulo?t.titulo:``),r&&(r.value=t.mensagem?t.mensagem:``),typeof U.showToast==`function`&&U.showToast(`📂 Mensagem carregada! Pode enviar ou ajustar o texto.`,`info`)},salvarApenasModeloAvisoWS:async()=>{let e=document.getElementById(`ws-aviso-titulo`),t=document.getElementById(`ws-aviso-mensagem`),n=e&&e.value?e.value.trim():``,r=t&&t.value?t.value.trim():``;if(!n||!r)return U.showToast(`Preencha o título e a mensagem antes de guardar na lista.`,`warning`);try{let e=await U.api(`/push/avisos-salvos`,`POST`,{titulo:n,mensagem:r});if(e&&e.success)U.showToast(e.message?e.message:`💾 Mensagem guardada na lista!`,`success`),await U.carregarMensagensSalvasWS();else{let e={id:`local_`+Date.now(),titulo:n,mensagem:r,dataCriacao:new Date().toISOString()};U.mensagensSalvasWorkspace.unshift(e),localStorage.setItem(U.getChaveLocalAvisosSalvos(),JSON.stringify(U.mensagensSalvasWorkspace)),U.renderizarListaMensagensSalvasWS(),U.showToast(`💾 Mensagem guardada na lista!`,`success`)}}catch{U.showToast(`Erro ao guardar mensagem.`,`error`)}},excluirMensagemSalvaWS:async(e,t)=>{try{U.mensagensSalvasWorkspace.splice(t,1),localStorage.setItem(U.getChaveLocalAvisosSalvos(),JSON.stringify(U.mensagensSalvasWorkspace)),U.renderizarListaMensagensSalvasWS(),e&&!String(e).startsWith(`local_`)&&await U.api(`/push/avisos-salvos/${e}`,`DELETE`,null,!0),typeof U.showToast==`function`&&U.showToast(`🗑️ Mensagem removida da lista.`,`info`)}catch{}},abrirModalAvisoWorkspace:(e,t,n)=>{let r=document.getElementById(`modal-aviso-ws`);r||(r=document.createElement(`div`),r.id=`modal-aviso-ws`,r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); display:flex; justify-content:center; align-items:center; z-index:10001; backdrop-filter:blur(4px); padding:15px; box-sizing:border-box;`,document.body.appendChild(r));let i=n||`Aluno`,a=i.split(` `)[0],o=U.escapeHTML(a).replace(/'/g,`\\'`),s=U.escapeHTML(i).replace(/'/g,`\\'`);r.innerHTML=`
            <div style="background:#fff; padding:22px; border-radius:16px; max-width:500px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 50px rgba(0,0,0,0.3); animation: slideIn 0.25s ease; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <h3 style="margin:0; color:#1e293b; font-size:18px;">📲 Enviar Aviso para o Workspace</h3>
                    <button type="button" onclick="document.getElementById('modal-aviso-ws').style.display='none'" style="background:none; border:none; font-size:20px; color:#94a3b8; cursor:pointer;">✖</button>
                </div>
                <p style="font-size:13px; color:#64748b; margin:0 0 15px 0; text-align:left;">Destinatário: <strong style="color:#2563eb;">${U.escapeHTML(i)}</strong></p>

                <!-- MODELOS FIXOS RÁPIDOS -->
                <div style="margin-bottom:14px; text-align:left;">
                    <label style="font-weight:bold; font-size:11px; color:#64748b; text-transform:uppercase; display:block; margin-bottom:6px;">⚡ Modelos Rápidos (1 Clique):</label>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button type="button" onclick="App.preencherModeloAvisoWS('aula', '${o}')" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">📚 Lembrete de Aula</button>
                        <button type="button" onclick="App.preencherModeloAvisoWS('nota', '${o}')" style="background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">✅ Nota Lançada</button>
                        <button type="button" onclick="App.preencherModeloAvisoWS('evento', '${o}')" style="background:#fef3c7; color:#d97706; border:1px solid #fde68a; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">📅 Evento / Feriado</button>
                    </div>
                </div>

                <!-- 🗂️ GALERIA DE MENSAGENS SALVAS -->
                <div style="margin-bottom:15px; text-align:left; background:#f1f5f9; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-weight:800; font-size:11px; color:#334155; text-transform:uppercase;">💾 Mensagens Salvas (<span id="ws-count-mensagens-salvas">0</span>)</span>
                        <button type="button" onclick="App.salvarApenasModeloAvisoWS()" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" title="Guardar o título e texto atuais na lista sem enviar agora">➕ Guardar Texto Atual</button>
                    </div>
                    <div id="ws-lista-mensagens-salvas" style="max-height:135px; overflow-y:auto; padding-right:2px;"></div>
                </div>

                <!-- CAMPOS DO AVISO -->
                <div style="margin-bottom:12px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#334155; display:block; margin-bottom:4px;">Título da Notificação</label>
                    <input type="text" id="ws-aviso-titulo" placeholder="Ex: 📚 Lembrete da sua aula de hoje!" style="width:100%; padding:11px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;">
                </div>

                <div style="margin-bottom:12px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#334155; display:block; margin-bottom:4px;">Mensagem</label>
                    <textarea id="ws-aviso-mensagem" rows="3" placeholder="Escreva a mensagem que aparecerá no sininho e na tela do aluno no Workspace..." style="width:100%; padding:11px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:14px; outline:none; resize:vertical; font-family:inherit; box-sizing:border-box;"></textarea>
                </div>

                <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#475569; margin-bottom:18px; cursor:pointer; text-align:left; font-weight:600;">
                    <input type="checkbox" id="ws-aviso-salvar-check" checked style="width:16px; height:16px; cursor:pointer;">
                    Guardar automaticamente esta mensagem nas "Mensagens Salvas" para usar outras vezes
                </label>

                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" style="flex:1; justify-content:center; padding:12px; border-radius:8px;" onclick="document.getElementById('modal-aviso-ws').style.display='none'">Cancelar</button>
                    <button class="btn-primary" id="ws-btn-disparar-aviso" style="flex:1.4; justify-content:center; padding:12px; border-radius:8px; background:#2563eb; border:none; font-weight:bold; cursor:pointer;" onclick="App.enviarAvisoWorkspace('${e}', '${t}', '${s}')">🚀 Enviar para o Workspace</button>
                </div>
            </div>
        `,r.style.display=`flex`,U.carregarMensagensSalvasWS()},preencherModeloAvisoWS:(e,t)=>{let n=document.getElementById(`ws-aviso-titulo`),r=document.getElementById(`ws-aviso-mensagem`);if(!n||!r)return;let i=t===`Todos`?`Olá, turma!`:`Olá, ${t}!`;e===`aula`?(n.value=`📚 Lembrete de Aula Hoje!`,r.value=`${i} Passando para lembrar da nossa aula de hoje. Já preparou o seu material no Workspace? Até já!`):e===`nota`?(n.value=`✅ Nova Avaliação Disponível!`,r.value=`${i} Acabámos de atualizar o seu desempenho académico. Aceda ao seu portal para conferir!`):e===`evento`&&(n.value=`📅 Aviso Importante na Agenda`,r.value=`${i} Temos uma atualização importante no calendário de aulas da escola. Confira no seu Workspace!`)},enviarAvisoWorkspace:async(e,t,n)=>{let r=document.getElementById(`ws-aviso-titulo`),i=document.getElementById(`ws-aviso-mensagem`),a=document.getElementById(`ws-aviso-salvar-check`),o=r&&r.value?r.value.trim():``,s=i&&i.value?i.value.trim():``,c=a?a.checked:!0;if(!o||!s)return U.showToast(`Preencha o título e a mensagem do aviso.`,`warning`);let l=document.getElementById(`ws-btn-disparar-aviso`),u=l.innerHTML;l.innerHTML=`A enviar... ⏳`,l.disabled=!0;try{let r=await U.garantirCacheWorkspace(),i=[];if(e===`TODOS`)r.usuarios.forEach(e=>{let t=e.nome?e.nome.trim():e.login?e.login.trim():``;t&&i.push(t)});else{let a=r.usuarios.find(n=>String(n.id)===String(e)?!0:String(n.alunoRefId)===String(t));if(a){let e=a.nome?a.nome.trim():a.login?a.login.trim():``;e&&i.push(e)}else n&&i.push(n.trim())}let a=await U.api(`/push/enviar-aviso-aluno`,`POST`,{alvoUserId:e,alunoRefId:t,nomeDestino:n,nomesListaFrontend:i,titulo:o,mensagem:s,salvarMensagem:c});a&&a.success?(U.showToast(a.message?a.message:`✅ Aviso entregue no Workspace!`,`success`),document.getElementById(`modal-aviso-ws`).style.display=`none`):U.showToast(a&&a.error?a.error:`Não foi possível enviar o aviso.`,`error`)}catch{U.showToast(`Erro de comunicação ao enviar o aviso.`,`error`)}finally{l.innerHTML=u,l.disabled=!1}},abrirModalAcessoWorkspace:(e,t)=>{typeof U.salvarEstadoNavegacao==`function`&&U.salvarEstadoNavegacao(`modal`,{tipo:`ws_acesso`,id:e});let n=document.getElementById(`modal-acesso-ws`);n||(n=document.createElement(`div`),n.id=`modal-acesso-ws`,n.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:10000; backdrop-filter:blur(4px);`,document.body.appendChild(n));let r=t.split(` `),i=(r[0]+(r.length>1?r[r.length-1]:``)).toLowerCase().replace(/[^a-z0-9]/g,``)+Math.floor(100+Math.random()*900);n.innerHTML=`
            <div style="background:#fff; padding:30px; border-radius:16px; max-width:400px; width:90%; box-shadow:0 20px 50px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;">
                <div style="text-align:center; font-size:40px; margin-bottom:10px;">🎓</div>
                <h3 style="margin-top:0; color:#2c3e50; text-align:center;">Acesso ao Workspace</h3>
                <p style="font-size:13px; color:#666; text-align:center; margin-bottom:25px;">Crie as credenciais para:<br><strong style="color:#3498db; font-size:15px;">${t}</strong></p>
                
                <div class="input-group" style="margin-bottom:15px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#555;">Login de Acesso</label>
                    <input type="text" id="ws-input-login" value="${i}" style="width:100%; padding:12px; border:2px solid #eee; border-radius:8px; font-weight:bold; color:#333; outline:none;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#eee'">
                </div>
                
                <div class="input-group" style="margin-bottom:25px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#555;">Senha Provisória</label>
                    <input type="text" id="ws-input-senha" value="123456" style="width:100%; padding:12px; border:2px solid #eee; border-radius:8px; font-weight:bold; color:#333; outline:none;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#eee'">
                    <small style="color:#999; font-size:11px; display:block; margin-top:5px;">A senha deve ter no mínimo 6 caracteres.</small>
                </div>

                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" style="flex:1; justify-content:center; padding:12px; border-radius:8px;" onclick="document.getElementById('modal-acesso-ws').style.display='none'; if(App.salvarEstadoNavegacao) App.salvarEstadoNavegacao('modal', null);">Cancelar</button>
                    <button class="btn-primary" id="ws-btn-salvar-acesso" style="flex:1; justify-content:center; padding:12px; border-radius:8px; background:#27ae60; border:none;" onclick="App.salvarAcessoWorkspace('${e}', '${t.replace(/'/g,`\\'`)}')">💾 Guardar</button>
                </div>
            </div>
        `,n.style.display=`flex`},salvarAcessoWorkspace:async(e,t)=>{let n=document.getElementById(`ws-input-login`).value.trim(),r=document.getElementById(`ws-input-senha`).value.trim();if(!n||r.length<6)return U.showToast(`Preencha o login e uma senha (mín. 6 caracteres).`,`warning`);let i=document.getElementById(`ws-btn-salvar-acesso`),a=i.innerHTML;i.innerHTML=`A salvar... ⏳`,i.disabled=!0;try{let i={nome:t,login:n,senha:r,tipo:`Aluno`,alunoRefId:e},a=await U.api(`/usuarios`,`POST`,i);a&&a.error?U.showToast(a.error,`error`):(U.showToast(`✅ Acesso criado com sucesso!`,`success`),document.getElementById(`modal-acesso-ws`).style.display=`none`,typeof U.salvarEstadoNavegacao==`function`&&U.salvarEstadoNavegacao(`modal`,null),U.renderizarWorkspaceAcessos())}catch{U.showToast(`Erro de ligação.`,`error`)}finally{i.innerHTML=a,i.disabled=!1}},excluirAcessoWorkspace:e=>{U.abrirModalConfirmacao(`Revogar Acesso?`,`O aluno perderá o acesso ao Workspace. Esta ação não apaga os dados escolares do aluno, apenas o login.`,async t=>{document.body.style.cursor=`wait`;try{await U.api(`/usuarios/${e}`,`DELETE`),U.showToast(`Acesso revogado.`,`success`),U.renderizarWorkspaceAcessos()}catch{U.showToast(`Erro ao revogar.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},radarMonitoramentoInterval:null,renderizarWorkspaceMonitoramento:async(e=!1)=>{e||window.history.pushState({tela:`workspace_monitoramento`},``,`#workspace_monitoramento`),typeof U.salvarEstadoNavegacao==`function`&&U.salvarEstadoNavegacao(`fundo`,{tipo:`tela`,alvo:`workspace_monitoramento`}),U.setTitulo(`Monitoramento Online`);let t=document.getElementById(`app-content`);if(!document.getElementById(`ws-pulse-css`)){let e=document.createElement(`style`);e.id=`ws-pulse-css`,e.innerHTML=`@keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); } }`,document.head.appendChild(e)}t.innerHTML=`
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <button class="btn-cancel" style="padding: 8px 15px; font-weight: bold;" onclick="App.renderizarWorkspaceAdmin()">⬅️ Voltar ao Hub</button>
                <button class="btn-primary" style="background: #2563eb; border: none; padding: 9px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer;" onclick="App.abrirModalAvisoWorkspace('TODOS', '', 'Todos os Alunos do Workspace')">
                    📢 Avisar Todos os Alunos
                </button>
            </div>
            <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #eee;">
                <div style="background: #f8f9fa; padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; color:#2c3e50; font-size: 18px;">📡 Atividade dos Alunos no Workspace</h3>
                    <div style="font-size: 12px; color: #7f8c8d; display: flex; align-items: center; gap: 6px; font-weight:bold;">
                        <div style="width:8px; height:8px; background:#27ae60; border-radius:50%; animation: pulseDot 2s infinite;"></div>
                        Radar Ativado
                    </div>
                </div>
                <div id="lista-monitoramento" style="padding: 0;">
                    <p style="text-align:center; padding: 40px; color:#999; font-size: 14px;">A estabelecer conexão com os servidores... ⏳</p>
                </div>
            </div>
        `,await U.atualizarDadosRadar(),U.radarMonitoramentoInterval&&clearInterval(U.radarMonitoramentoInterval),U.radarMonitoramentoInterval=setInterval(()=>{let e=document.getElementById(`titulo-pagina`);if((e?e.innerText:``)!==`Monitoramento Online`){clearInterval(U.radarMonitoramentoInterval);return}U.atualizarDadosRadar(!0)},1e4)},atualizarDadosRadar:async(e=!1)=>{try{let t=`DEFAULT`;if(U.usuario&&U.usuario.escolaId)t=U.usuario.escolaId;else{let e=localStorage.getItem(U.getTenantKey(`escola_perfil`)),n=e?JSON.parse(e):{};t=n.id?n.id:`DEFAULT`}let[n,r,i]=await Promise.all([U.api(`/workspace/monitoramento/status?escolaId=${t}`,`GET`,null,e),U.api(`/alunos`,`GET`,null,!0),U.api(`/usuarios`,`GET`,null,!0)]),a=document.getElementById(`lista-monitoramento`);if(!a)return;let o=Array.isArray(r)?r:[],s=Array.isArray(i)?i:[],c=Array.isArray(n)?n:[],l=o.filter(e=>e.status?e.status===`Ativo`:!0),u=l.map(e=>e.id),d=s.filter(e=>(e.tipo===`Aluno`?!0:!!e.alunoRefId)&&u.includes(e.alunoRefId));if(U.workspaceCache={alunos:l,usuarios:d},d.length===0){a.innerHTML=`<p style="text-align:center; padding: 40px; color:#7f8c8d; font-size: 14px;">Nenhum aluno ativo possui acesso ao Workspace no momento.</p>`;return}let f=d.map(e=>{let t=l.find(t=>t.id===e.alunoRefId)||{},n=c.find(n=>n.id&&String(n.id)===String(e.id)||n.usuarioId&&String(n.usuarioId)===String(e.id)||n.alunoRefId&&String(n.alunoRefId)===String(t.id)||n.login&&e.login&&n.login.toLowerCase()===e.login.toLowerCase()?!0:!!(n.nome&&t.nome&&n.nome.trim().toLowerCase()===t.nome.trim().toLowerCase()))||{};return{contaId:e.id,alunoRefId:e.alunoRefId,nome:e.nome?e.nome:t.nome?t.nome:e.login,login:e.login,avatar:e.avatar?e.avatar:null,isOnline:n.isOnline===!0?!0:String(n.isOnline)===`true`,ultimoAcesso:n.ultimoAcesso?n.ultimoAcesso:null}});f.sort((e,t)=>t.isOnline===e.isOnline?e.nome.localeCompare(t.nome):t.isOnline?1:-1);let p=`<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse; text-align:left;">`;p+=`<thead><tr style="background: #fff; border-bottom: 2px solid #eee; color:#64748b; font-size: 13px; text-transform: uppercase;">`,p+=`<th style="padding:15px 20px;">Identificação do Aluno</th>`,p+=`<th style="padding:15px 20px; text-align:center;">Status Atual</th>`,p+=`<th style="padding:15px 20px; text-align:right;">Última Interação / Ação</th>`,p+=`</tr></thead><tbody>`,f.forEach(e=>{let t=e.isOnline,n=t?`#27ae60`:`#e74c3c`,r=t?`Online Agora`:`Offline`,i=t?`#eafaf1`:`#fdedec`,a=t?`animation: pulseDot 2s infinite;`:``,o=e.ultimoAcesso?new Date(e.ultimoAcesso).toLocaleString(`pt-BR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}):`Nunca acessou`,s=``;s=e.avatar?`<img src="${e.avatar}" style="width:35px; height:35px; min-width:35px; border-radius:50%; object-fit:cover; border: 2px solid #e2e8f0; cursor: zoom-in; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="App.verFotoRadar('${e.avatar}', '${U.escapeHTML(e.nome)}')">`:`<div style="width:35px; height:35px; min-width:35px; background:#3498db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; border: 2px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${U.escapeHTML(e.nome).charAt(0).toUpperCase()}</div>`;let c=U.escapeHTML(e.nome).replace(/'/g,`\\'`);p+=`
                    <tr style="border-bottom:1px solid #f0f2f5; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding:15px 20px; font-weight:bold; color:#1e293b; font-size: 14px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                ${s}
                                ${U.escapeHTML(e.nome)}
                                <span style="font-size: 10px; color: #94a3b8; font-weight: normal; margin-left: 5px;">(@${U.escapeHTML(e.login)})</span>
                            </div>
                        </td>
                        <td style="padding:15px 20px; text-align:center;">
                            <div style="background:${i}; color:${n}; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold; display:inline-flex; align-items:center; gap:6px; border: 1px solid ${n}40;">
                                <div style="width:8px; height:8px; background:${n}; border-radius:50%; ${a}"></div>
                                ${r}
                            </div>
                        </td>
                        <td style="padding:15px 20px; text-align:right; color:#64748b; font-size:13px; font-weight: 500;">
                            <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px; flex-wrap:wrap;">
                                <span>${o}</span>
                                <button onclick="App.abrirModalAvisoWorkspace('${e.contaId}', '${e.alunoRefId}', '${c}')" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">🔔 Avisar</button>
                            </div>
                        </td>
                    </tr>
                `}),p+=`</tbody></table></div>`,a.innerHTML=p}catch{}},verFotoRadar:(e,t)=>{let n=`admin-foto-viewer`,r=document.getElementById(n);r&&r.remove(),r=document.createElement(`div`),r.id=n,r.style.cssText=`position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease; backdrop-filter: blur(5px);`,r.innerHTML=`
            <div style="position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); box-sizing: border-box;">
                <span style="color: white; font-weight: 500; font-size: 16px;">Foto de Perfil: ${U.escapeHTML(t)}</span>
                <button onclick="document.getElementById('${n}').style.opacity='0'; setTimeout(()=>document.getElementById('${n}').remove(), 200)" style="background: transparent; border: none; color: white; font-size: 35px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
            <img src="${e}" style="max-width: 90vw; max-height: 80vh; object-fit: contain; box-shadow: 0 5px 25px rgba(0,0,0,0.5); border-radius: 8px; transform: scale(0.9); transition: transform 0.2s ease;" id="admin-viewer-img">
        `,document.body.appendChild(r),requestAnimationFrame(()=>{r.style.opacity=`1`,document.getElementById(`admin-viewer-img`).style.transform=`scale(1)`})}});var ee=n({});window.App=window.App||{};var K=window.App;if(K.renderizarFinanceiroPro=async()=>{K.setTitulo(`Financeiro`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Carregando dados financeiros...</p>`;try{let[t,n,r]=await Promise.all([K.api(`/turmas`),K.api(`/financeiro`),K.api(`/alunos`)]),i=r.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),a=n.filter(e=>!(e.status===`Pendente`&&!i.includes(e.idAluno)));K.financeiroCache=a.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1),K.UI.input;let o=K.UI.botao,s=(e,t,n)=>`
            <div style="flex:1; min-width:120px;">
                <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">${e}</label>
                <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${n}</select>
            </div>`,c=(e,t,n=`text`,r=``,i=``)=>`
            <div style="flex:1; min-width:120px;">
                <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">${e}</label>
                <input type="${n}" id="${t}" value="${r}" placeholder="${i}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
            </div>`,l=`
            <div style="display:flex; align-items:center; margin-bottom:20px;">
                <div style="font-size:24px; margin-right:10px;">💰</div>
                <div><h3 style="margin:0; color:#2c3e50;">Gerar Mensalidades</h3><p style="margin:0; color:#666; font-size:14px;">Preencha para gerar carnê.</p></div>
            </div>
            <div style="display:flex; gap:20px; align-items:flex-end; flex-wrap:wrap;">
                <div style="flex:2; min-width:250px;">
                    <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">Selecione o Aluno:</label>
                    <select id="fin-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${`<option value="">-- Selecione --</option>`+r.filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${K.escapeHTML(e.nome)}</option>`).join(``)}</select>
                </div>
                ${s(`Tipo de Faturação:`,`fin-tipo`,`<option value="padrao">🟢 Mensalidade Padrão</option><option value="extra">🟠 Parcela Extra (Reposição)</option>`)}
                ${c(`Valor (R$):`,`fin-valor`,`number`,``,`0,00`)}
                ${c(`Parcelas:`,`fin-parcelas`,`number`,`12`)}
                ${c(`1º Vencimento:`,`fin-vencimento`,`date`,new Date().toISOString().split(`T`)[0])}
            </div>
            <button id="btn-gerar-carne" onclick="App.gerarCarnes()" style="margin-top:25px; width:100%; background:linear-gradient(90deg,#2980b9,#3498db); color:white; padding:12px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase; box-shadow: 0 4px 10px rgba(52,152,219,0.3);">Gerar e Imprimir Carnê</button>
        `,u=new Set,d=new Date().getFullYear();u.add(d),a.forEach(e=>{e.vencimento&&u.add(parseInt(e.vencimento.split(`-`)[0]))});let f=`<option value="" selected>Todos os Anos</option>`+Array.from(u).sort((e,t)=>t-e).map(e=>`<option value="${e}">${e}</option>`).join(``),p=`<option value="" selected>Todos os Meses</option>`+[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${(t+1).toString().padStart(2,`0`)}">${e}</option>`).join(``),m=`
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
            ${o(`BAIXAR`,`App.abrirModalBaixa()`,`primary`,`✅`)}
            
            <button onclick="App.abrirModalEdicaoLote()" style="background:#1abc9c; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='scale(1.05)'" onmouseout="this.style.filter='none'; this.style.transform='scale(1)'">✏️ EDITAR</button>
            
            ${o(`DESFAZER`,`App.acaoLote('pendente')`,`edit`,`↩️`)}
            ${o(`EXCLUIR`,`App.acaoLote('excluir')`,`cancel`,`🗑️`)}
        </div>
                
                <div style="display:flex; flex-direction:column; gap:10px; flex:1; min-width:300px; max-width:650px; margin-top: 15px">
                    <div class="search-wrapper" style="width: 100%; position:relative;">
                        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity:0.5;">🔍</span>
                        <input type="text" id="fin-busca" placeholder="Pesquisar por nome ou descrição..." oninput="App.filtrarFinanceiro()" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #ddd; border-radius:5px;">
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <select id="fin-filtro-status" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            <option value="">Todos os Status</option><option value="Pago">🟢 Pagos</option><option value="Pendente">🟠 Pendentes</option>
                        </select>
                        <select id="fin-filtro-mes" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${p}
                        </select>
                        <select id="fin-filtro-ano" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:100px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${f}
                        </select>
                    </div>
                </div>
            </div>
            <div id="fin-lista-area" class="table-responsive-wrapper" style="overflow-x:auto;">
                ${K.gerarTabelaFinanceira(K.financeiroCache)}
            </div>
        `;e.innerHTML=`
            <div style="margin-bottom:20px; text-align:right;">
                <button onclick="App.renderizarTela('inadimplencia')" style="background:#c0392b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 6px rgba(192, 57, 43, 0.3);">📉 RELATÓRIO DE INADIMPLÊNCIA</button>
            </div>
            <div class="card" style="border-left:5px solid #2980b9; padding:25px; margin-bottom:30px;">
                ${l}
            </div>
            ${K.UI.card(``,``,m)}
        `}catch{e.innerHTML=`Erro ao carregar dados financeiros.`}},K.gerarTabelaFinanceira=e=>{if(!e||e.length===0)return`<p style="text-align:center; padding:20px; color:#999;">Nenhum lançamento encontrado.</p>`;let t=(e,t=`center`)=>`<th style="padding:12px; text-align:${t}; border-bottom:2px solid #eee;">${e}</th>`,n=`<tr style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase; font-size:12px;">
        <th style="padding:12px; width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheck(this)"></th>
        ${t(`Aluno`,`left`)}${t(`Parcela`)}${t(`Vencimento`)}${t(`Valor`)}${t(`Status`)}${t(`Ações`)}
    </tr>`,r=new Date;return r.setHours(0,0,0,0),`<table style="width:100%; border-collapse:collapse; font-size:14px; color:#555; min-width:600px;"><thead>${n}</thead><tbody>${e.map(e=>{let t=e.status===`Pago`,n=e.status===`Pendente`,i=new Date(e.vencimento+`T00:00:00`),a=n&&i<r,o=t?`#1e8449`:n?`#f39c12`:`#e74c3c`;a&&(o=`#c0392b`);let s=``;t?s=`background-color:#eafaf1;`:a&&(s=`background-color:#fdf2f2;`);let c=a?`Atrasado`:e.status,l=`<span style="background:${t?`#d4efdf`:a?`#fadbd8`:`#fcf3cf`}; padding:4px 8px; border-radius:4px; font-size:12px;">${c}</span>`,u=e.descricao.includes(`/`)?e.descricao.split(` `).pop():`-`,d=e.vencimento.split(`-`).reverse().join(`/`),f=parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2}),p=t?``:`<button onclick="App.cobrarWhatsApp('${e.idAluno}', '${f}')" style="background:#27ae60; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Cobrar no WhatsApp">💬</button>`;return`
        <tr style="border-bottom:1px solid #eee; ${s} transition:background 0.2s;">
            <td style="padding:12px; text-align:center;"><input type="checkbox" class="fin-check" value="${e.id}"></td>
            <td style="padding:12px; font-weight:bold;">${K.escapeHTML(e.alunoNome)}</td>
            <td style="padding:12px; text-align:center;">${K.escapeHTML(u)}</td>
            <td style="padding:12px; text-align:center; ${a?`color:#c0392b; font-weight:bold;`:``}">${d}</td>
            <td style="padding:12px; text-align:center;">R$ ${f}</td>
            <td style="padding:12px; text-align:center; font-weight:bold; color:${o};">${l}</td>
            <td style="padding:12px; text-align:center; white-space:nowrap;">
                <button onclick="App.abrirCarneExistente('${e.idCarne}')" style="background:#3498db; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Ver Carnê">📄</button>
                <button onclick="App.abrirEdicaoFinanceiro('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Editar Valor">✏️</button>
                ${p}
            </td>
        </tr>`}).join(``)}</tbody></table>`},K.filtrarFinanceiro=()=>{let e=document.getElementById(`fin-busca`),t=document.getElementById(`fin-filtro-mes`),n=document.getElementById(`fin-filtro-ano`),r=document.getElementById(`fin-filtro-status`),i=e?e.value.toLowerCase():``,a=t?t.value:``,o=n?n.value:``,s=r?r.value:``,c=K.financeiroCache.filter(e=>{let t=!i||e.alunoNome&&e.alunoNome.toLowerCase().includes(i)||e.descricao&&e.descricao.toLowerCase().includes(i),n=e.vencimento||``,r=n.substring(0,4),c=n.substring(5,7),l=!o||r===o,u=!a||c===a,d=!s||e.status===s;return t&&l&&u&&d});a||o||s?c.sort((e,t)=>new Date(t.vencimento)-new Date(e.vencimento)):c.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1),document.getElementById(`fin-lista-area`).innerHTML=K.gerarTabelaFinanceira(c)},K.filaBaixa={modo:``,itens:[],index:0},K.abrirModalBaixa=()=>{let e=document.querySelectorAll(`.fin-check:checked`);if(e.length===0)return K.showToast(`Selecione pelo menos um lançamento para dar baixa.`,`warning`);let t=Array.from(e).map(e=>K.financeiroCache.find(t=>t.id==e.value)).filter(e=>e);if(t.length===1)K.filaBaixa={modo:`single`,itens:t,index:0},K.montarTelaBaixa();else{K.filaBaixa={modo:`escolha`,itens:t,index:0};let e=document.getElementById(`modal-overlay`);e&&(e.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Múltiplas Baixas (${t.length} itens)`,document.getElementById(`modal-form-content`).innerHTML=`
            <div style="text-align:center; padding:20px 10px;">
                <div style="font-size:45px; margin-bottom:15px;">🏦</div>
                <h3 style="color:#2c3e50; margin-bottom:20px;">Como deseja processar estes ${t.length} pagamentos?</h3>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <button onclick="App.definirModoBaixa('batch')" style="background:#34495e; color:white; border:none; padding:15px 20px; border-radius:8px; cursor:pointer; flex:1; min-width:200px; transition:0.2s;" onmouseover="this.style.background='#2c3e50'" onmouseout="this.style.background='#34495e'">
                        <div style="font-weight:bold; font-size:15px; margin-bottom:4px;">📦 Somar e Pagar Tudo</div>
                        <div style="font-size:11px; font-weight:normal; opacity:0.8;">O sistema divide os valores e juros<br>automaticamente no relatório</div>
                    </button>
                    <button onclick="App.definirModoBaixa('queue')" style="background:#27ae60; color:white; border:none; padding:15px 20px; border-radius:8px; cursor:pointer; flex:1; min-width:200px; transition:0.2s;" onmouseover="this.style.background='#1e8449'" onmouseout="this.style.background='#27ae60'">
                        <div style="font-weight:bold; font-size:15px; margin-bottom:4px;">⏭️ Pagar Um por Um</div>
                        <div style="font-size:11px; font-weight:normal; opacity:0.8;">Cria uma fila e regista cada aluno<br>com a sua forma de pagamento e juros</div>
                    </button>
                </div>
            </div>
        `;let n=document.querySelector(`.btn-confirm`);n&&(n.style.display=`none`)}},K.definirModoBaixa=e=>{K.filaBaixa.modo=e,K.filaBaixa.index=0,K.montarTelaBaixa()},K.montarTelaBaixa=()=>{let{modo:e,itens:t,index:n}=K.filaBaixa,r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`);let i=document.querySelector(`.btn-confirm`);i&&(i.style.display=`inline-block`);let a=0,o=``,s=``,c=!0;if(e===`batch`){s=`Pagamento em Lote (${t.length} itens)`;let e=0;t.forEach(t=>e+=Math.round(parseFloat(t.valor)*100)),a=e/100,o=`
            <div style="font-size:13px; color:#2980b9; margin-bottom:15px; background:#e8f4f8; padding:12px; border-radius:6px; border-left:4px solid #3498db;">
                <b>ℹ️ Atenção:</b> O valor final e quaisquer juros aplicados serão divididos proporcionalmente entre os ${t.length} lançamentos.
            </div>`,i.innerText=`CONFIRMAR LOTE ✅`}else{let r=t[n];a=parseFloat(r.valor),c=n===t.length-1,s=e===`queue`?`Fila do Caixa: Lançamento ${n+1} de ${t.length}`:`Confirmar Pagamento`,o=`
            <div style="background:#fdfefe; border:1px solid #dce1e6; padding:15px; border-radius:6px; margin-bottom:15px; border-left:4px solid #27ae60; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:6px;">👤 Identificação do Pagador</div>
                    <div style="font-size:16px; font-weight:bold; color:#2c3e50; margin-bottom:4px;">${K.escapeHTML(r.alunoNome)}</div>
                    <div style="font-size:13px; color:#555;">📄 ${K.escapeHTML(r.descricao)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:6px;">Vencimento</div>
                    <div style="font-size:14px; color:#c0392b; font-weight:bold;">${r.vencimento.split(`-`).reverse().join(`/`)}</div>
                </div>
            </div>`,i.innerText=e===`queue`&&!c?`CONFIRMAR E PRÓXIMO ⏭️`:`CONFIRMAR PAGAMENTO ✅`}document.getElementById(`modal-titulo`).innerText=s;let l=K.UI.input,u=(e,t,n,r=``)=>`
        <div class="input-group" style="margin:0;">
            <label>${e}</label>
            <select id="${t}" ${r}>${n}</select>
        </div>`,d=(e,t=``,n=`grid`)=>`<div id="${t}" style="display:${n}; grid-template-columns:2fr 1fr; gap:10px; margin-bottom:10px;">${e}</div>`,f=`<option value="PIX">PIX</option><option value="Cartão de Crédito">Cartão de Crédito</option><option value="Cartão de Débito">Cartão de Débito</option><option value="Dinheiro">Dinheiro</option>`,p=`
        ${o}
        <div style="background:#f4f6f7; padding:15px; border-radius:8px; margin-bottom:15px;">
            
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center; border-bottom:1px solid #ddd; padding-bottom:10px;">
                <div>
                    <span style="font-weight:bold; color:#2c3e50; display:block;">Valor a Cobrar Agora:</span>
                    <span style="font-size:12px; color:#7f8c8d;">Original: R$ ${a.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</span>
                </div>
                <span id="baixa-display-total" style="font-weight:bold; color:#27ae60; font-size:24px;">R$ ${a.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</span>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                ${l(`Data do Pagamento`,`baixa-data`,new Date().toISOString().split(`T`)[0],``,`date`)}
                <div class="input-group" style="margin:0;">
                    <label style="color:#d35400;">Acréscimo/Juros (%)</label>
                    <input type="number" id="baixa-juros" value="0" min="0" step="0.1" oninput="App.aplicarJurosBaixa()" style="width:100%; padding:10px; border-radius:5px; border:1px solid #e67e22; background:#fdf2e9;" placeholder="Ex: 5">
                </div>
            </div>

            ${u(`Divisão de Pagamento`,`baixa-qtd`,`<option value="1">1 Forma de Pagamento</option><option value="2">2 Formas de Pagamento (Dividir Valor)</option>`,`onchange="App.mudarQtdFormasBaixa()"`)}
            
            <div style="margin-top:15px;">
                ${d(u(`Forma 1`,`baixa-forma-1`,f)+l(`Valor (R$)`,`baixa-valor-1`,a.toFixed(2),``,`number`,`step="0.01" oninput="App.calcValorBaixa()" style="margin:0;"`),`forma-1-container`)}
                
                ${d(u(`Forma 2`,`baixa-forma-2`,`<option value="Dinheiro">Dinheiro</option>`+f)+l(`Valor (R$)`,`baixa-valor-2`,`0.00`,``,`number`,`step="0.01" readonly style="background:#eee; margin:0;"`),`forma-2-container`,`none`)}
            </div>
            
            <input type="hidden" id="baixa-total-original" value="${a}">
            <input type="hidden" id="baixa-total" value="${a}">
        </div>`;document.getElementById(`modal-form-content`).innerHTML=p,i.setAttribute(`onclick`,`App.confirmarBaixa()`)},K.aplicarJurosBaixa=()=>{let e=parseFloat(document.getElementById(`baixa-total-original`).value),t=parseFloat(document.getElementById(`baixa-juros`).value)||0;t<0&&(t=0,document.getElementById(`baixa-juros`).value=0);let n=e+t/100*e;document.getElementById(`baixa-display-total`).innerText=`R$ ${n.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,document.getElementById(`baixa-total`).value=n.toFixed(2),document.getElementById(`baixa-qtd`).value===`1`?document.getElementById(`baixa-valor-1`).value=n.toFixed(2):K.calcValorBaixa()},K.mudarQtdFormasBaixa=()=>{let e=document.getElementById(`baixa-qtd`).value,t=document.getElementById(`forma-2-container`),n=document.getElementById(`baixa-valor-1`),r=parseFloat(document.getElementById(`baixa-total`).value);e===`2`?(t.style.display=`grid`,n.value=(r/2).toFixed(2),K.calcValorBaixa()):(t.style.display=`none`,n.value=r.toFixed(2))},K.calcValorBaixa=()=>{if(document.getElementById(`baixa-qtd`).value===`2`){let e=Math.round(parseFloat(document.getElementById(`baixa-total`).value)*100)-(Math.round(parseFloat(document.getElementById(`baixa-valor-1`).value)*100)||0);e<0&&(e=0),document.getElementById(`baixa-valor-2`).value=(e/100).toFixed(2)}},K.confirmarBaixa=async()=>{let e=document.getElementById(`baixa-data`).value,t=document.getElementById(`baixa-qtd`).value,n=document.getElementById(`baixa-forma-1`).value,r=document.getElementById(`baixa-valor-1`).value,i=t===`2`?document.getElementById(`baixa-forma-2`).value:null,a=t===`2`?document.getElementById(`baixa-valor-2`).value:null;if(!e)return K.showToast(`Informe a data de pagamento.`,`error`);let o=document.querySelector(`.btn-confirm`),s=o.innerText;o.innerText=`Registrando... ⏳`,o.disabled=!0;let{modo:c,itens:l,index:u}=K.filaBaixa;try{let o=[];if(c===`batch`){let s=parseFloat(document.getElementById(`baixa-total-original`).value)||0;for(let c of l){let l=s>0?parseFloat(c.valor)/s:0,u=s>0?(parseFloat(r)*l).toFixed(2):`0.00`,d=t===`2`&&s>0?(parseFloat(a)*l).toFixed(2):null,f=(parseFloat(u)+(parseFloat(d)||0)).toFixed(2),p={...c,status:`Pago`,dataPagamento:e,formaPagamento:n,valorPago1:u,formaPagamento2:i,valorPago2:d,valor:f};o.push(K.api(`/financeiro/${c.id}`,`PUT`,p))}}else{let s=l[u],c=(parseFloat(r)+(parseFloat(a)||0)).toFixed(2),d={...s,status:`Pago`,dataPagamento:e,formaPagamento:n,valorPago1:r,formaPagamento2:i,valorPago2:t===`2`?a:null,valor:c};o.push(K.api(`/financeiro/${s.id}`,`PUT`,d))}if(await Promise.all(o),c===`queue`&&u<l.length-1){K.showToast(`Pagamento ${u+1} registado. Avançando...`,`success`),K.filaBaixa.index++,K.montarTelaBaixa();return}K.showToast(`Operação no caixa concluída com sucesso! 💼`,`success`),K.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,await K.renderizarFinanceiroPro()}catch{K.showToast(`Erro ao processar baixa.`,`error`)}finally{o&&(o.innerText=s,o.disabled=!1)}},K.gerarCarnes=async()=>{let e=document.getElementById(`fin-aluno`).value,t=document.getElementById(`fin-valor`).value,n=parseInt(document.getElementById(`fin-parcelas`).value),r=document.getElementById(`fin-vencimento`).value,i=document.getElementById(`fin-tipo`).value;if(!e||!t||!n||!r)return K.showToast(`Preencha todos os campos do gerador.`,`error`);if(parseFloat(t)<=0)return K.showToast(`O valor da mensalidade deve ser maior que zero.`,`warning`);let a=document.getElementById(`fin-aluno`).options[document.getElementById(`fin-aluno`).selectedIndex].text,o=Date.now().toString(),s=new Date().toLocaleDateString(`pt-BR`),c=document.getElementById(`btn-gerar-carne`),l=c.innerText;c.innerText=`Gerando ${n} parcelas... ⏳`,c.disabled=!0,document.body.style.cursor=`wait`;try{let c=[],l=new Date(r+`T00:00:00`),u=l.getDate();for(let r=1;r<=n;r++){let d=new Date(l.getTime());d.setMonth(l.getMonth()+(r-1)),d.getDate()!==u&&d.setDate(0);let f=d.toISOString().split(`T`)[0],p=`Mensalidade ${r}/${n}`;i===`extra`&&(p=`Parcela Extra (Extensão de Curso) - ${r}/${n}`);let m={id:o+`_`+r,idCarne:o,dataGeracao:s,idAluno:e,alunoNome:a,valor:t,vencimento:f,status:`Pendente`,descricao:p,tipo:`Receita`};c.push(K.api(`/financeiro`,`POST`,m))}await Promise.all(c),K.showToast(`Carnê gerado com sucesso!`,`success`),K.abrirCarneExistente(o)}catch{K.showToast(`Erro ao gerar parcelas.`,`error`)}finally{c.innerText=l,c.disabled=!1,document.body.style.cursor=`default`}},K.toggleCheck=e=>{document.querySelectorAll(`.fin-check`).forEach(t=>t.checked=e.checked)},K.acaoLote=e=>{let t=document.querySelectorAll(`.fin-check:checked`);if(t.length===0)return K.showToast(`Selecione pelo menos um lançamento.`,`warning`);let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`);let r=document.getElementById(`modal-titulo`),i=document.getElementById(`modal-form-content`),a=document.querySelector(`.btn-confirm`),o=e===`excluir`,s=o?`#c0392b`:`#f39c12`,c=o?`🗑️`:`↩️`,l=o?`Excluir Lançamentos`:`Desfazer Pagamentos`,u=o?`excluir permanentemente`:`alterar para PENDENTE`;r&&(r.innerText=l);let d=o?`<div style="background:#fdf2f2; border:1px solid #fadbd8; border-left:4px solid #c0392b; padding:12px; border-radius:6px; color:#c0392b; font-size:13px; text-align:left; margin-top:20px;"><b>⚠️ ATENÇÃO:</b> Esta ação é irreversível. Os registos serão removidos da base de dados e do histórico do aluno.</div>`:`<div style="background:#fdf2e9; border:1px solid #fdebd0; border-left:4px solid #f39c12; padding:12px; border-radius:6px; color:#d35400; font-size:13px; text-align:left; margin-top:20px;"><b>ℹ️ NOTA:</b> O status passará de "Pago" para "Pendente" no sistema.</div>`,f=`
        <div style="text-align:center; padding:10px 10px 20px 10px;">
            <div style="font-size:55px; margin-bottom:10px; animation: scaleIn 0.3s ease-out;">${c}</div>
            <h3 style="color:#2c3e50; margin-bottom:15px; font-size:22px;">Tem a certeza absoluta?</h3>
            <p style="color:#555; font-size:15px; margin-bottom:10px; line-height:1.5;">
                Está prestes a <b>${u}</b> <br>
                <span style="display:inline-block; margin-top:10px; background:${s}; color:white; padding:5px 15px; border-radius:20px; font-weight:bold; font-size:16px;">${t.length} item(ns)</span> selecionado(s).
            </p>
            ${d}
        </div>
        <style>@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }</style>
    `;if(i&&(i.innerHTML=f),a){a.innerText=o?`SIM, EXCLUIR 🗑️`:`CONFIRMAR ↩️`,a.style.background=s;let n=a.cloneNode(!0);a.parentNode.replaceChild(n,a),n.onclick=()=>K.executarAcaoLoteConfirmada(e,t,n,s)}},K.executarAcaoLoteConfirmada=async(e,t,n,r)=>{let i=n.innerText;n.innerText=`Processando... ⏳`,n.disabled=!0,n.style.opacity=`0.8`,document.body.style.cursor=`wait`;try{let n=Array.from(t).map(async t=>{let n=t.value;if(e===`excluir`)return K.api(`/financeiro/${n}`,`DELETE`);{let t=K.financeiroCache.find(e=>e.id==n);if(t)return K.api(`/financeiro/${n}`,`PUT`,{...t,status:e===`baixar`?`Pago`:`Pendente`})}});await Promise.all(n),K.showToast(`Ação concluída com sucesso!`,`success`),K.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,typeof K.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?await K.renderizarFinanceiroPro():typeof K.filtrarTabelaReativa==`function`?await K.renderizarLista(`financeiro`):await K.renderizarFinanceiroPro()}catch{K.showToast(`Erro ao processar lote.`,`error`),n.innerText=i,n.disabled=!1,n.style.opacity=`1`}finally{document.body.style.cursor=`default`,setTimeout(()=>{n&&(n.style.background=``)},500)}},K.abrirCarneExistente=async e=>{let t=document.getElementById(`app-content`);t.innerHTML=`<p style="text-align:center; padding:20px;">Gerando Carnê Profissional...</p>`;try{let[n,r,i]=await Promise.all([K.api(`/financeiro`),K.api(`/alunos`),K.api(`/escola`)]),a=n.filter(t=>t.idCarne===e).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento));if(a.length===0)return K.showToast(`Carnê não encontrado.`,`error`);let o=r.find(e=>e.id===a[0].idAluno)||{nome:`Aluno`,cpf:`Não informado`};i.foto&&`${i.foto}`,(i.nome||`INSTITUIÇÃO`).substring(0,20),(o.nome||`Aluno`).split(` `)[0];let s=i.banco||`Não Configurado`,c=i.chavePix||`Não Configurada`;t.innerHTML=`
            
            <style>
                .carnes-container { background: #f4f6f7; padding: 20px; border-radius: 8px; }
                .carne-wrapper { 
                    display: flex; border: 1px solid #000; margin: 0 auto 5mm auto; font-family: Arial, sans-serif; 
                    background: #fff; color: #000; border-radius: 8px; overflow: hidden; 
                    width: 100%; max-width: 210mm; height: 65mm; box-sizing: border-box;
                }
                .carne-canhoto { width: 28%; border-right: 2px dashed #999; padding: 8px; display: flex; flex-direction: column; background: #fafafa; }
                .carne-recibo { width: 72%; padding: 6px 15px; display: flex; flex-direction: column; position: relative; }
                
                /* REGRAS DE FERRO PARA A IMPRESSORA NÃO QUEBRAR O LAYOUT */
                @media print {
                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    @page { size: A4 portrait; margin: 10mm; }
                    .carnes-container { background: white !important; padding: 0 !important; }
                    
                    .carne-wrapper {
                        display: flex !important; /* Força o lado a lado na impressora */
                        flex-direction: row !important;
                        width: 210mm !important;
                        max-width: 210mm !important;
                        page-break-inside: avoid !important;
                    }
                    
                    .carne-canhoto {
                        display: flex !important;
                        flex-direction: column !important;
                        width: 28% !important;
                        background: #fafafa !important;
                    }
                    
                    .carne-recibo {
                        display: flex !important;
                        flex-direction: column !important;
                        width: 72% !important;
                    }
                    
                    /* Força o navegador a imprimir cores de fundo (Avisos amarelos, etc) */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            </style>
        
            <div class="no-print" style="text-align:center; padding:20px; background:#fff; margin-bottom: 20px;">
                <h2 style="margin:0;">Carnê Gerado!</h2>
                <button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR CARNÊ</button>
                <button onclick="App.renderizarFinanceiroPro()" class="btn-cancel">VOLTAR</button>
            </div>
            <div class="carnes-container">${a.map(e=>{let t=e.vencimento.split(`-`).reverse().join(`/`),n=parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2}),r=e.id.slice(-8).toUpperCase(),a=i.qrCodeImagem&&i.qrCodeImagem.length>50&&!i.qrCodeImagem.includes(`placehold`)?`<img src="${i.qrCodeImagem}" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px; padding: 2px;">`:`<div id="qr-${e.id}" style="width: 60px; height: 60px; padding: 5px; background: #fff; border: 1px solid #ccc; border-radius: 4px; display:flex; align-items:center; justify-content:center;"></div>`;return`
            <div class="carne-wrapper">
                <div class="carne-canhoto">
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; text-align: left;">
                        ${i.foto?`<img src="${i.foto}" style="height: 45px; max-width: 65px; object-fit: contain; flex-shrink: 0;">`:``}
                        <div style="display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                            <div style="font-size: 8px; color: #555; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><b>CNPJ:</b> ${K.escapeHTML(i.cnpj||`Não informado`)}</div>
                            <div style="font-size: 8px; color: #555; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><b>Banco:</b> ${K.escapeHTML(s)}</div>
                        </div>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 3px; color: #34495e;"><b>Nº:</b> ${r}</div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Parcela:</b> ${K.escapeHTML(e.descricao)}</div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Vencimento:</b> <span style="color: red; font-weight: bold;">${t}</span></div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Valor:</b> R$ ${n}</div>
                    <div style="margin-top: auto; font-size: 9px; border-top: 1px solid #ccc; padding-top: 5px;"><b>Sacado:</b> ${K.escapeHTML(o.nome)}</div>
                </div>
                <div class="carne-recibo">
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 6px;">
                        <div><div style="font-weight: bold; font-size: 12px;">${K.escapeHTML(i.nome||`INSTITUIÇÃO`)}</div><div style="font-size: 9px;">Banco: ${K.escapeHTML(s)}</div></div>
                        <div style="text-align: right; font-size: 10px; font-weight: bold;">RECIBO DO PAGADOR</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; background: #fdfdfd; border: 1px solid #ddd; padding: 4px 10px;">
                        <div><div style="font-size: 9px; color: #777;">Número da Folha</div><div style="font-weight: bold; font-size: 12px;">${r}</div></div>
                        <div><div style="font-size: 9px; color: #777;">Vencimento</div><div style="font-weight: bold; font-size: 12px; color: #c0392b;">${t}</div></div>
                        <div><div style="font-size: 9px; color: #777;">Valor</div><div style="font-weight: bold; font-size: 12px;">R$ ${n}</div></div>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 5px;"><b>Ref:</b> ${K.escapeHTML(e.descricao)} | <b>Pagador:</b> ${K.escapeHTML(o.nome)}</div>
                    
                    <div style="background: #fff8e1; border: 1px solid #f1c40f; padding: 4px 8px; border-radius: 4px; margin-bottom: 5px; text-align: center; line-height: 1.2;">
                        <span style="font-size: 9px; font-weight: bold; color: #d35400;">Importante:</span> 
                        <span style="font-size: 9px; color: #555;">Benefícios concedidos na matrícula são válidos apenas até a data de vencimento. Após o vencimento, a mensalidade será atualizada automaticamente para o valor vigente.</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 10px; font-weight: bold; color:#27ae60;">PAGAMENTO VIA PIX</div>
                            <div style="background: #eee; padding: 4px 6px; border-radius: 4px; font-size: 10px; word-break: break-all;">🔑 ${K.escapeHTML(c)}</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: -5px;">${a}</div>
                    </div>
                </div>
            </div>`}).join(``)}</div>`,(!i.qrCodeImagem||i.qrCodeImagem.length<=50)&&a.forEach(e=>{let t=document.getElementById(`qr-${e.id}`);t&&typeof QRCode<`u`&&new QRCode(t,{text:c,width:60,height:60})})}catch{K.showToast(`Erro ao gerar carnê.`,`error`)}},K.renderizarInadimplencia=async()=>{K.setTitulo(`Relatório de Inadimplência`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Calculando inadimplência... ⏳</p>`;try{let[t,n,r]=await Promise.all([K.api(`/financeiro`),K.api(`/alunos`),K.api(`/escola`)]),i=n.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),a=new Date,o=t.filter(e=>e.status!==`Pago`&&new Date(e.vencimento+`T00:00:00`)<a&&i.includes(e.idAluno)),s=0,c={};o.forEach(e=>{let t=Math.round(parseFloat(e.valor)*100);if(!c[e.idAluno]){let t=n.find(t=>t.id==e.idAluno);c[e.idAluno]={idAluno:e.idAluno,nome:e.alunoNome,curso:t?t.curso:`-`,totalCentavos:0,detalhes:[]}}c[e.idAluno].totalCentavos+=t,c[e.idAluno].detalhes.push(`${e.vencimento.split(`-`).reverse().join(`/`)} (R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})})`),s+=t});let l=Object.values(c).map(e=>({...e,total:e.totalCentavos/100})),u=s/100,d=new Date().toLocaleDateString(`pt-BR`),f=r.foto?`<img src="${r.foto}" style="height:50px;">`:``,p=l.length===0?`<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">Nenhuma pendência encontrada.</td></tr>`:l.map(e=>`
                <tr>
                    <td style="font-weight:bold;">${K.escapeHTML(e.nome)}</td>
                    <td>${K.escapeHTML(e.curso)}</td>
                    <td style="font-size:11px; color:#666;">${e.detalhes.join(`<br>`)}</td>
                    <td style="color:#c0392b; font-weight:bold; white-space:nowrap;">R$ ${e.total.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</td>
                    <td class="no-print" style="text-align:right;">
                        <button onclick="App.cobrarWhatsApp('${e.idAluno}', '${e.total.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}')" class="btn-cobrar">💬 Cobrar</button>
                    </td>
                </tr>`).join(``);e.innerHTML=`
        <style>
            .inad-card-top { border-left: 5px solid #c0392b; padding: 25px; border-radius: 8px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; } 
            .inad-kpi-box { display: flex; gap: 20px; margin-top: 20px; flex-wrap:wrap; } 
            .inad-kpi { flex: 1; text-align: center; padding: 20px; border-radius: 8px; border: 1px solid #eee; min-width:150px; } 
            .inad-kpi-red { background: #fdf2f2; border-color: #f5b7b1; } 
            .inad-kpi-label { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; } 
            .inad-kpi-val { font-size: 24px; font-weight: bold; } 
            .inad-list-title { color: #c0392b; font-size: 18px; margin: 0; font-weight: 600; } 
            .inad-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px; min-width:600px; } 
            .inad-table th { background: #f9f9f9; padding: 12px; text-align: left; color: #888; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; } 
            .inad-table td { padding: 12px; border-bottom: 1px solid #eee; color: #333; } 
            .btn-cobrar { background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; text-decoration: none; white-space:nowrap; } 
            @media print { 
                .no-print { display: none !important; } 
                .inad-card-top { border: 1px solid #000; box-shadow: none; } 
                .inad-kpi-red { background: #eee !important; -webkit-print-color-adjust: exact; } 
            }
        </style>
            <div style="margin-bottom: 20px;" class="no-print">
                <button onclick="App.renderizarFinanceiroPro()" style="background:#7f8c8d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">⬅ VOLTAR</button>
            </div>
            
            <div class="print-sheet" style="background:white; padding:30px; border-radius:8px;">
                <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #eee; padding-bottom:15px; margin-bottom:30px;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        ${f}
                        <div><h2 style="margin:0;">${K.escapeHTML(r.nome||``)}</h2><div style="font-size:12px;">CNPJ: ${K.escapeHTML(r.cnpj||``)}</div></div>
                    </div>
                    <div style="font-size:12px; color:#666;">Emissão: ${d}</div>
                </div>
                
                <h2 style="color:#2c3e50; margin-bottom:20px;">📉 Relatório de Inadimplência</h2>
                
                <div class="inad-card-top">
                    <div class="inad-kpi-box">
                        <div class="inad-kpi inad-kpi-red">
                            <div class="inad-kpi-label" style="color:#c0392b;">TOTAL EM ATRASO</div>
                            <div class="inad-kpi-val" style="color:#c0392b;">R$ ${u.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</div>
                        </div>
                        <div class="inad-kpi">
                            <div class="inad-kpi-label">ALUNOS DEVEDORES</div>
                            <div class="inad-kpi-val">${l.length}</div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:30px;">
                    <h3 class="inad-list-title">Lista de Pendências Vencidas</h3>
                    <button onclick="window.print()" class="no-print" style="background:#34495e; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">🖨️ IMPRIMIR</button>
                </div>
                
                <table class="inad-table">
                    <thead><tr><th>ALUNO</th><th>CURSO</th><th>DETALHES</th><th>TOTAL DEVIDO</th><th class="no-print">AÇÃO</th></tr></thead>
                    <tbody>${p}</tbody>
                </table>
            </div>`}catch(e){console.error(e),K.showToast(`Erro ao calcular inadimplência.`,`error`)}},K.abrirEdicaoFinanceiro=async e=>{K.idEdicaoFinanceiro=e;let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`);n&&(n.innerText=`Editar Lançamento`),r&&(r.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando dados da parcela... ⏳</p>`);try{let t=await K.api(`/financeiro/${e}`);K.parcelaEdicaoAtual=t;let n=t.status===`Pago`,i=n?`Data Efetiva do Pagamento`:`Nova Data de Vencimento`,a=n&&t.dataPagamento||t.vencimento;r.innerHTML=`
            ${n?`<div style="background:#e8f4f8; color:#2980b9; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #2980b9;">ℹ️ <b>Parcela Paga:</b> Você está alterando apenas o dia em que o aluno efetuou o pagamento. <b>O vencimento original do carnê ficará intacto.</b></div>`:`<div style="background:#fff3e0; color:#d35400; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #d35400;">⚠️ <b>Parcela Pendente:</b> Alterar a data mudará o dia de vencimento no carnê do aluno.</div>`}
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">${i}</label>
                <input type="date" id="edit-fin-data" value="${a||``}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">Valor Registado (R$)</label>
                <input type="number" step="0.01" id="edit-fin-valor" value="${t.valor||``}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
        `;let o=document.querySelector(`.btn-confirm`);o&&(o.setAttribute(`onclick`,`App.salvarEdicaoFinanceiro()`),o.innerHTML=`💾 Salvar Alterações`)}catch(e){console.error(`Erro ao carregar edição:`,e),r&&(r.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar dados. Tente novamente.</p>`)}},K.salvarEdicaoFinanceiro=async()=>{let e=document.getElementById(`edit-fin-data`).value,t=document.getElementById(`edit-fin-valor`).value;if(!e||!t)return K.showToast(`Por favor, preencha a data e o valor.`,`warning`);let n=t.toString().trim();n.includes(`,`)&&n.includes(`.`)?n=n.replace(/\./g,``).replace(`,`,`.`):n.includes(`,`)&&(n=n.replace(`,`,`.`)),n=parseFloat(n)||0;let r=document.querySelector(`.btn-confirm`),i=r?r.innerHTML:`Salvar`;r&&(r.innerHTML=`⏳ A guardar...`,r.disabled=!0),document.body.style.cursor=`wait`;try{let t=K.parcelaEdicaoAtual.status===`Pago`,r={...K.parcelaEdicaoAtual,valor:n};t?(r.dataPagamento=e,r.valorPago1=n,r.valorPago2=0):r.vencimento=e,await K.api(`/financeiro/${K.idEdicaoFinanceiro}`,`PUT`,r),K.showToast(`Alteração financeira guardada com sucesso! 💼`,`success`),K.fecharModal(),typeof K.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?K.renderizarFinanceiroPro():typeof K.filtrarTabelaReativa==`function`&&K.renderizarLista(`financeiro`)}catch(e){console.error(`Erro ao guardar edição:`,e),K.showToast(`Ocorreu um erro ao atualizar.`,`error`)}finally{r&&(r.innerHTML=i,r.disabled=!1),document.body.style.cursor=`default`}},K.abrirModalEdicaoLote=()=>{let e=document.querySelectorAll(`.fin-check:checked`);if(e.length===0)return K.showToast(`Selecione pelo menos um lançamento para editar.`,`warning`);let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`);n&&(n.innerText=`Edição em Massa (${e.length} itens)`),r&&(r.innerHTML=`
        <div style="background:#e8f4f8; color:#2980b9; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #3498db;">
            ℹ️ <b>Atenção:</b> Apenas os campos que preencher abaixo serão alterados. Deixe em branco o que não quiser modificar.
        </div>
        
        <div class="input-group" style="margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
            <label style="font-weight:bold; color:#2c3e50;">Nova Data Base (1º Vencimento):</label>
            <input type="date" id="lote-edit-data" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px; margin-bottom:10px;">
            
            <div style="display:flex; align-items:flex-start; gap:8px; background:#fff3e0; padding:10px; border-radius:6px; border:1px solid #fdebd0;">
                <input type="checkbox" id="lote-edit-cascata" checked style="width:18px; height:18px; accent-color:#d35400; cursor:pointer; flex-shrink:0; margin-top:2px;">
                <label for="lote-edit-cascata" style="font-size:12px; color:#d35400; cursor:pointer; line-height:1.4;">
                    <b>Inteligência de Carnê:</b><br> O primeiro lançamento recebe esta data, os seguintes mantêm o dia e avançam 1 mês automaticamente (Efeito Cascata).
                </label>
            </div>
        </div>
        
        <div class="input-group" style="margin-bottom:15px;">
            <label style="font-weight:bold; color:#2c3e50;">Novo Valor (R$):</label>
            <input type="number" step="0.01" id="lote-edit-valor" placeholder="Ex: 150.00" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
        </div>

        <div class="input-group" style="margin-bottom:15px;">
            <label style="font-weight:bold; color:#2c3e50;">Nova Descrição / Referência:</label>
            <input type="text" id="lote-edit-descricao" placeholder="Ex: Mensalidade Adiada Novembro" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
        </div>
    `);let i=document.querySelector(`.btn-confirm`);i&&(i.setAttribute(`onclick`,`App.salvarEdicaoLote()`),i.innerHTML=`💾 Aplicar a Todos`,i.style.background=`#f39c12`,i.style.display=`inline-block`)},K.salvarEdicaoLote=async()=>{let e=document.getElementById(`lote-edit-data`).value,t=document.getElementById(`lote-edit-valor`).value,n=document.getElementById(`lote-edit-descricao`).value.trim(),r=document.getElementById(`lote-edit-cascata`)?.checked;if(!e&&!t&&!n)return K.showToast(`Preencha pelo menos um campo para alterar em massa.`,`warning`);let i=null;if(t){let e=t.toString().trim();if(e.includes(`,`)&&e.includes(`.`)?e=e.replace(/\./g,``).replace(`,`,`.`):e.includes(`,`)&&(e=e.replace(`,`,`.`)),i=parseFloat(e),isNaN(i)||i<0)return K.showToast(`Valor preenchido é inválido.`,`warning`)}let a=document.querySelectorAll(`.fin-check:checked`),o=Array.from(a).map(e=>e.value),s=o.map(e=>K.financeiroCache.find(t=>t.id==e)).filter(Boolean);s.sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento));let c=document.querySelector(`.btn-confirm`),l=c?c.innerHTML:`Aplicar`;c&&(c.innerHTML=`⏳ Processando...`,c.disabled=!0,c.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let t=s.map((t,a)=>{let o=t.status===`Pago`,s={...t};if(i!==null&&(s.valor=i,o&&(s.valorPago1=i,s.valorPago2=0)),n&&(s.descricao=n),e){let t=e;if(r&&!o&&a>0){let n=new Date(e+`T00:00:00`),r=n.getDate();n.setMonth(n.getMonth()+a),n.getDate()!==r&&n.setDate(0),t=n.toISOString().split(`T`)[0]}o?s.dataPagamento=e:s.vencimento=t}return K.api(`/financeiro/${t.id}`,`PUT`,s)});await Promise.all(t),K.showToast(`Edição em cascata aplicada em ${o.length} lançamentos! 💼`,`success`),K.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,typeof K.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`)&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?await K.renderizarFinanceiroPro():typeof K.filtrarTabelaReativa==`function`?await K.renderizarLista(`financeiro`):typeof K.renderizarFinanceiroPro==`function`?await K.renderizarFinanceiroPro():await K.renderizarHistoricoFinanceiro()}catch(e){console.error(`Erro na edição em lote:`,e),K.showToast(`Ocorreu um erro ao atualizar em lote.`,`error`)}finally{c&&(c.innerHTML=l,c.disabled=!1,c.style.background=``,c.style.opacity=`1`),document.body.style.cursor=`default`}},K.renderizarHistoricoFinanceiro=async()=>{K.setTitulo(`Histórico de Lançamentos`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Carregando histórico financeiro... ⏳</p>`;try{let[t,n]=await Promise.all([K.api(`/financeiro`),K.api(`/alunos`)]),r=n.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),i=t.filter(e=>!(e.status===`Pendente`&&!r.includes(e.idAluno)));K.financeiroCache=i.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1);let a=K.UI.botao,o=new Set,s=new Date().getFullYear();o.add(s),i.forEach(e=>{e.vencimento&&o.add(parseInt(e.vencimento.split(`-`)[0]))});let c=`<option value="" selected>Todos os Anos</option>`+Array.from(o).sort((e,t)=>t-e).map(e=>`<option value="${e}">${e}</option>`).join(``),l=`<option value="" selected>Todos os Meses</option>`+[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${(t+1).toString().padStart(2,`0`)}">${e}</option>`).join(``),u=`
            <div class="toolbar" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
            ${a(`BAIXAR`,`App.abrirModalBaixa()`,`primary`,`✅`)}
            
            <button onclick="App.abrirModalEdicaoLote()" style="background:#1abc9c; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='scale(1.05)'" onmouseout="this.style.filter='none'; this.style.transform='scale(1)'">✏️ EDITAR</button>
            
            ${a(`DESFAZER`,`App.acaoLote('pendente')`,`edit`,`↩️`)}
            ${a(`EXCLUIR`,`App.acaoLote('excluir')`,`cancel`,`🗑️`)}
        </div>
                
                <div style="display:flex; flex-direction:column; gap:10px; flex:1; min-width:300px; max-width:650px;">
                    <div class="search-wrapper" style="width: 100%; position:relative; margin-top:10px;">
                        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity:0.5;">🔍</span>
                        <input type="text" id="fin-busca" placeholder="Pesquisar por nome ou descrição..." oninput="App.filtrarFinanceiro()" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #ddd; border-radius:5px;">
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <select id="fin-filtro-status" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            <option value="">Todos os Status</option><option value="Pago">🟢 Pagos</option><option value="Pendente">🟠 Pendentes</option>
                        </select>
                        <select id="fin-filtro-mes" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${l}
                        </select>
                        <select id="fin-filtro-ano" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:100px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${c}
                        </select>
                    </div>
                </div>
            </div>
            <div id="fin-lista-area" class="table-responsive-wrapper" style="overflow-x:auto;">
                ${K.gerarTabelaFinanceira(K.financeiroCache)}
            </div>
        `;e.innerHTML=`
            <div style="margin-top: 20px;">
                ${K.UI.card(``,``,u)}
            </div>
        `}catch{e.innerHTML=`Erro ao carregar dados financeiros.`}},typeof K.renderizarLista==`function`){let e=K.renderizarLista;K.renderizarLista=t=>t===`financeiro`?K.renderizarHistoricoFinanceiro():e(t)}K.cobrarWhatsApp=async(e,t)=>{try{K.showToast(`A preparar mensagem...`,`info`);let[n,r]=await Promise.all([K.api(`/alunos`),K.api(`/escola`)]),i=n.find(t=>t.id===e);if(!i)return K.showToast(`Erro: Aluno não encontrado.`,`error`);let a=(i.whatsapp||i.celular||i.telefone||i.contato||``).replace(/\D/g,``);if(a.length<10)return K.showToast(`O aluno não tem um número válido registado.`,`warning`);(a.length===10||a.length===11)&&(a=`55`+a);let o=`Olá, *${i.nome?i.nome.split(` `)[0]:`Aluno`}*! Tudo bem? ✨

Passando apenas para deixar um lembrete sobre a sua mensalidade no valor de *R$ ${t}*, que se encontra em aberto no nosso sistema.

Para sua maior comodidade, deixamos abaixo os nossos dados para pagamento via PIX:

🏦 *Dados da Instituição:*
*Instituição:* _${r.nome||`Nossa Instituição`}_
*CNPJ:* _${r.cnpj||`Não informado`}_
*Banco:* _${r.banco||`Não informado`}_

🔑 *Chave PIX:* *${r.chavePix||`Não informada`}*

_Caso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem._ 🙏

Qualquer dúvida, estamos à inteira disposição. Tenha um excelente dia! 🌟`,s=`https://api.whatsapp.com/send?phone=${a}&text=${encodeURIComponent(o)}`;window.open(s,`_blank`)}catch(e){console.error(`Erro ao gerar link do WhatsApp:`,e),K.showToast(`Erro ao processar a mensagem.`,`error`)}},window.App=window.App||{};var q=window.App,J={Evento:{bg:`#2ecc71`,text:`#fff`},Feriado:{bg:`#e74c3c`,text:`#fff`},Prova:{bg:`#3498db`,text:`#fff`},Reunião:{bg:`#f39c12`,text:`#fff`}},Y=(e,t,n=`text`,r=``,i=``)=>`
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <input type="${n}" id="${t}" value="${r}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${i}>
    </div>`,X=(e,t,n,r=``)=>`
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${r}>${n}</select>
    </div>`;q.confirmar=(e,t,n,r,i)=>{let a=`modal-confirm-`+Date.now(),o=document.createElement(`div`);o.id=a,o.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999; backdrop-filter:blur(3px); opacity:0; transition:opacity 0.2s;`;let s=document.createElement(`div`);s.style.cssText=`background:#fff; width:90%; max-width:400px; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); transform:scale(0.9); transition:transform 0.2s;`,s.innerHTML=`
        <div style="font-size:45px; margin-bottom:15px; animation: pop 0.3s ease;">⚠️</div>
        <h3 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${e}</h3>
        <p style="color:#7f8c8d; margin-bottom:25px; line-height:1.5; font-size:14px;">${t}</p>
        <div style="display:flex; gap:10px;">
            <button id="btn-no-${a}" style="flex:1; padding:12px; border:none; background:#ecf0f1; color:#7f8c8d; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#bdc3c7'" onmouseout="this.style.background='#ecf0f1'">Cancelar</button>
            <button id="btn-yes-${a}" style="flex:1; padding:12px; border:none; background:${r}; color:white; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; opacity:0.9;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">${n}</button>
        </div>
    `,o.appendChild(s),document.body.appendChild(o),setTimeout(()=>{o.style.opacity=`1`,s.style.transform=`scale(1)`},10);let c=()=>{o.style.opacity=`0`,s.style.transform=`scale(0.9)`,setTimeout(()=>document.body.removeChild(o),200)};document.getElementById(`btn-no-${a}`).onclick=c,document.getElementById(`btn-yes-${a}`).onclick=()=>{c(),i()}},q.filtrarTabela=(e,t)=>{let n=document.getElementById(e).value.trim().toLowerCase(),r=document.querySelectorAll(`#${t} tbody tr`);!r||r.length===0||r.forEach(e=>{if(e.innerText.includes(`Nenhum`)||e.innerText.includes(`Nenhuma`))return;let t=e.innerText.toLowerCase();e.style.display=t.includes(n)?``:`none`})},q.toggleCheckMassa=(e,t)=>{document.querySelectorAll(`.`+t).forEach(t=>{let n=t.closest(`tr`);(!n||n.style.display!==`none`)&&(t.checked=e.checked)})},q.excluirLotePedagogico=(e,t,n)=>{let r=document.querySelectorAll(`.`+t+`:checked`);if(r.length===0)return q.showToast(`Selecione pelo menos um item para excluir.`,`warning`);q.confirmar(`Excluir em Massa`,`Deseja realmente excluir <b>${r.length}</b> iten(s) selecionado(s)? Esta ação é irreversível.`,`Excluir Tudo`,`#e74c3c`,async()=>{document.body.style.cursor=`wait`;try{let t=Array.from(r).map(t=>q.api(`${e}/${t.value}`,`DELETE`));await Promise.all(t),q.showToast(`${r.length} iten(s) excluído(s) com sucesso!`,`success`);let i=document.getElementById(`app-content`);i&&(i.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando dados... ⏳</p>`),await n()}catch{q.showToast(`Erro ao excluir itens em massa.`,`error`)}finally{document.body.style.cursor=`default`}})},q.renderizarPlanejamentoPro=()=>{q.setTitulo(`Planejamento`);let e=document.getElementById(`app-content`),t=e=>`cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:220px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);`,n=e=>`this.style.borderColor='${e}'; this.style.transform='translateY(-5px)'`,r=`this.style.borderColor='#eee'; this.style.transform='translateY(0)'`;e.innerHTML=`
        <div class="card" style="text-align:center; padding:50px;">
            <h2 style="color:#2c3e50; margin-bottom:10px;">Planejamento Pedagógico</h2>
            <p style="color:#7f8c8d; margin-bottom:40px;">Gira o conteúdo programático e o controle de aulas.</p>
            <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                <div onclick="App.renderizarNovoPlanejamento()" style="${t(`#3498db`)}" onmouseover="${n(`#3498db`)}" onmouseout="${r}">
                    <div style="font-size:50px; margin-bottom:15px;">📝</div>
                    <h3 style="margin:0; color:#3498db;">Novo Planejamento</h3>
                </div>
                <div onclick="App.renderizarPlanejamentosSalvos()" style="${t(`#27ae60`)}" onmouseover="${n(`#27ae60`)}" onmouseout="${r}">
                    <div style="font-size:50px; margin-bottom:15px;">📂</div>
                    <h3 style="margin:0; color:#27ae60;">Planejamentos Ativos</h3>
                </div>
                <div onclick="App.renderizarPlanejamentosArquivados()" style="${t(`#8e44ad`)}" onmouseover="${n(`#8e44ad`)}" onmouseout="${r}">
                    <div style="font-size:50px; margin-bottom:15px;">🗄️</div>
                    <h3 style="margin:0; color:#8e44ad;">Arquivados</h3>
                </div>
            </div>
        </div>`},q.renderizarNovoPlanejamento=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`Carregando...`;try{let t=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#2c3e50;">Configurar Novo Cronograma</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <div style="background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #eee;">
                ${X(`Aluno:`,`plan-aluno`,`<option value="">-- Selecione --</option>`+(await q.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}" data-curso="${q.escapeHTML(e.curso||`Geral`)}">${q.escapeHTML(e.nome)}</option>`).join(``),`style="margin-bottom:15px;"`)}
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${Y(`Início:`,`plan-inicio`,`date`)}
                    ${Y(`Total Aulas:`,`plan-qtd`,`number`,`10`)}
                </div>
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${Y(`Horário:`,`plan-hora`,`time`,`08:00`)}
                    ${Y(`Duração:`,`plan-duracao`,`time`,`01:00`)}
                </div>
                <label style="font-size:12px; font-weight:bold; color:#666; display:block; margin-bottom:8px;">Dias da Semana:</label>
                <div style="display:flex; gap:10px; flex-wrap:wrap; background:white; padding:10px; border:1px solid #ddd; border-radius:5px;">
                    ${[`Seg`,`Ter`,`Qua`,`Qui`,`Sex`,`Sáb`].map((e,t)=>`<label><input type="checkbox" class="plan-dia" value="${t+1}"> ${e}</label>`).join(``)}
                </div>
            </div>
            <button onclick="App.gerarGridEditavel()" style="width:100%; margin-top:20px; padding:15px; background:#3498db; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">CRIAR TABELA</button>
        `;e.innerHTML=q.UI.card(``,``,t,`800px`)}catch{e.innerHTML=`Erro.`}},q.renderizarPlanejamentosSalvos=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`Carregando...`;try{let t=(await q.api(`/planejamentos?_t=${Date.now()}`)).filter(e=>e.status!==`Arquivado`);if(t.length===0){e.innerHTML=q.UI.card(``,``,`<h3>Nenhum planejamento ativo.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`,`text-align:center; padding:40px;`);return}let n=t.map(e=>{let t=e.aulas?e.aulas.filter(e=>e.visto).length:0,n=e.aulas?e.aulas.length:0,r=n>0?Math.round(t/n*100):0;return`
            <tr style="border-bottom:1px solid #eee;">
                <td style="text-align:center;"><input type="checkbox" class="check-plan-ativo" value="${e.id}"></td>
                <td style="padding:10px; font-weight:500;">
                    ${q.escapeHTML(e.nomeAluno)}
                    <div style="background:#ecf0f1; border-radius:10px; width:100%; height:4px; margin-top:5px; overflow:hidden;" title="${r}% Concluído">
                        <div style="background:${r===100?`#27ae60`:`#3498db`}; width:${r}%; height:100%;"></div>
                    </div>
                </td>
                <td style="padding:10px; color:#555;">${q.escapeHTML(e.curso)}</td>
                <td style="padding:10px; text-align:center; font-weight:bold; color:#7f8c8d;">${t}/${n}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirDashboardProgresso('${e.id}')" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer; box-shadow: 0 2px 4px rgba(52,152,219,0.3);" title="Visualizar Progresso Pedagógico">👁️</button>
                    <button onclick="App.abrirPlanejamentoEditavel('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Editar Grelha">✏️</button>
                    <button onclick="App.arquivarPlanejamento('${e.id}')" style="background:#8e44ad; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Arquivar">🗄️</button>
                    <button onclick="App.excluirPlanejamento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir">🗑️</button>
                </td>
            </tr>`}).join(``);e.innerHTML=q.UI.card(``,``,`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#27ae60;">Planejamentos Ativos</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <button onclick="App.excluirLotePedagogico('/planejamentos', 'check-plan-ativo', App.renderizarPlanejamentosSalvos)" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">🗑️ Excluir Selecionados</button>
                <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; gap: 10px; flex:1; min-width:250px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <span style="font-size: 18px; color: #aaa;">🔍</span>
                    <input type="text" id="input-busca-plan-ativos" 
                           placeholder="Pesquisar planejamento ativo..." 
                           oninput="App.filtrarTabela('input-busca-plan-ativos', 'tabela-plan-ativos')" 
                           style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
                </div>
            </div>
        
            <div class="table-responsive-wrapper">
                <table id="tabela-plan-ativos" style="width:100%; border-collapse:collapse;"><thead><tr><th style="width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheckMassa(this, 'check-plan-ativo')"></th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno (Progresso)</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr></thead><tbody>${n}</tbody></table>
            </div>
        `)}catch{e.innerHTML=`Erro.`}},q.abrirDashboardProgresso=async e=>{try{let t=await q.api(`/planejamentos/${e}?_t=${Date.now()}`);if(!t)return q.showToast(`Planejamento não encontrado.`,`error`);let n=t.aulas?t.aulas.length:0,r=t.aulas?t.aulas.filter(e=>e.visto).length:0,i=n-r,a=n>0?Math.round(r/n*100):0,o=t.aulas?t.aulas.find(e=>!e.visto):null,s=`modal-progresso-`+Date.now(),c=document.createElement(`div`);c.id=s,c.style.cssText=`position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:99999; backdrop-filter:blur(5px); opacity:0; transition:opacity 0.3s; padding: 20px; box-sizing: border-box;`;let l=``;o?l=`
                <div style="background: #e8f4f8; border-left: 4px solid #3498db; padding: 20px; border-radius: 8px; text-align: left; margin-top: 25px;">
                    <div style="font-size: 12px; font-weight: bold; color: #3498db; text-transform: uppercase; margin-bottom: 8px;">⏭️ Próxima Aula Programada (Nº ${o.num})</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div>
                            <div style="font-size: 20px; font-weight: bold; color: #2c3e50;">${q.escapeHTML(o.data)}</div>
                            <div style="font-size: 14px; color: #7f8c8d; margin-top:3px;">⏰ ${q.escapeHTML(o.hora)} <span style="color:#bdc3c7;">(Duração: ${q.escapeHTML(o.duracao)})</span></div>
                        </div>
                        <div style="flex: 1; min-width: 250px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1e8f0; box-shadow: 0 2px 5px rgba(52,152,219,0.05);">
                            <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px; font-weight:bold;">CONTEÚDO PREVISTO:</div>
                            <div style="font-size: 15px; color: #34495e; font-weight: 500; line-height: 1.4;">${q.escapeHTML(o.conteudo||`Nenhum conteúdo específico descrito no plano.`)}</div>
                        </div>
                    </div>
                </div>
            `:n>0&&i===0&&(l=`
                <div style="background: #eafaf1; border-left: 4px solid #27ae60; padding: 20px; border-radius: 8px; text-align: left; margin-top: 25px; display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 35px;">🏆</div>
                    <div>
                        <div style="font-size: 18px; font-weight: bold; color: #27ae60;">Planejamento Concluído!</div>
                        <div style="font-size: 14px; color: #2c3e50; margin-top:3px;">Todas as ${n} aulas foram ministradas com sucesso.</div>
                    </div>
                </div>
            `);let u=document.createElement(`div`);u.style.cssText=`background:#fff; width:100%; max-width:700px; border-radius:15px; padding:30px; box-shadow:0 15px 40px rgba(0,0,0,0.3); transform:scale(0.95); transition:transform 0.3s; position:relative; max-height: 90vh; overflow-y: auto;`,u.innerHTML=`
            <button id="fechar-${s}" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; color: #95a5a6; cursor: pointer; transition: 0.2s; outline:none;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='#95a5a6'">✖</button>
            
            <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 25px;">
                <div style="background: #f4f6f7; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px;">🎓</div>
                <div style="text-align: left;">
                    <h2 style="margin: 0; color: #2c3e50; font-size: 22px;">${q.escapeHTML(t.nomeAluno)}</h2>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top:2px;">Curso: <b style="color:#2c3e50;">${q.escapeHTML(t.curso)}</b> | Status: <b>${q.escapeHTML(t.status)}</b></div>
                </div>
            </div>

            <!-- Barra de Progresso Dinâmica -->
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: bold; color: #2c3e50; font-size: 14px;">Evolução do Curso</span>
                    <span style="font-weight: bold; color: ${a===100?`#27ae60`:`#3498db`}; font-size: 14px;">${a}%</span>
                </div>
                <div style="width: 100%; height: 12px; background: #ecf0f1; border-radius: 10px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="width: ${a}%; height: 100%; background: ${a===100?`#27ae60`:`linear-gradient(90deg, #3498db, #2980b9)`}; transition: width 1s ease-in-out;"></div>
                </div>
            </div>

            <!-- KPIs -->
            <div style="display: flex; gap: 15px; flex-wrap: wrap; text-align: center;">
                <div style="flex: 1; min-width: 120px; background: #fdfbf7; border: 1px solid #f1c40f; padding: 15px; border-radius: 8px; box-shadow:0 2px 5px rgba(241, 196, 15, 0.1);">
                    <div style="font-size: 11px; color: #d35400; font-weight: bold; text-transform: uppercase;">Total de Aulas</div>
                    <div style="font-size: 28px; font-weight: 900; color: #2c3e50; margin-top: 5px;">${n}</div>
                </div>
                <div style="flex: 1; min-width: 120px; background: #eafaf1; border: 1px solid #2ecc71; padding: 15px; border-radius: 8px; box-shadow:0 2px 5px rgba(46, 204, 113, 0.1);">
                    <div style="font-size: 11px; color: #27ae60; font-weight: bold; text-transform: uppercase;">Concluídas</div>
                    <div style="font-size: 28px; font-weight: 900; color: #27ae60; margin-top: 5px;">${r}</div>
                </div>
                <div style="flex: 1; min-width: 120px; background: #fdf2f2; border: 1px solid #e74c3c; padding: 15px; border-radius: 8px; box-shadow:0 2px 5px rgba(231, 76, 60, 0.1);">
                    <div style="font-size: 11px; color: #c0392b; font-weight: bold; text-transform: uppercase;">Pendentes</div>
                    <div style="font-size: 28px; font-weight: 900; color: #c0392b; margin-top: 5px;">${i}</div>
                </div>
            </div>

            <!-- Bússola Pedagógica (Próxima Aula) -->
            ${l}

            <!-- Botões de Ação -->
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <button id="btn-fechar-${s}" style="padding: 12px 25px; border: 1px solid #bdc3c7; background: #fff; color: #7f8c8d; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#f4f6f7'" onmouseout="this.style.background='#fff'">FECHAR</button>
                <button id="btn-editar-${s}" style="padding: 12px 25px; border: none; background: #f39c12; color: white; border-radius: 5px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(243, 156, 18, 0.3); transition: 0.2s;" onmouseover="this.style.background='#e67e22'" onmouseout="this.style.background='#f39c12'">✏️ EDITAR GRELHA COMPLETA</button>
            </div>
        `,c.appendChild(u),document.body.appendChild(c),setTimeout(()=>{c.style.opacity=`1`,u.style.transform=`scale(1)`},10);let d=()=>{c.style.opacity=`0`,u.style.transform=`scale(0.95)`,setTimeout(()=>document.body.removeChild(c),300)};document.getElementById(`fechar-${s}`).onclick=d,document.getElementById(`btn-fechar-${s}`).onclick=d,document.getElementById(`btn-editar-${s}`).onclick=()=>{d(),q.abrirPlanejamentoEditavel(e)}}catch{q.showToast(`Erro ao abrir relatório de progresso.`,`error`)}},q.renderizarPlanejamentosArquivados=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`Carregando arquivados...`;try{let t=(await q.api(`/planejamentos?_t=${Date.now()}`)).filter(e=>e.status===`Arquivado`);if(t.length===0){e.innerHTML=q.UI.card(``,``,`<h3>Nenhum planejamento no arquivo morto.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`,`text-align:center; padding:40px;`);return}let n=t.map(e=>`
            <tr style="border-bottom:1px solid #ddd; background:#f9f9f9;">
                <td style="text-align:center;"><input type="checkbox" class="check-plan-arq" value="${e.id}"></td>
                <td style="padding:10px; color:#7f8c8d; font-weight:500;">${q.escapeHTML(e.nomeAluno)}</td>
                <td style="padding:10px; color:#7f8c8d;">${q.escapeHTML(e.curso)}</td>
                <td style="padding:10px; text-align:center; color:#7f8c8d;">${e.aulas?e.aulas.length:0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoVisualizacao('${e.id}')" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Visualizar">👁️</button>
                    <button onclick="App.restaurarPlanejamento('${e.id}')" style="background:#27ae60; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Restaurar / Reativar">♻️</button>
                    <button onclick="App.excluirPlanejamentoArquivado('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir Definitivamente">🗑️</button>
                </td>
            </tr>`).join(``);e.innerHTML=q.UI.card(``,``,`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; color:#8e44ad;">🗄️ Planejamentos Arquivados</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <p style="color:#666; font-size:13px; margin-bottom:20px;">Estes planejamentos foram finalizados/arquivados. Não são contabilizados no boletim nem no auto-ajuste de presenças.</p>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <button onclick="App.excluirLotePedagogico('/planejamentos', 'check-plan-arq', App.renderizarPlanejamentosArquivados)" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">🗑️ Excluir Selecionados</button>
                <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; gap: 10px; flex:1; min-width:250px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <span style="font-size: 18px; color: #aaa;">🔍</span>
                    <input type="text" id="input-busca-plan-arquivados" 
                           placeholder="Pesquisar arquivo morto..." 
                           oninput="App.filtrarTabela('input-busca-plan-arquivados', 'tabela-plan-arquivados')" 
                           style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
                </div>
            </div>
        
            <div class="table-responsive-wrapper">
                <table id="tabela-plan-arquivados" style="width:100%; border-collapse:collapse;"><thead><tr><th style="width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheckMassa(this, 'check-plan-arq')"></th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr></thead><tbody>${n}</tbody></table>
            </div>
        `)}catch{e.innerHTML=`Erro ao ler arquivados.`}},q.gerarGridEditavel=()=>{let e=document.getElementById(`plan-aluno`),t=e.value;if(!t)return alert(`Selecione um aluno.`);let n=e.options[e.selectedIndex].text,r=e.options[e.selectedIndex].getAttribute(`data-curso`)||`Geral`,i=document.getElementById(`plan-inicio`).value,a=parseInt(document.getElementById(`plan-qtd`).value),o=document.getElementById(`plan-hora`).value,s=document.getElementById(`plan-duracao`).value,c=Array.from(document.querySelectorAll(`.plan-dia:checked`)).map(e=>parseInt(e.value));if(!i||c.length===0)return alert(`Preencha os dados corretamente.`);let l=[],u=new Date(i+`T00:00:00`),d=0;for(;d<a;){if(c.includes(u.getDay())){d++;let e=String(u.getDate()).padStart(2,`0`),t=String(u.getMonth()+1).padStart(2,`0`),n=u.getFullYear();l.push({num:d,data:`${e}/${t}/${n}`,hora:o,duracao:s,conteudo:``,visto:!1})}u.setDate(u.getDate()+1)}q.renderizarTelaEdicao({id:null,idAluno:t,nomeAluno:n,curso:r,status:`Ativo`,aulas:l})},q.abrirPlanejamentoEditavel=async e=>{try{let t=await q.api(`/planejamentos/${e}?_t=${Date.now()}`);q.renderizarTelaEdicao(t)}catch{alert(`Erro.`)}},q.abrirPlanejamentoVisualizacao=async e=>{try{let t=await q.api(`/planejamentos/${e}?_t=${Date.now()}`);q.renderizarTelaEdicao(t,!0)}catch{alert(`Erro ao abrir.`)}},q.renderizarTelaEdicao=(e,t=!1)=>{q.planoAtual=e;let n=document.getElementById(`app-content`),r=0;e.aulas.forEach(e=>{if(e.duracao&&e.duracao.includes(`:`)){let[t,n]=e.duracao.split(`:`).map(Number);r+=t*60+(n||0)}});let i=Math.floor(r/60),a=r%60,o=a>0?`${i}h ${a}m`:`${i}H`,s=JSON.parse(localStorage.getItem(q.getTenantKey?q.getTenantKey(`escola_perfil`):`escola_perfil`))||{},c=s.foto?`<img src="${s.foto}" style="height:50px;">`:``,l=t?`App.renderizarPlanejamentosArquivados()`:`App.renderizarPlanejamentosSalvos()`,u=t?`<br><span style="color:#e74c3c; font-size:12px;">(ARQUIVADO - APENAS LEITURA)</span>`:``;n.innerHTML=`
        <div class="no-print" style="margin-bottom:20px; background:#f4f4f4; padding:15px; border-radius:10px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            ${t?``:`
            <button onclick="App.salvarPlanejamentoBanco()" style="background:#27ae60; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">💾 SALVAR</button>
            <button id="btn-sync-plan" onclick="App.sincronizarPlanejamentoComChamadasUI()" style="background:#8e44ad; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 10px rgba(142,68,173,0.3);" title="Ajusta datas e a duração exata registada na chamada de presença!">🤖 AUTO-AJUSTAR</button>
            `}
            <button onclick="window.print()" style="background:#3498db; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">🖨️ IMPRIMIR</button>
            <button onclick="${l}" style="background:#7f8c8d; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">FECHAR</button>
        </div>
        
        <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
            <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:15px;">${c}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${q.escapeHTML(s.nome||`ESCOLA`)}</h2><div style="font-size:12px;">CNPJ: ${q.escapeHTML(s.cnpj||``)}</div></div></div>
                <div style="text-align:right;"><div><b>Planejamento Pedagógico</b> ${u}</div><div style="font-size:12px;">Emissão: ${new Date().toLocaleDateString(`pt-BR`)}</div></div>
            </div>
            
            <div style="border:1px solid #000; padding:10px; font-size:12px; margin-bottom:15px; background:#fafafa;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="width:60%;">
                        <div style="margin-bottom:5px;"><b>ALUNO:</b> ${q.escapeHTML(e.nomeAluno)}</div>
                        <div><b>TOTAL DE AULAS:</b> ${e.aulas.length}</div>
                    </div>
                    <div style="width:40%;">
                        <div style="margin-bottom:5px;"><b>CURSO:</b> ${q.escapeHTML(e.curso)}</div>
                        <div><b>CARGA HORÁRIA PREVISTA:</b> ${o}</div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                    <thead><tr style="border-bottom:1px solid #000;"><th style="width:5%; padding:8px;">Nº</th><th style="width:15%; padding:8px;">DATA</th><th style="width:12%; padding:8px;">HORÁRIO</th><th style="width:12%; padding:8px;">DURAÇÃO</th><th style="padding:8px;">CONTEÚDO / OBS</th><th style="width:5%; padding:8px;">OK</th></tr></thead>
                    <tbody>
                        ${e.aulas.map((e,n)=>`
                        <tr>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">${e.num}</td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${q.escapeHTML(e.data)}" onchange="App.atualizarAula(${n},'data',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${q.escapeHTML(e.hora)}" onchange="App.atualizarAula(${n},'hora',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent; font-weight:bold; color:#2980b9;" value="${q.escapeHTML(e.duracao)}" onchange="App.atualizarAula(${n},'duracao',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; background:transparent;" placeholder="..." value="${q.escapeHTML(e.conteudo)}" onchange="App.atualizarAula(${n},'conteudo',this.value)"></td>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;"><input type="checkbox" ${t?`disabled`:``} ${e.visto?`checked`:``} onchange="App.atualizarAula(${n},'visto',this.checked)"></td>
                        </tr>`).join(``)}
                        <tr style="background:#eee; font-weight:bold; border-top:2px solid #000;"><td colspan="3" style="text-align:right; padding:10px;">Carga Horária Total =</td><td style="text-align:center; padding:10px; color:#2980b9;">${o}</td><td colspan="2"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>`},q.atualizarAula=(e,t,n)=>{q.planoAtual&&q.planoAtual.aulas[e]&&(q.planoAtual.aulas[e][t]=n),t===`duracao`&&q.renderizarTelaEdicao(q.planoAtual)},q.salvarPlanejamentoBanco=async()=>{if(!q.planoAtual)return;document.activeElement&&document.activeElement.blur();let e=q.planoAtual.id?`PUT`:`POST`,t=q.planoAtual.id?`/planejamentos/${q.planoAtual.id}`:`/planejamentos`;q.planoAtual.id||(q.planoAtual.id=typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString()),q.planoAtual.status||(q.planoAtual.status=`Ativo`);let n=document.querySelector(`button[onclick="App.salvarPlanejamentoBanco()"]`),r=n?n.innerText:`💾 SALVAR`;n&&(n.innerText=`A sincronizar tudo... ⏳`,n.disabled=!0),document.body.style.cursor=`wait`;try{await q.api(t,e,q.planoAtual);let n=(await q.api(`/chamadas?_t=${Date.now()}`)).filter(e=>e.idAluno===q.planoAtual.idAluno),r=new Date().toISOString().split(`T`)[0],i=[],a=0,o=0,s=0;q.planoAtual.aulas.forEach((e,t)=>{let c=e.data.includes(`/`)?e.data.split(`/`):e.data.split(`-`);if(c.length===3){let l=c[0].length===4?`${c[0]}-${c[1]}-${c[2]}`:`${c[2]}-${c[1]}-${c[0]}`;if(l<=r){let r=n.find(e=>e.data===l);if(e.visto===!0)if(r)r.status!==`Presença`&&r.status!==`Reposição`?(i.push(q.api(`/chamadas/${r.id}`,`PUT`,{...r,status:`Presença`,duracao:e.duracao})),o++):r.duracao!==e.duracao&&(i.push(q.api(`/chamadas/${r.id}`,`PUT`,{...r,duracao:e.duracao})),o++);else{let n={id:Date.now().toString()+Math.floor(Math.random()*1e3)+t,idAluno:q.planoAtual.idAluno,nomeAluno:q.planoAtual.nomeAluno,data:l,status:`Presença`,duracao:e.duracao||`01:00`};i.push(q.api(`/chamadas`,`POST`,n)),a++}else r&&(r.status===`Presença`||r.status===`Reposição`)&&(i.push(q.api(`/chamadas/${r.id}`,`DELETE`)),s++)}}}),i.length>0&&await Promise.all(i);let c=`Planejamento Salvo!`;(a>0||o>0||s>0)&&(c+=` Sincronizado: ${a}✅ | ${o}✏️ | ${s}🗑️`),q.showToast(c,`success`);let l=document.getElementById(`app-content`);l&&(l.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await q.renderizarPlanejamentosSalvos()}catch(e){q.showToast(`Erro na sincronização.`,`error`),console.error(e)}finally{n&&(n.innerText=r,n.disabled=!1),document.body.style.cursor=`default`}},q.arquivarPlanejamento=e=>{q.confirmar(`Arquivar Planejamento`,`Tem a certeza que deseja enviar este planejamento para o arquivo morto? Ele deixará de aparecer na sua lista principal.`,`Sim, Arquivar`,`#8e44ad`,async()=>{try{let t=(await q.api(`/planejamentos?_t=${Date.now()}`)).find(t=>String(t.id)===String(e));if(!t)return q.showToast(`Planejamento não encontrado.`,`error`);t.status=`Arquivado`,await q.api(`/planejamentos/${e}`,`PUT`,t),q.showToast(`Planejamento Arquivado com sucesso!`,`success`);let n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await q.renderizarPlanejamentosSalvos()}catch{q.showToast(`Erro ao arquivar.`,`error`)}})},q.restaurarPlanejamento=e=>{q.confirmar(`Restaurar Planejamento`,`Deseja reativar este planejamento e devolvê-lo para a lista ativa?`,`Restaurar`,`#27ae60`,async()=>{try{let t=(await q.api(`/planejamentos?_t=${Date.now()}`)).find(t=>String(t.id)===String(e));if(!t)return q.showToast(`Planejamento não encontrado.`,`error`);t.status=`Ativo`,await q.api(`/planejamentos/${e}`,`PUT`,t),q.showToast(`Planejamento Reativado com sucesso!`,`success`);let n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando arquivo morto... ⏳</p>`),await q.renderizarPlanejamentosArquivados()}catch{q.showToast(`Erro ao reativar.`,`error`)}})},q.excluirPlanejamento=e=>{q.confirmar(`Atenção!`,`Deseja excluir DEFINITIVAMENTE este planejamento? Esta ação é irreversível.`,`Excluir`,`#e74c3c`,async()=>{await q.api(`/planejamentos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await q.renderizarPlanejamentosSalvos()})},q.excluirPlanejamentoArquivado=e=>{q.confirmar(`Atenção!`,`Deseja limpar este registo do arquivo morto para sempre?`,`Excluir`,`#e74c3c`,async()=>{await q.api(`/planejamentos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando arquivo morto... ⏳</p>`),await q.renderizarPlanejamentosArquivados()})},q.processarAutoAjustePlano=(e,t)=>{if(!e||!e.aulas||e.aulas.length===0)return e;let n=e.aulas[0].data,r=n.includes(`/`)?n.split(`/`):n.split(`-`),i=r[0].length===4?`${r[0]}-${r[1]}-${r[2]}`:`${r[2]}-${r[1]}-${r[0]}`,a=t.filter(t=>t.idAluno===e.idAluno&&t.data>=i).sort((e,t)=>new Date(e.data)-new Date(t.data)),o=a.filter(e=>e.status===`Presença`||e.status===`Reposição`),s=[];if(o.length>0){let e=o.slice(-4);s=[...new Set(e.map(e=>{let[t,n,r]=e.data.split(`-`);return new Date(`${t}-${n}-${r}T12:00:00`).getDay()}))]}if(s.length===0){let t=[...new Set(e.aulas.map(e=>{if(!e.data)return-1;let t=e.data.includes(`/`)?e.data.split(`/`):e.data.split(`-`);if(t.length===3){let e=t[0].length===4?t[0]:t[2],n=t[1],r=t[0].length===2?t[0]:t[2],i=new Date(`${e}-${n}-${r}T12:00:00`);return isNaN(i.getTime())?-1:i.getDay()}return-1}).filter(e=>e!==-1))];s=t.length>0?t:[1,2,3,4,5]}let c=0,l=e.aulas.length>0?e.aulas[0].hora:`08:00`,u=new Date(`${i}T12:00:00`);if(u.setDate(u.getDate()-1),a.length>0){let e=a[a.length-1];u=new Date(`${e.data}T12:00:00`)}for(let t=0;t<e.aulas.length;t++){let n=e.aulas[t];if(n.hora&&(l=n.hora),c<o.length){let e=o[c],t=e.data,r=t.includes(`/`)?t.split(`/`):t.split(`-`),i=r[0].length===4?r[0]:r[2],a=r[1];n.data=`${r[0].length===2?r[0]:r[2]}/${a}/${i}`,e.duracao&&(n.duracao=e.duracao),n.visto=!0,c++}else{for(n.visto=!1,u.setDate(u.getDate()+1);!s.includes(u.getDay());)u.setDate(u.getDate()+1);n.data=`${String(u.getDate()).padStart(2,`0`)}/${String(u.getMonth()+1).padStart(2,`0`)}/${u.getFullYear()}`}}for(;c<o.length;){let t=o[c],[n,r,i]=t.data.split(`-`);e.aulas.push({num:e.aulas.length+1,data:`${i}/${r}/${n}`,hora:l,duracao:t.duracao||`01:00`,conteudo:`Aula Adicional (Auto-Ajuste)`,visto:!0}),c++}return e},q.sincronizarPlanejamentoComChamadasUI=async()=>{if(!q.planoAtual||!q.planoAtual.idAluno)return;let e=document.getElementById(`btn-sync-plan`),t=e.innerHTML;e.innerHTML=`A analisar Padrões... ⏳`,e.disabled=!0,document.body.style.cursor=`wait`;try{let e=await q.api(`/chamadas?_t=${Date.now()}`);q.planoAtual=q.processarAutoAjustePlano(q.planoAtual,e),q.renderizarTelaEdicao(q.planoAtual),q.showToast(`Datas, Tempos e Aulas Extra Sincronizados! 🎉`,`success`)}catch{q.showToast(`Erro ao sincronizar planejamento.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1),document.body.style.cursor=`default`}},q.renderizarBoletimVisual=async()=>{q.setTitulo(`Boletim Escolar`);let e=document.getElementById(`app-content`);e.innerHTML=`Carregando...`;try{let t=`
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;">${`<option value="">-- Selecione o Aluno --</option>`+(await q.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${q.escapeHTML(e.nome)}</option>`).join(``)}</select>
                <button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR BOLETIM</button>
            </div>
        `;e.innerHTML=q.UI.card(`📄 Emitir Boletim Escolar`,``,t,`800px`)+`<div id="boletim-area" style="margin-top:30px;"></div>`}catch{e.innerHTML=`Erro.`}},q.gerarBoletimTela=async()=>{let e=document.getElementById(`bol-aluno`).value;if(!e)return q.showToast(`Selecione um aluno.`,`error`);let t=document.getElementById(`boletim-area`);t.innerHTML=`<p style="text-align:center;">A gerar boletim...</p>`;let n=parseFloat(localStorage.getItem(q.getTenantKey?q.getTenantKey(`media_aprovacao`):`media_aprovacao`))||6,r=localStorage.getItem(q.getTenantKey?q.getTenantKey(`regime_letivo`):`regime_letivo`)||`Bimestral`,i=6,a=`BIMESTRE`;r===`Trimestral`?(i=4,a=`TRIMESTRE`):r===`Semestral`?(i=2,a=`SEMESTRE`):r===`Anual`&&(i=1,a=`PERÍODO ÚNICO`);try{let[r,o,s,c,l]=await Promise.all([q.api(`/alunos/${e}`),q.api(`/avaliacoes?_t=${Date.now()}`),q.api(`/chamadas?_t=${Date.now()}`),q.api(`/escola`),q.api(`/planejamentos?_t=${Date.now()}`)]),u=l.find(t=>t.idAluno===e&&t.status!==`Arquivado`),d=s.filter(t=>t.idAluno===e&&(t.status===`Presença`||t.status===`Reposição`)).sort((e,t)=>new Date(e.data)-new Date(t.data)),f=`__/__/____`,p=`__/__/____`,m=0;d.forEach(e=>{if(e.duracao&&e.duracao.includes(`:`)){let[t,n]=e.duracao.split(`:`).map(Number);m+=t*60+(n||0)}});let h=Math.floor(m/60),g=m%60,_=g>0?`${h}h ${g}m`:`${h}H`;u&&u.aulas&&u.aulas.length>0?(f=q.escapeHTML(u.aulas[0].data),p=q.escapeHTML(u.aulas[u.aulas.length-1].data)):d.length>0?(f=d[0].data.split(`-`).reverse().join(`/`),p=d[d.length-1].data.split(`-`).reverse().join(`/`)):f=new Date().toLocaleDateString(`pt-BR`);let v=q.escapeHTML(r.curso||(u?u.curso:`Geral`)),y=q.escapeHTML(r.turma||`Não informada`),b=o.filter(t=>t.idAluno===e&&t.comporBoletim!==!1),x={};b.forEach(e=>{let t=e.disciplina||`Geral`;x[t]||(x[t]={nome:t,notas:[],total:0,periodosLancados:new Set}),x[t].notas.push(e),x[t].total+=parseFloat(e.nota)||0;let n=e.periodo||e.bimestre;n&&x[t].periodosLancados.add(n)});let S=``;Object.keys(x).length===0?S=`<tr><td colspan="4" style="text-align:center; padding:15px; color:#999;">Sem notas oficiais lançadas para este aluno.</td></tr>`:Object.keys(x).forEach(e=>{let t=x[e],r=n*(t.periodosLancados.size>0?t.periodosLancados.size:1),a=n*i,o=t.total>=r,s=o?`#27ae60`:`#c0392b`,c=o?`<span style="color:${s}; font-weight:bold; font-size:14px;">NO PADRÃO</span>`:`<span style="color:${s}; font-weight:bold; font-size:14px;">RECUPERAÇÃO</span>`,l=t.notas.map(e=>`<span style="font-size:11px;">${q.escapeHTML(e.periodo||e.bimestre)} - ${q.escapeHTML(e.tipo)}: <b>${q.escapeHTML(e.nota)}</b></span>`).join(`<br>`);S+=`
                <tr>
                    <td style="padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><b>${q.escapeHTML(t.nome)}</b></td>
                    <td style="padding:10px; border-bottom:1px solid #eee;">${l}</td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><span style="font-size:16px; font-weight:bold; color:${s};">${t.total.toFixed(1)}</span></td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;">${c}<br><span style="font-size:10px; color:#7f8c8d;">Meta Anual: ${a.toFixed(1)} pts</span></td>
                </tr>`});let C=c.foto?`<img src="${c.foto}" style="height:60px; object-fit:contain;">`:``,w=new Date().toLocaleDateString(`pt-BR`);t.innerHTML=`
            <div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR BOLETIM</button></div>
            <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${C}<div><h2 style="margin:0; text-transform:uppercase;">${q.escapeHTML(c.nome||`INSTITUIÇÃO`)}</h2><div style="font-size:12px;">CNPJ: ${q.escapeHTML(c.cnpj||``)}</div></div></div>
                    <div style="text-align:right;"><div><b>BOLETIM ESCOLAR</b></div><div style="font-size:10px; color:#999;">Emissão: ${w}</div></div>
                </div>
                <div style="padding:15px; background:#fafafa; border:1px solid #000; margin-bottom:15px;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">ALUNO: ${q.escapeHTML(r.nome).toUpperCase()}</div>
                    <div style="font-size:13px; margin-bottom:10px;"><b>CURSO:</b> ${v} &nbsp;&nbsp;|&nbsp;&nbsp; <b>TURMA:</b> ${y}</div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #ccc; padding-top:5px; font-size:12px;">
                        <div>INÍCIO DAS AULAS: <b>${f}</b></div>
                        <div>PREVISÃO DE TÉRMINO: <b>${p}</b></div>
                        <div>CARGA HORÁRIA CUMPRIDA: <b style="color:#2980b9;">${_}</b></div>
                    </div>
                </div>
                <div class="table-responsive-wrapper">
                    <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                        <thead><tr style="border-bottom:2px solid #000;"><th style="padding:10px; width:30%;">DISCIPLINA</th><th style="padding:10px; width:30%;">AVALIAÇÕES (${a})</th><th style="text-align:center; padding:10px; width:15%;">NOTA TOTAL</th><th style="text-align:center; padding:10px; width:25%;">RESULTADO</th></tr></thead>
                        <tbody>${S}</tbody>
                    </table>
                </div>
                <div style="padding:40px 30px 10px 30px; text-align:center;"><div style="width:300px; margin:0 auto; border-top:1px solid #333; padding-top:5px; font-size:12px;">Coordenação Pedagógica</div></div>
            </div>`}catch{q.showToast(`Erro ao gerar boletim.`,`error`)}},q.salvarConfigNotas=()=>{let e=document.getElementById(`config-nota-media`).value,t=document.getElementById(`config-nota-max`).value,n=document.getElementById(`config-nota-regime`).value;localStorage.setItem(q.getTenantKey?q.getTenantKey(`media_aprovacao`):`media_aprovacao`,e),localStorage.setItem(q.getTenantKey?q.getTenantKey(`nota_maxima`):`nota_maxima`,t),localStorage.setItem(q.getTenantKey?q.getTenantKey(`regime_letivo`):`regime_letivo`,n),q.showToast(`Regras de avaliação guardadas com sucesso!`,`success`),q.renderizarAvaliacoesPro()},q.renderizarAvaliacoesPro=async()=>{q.setTitulo(`Notas e Avaliações`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Carregando dados...</p>`;let t=localStorage.getItem(q.getTenantKey?q.getTenantKey(`media_aprovacao`):`media_aprovacao`)||`6.0`,n=localStorage.getItem(q.getTenantKey?q.getTenantKey(`nota_maxima`):`nota_maxima`)||`10.0`,r=localStorage.getItem(q.getTenantKey?q.getTenantKey(`regime_letivo`):`regime_letivo`)||`Bimestral`,i=parseFloat(t)/parseFloat(n),a=``,o=`Período`;r===`Bimestral`?(a=`<option value="1º Bimestre">1º Bimestre</option><option value="2º Bimestre">2º Bimestre</option><option value="3º Bimestre">3º Bimestre</option><option value="4º Bimestre">4º Bimestre</option><option value="5º Bimestre">5º Bimestre</option><option value="6º Bimestre">6º Bimestre</option>`,o=`Bimestre`):r===`Trimestral`?(a=`<option value="1º Trimestre">1º Trimestre</option><option value="2º Trimestre">2º Trimestre</option><option value="3º Trimestre">3º Trimestre</option><option value="4º Trimestre">4º Trimestre</option>`,o=`Trimestre`):r===`Semestral`?(a=`<option value="1º Semestre">1º Semestre</option><option value="2º Semestre">2º Semestre</option>`,o=`Semestre`):r===`Anual`&&(a=`<option value="Período Único">Período Único</option>`,o=`Período`);try{let[s,c,l,u]=await Promise.all([q.api(`/alunos`),q.api(`/turmas`),q.api(`/cursos`),q.api(`/avaliacoes?_t=${Date.now()}`)]);q.cacheAlunos=s;let d=u.sort((e,t)=>t.id-e.id),f=s.filter(e=>!e.status||e.status===`Ativo`),p=`<option value="">-- Turma Completa --</option>`+c.map(e=>`<option value="${q.escapeHTML(e.nome)}">${q.escapeHTML(e.nome)}</option>`).join(``),m=`<option value="">-- Aluno Específico --</option>`+f.map(e=>`<option value="${e.id}">${q.escapeHTML(e.nome)}</option>`).join(``),h=`<option value="Geral">Geral / Curso Padrão</option>`+l.map(e=>`<option value="${q.escapeHTML(e.nome)}">${q.escapeHTML(e.nome)}</option>`).join(``),g=new Date().toISOString().split(`T`)[0],_=`
            <div style="background:#fff; border-left:4px solid #8e44ad; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05); margin-bottom:20px; display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                <div style="width:100%; font-size:12px; font-weight:bold; color:#8e44ad; text-transform:uppercase; margin-bottom:-5px;">⚙️ Configuração do Sistema de Avaliação</div>
                ${X(`Regime Letivo:`,`config-nota-regime`,`<option value="Bimestral" ${r===`Bimestral`?`selected`:``}>Bimestral (6 Períodos)</option><option value="Trimestral" ${r===`Trimestral`?`selected`:``}>Trimestral (4 Períodos)</option><option value="Semestral" ${r===`Semestral`?`selected`:``}>Semestral (2 Períodos)</option><option value="Anual" ${r===`Anual`?`selected`:``}>Anual (1 Período)</option>`)}
                ${Y(`Média de Aprovação:`,`config-nota-media`,`number`,t,`step="0.1"`)}
                ${Y(`Nota Máx. do Período:`,`config-nota-max`,`number`,n,`step="0.1"`)}
                <button onclick="App.salvarConfigNotas()" class="btn-primary" style="background:#8e44ad; border:none; height:41px; padding:0 20px; margin-bottom: 5px;">💾 SALVAR REGRAS</button>
            </div>
        `,v=`
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${X(`Filtrar por Turma:`,`nota-turma`,p)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${X(`Buscar Aluno Único:`,`nota-aluno`,m)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px;">
                ${X(`Disciplina/Curso:`,`nota-disc`,h)}
                ${X(`Tipo de Avaliação:`,`nota-tipo`,`<option value="Teste">Teste Formativo</option><option value="Prova">Prova Oficial</option><option value="Pesquisa">Pesquisa</option><option value="Trabalho">Trabalho</option><option value="Outro">Outro (Especificar)</option>`,`onchange="App.toggleTipoOutroNota()"`)}
                <div id="div-outro-nota" style="flex: 1; min-width: 150px; display:none;">
                    <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Especifique:</label>
                    <input type="text" id="nota-outro-desc" placeholder="Ex: Seminário" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                </div>
                ${X(o+`:`,`nota-periodo`,a)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                ${Y(`Valor desta Avaliação (Pts):`,`nota-max`,`number`,n,`step="0.1"`)}
                ${Y(`Data da Avaliação:`,`nota-data`,`date`,g,`max="${g}"`)}
                <button onclick="App.carregarListaNotas()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR PAUTA</button>
                <button onclick="App.cancelarEdicaoNota()" id="btn-cancel-nota" style="height:41px; padding:0 20px; background:#95a5a6; color:white; border:none; border-radius:5px; display:none; cursor:pointer;">❌ Cancelar Edição</button>
            </div>
        `,y=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <button onclick="App.excluirLotePedagogico('/avaliacoes', 'check-nota', App.renderizarAvaliacoesPro)" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">🗑️ Excluir Selecionados</button>
                <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; gap: 10px; flex:1; min-width:250px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <span style="font-size: 18px; color: #aaa;">🔍</span>
                    <input type="text" id="input-busca-notas" placeholder="Pesquisar histórico..." oninput="App.filtrarTabela('input-busca-notas', 'tabela-historico-notas')" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
                </div>
            </div>
            <div class="table-responsive-wrapper">
                <table id="tabela-historico-notas" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;">
                            <th style="padding:12px; width:40px; text-align:center;"><input type="checkbox" onchange="App.toggleCheckMassa(this, 'check-nota')"></th><th style="padding:12px;">Aluno</th><th style="padding:12px;">Curso/Disc.</th><th style="padding:12px;">Data</th><th style="padding:12px;">Avaliação</th><th style="padding:12px;">Período</th><th style="padding:12px; text-align:center;">Nota / Valor</th><th style="padding:12px; text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${d.length===0?`<tr><td colspan="8" style="padding:20px; text-align:center; color:#999;">Nenhuma nota lançada.</td></tr>`:``}
                        ${d.map(e=>{let t=parseFloat(e.valorMax)||parseFloat(n),r=parseFloat(e.nota)/t>=i?`#27ae60`:`#c0392b`,a=e.comporBoletim===!1?`<span style="background:#f39c12; color:white; padding:3px 6px; border-radius:12px; font-size:10px; font-weight:bold; margin-left:5px;">TESTE</span>`:`<span style="background:#2980b9; color:white; padding:3px 6px; border-radius:12px; font-size:10px; font-weight:bold; margin-left:5px;">BOLETIM</span>`;return`
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px; text-align:center;"><input type="checkbox" class="check-nota" value="${e.id}"></td>
                                <td style="padding:12px; font-weight:bold;">${q.escapeHTML(e.nomeAluno)}</td>
                                <td style="padding:12px; color:#555;">${q.escapeHTML(e.disciplina||`-`)}</td>
                                <td style="padding:12px;">${e.data?q.escapeHTML(e.data.split(`-`).reverse().join(`/`)):`-`}</td>
                                <td style="padding:12px;">${q.escapeHTML(e.tipo)} ${a}</td>
                                <td style="padding:12px;">${q.escapeHTML(e.periodo||e.bimestre||`-`)}</td>
                                <td style="padding:12px; text-align:center;"><strong style="color:${r}">${q.escapeHTML(e.nota)}</strong> <span style="color:#999; font-size:11px;">/ ${q.escapeHTML(t)}</span></td>
                                <td style="padding:12px; text-align:right;">
                                    <button onclick="App.editarAvaliacao('${e.id}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;" title="Editar">✏️</button>
                                    <button onclick="App.excluirAvaliacao('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;" title="Excluir">🗑️</button>
                                </td>
                            </tr>`}).join(``)}
                    </tbody>
                </table>
            </div>
        `;e.innerHTML=_+q.UI.card(`📝 Lançamento de Notas / Habilidades`,``,v,`100%`)+`<div id="area-lista-notas" style="margin-top:20px;"></div><div style="margin-top:20px;">`+q.UI.card(`Histórico de Notas Lançadas`,``,y,`100%`)+`</div>`}catch{e.innerHTML=`Erro ao carregar avaliações.`}},q.toggleTipoOutroNota=()=>{let e=document.getElementById(`nota-tipo`).value;document.getElementById(`div-outro-nota`).style.display=e===`Outro`?`block`:`none`},q.editarAvaliacao=async e=>{let t=await q.api(`/avaliacoes/${e}?_t=${Date.now()}`);document.getElementById(`nota-aluno`).value=t.idAluno,document.getElementById(`nota-turma`).value=``,document.getElementById(`nota-disc`).value=t.disciplina||`Geral`,[`Teste`,`Prova`,`Pesquisa`,`Trabalho`].includes(t.tipo)?(document.getElementById(`nota-tipo`).value=t.tipo,document.getElementById(`div-outro-nota`).style.display=`none`):(document.getElementById(`nota-tipo`).value=`Outro`,q.toggleTipoOutroNota(),document.getElementById(`nota-outro-desc`).value=t.tipo),document.getElementById(`nota-max`).value=t.valorMax;let n=document.getElementById(`nota-periodo`);n&&(n.value=t.periodo||t.bimestre),document.getElementById(`nota-data`).value=t.data||new Date().toISOString().split(`T`)[0],document.getElementById(`btn-cancel-nota`).style.display=`inline-block`,q.idAvaliacaoEditando=e,q.carregarListaNotas(),document.querySelector(`.card`).scrollIntoView({behavior:`smooth`})},q.cancelarEdicaoNota=()=>{q.idAvaliacaoEditando=null,document.getElementById(`nota-aluno`).value=``,document.getElementById(`btn-cancel-nota`).style.display=`none`,document.getElementById(`area-lista-notas`).innerHTML=``,q.showToast(`Modo de edição cancelado.`,`info`)},q.carregarListaNotas=async()=>{let e=document.getElementById(`nota-turma`).value,t=document.getElementById(`nota-aluno`).value,n=document.getElementById(`nota-disc`).value,r=document.getElementById(`nota-tipo`).value;r===`Outro`&&(r=document.getElementById(`nota-outro-desc`).value||`Outro`);let i=document.getElementById(`nota-data`).value,a=document.getElementById(`nota-max`).value;if(!e&&!t)return q.showToast(`Selecione uma Turma OU um Aluno específico.`,`warning`);if(!n||!i)return q.showToast(`Preencha Disciplina e Data.`,`warning`);if(i>new Date().toISOString().split(`T`)[0])return q.showToast(`Não é permitido abrir pautas para datas futuras.`,`warning`);let o=document.getElementById(`area-lista-notas`);o.innerHTML=`<p style="text-align:center; padding:20px;">A preparar pauta de lançamento... ⏳</p>`;try{let[s,c]=await Promise.all([q.api(`/alunos`),q.api(`/avaliacoes?_t=${Date.now()}`)]),l=[];if(l=t?s.filter(e=>e.id===t):s.filter(t=>t.turma===e),l=l.filter(e=>!e.status||e.status===`Ativo`),l.length===0){o.innerHTML=`<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno ativo encontrado para este filtro.</p></div>`;return}let u=``,d=!0;l.forEach(e=>{let t=null;t=q.idAvaliacaoEditando&&e.id===document.getElementById(`nota-aluno`).value?c.find(e=>e.id===q.idAvaliacaoEditando):c.find(t=>t.idAluno===e.id&&t.data===i&&t.disciplina===n&&t.tipo===r);let o=t?t.nota:``;t&&t.comporBoletim===!1&&(d=!1);let s=q.idAvaliacaoEditando&&t?`data-id-avaliacao="${t.id}"`:``;u+=`
            <tr style="border-bottom:1px solid #eee;" class="linha-nota" data-id="${e.id}" data-nome="${q.escapeHTML(e.nome)}" ${s}>
                <td style="padding:12px; font-weight:500;">${q.escapeHTML(e.nome)}</td>
                <td style="padding:12px; width:150px;">
                    <input type="number" class="valor-nota" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; text-align:center; font-weight:bold; color:var(--accent);" step="0.1" max="${a}" placeholder="0.0" value="${q.escapeHTML(o)}">
                </td>
            </tr>`}),o.innerHTML=(q.idAvaliacaoEditando?`<div style="background:#f39c12; color:#fff; padding:10px; text-align:center; font-weight:bold; margin-bottom:10px; border-radius:5px; animation: pop 0.3s;">⚠️ MODO DE EDIÇÃO ATIVO</div>`:``)+`
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #2980b9;">
                <div style="padding:15px; background:#e8f4f8; border-bottom:1px solid #d1e8f0; font-size:13px; color:#2980b9; display:flex; justify-content:space-between; align-items:center;">
                    <span><b>Lançamento:</b> ${q.escapeHTML(r)} de ${q.escapeHTML(n)}</span>
                    <span style="background:#2980b9; color:white; padding:4px 10px; border-radius:12px; font-weight:bold;">Máx: ${q.escapeHTML(a)} pts</span>
                </div>
                <div class="table-responsive-wrapper" style="margin:0; border:none;">
                    <table style="width:100%; border-collapse:collapse; min-width:400px;">
                        <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">ALUNO</th><th style="padding:15px; text-align:center;">NOTA OBTIDA</th></tr></thead>
                        <tbody>${u}</tbody>
                    </table>
                </div>
                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                    <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:bold; color:#2c3e50; font-size:14px; background:#fff; padding:10px 15px; border:1px solid #ccc; border-radius:8px; transition:0.2s;" onmouseover="this.style.background='#f1f1f1'" onmouseout="this.style.background='#fff'">
                        <input type="checkbox" id="nota-vai-boletim" style="width:18px; height:18px;" ${d?`checked`:``}>
                        Contabilizar no Boletim Oficial
                    </label>
                    <button onclick="App.salvarNotasLote()" class="btn-primary" style="background:#2980b9;">💾 SALVAR AVALIAÇÃO</button>
                </div>
            </div>
        `}catch{o.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar a pauta.</p>`}},q.salvarNotasLote=async()=>{let e=document.getElementById(`nota-disc`).value,t=document.getElementById(`nota-tipo`).value;t===`Outro`&&(t=document.getElementById(`nota-outro-desc`).value||`Outro`);let n=document.getElementById(`nota-data`).value,r=document.getElementById(`nota-max`).value,i=document.getElementById(`nota-periodo`).value,a=document.getElementById(`nota-vai-boletim`),o=a?a.checked:!0,s=document.querySelectorAll(`.linha-nota`);if(s.length===0)return;if(n>new Date().toISOString().split(`T`)[0])return q.showToast(`Bloqueado: Não é possível gravar notas com datas futuras.`,`error`);let c=document.querySelector(`button[onclick="App.salvarNotasLote()"]`),l=c.innerText;c.innerText=`Arquivando... ⏳`,c.disabled=!0,document.body.style.cursor=`wait`;try{let a=[],c=await q.api(`/avaliacoes?_t=${Date.now()}`);s.forEach(s=>{let l=s.getAttribute(`data-id`),u=s.getAttribute(`data-nome`),d=s.getAttribute(`data-id-avaliacao`),f=s.querySelector(`.valor-nota`).value;if(f===``)return;let p=null;p=d?c.find(e=>e.id===d):c.find(r=>r.idAluno===l&&r.data===n&&r.disciplina===e&&r.tipo===t);let m={idAluno:l,nomeAluno:u,disciplina:e,tipo:t,data:n,valorMax:r,nota:f,periodo:i,bimestre:i,dataLancamento:new Date().toISOString().split(`T`)[0],comporBoletim:o};p?a.push(q.api(`/avaliacoes/${p.id}`,`PUT`,{...p,nota:f,valorMax:r,data:n,disciplina:e,tipo:t,periodo:i,bimestre:i,comporBoletim:o})):(m.id=typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).substr(2),a.push(q.api(`/avaliacoes`,`POST`,m)))}),await Promise.all(a),q.showToast(`Avaliação arquivada com sucesso!`,`success`),q.cancelarEdicaoNota();let l=document.getElementById(`app-content`);l&&(l.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando avaliações... ⏳</p>`),await q.renderizarAvaliacoesPro()}catch{q.showToast(`Erro ao salvar as notas.`,`error`)}finally{c&&(c.innerText=l,c.disabled=!1),document.body.style.cursor=`default`}},q.excluirAvaliacao=e=>{q.confirmar(`Excluir Nota`,`Deseja mesmo excluir esta avaliação? Isto irá afetar o boletim do aluno.`,`Excluir`,`#e74c3c`,async()=>{await q.api(`/avaliacoes/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando avaliações... ⏳</p>`),await q.renderizarAvaliacoesPro()})},q.cachePedagogico={chamadas:null,alunos:null,turmas:null,planejamentos:null},q.datasLancamentoChamada=[],q.filaEdicaoChamada=[],q.filtrarHistoricoChamadas=()=>{let e=document.getElementById(`input-busca-chamada`),t=document.getElementById(`filtro-chamada-dia`),n=document.getElementById(`filtro-chamada-mes`),r=document.getElementById(`filtro-chamada-ano`),i=document.getElementById(`filtro-chamada-status`),a=(e&&e.value?e.value:``).trim().toLowerCase(),o=t&&t.value?t.value:``,s=n&&n.value?n.value:``,c=r&&r.value?r.value:``,l=i&&i.value?i.value:``,u=document.querySelectorAll(`#tabela-historico-chamadas tbody tr.linha-hist-chamada`),d=document.getElementById(`tr-chamada-sem-resultado`),f=document.getElementById(`contador-historico-chamada`),p=0;u.forEach(e=>{let t=e.getAttribute(`data-iso`),n=e.getAttribute(`data-status`),r=t||``,i=n||``,u=e.innerText.toLowerCase(),d=r.split(`-`),f=d[0]?d[0]:``,m=d[1]?d[1]:``,h=d[2]?d[2]:``,g=o?h===o:!0,_=s?m===s:!0,v=c?f===c:!0,y=l?i===l:!0,b=a?u.includes(a):!0;if(g&&_&&v&&y&&b)e.style.display=``,p++;else{e.style.display=`none`;let t=e.querySelector(`.check-chamada`);t&&(t.checked=!1)}}),f&&(f.innerText=`${p} registo(s)`),d&&(d.style.display=p===0&&u.length>0?``:`none`)},q.limparFiltrosHistoricoChamada=()=>{[`input-busca-chamada`,`filtro-chamada-dia`,`filtro-chamada-mes`,`filtro-chamada-ano`,`filtro-chamada-status`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=``)}),q.filtrarHistoricoChamadas()},q.renderizarChamadaPro=async()=>{q.setTitulo(`Gestão de Frequência`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Carregando os dados rapidamente... ⚡</p>`,q.datasLancamentoChamada=[{data:new Date().toISOString().split(`T`)[0],duracao:`01:00`}],q.filaEdicaoChamada=[];try{let[t,n,r,i]=await Promise.all([q.api(`/alunos`),q.api(`/turmas`),q.api(`/chamadas?_t=${Date.now()}`),q.api(`/planejamentos?_t=${Date.now()}`)]);q.cachePedagogico.alunos=t,q.cachePedagogico.turmas=n,q.cachePedagogico.chamadas=Array.isArray(r)?r:[],q.cachePedagogico.planejamentos=i;let a=q.cachePedagogico.planejamentos.filter(e=>e.status!==`Arquivado`).map(e=>e.idAluno),o=[...q.cachePedagogico.chamadas].sort((e,t)=>new Date(t.data)-new Date(e.data)),s=q.cachePedagogico.alunos.filter(e=>(e.status?e.status===`Ativo`:!0)&&a.includes(e.id)),c=`<option value="">-- Turma Completa --</option>`+q.cachePedagogico.turmas.map(e=>`<option value="${q.escapeHTML(e.nome)}">${q.escapeHTML(e.nome)}</option>`).join(``),l=`<option value="">-- Aluno Específico --</option>`+s.map(e=>`<option value="${e.id}">${q.escapeHTML(e.nome)}</option>`).join(``),u=new Date().toISOString().split(`T`)[0],d=`<option value="">Dia (Todos)</option>`+Array.from({length:31},(e,t)=>{let n=String(t+1).padStart(2,`0`);return`<option value="${n}">Dia ${n}</option>`}).join(``),f=`<option value="">Mês (Todos)</option>`+[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>{let n=String(t+1).padStart(2,`0`);return`<option value="${n}">${n} - ${e}</option>`}).join(``),p=String(new Date().getFullYear()),m=`<option value="">Ano (Todos)</option>`+[...new Set([p,...o.map(e=>e.data?e.data.split(`-`)[0]:``).filter(e=>e&&e.length===4)])].sort((e,t)=>Number(t)-Number(e)).map(e=>`<option value="${e}">${e}</option>`).join(``),h=`
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${X(`Filtrar por Turma:`,`chamada-turma`,c)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${X(`Buscar Aluno Único:`,`chamada-aluno`,l)}
            </div>
            
            <div style="background:#fff; border:1px solid #d5f5e3; padding:15px; border-radius:8px; margin-bottom:15px; display:flex; flex-direction:column; gap:10px;">
                <label style="font-weight:bold; font-size:12px; color:#27ae60;">📅 Adicionar Datas à Matriz (Multi-Tempo):</label>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end;">
                    <div style="display:flex; gap:5px; flex:1; min-width:200px;">
                        <input type="date" id="input-nova-data" value="${u}" max="${u}" style="flex:1; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        <input type="time" id="chamada-duracao" value="01:00" style="width:100px; padding:10px; border:1px solid #ccc; border-radius:5px;" title="Duração desta data">
                        <button onclick="App.adicionarDataFila()" style="background:#27ae60; color:white; border:none; padding:0 15px; border-radius:5px; font-weight:bold; cursor:pointer;">+ Add</button>
                    </div>
                    <button onclick="App.carregarListaChamada()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR MATRIZ</button>
                </div>
                <div id="fila-datas-ui" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:5px;"></div>
            </div>
        `,g=o.map(e=>{let t=`#333`;e.status===`Presença`?t=`green`:e.status===`Falta`?t=`red`:e.status===`Reposição`&&(t=`#2980b9`);let n=q.escapeHTML(e.status);(e.status===`Falta`||e.status===`Falta Justificada`)&&e.motivo&&(n+=`<br><span style="font-size:10px; color:#7f8c8d;">Motivo: ${q.escapeHTML(e.motivo)}</span>`);let r=q.escapeHTML(e.data?e.data:``),i=q.escapeHTML(e.status?e.status:``),a=e.data?e.data.split(`-`).reverse().join(`/`):`-`;return`
            <tr id="tr-chamada-${e.id}" class="linha-hist-chamada" data-iso="${r}" data-status="${i}" style="border-bottom:1px solid #eee; transition: background 0.2s;">
                <td style="padding:12px; text-align:center;"><input type="checkbox" class="check-chamada" value="${e.id}"></td>
                <td style="padding:12px; color:#555;">${a}</td>
                <td style="padding:12px; font-weight:bold;">${q.escapeHTML(e.nomeAluno)}</td>
                <td style="padding:12px; font-weight:bold; color:${t};">${n}</td>
                <td style="padding:12px; color:#555;">${q.escapeHTML(e.duracao)}</td>
                <td style="padding:12px; text-align:right;">
                    <button onclick="App.editarLancamentoInline('${e.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar Rápido na Linha">✏️</button>
                    <button onclick="App.excluirLancamentoChamada('${e.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button>
                </td>
            </tr>`}).join(``),_=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                    <button onclick="App.excluirLotePedagogico('/chamadas', 'check-chamada', App.renderizarChamadaPro)" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s;">🗑️ Excluir Lote</button>
                    <button onclick="App.editarLoteChamada('check-chamada')" style="background:#3498db; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s; box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);">✏️ Editar Selecionados (In-Line)</button>
                    <span id="contador-historico-chamada" style="background:#eafaf1; color:#27ae60; border:1px solid #a9dfbf; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold;">${o.length} registo(s)</span>
                </div>
                <div style="background: #fff; padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; display: flex; align-items: center; gap: 8px; flex:1; min-width:240px;">
                    <span style="font-size: 16px; color: #94a3b8;">🔍</span>
                    <input type="text" id="input-busca-chamada" placeholder="Pesquisar por nome do aluno ou motivo..." oninput="App.filtrarHistoricoChamadas()" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 4px; background: transparent; width: 100%;">
                </div>
            </div>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:8px; margin-bottom:15px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                <span style="font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; gap:5px;">📅 Filtrar Período:</span>
                
                <select id="filtro-chamada-dia" onchange="App.filtrarHistoricoChamadas()" style="flex:1; min-width:110px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-size:13px; color:#1e293b; outline:none; cursor:pointer;">
                    ${d}
                </select>

                <select id="filtro-chamada-mes" onchange="App.filtrarHistoricoChamadas()" style="flex:1.4; min-width:140px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-size:13px; color:#1e293b; outline:none; cursor:pointer;">
                    ${f}
                </select>

                <select id="filtro-chamada-ano" onchange="App.filtrarHistoricoChamadas()" style="flex:1; min-width:110px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-size:13px; color:#1e293b; outline:none; cursor:pointer;">
                    ${m}
                </select>

                <select id="filtro-chamada-status" onchange="App.filtrarHistoricoChamadas()" style="flex:1.2; min-width:130px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-size:13px; color:#1e293b; outline:none; cursor:pointer;">
                    <option value="">Status (Todos)</option>
                    <option value="Presença">✅ Presença</option>
                    <option value="Falta">❌ Falta</option>
                    <option value="Falta Justificada">⚠️ Falta Justificada</option>
                    <option value="Reposição">🔄 Reposição</option>
                    <option value="Feriado">📅 Feriado</option>
                    <option value="Recesso">🏖️ Recesso</option>
                </select>

                <button type="button" onclick="App.limparFiltrosHistoricoChamada()" style="background:#e2e8f0; color:#334155; border:none; padding:8px 14px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#cbd5e1'" onmouseout="this.style.background='#e2e8f0'" title="Mostrar todos os lançamentos">
                    🧹 Limpar Filtros
                </button>
            </div>

            <div class="table-responsive-wrapper">
                <table id="tabela-historico-chamadas" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;">
                            <th style="padding:12px; width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheckMassa(this, 'check-chamada')"></th><th style="padding:12px; border-bottom:2px solid #eee;">Data</th><th style="padding:12px; border-bottom:2px solid #eee;">Aluno</th><th style="padding:12px; border-bottom:2px solid #eee;">Status</th><th style="padding:12px; border-bottom:2px solid #eee;">Tempo</th><th style="padding:12px; border-bottom:2px solid #eee; text-align:right;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${o.length===0?`<tr><td colspan="6" style="padding:20px; text-align:center; color:#999;">Nenhum registo encontrado.</td></tr>`:``}
                        <tr id="tr-chamada-sem-resultado" style="display:none;">
                            <td colspan="6" style="padding:25px; text-align:center; color:#7f8c8d; font-size:13px;">
                                🔍 Nenhum lançamento de chamada encontrado para o Dia, Mês ou Ano selecionado.
                            </td>
                        </tr>
                        ${g}
                    </tbody>
                </table>
            </div>
        `;e.innerHTML=q.UI.card(`📝 Matriz de Frequência Inteligente`,``,h,`100%`)+`<div id="area-lista-chamada" style="margin-top:20px;"></div><div style="margin-top:20px;">`+q.UI.card(`Histórico Completo de Lançamentos`,``,_,`100%`)+`</div>`,q.atualizarFilaDatasUI()}catch{e.innerHTML=`Erro ao carregar módulo de chamada.`}},q.adicionarDataFila=()=>{let e=document.getElementById(`input-nova-data`).value,t=document.getElementById(`chamada-duracao`).value||`01:00`,n=new Date().toISOString().split(`T`)[0];if(!e)return q.showToast(`Selecione uma data válida.`,`warning`);if(e>n)return q.showToast(`Não é permitido adicionar datas futuras.`,`warning`);if(q.datasLancamentoChamada.some(t=>t.data===e))return q.showToast(`Esta data já está na matriz.`,`info`);q.datasLancamentoChamada.push({data:e,duracao:t}),q.datasLancamentoChamada.sort((e,t)=>new Date(e.data)-new Date(t.data)),q.atualizarFilaDatasUI()},q.removerDataFila=e=>{q.datasLancamentoChamada=q.datasLancamentoChamada.filter(t=>t.data!==e),q.atualizarFilaDatasUI()},q.atualizarFilaDatasUI=()=>{let e=document.getElementById(`fila-datas-ui`);if(e){if(q.datasLancamentoChamada.length===0){e.innerHTML=`<span style="font-size:12px; color:#e74c3c; font-style:italic;">Adicione pelo menos uma data para gerar a matriz.</span>`;return}e.innerHTML=q.datasLancamentoChamada.map(e=>`
        <div style="background:#2ecc71; color:white; padding:5px 10px; border-radius:20px; font-size:12px; font-weight:bold; display:flex; align-items:center; gap:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            ${e.data.split(`-`).reverse().join(`/`)} ⏳ ${e.duracao}
            <span onclick="App.removerDataFila('${e.data}')" style="cursor:pointer; background:rgba(0,0,0,0.2); border-radius:50%; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; font-size:10px;">✖</span>
        </div>
    `).join(``)}},q.editarLoteChamada=e=>{let t=document.querySelectorAll(`.`+e+`:checked`);if(t.length===0)return q.showToast(`Selecione pelo menos um registo na tabela para editar.`,`warning`);q.filaEdicaoChamada=Array.from(t).map(e=>e.value),q.showToast(`Assistente In-Line: Iniciando a edição de ${q.filaEdicaoChamada.length} registo(s)...`,`info`),document.querySelectorAll(`.`+e).forEach(e=>e.checked=!1),q.processarFilaEdicaoInline()},q.processarFilaEdicaoInline=()=>{if(q.filaEdicaoChamada.length>0){let e=q.filaEdicaoChamada[0];q.editarLancamentoInline(e)}},q.editarLancamentoInline=e=>{let t=document.getElementById(`tr-chamada-${e}`),n=q.cachePedagogico.chamadas.find(t=>String(t.id)===String(e));if(!n||!t)return;t.dataset.originalHtml||(t.dataset.originalHtml=t.innerHTML);let r=n.status===`Presença`?`selected`:``,i=n.status===`Falta`?`selected`:``,a=n.status===`Falta Justificada`?`selected`:``,o=n.status===`Reposição`?`selected`:``;t.style.background=`#fff8e1`,t.innerHTML=`
        <td style="padding:12px; text-align:center; color:#f39c12; font-weight:bold;">⚙️</td>
        <td style="padding:12px; color:#555;">${n.data.split(`-`).reverse().join(`/`)}</td>
        <td style="padding:12px; font-weight:bold; color:#2c3e50;">${q.escapeHTML(n.nomeAluno)}</td>
        <td style="padding:12px;">
            <select id="inline-status-${e}" style="width:100%; padding:6px; border-radius:5px; border:1px solid #f39c12; font-weight:bold;">
                <option value="Presença" ${r}>✅ Presença</option>
                <option value="Falta" ${i}>❌ Falta</option>
                <option value="Falta Justificada" ${a}>⚠️ Falta Justificada</option>
                <option value="Reposição" ${o}>🔄 Reposição</option>
            </select>
        </td>
        <td style="padding:12px;">
            <input type="time" id="inline-duracao-${e}" value="${n.duracao}" style="width:80px; padding:6px; border-radius:5px; border:1px solid #f39c12; font-weight:bold;">
        </td>
        <td style="padding:12px; text-align:right;">
            <button onclick="App.salvarEdicaoInline('${e}')" id="btn-save-inline-${e}" style="background:#27ae60; color:white; border:none; cursor:pointer; padding:6px 12px; border-radius:5px; font-weight:bold; margin-right:5px; box-shadow: 0 2px 5px rgba(39, 174, 96, 0.4);" title="Gravar Alteração">💾 Salvar</button>
            <button onclick="App.cancelarEdicaoInline('${e}')" style="background:#e74c3c; color:white; border:none; cursor:pointer; padding:6px 10px; border-radius:5px; font-weight:bold; box-shadow: 0 2px 5px rgba(231, 76, 60, 0.4);" title="Cancelar">❌</button>
        </td>
    `,t.scrollIntoView({behavior:`smooth`,block:`center`})},q.salvarEdicaoInline=async e=>{let t=document.getElementById(`inline-status-${e}`).value,n=document.getElementById(`inline-duracao-${e}`).value,r=document.getElementById(`tr-chamada-${e}`),i=document.getElementById(`btn-save-inline-${e}`);i&&(i.innerText=`⏳`,i.disabled=!0);try{let i=q.cachePedagogico.chamadas.find(t=>String(t.id)===String(e));i.status=t,i.duracao=n,await q.api(`/chamadas/${e}`,`PUT`,i);let a=q.cachePedagogico.planejamentos.find(e=>e.idAluno===i.idAluno&&e.status!==`Arquivado`);a&&typeof q.processarAutoAjustePlano==`function`&&(a=q.processarAutoAjustePlano(a,q.cachePedagogico.chamadas),await q.api(`/planejamentos/${a.id}`,`PUT`,a));let o=`#333`;t===`Presença`?o=`green`:t===`Falta`?o=`red`:t===`Reposição`&&(o=`#2980b9`),r.setAttribute(`data-status`,t),r.style.background=`#eafaf1`,r.innerHTML=`
            <td style="padding:12px; text-align:center;"><input type="checkbox" class="check-chamada" value="${i.id}"></td>
            <td style="padding:12px; color:#555;">${i.data.split(`-`).reverse().join(`/`)}</td>
            <td style="padding:12px; font-weight:bold;">${q.escapeHTML(i.nomeAluno)}</td>
            <td style="padding:12px; font-weight:bold; color:${o};">${q.escapeHTML(t)}</td>
            <td style="padding:12px; color:#555;">${q.escapeHTML(n)}</td>
            <td style="padding:12px; text-align:right;">
                <button onclick="App.editarLancamentoInline('${i.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar Rápido na Linha">✏️</button>
                <button onclick="App.excluirLancamentoChamada('${i.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button>
            </td>
        `,setTimeout(()=>{r&&(r.style.background=`transparent`)},1500),r.dataset.originalHtml=``,q.filtrarHistoricoChamadas(),q.filaEdicaoChamada.length>0&&String(q.filaEdicaoChamada[0])===String(e)?(q.filaEdicaoChamada.shift(),q.filaEdicaoChamada.length>0?q.processarFilaEdicaoInline():q.showToast(`✅ Edição em lote concluída perfeitamente!`,`success`)):q.showToast(`Registo atualizado com sucesso!`,`success`)}catch{q.showToast(`Erro ao guardar alteração.`,`error`),q.cancelarEdicaoInline(e)}},q.cancelarEdicaoInline=e=>{let t=document.getElementById(`tr-chamada-${e}`);t&&t.dataset.originalHtml&&(t.innerHTML=t.dataset.originalHtml,t.style.background=`transparent`),q.filaEdicaoChamada.length>0&&(q.filaEdicaoChamada=[],q.showToast(`Assistente de Edição interrompido.`,`info`))},q.atualizarStatusCelula=e=>{let t=e.value;t===`Falta`?e.style.color=`#e74c3c`:t===`Reposição`?e.style.color=`#f39c12`:t===`Presença`?e.style.color=`#27ae60`:e.style.color=`#333`;let n=e.nextElementSibling;n&&n.classList.contains(`motivo-chamada`)&&(t===`Falta`||t===`Falta Justificada`?(n.style.display=`block`,n.focus()):(n.style.display=`none`,n.value=``))},q.marcarTodosChamadaGlobal=e=>{let t=document.querySelectorAll(`.status-chamada`);t.length!==0&&(t.forEach(t=>{t.value=e,q.atualizarStatusCelula(t)}),q.showToast(`Lote aplicado na matriz inteira: ${e}!`,`info`))},q.carregarListaChamada=async()=>{let e=document.getElementById(`chamada-turma`).value,t=document.getElementById(`chamada-aluno`).value;if(!e&&!t)return q.showToast(`Selecione uma Turma OU um Aluno específico.`,`warning`);if(q.datasLancamentoChamada.length===0)return q.showToast(`Adicione pelo menos uma data na fila.`,`warning`);let n=document.getElementById(`area-lista-chamada`);n.innerHTML=`<p style="text-align:center; padding:20px;">A preparar Matriz Dinâmica... ⚡</p>`;try{let r=q.cachePedagogico.alunos,i=q.cachePedagogico.chamadas,a=q.cachePedagogico.planejamentos.filter(e=>e.status!==`Arquivado`).map(e=>e.idAluno),o=t?r.filter(e=>e.id===t):r.filter(t=>t.turma===e);if(o=o.filter(e=>(e.status?e.status===`Ativo`:!0)&&a.includes(e.id)),o.length===0){n.innerHTML=`<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno com Planejamento Ativo foi encontrado para este filtro.</p></div>`;return}let s=`<tr><th style="padding:15px; text-align:left; background:#f8f9fa; border-right:1px solid #ddd; min-width:150px;">NOME DO ALUNO</th>`;q.datasLancamentoChamada.forEach(e=>{s+=`<th style="padding:10px 15px; text-align:center; min-width:160px; line-height:1.3;">
                ${e.data.split(`-`).reverse().join(`/`)}<br>
                <span style="font-size:10px; color:#7f8c8d; font-weight:normal;">⏳ ${e.duracao}</span>
            </th>`}),s+=`</tr>`;let c=``;o.forEach(e=>{c+=`<tr style="border-bottom:1px solid #eee;" class="linha-aluno-matriz" data-id="${e.id}" data-nome="${q.escapeHTML(e.nome)}">`,c+=`<td style="padding:12px; font-weight:500; background:#fff; border-right:1px solid #ddd; min-width:150px;">${q.escapeHTML(e.nome)}</td>`,q.datasLancamentoChamada.forEach(t=>{let n=t.data,r=t.duracao,a=i.find(t=>String(t.idAluno)===String(e.id)&&t.data===n),o=a?a.status:`Presença`,s=a&&a.motivo?a.motivo:``,l=a?`data-id-chamada="${a.id}"`:``,u=o===`Falta`||o===`Falta Justificada`?`block`:`none`;c+=`
                <td style="padding:8px; vertical-align:top;">
                    <select class="status-chamada" data-data="${n}" data-duracao="${r}" ${l} style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; font-weight:bold; color:${o===`Falta`?`#e74c3c`:o===`Reposição`?`#f39c12`:`#27ae60`};" onchange="App.atualizarStatusCelula(this)">
                        <option value="Presença" ${o===`Presença`?`selected`:``}>✅ Presença</option>
                        <option value="Falta" ${o===`Falta`?`selected`:``}>❌ Falta</option>
                        <option value="Reposição" ${o===`Reposição`?`selected`:``}>🔄 Reposição</option>
                        <option value="Falta Justificada" ${o===`Falta Justificada`?`selected`:``}>⚠️ Falta Just.</option>
                        <option value="Feriado" ${o===`Feriado`?`selected`:``}>📅 Feriado</option>
                        <option value="Recesso" ${o===`Recesso`?`selected`:``}>🏖️ Recesso</option>
                        <option value="N/A" ${o===`N/A`?`selected`:``}>➖ N/A (Ignorar)</option>
                    </select>
                    <input type="text" class="motivo-chamada" placeholder="Descreva o motivo..." value="${q.escapeHTML(s)}" style="display:${u}; width:100%; margin-top:5px; padding:6px; border-radius:4px; border:1px dashed #e74c3c; font-size:11px; outline:none;">
                </td>`}),c+=`</tr>`}),n.innerHTML=`
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #27ae60;">
                <div style="padding:15px; background:#eafaf1; border-bottom:1px solid #d5f5e3; font-size:13px; color:#27ae60; font-weight:bold;">
                    Grelha de Frequência Dinâmica (${q.datasLancamentoChamada.length} dia(s) processados)
                </div>
                
            <div style="padding:10px 15px; background:#fff; border-bottom:1px solid #eee; display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                <span style="font-size:12px; color:#999; margin-top:8px; margin-right:auto;">Preencher toda a Matriz:</span>
                <button onclick="App.marcarTodosChamadaGlobal('Presença')" style="background:#eafaf1; color:#27ae60; border:1px solid #27ae60; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px;">✅ Tudo Presente</button>
                <button onclick="App.marcarTodosChamadaGlobal('Falta')" style="background:#fdf2f2; color:#e74c3c; border:1px solid #e74c3c; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px;">❌ Tudo Falta</button>
                <button onclick="App.marcarTodosChamadaGlobal('N/A')" style="background:#f4f6f7; color:#7f8c8d; border:1px solid #bdc3c7; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px;">➖ Limpar Matriz (N/A)</button>
            </div>
        
                <div class="table-responsive-wrapper" style="margin:0; border:none; max-height: 500px; overflow-y: auto;">
                    <table style="width:100%; border-collapse:collapse; min-width:600px;">
                        <thead>${s}</thead>
                        <tbody>${c}</tbody>
                    </table>
                </div>
                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #eee; text-align:right;">
                    <button onclick="App.salvarChamadaLote()" class="btn-primary" style="background:#27ae60; border-color:#27ae60; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3); font-size:16px; padding:12px 25px;">💾 SALVAR MATRIZ COMPLETA</button>
                </div>
            </div>
        `}catch{n.innerHTML=`<p style="color:red; text-align:center;">Erro ao processar a matriz.</p>`}},q.salvarChamadaLote=async()=>{let e=document.querySelectorAll(`.linha-aluno-matriz`);if(e.length===0)return;let t=document.querySelector(`button[onclick="App.salvarChamadaLote()"]`),n=t.innerText;t.innerText=`Salvando... ⚡`,t.disabled=!0,document.body.style.cursor=`wait`;try{let r=q.cachePedagogico.planejamentos,i=q.cachePedagogico.chamadas,a=[],o=new Set,s=[],c=[...i];if(e.forEach(e=>{let t=e.getAttribute(`data-id`),n=e.getAttribute(`data-nome`);r.some(e=>e.idAluno===t&&e.status!==`Arquivado`)||a.push(n)}),a.length>0){q.showToast(`Bloqueado: Crie um Planejamento para: ${a.join(`, `)}`,`error`),t&&(t.innerText=n,t.disabled=!1),document.body.style.cursor=`default`;return}e.forEach(e=>{let t=e.getAttribute(`data-id`),n=e.getAttribute(`data-nome`);e.querySelectorAll(`.status-chamada`).forEach(e=>{let r=e.value;if(r===`N/A`)return;let a=e.nextElementSibling,l=(r===`Falta`||r===`Falta Justificada`)&&a?a.value.trim():``,u=e.getAttribute(`data-data`),d=e.getAttribute(`data-duracao`),f=e.getAttribute(`data-id-chamada`);o.add(t);let p=null;p=f?i.find(e=>String(e.id)===String(f)):i.find(e=>String(e.idAluno)===String(t)&&e.data===u);let m={idAluno:t,nomeAluno:n,data:u,status:r,duracao:d,motivo:l};if(p){let e={...p,data:u,status:r,duracao:d,motivo:l};s.push(q.api(`/chamadas/${p.id}`,`PUT`,e));let t=c.findIndex(e=>String(e.id)===String(p.id));t!==-1&&(c[t]=e)}else m.id=typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).substr(2),s.push(q.api(`/chamadas`,`POST`,m)),c.push(m)})}),await Promise.all(s);let l=``;try{let e=[];o.forEach(t=>{let n=r.find(e=>e.idAluno===t&&e.status!==`Arquivado`);n&&typeof q.processarAutoAjustePlano==`function`&&(n=q.processarAutoAjustePlano(n,c),e.push(q.api(`/planejamentos/${n.id}`,`PUT`,n)))}),e.length>0&&(await Promise.all(e),l=` e Planos Auto-Ajustados!`)}catch(e){console.log(`Aviso: Falha no auto-ajuste.`,e)}q.showToast(`Matriz Multitempo salva com sucesso${l}!`,`success`);let u=document.getElementById(`app-content`);u&&(u.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">A atualizar a tabela de histórico... ⏳</p>`),await q.renderizarChamadaPro()}catch{q.showToast(`Erro ao guardar a matriz de chamadas.`,`error`),t&&(t.innerText=n,t.disabled=!1),document.body.style.cursor=`default`}},q.excluirLancamentoChamada=e=>{q.confirmar(`Excluir Frequência`,`Tem a certeza que deseja excluir esta chamada do sistema?`,`Excluir`,`#e74c3c`,async()=>{await q.api(`/chamadas/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando frequência... ⏳</p>`),await q.renderizarChamadaPro()})},q.renderizarCalendarioPro=async()=>{q.setTitulo(`Calendário e Agenda`);let e=document.getElementById(`app-content`);e.innerHTML=`Carregando calendário...`,q.calendarState||={month:new Date().getMonth(),year:new Date().getFullYear()};try{let t=await q.api(`/eventos?_t=${Date.now()}`),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`][q.calendarState.month],r=`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="App.mudarMes(-1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">◀</button>
                <h2 style="margin:0; color:#2c3e50; text-transform:uppercase; font-size:22px;">${n} ${q.calendarState.year}</h2>
                <button onclick="App.mudarMes(1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">▶</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: #7f8c8d; margin-bottom: 10px; font-size:12px; text-transform:uppercase;">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #eee; border: 1px solid #eee;">
                ${q.gerarDiasCalendario(q.calendarState.month,q.calendarState.year,t)}
            </div>
        `,i=`
            <div id="box-gerir-evento" style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span style="font-size:20px;">🗓️</span><h3 style="margin:0; color:#2c3e50;">Gerir Evento</h3></div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
                ${Y(`Data:`,`evt-data`,`date`)}
                ${X(`Tipo:`,`evt-tipo`,`<option value="Evento">🟢 Evento</option><option value="Feriado">🔴 Feriado</option><option value="Prova">🔵 Prova</option><option value="Reunião">🟠 Reunião</option>`)}
                ${Y(`Descrição:`,`evt-desc`,`text`,``,`placeholder="Ex: Prova de História / Carnaval" style="flex:3;"`)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; align-items: flex-end;">
                ${Y(`Início:`,`evt-inicio`,`time`)}
                ${Y(`Término:`,`evt-fim`,`time`)}
                <div style="flex: 1; min-width: 200px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="App.limparFormEvento()" style="background:#95a5a6; color:white; border:none; padding:12px 20px; border-radius:5px; cursor:pointer; flex: 1;">Cancelar</button>
                    <button onclick="App.salvarEvento()" style="background:#6c5ce7; color:white; border:none; padding:12px 20px; border-radius:5px; font-weight:bold; cursor:pointer; flex: 1;">Salvar</button>
                </div>
            </div>
        `,a=`
            <div style="margin-bottom:15px;">
                <button onclick="App.excluirLotePedagogico('/eventos', 'check-evento', App.renderizarCalendarioPro)" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">🗑️ Excluir Selecionados</button>
            </div>
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
                    <thead><tr style="background:#f8f9fa; color:#7f8c8d; border-bottom:2px solid #eee;"><th style="padding:10px; width:40px; text-align:center;"><input type="checkbox" onchange="App.toggleCheckMassa(this, 'check-evento')"></th><th style="padding:10px;">DIA</th><th style="padding:10px;">HORÁRIO</th><th style="padding:10px;">TIPO</th><th style="padding:10px;">DESCRIÇÃO</th><th style="padding:10px; text-align:right;">AÇÕES</th></tr></thead>
                    <tbody>${q.gerarListaEventosHTML(q.calendarState.month,q.calendarState.year,t)}</tbody>
                </table>
            </div>
        `;e.innerHTML=q.UI.card(``,``,r,`100%`)+`<div style="margin-top:20px;">`+q.UI.card(``,``,i,`100%`)+`</div><div style="margin-top:20px;">`+q.UI.card(`Lista de Eventos (${n})`,``,a,`100%`)+`</div>`,document.getElementById(`evt-data`).value=new Date().toISOString().split(`T`)[0]}catch{e.innerHTML=`Erro ao carregar calendário.`}},q.gerarDiasCalendario=(e,t,n)=>{let r=new Date(t,e,1).getDay(),i=new Date(t,e+1,0).getDate(),a=``;for(let e=0;e<r;e++)a+=`<div class="cal-day empty"></div>`;for(let r=1;r<=i;r++){let i=`${t}-${String(e+1).padStart(2,`0`)}-${String(r).padStart(2,`0`)}`,o=new Date,s=r===o.getDate()&&e===o.getMonth()&&t===o.getFullYear(),c=n.filter(e=>e.data===i).map(e=>`<div class="evt-pilula" style="--bg-cor: ${(J[e.tipo]||J.Evento).bg};" title="${q.escapeHTML(e.descricao)}"><span class="evt-texto">${q.escapeHTML(e.descricao)}</span></div>`).join(``);a+=`<div id="cal-day-${i}" class="cal-day ${s?`hoje`:``}" onclick="App.selecionarDia('${i}')"><div class="dia-num">${r}</div><div class="evt-container">${c}</div></div>`}return a},q.gerarListaEventosHTML=(e,t,n)=>{let r=n.filter(n=>{let r=new Date(n.data+`T00:00:00`);return r.getMonth()===e&&r.getFullYear()===t}).sort((e,t)=>new Date(e.data)-new Date(t.data));return r.length===0?`<tr><td colspan="6" style="padding:20px; text-align:center; color:#999;">Nenhum evento.</td></tr>`:r.map(e=>`
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px; text-align:center;"><input type="checkbox" class="check-evento" value="${e.id}"></td>
            <td style="padding:10px; font-weight:bold;">${e.data.split(`-`)[2]}</td>
            <td style="padding:10px;">${q.escapeHTML(e.inicio||`-`)}</td>
            <td style="padding:10px; font-weight:bold; color:${(J[e.tipo]||J.Evento).bg}">${q.escapeHTML(e.tipo)}</td>
            <td style="padding:10px;">${q.escapeHTML(e.descricao)}</td>
            <td style="padding:10px; text-align:right;">
                <button onclick="App.preencherEdicaoEvento('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">✏️</button>
                <button onclick="App.excluirEvento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️</button>
            </td>
        </tr>`).join(``)},q.mudarMes=e=>{q.calendarState.month+=e,q.calendarState.month>11?(q.calendarState.month=0,q.calendarState.year++):q.calendarState.month<0&&(q.calendarState.month=11,q.calendarState.year--),q.renderizarCalendarioPro()},q.selecionarDia=e=>{document.querySelectorAll(`.cal-day`).forEach(e=>e.style.border=`none`);let t=document.getElementById(`cal-day-${e}`);t&&(t.style.border=`2px solid #3498db`),document.getElementById(`evt-data`).value=e,document.getElementById(`evt-desc`).value=``,q.idEdicaoEvento=null,setTimeout(()=>{document.getElementById(`box-gerir-evento`).scrollIntoView({behavior:`smooth`,block:`start`}),document.getElementById(`evt-desc`).focus()},100)},q.salvarEvento=async()=>{document.activeElement&&document.activeElement.blur();let e={data:document.getElementById(`evt-data`).value,tipo:document.getElementById(`evt-tipo`).value,descricao:document.getElementById(`evt-desc`).value,inicio:document.getElementById(`evt-inicio`).value,fim:document.getElementById(`evt-fim`).value};if(!e.data||!e.descricao)return q.showToast(`Preencha data e descrição.`,`error`);let t=document.querySelector(`button[onclick="App.salvarEvento()"]`),n=t?t.innerText:`Salvar`;t&&(t.innerText=`A salvar... ⏳`,t.disabled=!0),document.body.style.cursor=`wait`;try{q.idEdicaoEvento?await q.api(`/eventos/${q.idEdicaoEvento}`,`PUT`,e):await q.api(`/eventos`,`POST`,e),q.idEdicaoEvento=null;let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando calendário... ⏳</p>`),await q.renderizarCalendarioPro(),setTimeout(()=>{let e=document.querySelector(`.table-responsive-wrapper`);e&&e.scrollIntoView({behavior:`smooth`,block:`end`})},100),q.showToast(`Evento salvo com sucesso!`,`success`)}catch{q.showToast(`Erro ao salvar evento.`,`error`)}finally{t&&(t.innerText=n,t.disabled=!1),document.body.style.cursor=`default`}},q.preencherEdicaoEvento=async e=>{let t=await q.api(`/eventos/${e}`);document.getElementById(`evt-data`).value=t.data,document.getElementById(`evt-tipo`).value=t.tipo,document.getElementById(`evt-desc`).value=t.descricao,document.getElementById(`evt-inicio`).value=t.inicio,document.getElementById(`evt-fim`).value=t.fim,q.idEdicaoEvento=e,document.getElementById(`box-gerir-evento`).scrollIntoView({behavior:`smooth`,block:`start`})},q.excluirEvento=e=>{q.confirmar(`Excluir Evento`,`Pretende remover este evento do calendário?`,`Excluir`,`#e74c3c`,async()=>{await q.api(`/eventos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando calendário... ⏳</p>`),await q.renderizarCalendarioPro()})},q.limparFormEvento=()=>{document.getElementById(`evt-desc`).value=``,q.idEdicaoEvento=null},window.App=window.App||{};var Z=window.App;Z.renderizarRelatorioModulo=async e=>{if(e===`fin_detalhado`||e===`financeiro`){Z.setTitulo(`Relatórios Financeiros`),Z.renderizarSelecaoRelatorio();return}if(e===`dossie`){Z.renderizarDossie();return}if(e===`ficha`){Z.gerarFichaSetup();return}if(e===`documentos`){Z.renderizarGeradorDocumentos();return}if(e===`diario`){Z.renderizarDiarioSetup();return}};var te=(e,t,n=`text`,r=``,i=``)=>`
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <input type="${n}" id="${t}" value="${r}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${i}>
    </div>`,Q=(e,t,n,r=``)=>`
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${r}>${n}</select>
    </div>`,$=`
    <style>
        .print-sheet { background: white; max-width: 210mm; width: 100%; margin: 0 auto; padding: 40px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); border-radius: 8px; font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; overflow: hidden; }
        .print-sheet-landscape { background: white; max-width: 297mm; width: 100%; margin: 0 auto; padding: 28px 32px; box-shadow: 0 8px 25px rgba(0,0,0,0.08); border-radius: 10px; font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; border: 1px solid #e2e8f0; overflow-x: auto; }
        .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
        .kpi-container { display: flex; justify-content: space-between; gap: 15px; flex-wrap: wrap; }
        .kpi-box { flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; }
        
        @media (max-width: 768px) {
            .print-sheet, .print-sheet-landscape { padding: 15px !important; margin: 0 !important; width: 100% !important; border-radius: 6px !important; }
            .doc-header { flex-direction: column !important; align-items: flex-start !important; gap: 15px !important; }
            .doc-header > div { text-align: left !important; width: 100% !important; }
            .kpi-container { flex-direction: column; }
            .kpi-box { width: 100% !important; margin-bottom: 10px; }
        }
        
        @media print {
            /* 🧹 ESCONDE TUDO DO SISTEMA E DEIXA APENAS A FOLHA DO DOCUMENTO */
            .no-print,
            .sidebar,
            nav.sidebar,
            header.header-moderno,
            .barra-pesquisa-abaixo,
            #offline-banner,
            #update-banner,
            #pwa-install-banner,
            #global-pwa-update-prompt {
                display: none !important;
            }

            body, html, #tela-sistema, main.content, .content-wrapper, #app-content, #diario-area, #ficha-area, #doc-area-oficial {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                overflow: visible !important;
            }

            .print-sheet, .print-sheet-landscape {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
                border: none !important;
                overflow: visible !important;
            }

            .table-responsive { overflow: visible !important; }
            tfoot { display: table-row-group !important; }
            
            .kpi-container { 
                flex-direction: row !important; 
                flex-wrap: nowrap !important; 
                gap: 10px !important; 
                margin-bottom: 15px !important; 
            }
            .kpi-box { 
                padding: 10px !important; 
                min-width: auto !important; 
                border: 1px solid #ccc !important;
            }
        }
    </style>
`;Z.renderizarSelecaoRelatorio=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar períodos disponíveis... ⏳</p>`;try{let t=await Z.api(`/financeiro`),n=new Set,r=new Date().getFullYear();n.add(r),n.add(r+1),t.forEach(e=>{if(e.vencimento){let t=parseInt(e.vencimento.split(`-`)[0]);isNaN(t)||n.add(t)}if(e.dataPagamento){let t=parseInt(e.dataPagamento.split(`-`)[0]);isNaN(t)||n.add(t)}});let i=Array.from(n).sort((e,t)=>t-e).map(e=>`<option value="${e}" ${e===r?`selected`:``}>${e}</option>`).join(``),a=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${t+1}" ${t===new Date().getMonth()?`selected`:``}>${e}</option>`).join(``),o=`
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <span style="font-size:24px;">🗓️</span><h2 style="margin:0; color:#2c3e50;">Selecionar Período</h2>
            </div>
            <p style="color:#666; margin-bottom:20px;">Selecione o ano base e aplique os filtros para emitir os relatórios financeiros.</p>
            
            <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:25px;">
                ${Q(`Selecione o Ano Base:`,`rel-ano`,i,`style="background:white; padding:12px; font-size:16px;"`)}
                ${Q(`🛡️ Filtro de Exibição:`,`filtro-auditoria`,`
            <option value="geral" selected>🌟 GERAL (Todos os alunos e status)</option>
            <option value="pagos">✅ PAGOS (Mensalidades recebidas)</option>
            <option value="pendentes">⚠️ PENDENTES (Alunos ATIVOS com faturas em aberto)</option>
            <option value="inadimplentes">🚨 INADIMPLENTES (Alunos ATIVOS com faturas ATRASADAS)</option>
            <option value="excluidos">🗑️ INATIVOS/EXCLUÍDOS (Faturas de alunos que já não estudam)</option>
        `,`style="background:#fdf2f2; border:2px solid #f5b7b1; padding:12px; font-size:14px; font-weight:bold; color:#c0392b;"`)}
            </div>
            
            <button onclick="App.gerarRelatorioAnual()" style="width:100%; padding:15px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(142,68,173,0.3);">
                📄 RELATÓRIO GERAL DO ANO TODO <span>➜</span>
            </button>
            
            <div style="text-align:center; margin:25px 0; color:#999; font-size:12px; font-weight:bold;">OU SELECIONE UM MÊS ESPECÍFICO</div>
            
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${Q(`Mês:`,`rel-mes`,a,`style="background:white; padding:12px; min-width:200px;"`)}
                <button onclick="App.gerarRelatorioMensal()" style="flex:1; min-width:150px; background:#2980b9; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; height:43px; box-shadow:0 4px 10px rgba(41,128,185,0.3);">VER MÊS</button>
            </div>
        `;e.innerHTML=Z.UI.card(``,``,o,`100%`)}catch(t){console.error(`Erro ao carregar anos para relatório:`,t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao ligar ao servidor para ler o histórico. Tente novamente.</p>`}},Z.gerarRelatorioAnual=async()=>{let e=document.getElementById(`rel-ano`).value,t=document.getElementById(`filtro-auditoria`)?document.getElementById(`filtro-auditoria`).value:`geral`,n=document.getElementById(`app-content`);n.innerHTML=`<p style="text-align:center;">A gerar relatório anual...</p>`;try{let[r,i,a]=await Promise.all([Z.api(`/financeiro`),Z.api(`/escola`)||{nome:`ESCOLA`,cnpj:``},Z.api(`/alunos`)||[]]),o=i.foto?`<img src="${i.foto}" style="height:50px; object-fit:contain;">`:``,s={},c={};a.forEach(e=>{let t=e.status?e.status.toLowerCase():`ativo`;s[e.id]=t,e.nome&&(c[e.nome.toLowerCase().trim()]=t)});let l=r.filter(t=>t.vencimento&&t.vencimento.startsWith(e));l=l.filter(e=>{let n=`desconhecido`;e.idAluno&&s[e.idAluno]?n=s[e.idAluno]:e.alunoNome&&c[e.alunoNome.toLowerCase().trim()]&&(n=c[e.alunoNome.toLowerCase().trim()]);let r=n===`ativo`,i=e.status===`Pago`,a=new Date;a.setHours(0,0,0,0);let o=new Date(e.vencimento+`T00:00:00`);return t===`pagos`?i:t===`pendentes`?!i&&r:t===`inadimplentes`?r&&!i&&o<a:t===`excluidos`?!r:!0}),l.sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),Z.dadosRelatorioCache=l;let u=e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0),d=l.reduce((e,t)=>e+(parseFloat(t.valor)||0),0),f=l.filter(e=>e.status===`Pago`).reduce((e,t)=>e+u(t),0),p=l.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),m=e=>e.toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`});n.innerHTML=`
            ${$}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR EXTRATO ANUAL</button>
<button onclick="App.baixarExcelRelatorio('Anual')" class="btn-primary" style="background:#27ae60; border:none; width:auto; padding:10px 20px; margin-bottom:10px; margin-left:10px;">📊 BAIXAR EXCEL</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${o}
                        <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${Z.escapeHTML(i.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${Z.escapeHTML(i.cnpj)}<br>Relatório Analítico Anual</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h1 style="margin:0; font-size:22px; color:#2c3e50;">EXERCÍCIO ${e}</h1>
                        <div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleString(`pt-BR`)}</div>
                    </div>
                </div>
                
                <div class="kpi-container" style="background:#fafafa; padding:20px; border-radius:8px; margin-bottom:30px; border:1px solid #eee;">
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:#555;">TOTAL LANÇADO:</div><div style="font-size:18px; font-weight:bold; color:#333;">${m(d)}</div></div>
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:green;">TOTAL RECEBIDO:</div><div style="font-size:18px; color:green;">${m(f)}</div></div>
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:red;">TOTAL PENDENTE:</div><div style="font-size:18px; color:red;">${m(p)}</div></div>
                </div>
                
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555; min-width:600px;">
                        <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                            <tr><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">VENCIMENTO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">ALUNO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">DESCRIÇÃO DO PRODUTO</th><th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">STATUS / FORMA</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">RECEBIDO</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">PENDENTE</th></tr>
                        </thead>
                        <tbody>
                            ${l.length===0?`<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum registo encontrado para este filtro.</td></tr>`:``}
                            ${l.map(e=>{let t=e.status===`Pago`,n=t?`PAGO`:`ABERTO`;return t&&e.formaPagamento&&(n+=`<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${Z.escapeHTML(e.formaPagamento)}${e.formaPagamento2?` / ${Z.escapeHTML(e.formaPagamento2)}`:``}<br>Pago em: ${Z.escapeHTML(e.dataPagamento?e.dataPagamento.split(`-`).reverse().join(`/`):``)}</span>`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${Z.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="padding:10px;">${Z.escapeHTML(e.alunoNome||`Não informado`)}</td><td style="padding:10px;">${Z.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${t?`green`:`red`};">${n}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${t?m(u(e)):`-`}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${t?`-`:m(parseFloat(e.valor)||0)}</td></tr>`}).join(``)}
                        </tbody>
                        <tfoot>
                            <tr style="background:#f9f9f9; font-weight:bold; border-top:2px solid #333;"><td colspan="4" style="padding:15px; text-align:right;">SALDO FINAL:</td><td style="padding:15px; text-align:right; color:green; white-space:nowrap;">${m(f)}</td><td style="padding:15px; text-align:right; color:red; white-space:nowrap;">${m(p)}</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>`}catch{Z.showToast(`Erro ao gerar relatório.`,`error`)}},Z.gerarRelatorioMensal=async()=>{let e=document.getElementById(`rel-ano`).value,t=parseInt(document.getElementById(`rel-mes`).value),n=document.getElementById(`filtro-auditoria`)?document.getElementById(`filtro-auditoria`).value:`geral`,r=document.getElementById(`app-content`);r.innerHTML=`<p style="text-align:center;">A gerar relatório mensal...</p>`;let i=[`JANEIRO`,`FEVEREIRO`,`MARÇO`,`ABRIL`,`MAIO`,`JUNHO`,`JULHO`,`AGOSTO`,`SETEMBRO`,`OUTUBRO`,`NOVEMBRO`,`DEZEMBRO`][t-1];try{let[a,o,s]=await Promise.all([Z.api(`/financeiro`),Z.api(`/escola`)||{nome:`ESCOLA`,cnpj:``},Z.api(`/alunos`)||[]]),c=o.foto?`<img src="${o.foto}" style="height:50px; object-fit:contain;">`:``,l={},u={};s.forEach(e=>{let t=e.status?e.status.toLowerCase():`ativo`;l[e.id]=t,e.nome&&(u[e.nome.toLowerCase().trim()]=t)});let d=a.filter(n=>{if(!n.vencimento)return!1;let r=new Date(n.vencimento+`T00:00:00`);return r.getFullYear()==e&&r.getMonth()+1==t});d=d.filter(e=>{let t=`desconhecido`;e.idAluno&&l[e.idAluno]?t=l[e.idAluno]:e.alunoNome&&u[e.alunoNome.toLowerCase().trim()]&&(t=u[e.alunoNome.toLowerCase().trim()]);let r=t===`ativo`,i=e.status===`Pago`,a=new Date;a.setHours(0,0,0,0);let o=new Date(e.vencimento+`T00:00:00`);return n===`pagos`?i:n===`pendentes`?!i&&r:n===`inadimplentes`?r&&!i&&o<a:n===`excluidos`?!r:!0}),d.sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),Z.dadosRelatorioCache=d;let f=e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0),p=d.reduce((e,t)=>e+(parseFloat(t.valor)||0),0),m=d.filter(e=>e.status===`Pago`).reduce((e,t)=>e+f(t),0),h=d.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),g=e=>e.toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`});r.innerHTML=`
            ${$}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR EXTRATO MENSAL</button>
<button onclick="App.baixarExcelRelatorio('Mensal')" class="btn-primary" style="background:#27ae60; border:none; width:auto; padding:10px 20px; margin-bottom:10px; margin-left:10px;">📊 BAIXAR EXCEL</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:30px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${c}
                        <div><h3 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${Z.escapeHTML(o.nome)}</h3><div style="font-size:11px; color:#666;">CNPJ: ${Z.escapeHTML(o.cnpj)}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h2 style="margin:0; font-size:20px; color:#2980b9;">${i} / ${e}</h2>
                        <div style="font-size:10px; color:#999;">Relatório Mensal<br>Emissão: ${new Date().toLocaleString(`pt-BR`)}</div>
                    </div>
                </div>
                
                <div class="kpi-container" style="margin-bottom:30px;">
                    <div class="kpi-box" style="background:#34495e; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PREVISÃO</div><div style="font-size:20px; font-weight:bold;">${g(p)}</div></div>
                    <div class="kpi-box" style="background:#27ae60; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">REALIZADO</div><div style="font-size:20px; font-weight:bold;">${g(m)}</div></div>
                    <div class="kpi-box" style="background:#e74c3c; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PENDENTE</div><div style="font-size:20px; font-weight:bold;">${g(h)}</div></div>
                </div>
                
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555; min-width:500px;">
                        <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                            <tr><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">VENCIMENTO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">ALUNO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">DESCRIÇÃO DO PRODUTO</th><th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">STATUS / FORMA</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">VALOR</th></tr>
                        </thead>
                        <tbody>
                            ${d.length===0?`<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhum registo encontrado para este filtro.</td></tr>`:``}
                            ${d.map(e=>{let t=e.status===`Pago`,n=t?`PAGO`:`PENDENTE`;return t&&e.formaPagamento&&(n+=`<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${Z.escapeHTML(e.formaPagamento)}${e.formaPagamento2?` / ${Z.escapeHTML(e.formaPagamento2)}`:``}<br>Pago em: ${Z.escapeHTML(e.dataPagamento?e.dataPagamento.split(`-`).reverse().join(`/`):``)}</span>`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${Z.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="padding:10px;">${Z.escapeHTML(e.alunoNome||`Não informado`)}</td><td style="padding:10px;">${Z.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${t?`green`:`red`};">${n}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${g(t?f(e):parseFloat(e.valor)||0)}</td></tr>`}).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>`}catch{Z.showToast(`Erro ao gerar relatório mensal.`,`error`)}},Z.baixarExcelRelatorio=e=>{if(!Z.dadosRelatorioCache||Z.dadosRelatorioCache.length===0)return Z.showToast(`Não há dados para exportar.`,`warning`);let t=`Vencimento;Nome do Aluno;Descricao;Status;Valor
`;Z.dadosRelatorioCache.forEach(e=>{let n=e.vencimento?e.vencimento.split(`-`).reverse().join(`/`):``,r=e.alunoNome||`Desconhecido`,i=e.descricao||``,a=e.status===`Pago`?`PAGO`:`PENDENTE/ATRASADO`,o=(e.status===`Pago`?(e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0))(e):parseFloat(e.valor||0)).toLocaleString(`pt-BR`,{minimumFractionDigits:2}).replace(/\./g,``);t+=`"${n}";"${r}";"${i}";"${a}";"${o}"\n`});let n=new Blob([`﻿`+t],{type:`text/csv;charset=utf-8;`}),r=document.createElement(`a`);r.href=URL.createObjectURL(n),r.download=`Relatorio_Financeiro_${e}_${new Date().getTime()}.csv`,r.click(),Z.showToast(`Download iniciado!`,`success`)},Z.renderizarDossie=()=>{Z.setTitulo(`Dossiê Executivo BI`);let e=document.getElementById(`app-content`),t=new Date().getFullYear(),n=new Date().getMonth()+1,r=`
        <div style="text-align:center;">
            <div style="font-size:48px; margin-bottom:15px;">📊</div>
            <h2 style="margin:0 0 10px 0; color:#2c3e50;">Dossiê Executivo (BI)</h2>
            <p style="color:#666; margin-bottom:25px;">Selecione o período de referência para gerar a análise profunda da sua escola.</p>
            
            <div style="display:flex; gap:15px; margin-bottom:25px; text-align:left; flex-wrap:wrap;">
                ${Q(`Mês Vigente:`,`dossie-mes`,[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${t+1}" ${t+1===n?`selected`:``}>${e}</option>`).join(``),`style="padding:12px;"`)}
                ${te(`Ano:`,`dossie-ano`,`number`,t,`style="padding:12px; text-align:center;"`)}
            </div>
            
            <button onclick="App.gerarDossie()" class="btn-primary" style="padding:15px; font-size:16px; width:100%; justify-content:center;">GERAR DOSSIÊ ➜</button>
        </div>
    `;e.innerHTML=Z.UI.card(``,``,r,`500px`)},Z.gerarDossie=async()=>{let e=document.getElementById(`dossie-ano`).value,t=parseInt(document.getElementById(`dossie-mes`).value),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`],r=n[t-1],i=document.getElementById(`app-content`);i.innerHTML=`<p style="text-align:center; padding:20px; font-size:14px; color:#2980b9;"><b>A gerar Dossiê Corporativo...</b><br>Sincronizando layout e paginação de impressão ⏳</p>`,document.body.style.cursor=`wait`;try{let[a,o,s,c,l,u]=await Promise.all([Z.api(`/alunos`).catch(()=>[]),Z.api(`/turmas`).catch(()=>[]),Z.api(`/cursos`).catch(()=>[]),Z.api(`/financeiro`).catch(()=>[]),Z.api(`/escola`).catch(()=>({nome:`Instituição`,cnpj:``})),Z.api(`/planejamentos`).catch(()=>[])]),d=e=>parseFloat(e||0).toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`}),f=e=>e.descricao&&e.descricao.toLowerCase().includes(`venda`)||e.idCarne&&e.idCarne.includes(`VENDA`),p=new Set,m=new Set;a.forEach(e=>{let t=(e.status||`ativo`).toLowerCase();!t.includes(`exclu`)&&!t.includes(`cancel`)&&!t.includes(`tranc`)&&(p.add(e.id),e.nome&&m.add(e.nome.toLowerCase().trim()))});let h=e=>!!(e.idAluno&&p.has(e.idAluno)||e.alunoNome&&m.has(e.alunoNome.toLowerCase().trim())),g=c.filter(t=>t.vencimento&&t.vencimento.startsWith(e)&&t.tipo===`Receita`),_=g.filter(e=>!f(e)&&h(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),v=g.filter(e=>e.status===`Pago`).reduce((e,t)=>e+(parseFloat(t.valorPago1||t.valor)+parseFloat(t.valorPago2||0)),0),y=g.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),b=g.filter(e=>parseInt(e.vencimento.split(`-`)[1])===t),x=b.filter(e=>!f(e)&&h(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),S=b.filter(e=>e.status===`Pago`).reduce((e,t)=>e+(parseFloat(t.valorPago1||t.valor)+parseFloat(t.valorPago2||0)),0),C=b.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),w=``,T=0,E=[];for(let n=0;n<12;n++){let r=t-n,i=parseInt(e);r<=0&&(r+=12,--i),E.push({mes:r,ano:i})}E.reverse(),E.forEach(e=>{let t=c.filter(t=>t.tipo===`Receita`&&t.status===`Pago`&&t.vencimento&&parseInt(t.vencimento.split(`-`)[1])===e.mes&&parseInt(t.vencimento.split(`-`)[0])===e.ano),r=t.filter(e=>!f(e)).reduce((e,t)=>e+(parseFloat(t.valorPago1||t.valor)+parseFloat(t.valorPago2||0)),0),i=t.filter(e=>f(e)).reduce((e,t)=>e+(parseFloat(t.valorPago1||t.valor)+parseFloat(t.valorPago2||0)),0),a=r+i;T+=a,w+=`<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:5px 8px; font-weight:bold; color:#475569;">${n[e.mes-1].substring(0,3)}/${e.ano}</td>
                <td style="padding:5px 8px; text-align:right; color:#2563eb;">${d(r)}</td>
                <td style="padding:5px 8px; text-align:right; color:#7c3aed;">${d(i)}</td>
                <td style="padding:5px 8px; text-align:right; font-weight:bold; color:#0f172a;">${d(a)}</td>
            </tr>`});let D={Ativo:{masc:0,fem:0,total:0},Trancado:{masc:0,fem:0,total:0},Cancelado:{masc:0,fem:0,total:0},Excluído:{masc:0,fem:0,total:0}},O={},k={online:0,presencial:0},A={online:0,presencial:0};a.forEach(n=>{let r=`Ativo`,i=(n.status||``).toLowerCase();i.includes(`exclu`)?r=`Excluído`:i.includes(`cancel`)?r=`Cancelado`:i.includes(`tranc`)&&(r=`Trancado`),D[r].total++,n.sexo===`Masculino`?D[r].masc++:n.sexo===`Feminino`&&D[r].fem++;let a=(n.pais||n.nacionalidade||`Brasil`).trim().toUpperCase();a===``&&(a=`BRASIL`),O[a]=(O[a]||0)+1;let o=(n.modalidade||n.tipoMatricula||`Presencial`).toLowerCase().includes(`online`)?`online`:`presencial`;if(A[o]++,n.dataCadastro||n.dataMatricula){let r=new Date(n.dataCadastro||n.dataMatricula);r.getFullYear()===parseInt(e)&&r.getMonth()+1===t&&k[o]++}else k[o]++});let j=a.length||1,M={};o.forEach(e=>M[e.nome]=0);let N={};s.forEach(e=>N[e.nome]=0),a.forEach(e=>{e.turma&&M[e.turma]!==void 0&&M[e.turma]++,e.curso&&N[e.curso]!==void 0&&N[e.curso]++});let P=u.filter(e=>!e.status||e.status.toLowerCase()!==`arquivado`).length,F=u.filter(e=>e.status&&e.status.toLowerCase()===`arquivado`).length,I=(e,t)=>{let n=Object.keys(e).filter(t=>e[t]>0);return n.length===0?`<div style="font-size:10px; color:#94a3b8;">Nenhum registo ativo.</div>`:`<div style="display:flex; flex-wrap:wrap; gap:5px;">`+n.map(n=>`<div style="background:#f1f5f9; border:1px solid #e2e8f0; padding:3px 6px; border-radius:4px; display:flex; gap:6px; align-items:center; font-size:9.5px; page-break-inside: avoid;">
                    <span style="color:#334155; font-weight:600;">${Z.escapeHTML(n)}</span>
                    <strong style="background:${t}; color:#fff; padding:1px 5px; border-radius:10px; font-size:8.5px;">${e[n]}</strong>
                </div>`).join(``)+`</div>`};i.innerHTML=`
            ${$}
            <style>
                * { box-sizing: border-box !important; }
                .dossier-wrap { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; }
                .section-header { background: #1e293b; color: white; padding: 6px 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px; margin: 15px 0 10px 0; display: flex; align-items: center; gap: 8px; page-break-after: avoid; }
                .fin-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
                .fin-table th { background: #f8fafc; padding: 6px 8px; text-align: left; border-bottom: 1px solid #cbd5e1; color: #475569; }
                .fin-table td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
                
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
                .grid-admin-3 { display: grid; grid-template-columns: 1.1fr 1.2fr 1fr; gap: 10px; margin-bottom: 10px; width: 100%; }
                .box-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; page-break-inside: avoid; overflow: hidden; display: flex; flex-direction: column; }
                .box-tit { font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #f1f5f9; padding-bottom: 4px; margin-top: 0; margin-bottom: 8px; font-weight: bold; }
                
                /* MODO DE IMPRESSÃO: FORÇAR CORES E NUMERAÇÃO DE PÁGINAS */
                @media print {
                    @page { 
                        margin: 10mm 10mm 15mm 10mm; /* A margem inferior maior permite ao navegador injetar o número da página */
                        size: A4 portrait; 
                        
                        /* Injeção nativa de numeração para navegadores modernos */
                        @bottom-right {
                            content: "Página " counter(page) " de " counter(pages);
                            font-family: 'Segoe UI', Arial, sans-serif;
                            font-size: 9px;
                            color: #64748b;
                        }
                    }
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        color-adjust: exact !important; 
                    }
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    .print-sheet { padding: 0 !important; margin: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; }
                    .box-card { border: 1px solid #cbd5e1 !important; }
                    /* Garante que as grelhas fiquem estáticas */
                    .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; }
                    .grid-admin-3 { display: grid !important; grid-template-columns: 1.1fr 1.2fr 1fr !important; }
                }

                @media screen and (max-width: 992px) {
                    .grid-admin-3 { grid-template-columns: 1fr; }
                    .grid-2 { grid-template-columns: 1fr; }
                }
            </style>

            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="App.renderizarDossie()" class="btn-cancel" style="margin-right:10px; margin-bottom:10px; padding:8px 16px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:8px 16px; margin-bottom:10px;">🖨️ IMPRIMIR DOSSIÊ</button>
            </div>
            
            <div class="print-sheet dossier-wrap">
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${l.foto?`<img src="${l.foto}" style="height:35px; object-fit:contain;">`:``} 
                        <div>
                            <h2 style="margin:0; text-transform:uppercase; color:#0f172a; font-size:15px; font-weight:900;">${Z.escapeHTML(l.nome)}</h2>
                            <div style="font-size:9px; color:#64748b;">CNPJ: ${Z.escapeHTML(l.cnpj)}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:900; font-size:12px; text-transform:uppercase;">Dossiê Corporativo Integrado</div>
                        <div style="font-size:8.5px; color:#64748b; margin-top:2px;">Referência: ${r}/${e} | Emissão: ${new Date().toLocaleString(`pt-BR`)}</div>
                    </div>
                </div>

                <div class="section-header">💰 1. DADOS FINANCEIROS</div>
                <div class="grid-2">
                    <div class="box-card" style="background:#f8fafc;">
                        <h3 class="box-tit" style="color:#0f172a; border-color:#cbd5e1;">📊 Visão Anual (${e})</h3>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #cbd5e1;">
                            <span style="font-size:10px; font-weight:bold; color:#475569;">Prev. Resumos (Ativos):</span>
                            <span style="font-size:12px; font-weight:900; color:#2563eb;">${d(_)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #cbd5e1;">
                            <span style="font-size:10px; font-weight:bold; color:#475569;">Entrada Bruta (Geral):</span>
                            <span style="font-size:12px; font-weight:900; color:#16a34a;">${d(v)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0;">
                            <span style="font-size:10px; font-weight:bold; color:#475569;">Inadimplência do Ano:</span>
                            <span style="font-size:12px; font-weight:900; color:#dc2626;">${d(y)}</span>
                        </div>
                    </div>
                    <div class="box-card" style="background:#f0fdf4; border-color:#bbf7d0;">
                        <h3 class="box-tit" style="color:#166534; border-color:#bbf7d0;">📈 Visão Mensal (${r})</h3>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #86efac;">
                            <span style="font-size:10px; font-weight:bold; color:#166534;">Prev. Resumos (Ativos):</span>
                            <span style="font-size:12px; font-weight:900; color:#2563eb;">${d(x)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #86efac;">
                            <span style="font-size:10px; font-weight:bold; color:#166534;">Entrada Bruta (Geral):</span>
                            <span style="font-size:12px; font-weight:900; color:#16a34a;">${d(S)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0;">
                            <span style="font-size:10px; font-weight:bold; color:#166534;">Inadimplência do Mês:</span>
                            <span style="font-size:12px; font-weight:900; color:#dc2626;">${d(C)}</span>
                        </div>
                    </div>
                </div>

                <div class="box-card">
                    <h3 class="box-tit">Histórico de Receitas Brutas (Últimos 12 Meses)</h3>
                    <table class="fin-table">
                        <thead><tr><th>PERÍODO</th><th style="text-align:right;">MENSALIDADES</th><th style="text-align:right;">VENDAS / LOJA</th><th style="text-align:right;">TOTAL DO MÊS</th></tr></thead>
                        <tbody>${w}</tbody>
                        <tfoot>
                            <tr style="background:#f8fafc; border-top:2px solid #cbd5e1;">
                                <td colspan="3" style="text-align:right; font-weight:bold; padding:6px;">TOTAL DO CICLO (1 ANO):</td>
                                <td style="text-align:right; font-weight:900; font-size:11.5px; color:#16a34a; padding:6px;">${d(T)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="section-header">🏢 2. DADOS ADMINISTRATIVOS</div>
                
                <div class="grid-admin-3">
                    <div class="box-card">
                        <h3 class="box-tit">Status das Matrículas</h3>
                        <div style="display:flex; align-items:center; gap:6px; justify-content:space-between; flex:1;">
                            <div style="position:relative; width:80px; height:80px; flex-shrink:0;"><canvas id="chartStatus"></canvas></div>
                            <div style="flex:1;">
                                <table class="fin-table" style="font-size:8px; line-height:1.2;">
                                    <tr><td style="padding:2px 4px;"><span style="color:#16a34a; font-weight:bold;">● Ativos</span></td><td style="text-align:right; font-weight:bold;">${D.Ativo.total} <span style="font-weight:normal; color:#888;">(${Math.round(D.Ativo.total/j*100)}%)</span></td></tr>
                                    <tr><td style="padding:2px 4px;"><span style="color:#d97706; font-weight:bold;">● Tranc.</span></td><td style="text-align:right; font-weight:bold;">${D.Trancado.total} <span style="font-weight:normal; color:#888;">(${Math.round(D.Trancado.total/j*100)}%)</span></td></tr>
                                    <tr><td style="padding:2px 4px;"><span style="color:#ea580c; font-weight:bold;">● Canc.</span></td><td style="text-align:right; font-weight:bold;">${D.Cancelado.total} <span style="font-weight:normal; color:#888;">(${Math.round(D.Cancelado.total/j*100)}%)</span></td></tr>
                                    <tr><td style="padding:2px 4px;"><span style="color:#dc2626; font-weight:bold;">● Excl.</span></td><td style="text-align:right; font-weight:bold;">${D.Excluído.total} <span style="font-weight:normal; color:#888;">(${Math.round(D.Excluído.total/j*100)}%)</span></td></tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="box-card">
                        <h3 class="box-tit">Demografia de Género por Status</h3>
                        <div style="position:relative; width:100%; height:95px; margin:auto 0;"><canvas id="chartGender"></canvas></div>
                    </div>

                    <div class="box-card">
                        <h3 class="box-tit">Canais de Captação</h3>
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex:1;">
                            <div style="text-align:center; flex-shrink:0;">
                                <div style="position:relative; width:65px; height:65px; margin:0 auto;"><canvas id="chartCaptacaoMes"></canvas></div>
                                <div style="font-size:7px; color:#64748b; font-weight:bold; margin-top:2px;">NO MÊS</div>
                            </div>
                            <div style="border-left:1px solid #e2e8f0; padding-left:6px; text-align:right; flex:1; justify-content:center; display:flex; flex-direction:column; gap:2px;">
                                <div style="font-size:7.5px; font-weight:bold; color:#64748b; text-transform:uppercase; line-height:1;">12 MESES:</div>
                                <div style="font-size:11px; font-weight:900; color:#3b82f6; line-height:1.1;">${A.online} <span style="font-size:7.5px; color:#94a3b8; font-weight:bold;">(${Math.round(A.online/j*100)}%)</span></div>
                                <div style="font-size:11px; font-weight:900; color:#8b5cf6; line-height:1.1;">${A.presencial} <span style="font-size:7.5px; color:#94a3b8; font-weight:bold;">(${Math.round(A.presencial/j*100)}%)</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box-card" style="margin-bottom:10px;">
                    <h3 class="box-tit">Países de Origem (Top Representatividade)</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:5px;">
                        ${Object.keys(O).map(e=>`<div style="background:#f8fafc; border:1px solid #e2e8f0; padding:3px 6px; border-radius:4px; font-size:9px; color:#334155;"><b>${e}</b>: ${O[e]} <span style="color:#777;">(${Math.round(O[e]/j*100)}%)</span></div>`).join(``)}
                    </div>
                </div>

                <div class="section-header">📚 3. DADOS PEDAGÓGICOS</div>
                <div class="grid-2">
                    <div class="box-card">
                        <h3 class="box-tit">Ocupação de Cursos</h3>
                        ${I(N,`#3b82f6`)}
                        <h3 class="box-tit" style="margin-top:12px;">Integração por Turmas</h3>
                        ${I(M,`#10b981`)}
                    </div>
                    <div class="box-card">
                        <h3 class="box-tit">Gestão de Planejamentos de Aula</h3>
                        <div style="display:flex; gap:8px; flex:1; align-items:center;">
                            <div style="flex:1; background:#f0fdf4; border:1px solid #bbf7d0; padding:12px 6px; border-radius:6px; text-align:center;">
                                <div style="font-size:8.5px; font-weight:bold; color:#166534; text-transform:uppercase;">Ativos</div>
                                <div style="font-size:22px; font-weight:900; color:#15803d; margin-top:2px;">${P}</div>
                            </div>
                            <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:12px 6px; border-radius:6px; text-align:center;">
                                <div style="font-size:8.5px; font-weight:bold; color:#475569; text-transform:uppercase;">Arquivados</div>
                                <div style="font-size:22px; font-weight:900; color:#64748b; margin-top:2px;">${F}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>`;let L={id:`pluginNumerosNoGrafico`,afterDatasetsDraw(e){let{ctx:t,data:n}=e;t.save(),e.data.datasets.forEach((n,r)=>{e.getDatasetMeta(r).data.forEach((e,r)=>{let i=n.data[r];if(i===0)return;let{x:a,y:o,startAngle:s,endAngle:c,innerRadius:l,outerRadius:u}=e,d=s+(c-s)/2,f=l+(u-l)*.55,p=a+Math.cos(d)*f,m=o+Math.sin(d)*f;t.fillStyle=`#ffffff`,t.font=`bold 9px Arial`,t.textBaseline=`middle`,t.textAlign=`center`,t.fillText(i,p,m)})}),t.restore()}};setTimeout(()=>{let e=(e,t)=>{let n=document.getElementById(e);if(!n)return;let r=Chart.getChart(n);r&&r.destroy(),new Chart(n,t)};e(`chartStatus`,{type:`doughnut`,plugins:[L],data:{labels:[`Ativos`,`Trancados`,`Cancelados`,`Excluídos`],datasets:[{data:[D.Ativo.total,D.Trancado.total,D.Cancelado.total,D.Excluído.total],backgroundColor:[`#16a34a`,`#d97706`,`#ea580c`,`#dc2626`],borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},cutout:`55%`}}),document.getElementById(`chartCaptacaoMes`)&&(k.online>0||k.presencial>0?e(`chartCaptacaoMes`,{type:`pie`,plugins:[L],data:{labels:[`Online`,`Presencial`],datasets:[{data:[k.online,k.presencial],backgroundColor:[`#3b82f6`,`#8b5cf6`],borderWidth:1,borderColor:`#fff`}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}}):document.getElementById(`chartCaptacaoMes`).parentElement.innerHTML=`<div style="font-size:8px; color:#94a3b8; margin-top:15px; line-height:1.1; text-align:center;">Sem registros<br>no mês.</div>`),e(`chartGender`,{type:`bar`,data:{labels:[`Ativ.`,`Tran.`,`Can.`,`Excl.`],datasets:[{label:`Masc`,data:[D.Ativo.masc,D.Trancado.masc,D.Cancelado.masc,D.Excluído.masc],backgroundColor:`#3b82f6`,borderRadius:1.5},{label:`Fem`,data:[D.Ativo.fem,D.Trancado.fem,D.Cancelado.fem,D.Excluído.fem],backgroundColor:`#ec4899`,borderRadius:1.5}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:`top`,labels:{boxWidth:6,font:{size:7.5},padding:4}}},scales:{x:{grid:{display:!1},ticks:{font:{size:7.5}}},y:{beginAtZero:!0,border:{display:!1},ticks:{stepSize:1,font:{size:7.5}}}}}})},300)}catch(e){Z.showToast(`Erro ao gerar dossiê corporativo.`,`error`),console.error(e)}finally{document.body.style.cursor=`default`}},Z.renderizarDiarioSetup=async()=>{Z.setTitulo(`Diário de Classe`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center;">Carregando turmas... ⏳</p>`;try{let t=`<option value="">-- Selecione a Turma --</option>`+(await Z.api(`/turmas`)).map(e=>`<option value="${e.nome}">${Z.escapeHTML(e.nome)}</option>`).join(``),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${e}" ${t===new Date().getMonth()?`selected`:``}>${e}</option>`).join(``),r=`
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:12px; margin-bottom:18px; flex-wrap:wrap; gap:10px;">
                <span style="color:#64748b; font-size:13px;">Selecione a turma e o mês para gerar a pauta oficial de presença em formato A4 Paisagem.</span>
                <button onclick="App.renderizarGeradorDocumentos()" style="background:#ecf0f1; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold; color:#7f8c8d;">⬅ Voltar à Fábrica</button>
            </div>
            <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap; margin-bottom: 10px;">
                ${Q(`Turma:`,`diario-turma`,t,`style="min-width:250px;"`)}
                ${Q(`Mês de Referência:`,`diario-mes`,n,`style="min-width:150px;"`)}
                <button onclick="App.gerarDiarioImprimir()" class="btn-primary" style="height:41px; padding:0 25px; margin-bottom:2px; background:#27ae60; border:none;">📝 GERAR DIÁRIO</button>
            </div>
        `;e.innerHTML=`<div class="no-print">${Z.UI.card(`📝 Gerar Pauta de Frequência`,``,r,`100%`)}</div><div id="diario-area" style="margin-top:25px;"></div>`}catch{e.innerHTML=`Erro ao carregar as turmas.`}},Z.gerarDiarioImprimir=async()=>{let e=document.getElementById(`diario-turma`).value,t=document.getElementById(`diario-mes`).value;if(!e)return Z.showToast(`Selecione uma turma.`,`warning`);let n=document.getElementById(`diario-area`);n.innerHTML=`<p style="text-align:center;">Desenhando grelha paginada... ⏳</p>`,document.body.style.cursor=`wait`;try{let[r,i,a]=await Promise.all([Z.api(`/alunos`),Z.api(`/escola`),Z.api(`/turmas`)]),o=a.find(t=>t.nome===e)||{dia:`-`,horario:`-`,curso:`-`},s=i.foto?`<img src="${i.foto}" style="height:42px; object-fit:contain;">`:``,c=new Date().getFullYear(),l=r.filter(t=>t.turma===e&&(!t.status||t.status===`Ativo`)).sort((e,t)=>(e.nome||``).localeCompare(t.nome||``)),u=`<col style="width: 22.5%;">`,d=``;for(let e=1;e<=31;e++)u+=`<col style="width: 2.5%;">`,d+=`<th class="diario-col-dia">${String(e).padStart(2,`0`)}</th>`;let f=[];if(l.length===0)f.push([]);else for(let e=0;e<l.length;e+=20)f.push(l.slice(e,e+20));let p=f.length,m=f.map((n,r)=>{let a=r+1,f=a===p,m=r*20,h=``;return n.length===0?h=`<tr><td colspan="32" style="text-align:center; padding: 25px; border: 1px solid #334155; font-size: 12px; color: #64748b;">Nenhum aluno ativo matriculado nesta turma.</td></tr>`:n.forEach((e,t)=>{let n=m+t+1,r=``;for(let e=1;e<=31;e++)r+=`<td class="diario-celula-dia"></td>`;let i=t%2==0?`#ffffff`:`#f8fafc`;h+=`
                        <tr class="diario-linha-aluno" style="background: ${i};">
                            <td class="diario-col-nome" title="${Z.escapeHTML(e.nome)}">
                                <span style="font-weight:700; color:#475569; margin-right:4px;">${String(n).padStart(2,`0`)}.</span>${Z.escapeHTML(e.nome)}
                            </td>
                            ${r}
                        </tr>`}),`
                <div class="print-sheet-landscape diario-folha-a4 ${f?``:`diario-quebra-pagina`}">
                    <!-- CABEÇALHO DA FOLHA -->
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:12px; flex-wrap:wrap; gap:10px; width:99%; margin-left:auto; margin-right:auto;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            ${s}
                            <div>
                                <h2 style="margin:0; font-size:15px; text-transform:uppercase; color:#0f172a; font-weight:900;">${Z.escapeHTML(i.nome||`INSTITUIÇÃO DE ENSINO`)}</h2>
                                <div style="font-size:10.5px; color:#475569; font-weight:600;">Diário de Classe • Pauta Oficial de Frequência Mensal</div>
                            </div>
                        </div>
                        <div style="display:flex; gap:14px; align-items:center; background:#f8fafc; border:1px solid #cbd5e1; padding:6px 12px; border-radius:6px; font-size:11px;">
                            <div><strong>Turma:</strong> <span style="color:#2563eb; font-weight:800;">${Z.escapeHTML(e)}</span></div>
                            <div><strong>Mês/Ano:</strong> <span style="color:#16a34a; font-weight:800;">${t} / ${c}</span></div>
                            <div><strong>Horário:</strong> <span style="color:#0f172a; font-weight:700;">${Z.escapeHTML(o.horario||`-`)}</span></div>
                            <div><strong>Alunos:</strong> <span style="color:#0f172a; font-weight:700;">${l.length}</span></div>
                        </div>
                    </div>

                    <!-- TABELA DA GRELHA COM MARGEM DE SEGURANÇA DE 99% PARA NÃO CORTAR NA DIREITA -->
                    <table class="diario-tabela">
                        <colgroup>${u}</colgroup>
                        <thead>
                            <tr>
                                <th class="diario-col-nome" style="background:#cbd5e1 !important; font-weight:900 !important; font-size:10px !important; text-transform:uppercase;">NOME DO ALUNO</th>
                                ${d}
                            </tr>
                        </thead>
                        <tbody>${h}</tbody>
                    </table>

                    <!-- RODAPÉ COM LEGENDA, ASSINATURA MAIS ABAIXO E NUMERAÇÃO DE PÁGINAS -->
                    <div class="diario-rodape-bloco">
                        <div style="font-size: 10px; color: #334155;">
                            <strong>Legenda de Preenchimento:</strong> ( <b>P</b> ) Presente &nbsp;|&nbsp; ( <b>F</b> ) Falta &nbsp;|&nbsp; ( <b>J</b> ) Falta Justificada
                        </div>

                        <div style="display:flex; align-items:flex-end; gap:35px;">
                            <div style="width: 270px; border-top: 1.5px solid #0f172a; padding-top: 5px; text-align: center; font-weight: 700; font-size: 10.5px; color: #0f172a;">
                                Assinatura do(a) Professor(a) Responsável
                            </div>
                            <div style="font-size: 10px; font-weight: 800; color: #475569; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1; white-space: nowrap;">
                                Página ${a} de ${p}
                            </div>
                        </div>
                    </div>
                </div>
            `}).join(``);n.innerHTML=`
            ${$}
            <style>
                .diario-folha-a4 {
                    margin-bottom: 30px !important;
                }
                .diario-tabela {
                    width: 99% !important;
                    max-width: 99% !important;
                    margin: 0 auto !important;
                    table-layout: fixed !important;
                    border-collapse: collapse !important;
                    box-sizing: border-box !important;
                }
                .diario-linha-aluno {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .diario-col-nome {
                    border: 1px solid #1e293b !important;
                    padding: 4px 6px !important;
                    font-size: 10.5px !important;
                    color: #0f172a !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    text-align: left !important;
                    box-sizing: border-box !important;
                }
                .diario-col-dia {
                    border: 1px solid #1e293b !important;
                    text-align: center !important;
                    font-size: 9px !important;
                    font-weight: 800 !important;
                    padding: 3px 0 !important;
                    color: #0f172a !important;
                    background: #e2e8f0 !important;
                    box-sizing: border-box !important;
                }
                .diario-celula-dia {
                    border: 1px solid #334155 !important;
                    height: 21px !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                }
                /* 📝 Espaço generoso (48px) acima da linha de assinatura do professor */
                .diario-rodape-bloco {
                    width: 99% !important;
                    margin: 48px auto 0 auto !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: flex-end !important;
                    flex-wrap: wrap !important;
                    gap: 15px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                @media print { 
                    @page { size: A4 landscape; margin: 7mm 8mm; }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .diario-folha-a4 {
                        margin-bottom: 0 !important;
                        padding: 2mm 1mm !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .diario-quebra-pagina {
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                }
            </style>

            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:12px 24px; background:#2980b9; border:none; border-radius:8px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(41,128,185,0.3);">
                    🖨️ IMPRIMIR DIÁRIO DE CLASSE (${p} ${p>1?`PÁGINAS`:`PÁGINA`})
                </button>
            </div>

            ${m}
        `}catch{Z.showToast(`Erro ao gerar o Diário.`,`error`)}finally{document.body.style.cursor=`default`}},Z.gerarFichaSetup=async()=>{Z.setTitulo(`Ficha de Matrícula`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center;">Carregando...</p>`;try{let t=`
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${Q(`Selecione o Aluno:`,`ficha-aluno`,`<option value="">-- Selecione o Aluno --</option>`+(await Z.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${Z.escapeHTML(e.nome)}</option>`).join(``))}
                <button onclick="App.gerarFichaImprimir()" class="btn-primary" style="height:41px; padding:0 25px; margin-bottom:5px;">GERAR FICHA</button>
            </div>
        `;e.innerHTML=`<div class="no-print">${Z.UI.card(`📄 Imprimir Ficha de Matrícula`,``,t,`100%`)}</div><div id="ficha-area" style="margin-top:30px;"></div>`}catch{e.innerHTML=`Erro ao carregar os alunos.`}},Z.gerarFichaImprimir=async()=>{let e=document.getElementById(`ficha-aluno`).value;if(!e)return Z.showToast(`Por favor, selecione um aluno.`,`warning`);let t=document.getElementById(`ficha-area`);t.innerHTML=`<p style="text-align:center;">Gerando ficha... ⏳</p>`,document.body.style.cursor=`wait`;try{let[n,r,i,a]=await Promise.all([Z.api(`/alunos`),Z.api(`/escola`),Z.api(`/financeiro`),Z.api(`/turmas`)]),o=n.find(t=>t.id===e)||{},s=r.foto?`<img src="${r.foto}" style="height:60px; object-fit:contain;">`:``,c=a.find(e=>e.nome===o.turma)||{dia:`-`,horario:`-`},l=i.filter(t=>t.idAluno===e&&t.tipo===`Receita`),u=e=>e.descricao&&e.descricao.toLowerCase().includes(`venda`)||e.idCarne&&e.idCarne.includes(`VENDA`),d=l.filter(e=>!u(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),f=l.filter(e=>u(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),p=d+f,m=e=>`R$ ${e.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,h=``;o.resp_nome&&o.resp_nome.trim()!==``&&(h=`
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#d35400; font-size:15px;">👤 DADOS DO RESPONSÁVEL LEGAL (Menor de Idade)</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px; background:#fff3e0; padding:15px; border-radius:5px; border:1px dashed #e67e22;">
                    <div><b>Nome do Responsável:</b> ${Z.escapeHTML(o.resp_nome)}</div>
                    <div><b>Grau Parentesco:</b> ${Z.escapeHTML(o.resp_parentesco||`-`)}</div>
                    <div><b>CPF do Responsável:</b> ${Z.escapeHTML(o.resp_cpf||`-`)}</div>
                    <div><b>WhatsApp:</b> ${Z.escapeHTML(o.resp_zap||`-`)}</div>
                </div>
            `),t.innerHTML=`
            ${$}
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR FICHA</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${s}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${Z.escapeHTML(r.nome)}</h2><div style="font-size:12px;">CNPJ: ${Z.escapeHTML(r.cnpj)}</div></div></div>
                    <div style="text-align:right;"><div><b>FICHA DE MATRÍCULA</b></div><div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleDateString(`pt-BR`)}</div></div>
                </div>
                <div style="border: 1px solid #ccc; padding: 20px; margin-top: 20px; background:#fafafa;">
                    
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; color:#2c3e50; font-size:15px;">1. DADOS DO ALUNO</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px;">
                        <div><b>Nome:</b> ${Z.escapeHTML(o.nome||`-`)}</div>
                        <div><b>Data Nascimento:</b> ${Z.escapeHTML(o.nascimento?o.nascimento.split(`-`).reverse().join(`/`):`-`)}</div>
                        <div><b>CPF:</b> ${Z.escapeHTML(o.cpf||`-`)}</div>
                        <div><b>RG:</b> ${Z.escapeHTML(o.rg||`-`)}</div>
                        <div><b>Sexo:</b> ${Z.escapeHTML(o.sexo||`-`)}</div>
                        <div><b>WhatsApp:</b> ${Z.escapeHTML(o.whatsapp||`-`)}</div>
                    </div>

                    ${h}

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#2c3e50; font-size:15px;">2. CURSO E MATRÍCULA</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 10px; font-size:13px;">
                        <div><b>Curso:</b> ${Z.escapeHTML(o.curso||`-`)}</div>
                        <div><b>Turma:</b> ${Z.escapeHTML(o.turma||`-`)}</div>
                        <div><b>Dias de Aula:</b> ${Z.escapeHTML(c.dia||`-`)}</div>
                        <div><b>Horário:</b> ${Z.escapeHTML(c.horario||`-`)}</div>
                    </div>

                    <div style="grid-column: 1 / -1; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; overflow: hidden;">
                        <div style="background: #2c3e50; color: white; padding: 6px 10px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                            📊 Auditoria Financeira do Aluno
                        </div>
                        <div style="display: flex; background: #fafafa; text-align: center; flex-wrap: wrap;">
                            <div style="flex: 1; padding: 10px; border-right: 1px solid #eee; min-width: 100px;">
                                <div style="font-size: 10px; color: #666; text-transform: uppercase; font-weight:bold;">Investimento do Curso</div>
                                <div style="font-size: 14px; font-weight: bold; color: #2980b9;">${d>0?m(d):`-`}</div>
                            </div>
                            <div style="flex: 1; padding: 10px; border-right: 1px solid #eee; min-width: 100px;">
                                <div style="font-size: 10px; color: #666; text-transform: uppercase; font-weight:bold;">Materiais / Lojinha</div>
                                <div style="font-size: 14px; font-weight: bold; color: #8e44ad;">${f>0?m(f):`-`}</div>
                            </div>
                            <div style="flex: 1; padding: 10px; background: #ffffd0; min-width: 100px;">
                                <div style="font-size: 10px; color: #d35400; text-transform: uppercase; font-weight: bold;">Investimento Total</div>
                                <div style="font-size: 15px; font-weight: bold; color: #d35400;">${p>0?m(p):`Isento`}</div>
                            </div>
                        </div>
                    </div>

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color:#2c3e50; font-size:15px;">3. ENDEREÇO</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15x; margin-bottom: 20px; font-size:13px;">
                        <div style="grid-column: 1 / -1;"><b>Logradouro:</b> ${Z.escapeHTML(o.rua||`-`)}, ${Z.escapeHTML(o.numero||`-`)}</div>
                        <div><b>Bairro:</b> ${Z.escapeHTML(o.bairro||`-`)}</div>
                        <div><b>Cidade/UF:</b> ${Z.escapeHTML(o.cidade||`-`)}/${Z.escapeHTML(o.estado||`-`)}</div>
                    </div>
                </div>
                <div style="margin-top:50px; display:flex; justify-content:space-between; text-align:center; flex-wrap:wrap; gap:30px;">
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Assinatura do Aluno${o.resp_nome?` / Responsável Legal`:``}</div>
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Direção da Escola</div>
                </div>
            </div>
        `}catch{Z.showToast(`Erro ao gerar ficha. O aluno não foi encontrado.`,`error`)}finally{document.body.style.cursor=`default`}},Z.renderizarGeradorDocumentos=()=>{Z.setTitulo(`Fábrica de Documentos`);let e=document.getElementById(`app-content`),t=e=>`cursor:pointer; background:white; border:2px solid #eee; padding:40px 20px; border-radius:15px; width:45%; min-width:250px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05); text-align:center;`,n=e=>`this.style.borderColor='${e}'; this.style.transform='translateY(-5px)'`,r=`this.style.borderColor='#eee'; this.style.transform='translateY(0)'`,i=`
        <div style="text-align:center; padding:20px;">
            <h2 style="color:#2c3e50; margin-bottom:10px;">O que deseja emitir hoje?</h2>
            <p style="color:#7f8c8d; margin-bottom:40px;">Escolha a categoria do documento para abrir o ambiente de formatação adequado.</p>
            
            <div style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap;">
                <div onclick="App.renderizarMenuDocumentosOficiais()" style="${t(`#3498db`)}" onmouseover="${n(`#3498db`)}" onmouseout="${r}">
                    <div style="font-size:60px; margin-bottom:15px;">📄</div>
                    <h3 style="margin:0 0 10px 0; color:#3498db;">Documentos Oficiais</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Contratos de Serviços e Declarações de Matrícula (A4 Retrato).</p>
                </div>
                
                <div onclick="App.renderizarMenuCertificados()" style="${t(`#f39c12`)}" onmouseover="${n(`#f39c12`)}" onmouseout="${r}">
                    <div style="font-size:60px; margin-bottom:15px;">🎓</div>
                    <h3 style="margin:0 0 10px 0; color:#f39c12;">Certificados de Conclusão</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Diplomas oficiais com carga horária e selos (A4 Paisagem).</p>
                </div>

                <div onclick="App.renderizarDiarioSetup()" style="${t(`#27ae60`)}" onmouseover="${n(`#27ae60`)}" onmouseout="${r}">
                    <div style="font-size:60px; margin-bottom:15px;">📝</div>
                    <h3 style="margin:0 0 10px 0; color:#27ae60;">Diários de Classe</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Grelhas de frequência com 31 dias para turmas ativas (A4 Paisagem).</p>
                </div>
            </div>
        </div>
    `;e.innerHTML=Z.UI.card(``,``,i,`100%`)},Z.renderizarMenuDocumentosOficiais=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar base de alunos... ⏳</p>`;try{let t=(await Z.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`);e.innerHTML=`
            <div class="card no-print" style="max-width: 700px; margin: 0 auto; border-top: 4px solid #3498db;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:25px;">
                    <h3 style="color:#2c3e50; margin:0; display:flex; align-items:center; gap:10px; font-size:18px;">
                        📄 Emissão de Documentos Oficiais
                    </h3>
                    <button onclick="App.renderizarGeradorDocumentos()" style="background:#ecf0f1; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold; color:#7f8c8d;">Voltar</button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">1. Selecione o Aluno:</label>
                            <select id="doc-aluno-oficial" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">${t.length>0?`<option value="">-- Selecione o Aluno --</option>`+t.map(e=>`<option value="${e.id}">${Z.escapeHTML(e.nome)} (Turma: ${Z.escapeHTML(e.turma||`-`)})</option>`).join(``):`<option value="">Nenhum aluno ativo encontrado</option>`}</select>
                        </div>
                        
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">2. Qual documento deseja emitir?</label>
                            <select id="doc-tipo-oficial" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">
                                <option value="declaracao">📝 Declaração de Matrícula / Frequência</option>
                                <option value="contrato">📄 Contrato de Prestação de Serviços</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:14px; background:#3498db; border:none; box-shadow:0 4px 10px rgba(52, 152, 219, 0.3); justify-content:center; border-radius:8px; cursor:pointer;" onclick="App.gerarDocumentoOficialPrint()">🖨️ GERAR DOCUMENTO</button>
                </div>
            </div>
            
            <div id="doc-area-oficial" style="margin-top: 30px;"></div>
        `}catch{e.innerHTML=`<p>Erro ao carregar dados.</p>`}},Z.formatarLista=e=>{document.execCommand(`insertOrderedList`,!1,null);let t=window.getSelection();if(t.rangeCount>0){let n=t.anchorNode;if(n&&n.nodeType===3&&(n=n.parentNode),n){let t=n.closest(`ol`);t&&(t.style.listStyleType=e)}}},Z.aplicarFormatacaoDropdown=e=>{let t=e.value;if(!t)return;let n=document.getElementById(`editor-documento`);n&&n.focus(),t===`unorderedList`?document.execCommand(`insertUnorderedList`,!1,null):t===`paragrafo`?document.execCommand(`insertText`,!1,`§ `):Z.formatarLista(t),e.value=``},Z.gerarDocumentoOficialPrint=async()=>{let e=document.getElementById(`doc-aluno-oficial`).value,t=document.getElementById(`doc-tipo-oficial`).value,n=new Date,r=`${n.getDate()} de ${[`janeiro`,`fevereiro`,`março`,`abril`,`maio`,`junho`,`julho`,`agosto`,`setembro`,`outubro`,`novembro`,`dezembro`][n.getMonth()]} de ${n.getFullYear()}`,i=n.toLocaleDateString(`pt-BR`);if(!e)return Z.showToast(`Selecione um aluno na lista.`,`warning`);let a=document.querySelector(`button[onclick="App.gerarDocumentoOficialPrint()"]`),o=a.innerText;a.innerText=`A Preparar Editor... ⏳`,a.disabled=!0,document.body.style.cursor=`wait`;try{let n=(await Z.api(`/alunos`)).find(t=>t.id===e)||{},a=await Z.api(`/escola`)||{nome:`A INSTITUIÇÃO`,cnpj:`00.000.000/0000-00`},o=[];try{o=await Z.api(`/financeiro`)}catch{}let s=parseFloat(n.valorMensalidade||n.mensalidade||n.valor||0),c=n.diaVencimento||n.vencimento||n.dia_vencimento||``;if(s===0||!c){let t=o.filter(t=>t.idAluno===e&&t.tipo===`Receita`&&(!t.descricao||!t.descricao.toLowerCase().includes(`venda`)));if(t.length>0){let e=t[0];s===0&&(s=parseFloat(e.valor||0)),!c&&e.vencimento&&(c=e.vencimento.split(`-`)[2])}}c||=`10`;let l=s.toLocaleString(`pt-BR`,{minimumFractionDigits:2}),u=a.endereco?`${a.endereco}, ${a.numero||`S/N`} - ${a.bairro||``}. ${a.cidade||``}-${a.estado||``} | CEP: ${a.cep||``}`:``,d=`Local não informado`;a.cidade&&a.estado?d=`${Z.escapeHTML(a.cidade)} - ${Z.escapeHTML(a.estado)}`:a.cidade&&(d=Z.escapeHTML(a.cidade));let f=`${d}, ${r}.`,p=document.getElementById(`doc-area-oficial`);p.innerHTML=`<p style="text-align:center;">Gerando Layout... ⏳</p>`;let m=`
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; align-items:center; gap:20px;">${a.foto?`<img src="${a.foto}" style="height:60px; object-fit:contain;">`:``}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${Z.escapeHTML(a.nome)}</h2><div style="font-size:12px; color:#555;">CNPJ: ${Z.escapeHTML(a.cnpj)}<br>${Z.escapeHTML(u)}</div></div></div>
                <div style="text-align:right;">
<div style="font-size:10px; color:#999;">Emissão: ${i}</div>
</div>
            </div>`,h=`padding: 6px 12px; cursor: pointer; font-size: 13px; background: #fff; border: 1px solid #bdc3c7; border-radius: 4px; transition: 0.2s;`,g=`
            <div class="no-print" style="background: #f8f9fa; padding: 10px; border: 1px solid #ccc; border-radius: 5px 5px 0 0; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: -1px; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.05); align-items: center;">
                
                <button type="button" onclick="document.execCommand('bold', false, null)" style="${h} font-weight: bold;" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Negrito">B</button>
                <button type="button" onclick="document.execCommand('italic', false, null)" style="${h} font-style: italic; font-family: serif;" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Itálico">I</button>
                <button type="button" onclick="document.execCommand('underline', false, null)" style="${h} text-decoration: underline;" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Sublinhado">U</button>
                
                <span style="border-left: 1px solid #ccc; margin: 0 2px; height: 24px;"></span>
                
                <button type="button" onclick="document.execCommand('justifyLeft', false, null)" style="${h}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Alinhar à Esquerda">⫷</button>
                <button type="button" onclick="document.execCommand('justifyCenter', false, null)" style="${h}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Centralizar">≣</button>
                <button type="button" onclick="document.execCommand('justifyRight', false, null)" style="${h}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Alinhar à Direita">⫸</button>
                <button type="button" onclick="document.execCommand('justifyFull', false, null)" style="${h}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Justificar Texto">⇹</button>
                
                <span style="border-left: 1px solid #ccc; margin: 0 2px; height: 24px;"></span>
                
                <select onchange="App.aplicarFormatacaoDropdown(this)" style="padding: 6px 10px; font-size: 13px; border: 1px solid #bdc3c7; border-radius: 4px; background: #fff; cursor: pointer; color: #333; outline: none;">
                    <option value="">➕ Inserir Elemento...</option>
                    <option value="unorderedList">• Lista com Pontos</option>
                    <option value="decimal">1. Lista Numerada</option>
                    <option value="lower-alpha">a. Alíneas</option>
                    <option value="upper-roman">I. Incisos</option>
                    <option value="paragrafo">§ Símbolo de Parágrafo</option>
                </select>
                
                <div style="flex-grow: 1; text-align: right; font-size: 12px; font-weight: bold; color: #3498db; display:flex; align-items:center; justify-content:flex-end; gap:5px;">
                    ✍️ MODO DE EDIÇÃO
                </div>
            </div>
        `,_=``,v=``,y=``;t===`contrato`?(_=`
                <h2 style="text-align: center; margin-top: 40px; margin-bottom: 40px; text-transform: uppercase; font-family: Arial, sans-serif;">Contrato de Serviços</h2>
                <div style="text-align: justify; margin-top: 5px; font-size:14px; font-family: Arial, sans-serif;">
                    Pelo presente instrumento particular, de um lado <b>${Z.escapeHTML(a.nome||`A INSTITUIÇÃO`)}</b>, 
                    inscrita no CNPJ sob o nº <b>${Z.escapeHTML(a.cnpj||`00.000.000/0000-00`)}</b>, doravante denominada <b>CONTRATADA</b>, e de outro lado 
                    <b>${Z.escapeHTML(n.nome)}</b>, portador(a) do CPF nº <b>${Z.escapeHTML(n.cpf||`___________`)}</b> e RG nº <b>${Z.escapeHTML(n.rg||`___________`)}</b>, 
                    residente e domiciliado(a) na ${Z.escapeHTML(n.rua||``)}, ${Z.escapeHTML(n.numero||``)} - ${Z.escapeHTML(n.bairro||``)}, 
                    ${Z.escapeHTML(n.cidade||``)}/${Z.escapeHTML(n.estado||``)}, doravante denominado(a) <b>CONTRATANTE</b>.
                </div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">O presente contrato tem como objeto a prestação de serviços educacionais por parte da CONTRATADA ao CONTRATANTE, referente ao curso de <b>${Z.escapeHTML(n.curso||`Não especificado`)}</b>, a ser ministrado na turma <b>${Z.escapeHTML(n.turma||`Não especificada`)}</b>.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA SEGUNDA - DOS VALORES E FORMA DE PAGAMENTO</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">Pelos serviços educacionais prestados, o CONTRATANTE pagará à CONTRATADA a mensalidade no valor estipulado de <b>R$ ${l}</b>, com vencimento programado para todo dia <b>${Z.escapeHTML(c)}</b> de cada mês. O atraso no pagamento sujeitará o CONTRATANTE a multas e juros moratórios conforme a legislação vigente.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA TERCEIRA - DAS RESPONSABILIDADES</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">É responsabilidade do CONTRATANTE zelar pelo patrimônio da instituição, além de manter o mínimo de 75% de frequência nas aulas. A CONTRATADA compromete-se a fornecer o material pedagógico e o corpo docente adequado para o perfeito desenvolvimento das aulas.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA QUARTA - DISPOSIÇÕES GERAIS</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">Este contrato tem validade a partir da data de sua assinatura. As partes elegem o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, renunciando a qualquer outro, por mais privilegiado que seja.</div>
            `,v=`
                <div style="text-align: right; margin-top: 50px; font-size:14px; font-family: Arial, sans-serif;">${f}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 50px; text-align: center; flex-wrap:wrap; gap:30px; font-family: Arial, sans-serif;">
                    <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 5px; font-size:12px;">
                        <b>${Z.escapeHTML(a.nome||`A INSTITUIÇÃO`)}</b><br>CONTRATADA
                    </div>
                    <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 5px; font-size:12px;">
                        <b>${Z.escapeHTML(n.nome)}</b><br>CONTRATANTE
                    </div>
                </div>
            `,y=`<div class="rodape-paginacao"></div>`):t===`declaracao`&&(_=`
                <h2 style="text-align: center; margin-top: 40px; margin-bottom: 40px; text-transform: uppercase; font-family: Arial, sans-serif;">Declaração de Matrícula</h2>
                
                <div style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 20px; font-family: Arial, sans-serif;">
                    Declaramos para os devidos fins que <b>${Z.escapeHTML(n.nome)}</b>, inscrito(a) no CPF sob o nº <b>${Z.escapeHTML(n.cpf||`___________`)}</b>, 
                    encontra-se regularmente matriculado(a) e frequentando o curso de <b>${Z.escapeHTML(n.curso||`Não especificado`)}</b> 
                    (Turma: <b>${Z.escapeHTML(n.turma||`Não especificada`)}</b>) nesta instituição de ensino.
                </div>
                
                <div style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 30px; font-family: Arial, sans-serif;">
                    Esta declaração é emitida a pedido do(a) interessado(a) para que produza os seus efeitos legais.
                </div>
            `,v=`
                <div style="text-align: right; font-size: 14px; margin-bottom: 70px; margin-top: 60px; font-family: Arial, sans-serif;">
                    ${f}
                </div>
                
                <div style="width: 100%; max-width: 400px; margin: auto auto 0 auto; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 14px; font-family: Arial, sans-serif;">
                    <b>A Direção / Secretaria</b><br>
                    ${Z.escapeHTML(a.nome)}
                </div>
            `),p.innerHTML=`
            ${$}
            
            <div class="no-print" style="text-align:center; margin-bottom:20px; display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:15px 30px; background:#27ae60; border:none; border-radius:8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(39, 174, 96, 0.3); cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#219a52'" onmouseout="this.style.background='#27ae60'">🖨️ CONFIRMAR E IMPRIMIR DOCUMENTO</button>
                <div style="font-size: 12px; color: #7f8c8d;">Pode editar o texto abaixo livremente. As margens foram reduzidas para otimização de folha.</div>
            </div>
        
            <div class="print-sheet" style="font-family: Arial, sans-serif; color: #000; display:flex; flex-direction:column; position: relative; padding: 40px; min-height: 200mm;">
                
                <div class="header-estatico">
                    ${m}
                </div>
                
                ${g}
                <div id="editor-documento" contenteditable="true" style="cursor: text; border: 1px solid #ccc; border-top: none; border-radius: 0 0 5px 5px; padding: 15px; outline: none; background: #fff; min-height: 100px; line-height: 1.6; margin-bottom: 10px; transition: 0.3s;" onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 5px rgba(52,152,219,0.3)'" onblur="this.style.borderColor='#ccc'; this.style.boxShadow='none'">
                    ${_}
                </div>
                
                <div class="footer-estatico" style="margin-top: auto;">
                    ${v}
                </div>

                ${y}
            </div>
        `;let b=document.createElement(`style`),x=``;t===`contrato`&&(x=`
                /* Define a contagem base na impressão */
                body { counter-reset: pagina; }
                
                /* Configuração oficial Paged Media (W3C Standard) */
                @page {
                    @bottom-right {
                        content: "Página " counter(page);
                        font-family: Arial, sans-serif;
                        font-size: 10px;
                        color: #555;
                    }
                }
                
                /* Fallback para navegadores modernos (Chrome/Edge) */
                .rodape-paginacao {
                    display: block !important;
                    position: fixed;
                    bottom: 10mm;
                    right: 15mm;
                    font-size: 11px;
                    color: #555;
                }
                .rodape-paginacao::after {
                    counter-increment: pagina;
                    content: "Página " counter(pagina);
                }
            `),b.innerHTML=`
            .rodape-paginacao { display: none; }
            
            @media print { 
                @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }
                #editor-documento { border: none !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; min-height: auto !important; }
                .print-sheet { box-shadow: none !important; padding: 0 !important; min-height: auto !important; }
                ${x}
            }
        `,p.appendChild(b)}catch{Z.showToast(`Erro ao gerar o documento.`,`error`)}finally{a.innerText=o,a.disabled=!1,document.body.style.cursor=`default`}},Z.certModelsList=[{id:`bluevintage`,name:`✨ 01. Blue Vintage Elegant (Overlayer Canva)`},{id:`royalgold`,name:`👑 02. Executive Royal Gold (Ouro e Azul Midnight)`},{id:`versailles`,name:`🏰 03. Versailles Imperial (Marfim, Ouro e Brasão)`},{id:`oxford`,name:`🎓 04. Oxford Heritage (Azul Marinho e Platina)`},{id:`victoria`,name:`🕰️ 05. Victorian Elegance (Bordô Imperial e Ouro)`},{id:`platinum`,name:`🛡️ 06. Platinum Elite (Minimalismo Prata Pura)`},{id:`renaissance`,name:`📜 07. Renaissance Prestige (Papiro Antigo)`},{id:`tsar`,name:`🦅 08. Tsar Imperial (Negro Absoluto e Ouro)`},{id:`baroque`,name:`⚜️ 09. Baroque Grandeur (Verde Escuro e Filigrana)`},{id:`camelot`,name:`⚔️ 10. Camelot Knight (Aço, Prata e Safira)`},{id:`valyrian`,name:`🐉 11. Valyrian Prestige (Grafite Escuro e Ciano)`},{id:`goldenwaves`,name:`🥇 12. Golden Waves Extravaganza (Ondas Douradas)`},{id:`ruby`,name:`🔴 13. Ruby Prestige (Bordô Clássico com Barra Lateral)`},{id:`emerald`,name:`🏛️ 14. Classic Emerald (Verde Ivy League)`},{id:`startup`,name:`⚡ 15. Startup Elite Brutalism (Impacto Amarelo)`},{id:`celestial`,name:`🌌 16. Celestial Sapphire (Safira Profunda e Estrelas Prata)`},{id:`ivory`,name:`🕊️ 17. Imperial Ivory (Marfim Puro e Ouro Duplo)`},{id:`quantum`,name:`💠 18. Quantum Tech Elite (Grafite e Néon Púrpura)`},{id:`arabesque`,name:`🌿 19. Golden Arabesque (Verde Floresta e Cantos Dourados)`},{id:`crimson`,name:`🩸 20. Majestic Crimson (Carmesim e Ouro Centralizado)`}],Z.renderizarMenuCertificados=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Preparando estúdio de design majestoso... 👑</p>`;try{let t=(await Z.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`),n=t.length>0?`<option value="">-- Selecione o Aluno Titular --</option>`+t.map(e=>`<option value="${e.id}">${Z.escapeHTML(e.nome)} (Curso: ${Z.escapeHTML(e.curso||`-`)})</option>`).join(``):`<option value="">Nenhum aluno ativo encontrado</option>`,r=new Date,i=new Date(r.getTime()-r.getTimezoneOffset()*6e4).toISOString().split(`T`)[0],a=Z.certModelsList.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``);e.innerHTML=`
            <div class="card" style="max-width: 800px; margin: 0 auto; border-top: 4px solid #d4af37;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:25px;">
                    <h3 style="color:#2c3e50; margin:0; display:flex; align-items:center; gap:10px; font-size:18px;">
                        👑 Emissão de Certificados da Realeza
                    </h3>
                    <button onclick="App.renderizarGeradorDocumentos()" style="background:#ecf0f1; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold; color:#7f8c8d;">Voltar</button>
                </div>
                
                <p style="font-size:13px; color:#666; margin-bottom:20px;">Explore a nossa galeria exclusiva com 20 layouts majestosos inéditos. Visualize no ecrã, <b>posicione a sua logo livremente</b> e descarregue um PDF de alta costura gráfica.</p>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="background:#fdfbf7; padding:15px; border-radius:8px; border:1px solid #d4af37; width: 100%; box-sizing: border-box;">
                        <label style="font-weight:bold; font-size:14px; color:#8B4513; display:block; margin-bottom:10px;">1. Destinatário (Único OU Turma Inteira):</label>
                        <div style="display:grid; grid-template-columns: 1fr auto 1fr; gap:15px; align-items:center;">
                            <select id="cert-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; cursor:pointer;" onchange="document.getElementById('cert-turma').value='';">${n}</select>
                            <span style="font-weight:bold; color:#7f8c8d;">OU</span>
                            <select id="cert-turma" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; cursor:pointer;" onchange="document.getElementById('cert-aluno').value='';">
                                <option value="">-- Por Turma (Gerar em Lote) --</option>
                                ${(await Z.api(`/turmas`)).map(e=>`<option value="${e.nome}">${Z.escapeHTML(e.nome)}</option>`).join(``)}
                            </select>
                        </div>
                    </div>

                    <div style="background:#fffcf5; padding:15px; border-radius:8px; border:1px solid #e67e22; width: 100%; box-sizing: border-box;">
                        <label style="font-weight:bold; font-size:14px; color:#d35400; display:block; margin-bottom:10px;">2. A Coleção Majestosa (20 Obras Inéditas):</label>
                        <select id="cert-modelo" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer; font-size:15px; color: #2c3e50;">
                            ${a}
                        </select>
                    </div>

                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px dashed #ccc; display:flex; gap:15px; flex-wrap:wrap; width: 100%; box-sizing: border-box;">
                        <div style="flex:1; min-width:120px;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Carga Horária (h):</label>
                            <input type="number" id="cert-carga" value="96" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; color:#d35400;">
                        </div>
                        <div style="flex:1; min-width:140px;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Início:</label>
                            <input type="date" id="cert-data-inicio" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                        <div style="flex:1; min-width:140px;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Conclusão:</label>
                            <input type="date" id="cert-data-fim" value="${i}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:16px; background:#2c3e50; border:none; box-shadow:0 4px 10px rgba(44, 62, 80, 0.3); justify-content:center; border-radius:8px; cursor:pointer;" onclick="App.abrirPreviewCertificado(false)">👁️ ABRIR ESTÚDIO DE EDIÇÃO E PREVIEW</button>
                </div>
            </div>
            
            <div id="cert-area" style="margin-top: 30px;"></div>
        `}catch{e.innerHTML=`<p>Erro ao carregar dados.</p>`}},Z.construirArteCertificado=(e,t,n,r,i,a)=>{let o=`<span class="cert-live-nome" style="display:inline-block;">${Z.escapeHTML(e.nome)}</span>`,s=`inscrito no CPF <b>${`<span class="cert-live-cpf">${Z.escapeHTML(e.cpf||`___________`)}</span>`}</b> concluiu com êxito o Curso de <b>${Z.escapeHTML(e.curso||`Inglês`)}</b> com carga horária total de <b>${n} horas</b> entre <b>${r}</b> e <b>${i}</b> através da Instituição de Ensino ativa no CNPJ <b>${Z.escapeHTML(a.cnpj||`___________`)}</b>. Curso em conformidade com a Lei nº. 9394/96 - Decreto nº. 5.154/04.`,c=`<svg width="110" height="110" viewBox="0 0 100 100"><defs><linearGradient id="gld" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F9D423"/><stop offset="50%" stop-color="#FF4E50"/><stop offset="100%" stop-color="#F9D423"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="none" stroke="#d4af37" stroke-width="2"/><circle cx="50" cy="50" r="41" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="3 3"/><path d="M50 10 L58 35 L85 35 L62 52 L70 80 L50 62 L30 80 L38 52 L15 35 L42 35 Z" fill="url(#gld)" opacity="0.95"/><circle cx="50" cy="50" r="22" fill="#000"/><text x="50" y="52" font-size="8" font-family="Georgia" fill="#d4af37" text-anchor="middle" font-weight="bold">SELO</text><text x="50" y="60" font-size="5" font-family="Arial" fill="#d4af37" text-anchor="middle" letter-spacing="1">OFICIAL</text></svg>`,l=`<svg width="110" height="110" viewBox="0 0 100 100"><defs><linearGradient id="plat" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E5E4E2"/><stop offset="50%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#B0C4DE"/></linearGradient></defs><circle cx="50" cy="50" r="45" fill="none" stroke="url(#plat)" stroke-width="4"/><path d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z" fill="url(#plat)" opacity="0.95"/><circle cx="50" cy="50" r="18" fill="#0A192F"/><text x="50" y="53" font-size="7" font-family="Arial" fill="#E5E4E2" text-anchor="middle" font-weight="bold">PLATINA</text></svg>`,u=`<svg width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#4A0E17" stroke="#d4af37" stroke-width="2"/><path d="M30 65 L35 45 L50 30 L65 45 L70 65 Z" fill="none" stroke="#d4af37" stroke-width="2"/><circle cx="50" cy="25" r="3" fill="#d4af37"/><circle cx="32" cy="42" r="2" fill="#d4af37"/><circle cx="68" cy="42" r="2" fill="#d4af37"/><path d="M25 70 L75 70 L70 75 L30 75 Z" fill="#d4af37"/><text x="50" y="55" font-size="7" font-family="Georgia" fill="#d4af37" text-anchor="middle">REALEZA</text></svg>`;if(t===`bluevintage`)return`
            <div style="width: 1122px; height: 793px; position: relative; background-image: url('Blue Vintage Elegant Achievement Certificate.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #fdfbf7; box-sizing: border-box; overflow: hidden;">
                <div style="position: absolute; top: 130px; width: 100%; text-align: center; color: #1e3799; font-size: 55px; letter-spacing: 5px; font-family: 'Times New Roman', serif;">CERTIFICADO</div>
                <div style="position: absolute; top: 195px; width: 100%; text-align: center; color: #1e3799; font-size: 20px; letter-spacing: 2px; font-family: 'Times New Roman', serif;">DO CURSO DE INGLÊS</div>
                <div style="position: absolute; top: 330px; width: 100%; text-align: center; color: #8B4513; font-size: 55px; font-style: italic; font-family: 'Georgia', serif; font-weight: bold;">${o}</div>
                <div style="position: absolute; top: 460px; left: 111px; width: 900px; text-align: center; color: #222; font-size: 19px; line-height: 1.8; font-family: 'Times New Roman', serif;">${s}</div>
                
                <div style="position: absolute; bottom: 120px; left: 160px; width: 300px; text-align: center; font-size: 15px; color: #333; font-family: 'Arial', sans-serif;"><div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div><b>Assinatura do Diretor e Professor</b></div>
                <div style="position: absolute; bottom: 120px; right: 160px; width: 300px; text-align: center; font-size: 15px; color: #333; font-family: 'Arial', sans-serif;"><div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div><b>Assinatura do aluno</b></div>
            </div>
        `;if(t===`royalgold`)return`
            <div style="width: 1122px; height: 793px; background-color: #051024; color: #fff; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Georgia', serif; padding: 60px;">
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 3px solid #d4af37;"></div>
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 1px solid #d4af37;"></div>
                <h1 style="font-size: 50px; color: #d4af37; letter-spacing: 6px; font-weight: normal; margin-bottom: 5px; text-transform: uppercase;">Certificado de Conclusão</h1>
                <p style="font-size: 22px; font-style: italic; color: #ccc; margin-bottom: 40px; font-family: 'Times New Roman', serif;">Atestamos com orgulho que</p>
                <h2 style="font-size: 55px; color: #fff; border-bottom: 2px solid #d4af37; padding: 0 60px 10px 60px; margin-bottom: 40px; font-weight: normal; font-style: italic;">${o}</h2>
                <p style="font-size: 20px; line-height: 1.8; color: #ccc; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto; font-family: 'Times New Roman', serif;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 16px;">A Direção Geral</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${c}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 16px;">O Aluno Titular</div>
                </div>
            </div>
        `;if(t===`versailles`)return`
            <div style="width: 1122px; height: 793px; background-color: #fdfbf7; box-sizing: border-box; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Palatino Linotype', serif; padding: 60px;">
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 15px solid #d4af37; outline: 3px solid #8B4513; outline-offset: -20px; box-shadow: inset 0 0 30px rgba(139,69,19,0.1);"></div>
                <div style="margin-bottom: 20px; z-index: 10;">${u}</div>
                <h1 style="font-size: 48px; color: #8B4513; letter-spacing: 8px; text-transform: uppercase; margin-bottom: 10px; z-index: 10;">Certificado de Excelência</h1>
                <p style="font-size: 20px; color: #555; font-style: italic; margin-bottom: 30px; z-index: 10;">Concedido com todas as honras da casa a</p>
                <h2 style="font-size: 58px; color: #000; font-family: 'Georgia', serif; font-style: italic; margin-bottom: 30px; z-index: 10; border-bottom: 2px dashed #d4af37; padding: 0 40px 10px 40px;">${o}</h2>
                <p style="font-size: 18px; line-height: 2; color: #333; max-width: 800px; text-align: justify; text-align-last: center; z-index: 10; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 80px; margin-top: auto; margin-bottom: 10px; z-index: 10;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #8B4513; padding-top: 10px; color: #8B4513; font-size: 15px;">Chanceler da Instituição</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #8B4513; padding-top: 10px; color: #8B4513; font-size: 15px;">O Titular</div>
                </div>
            </div>
        `;if(t===`oxford`)return`
            <div style="width: 1122px; height: 793px; background-color: #0A192F; color: #fff; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Times New Roman', serif; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 8px double #C0C0C0;"></div>
                <div style="position: absolute; top: 35px; left: 35px; right: 35px; bottom: 35px; border: 1px solid #C0C0C0; opacity: 0.5;"></div>
                <h1 style="font-size: 55px; color: #E5E4E2; letter-spacing: 10px; margin-top: 50px; margin-bottom: 10px; text-transform: uppercase;">CERTIFICADO OFICIAL</h1>
                <p style="font-size: 22px; font-style: italic; color: #A0B2C6; margin-bottom: 40px;">Probatum est et confirmatum</p>
                <h2 style="font-size: 60px; color: #fff; font-weight: normal; margin-bottom: 40px; text-shadow: 2px 2px 5px rgba(0,0,0,0.8);">${o}</h2>
                <p style="font-size: 20px; line-height: 1.8; color: #C0C0C0; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #C0C0C0; padding-top: 10px; color: #C0C0C0; font-size: 16px;">Reitor</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${l}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #C0C0C0; padding-top: 10px; color: #C0C0C0; font-size: 16px;">Certificado</div>
                </div>
            </div>
        `;if(t===`victoria`)return`
            <div style="width: 1122px; height: 793px; background-color: #4A0E17; color: #fff; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Georgia', serif; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px; border: 12px solid #d4af37; box-shadow: inset 0 0 50px rgba(0,0,0,0.8);"></div>
                <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 2px dashed #d4af37;"></div>
                <h1 style="font-size: 45px; color: #d4af37; letter-spacing: 5px; font-style: italic; margin-top: 50px; margin-bottom: 10px;">Certificado de Distinção</h1>
                <h2 style="font-size: 55px; color: #fff; margin: 30px 0; border-bottom: 1px solid #d4af37; padding-bottom: 10px;">${o}</h2>
                <p style="font-size: 19px; line-height: 2; color: #e8d0a9; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 15px;">Autoridade Máxima</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 15px;">O Titular</div>
                </div>
            </div>
        `;if(t===`platinum`)return`
            <div style="width: 1122px; height: 793px; background-color: #ffffff; color: #000; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 80px;">
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 20px solid #E5E4E2; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);"></div>
                <h1 style="font-size: 45px; color: #2c3e50; letter-spacing: 12px; font-weight: 300; margin-top: 50px; margin-bottom: 10px; text-transform: uppercase;">CERTIFICADO</h1>
                <p style="font-size: 16px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 50px;">Atestado de Excelência Platinum</p>
                <h2 style="font-size: 52px; color: #000; font-weight: 300; margin-bottom: 40px; font-family: 'Georgia', serif;">${o}</h2>
                <p style="font-size: 18px; line-height: 2.2; color: #555; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto; font-weight: 300;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #bdc3c7; padding-top: 15px; color: #2c3e50; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">A Direção</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${l}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #bdc3c7; padding-top: 15px; color: #2c3e50; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">O Aluno Titular</div>
                </div>
            </div>
        `;if(t===`renaissance`)return`
            <div style="width: 1122px; height: 793px; background-color: #F4EFEA; color: #3E2723; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Times New Roman', serif; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 4px solid #5D4037;"></div>
                <div style="position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px; border: 1px solid #5D4037;"></div>
                <h1 style="font-size: 60px; color: #3E2723; font-style: italic; margin-bottom: 20px; margin-top: 40px;">Certificado Honorífico</h1>
                <h2 style="font-size: 55px; color: #5D4037; border-bottom: 2px solid #5D4037; padding-bottom: 10px; margin-bottom: 40px; text-transform: uppercase; font-family: 'Georgia', serif;">${o}</h2>
                <p style="font-size: 20px; line-height: 2; color: #4E342E; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-around; width: 100%; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 300px; text-align: center; border-top: 1px solid #5D4037; padding-top: 10px; color: #3E2723; font-size: 16px;">Magister</div>
                    <div style="width: 300px; text-align: center; border-top: 1px solid #5D4037; padding-top: 10px; color: #3E2723; font-size: 16px;">Discipulus</div>
                </div>
            </div>
        `;if(t===`tsar`)return`
            <div style="width: 1122px; height: 793px; background-color: #000000; color: #FFD700; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Georgia', serif; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 10px solid #FFD700; border-radius: 20px;"></div>
                <div style="position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 2px dashed #FFD700; border-radius: 10px;"></div>
                <h1 style="font-size: 50px; color: #FFD700; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 10px; margin-top: 50px;">Decreto de Certificação</h1>
                <h2 style="font-size: 60px; color: #FFF; margin: 30px 0; border-bottom: 1px solid #FFD700; padding-bottom: 10px; text-shadow: 0 0 10px rgba(255,215,0,0.5);">${o}</h2>
                <p style="font-size: 18px; line-height: 2; color: #CCC; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 80px; margin-top: auto; margin-bottom: 10px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #FFD700; padding-top: 10px; color: #FFD700; font-size: 15px;">Soberania Institucional</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #FFD700; padding-top: 10px; color: #FFD700; font-size: 15px;">O Titular Honorário</div>
                </div>
            </div>
        `;if(t===`baroque`)return`
            <div style="width: 1122px; height: 793px; background-color: #1A3626; color: #E8D0A9; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Times New Roman', serif; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 5px solid #d4af37;"></div>
                <h1 style="font-size: 55px; color: #d4af37; font-style: italic; margin-top: 50px; margin-bottom: 20px;">Certificação Académica</h1>
                <h2 style="font-size: 50px; color: #FFF; margin: 40px 0; border-bottom: 2px dotted #d4af37; padding-bottom: 10px; font-weight: normal;">${o}</h2>
                <p style="font-size: 20px; line-height: 1.9; color: #C1D5C0; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 16px;">O Reitor</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${c}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 16px;">O Titular</div>
                </div>
            </div>
        `;if(t===`camelot`)return`
            <div style="width: 1122px; height: 793px; background-color: #112233; color: #E5E4E2; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Arial', sans-serif; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 4px solid #708090;"></div>
                <h1 style="font-size: 50px; color: #B0C4DE; letter-spacing: 5px; text-transform: uppercase; margin-top: 50px; margin-bottom: 20px; font-weight: 900;">CERTIFICADO DE HONRA</h1>
                <h2 style="font-size: 60px; color: #FFF; margin: 40px 0; border-bottom: 4px solid #708090; padding-bottom: 10px;">${o}</h2>
                <p style="font-size: 18px; line-height: 2; color: #A9B0B7; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 2px solid #708090; padding-top: 10px; color: #B0C4DE; font-size: 14px; font-weight: bold;">ALTA CÚPULA</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${l}</div>
                    <div style="width: 250px; text-align: center; border-top: 2px solid #708090; padding-top: 10px; color: #B0C4DE; font-size: 14px; font-weight: bold;">CAVALEIRO TITULAR</div>
                </div>
            </div>
        `;if(t===`valyrian`)return`
            <div style="width: 1122px; height: 793px; background-color: #1a1a1a; color: #ccc; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Helvetica Neue', Helvetica, sans-serif; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 25px; left: 25px; right: 25px; bottom: 25px; border: 2px solid #00f2fe; box-shadow: inset 0 0 20px rgba(0,242,254,0.2);"></div>
                <h1 style="font-size: 45px; color: #00f2fe; letter-spacing: 8px; text-transform: uppercase; margin-top: 60px; margin-bottom: 20px; font-weight: 300;">Certificado de Domínio</h1>
                <h2 style="font-size: 55px; color: #fff; margin: 40px 0; border-bottom: 1px dashed #00f2fe; padding-bottom: 10px; font-weight: normal;">${o}</h2>
                <p style="font-size: 18px; line-height: 2; color: #aaa; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #00f2fe; padding-top: 10px; color: #00f2fe; font-size: 14px; letter-spacing: 2px;">MESTRE</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #00f2fe; padding-top: 10px; color: #00f2fe; font-size: 14px; letter-spacing: 2px;">APRENDIZ</div>
                </div>
            </div>
        `;if(t===`goldenwaves`)return`
            <div style="width: 1122px; height: 793px; background-color: #fffdf5; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Georgia', serif; padding: 60px;">
                <div style="position:absolute; top:-200px; left:-200px; width:700px; height:700px; border-radius:50%; background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(255,255,255,0) 70%);"></div>
                <div style="position:absolute; bottom:-300px; right:-100px; width:900px; height:900px; border-radius:50%; background: radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(255,255,255,0) 70%);"></div>
                <div style="position:absolute; top:40px; left:40px; right:40px; bottom:40px; border: 2px solid #d4af37; z-index:2;"></div>
                <h1 style="z-index:10; font-size: 55px; color: #b8860b; letter-spacing: 5px; font-weight: normal; margin-top: 40px; margin-bottom: 10px; text-transform: uppercase;">Certificado de Excelência</h1>
                <p style="z-index:10; font-size: 22px; font-style: italic; color: #555; margin-bottom: 30px;">Temos a suprema honra de certificar</p>
                <h2 style="z-index:10; font-size: 60px; color: #000; border-bottom: 3px solid #d4af37; padding: 0 50px 10px 50px; margin-bottom: 30px; font-weight: normal; font-style: italic;">${o}</h2>
                <p style="z-index:10; font-size: 20px; line-height: 1.8; color: #444; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="z-index:10; display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #b8860b; padding-top: 10px; color: #b8860b; font-size: 16px; font-style:italic;">O Corpo Diretivo</div>
                    <div style="width: 150px; display: flex; justify-content: center; filter: drop-shadow(0 10px 15px rgba(212,175,55,0.4));">${c}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #b8860b; padding-top: 10px; color: #b8860b; font-size: 16px; font-style:italic;">O Aluno Galardoado</div>
                </div>
            </div>
        `;if(t===`ruby`)return`
            <div style="width: 1122px; height: 793px; background-color: #fdfbf7; box-sizing: border-box; position: relative; display: flex;">
                <div style="width: 280px; background-color: #780000; height: 100%; border-right: 12px solid #d4af37; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;"></div>
                <div style="flex: 1; padding: 70px 60px; text-align: left; font-family: 'Georgia', serif; display:flex; flex-direction:column;">
                    <h1 style="color: #780000; font-size: 55px; letter-spacing: 2px; margin-top: 20px; margin-bottom: 10px; text-transform:uppercase;">CERTIFICADO</h1>
                    <p style="color: #666; font-size: 20px; font-style: italic;">Certificamos com distinção que</p>
                    <h2 style="color: #000; font-size: 50px; margin: 40px 0; border-bottom: 3px solid #d4af37; padding-bottom: 10px; display: inline-block; width:fit-content;">${o}</h2>
                    <p style="color: #333; font-size: 18px; line-height: 1.9; max-width: 700px; text-align: justify; margin-bottom: auto;">${s}</p>
                    <div style="display: flex; justify-content: space-between; width: 100%; padding-right: 40px; margin-top: auto;">
                        <div style="width: 250px; text-align: center; border-top: 1px solid #780000; padding-top: 10px; color: #780000; font-size: 15px;">Assinatura da Direção</div>
                        <div style="width: 250px; text-align: center; border-top: 1px solid #780000; padding-top: 10px; color: #780000; font-size: 15px;">Assinatura do Aluno</div>
                    </div>
                </div>
            </div>
        `;if(t===`emerald`)return`
            <div style="width: 1122px; height: 793px; background-color: #0f4c3a; padding: 40px; box-sizing: border-box; font-family: 'Georgia', serif; position:relative;">
                <div style="width: 100%; height: 100%; border: 4px solid #d4af37; padding: 10px; box-sizing: border-box;">
                    <div style="width: 100%; height: 100%; border: 1px solid #d4af37; background: #fffcf5; padding: 50px; box-sizing: border-box; display:flex; flex-direction:column; align-items:center;">
                        <h1 style="color: #0f4c3a; font-size: 45px; letter-spacing: 6px; margin-top: 40px; margin-bottom: 10px;">CERTIFICADO</h1>
                        <p style="color: #777; font-size: 18px; font-style: italic;">Concedido com todas as honras a</p>
                        <h2 style="color: #0f4c3a; font-size: 55px; margin: 30px 0; font-weight: normal; border-bottom: 2px solid #d4af37; display: inline-block; padding-bottom: 10px;">${o}</h2>
                        <p style="color: #333; font-size: 18px; line-height: 1.9; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                        <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 40px; margin-top: auto;">
                            <div style="width: 250px; text-align: center; border-top: 1px solid #0f4c3a; padding-top: 10px; color: #0f4c3a; font-size: 15px;">Membro da Direção</div>
                            <div style="width: 250px; text-align: center; border-top: 1px solid #0f4c3a; padding-top: 10px; color: #0f4c3a; font-size: 15px;">Assinatura do Aluno</div>
                        </div>
                    </div>
                </div>
            </div>
        `;if(t===`startup`)return`
            <div style="width: 1122px; height: 793px; background-color: #f1c40f; padding: 50px; box-sizing: border-box; font-family: 'Arial Black', Arial, sans-serif;">
                <div style="width: 100%; height: 100%; background: #fff; border: 8px solid #000; box-shadow: 15px 15px 0px #000; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; position:relative;">
                    <h1 style="color: #000; font-size: 60px; text-transform: uppercase; margin-top: 30px; letter-spacing: -2px;">CERTIFICADO_</h1>
                    <p style="color: #000; font-size: 18px; font-weight: bold; margin-bottom: 40px;">PROJETO CONCLUÍDO COM SUCESSO</p>
                    <h2 style="color: #e74c3c; font-size: 55px; border-bottom: 8px solid #000; display: inline-block; padding-bottom: 5px; margin-bottom: 30px; width:fit-content;">${o}</h2>
                    <p style="color: #000; font-size: 18px; font-family: Arial, sans-serif; font-weight: bold; line-height: 1.8; max-width: 850px; text-align:justify; margin-bottom:auto;">${s}</p>
                    <div style="display: flex; justify-content: flex-start; gap:80px; width: 100%; margin-top: auto;">
                        <div style="width: 250px; border-top: 4px solid #000; padding-top: 10px; color: #000; font-size: 16px; font-weight:900;">ADMINISTRAÇÃO //</div>
                        <div style="width: 250px; border-top: 4px solid #000; padding-top: 10px; color: #000; font-size: 16px; font-weight:900;">ALUNO //</div>
                    </div>
                </div>
            </div>
        `;if(t===`celestial`)return`
            <div style="width: 1122px; height: 793px; background-color: #0f172a; background-image: radial-gradient(circle at center, transparent 0%, #020617 100%); color: #e2e8f0; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; padding: 60px;">
                <div style="position: absolute; top: 25px; left: 25px; right: 25px; bottom: 25px; border: 1px solid #94a3b8; box-shadow: 0 0 15px rgba(148, 163, 184, 0.3) inset;"></div>
                <h1 style="font-size: 50px; color: #cbd5e1; letter-spacing: 15px; font-weight: 300; margin-top: 40px; margin-bottom: 5px; text-transform: uppercase;">CERTIFICADO</h1>
                <p style="font-size: 18px; color: #64748b; margin-bottom: 40px; letter-spacing: 3px;">ESTELAR ACADÉMICO</p>
                <h2 style="font-size: 55px; color: #fff; border-bottom: 1px solid #94a3b8; padding: 0 60px 10px 60px; margin-bottom: 40px; font-weight: 300;">${o}</h2>
                <p style="font-size: 18px; line-height: 2; color: #94a3b8; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #64748b; padding-top: 10px; color: #cbd5e1; font-size: 14px; letter-spacing: 2px;">Direção</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${l}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #64748b; padding-top: 10px; color: #cbd5e1; font-size: 14px; letter-spacing: 2px;">Titular</div>
                </div>
            </div>
        `;if(t===`ivory`)return`
            <div style="width: 1122px; height: 793px; background-color: #fffff0; color: #333; box-sizing: border-box; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Georgia', serif; padding: 60px;">
                <div style="position: absolute; top: 35px; left: 35px; right: 35px; bottom: 35px; border: 4px solid #b8860b;"></div>
                <div style="position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 1px solid #b8860b;"></div>
                <h1 style="font-size: 55px; color: #b8860b; letter-spacing: 5px; margin-top: 50px; margin-bottom: 10px; text-transform: uppercase;">CERTIFICADO DE MÉRITO</h1>
                <p style="font-size: 20px; font-style: italic; color: #777; margin-bottom: 40px;">É com distinção que certificamos</p>
                <h2 style="font-size: 60px; color: #000; margin-bottom: 40px; font-weight: normal; font-style: italic;">${o}</h2>
                <p style="font-size: 20px; line-height: 1.8; color: #444; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #b8860b; padding-top: 10px; color: #b8860b; font-size: 16px;">Assinatura do Diretor</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${c}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #b8860b; padding-top: 10px; color: #b8860b; font-size: 16px;">Assinatura do Aluno</div>
                </div>
            </div>
        `;if(t===`quantum`)return`
            <div style="width: 1122px; height: 793px; background-color: #111111; color: #e0e0e0; box-sizing: border-box; position: relative; overflow: hidden; font-family: 'Courier New', monospace; padding: 60px; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 1px solid #b026ff; box-shadow: 0 0 20px rgba(176, 38, 255, 0.4) inset;"></div>
                <div style="position: absolute; top: 25px; left: 25px; width: 50px; height: 50px; border-top: 4px solid #00f2fe; border-left: 4px solid #00f2fe;"></div>
                <div style="position: absolute; bottom: 25px; right: 25px; width: 50px; height: 50px; border-bottom: 4px solid #00f2fe; border-right: 4px solid #00f2fe;"></div>
                
                <h1 style="font-size: 45px; color: #b026ff; letter-spacing: 10px; margin-top: 50px; margin-bottom: 10px;">CERTIFICADO.QUANTUM</h1>
                <p style="font-size: 16px; color: #00f2fe; margin-bottom: 40px;">// SYSTEM_VERIFIED_ACHIEVEMENT</p>
                <h2 style="font-size: 55px; color: #fff; border-bottom: 2px solid #b026ff; padding-bottom: 10px; margin-bottom: 40px;">${o}</h2>
                <p style="font-size: 18px; line-height: 2; color: #ccc; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto; font-family: 'Arial', sans-serif;">${s}</p>
                <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px dashed #00f2fe; padding-top: 10px; color: #00f2fe; font-size: 14px; font-weight:bold;">[ ADMIN_NODE ]</div>
                    <div style="width: 250px; text-align: center; border-top: 1px dashed #00f2fe; padding-top: 10px; color: #00f2fe; font-size: 14px; font-weight:bold;">[ USER_NODE ]</div>
                </div>
            </div>
        `;if(t===`arabesque`)return`
            <div style="width: 1122px; height: 793px; background-color: #064e3b; color: #fffcf5; box-sizing: border-box; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Palatino Linotype', serif; padding: 60px;">
                <!-- Triângulos de Canto simulando Arabescos Dourados -->
                <div style="position: absolute; top: 0; left: 0; width: 150px; height: 150px; background: linear-gradient(135deg, #fbbf24 50%, transparent 50%);"></div>
                <div style="position: absolute; bottom: 0; right: 0; width: 150px; height: 150px; background: linear-gradient(-45deg, #fbbf24 50%, transparent 50%);"></div>
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid #fbbf24;"></div>
                
                <h1 style="font-size: 50px; color: #fbbf24; letter-spacing: 5px; margin-top: 40px; margin-bottom: 10px; text-transform: uppercase;">Certificado de Excelência</h1>
                <p style="font-size: 20px; font-style: italic; color: #d1fae5; margin-bottom: 40px;">É com honra que a nossa instituição certifica</p>
                <h2 style="font-size: 58px; color: #fff; margin-bottom: 40px; border-bottom: 1px solid #fbbf24; padding-bottom: 10px;">${o}</h2>
                <p style="font-size: 19px; line-height: 1.9; color: #d1fae5; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #fbbf24; padding-top: 10px; color: #fbbf24; font-size: 16px;">Assinatura do Diretor</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${c}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #fbbf24; padding-top: 10px; color: #fbbf24; font-size: 16px;">Assinatura do Aluno</div>
                </div>
            </div>
        `;if(t===`crimson`)return`
            <div style="width: 1122px; height: 793px; background-color: #7f1d1d; color: #fef08a; box-sizing: border-box; position: relative; padding: 60px; font-family: 'Times New Roman', serif; display: flex; flex-direction: column; align-items: center;">
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 6px solid #fef08a;"></div>
                <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 1px solid #fef08a;"></div>
                <h1 style="font-size: 65px; color: #fef08a; letter-spacing: 8px; margin-top: 50px; margin-bottom: 10px; text-transform: uppercase;">CERTIFICADO</h1>
                <p style="font-size: 22px; font-style: italic; color: #fca5a5; margin-bottom: 40px;">Magna Cum Laude</p>
                <h2 style="font-size: 60px; color: #fff; background: rgba(254, 240, 138, 0.1); padding: 15px 60px; border-radius: 10px; margin-bottom: 40px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${o}</h2>
                <p style="font-size: 20px; line-height: 1.8; color: #fca5a5; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${s}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #fef08a; padding-top: 10px; color: #fef08a; font-size: 16px;">Presidência</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${u}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #fef08a; padding-top: 10px; color: #fef08a; font-size: 16px;">Titular Académico</div>
                </div>
            </div>
        `},Z.navegarCertificado=e=>{let t=document.getElementById(`cert-modelo`),n=Z.certModelsList.findIndex(e=>e.id===t.value);n=e===`next`?(n+1)%Z.certModelsList.length:(n-1+Z.certModelsList.length)%Z.certModelsList.length,t.value=Z.certModelsList[n].id,Z.abrirPreviewCertificado(!0)},Z.salvarRascunhoCertificado=()=>{let e=document.getElementById(`cert-preview-content`);e&&localStorage.setItem(`cert_rascunho_salvo`,e.innerHTML)},Z.restaurarRascunhoCertificado=()=>{let e=localStorage.getItem(`cert_rascunho_salvo`),t=document.getElementById(`cert-preview-content`);e&&t?(t.innerHTML=e,t.querySelectorAll(`.cert-logo-drag`).forEach(e=>Z.ativarDragAndDrop(e)),Z.showToast(`Trabalho anterior restaurado com sucesso! 💾`,`success`)):Z.showToast(`Nenhum rascunho encontrado na memória.`,`warning`)},Z.ativarDragAndDrop=e=>{let t=0,n=0,r=0,i=0;e.onmousedown=a,e.ontouchstart=a;function a(e){e.preventDefault();let t=e.type.includes(`mouse`)?e.clientX:e.touches[0].clientX,n=e.type.includes(`mouse`)?e.clientY:e.touches[0].clientY;r=t,i=n,document.onmouseup=s,document.ontouchend=s,document.onmousemove=o,document.ontouchmove=o}function o(a){a.preventDefault();let o=a.type.includes(`mouse`)?a.clientX:a.touches[0].clientX,s=a.type.includes(`mouse`)?a.clientY:a.touches[0].clientY;t=r-o,n=i-s,r=o,i=s;let c=document.getElementById(`cert-preview-content`).style.transform.match(/scale\(([^)]+)\)/),l=c?parseFloat(c[1]):1;e.style.top=e.offsetTop-n/l+`px`,e.style.left=e.offsetLeft-t/l+`px`}function s(){document.onmouseup=null,document.onmousemove=null,document.ontouchend=null,document.ontouchmove=null,Z.salvarRascunhoCertificado()}e.ondblclick=()=>{e.style.mixBlendMode=e.style.mixBlendMode===`multiply`?`normal`:`multiply`,Z.salvarRascunhoCertificado()}},Z.inserirLogoCertificado=async()=>{try{let e=await Z.api(`/escola`);if(!e||!e.foto)return Z.showToast(`Nenhuma logo encontrada nas configurações da escola.`,`warning`);let t=document.getElementById(`cert-preview-content`);if(!t)return;let n=document.createElement(`img`);n.src=e.foto,n.className=`cert-logo-drag`,n.style.cssText=`position:absolute; top:40px; left:50%; transform:translateX(-50%); max-height:100px; z-index:100; cursor:move; mix-blend-mode: multiply; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.1)); padding:10px; border:2px dashed transparent;`,n.title=`Arraste para mover. Duplo-clique para alterar transparência.`,t.appendChild(n),Z.ativarDragAndDrop(n),Z.salvarRascunhoCertificado(),Z.showToast(`Logo inserida! Pode arrastar livremente.`,`success`)}catch(e){console.error(e)}},Z.toggleEdicaoCertificado=()=>{let e=document.getElementById(`btn-edit-cert`),t=document.getElementById(`cert-preview-content`);t.isContentEditable?(t.contentEditable=`false`,t.style.boxShadow=`0 15px 35px rgba(0,0,0,0.5)`,t.style.outline=`none`,e.innerHTML=`✏️ EDITAR TEXTO`,e.style.background=`#f39c12`,t.querySelectorAll(`.cert-logo-drag`).forEach(e=>e.style.borderColor=`transparent`),Z.showToast(`Edição bloqueada. Arte pronta!`,`success`)):(t.contentEditable=`true`,t.style.boxShadow=`0 0 20px rgba(46, 204, 113, 0.8)`,t.style.outline=`3px dashed #2ecc71`,t.focus(),e.innerHTML=`✅ FINALIZAR EDIÇÃO`,e.style.background=`#27ae60`,t.querySelectorAll(`.cert-logo-drag`).forEach(e=>e.style.borderColor=`rgba(46, 204, 113, 0.5)`),Z.showToast(`Modo Edição! Altere o texto ou arraste a logo.`,`info`))},Z.abrirPreviewCertificado=async(e=!1)=>{let t=document.getElementById(`cert-aluno`).value,n=document.getElementById(`cert-turma`).value,r=document.getElementById(`cert-modelo`).value,i=document.getElementById(`cert-carga`).value||`40`,a=document.getElementById(`cert-data-inicio`),o=a&&a.value?a.value.split(`-`).reverse().join(`/`):`-`,s=document.getElementById(`cert-data-fim`),c=s&&s.value?s.value.split(`-`).reverse().join(`/`):new Date().toLocaleDateString(`pt-BR`);if(!t&&!n)return Z.showToast(`Selecione um aluno ou turma.`,`warning`);try{let[a,s]=await Promise.all([Z.api(`/alunos`),Z.api(`/escola`)||{nome:`A INSTITUIÇÃO`,cnpj:`00.000.000/0000-00`}]),l=null,u=``;if(n){let e=n.trim().toLowerCase(),t=a.filter(t=>t.turma&&t.turma.trim().toLowerCase()===e&&(!t.status||t.status===`Ativo`));if(t.length===0)throw Error(`A turma selecionada não tem alunos ativos.`);l=t[0],u=`<span style="background:#e74c3c; color:white; padding:3px 8px; border-radius:12px; font-size:10px; margin-left:10px;">LOTE: 1 de ${t.length}</span>`}else l=a.find(e=>e.id===t);let d=Z.construirArteCertificado(l,r,i,o,c,s),f=`<span class="hide-on-mobile">👁️ Estúdio Interativo - </span><b style="color:#d4af37; font-size:14px;">${Z.certModelsList.find(e=>e.id===r).name}</b> ${u}`,p=window.innerWidth*.9,m=window.innerHeight-200,h=p/1122,g=m/793,_=Math.min(h,g,1),v=1122*_,y=793*_;if(e){let e=document.getElementById(`cert-preview-content`);e&&(e.contentEditable=`false`,e.style.boxShadow=`0 15px 35px rgba(0,0,0,0.5)`,e.style.outline=`none`,e.innerHTML=d,document.getElementById(`btn-edit-cert`).innerHTML=`✏️ EDITAR TEXTO`,document.getElementById(`btn-edit-cert`).style.background=`#f39c12`,document.getElementById(`cert-modal-title`).innerHTML=f,Z.salvarRascunhoCertificado());return}let b=document.getElementById(`modal-preview-cert`);b||(b=document.createElement(`div`),b.id=`modal-preview-cert`,document.body.appendChild(b)),b.style.cssText=`position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.9); z-index:9999; display:flex; flex-direction:column; align-items:center; padding:15px; box-sizing:border-box; backdrop-filter:blur(8px); opacity:0; transition: opacity 0.3s; overflow:hidden;`;let x=`background: rgba(0,0,0,0.65); color: #ffffff; border: 2px solid rgba(255,255,255,0.9); border-radius: 50%; width: 50px; height: 50px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; outline:none; flex-shrink:0; z-index:1000; box-shadow: 0 4px 15px rgba(0,0,0,0.6); backdrop-filter: blur(4px);`,S=`flex: 1; min-width:140px; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold; color: white; border: none; font-size: 12px; text-align:center; transition: 0.3s;`;b.innerHTML=`
            <style>
                @media (max-width: 768px) {
                    .hide-on-mobile { display: none !important; }
                    .cert-toolbar-mobile { flex-wrap: wrap !important; justify-content: center !important; gap: 8px !important; }
                    .cert-arrow-left { left: 5px !important; width: 40px !important; height: 40px !important; font-size: 16px !important; }
                    .cert-arrow-right { right: 5px !important; width: 40px !important; height: 40px !important; font-size: 16px !important; }
                }
            </style>
            
            <!-- Barra Superior Fixa -->
            <div style="flex-shrink: 0; background: white; padding: 15px 20px; border-radius: 8px; width: 100%; max-width: 1200px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; margin-bottom: 15px;">
                <div id="cert-modal-title" style="color: #2c3e50; font-weight: bold; font-size: 14px; display:flex; align-items:center;">${f}</div>
                <button onclick="document.getElementById('modal-preview-cert').style.opacity='0'; setTimeout(()=>document.getElementById('modal-preview-cert').style.display='none', 300);" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #c0392b; line-height: 1; padding: 0 5px;">✖</button>
            </div>
            
            <!-- Área do Certificado -->
            <div style="flex: 1; width: 100%; display: flex; justify-content: center; align-items: center; position: relative;">
                
                <!-- Nova Seta com Animação Hover -->
                <button onclick="App.navegarCertificado('prev')" class="cert-arrow-left" style="${x} position: absolute; left: 20px;" onmouseover="this.style.background='rgba(0,0,0,0.9)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(0,0,0,0.65)'; this.style.transform='scale(1)';">❮</button>
                
                <div style="width: ${v}px; height: ${y}px; position: relative;">
                    <div id="cert-preview-content" oninput="App.salvarRascunhoCertificado()" spellcheck="false" style="width: 1122px; height: 793px; transform: scale(${_}); transform-origin: top left; position: absolute; top: 0; left: 0; box-shadow: 0 15px 35px rgba(0,0,0,0.5); transition: box-shadow 0.3s; background:#fff;">
                        ${d}
                    </div>
                </div>

                <!-- Nova Seta com Animação Hover -->
                <button onclick="App.navegarCertificado('next')" class="cert-arrow-right" style="${x} position: absolute; right: 20px;" onmouseover="this.style.background='rgba(0,0,0,0.9)'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(0,0,0,0.65)'; this.style.transform='scale(1)';">❯</button>
                
            </div>

            <!-- Barra Inferior Fixa -->
            <div class="cert-toolbar-mobile" style="flex-shrink: 0; background: white; padding: 15px; border-radius: 8px; width: 100%; max-width: 1200px; display: flex; gap: 10px; box-sizing: border-box; margin-top: 15px;">
                <button onclick="App.restaurarRascunhoCertificado()" style="${S} background: #8e44ad; box-shadow: 0 4px 10px rgba(142, 68, 173, 0.3);" title="Recupera o último certificado editado caso tenha fechado sem querer">💾 RESTAURAR</button>
                
                <button onclick="App.inserirLogoCertificado()" style="${S} background: #3498db; box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);">🖼️ INSERIR LOGO</button>

                <button id="btn-edit-cert" onclick="App.toggleEdicaoCertificado()" style="${S} background: #f39c12; box-shadow: 0 4px 10px rgba(243, 156, 18, 0.3);">✏️ EDITAR TEXTO</button>
                
                <button onclick="App.gerarPdfAltaResolucao()" style="${S} background: #27ae60; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);">📥 BAIXAR PDF</button>
            </div>
        `,b.style.display=`flex`,setTimeout(()=>b.style.opacity=`1`,50),Z.salvarRascunhoCertificado()}catch(e){Z.showToast(e.message||`Erro ao gerar estúdio.`,`error`)}},Z.gerarPdfAltaResolucao=async()=>{let e=document.getElementById(`cert-preview-content`);e&&e.isContentEditable&&Z.toggleEdicaoCertificado();let t=document.getElementById(`cert-aluno`).value,n=document.getElementById(`cert-turma`).value;Z.showToast(`A processar Motor Gráfico. Por favor, aguarde... ⏳`,`info`),document.body.style.cursor=`wait`;try{if(!window.jspdf||!window.html2canvas)throw Error(`Bibliotecas essenciais em falta.`);let r=await Z.api(`/alunos`),i=[];if(n){let e=n.trim().toLowerCase();i=r.filter(t=>t.turma&&t.turma.trim().toLowerCase()===e&&(!t.status||t.status===`Ativo`))}else i.push(r.find(e=>e.id===t));let a=e.innerHTML,o=document.getElementById(`pdf-photo-studio`);o||(o=document.createElement(`div`),o.id=`pdf-photo-studio`,o.style.cssText=`position:fixed; top:-9999px; left:-9999px; z-index:-1;`,document.body.appendChild(o));let{jsPDF:s}=window.jspdf,c=new s({orientation:`landscape`,unit:`mm`,format:`a4`});for(let e=0;e<i.length;e++){let t=i[e];o.innerHTML=a;let n=o.querySelector(`.cert-live-nome`),r=o.querySelector(`.cert-live-cpf`);n&&(n.innerHTML=Z.escapeHTML(t.nome)),r&&(r.innerHTML=Z.escapeHTML(t.cpf||`___________`)),await new Promise(e=>setTimeout(e,500));let s=(await html2canvas(o.children[0],{scale:2,useCORS:!0,logging:!1,backgroundColor:null})).toDataURL(`image/jpeg`,.95);e>0&&c.addPage(),c.addImage(s,`JPEG`,0,0,297,210),i.length>5&&Z.showToast(`Processando Arte ${e+1}/${i.length}...`,`info`)}let l=i.length>1?`Certificados_Lote_${n.replace(/\s+/g,`_`)}.pdf`:`Certificado_${i[0].nome.replace(/\s+/g,`_`)}.pdf`;c.save(l),Z.showToast(`✅ Ficheiro PDF gerado com Sucesso Máximo!`,`success`);let u=document.getElementById(`modal-preview-cert`);u&&(u.style.opacity=`0`,setTimeout(()=>u.style.display=`none`,300))}catch(e){Z.showToast(e.message||`Erro interno na geração do PDF.`,`error`)}finally{document.body.style.cursor=`default`;let e=document.getElementById(`pdf-photo-studio`);e&&e.remove()}},Object.assign(window.App,k),Object.assign(window.App,ee);var ne=e({onNeedRefresh(){console.log(`Nova versão detetada! A exibir notificação de update...`);let e=document.getElementById(`update-banner`);e?(e.style.display=`block`,e.style.animation=`slideIn 0.3s ease forwards`,window.atualizarApp=()=>{let t=e.querySelector(`button`);t&&(t.innerText=`A instalar... ⏳`,t.disabled=!0),ne(!0)}):ne(!0)},onOfflineReady(){console.log(`App pronta para trabalhar offline!`)}});