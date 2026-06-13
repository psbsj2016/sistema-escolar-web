var e=Object.defineProperty,t=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),window.CONFIG={API_URL:`/api`},window.CONFIG=window.CONFIG||{},window.App=window.App||{},window.Admin=window.Admin||{};var n=window.CONFIG,r=window.App;n.API_URL,window.LISTA_FUNCIONALIDADES=[{id:`novo_aluno`,nome:`Novo Aluno`,icon:`👨‍🎓`,acao:`App.abrirModalCadastro('aluno')`,roles:[`Gestor`,`Secretaria`]},{id:`fin_carne`,nome:`Gerar Carnê`,icon:`💸`,acao:`App.renderizarTela('mensalidades')`,roles:[`Gestor`,`Secretaria`]},{id:`ped_chamada`,nome:`Fazer Chamada`,icon:`📋`,acao:`App.renderizarTela('chamada')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_notas`,nome:`Lançar Nota`,icon:`📝`,acao:`App.renderizarTela('avaliacoes')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_plan`,nome:`Planejamento`,icon:`📅`,acao:`App.renderizarTela('planejamento')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_bol`,nome:`Boletins`,icon:`🖨️`,acao:`App.renderizarTela('boletins')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`fin_inad`,nome:`Inadimplência`,icon:`⚠️`,acao:`App.renderizarTela('inadimplencia')`,roles:[`Gestor`,`Secretaria`]},{id:`fin_rel`,nome:`Rel. Financeiro`,icon:`📊`,acao:`App.renderizarRelatorio('financeiro')`,roles:[`Gestor`,`Secretaria`]},{id:`doc_ficha`,nome:`Ficha Matrícula`,icon:`📄`,acao:`App.renderizarRelatorio('ficha')`,roles:[`Gestor`,`Secretaria`]},{id:`doc_dossie`,nome:`Dossiê Executivo`,icon:`📁`,acao:`App.renderizarRelatorio('dossie')`,roles:[`Gestor`]},{id:`doc_gerador`,nome:`Documentos`,icon:`🎓`,acao:`App.renderizarRelatorio('documentos')`,roles:[`Gestor`,`Secretaria`]}],Object.assign(r,{usuario:null,entidadeAtual:null,idEdicao:null,idEdicaoUsuario:null,listaCache:[],sanitizeHTML:e=>e?typeof DOMPurify>`u`?(console.warn(`DOMPurify não carregado. Usando escapeHTML como fallback.`),r.escapeHTML(e)):DOMPurify.sanitize(e,{USE_PROFILES:{html:!0},ALLOWED_TAGS:[`p`,`br`,`strong`,`b`,`em`,`i`,`u`,`h1`,`h2`,`h3`,`h4`,`ul`,`ol`,`li`,`div`,`span`,`table`,`thead`,`tbody`,`tr`,`td`,`th`,`blockquote`],ALLOWED_ATTR:[`style`,`class`]}):``,motorTempoRealLigado:!1,calendarState:{month:new Date().getMonth(),year:new Date().getFullYear()},escapeHTML:e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),unescapeHTML:e=>e==null?``:String(e).replace(/&amp;/g,`&`).replace(/&lt;/g,`<`).replace(/&gt;/g,`>`).replace(/&quot;/g,`"`).replace(/&#039;/g,`'`),criarElemento:(e,t=[],n={},r=``)=>{let i=document.createElement(e);t.length>0&&i.classList.add(...t);for(let e in n)if(e.startsWith(`on`)&&typeof n[e]==`function`){let t=e.substring(2).toLowerCase();i.addEventListener(t,n[e])}else i.setAttribute(e,n[e]);return r!==``&&(i.textContent=r),i},getTenantKey:e=>`${e}_${r.usuario&&r.usuario.id?r.usuario.id:`convidado`}`,getPlanoAtual:()=>localStorage.getItem(r.getTenantKey(`escola_plano`))||`Teste`,getDeviceId:()=>{let e=localStorage.getItem(`ptt_device_id`);return e||(e=`dev_`+window.crypto.randomUUID(),localStorage.setItem(`ptt_device_id`,e)),e},aplicarPermissoesDeUsuario:()=>{if(!r.usuario)return;let e=r.usuario.tipo||`Gestor`;document.querySelectorAll(`.sidebar button, .sidebar .menu-item`).forEach(t=>{let n=t.getAttribute(`onclick`)||``,r=!0;e===`Professor`?(n.includes(`mensalidade`)||n.includes(`financeiro`)||n.includes(`inadimplencia`)||n.includes(`relatorio`)||n.includes(`configuracoes`)||n.includes(`aparencia`)||n.includes(`backup`)||n.includes(`plano`)||n.includes(`conta`))&&(r=!1):e===`Secretaria`&&(n.includes(`configuracoes`)||n.includes(`aparencia`)||n.includes(`backup`)||n.includes(`plano`)||n.includes(`dossie`)||n.includes(`conta`))&&(r=!1),t.style.display=r?``:`none`})},verificarBloqueioGeral:e=>{if(!e)return!1;let t=e.plano||`Teste`;if(t===`Bloqueado`)return!0;let n=new Date;if(t===`Teste`){let t=e.dataCriacao?new Date(e.dataCriacao):n;return Math.floor(Math.abs(n-t)/(1e3*60*60*24))>=7}if(e.dataExpiracao)return n>=new Date(e.dataExpiracao);{let r=e.dataCriacao?new Date(e.dataCriacao):n,i=Math.floor(Math.abs(n-r)/(1e3*60*60*24));if(t!==`Premium`&&i>=30)return!0}return!1},verificarLimites:async e=>{let t=r.getPlanoAtual();if(t===`Premium`||t===`Teste`)return!0;try{if(e===`aluno`){let e=await r.api(`/alunos`),n=t===`Essencial`?20:t===`Profissional`?80:0;if(e.length>=n)return r.showToast(`⚠️ Limite de ${n} alunos atingido no plano ${t}. Faça o upgrade para continuar a crescer!`,`warning`),setTimeout(()=>r.renderizarMeuPlano(),2e3),!1}else if(e===`usuario`){let e=await r.api(`/usuarios`),n=t===`Essencial`?2:t===`Profissional`?4:0;if(e.length>=n)return r.showToast(`⚠️ Limite de ${n} acessos atingido no plano ${t}. Faça o upgrade para adicionar mais equipe!`,`warning`),setTimeout(()=>r.renderizarMeuPlano(),2e3),!1}return!0}catch{return!1}},verificarPermissao:e=>{let t=r.getPlanoAtual();return t===`Premium`||t===`Teste`?!0:e===`whatsapp`&&t===`Essencial`?(r.showToast(`💎 Funcionalidade disponível a partir do Plano Profissional. Faça o upgrade!`,`warning`),setTimeout(()=>r.renderizarMeuPlano(),1500),!1):e===`dossie`&&t!==`Premium`?(r.showToast(`💎 Exclusivo do Plano Premium. Faça o upgrade para aceder ao Dossiê Executivo!`,`warning`),setTimeout(()=>r.renderizarMeuPlano(),1500),!1):!0},api:async(e,t=`GET`,n=null)=>{let i={method:t,headers:{"Content-Type":`application/json`},credentials:`include`,cache:`no-store`};n&&(i.body=JSON.stringify(n));let a=e.replace(/^\/api/,``),o=a.startsWith(`/`)?a:`/${a}`,s=`/api${o}`;(window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`)&&window.location.port!==`5173`&&(s=`http://localhost:3000${o}`);try{let e=await fetch(s,i);if(!e.ok){let t=(await e.json().catch(()=>({}))).error||`Erro no servidor (${e.status})`;return r.showToast(t,`error`),{error:t}}let n=await e.json();return t!==`GET`&&r.usuario&&typeof r.verificarNotificacoes==`function`&&setTimeout(r.verificarNotificacoes,800),n}catch(e){console.error(`❌ Falha na API [${t} ${s}]:`,e.message);let n=e.message===`Failed to fetch`||e.message.includes(`NetworkError`)?`Sem ligação ao servidor Backend (Porta 3000 desligada?)`:e.message;return r.showToast(n,`error`),t===`GET`?[]:{error:n}}},setTitulo:e=>{let t=document.getElementById(`titulo-pagina`);t&&(t.innerText=e)},toggleSub:e=>{document.querySelectorAll(`.submenu`).forEach(t=>{t.id!==e&&(t.style.display=`none`)});let t=document.getElementById(e);t&&(t.style.display=t.style.display===`block`?`none`:`block`)},fecharModal:()=>{document.getElementById(`modal-overlay`).style.display=`none`;let e=document.querySelector(`.btn-confirm`);e&&(e.style.display=`inline-flex`,e.setAttribute(`onclick`,`App.salvarCadastro()`),e.innerHTML=`💾 Salvar Registro`)},abrirTelaCadastroInst:()=>{document.getElementById(`modal-cadastro-inst`).style.display=`flex`,r.voltarEtapa1()},fecharModalInst:()=>{document.getElementById(`modal-cadastro-inst`).style.display=`none`},voltarEtapa1:()=>{document.getElementById(`etapa-1-email`).style.display=`block`,document.getElementById(`etapa-2-validacao`).style.display=`none`,document.getElementById(`etapa-3-sucesso`).style.display=`none`},enviarCodigoInst:async()=>{console.log(`🔥 Clique recebido no botão de Cadastro!`);let e=document.getElementById(`novo-inst-email`).value,t=document.querySelector(`#etapa-1-email button`);if(!e||!e.includes(`@`))return r.showToast(`Digite um e-mail válido.`,`error`);let n=t.innerText;t.innerText=`Enviando... ⏳`,t.disabled=!0;try{let t=await r.api(`/auth/enviar-codigo`,`POST`,{email:e});t&&t.success?(r.showToast(`Código enviado!`,`success`),document.getElementById(`etapa-1-email`).style.display=`none`,document.getElementById(`etapa-2-validacao`).style.display=`block`):r.showToast(`Erro ao enviar e-mail.`,`error`)}catch{r.showToast(`Erro de servidor.`,`error`)}finally{t.innerText=n,t.disabled=!1}},validarCadastroInst:async()=>{let e=document.getElementById(`novo-inst-email`).value,t=document.getElementById(`novo-inst-codigo`).value.trim(),n=document.getElementById(`novo-inst-pin`).value.trim(),i=document.querySelector(`#etapa-2-validacao button`);if(!t||!n)return r.showToast(`Preencha Código e PIN.`,`error`);let a=i.innerText;i.innerText=`A Validar... ⏳`,i.disabled=!0;try{let i=await r.api(`/auth/validar-cadastro`,`POST`,{email:e,codigo:t,pin:n});i&&i.success?(document.getElementById(`etapa-2-validacao`).style.display=`none`,document.getElementById(`etapa-3-sucesso`).style.display=`block`,typeof confetti==`function`&&confetti(),typeof gtag==`function`&&gtag(`event`,`generate_lead`,{currency:`BRL`,value:0,tipo_conta:`App Gestão PTT`})):r.showToast(i.error||`Dados incorretos.`,`error`)}catch{r.showToast(`Erro de servidor.`,`error`)}finally{i.innerText=a,i.disabled=!1}},renderizarTela:async(e,t=!1)=>{if(!r.usuario&&e!==`login`){r.showToast(`Sessão expirada. Faça login novamente.`,`error`),r.logout();return}document.querySelector(`.sidebar`)&&document.querySelector(`.sidebar`).classList.remove(`active`),document.querySelector(`.mobile-overlay`)&&document.querySelector(`.mobile-overlay`).classList.remove(`active`);let n=r.usuario?r.usuario.tipo:`Gestor`,i=[`mensalidades`,`inadimplencia`,`configuracoes`,`aparencia`,`backup`,`plano`,`financeiro`,`dossie`,`documentos`,`ficha`,`conta`],a=[`configuracoes`,`aparencia`,`backup`,`plano`,`dossie`,`conta`];if(n===`Professor`&&i.includes(e))return r.showToast(`🚫 Acesso restrito. Perfil de Professor não tem permissão para esta área.`,`error`),r.renderizarInicio();if(n===`Secretaria`&&a.includes(e))return r.showToast(`🚫 Acesso restrito. Perfil de Secretaria não tem permissão para esta área.`,`error`),r.renderizarInicio();!t&&e!==`login`&&e!==`inicio`?window.history.pushState({tela:e},``,`#${e}`):!t&&e===`inicio`&&window.history.pushState({tela:`inicio`},``,window.location.pathname),typeof gtag==`function`&&gtag(`event`,`page_view`,{page_title:`Tela: `+e,page_location:window.location.href+`#`+e,page_path:`/`+e}),e===`chamada`?(r.setTitulo(`Chamada`),r.renderizarChamadaPro()):e===`avaliacoes`?(r.setTitulo(`Notas`),r.renderizarAvaliacoesPro()):e===`calendario`?(r.setTitulo(`Calendário`),r.renderizarCalendarioPro()):e===`planejamento`?(r.setTitulo(`Planejamento`),r.renderizarPlanejamentoPro()):e===`boletins`?(r.setTitulo(`Boletim`),r.renderizarBoletimVisual()):e===`mensalidades`?(r.setTitulo(`Financeiro`),r.renderizarFinanceiroPro()):e===`inadimplencia`?(r.setTitulo(`Inadimplência`),r.renderizarInadimplencia()):e===`configuracoes`?(r.setTitulo(`Configurações`),r.renderizarConfiguracoes()):e===`aparencia`?r.renderizarConfiguracoesAparencia():e===`backup`?r.renderizarBackup():e===`plano`?r.renderizarMeuPlano():r.renderizarInicio()},renderizarConfig:e=>{e===`perfil`?r.renderizarTela(`configuracoes`):e===`aparencia`?r.renderizarTela(`aparencia`):e===`conta`?r.renderizarMinhaConta():e===`backup`&&r.renderizarTela(`backup`)},renderizarRelatorio:e=>{e===`dossie`&&!r.verificarPermissao(`dossie`)||typeof r.renderizarRelatorioModulo==`function`&&r.renderizarRelatorioModulo(e)},renderizarMeuPlano:()=>{r.setTitulo(`Gerenciar Assinatura`);let e=document.getElementById(`app-content`),t=r.getPlanoAtual(),n=0,i=JSON.parse(localStorage.getItem(r.getTenantKey(`escola_perfil`)))||{},a=new Date().getTime();if(t===`Teste`){let e=i.dataCriacao?new Date(i.dataCriacao).getTime():a,t=Math.abs(a-e);n=7-Math.floor(t/(1e3*60*60*24))}else if(i.dataExpiracao){let e=new Date(i.dataExpiracao).getTime()-a;n=Math.ceil(e/(1e3*60*60*24))}else if(i.dataCriacao){let e=Math.abs(a-new Date(i.dataCriacao).getTime());n=30-Math.floor(e/(1e3*60*60*24))}n<0&&(n=0);let o=t===`Premium`?`#f39c12`:t===`Profissional`?`#3498db`:`#27ae60`;e.innerHTML=`
            <div class="card" style="text-align:center; padding: 40px 20px; border-top: 5px solid var(--accent);">
                <h2 style="margin: 0 0 15px 0; color: var(--card-text);">Evolua a sua Instituição</h2>
                <div style="margin-bottom: 30px;">${t===`Teste`?`<strong style="color:var(--warning); background:rgba(243,156,18,0.1); padding:8px 20px; border-radius:20px; border:2px solid var(--warning); font-size:16px;">⏳ Plano Teste (${n} dias restantes)</strong>`:`<strong style="color:${o}; background:rgba(0,0,0,0.02); padding:8px 20px; border-radius:20px; border:2px solid ${o}; font-size:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">💎 PLANO ATUAL: ${r.escapeHTML(t).toUpperCase()} (${n} dias)</strong>`}</div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #eee;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Já efetuou o pagamento?</h4>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <input type="text" id="input-novo-pin" placeholder="Insira a sua Chave de Ativação (PIN)" style="flex:1; min-width: 200px; padding:12px; border-radius:6px; border:1px solid #ccc; text-align:center; letter-spacing:2px; font-weight:bold; font-size:16px;">
                        
                        <button class="btn-primary" style="width:auto; margin:0;" onclick="App.ativarNovoPlano(event)">Validar PIN</button>
                    </div>
                    <p style="font-size:11px; color:#999; margin: 10px 0 0 0;">O PIN é enviado para o seu e-mail imediatamente após a confirmação do pagamento.</p>
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
        `},comprarPlano:(e,t)=>{r.showToast(`A redirecionar para o pagamento seguro do plano ${e}...`,`info`),setTimeout(()=>{window.open(t,`_blank`)},1500)},ativarNovoPlano:async e=>{e&&e.preventDefault();let t=document.getElementById(`input-novo-pin`);if(!t)return;let n=t.value.trim().toUpperCase();if(!n)return r.showToast(`Por favor, insira o PIN recebido no e-mail.`,`warning`);let i=document.querySelector(`button[onclick="App.ativarNovoPlano(event)"]`),a=i?i.innerText:`Validar PIN`;i&&(i.innerText=`A validar... ⏳`,i.disabled=!0);try{let e=await r.api(`/escola/validar-pin`,`POST`,{pin:n}),o=e&&e.success?e.plano:null;if(!o)if(n.includes(`PRE`))o=`Premium`;else if(n.includes(`ESS`))o=`Essencial`;else if(n.includes(`PRO`))o=`Profissional`;else{r.showToast(e.error||`PIN em formato inválido.`,`error`),i&&(i.innerText=a,i.disabled=!1);return}let s=await r.api(`/escola`)||{},c=new Date;c.setDate(c.getDate()+30),await r.api(`/escola`,`PUT`,{...s,plano:o,pinUsado:n,dataExpiracao:c.toISOString()}),localStorage.setItem(r.getTenantKey(`escola_plano`),o);let l=JSON.parse(localStorage.getItem(r.getTenantKey(`escola_perfil`)))||{};l.plano=o,l.dataExpiracao=c.toISOString(),localStorage.setItem(r.getTenantKey(`escola_perfil`),JSON.stringify(l)),r.atualizarUIHeader(l),r.showToast(`🎉 PIN validado com sucesso! Plano atualizado para ${o}. A iniciar...`,`success`),t.value=``,await r.carregarDadosEscola(),r.renderizarInicio()}catch{r.showToast(`Erro ao comunicar com a base de dados.`,`error`)}finally{i&&(i.innerText=a,i.disabled=!1)}},abrirModalCadastro:async(e,t)=>{!t&&e===`aluno`&&!await r.verificarLimites(`aluno`)||typeof r.abrirModalCadastroModulo==`function`&&r.abrirModalCadastroModulo(e,t)},abrirRelatorioFrequencia:async(e,t)=>{let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Frequência Escolar: ${r.escapeHTML(t)}`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A processar o planejamento atual... ⏳</p>`;let i=document.querySelector(`.btn-confirm`);i&&(i.style.display=`none`),r.contextoFrequencia={idAluno:e,nomeAluno:t},await r.renderizarFrequenciaView(`ativo`)},renderizarFrequenciaView:async(e,t=null)=>{let{idAluno:n,nomeAluno:i}=r.contextoFrequencia,a=document.getElementById(`modal-form-content`);try{if(!r.contextoFrequencia.dadosCache){let[e,t]=await Promise.all([r.api(`/chamadas`),r.api(`/planejamentos`)]);r.contextoFrequencia.dadosCache={chamadas:e,planejamentos:t}}let o=r.contextoFrequencia.dadosCache.chamadas,s=r.contextoFrequencia.dadosCache.planejamentos,c=o.filter(e=>e.idAluno===n).sort((e,t)=>new Date(t.data)-new Date(e.data)),l=s.filter(e=>e.idAluno===n),u=l.filter(e=>e.status!==`Arquivado`),d=l.filter(e=>e.status===`Arquivado`),f=document.querySelector(`#modal-overlay .btn-cancel`);if(f){let t=f.parentNode;if(document.querySelectorAll(`.btn-modal-dinamico`).forEach(e=>e.remove()),!f.dataset.limpezaAtiva){let e=f.onclick;f.onclick=function(t){document.querySelectorAll(`.btn-modal-dinamico`).forEach(e=>e.remove()),e&&e.apply(this,arguments)},f.dataset.limpezaAtiva=`true`}if(e===`ativo`||e===`ver_arquivado`){let e=document.createElement(`button`);e.className=`btn-modal-dinamico`,e.innerHTML=`🖨️ Imprimir`,e.style.cssText=`background:#27ae60; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease;`,e.onmouseover=()=>e.style.background=`#1e8449`,e.onmouseout=()=>e.style.background=`#27ae60`,e.onclick=()=>r.imprimirDossieFrequencia(),t.insertBefore(e,f)}if(e===`ativo`&&d.length>0){let e=document.createElement(`button`);e.className=`btn-modal-dinamico`,e.innerHTML=`🗄️ Arquivados`,e.style.cssText=`background:#7f8c8d; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;`,e.onmouseover=()=>e.style.background=`#95a5a6`,e.onmouseout=()=>e.style.background=`#7f8c8d`,e.onclick=e=>{e.target.innerHTML=`⏳ A abrir...`,e.target.style.opacity=`0.8`,setTimeout(()=>r.renderizarFrequenciaView(`lista_arquivados`),10)},t.insertBefore(e,f)}else if(e===`lista_arquivados`||e===`ver_arquivado`){let n=e===`lista_arquivados`,i=document.createElement(`button`);i.className=`btn-modal-dinamico`,i.innerHTML=n?`⬅️ Voltar ao Atual`:`⬅️ Voltar à Lista`,i.style.cssText=`background:#3498db; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;`,i.onmouseover=()=>i.style.background=`#2980b9`,i.onmouseout=()=>i.style.background=`#3498db`,i.onclick=e=>{e.target.innerHTML=`⏳ A voltar...`,e.target.style.opacity=`0.8`,setTimeout(()=>r.renderizarFrequenciaView(n?`ativo`:`lista_arquivados`),10)},t.insertBefore(i,f)}}if(e===`lista_arquivados`){if(document.getElementById(`modal-titulo`).innerText=`🗄️ Histórico Arquivado: ${r.escapeHTML(i)}`,d.length===0){a.innerHTML=`<p style="text-align:center; padding:30px; color:#999;">Nenhum planejamento arquivado encontrado para este aluno.</p>`;return}a.innerHTML=`
                    <div style="max-height:50vh; overflow-y:auto; padding-right:10px;">
                        <p style="font-size:13px; color:#666; margin-bottom:15px; text-align:center;">Selecione um planejamento antigo para ver o dossiê de presenças.</p>
                        ${d.map(e=>{let t=`Sem datas registadas`;return e.aulas&&e.aulas.length>0&&(t=`${e.aulas[0].data} até ${e.aulas[e.aulas.length-1].data}`),`
                    <div onclick="App.renderizarFrequenciaView('ver_arquivado', '${e.id}')" style="background:#f9f9f9; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='#f9f9f9'">
                        <div>
                            <div style="font-weight:bold; color:#2c3e50; font-size:14px;">📄 ${r.escapeHTML(e.disciplina||`Curso Geral`)}</div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">📅 Período: ${t}</div>
                        </div>
                        <span style="font-size:20px; color:#aaa;">➡️</span>
                    </div>`}).join(``)}
                    </div>
                `;return}let p=null,m=`Frequência Escolar: ${r.escapeHTML(i)}`;e===`ativo`?p=u.length>0?u[0]:null:e===`ver_arquivado`&&(p=d.find(e=>e.id===t),m=`🗄️ Arquivo: ${r.escapeHTML(i)}`),document.getElementById(`modal-titulo`).innerText=m;let h=e=>e.split(`/`).reverse().join(`-`),g=c;if(p&&p.aulas&&p.aulas.length>0){let e=p.aulas.map(e=>h(e.data)).sort(),t=e[0],n=e[e.length-1];g=c.filter(e=>e.data>=t&&e.data<=n)}else if(e===`ativo`&&d.length>0){let e=d.map(e=>{if(!e.aulas||e.aulas.length===0)return null;let t=e.aulas.map(e=>h(e.data)).sort();return{inicio:t[0],fim:t[t.length-1]}}).filter(e=>e);g=c.filter(t=>!e.some(e=>t.data>=e.inicio&&t.data<=e.fim))}let _=0,v=0,y=0,b=``;if(g.length===0)b=`<p style="text-align:center; padding:30px; color:#999; font-size:14px;">Nenhum registo de chamada encontrado para este ${e===`ativo`?`período letivo`:`arquivo`}.</p>`;else{let e={},t=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`];g.forEach(n=>{let r=new Date(n.data+`T00:00:00`),i=`${t[r.getMonth()]} de ${r.getFullYear()}`;e[i]||(e[i]=[]),e[i].push(n);let a=0;if(n.duracao){let[e,t]=n.duracao.split(`:`);a=(parseInt(e)||0)*60+(parseInt(t)||0)}n.status===`Presença`||n.status===`Reposição`?_+=a:n.status===`Falta Justificada`||n.status===`Justificada`?y+=a:n.status===`Falta`&&(v+=a)});for(let t in e)b+=`<div style="background:#f4f6f7; padding:10px 15px; margin-top:15px; border-radius:8px 8px 0 0; font-weight:bold; color:#2c3e50; border:1px solid #eee; border-bottom:none; font-size:13px; text-transform:uppercase;">📅 ${t}</div>`,b+=`<table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #eee; margin-bottom:10px; background:#fff;"><tbody>`,e[t].forEach(e=>{let t=e.data.split(`-`).reverse().join(`/`),n=e.status===`Presença`||e.status===`Reposição`?`#27ae60`:e.status===`Falta`?`#e74c3c`:`#f39c12`;b+=`<tr style="border-bottom:1px solid #eee;">
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
            `}catch{a.innerHTML=`<p style="color:red; text-align:center;">Erro ao processar as horas de frequência.</p>`}},imprimirDossieFrequencia:()=>{let e=JSON.parse(localStorage.getItem(r.getTenantKey(`escola_perfil`)))||{},t=e.nome||`Instituição de Ensino`,n=e.cnpj?`CNPJ: ${e.cnpj}`:``,i=e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?`<img src="${e.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">`:``,a=document.getElementById(`modal-titulo`).innerText,o=document.getElementById(`modal-form-content`).cloneNode(!0);o.querySelectorAll(`div[style*="max-height"]`).forEach(e=>{e.style.maxHeight=`none`,e.style.overflowY=`visible`,e.style.paddingRight=`0`});let s=document.createElement(`iframe`);s.style.position=`absolute`,s.style.width=`0px`,s.style.height=`0px`,s.style.border=`none`,document.body.appendChild(s);let c=s.contentWindow.document;c.open(),c.write(`
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
                    ${i}
                    <div>
                        <h2>${r.escapeHTML(t)}</h2>
                        <p>${r.escapeHTML(n)}</p>
                    </div>
                </div>
                
                <div class="titulo-doc">📄 ${a}</div>
                
                ${o.innerHTML}
                
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento gerado em ${new Date().toLocaleString(`pt-BR`)} pelo Sistema Escolar
                </div>
            </body>
            </html>
        `),c.close(),setTimeout(()=>{s.contentWindow.focus(),s.contentWindow.print(),setTimeout(()=>{document.body.removeChild(s)},1500)},500)},abrirModalVenda:async(e,t)=>{let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Registrar Venda - ${r.escapeHTML(t)}`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar estoque... ⏳</p>`;try{let n=await r.api(`/estoques`),i=Array.isArray(n)?n:[],a=`<option value="">-- Selecione um Produto/Serviço --</option>`;i.forEach(e=>{let t=parseInt(e.quantidade)||0,n=parseFloat(e.valor)||0;a+=`<option value="${e.id}" data-nome="${r.escapeHTML(e.nome)}" data-valor="${n}">📦 ${r.escapeHTML(e.nome)} (Estoque: ${t} | R$ ${n.toFixed(2)})</option>`}),a+=`<option value="avulso">✏️ Outro Item (Digitar Manualmente)</option>`;let o=new Date().toISOString().split(`T`)[0],s=`
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
                    <input type="hidden" id="v-idaluno" value="${r.escapeHTML(e)}">
                    <input type="hidden" id="v-nomealuno" value="${r.escapeHTML(t)}">
                </div>`;document.getElementById(`modal-form-content`).innerHTML=s;let c=document.querySelector(`.btn-confirm`);c.setAttribute(`onclick`,`App.salvarVenda()`),c.innerHTML=`💾 Registrar Venda`,c.style.display=`inline-flex`}catch{document.getElementById(`modal-form-content`).innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o estoque.</p>`}},selecionarItemVenda:e=>{let t=document.getElementById(`v-item`),n=document.getElementById(`v-valor`),r=document.getElementById(`v-item-id`);if(e.value===`avulso`)t.style.display=`block`,t.value=``,n.value=``,r.value=``,t.focus();else if(e.value!==``){t.style.display=`none`;let i=e.options[e.selectedIndex];t.value=i.getAttribute(`data-nome`),n.value=i.getAttribute(`data-valor`),r.value=e.value}else t.style.display=`none`,t.value=``,n.value=``,r.value=``},salvarVenda:async()=>{let e=document.getElementById(`v-idaluno`).value,t=document.getElementById(`v-nomealuno`).value,n=document.getElementById(`v-item`).value.trim(),i=document.getElementById(`v-item-id`).value,a=document.getElementById(`v-valor`).value,o=document.getElementById(`v-data`).value,s=document.getElementById(`v-forma`).value,c=document.getElementById(`v-desc`).value;if(!n||!a||!o)return r.showToast(`Preencha o item, valor e data.`,`error`);let l=s===`Pendente (Fiado)`?`Pendente`:`Pago`,u=`Venda: ${n} | Pagto: ${s} ${c?` | Obs: `+c:``}`,d={id:window.crypto.randomUUID(),idCarne:`VENDA_${window.crypto.randomUUID().split(`-`)[0].toUpperCase()}`,idAluno:e,alunoNome:t,valor:a,vencimento:o,status:l,descricao:u,tipo:`Receita`,dataGeracao:new Date().toLocaleDateString(`pt-BR`)},f=document.querySelector(`.btn-confirm`),p=f?f.innerHTML:`💾 Registrar Venda`;f&&(f.innerHTML=`⏳ Registrando...`,f.disabled=!0),document.body.style.cursor=`wait`;try{if(await r.api(`/financeiro`,`POST`,d),i){let e=await r.api(`/estoques/${i}`);if(e&&e.id){let t=parseInt(e.quantidade)||0;t>0&&--t,await r.api(`/estoques/${i}`,`PUT`,{...e,quantidade:t})}}r.showToast(`Venda registrada e baixa no estoque efetuada!`,`success`),r.fecharModal()}catch{r.showToast(`Erro ao registrar venda.`,`error`)}finally{f&&(f.innerHTML=p,f.disabled=!1),document.body.style.cursor=`default`}},renderizarLista:async e=>{if(!r.usuario){r.logout();return}document.querySelector(`.sidebar`)&&document.querySelector(`.sidebar`).classList.remove(`active`),document.querySelector(`.mobile-overlay`)&&document.querySelector(`.mobile-overlay`).classList.remove(`active`),r.entidadeAtual=e;let t=e.charAt(0).toUpperCase()+e.slice(1)+`s`;r.setTitulo(`Gerenciar ${t}`);let n=document.getElementById(`app-content`),i=e===`financeiro`?`financeiro`:e+`s`;try{r.listaCache=await r.api(`/${i}`);let a=`
                <div class="toolbar" style="max-width: 800px; margin: 0 auto; display: flex; gap: 15px; text-align: left; flex-wrap:wrap;">
                    <div class="search-wrapper" style="flex: 1; min-width:250px; position: relative;">
                        <span class="search-icon" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="input-busca" class="search-input-modern" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee;" placeholder="Pesquisar..." oninput="App.filtrarTabelaReativa()">
                    </div>
                    <button class="btn-cancel" style="color:#c0392b; border: 1px solid #c0392b; background: transparent; padding: 0 20px; height: 45px; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" onclick="App.excluirEmLoteCadastros('${e}')">🗑️ Excluir Vários</button>
                    <button class="btn-new-modern" onclick="${e===`financeiro`?`App.renderizarTela('mensalidades')`:`App.abrirModalCadastro('${e}')`}"><span>＋</span> NOVO REGISTRO</button>
                </div>`;n.innerHTML=`<div style="text-align:center; margin-bottom:30px;">${r.UI.card(`Consultar ${t}`,`Utilize o campo abaixo para localizar registros.`,a,`100%`)}</div><div id="container-tabela"></div>`,r.filtrarTabelaReativa()}catch{n.innerHTML=`Erro ao carregar lista.`}},filtrarTabelaReativa:()=>{let e=document.querySelector(`input[placeholder*="Pesquisar"], #busca-tabela`),t=document.getElementById(`container-tabela`);if(!e||!t)return;if(r.listaCache&&r.listaCache.error){t.innerHTML=`<p style="text-align:center; padding:30px; color:#e74c3c;"><b>Erro de Servidor:</b> ${r.escapeHTML(r.listaCache.error)}</p>`;return}let n=e.value.toLowerCase();if(!Array.isArray(r.listaCache)){t.innerHTML=`<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado ou carregamento falhou.</p>`;return}let i=n.length===0?r.listaCache:r.listaCache.filter(e=>(e.nome||e.alunoNome||e.descricao||``).toLowerCase().includes(n));t.innerHTML=`<div class="card" style="animation: fadeIn 0.3s ease; padding:0; overflow:hidden;">${r.gerarTabelaHTML(i)}</div>`},gerarTabelaHTML:e=>{if(!e.length)return`<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado.</p>`;let t=r.entidadeAtual,n={estrutura:(e,t)=>`<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse;"><thead><tr>${e}</tr></thead><tbody>${t}</tbody></table></div>`,th:(e,t=`left`)=>`<th style="text-align:${t}; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; color:#2c3e50;">${e}</th>`,td:(e,t=`left`)=>`<td style="text-align:${t}; padding:15px; border-bottom:1px solid #eee; color:#333;">${e}</td>`,tr:e=>`<tr style="transition: background 0.2s;">${e}</tr>`,acoes:e=>`<div style="display:flex; gap:5px; justify-content:flex-end; align-items:center;">${e.join(``)}</div>`,btn:(e,t,n,r)=>`<button class="btn-edit" style="background:${t}; border:none; color:white; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="${n}" title="${r}">${e}</button>`},i=`<th style="width:40px; text-align:center; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheckCadastros(this)" style="cursor:pointer; transform:scale(1.2);"></th>`,a=``;t===`aluno`&&(a=i+n.th(`Nome`)+n.th(`Turma`)+n.th(`Status`)+n.th(`WhatsApp`)+n.th(`Ações`,`right`)),t===`turma`&&(a=i+n.th(`Turma`)+n.th(`Dia`)+n.th(`Horário`)+n.th(`Curso`)+n.th(`Ações`,`right`)),t===`curso`&&(a=i+n.th(`Curso`)+n.th(`Carga`)+n.th(`Ações`,`right`)),t===`financeiro`&&(a=i+n.th(`Ref (Aluno)`)+n.th(`Descrição`)+n.th(`Vencimento`)+n.th(`Valor`)+n.th(`Status`)+n.th(`Ações`,`right`)),t===`estoque`&&(a=i+n.th(`Item`)+n.th(`Código`)+n.th(`Qtd Atual`)+n.th(`Mínimo (Alerta)`)+n.th(`Valor`)+n.th(`Status`)+n.th(`Ações`,`right`));let o=e.map(e=>{let i=``,a=`<td style="text-align:center; padding:15px; border-bottom:1px solid #eee;"><input type="checkbox" class="chk-cadastro" value="${e.id}" style="cursor:pointer; transform:scale(1.2);"></td>`;if(i+=a,t===`aluno`){let t=e.status||`Ativo`,a=t===`Ativo`?`#27ae60`:t===`Trancado`?`#f39c12`:`#e74c3c`,o=`<span style="background:${a}20; color:${a}; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; border: 1px solid ${a}50;">${t}</span>`;i+=n.td(r.escapeHTML(e.nome))+n.td(r.escapeHTML(e.turma||`-`))+n.td(o)+n.td(r.escapeHTML(e.whatsapp||`-`))}else if(t===`turma`)i+=n.td(r.escapeHTML(e.nome))+n.td(r.escapeHTML(e.dia||`-`))+n.td(r.escapeHTML(e.horario||`-`))+n.td(r.escapeHTML(e.curso||`-`));else if(t===`curso`)i+=n.td(r.escapeHTML(e.nome))+n.td(r.escapeHTML(e.carga||`-`));else if(t===`financeiro`){let t=e.vencimento?e.vencimento.split(`-`).reverse().join(`/`):`-`,a=`R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,o=`<span style="color:${e.status===`Pago`?`#27ae60`:`#e74c3c`}; font-weight:bold; background:${e.status===`Pago`?`#eafaf1`:`#fdedec`}; padding:4px 8px; border-radius:4px; font-size:12px;">${r.escapeHTML(e.status)}</span>`;i+=n.td(r.escapeHTML(e.alunoNome||`Sem Nome`))+n.td(r.escapeHTML(e.descricao))+n.td(r.escapeHTML(t))+n.td(r.escapeHTML(a))+n.td(o)}else if(t===`estoque`){let t=parseInt(e.quantidade)||0,a=parseInt(e.quantidadeMinima)||0,o=t<=a?`<span style="color:#e74c3c; font-weight:bold; background:#fdedec; padding:4px 8px; border-radius:4px; font-size:12px;">⚠️ Baixo</span>`:`<span style="color:#27ae60; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:4px; font-size:12px;">✅ Normal</span>`,s=e.valor?`R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`:`-`;i+=n.td(r.escapeHTML(e.nome))+n.td(r.escapeHTML(e.codigo||`-`))+n.td(t,`center`)+n.td(a,`center`)+n.td(s)+n.td(o,`center`)}let o=t===`financeiro`?`financeiro`:t+`s`,s=t===`financeiro`?`App.abrirEdicaoFinanceiro('${e.id}')`:`App.abrirModalCadastro('${t}', '${e.id}')`,c=(e.nome||``).replace(/'/g,`\\'`),l=[];if(t===`aluno`){let t=e.status||`Ativo`;l.push(n.btn(`🔄`,`#8e44ad`,`App.alterarStatusAluno('${e.id}', '${t}')`,`Alterar Status (Ativo/Trancado/Cancelado)`)),l.push(n.btn(`⏱️`,`#3498db`,`App.abrirRelatorioFrequencia('${e.id}', '${r.escapeHTML(c)}')`,`Ver Histórico de Horas / Frequência`)),r.usuario.tipo!==`Professor`&&t===`Ativo`&&l.push(n.btn(`🛒`,`#27ae60`,`App.abrirModalVenda('${e.id}', '${r.escapeHTML(c)}')`,`Registrar Venda / Extra`))}return t===`financeiro`&&l.push(n.btn(`💬`,`#25D366`,`if(App.verificarPermissao('whatsapp')) App.enviarWhatsApp('${e.id}')`,`Avisar por WhatsApp`)),l.push(n.btn(`✏️`,`#f39c12`,s,`Editar`)),l.push(n.btn(`🗑️`,`#e74c3c`,`App.excluir('${o}', '${e.id}')`,`Excluir`)),i+=n.td(n.acoes(l),`right`),n.tr(i)}).join(``);return n.estrutura(a,o)},excluir:(e,t)=>{r.abrirModalConfirmacao(`Tem a certeza absoluta?`,`Esta ação apagará este registro permanentemente. Não é possível desfazer.`,async n=>{document.body.style.cursor=`wait`;try{let n=await r.api(`/${e}/${t}`,`DELETE`);if(n&&n.error)r.showToast(n.error,`error`);else{r.showToast(`Excluído com sucesso!`,`success`);let t=e===`financeiro`?`financeiro`:e.slice(0,-1),n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),await r.renderizarLista(t)}}catch{r.showToast(`Erro ao excluir.`,`error`)}finally{document.body.style.cursor=`default`,n.style.opacity=`0`,setTimeout(()=>n.style.display=`none`,300)}})},alterarStatusAluno:(e,t)=>{let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Atualizar Status de Matrícula`;let i={Ativo:{icon:`🟢`,color:`#27ae60`,desc:`Aluno matriculado e assistindo aulas.`},Trancado:{icon:`🟡`,color:`#f39c12`,desc:`Matrícula pausada. Histórico financeiro preservado.`},Cancelado:{icon:`🔴`,color:`#e74c3c`,desc:`Vínculo encerrado com a instituição.`}},a=Object.entries(i).map(([e,t])=>`
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
                <span style="font-size: 14px; font-weight: bold; color: ${i[t]?i[t].color:`#333`}; margin-left: 5px;">${t}</span>
            </div>
            
            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom:10px;">Selecione o novo status:</h4>
            <div id="status-options-container" data-selecionado="">
                ${a}
            </div>
            <input type="hidden" id="status-student-id" value="${e}">
            <input type="hidden" id="status-student-orig" value="${t}">
        `;if(document.getElementById(`modal-form-content`).innerHTML=o,i[t]){let e=document.querySelector(`.status-option-card[data-status="${t}"]`);e&&r.selecionarOpcaoStatus(e)}let s=document.querySelector(`.btn-confirm`);s.setAttribute(`onclick`,`App.confirmarAlteracaoStatus()`),s.innerText=`💾 Salvar Novo Status`,s.style.display=`inline-flex`},selecionarOpcaoStatus:e=>{document.querySelectorAll(`.status-option-card`).forEach(e=>{e.style.borderColor=`#eee`,e.style.background=`white`,e.querySelector(`span[style*="font-size: 32px"]`).style.filter=`grayscale(1)`,e.querySelector(`.selection-indicator`).innerHTML=``,e.querySelector(`.selection-indicator`).style.borderColor=`#ccc`,e.querySelector(`.selection-indicator`).style.background=`white`});let t=e.getAttribute(`data-status`),n=e.querySelector(`div[style*="font-weight: bold"]`).style.color;e.style.borderColor=n,e.style.background=`${n}05`,e.querySelector(`span[style*="font-size: 32px"]`).style.filter=`grayscale(0)`,e.querySelector(`.selection-indicator`).innerHTML=`<div style="width: 12px; height: 12px; border-radius: 50%; background: ${n};"></div>`,e.querySelector(`.selection-indicator`).style.borderColor=n,document.getElementById(`status-options-container`).setAttribute(`data-selecionado`,t)},confirmarAlteracaoStatus:async()=>{let e=document.getElementById(`status-student-id`),t=document.getElementById(`status-student-orig`),n=document.getElementById(`status-options-container`);if(!e||!n)return r.showToast(`Erro: Janela não abriu corretamente.`,`error`);let i=e.value,a=t?t.value:``,o=n.getAttribute(`data-selecionado`);if(!o)return r.showToast(`Selecione um status para prosseguir.`,`warning`);if(o===a)return r.showToast(`O status selecionado é o mesmo que o atual.`,`warning`);let s=document.querySelector(`.btn-confirm`),c=s?s.innerText:`Salvar`;s&&(s.innerText=`A atualizar... ⏳`,s.disabled=!0),document.body.style.cursor=`wait`;try{let e=await r.api(`/alunos/${i}`);if(!e||e.error)throw Error(`Erro ao buscar dados do aluno`);if(await r.api(`/alunos/${i}`,`PUT`,{...e,status:o}),r.showToast(`Sucesso! Aluno agora está como ${o}.`,`success`),r.fecharModal(),Array.isArray(r.cacheAlunos)){let e=r.cacheAlunos.findIndex(e=>e.id===i);e!==-1&&(r.cacheAlunos[e].status=o)}if(Array.isArray(r.listaCache)){let e=r.listaCache.findIndex(e=>e.id===i);e!==-1&&(r.listaCache[e].status=o)}typeof r.filtrarTabelaReativa==`function`?r.filtrarTabelaReativa():typeof r.renderizarLista==`function`?r.renderizarLista(`aluno`):setTimeout(()=>window.location.reload(),500),r.verificarNotificacoes(),document.getElementById(`titulo-pagina`)&&document.getElementById(`titulo-pagina`).innerText===`Visão Geral`&&r.renderizarInicio()}catch(e){console.error(`Erro na atualização:`,e),r.showToast(`Não foi possível atualizar o status. Tente novamente.`,`error`)}finally{s&&(s.innerText=c,s.disabled=!1),document.body.style.cursor=`default`}},atualizarUIHeader:e=>{if(!e)return;let t=document.querySelector(`.logo-area h2`),n=e.plano||`Teste`,i=`<div style="margin-top:8px; margin-bottom:5px;"><span style="background:${n===`Premium`?`#f39c12`:n===`Profissional`?`#3498db`:n===`Teste`?`#e74c3c`:`#27ae60`}; color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:1px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">💎 PLANO ${r.escapeHTML(n)}</span></div>`,a=r.usuario?r.usuario.login:`Desconhecido`,o=r.usuario?r.usuario.tipo:`Gestor`,s=`<div style="font-size:11px; color:#aaa; font-weight:normal; line-height:1.4; margin-top:5px; background: rgba(0,0,0,0.15); border-radius: 6px; padding: 4px;">👤 Logado como:<br><b style="color:#fff;">${r.escapeHTML(a)}</b><br><span style="font-size:9px; color:#3498db; text-transform:uppercase; font-weight:bold;">${r.escapeHTML(o)}</span></div>`;t&&(t.innerHTML=`${r.escapeHTML(e.nome||`Escola`)}<br><small style="color:#aaa;">${r.escapeHTML(e.cnpj||``)}</small>${i}${s}`);let c=document.querySelector(`.logo-area`);if(c){let t=c.querySelector(`img`);e.foto&&e.foto.length>50?(t||(t=document.createElement(`img`),t.style.cssText=`width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);`,c.insertBefore(t,c.firstChild)),t.src=e.foto):t&&t.remove()}},carregarDadosEscola:async()=>{try{let e=JSON.parse(localStorage.getItem(r.getTenantKey(`escola_perfil`)));e&&r.atualizarUIHeader(e);let t=await r.api(`/escola`);if(!t||t.error)return;t.dataCriacao||(t.dataCriacao=new Date().toISOString(),await r.api(`/escola`,`PUT`,t)),t.plano&&localStorage.setItem(r.getTenantKey(`escola_plano`),t.plano),localStorage.setItem(r.getTenantKey(`escola_perfil`),JSON.stringify(t)),r.atualizarUIHeader(t),r.verificarBloqueioGeral(t)&&r.mostrarTelaBloqueioLogin(t)}catch{console.log(`Carregando perfil...`)}},verificarNovidadesSilenciosamente:async()=>{if(r.usuario)try{let e=await fetch(`${n.API_URL}/sistema/notificacoes/nao-lidas`,{credentials:`include`});if(!e.ok)return;let t=await e.json(),i=document.getElementById(`noti-badge`);i&&(i.innerText=t.length,i.style.display=t.length>0?`flex`:`none`);let a=r.notificacoesAtuais||[],o=t.map(e=>e.id);o.some(e=>!a.includes(e))&&(r.notificacoesAtuais=o,typeof r.renderizarNotificacoes==`function`&&r.renderizarNotificacoes(t),t.some(e=>(e.tipo===`matricula`||e.tipo===`matricula_contrato`)&&!a.includes(e.id))&&(typeof r.carregarDadosEscola==`function`&&await r.carregarDadosEscola(),r.entidadeAtual===`aluno`&&typeof r.renderizarLista==`function`&&r.renderizarLista(`aluno`),typeof r.showToast==`function`&&r.showToast(`🎉 Nova matrícula online recebida agora!`,`success`)))}catch{}},renderizarNotificacoes:e=>{let t=document.getElementById(`noti-list`);if(t){if(!e||e.length===0){t.innerHTML=`
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
        `).join(``)}},resolverNotificacao:async e=>{try{await fetch(`${n.API_URL}/sistema/notificacoes/lida/${e}`,{method:`PUT`,credentials:`include`});let t=document.getElementById(`noti-${e}`);t&&t.remove();let i=document.getElementById(`noti-badge`);if(i){let e=parseInt(i.innerText)||0;if(--e,e>0)i.innerText=e;else{i.style.display=`none`;let e=document.getElementById(`noti-list`);e&&(e.innerHTML=`<div style="padding:15px; text-align:center; color:#999;">Tudo resolvido! ✅</div>`)}}r.notificacoesAtuais&&=r.notificacoesAtuais.filter(t=>t!==e)}catch(e){console.error(`Erro ao resolver:`,e),typeof r.showToast==`function`&&r.showToast(`Erro ao comunicar com o servidor.`,`error`)}},otimizarImagem:(e,t,n)=>{let r=new FileReader;r.readAsDataURL(e),r.onload=e=>{let r=new Image;r.src=e.target.result,r.onload=()=>{let e=document.createElement(`canvas`),i=r.width,a=r.height;i>t&&(a*=t/i,i=t),e.width=i,e.height=a,e.getContext(`2d`).drawImage(r,0,0,i,a),n(e.toDataURL(`image/jpeg`,.8))}}},renderizarConfiguracoes:async()=>{r.setTitulo(`Perfil da Escola`);let e=document.getElementById(`app-content`);try{let t=await r.api(`/escola`)||{};e.innerHTML=`
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
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${r.escapeHTML(t.nome||``)}"></div>
                        <div class="input-group"><label>CNPJ / NIF</label><input id="conf-cnpj" value="${r.escapeHTML(t.cnpj||``)}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Dados Bancários (Carnê)</label><input id="conf-banco" value="${r.escapeHTML(t.banco||``)}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${r.escapeHTML(t.chavePix||``)}"></div>
                    </div>

                    <h4 style="margin: 25px 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📍 Endereço da Instituição</h4>
                    <div style="display:grid; grid-template-columns: 1fr 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>CEP</label><input id="conf-cep" value="${r.escapeHTML(t.cep||``)}" oninput="App.mascaraCEP(this)" maxlength="9"></div>
                        <div class="input-group"><label>Endereço (Rua, Av.)</label><input id="conf-endereco" value="${r.escapeHTML(t.endereco||``)}"></div>
                        <div class="input-group"><label>Número</label><input id="conf-numero" value="${r.escapeHTML(t.numero||``)}"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Bairro</label><input id="conf-bairro" value="${r.escapeHTML(t.bairro||``)}"></div>
                        <div class="input-group"><label>Cidade</label><input id="conf-cidade" value="${r.escapeHTML(t.cidade||``)}"></div>
                        <div class="input-group"><label>Estado (UF)</label><input id="conf-estado" value="${r.escapeHTML(t.estado||``)}" maxlength="2" style="text-transform: uppercase;"></div>
                    </div>

                    <button class="btn-primary" style="width:100%; margin-top:25px; padding:15px; justify-content:center;" onclick="App.salvarConfiguracoes()">💾 ATUALIZAR DADOS DA ESCOLA</button>
                </div>`}catch{e.innerHTML=`Erro ao carregar.`}},previewImagemLocal:(e,t)=>{!e.files||e.files.length===0||r.otimizarImagem(e.files[0],400,e=>{let n=document.getElementById(t);n.src=e,n.setAttribute(`data-nova`,`true`)})},removerImagemLocal:e=>{let t=document.getElementById(e);t.src=e===`conf-preview`?`https://placehold.co/100?text=LOGO`:`https://placehold.co/100?text=QR+CODE`,t.setAttribute(`data-nova`,`true`);let n=document.getElementById(e===`conf-preview`?`conf-file`:`conf-qr-file`);n&&(n.value=``)},salvarConfiguracoes:async()=>{let e={nome:document.getElementById(`conf-nome`).value,cnpj:document.getElementById(`conf-cnpj`).value,banco:document.getElementById(`conf-banco`).value,chavePix:document.getElementById(`conf-pix`).value,cep:document.getElementById(`conf-cep`).value,endereco:document.getElementById(`conf-endereco`).value,numero:document.getElementById(`conf-numero`).value,bairro:document.getElementById(`conf-bairro`).value,cidade:document.getElementById(`conf-cidade`).value,estado:document.getElementById(`conf-estado`).value.toUpperCase()},t=document.getElementById(`conf-preview`);t&&t.hasAttribute(`data-nova`)&&(e.foto=t.src.includes(`placehold`)?``:t.src);let n=document.getElementById(`conf-qr-preview`);n&&n.hasAttribute(`data-nova`)&&(e.qrCodeImagem=n.src.includes(`placehold`)?``:n.src);let i=document.querySelector(`button[onclick="App.salvarConfiguracoes()"]`),a=i.innerText;i.innerText=`A atualizar... ⏳`,i.disabled=!0;try{let i=await r.api(`/escola`)||{};await r.api(`/escola`,`PUT`,{...i,...e}),await r.carregarDadosEscola(),t&&t.removeAttribute(`data-nova`),n&&n.removeAttribute(`data-nova`),r.showToast(`Configurações atualizadas com sucesso!`,`success`)}catch{r.showToast(`Erro ao salvar perfil da escola.`,`error`)}finally{i.innerText=a,i.disabled=!1}},toggleSenhaVisibilidade:e=>{let t=document.getElementById(e);t.type=t.type===`password`?`text`:`password`},renderizarMinhaConta:async()=>{r.setTitulo(`Gestão de Usuários`);let e=document.getElementById(`app-content`);r.idEdicaoUsuario=null;let t=r.usuario?r.usuario.login:``,n=r.usuario&&r.usuario.email?r.usuario.email:``,i=(e,t)=>`<div class="input-group" style="position:relative;"><label>${t}</label><input type="password" id="${e}" style="width:100%; padding-right:40px;"><span onclick="App.toggleSenhaVisibilidade('${e}')" style="position:absolute; right:12px; top:32px; cursor:pointer; font-size:16px; opacity:0.6; user-select:none;" title="Mostrar/Ocultar Senha">👁️</span></div>`;try{let a=await r.api(`/usuarios`),o=(Array.isArray(a)?a:[]).filter(e=>e.id===r.usuario.id||String(e.donoId)===String(r.usuario.id));e.innerHTML=`
                <div style="display:flex; gap:30px; flex-wrap:wrap;">
                    <div class="card" style="flex:1; height:fit-content; min-width:300px;">
                        <h3>Meus Dados de Acesso</h3>
                        <p style="font-size:12px; color:#666; margin-bottom:15px;">A senha atual é sempre obrigatória para salvar as alterações.</p>
                        <div class="input-group"><label>E-mail Dono da Conta</label><input type="email" id="user-novo-email" value="${r.escapeHTML(n)}" placeholder="Ex: gestor@escola.com" style="width:100%; border-left: 4px solid #f39c12;"></div>
                        <div class="input-group"><label>Login de Acesso</label><input type="text" id="user-novo-login" value="${r.escapeHTML(t)}" style="width:100%; border-left: 4px solid #3498db;"></div>
                        ${i(`user-senha-atual`,`Senha Atual (Obrigatória)`)}
                        ${i(`user-nova-senha`,`Nova Senha (Opcional)`)}
                        ${i(`user-conf-senha`,`Confirmar Nova Senha`)}
                        
                        <button class="btn-primary" style="width:100%; margin-top:10px; justify-content:center;" onclick="App.atualizarMeusDados()">ATUALIZAR DADOS</button>

                        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">🔒 Segurança Avançada</h4>
                            <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Use o sensor de rosto (FaceID) ou impressão digital para entrar.</p>
                            <button class="btn-primary" style="background: #27ae60; width: 100%; justify-content:center;" onclick="App.configurarBiometria()">👆 Ativar Biometria</button>
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
                                <tbody>${o.map(e=>`<tr><td style="padding:10px 0; border-top:1px solid #eee;">${r.escapeHTML(e.nome)} ${e.isDono?`👑`:``}</td><td style="padding:10px 0; border-top:1px solid #eee;">${r.escapeHTML(e.login)}</td><td style="padding:10px 0; border-top:1px solid #eee;"><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${r.escapeHTML(e.tipo)}</span></td><td style="text-align:right; border-top:1px solid #eee;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${e.id}', '${r.escapeHTML(e.nome)}', '${r.escapeHTML(e.login)}', '${r.escapeHTML(e.tipo)}')">✏️</button>${e.isDono?``:`<button class="btn-del" onclick="App.excluirUsuario('${e.id}')">🗑️</button>`}</td></tr>`).join(``)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>`}catch{e.innerHTML=`Erro ao carregar usuários.`}},atualizarMeusDados:async()=>{let e=document.getElementById(`user-novo-login`).value.trim(),t=document.getElementById(`user-novo-email`).value.trim(),n=document.getElementById(`user-senha-atual`).value,i=document.getElementById(`user-nova-senha`).value,a=document.getElementById(`user-conf-senha`).value;if(!e)return r.showToast(`O login não pode ficar em branco.`,`error`);if(!n)return r.showToast(`Digite sua senha atual para autorizar as alterações.`,`error`);if(i&&i!==a)return r.showToast(`A nova senha e a confirmação não conferem.`,`error`);let o=document.querySelector(`button[onclick="App.atualizarMeusDados()"]`),s=o.innerText;o.innerText=`Atualizando... ⏳`,o.disabled=!0;try{let a={novoLogin:e,novoEmail:t,senhaAtual:n};i&&(a.novaSenha=i);let o=await r.api(`/usuarios/atualizar-conta`,`PUT`,a);o&&o.success?(r.showToast(`Dados atualizados com sucesso! Faça login novamente.`,`success`),setTimeout(()=>r.logout(),2500)):r.showToast(o.error||`Erro ao atualizar os dados.`,`error`)}catch{r.showToast(`Erro de conexão.`,`error`)}finally{o.innerText=s,o.disabled=!1}},salvarNovoUsuario:async()=>{let e=document.getElementById(`new-nome`).value,t=document.getElementById(`new-login`).value,n=document.getElementById(`new-senha`).value,i=document.getElementById(`new-tipo`).value;if(!e||!t)return r.showToast(`Preencha nome e login.`,`error`);if(!r.idEdicaoUsuario&&!n)return r.showToast(`Digite uma senha.`,`error`);let a={nome:e,login:t,tipo:i};if(n&&(a.senha=n),!r.idEdicaoUsuario){if(!await r.verificarLimites(`usuario`))return;a.donoId=r.usuario.id}let o=document.getElementById(`btn-save-user`),s=o?o.innerText:`CRIAR USUÁRIO`;o&&(o.innerText=`Salvando... ⏳`,o.disabled=!0),document.body.style.cursor=`wait`;try{let e;e=r.idEdicaoUsuario?await r.api(`/usuarios/${r.idEdicaoUsuario}`,`PUT`,a):await r.api(`/usuarios`,`POST`,a),e&&e.error?r.showToast(e.error,`error`):(r.showToast(r.idEdicaoUsuario?`Atualizado com sucesso!`:`Criado com sucesso!`,`success`),r.renderizarMinhaConta())}catch{r.showToast(`Erro crítico ao salvar.`,`error`)}finally{o&&(o.innerText=s,o.disabled=!1),document.body.style.cursor=`default`}},preencherEdicaoUsuario:(e,t,n,i)=>{r.idEdicaoUsuario=e,document.getElementById(`new-nome`).value=t,document.getElementById(`new-login`).value=n,document.getElementById(`new-senha`).value=``,document.getElementById(`new-tipo`).value=i,document.getElementById(`titulo-form-user`).innerText=`Editar Usuário`,document.getElementById(`btn-save-user`).innerText=`ATUALIZAR`,document.getElementById(`btn-cancel-user`).style.display=`inline-flex`},cancelarEdicaoUsuario:()=>{r.idEdicaoUsuario=null,document.getElementById(`new-nome`).value=``,document.getElementById(`new-login`).value=``,document.getElementById(`new-senha`).value=``,document.getElementById(`new-tipo`).value=`Gestor`,document.getElementById(`titulo-form-user`).innerText=`Novo Usuário`,document.getElementById(`btn-save-user`).innerText=`CRIAR USUÁRIO`,document.getElementById(`btn-cancel-user`).style.display=`none`},excluirUsuario:e=>{r.abrirModalConfirmacao(`Apagar Utilizador?`,`Deseja remover o acesso deste membro da equipe? A ação não pode ser desfeita.`,async t=>{document.body.style.cursor=`wait`;try{let t=await r.api(`/usuarios/${e}`,`DELETE`);t&&t.error?r.showToast(t.error,`error`):(r.showToast(`Utilizador excluído.`,`success`),r.renderizarMinhaConta())}catch{r.showToast(`Erro ao excluir.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},renderizarBackup:()=>{r.setTitulo(`Backup de Dados`);let e=document.getElementById(`app-content`);e.innerHTML=`
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
        `},resetarSistema:async()=>{if(!confirm(`⚠️ ATENÇÃO EXTREMA: ISSO APAGARÁ TODOS OS DADOS DA ESCOLA. Deseja continuar?`))return;if(prompt(`Para confirmar a exclusão TOTAL, digite: APAGAR TUDO`)!==`APAGAR TUDO`)return r.showToast(`Ação cancelada. Código incorreto.`,`error`);let e=document.querySelector(`button[onclick="App.resetarSistema()"]`);e&&(e.disabled=!0,e.innerText=`⏳ APAGANDO...`),document.body.style.cursor=`wait`;try{for(let e of[`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`]){let t=await r.api(`/${e}`);Array.isArray(t)&&t.length>0&&await Promise.all(t.map(t=>r.api(`/${e}/${t.id}`,`DELETE`)))}await r.api(`/escola`,`PUT`,{nome:`Escola`,cnpj:``,foto:``,qrCodeImagem:``,banco:``,chavePix:``}),localStorage.removeItem(r.getTenantKey(`escola_perfil`)),alert(`✅ Sistema resetado com sucesso!`),location.reload()}catch{alert(`Erro ao limpar dados.`),e&&(e.disabled=!1,e.innerText=`🗑️ RESETAR TUDO`)}finally{document.body.style.cursor=`default`}},realizarDownloadBackup:async()=>{try{let e=[`escola`,`usuarios`,`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`],t={};for(let n of e)t[n]=await r.api(`/${n}`);let n=new Blob([JSON.stringify(t,null,2)],{type:`application/json`}),i=document.createElement(`a`);i.href=URL.createObjectURL(n),i.download=`backup_${new Date().toISOString().split(`T`)[0]}.json`,document.body.appendChild(i),i.click(),document.body.removeChild(i)}catch{alert(`Erro no backup.`)}},processarRestauracao:async()=>{let e=document.getElementById(`input-backup-file`);if(!e.files.length)return r.showToast(`Por favor, selecione o ficheiro de backup.`,`warning`);if(!confirm(`Tem a certeza absoluta que deseja substituir os dados atuais? Esta ação não pode ser desfeita.`))return;let t=document.querySelector(`button[onclick="App.processarRestauracao()"]`);t&&(t.disabled=!0,t.innerText=`A Ler ficheiro... ⏳`),document.body.style.cursor=`wait`;let n=new FileReader;n.onload=async e=>{try{let n=JSON.parse(e.target.result),i=[`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`,`usuarios`,`escola`],a=0,o=0;for(let e of i)n[e]&&(Array.isArray(n[e])?a+=n[e].length:a+=1);if(a===0){r.showToast(`O ficheiro de backup parece estar vazio.`,`warning`),t&&(t.disabled=!1,t.innerText=`⬆️ RESTAURAR DADOS`),document.body.style.cursor=`default`;return}for(let e of i)if(n[e])if(Array.isArray(n[e]))for(let i of n[e])await r.api(`/${e}`,`POST`,i),o++,t&&(t.innerText=`A Restaurar: ${o} de ${a} ⏳`);else await r.api(`/escola`,`PUT`,n[e]),o++,t&&(t.innerText=`A Restaurar: ${o} de ${a} ⏳`);r.showToast(`Dados restaurados com sucesso! A reiniciar...`,`success`),setTimeout(()=>location.reload(),1500)}catch(e){console.error(`Erro na restauração:`,e),r.showToast(`Ficheiro inválido ou erro de comunicação.`,`error`),t&&(t.disabled=!1,t.innerText=`⬆️ RESTAURAR DADOS`),document.body.style.cursor=`default`}},n.readAsText(e.files[0])},abrirModalConfirmacao:(e,t,n)=>{let r=document.getElementById(`modal-confirmacao-bonito`);r||(r=document.createElement(`div`),r.id=`modal-confirmacao-bonito`,r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:0; transition:opacity 0.3s ease;`,document.body.appendChild(r)),r.innerHTML=`
            <div style="background:#fff; padding:30px; border-radius:24px; width:90%; max-width:380px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform:scale(0.8); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="box-confirmacao-interno">
                <div style="width:80px; height:80px; border-radius:50%; background:#fdedec; color:#e74c3c; font-size:40px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto; border:4px solid #f9ebea;">🗑️</div>
                <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size:22px; font-weight:800;">${e}</h3>
                <p style="color:#7f8c8d; font-size:14px; margin-bottom:25px; line-height:1.5;">${t}</p>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <button onclick="document.getElementById('modal-confirmacao-bonito').style.opacity='0'; setTimeout(()=>document.getElementById('modal-confirmacao-bonito').style.display='none', 300);" style="flex:1; padding:12px; background:#f4f6f7; color:#7f8c8d; border:1px solid #d5dbdb; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; transition:background 0.2s;" onmouseover="this.style.background='#e5e8e8'" onmouseout="this.style.background='#f4f6f7'">Cancelar</button>
                    <button id="btn-confirmar-acao-bonita" style="flex:1; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow:0 4px 15px rgba(231,76,60,0.3); transition:background 0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Sim, Apagar</button>
                </div>
            </div>
        `,r.style.display=`flex`,setTimeout(()=>{r.style.opacity=`1`,document.getElementById(`box-confirmacao-interno`).style.transform=`scale(1)`},10),document.getElementById(`btn-confirmar-acao-bonita`).onclick=function(){let e=this;e.innerHTML=`A apagar... ⏳`,e.style.opacity=`0.8`,e.disabled=!0,n(r)}},dragState:{isDragging:!1,startX:0,startY:0,bgX:50,bgY:50},iniciarArraste:e=>{r.dragState.isDragging=!0,r.dragState.startX=e.type.includes(`touch`)?e.touches[0].clientX:e.clientX,r.dragState.startY=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,r.configTemp=r.configTemp||{};let t=(r.configTemp.imagemPosicao||`50% 50%`).split(` `);r.dragState.bgX=parseFloat(t[0])||50,r.dragState.bgY=parseFloat(t[1])||50;let n=document.getElementById(`preview-header-img`);n&&(n.style.cursor=`grabbing`),document.addEventListener(`mousemove`,r.arrastarImagem),document.addEventListener(`mouseup`,r.pararArraste),document.addEventListener(`touchmove`,r.arrastarImagem,{passive:!1}),document.addEventListener(`touchend`,r.pararArraste)},arrastarImagem:e=>{if(!r.dragState.isDragging)return;e.preventDefault();let t=e.type.includes(`touch`)?e.touches[0].clientX:e.clientX,n=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,i=t-r.dragState.startX,a=n-r.dragState.startY,o=.2,s=r.dragState.bgX-i*o,c=r.dragState.bgY-a*o;s=Math.max(0,Math.min(100,s)),c=Math.max(0,Math.min(100,c)),r.configTemp.imagemPosicao=`${s.toFixed(2)}% ${c.toFixed(2)}%`;let l=document.getElementById(`preview-header-img`);l&&(l.style.backgroundPosition=r.configTemp.imagemPosicao),r.dragState.startX=t,r.dragState.startY=n,r.dragState.bgX=s,r.dragState.bgY=c},pararArraste:()=>{if(r.dragState.isDragging){r.dragState.isDragging=!1;let e=document.getElementById(`preview-header-img`);e&&(e.style.cursor=`grab`),document.removeEventListener(`mousemove`,r.arrastarImagem),document.removeEventListener(`mouseup`,r.pararArraste),document.removeEventListener(`touchmove`,r.arrastarImagem),document.removeEventListener(`touchend`,r.pararArraste)}}}),document.addEventListener(`DOMContentLoaded`,r.init),window.addEventListener(`popstate`,e=>{if(r.usuario){let e=window.location.hash.replace(`#`,``);e?r.renderizarTela(e,!0):typeof r.renderizarInicio==`function`&&r.renderizarInicio()}}),document.addEventListener(`keydown`,function(e){e.key===`Escape`&&(r.fecharModal(),typeof r.fecharModalInst==`function`&&r.fecharModalInst())}),window.addEventListener(`focus`,()=>{let e=document.getElementById(`tela-sistema`);r.usuario&&e&&e.style.display!==`none`&&r.verificarNotificacoes()}),document.addEventListener(`click`,e=>{let t=document.querySelector(`.notification-container`);if(t&&!t.contains(e.target)){let e=document.getElementById(`noti-dropdown`);e&&e.classList.remove(`active`)}}),window.addEventListener(`offline`,()=>{let e=document.getElementById(`offline-banner`);e&&(e.style.display=`block`),typeof r.showToast==`function`&&r.showToast(`Sem ligação à Internet!`,`error`)}),window.addEventListener(`online`,()=>{let e=document.getElementById(`offline-banner`);e&&(e.style.display=`none`),typeof r.showToast==`function`&&r.showToast(`Ligação à Internet restaurada!`,`success`)});var i;window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),i=e;let t=document.getElementById(`pwa-install-banner`);t&&(t.style.display=`block`)});var a=document.getElementById(`pwa-btn-install`);a&&a.addEventListener(`click`,async()=>{let e=document.getElementById(`pwa-install-banner`);if(e.style.display=`none`,i){i.prompt();let{outcome:e}=await i.userChoice;i=null}});var o=document.getElementById(`pwa-btn-cancel`);o&&o.addEventListener(`click`,()=>{let e=document.getElementById(`pwa-install-banner`);e.style.display=`none`}),window.addEventListener(`appinstalled`,()=>{let e=document.getElementById(`pwa-install-banner`);e&&(e.style.display=`none`),i=null,typeof gtag==`function`&&gtag(`event`,`app_install`,{platform:`PWA Web`}),r.showToast(`App instalada com sucesso! 🎉`,`success`)}),window.App=window.App||{};var s=window.App;Object.assign(s,{mascaraCNPJ:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/^(\d{2})(\d)/,`$1.$2`),t=t.replace(/^(\d{2})\.(\d{3})(\d)/,`$1.$2.$3`),t=t.replace(/\.(\d{3})(\d)/,`.$1/$2`),t=t.replace(/(\d{4})(\d)/,`$1-$2`),e.value=t},mascaraCPF:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/(\d{3})(\d)/,`$1.$2`),t=t.replace(/(\d{3})(\d)/,`$1.$2`),t=t.replace(/(\d{3})(\d{1,2})$/,`$1-$2`),e.value=t},mascaraCelular:e=>{let t=e.value;t.startsWith(`+`)?e.value=`+`+t.replace(/\D/g,``):(t=t.replace(/\D/g,``),t=t.replace(/^(\d{2})(\d)/g,`($1) $2`),t=t.replace(/(\d)(\d{4})$/,`$1-$2`),e.value=t)},mascaraCEP:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/^(\d{5})(\d)/,`$1-$2`),e.value=t},mascaraValor:e=>{let t=e.value.replace(/\D/g,``);t=(t/100).toFixed(2)+``,e.value=t},showToast:(e,t=`info`)=>{let n=document.getElementById(`toast-container`);n||(n=s.criarElemento(`div`,[],{id:`toast-container`}),document.body.appendChild(n));let r=t===`success`?`✅`:t===`error`?`❌`:t===`warning`?`⚠️`:`ℹ️`,i=s.criarElemento(`div`,[`toast`,t]),a=s.criarElemento(`span`,[`toast-icon`],{},r),o=s.criarElemento(`span`,[],{},e);i.appendChild(a),i.appendChild(o),n.appendChild(i),setTimeout(()=>{i.style.animation=`fadeOut 0.5s ease forwards`,setTimeout(()=>i.remove(),500)},3e3)},setupMobileMenu:()=>{let e=document.getElementById(`tela-sistema`),t=e?e.querySelector(`header`):document.querySelector(`header`),n=document.querySelector(`.sidebar`);if(!t||!n){console.warn(`Menu mobile não iniciado: header ou sidebar não encontrado.`);return}if(!document.getElementById(`btn-mobile-menu`)){let e=document.createElement(`button`);e.id=`btn-mobile-menu`,e.className=`mobile-menu-btn`,e.type=`button`,e.innerHTML=`☰`,e.onclick=()=>{n.classList.toggle(`active`),(document.querySelector(`.mobile-overlay`)||s.criarOverlay()).classList.toggle(`active`)},t.insertBefore(e,t.firstChild)}s.criarOverlay()},criarOverlay:()=>{let e=document.querySelector(`.mobile-overlay`);if(e)return e;let t=document.createElement(`div`);return t.className=`mobile-overlay`,t.onclick=()=>{let e=document.querySelector(`.sidebar`);e&&e.classList.remove(`active`),t.classList.remove(`active`)},document.body.appendChild(t),t},UI:{card:(e,t,n,r=`100%`)=>`<div class="card" style="max-width: ${r}; margin: 0 auto;">${e?`<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${e}</h3>`:``}${t?`<p style="color:#666; margin-bottom:20px; font-size:13px;">${t}</p>`:``}${n}</div>`,input:(e,t,n=``,r=``,i=`text`,a=``)=>`<div class="input-group"><label>${e}</label><input type="${i}" id="${t}" value="${n}" placeholder="${r}" ${a}></div>`,botao:(e,t,n=`primary`,r=``)=>`<button class="${n===`primary`?`btn-primary`:n===`cancel`?`btn-cancel`:`btn-edit`}" style="width: auto; padding: 10px 20px;" onclick="${t}">${r} ${e}</button>`,colorPicker:(e,t,n)=>`<div class="theme-row"><label>${e}</label><input type="color" value="${(e=>{if(!e)return`#000000`;e=String(e).trim();let t={"#fff":`#ffffff`,"#000":`#000000`,"#333":`#333333`,"#666":`#666666`,"#999":`#999999`,"#ccc":`#cccccc`,"#eee":`#eeeeee`};return t[e.toLowerCase()]?t[e.toLowerCase()]:/^#[0-9A-Fa-f]{6}$/.test(e)?e:`#000000`})(t)}" oninput="App.previewCor('${n}', this.value)"></div>`}}),window.App=window.App||{};var c=window.App;Object.assign(c,{aplicarTemaSalvo:()=>{let e=JSON.parse(localStorage.getItem(c.getTenantKey(`escola_tema`)));if(e){let t=document.documentElement;e.sidebarBg&&t.style.setProperty(`--sidebar-bg`,e.sidebarBg),e.sidebarText&&t.style.setProperty(`--sidebar-text`,e.sidebarText),e.bodyBg&&t.style.setProperty(`--body-bg`,e.bodyBg),e.textMain&&t.style.setProperty(`--text-main`,e.textMain),e.cardBg&&t.style.setProperty(`--card-bg`,e.cardBg),e.cardText&&t.style.setProperty(`--card-text`,e.cardText),e.zoomLevel&&t.style.setProperty(`--zoom-level`,e.zoomLevel)}else document.documentElement.removeAttribute(`style`)},renderizarConfiguracoesAparencia:()=>{c.setTitulo(`Aparência do Sistema`);let e=document.getElementById(`app-content`),t=getComputedStyle(document.documentElement),n=JSON.parse(localStorage.getItem(c.getTenantKey(`escola_tema`)))||{},r={sbBg:t.getPropertyValue(`--sidebar-bg`).trim(),sbTxt:t.getPropertyValue(`--sidebar-text`).trim(),bdBg:t.getPropertyValue(`--body-bg`).trim(),txtMain:t.getPropertyValue(`--text-main`).trim(),cdBg:t.getPropertyValue(`--card-bg`).trim(),cdTxt:t.getPropertyValue(`--card-text`).trim(),zoomAtual:n.zoomLevel||`1`},i=JSON.parse(localStorage.getItem(c.getTenantKey(`escola_atalhos`)))||[],a=`<div class="theme-section"><h4 style="margin:0 0 15px 0;">1. Cores do Sistema</h4><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;"><div><div style="font-weight:bold; margin-bottom:10px;">Menu Lateral</div>${c.UI.colorPicker(`Fundo:`,r.sbBg,`--sidebar-bg`)}${c.UI.colorPicker(`Texto:`,r.sbTxt,`--sidebar-text`)}</div><div><div style="font-weight:bold; margin-bottom:10px;">Área Principal</div>${c.UI.colorPicker(`Fundo:`,r.bdBg,`--body-bg`)}${c.UI.colorPicker(`Texto:`,r.txtMain,`--text-main`)}</div><div><div style="font-weight:bold; margin-bottom:10px;">Dashboard / Cards</div>${c.UI.colorPicker(`Fundo:`,r.cdBg,`--card-bg`)}${c.UI.colorPicker(`Texto:`,r.cdTxt,`--card-text`)}</div></div></div>`,o=`<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">2. Atalhos no Dashboard</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Selecione os atalhos (Mínimo: 1 | Máximo: 8).</p><div class="shortcut-selector" style="display:flex; flex-wrap:wrap; gap:10px;">${(window.LISTA_FUNCIONALIDADES||[]).map(e=>`<label class="shortcut-item" style="background:#f9f9f9; padding:8px 12px; border-radius:6px; cursor:pointer;"><input type="checkbox" class="sc-check" value="${e.id}" ${i.includes(e.id)?`checked`:``} onchange="App.validarLimiteAtalhos(this)"> ${e.icon} ${e.nome}</label>`).join(``)}</div></div>`,s=`<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">3. Tamanho da Fonte (Zoom)</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Ajuste o tamanho geral para facilitar a leitura.</p><div class="input-group" style="max-width: 300px;"><select id="theme-zoom" style="font-weight:bold; cursor:pointer;" onchange="App.previewZoom(this.value)"><option value="0.9" ${r.zoomAtual===`0.9`?`selected`:``}>Pequena (90%)</option><option value="1" ${r.zoomAtual===`1`?`selected`:``}>Padrão (100%)</option><option value="1.1" ${r.zoomAtual===`1.1`?`selected`:``}>Maior (110%)</option></select></div></div>`,l=`<div style="display:flex; gap:10px; margin-top: 25px; flex-wrap:wrap;">${c.UI.botao(`💾 SALVAR ALTERAÇÕES`,`App.salvarTema()`,`primary`,``)}${c.UI.botao(`✖️ RESTAURAR PADRÃO`,`App.resetarTema()`,`cancel`,``)}</div>`;e.innerHTML=c.UI.card(`🎨 Personalizar Aparência`,`Personalize as cores, zoom e atalhos da tela inicial.`,a+s+o+l,`800px`)},previewCor:(e,t)=>{document.documentElement.style.setProperty(e,t)},previewZoom:e=>{document.documentElement.style.setProperty(`--zoom-level`,e)},validarLimiteAtalhos:e=>{document.querySelectorAll(`.sc-check:checked`).length>8&&(e.checked=!1,c.showToast(`O limite máximo é de 8 atalhos.`,`warning`))},salvarTema:()=>{let e=getComputedStyle(document.documentElement),t={sidebarBg:e.getPropertyValue(`--sidebar-bg`).trim(),sidebarText:e.getPropertyValue(`--sidebar-text`).trim(),bodyBg:e.getPropertyValue(`--body-bg`).trim(),textMain:e.getPropertyValue(`--text-main`).trim(),cardBg:e.getPropertyValue(`--card-bg`).trim(),cardText:e.getPropertyValue(`--card-text`).trim(),zoomLevel:document.getElementById(`theme-zoom`).value},n=Array.from(document.querySelectorAll(`.sc-check:checked`)).map(e=>e.value);if(n.length===0)return c.showToast(`Selecione pelo menos 1 atalho.`,`warning`);if(n.length>8)return c.showToast(`Máximo de 8 atalhos permitidos.`,`warning`);localStorage.setItem(c.getTenantKey(`escola_tema`),JSON.stringify(t)),localStorage.setItem(c.getTenantKey(`escola_atalhos`),JSON.stringify(n)),c.aplicarTemaSalvo(),c.showToast(`Configurações salvas com sucesso! 🎉`,`success`),setTimeout(()=>{c.renderizarInicio()},800)},resetarTema:()=>{confirm(`Deseja restaurar as cores e fontes padrão?`)&&(localStorage.removeItem(c.getTenantKey(`escola_tema`)),localStorage.setItem(c.getTenantKey(`escola_atalhos`),JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`])),document.documentElement.removeAttribute(`style`),c.showToast(`Aparência restaurada com sucesso! 🔄`,`success`),setTimeout(()=>{location.reload()},1e3))}}),window.App=window.App||{};var l=window.App;Object.assign(l,{mostrarTelaBloqueioLogin:e=>{document.documentElement.removeAttribute(`style`),document.getElementById(`tela-sistema`).style.display=`none`;let t=document.getElementById(`tela-login`);t&&(t.style.display=t.classList.contains(`login-wrapper`)?`flex`:`block`);let n=t.querySelectorAll(`.login-box, .box-login`);n.forEach(e=>{e.id!==`box-bloqueio-conta`&&(e.style.display=`none`)});let r=document.getElementById(`box-bloqueio-conta`);r||(r=document.createElement(`div`),r.id=`box-bloqueio-conta`,r.className=n.length>0?n[0].className:`login-box`,r.style.maxWidth=`400px`,r.style.margin=`0 auto`,r.style.background=`#fff`,r.style.padding=`30px`,r.style.borderRadius=`12px`,r.style.boxShadow=`0 10px 25px rgba(0,0,0,0.1)`,t.appendChild(r)),r.style.display=`block`,r.innerHTML=`
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
        `},sairDaTelaDeBloqueio:()=>{l.logout()},ativarPinLogin:async e=>{e&&e.preventDefault();let t=document.getElementById(`input-pin-login`);if(!t)return;let n=t.value.trim().toUpperCase();if(!n)return l.showToast(`Por favor, insira o PIN recebido no e-mail.`,`warning`);let r=e.target,i=r.innerText;r&&(r.innerText=`A validar... ⏳`,r.disabled=!0);try{let e=await l.api(`/escola/validar-pin`,`POST`,{pin:n}),t=e&&e.success?e.plano:null;if(!t)if(n.includes(`PRE`))t=`Premium`;else if(n.includes(`ESS`))t=`Essencial`;else if(n.includes(`PRO`))t=`Profissional`;else{l.showToast(e.error||`PIN inválido ou formato incorreto.`,`error`),r&&(r.innerText=i,r.disabled=!1);return}let a=await l.api(`/escola`)||{},o=new Date;o.setDate(o.getDate()+30),await l.api(`/escola`,`PUT`,{...a,plano:t,pinUsado:n,dataExpiracao:o.toISOString()}),localStorage.setItem(l.getTenantKey(`escola_plano`),t);let s=JSON.parse(localStorage.getItem(l.getTenantKey(`escola_perfil`)))||{};s.plano=t,s.dataExpiracao=o.toISOString(),localStorage.setItem(l.getTenantKey(`escola_perfil`),JSON.stringify(s)),l.atualizarUIHeader(s),l.showToast(`🎉 PIN validado! Sistema desbloqueado por mais 30 dias.`,`success`);let c=document.getElementById(`box-bloqueio-conta`);c&&(c.style.display=`none`),l.entrarNoSistema()}catch{l.showToast(`Erro ao comunicar com a base de dados.`,`error`)}finally{r&&(r.innerText=i,r.disabled=!1)}},init:async()=>{localStorage.removeItem(`escola_tema`),localStorage.removeItem(`escola_atalhos`),localStorage.removeItem(`escola_perfil`);let e=new URLSearchParams(window.location.search).get(`reset`);if(e){document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`,setTimeout(()=>{l.abrirModalNovaSenha(e)},300);return}let t=localStorage.getItem(`usuario_logado`),n=localStorage.getItem(`escola_bio_id`);if(t){l.usuario=JSON.parse(t),l.aplicarTemaSalvo();let e=l.getTenantKey(`escola_atalhos`);localStorage.getItem(e)||localStorage.setItem(e,JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]));let r=await l.api(`/escola`);if(!r||r.error){if(r?.error===`Sessão não encontrada.`||r?.error===`Sessão expirada.`){await l.logout();return}r=JSON.parse(localStorage.getItem(l.getTenantKey(`escola_perfil`)))||{}}if(l.verificarBloqueioGeral(r))document.documentElement.removeAttribute(`style`),l.mostrarTelaBloqueioLogin(r);else if(n&&window.PublicKeyCredential)document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`,document.getElementById(`btn-biometria`).style.display=`block`,setTimeout(()=>{l.entrarComBiometria()},600);else{let e=window.location.hash.replace(`#`,``);e&&e!==`login`?(l.entrarNoSistema(),setTimeout(()=>l.renderizarTela(e,!0),100)):l.entrarNoSistema()}}else document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`;let r=document.getElementById(`data-hoje`);r&&(r.innerText=new Date().toLocaleDateString(`pt-BR`)),l.setupMobileMenu();let i=document.getElementById(`login-pass`);if(i&&i.addEventListener(`keypress`,function(e){e.key===`Enter`&&l.fazerLogin()}),!l.motorTempoRealLigado){let e=()=>{let e=document.getElementById(`tela-sistema`);l.usuario&&e&&e.style.display!==`none`&&(l.verificarNotificacoes(),l.carregarDadosEscola())};setTimeout(e,2e3),setInterval(e,1e4),l.motorTempoRealLigado=!0}},fazerLogin:async()=>{let e=document.getElementById(`login-user`).value.trim(),t=document.getElementById(`login-pass`).value.trim();if(!e||!t)return l.showToast(`Preencha utilizador e senha`,`warning`);let n=document.querySelector(`#tela-login button[type="submit"]`),r=n.innerText;n.innerText=`Autenticando... ⏳`,n.disabled=!0;try{let n=l.getDeviceId(),r=await l.api(`/auth/login`,`POST`,{login:e,senha:t,deviceId:n});if(r&&r.success){l.usuario=r.usuario,localStorage.setItem(`usuario_logado`,JSON.stringify(r.usuario)),typeof gtag==`function`&&gtag(`event`,`login`,{method:`Sistema PTT`}),l.aplicarTemaSalvo();let e=l.getTenantKey(`escola_atalhos`);localStorage.getItem(e)||localStorage.setItem(e,JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]));let t=await l.api(`/escola`);if(!t||t.error){if(t?.error===`Sessão não encontrada.`||t?.error===`Sessão expirada.`){await l.logout();return}t=JSON.parse(localStorage.getItem(l.getTenantKey(`escola_perfil`)))||{}}if(l.verificarBloqueioGeral(t))l.mostrarTelaBloqueioLogin(t);else{let e=window.location.hash.replace(`#`,``);e&&e!==`login`?(l.entrarNoSistema(),setTimeout(()=>l.renderizarTela(e,!0),100)):l.entrarNoSistema(),l.showToast(`Bem-vindo ao sistema!`,`success`)}}else l.showToast(r.error||`Login ou senha incorretos`,`error`)}catch{l.showToast(`Erro ao conectar no servidor`,`error`)}finally{n.innerText=r,n.disabled=!1}},entrarNoSistema:async()=>{document.getElementById(`tela-login`)?.style.setProperty(`display`,`none`),document.getElementById(`tela-sistema`)?.style.setProperty(`display`,`flex`);let e=document.getElementById(`user-name`);e&&l.usuario&&(e.innerText=l.usuario.nome||l.usuario.login),l.aplicarPermissoesDeUsuario(),await l.carregarDadosEscola(),typeof l.setupMobileMenu==`function`&&l.setupMobileMenu(),l.iniciarRadar();let t=document.getElementById(`tela-sistema`);t&&t.style.display!==`none`&&l.renderizarInicio()},logout:async()=>{l.radarAtivo&&clearInterval(l.radarAtivo);try{typeof l.api==`function`?await l.api(`/auth/logout`,`POST`):await fetch(`${CONFIG.API_URL}/auth/logout`,{method:`POST`,credentials:`include`})}catch{console.warn(`Logout backend ignorado localmente.`)}localStorage.clear(),sessionStorage.clear(),l.usuario=null,l.listaCache=[],window.location.href=window.location.pathname},toggleSenhaLogin:()=>{let e=document.getElementById(`login-pass`);e&&(e.type=e.type===`password`?`text`:`password`)},abrirModalRecuperacao:e=>{e&&e.preventDefault();let t=document.getElementById(`modal-recuperacao-senha`);t||(t=document.createElement(`div`),t.id=`modal-recuperacao-senha`,t.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;`,t.innerHTML=`
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:400px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔐</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Recuperar Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Insira o e-mail registado na sua conta. Enviaremos um link seguro.</p>
                    <input type="email" id="recuperar-email-input" placeholder="O seu e-mail de acesso" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.enviarRecuperacaoSenha()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✉️ Enviar Link</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-recuperacao-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar</button>
                </div>
            `,document.body.appendChild(t)),document.getElementById(`recuperar-email-input`).value=``,t.style.display=`flex`},enviarRecuperacaoSenha:async()=>{let e=document.getElementById(`recuperar-email-input`)?.value.trim();if(!e)return l.showToast(`Informe o e-mail de acesso.`,`warning`);let t=document.querySelector(`#modal-recuperacao-senha .btn-primary`),n=t.innerText;t.innerText=`Enviando... ⏳`,t.disabled=!0;try{let t=await l.api(`/auth/recuperar-senha`,`POST`,{email:e});t&&t.success?(l.showToast(t.message||`Link enviado com sucesso.`,`success`),document.getElementById(`modal-recuperacao-senha`).style.display=`none`):l.showToast(t.error||`Erro ao solicitar.`,`error`)}catch(e){console.error(`ERRO NO FRONTEND:`,e),l.showToast(`Erro de comunicação.`,`error`)}finally{t.innerText=n,t.disabled=!1}},abrirModalNovaSenha:e=>{let t=document.getElementById(`modal-nova-senha`);t||(t=document.createElement(`div`),t.id=`modal-nova-senha`,t.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:10000;`,t.innerHTML=`
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:420px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔑</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Criar Nova Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Digite a sua nova senha de acesso.</p>
                    <input type="password" id="nova-senha-reset" placeholder="Nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:12px; text-align:center;">
                    <input type="password" id="confirma-senha-reset" placeholder="Confirmar nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.confirmarNovaSenhaReset()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✅ Salvar Senha</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-nova-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar</button>
                </div>
            `,document.body.appendChild(t)),l.tokenResetSenha=e,t.style.display=`flex`},confirmarNovaSenhaReset:async()=>{let e=document.getElementById(`nova-senha-reset`)?.value||``,t=document.getElementById(`confirma-senha-reset`)?.value||``;if(e.length<6)return l.showToast(`Mínimo de 6 caracteres.`,`warning`);if(e!==t)return l.showToast(`As senhas não conferem.`,`warning`);let n=document.querySelector(`#modal-nova-senha .btn-primary`),r=n.innerText;n.innerText=`Salvando... ⏳`,n.disabled=!0;try{let t=await l.api(`/auth/redefinir-senha`,`POST`,{token:l.tokenResetSenha,novaSenha:e});if(t&&t.success){l.showToast(`Senha redefinida! Faça login agora.`,`success`),document.getElementById(`modal-nova-senha`).style.display=`none`,l.tokenResetSenha=null;let e=window.location.origin+window.location.pathname;window.history.replaceState({},document.title,e)}else l.showToast(t.error||`Erro ao redefinir.`,`error`)}catch{l.showToast(`Erro de comunicação.`,`error`)}finally{n.innerText=r,n.disabled=!1}},bufferToBase64:function(e){for(var t=new Uint8Array(e),n=``,r=0;r<t.byteLength;r++)n+=String.fromCharCode(t[r]);return btoa(n)},base64ToBuffer:function(e){for(var t=atob(e),n=t.length,r=new Uint8Array(n),i=0;i<n;i++)r[i]=t.charCodeAt(i);return r},configurarBiometria:async()=>{if(!window.PublicKeyCredential)return l.showToast(`Não suportado.`,`error`);try{l.exibirOverlayBiometria(`Configurar Acesso`,`Use o sensor digital para registrar este aparelho.`);let e=window.crypto.getRandomValues(new Uint8Array(32)),t=window.crypto.getRandomValues(new Uint8Array(16)),n=await navigator.credentials.create({publicKey:{challenge:e,rp:{name:`App Gestão PTT`},user:{id:t,name:l.usuario.login,displayName:l.usuario.nome},pubKeyCredParams:[{type:`public-key`,alg:-7},{type:`public-key`,alg:-257}],authenticatorSelection:{authenticatorAttachment:`platform`,userVerification:`required`},timeout:6e4}});n&&(localStorage.setItem(`escola_bio_id`,l.bufferToBase64(n.rawId)),l.removerOverlayBiometria(),l.showToast(`✅ Biometria ativada!`,`success`),l.renderizarMinhaConta())}catch{l.removerOverlayBiometria(),l.showToast(`Cancelado.`,`warning`)}},entrarComBiometria:async()=>{let e=localStorage.getItem(`escola_bio_id`);if(e)try{l.exibirOverlayBiometria(`Autenticação`,`Aguardando biometria...`);let t=window.crypto.getRandomValues(new Uint8Array(32)),n=l.base64ToBuffer(e);await navigator.credentials.get({publicKey:{challenge:t,allowCredentials:[{type:`public-key`,id:n}],userVerification:`required`,timeout:6e4}})&&(l.removerOverlayBiometria(),l.showToast(`🔓 Bem-vindo!`,`success`),l.entrarNoSistema())}catch{l.removerOverlayBiometria(),l.showToast(`Use sua senha.`,`info`)}},exibirOverlayBiometria:(e,t)=>{let n=document.getElementById(`bio-overlay-premium`);n||(n=document.createElement(`div`),n.id=`bio-overlay-premium`,n.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); display:flex; justify-content:center; align-items:center; z-index:10000;`,document.body.appendChild(n)),n.innerHTML=`
            <div style="background:white; padding:40px; border-radius:28px; text-align:center; width:85%; max-width:320px; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                <div style="font-size:65px; margin-bottom:20px;">👤</div>
                <h2 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${e}</h2>
                <p style="color:#7f8c8d; font-size:14px; line-height:1.5; margin-bottom:25px;">${t}</p>
                <div style="font-size:11px; color:#3498db; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">App Gestão PTT</div>
            </div>
        `,n.style.display=`flex`},removerOverlayBiometria:()=>{let e=document.getElementById(`bio-overlay-premium`);e&&(e.style.display=`none`)}});var u=t({cobrarWhatsAppDashboard:()=>h,renderizarInicio:()=>m});window.App=window.App||{};var d=window.App,f=(e,t,n)=>`
    <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">${n}</span>
            <span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">${e}</span>
        </div>
        <span style="font-size:20px; font-weight:bold; color:#3498db;">${t}</span>
    </div>
`,p=(e,t,n,r)=>`
    <div style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div>
            <div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${d.escapeHTML(e)}</div>
            <div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${t} • R$ ${n}</div>
        </div>
        <button onclick="App.cobrarWhatsAppDashboard('${d.escapeHTML(e)}', '${r}', '${t}', '${n}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <span>💬</span> Cobrar
        </button>
    </div>
`,m=async()=>{d.verificarNotificacoes(),d.setTitulo(`Visão Geral`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando painel de métricas...</p>`;try{let[t,n,r,i]=await Promise.all([d.api(`/alunos`),d.api(`/financeiro`),d.api(`/turmas`),d.api(`/cursos`)]),a=(Array.isArray(t)?t:[]).filter(e=>!e.status||e.status===`Ativo`),o=Array.isArray(n)?n:[],s=Array.isArray(r)?r:[],c=Array.isArray(i)?i:[],l=new Date,u=l.getMonth()+1,m=l.getFullYear(),h=a.map(e=>e.id),g=o.filter(e=>{if(!e.vencimento)return!1;let t=e.vencimento.split(`-`);return parseInt(t[1])===u&&parseInt(t[0])===m}),_=g.filter(e=>e.status===`Pago`).reduce((e,t)=>e+parseFloat(t.valor),0),v=g.filter(e=>e.status!==`Pago`&&h.includes(e.idAluno)).reduce((e,t)=>e+parseFloat(t.valor),0),y=o.filter(e=>e.status===`Pendente`&&new Date(e.vencimento+`T00:00:00`)<l&&h.includes(e.idAluno)).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),b=e=>e.toLocaleString(`pt-BR`,{minimumFractionDigits:2,maximumFractionDigits:2}),x=d.usuario?d.usuario.tipo:`Gestor`,S=x!==`Professor`,C=y.length===0?`<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>`:y.map(e=>{let t=(a.find(t=>t.id===e.idAluno)||{}).whatsapp||``,n=e.vencimento.split(`-`).reverse().join(`/`),r=b(parseFloat(e.valor));return p(e.alunoNome||`Desconhecido`,n,r,t)}).join(``),w=JSON.parse(localStorage.getItem(d.getTenantKey(`escola_atalhos`)));(!w||!Array.isArray(w)||w.length===0)&&(w=[`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]);let T=w.map(e=>{let t=(window.LISTA_FUNCIONALIDADES||[]).find(t=>t.id===e);return t&&t.roles.includes(x)?`<div class="shortcut-btn" onclick="${t.acao}"><div>${t.icon}</div><span>${t.nome}</span></div>`:``}).join(``);if(e.innerHTML=`
            <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${d.escapeHTML(d.usuario?d.usuario.nome:`Gestor`)}! 👋</h3>
            <div class="dashboard-grid">
                <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                    ${f(`Total Alunos`,a.length,`🎓`)}
                    ${f(`Total Turmas`,s.length,`🏫`)}
                    ${f(`Total Cursos`,c.length,`📚`)}
                </div>
                ${S?`
                <div class="stat-card card-green" style="display:block; position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                        <div class="stat-info"><h4>Receita (${u}/${m})</h4><p style="color:#27ae60; font-size:20px;">R$ ${b(_)}</p></div>
                        <div class="stat-icon" style="font-size:24px;">💰</div>
                    </div>
                    <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                    <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${b(v)}</span></div>
                </div>
                <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; height:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;">
                        <h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${y.length})</h4>
                    </div>
                    <div class="lista-atrasados" style="flex:1; overflow-y:auto; max-height: 300px; display:flex; flex-direction:column; gap:10px; padding-right:5px;">
                        ${C}
                    </div>
                </div>
                `:``}
            </div>
            <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
            <div class="shortcuts-grid">${T||`<p style="color:#666;">Nenhum atalho selecionado ou permitido.</p>`}</div>`,S){let e=document.getElementById(`graficoFinanceiro`);e&&(_>0||v>0)?new Chart(e,{type:`doughnut`,data:{labels:[`Recebido`,`Pendente`],datasets:[{data:[_,v],backgroundColor:[`#27ae60`,`#e74c3c`],borderWidth:0,hoverOffset:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},cutout:`75%`}}):e&&new Chart(e,{type:`doughnut`,data:{datasets:[{data:[1],backgroundColor:[`#eee`],borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{enabled:!1}},cutout:`75%`}})}}catch(t){console.error(t),e.innerHTML=`<p>Erro ao carregar dashboard.</p>`}},h=(e,t,n,r)=>{if(!d.verificarPermissao(`whatsapp`))return;if(!t||t.trim()===``||t===`undefined`){d.showToast(`Este aluno não tem um número de WhatsApp registado no sistema!`,`error`);return}let i=t.replace(/\D/g,``);t.trim().startsWith(`+`)?i=t.replace(/\D/g,``):(i.length===10||i.length===11)&&(i=`55`+i);let a=JSON.parse(localStorage.getItem(d.getTenantKey(`escola_perfil`)))||{},o=a.nome||`Nossa Instituição`,s=a.chavePix||`Não informada`,c=`🔔 *LEMBRETE DE VENCIMENTO*\nOlá, ${e}!\n\nConsta no nosso sistema que a sua mensalidade venceu no dia ${n}. Para realizar o pagamento de forma rápida, basta enviar o valor de *R$ ${r}* para a chave PIX abaixo:\n\n*Instituição:* ${o}\n*Banco:* ${a.banco||`Não informado`}\n*Chave PIX:* ${s}\n\n*Obs.:* _Após o pagamento, por favor, envie o comprovante por aqui para podermos dar baixa no sistema._\n\n🙏 Agradecemos desde já e desejamos-lhe um excelente dia! 😉✅`;window.open(`https://wa.me/${i}?text=${encodeURIComponent(c)}`,`_blank`)};window.App=window.App||{};var g=window.App;Object.assign(g,{verificarNotificacoes:async()=>{try{let e=g.usuario?g.usuario.tipo:`Gestor`,t=await g.api(`/sistema/notificacoes/nao-lidas`),n=await g.api(`/alunos`),r=await g.api(`/eventos`),i=await g.api(`/financeiro`),a=await g.api(`/planejamentos`),o=await g.api(`/estoques`),s=await g.api(`/escola`);if(Array.isArray(n)&&(n=n.filter(e=>!e.status||e.status===`Ativo`)),g.entidadeAtual===`aluno`&&Array.isArray(n)&&Array.isArray(g.listaCache)){let e=g.listaCache.map(e=>e.id);if(n.some(t=>!e.includes(t.id))){g.showToast(`Novo aluno recebido pela matrícula online.`,`success`),g.listaCache=n;let e=document.getElementById(`input-busca`);e&&(e.value=``),typeof g.filtrarTabelaReativa==`function`&&g.filtrarTabelaReativa()}}let c=[];Array.isArray(t)&&t.filter(e=>!e.lida).sort((e,t)=>new Date(t.dataCriacao||0)-new Date(e.dataCriacao||0)).slice(0,10).forEach(e=>{c.push({icon:e.tipo===`matricula_contrato`?`📝`:`🔔`,texto:`<b>${g.escapeHTML(e.titulo||`Nova notificação`)}</b><br>${g.escapeHTML(e.mensagem||``)}<br><small>Origem: ${g.escapeHTML(e.refLink||`Direto`)}</small>`,prioridade:1,acao:`App.renderizarContratos()`})});let l=new Date,u=l.getFullYear(),d=String(l.getMonth()+1).padStart(2,`0`),f=String(l.getDate()).padStart(2,`0`),p=`${u}-${d}-${f}`,m=new Date(l);m.setDate(m.getDate()+1);let h=`${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,`0`)}-${String(m.getDate()).padStart(2,`0`)}`;if(s&&e===`Gestor`){let e=s.plano||`Teste`,t=l.getTime(),n=0;if(s.dataExpiracao){let e=new Date(s.dataExpiracao).getTime();n=Math.ceil((e-t)/(1e3*60*60*24))}else{let r=s.dataCriacao?new Date(s.dataCriacao).getTime():t,i=Math.floor(Math.abs(t-r)/(1e3*60*60*24));n=(e===`Teste`?7:30)-i}e!==`Premium`&&e!==`Bloqueado`&&(n<=3&&n>0?c.push({icon:`⏳`,texto:`<b>Atenção Gestor:</b> O seu plano <b>${e}</b> expira em <b>${n} dia(s)</b>! Renove agora.`,acao:`App.renderizarTela('plano')`}):n<=0&&c.push({icon:`🚫`,texto:`<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar usando o sistema.`,acao:`App.renderizarTela('plano')`}))}if(Array.isArray(n)&&n.forEach(e=>{e.nascimento&&e.nascimento.substring(5)===`${d}-${f}`&&c.push({icon:`🎂`,texto:`Hoje é aniversário de <b>${g.escapeHTML(e.nome)}</b>! Clique para ver.`,acao:`App.renderizarLista('aluno')`})}),Array.isArray(n)&&n.forEach(e=>{e.dataMatricula&&e.dataMatricula.startsWith(p)&&c.push({icon:`🎉`,texto:`<b>Nova Matrícula!</b> O aluno <b>${g.escapeHTML(e.nome)}</b> foi registado hoje.`,acao:`App.renderizarContratos()`})}),e!==`Professor`&&Array.isArray(i)){let e=i.filter(e=>e.vencimento===p&&e.status===`Pendente`);e.length>0&&c.push({icon:`💲`,texto:`<b>Caixa de Hoje:</b> Existem <b>${e.length}</b> mensalidades a vencer no dia de hoje.`,acao:`App.renderizarTela('mensalidades')`})}Array.isArray(r)&&r.forEach(e=>{e.data===p?c.push({icon:`🚨`,texto:`<b>Hoje:</b> ${g.escapeHTML(e.tipo)} - ${g.escapeHTML(e.descricao)}`,acao:`App.renderizarTela('calendario')`}):e.data===h&&c.push({icon:`⏳`,texto:`<b>Amanhã:</b> ${g.escapeHTML(e.tipo)} - ${g.escapeHTML(e.descricao)}`,acao:`App.renderizarTela('calendario')`})}),e!==`Professor`&&(Array.isArray(i)&&Array.isArray(n)&&Array.isArray(a)&&n.forEach(t=>{let n=a.find(e=>e.idAluno===t.id),r=0,o=null;if(i.forEach(e=>{e.idAluno===t.id&&e.status!==`Cancelado`&&(!e.idCarne||!e.idCarne.includes(`VENDA`))&&((!o||e.vencimento>o)&&(o=e.vencimento),e.vencimento>=p&&r++)}),o&&o.startsWith(`${u}-${d}`)&&c.push({icon:`🎓`,texto:`A última mensalidade de <b>${g.escapeHTML(t.nome)}</b> vence este mês. Clique para gerar renovação!`,acao:`App.renderizarTela('mensalidades')`}),n&&n.aulas){let i=n.aulas.filter(e=>!e.visto).length;if(i>0){let a=4;if(n.aulas.length>1){let e=n.aulas[0].data.split(`/`),t=n.aulas[1].data.split(`/`),r=new Date(`${e[2]}-${e[1]}-${e[0]}`),i=new Date(`${t[2]}-${t[1]}-${t[0]}`),o=Math.abs((i-r)/(1e3*60*60*24));o<=4?a=8:o<=2&&(a=12)}Math.ceil(i/a)>r&&e===`Gestor`&&c.push({icon:`⚠️`,texto:`<b>Faturação Perdida!</b> <b>${g.escapeHTML(t.nome)}</b> precisa de ${i} aulas, mas não tem parcelas suficientes.`,acao:`App.renderizarTela('mensalidades')`})}}}),Array.isArray(o)&&o.forEach(e=>{let t=parseInt(e.quantidade)||0;t<=(parseInt(e.quantidadeMinima)||0)&&c.push({icon:`📦`,texto:`<b>Estoque Baixo:</b> Restam apenas ${t} unidades de <b>${g.escapeHTML(e.nome)}</b>!`,acao:`App.renderizarLista('estoque')`})}));let _=document.getElementById(`noti-badge`),v=document.getElementById(`noti-list`);if(c.length>0){_&&(_.innerText=c.length,_.style.display=`block`);let e=c.length>0?`
        <div style="padding:8px; border-bottom:1px solid #eee;">
            <button
                onclick="App.marcarNotificacoesComoLidas()"
                style="
                    width:100%;
                    border:none;
                    background:#f4f6f7;
                    color:#2c3e50;
                    padding:10px;
                    border-radius:8px;
                    font-size:12px;
                    font-weight:bold;
                    cursor:pointer;
                    transition:0.2s;
                "
                onmouseover="this.style.background='#e5e7e9'"
                onmouseout="this.style.background='#f4f6f7'"
            >
                ✅ Marcar notificações como lidas
            </button>
        </div>
    `:``;v&&(v.innerHTML=e+c.map(e=>`
                    <div class="noti-item" style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='transparent'" onclick="${e.acao}; App.toggleNotificacoes();">
                        <span class="noti-icon">${e.icon}</span>
                        <div>${e.texto}</div>
                    </div>
                `).join(``))}else _&&(_.style.display=`none`),v&&(v.innerHTML=`<div class="noti-item" style="justify-content:center; color:#999; padding: 30px 15px;">Nenhum alerta pendente.<br>Tudo tranquilo! 🎉</div>`)}catch(e){console.error(`Erro nas notificações`,e)}},toggleNotificacoes:()=>{let e=document.getElementById(`noti-dropdown`);e&&e.classList.toggle(`active`)},marcarNotificacoesComoLidas:async()=>{try{let e=await g.api(`/sistema/notificacoes/nao-lidas`);if(!Array.isArray(e))return g.showToast(`Não foi possível carregar notificações.`,`error`);let t=e.filter(e=>!e.lida);if(t.length===0)return g.showToast(`Não há notificações novas.`,`info`);await Promise.all(t.map(e=>g.api(`/sistema/notificacoes/lida/${e.id}`,`PUT`))),g.showToast(`Notificações marcadas como lidas.`,`success`),await g.verificarNotificacoes()}catch(e){console.error(e),g.showToast(`Erro ao marcar notificações.`,`error`)}},iniciarRadar:()=>{g.radarAtivo&&clearInterval(g.radarAtivo);let e=async()=>{g.usuario&&typeof g.verificarNotificacoes==`function`&&await g.verificarNotificacoes()};e(),g.radarAtivo=setInterval(e,1e4)}}),window.App=window.App||{},window.CONFIG=window.CONFIG||{};var _=window.App;window.CONFIG,Object.assign(_,{abrirVisualizacaoContrato:async function(e){let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`A abrir Ficha Completa... ⏳`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:30px; color:#666;">A extrair todos os dados do aluno e contrato da base de dados...</p>`;let n=document.querySelector(`.btn-confirm`);n&&(n.style.display=`none`);try{let t=await _.api(`/contratos/${e}`);if(!t||t.error)throw Error(t?t.error:`Documento não encontrado`);let r=t.nomeAluno||t.nome||`Aluno não identificado`,i=t.cpf||`Não informado`,a=t.rg||`Não informado`,o=t.nascimento||`Não informada`;if(o!==`Não informada`&&o.includes(`-`)){let e=o.split(`-`);e.length===3&&(o=`${e[2]}/${e[1]}/${e[0]}`)}let s=t.sexo||`Não informado`,c=t.profissao||`Não informada`,l=t.email||`Não informado`,u=t.whatsapp||`Não informado`,d=t.enderecoCompleto||`Não informado`,f=t.curso||`Não informado`,p=t.turma||`Não informada`,m=t.planoCurso||`Não informado`,h=t.diaVencimento||`Não informado`,g=t.horarioPreferencia||`Não informado`,v=t.resp_nome||`O Próprio / Não informado`,y=t.resp_parentesco||`Não informado`,b=t.resp_cpf||`Não informado`,x=t.resp_zap||`Não informado`,S=t.conteudoHTML?_.sanitizeHTML(_.unescapeHTML(t.conteudoHTML)):`<p>O contrato não possui texto legível.</p>`,C=t.dataHoraRegistro||t.dataCriacao||t.dataHora||t.createdAt?new Date(t.dataHoraRegistro||t.dataCriacao||t.dataHora||t.createdAt).toLocaleString(`pt-BR`):`Data não registada`;document.getElementById(`modal-titulo`).innerText=`Matrícula: ${r}`,document.getElementById(`modal-form-content`).innerHTML=`
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
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Nome:</b> ${v}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Parentesco:</b> ${y}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>CPF:</b> ${b}</td>
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>WhatsApp:</b> ${x}</td>
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
                        ${S}
                    </div>
                    
                    <div style="padding:15px; background:#eafaf1; border:1px solid #27ae60; text-align:center; font-size:12px; border-radius:6px; page-break-inside: avoid;">
                        <p style="margin:0 0 5px 0; color:#333;">Pelo presente instrumento, as partes concordam com todos os termos acima descritos.</p>
                        ✅ <b>ACEITE DIGITAL REGISTRADO COM VALIDADE JURÍDICA:</b><br>
                        <span style="font-size:16px; font-weight:bold; color:#1e8449; display:block; margin-top:5px;">📅 ${C}</span>
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
            `,n&&(n.style.display=`inline-flex`,n.style.background=`#2c3e50`,n.innerHTML=`🖨️ Imprimir Ficha`,n.setAttribute(`onclick`,`App.imprimirContrato()`))}catch(e){console.error(`Falha ao abrir contrato:`,e),document.getElementById(`modal-titulo`).innerText=`Erro de Leitura`,document.getElementById(`modal-form-content`).innerHTML=`<p style="color:red; text-align:center;">Não foi possível carregar a ficha completa.<br><small>${e.message}</small></p>`}},renderizarHubContratos:()=>{_.setTitulo(`Hub de Contratos e Matrículas`);let e=document.getElementById(`app-content`);e.innerHTML=`
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
                    <p>Selecione uma das opções acima para gerenciar suas matrículas e contratos.</p>
                </div>
            </div>
        `},mostrarAreaLinks:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar links... ⏳</p>`;try{let t=await _.api(`/escola`);if(!t||t.error||!t.escolaId){e.innerHTML=`
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
                            <strong>${_.escapeHTML(e.nome||`Link sem nome`)}</strong>
                            <p style="font-size:12px; color:#777; margin:6px 0;">
                                Criado em: ${_.escapeHTML(e.criadoEm||`-`)}
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
            `}},criarLinkMatriculaCampanha:async()=>{let e=document.getElementById(`nome-novo-link-matricula`)?.value?.trim();if(!e)return _.showToast(`Digite um nome para o link.`,`warning`);try{let t=await _.api(`/escola`);if(!t||t.error||!t.escolaId)return _.showToast(`Não foi possível carregar os dados da instituição.`,`error`);let n=Array.isArray(t.linksMatricula)?t.linksMatricula:[],r={id:`REF_`+Date.now(),nome:e,criadoEm:new Date().toLocaleString(`pt-BR`)},i={...t,linksMatricula:[r,...n]},a=await _.api(`/escola`,`PUT`,i);if(a&&a.error)return _.showToast(a.error,`error`);_.showToast(`Link personalizado criado com sucesso!`,`success`),_.mostrarAreaLinks()}catch(e){console.error(e),_.showToast(`Erro ao criar link personalizado.`,`error`)}},excluirLinkMatricula:e=>{_.abrirModalConfirmacao(`🗑️ Excluir Link Personalizado?`,`Tem a certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.`,async t=>{document.body.style.cursor=`wait`;try{let t=await _.api(`/escola`)||{};t.linksMatricula&&(t.linksMatricula=t.linksMatricula.filter(t=>t.id!==e),await _.api(`/escola`,`PUT`,t),_.showToast(`Link excluído com sucesso!`,`success`),_.mostrarAreaLinks())}catch(e){console.error(e),_.showToast(`Erro ao excluir o link.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},renderizarContratos:async()=>{let e=document.getElementById(`area-dinamica-hub`)||document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar o cofre... ⏳</p>`;try{let t=await _.api(`/contratos`),n=Array.isArray(t)?t:[];if(n.length===0){e.innerHTML=`<div style="text-align:center; padding:40px;"><span style="font-size:50px;">🗄️</span><h3 style="color:#666;">Cofre Vazio</h3><p style="font-size:13px; color:#999;">Os recibos imutáveis aparecerão aqui quando os alunos preencherem a matrícula.</p></div>`;return}n.sort((e,t)=>new Date(t.dataHoraRegistro||t.dataCriacao)-new Date(e.dataHoraRegistro||e.dataCriacao)),_.contratosSelecionados=[];let r=(e,t,n)=>{let r=e.dataHoraRegistro||e.dataCriacao||new Date().toISOString(),i=new Date(r).toLocaleString(`pt-BR`),a=_.escapeHTML(e.nomeAluno||e.nome||`Aluno Indefinido`);return`
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
            </div>`,_.listaCacheContratos=n}catch(t){console.error(t),e.innerHTML=`<p style='color:red;'>Erro ao carregar cofre.</p>`}},imprimirContrato:()=>{let e=JSON.parse(localStorage.getItem(_.getTenantKey(`escola_perfil`)))||{},t=e.nome||`Instituição de Ensino`,n=e.cnpj?`CNPJ: ${e.cnpj}`:``,r=e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?`<img src="${e.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">`:``,i=document.getElementById(`area-impressao-contrato`).cloneNode(!0),a=document.createElement(`iframe`);a.style.position=`absolute`,a.style.top=`-10000px`,a.style.width=`800px`,a.style.height=`1000px`,a.style.border=`none`,document.body.appendChild(a);let o=a.contentWindow.document;o.open(),o.write(`
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
                        <h2>${_.escapeHTML(t)}</h2>
                        <p>${_.escapeHTML(n)}</p>
                    </div>
                </div>
                ${i.innerHTML}
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento impresso em ${new Date().toLocaleString(`pt-BR`)} pelo SISTEMA PTT
                </div>
            </body>
            </html>
        `),o.close(),setTimeout(()=>{a.contentWindow.focus(),a.contentWindow.print(),setTimeout(()=>{document.body.removeChild(a)},1500)},800)},excluirContrato:e=>{_.abrirModalConfirmacao(`Apagar Contrato Oficial?`,`Tem a certeza que deseja apagar este documento assinado? Esta ação é irreversível.`,async t=>{document.body.style.cursor=`wait`;try{let t=await _.api(`/contratos/${e}`,`DELETE`);t&&t.error?_.showToast(t.error,`error`):(_.showToast(`Contrato apagado com sucesso!`,`success`),_.renderizarContratos())}catch{_.showToast(`Erro ao apagar o contrato.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},toggleSelecaoContrato:e=>{_.contratosSelecionados||=[],e.checked?_.contratosSelecionados.includes(e.value)||_.contratosSelecionados.push(e.value):_.contratosSelecionados=_.contratosSelecionados.filter(t=>t!==e.value),_.atualizarBarraExclusaoMassa()},selecionarTodosContratos:()=>{let e=document.querySelectorAll(`.chk-contrato`),t=!0;e.forEach(e=>{e.checked||(t=!1)}),_.contratosSelecionados=[],e.forEach(e=>{e.checked=!t,t||_.contratosSelecionados.push(e.value)}),_.atualizarBarraExclusaoMassa()},atualizarBarraExclusaoMassa:()=>{let e=document.getElementById(`barra-exclusao-massa`),t=document.getElementById(`texto-exclusao-massa`);if(!e||!t)return;let n=_.contratosSelecionados?_.contratosSelecionados.length:0;n>0?(e.style.display=`flex`,t.innerText=`${n} contrato(s) selecionado(s)`):e.style.display=`none`},excluirContratosMassa:()=>{let e=_.contratosSelecionados||[];e.length!==0&&_.abrirModalConfirmacao(`🗑️ Excluir em Massa?`,`Tem a certeza absoluta que deseja apagar <b>${e.length}</b> contrato(s)?<br><br><span style="color:red; font-size:12px;">⚠️ Esta ação é irreversível e excluirá os registos permanentemente do banco de dados.</span>`,async t=>{document.body.style.cursor=`wait`;try{let t=0,n=e.map(e=>_.api(`/contratos/${e}`,`DELETE`));(await Promise.allSettled(n)).forEach(e=>{e.status===`fulfilled`&&e.value&&!e.value.error&&t++}),t===e.length?_.showToast(`✅ ${t} contratos apagados com sucesso!`,`success`):_.showToast(`⚠️ Excluídos: ${t} de ${e.length}. Atualize a página e tente de novo.`,`warning`),_.contratosSelecionados=[],_.renderizarContratos()}catch(e){console.error(e),_.showToast(`Erro crítico durante a exclusão em massa.`,`error`)}finally{document.body.style.cursor=`default`,t.style.opacity=`0`,setTimeout(()=>t.style.display=`none`,300)}})},renderizarConfiguradorMatricula:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do contrato... ⏳</p>`;try{let t=await _.api(`/escola`)||{},n={imagemHeader:`https://placehold.co/1000x500?text=Sua+Imagem+de+Cabecalho`,imagemPosicao:`50% 50%`,tituloHeader:`Matrícula Digital`,descHeader:`Preencha os dados abaixo com atenção para garantir a sua vaga.`,opcoesPlano:`Padrão, Intensivo, Personalizado`,opcoesVencimento:`08, 20`,horarios:``,textoContrato:`TERMO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS<br><br>CLÁUSULA PRIMEIRA...`},r=t.configMatricula||{},i={...r};delete i.online,i.tituloHeader||(i={...n}),i.textoContrato&&=_.unescapeHTML(i.textoContrato);let a=r.online||{...n,tituloHeader:`Matrícula Digital EAD`,opcoesPlano:`Curso Online VIP, Curso Online Básico`,horarios:`100% Online`};a.textoContrato&&=_.unescapeHTML(a.textoContrato),_.configTemp={presencial:i,online:a},_.abaAtiva=`presencial`,e.innerHTML=`
                <div style="display:flex; gap:10px; margin-bottom: 20px; justify-content: center; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <button id="btn-aba-presencial" onclick="App.alternarAbaConfig('presencial')" style="flex:1; max-width: 200px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; background: #2c3e50; color: white;">🏫 Contrato Presencial</button>
                    <button id="btn-aba-online" onclick="App.alternarAbaConfig('online')" style="flex:1; max-width: 200px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; background: #e0e6ed; color: #2c3e50;">💻 Contrato Online</button>
                </div>
                <div id="container-config-interno"></div>
            `,_.alternarAbaConfig(`presencial`)}catch(t){console.error(t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o configurador.</p>`}},alternarAbaConfig:e=>{_.abaAtiva=e;let t=document.getElementById(`btn-aba-presencial`),n=document.getElementById(`btn-aba-online`);e===`presencial`?(t&&(t.style.background=`#2c3e50`,t.style.color=`white`),n&&(n.style.background=`#e0e6ed`,n.style.color=`#2c3e50`)):(n&&(n.style.background=`#27ae60`,n.style.color=`white`),t&&(t.style.background=`#e0e6ed`,t.style.color=`#2c3e50`));let r=document.getElementById(`container-config-interno`);r.innerHTML=`
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
        `,_.atualizarPreviewConfigurador()},atualizarPreviewConfigurador:()=>{let e=document.getElementById(`preview-word-doc`),t=_.configTemp[_.abaAtiva];e&&(e.innerHTML=`
                <div id="preview-header-img" 
                     onmousedown="App.iniciarArraste(event)" 
                     ontouchstart="App.iniciarArraste(event)"
                     style="width:100%; height:250px; background:url('${t.imagemHeader}') no-repeat; background-size: cover; background-position: ${t.imagemPosicao}; border-radius:8px 8px 0 0; cursor:grab; position:relative; overflow:hidden; user-select:none;">
                     <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px; pointer-events:none; backdrop-filter:blur(2px); border:1px solid rgba(255,255,255,0.2);">🖐️ Arraste para reposicionar</div>
                </div>
                <div style="padding: 25px; text-align: center; border-bottom: 2px dashed #eee;">
                    <h2 style="color:#2c3e50; margin:0 0 10px 0;">${_.escapeHTML(t.tituloHeader)}</h2>
                    <p style="color:#7f8c8d; font-size:14px; margin:0;">${_.escapeHTML(t.descHeader)}</p>
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
            `)},editarConfig:e=>{let t=_.configTemp[_.abaAtiva];if(e===`imagem`){let e=document.createElement(`input`);e.type=`file`,e.accept=`image/*`,e.onchange=e=>{let t=e.target.files[0];t&&(_.showToast(`A processar e otimizar a imagem... ⏳`,`info`),_.otimizarImagem(t,1e3,e=>{_.configTemp[_.abaAtiva].imagemHeader=e,_.atualizarPreviewConfigurador(),_.showToast(`Imagem aplicada com sucesso!`,`success`)}))},e.click()}else if(e===`titulo`||e===`descricao`||e===`opcoes`){let n=(e,t,n)=>{let r=document.createElement(`div`);r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;`;let i=document.createElement(`div`);i.style.cssText=`background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;`,i.innerHTML=`
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
                     <input type="text" id="inputTitulo" class="modal-custom-input" placeholder="Ex: Contrato de Prestação de Serviços" value="${t.tituloHeader||``}">`,e=>{_.configTemp[_.abaAtiva].tituloHeader=e.querySelector(`#inputTitulo`).value,_.atualizarPreviewConfigurador()}):e===`descricao`?n(`📝 Editar Descrição`,`<label class="modal-custom-label">Subtítulo ou Descrição:</label>
                     <textarea id="inputDescricao" class="modal-custom-input" style="height:110px; resize:vertical;" placeholder="Digite aqui uma breve descrição...">${t.descHeader||``}</textarea>`,e=>{_.configTemp[_.abaAtiva].descHeader=e.querySelector(`#inputDescricao`).value,_.atualizarPreviewConfigurador()}):e===`opcoes`&&n(`⚙️ Dados Complementares`,`<div style="margin-bottom:16px;">
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
                     </div>`,e=>{_.configTemp[_.abaAtiva].opcoesPlano=e.querySelector(`#inputCursos`).value,_.configTemp[_.abaAtiva].opcoesVencimento=e.querySelector(`#inputDias`).value,_.configTemp[_.abaAtiva].horarios=e.querySelector(`#inputHorarios`).value,_.atualizarPreviewConfigurador()})}else if(e===`contrato`){let e=document.getElementById(`modal-overlay`);e&&(e.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Editar Texto do Contrato (${_.abaAtiva===`presencial`?`Presencial`:`Online`})`,document.getElementById(`modal-form-content`).innerHTML=`
                <div id="editor-contrato-quill" style="height:350px; background:#fff; font-family:sans-serif; line-height:1.5;">${_.sanitizeHTML(t.textoContrato||``)}</div>
            `,setTimeout(()=>{window.quillContrato=new Quill(`#editor-contrato-quill`,{theme:`snow`,modules:{toolbar:[[`bold`,`italic`,`underline`],[{list:`ordered`},{list:`bullet`}],[{align:[]}],[{size:[`small`,!1,`large`,`huge`]}],[`clean`]]}})},100);let n=document.querySelector(`.btn-confirm`);n.style.display=`inline-flex`,n.innerHTML=`Aplicar ao Preview`,n.onclick=()=>{_.configTemp[_.abaAtiva].textoContrato=window.quillContrato.root.innerHTML,_.atualizarPreviewConfigurador(),_.fecharModal()}}},iniciarArraste:e=>{let t=document.getElementById(`preview-header-img`);if(!t)return;e.preventDefault();let n=!0,[r,i]=(_.configTemp[_.abaAtiva].imagemPosicao||`50% 50%`).split(` `).map(e=>parseFloat(e)||50),a=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,o=i,s=e=>{if(!n)return;i=o-((e.type.includes(`touch`)?e.touches[0].clientY:e.clientY)-a)*.2,i<0&&(i=0),i>100&&(i=100);let r=`50% ${i}%`;t.style.backgroundPosition=r},c=()=>{n=!1,_.configTemp[_.abaAtiva].imagemPosicao=t.style.backgroundPosition,document.removeEventListener(`mousemove`,s),document.removeEventListener(`mouseup`,c),document.removeEventListener(`touchmove`,s),document.removeEventListener(`touchend`,c)};document.addEventListener(`mousemove`,s),document.addEventListener(`mouseup`,c),document.addEventListener(`touchmove`,s,{passive:!1}),document.addEventListener(`touchend`,c)},salvarConfiguradorMatricula:async()=>{let e=document.querySelector(`button[onclick="App.salvarConfiguradorMatricula()"]`),t=e?e.innerHTML:`💾 Salvar Tudo`;e&&(e.innerHTML=`A salvar... ⏳`,e.disabled=!0,e.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let e=await _.api(`/escola`)||{};e.configMatricula={..._.configTemp.presencial,online:_.configTemp.online},await _.api(`/escola`,`PUT`,e),_.showToast(`Configurações salvas para Presencial e Online!`,`success`)}catch{_.showToast(`Erro ao guardar as configurações.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1,e.style.opacity=`1`),document.body.style.cursor=`default`}},renderizarConfiguradorHub:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do Hub... ⏳</p>`;try{let t=await _.api(`/escola`)||{},n={tituloHeader:`Bem-vindo(a) à Área de Matrículas`,descHeader:`Estamos muito felizes em tê-lo(a) connosco! Por favor, selecione abaixo a modalidade do curso que pretende frequentar.`,iconePresencial:`🏫`,tituloPresencial:`Curso Presencial`,descPresencial:`Aulas presenciais na nossa unidade física. Acesso completo à infraestrutura, laboratórios e contacto direto com os nossos professores.`,btnPresencial:`Matrícula Presencial`,iconeOnline:`💻`,tituloOnline:`Curso Online (EAD)`,descOnline:`Estude a partir de casa e ao seu próprio ritmo. Acesso imediato à plataforma virtual de aprendizagem, materiais e suporte 100% online.`,btnOnline:`Matrícula Online`};_.configHubTemp=t.configHub?{...n,...t.configHub}:{...n},e.innerHTML=`
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
            `,_.atualizarPreviewHub()}catch(t){console.error(t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o configurador do Hub.</p>`}},atualizarPreviewHub:()=>{let e=document.getElementById(`preview-hub-page`);if(!e)return;let t=_.configHubTemp;e.innerHTML=`
            <div style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px;">👁️ Pré-visualização ao Vivo</div>
            
            <div style="text-align: center; padding: 20px 10px 20px; max-width: 600px; margin: 20px auto 0;">
                <h1 style="color: #2c3e50; font-size: 1.8rem; margin-bottom: 10px; margin-top:0;">${_.escapeHTML(t.tituloHeader)}</h1>
                <p style="color: #666; font-size: 0.95rem; line-height: 1.5;">${_.escapeHTML(t.descHeader)}</p>
            </div>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                <div style="background: #fff; border-radius: 20px; padding: 25px 20px; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 45px; margin-bottom: 10px;">${_.escapeHTML(t.iconePresencial)}</div>
                    <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem; margin-top:0;">${_.escapeHTML(t.tituloPresencial)}</h2>
                    <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 0.85rem; flex-grow: 1;">${_.escapeHTML(t.descPresencial)}</p>
                    <div style="background-color: #3498db; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem;">${_.escapeHTML(t.btnPresencial)}</div>
                </div>

                <div style="background: #fff; border-radius: 20px; padding: 25px 20px; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 45px; margin-bottom: 10px;">${_.escapeHTML(t.iconeOnline)}</div>
                    <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem; margin-top:0;">${_.escapeHTML(t.tituloOnline)}</h2>
                    <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 0.85rem; flex-grow: 1;">${_.escapeHTML(t.descOnline)}</p>
                    <div style="background-color: #3498db; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem;">${_.escapeHTML(t.btnOnline)}</div>
                </div>
            </div>
        `},editarConfigHub:e=>{let t=_.configHubTemp,n=(e,t,n)=>{let r=document.createElement(`div`);r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;`;let i=document.createElement(`div`);i.style.cssText=`background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;`,i.innerHTML=`
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
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${t.descHeader||``}</textarea>`,e=>{_.configHubTemp.tituloHeader=e.querySelector(`#iTitulo`).value,_.configHubTemp.descHeader=e.querySelector(`#iDesc`).value,_.atualizarPreviewHub()}):e===`presencial`?n(`🏫 Cartão Presencial`,`<label class="modal-custom-label">Ícone (Emoji):</label>
                 <input type="text" id="iIcone" class="modal-custom-input" value="${t.iconePresencial||``}" maxlength="5" style="width: 80px; text-align: center; font-size: 20px;">
                 <label class="modal-custom-label">Título do Cartão:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${t.tituloPresencial||``}">
                 <label class="modal-custom-label">Descrição Curta:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${t.descPresencial||``}</textarea>
                 <label class="modal-custom-label">Texto do Botão:</label>
                 <input type="text" id="iBtn" class="modal-custom-input" value="${t.btnPresencial||``}">`,e=>{_.configHubTemp.iconePresencial=e.querySelector(`#iIcone`).value,_.configHubTemp.tituloPresencial=e.querySelector(`#iTitulo`).value,_.configHubTemp.descPresencial=e.querySelector(`#iDesc`).value,_.configHubTemp.btnPresencial=e.querySelector(`#iBtn`).value,_.atualizarPreviewHub()}):e===`online`&&n(`💻 Cartão Online`,`<label class="modal-custom-label">Ícone (Emoji):</label>
                 <input type="text" id="iIcone" class="modal-custom-input" value="${t.iconeOnline||``}" maxlength="5" style="width: 80px; text-align: center; font-size: 20px;">
                 <label class="modal-custom-label">Título do Cartão:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${t.tituloOnline||``}">
                 <label class="modal-custom-label">Descrição Curta:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${t.descOnline||``}</textarea>
                 <label class="modal-custom-label">Texto do Botão:</label>
                 <input type="text" id="iBtn" class="modal-custom-input" value="${t.btnOnline||``}">`,e=>{_.configHubTemp.iconeOnline=e.querySelector(`#iIcone`).value,_.configHubTemp.tituloOnline=e.querySelector(`#iTitulo`).value,_.configHubTemp.descOnline=e.querySelector(`#iDesc`).value,_.configHubTemp.btnOnline=e.querySelector(`#iBtn`).value,_.atualizarPreviewHub()})},salvarConfiguradorHub:async()=>{let e=document.querySelector(`button[onclick="App.salvarConfiguradorHub()"]`),t=e?e.innerHTML:`💾 Salvar Hub`;e&&(e.innerHTML=`A salvar... ⏳`,e.disabled=!0,e.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let e=await _.api(`/escola`)||{};e.configHub=_.configHubTemp,await _.api(`/escola`,`PUT`,e),_.showToast(`Vitrine salva e pronta para os alunos!`,`success`)}catch{_.showToast(`Erro ao guardar as configurações da vitrine.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1,e.style.opacity=`1`),document.body.style.cursor=`default`}}});var v=`http://localhost:3000`,y=[],b={escapeHTML:e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),escapeJS:e=>e==null?``:String(e).replace(/\\/g,`\\\\`).replace(/'/g,`\\'`),init:()=>{if(sessionStorage.getItem(`token_master`)){let e=document.getElementById(`login-screen`),t=document.getElementById(`dashboard`);e&&t&&(e.style.display=`none`,t.style.display=`flex`,b.carregarDados())}},showToast:(e,t=`success`)=>{let n=document.getElementById(`toast-container`),r=document.createElement(`div`);r.innerHTML=`<span>${t===`success`?`✅`:t===`error`?`❌`:`ℹ️`}</span> <span>${b.escapeHTML(e)}</span>`,r.style.background=`var(--card)`,r.style.borderLeft=`4px solid ${t===`success`?`var(--success)`:t===`error`?`var(--danger)`:`var(--warning)`}`,r.style.color=`white`,r.style.padding=`15px 20px`,r.style.borderRadius=`6px`,r.style.boxShadow=`0 10px 15px rgba(0,0,0,0.5)`,r.style.display=`flex`,r.style.alignItems=`center`,r.style.gap=`10px`,r.style.fontSize=`14px`,r.style.animation=`fadeIn 0.3s ease`,n.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,setTimeout(()=>r.remove(),300)},3e3)},login:async()=>{let e=document.getElementById(`master-pwd`).value;if(!e)return b.showToast(`Digite a senha.`,`warning`);let t=document.querySelector(`.login-box button`),n=t.innerText;t.innerText=`Autenticando... ⏳`,t.disabled=!0;let r=document.getElementById(`login-error`);r.style.display=`none`;try{let t=await fetch(`${v}/master/login`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({senha:e})}),n;try{n=await t.json()}catch{n={error:`Erro crítico no servidor.`}}t.ok&&n.success&&n.token?(sessionStorage.setItem(`token_master`,n.token),document.getElementById(`master-pwd`).value=``,b.init()):(r.innerText=n.error||`Acesso negado!`,r.style.display=`block`)}catch{b.showToast(`Erro de rede. O servidor pode estar a iniciar, aguarde...`,`error`)}finally{t.innerText=n,t.disabled=!1}},logout:()=>{sessionStorage.removeItem(`token_master`),window.location.reload()},carregarDados:async()=>{let e=sessionStorage.getItem(`token_master`);try{let t=`${v}/master/ativacoes?t=${new Date().getTime()}`,n=await fetch(t,{headers:{Authorization:`Bearer ${e}`},cache:`no-store`});if(n.status===401||n.status===403)return b.logout();let r=await n.json();if(Array.isArray(r)){y=r,document.getElementById(`kpi-total`).innerText=r.length,document.getElementById(`kpi-ativas`).innerText=r.filter(e=>e.status===`Verificado`||e.status===`Ativo`).length,document.getElementById(`kpi-pendentes`).innerText=r.filter(e=>e.status===`Pendente`||e.status===`Aguardando Ativação`||e.status===`Aguardando`).length,document.getElementById(`kpi-bloqueados`).innerText=r.filter(e=>e.status===`Bloqueado`).length;let e=document.getElementById(`busca-tabela-escolas`)||document.getElementById(`pesquisa-admin`);e&&(e.value=``),b.desenharTabela(y),b.carregarNotificacoes()}}catch(e){console.error(`🚨 Erro no carregarDados:`,e)}},toggleNotificacoes:()=>{let e=document.getElementById(`dropdown-notificacoes`);e.style.display===`none`||e.style.display===``?(e.style.display=`block`,e.style.animation=`fadeIn 0.2s ease`):e.style.display=`none`},carregarNotificacoes:async()=>{let e=sessionStorage.getItem(`token_master`);try{let t=await fetch(`${v}/master/notificacoes?t=${new Date().getTime()}`,{headers:{Authorization:`Bearer ${e}`},cache:`no-store`});if(t.ok){let e=await t.json(),n=document.getElementById(`badge-notificacao`),r=document.getElementById(`lista-notificacoes`);e.length>0?(n.innerText=e.length,n.style.display=`block`,r.innerHTML=e.map(e=>{let t=`🔔`,n=`#94a3b8`,r=`transparent`;return e.tipo===`perigo`&&(t=`🚨`,n=`var(--danger)`,r=`rgba(239, 68, 68, 0.05)`),e.tipo===`aviso`&&(t=`⚠️`,n=`var(--warning)`,r=`rgba(245, 158, 11, 0.05)`),e.tipo===`info`&&(t=`💡`,n=`#3b82f6`,r=`rgba(59, 130, 246, 0.05)`),`
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
                    </div>`)}}catch(e){console.error(`Erro ao carregar notificações`,e)}},desenharTabela:e=>{let t=document.getElementById(`tabela-clientes`);if(t.innerHTML=``,!e||e.length===0){t.innerHTML=`<tr><td colspan="4" style="padding:20px; text-align:center; color:#64748b;">Nenhuma escola encontrada.</td></tr>`;return}e.forEach(e=>{try{let n=(e.email||``).trim().toLowerCase(),r=b.escapeHTML(n),i=b.escapeJS(n),a=e.pinAtivacao?b.escapeJS(e.pinAtivacao):``,o=b.escapeHTML(e.status||`Pendente`),s=`color:var(--warning); background:rgba(245, 158, 11, 0.2);`;o===`Verificado`||o===`Ativo`?s=`color:var(--success); background:rgba(16, 185, 129, 0.2);`:o===`Bloqueado`&&(s=`color:var(--danger); background:rgba(239, 68, 68, 0.2);`);let c=``;c=o===`Verificado`||o===`Ativo`?`<span style="color:var(--success); font-weight:bold;">✅ ATIVO</span>`:a?`<span style="font-weight:bold; letter-spacing: 1px;">${b.escapeHTML(e.pinAtivacao)}</span>`:`<span style="color:#f59e0b; font-weight:bold; font-size:11px;">⚠️ AGUARDANDO PIN</span>`;let l=e.plano||`Pendente`;if(l===`Aguardando`||l===`Teste`||l===`Pendente`)if(e.pinAtivacao){let t=String(e.pinAtivacao).toUpperCase();l=t.includes(`PRE`)?`Premium`:t.includes(`PRO`)?`Profissional`:t.includes(`ESS`)?`Essencial`:`Liberado`}else l=`Pendente`;let u=b.escapeJS(l),d=`bg-gray`,f=l;l===`Essencial`?d=`plan-essencial`:l===`Profissional`?d=`plan-profissional`:l===`Premium`?d=`plan-premium`:l===`Liberado`&&(d=`plan-liberado`,f=`💎 Liberado`);let p=``;p=a?`
                        <button onclick="Admin.abrirModalMudarPlano('${i}', '${u}')" style="background:var(--warning); color:#0f172a; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; cursor:pointer; transition:0.2s;">🔄 Plano</button>
                        <button onclick="window.open('${`https://wa.me/?text=${encodeURIComponent(`Olá! O seu PIN de acesso ao sistema escolar é: `+a)}`}', '_blank')" style="background:#25D366; color:white; border:none; cursor:pointer; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;">💬 Zap</button>
                        <button onclick="Admin.copiarAcesso('${i}', '${a}', '${u===`Liberado`?`VIP`:u}')" style="background:#475569; color:white; border:none; cursor:pointer; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;">📋 Copiar</button>
                    `:`
                        <button onclick="Admin.abrirModalMudarPlano('${i}', 'Profissional')" style="background:#10b981; color:white; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; cursor:pointer; transition:0.2s;">✅ Aprovar / Gerar PIN</button>
                    `,p+=`
                    <button onclick="Admin.bloquear('${i}')" style="background:var(--danger); color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; transition:0.2s;">🚫 Bloq</button>
                    <button onclick="Admin.excluir('${i}')" style="background:#000000; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; transition:0.2s; margin-left: 5px;">🗑️ Excluir</button>
                `;let m=document.createElement(`tr`);m.style.borderBottom=`1px solid #334155`,m.style.transition=`background 0.2s`,m.onmouseover=()=>m.style.background=`#1e293b`,m.onmouseout=()=>m.style.background=`transparent`,m.innerHTML=`
                    <td style="padding:15px; font-weight:bold; max-width: 250px; word-break: break-all; white-space: normal;">${r}</td>
                    <td style="padding:15px;"><span class="${d}">${b.escapeHTML(f)}</span></td>
                    <td style="padding:15px; font-family:monospace;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; ${s}">${o}</span>
                            ${c}
                        </div>
                    </td>
                    <td style="padding:15px; text-align:right; white-space: nowrap;">${p}</td>
                `,t.appendChild(m)}catch(t){console.error(`🚨 ERRO AO DESENHAR A LINHA:`,e.email,t)}})},filtrarTabela:e=>{if(!e||e.trim()===``){b.desenharTabela(y);return}let t=e.toLowerCase().trim(),n=y.filter(e=>{let n=e.email?String(e.email).toLowerCase():``,r=e.plano?String(e.plano).toLowerCase():``,i=e.status?String(e.status).toLowerCase():``,a=e.pinAtivacao?String(e.pinAtivacao).toLowerCase():``;return n.includes(t)||r.includes(t)||i.includes(t)||a.includes(t)});b.desenharTabela(n)},abrirModalMudarPlano:(e,t)=>{document.getElementById(`mp-email`).value=e;let n=document.getElementById(`mp-plano`);for(let e=0;e<n.options.length;e++)n.options[e].value===t&&(n.selectedIndex=e);document.getElementById(`modal-mudar-plano`).style.display=`flex`},fecharModalMudarPlano:()=>{document.getElementById(`modal-mudar-plano`).style.display=`none`},confirmarMudancaPlano:async()=>{let e=document.getElementById(`mp-email`).value.trim().toLowerCase(),t=document.getElementById(`mp-plano`).value,n=sessionStorage.getItem(`token_master`),r=document.getElementById(`btn-confirmar-mp`);r.innerText=`A atualizar... ⏳`,r.disabled=!0;try{let r=await(await fetch(`${v}/master/gerar-pin`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n}`},body:JSON.stringify({email:e,plano:t})})).json();r.success?(b.showToast(`Plano atualizado para ${t}! Novo PIN gerado: ${r.pin}`,`success`),b.fecharModalMudarPlano(),b.carregarDados()):b.showToast(r.error||`Erro ao gerar novo PIN da API.`,`error`)}catch{b.showToast(`Erro de comunicação com o servidor.`,`error`)}finally{r.innerText=`Atualizar Plano`,r.disabled=!1}},abrirModalVip:()=>{document.getElementById(`vip-email`).value=``,document.getElementById(`vip-zap`).value=``,document.getElementById(`vip-plano`).value=`Essencial`,document.getElementById(`vip-form-area`).style.display=`block`,document.getElementById(`vip-result-area`).style.display=`none`,document.getElementById(`modal-vip`).style.display=`flex`},fecharModalVip:()=>{document.getElementById(`modal-vip`).style.display=`none`},gerarAcessoVip:async()=>{let e=document.getElementById(`vip-email`).value.trim().toLowerCase(),t=document.getElementById(`vip-zap`).value.replace(/\D/g,``),n=document.getElementById(`vip-plano`).value;if(!e)return b.showToast(`E-mail é obrigatório!`,`error`);let r=document.getElementById(`btn-gerar-vip`);r.innerText=`A processar... ⏳`,r.disabled=!0;let i=sessionStorage.getItem(`token_master`);try{let r=await(await fetch(`${v}/master/gerar-pin`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${i}`},body:JSON.stringify({email:e,plano:n})})).json();if(r.success){let i=r.pin,a=window.location.origin+window.location.pathname.replace(`admin.html`,`index.html`),o=`Olá! A sua conta VIP foi criada no plano *${n.toUpperCase()}* 🚀\n\n*Para ativar o seu sistema agora mesmo:* \n1. Aceda ao portal: ${a}\n2. Clique em "Nova Instituição" e coloque o seu e-mail: *${e}*\n3. O sistema enviará um código de segurança rápido para o seu e-mail.\n4. Insira esse código junto com o seu PIN de Ativação VIP: ${i}\n\nPronto! O seu sistema será destravado automaticamente. Boas vendas!`,s=t?`https://wa.me/${t.length<=11?`55`+t:t}?text=${encodeURIComponent(o)}`:`https://wa.me/?text=${encodeURIComponent(o)}`;document.getElementById(`vip-pin-display`).innerText=i,document.getElementById(`vip-zap-link`).href=s,document.getElementById(`vip-form-area`).style.display=`none`,document.getElementById(`vip-result-area`).style.display=`block`,b.showToast(`Acesso VIP gerado!`,`success`),b.carregarDados()}else b.showToast(r.error||`Erro ao gerar PIN da API.`,`error`)}catch{b.showToast(`Erro de comunicação com o servidor.`,`error`)}finally{r.innerText=`Gerar PIN e Acesso Direto`,r.disabled=!1}},copiarAcesso:(e,t,n)=>{let r=window.location.origin+window.location.pathname.replace(`admin.html`,`index.html`),i=`Olá! A sua conta foi atualizada para o plano *${n.toUpperCase()}* 🚀\n\n*Para ativar:* \n1. Aceda a: ${r}\n2. Vá ao menu "💎 Meu Plano"\n3. Insira o PIN Exclusivo: ${t}\n\nQualquer dúvida, estamos à disposição!`;if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(i).then(()=>{b.showToast(`Copiado! Só colar no WhatsApp do cliente.`,`success`)}).catch(e=>{b.showToast(`Erro ao copiar.`,`error`)});else{let e=document.createElement(`textarea`);e.value=i,e.style.position=`fixed`,e.style.top=`0`,e.style.left=`-9999px`,document.body.appendChild(e),e.focus(),e.select();try{document.execCommand(`copy`),b.showToast(`Copiado! Só colar no WhatsApp do cliente.`,`success`)}catch{b.showToast(`Erro ao copiar. Use o botão do WhatsApp.`,`error`)}document.body.removeChild(e)}},bloquear:async e=>{if(!confirm(`Tem a certeza que deseja bloquear o acesso de ${e}?`))return;let t=sessionStorage.getItem(`token_master`);try{(await(await fetch(`${v}/master/bloquear`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${t}`},body:JSON.stringify({email:e.trim().toLowerCase()})})).json()).success&&(b.showToast(`Conta bloqueada.`,`success`),b.carregarDados())}catch{b.showToast(`Erro ao bloquear.`,`error`)}},abrirModalExcluir:e=>{document.getElementById(`excluir-email`).value=e,document.getElementById(`excluir-email-display`).innerText=e,document.getElementById(`input-confirmar-exclusao`).value=``,document.getElementById(`modal-excluir`).style.display=`flex`},fecharModalExcluir:()=>{document.getElementById(`modal-excluir`).style.display=`none`},excluir:e=>{b.abrirModalExcluir(e)},confirmarExclusao:async()=>{let e=document.getElementById(`excluir-email`).value;if(document.getElementById(`input-confirmar-exclusao`).value.trim().toUpperCase()!==`EXCLUIR`)return b.showToast(`Palavra de segurança incorreta. Digite EXCLUIR.`,`warning`);let t=sessionStorage.getItem(`token_master`),n=document.getElementById(`btn-confirmar-exclusao`);n.innerText=`Apagando... ⏳`,n.disabled=!0;try{let n=await(await fetch(`${v}/master/excluir-conta`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${t}`},body:JSON.stringify({email:e})})).json();n.success?(b.showToast(`Conta obliterada com sucesso!`,`success`),b.fecharModalExcluir(),b.carregarDados()):b.showToast(n.error||`Erro ao excluir conta.`,`error`)}catch{b.showToast(`Erro crítico de comunicação com o servidor.`,`error`)}finally{n.innerText=`Apagar Tudo`,n.disabled=!1}}};document.addEventListener(`DOMContentLoaded`,b.init),window.Admin=b,window.App=window.App||{};var x=window.App,S=e=>{let t=document.getElementById(e);return t?t.value.trim():``},C=e=>{let t=document.getElementById(e);if(!t||!t.value)return 0;let n=parseFloat(t.value);return isNaN(n)?0:n};x.verificarMaioridade=()=>{let e=document.getElementById(`alu-nasc`),t=document.getElementById(`box-responsavel`);if(!e||!t)return;if(!e.value){t.style.display=`none`;return}let n=new Date,r=new Date(e.value),i=n.getFullYear()-r.getFullYear(),a=n.getMonth()-r.getMonth();(a<0||a===0&&n.getDate()<r.getDate())&&i--,i<18?(t.style.display=`block`,t.style.animation=`fadeIn 0.5s`):t.style.display=`none`},x.atualizarDisplayDias=()=>{let e=document.querySelectorAll(`.turma-dia-chk:checked`),t=Array.from(e).map(e=>e.value),n=document.getElementById(`tur-dia-display`);n&&(n.innerText=t.length>0?t.join(`, `):`-- Selecione os dias --`)},document.addEventListener(`click`,function(e){let t=document.getElementById(`tur-dia-wrapper`),n=document.getElementById(`tur-dia-options`);n&&t&&!t.contains(e.target)&&(n.style.display=`none`)}),x.abrirModalCadastroModulo=async(e,t)=>{x.entidadeAtual=e,x.idEdicao=t;let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`);let r=document.getElementById(`modal-titulo`),i=document.getElementById(`modal-form-content`);r&&(r.innerText=t?`Editar ${e.charAt(0).toUpperCase()+e.slice(1)}`:`Novo ${e.charAt(0).toUpperCase()+e.slice(1)}`),i&&(i.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando formulário... ⏳</p>`);let a={},o={cursos:[],turmas:[]};try{if(t){let n=e===`financeiro`?`financeiro`:e+`s`;a=await x.api(`/${n}/${t}`)}if(e===`aluno`||e===`turma`){let[e,t]=await Promise.all([x.api(`/cursos`),x.api(`/turmas`)]);o.cursos=Array.isArray(e)?e:[],o.turmas=Array.isArray(t)?t:[]}let n=x.UI,r=``;if(e===`aluno`){let e=o.turmas.length>0?`<option value="">-- Selecione a Turma --</option>`+o.turmas.map(e=>`<option value="${e.nome}" ${a.turma===e.nome?`selected`:``}>${x.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre uma Turma Primeiro --</option>`,t=o.cursos.length>0?`<option value="">-- Selecione o Curso --</option>`+o.cursos.map(e=>`<option value="${e.nome}" ${a.curso===e.nome?`selected`:``}>${x.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre um Curso Primeiro --</option>`;r=`
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
            `}else if(e===`turma`){let e=o.cursos.length>0?`<option value="">-- Sem Curso Específico --</option>`+o.cursos.map(e=>`<option value="${e.nome}" ${a.curso===e.nome?`selected`:``}>${x.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre um Curso Primeiro --</option>`,t=a.dia?a.dia.split(`,`).map(e=>e.trim()):[],i=e=>`
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
            `);i&&(i.innerHTML=r,e===`aluno`&&setTimeout(()=>x.verificarMaioridade(),100));let s=document.querySelector(`.btn-confirm`);s&&(s.setAttribute(`onclick`,`App.salvarCadastro()`),s.innerHTML=`💾 Salvar Registro`)}catch(e){console.error(`Erro no formulário:`,e),i&&(i.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o formulário. Verifique a internet.</p>`)}},x.salvarCadastro=async()=>{let e=x.entidadeAtual,t=e===`financeiro`?`financeiro`:e+`s`,n={},r=document.querySelector(`.btn-confirm`),i=r?r.innerText:`Salvar`;r&&(r.innerText=`A guardar... ⏳`,r.disabled=!0),document.body.style.cursor=`wait`;try{if(e===`aluno`){n.nome=S(`alu-nome`),n.email=S(`alu-email`),n.whatsapp=S(`alu-zap`),n.cpf=S(`alu-cpf`),n.rg=S(`alu-rg`),n.nascimento=S(`alu-nasc`),n.sexo=S(`alu-sexo`),n.profissao=S(`alu-prof`),n.rua=S(`alu-rua`),n.numero=S(`alu-num`),n.bairro=S(`alu-bairro`),n.cidade=S(`alu-cidade`),n.estado=S(`alu-uf`),n.pais=S(`alu-pais`),n.turma=S(`alu-turma`),n.curso=S(`alu-curso`),n.status=S(`alu-status`)||`Ativo`;let e=document.getElementById(`box-responsavel`);if(e&&e.style.display!==`none`?(n.resp_nome=S(`alu-resp-nome`),n.resp_parentesco=S(`alu-resp-parentesco`),n.resp_cpf=S(`alu-resp-cpf`),n.resp_zap=S(`alu-resp-zap`)):(n.resp_nome=``,n.resp_parentesco=``,n.resp_cpf=``,n.resp_zap=``),!n.nome||!n.whatsapp)throw x.showToast(`Nome e WhatsApp são obrigatórios!`,`error`),Error(`Validação Falhou`)}else if(e===`turma`){n.nome=S(`tur-nome`),n.horario=S(`tur-hora`),n.curso=S(`tur-curso`);let e=document.querySelectorAll(`.turma-dia-chk:checked`);if(n.dia=Array.from(e).map(e=>e.value).join(`, `),!n.nome)throw x.showToast(`O nome da turma é obrigatório!`,`error`),Error(`Validação Falhou`)}else if(e===`curso`){if(n.nome=S(`cur-nome`),n.carga=S(`cur-carga`),n.valor=C(`cur-valor`),n.descricao=S(`cur-desc`),!n.nome)throw x.showToast(`O nome do curso é obrigatório!`,`error`),Error(`Validação Falhou`)}else if(e===`estoque`&&(n.nome=S(`est-nome`),n.codigo=S(`est-codigo`),n.obs=S(`est-obs`),n.valor=C(`est-valor`),n.quantidade=parseInt(S(`est-qtd`))||0,n.quantidadeMinima=parseInt(S(`est-min`))||0,!n.nome))throw x.showToast(`O nome do item é obrigatório!`,`error`),Error(`Validação Falhou`);let r=x.idEdicao?`/${t}/${x.idEdicao}`:`/${t}`,i=x.idEdicao?`PUT`:`POST`,a=await x.api(r,i,n);if(!a||a.error)throw Error(a?a.error:`Erro de comunicação com a API`);x.showToast(`Registo salvo com sucesso! 🎉`,`success`),x.fecharModal();let o=document.getElementById(`app-content`);o&&(o.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),typeof x.renderizarLista==`function`?await x.renderizarLista(e):typeof x.renderizarInicio==`function`&&await x.renderizarInicio()}catch(e){e.message!==`Validação Falhou`&&(x.showToast(e.message||`Ocorreu um erro ao salvar.`,`error`),console.error(`Erro completo:`,e))}finally{r&&(r.innerText=i,r.disabled=!1),document.body.style.cursor=`default`}},x.toggleCheckCadastros=e=>{document.querySelectorAll(`.chk-cadastro`).forEach(t=>t.checked=e.checked)},x.excluirEmLoteCadastros=e=>{let t=document.querySelectorAll(`.chk-cadastro:checked`);if(t.length===0)return x.showToast(`Selecione pelo menos um registo para excluir.`,`warning`);let n=e===`financeiro`?`financeiro`:e+`s`,r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`);let i=document.getElementById(`modal-titulo`),a=document.getElementById(`modal-form-content`),o=document.querySelector(`.btn-confirm`);i&&(i.innerText=`Excluir Registos (${t.length} itens)`);let s=`
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
    `;if(a&&(a.innerHTML=s),o){o.innerText=`SIM, EXCLUIR 🗑️`,o.style.background=`#c0392b`;let r=o.cloneNode(!0);o.parentNode.replaceChild(r,o),r.onclick=async()=>{let i=r.innerText;r.innerText=`A excluir... ⏳`,r.disabled=!0,document.body.style.cursor=`wait`;try{let r=Array.from(t).map(e=>x.api(`/${n}/${e.value}`,`DELETE`));await Promise.all(r),x.showToast(`Registos excluídos com sucesso!`,`success`),x.fecharModal();let i=document.getElementById(`app-content`);i&&(i.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),await x.renderizarLista(e)}catch{x.showToast(`Erro ao processar exclusão.`,`error`),r.innerText=i,r.disabled=!1}finally{document.body.style.cursor=`default`,setTimeout(()=>{r&&(r.style.background=``)},500)}}}};var w=t({});window.App=window.App||{};var T=window.App;if(T.renderizarFinanceiroPro=async()=>{T.setTitulo(`Financeiro`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Carregando dados financeiros...</p>`;try{let[t,n,r]=await Promise.all([T.api(`/turmas`),T.api(`/financeiro`),T.api(`/alunos`)]),i=r.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),a=n.filter(e=>!(e.status===`Pendente`&&!i.includes(e.idAluno)));T.financeiroCache=a.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1),T.UI.input;let o=T.UI.botao,s=(e,t,n)=>`
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
                    <select id="fin-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${`<option value="">-- Selecione --</option>`+r.filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${T.escapeHTML(e.nome)}</option>`).join(``)}</select>
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
                ${T.gerarTabelaFinanceira(T.financeiroCache)}
            </div>
        `;e.innerHTML=`
            <div style="margin-bottom:20px; text-align:right;">
                <button onclick="App.renderizarTela('inadimplencia')" style="background:#c0392b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 6px rgba(192, 57, 43, 0.3);">📉 RELATÓRIO DE INADIMPLÊNCIA</button>
            </div>
            <div class="card" style="border-left:5px solid #2980b9; padding:25px; margin-bottom:30px;">
                ${l}
            </div>
            ${T.UI.card(``,``,m)}
        `}catch{e.innerHTML=`Erro ao carregar dados financeiros.`}},T.gerarTabelaFinanceira=e=>{if(!e||e.length===0)return`<p style="text-align:center; padding:20px; color:#999;">Nenhum lançamento encontrado.</p>`;let t=(e,t=`center`)=>`<th style="padding:12px; text-align:${t}; border-bottom:2px solid #eee;">${e}</th>`,n=`<tr style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase; font-size:12px;">
        <th style="padding:12px; width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheck(this)"></th>
        ${t(`Aluno`,`left`)}${t(`Parcela`)}${t(`Vencimento`)}${t(`Valor`)}${t(`Status`)}${t(`Ações`)}
    </tr>`,r=new Date;return r.setHours(0,0,0,0),`<table style="width:100%; border-collapse:collapse; font-size:14px; color:#555; min-width:600px;"><thead>${n}</thead><tbody>${e.map(e=>{let t=e.status===`Pago`,n=e.status===`Pendente`,i=new Date(e.vencimento+`T00:00:00`),a=n&&i<r,o=t?`#1e8449`:n?`#f39c12`:`#e74c3c`;a&&(o=`#c0392b`);let s=``;t?s=`background-color:#eafaf1;`:a&&(s=`background-color:#fdf2f2;`);let c=a?`Atrasado`:e.status,l=`<span style="background:${t?`#d4efdf`:a?`#fadbd8`:`#fcf3cf`}; padding:4px 8px; border-radius:4px; font-size:12px;">${c}</span>`,u=e.descricao.includes(`/`)?e.descricao.split(` `).pop():`-`,d=e.vencimento.split(`-`).reverse().join(`/`),f=parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2}),p=t?``:`<button onclick="App.cobrarWhatsApp('${e.idAluno}', '${f}')" style="background:#27ae60; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Cobrar no WhatsApp">💬</button>`;return`
        <tr style="border-bottom:1px solid #eee; ${s} transition:background 0.2s;">
            <td style="padding:12px; text-align:center;"><input type="checkbox" class="fin-check" value="${e.id}"></td>
            <td style="padding:12px; font-weight:bold;">${T.escapeHTML(e.alunoNome)}</td>
            <td style="padding:12px; text-align:center;">${T.escapeHTML(u)}</td>
            <td style="padding:12px; text-align:center; ${a?`color:#c0392b; font-weight:bold;`:``}">${d}</td>
            <td style="padding:12px; text-align:center;">R$ ${f}</td>
            <td style="padding:12px; text-align:center; font-weight:bold; color:${o};">${l}</td>
            <td style="padding:12px; text-align:center; white-space:nowrap;">
                <button onclick="App.abrirCarneExistente('${e.idCarne}')" style="background:#3498db; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Ver Carnê">📄</button>
                <button onclick="App.abrirEdicaoFinanceiro('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Editar Valor">✏️</button>
                ${p}
            </td>
        </tr>`}).join(``)}</tbody></table>`},T.filtrarFinanceiro=()=>{let e=document.getElementById(`fin-busca`),t=document.getElementById(`fin-filtro-mes`),n=document.getElementById(`fin-filtro-ano`),r=document.getElementById(`fin-filtro-status`),i=e?e.value.toLowerCase():``,a=t?t.value:``,o=n?n.value:``,s=r?r.value:``,c=T.financeiroCache.filter(e=>{let t=!i||e.alunoNome&&e.alunoNome.toLowerCase().includes(i)||e.descricao&&e.descricao.toLowerCase().includes(i),n=e.vencimento||``,r=n.substring(0,4),c=n.substring(5,7),l=!o||r===o,u=!a||c===a,d=!s||e.status===s;return t&&l&&u&&d});a||o||s?c.sort((e,t)=>new Date(t.vencimento)-new Date(e.vencimento)):c.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1),document.getElementById(`fin-lista-area`).innerHTML=T.gerarTabelaFinanceira(c)},T.filaBaixa={modo:``,itens:[],index:0},T.abrirModalBaixa=()=>{let e=document.querySelectorAll(`.fin-check:checked`);if(e.length===0)return T.showToast(`Selecione pelo menos um lançamento para dar baixa.`,`warning`);let t=Array.from(e).map(e=>T.financeiroCache.find(t=>t.id==e.value)).filter(e=>e);if(t.length===1)T.filaBaixa={modo:`single`,itens:t,index:0},T.montarTelaBaixa();else{T.filaBaixa={modo:`escolha`,itens:t,index:0};let e=document.getElementById(`modal-overlay`);e&&(e.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Múltiplas Baixas (${t.length} itens)`,document.getElementById(`modal-form-content`).innerHTML=`
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
        `;let n=document.querySelector(`.btn-confirm`);n&&(n.style.display=`none`)}},T.definirModoBaixa=e=>{T.filaBaixa.modo=e,T.filaBaixa.index=0,T.montarTelaBaixa()},T.montarTelaBaixa=()=>{let{modo:e,itens:t,index:n}=T.filaBaixa,r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`);let i=document.querySelector(`.btn-confirm`);i&&(i.style.display=`inline-block`);let a=0,o=``,s=``,c=!0;if(e===`batch`){s=`Pagamento em Lote (${t.length} itens)`;let e=0;t.forEach(t=>e+=Math.round(parseFloat(t.valor)*100)),a=e/100,o=`
            <div style="font-size:13px; color:#2980b9; margin-bottom:15px; background:#e8f4f8; padding:12px; border-radius:6px; border-left:4px solid #3498db;">
                <b>ℹ️ Atenção:</b> O valor final e quaisquer juros aplicados serão divididos proporcionalmente entre os ${t.length} lançamentos.
            </div>`,i.innerText=`CONFIRMAR LOTE ✅`}else{let r=t[n];a=parseFloat(r.valor),c=n===t.length-1,s=e===`queue`?`Fila do Caixa: Lançamento ${n+1} de ${t.length}`:`Confirmar Pagamento`,o=`
            <div style="background:#fdfefe; border:1px solid #dce1e6; padding:15px; border-radius:6px; margin-bottom:15px; border-left:4px solid #27ae60; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:6px;">👤 Identificação do Pagador</div>
                    <div style="font-size:16px; font-weight:bold; color:#2c3e50; margin-bottom:4px;">${T.escapeHTML(r.alunoNome)}</div>
                    <div style="font-size:13px; color:#555;">📄 ${T.escapeHTML(r.descricao)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:6px;">Vencimento</div>
                    <div style="font-size:14px; color:#c0392b; font-weight:bold;">${r.vencimento.split(`-`).reverse().join(`/`)}</div>
                </div>
            </div>`,i.innerText=e===`queue`&&!c?`CONFIRMAR E PRÓXIMO ⏭️`:`CONFIRMAR PAGAMENTO ✅`}document.getElementById(`modal-titulo`).innerText=s;let l=T.UI.input,u=(e,t,n,r=``)=>`
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
        </div>`;document.getElementById(`modal-form-content`).innerHTML=p,i.setAttribute(`onclick`,`App.confirmarBaixa()`)},T.aplicarJurosBaixa=()=>{let e=parseFloat(document.getElementById(`baixa-total-original`).value),t=parseFloat(document.getElementById(`baixa-juros`).value)||0;t<0&&(t=0,document.getElementById(`baixa-juros`).value=0);let n=e+t/100*e;document.getElementById(`baixa-display-total`).innerText=`R$ ${n.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,document.getElementById(`baixa-total`).value=n.toFixed(2),document.getElementById(`baixa-qtd`).value===`1`?document.getElementById(`baixa-valor-1`).value=n.toFixed(2):T.calcValorBaixa()},T.mudarQtdFormasBaixa=()=>{let e=document.getElementById(`baixa-qtd`).value,t=document.getElementById(`forma-2-container`),n=document.getElementById(`baixa-valor-1`),r=parseFloat(document.getElementById(`baixa-total`).value);e===`2`?(t.style.display=`grid`,n.value=(r/2).toFixed(2),T.calcValorBaixa()):(t.style.display=`none`,n.value=r.toFixed(2))},T.calcValorBaixa=()=>{if(document.getElementById(`baixa-qtd`).value===`2`){let e=Math.round(parseFloat(document.getElementById(`baixa-total`).value)*100)-(Math.round(parseFloat(document.getElementById(`baixa-valor-1`).value)*100)||0);e<0&&(e=0),document.getElementById(`baixa-valor-2`).value=(e/100).toFixed(2)}},T.confirmarBaixa=async()=>{let e=document.getElementById(`baixa-data`).value,t=document.getElementById(`baixa-qtd`).value,n=document.getElementById(`baixa-forma-1`).value,r=document.getElementById(`baixa-valor-1`).value,i=t===`2`?document.getElementById(`baixa-forma-2`).value:null,a=t===`2`?document.getElementById(`baixa-valor-2`).value:null;if(!e)return T.showToast(`Informe a data de pagamento.`,`error`);let o=document.querySelector(`.btn-confirm`),s=o.innerText;o.innerText=`A guardar... ⏳`,o.disabled=!0;let{modo:c,itens:l,index:u}=T.filaBaixa;try{let o=[];if(c===`batch`){let s=parseFloat(document.getElementById(`baixa-total-original`).value)||0;for(let c of l){let l=s>0?parseFloat(c.valor)/s:0,u=s>0?(parseFloat(r)*l).toFixed(2):`0.00`,d=t===`2`&&s>0?(parseFloat(a)*l).toFixed(2):null,f=(parseFloat(u)+(parseFloat(d)||0)).toFixed(2),p={...c,status:`Pago`,dataPagamento:e,formaPagamento:n,valorPago1:u,formaPagamento2:i,valorPago2:d,valor:f};o.push(T.api(`/financeiro/${c.id}`,`PUT`,p))}}else{let s=l[u],c=(parseFloat(r)+(parseFloat(a)||0)).toFixed(2),d={...s,status:`Pago`,dataPagamento:e,formaPagamento:n,valorPago1:r,formaPagamento2:i,valorPago2:t===`2`?a:null,valor:c};o.push(T.api(`/financeiro/${s.id}`,`PUT`,d))}if(await Promise.all(o),c===`queue`&&u<l.length-1){T.showToast(`Pagamento ${u+1} registado. Avançando...`,`success`),T.filaBaixa.index++,T.montarTelaBaixa();return}T.showToast(`Operação no caixa concluída com sucesso! 💼`,`success`),T.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,await T.renderizarFinanceiroPro()}catch{T.showToast(`Erro ao processar baixa.`,`error`)}finally{o&&(o.innerText=s,o.disabled=!1)}},T.gerarCarnes=async()=>{let e=document.getElementById(`fin-aluno`).value,t=document.getElementById(`fin-valor`).value,n=parseInt(document.getElementById(`fin-parcelas`).value),r=document.getElementById(`fin-vencimento`).value,i=document.getElementById(`fin-tipo`).value;if(!e||!t||!n||!r)return T.showToast(`Preencha todos os campos do gerador.`,`error`);if(parseFloat(t)<=0)return T.showToast(`O valor da mensalidade deve ser maior que zero.`,`warning`);let a=document.getElementById(`fin-aluno`).options[document.getElementById(`fin-aluno`).selectedIndex].text,o=Date.now().toString(),s=new Date().toLocaleDateString(`pt-BR`),c=document.getElementById(`btn-gerar-carne`),l=c.innerText;c.innerText=`Gerando ${n} parcelas... ⏳`,c.disabled=!0,document.body.style.cursor=`wait`;try{let c=[],l=new Date(r+`T00:00:00`),u=l.getDate();for(let r=1;r<=n;r++){let d=new Date(l.getTime());d.setMonth(l.getMonth()+(r-1)),d.getDate()!==u&&d.setDate(0);let f=d.toISOString().split(`T`)[0],p=`Mensalidade ${r}/${n}`;i===`extra`&&(p=`Parcela Extra (Extensão de Curso) - ${r}/${n}`);let m={id:o+`_`+r,idCarne:o,dataGeracao:s,idAluno:e,alunoNome:a,valor:t,vencimento:f,status:`Pendente`,descricao:p,tipo:`Receita`};c.push(T.api(`/financeiro`,`POST`,m))}await Promise.all(c),T.showToast(`Carnê gerado com sucesso!`,`success`),T.abrirCarneExistente(o)}catch{T.showToast(`Erro ao gerar parcelas.`,`error`)}finally{c.innerText=l,c.disabled=!1,document.body.style.cursor=`default`}},T.toggleCheck=e=>{document.querySelectorAll(`.fin-check`).forEach(t=>t.checked=e.checked)},T.acaoLote=e=>{let t=document.querySelectorAll(`.fin-check:checked`);if(t.length===0)return T.showToast(`Selecione pelo menos um lançamento.`,`warning`);let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`);let r=document.getElementById(`modal-titulo`),i=document.getElementById(`modal-form-content`),a=document.querySelector(`.btn-confirm`),o=e===`excluir`,s=o?`#c0392b`:`#f39c12`,c=o?`🗑️`:`↩️`,l=o?`Excluir Lançamentos`:`Desfazer Pagamentos`,u=o?`excluir permanentemente`:`alterar para PENDENTE`;r&&(r.innerText=l);let d=o?`<div style="background:#fdf2f2; border:1px solid #fadbd8; border-left:4px solid #c0392b; padding:12px; border-radius:6px; color:#c0392b; font-size:13px; text-align:left; margin-top:20px;"><b>⚠️ ATENÇÃO:</b> Esta ação é irreversível. Os registos serão removidos da base de dados e do histórico do aluno.</div>`:`<div style="background:#fdf2e9; border:1px solid #fdebd0; border-left:4px solid #f39c12; padding:12px; border-radius:6px; color:#d35400; font-size:13px; text-align:left; margin-top:20px;"><b>ℹ️ NOTA:</b> O status passará de "Pago" para "Pendente" no sistema.</div>`,f=`
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
    `;if(i&&(i.innerHTML=f),a){a.innerText=o?`SIM, EXCLUIR 🗑️`:`CONFIRMAR ↩️`,a.style.background=s;let n=a.cloneNode(!0);a.parentNode.replaceChild(n,a),n.onclick=()=>T.executarAcaoLoteConfirmada(e,t,n,s)}},T.executarAcaoLoteConfirmada=async(e,t,n,r)=>{let i=n.innerText;n.innerText=`A processar... ⏳`,n.disabled=!0,n.style.opacity=`0.8`,document.body.style.cursor=`wait`;try{let n=Array.from(t).map(async t=>{let n=t.value;if(e===`excluir`)return T.api(`/financeiro/${n}`,`DELETE`);{let t=T.financeiroCache.find(e=>e.id==n);if(t)return T.api(`/financeiro/${n}`,`PUT`,{...t,status:e===`baixar`?`Pago`:`Pendente`})}});await Promise.all(n),T.showToast(`Ação concluída com sucesso!`,`success`),T.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,typeof T.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?await T.renderizarFinanceiroPro():typeof T.filtrarTabelaReativa==`function`?await T.renderizarLista(`financeiro`):await T.renderizarFinanceiroPro()}catch{T.showToast(`Erro ao processar lote.`,`error`),n.innerText=i,n.disabled=!1,n.style.opacity=`1`}finally{document.body.style.cursor=`default`,setTimeout(()=>{n&&(n.style.background=``)},500)}},T.abrirCarneExistente=async e=>{let t=document.getElementById(`app-content`);t.innerHTML=`<p style="text-align:center; padding:20px;">Gerando Carnê Profissional...</p>`;try{let[n,r,i]=await Promise.all([T.api(`/financeiro`),T.api(`/alunos`),T.api(`/escola`)]),a=n.filter(t=>t.idCarne===e).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento));if(a.length===0)return T.showToast(`Carnê não encontrado.`,`error`);let o=r.find(e=>e.id===a[0].idAluno)||{nome:`Aluno`,cpf:`Não informado`};i.foto&&`${i.foto}`,(i.nome||`INSTITUIÇÃO`).substring(0,20),(o.nome||`Aluno`).split(` `)[0];let s=i.banco||`Não Configurado`,c=i.chavePix||`Não Configurada`;t.innerHTML=`
            
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
                            <div style="font-size: 8px; color: #555; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><b>CNPJ:</b> ${T.escapeHTML(i.cnpj||`Não informado`)}</div>
                            <div style="font-size: 8px; color: #555; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><b>Banco:</b> ${T.escapeHTML(s)}</div>
                        </div>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 3px; color: #34495e;"><b>Nº:</b> ${r}</div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Parcela:</b> ${T.escapeHTML(e.descricao)}</div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Vencimento:</b> <span style="color: red; font-weight: bold;">${t}</span></div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Valor:</b> R$ ${n}</div>
                    <div style="margin-top: auto; font-size: 9px; border-top: 1px solid #ccc; padding-top: 5px;"><b>Sacado:</b> ${T.escapeHTML(o.nome)}</div>
                </div>
                <div class="carne-recibo">
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 6px;">
                        <div><div style="font-weight: bold; font-size: 12px;">${T.escapeHTML(i.nome||`INSTITUIÇÃO`)}</div><div style="font-size: 9px;">Banco: ${T.escapeHTML(s)}</div></div>
                        <div style="text-align: right; font-size: 10px; font-weight: bold;">RECIBO DO PAGADOR</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; background: #fdfdfd; border: 1px solid #ddd; padding: 4px 10px;">
                        <div><div style="font-size: 9px; color: #777;">Número da Folha</div><div style="font-weight: bold; font-size: 12px;">${r}</div></div>
                        <div><div style="font-size: 9px; color: #777;">Vencimento</div><div style="font-weight: bold; font-size: 12px; color: #c0392b;">${t}</div></div>
                        <div><div style="font-size: 9px; color: #777;">Valor</div><div style="font-weight: bold; font-size: 12px;">R$ ${n}</div></div>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 5px;"><b>Ref:</b> ${T.escapeHTML(e.descricao)} | <b>Pagador:</b> ${T.escapeHTML(o.nome)}</div>
                    
                    <div style="background: #fff8e1; border: 1px solid #f1c40f; padding: 4px 8px; border-radius: 4px; margin-bottom: 5px; text-align: center; line-height: 1.2;">
                        <span style="font-size: 9px; font-weight: bold; color: #d35400;">Importante:</span> 
                        <span style="font-size: 9px; color: #555;">Benefícios concedidos na matrícula são válidos apenas até a data de vencimento. Após o vencimento, a mensalidade será atualizada automaticamente para o valor vigente.</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 10px; font-weight: bold; color:#27ae60;">PAGAMENTO VIA PIX</div>
                            <div style="background: #eee; padding: 4px 6px; border-radius: 4px; font-size: 10px; word-break: break-all;">🔑 ${T.escapeHTML(c)}</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: -5px;">${a}</div>
                    </div>
                </div>
            </div>`}).join(``)}</div>`,(!i.qrCodeImagem||i.qrCodeImagem.length<=50)&&a.forEach(e=>{let t=document.getElementById(`qr-${e.id}`);t&&typeof QRCode<`u`&&new QRCode(t,{text:c,width:60,height:60})})}catch{T.showToast(`Erro ao gerar carnê.`,`error`)}},T.renderizarInadimplencia=async()=>{T.setTitulo(`Relatório de Inadimplência`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Calculando inadimplência... ⏳</p>`;try{let[t,n,r]=await Promise.all([T.api(`/financeiro`),T.api(`/alunos`),T.api(`/escola`)]),i=n.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),a=new Date,o=t.filter(e=>e.status!==`Pago`&&new Date(e.vencimento+`T00:00:00`)<a&&i.includes(e.idAluno)),s=0,c={};o.forEach(e=>{let t=Math.round(parseFloat(e.valor)*100);if(!c[e.idAluno]){let t=n.find(t=>t.id==e.idAluno);c[e.idAluno]={idAluno:e.idAluno,nome:e.alunoNome,curso:t?t.curso:`-`,totalCentavos:0,detalhes:[]}}c[e.idAluno].totalCentavos+=t,c[e.idAluno].detalhes.push(`${e.vencimento.split(`-`).reverse().join(`/`)} (R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})})`),s+=t});let l=Object.values(c).map(e=>({...e,total:e.totalCentavos/100})),u=s/100,d=new Date().toLocaleDateString(`pt-BR`),f=r.foto?`<img src="${r.foto}" style="height:50px;">`:``,p=l.length===0?`<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">Nenhuma pendência encontrada.</td></tr>`:l.map(e=>`
                <tr>
                    <td style="font-weight:bold;">${T.escapeHTML(e.nome)}</td>
                    <td>${T.escapeHTML(e.curso)}</td>
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
                        <div><h2 style="margin:0;">${T.escapeHTML(r.nome||``)}</h2><div style="font-size:12px;">CNPJ: ${T.escapeHTML(r.cnpj||``)}</div></div>
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
            </div>`}catch(e){console.error(e),T.showToast(`Erro ao calcular inadimplência.`,`error`)}},T.abrirEdicaoFinanceiro=async e=>{T.idEdicaoFinanceiro=e;let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`);n&&(n.innerText=`Editar Lançamento`),r&&(r.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando dados da parcela... ⏳</p>`);try{let t=await T.api(`/financeiro/${e}`);T.parcelaEdicaoAtual=t;let n=t.status===`Pago`,i=n?`Data Efetiva do Pagamento`:`Nova Data de Vencimento`,a=n&&t.dataPagamento||t.vencimento;r.innerHTML=`
            ${n?`<div style="background:#e8f4f8; color:#2980b9; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #2980b9;">ℹ️ <b>Parcela Paga:</b> Você está alterando apenas o dia em que o aluno efetuou o pagamento. <b>O vencimento original do carnê ficará intacto.</b></div>`:`<div style="background:#fff3e0; color:#d35400; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #d35400;">⚠️ <b>Parcela Pendente:</b> Alterar a data mudará o dia de vencimento no carnê do aluno.</div>`}
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">${i}</label>
                <input type="date" id="edit-fin-data" value="${a||``}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">Valor Registado (R$)</label>
                <input type="number" step="0.01" id="edit-fin-valor" value="${t.valor||``}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
        `;let o=document.querySelector(`.btn-confirm`);o&&(o.setAttribute(`onclick`,`App.salvarEdicaoFinanceiro()`),o.innerHTML=`💾 Salvar Alterações`)}catch(e){console.error(`Erro ao carregar edição:`,e),r&&(r.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar dados. Tente novamente.</p>`)}},T.salvarEdicaoFinanceiro=async()=>{let e=document.getElementById(`edit-fin-data`).value,t=document.getElementById(`edit-fin-valor`).value;if(!e||!t)return T.showToast(`Por favor, preencha a data e o valor.`,`warning`);let n=t.toString().trim();n.includes(`,`)&&n.includes(`.`)?n=n.replace(/\./g,``).replace(`,`,`.`):n.includes(`,`)&&(n=n.replace(`,`,`.`)),n=parseFloat(n)||0;let r=document.querySelector(`.btn-confirm`),i=r?r.innerHTML:`Salvar`;r&&(r.innerHTML=`⏳ A guardar...`,r.disabled=!0),document.body.style.cursor=`wait`;try{let t=T.parcelaEdicaoAtual.status===`Pago`,r={...T.parcelaEdicaoAtual,valor:n};t?(r.dataPagamento=e,r.valorPago1=n,r.valorPago2=0):r.vencimento=e,await T.api(`/financeiro/${T.idEdicaoFinanceiro}`,`PUT`,r),T.showToast(`Alteração financeira guardada com sucesso! 💼`,`success`),T.fecharModal(),typeof T.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?T.renderizarFinanceiroPro():typeof T.filtrarTabelaReativa==`function`&&T.renderizarLista(`financeiro`)}catch(e){console.error(`Erro ao guardar edição:`,e),T.showToast(`Ocorreu um erro ao atualizar.`,`error`)}finally{r&&(r.innerHTML=i,r.disabled=!1),document.body.style.cursor=`default`}},T.abrirModalEdicaoLote=()=>{let e=document.querySelectorAll(`.fin-check:checked`);if(e.length===0)return T.showToast(`Selecione pelo menos um lançamento para editar.`,`warning`);let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`);n&&(n.innerText=`Edição em Massa (${e.length} itens)`),r&&(r.innerHTML=`
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
    `);let i=document.querySelector(`.btn-confirm`);i&&(i.setAttribute(`onclick`,`App.salvarEdicaoLote()`),i.innerHTML=`💾 Aplicar a Todos`,i.style.background=`#f39c12`,i.style.display=`inline-block`)},T.salvarEdicaoLote=async()=>{let e=document.getElementById(`lote-edit-data`).value,t=document.getElementById(`lote-edit-valor`).value,n=document.getElementById(`lote-edit-descricao`).value.trim(),r=document.getElementById(`lote-edit-cascata`)?.checked;if(!e&&!t&&!n)return T.showToast(`Preencha pelo menos um campo para alterar em massa.`,`warning`);let i=null;if(t){let e=t.toString().trim();if(e.includes(`,`)&&e.includes(`.`)?e=e.replace(/\./g,``).replace(`,`,`.`):e.includes(`,`)&&(e=e.replace(`,`,`.`)),i=parseFloat(e),isNaN(i)||i<0)return T.showToast(`Valor preenchido é inválido.`,`warning`)}let a=document.querySelectorAll(`.fin-check:checked`),o=Array.from(a).map(e=>e.value),s=o.map(e=>T.financeiroCache.find(t=>t.id==e)).filter(Boolean);s.sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento));let c=document.querySelector(`.btn-confirm`),l=c?c.innerHTML:`Aplicar`;c&&(c.innerHTML=`⏳ A processar...`,c.disabled=!0,c.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let t=s.map((t,a)=>{let o=t.status===`Pago`,s={...t};if(i!==null&&(s.valor=i,o&&(s.valorPago1=i,s.valorPago2=0)),n&&(s.descricao=n),e){let t=e;if(r&&!o&&a>0){let n=new Date(e+`T00:00:00`),r=n.getDate();n.setMonth(n.getMonth()+a),n.getDate()!==r&&n.setDate(0),t=n.toISOString().split(`T`)[0]}o?s.dataPagamento=e:s.vencimento=t}return T.api(`/financeiro/${t.id}`,`PUT`,s)});await Promise.all(t),T.showToast(`Edição em cascata aplicada em ${o.length} lançamentos! 💼`,`success`),T.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,typeof T.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`)&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?await T.renderizarFinanceiroPro():typeof T.filtrarTabelaReativa==`function`?await T.renderizarLista(`financeiro`):typeof T.renderizarFinanceiroPro==`function`?await T.renderizarFinanceiroPro():await T.renderizarHistoricoFinanceiro()}catch(e){console.error(`Erro na edição em lote:`,e),T.showToast(`Ocorreu um erro ao atualizar em lote.`,`error`)}finally{c&&(c.innerHTML=l,c.disabled=!1,c.style.background=``,c.style.opacity=`1`),document.body.style.cursor=`default`}},T.renderizarHistoricoFinanceiro=async()=>{T.setTitulo(`Histórico de Lançamentos`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Carregando histórico financeiro... ⏳</p>`;try{let[t,n]=await Promise.all([T.api(`/financeiro`),T.api(`/alunos`)]),r=n.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),i=t.filter(e=>!(e.status===`Pendente`&&!r.includes(e.idAluno)));T.financeiroCache=i.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1);let a=T.UI.botao,o=new Set,s=new Date().getFullYear();o.add(s),i.forEach(e=>{e.vencimento&&o.add(parseInt(e.vencimento.split(`-`)[0]))});let c=`<option value="" selected>Todos os Anos</option>`+Array.from(o).sort((e,t)=>t-e).map(e=>`<option value="${e}">${e}</option>`).join(``),l=`<option value="" selected>Todos os Meses</option>`+[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${(t+1).toString().padStart(2,`0`)}">${e}</option>`).join(``),u=`
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
                ${T.gerarTabelaFinanceira(T.financeiroCache)}
            </div>
        `;e.innerHTML=`
            <div style="margin-top: 20px;">
                ${T.UI.card(``,``,u)}
            </div>
        `}catch{e.innerHTML=`Erro ao carregar dados financeiros.`}},typeof T.renderizarLista==`function`){let e=T.renderizarLista;T.renderizarLista=t=>t===`financeiro`?T.renderizarHistoricoFinanceiro():e(t)}T.cobrarWhatsApp=async(e,t)=>{try{T.showToast(`A preparar mensagem...`,`info`);let[n,r]=await Promise.all([T.api(`/alunos`),T.api(`/escola`)]),i=n.find(t=>t.id===e);if(!i)return T.showToast(`Erro: Aluno não encontrado.`,`error`);let a=(i.whatsapp||i.celular||i.telefone||i.contato||``).replace(/\D/g,``);if(a.length<10)return T.showToast(`O aluno não tem um número válido registado.`,`warning`);(a.length===10||a.length===11)&&(a=`55`+a);let o=`Olá, *${i.nome?i.nome.split(` `)[0]:`Aluno`}*! Tudo bem? ✨

Passando apenas para deixar um lembrete sobre a sua mensalidade no valor de *R$ ${t}*, que se encontra em aberto no nosso sistema.

Para sua maior comodidade, deixamos abaixo os nossos dados para pagamento via PIX:

🏦 *Dados da Instituição:*
*Instituição:* _${r.nome||`Nossa Instituição`}_
*CNPJ:* _${r.cnpj||`Não informado`}_
*Banco:* _${r.banco||`Não informado`}_

🔑 *Chave PIX:* *${r.chavePix||`Não informada`}*

_Caso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem._ 🙏

Qualquer dúvida, estamos à inteira disposição. Tenha um excelente dia! 🌟`,s=`https://api.whatsapp.com/send?phone=${a}&text=${encodeURIComponent(o)}`;window.open(s,`_blank`)}catch(e){console.error(`Erro ao gerar link do WhatsApp:`,e),T.showToast(`Erro ao processar a mensagem.`,`error`)}},window.App=window.App||{};var E=window.App,D={Evento:{bg:`#2ecc71`,text:`#fff`},Feriado:{bg:`#e74c3c`,text:`#fff`},Prova:{bg:`#3498db`,text:`#fff`},Reunião:{bg:`#f39c12`,text:`#fff`}},O=(e,t,n=`text`,r=``,i=``)=>`
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <input type="${n}" id="${t}" value="${r}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${i}>
    </div>`,k=(e,t,n,r=``)=>`
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${r}>${n}</select>
    </div>`;E.confirmar=(e,t,n,r,i)=>{let a=`modal-confirm-`+Date.now(),o=document.createElement(`div`);o.id=a,o.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999; backdrop-filter:blur(3px); opacity:0; transition:opacity 0.2s;`;let s=document.createElement(`div`);s.style.cssText=`background:#fff; width:90%; max-width:400px; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); transform:scale(0.9); transition:transform 0.2s;`,s.innerHTML=`
        <div style="font-size:45px; margin-bottom:15px; animation: pop 0.3s ease;">⚠️</div>
        <h3 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${e}</h3>
        <p style="color:#7f8c8d; margin-bottom:25px; line-height:1.5; font-size:14px;">${t}</p>
        <div style="display:flex; gap:10px;">
            <button id="btn-no-${a}" style="flex:1; padding:12px; border:none; background:#ecf0f1; color:#7f8c8d; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#bdc3c7'" onmouseout="this.style.background='#ecf0f1'">Cancelar</button>
            <button id="btn-yes-${a}" style="flex:1; padding:12px; border:none; background:${r}; color:white; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; opacity:0.9;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">${n}</button>
        </div>
    `,o.appendChild(s),document.body.appendChild(o),setTimeout(()=>{o.style.opacity=`1`,s.style.transform=`scale(1)`},10);let c=()=>{o.style.opacity=`0`,s.style.transform=`scale(0.9)`,setTimeout(()=>document.body.removeChild(o),200)};document.getElementById(`btn-no-${a}`).onclick=c,document.getElementById(`btn-yes-${a}`).onclick=()=>{c(),i()}},E.filtrarTabela=(e,t)=>{let n=document.getElementById(e).value.trim().toLowerCase(),r=document.querySelectorAll(`#${t} tbody tr`);!r||r.length===0||r.forEach(e=>{if(e.innerText.includes(`Nenhum`)||e.innerText.includes(`Nenhuma`))return;let t=e.innerText.toLowerCase();e.style.display=t.includes(n)?``:`none`})},E.toggleCheckMassa=(e,t)=>{document.querySelectorAll(`.`+t).forEach(t=>t.checked=e.checked)},E.excluirLotePedagogico=(e,t,n)=>{let r=document.querySelectorAll(`.`+t+`:checked`);if(r.length===0)return E.showToast(`Selecione pelo menos um item para excluir.`,`warning`);E.confirmar(`Excluir em Massa`,`Deseja realmente excluir <b>${r.length}</b> iten(s) selecionado(s)? Esta ação é irreversível.`,`Excluir Tudo`,`#e74c3c`,async()=>{document.body.style.cursor=`wait`;try{let t=Array.from(r).map(t=>E.api(`${e}/${t.value}`,`DELETE`));await Promise.all(t),E.showToast(`${r.length} iten(s) excluído(s) com sucesso!`,`success`);let i=document.getElementById(`app-content`);i&&(i.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando dados... ⏳</p>`),await n()}catch{E.showToast(`Erro ao excluir itens em massa.`,`error`)}finally{document.body.style.cursor=`default`}})},E.renderizarPlanejamentoPro=()=>{E.setTitulo(`Planejamento`);let e=document.getElementById(`app-content`),t=e=>`cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:220px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);`,n=e=>`this.style.borderColor='${e}'; this.style.transform='translateY(-5px)'`,r=`this.style.borderColor='#eee'; this.style.transform='translateY(0)'`;e.innerHTML=`
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
        </div>`},E.renderizarNovoPlanejamento=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`A carregar...`;try{let t=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#2c3e50;">Configurar Novo Cronograma</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <div style="background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #eee;">
                ${k(`Aluno:`,`plan-aluno`,`<option value="">-- Selecione --</option>`+(await E.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}" data-curso="${E.escapeHTML(e.curso||`Geral`)}">${E.escapeHTML(e.nome)}</option>`).join(``),`style="margin-bottom:15px;"`)}
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${O(`Início:`,`plan-inicio`,`date`)}
                    ${O(`Total Aulas:`,`plan-qtd`,`number`,`10`)}
                </div>
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${O(`Horário:`,`plan-hora`,`time`,`08:00`)}
                    ${O(`Duração:`,`plan-duracao`,`time`,`01:00`)}
                </div>
                <label style="font-size:12px; font-weight:bold; color:#666; display:block; margin-bottom:8px;">Dias da Semana:</label>
                <div style="display:flex; gap:10px; flex-wrap:wrap; background:white; padding:10px; border:1px solid #ddd; border-radius:5px;">
                    ${[`Seg`,`Ter`,`Qua`,`Qui`,`Sex`,`Sáb`].map((e,t)=>`<label><input type="checkbox" class="plan-dia" value="${t+1}"> ${e}</label>`).join(``)}
                </div>
            </div>
            <button onclick="App.gerarGridEditavel()" style="width:100%; margin-top:20px; padding:15px; background:#3498db; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">CRIAR TABELA</button>
        `;e.innerHTML=E.UI.card(``,``,t,`800px`)}catch{e.innerHTML=`Erro.`}},E.renderizarPlanejamentosSalvos=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`A carregar...`;try{let t=(await E.api(`/planejamentos?_t=${Date.now()}`)).filter(e=>e.status!==`Arquivado`);if(t.length===0){e.innerHTML=E.UI.card(``,``,`<h3>Nenhum planejamento ativo.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`,`text-align:center; padding:40px;`);return}let n=t.map(e=>`
            <tr style="border-bottom:1px solid #eee;">
                <td style="text-align:center;"><input type="checkbox" class="check-plan-ativo" value="${e.id}"></td>
                <td style="padding:10px; font-weight:500;">${E.escapeHTML(e.nomeAluno)}</td>
                <td style="padding:10px;">${E.escapeHTML(e.curso)}</td>
                <td style="padding:10px; text-align:center;">${e.aulas?e.aulas.length:0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoEditavel('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Editar">✏️</button>
                    <button onclick="App.arquivarPlanejamento('${e.id}')" style="background:#8e44ad; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Arquivar">🗄️</button>
                    <button onclick="App.excluirPlanejamento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir">🗑️</button>
                </td>
            </tr>`).join(``);e.innerHTML=E.UI.card(``,``,`
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
                <table id="tabela-plan-ativos" style="width:100%; border-collapse:collapse;"><thead><tr><th style="width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheckMassa(this, 'check-plan-ativo')"></th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr></thead><tbody>${n}</tbody></table>
            </div>
        `)}catch{e.innerHTML=`Erro.`}},E.renderizarPlanejamentosArquivados=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`A carregar arquivados...`;try{let t=(await E.api(`/planejamentos?_t=${Date.now()}`)).filter(e=>e.status===`Arquivado`);if(t.length===0){e.innerHTML=E.UI.card(``,``,`<h3>Nenhum planejamento no arquivo morto.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`,`text-align:center; padding:40px;`);return}let n=t.map(e=>`
            <tr style="border-bottom:1px solid #ddd; background:#f9f9f9;">
                <td style="text-align:center;"><input type="checkbox" class="check-plan-arq" value="${e.id}"></td>
                <td style="padding:10px; color:#7f8c8d; font-weight:500;">${E.escapeHTML(e.nomeAluno)}</td>
                <td style="padding:10px; color:#7f8c8d;">${E.escapeHTML(e.curso)}</td>
                <td style="padding:10px; text-align:center; color:#7f8c8d;">${e.aulas?e.aulas.length:0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoVisualizacao('${e.id}')" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Visualizar">👁️</button>
                    <button onclick="App.restaurarPlanejamento('${e.id}')" style="background:#27ae60; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Restaurar / Reativar">♻️</button>
                    <button onclick="App.excluirPlanejamentoArquivado('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir Definitivamente">🗑️</button>
                </td>
            </tr>`).join(``);e.innerHTML=E.UI.card(``,``,`
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
        `)}catch{e.innerHTML=`Erro ao ler arquivados.`}},E.gerarGridEditavel=()=>{let e=document.getElementById(`plan-aluno`),t=e.value;if(!t)return alert(`Selecione um aluno.`);let n=e.options[e.selectedIndex].text,r=e.options[e.selectedIndex].getAttribute(`data-curso`)||`Geral`,i=document.getElementById(`plan-inicio`).value,a=parseInt(document.getElementById(`plan-qtd`).value),o=document.getElementById(`plan-hora`).value,s=document.getElementById(`plan-duracao`).value,c=Array.from(document.querySelectorAll(`.plan-dia:checked`)).map(e=>parseInt(e.value));if(!i||c.length===0)return alert(`Preencha os dados corretamente.`);let l=[],u=new Date(i+`T00:00:00`),d=0;for(;d<a;){if(c.includes(u.getDay())){d++;let e=String(u.getDate()).padStart(2,`0`),t=String(u.getMonth()+1).padStart(2,`0`),n=u.getFullYear();l.push({num:d,data:`${e}/${t}/${n}`,hora:o,duracao:s,conteudo:``,visto:!1})}u.setDate(u.getDate()+1)}E.renderizarTelaEdicao({id:null,idAluno:t,nomeAluno:n,curso:r,status:`Ativo`,aulas:l})},E.abrirPlanejamentoEditavel=async e=>{try{let t=await E.api(`/planejamentos/${e}?_t=${Date.now()}`);E.renderizarTelaEdicao(t)}catch{alert(`Erro.`)}},E.abrirPlanejamentoVisualizacao=async e=>{try{let t=await E.api(`/planejamentos/${e}?_t=${Date.now()}`);E.renderizarTelaEdicao(t,!0)}catch{alert(`Erro ao abrir.`)}},E.renderizarTelaEdicao=(e,t=!1)=>{E.planoAtual=e;let n=document.getElementById(`app-content`),r=0;e.aulas.forEach(e=>{if(e.duracao&&e.duracao.includes(`:`)){let[t,n]=e.duracao.split(`:`).map(Number);r+=t*60+(n||0)}});let i=Math.floor(r/60),a=r%60,o=a>0?`${i}h ${a}m`:`${i}H`,s=JSON.parse(localStorage.getItem(E.getTenantKey?E.getTenantKey(`escola_perfil`):`escola_perfil`))||{},c=s.foto?`<img src="${s.foto}" style="height:50px;">`:``,l=t?`App.renderizarPlanejamentosArquivados()`:`App.renderizarPlanejamentosSalvos()`,u=t?`<br><span style="color:#e74c3c; font-size:12px;">(ARQUIVADO - APENAS LEITURA)</span>`:``;n.innerHTML=`
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
                <div style="display:flex; align-items:center; gap:15px;">${c}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${E.escapeHTML(s.nome||`ESCOLA`)}</h2><div style="font-size:12px;">CNPJ: ${E.escapeHTML(s.cnpj||``)}</div></div></div>
                <div style="text-align:right;"><div><b>Planejamento Pedagógico</b> ${u}</div><div style="font-size:12px;">Emissão: ${new Date().toLocaleDateString(`pt-BR`)}</div></div>
            </div>
            
            <div style="border:1px solid #000; padding:10px; font-size:12px; margin-bottom:15px; background:#fafafa;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="width:60%;">
                        <div style="margin-bottom:5px;"><b>ALUNO:</b> ${E.escapeHTML(e.nomeAluno)}</div>
                        <div><b>TOTAL DE AULAS:</b> ${e.aulas.length}</div>
                    </div>
                    <div style="width:40%;">
                        <div style="margin-bottom:5px;"><b>CURSO:</b> ${E.escapeHTML(e.curso)}</div>
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
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${E.escapeHTML(e.data)}" onchange="App.atualizarAula(${n},'data',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${E.escapeHTML(e.hora)}" onchange="App.atualizarAula(${n},'hora',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent; font-weight:bold; color:#2980b9;" value="${E.escapeHTML(e.duracao)}" onchange="App.atualizarAula(${n},'duracao',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; background:transparent;" placeholder="..." value="${E.escapeHTML(e.conteudo)}" onchange="App.atualizarAula(${n},'conteudo',this.value)"></td>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;"><input type="checkbox" ${t?`disabled`:``} ${e.visto?`checked`:``} onchange="App.atualizarAula(${n},'visto',this.checked)"></td>
                        </tr>`).join(``)}
                        <tr style="background:#eee; font-weight:bold; border-top:2px solid #000;"><td colspan="3" style="text-align:right; padding:10px;">Carga Horária Total =</td><td style="text-align:center; padding:10px; color:#2980b9;">${o}</td><td colspan="2"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>`},E.atualizarAula=(e,t,n)=>{E.planoAtual&&E.planoAtual.aulas[e]&&(E.planoAtual.aulas[e][t]=n),t===`duracao`&&E.renderizarTelaEdicao(E.planoAtual)},E.salvarPlanejamentoBanco=async()=>{if(!E.planoAtual)return;document.activeElement&&document.activeElement.blur();let e=E.planoAtual.id?`PUT`:`POST`,t=E.planoAtual.id?`/planejamentos/${E.planoAtual.id}`:`/planejamentos`;E.planoAtual.id||(E.planoAtual.id=typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString()),E.planoAtual.status||(E.planoAtual.status=`Ativo`);let n=document.querySelector(`button[onclick="App.salvarPlanejamentoBanco()"]`),r=n?n.innerText:`💾 SALVAR`;n&&(n.innerText=`A sincronizar tudo... ⏳`,n.disabled=!0),document.body.style.cursor=`wait`;try{await E.api(t,e,E.planoAtual);let n=(await E.api(`/chamadas?_t=${Date.now()}`)).filter(e=>e.idAluno===E.planoAtual.idAluno),r=new Date().toISOString().split(`T`)[0],i=[],a=0,o=0,s=0;E.planoAtual.aulas.forEach((e,t)=>{let c=e.data.includes(`/`)?e.data.split(`/`):e.data.split(`-`);if(c.length===3){let l=c[0].length===4?`${c[0]}-${c[1]}-${c[2]}`:`${c[2]}-${c[1]}-${c[0]}`;if(l<=r){let r=n.find(e=>e.data===l);if(e.visto===!0)if(r)r.status!==`Presença`&&r.status!==`Reposição`?(i.push(E.api(`/chamadas/${r.id}`,`PUT`,{...r,status:`Presença`,duracao:e.duracao})),o++):r.duracao!==e.duracao&&(i.push(E.api(`/chamadas/${r.id}`,`PUT`,{...r,duracao:e.duracao})),o++);else{let n={id:Date.now().toString()+Math.floor(Math.random()*1e3)+t,idAluno:E.planoAtual.idAluno,nomeAluno:E.planoAtual.nomeAluno,data:l,status:`Presença`,duracao:e.duracao||`01:00`};i.push(E.api(`/chamadas`,`POST`,n)),a++}else r&&(r.status===`Presença`||r.status===`Reposição`)&&(i.push(E.api(`/chamadas/${r.id}`,`DELETE`)),s++)}}}),i.length>0&&await Promise.all(i);let c=`Planejamento Salvo!`;(a>0||o>0||s>0)&&(c+=` Sincronizado: ${a}✅ | ${o}✏️ | ${s}🗑️`),E.showToast(c,`success`);let l=document.getElementById(`app-content`);l&&(l.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await E.renderizarPlanejamentosSalvos()}catch(e){E.showToast(`Erro na sincronização.`,`error`),console.error(e)}finally{n&&(n.innerText=r,n.disabled=!1),document.body.style.cursor=`default`}},E.arquivarPlanejamento=e=>{E.confirmar(`Arquivar Planejamento`,`Tem a certeza que deseja enviar este planejamento para o arquivo morto? Ele deixará de aparecer na sua lista principal.`,`Sim, Arquivar`,`#8e44ad`,async()=>{try{let t=(await E.api(`/planejamentos?_t=${Date.now()}`)).find(t=>String(t.id)===String(e));if(!t)return E.showToast(`Planejamento não encontrado.`,`error`);t.status=`Arquivado`,await E.api(`/planejamentos/${e}`,`PUT`,t),E.showToast(`Planejamento Arquivado com sucesso!`,`success`);let n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await E.renderizarPlanejamentosSalvos()}catch{E.showToast(`Erro ao arquivar.`,`error`)}})},E.restaurarPlanejamento=e=>{E.confirmar(`Restaurar Planejamento`,`Deseja reativar este planejamento e devolvê-lo para a lista ativa?`,`Restaurar`,`#27ae60`,async()=>{try{let t=(await E.api(`/planejamentos?_t=${Date.now()}`)).find(t=>String(t.id)===String(e));if(!t)return E.showToast(`Planejamento não encontrado.`,`error`);t.status=`Ativo`,await E.api(`/planejamentos/${e}`,`PUT`,t),E.showToast(`Planejamento Reativado com sucesso!`,`success`);let n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando arquivo morto... ⏳</p>`),await E.renderizarPlanejamentosArquivados()}catch{E.showToast(`Erro ao reativar.`,`error`)}})},E.excluirPlanejamento=e=>{E.confirmar(`Atenção!`,`Deseja excluir DEFINITIVAMENTE este planejamento? Esta ação é irreversível.`,`Excluir`,`#e74c3c`,async()=>{await E.api(`/planejamentos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await E.renderizarPlanejamentosSalvos()})},E.excluirPlanejamentoArquivado=e=>{E.confirmar(`Atenção!`,`Deseja limpar este registo do arquivo morto para sempre?`,`Excluir`,`#e74c3c`,async()=>{await E.api(`/planejamentos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando arquivo morto... ⏳</p>`),await E.renderizarPlanejamentosArquivados()})},E.processarAutoAjustePlano=(e,t)=>{if(!e||!e.aulas||e.aulas.length===0)return e;let n=e.aulas[0].data,r=n.includes(`/`)?n.split(`/`):n.split(`-`),i=r[0].length===4?`${r[0]}-${r[1]}-${r[2]}`:`${r[2]}-${r[1]}-${r[0]}`,a=t.filter(t=>t.idAluno===e.idAluno&&t.data>=i).sort((e,t)=>new Date(e.data)-new Date(t.data)),o=a.filter(e=>e.status===`Presença`||e.status===`Reposição`),s=[];if(o.length>0){let e=o.slice(-4);s=[...new Set(e.map(e=>{let[t,n,r]=e.data.split(`-`);return new Date(`${t}-${n}-${r}T12:00:00`).getDay()}))]}if(s.length===0){let t=[...new Set(e.aulas.map(e=>{if(!e.data)return-1;let t=e.data.includes(`/`)?e.data.split(`/`):e.data.split(`-`);if(t.length===3){let e=t[0].length===4?t[0]:t[2],n=t[1],r=t[0].length===2?t[0]:t[2],i=new Date(`${e}-${n}-${r}T12:00:00`);return isNaN(i.getTime())?-1:i.getDay()}return-1}).filter(e=>e!==-1))];s=t.length>0?t:[1,2,3,4,5]}let c=0,l=e.aulas.length>0?e.aulas[0].hora:`08:00`,u=new Date(`${i}T12:00:00`);if(u.setDate(u.getDate()-1),a.length>0){let e=a[a.length-1];u=new Date(`${e.data}T12:00:00`)}for(let t=0;t<e.aulas.length;t++){let n=e.aulas[t];if(n.hora&&(l=n.hora),c<o.length){let e=o[c],t=e.data,r=t.includes(`/`)?t.split(`/`):t.split(`-`),i=r[0].length===4?r[0]:r[2],a=r[1];n.data=`${r[0].length===2?r[0]:r[2]}/${a}/${i}`,e.duracao&&(n.duracao=e.duracao),n.visto=!0,c++}else{for(n.visto=!1,u.setDate(u.getDate()+1);!s.includes(u.getDay());)u.setDate(u.getDate()+1);n.data=`${String(u.getDate()).padStart(2,`0`)}/${String(u.getMonth()+1).padStart(2,`0`)}/${u.getFullYear()}`}}for(;c<o.length;){let t=o[c],[n,r,i]=t.data.split(`-`);e.aulas.push({num:e.aulas.length+1,data:`${i}/${r}/${n}`,hora:l,duracao:t.duracao||`01:00`,conteudo:`Aula Adicional (Auto-Ajuste)`,visto:!0}),c++}return e},E.sincronizarPlanejamentoComChamadasUI=async()=>{if(!E.planoAtual||!E.planoAtual.idAluno)return;let e=document.getElementById(`btn-sync-plan`),t=e.innerHTML;e.innerHTML=`A analisar Padrões... ⏳`,e.disabled=!0,document.body.style.cursor=`wait`;try{let e=await E.api(`/chamadas?_t=${Date.now()}`);E.planoAtual=E.processarAutoAjustePlano(E.planoAtual,e),E.renderizarTelaEdicao(E.planoAtual),E.showToast(`Datas, Tempos e Aulas Extra Sincronizados! 🎉`,`success`)}catch{E.showToast(`Erro ao sincronizar planejamento.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1),document.body.style.cursor=`default`}},E.renderizarBoletimVisual=async()=>{E.setTitulo(`Boletim Escolar`);let e=document.getElementById(`app-content`);e.innerHTML=`A carregar...`;try{let t=`
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;">${`<option value="">-- Selecione o Aluno --</option>`+(await E.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${E.escapeHTML(e.nome)}</option>`).join(``)}</select>
                <button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR BOLETIM</button>
            </div>
        `;e.innerHTML=E.UI.card(`📄 Emitir Boletim Escolar`,``,t,`800px`)+`<div id="boletim-area" style="margin-top:30px;"></div>`}catch{e.innerHTML=`Erro.`}},E.gerarBoletimTela=async()=>{let e=document.getElementById(`bol-aluno`).value;if(!e)return E.showToast(`Selecione um aluno.`,`error`);let t=document.getElementById(`boletim-area`);t.innerHTML=`<p style="text-align:center;">A gerar boletim...</p>`;let n=parseFloat(localStorage.getItem(E.getTenantKey?E.getTenantKey(`media_aprovacao`):`media_aprovacao`))||6,r=localStorage.getItem(E.getTenantKey?E.getTenantKey(`regime_letivo`):`regime_letivo`)||`Bimestral`,i=6,a=`BIMESTRE`;r===`Trimestral`?(i=4,a=`TRIMESTRE`):r===`Semestral`?(i=2,a=`SEMESTRE`):r===`Anual`&&(i=1,a=`PERÍODO ÚNICO`);try{let[r,o,s,c,l]=await Promise.all([E.api(`/alunos/${e}`),E.api(`/avaliacoes?_t=${Date.now()}`),E.api(`/chamadas?_t=${Date.now()}`),E.api(`/escola`),E.api(`/planejamentos?_t=${Date.now()}`)]),u=l.find(t=>t.idAluno===e&&t.status!==`Arquivado`),d=s.filter(t=>t.idAluno===e&&(t.status===`Presença`||t.status===`Reposição`)).sort((e,t)=>new Date(e.data)-new Date(t.data)),f=`__/__/____`,p=`__/__/____`,m=0;d.forEach(e=>{if(e.duracao&&e.duracao.includes(`:`)){let[t,n]=e.duracao.split(`:`).map(Number);m+=t*60+(n||0)}});let h=Math.floor(m/60),g=m%60,_=g>0?`${h}h ${g}m`:`${h}H`;u&&u.aulas&&u.aulas.length>0?(f=E.escapeHTML(u.aulas[0].data),p=E.escapeHTML(u.aulas[u.aulas.length-1].data)):d.length>0?(f=d[0].data.split(`-`).reverse().join(`/`),p=d[d.length-1].data.split(`-`).reverse().join(`/`)):f=new Date().toLocaleDateString(`pt-BR`);let v=E.escapeHTML(r.curso||(u?u.curso:`Geral`)),y=E.escapeHTML(r.turma||`Não informada`),b=o.filter(t=>t.idAluno===e&&t.comporBoletim!==!1),x={};b.forEach(e=>{let t=e.disciplina||`Geral`;x[t]||(x[t]={nome:t,notas:[],total:0,periodosLancados:new Set}),x[t].notas.push(e),x[t].total+=parseFloat(e.nota)||0;let n=e.periodo||e.bimestre;n&&x[t].periodosLancados.add(n)});let S=``;Object.keys(x).length===0?S=`<tr><td colspan="4" style="text-align:center; padding:15px; color:#999;">Sem notas oficiais lançadas para este aluno.</td></tr>`:Object.keys(x).forEach(e=>{let t=x[e],r=n*(t.periodosLancados.size>0?t.periodosLancados.size:1),a=n*i,o=t.total>=r,s=o?`#27ae60`:`#c0392b`,c=o?`<span style="color:${s}; font-weight:bold; font-size:14px;">NO PADRÃO</span>`:`<span style="color:${s}; font-weight:bold; font-size:14px;">RECUPERAÇÃO</span>`,l=t.notas.map(e=>`<span style="font-size:11px;">${E.escapeHTML(e.periodo||e.bimestre)} - ${E.escapeHTML(e.tipo)}: <b>${E.escapeHTML(e.nota)}</b></span>`).join(`<br>`);S+=`
                <tr>
                    <td style="padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><b>${E.escapeHTML(t.nome)}</b></td>
                    <td style="padding:10px; border-bottom:1px solid #eee;">${l}</td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><span style="font-size:16px; font-weight:bold; color:${s};">${t.total.toFixed(1)}</span></td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;">${c}<br><span style="font-size:10px; color:#7f8c8d;">Meta Anual: ${a.toFixed(1)} pts</span></td>
                </tr>`});let C=c.foto?`<img src="${c.foto}" style="height:60px; object-fit:contain;">`:``,w=new Date().toLocaleDateString(`pt-BR`);t.innerHTML=`
            <div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR BOLETIM</button></div>
            <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${C}<div><h2 style="margin:0; text-transform:uppercase;">${E.escapeHTML(c.nome||`INSTITUIÇÃO`)}</h2><div style="font-size:12px;">CNPJ: ${E.escapeHTML(c.cnpj||``)}</div></div></div>
                    <div style="text-align:right;"><div><b>BOLETIM ESCOLAR</b></div><div style="font-size:10px; color:#999;">Emissão: ${w}</div></div>
                </div>
                <div style="padding:15px; background:#fafafa; border:1px solid #000; margin-bottom:15px;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">ALUNO: ${E.escapeHTML(r.nome).toUpperCase()}</div>
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
            </div>`}catch{E.showToast(`Erro ao gerar boletim.`,`error`)}},E.salvarConfigNotas=()=>{let e=document.getElementById(`config-nota-media`).value,t=document.getElementById(`config-nota-max`).value,n=document.getElementById(`config-nota-regime`).value;localStorage.setItem(E.getTenantKey?E.getTenantKey(`media_aprovacao`):`media_aprovacao`,e),localStorage.setItem(E.getTenantKey?E.getTenantKey(`nota_maxima`):`nota_maxima`,t),localStorage.setItem(E.getTenantKey?E.getTenantKey(`regime_letivo`):`regime_letivo`,n),E.showToast(`Regras de avaliação guardadas com sucesso!`,`success`),E.renderizarAvaliacoesPro()},E.renderizarAvaliacoesPro=async()=>{E.setTitulo(`Avaliações e Notas`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar dados...</p>`;let t=localStorage.getItem(E.getTenantKey?E.getTenantKey(`media_aprovacao`):`media_aprovacao`)||`6.0`,n=localStorage.getItem(E.getTenantKey?E.getTenantKey(`nota_maxima`):`nota_maxima`)||`10.0`,r=localStorage.getItem(E.getTenantKey?E.getTenantKey(`regime_letivo`):`regime_letivo`)||`Bimestral`,i=parseFloat(t)/parseFloat(n),a=``,o=`Período`;r===`Bimestral`?(a=`<option value="1º Bimestre">1º Bimestre</option><option value="2º Bimestre">2º Bimestre</option><option value="3º Bimestre">3º Bimestre</option><option value="4º Bimestre">4º Bimestre</option><option value="5º Bimestre">5º Bimestre</option><option value="6º Bimestre">6º Bimestre</option>`,o=`Bimestre`):r===`Trimestral`?(a=`<option value="1º Trimestre">1º Trimestre</option><option value="2º Trimestre">2º Trimestre</option><option value="3º Trimestre">3º Trimestre</option><option value="4º Trimestre">4º Trimestre</option>`,o=`Trimestre`):r===`Semestral`?(a=`<option value="1º Semestre">1º Semestre</option><option value="2º Semestre">2º Semestre</option>`,o=`Semestre`):r===`Anual`&&(a=`<option value="Período Único">Período Único</option>`,o=`Período`);try{let[s,c,l,u]=await Promise.all([E.api(`/alunos`),E.api(`/turmas`),E.api(`/cursos`),E.api(`/avaliacoes?_t=${Date.now()}`)]);E.cacheAlunos=s;let d=u.sort((e,t)=>t.id-e.id),f=s.filter(e=>!e.status||e.status===`Ativo`),p=`<option value="">-- Turma Completa --</option>`+c.map(e=>`<option value="${E.escapeHTML(e.nome)}">${E.escapeHTML(e.nome)}</option>`).join(``),m=`<option value="">-- Aluno Específico --</option>`+f.map(e=>`<option value="${e.id}">${E.escapeHTML(e.nome)}</option>`).join(``),h=`<option value="Geral">Geral / Curso Padrão</option>`+l.map(e=>`<option value="${E.escapeHTML(e.nome)}">${E.escapeHTML(e.nome)}</option>`).join(``),g=new Date().toISOString().split(`T`)[0],_=`
            <div style="background:#fff; border-left:4px solid #8e44ad; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05); margin-bottom:20px; display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                <div style="width:100%; font-size:12px; font-weight:bold; color:#8e44ad; text-transform:uppercase; margin-bottom:-5px;">⚙️ Configuração do Sistema de Avaliação</div>
                ${k(`Regime Letivo:`,`config-nota-regime`,`<option value="Bimestral" ${r===`Bimestral`?`selected`:``}>Bimestral (6 Períodos)</option><option value="Trimestral" ${r===`Trimestral`?`selected`:``}>Trimestral (4 Períodos)</option><option value="Semestral" ${r===`Semestral`?`selected`:``}>Semestral (2 Períodos)</option><option value="Anual" ${r===`Anual`?`selected`:``}>Anual (1 Período)</option>`)}
                ${O(`Média de Aprovação:`,`config-nota-media`,`number`,t,`step="0.1"`)}
                ${O(`Nota Máx. do Período:`,`config-nota-max`,`number`,n,`step="0.1"`)}
                <button onclick="App.salvarConfigNotas()" class="btn-primary" style="background:#8e44ad; border:none; height:41px; padding:0 20px; margin-bottom: 5px;">💾 SALVAR REGRAS</button>
            </div>
        `,v=`
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${k(`Filtrar por Turma:`,`nota-turma`,p)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${k(`Buscar Aluno Único:`,`nota-aluno`,m)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px;">
                ${k(`Disciplina/Curso:`,`nota-disc`,h)}
                ${k(`Tipo de Avaliação:`,`nota-tipo`,`<option value="Teste">Teste Formativo</option><option value="Prova">Prova Oficial</option><option value="Pesquisa">Pesquisa</option><option value="Trabalho">Trabalho</option><option value="Outro">Outro (Especificar)</option>`,`onchange="App.toggleTipoOutroNota()"`)}
                <div id="div-outro-nota" style="flex: 1; min-width: 150px; display:none;">
                    <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Especifique:</label>
                    <input type="text" id="nota-outro-desc" placeholder="Ex: Seminário" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                </div>
                ${k(o+`:`,`nota-periodo`,a)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                ${O(`Valor desta Avaliação (Pts):`,`nota-max`,`number`,n,`step="0.1"`)}
                ${O(`Data da Avaliação:`,`nota-data`,`date`,g,`max="${g}"`)}
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
                                <td style="padding:12px; font-weight:bold;">${E.escapeHTML(e.nomeAluno)}</td>
                                <td style="padding:12px; color:#555;">${E.escapeHTML(e.disciplina||`-`)}</td>
                                <td style="padding:12px;">${e.data?E.escapeHTML(e.data.split(`-`).reverse().join(`/`)):`-`}</td>
                                <td style="padding:12px;">${E.escapeHTML(e.tipo)} ${a}</td>
                                <td style="padding:12px;">${E.escapeHTML(e.periodo||e.bimestre||`-`)}</td>
                                <td style="padding:12px; text-align:center;"><strong style="color:${r}">${E.escapeHTML(e.nota)}</strong> <span style="color:#999; font-size:11px;">/ ${E.escapeHTML(t)}</span></td>
                                <td style="padding:12px; text-align:right;">
                                    <button onclick="App.editarAvaliacao('${e.id}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;" title="Editar">✏️</button>
                                    <button onclick="App.excluirAvaliacao('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;" title="Excluir">🗑️</button>
                                </td>
                            </tr>`}).join(``)}
                    </tbody>
                </table>
            </div>
        `;e.innerHTML=_+E.UI.card(`📝 Lançamento de Notas / Habilidades`,``,v,`100%`)+`<div id="area-lista-notas" style="margin-top:20px;"></div><div style="margin-top:20px;">`+E.UI.card(`Histórico de Notas Lançadas`,``,y,`100%`)+`</div>`}catch{e.innerHTML=`Erro ao carregar avaliações.`}},E.toggleTipoOutroNota=()=>{let e=document.getElementById(`nota-tipo`).value;document.getElementById(`div-outro-nota`).style.display=e===`Outro`?`block`:`none`},E.editarAvaliacao=async e=>{let t=await E.api(`/avaliacoes/${e}?_t=${Date.now()}`);document.getElementById(`nota-aluno`).value=t.idAluno,document.getElementById(`nota-turma`).value=``,document.getElementById(`nota-disc`).value=t.disciplina||`Geral`,[`Teste`,`Prova`,`Pesquisa`,`Trabalho`].includes(t.tipo)?(document.getElementById(`nota-tipo`).value=t.tipo,document.getElementById(`div-outro-nota`).style.display=`none`):(document.getElementById(`nota-tipo`).value=`Outro`,E.toggleTipoOutroNota(),document.getElementById(`nota-outro-desc`).value=t.tipo),document.getElementById(`nota-max`).value=t.valorMax;let n=document.getElementById(`nota-periodo`);n&&(n.value=t.periodo||t.bimestre),document.getElementById(`nota-data`).value=t.data||new Date().toISOString().split(`T`)[0],document.getElementById(`btn-cancel-nota`).style.display=`inline-block`,E.idAvaliacaoEditando=e,E.carregarListaNotas(),document.querySelector(`.card`).scrollIntoView({behavior:`smooth`})},E.cancelarEdicaoNota=()=>{E.idAvaliacaoEditando=null,document.getElementById(`nota-aluno`).value=``,document.getElementById(`btn-cancel-nota`).style.display=`none`,document.getElementById(`area-lista-notas`).innerHTML=``,E.showToast(`Modo de edição cancelado.`,`info`)},E.carregarListaNotas=async()=>{let e=document.getElementById(`nota-turma`).value,t=document.getElementById(`nota-aluno`).value,n=document.getElementById(`nota-disc`).value,r=document.getElementById(`nota-tipo`).value;r===`Outro`&&(r=document.getElementById(`nota-outro-desc`).value||`Outro`);let i=document.getElementById(`nota-data`).value,a=document.getElementById(`nota-max`).value;if(!e&&!t)return E.showToast(`Selecione uma Turma OU um Aluno específico.`,`warning`);if(!n||!i)return E.showToast(`Preencha Disciplina e Data.`,`warning`);if(i>new Date().toISOString().split(`T`)[0])return E.showToast(`Não é permitido abrir pautas para datas futuras.`,`warning`);let o=document.getElementById(`area-lista-notas`);o.innerHTML=`<p style="text-align:center; padding:20px;">A preparar pauta de lançamento... ⏳</p>`;try{let[s,c]=await Promise.all([E.api(`/alunos`),E.api(`/avaliacoes?_t=${Date.now()}`)]),l=[];if(l=t?s.filter(e=>e.id===t):s.filter(t=>t.turma===e),l=l.filter(e=>!e.status||e.status===`Ativo`),l.length===0){o.innerHTML=`<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno ativo encontrado para este filtro.</p></div>`;return}let u=``,d=!0;l.forEach(e=>{let t=null;t=E.idAvaliacaoEditando&&e.id===document.getElementById(`nota-aluno`).value?c.find(e=>e.id===E.idAvaliacaoEditando):c.find(t=>t.idAluno===e.id&&t.data===i&&t.disciplina===n&&t.tipo===r);let o=t?t.nota:``;t&&t.comporBoletim===!1&&(d=!1);let s=E.idAvaliacaoEditando&&t?`data-id-avaliacao="${t.id}"`:``;u+=`
            <tr style="border-bottom:1px solid #eee;" class="linha-nota" data-id="${e.id}" data-nome="${E.escapeHTML(e.nome)}" ${s}>
                <td style="padding:12px; font-weight:500;">${E.escapeHTML(e.nome)}</td>
                <td style="padding:12px; width:150px;">
                    <input type="number" class="valor-nota" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; text-align:center; font-weight:bold; color:var(--accent);" step="0.1" max="${a}" placeholder="0.0" value="${E.escapeHTML(o)}">
                </td>
            </tr>`}),o.innerHTML=(E.idAvaliacaoEditando?`<div style="background:#f39c12; color:#fff; padding:10px; text-align:center; font-weight:bold; margin-bottom:10px; border-radius:5px; animation: pop 0.3s;">⚠️ MODO DE EDIÇÃO ATIVO</div>`:``)+`
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #2980b9;">
                <div style="padding:15px; background:#e8f4f8; border-bottom:1px solid #d1e8f0; font-size:13px; color:#2980b9; display:flex; justify-content:space-between; align-items:center;">
                    <span><b>Lançamento:</b> ${E.escapeHTML(r)} de ${E.escapeHTML(n)}</span>
                    <span style="background:#2980b9; color:white; padding:4px 10px; border-radius:12px; font-weight:bold;">Máx: ${E.escapeHTML(a)} pts</span>
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
        `}catch{o.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar a pauta.</p>`}},E.salvarNotasLote=async()=>{let e=document.getElementById(`nota-disc`).value,t=document.getElementById(`nota-tipo`).value;t===`Outro`&&(t=document.getElementById(`nota-outro-desc`).value||`Outro`);let n=document.getElementById(`nota-data`).value,r=document.getElementById(`nota-max`).value,i=document.getElementById(`nota-periodo`).value,a=document.getElementById(`nota-vai-boletim`),o=a?a.checked:!0,s=document.querySelectorAll(`.linha-nota`);if(s.length===0)return;if(n>new Date().toISOString().split(`T`)[0])return E.showToast(`Bloqueado: Não é possível gravar notas com datas futuras.`,`error`);let c=document.querySelector(`button[onclick="App.salvarNotasLote()"]`),l=c.innerText;c.innerText=`A arquivar... ⏳`,c.disabled=!0,document.body.style.cursor=`wait`;try{let a=[],c=await E.api(`/avaliacoes?_t=${Date.now()}`);s.forEach(s=>{let l=s.getAttribute(`data-id`),u=s.getAttribute(`data-nome`),d=s.getAttribute(`data-id-avaliacao`),f=s.querySelector(`.valor-nota`).value;if(f===``)return;let p=null;p=d?c.find(e=>e.id===d):c.find(r=>r.idAluno===l&&r.data===n&&r.disciplina===e&&r.tipo===t);let m={idAluno:l,nomeAluno:u,disciplina:e,tipo:t,data:n,valorMax:r,nota:f,periodo:i,bimestre:i,dataLancamento:new Date().toISOString().split(`T`)[0],comporBoletim:o};p?a.push(E.api(`/avaliacoes/${p.id}`,`PUT`,{...p,nota:f,valorMax:r,data:n,disciplina:e,tipo:t,periodo:i,bimestre:i,comporBoletim:o})):(m.id=typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).substr(2),a.push(E.api(`/avaliacoes`,`POST`,m)))}),await Promise.all(a),E.showToast(`Avaliação arquivada com sucesso!`,`success`),E.cancelarEdicaoNota();let l=document.getElementById(`app-content`);l&&(l.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando avaliações... ⏳</p>`),await E.renderizarAvaliacoesPro()}catch{E.showToast(`Erro ao salvar as notas.`,`error`)}finally{c&&(c.innerText=l,c.disabled=!1),document.body.style.cursor=`default`}},E.excluirAvaliacao=e=>{E.confirmar(`Excluir Nota`,`Deseja mesmo excluir esta avaliação? Isto irá afetar o boletim do aluno.`,`Excluir`,`#e74c3c`,async()=>{await E.api(`/avaliacoes/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando avaliações... ⏳</p>`),await E.renderizarAvaliacoesPro()})},E.cachePedagogico={chamadas:null,alunos:null,turmas:null,planejamentos:null},E.datasLancamentoChamada=[],E.filaEdicaoChamada=[],E.renderizarChamadaPro=async()=>{E.setTitulo(`Controle de Presença`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar dados rapidamente... ⚡</p>`,E.datasLancamentoChamada=[new Date().toISOString().split(`T`)[0]],E.filaEdicaoChamada=[];try{let[t,n,r,i]=await Promise.all([E.api(`/alunos`),E.api(`/turmas`),E.api(`/chamadas?_t=${Date.now()}`),E.api(`/planejamentos?_t=${Date.now()}`)]);E.cachePedagogico.alunos=t,E.cachePedagogico.turmas=n,E.cachePedagogico.chamadas=Array.isArray(r)?r:[],E.cachePedagogico.planejamentos=i;let a=E.cachePedagogico.planejamentos.filter(e=>e.status!==`Arquivado`).map(e=>e.idAluno),o=[...E.cachePedagogico.chamadas].sort((e,t)=>new Date(t.data)-new Date(e.data)),s=E.cachePedagogico.alunos.filter(e=>(!e.status||e.status===`Ativo`)&&a.includes(e.id)),c=`<option value="">-- Turma Completa --</option>`+E.cachePedagogico.turmas.map(e=>`<option value="${E.escapeHTML(e.nome)}">${E.escapeHTML(e.nome)}</option>`).join(``),l=`<option value="">-- Aluno Específico --</option>`+s.map(e=>`<option value="${e.id}">${E.escapeHTML(e.nome)}</option>`).join(``),u=new Date().toISOString().split(`T`)[0],d=`
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${k(`Filtrar por Turma:`,`chamada-turma`,c)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${k(`Buscar Aluno Único:`,`chamada-aluno`,l)}
            </div>
            
            <div style="background:#fff; border:1px solid #d5f5e3; padding:15px; border-radius:8px; margin-bottom:15px; display:flex; flex-direction:column; gap:10px;">
                <label style="font-weight:bold; font-size:12px; color:#27ae60;">📅 Selecionar Datas para o Lançamento:</label>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end;">
                    <div style="display:flex; gap:5px; flex:1; min-width:200px;">
                        <input type="date" id="input-nova-data" value="${u}" max="${u}" style="flex:1; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        <button onclick="App.adicionarDataFila()" style="background:#27ae60; color:white; border:none; padding:0 15px; border-radius:5px; font-weight:bold; cursor:pointer;">+ Add</button>
                    </div>
                    ${O(`Duração (Padrão):`,`chamada-duracao`,`time`,`01:00`,`style="max-width:120px;"`)}
                    <button onclick="App.carregarListaChamada()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR MATRIZ</button>
                    <button onclick="App.cancelarEdicaoChamada()" id="btn-cancel-chamada" style="height:41px; padding:0 20px; background:#95a5a6; color:white; border:none; border-radius:5px; display:none; cursor:pointer;">❌ Cancelar</button>
                </div>
                <div id="fila-datas-ui" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:5px;"></div>
            </div>
        `,f=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; gap:10px;">
                    <button onclick="App.excluirLotePedagogico('/chamadas', 'check-chamada', App.renderizarChamadaPro)" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s;">🗑️ Excluir Lote</button>
                    <button onclick="App.editarLoteChamada('check-chamada')" style="background:#3498db; color:white; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:0.2s; box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);">✏️ Editar Selecionados</button>
                </div>
                <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; gap: 10px; flex:1; min-width:250px;">
                    <span style="font-size: 18px; color: #aaa;">🔍</span>
                    <input type="text" id="input-busca-chamada" placeholder="Pesquisar histórico..." oninput="App.filtrarTabela('input-busca-chamada', 'tabela-historico-chamadas')" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
                </div>
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
                        ${o.map(e=>{let t=`#333`;e.status===`Presença`?t=`green`:e.status===`Falta`?t=`red`:e.status===`Reposição`&&(t=`#2980b9`);let n=E.escapeHTML(e.status);return(e.status===`Falta`||e.status===`Falta Justificada`)&&e.motivo&&(n+=`<br><span style="font-size:10px; color:#7f8c8d;">Motivo: ${E.escapeHTML(e.motivo)}</span>`),`
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px; text-align:center;"><input type="checkbox" class="check-chamada" value="${e.id}"></td>
                                <td style="padding:12px; color:#555;">${e.data.split(`-`).reverse().join(`/`)}</td>
                                <td style="padding:12px; font-weight:bold;">${E.escapeHTML(e.nomeAluno)}</td>
                                <td style="padding:12px; font-weight:bold; color:${t};">${n}</td>
                                <td style="padding:12px; color:#555;">${E.escapeHTML(e.duracao)}</td>
                                <td style="padding:12px; text-align:right;">
                                    <button onclick="App.editarLancamentoChamada('${e.idAluno}', '${e.data}', '${e.duracao}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar na Matriz">✏️</button>
                                    <button onclick="App.excluirLancamentoChamada('${e.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button>
                                </td>
                            </tr>`}).join(``)}
                    </tbody>
                </table>
            </div>
        `;e.innerHTML=E.UI.card(`📝 Matriz de Frequência`,``,d,`100%`)+`<div id="area-lista-chamada" style="margin-top:20px;"></div><div style="margin-top:20px;">`+E.UI.card(`Histórico Completo de Lançamentos`,``,f,`100%`)+`</div>`,E.atualizarFilaDatasUI()}catch{e.innerHTML=`Erro ao carregar módulo de chamada.`}},E.adicionarDataFila=()=>{let e=document.getElementById(`input-nova-data`).value,t=new Date().toISOString().split(`T`)[0];if(!e)return E.showToast(`Selecione uma data válida.`,`warning`);if(e>t)return E.showToast(`Não é permitido adicionar datas futuras.`,`warning`);if(E.datasLancamentoChamada.includes(e))return E.showToast(`Esta data já está na lista.`,`info`);E.datasLancamentoChamada.push(e),E.datasLancamentoChamada.sort(),E.atualizarFilaDatasUI()},E.removerDataFila=e=>{E.datasLancamentoChamada=E.datasLancamentoChamada.filter(t=>t!==e),E.atualizarFilaDatasUI()},E.atualizarFilaDatasUI=()=>{let e=document.getElementById(`fila-datas-ui`);if(e){if(E.datasLancamentoChamada.length===0){e.innerHTML=`<span style="font-size:12px; color:#e74c3c; font-style:italic;">Adicione pelo menos uma data para gerar a matriz.</span>`;return}e.innerHTML=E.datasLancamentoChamada.map(e=>`
        <div style="background:#2ecc71; color:white; padding:5px 10px; border-radius:20px; font-size:12px; font-weight:bold; display:flex; align-items:center; gap:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
            ${e.split(`-`).reverse().join(`/`)}
            <span onclick="App.removerDataFila('${e}')" style="cursor:pointer; background:rgba(0,0,0,0.2); border-radius:50%; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; font-size:10px;">✖</span>
        </div>
    `).join(``)}},E.editarLoteChamada=e=>{let t=document.querySelectorAll(`.`+e+`:checked`);if(t.length===0)return E.showToast(`Selecione pelo menos um registo na tabela para editar.`,`warning`);E.filaEdicaoChamada=[];let n=E.cachePedagogico.chamadas||[];t.forEach(e=>{let t=e.value,r=n.find(e=>String(e.id)===String(t));r&&E.filaEdicaoChamada.push({idAluno:r.idAluno,data:r.data,duracao:r.duracao})}),E.filaEdicaoChamada.length>0&&(E.showToast(`Assistente ativado: A iniciar edição de ${E.filaEdicaoChamada.length} registo(s)...`,`info`),E.processarFilaEdicaoChamada())},E.processarFilaEdicaoChamada=()=>{if(E.filaEdicaoChamada.length>0){let e=E.filaEdicaoChamada.shift();E.editarLancamentoChamada(e.idAluno,e.data,e.duracao)}else E.cancelarEdicaoChamada()},E.editarLancamentoChamada=(e,t,n)=>{document.getElementById(`chamada-aluno`).value=e,document.getElementById(`chamada-turma`).value=``,document.getElementById(`chamada-duracao`).value=n,E.datasLancamentoChamada=[t],E.atualizarFilaDatasUI(),document.getElementById(`btn-cancel-chamada`).style.display=`inline-block`,E.carregarListaChamada(),document.querySelector(`.card`).scrollIntoView({behavior:`smooth`})},E.cancelarEdicaoChamada=()=>{E.filaEdicaoChamada=[],document.getElementById(`chamada-aluno`).value=``,document.getElementById(`btn-cancel-chamada`).style.display=`none`,document.getElementById(`area-lista-chamada`).innerHTML=``,E.datasLancamentoChamada=[new Date().toISOString().split(`T`)[0]],E.atualizarFilaDatasUI(),E.showToast(`Modo de edição finalizado/cancelado.`,`info`)},E.atualizarStatusCelula=e=>{let t=e.value;t===`Falta`?e.style.color=`#e74c3c`:t===`Reposição`?e.style.color=`#f39c12`:t===`Presença`?e.style.color=`#27ae60`:e.style.color=`#333`;let n=e.nextElementSibling;n&&n.classList.contains(`motivo-chamada`)&&(t===`Falta`||t===`Falta Justificada`?(n.style.display=`block`,n.focus()):(n.style.display=`none`,n.value=``))},E.marcarTodosChamadaGlobal=e=>{let t=document.querySelectorAll(`.status-chamada`);t.length!==0&&(t.forEach(t=>{t.value=e,E.atualizarStatusCelula(t)}),E.showToast(`Lote aplicado na matriz inteira: ${e}!`,`info`))},E.carregarListaChamada=async()=>{let e=document.getElementById(`chamada-turma`).value,t=document.getElementById(`chamada-aluno`).value;if(!e&&!t)return E.showToast(`Selecione uma Turma OU um Aluno específico.`,`warning`);if(E.datasLancamentoChamada.length===0)return E.showToast(`Adicione pelo menos uma data na fila.`,`warning`);let n=document.getElementById(`area-lista-chamada`);n.innerHTML=`<p style="text-align:center; padding:20px;">A preparar Matriz de Classe... ⚡</p>`;try{let r=E.cachePedagogico.alunos,i=E.cachePedagogico.chamadas,a=E.cachePedagogico.planejamentos.filter(e=>e.status!==`Arquivado`).map(e=>e.idAluno),o=t?r.filter(e=>e.id===t):r.filter(t=>t.turma===e);if(o=o.filter(e=>(!e.status||e.status===`Ativo`)&&a.includes(e.id)),o.length===0){n.innerHTML=`<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno com Planejamento Ativo foi encontrado para este filtro.</p></div>`;return}let s=`<tr><th style="padding:15px; text-align:left; position:sticky; left:0; background:#f8f9fa; z-index:2; border-right:1px solid #ddd;">NOME DO ALUNO</th>`;E.datasLancamentoChamada.forEach(e=>{s+=`<th style="padding:15px; text-align:center; min-width:160px;">${e.split(`-`).reverse().join(`/`)}</th>`}),s+=`</tr>`;let c=``;o.forEach(e=>{c+=`<tr style="border-bottom:1px solid #eee;" class="linha-aluno-matriz" data-id="${e.id}" data-nome="${E.escapeHTML(e.nome)}">`,c+=`<td style="padding:12px; font-weight:500; position:sticky; left:0; background:#fff; z-index:1; border-right:1px solid #ddd;">${E.escapeHTML(e.nome)}</td>`,E.datasLancamentoChamada.forEach(t=>{let n=i.find(n=>String(n.idAluno)===String(e.id)&&n.data===t),r=n?n.status:`Presença`,a=n&&n.motivo?n.motivo:``,o=n?`data-id-chamada="${n.id}"`:``,s=r===`Falta`||r===`Falta Justificada`?`block`:`none`;c+=`
                <td style="padding:8px; vertical-align:top;">
                    <select class="status-chamada" data-data="${t}" ${o} style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; font-weight:bold; color:${r===`Falta`?`#e74c3c`:r===`Reposição`?`#f39c12`:`#27ae60`};" onchange="App.atualizarStatusCelula(this)">
                        <option value="Presença" ${r===`Presença`?`selected`:``}>✅ Presença</option>
                        <option value="Falta" ${r===`Falta`?`selected`:``}>❌ Falta</option>
                        <option value="Reposição" ${r===`Reposição`?`selected`:``}>🔄 Reposição</option>
                        <option value="Falta Justificada" ${r===`Falta Justificada`?`selected`:``}>⚠️ Falta Just.</option>
                        <option value="Feriado" ${r===`Feriado`?`selected`:``}>📅 Feriado</option>
                        <option value="Recesso" ${r===`Recesso`?`selected`:``}>🏖️ Recesso</option>
                        <option value="N/A" ${r===`N/A`?`selected`:``}>➖ N/A (Ignorar)</option>
                    </select>
                    <input type="text" class="motivo-chamada" placeholder="Descreva o motivo..." value="${E.escapeHTML(a)}" style="display:${s}; width:100%; margin-top:5px; padding:6px; border-radius:4px; border:1px dashed #e74c3c; font-size:11px; outline:none;">
                </td>`}),c+=`</tr>`}),n.innerHTML=(E.filaEdicaoChamada.length>0?`<div style="background:#3498db; color:white; padding:12px; text-align:center; font-weight:bold; border-radius:5px; margin-bottom:15px; animation: pop 0.3s; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);">
                ✨ ASSISTENTE DE EDIÇÃO: Faltam ${E.filaEdicaoChamada.length} iten(s) na fila. Ao salvar, o próximo carregará automaticamente!
            </div>`:``)+`
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #27ae60;">
                <div style="padding:15px; background:#eafaf1; border-bottom:1px solid #d5f5e3; font-size:13px; color:#27ae60; font-weight:bold;">
                    Grelha de Frequência em Matriz (${E.datasLancamentoChamada.length} dia(s) selecionado(s))
                </div>
                
            <div style="padding:10px 15px; background:#fff; border-bottom:1px solid #eee; display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                <span style="font-size:12px; color:#999; margin-top:8px; margin-right:auto;">Preencher toda a Matriz:</span>
                <button onclick="App.marcarTodosChamadaGlobal('Presença')" style="background:#eafaf1; color:#27ae60; border:1px solid #27ae60; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px;">✅ Tudo Presente</button>
                <button onclick="App.marcarTodosChamadaGlobal('Falta')" style="background:#fdf2f2; color:#e74c3c; border:1px solid #e74c3c; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px;">❌ Tudo Falta</button>
                <button onclick="App.marcarTodosChamadaGlobal('N/A')" style="background:#f4f6f7; color:#7f8c8d; border:1px solid #bdc3c7; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px;" title="Células N/A não são gravadas no banco">➖ Limpar Matriz (N/A)</button>
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
        `}catch{n.innerHTML=`<p style="color:red; text-align:center;">Erro ao processar a matriz.</p>`}},E.salvarChamadaLote=async()=>{let e=document.getElementById(`chamada-duracao`).value||`01:00`,t=document.querySelectorAll(`.linha-aluno-matriz`);if(t.length===0)return;let n=document.querySelector(`button[onclick="App.salvarChamadaLote()"]`),r=n.innerText;n.innerText=`A arquivar matriz em lote... ⚡`,n.disabled=!0,document.body.style.cursor=`wait`;try{let i=E.cachePedagogico.planejamentos,a=E.cachePedagogico.chamadas,o=[],s=new Set,c=[],l=[...a];if(t.forEach(e=>{let t=e.getAttribute(`data-id`),n=e.getAttribute(`data-nome`);i.some(e=>e.idAluno===t&&e.status!==`Arquivado`)||o.push(n)}),o.length>0){E.showToast(`Bloqueado: Crie um Planejamento para: ${o.join(`, `)}`,`error`),n&&(n.innerText=r,n.disabled=!1),document.body.style.cursor=`default`;return}t.forEach(t=>{let n=t.getAttribute(`data-id`),r=t.getAttribute(`data-nome`);t.querySelectorAll(`.status-chamada`).forEach(t=>{let i=t.value;if(i===`N/A`)return;let o=t.nextElementSibling,u=(i===`Falta`||i===`Falta Justificada`)&&o?o.value.trim():``,d=t.getAttribute(`data-data`),f=t.getAttribute(`data-id-chamada`);s.add(n);let p=null;p=f?a.find(e=>String(e.id)===String(f)):a.find(e=>String(e.idAluno)===String(n)&&e.data===d);let m={idAluno:n,nomeAluno:r,data:d,status:i,duracao:e,motivo:u};if(p){let t={...p,data:d,status:i,duracao:e,motivo:u};c.push(E.api(`/chamadas/${p.id}`,`PUT`,t));let n=l.findIndex(e=>String(e.id)===String(p.id));n!==-1&&(l[n]=t)}else m.id=typeof crypto.randomUUID==`function`?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).substr(2),c.push(E.api(`/chamadas`,`POST`,m)),l.push(m)})}),await Promise.all(c);let u=``;try{let e=[];s.forEach(t=>{let n=i.find(e=>e.idAluno===t&&e.status!==`Arquivado`);n&&typeof E.processarAutoAjustePlano==`function`&&(n=E.processarAutoAjustePlano(n,l),e.push(E.api(`/planejamentos/${n.id}`,`PUT`,n)))}),e.length>0&&(await Promise.all(e),u=` e Planos Auto-Ajustados!`)}catch(e){console.log(`Aviso: Falha no auto-ajuste.`,e)}if(E.filaEdicaoChamada&&E.filaEdicaoChamada.length>0)E.showToast(`Salvo! A carregar o próximo... (Faltam ${E.filaEdicaoChamada.length})`,`success`),E.cachePedagogico.chamadas=l,E.processarFilaEdicaoChamada(),n&&(n.innerText=`💾 SALVAR MATRIZ COMPLETA`,n.disabled=!1),document.body.style.cursor=`default`;else{E.showToast(`Processamento concluído com sucesso${u}!`,`success`),E.cancelarEdicaoChamada();let e=document.getElementById(`app-content`);e&&(e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">A atualizar a tabela de histórico... ⏳</p>`),await E.renderizarChamadaPro()}}catch{E.showToast(`Erro ao guardar a matriz de chamadas.`,`error`),n&&(n.innerText=r,n.disabled=!1),document.body.style.cursor=`default`}},E.excluirLancamentoChamada=e=>{E.confirmar(`Excluir Frequência`,`Tem a certeza que deseja excluir esta chamada do sistema?`,`Excluir`,`#e74c3c`,async()=>{await E.api(`/chamadas/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando frequência... ⏳</p>`),await E.renderizarChamadaPro()})},E.renderizarCalendarioPro=async()=>{E.setTitulo(`Calendário`);let e=document.getElementById(`app-content`);e.innerHTML=`A carregar calendário...`,E.calendarState||={month:new Date().getMonth(),year:new Date().getFullYear()};try{let t=await E.api(`/eventos?_t=${Date.now()}`),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`][E.calendarState.month],r=`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="App.mudarMes(-1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">◀</button>
                <h2 style="margin:0; color:#2c3e50; text-transform:uppercase; font-size:22px;">${n} ${E.calendarState.year}</h2>
                <button onclick="App.mudarMes(1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">▶</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: #7f8c8d; margin-bottom: 10px; font-size:12px; text-transform:uppercase;">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #eee; border: 1px solid #eee;">
                ${E.gerarDiasCalendario(E.calendarState.month,E.calendarState.year,t)}
            </div>
        `,i=`
            <div id="box-gerir-evento" style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span style="font-size:20px;">🗓️</span><h3 style="margin:0; color:#2c3e50;">Gerir Evento</h3></div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
                ${O(`Data:`,`evt-data`,`date`)}
                ${k(`Tipo:`,`evt-tipo`,`<option value="Evento">🟢 Evento</option><option value="Feriado">🔴 Feriado</option><option value="Prova">🔵 Prova</option><option value="Reunião">🟠 Reunião</option>`)}
                ${O(`Descrição:`,`evt-desc`,`text`,``,`placeholder="Ex: Prova de História / Carnaval" style="flex:3;"`)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; align-items: flex-end;">
                ${O(`Início:`,`evt-inicio`,`time`)}
                ${O(`Término:`,`evt-fim`,`time`)}
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
                    <tbody>${E.gerarListaEventosHTML(E.calendarState.month,E.calendarState.year,t)}</tbody>
                </table>
            </div>
        `;e.innerHTML=E.UI.card(``,``,r,`100%`)+`<div style="margin-top:20px;">`+E.UI.card(``,``,i,`100%`)+`</div><div style="margin-top:20px;">`+E.UI.card(`Lista de Eventos (${n})`,``,a,`100%`)+`</div>`,document.getElementById(`evt-data`).value=new Date().toISOString().split(`T`)[0]}catch{e.innerHTML=`Erro ao carregar calendário.`}},E.gerarDiasCalendario=(e,t,n)=>{let r=new Date(t,e,1).getDay(),i=new Date(t,e+1,0).getDate(),a=``;for(let e=0;e<r;e++)a+=`<div class="cal-day empty"></div>`;for(let r=1;r<=i;r++){let i=`${t}-${String(e+1).padStart(2,`0`)}-${String(r).padStart(2,`0`)}`,o=new Date,s=r===o.getDate()&&e===o.getMonth()&&t===o.getFullYear(),c=n.filter(e=>e.data===i).map(e=>`<div class="evt-pilula" style="--bg-cor: ${(D[e.tipo]||D.Evento).bg};" title="${E.escapeHTML(e.descricao)}"><span class="evt-texto">${E.escapeHTML(e.descricao)}</span></div>`).join(``);a+=`<div id="cal-day-${i}" class="cal-day ${s?`hoje`:``}" onclick="App.selecionarDia('${i}')"><div class="dia-num">${r}</div><div class="evt-container">${c}</div></div>`}return a},E.gerarListaEventosHTML=(e,t,n)=>{let r=n.filter(n=>{let r=new Date(n.data+`T00:00:00`);return r.getMonth()===e&&r.getFullYear()===t}).sort((e,t)=>new Date(e.data)-new Date(t.data));return r.length===0?`<tr><td colspan="6" style="padding:20px; text-align:center; color:#999;">Nenhum evento.</td></tr>`:r.map(e=>`
        <tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px; text-align:center;"><input type="checkbox" class="check-evento" value="${e.id}"></td>
            <td style="padding:10px; font-weight:bold;">${e.data.split(`-`)[2]}</td>
            <td style="padding:10px;">${E.escapeHTML(e.inicio||`-`)}</td>
            <td style="padding:10px; font-weight:bold; color:${(D[e.tipo]||D.Evento).bg}">${E.escapeHTML(e.tipo)}</td>
            <td style="padding:10px;">${E.escapeHTML(e.descricao)}</td>
            <td style="padding:10px; text-align:right;">
                <button onclick="App.preencherEdicaoEvento('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">✏️</button>
                <button onclick="App.excluirEvento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️</button>
            </td>
        </tr>`).join(``)},E.mudarMes=e=>{E.calendarState.month+=e,E.calendarState.month>11?(E.calendarState.month=0,E.calendarState.year++):E.calendarState.month<0&&(E.calendarState.month=11,E.calendarState.year--),E.renderizarCalendarioPro()},E.selecionarDia=e=>{document.querySelectorAll(`.cal-day`).forEach(e=>e.style.border=`none`);let t=document.getElementById(`cal-day-${e}`);t&&(t.style.border=`2px solid #3498db`),document.getElementById(`evt-data`).value=e,document.getElementById(`evt-desc`).value=``,E.idEdicaoEvento=null,setTimeout(()=>{document.getElementById(`box-gerir-evento`).scrollIntoView({behavior:`smooth`,block:`start`}),document.getElementById(`evt-desc`).focus()},100)},E.salvarEvento=async()=>{document.activeElement&&document.activeElement.blur();let e={data:document.getElementById(`evt-data`).value,tipo:document.getElementById(`evt-tipo`).value,descricao:document.getElementById(`evt-desc`).value,inicio:document.getElementById(`evt-inicio`).value,fim:document.getElementById(`evt-fim`).value};if(!e.data||!e.descricao)return E.showToast(`Preencha data e descrição.`,`error`);let t=document.querySelector(`button[onclick="App.salvarEvento()"]`),n=t?t.innerText:`Salvar`;t&&(t.innerText=`A salvar... ⏳`,t.disabled=!0),document.body.style.cursor=`wait`;try{E.idEdicaoEvento?await E.api(`/eventos/${E.idEdicaoEvento}`,`PUT`,e):await E.api(`/eventos`,`POST`,e),E.idEdicaoEvento=null;let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando calendário... ⏳</p>`),await E.renderizarCalendarioPro(),setTimeout(()=>{let e=document.querySelector(`.table-responsive-wrapper`);e&&e.scrollIntoView({behavior:`smooth`,block:`end`})},100),E.showToast(`Evento salvo com sucesso!`,`success`)}catch{E.showToast(`Erro ao salvar evento.`,`error`)}finally{t&&(t.innerText=n,t.disabled=!1),document.body.style.cursor=`default`}},E.preencherEdicaoEvento=async e=>{let t=await E.api(`/eventos/${e}`);document.getElementById(`evt-data`).value=t.data,document.getElementById(`evt-tipo`).value=t.tipo,document.getElementById(`evt-desc`).value=t.descricao,document.getElementById(`evt-inicio`).value=t.inicio,document.getElementById(`evt-fim`).value=t.fim,E.idEdicaoEvento=e,document.getElementById(`box-gerir-evento`).scrollIntoView({behavior:`smooth`,block:`start`})},E.excluirEvento=e=>{E.confirmar(`Excluir Evento`,`Pretende remover este evento do calendário?`,`Excluir`,`#e74c3c`,async()=>{await E.api(`/eventos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando calendário... ⏳</p>`),await E.renderizarCalendarioPro()})},E.limparFormEvento=()=>{document.getElementById(`evt-desc`).value=``,E.idEdicaoEvento=null},window.App=window.App||{};var A=window.App;A.renderizarRelatorioModulo=async e=>{if(e===`fin_detalhado`||e===`financeiro`){A.setTitulo(`Relatórios Financeiros`),A.renderizarSelecaoRelatorio();return}if(e===`dossie`){A.renderizarDossie();return}if(e===`ficha`){A.gerarFichaSetup();return}if(e===`documentos`){A.renderizarGeradorDocumentos();return}};var j=(e,t,n=`text`,r=``,i=``)=>`
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <input type="${n}" id="${t}" value="${r}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${i}>
    </div>`,M=(e,t,n,r=``)=>`
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${r}>${n}</select>
    </div>`,N=`
    <style>
        .print-sheet { background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px; font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; }
        .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
        .kpi-container { display: flex; justify-content: space-between; gap: 15px; flex-wrap: wrap; }
        .kpi-box { flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; }
        
        @media (max-width: 768px) {
            .print-sheet { padding: 15px !important; margin: 0 !important; width: 100% !important; border-radius: 0 !important; box-shadow: none !important; }
            .doc-header { flex-direction: column !important; align-items: flex-start !important; gap: 15px !important; }
            .doc-header > div { text-align: left !important; width: 100% !important; }
            .kpi-container { flex-direction: column; }
            .kpi-box { width: 100% !important; margin-bottom: 10px; }
        }
        
        @media print {
            .no-print { display: none !important; }
            body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
            .print-sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; border: none !important; }
            .table-responsive { overflow-x: visible !important; }
            
            /* 🖨️ NOVAS REGRAS DE IMPRESSÃO INTELIGENTE */
            /* 1. Impede o rodapé (Total) de se repetir em todas as folhas */
            tfoot { display: table-row-group !important; }
            
            /* 2. Força as caixas de resumo a ficarem lado a lado e reduz o espaço vertical */
            .kpi-container { 
                flex-direction: row !important; 
                flex-wrap: nowrap !important; 
                gap: 10px !important; 
                margin-bottom: 15px !important; 
            }
            .kpi-box { 
                padding: 10px !important; 
                min-width: auto !important; 
                border: 1px solid #ccc !important; /* Adiciona uma borda leve na impressão */
            }
        }
    </style>
`;A.renderizarSelecaoRelatorio=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar períodos disponíveis... ⏳</p>`;try{let t=await A.api(`/financeiro`),n=new Set,r=new Date().getFullYear();n.add(r),n.add(r+1),t.forEach(e=>{if(e.vencimento){let t=parseInt(e.vencimento.split(`-`)[0]);isNaN(t)||n.add(t)}if(e.dataPagamento){let t=parseInt(e.dataPagamento.split(`-`)[0]);isNaN(t)||n.add(t)}});let i=Array.from(n).sort((e,t)=>t-e).map(e=>`<option value="${e}" ${e===r?`selected`:``}>${e}</option>`).join(``),a=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${t+1}" ${t===new Date().getMonth()?`selected`:``}>${e}</option>`).join(``),o=`
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <span style="font-size:24px;">🗓️</span><h2 style="margin:0; color:#2c3e50;">Selecionar Período</h2>
            </div>
            <p style="color:#666; margin-bottom:20px;">Selecione o ano base para emitir os relatórios financeiros.</p>
            
            ${M(`Selecione o Ano Base:`,`rel-ano`,i,`style="margin-bottom:25px; background:white; padding:12px; font-size:16px;"`)}
            
            <button onclick="App.gerarRelatorioAnual()" style="width:100%; padding:15px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(142,68,173,0.3);">
                📄 RELATÓRIO GERAL DO ANO TODO <span>➜</span>
            </button>
            
            <div style="text-align:center; margin:25px 0; color:#999; font-size:12px; font-weight:bold;">OU SELECIONE UM MÊS ESPECÍFICO</div>
            
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${M(`Mês:`,`rel-mes`,a,`style="background:white; padding:12px; min-width:200px;"`)}
                <button onclick="App.gerarRelatorioMensal()" style="flex:1; min-width:150px; background:#2980b9; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; height:43px; box-shadow:0 4px 10px rgba(41,128,185,0.3);">VER MÊS</button>
            </div>
        `;e.innerHTML=A.UI.card(``,``,o,`100%`)}catch(t){console.error(`Erro ao carregar anos para relatório:`,t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao ligar ao servidor para ler o histórico. Tente novamente.</p>`}},A.gerarRelatorioAnual=async()=>{let e=document.getElementById(`rel-ano`).value,t=document.getElementById(`app-content`);t.innerHTML=`<p style="text-align:center;">A gerar relatório anual...</p>`;try{let n=await A.api(`/financeiro`),r=await A.api(`/escola`)||{nome:`ESCOLA`,cnpj:``},i=r.foto?`<img src="${r.foto}" style="height:50px; object-fit:contain;">`:``,a=n.filter(t=>t.vencimento&&t.vencimento.startsWith(e)).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),o=e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0),s=a.reduce((e,t)=>e+(parseFloat(t.valor)||0),0),c=a.filter(e=>e.status===`Pago`).reduce((e,t)=>e+o(t),0),l=a.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),u=e=>e.toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`});t.innerHTML=`
            ${N}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR EXTRATO ANUAL</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${i}
                        <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${A.escapeHTML(r.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${A.escapeHTML(r.cnpj)}<br>Relatório Analítico Anual</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h1 style="margin:0; font-size:22px; color:#2c3e50;">EXERCÍCIO ${e}</h1>
                        <div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleString(`pt-BR`)}</div>
                    </div>
                </div>
                
                <div class="kpi-container" style="background:#fafafa; padding:20px; border-radius:8px; margin-bottom:30px; border:1px solid #eee;">
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:#555;">TOTAL LANÇADO:</div><div style="font-size:18px; font-weight:bold; color:#333;">${u(s)}</div></div>
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:green;">TOTAL RECEBIDO:</div><div style="font-size:18px; color:green;">${u(c)}</div></div>
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:red;">TOTAL PENDENTE:</div><div style="font-size:18px; color:red;">${u(l)}</div></div>
                </div>
                
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555; min-width:600px;">
                        <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                            <tr><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">VENCIMENTO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">ALUNO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">DESCRIÇÃO DO PRODUTO</th><th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">STATUS / FORMA</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">RECEBIDO</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">PENDENTE</th></tr>
                        </thead>
                        <tbody>
                            ${a.map(e=>{let t=e.status===`Pago`,n=t?`PAGO`:`ABERTO`;return t&&e.formaPagamento&&(n+=`<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${A.escapeHTML(e.formaPagamento)}${e.formaPagamento2?` / ${A.escapeHTML(e.formaPagamento2)}`:``}<br>Pago em: ${A.escapeHTML(e.dataPagamento?e.dataPagamento.split(`-`).reverse().join(`/`):``)}</span>`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${A.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="padding:10px;">${A.escapeHTML(e.alunoNome||`Não informado`)}</td><td style="padding:10px;">${A.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${t?`green`:`red`};">${n}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${t?u(o(e)):`-`}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${t?`-`:u(parseFloat(e.valor)||0)}</td></tr>`}).join(``)}
                        </tbody>
                        <tfoot>
                            <tr style="background:#f9f9f9; font-weight:bold; border-top:2px solid #333;"><td colspan="4" style="padding:15px; text-align:right;">SALDO FINAL:</td><td style="padding:15px; text-align:right; color:green; white-space:nowrap;">${u(c)}</td><td style="padding:15px; text-align:right; color:red; white-space:nowrap;">${u(l)}</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>`}catch{A.showToast(`Erro ao gerar relatório.`,`error`)}},A.gerarRelatorioMensal=async()=>{let e=document.getElementById(`rel-ano`).value,t=parseInt(document.getElementById(`rel-mes`).value),n=document.getElementById(`app-content`);n.innerHTML=`<p style="text-align:center;">A gerar relatório mensal...</p>`;let r=[`JANEIRO`,`FEVEREIRO`,`MARÇO`,`ABRIL`,`MAIO`,`JUNHO`,`JULHO`,`AGOSTO`,`SETEMBRO`,`OUTUBRO`,`NOVEMBRO`,`DEZEMBRO`][t-1];try{let i=await A.api(`/financeiro`),a=await A.api(`/escola`)||{nome:`ESCOLA`,cnpj:``},o=a.foto?`<img src="${a.foto}" style="height:50px; object-fit:contain;">`:``,s=i.filter(n=>{if(!n.vencimento)return!1;let r=new Date(n.vencimento+`T00:00:00`);return r.getFullYear()==e&&r.getMonth()+1==t}).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),c=e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0),l=s.reduce((e,t)=>e+(parseFloat(t.valor)||0),0),u=s.filter(e=>e.status===`Pago`).reduce((e,t)=>e+c(t),0),d=s.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),f=e=>e.toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`});n.innerHTML=`
            ${N}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR MÊS</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:30px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${o}
                        <div><h3 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${A.escapeHTML(a.nome)}</h3><div style="font-size:11px; color:#666;">CNPJ: ${A.escapeHTML(a.cnpj)}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h2 style="margin:0; font-size:20px; color:#2980b9;">${r} / ${e}</h2>
                        <div style="font-size:10px; color:#999;">Relatório Mensal<br>Emissão: ${new Date().toLocaleString(`pt-BR`)}</div>
                    </div>
                </div>
                
                <div class="kpi-container" style="margin-bottom:30px;">
                    <div class="kpi-box" style="background:#34495e; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PREVISÃO</div><div style="font-size:20px; font-weight:bold;">${f(l)}</div></div>
                    <div class="kpi-box" style="background:#27ae60; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">REALIZADO</div><div style="font-size:20px; font-weight:bold;">${f(u)}</div></div>
                    <div class="kpi-box" style="background:#e74c3c; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PENDENTE</div><div style="font-size:20px; font-weight:bold;">${f(d)}</div></div>
                </div>
                
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555; min-width:500px;">
                        <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                            <tr><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">VENCIMENTO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">ALUNO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">DESCRIÇÃO DO PRODUTO</th><th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">STATUS / FORMA</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">VALOR</th></tr>
                        </thead>
                        <tbody>
                            ${s.map(e=>{let t=e.status===`Pago`,n=t?`PAGO`:`PENDENTE`;return t&&e.formaPagamento&&(n+=`<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${A.escapeHTML(e.formaPagamento)}${e.formaPagamento2?` / ${A.escapeHTML(e.formaPagamento2)}`:``}<br>Pago em: ${A.escapeHTML(e.dataPagamento?e.dataPagamento.split(`-`).reverse().join(`/`):``)}</span>`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${A.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="padding:10px;">${A.escapeHTML(e.alunoNome||`Não informado`)}</td><td style="padding:10px;">${A.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${t?`green`:`red`};">${n}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${f(t?c(e):parseFloat(e.valor)||0)}</td></tr>`}).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>`}catch{A.showToast(`Erro ao gerar relatório mensal.`,`error`)}},A.renderizarDossie=()=>{A.setTitulo(`Dossiê Executivo BI`);let e=document.getElementById(`app-content`),t=new Date().getFullYear(),n=new Date().getMonth()+1,r=`
        <div style="text-align:center;">
            <div style="font-size:48px; margin-bottom:15px;">📊</div>
            <h2 style="margin:0 0 10px 0; color:#2c3e50;">Dossiê Executivo (BI)</h2>
            <p style="color:#666; margin-bottom:25px;">Selecione o período de referência para gerar a análise profunda da sua escola.</p>
            
            <div style="display:flex; gap:15px; margin-bottom:25px; text-align:left; flex-wrap:wrap;">
                ${M(`Mês Vigente:`,`dossie-mes`,[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${t+1}" ${t+1===n?`selected`:``}>${e}</option>`).join(``),`style="padding:12px;"`)}
                ${j(`Ano:`,`dossie-ano`,`number`,t,`style="padding:12px; text-align:center;"`)}
            </div>
            
            <button onclick="App.gerarDossie()" class="btn-primary" style="padding:15px; font-size:16px; width:100%; justify-content:center;">GERAR DOSSIÊ ➜</button>
        </div>
    `;e.innerHTML=A.UI.card(``,``,r,`500px`)},A.gerarDossie=async()=>{let e=document.getElementById(`dossie-ano`).value,t=parseInt(document.getElementById(`dossie-mes`).value),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`][t-1],r=document.getElementById(`app-content`);r.innerHTML=`<p style="text-align:center; padding:20px;">Processando Inteligência de Negócios... ⏳</p>`,document.body.style.cursor=`wait`;try{let[i,a,o,s,c]=await Promise.all([A.api(`/alunos`),A.api(`/turmas`),A.api(`/cursos`),A.api(`/financeiro`),A.api(`/escola`)]),l=new Date,u=e=>parseFloat(e||0).toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`}),d=e=>parseFloat(e.valorPago1||e.valor)+parseFloat(e.valorPago2||0),f=e=>e.descricao&&e.descricao.toLowerCase().includes(`venda`)||e.idCarne&&e.idCarne.includes(`VENDA`),p=s.filter(t=>t.vencimento&&t.vencimento.startsWith(e)&&t.tipo===`Receita`),m=p.filter(e=>parseInt(e.vencimento.split(`-`)[1])===t),h=p.filter(e=>e.status===`Pago`).reduce((e,t)=>e+d(t),0),g=p.filter(e=>!f(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),_=m.filter(e=>!f(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),v=s.filter(e=>e.status===`Pendente`&&e.tipo===`Receita`&&new Date(e.vencimento+`T00:00:00`)<l).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),y=m.filter(e=>e.status===`Pago`&&!f(e)).reduce((e,t)=>e+d(t),0),b=m.filter(e=>e.status===`Pago`&&f(e)).reduce((e,t)=>e+d(t),0),x=y+b,S={},C={};m.filter(e=>e.status===`Pago`).forEach(e=>{let t=f(e)?C:S,n=e.formaPagamento||`Outros`,r=e.formaPagamento2;t[n]=(t[n]||0)+parseFloat(e.valorPago1||e.valor),r&&(t[r]=(t[r]||0)+parseFloat(e.valorPago2||0))});let w=``,T=0;for(let e=1;e<=t;e++){let t=p.filter(t=>parseInt(t.vencimento.split(`-`)[1])===e&&t.status===`Pago`),n=t.filter(e=>!f(e)).reduce((e,t)=>e+d(t),0),r=t.filter(e=>f(e)).reduce((e,t)=>e+d(t),0),i=n+r;T+=i,w+=`<tr><td>${[`Jan`,`Fev`,`Mar`,`Abr`,`Mai`,`Jun`,`Jul`,`Ago`,`Set`,`Out`,`Nov`,`Dez`][e-1]}</td><td style="text-align:right; color:#2980b9; white-space:nowrap;">${u(n)}</td><td style="text-align:right; color:#8e44ad; white-space:nowrap;">${u(r)}</td><td style="text-align:right; font-weight:bold; white-space:nowrap;">${u(i)}</td></tr>`}let E={};a.forEach(e=>E[e.nome]=0);let D={};o.forEach(e=>D[e.nome]=0),i.forEach(e=>{e.turma&&E[e.turma]!==void 0&&E[e.turma]++,e.curso&&D[e.curso]!==void 0&&D[e.curso]++});let O=i.filter(e=>e.sexo===`Masculino`).length,k=i.filter(e=>e.sexo===`Feminino`).length,j=O+k||1,M=(O/j*100).toFixed(1),P=(k/j*100).toFixed(1),F=s.filter(e=>e.status===`Pendente`&&e.tipo===`Receita`&&new Date(e.vencimento+`T00:00:00`)<l),I=``;F.forEach(e=>{let t=e.cobradoZap?`<span style="color:#27ae60;font-weight:bold;">✅ Sim</span>`:`<span style="color:#e74c3c;font-weight:bold;">❌ Não</span>`;I+=`<tr><td>${A.escapeHTML(e.alunoNome||`Desconhecido`)}</td><td>${A.escapeHTML(e.descricao)}</td><td style="color:#c0392b; font-weight:bold; white-space:nowrap;">${u(parseFloat(e.valor))}</td><td style="white-space:nowrap;">${A.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="text-align:center;">${t}</td></tr>`}),r.innerHTML=`
            ${N}
            <style>
                .d-kpi { flex:1; background:#fff; padding:15px; border-radius:8px; border:1px solid #ddd; text-align:center; min-width:140px; }
                .d-kpi-tit { font-size:10px; color:#777; text-transform:uppercase; margin-bottom:5px; font-weight:bold; line-height:1.2; }
                .d-kpi-val { font-size:18px; font-weight:bold; }
                .d-box { background:#fff; padding:20px; border-radius:8px; border:1px solid #eee; margin-bottom:20px; overflow: hidden; }
                .d-table { width:100%; border-collapse:collapse; font-size:12px; }
                .d-table th { background:#f4f6f7; padding:10px; text-align:left; border-bottom:2px solid #ddd; }
                .d-table td { padding:10px; border-bottom:1px solid #eee; }
                .list-card { background:#f8f9fa; border:1px solid #e9ecef; padding:10px 15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
                .list-card span:first-child { font-size:13px; font-weight:500; color:#333; }
                .badge-curso { background:#3498db; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; }
                .badge-turma { background:#2ecc71; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; }
                .flex-container { display: flex; flex-wrap: wrap; gap: 30px; align-items: center; justify-content: space-between; }
                .flex-item { flex: 1; min-width: 300px; }
                @media (max-width: 768px) {
                    .d-kpi { min-width: 100%; margin-bottom: 10px; }
                    .flex-item { min-width: 100%; }
                    .d-box { padding: 10px; }
                }
                @media print { .d-box { page-break-inside: avoid; border:1px solid #000; } }
            </style>

            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="App.renderizarDossie()" class="btn-cancel" style="margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR DOSSIÊ</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        ${c.foto?`<img src="${c.foto}" style="height:50px; object-fit:contain;">`:``} <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${A.escapeHTML(c.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${A.escapeHTML(c.cnpj)}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:16px;">DOSSIÊ DE GESTÃO - ${n}/${e}</div>
                        <div style="font-size:11px; color:#666;">Emissão: ${l.toLocaleDateString(`pt-BR`)}</div>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <div class="d-kpi" style="border-bottom:3px solid #34495e;">
                        <div class="d-kpi-tit">Esperado do Ano<br>(Só Mensalidades)</div>
                        <div class="d-kpi-val" style="color:#34495e;">${u(g)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #f39c12;">
                        <div class="d-kpi-tit">Esperado no Mês Vigente<br>(Mensalidades)</div>
                        <div class="d-kpi-val" style="color:#f39c12;">${u(_)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #27ae60;">
                        <div class="d-kpi-tit">Entrada Bruta Ano<br>(Mensalidades + Vendas)</div>
                        <div class="d-kpi-val" style="color:#27ae60;">${u(h)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #3498db;">
                        <div class="d-kpi-tit">Entrada Mês Vigente<br>(Mensalidades + Vendas)</div>
                        <div class="d-kpi-val" style="color:#3498db;">${u(x)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #e74c3c;">
                        <div class="d-kpi-tit">Total Inadimplência<br>(Geral)</div>
                        <div class="d-kpi-val" style="color:#e74c3c;">${u(v)}</div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📊 Resultados Financeiros: ${n} / ${e}</h3>
                    <div class="flex-container">
                        <div class="flex-item">
                            <table class="d-table">
                                <tr><td><strong>Entradas em Mensalidades:</strong></td><td style="text-align:right; font-size:16px; color:#2980b9; font-weight:bold; white-space:nowrap;">${u(y)}</td></tr>
                                <tr><td><strong>Entradas em Vendas:</strong></td><td style="text-align:right; font-size:16px; color:#8e44ad; font-weight:bold; white-space:nowrap;">${u(b)}</td></tr>
                                <tr style="background:#f9f9f9;"><td><strong>TOTAL ARRECADADO NO MÊS:</strong></td><td style="text-align:right; font-size:18px; color:#27ae60; font-weight:bold; white-space:nowrap;">${u(x)}</td></tr>
                            </table>
                        </div>
                        <div class="flex-item" style="display:flex; justify-content:space-evenly; gap:10px; align-items:center;">
                            <div style="text-align:center;">
                                <div style="font-size:10px; font-weight:bold; color:#777; margin-bottom:5px;">FORMAS (MENSALIDADES)</div>
                                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;"><canvas id="grafMensalidade"></canvas></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:10px; font-weight:bold; color:#777; margin-bottom:5px;">FORMAS (VENDAS)</div>
                                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;"><canvas id="grafVenda"></canvas></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📈 Histórico de Entradas (${e})</h3>
                    <div class="table-responsive">
                        <table class="d-table" style="min-width:400px;">
                            <thead><tr><th>Mês</th><th style="text-align:right;">Mensalidades</th><th style="text-align:right;">Vendas</th><th style="text-align:right;">Total do Mês</th></tr></thead>
                            <tbody>${w}</tbody>
                            <tfoot><tr style="background:#e8f6f3; font-weight:bold; font-size:13px;"><td colspan="3" style="text-align:right;">TOTAL BRUTO (JAN ATÉ ${n.toUpperCase()}):</td><td style="text-align:right; color:#27ae60; white-space:nowrap;">${u(T)}</td></tr></tfoot>
                        </table>
                    </div>
                </div>

                <div class="d-box">
                    <div class="flex-container">
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📚 Cursos (${o.length})</h3>
                            <div>${o.length?o.map(e=>`<div class="list-card"><span>${A.escapeHTML(e.nome)}</span><span class="badge-curso">${D[e.nome]||0} alunos</span></div>`).join(``):`<div style="color:#999; font-size:12px;">Nenhum curso.</div>`}</div>
                        </div>
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">🏫 Turmas (${a.length})</h3>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">${a.length?a.map(e=>`<div class="list-card" style="margin-bottom:0;"><span>${A.escapeHTML(e.nome)}</span><span class="badge-turma">${E[e.nome]||0} alunos</span></div>`).join(``):`<div style="color:#999; font-size:12px;">Nenhuma turma.</div>`}</div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">👥 Demografia dos Alunos</h3>
                    <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-around; gap:20px;">
                        <div style="background:#f4f6f7; padding:20px; border-radius:8px; text-align:center; border:1px solid #e9ecef; min-width: 120px;"><div style="display:flex; flex-direction:column; gap:10px;">
                            <div style="background:#f4f6f7; padding:15px; border-radius:8px; text-align:center; border:1px solid #e9ecef; min-width: 140px;">
                                <div style="font-size:28px; font-weight:bold; color:#27ae60; line-height:1; margin-bottom:5px;">${i.filter(e=>!e.status||e.status===`Ativo`).length}</div>
                                <div style="font-size:10px; font-weight:bold; color:#7f8c8d; text-transform:uppercase;">🟢 Ativos</div>
                            </div>
                            <div style="background:#fdf2f2; padding:10px; border-radius:8px; text-align:center; border:1px solid #f5b7b1; min-width: 140px;">
                                <div style="font-size:20px; font-weight:bold; color:#e74c3c; line-height:1; margin-bottom:5px;">${i.filter(e=>e.status&&e.status!==`Ativo`).length}</div>
                                <div style="font-size:10px; font-weight:bold; color:#c0392b; text-transform:uppercase;">🔴 Inativos (Evasão)</div>
                            </div>
                        </div>
                        <div style="position: relative; width: 140px; height: 140px; margin: 0 auto;"><canvas id="grafDemografia"></canvas></div>
                        <div style="display:flex; flex-direction:column; gap:10px; min-width:180px;">
                            <div style="background:#ebf5fb; border-left:4px solid #3498db; padding:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👨 Masculino</div><div style="font-size:16px; font-weight:bold; color:#3498db;">${O}</div></div><div style="font-size:14px; color:#999; font-weight:bold;">${M}%</div></div>
                            <div style="background:#fdedec; border-left:4px solid #e74c3c; padding:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👩 Feminino</div><div style="font-size:16px; font-weight:bold; color:#e74c3c;">${k}</div></div><div style="font-size:14px; color:#999; font-weight:bold;">${P}%</div></div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#e74c3c; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">⚠️ Relatório Analítico de Inadimplência</h3>
                    <div class="table-responsive">
                        <table class="d-table" style="min-width:600px;">
                            <thead><tr><th>Nome do Aluno</th><th>Descrição (Mensalidade)</th><th>Valor</th><th>Vencimento</th><th style="text-align:center;">Cobrado no WhatsApp?</th></tr></thead>
                            <tbody>${I||`<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">Nenhum inadimplente! 🎉</td></tr>`}</tbody>
                        </table>
                    </div>
                </div>
            </div>`,setTimeout(()=>{let e={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},cutout:`65%`},t=[`#3498db`,`#9b59b6`,`#f1c40f`,`#2ecc71`,`#e67e22`,`#95a5a6`];Object.keys(S).length>0&&document.getElementById(`grafMensalidade`)&&new Chart(document.getElementById(`grafMensalidade`),{type:`doughnut`,data:{labels:Object.keys(S),datasets:[{data:Object.values(S),backgroundColor:t,borderWidth:0}]},options:e}),Object.keys(C).length>0&&document.getElementById(`grafVenda`)&&new Chart(document.getElementById(`grafVenda`),{type:`doughnut`,data:{labels:Object.keys(C),datasets:[{data:Object.values(C),backgroundColor:t,borderWidth:0}]},options:e}),i.length>0&&document.getElementById(`grafDemografia`)&&new Chart(document.getElementById(`grafDemografia`),{type:`doughnut`,data:{labels:[`Masculino`,`Feminino`],datasets:[{data:[O,k],backgroundColor:[`#3498db`,`#e74c3c`],borderWidth:0}]},options:e})},300)}catch{A.showToast(`Erro ao gerar dossiê.`,`error`)}finally{document.body.style.cursor=`default`}},A.gerarFichaSetup=async()=>{A.setTitulo(`Ficha de Matrícula`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center;">Carregando...</p>`;try{let t=`
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${M(`Selecione o Aluno:`,`ficha-aluno`,`<option value="">-- Selecione o Aluno --</option>`+(await A.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${A.escapeHTML(e.nome)}</option>`).join(``))}
                <button onclick="App.gerarFichaImprimir()" class="btn-primary" style="height:41px; padding:0 25px; margin-bottom:5px;">GERAR FICHA</button>
            </div>
        `;e.innerHTML=A.UI.card(`📄 Imprimir Ficha de Matrícula`,``,t,`100%`)+`<div id="ficha-area" style="margin-top:30px;"></div>`}catch{e.innerHTML=`Erro ao carregar os alunos.`}},A.gerarFichaImprimir=async()=>{let e=document.getElementById(`ficha-aluno`).value;if(!e)return A.showToast(`Por favor, selecione um aluno.`,`warning`);let t=document.getElementById(`ficha-area`);t.innerHTML=`<p style="text-align:center;">Gerando ficha... ⏳</p>`,document.body.style.cursor=`wait`;try{let[n,r,i,a]=await Promise.all([A.api(`/alunos`),A.api(`/escola`),A.api(`/financeiro`),A.api(`/turmas`)]),o=n.find(t=>t.id===e)||{},s=r.foto?`<img src="${r.foto}" style="height:60px; object-fit:contain;">`:``,c=a.find(e=>e.nome===o.turma)||{dia:`-`,horario:`-`},l=i.filter(t=>t.idAluno===e&&t.tipo===`Receita`),u=e=>e.descricao&&e.descricao.toLowerCase().includes(`venda`)||e.idCarne&&e.idCarne.includes(`VENDA`),d=l.filter(e=>!u(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),f=l.filter(e=>u(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),p=d+f,m=e=>`R$ ${e.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,h=``;o.resp_nome&&o.resp_nome.trim()!==``&&(h=`
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#d35400; font-size:15px;">👤 DADOS DO RESPONSÁVEL LEGAL (Menor de Idade)</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px; background:#fff3e0; padding:15px; border-radius:5px; border:1px dashed #e67e22;">
                    <div><b>Nome do Responsável:</b> ${A.escapeHTML(o.resp_nome)}</div>
                    <div><b>Grau Parentesco:</b> ${A.escapeHTML(o.resp_parentesco||`-`)}</div>
                    <div><b>CPF do Responsável:</b> ${A.escapeHTML(o.resp_cpf||`-`)}</div>
                    <div><b>WhatsApp:</b> ${A.escapeHTML(o.resp_zap||`-`)}</div>
                </div>
            `),t.innerHTML=`
            ${N}
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR FICHA</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${s}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${A.escapeHTML(r.nome)}</h2><div style="font-size:12px;">CNPJ: ${A.escapeHTML(r.cnpj)}</div></div></div>
                    <div style="text-align:right;"><div><b>FICHA DE MATRÍCULA</b></div><div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleDateString(`pt-BR`)}</div></div>
                </div>
                <div style="border: 1px solid #ccc; padding: 20px; margin-top: 20px; background:#fafafa;">
                    
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; color:#2c3e50; font-size:15px;">1. DADOS DO ALUNO</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px;">
                        <div><b>Nome:</b> ${A.escapeHTML(o.nome||`-`)}</div>
                        <div><b>Data Nascimento:</b> ${A.escapeHTML(o.nascimento?o.nascimento.split(`-`).reverse().join(`/`):`-`)}</div>
                        <div><b>CPF:</b> ${A.escapeHTML(o.cpf||`-`)}</div>
                        <div><b>RG:</b> ${A.escapeHTML(o.rg||`-`)}</div>
                        <div><b>Sexo:</b> ${A.escapeHTML(o.sexo||`-`)}</div>
                        <div><b>WhatsApp:</b> ${A.escapeHTML(o.whatsapp||`-`)}</div>
                    </div>

                    ${h}

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#2c3e50; font-size:15px;">2. CURSO E MATRÍCULA</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 10px; font-size:13px;">
                        <div><b>Curso:</b> ${A.escapeHTML(o.curso||`-`)}</div>
                        <div><b>Turma:</b> ${A.escapeHTML(o.turma||`-`)}</div>
                        <div><b>Dias de Aula:</b> ${A.escapeHTML(c.dia||`-`)}</div>
                        <div><b>Horário:</b> ${A.escapeHTML(c.horario||`-`)}</div>
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
                        <div style="grid-column: 1 / -1;"><b>Logradouro:</b> ${A.escapeHTML(o.rua||`-`)}, ${A.escapeHTML(o.numero||`-`)}</div>
                        <div><b>Bairro:</b> ${A.escapeHTML(o.bairro||`-`)}</div>
                        <div><b>Cidade/UF:</b> ${A.escapeHTML(o.cidade||`-`)}/${A.escapeHTML(o.estado||`-`)}</div>
                    </div>
                </div>
                <div style="margin-top:50px; display:flex; justify-content:space-between; text-align:center; flex-wrap:wrap; gap:30px;">
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Assinatura do Aluno${o.resp_nome?` / Responsável Legal`:``}</div>
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Direção da Escola</div>
                </div>
            </div>
        `}catch{A.showToast(`Erro ao gerar ficha. O aluno não foi encontrado.`,`error`)}finally{document.body.style.cursor=`default`}},A.renderizarGeradorDocumentos=()=>{A.setTitulo(`Fábrica de Documentos`);let e=document.getElementById(`app-content`),t=e=>`cursor:pointer; background:white; border:2px solid #eee; padding:40px 20px; border-radius:15px; width:45%; min-width:250px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05); text-align:center;`,n=e=>`this.style.borderColor='${e}'; this.style.transform='translateY(-5px)'`,r=`this.style.borderColor='#eee'; this.style.transform='translateY(0)'`,i=`
        <div style="text-align:center; padding:20px;">
            <h2 style="color:#2c3e50; margin-bottom:10px;">O que deseja emitir hoje?</h2>
            <p style="color:#7f8c8d; margin-bottom:40px;">Escolha a categoria do documento para abrir o ambiente de formatação adequado.</p>
            
            <div style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap;">
                <div onclick="App.renderizarMenuDocumentosOficiais()" style="${t(`#3498db`)}" onmouseover="${n(`#3498db`)}" onmouseout="${r}">
                    <div style="font-size:60px; margin-bottom:15px;">📄</div>
                    <h3 style="margin:0 0 10px 0; color:#3498db;">Documentos Oficiais</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Contratos de Prestação de Serviços e Declarações de Matrícula (Formato A4 Retrato).</p>
                </div>
                
                <div onclick="App.renderizarMenuCertificados()" style="${t(`#f39c12`)}" onmouseover="${n(`#f39c12`)}" onmouseout="${r}">
                    <div style="font-size:60px; margin-bottom:15px;">🎓</div>
                    <h3 style="margin:0 0 10px 0; color:#f39c12;">Certificados de Conclusão</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Diplomas oficiais com carga horária e selo da instituição (Formato A4 Paisagem).</p>
                </div>
            </div>
        </div>
    `;e.innerHTML=A.UI.card(``,``,i,`100%`)},A.renderizarMenuDocumentosOficiais=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar base de alunos... ⏳</p>`;try{let t=(await A.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`);e.innerHTML=`
            <div class="card" style="max-width: 700px; margin: 0 auto; border-top: 4px solid #3498db;">
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
                            <select id="doc-aluno-oficial" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">${t.length>0?`<option value="">-- Selecione o Aluno --</option>`+t.map(e=>`<option value="${e.id}">${A.escapeHTML(e.nome)} (Turma: ${A.escapeHTML(e.turma||`-`)})</option>`).join(``):`<option value="">Nenhum aluno ativo encontrado</option>`}</select>
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
        `}catch{e.innerHTML=`<p>Erro ao carregar dados.</p>`}},A.formatarLista=e=>{document.execCommand(`insertOrderedList`,!1,null);let t=window.getSelection();if(t.rangeCount>0){let n=t.anchorNode;if(n&&n.nodeType===3&&(n=n.parentNode),n){let t=n.closest(`ol`);t&&(t.style.listStyleType=e)}}},A.aplicarFormatacaoDropdown=e=>{let t=e.value;if(!t)return;let n=document.getElementById(`editor-documento`);n&&n.focus(),t===`unorderedList`?document.execCommand(`insertUnorderedList`,!1,null):t===`paragrafo`?document.execCommand(`insertText`,!1,`§ `):A.formatarLista(t),e.value=``},A.gerarDocumentoOficialPrint=async()=>{let e=document.getElementById(`doc-aluno-oficial`).value,t=document.getElementById(`doc-tipo-oficial`).value,n=new Date,r=`${n.getDate()} de ${[`janeiro`,`fevereiro`,`março`,`abril`,`maio`,`junho`,`julho`,`agosto`,`setembro`,`outubro`,`novembro`,`dezembro`][n.getMonth()]} de ${n.getFullYear()}`,i=n.toLocaleDateString(`pt-BR`);if(!e)return A.showToast(`Selecione um aluno na lista.`,`warning`);let a=document.querySelector(`button[onclick="App.gerarDocumentoOficialPrint()"]`),o=a.innerText;a.innerText=`A Preparar Editor... ⏳`,a.disabled=!0,document.body.style.cursor=`wait`;try{let n=(await A.api(`/alunos`)).find(t=>t.id===e)||{},a=await A.api(`/escola`)||{nome:`A INSTITUIÇÃO`,cnpj:`00.000.000/0000-00`},o=[];try{o=await A.api(`/financeiro`)}catch{}let s=parseFloat(n.valorMensalidade||n.mensalidade||n.valor||0),c=n.diaVencimento||n.vencimento||n.dia_vencimento||``;if(s===0||!c){let t=o.filter(t=>t.idAluno===e&&t.tipo===`Receita`&&(!t.descricao||!t.descricao.toLowerCase().includes(`venda`)));if(t.length>0){let e=t[0];s===0&&(s=parseFloat(e.valor||0)),!c&&e.vencimento&&(c=e.vencimento.split(`-`)[2])}}c||=`10`;let l=s.toLocaleString(`pt-BR`,{minimumFractionDigits:2}),u=a.endereco?`${a.endereco}, ${a.numero||`S/N`} - ${a.bairro||``}. ${a.cidade||``}-${a.estado||``} | CEP: ${a.cep||``}`:``,d=`Local não informado`;a.cidade&&a.estado?d=`${A.escapeHTML(a.cidade)} - ${A.escapeHTML(a.estado)}`:a.cidade&&(d=A.escapeHTML(a.cidade));let f=`${d}, ${r}.`,p=document.getElementById(`doc-area-oficial`);p.innerHTML=`<p style="text-align:center;">Gerando Layout... ⏳</p>`;let m=`
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; align-items:center; gap:20px;">${a.foto?`<img src="${a.foto}" style="height:60px; object-fit:contain;">`:``}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${A.escapeHTML(a.nome)}</h2><div style="font-size:12px; color:#555;">CNPJ: ${A.escapeHTML(a.cnpj)}<br>${A.escapeHTML(u)}</div></div></div>
                <div style="text-align:right;"><div><b>${t===`contrato`?`CONTRATO DE SERVIÇOS`:`DECLARAÇÃO DE MATRÍCULA`}</b></div><div style="font-size:10px; color:#999;">Emissão: ${i}</div></div>
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
                <div style="text-align: justify; margin-top: 5px; font-size:14px; font-family: Arial, sans-serif;">
                    Pelo presente instrumento particular, de um lado <b>${A.escapeHTML(a.nome||`A INSTITUIÇÃO`)}</b>, 
                    inscrita no CNPJ sob o nº <b>${A.escapeHTML(a.cnpj||`00.000.000/0000-00`)}</b>, doravante denominada <b>CONTRATADA</b>, e de outro lado 
                    <b>${A.escapeHTML(n.nome)}</b>, portador(a) do CPF nº <b>${A.escapeHTML(n.cpf||`___________`)}</b> e RG nº <b>${A.escapeHTML(n.rg||`___________`)}</b>, 
                    residente e domiciliado(a) na ${A.escapeHTML(n.rua||``)}, ${A.escapeHTML(n.numero||``)} - ${A.escapeHTML(n.bairro||``)}, 
                    ${A.escapeHTML(n.cidade||``)}/${A.escapeHTML(n.estado||``)}, doravante denominado(a) <b>CONTRATANTE</b>.
                </div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">O presente contrato tem como objeto a prestação de serviços educacionais por parte da CONTRATADA ao CONTRATANTE, referente ao curso de <b>${A.escapeHTML(n.curso||`Não especificado`)}</b>, a ser ministrado na turma <b>${A.escapeHTML(n.turma||`Não especificada`)}</b>.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA SEGUNDA - DOS VALORES E FORMA DE PAGAMENTO</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">Pelos serviços educacionais prestados, o CONTRATANTE pagará à CONTRATADA a mensalidade no valor estipulado de <b>R$ ${l}</b>, com vencimento programado para todo dia <b>${A.escapeHTML(c)}</b> de cada mês. O atraso no pagamento sujeitará o CONTRATANTE a multas e juros moratórios conforme a legislação vigente.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA TERCEIRA - DAS RESPONSABILIDADES</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">É responsabilidade do CONTRATANTE zelar pelo patrimônio da instituição, além de manter o mínimo de 75% de frequência nas aulas. A CONTRATADA compromete-se a fornecer o material pedagógico e o corpo docente adequado para o perfeito desenvolvimento das aulas.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA QUARTA - DISPOSIÇÕES GERAIS</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">Este contrato tem validade a partir da data de sua assinatura. As partes elegem o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, renunciando a qualquer outro, por mais privilegiado que seja.</div>
            `,v=`
                <div style="text-align: right; margin-top: 15px; font-size:14px; font-family: Arial, sans-serif;">${f}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 30px; text-align: center; flex-wrap:wrap; gap:30px; font-family: Arial, sans-serif;">
                    <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 5px; font-size:12px;">
                        <b>${A.escapeHTML(a.nome||`A INSTITUIÇÃO`)}</b><br>CONTRATADA
                    </div>
                    <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 5px; font-size:12px;">
                        <b>${A.escapeHTML(n.nome)}</b><br>CONTRATANTE
                    </div>
                </div>
            `,y=`<div class="rodape-paginacao"></div>`):t===`declaracao`&&(_=`
                <h2 style="text-align: center; margin-top: 10px; margin-bottom: 20px; text-transform: uppercase; font-family: Arial, sans-serif;">Declaração de Matrícula</h2>
                
                <div style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 20px; font-family: Arial, sans-serif;">
                    Declaramos para os devidos fins que <b>${A.escapeHTML(n.nome)}</b>, inscrito(a) no CPF sob o nº <b>${A.escapeHTML(n.cpf||`___________`)}</b>, 
                    encontra-se regularmente matriculado(a) e frequentando o curso de <b>${A.escapeHTML(n.curso||`Não especificado`)}</b> 
                    (Turma: <b>${A.escapeHTML(n.turma||`Não especificada`)}</b>) nesta instituição de ensino.
                </div>
                
                <div style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 30px; font-family: Arial, sans-serif;">
                    Esta declaração é emitida a pedido do(a) interessado(a) para que produza os seus efeitos legais.
                </div>
            `,v=`
                <div style="text-align: right; font-size: 14px; margin-bottom: 30px; margin-top: 15px; font-family: Arial, sans-serif;">
                    ${f}
                </div>
                
                <div style="width: 100%; max-width: 400px; margin: auto auto 0 auto; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 14px; font-family: Arial, sans-serif;">
                    <b>A Direção / Secretaria</b><br>
                    ${A.escapeHTML(a.nome)}
                </div>
            `),p.innerHTML=`
            ${N}
            
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
        `,p.appendChild(b)}catch{A.showToast(`Erro ao gerar o documento.`,`error`)}finally{a.innerText=o,a.disabled=!1,document.body.style.cursor=`default`}},A.renderizarMenuCertificados=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Preparando ambiente... 🎓</p>`;try{let t=(await A.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`);e.innerHTML=`
            <div class="card" style="max-width: 700px; margin: 0 auto; border-top: 4px solid #f39c12;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:25px;">
                    <h3 style="color:#2c3e50; margin:0; display:flex; align-items:center; gap:10px; font-size:18px;">
                        🎓 Emissão de Certificados Premium
                    </h3>
                    <button onclick="App.renderizarGeradorDocumentos()" style="background:#ecf0f1; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold; color:#7f8c8d;">Voltar</button>
                </div>
                
                <p style="font-size:13px; color:#666; margin-bottom:20px;">Preencha os dados e escolha um dos nossos layouts exclusivos. O documento será renderizado em <b>A4 Paisagem (Horizontal)</b>.</p>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">1. Selecione o Aluno Titular:</label>
                            <select id="cert-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">${t.length>0?`<option value="">-- Selecione o Aluno Titular --</option>`+t.map(e=>`<option value="${e.id}">${A.escapeHTML(e.nome)} (Curso: ${A.escapeHTML(e.curso||`-`)})</option>`).join(``):`<option value="">Nenhum aluno ativo encontrado</option>`}</select>
                        </div>
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">2. Design do Certificado:</label>
                            <select id="cert-modelo" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer; background:#fffcf5;">
                                <option value="padrao">01. Clássico (Padrão Original)</option>
                                <option value="minimalista">02. Minimalista Premium (Clean/Branco)</option>
                                <option value="corporate">03. Corporate Blue (Institucional)</option>
                                <option value="darktech">04. Dark Tech Mode (Fundo Escuro/Neon)</option>
                                <option value="gold">05. Classic Gold (Ouro de Alta Costura)</option>
                                <option value="modern">06. Canva Modern (Gradiente Suave)</option>
                                <option value="elegant">07. Elegant Burgundy (Bordô Aristocrático)</option>
                                <option value="vintage">08. Vintage Parchment (Papiro/Antigo)</option>
                                <option value="luxury">09. Black Luxury & Gold (Preto Absoluto)</option>
                                <option value="nature">10. Emerald Nature (Verde Esmeralda)</option>
                                <option value="ocean">11. Ocean Blue Flow (Gradiente Marítimo)</option>
                                <option value="diploma">12. Traditional Diploma (Bordas Duplas Universitárias)</option>
                                <option value="future">13. Future Silver (Prateado Futurista)</option>
                                <option value="startup">14. Neo-Brutalism (Startup Color block)</option>
                                <option value="creative">15. Creative Vibrant (Rosa/Criatividade)</option>
                                <option value="geometric">16. Geometric Abstract (Padrão de Linhas)</option>
                            </select>
                        </div>
                    </div>

                    <div style="background:#fffaf0; padding:15px; border-radius:5px; border:1px dashed #f39c12; display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:120px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#d35400; display:block; margin-bottom:5px;">Carga Horária (Horas):</label>
                            <input type="number" id="cert-carga" value="40" placeholder="Ex: 40" style="width:100%; padding:10px; border:1px solid #f39c12; border-radius:5px; font-weight:bold; color:#d35400;">
                        </div>
                        <div style="flex:1; min-width:140px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Início do Curso:</label>
                            <input type="date" id="cert-data-inicio" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                        <div style="flex:1; min-width:140px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Conclusão:</label>
                            <input type="date" id="cert-data-fim" value="${new Date().toISOString().split(`T`)[0]}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:14px; background:#f39c12; border:none; box-shadow:0 4px 10px rgba(243, 156, 18, 0.3); justify-content:center; border-radius:8px; cursor:pointer;" onclick="App.gerarCertificadoPrint()">🖨️ RENDERIZAR CERTIFICADO VIP</button>
                </div>
            </div>
            
            <div id="cert-area" style="margin-top: 30px;"></div>
        `}catch{e.innerHTML=`<p>Erro ao carregar dados.</p>`}},A.gerarCertificadoPrint=async()=>{let e=document.getElementById(`cert-aluno`).value,t=document.getElementById(`cert-modelo`).value,n=document.getElementById(`cert-carga`).value||`40`,r=document.getElementById(`cert-data-inicio`),i=r&&r.value?r.value.split(`-`).reverse().join(`/`):`-`,a=document.getElementById(`cert-data-fim`),o=new Date().toLocaleDateString(`pt-BR`),s=a&&a.value?a.value.split(`-`).reverse().join(`/`):o;if(!e)return A.showToast(`Selecione um aluno na lista.`,`warning`);let c=document.querySelector(`button[onclick="App.gerarCertificadoPrint()"]`),l=c.innerText;c.innerText=`A Criar Obra de Arte... ⏳`,c.disabled=!0,document.body.style.cursor=`wait`;try{let r=(await A.api(`/alunos`)).find(t=>t.id===e)||{},a=await A.api(`/escola`)||{nome:`A INSTITUIÇÃO`,cnpj:`00.000.000/0000-00`},c=document.getElementById(`cert-area`);c.innerHTML=`<p style="text-align:center;">Aplicando Estilo Premium... ⏳</p>`;let l=a.foto?`<img src="${a.foto}" class="cert-logo">`:`<div class="cert-selo-default">SELO</div>`,u=``;switch(t){case`padrao`:u=`
                .cert-box { border: 12px solid #2c3e50; outline: 3px solid #d4af37; outline-offset: -6px; background: #fff; color: #000; font-family: 'Times New Roman', serif; }
                .cert-title { color: #2c3e50; font-family: 'Times New Roman', serif; }
                .cert-nome { color: #b71c1c; border-bottom: 2px solid #ccc; font-family: Arial, sans-serif; }
                .cert-text { color: #333; }
                .cert-logo { max-height:100px; max-width:150px; object-fit:contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1)); }
                .cert-selo-default { font-size:16px; font-weight:bold; color:#2c3e50; border:2px solid #2c3e50; padding:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:80px; height:80px; }
            `;break;case`minimalista`:u=`
                .cert-box { border: 1px solid #ddd; padding: 40px; background: #fff; color: #333; font-family: 'Helvetica Neue', Arial, sans-serif; box-shadow: inset 0 0 0 15px #fff, inset 0 0 0 16px #ddd; }
                .cert-title { color: #111; letter-spacing: 8px; font-weight: 300; text-transform: uppercase; }
                .cert-nome { color: #000; border-bottom: 1px solid #eee; font-weight: 300; font-size: 38px; }
                .cert-text { color: #666; font-size: 17px; font-weight: 300; }
                .cert-logo { max-height:90px; filter: grayscale(100%) opacity(0.8); }
            `;break;case`corporate`:u=`
                .cert-box { border-top: 25px solid #2980b9; border-bottom: 25px solid #2980b9; border-left: 2px solid #2980b9; border-right: 2px solid #2980b9; background: #fdfdfd; font-family: 'Segoe UI', Tahoma, sans-serif; }
                .cert-title { color: #2980b9; font-weight: 900; }
                .cert-nome { color: #2c3e50; border-bottom: 2px solid #2980b9; font-weight: bold; }
                .cert-text { color: #555; }
                .cert-logo { max-height:110px; }
            `;break;case`darktech`:u=`
                .cert-box { background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); border: 2px solid #00f2fe; outline: 5px solid #111; color: #fff; font-family: 'Courier New', Courier, monospace; }
                .cert-title { color: #00f2fe; text-shadow: 0 0 10px rgba(0, 242, 254, 0.5); }
                .cert-nome { color: #fff; border-bottom: 2px dashed #00f2fe; font-family: 'Arial', sans-serif; }
                .cert-text { color: #ccc; }
                .cert-logo { max-height:90px; filter: drop-shadow(0 0 10px #00f2fe); }
            `;break;case`gold`:u=`
                .cert-box { border: 15px solid #d4af37; outline: 2px solid #000; outline-offset: -20px; background: #fffcf5; font-family: 'Georgia', serif; }
                .cert-title { color: #d4af37; font-weight: bold; text-shadow: 1px 1px 0px #000; }
                .cert-nome { color: #000; border-bottom: 3px solid #d4af37; font-style: italic; }
                .cert-text { color: #444; }
                .cert-logo { max-height:100px; filter: sepia(100%) hue-rotate(10deg) saturate(200%); }
            `;break;case`modern`:u=`
                .cert-box { background: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%); border-radius: 30px; border: none; box-shadow: inset 0 0 0 6px #ff9a9e; font-family: 'Helvetica', sans-serif; }
                .cert-title { color: #ff9a9e; font-weight: bold; }
                .cert-nome { color: #333; border-bottom: 3px solid #a18cd1; }
                .cert-text { color: #555; }
                .cert-logo { max-height:100px; border-radius: 15px; }
            `;break;case`elegant`:u=`
                .cert-box { border: 10px solid #800020; background: #fffaf0; box-shadow: inset 0 0 0 5px #fffaf0, inset 0 0 0 6px #d4af37; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; }
                .cert-title { color: #800020; }
                .cert-nome { color: #d4af37; border-bottom: 1px solid #800020; font-size: 40px; }
                .cert-text { color: #333; }
                .cert-logo { max-height:100px; }
            `;break;case`vintage`:u=`
                .cert-box { background: #f4ecd8; border: 8px double #5d4037; color: #3e2723; font-family: 'Times New Roman', serif; }
                .cert-title { color: #3e2723; font-weight: normal; }
                .cert-nome { color: #5d4037; border-bottom: 2px solid #5d4037; font-style: italic; font-size: 36px; }
                .cert-text { color: #4e342e; }
                .cert-logo { max-height:100px; filter: sepia(0.8); }
            `;break;case`luxury`:u=`
                .cert-box { background: #111; color: #d4af37; border: 5px solid #d4af37; font-family: 'Arial', sans-serif; }
                .cert-title { color: #fff; letter-spacing: 5px; }
                .cert-nome { color: #d4af37; border-bottom: 1px solid #555; font-weight: 300; }
                .cert-text { color: #aaa; }
                .cert-logo { max-height:100px; filter: grayscale(100%) brightness(200%); }
            `;break;case`nature`:u=`
                .cert-box { border: 12px solid #27ae60; background: #f9fff9; font-family: 'Verdana', sans-serif; }
                .cert-title { color: #27ae60; }
                .cert-nome { color: #2c3e50; border-bottom: 2px solid #2ecc71; }
                .cert-text { color: #333; }
                .cert-logo { max-height:100px; }
            `;break;case`ocean`:u=`
                .cert-box { background: linear-gradient(to right, #e0eafc, #cfdef3); border: 5px solid #2980b9; font-family: 'Trebuchet MS', sans-serif; }
                .cert-title { color: #2c3e50; }
                .cert-nome { color: #2980b9; border-bottom: 2px solid #fff; }
                .cert-text { color: #444; }
                .cert-logo { max-height:100px; }
            `;break;case`diploma`:u=`
                .cert-box { border: 20px double #2c3e50; padding: 20px; outline: 5px solid #bdc3c7; outline-offset: -25px; font-family: 'Georgia', serif; background:#fff; }
                .cert-title { color: #2c3e50; font-size: 45px !important; }
                .cert-nome { color: #000; font-size: 38px; font-weight: bold; }
                .cert-text { color: #222; font-size: 20px !important; line-height: 2 !important; }
                .cert-logo { max-height:110px; }
            `;break;case`future`:u=`
                .cert-box { background: #f8f9fa; border: 2px solid #bdc3c7; color: #2c3e50; font-family: 'Courier New', monospace; box-shadow: inset 0 0 50px rgba(189, 195, 199, 0.5); }
                .cert-title { color: #7f8c8d; font-weight: bold; letter-spacing: 2px; }
                .cert-nome { color: #2c3e50; border-bottom: 1px solid #bdc3c7; }
                .cert-text { color: #555; }
                .cert-logo { max-height:90px; filter: grayscale(100%); }
            `;break;case`startup`:u=`
                .cert-box { border: 8px solid #000; background: #ffeaa7; color: #000; font-family: 'Arial Black', sans-serif; box-shadow: inset -15px -15px 0px rgba(0,0,0,0.1); }
                .cert-title { color: #000; text-transform: uppercase; font-weight: 900; }
                .cert-nome { color: #e17055; border-bottom: 5px solid #000; }
                .cert-text { color: #2d3436; font-family: 'Arial', sans-serif; font-weight: bold; }
                .cert-logo { max-height:100px; }
            `;break;case`creative`:u=`
                .cert-box { background: linear-gradient(45deg, #ff9a9e, #fecfef); border: 10px solid #fff; border-radius: 40px; font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; }
                .cert-title { color: #fff; text-shadow: 2px 2px 0px #ff758c; }
                .cert-nome { color: #d63031; border-bottom: 4px dotted #fff; }
                .cert-text { color: #fff; font-weight: bold; text-shadow: 1px 1px 0px rgba(0,0,0,0.1); }
                .cert-logo { max-height:100px; border-radius: 50%; border: 4px solid #fff; }
            `;break;case`geometric`:u=`
                .cert-box { background: repeating-linear-gradient(45deg, #fff, #fff 10px, #f9f9f9 10px, #f9f9f9 20px); border: 15px solid #34495e; font-family: 'Arial', sans-serif; }
                .cert-title { color: #34495e; background: #fff; display: inline-block; padding: 0 20px; }
                .cert-nome { color: #e67e22; border-bottom: 3px solid #34495e; background: #fff; display: inline-block; padding: 0 10px; }
                .cert-text { color: #2c3e50; background: rgba(255,255,255,0.9); padding: 10px; border-radius: 5px; }
                .cert-logo { max-height:100px; background:#fff; padding:10px; border-radius:10px; border:2px solid #eee; }
            `;break;default:u=`.cert-box { border: 12px solid #2c3e50; background: #fff; color: #000; }`}c.innerHTML=`
            ${N}
            
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; background:#f39c12; border:none; border-radius:5px; font-weight:bold; font-size:16px;">🖨️ IMPRIMIR CERTIFICADO</button>
                <div style="font-size:12px; color:#999; margin-top:8px; font-weight:bold;">⚠️ ATENÇÃO: Nas definições da sua impressora, garanta que a opção "Orientação" está como "Paisagem".</div>
            </div>
        
            
            <style>
                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    body { background: #fff !important; margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .print-sheet { margin: 0 auto !important; padding: 0 !important; box-shadow: none !important; background:transparent !important; border:none !important; max-width: 100% !important; width: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; height: 100vh !important;}
                    .scroll-wrapper { overflow: visible !important; padding: 0 !important; }
                }
                
                .scroll-wrapper { width: 100%; overflow-x: auto; padding-bottom: 20px; }
                
                /* ESTRUTURA BASE (Tamanho rígido da folha A4) */
                .cert-box {
                    width: 260mm;     /* 📏 LARGURA A4 PAISAGEM */
                    height: 180mm;    /* 📏 ALTURA A4 PAISAGEM */
                    margin: auto;
                    padding: 30px 40px;
                    box-sizing: border-box; 
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    page-break-inside: avoid;
                    text-align: center;
                }
                
                /* INJEÇÃO DO TEMA ESCOLHIDO PELO USUÁRIO */
                ${u}
            </style>
            
            <div class="scroll-wrapper">
                <div class="print-sheet">
                    <div class="cert-box">
                        
                        <h1 class="cert-title" style="font-size: 40px; margin-bottom: 5px; letter-spacing: 2px;">CERTIFICADO DE CONCLUSÃO</h1>
                        <p class="cert-text" style="font-size: 20px; margin-bottom: 20px; font-style: italic; opacity:0.8;">Certificamos para os devidos fins que</p>
                        
                        <h2 class="cert-nome" style="margin: 0 auto 20px auto; display: inline-block; padding: 5px 40px;">
                            ${A.escapeHTML(r.nome)}
                        </h2>
                        
                        <p class="cert-text" style="font-size: 19px; max-width: 900px; margin: 0 auto; line-height: 1.8; text-align: justify; text-align-last: center;">
                            portador(a) do CPF nº <b>${A.escapeHTML(r.cpf||`Não informado`)}</b>, concluiu com êxito todos os requisitos acadêmicos do curso de <b>${A.escapeHTML(r.curso||`Não especificado`)}</b>, iniciado em <b>${i}</b> e finalizado em <b>${s}</b>, com carga horária total de <b>${n} horas</b> e aproveitamento plenamente satisfatório.
                        </p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 15px; margin-bottom: 15px;">
                            
                            <div class="cert-text" style="flex:1; border-top: 1px solid currentColor; padding-top: 5px; margin: 0 20px; font-size: 15px;">
                                <b>A Direção</b><br>
                                <span style="font-size: 12px; opacity:0.8;">${A.escapeHTML(a.nome||`Instituição`)}</span>
                            </div>
                            
                            <div style="flex:1; display:flex; justify-content:center; align-items:center;">
                                ${l}
                            </div>
                            
                            <div class="cert-text" style="flex:1; border-top: 1px solid currentColor; padding-top: 5px; margin: 0 20px; font-size: 15px;">
                                <b>Aluno(a) Titular</b><br>
                                <span style="font-size: 12px; opacity:0.8;">${A.escapeHTML(r.nome)}</span>
                            </div>
                            
                        </div>
                        
                        <div class="cert-text" style="position: absolute; bottom: 10px; left: 0; right: 0; font-size: 10px; text-align: center; line-height: 1.4; opacity:0.6;">
                            <div style="margin-bottom: 2px;">O presente documento é amparado legalmente pela Lei nº 9.394/96 (Diretrizes e Bases da Educação Nacional) e pelo Decreto nº 5.154/04.</div>
                            <div>Documento Oficial. Emitido por ${A.escapeHTML(a.nome||`Instituição de Ensino`)} (CNPJ: ${A.escapeHTML(a.cnpj||`Não informado`)}) em ${o}.</div>
                        </div>
                        
                    </div>
                </div>
            </div>
        `}catch{A.showToast(`Erro ao gerar o certificado.`,`error`)}finally{c.innerText=l,c.disabled=!1,document.body.style.cursor=`default`}};var P=`modulepreload`,F=function(e){return`/`+e},I={},L=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=F(t,n),t in I)return;I[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:P,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},R=`true`,z=`false`,B=R===`true`,V=z===`true`;function H(e={}){let{immediate:t=!1,onNeedReload:n,onNeedRefresh:r,onOfflineReady:i,onRegistered:a,onRegisteredSW:o,onRegisterError:s}=e,c,l,u,d=async(e=!0)=>{await l,B||u?.()};async function f(){if(`serviceWorker`in navigator){if(c=await L(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-uXJn9__i.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/sw.js`,{scope:`/`,type:`classic`})).catch(e=>{s?.(e)}),!c)return;if(u=()=>{c?.messageSkipWaiting()},!V)if(B)c.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&(n?n():window.location.reload())}),c.addEventListener(`installed`,e=>{e.isUpdate||i?.()});else{let e=!1,t=()=>{e=!0,c?.addEventListener(`controlling`,e=>{e.isUpdate&&(n?n():window.location.reload())}),r?.()};c.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&i?.():n.isExternal?t():!e&&i?.():n.isUpdate||i?.()}),c.addEventListener(`waiting`,t)}c.register({immediate:t}).then(e=>{o?o(`/sw.js`,e):a?.(e)}).catch(e=>{s?.(e)})}}return l=f(),d}Object.assign(window.App,u),Object.assign(window.App,w);var U=H({onNeedRefresh(){console.log(`Nova versão detetada! A atualizar forçadamente...`),U(!0)},onOfflineReady(){console.log(`App pronta para trabalhar offline!`)}});