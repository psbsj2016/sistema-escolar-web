(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),window.CONFIG={API_URL:`/api`},window.CONFIG=window.CONFIG||{},window.App=window.App||{};var e=window.CONFIG,t=window.App,n=e.API_URL,r=[{id:`novo_aluno`,nome:`Novo Aluno`,icon:`👨‍🎓`,acao:`App.abrirModalCadastro('aluno')`,roles:[`Gestor`,`Secretaria`]},{id:`fin_carne`,nome:`Gerar Carnê`,icon:`💸`,acao:`App.renderizarTela('mensalidades')`,roles:[`Gestor`,`Secretaria`]},{id:`ped_chamada`,nome:`Fazer Chamada`,icon:`📋`,acao:`App.renderizarTela('chamada')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_notas`,nome:`Lançar Nota`,icon:`📝`,acao:`App.renderizarTela('avaliacoes')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_plan`,nome:`Planejamento`,icon:`📅`,acao:`App.renderizarTela('planejamento')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`ped_bol`,nome:`Boletins`,icon:`🖨️`,acao:`App.renderizarTela('boletins')`,roles:[`Gestor`,`Secretaria`,`Professor`]},{id:`fin_inad`,nome:`Inadimplência`,icon:`⚠️`,acao:`App.renderizarTela('inadimplencia')`,roles:[`Gestor`,`Secretaria`]},{id:`fin_rel`,nome:`Rel. Financeiro`,icon:`📊`,acao:`App.renderizarRelatorio('financeiro')`,roles:[`Gestor`,`Secretaria`]},{id:`doc_ficha`,nome:`Ficha Matrícula`,icon:`📄`,acao:`App.renderizarRelatorio('ficha')`,roles:[`Gestor`,`Secretaria`]},{id:`doc_dossie`,nome:`Dossiê Executivo`,icon:`📁`,acao:`App.renderizarRelatorio('dossie')`,roles:[`Gestor`]},{id:`doc_gerador`,nome:`Documentos`,icon:`🎓`,acao:`App.renderizarRelatorio('documentos')`,roles:[`Gestor`,`Secretaria`]}];Object.assign(t,{usuario:null,entidadeAtual:null,idEdicao:null,idEdicaoUsuario:null,listaCache:[],sanitizeHTML:e=>e?typeof DOMPurify>`u`?(console.warn(`DOMPurify não carregado. Usando escapeHTML como fallback.`),t.escapeHTML(e)):DOMPurify.sanitize(e,{USE_PROFILES:{html:!0},ALLOWED_TAGS:[`p`,`br`,`strong`,`b`,`em`,`i`,`u`,`h1`,`h2`,`h3`,`h4`,`ul`,`ol`,`li`,`div`,`span`,`table`,`thead`,`tbody`,`tr`,`td`,`th`,`blockquote`],ALLOWED_ATTR:[`style`,`class`]}):``,motorTempoRealLigado:!1,calendarState:{month:new Date().getMonth(),year:new Date().getFullYear()},escapeHTML:e=>e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`),unescapeHTML:e=>e==null?``:String(e).replace(/&amp;/g,`&`).replace(/&lt;/g,`<`).replace(/&gt;/g,`>`).replace(/&quot;/g,`"`).replace(/&#039;/g,`'`),criarElemento:(e,t=[],n={},r=``)=>{let i=document.createElement(e);t.length>0&&i.classList.add(...t);for(let e in n)if(e.startsWith(`on`)&&typeof n[e]==`function`){let t=e.substring(2).toLowerCase();i.addEventListener(t,n[e])}else i.setAttribute(e,n[e]);return r!==``&&(i.textContent=r),i},getTenantKey:e=>`${e}_${t.usuario&&t.usuario.id?t.usuario.id:`convidado`}`,getPlanoAtual:()=>localStorage.getItem(t.getTenantKey(`escola_plano`))||`Teste`,getDeviceId:()=>{let e=localStorage.getItem(`ptt_device_id`);return e||(e=`dev_`+window.crypto.randomUUID(),localStorage.setItem(`ptt_device_id`,e)),e},aplicarPermissoesDeUsuario:()=>{if(!t.usuario)return;let e=t.usuario.tipo||`Gestor`;document.querySelectorAll(`.sidebar button, .sidebar .menu-item`).forEach(t=>{let n=t.getAttribute(`onclick`)||``,r=!0;e===`Professor`?(n.includes(`mensalidade`)||n.includes(`financeiro`)||n.includes(`inadimplencia`)||n.includes(`relatorio`)||n.includes(`configuracoes`)||n.includes(`aparencia`)||n.includes(`backup`)||n.includes(`plano`)||n.includes(`conta`))&&(r=!1):e===`Secretaria`&&(n.includes(`configuracoes`)||n.includes(`aparencia`)||n.includes(`backup`)||n.includes(`plano`)||n.includes(`dossie`)||n.includes(`conta`))&&(r=!1),t.style.display=r?``:`none`})},verificarBloqueioGeral:e=>{if(!e)return!1;let t=e.plano||`Teste`;if(t===`Bloqueado`)return!0;let n=new Date;if(e.dataExpiracao)return n>=new Date(e.dataExpiracao);{let r=e.dataCriacao?new Date(e.dataCriacao):new Date,i=Math.floor(Math.abs(n-r)/(1e3*60*60*24));if(t===`Teste`&&i>=7||t!==`Teste`&&t!==`Premium`&&i>=30)return!0}return!1},mostrarTelaBloqueioLogin:e=>{document.documentElement.removeAttribute(`style`),document.getElementById(`tela-sistema`).style.display=`none`;let t=document.getElementById(`tela-login`);t&&(t.style.display=t.classList.contains(`login-wrapper`)?`flex`:`block`);let n=t.querySelectorAll(`.login-box, .box-login`);n.forEach(e=>{e.id!==`box-bloqueio-conta`&&(e.style.display=`none`)});let r=document.getElementById(`box-bloqueio-conta`);r||(r=document.createElement(`div`),r.id=`box-bloqueio-conta`,r.className=n.length>0?n[0].className:`login-box`,r.style.maxWidth=`400px`,r.style.margin=`0 auto`,r.style.background=`#fff`,r.style.padding=`30px`,r.style.borderRadius=`12px`,r.style.boxShadow=`0 10px 25px rgba(0,0,0,0.1)`,t.appendChild(r)),r.style.display=`block`,r.innerHTML=`
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
        `},sairDaTelaDeBloqueio:()=>{t.logout()},ativarPinLogin:async e=>{e&&e.preventDefault();let n=document.getElementById(`input-pin-login`);if(!n)return;let r=n.value.trim().toUpperCase();if(!r)return t.showToast(`Por favor, insira o PIN recebido no e-mail.`,`warning`);let i=e.target,a=i.innerText;i&&(i.innerText=`A validar... ⏳`,i.disabled=!0);try{let e=await t.api(`/escola/validar-pin`,`POST`,{pin:r}),n=e&&e.success?e.plano:null;if(!n)if(r.includes(`PRE`))n=`Premium`;else if(r.includes(`ESS`))n=`Essencial`;else if(r.includes(`PRO`))n=`Profissional`;else{t.showToast(e.error||`PIN inválido ou formato incorreto.`,`error`),i&&(i.innerText=a,i.disabled=!1);return}let o=await t.api(`/escola`)||{},s=new Date;s.setDate(s.getDate()+30),await t.api(`/escola`,`PUT`,{...o,plano:n,pinUsado:r,dataExpiracao:s.toISOString()}),localStorage.setItem(t.getTenantKey(`escola_plano`),n);let c=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{};c.plano=n,c.dataExpiracao=s.toISOString(),localStorage.setItem(t.getTenantKey(`escola_perfil`),JSON.stringify(c)),t.atualizarUIHeader(c),t.showToast(`🎉 PIN validado! Sistema desbloqueado por mais 30 dias.`,`success`);let l=document.getElementById(`box-bloqueio-conta`);l&&(l.style.display=`none`),t.entrarNoSistema()}catch{t.showToast(`Erro ao comunicar com a base de dados.`,`error`)}finally{i&&(i.innerText=a,i.disabled=!1)}},verificarLimites:async e=>{let n=t.getPlanoAtual();if(n===`Premium`||n===`Teste`)return!0;try{if(e===`aluno`){let e=await t.api(`/alunos`),r=n===`Essencial`?20:n===`Profissional`?80:0;if(e.length>=r)return t.showToast(`⚠️ Limite de ${r} alunos atingido no plano ${n}. Faça o upgrade para continuar a crescer!`,`warning`),setTimeout(()=>t.renderizarMeuPlano(),2e3),!1}else if(e===`usuario`){let e=await t.api(`/usuarios`),r=n===`Essencial`?2:n===`Profissional`?4:0;if(e.length>=r)return t.showToast(`⚠️ Limite de ${r} acessos atingido no plano ${n}. Faça o upgrade para adicionar mais equipa!`,`warning`),setTimeout(()=>t.renderizarMeuPlano(),2e3),!1}return!0}catch{return!1}},verificarPermissao:e=>{let n=t.getPlanoAtual();return n===`Premium`||n===`Teste`?!0:e===`whatsapp`&&n===`Essencial`?(t.showToast(`💎 Funcionalidade disponível a partir do Plano Profissional. Faça o upgrade!`,`warning`),setTimeout(()=>t.renderizarMeuPlano(),1500),!1):e===`dossie`&&n!==`Premium`?(t.showToast(`💎 Exclusivo do Plano Premium. Faça o upgrade para aceder ao Dossiê Executivo!`,`warning`),setTimeout(()=>t.renderizarMeuPlano(),1500),!1):!0},api:async(e,r=`GET`,i=null)=>{let a={method:r,headers:{"Content-Type":`application/json`},credentials:`include`,cache:`no-store`};i&&(a.body=JSON.stringify(i));try{let i=await fetch(`${n}${e}`,a),o;try{o=await i.json()}catch{o=null}return i.ok?(r!==`GET`&&t.usuario&&setTimeout(t.verificarNotificacoes,800),o):((i.status===401||i.status===403)&&!e.startsWith(`/auth/`)&&(t.showToast(`Sessão expirada. Faça login novamente.`,`warning`),t.logout()),o||{error:`Erro HTTP: ${i.status}`})}catch(e){return console.error(`Erro no fetch:`,e),r===`GET`?[]:{error:`Falha na conexão. Verifique a internet.`}}},setTitulo:e=>{let t=document.getElementById(`titulo-pagina`);t&&(t.innerText=e)},toggleSub:e=>{document.querySelectorAll(`.submenu`).forEach(t=>{t.id!==e&&(t.style.display=`none`)});let t=document.getElementById(e);t&&(t.style.display=t.style.display===`block`?`none`:`block`)},fecharModal:()=>{document.getElementById(`modal-overlay`).style.display=`none`;let e=document.querySelector(`.btn-confirm`);e&&(e.style.display=`inline-flex`,e.setAttribute(`onclick`,`App.salvarCadastro()`),e.innerHTML=`💾 Salvar Registro`)},mascaraCNPJ:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/^(\d{2})(\d)/,`$1.$2`),t=t.replace(/^(\d{2})\.(\d{3})(\d)/,`$1.$2.$3`),t=t.replace(/\.(\d{3})(\d)/,`.$1/$2`),t=t.replace(/(\d{4})(\d)/,`$1-$2`),e.value=t},mascaraCPF:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/(\d{3})(\d)/,`$1.$2`),t=t.replace(/(\d{3})(\d)/,`$1.$2`),t=t.replace(/(\d{3})(\d{1,2})$/,`$1-$2`),e.value=t},mascaraCelular:e=>{let t=e.value;t.startsWith(`+`)?e.value=`+`+t.replace(/\D/g,``):(t=t.replace(/\D/g,``),t=t.replace(/^(\d{2})(\d)/g,`($1) $2`),t=t.replace(/(\d)(\d{4})$/,`$1-$2`),e.value=t)},mascaraCEP:e=>{let t=e.value.replace(/\D/g,``);t=t.replace(/^(\d{5})(\d)/,`$1-$2`),e.value=t},mascaraValor:e=>{let t=e.value.replace(/\D/g,``);t=(t/100).toFixed(2)+``,e.value=t},init:async()=>{localStorage.removeItem(`escola_tema`),localStorage.removeItem(`escola_atalhos`),localStorage.removeItem(`escola_perfil`);let e=new URLSearchParams(window.location.search).get(`reset`);if(e){document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`,setTimeout(()=>{t.abrirModalNovaSenha(e)},300);return}let n=localStorage.getItem(`usuario_logado`),r=localStorage.getItem(`escola_bio_id`);if(n){t.usuario=JSON.parse(n),t.aplicarTemaSalvo();let e=t.getTenantKey(`escola_atalhos`);localStorage.getItem(e)||localStorage.setItem(e,JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]));let i=await t.api(`/escola`);if(!i||i.error){if(i?.error===`Sessão não encontrada.`||i?.error===`Sessão expirada.`){await t.logout();return}i=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{}}t.verificarBloqueioGeral(i)?(document.documentElement.removeAttribute(`style`),t.mostrarTelaBloqueioLogin(i)):r&&window.PublicKeyCredential?(document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`,document.getElementById(`btn-biometria`).style.display=`block`,setTimeout(()=>{t.entrarComBiometria()},600)):t.entrarNoSistema()}else document.documentElement.removeAttribute(`style`),document.getElementById(`tela-login`).style.display=`flex`,document.getElementById(`tela-sistema`).style.display=`none`;let i=document.getElementById(`data-hoje`);i&&(i.innerText=new Date().toLocaleDateString(`pt-BR`)),t.setupMobileMenu();let a=document.getElementById(`login-pass`);if(a&&a.addEventListener(`keypress`,function(e){e.key===`Enter`&&t.fazerLogin()}),!t.motorTempoRealLigado){let e=()=>{let e=document.getElementById(`tela-sistema`);t.usuario&&e&&e.style.display!==`none`&&(t.verificarNotificacoes(),t.carregarDadosEscola())};setTimeout(e,2e3),setInterval(e,1e4),t.motorTempoRealLigado=!0}},fazerLogin:async()=>{let e=document.getElementById(`login-user`).value.trim(),n=document.getElementById(`login-pass`).value.trim();if(!e||!n)return t.showToast(`Preencha utilizador e senha`,`warning`);let r=document.querySelector(`#tela-login button[type="submit"]`),i=r.innerText;r.innerText=`Autenticando... ⏳`,r.disabled=!0;try{let r=t.getDeviceId(),i=await t.api(`/auth/login`,`POST`,{login:e,senha:n,deviceId:r});if(i&&i.success){t.usuario=i.usuario,localStorage.setItem(`usuario_logado`,JSON.stringify(i.usuario)),typeof gtag==`function`&&gtag(`event`,`login`,{method:`Sistema PTT`}),t.aplicarTemaSalvo();let e=t.getTenantKey(`escola_atalhos`);localStorage.getItem(e)||localStorage.setItem(e,JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]));let n=await t.api(`/escola`);if(!n||n.error){if(n?.error===`Sessão não encontrada.`||n?.error===`Sessão expirada.`){await t.logout();return}n=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{}}t.verificarBloqueioGeral(n)?t.mostrarTelaBloqueioLogin(n):(t.entrarNoSistema(),t.showToast(`Bem-vindo ao sistema!`,`success`))}else t.showToast(i.error||`Login ou senha incorretos`,`error`)}catch{t.showToast(`Erro ao conectar no servidor`,`error`)}finally{r.innerText=i,r.disabled=!1}},entrarNoSistema:async()=>{document.getElementById(`tela-login`).style.display=`none`,document.getElementById(`tela-sistema`).style.display=`flex`;let e=document.getElementById(`user-name`);e&&t.usuario&&(e.innerText=t.usuario.nome||t.usuario.login),t.aplicarPermissoesDeUsuario(),await t.carregarDadosEscola(),document.getElementById(`tela-sistema`).style.display!==`none`&&t.renderizarInicio()},logout:async()=>{try{await fetch(`${n}/auth/logout`,{method:`POST`,credentials:`include`})}catch{}document.documentElement.removeAttribute(`style`),localStorage.removeItem(`usuario_logado`),localStorage.removeItem(`token_acesso`),t.usuario=null;let e=document.getElementById(`login-user`);e&&(e.value=``);let r=document.getElementById(`login-pass`);r&&(r.value=``);let i=document.getElementById(`modal-overlay`);i&&(i.style.display=`none`);let a=document.getElementById(`modal-cadastro-inst`);a&&(a.style.display=`none`);let o=document.getElementById(`modal-recuperacao-senha`);o&&(o.style.display=`none`);let s=document.querySelector(`.sidebar`);s&&s.classList.remove(`active`);let c=document.querySelector(`.mobile-overlay`);c&&c.classList.remove(`active`);let l=document.getElementById(`noti-dropdown`);l&&l.classList.remove(`active`),document.getElementById(`tela-sistema`).style.display=`none`;let u=document.getElementById(`tela-login`);u&&(u.style.display=u.classList.contains(`login-wrapper`)?`flex`:`block`);let d=document.getElementById(`box-bloqueio-conta`);d&&(d.style.display=`none`),document.querySelectorAll(`#tela-login .login-box, #tela-login .box-login`).forEach(e=>{e.id!==`box-bloqueio-conta`&&(e.style.display=``)})},toggleSenhaLogin:()=>{let e=document.getElementById(`login-pass`);e&&(e.type=e.type===`password`?`text`:`password`)},abrirModalRecuperacao:e=>{e&&e.preventDefault();let t=document.getElementById(`modal-recuperacao-senha`);t||(t=document.createElement(`div`),t.id=`modal-recuperacao-senha`,t.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;`,t.innerHTML=`
            <div style="background:#fff; padding:30px; border-radius:12px; max-width:400px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                <span style="font-size: 40px; display:block; margin-bottom:10px;">🔐</span>
                <h3 style="margin-top:0; color:#2c3e50;">Recuperar Senha</h3>
                <p style="font-size:13px; color:#666; margin-bottom:20px;">
                    Insira o e-mail registado na sua conta. Enviaremos um link seguro para criar uma nova senha.
                </p>

                <input type="email" id="recuperar-email-input" placeholder="O seu e-mail de acesso" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">

                <button class="btn-primary" onclick="App.enviarRecuperacaoSenha()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">
                    ✉️ Enviar Link de Recuperação
                </button>

                <button class="btn-cancel" onclick="document.getElementById('modal-recuperacao-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">
                    Cancelar e Voltar
                </button>
            </div>
        `,document.body.appendChild(t)),document.getElementById(`recuperar-email-input`).value=``,t.style.display=`flex`},enviarRecuperacaoSenha:async()=>{let e=document.getElementById(`recuperar-email-input`)?.value.trim();if(!e)return t.showToast(`Informe o e-mail de acesso.`,`warning`);let r=document.querySelector(`#modal-recuperacao-senha .btn-primary`),i=r.innerText;r.innerText=`Enviando link... ⏳`,r.disabled=!0;try{let r=await(await fetch(`${n}/auth/recuperar-senha`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:e})})).json();r.success?(t.showToast(r.message||`Se este e-mail estiver cadastrado, enviaremos um link.`,`success`),document.getElementById(`modal-recuperacao-senha`).style.display=`none`):t.showToast(r.error||`Não foi possível solicitar a recuperação.`,`error`)}catch{t.showToast(`Erro de comunicação com o servidor.`,`error`)}finally{r.innerText=i,r.disabled=!1}},abrirModalNovaSenha:e=>{let n=document.getElementById(`modal-nova-senha`);n||(n=document.createElement(`div`),n.id=`modal-nova-senha`,n.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:10000;`,n.innerHTML=`
            <div style="background:#fff; padding:30px; border-radius:12px; max-width:420px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                <span style="font-size: 40px; display:block; margin-bottom:10px;">🔑</span>
                <h3 style="margin-top:0; color:#2c3e50;">Criar Nova Senha</h3>

                <p style="font-size:13px; color:#666; margin-bottom:20px;">
                    Digite a sua nova senha de acesso.
                </p>

                <input type="password" id="nova-senha-reset" placeholder="Nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:12px; text-align:center;">

                <input type="password" id="confirma-senha-reset" placeholder="Confirmar nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">

                <button class="btn-primary" onclick="App.confirmarNovaSenhaReset()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">
                    ✅ Salvar Nova Senha
                </button>

                <button class="btn-cancel" onclick="document.getElementById('modal-nova-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">
                    Cancelar
                </button>
            </div>
        `,document.body.appendChild(n)),t.tokenResetSenha=e,n.style.display=`flex`},confirmarNovaSenhaReset:async()=>{let e=document.getElementById(`nova-senha-reset`)?.value||``,r=document.getElementById(`confirma-senha-reset`)?.value||``;if(e.length<6)return t.showToast(`A nova senha deve ter pelo menos 6 caracteres.`,`warning`);if(e!==r)return t.showToast(`As senhas não conferem.`,`warning`);let i=document.querySelector(`#modal-nova-senha .btn-primary`),a=i.innerText;i.innerText=`Salvando... ⏳`,i.disabled=!0;try{let r=await(await fetch(`${n}/auth/redefinir-senha`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({token:t.tokenResetSenha,novaSenha:e})})).json();if(r.success){t.showToast(`Senha redefinida com sucesso. Faça login com a nova senha.`,`success`),document.getElementById(`modal-nova-senha`).style.display=`none`,t.tokenResetSenha=null;let e=window.location.origin+window.location.pathname;window.history.replaceState({},document.title,e)}else t.showToast(r.error||`Não foi possível redefinir a senha.`,`error`)}catch{t.showToast(`Erro de comunicação com o servidor.`,`error`)}finally{i.innerText=a,i.disabled=!1}},bufferToBase64:function(e){for(var t=new Uint8Array(e),n=``,r=0;r<t.byteLength;r++)n+=String.fromCharCode(t[r]);return btoa(n)},base64ToBuffer:function(e){for(var t=atob(e),n=t.length,r=new Uint8Array(n),i=0;i<n;i++)r[i]=t.charCodeAt(i);return r},configurarBiometria:async()=>{if(!window.PublicKeyCredential)return t.showToast(`Este dispositivo não suporta biometria.`,`error`);try{t.exibirOverlayBiometria(`Configurar Acesso Seguro`,`Use o sensor digital ou FaceID para registrar o seu acesso neste aparelho.`);let e=window.crypto.getRandomValues(new Uint8Array(32)),n=window.crypto.getRandomValues(new Uint8Array(16)),r=await navigator.credentials.create({publicKey:{challenge:e,rp:{name:`App Gestão PTT`},user:{id:n,name:t.usuario.login,displayName:t.usuario.nome},pubKeyCredParams:[{type:`public-key`,alg:-7},{type:`public-key`,alg:-257}],authenticatorSelection:{authenticatorAttachment:`platform`,userVerification:`required`},timeout:6e4}});r&&(localStorage.setItem(`escola_bio_id`,t.bufferToBase64(r.rawId)),t.removerOverlayBiometria(),t.showToast(`✅ Biometria ativada com sucesso!`,`success`),t.renderizarMinhaConta())}catch(e){t.removerOverlayBiometria(),console.error(e),t.showToast(`Configuração cancelada ou falhou.`,`warning`)}},entrarComBiometria:async()=>{let e=localStorage.getItem(`escola_bio_id`);if(e)try{t.exibirOverlayBiometria(`Autenticação Biométrica`,`Aguardando confirmação de identidade...`);let n=window.crypto.getRandomValues(new Uint8Array(32)),r=t.base64ToBuffer(e);await navigator.credentials.get({publicKey:{challenge:n,allowCredentials:[{type:`public-key`,id:r}],userVerification:`required`,timeout:6e4}})&&(t.removerOverlayBiometria(),t.showToast(`🔓 Identidade confirmada!`,`success`),t.entrarNoSistema())}catch(e){t.removerOverlayBiometria(),console.error(e),t.showToast(`Biometria não reconhecida. Use sua senha.`,`info`)}},exibirOverlayBiometria:(e,t)=>{let n=document.getElementById(`bio-overlay-premium`);n||(n=document.createElement(`div`),n.id=`bio-overlay-premium`,n.style.cssText=`
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000;
        `,document.body.appendChild(n)),n.innerHTML=`
        <div style="background: white; padding: 40px; border-radius: 28px; text-align: center; width: 85%; max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); animation: slideUpBio 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div class="bio-icon-pulse" style="font-size: 65px; margin-bottom: 20px;">👤</div>
            <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px; font-family: sans-serif;">${e}</h2>
            <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5; margin-bottom: 25px; font-family: sans-serif;">${t}</p>
            <div style="font-size: 11px; color: #3498db; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">App Gestão PTT</div>
        </div>
        <style>
            @keyframes slideUpBio { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .bio-icon-pulse { animation: pulseBio 1.8s infinite; display: inline-block; }
            @keyframes pulseBio { 0% { transform: scale(1); } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); } }
        </style>
    `,n.style.display=`flex`},removerOverlayBiometria:()=>{let e=document.getElementById(`bio-overlay-premium`);e&&(e.style.display=`none`)},abrirTelaCadastroInst:()=>{document.getElementById(`modal-cadastro-inst`).style.display=`flex`,t.voltarEtapa1()},fecharModalInst:()=>{document.getElementById(`modal-cadastro-inst`).style.display=`none`},voltarEtapa1:()=>{document.getElementById(`etapa-1-email`).style.display=`block`,document.getElementById(`etapa-2-validacao`).style.display=`none`,document.getElementById(`etapa-3-sucesso`).style.display=`none`},enviarCodigoInst:async()=>{let e=document.getElementById(`novo-inst-email`).value,n=document.querySelector(`#etapa-1-email button`);if(!e||!e.includes(`@`))return t.showToast(`Digite um e-mail válido.`,`error`);let r=n.innerText;n.innerText=`Enviando... ⏳`,n.disabled=!0;try{let n=await t.api(`/auth/enviar-codigo`,`POST`,{email:e});n&&n.success?(t.showToast(`Código enviado!`,`success`),document.getElementById(`etapa-1-email`).style.display=`none`,document.getElementById(`etapa-2-validacao`).style.display=`block`):t.showToast(`Erro ao enviar e-mail.`,`error`)}catch{t.showToast(`Erro de servidor.`,`error`)}finally{n.innerText=r,n.disabled=!1}},validarCadastroInst:async()=>{let e=document.getElementById(`novo-inst-email`).value,n=document.getElementById(`novo-inst-codigo`).value.trim(),r=document.getElementById(`novo-inst-pin`).value.trim(),i=document.querySelector(`#etapa-2-validacao button`);if(!n||!r)return t.showToast(`Preencha Código e PIN.`,`error`);let a=i.innerText;i.innerText=`A Validar... ⏳`,i.disabled=!0;try{let i=await t.api(`/auth/validar-cadastro`,`POST`,{email:e,codigo:n,pin:r});i&&i.success?(document.getElementById(`etapa-2-validacao`).style.display=`none`,document.getElementById(`etapa-3-sucesso`).style.display=`block`,typeof confetti==`function`&&confetti(),typeof gtag==`function`&&gtag(`event`,`generate_lead`,{currency:`BRL`,value:0,tipo_conta:`App Gestão PTT`})):t.showToast(i.error||`Dados incorretos.`,`error`)}catch{t.showToast(`Erro de servidor.`,`error`)}finally{i.innerText=a,i.disabled=!1}},showToast:(e,n=`info`)=>{let r=document.getElementById(`toast-container`);r||(r=t.criarElemento(`div`,[],{id:`toast-container`}),document.body.appendChild(r));let i=n===`success`?`✅`:n===`error`?`❌`:n===`warning`?`⚠️`:`ℹ️`,a=t.criarElemento(`div`,[`toast`,n]),o=t.criarElemento(`span`,[`toast-icon`],{},i),s=t.criarElemento(`span`,[],{},e);a.appendChild(o),a.appendChild(s),r.appendChild(a),setTimeout(()=>{a.style.animation=`fadeOut 0.5s ease forwards`,setTimeout(()=>a.remove(),500)},3e3)},setupMobileMenu:()=>{let e=document.querySelector(`header`);if(e&&!document.getElementById(`btn-mobile-menu`)){let n=document.createElement(`button`);n.id=`btn-mobile-menu`,n.className=`mobile-menu-btn`,n.innerHTML=`☰`,n.onclick=()=>{document.querySelector(`.sidebar`).classList.toggle(`active`),(document.querySelector(`.mobile-overlay`)||t.criarOverlay()).classList.toggle(`active`)},e.insertBefore(n,e.firstChild),t.criarOverlay()}},criarOverlay:()=>{if(document.querySelector(`.mobile-overlay`))return document.querySelector(`.mobile-overlay`);let e=document.createElement(`div`);return e.className=`mobile-overlay`,e.onclick=()=>{document.querySelector(`.sidebar`).classList.remove(`active`),e.classList.remove(`active`)},document.body.appendChild(e),e},aplicarTemaSalvo:()=>{let e=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_tema`)));if(e){let t=document.documentElement;e.sidebarBg&&t.style.setProperty(`--sidebar-bg`,e.sidebarBg),e.sidebarText&&t.style.setProperty(`--sidebar-text`,e.sidebarText),e.bodyBg&&t.style.setProperty(`--body-bg`,e.bodyBg),e.textMain&&t.style.setProperty(`--text-main`,e.textMain),e.cardBg&&t.style.setProperty(`--card-bg`,e.cardBg),e.cardText&&t.style.setProperty(`--card-text`,e.cardText),e.zoomLevel&&t.style.setProperty(`--zoom-level`,e.zoomLevel)}else document.documentElement.removeAttribute(`style`)},UI:{card:(e,t,n,r=`100%`)=>`<div class="card" style="max-width: ${r}; margin: 0 auto;">${e?`<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${e}</h3>`:``}${t?`<p style="color:#666; margin-bottom:20px; font-size:13px;">${t}</p>`:``}${n}</div>`,input:(e,t,n=``,r=``,i=`text`,a=``)=>`<div class="input-group"><label>${e}</label><input type="${i}" id="${t}" value="${n}" placeholder="${r}" ${a}></div>`,botao:(e,t,n=`primary`,r=``)=>`<button class="${n===`primary`?`btn-primary`:n===`cancel`?`btn-cancel`:`btn-edit`}" style="width: auto; padding: 10px 20px;" onclick="${t}">${r} ${e}</button>`,colorPicker:(e,t,n)=>`<div class="theme-row"><label>${e}</label><input type="color" value="${t}" oninput="App.previewCor('${n}', this.value)"></div>`},renderizarConfiguracoesAparencia:()=>{t.setTitulo(`Aparência do Sistema`);let e=document.getElementById(`app-content`),n=getComputedStyle(document.documentElement),i=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_tema`)))||{},a={sbBg:n.getPropertyValue(`--sidebar-bg`).trim(),sbTxt:n.getPropertyValue(`--sidebar-text`).trim(),bdBg:n.getPropertyValue(`--body-bg`).trim(),txtMain:n.getPropertyValue(`--text-main`).trim(),cdBg:n.getPropertyValue(`--card-bg`).trim(),cdTxt:n.getPropertyValue(`--card-text`).trim(),zoomAtual:i.zoomLevel||`1`},o=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_atalhos`)))||[],s=`<div class="theme-section"><h4 style="margin:0 0 15px 0;">1. Cores do Sistema</h4><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;"><div><div style="font-weight:bold; margin-bottom:10px;">Menu Lateral</div>${t.UI.colorPicker(`Fundo:`,a.sbBg,`--sidebar-bg`)}${t.UI.colorPicker(`Texto:`,a.sbTxt,`--sidebar-text`)}</div><div><div style="font-weight:bold; margin-bottom:10px;">Área Principal</div>${t.UI.colorPicker(`Fundo:`,a.bdBg,`--body-bg`)}${t.UI.colorPicker(`Texto:`,a.txtMain,`--text-main`)}</div><div><div style="font-weight:bold; margin-bottom:10px;">Dashboard / Cards</div>${t.UI.colorPicker(`Fundo:`,a.cdBg,`--card-bg`)}${t.UI.colorPicker(`Texto:`,a.cdTxt,`--card-text`)}</div></div></div>`,c=`<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">2. Atalhos no Dashboard</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Selecione os atalhos (Mínimo: 1 | Máximo: 8).</p><div class="shortcut-selector" style="display:flex; flex-wrap:wrap; gap:10px;">${r.map(e=>`<label class="shortcut-item" style="background:#f9f9f9; padding:8px 12px; border-radius:6px; cursor:pointer;"><input type="checkbox" class="sc-check" value="${e.id}" ${o.includes(e.id)?`checked`:``} onchange="App.validarLimiteAtalhos(this)"> ${e.icon} ${e.nome}</label>`).join(``)}</div></div>`,l=`<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">3. Tamanho da Fonte (Zoom)</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Ajuste o tamanho geral para facilitar a leitura.</p><div class="input-group" style="max-width: 300px;"><select id="theme-zoom" style="font-weight:bold; cursor:pointer;" onchange="App.previewZoom(this.value)"><option value="0.9" ${a.zoomAtual===`0.9`?`selected`:``}>Pequena (90%)</option><option value="1" ${a.zoomAtual===`1`?`selected`:``}>Padrão (100%)</option><option value="1.1" ${a.zoomAtual===`1.1`?`selected`:``}>Maior (110%)</option></select></div></div>`,u=`<div style="display:flex; gap:10px; margin-top: 25px; flex-wrap:wrap;">${t.UI.botao(`💾 SALVAR ALTERAÇÕES`,`App.salvarTema()`,`primary`,``)}${t.UI.botao(`✖️ RESTAURAR PADRÃO`,`App.resetarTema()`,`cancel`,``)}</div>`;e.innerHTML=t.UI.card(`🎨 Personalizar Aparência`,`Personalize as cores, zoom e atalhos da tela inicial.`,s+l+c+u,`800px`)},previewCor:(e,t)=>{document.documentElement.style.setProperty(e,t)},previewZoom:e=>{document.documentElement.style.setProperty(`--zoom-level`,e)},validarLimiteAtalhos:e=>{document.querySelectorAll(`.sc-check:checked`).length>8&&(e.checked=!1,t.showToast(`O limite máximo é de 8 atalhos.`,`warning`))},salvarTema:()=>{let e=getComputedStyle(document.documentElement),n={sidebarBg:e.getPropertyValue(`--sidebar-bg`).trim(),sidebarText:e.getPropertyValue(`--sidebar-text`).trim(),bodyBg:e.getPropertyValue(`--body-bg`).trim(),textMain:e.getPropertyValue(`--text-main`).trim(),cardBg:e.getPropertyValue(`--card-bg`).trim(),cardText:e.getPropertyValue(`--card-text`).trim(),zoomLevel:document.getElementById(`theme-zoom`).value},r=Array.from(document.querySelectorAll(`.sc-check:checked`)).map(e=>e.value);if(r.length===0)return t.showToast(`Selecione pelo menos 1 atalho.`,`warning`);if(r.length>8)return t.showToast(`Máximo de 8 atalhos permitidos.`,`warning`);localStorage.setItem(t.getTenantKey(`escola_tema`),JSON.stringify(n)),localStorage.setItem(t.getTenantKey(`escola_atalhos`),JSON.stringify(r)),t.aplicarTemaSalvo(),t.showToast(`Configurações salvas com sucesso! 🎉`,`success`),setTimeout(()=>{t.renderizarInicio()},800)},resetarTema:()=>{confirm(`Deseja restaurar as cores e fontes padrão?`)&&(localStorage.removeItem(t.getTenantKey(`escola_tema`)),localStorage.setItem(t.getTenantKey(`escola_atalhos`),JSON.stringify([`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`])),document.documentElement.removeAttribute(`style`),t.showToast(`Aparência restaurada com sucesso! 🔄`,`success`),setTimeout(()=>{location.reload()},1e3))},renderizarInicio:async()=>{t.verificarNotificacoes(),t.setTitulo(`Visão Geral`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando painel de métricas...</p>`;try{let[n,i,a,o]=await Promise.all([t.api(`/alunos`),t.api(`/financeiro`),t.api(`/turmas`),t.api(`/cursos`)]),s=(Array.isArray(n)?n:[]).filter(e=>!e.status||e.status===`Ativo`),c=Array.isArray(i)?i:[],l=Array.isArray(a)?a:[],u=Array.isArray(o)?o:[],d=new Date,f=d.getMonth()+1,p=d.getFullYear(),m=s.map(e=>e.id),h=c.filter(e=>{if(!e.vencimento)return!1;let t=e.vencimento.split(`-`);return parseInt(t[1])===f&&parseInt(t[0])===p}),g=h.filter(e=>e.status===`Pago`).reduce((e,t)=>e+parseFloat(t.valor),0),_=h.filter(e=>e.status!==`Pago`&&m.includes(e.idAluno)).reduce((e,t)=>e+parseFloat(t.valor),0),v=c.filter(e=>e.status===`Pendente`&&new Date(e.vencimento+`T00:00:00`)<d&&m.includes(e.idAluno)).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),y=e=>e.toLocaleString(`pt-BR`,{minimumFractionDigits:2,maximumFractionDigits:2}),b=t.usuario?t.usuario.tipo:`Gestor`,x=b!==`Professor`,S=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_atalhos`)));(!S||!Array.isArray(S)||S.length===0)&&(S=[`novo_aluno`,`fin_carne`,`ped_chamada`,`ped_notas`,`ped_plan`,`ped_bol`]);let C=S.map(e=>{let t=r.find(t=>t.id===e);return t&&t.roles.includes(b)?`<div class="shortcut-btn" onclick="${t.acao}"><div>${t.icon}</div><span>${t.nome}</span></div>`:``}).join(``),w=v.length===0?`<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>`:v.map(e=>{let n=(s.find(t=>t.id===e.idAluno)||{}).whatsapp||``,r=e.vencimento.split(`-`).reverse().join(`/`),i=y(parseFloat(e.valor));return`<div style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);"><div><div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${t.escapeHTML(e.alunoNome||`Desconhecido`)}</div><div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${r} • R$ ${i}</div></div><button onclick="App.cobrarWhatsAppDashboard('${t.escapeHTML(e.alunoNome)}', '${n}', '${r}', '${i}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span>💬</span> Cobrar</button></div>`}).join(``);if(e.innerHTML=`
                <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${t.escapeHTML(t.usuario?t.usuario.nome:`Gestor`)}! 👋</h3>
                <div class="dashboard-grid">
                    <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">🎓</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Alunos</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${s.length}</span></div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">🏫</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Turmas</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${l.length}</span></div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">📚</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Cursos</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${u.length}</span></div>
                    </div>
                    ${x?`
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;"><div class="stat-info"><h4>Receita (${f}/${p})</h4><p style="color:#27ae60; font-size:20px;">R$ ${y(g)}</p></div><div class="stat-icon" style="font-size:24px;">💰</div></div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${y(_)}</span></div>
                    </div>
                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; height:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;"><h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${v.length})</h4></div>
                        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px;">${w}</div>
                    </div>
                    `:``}
                </div>
                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${C||`<p style="color:#666;">Nenhum atalho selecionado ou permitido.</p>`}</div>`,x){let e=document.getElementById(`graficoFinanceiro`);e&&(g>0||_>0)?new Chart(e,{type:`doughnut`,data:{labels:[`Recebido`,`Pendente`],datasets:[{data:[g,_],backgroundColor:[`#27ae60`,`#e74c3c`],borderWidth:0,hoverOffset:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},cutout:`75%`}}):e&&new Chart(e,{type:`doughnut`,data:{datasets:[{data:[1],backgroundColor:[`#eee`],borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{enabled:!1}},cutout:`75%`}})}}catch(t){console.error(t),e.innerHTML=`<p>Erro ao carregar dashboard.</p>`}},cobrarWhatsAppDashboard:(e,n,r,i)=>{if(!t.verificarPermissao(`whatsapp`))return;if(!n||n.trim()===``||n===`undefined`){t.showToast(`Este aluno não tem um número de WhatsApp registado no sistema!`,`error`);return}let a=n.replace(/\D/g,``);n.trim().startsWith(`+`)?a=n.replace(/\D/g,``):(a.length===10||a.length===11)&&(a=`55`+a);let o=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{},s=o.nome||`Nossa Instituição`,c=o.chavePix||`Não informada`,l=`🔔 *LEMBRETE DE VENCIMENTO*\nOlá, ${e}!\n\nConsta no nosso sistema que a sua mensalidade venceu no dia ${r}. Para realizar o pagamento de forma rápida, basta enviar o valor de *R$ ${i}* para a chave PIX abaixo:\n\n*Instituição:* ${s}\n*Banco:* ${o.banco||`Não informado`}\n*Chave PIX:* ${c}\n\n*Obs.:* _Após o pagamento, por favor, envie o comprovante por aqui para podermos dar baixa no sistema._\n\n🙏 Agradecemos desde já e desejamos-lhe um excelente dia! 😉✅`;window.open(`https://wa.me/${a}?text=${encodeURIComponent(l)}`,`_blank`)},renderizarTela:async e=>{if(!t.usuario&&e!==`login`){t.showToast(`Sessão expirada. Faça login novamente.`,`error`),t.logout();return}document.querySelector(`.sidebar`)&&document.querySelector(`.sidebar`).classList.remove(`active`),document.querySelector(`.mobile-overlay`)&&document.querySelector(`.mobile-overlay`).classList.remove(`active`);let n=t.usuario?t.usuario.tipo:`Gestor`,r=[`mensalidades`,`inadimplencia`,`configuracoes`,`aparencia`,`backup`,`plano`,`financeiro`,`dossie`,`documentos`,`ficha`,`conta`],i=[`configuracoes`,`aparencia`,`backup`,`plano`,`dossie`,`conta`];if(n===`Professor`&&r.includes(e))return t.showToast(`🚫 Acesso restrito. Perfil de Professor não tem permissão para esta área.`,`error`),t.renderizarInicio();if(n===`Secretaria`&&i.includes(e))return t.showToast(`🚫 Acesso restrito. Perfil de Secretaria não tem permissão para esta área.`,`error`),t.renderizarInicio();typeof gtag==`function`&&gtag(`event`,`page_view`,{page_title:`Tela: `+e,page_location:window.location.href+`#`+e,page_path:`/`+e}),e===`chamada`?(t.setTitulo(`Chamada`),t.renderizarChamadaPro()):e===`avaliacoes`?(t.setTitulo(`Notas`),t.renderizarAvaliacoesPro()):e===`calendario`?(t.setTitulo(`Calendário`),t.renderizarCalendarioPro()):e===`planejamento`?(t.setTitulo(`Planejamento`),t.renderizarPlanejamentoPro()):e===`boletins`?(t.setTitulo(`Boletim`),t.renderizarBoletimVisual()):e===`mensalidades`?(t.setTitulo(`Financeiro`),t.renderizarFinanceiroPro()):e===`inadimplencia`?(t.setTitulo(`Inadimplência`),t.renderizarInadimplencia()):e===`configuracoes`?(t.setTitulo(`Configurações`),t.renderizarConfiguracoes()):e===`aparencia`?t.renderizarConfiguracoesAparencia():e===`backup`?t.renderizarBackup():e===`plano`?t.renderizarMeuPlano():t.renderizarInicio()},renderizarConfig:e=>{e===`perfil`?t.renderizarTela(`configuracoes`):e===`aparencia`?t.renderizarTela(`aparencia`):e===`conta`?t.renderizarMinhaConta():e===`backup`&&t.renderizarTela(`backup`)},renderizarRelatorio:e=>{e===`dossie`&&!t.verificarPermissao(`dossie`)||typeof t.renderizarRelatorioModulo==`function`&&t.renderizarRelatorioModulo(e)},renderizarMeuPlano:()=>{t.setTitulo(`Gerenciar Assinatura`);let e=document.getElementById(`app-content`),n=t.getPlanoAtual(),r=0,i=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{},a=new Date().getTime();if(i.dataExpiracao){let e=new Date(i.dataExpiracao).getTime()-a;r=Math.ceil(e/(1e3*60*60*24))}else if(i.dataCriacao){let e=Math.abs(a-new Date(i.dataCriacao).getTime());r=(n===`Teste`?7:30)-Math.floor(e/(1e3*60*60*24))}r<0&&(r=0);let o=n===`Premium`?`#f39c12`:n===`Profissional`?`#3498db`:`#27ae60`;e.innerHTML=`
            <div class="card" style="text-align:center; padding: 40px 20px; border-top: 5px solid var(--accent);">
                <h2 style="margin: 0 0 15px 0; color: var(--card-text);">Evolua a sua Instituição</h2>
                <div style="margin-bottom: 30px;">${n===`Teste`?`<strong style="color:var(--warning); background:rgba(243,156,18,0.1); padding:8px 20px; border-radius:20px; border:2px solid var(--warning); font-size:16px;">⏳ Plano Teste (${r} dias restantes)</strong>`:`<strong style="color:${o}; background:rgba(0,0,0,0.02); padding:8px 20px; border-radius:20px; border:2px solid ${o}; font-size:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">💎 PLANO ATUAL: ${t.escapeHTML(n).toUpperCase()} (${r} dias)</strong>`}</div>
                
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
                        <li style="margin-bottom:10px;">✅ 2 Acessos (Gestor + 1 Equipa)</li>
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
                        <li style="margin-bottom:10px;">✅ 4 Acessos (Gestor + 3 Equipa)</li>
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
        `},comprarPlano:(e,n)=>{t.showToast(`A redirecionar para o pagamento seguro do plano ${e}...`,`info`),setTimeout(()=>{window.open(n,`_blank`)},1500)},ativarNovoPlano:async e=>{e&&e.preventDefault();let n=document.getElementById(`input-novo-pin`);if(!n)return;let r=n.value.trim().toUpperCase();if(!r)return t.showToast(`Por favor, insira o PIN recebido no e-mail.`,`warning`);let i=document.querySelector(`button[onclick="App.ativarNovoPlano(event)"]`),a=i?i.innerText:`Validar PIN`;i&&(i.innerText=`A validar... ⏳`,i.disabled=!0);try{let e=await t.api(`/escola/validar-pin`,`POST`,{pin:r}),o=e&&e.success?e.plano:null;if(!o)if(r.includes(`PRE`))o=`Premium`;else if(r.includes(`ESS`))o=`Essencial`;else if(r.includes(`PRO`))o=`Profissional`;else{t.showToast(e.error||`PIN em formato inválido.`,`error`),i&&(i.innerText=a,i.disabled=!1);return}let s=await t.api(`/escola`)||{},c=new Date;c.setDate(c.getDate()+30),await t.api(`/escola`,`PUT`,{...s,plano:o,pinUsado:r,dataExpiracao:c.toISOString()}),localStorage.setItem(t.getTenantKey(`escola_plano`),o);let l=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{};l.plano=o,l.dataExpiracao=c.toISOString(),localStorage.setItem(t.getTenantKey(`escola_perfil`),JSON.stringify(l)),t.atualizarUIHeader(l),t.showToast(`🎉 PIN validado com sucesso! Plano atualizado para ${o}. A iniciar...`,`success`),n.value=``,await t.carregarDadosEscola(),t.renderizarInicio()}catch{t.showToast(`Erro ao comunicar com a base de dados.`,`error`)}finally{i&&(i.innerText=a,i.disabled=!1)}},copiarLinkMatricula:async()=>{try{let e=await t.api(`/escola`);if(!e||e.error||!e.escolaId)return t.showToast(`Não foi possível identificar a instituição.`,`error`);let n=`${`${window.location.origin}${window.location.pathname.replace(`index.html`,``)}`}matricula.html?escola=${encodeURIComponent(e.escolaId)}`;navigator.clipboard&&window.isSecureContext?(await navigator.clipboard.writeText(n),t.showToast(`✅ Link copiado com sucesso! Envie para os alunos.`,`success`)):prompt(`Copie o seu link manualmente abaixo:`,n)}catch(e){console.error(e),t.showToast(`Erro ao gerar o link.`,`error`)}},abrirModalCadastro:async(e,n)=>{!n&&e===`aluno`&&!await t.verificarLimites(`aluno`)||typeof t.abrirModalCadastroModulo==`function`&&t.abrirModalCadastroModulo(e,n)},abrirRelatorioFrequencia:async(e,n)=>{let r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Frequência Escolar: ${t.escapeHTML(n)}`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A processar o planejamento atual... ⏳</p>`;let i=document.querySelector(`.btn-confirm`);i&&(i.style.display=`none`),t.contextoFrequencia={idAluno:e,nomeAluno:n},await t.renderizarFrequenciaView(`ativo`)},renderizarFrequenciaView:async(e,n=null)=>{let{idAluno:r,nomeAluno:i}=t.contextoFrequencia,a=document.getElementById(`modal-form-content`);try{if(!t.contextoFrequencia.dadosCache){let[e,n]=await Promise.all([t.api(`/chamadas`),t.api(`/planejamentos`)]);t.contextoFrequencia.dadosCache={chamadas:e,planejamentos:n}}let o=t.contextoFrequencia.dadosCache.chamadas,s=t.contextoFrequencia.dadosCache.planejamentos,c=o.filter(e=>e.idAluno===r).sort((e,t)=>new Date(t.data)-new Date(e.data)),l=s.filter(e=>e.idAluno===r),u=l.filter(e=>e.status!==`Arquivado`),d=l.filter(e=>e.status===`Arquivado`),f=document.querySelector(`#modal-overlay .btn-cancel`);if(f){let n=f.parentNode;if(document.querySelectorAll(`.btn-modal-dinamico`).forEach(e=>e.remove()),!f.dataset.limpezaAtiva){let e=f.onclick;f.onclick=function(t){document.querySelectorAll(`.btn-modal-dinamico`).forEach(e=>e.remove()),e&&e.apply(this,arguments)},f.dataset.limpezaAtiva=`true`}if(e===`ativo`||e===`ver_arquivado`){let e=document.createElement(`button`);e.className=`btn-modal-dinamico`,e.innerHTML=`🖨️ Imprimir`,e.style.cssText=`background:#27ae60; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease;`,e.onmouseover=()=>e.style.background=`#1e8449`,e.onmouseout=()=>e.style.background=`#27ae60`,e.onclick=()=>t.imprimirDossieFrequencia(),n.insertBefore(e,f)}if(e===`ativo`&&d.length>0){let e=document.createElement(`button`);e.className=`btn-modal-dinamico`,e.innerHTML=`🗄️ Arquivados`,e.style.cssText=`background:#7f8c8d; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;`,e.onmouseover=()=>e.style.background=`#95a5a6`,e.onmouseout=()=>e.style.background=`#7f8c8d`,e.onclick=e=>{e.target.innerHTML=`⏳ A abrir...`,e.target.style.opacity=`0.8`,setTimeout(()=>t.renderizarFrequenciaView(`lista_arquivados`),10)},n.insertBefore(e,f)}else if(e===`lista_arquivados`||e===`ver_arquivado`){let r=e===`lista_arquivados`,i=document.createElement(`button`);i.className=`btn-modal-dinamico`,i.innerHTML=r?`⬅️ Voltar ao Atual`:`⬅️ Voltar à Lista`,i.style.cssText=`background:#3498db; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;`,i.onmouseover=()=>i.style.background=`#2980b9`,i.onmouseout=()=>i.style.background=`#3498db`,i.onclick=e=>{e.target.innerHTML=`⏳ A voltar...`,e.target.style.opacity=`0.8`,setTimeout(()=>t.renderizarFrequenciaView(r?`ativo`:`lista_arquivados`),10)},n.insertBefore(i,f)}}if(e===`lista_arquivados`){if(document.getElementById(`modal-titulo`).innerText=`🗄️ Histórico Arquivado: ${t.escapeHTML(i)}`,d.length===0){a.innerHTML=`<p style="text-align:center; padding:30px; color:#999;">Nenhum planejamento arquivado encontrado para este aluno.</p>`;return}a.innerHTML=`
                    <div style="max-height:50vh; overflow-y:auto; padding-right:10px;">
                        <p style="font-size:13px; color:#666; margin-bottom:15px; text-align:center;">Selecione um planejamento antigo para ver o dossiê de presenças.</p>
                        ${d.map(e=>{let n=`Sem datas registadas`;return e.aulas&&e.aulas.length>0&&(n=`${e.aulas[0].data} até ${e.aulas[e.aulas.length-1].data}`),`
                    <div onclick="App.renderizarFrequenciaView('ver_arquivado', '${e.id}')" style="background:#f9f9f9; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='#f9f9f9'">
                        <div>
                            <div style="font-weight:bold; color:#2c3e50; font-size:14px;">📄 ${t.escapeHTML(e.disciplina||`Curso Geral`)}</div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">📅 Período: ${n}</div>
                        </div>
                        <span style="font-size:20px; color:#aaa;">➡️</span>
                    </div>`}).join(``)}
                    </div>
                `;return}let p=null,m=`Frequência Escolar: ${t.escapeHTML(i)}`;e===`ativo`?p=u.length>0?u[0]:null:e===`ver_arquivado`&&(p=d.find(e=>e.id===n),m=`🗄️ Arquivo: ${t.escapeHTML(i)}`),document.getElementById(`modal-titulo`).innerText=m;let h=e=>e.split(`/`).reverse().join(`-`),g=c;if(p&&p.aulas&&p.aulas.length>0){let e=p.aulas.map(e=>h(e.data)).sort(),t=e[0],n=e[e.length-1];g=c.filter(e=>e.data>=t&&e.data<=n)}else if(e===`ativo`&&d.length>0){let e=d.map(e=>{if(!e.aulas||e.aulas.length===0)return null;let t=e.aulas.map(e=>h(e.data)).sort();return{inicio:t[0],fim:t[t.length-1]}}).filter(e=>e);g=c.filter(t=>!e.some(e=>t.data>=e.inicio&&t.data<=e.fim))}let _=0,v=0,y=0,b=``;if(g.length===0)b=`<p style="text-align:center; padding:30px; color:#999; font-size:14px;">Nenhum registo de chamada encontrado para este ${e===`ativo`?`período letivo`:`arquivo`}.</p>`;else{let e={},t=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`];g.forEach(n=>{let r=new Date(n.data+`T00:00:00`),i=`${t[r.getMonth()]} de ${r.getFullYear()}`;e[i]||(e[i]=[]),e[i].push(n);let a=0;if(n.duracao){let[e,t]=n.duracao.split(`:`);a=(parseInt(e)||0)*60+(parseInt(t)||0)}n.status===`Presença`||n.status===`Reposição`?_+=a:n.status===`Falta Justificada`||n.status===`Justificada`?y+=a:n.status===`Falta`&&(v+=a)});for(let t in e)b+=`<div style="background:#f4f6f7; padding:10px 15px; margin-top:15px; border-radius:8px 8px 0 0; font-weight:bold; color:#2c3e50; border:1px solid #eee; border-bottom:none; font-size:13px; text-transform:uppercase;">📅 ${t}</div>`,b+=`<table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #eee; margin-bottom:10px; background:#fff;"><tbody>`,e[t].forEach(e=>{let t=e.data.split(`-`).reverse().join(`/`),n=e.status===`Presença`||e.status===`Reposição`?`#27ae60`:e.status===`Falta`?`#e74c3c`:`#f39c12`;b+=`<tr style="border-bottom:1px solid #eee;">
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
            `}catch{a.innerHTML=`<p style="color:red; text-align:center;">Erro ao processar as horas de frequência.</p>`}},imprimirDossieFrequencia:()=>{let e=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{},n=e.nome||`Instituição de Ensino`,r=e.cnpj?`CNPJ: ${e.cnpj}`:``,i=e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?`<img src="${e.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">`:``,a=document.getElementById(`modal-titulo`).innerText,o=document.getElementById(`modal-form-content`).cloneNode(!0);o.querySelectorAll(`div[style*="max-height"]`).forEach(e=>{e.style.maxHeight=`none`,e.style.overflowY=`visible`,e.style.paddingRight=`0`});let s=document.createElement(`iframe`);s.style.position=`absolute`,s.style.width=`0px`,s.style.height=`0px`,s.style.border=`none`,document.body.appendChild(s);let c=s.contentWindow.document;c.open(),c.write(`
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
                        <h2>${t.escapeHTML(n)}</h2>
                        <p>${t.escapeHTML(r)}</p>
                    </div>
                </div>
                
                <div class="titulo-doc">📄 ${a}</div>
                
                ${o.innerHTML}
                
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento gerado em ${new Date().toLocaleString(`pt-BR`)} pelo Sistema Escolar
                </div>
            </body>
            </html>
        `),c.close(),setTimeout(()=>{s.contentWindow.focus(),s.contentWindow.print(),setTimeout(()=>{document.body.removeChild(s)},1500)},500)},abrirModalVenda:async(e,n)=>{let r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Registrar Venda - ${t.escapeHTML(n)}`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar estoque... ⏳</p>`;try{let r=await t.api(`/estoques`),i=Array.isArray(r)?r:[],a=`<option value="">-- Selecione um Produto/Serviço --</option>`;i.forEach(e=>{let n=parseInt(e.quantidade)||0,r=parseFloat(e.valor)||0;a+=`<option value="${e.id}" data-nome="${t.escapeHTML(e.nome)}" data-valor="${r}">📦 ${t.escapeHTML(e.nome)} (Estoque: ${n} | R$ ${r.toFixed(2)})</option>`}),a+=`<option value="avulso">✏️ Outro Item (Digitar Manualmente)</option>`;let o=new Date().toISOString().split(`T`)[0],s=`
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
                    <input type="hidden" id="v-idaluno" value="${t.escapeHTML(e)}">
                    <input type="hidden" id="v-nomealuno" value="${t.escapeHTML(n)}">
                </div>`;document.getElementById(`modal-form-content`).innerHTML=s;let c=document.querySelector(`.btn-confirm`);c.setAttribute(`onclick`,`App.salvarVenda()`),c.innerHTML=`💾 Registrar Venda`,c.style.display=`inline-flex`}catch{document.getElementById(`modal-form-content`).innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o estoque.</p>`}},selecionarItemVenda:e=>{let t=document.getElementById(`v-item`),n=document.getElementById(`v-valor`),r=document.getElementById(`v-item-id`);if(e.value===`avulso`)t.style.display=`block`,t.value=``,n.value=``,r.value=``,t.focus();else if(e.value!==``){t.style.display=`none`;let i=e.options[e.selectedIndex];t.value=i.getAttribute(`data-nome`),n.value=i.getAttribute(`data-valor`),r.value=e.value}else t.style.display=`none`,t.value=``,n.value=``,r.value=``},salvarVenda:async()=>{let e=document.getElementById(`v-idaluno`).value,n=document.getElementById(`v-nomealuno`).value,r=document.getElementById(`v-item`).value.trim(),i=document.getElementById(`v-item-id`).value,a=document.getElementById(`v-valor`).value,o=document.getElementById(`v-data`).value,s=document.getElementById(`v-forma`).value,c=document.getElementById(`v-desc`).value;if(!r||!a||!o)return t.showToast(`Preencha o item, valor e data.`,`error`);let l=s===`Pendente (Fiado)`?`Pendente`:`Pago`,u=`Venda: ${r} | Pagto: ${s} ${c?` | Obs: `+c:``}`,d={id:window.crypto.randomUUID(),idCarne:`VENDA_${window.crypto.randomUUID().split(`-`)[0].toUpperCase()}`,idAluno:e,alunoNome:n,valor:a,vencimento:o,status:l,descricao:u,tipo:`Receita`,dataGeracao:new Date().toLocaleDateString(`pt-BR`)},f=document.querySelector(`.btn-confirm`),p=f?f.innerHTML:`💾 Registrar Venda`;f&&(f.innerHTML=`⏳ Registrando...`,f.disabled=!0),document.body.style.cursor=`wait`;try{if(await t.api(`/financeiro`,`POST`,d),i){let e=await t.api(`/estoques/${i}`);if(e&&e.id){let n=parseInt(e.quantidade)||0;n>0&&--n,await t.api(`/estoques/${i}`,`PUT`,{...e,quantidade:n})}}t.showToast(`Venda registrada e baixa no estoque efetuada!`,`success`),t.fecharModal()}catch{t.showToast(`Erro ao registrar venda.`,`error`)}finally{f&&(f.innerHTML=p,f.disabled=!1),document.body.style.cursor=`default`}},renderizarLista:async e=>{if(!t.usuario){t.logout();return}document.querySelector(`.sidebar`)&&document.querySelector(`.sidebar`).classList.remove(`active`),document.querySelector(`.mobile-overlay`)&&document.querySelector(`.mobile-overlay`).classList.remove(`active`),t.entidadeAtual=e;let n=e.charAt(0).toUpperCase()+e.slice(1)+`s`;t.setTitulo(`Gerenciar ${n}`);let r=document.getElementById(`app-content`),i=e===`financeiro`?`financeiro`:e+`s`;try{t.listaCache=await t.api(`/${i}`);let a=`
                <div class="toolbar" style="max-width: 800px; margin: 0 auto; display: flex; gap: 15px; text-align: left; flex-wrap:wrap;">
                    <div class="search-wrapper" style="flex: 1; min-width:250px; position: relative;">
                        <span class="search-icon" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="input-busca" class="search-input-modern" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee;" placeholder="Pesquisar..." oninput="App.filtrarTabelaReativa()">
                    </div>
                    <button class="btn-new-modern" onclick="${e===`financeiro`?`App.renderizarTela('mensalidades')`:`App.abrirModalCadastro('${e}')`}"><span>＋</span> NOVO REGISTRO</button>
                </div>`;r.innerHTML=`<div style="text-align:center; margin-bottom:30px;">${t.UI.card(`Consultar ${n}`,`Utilize o campo abaixo para localizar registros.`,a,`100%`)}</div><div id="container-tabela"></div>`,t.filtrarTabelaReativa()}catch{r.innerHTML=`Erro ao carregar lista.`}},filtrarTabelaReativa:()=>{let e=document.getElementById(`input-busca`).value.trim().toLowerCase(),n=document.getElementById(`container-tabela`);if(!Array.isArray(t.listaCache)){n.innerHTML=``;return}let r=e.length===0?t.listaCache:t.listaCache.filter(t=>(t.nome||t.alunoNome||t.descricao||``).toLowerCase().includes(e));n.innerHTML=`<div class="card" style="animation: fadeIn 0.3s ease; padding:0; overflow:hidden;">${t.gerarTabelaHTML(r)}</div>`},gerarTabelaHTML:e=>{if(!e.length)return`<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado.</p>`;let n=t.entidadeAtual,r={estrutura:(e,t)=>`<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse;"><thead><tr>${e}</tr></thead><tbody>${t}</tbody></table></div>`,th:(e,t=`left`)=>`<th style="text-align:${t}; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; color:#2c3e50;">${e}</th>`,td:(e,t=`left`)=>`<td style="text-align:${t}; padding:15px; border-bottom:1px solid #eee; color:#333;">${e}</td>`,tr:e=>`<tr style="transition: background 0.2s;">${e}</tr>`,acoes:e=>`<div style="display:flex; gap:5px; justify-content:flex-end; align-items:center;">${e.join(``)}</div>`,btn:(e,t,n,r)=>`<button class="btn-edit" style="background:${t}; border:none; color:white; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="${n}" title="${r}">${e}</button>`},i=``;n===`aluno`&&(i=r.th(`Nome`)+r.th(`Turma`)+r.th(`Status`)+r.th(`WhatsApp`)+r.th(`Ações`,`right`)),n===`turma`&&(i=r.th(`Turma`)+r.th(`Dia`)+r.th(`Horário`)+r.th(`Curso`)+r.th(`Ações`,`right`)),n===`curso`&&(i=r.th(`Curso`)+r.th(`Carga`)+r.th(`Ações`,`right`)),n===`financeiro`&&(i=r.th(`Ref (Aluno)`)+r.th(`Descrição`)+r.th(`Vencimento`)+r.th(`Valor`)+r.th(`Status`)+r.th(`Ações`,`right`)),n===`estoque`&&(i=r.th(`Item`)+r.th(`Código`)+r.th(`Qtd Atual`)+r.th(`Mínimo (Alerta)`)+r.th(`Valor`)+r.th(`Status`)+r.th(`Ações`,`right`));let a=e.map(e=>{let i=``;if(n===`aluno`){let n=e.status||`Ativo`,a=n===`Ativo`?`#27ae60`:n===`Trancado`?`#f39c12`:`#e74c3c`,o=`<span style="background:${a}20; color:${a}; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; border: 1px solid ${a}50;">${n}</span>`;i+=r.td(t.escapeHTML(e.nome))+r.td(t.escapeHTML(e.turma||`-`))+r.td(o)+r.td(t.escapeHTML(e.whatsapp||`-`))}else if(n===`turma`)i+=r.td(t.escapeHTML(e.nome))+r.td(t.escapeHTML(e.dia||`-`))+r.td(t.escapeHTML(e.horario||`-`))+r.td(t.escapeHTML(e.curso||`-`));else if(n===`curso`)i+=r.td(t.escapeHTML(e.nome))+r.td(t.escapeHTML(e.carga||`-`));else if(n===`financeiro`){let n=e.vencimento?e.vencimento.split(`-`).reverse().join(`/`):`-`,a=`R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,o=`<span style="color:${e.status===`Pago`?`#27ae60`:`#e74c3c`}; font-weight:bold; background:${e.status===`Pago`?`#eafaf1`:`#fdedec`}; padding:4px 8px; border-radius:4px; font-size:12px;">${t.escapeHTML(e.status)}</span>`;i+=r.td(t.escapeHTML(e.alunoNome||`Sem Nome`))+r.td(t.escapeHTML(e.descricao))+r.td(t.escapeHTML(n))+r.td(t.escapeHTML(a))+r.td(o)}else if(n===`estoque`){let n=parseInt(e.quantidade)||0,a=parseInt(e.quantidadeMinima)||0,o=n<=a?`<span style="color:#e74c3c; font-weight:bold; background:#fdedec; padding:4px 8px; border-radius:4px; font-size:12px;">⚠️ Baixo</span>`:`<span style="color:#27ae60; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:4px; font-size:12px;">✅ Normal</span>`,s=e.valor?`R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`:`-`;i+=r.td(t.escapeHTML(e.nome))+r.td(t.escapeHTML(e.codigo||`-`))+r.td(n,`center`)+r.td(a,`center`)+r.td(s)+r.td(o,`center`)}let a=n===`financeiro`?`financeiro`:n+`s`,o=n===`financeiro`?`App.abrirEdicaoFinanceiro('${e.id}')`:`App.abrirModalCadastro('${n}', '${e.id}')`,s=(e.nome||``).replace(/'/g,`\\'`),c=[];if(n===`aluno`){let n=e.status||`Ativo`;c.push(r.btn(`🔄`,`#8e44ad`,`App.alterarStatusAluno('${e.id}', '${n}')`,`Alterar Status (Ativo/Trancado/Cancelado)`)),c.push(r.btn(`⏱️`,`#3498db`,`App.abrirRelatorioFrequencia('${e.id}', '${t.escapeHTML(s)}')`,`Ver Histórico de Horas / Frequência`)),t.usuario.tipo!==`Professor`&&n===`Ativo`&&c.push(r.btn(`🛒`,`#27ae60`,`App.abrirModalVenda('${e.id}', '${t.escapeHTML(s)}')`,`Registrar Venda / Extra`))}return n===`financeiro`&&c.push(r.btn(`💬`,`#25D366`,`if(App.verificarPermissao('whatsapp')) App.enviarWhatsApp('${e.id}')`,`Avisar por WhatsApp`)),c.push(r.btn(`✏️`,`#f39c12`,o,`Editar`)),c.push(r.btn(`🗑️`,`#e74c3c`,`App.excluir('${a}', '${e.id}')`,`Excluir`)),i+=r.td(r.acoes(c),`right`),r.tr(i)}).join(``);return r.estrutura(i,a)},excluir:(e,n)=>{t.abrirModalConfirmacao(`Tem a certeza absoluta?`,`Esta ação apagará este registro permanentemente. Não é possível desfazer.`,async r=>{document.body.style.cursor=`wait`;try{let r=await t.api(`/${e}/${n}`,`DELETE`);if(r&&r.error)t.showToast(r.error,`error`);else{t.showToast(`Excluído com sucesso!`,`success`);let n=e===`financeiro`?`financeiro`:e.slice(0,-1),r=document.getElementById(`app-content`);r&&(r.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),await t.renderizarLista(n)}}catch{t.showToast(`Erro ao excluir.`,`error`)}finally{document.body.style.cursor=`default`,r.style.opacity=`0`,setTimeout(()=>r.style.display=`none`,300)}})},alterarStatusAluno:(e,n)=>{let r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Atualizar Status de Matrícula`;let i={Ativo:{icon:`🟢`,color:`#27ae60`,desc:`Aluno matriculado e assistindo aulas.`},Trancado:{icon:`🟡`,color:`#f39c12`,desc:`Matrícula pausada. Histórico financeiro preservado.`},Cancelado:{icon:`🔴`,color:`#e74c3c`,desc:`Vínculo encerrado com a instituição.`}},a=Object.entries(i).map(([e,t])=>`
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
                <span style="font-size: 14px; font-weight: bold; color: ${i[n]?i[n].color:`#333`}; margin-left: 5px;">${n}</span>
            </div>
            
            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom:10px;">Selecione o novo status:</h4>
            <div id="status-options-container" data-selecionado="">
                ${a}
            </div>
            <input type="hidden" id="status-student-id" value="${e}">
            <input type="hidden" id="status-student-orig" value="${n}">
        `;if(document.getElementById(`modal-form-content`).innerHTML=o,i[n]){let e=document.querySelector(`.status-option-card[data-status="${n}"]`);e&&t.selecionarOpcaoStatus(e)}let s=document.querySelector(`.btn-confirm`);s.setAttribute(`onclick`,`App.confirmarAlteracaoStatus()`),s.innerText=`💾 Salvar Novo Status`,s.style.display=`inline-flex`},selecionarOpcaoStatus:e=>{document.querySelectorAll(`.status-option-card`).forEach(e=>{e.style.borderColor=`#eee`,e.style.background=`white`,e.querySelector(`span[style*="font-size: 32px"]`).style.filter=`grayscale(1)`,e.querySelector(`.selection-indicator`).innerHTML=``,e.querySelector(`.selection-indicator`).style.borderColor=`#ccc`,e.querySelector(`.selection-indicator`).style.background=`white`});let t=e.getAttribute(`data-status`),n=e.querySelector(`div[style*="font-weight: bold"]`).style.color;e.style.borderColor=n,e.style.background=`${n}05`,e.querySelector(`span[style*="font-size: 32px"]`).style.filter=`grayscale(0)`,e.querySelector(`.selection-indicator`).innerHTML=`<div style="width: 12px; height: 12px; border-radius: 50%; background: ${n};"></div>`,e.querySelector(`.selection-indicator`).style.borderColor=n,document.getElementById(`status-options-container`).setAttribute(`data-selecionado`,t)},confirmarAlteracaoStatus:async()=>{let e=document.getElementById(`status-student-id`),n=document.getElementById(`status-student-orig`),r=document.getElementById(`status-options-container`);if(!e||!r)return t.showToast(`Erro: Janela não abriu corretamente.`,`error`);let i=e.value,a=n?n.value:``,o=r.getAttribute(`data-selecionado`);if(!o)return t.showToast(`Selecione um status para prosseguir.`,`warning`);if(o===a)return t.showToast(`O status selecionado é o mesmo que o atual.`,`warning`);let s=document.querySelector(`.btn-confirm`),c=s?s.innerText:`Salvar`;s&&(s.innerText=`A atualizar... ⏳`,s.disabled=!0),document.body.style.cursor=`wait`;try{let e=await t.api(`/alunos/${i}`);if(!e||e.error)throw Error(`Erro ao buscar dados do aluno`);if(await t.api(`/alunos/${i}`,`PUT`,{...e,status:o}),t.showToast(`Sucesso! Aluno agora está como ${o}.`,`success`),t.fecharModal(),Array.isArray(t.cacheAlunos)){let e=t.cacheAlunos.findIndex(e=>e.id===i);e!==-1&&(t.cacheAlunos[e].status=o)}if(Array.isArray(t.listaCache)){let e=t.listaCache.findIndex(e=>e.id===i);e!==-1&&(t.listaCache[e].status=o)}typeof t.filtrarTabelaReativa==`function`?t.filtrarTabelaReativa():typeof t.renderizarLista==`function`?t.renderizarLista(`aluno`):setTimeout(()=>window.location.reload(),500),t.verificarNotificacoes(),document.getElementById(`titulo-pagina`)&&document.getElementById(`titulo-pagina`).innerText===`Visão Geral`&&t.renderizarInicio()}catch(e){console.error(`Erro na atualização:`,e),t.showToast(`Não foi possível atualizar o status. Tente novamente.`,`error`)}finally{s&&(s.innerText=c,s.disabled=!1),document.body.style.cursor=`default`}},atualizarUIHeader:e=>{if(!e)return;let n=document.querySelector(`.logo-area h2`),r=e.plano||`Teste`,i=`<div style="margin-top:8px; margin-bottom:5px;"><span style="background:${r===`Premium`?`#f39c12`:r===`Profissional`?`#3498db`:r===`Teste`?`#e74c3c`:`#27ae60`}; color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:1px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">💎 PLANO ${t.escapeHTML(r)}</span></div>`,a=t.usuario?t.usuario.login:`Desconhecido`,o=t.usuario?t.usuario.tipo:`Gestor`,s=`<div style="font-size:11px; color:#aaa; font-weight:normal; line-height:1.4; margin-top:5px; background: rgba(0,0,0,0.15); border-radius: 6px; padding: 4px;">👤 Logado como:<br><b style="color:#fff;">${t.escapeHTML(a)}</b><br><span style="font-size:9px; color:#3498db; text-transform:uppercase; font-weight:bold;">${t.escapeHTML(o)}</span></div>`;n&&(n.innerHTML=`${t.escapeHTML(e.nome||`Escola`)}<br><small style="color:#aaa;">${t.escapeHTML(e.cnpj||``)}</small>${i}${s}`);let c=document.querySelector(`.logo-area`),l=c.querySelector(`img`);e.foto&&e.foto.length>50?(l||(l=document.createElement(`img`),l.style.cssText=`width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);`,c.insertBefore(l,c.firstChild)),l.src=e.foto):l&&l.remove()},carregarDadosEscola:async()=>{try{let e=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)));e&&t.atualizarUIHeader(e);let n=await t.api(`/escola`);if(!n||n.error)return;n.dataCriacao||(n.dataCriacao=new Date().toISOString(),await t.api(`/escola`,`PUT`,n)),n.plano&&localStorage.setItem(t.getTenantKey(`escola_plano`),n.plano),localStorage.setItem(t.getTenantKey(`escola_perfil`),JSON.stringify(n)),t.atualizarUIHeader(n),t.verificarBloqueioGeral(n)&&t.mostrarTelaBloqueioLogin(n)}catch{console.log(`Carregando perfil...`)}},otimizarImagem:(e,t,n)=>{let r=new FileReader;r.readAsDataURL(e),r.onload=e=>{let r=new Image;r.src=e.target.result,r.onload=()=>{let e=document.createElement(`canvas`),i=r.width,a=r.height;i>t&&(a*=t/i,i=t),e.width=i,e.height=a,e.getContext(`2d`).drawImage(r,0,0,i,a),n(e.toDataURL(`image/jpeg`,.8))}}},renderizarConfiguracoes:async()=>{t.setTitulo(`Perfil da Escola`);let e=document.getElementById(`app-content`);try{let n=await t.api(`/escola`)||{};e.innerHTML=`
                <div class="card" style="max-width:850px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-bottom:30px;">
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-preview" src="${n.foto||`https://placehold.co/100?text=LOGO`}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">Logotipo Oficial</label>
                                <input type="file" id="conf-file" accept="image/*" onchange="App.previewImagemLocal(this, 'conf-preview')" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerImagemLocal('conf-preview')">🗑️ Remover Imagem</button>
                                </div>
                            </div>
                        </div>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-qr-preview" src="${n.qrCodeImagem||`https://placehold.co/100?text=QR+CODE`}" style="width:100px; height:100px; object-fit:contain; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
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
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${t.escapeHTML(n.nome||``)}"></div>
                        <div class="input-group"><label>CNPJ / NIF</label><input id="conf-cnpj" value="${t.escapeHTML(n.cnpj||``)}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Dados Bancários (Carnê)</label><input id="conf-banco" value="${t.escapeHTML(n.banco||``)}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${t.escapeHTML(n.chavePix||``)}"></div>
                    </div>

                    <h4 style="margin: 25px 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📍 Endereço da Instituição</h4>
                    <div style="display:grid; grid-template-columns: 1fr 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>CEP</label><input id="conf-cep" value="${t.escapeHTML(n.cep||``)}" oninput="App.mascaraCEP(this)" maxlength="9"></div>
                        <div class="input-group"><label>Endereço (Rua, Av.)</label><input id="conf-endereco" value="${t.escapeHTML(n.endereco||``)}"></div>
                        <div class="input-group"><label>Número</label><input id="conf-numero" value="${t.escapeHTML(n.numero||``)}"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Bairro</label><input id="conf-bairro" value="${t.escapeHTML(n.bairro||``)}"></div>
                        <div class="input-group"><label>Cidade</label><input id="conf-cidade" value="${t.escapeHTML(n.cidade||``)}"></div>
                        <div class="input-group"><label>Estado (UF)</label><input id="conf-estado" value="${t.escapeHTML(n.estado||``)}" maxlength="2" style="text-transform: uppercase;"></div>
                    </div>

                    <button class="btn-primary" style="width:100%; margin-top:25px; padding:15px; justify-content:center;" onclick="App.salvarConfiguracoes()">💾 ATUALIZAR DADOS DA ESCOLA</button>
                </div>`}catch{e.innerHTML=`Erro ao carregar.`}},previewImagemLocal:(e,n)=>{!e.files||e.files.length===0||t.otimizarImagem(e.files[0],400,e=>{let t=document.getElementById(n);t.src=e,t.setAttribute(`data-nova`,`true`)})},removerImagemLocal:e=>{let t=document.getElementById(e);t.src=e===`conf-preview`?`https://placehold.co/100?text=LOGO`:`https://placehold.co/100?text=QR+CODE`,t.setAttribute(`data-nova`,`true`);let n=document.getElementById(e===`conf-preview`?`conf-file`:`conf-qr-file`);n&&(n.value=``)},salvarConfiguracoes:async()=>{let e={nome:document.getElementById(`conf-nome`).value,cnpj:document.getElementById(`conf-cnpj`).value,banco:document.getElementById(`conf-banco`).value,chavePix:document.getElementById(`conf-pix`).value,cep:document.getElementById(`conf-cep`).value,endereco:document.getElementById(`conf-endereco`).value,numero:document.getElementById(`conf-numero`).value,bairro:document.getElementById(`conf-bairro`).value,cidade:document.getElementById(`conf-cidade`).value,estado:document.getElementById(`conf-estado`).value.toUpperCase()},n=document.getElementById(`conf-preview`);n&&n.hasAttribute(`data-nova`)&&(e.foto=n.src.includes(`placehold`)?``:n.src);let r=document.getElementById(`conf-qr-preview`);r&&r.hasAttribute(`data-nova`)&&(e.qrCodeImagem=r.src.includes(`placehold`)?``:r.src);let i=document.querySelector(`button[onclick="App.salvarConfiguracoes()"]`),a=i.innerText;i.innerText=`A atualizar... ⏳`,i.disabled=!0;try{let i=await t.api(`/escola`)||{};await t.api(`/escola`,`PUT`,{...i,...e}),await t.carregarDadosEscola(),n&&n.removeAttribute(`data-nova`),r&&r.removeAttribute(`data-nova`),t.showToast(`Configurações atualizadas com sucesso!`,`success`)}catch{t.showToast(`Erro ao salvar perfil da escola.`,`error`)}finally{i.innerText=a,i.disabled=!1}},toggleSenhaVisibilidade:e=>{let t=document.getElementById(e);t.type=t.type===`password`?`text`:`password`},renderizarMinhaConta:async()=>{t.setTitulo(`Gestão de Usuários`);let e=document.getElementById(`app-content`);t.idEdicaoUsuario=null;let n=t.usuario?t.usuario.login:``,r=t.usuario&&t.usuario.email?t.usuario.email:``,i=(e,t)=>`<div class="input-group" style="position:relative;"><label>${t}</label><input type="password" id="${e}" style="width:100%; padding-right:40px;"><span onclick="App.toggleSenhaVisibilidade('${e}')" style="position:absolute; right:12px; top:32px; cursor:pointer; font-size:16px; opacity:0.6; user-select:none;" title="Mostrar/Ocultar Senha">👁️</span></div>`;try{let a=await t.api(`/usuarios`),o=(Array.isArray(a)?a:[]).filter(e=>e.id===t.usuario.id||String(e.donoId)===String(t.usuario.id));e.innerHTML=`
                <div style="display:flex; gap:30px; flex-wrap:wrap;">
                    <div class="card" style="flex:1; height:fit-content; min-width:300px;">
                        <h3>Meus Dados de Acesso</h3>
                        <p style="font-size:12px; color:#666; margin-bottom:15px;">A senha atual é sempre obrigatória para salvar as alterações.</p>
                        <div class="input-group"><label>E-mail Dono da Conta</label><input type="email" id="user-novo-email" value="${t.escapeHTML(r)}" placeholder="Ex: gestor@escola.com" style="width:100%; border-left: 4px solid #f39c12;"></div>
                        <div class="input-group"><label>Login de Acesso</label><input type="text" id="user-novo-login" value="${t.escapeHTML(n)}" style="width:100%; border-left: 4px solid #3498db;"></div>
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
                                <tbody>${o.map(e=>`<tr><td style="padding:10px 0; border-top:1px solid #eee;">${t.escapeHTML(e.nome)} ${e.isDono?`👑`:``}</td><td style="padding:10px 0; border-top:1px solid #eee;">${t.escapeHTML(e.login)}</td><td style="padding:10px 0; border-top:1px solid #eee;"><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${t.escapeHTML(e.tipo)}</span></td><td style="text-align:right; border-top:1px solid #eee;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${e.id}', '${t.escapeHTML(e.nome)}', '${t.escapeHTML(e.login)}', '${t.escapeHTML(e.tipo)}')">✏️</button>${e.isDono?``:`<button class="btn-del" onclick="App.excluirUsuario('${e.id}')">🗑️</button>`}</td></tr>`).join(``)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>`}catch{e.innerHTML=`Erro ao carregar usuários.`}},atualizarMeusDados:async()=>{let e=document.getElementById(`user-novo-login`).value.trim(),n=document.getElementById(`user-novo-email`).value.trim(),r=document.getElementById(`user-senha-atual`).value,i=document.getElementById(`user-nova-senha`).value,a=document.getElementById(`user-conf-senha`).value;if(!e)return t.showToast(`O login não pode ficar em branco.`,`error`);if(!r)return t.showToast(`Digite sua senha atual para autorizar as alterações.`,`error`);if(i&&i!==a)return t.showToast(`A nova senha e a confirmação não conferem.`,`error`);let o=document.querySelector(`button[onclick="App.atualizarMeusDados()"]`),s=o.innerText;o.innerText=`Atualizando... ⏳`,o.disabled=!0;try{let a={novoLogin:e,novoEmail:n,senhaAtual:r};i&&(a.novaSenha=i);let o=await t.api(`/usuarios/atualizar-conta`,`PUT`,a);o&&o.success?(t.showToast(`Dados atualizados com sucesso! Faça login novamente.`,`success`),setTimeout(()=>t.logout(),2500)):t.showToast(o.error||`Erro ao atualizar os dados.`,`error`)}catch{t.showToast(`Erro de conexão.`,`error`)}finally{o.innerText=s,o.disabled=!1}},salvarNovoUsuario:async()=>{let e=document.getElementById(`new-nome`).value,n=document.getElementById(`new-login`).value,r=document.getElementById(`new-senha`).value,i=document.getElementById(`new-tipo`).value;if(!e||!n)return t.showToast(`Preencha nome e login.`,`error`);if(!t.idEdicaoUsuario&&!r)return t.showToast(`Digite uma senha.`,`error`);let a={nome:e,login:n,tipo:i};if(r&&(a.senha=r),!t.idEdicaoUsuario){if(!await t.verificarLimites(`usuario`))return;a.donoId=t.usuario.id}let o=document.getElementById(`btn-save-user`),s=o?o.innerText:`CRIAR USUÁRIO`;o&&(o.innerText=`Salvando... ⏳`,o.disabled=!0),document.body.style.cursor=`wait`;try{let e;e=t.idEdicaoUsuario?await t.api(`/usuarios/${t.idEdicaoUsuario}`,`PUT`,a):await t.api(`/usuarios`,`POST`,a),e&&e.error?t.showToast(e.error,`error`):(t.showToast(t.idEdicaoUsuario?`Atualizado com sucesso!`:`Criado com sucesso!`,`success`),t.renderizarMinhaConta())}catch{t.showToast(`Erro crítico ao salvar.`,`error`)}finally{o&&(o.innerText=s,o.disabled=!1),document.body.style.cursor=`default`}},preencherEdicaoUsuario:(e,n,r,i)=>{t.idEdicaoUsuario=e,document.getElementById(`new-nome`).value=n,document.getElementById(`new-login`).value=r,document.getElementById(`new-senha`).value=``,document.getElementById(`new-tipo`).value=i,document.getElementById(`titulo-form-user`).innerText=`Editar Usuário`,document.getElementById(`btn-save-user`).innerText=`ATUALIZAR`,document.getElementById(`btn-cancel-user`).style.display=`inline-flex`},cancelarEdicaoUsuario:()=>{t.idEdicaoUsuario=null,document.getElementById(`new-nome`).value=``,document.getElementById(`new-login`).value=``,document.getElementById(`new-senha`).value=``,document.getElementById(`new-tipo`).value=`Gestor`,document.getElementById(`titulo-form-user`).innerText=`Novo Usuário`,document.getElementById(`btn-save-user`).innerText=`CRIAR USUÁRIO`,document.getElementById(`btn-cancel-user`).style.display=`none`},excluirUsuario:e=>{t.abrirModalConfirmacao(`Apagar Utilizador?`,`Deseja remover o acesso deste membro da equipa? A ação não pode ser desfeita.`,async n=>{document.body.style.cursor=`wait`;try{let n=await t.api(`/usuarios/${e}`,`DELETE`);n&&n.error?t.showToast(n.error,`error`):(t.showToast(`Utilizador excluído.`,`success`),t.renderizarMinhaConta())}catch{t.showToast(`Erro ao excluir.`,`error`)}finally{document.body.style.cursor=`default`,n.style.opacity=`0`,setTimeout(()=>n.style.display=`none`,300)}})},renderizarBackup:()=>{t.setTitulo(`Backup de Dados`);let e=document.getElementById(`app-content`);e.innerHTML=`
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
        `},resetarSistema:async()=>{if(!confirm(`⚠️ ATENÇÃO EXTREMA: ISSO APAGARÁ TODOS OS DADOS DA ESCOLA. Deseja continuar?`))return;if(prompt(`Para confirmar a exclusão TOTAL, digite: APAGAR TUDO`)!==`APAGAR TUDO`)return t.showToast(`Ação cancelada. Código incorreto.`,`error`);let e=document.querySelector(`button[onclick="App.resetarSistema()"]`);e&&(e.disabled=!0,e.innerText=`⏳ APAGANDO...`),document.body.style.cursor=`wait`;try{for(let e of[`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`]){let n=await t.api(`/${e}`);Array.isArray(n)&&n.length>0&&await Promise.all(n.map(n=>t.api(`/${e}/${n.id}`,`DELETE`)))}await t.api(`/escola`,`PUT`,{nome:`Escola`,cnpj:``,foto:``,qrCodeImagem:``,banco:``,chavePix:``}),localStorage.removeItem(t.getTenantKey(`escola_perfil`)),alert(`✅ Sistema resetado com sucesso!`),location.reload()}catch{alert(`Erro ao limpar dados.`),e&&(e.disabled=!1,e.innerText=`🗑️ RESETAR TUDO`)}finally{document.body.style.cursor=`default`}},realizarDownloadBackup:async()=>{try{let e=[`escola`,`usuarios`,`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`],n={};for(let r of e)n[r]=await t.api(`/${r}`);let r=new Blob([JSON.stringify(n,null,2)],{type:`application/json`}),i=document.createElement(`a`);i.href=URL.createObjectURL(r),i.download=`backup_${new Date().toISOString().split(`T`)[0]}.json`,document.body.appendChild(i),i.click(),document.body.removeChild(i)}catch{alert(`Erro no backup.`)}},processarRestauracao:async()=>{let e=document.getElementById(`input-backup-file`);if(!e.files.length)return t.showToast(`Por favor, selecione o ficheiro de backup.`,`warning`);if(!confirm(`Tem a certeza absoluta que deseja substituir os dados atuais? Esta ação não pode ser desfeita.`))return;let n=document.querySelector(`button[onclick="App.processarRestauracao()"]`);n&&(n.disabled=!0,n.innerText=`A Ler ficheiro... ⏳`),document.body.style.cursor=`wait`;let r=new FileReader;r.onload=async e=>{try{let r=JSON.parse(e.target.result),i=[`alunos`,`turmas`,`cursos`,`financeiro`,`eventos`,`chamadas`,`avaliacoes`,`planejamentos`,`usuarios`,`escola`],a=0,o=0;for(let e of i)r[e]&&(Array.isArray(r[e])?a+=r[e].length:a+=1);if(a===0){t.showToast(`O ficheiro de backup parece estar vazio.`,`warning`),n&&(n.disabled=!1,n.innerText=`⬆️ RESTAURAR DADOS`),document.body.style.cursor=`default`;return}for(let e of i)if(r[e])if(Array.isArray(r[e]))for(let i of r[e])await t.api(`/${e}`,`POST`,i),o++,n&&(n.innerText=`A Restaurar: ${o} de ${a} ⏳`);else await t.api(`/escola`,`PUT`,r[e]),o++,n&&(n.innerText=`A Restaurar: ${o} de ${a} ⏳`);t.showToast(`Dados restaurados com sucesso! A reiniciar...`,`success`),setTimeout(()=>location.reload(),1500)}catch(e){console.error(`Erro na restauração:`,e),t.showToast(`Ficheiro inválido ou erro de comunicação.`,`error`),n&&(n.disabled=!1,n.innerText=`⬆️ RESTAURAR DADOS`),document.body.style.cursor=`default`}},r.readAsText(e.files[0])},toggleNotificacoes:()=>{let e=document.getElementById(`noti-dropdown`);e&&e.classList.toggle(`active`)},marcarNotificacoesComoLidas:async()=>{try{let e=await t.api(`/sistema/notificacoes/nao-lidas`);if(!Array.isArray(e))return t.showToast(`Não foi possível carregar notificações.`,`error`);let n=e.filter(e=>!e.lida);if(n.length===0)return t.showToast(`Não há notificações novas.`,`info`);await Promise.all(n.map(e=>t.api(`/sistema/notificacoes/lida/${e.id}`,`PUT`))),t.showToast(`Notificações marcadas como lidas.`,`success`),await t.verificarNotificacoes()}catch(e){console.error(e),t.showToast(`Erro ao marcar notificações.`,`error`)}},verificarNotificacoes:async()=>{try{let e=t.usuario?t.usuario.tipo:`Gestor`,n=await t.api(`/sistema/notificacoes/nao-lidas`),r=await t.api(`/alunos`),i=await t.api(`/eventos`),a=await t.api(`/financeiro`),o=await t.api(`/planejamentos`),s=await t.api(`/estoques`),c=await t.api(`/escola`);if(Array.isArray(r)&&(r=r.filter(e=>!e.status||e.status===`Ativo`)),t.entidadeAtual===`aluno`&&Array.isArray(r)&&Array.isArray(t.listaCache)){let e=t.listaCache.map(e=>e.id);if(r.some(t=>!e.includes(t.id))){t.showToast(`Novo aluno recebido pela matrícula online.`,`success`),t.listaCache=r;let e=document.getElementById(`input-busca`);e&&(e.value=``),typeof t.filtrarTabelaReativa==`function`&&t.filtrarTabelaReativa()}}let l=[];Array.isArray(n)&&n.filter(e=>!e.lida).sort((e,t)=>new Date(t.dataCriacao||0)-new Date(e.dataCriacao||0)).slice(0,10).forEach(e=>{l.push({icon:e.tipo===`matricula_contrato`?`📝`:`🔔`,texto:`<b>${t.escapeHTML(e.titulo||`Nova notificação`)}</b><br>${t.escapeHTML(e.mensagem||``)}<br><small>Origem: ${t.escapeHTML(e.refLink||`Direto`)}</small>`,prioridade:1,acao:`App.renderizarContratos()`})});let u=new Date,d=u.getFullYear(),f=String(u.getMonth()+1).padStart(2,`0`),p=String(u.getDate()).padStart(2,`0`),m=`${d}-${f}-${p}`,h=new Date(u);h.setDate(h.getDate()+1);let g=`${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,`0`)}-${String(h.getDate()).padStart(2,`0`)}`;if(c&&e===`Gestor`){let e=c.plano||`Teste`,t=u.getTime(),n=0;if(c.dataExpiracao){let e=new Date(c.dataExpiracao).getTime();n=Math.ceil((e-t)/(1e3*60*60*24))}else{let r=c.dataCriacao?new Date(c.dataCriacao).getTime():t,i=Math.floor(Math.abs(t-r)/(1e3*60*60*24));n=(e===`Teste`?7:30)-i}e!==`Premium`&&e!==`Bloqueado`&&(n<=3&&n>0?l.push({icon:`⏳`,texto:`<b>Atenção Gestor:</b> O seu plano <b>${e}</b> expira em <b>${n} dia(s)</b>! Renove agora.`,acao:`App.renderizarTela('plano')`}):n<=0&&l.push({icon:`🚫`,texto:`<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar usando o sistema.`,acao:`App.renderizarTela('plano')`}))}if(Array.isArray(r)&&r.forEach(e=>{e.nascimento&&e.nascimento.substring(5)===`${f}-${p}`&&l.push({icon:`🎂`,texto:`Hoje é aniversário de <b>${t.escapeHTML(e.nome)}</b>! Clique para ver.`,acao:`App.renderizarLista('aluno')`})}),Array.isArray(r)&&r.forEach(e=>{e.dataMatricula&&e.dataMatricula.startsWith(m)&&l.push({icon:`🎉`,texto:`<b>Nova Matrícula!</b> O aluno <b>${t.escapeHTML(e.nome)}</b> foi registado hoje.`,acao:`App.renderizarContratos()`})}),e!==`Professor`&&Array.isArray(a)){let e=a.filter(e=>e.vencimento===m&&e.status===`Pendente`);e.length>0&&l.push({icon:`💲`,texto:`<b>Caixa de Hoje:</b> Existem <b>${e.length}</b> mensalidades a vencer no dia de hoje.`,acao:`App.renderizarTela('mensalidades')`})}Array.isArray(i)&&i.forEach(e=>{e.data===m?l.push({icon:`🚨`,texto:`<b>Hoje:</b> ${t.escapeHTML(e.tipo)} - ${t.escapeHTML(e.descricao)}`,acao:`App.renderizarTela('calendario')`}):e.data===g&&l.push({icon:`⏳`,texto:`<b>Amanhã:</b> ${t.escapeHTML(e.tipo)} - ${t.escapeHTML(e.descricao)}`,acao:`App.renderizarTela('calendario')`})}),e!==`Professor`&&(Array.isArray(a)&&Array.isArray(r)&&Array.isArray(o)&&r.forEach(n=>{let r=o.find(e=>e.idAluno===n.id),i=0,s=null;if(a.forEach(e=>{e.idAluno===n.id&&e.status!==`Cancelado`&&(!e.idCarne||!e.idCarne.includes(`VENDA`))&&((!s||e.vencimento>s)&&(s=e.vencimento),e.vencimento>=m&&i++)}),s&&s.startsWith(`${d}-${f}`)&&l.push({icon:`🎓`,texto:`A última mensalidade de <b>${t.escapeHTML(n.nome)}</b> vence este mês. Clique para gerar renovação!`,acao:`App.renderizarTela('mensalidades')`}),r&&r.aulas){let a=r.aulas.filter(e=>!e.visto).length;if(a>0){let o=4;if(r.aulas.length>1){let e=r.aulas[0].data.split(`/`),t=r.aulas[1].data.split(`/`),n=new Date(`${e[2]}-${e[1]}-${e[0]}`),i=new Date(`${t[2]}-${t[1]}-${t[0]}`),a=Math.abs((i-n)/(1e3*60*60*24));a<=4?o=8:a<=2&&(o=12)}Math.ceil(a/o)>i&&e===`Gestor`&&l.push({icon:`⚠️`,texto:`<b>Faturação Perdida!</b> <b>${t.escapeHTML(n.nome)}</b> precisa de ${a} aulas, mas não tem parcelas suficientes.`,acao:`App.renderizarTela('mensalidades')`})}}}),Array.isArray(s)&&s.forEach(e=>{let n=parseInt(e.quantidade)||0;n<=(parseInt(e.quantidadeMinima)||0)&&l.push({icon:`📦`,texto:`<b>Estoque Baixo:</b> Restam apenas ${n} unidades de <b>${t.escapeHTML(e.nome)}</b>!`,acao:`App.renderizarLista('estoque')`})}));let _=document.getElementById(`noti-badge`),v=document.getElementById(`noti-list`);if(l.length>0){_&&(_.innerText=l.length,_.style.display=`block`);let e=l.length>0?`
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
    `:``;v&&(v.innerHTML=e+l.map(e=>`
                    <div class="noti-item" style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='transparent'" onclick="${e.acao}; App.toggleNotificacoes();">
                        <span class="noti-icon">${e.icon}</span>
                        <div>${e.texto}</div>
                    </div>
                `).join(``))}else _&&(_.style.display=`none`),v&&(v.innerHTML=`<div class="noti-item" style="justify-content:center; color:#999; padding: 30px 15px;">Nenhum alerta pendente.<br>Tudo tranquilo! 🎉</div>`)}catch(e){console.error(`Erro nas notificações`,e)}},gerarLinkMatricula:function(){let e=t.usuario.id,n=`${window.location.origin+`matricula.html`}?escola=${e}`,r=document.getElementById(`inputLinkMatricula`);r&&(r.value=n);let i=JSON.parse(localStorage.getItem(t.getTenantKey(`historico_links`))||`[]`);(i.length===0||i[0].link!==n)&&(i.unshift({data:new Date().toLocaleString(`pt-PT`),link:n}),i.length>10&&i.pop(),localStorage.setItem(t.getTenantKey(`historico_links`),JSON.stringify(i))),t.renderizarHistoricoLinks(),typeof t.showToast==`function`&&t.showToast(`Link gerado com sucesso!`,`success`)},renderizarHistoricoLinks:function(){let e=document.getElementById(`containerHistoricoLinks`);if(!e)return;let n=JSON.parse(localStorage.getItem(t.getTenantKey(`historico_links`))||`[]`);if(n.length===0){e.innerHTML=`<p style='color:#7f8c8d; font-size:14px;'>Nenhum link gerado recentemente.</p>`;return}let r=`<ul style="list-style:none; padding:0; margin-top:15px;">`;n.forEach(e=>{r+=`
        <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 13px;">
                <strong style="color:#2c3e50;">${e.data}</strong><br>
                <a href="${e.link}" target="_blank" style="color:#3498db; text-decoration:none;">${e.link}</a>
            </div>
            <button onclick="navigator.clipboard.writeText('${e.link}'); App.showToast('Copiado!', 'success');" 
                    style="background:#f4f6f7; border:1px solid #ddd; padding:5px 10px; border-radius:5px; cursor:pointer; color:#333;">
                Copiar
            </button>
        </li>`}),r+=`</ul>`,e.innerHTML=r},salvarCustomizacaoMatricula:async function(){let n={configMatricula:{titulo:document.getElementById(`customTitulo`).value||`Matrícula Online`,corSecundaria:document.getElementById(`customCor`).value||`#3498db`,logoUrl:document.getElementById(`customLogoUrl`).value||``,textoContrato:document.getElementById(`editorContratoHtml`).value}};try{if(Swal.fire({title:`A Sincronizar com a Nuvem...`,allowOutsideClick:!1,didOpen:()=>Swal.showLoading()}),(await fetch(`${e.API_URL}/escola`,{method:`PUT`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(t.getTenantKey(`token_acesso`))}`},body:JSON.stringify(n)})).ok)Swal.fire(`Perfeito!`,`Configurações e Contrato atualizados online.`,`success`);else throw Error(`Falha no servidor.`)}catch{Swal.fire(`Erro`,`Não foi possível sincronizar com o servidor.`,`error`)}},renderizarCofreContratos:async function(){let n=document.getElementById(`conteudoPrincipal`);if(n){n.innerHTML=`<div style="padding: 40px; text-align: center;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>A aceder ao cofre...</div>`;try{let r=await fetch(`${e.API_URL}/contratos`,{headers:{Authorization:`Bearer ${localStorage.getItem(t.getTenantKey(`token_acesso`))}`}});if(!r.ok)throw Error(`Erro ao carregar contratos`);let i=await r.json(),a=`
            <div class="header-tela">
                <h2>🔒 Cofre de Contratos Digitais</h2>
                <p>Documentos assinados em tempo real via matrícula online.</p>
            </div>
            <div class="card-tabela">
                <table style="width:100%; text-align:left; border-collapse: collapse;">
                    <tr style="background:#f4f6f7; border-bottom:2px solid #ddd;">
                        <th style="padding:12px;">Data/Hora</th>
                        <th style="padding:12px;">Aluno</th>
                        <th style="padding:12px;">Ação</th>
                    </tr>`;i.length===0?a+=`<tr><td colspan="3" style="text-align:center; padding:20px;">Nenhum contrato encontrado.</td></tr>`:i.reverse().forEach(e=>{let n=e.dataHoraRegistro?new Date(e.dataHoraRegistro).toLocaleString(`pt-BR`):`---`;a+=`
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:12px;">${n}</td>
                    <td style="padding:12px;"><strong>${t.escapeHTML(e.nomeAluno||`Aluno sem nome`)}</strong></td>
                    <td style="padding:12px;">
                        <button onclick="App.abrirVisualizacaoContrato('${e.id}')" 
                                style="padding:8px 15px; font-size:12px; background:#2c3e50; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
                            👁️ Ver
                        </button>
                    </td>
                </tr>`}),a+=`</table></div>`,n.innerHTML=a}catch(e){n.innerHTML=`<div style="padding: 20px; color: red;">Erro ao carregar o cofre: ${e.message}</div>`}}},abrirVisualizacaoContrato:async function(e){let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`A abrir Ficha Completa... ⏳`,document.getElementById(`modal-form-content`).innerHTML=`<p style="text-align:center; padding:30px; color:#666;">A extrair todos os dados do aluno e contrato da base de dados...</p>`;let r=document.querySelector(`.btn-confirm`);r&&(r.style.display=`none`);try{let n=await t.api(`/contratos/${e}`);if(!n||n.error)throw Error(n?n.error:`Documento não encontrado`);let i=n.nomeAluno||n.nome||`Aluno não identificado`,a=n.cpf||`Não informado`,o=n.rg||`Não informado`,s=n.nascimento||`Não informada`;if(s!==`Não informada`&&s.includes(`-`)){let e=s.split(`-`);e.length===3&&(s=`${e[2]}/${e[1]}/${e[0]}`)}let c=n.sexo||`Não informado`,l=n.profissao||`Não informada`,u=n.email||`Não informado`,d=n.whatsapp||`Não informado`,f=n.enderecoCompleto||`Não informado`,p=n.curso||`Não informado`,m=n.turma||`Não informada`,h=n.planoCurso||`Não informado`,g=n.diaVencimento||`Não informado`,_=n.resp_nome||`O Próprio / Não informado`,v=n.resp_parentesco||`Não informado`,y=n.resp_cpf||`Não informado`,b=n.resp_zap||`Não informado`,x=n.conteudoHTML?t.sanitizeHTML(t.unescapeHTML(n.conteudoHTML)):`<p>O contrato não possui texto legível.</p>`,S=n.dataHoraRegistro||n.dataHora||n.createdAt?new Date(n.dataHoraRegistro||n.dataHora||n.createdAt).toLocaleString(`pt-BR`):`Data não registada`;document.getElementById(`modal-titulo`).innerText=`Matrícula: ${i}`,document.getElementById(`modal-form-content`).innerHTML=`
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
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Nome:</b> ${i}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Data de Nascimento:</b> ${s}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>CPF:</b> ${a}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>RG:</b> ${o}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Sexo:</b> ${c}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Profissão:</b> ${l}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>WhatsApp:</b> ${d}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>E-mail:</b> ${u}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 6px; border-bottom: 1px solid #eee;"><b>Endereço Completo:</b> ${f}</td>
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
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Curso:</b> ${p}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Turma:</b> ${m}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Plano de Curso:</b> ${h}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Dia de Vencimento:</b> ${g}</td>
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
                    <p style="margin:10px 0 0 0; font-size:10px; color:#7f8c8d;">ID da Transação: ${n._id||e}</p>
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
        `,r&&(r.style.display=`inline-flex`,r.style.background=`#2c3e50`,r.innerHTML=`🖨️ Imprimir Ficha`,r.setAttribute(`onclick`,`App.imprimirContrato()`))}catch(e){console.error(`Falha ao abrir contrato:`,e),document.getElementById(`modal-titulo`).innerText=`Erro de Leitura`,document.getElementById(`modal-form-content`).innerHTML=`<p style="color:red; text-align:center;">Não foi possível carregar a ficha completa.<br><small>${e.message}</small></p>`}},renderizarHubContratos:()=>{t.setTitulo(`Hub de Contratos e Matrículas`);let e=document.getElementById(`app-content`);e.innerHTML=`
            <div class="card" style="margin-bottom: 20px; border-bottom: 3px solid #34495e;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                    <button class="btn-primary" onclick="App.mostrarAreaLinks()" style="background:#3498db; border:none;">🔗 Link de Matrícula</button>
                    <button class="btn-primary" onclick="App.renderizarContratos()" style="background:#2c3e50; border:none;">🗄️ Cofre de Contratos</button>
                    <button class="btn-primary" onclick="App.renderizarConfiguradorMatricula()" style="background:#f39c12; border:none;">⚙️ Configurar Formulário</button>
                </div>
            </div>
            <div id="area-dinamica-hub">
                <div class="card" style="text-align:center; padding:50px; opacity:0.6;">
                    <span style="font-size:40px;">📂</span>
                    <p>Selecione uma das opções acima para gerenciar suas matrículas e contratos.</p>
                </div>
            </div>
        `},mostrarAreaLinks:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar links... ⏳</p>`;try{let n=await t.api(`/escola`);if(!n||n.error||!n.escolaId){e.innerHTML=`
                <div class="card" style="text-align:center; color:#e74c3c;">
                    <h3>Erro ao carregar links</h3>
                    <p>Não foi possível identificar o ID da instituição.</p>
                </div>
            `;return}let r=n.escolaId,i=`${`${window.location.origin}${window.location.pathname.replace(`index.html`,``)}`}matricula.html?escola=${encodeURIComponent(r)}`,a=Array.isArray(n.linksMatricula)?n.linksMatricula:[];e.innerHTML=`
            <div class="card">
                <h3>🔗 Links de Matrícula</h3>
                <p style="font-size:13px; color:#666;">
                    Gere links públicos para matrícula online. Cada link abre o <strong>matricula.html</strong> com o ID desta instituição.
                </p>

                <div style="background:#f8f9fa; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px;">Link principal da instituição</label>
                    <input id="link-principal-matricula" value="${i}" readonly style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('link-principal-matricula').value); App.showToast('Link principal copiado!', 'success');" style="width:auto;">
                            📋 Copiar Link Principal
                        </button>

                        <button class="btn-cancel" onclick="window.open(document.getElementById('link-principal-matricula').value, '_blank')" style="width:auto;">
                            🔎 Abrir Link
                        </button>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px;">Criar link personalizado / campanha</label>
                    <input id="nome-novo-link-matricula" placeholder="Ex: Instagram, WhatsApp, Turma Sábado, Campanha Maio..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                    <button class="btn-primary" onclick="App.criarLinkMatriculaCampanha()" style="width:auto;">
                        ➕ Gerar Link Personalizado
                    </button>
                </div>

                <h4>Links gerados</h4>
                ${a.length===0?`<p style="text-align:center; color:#999; font-size:13px; padding:20px; border:1px dashed #ccc; border-radius:8px;">
                    Nenhum link/campanha gerado ainda.
               </p>`:a.map(e=>{let n=`${i}&ref=${encodeURIComponent(e.id)}`;return`
                    <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:12px;">
                        <strong>${t.escapeHTML(e.nome||`Link sem nome`)}</strong>
                        <p style="font-size:12px; color:#777; margin:6px 0;">
                            Criado em: ${t.escapeHTML(e.criadoEm||`-`)}
                        </p>

                        <input value="${n}" readonly style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; font-size:12px; margin-bottom:10px;">

                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button class="btn-primary" onclick="navigator.clipboard.writeText('${n}'); App.showToast('Link copiado!', 'success');" style="width:auto;">
                                📋 Copiar
                            </button>

                            <button class="btn-cancel" onclick="window.open('${n}', '_blank')" style="width:auto;">
                                🔎 Abrir
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
        `}},criarLinkMatriculaCampanha:async()=>{let e=document.getElementById(`nome-novo-link-matricula`)?.value?.trim();if(!e)return t.showToast(`Digite um nome para o link.`,`warning`);try{let n=await t.api(`/escola`);if(!n||n.error||!n.escolaId)return t.showToast(`Não foi possível carregar os dados da instituição.`,`error`);let r=Array.isArray(n.linksMatricula)?n.linksMatricula:[],i={id:`REF_`+Date.now(),nome:e,criadoEm:new Date().toLocaleString(`pt-BR`)},a={...n,linksMatricula:[i,...r]},o=await t.api(`/escola`,`PUT`,a);if(o&&o.error)return t.showToast(o.error,`error`);t.showToast(`Link personalizado criado com sucesso!`,`success`),t.mostrarAreaLinks()}catch(e){console.error(e),t.showToast(`Erro ao criar link personalizado.`,`error`)}},gerarNovoLinkMatricula:async()=>{let e=document.getElementById(`nome-novo-link`).value.trim();if(!e)return t.showToast(`Por favor, dê um nome para a campanha/link.`,`warning`);let n=document.querySelector(`button[onclick="App.gerarNovoLinkMatricula()"]`),r=n.innerText;n.innerText=`A gerar... ⏳`,n.disabled=!0;try{let n=await t.api(`/escola`)||{},r=n.linksMatricula||[],i={id:window.crypto.randomUUID().split(`-`)[0].toUpperCase(),nome:e,data:new Date().toLocaleString(`pt-BR`)};r.unshift(i),n.linksMatricula=r,await t.api(`/escola`,`PUT`,n),t.showToast(`Link gerado com sucesso!`,`success`),t.mostrarAreaLinks()}catch{t.showToast(`Erro ao guardar o link.`,`error`)}finally{n&&(n.innerText=r,n.disabled=!1)}},excluirLinkMatricula:async e=>{if(confirm(`Tem a certeza que deseja apagar este link? O link principal continuará a funcionar.`))try{let n=await t.api(`/escola`)||{};n.linksMatricula=(n.linksMatricula||[]).filter(t=>t.id!==e),await t.api(`/escola`,`PUT`,n),t.showToast(`Link apagado do histórico.`,`success`),t.mostrarAreaLinks()}catch{t.showToast(`Erro ao apagar.`,`error`)}},renderizarContratos:async()=>{let e=document.getElementById(`area-dinamica-hub`)||document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar o cofre... ⏳</p>`;try{let n=await t.api(`/contratos`),r=Array.isArray(n)?n:[];if(r.length===0){e.innerHTML=`<div style="text-align:center; padding:40px;"><span style="font-size:50px;">🗄️</span><h3 style="color:#666;">Cofre Vazio</h3><p style="font-size:13px; color:#999;">Os recibos imutáveis aparecerão aqui quando os alunos preencherem a matrícula.</p></div>`;return}r.sort((e,t)=>new Date(t.dataHoraRegistro)-new Date(e.dataHoraRegistro)),e.innerHTML=`<div>
                <div style="background:#fdf2f2; border:1px solid #f5b7b1; color:#c0392b; padding:12px; border-radius:6px; margin-bottom:20px; font-size:13px; text-align:center;">
                    🔒 <strong>Zona de Segurança Jurídica:</strong> Os documentos listados abaixo são registos oficiais imutáveis.
                </div>
                ${r.map(e=>{let n=new Date(e.dataHoraRegistro).toLocaleString(`pt-BR`);return`
                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div>
                        <div style="font-weight:bold; color:#2c3e50; font-size:15px;">📄 ${t.escapeHTML(e.nomeAluno)}</div>
                        <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">⏱️ Recebido em: <strong style="color:#2c3e50;">${n}</strong></div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="App.abrirVisualizacaoContrato('${e.id}')" style="padding:8px 15px; font-size:12px; background:#2c3e50; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">👁️ Ver</button>
                        <button onclick="App.excluirContrato('${e.id}')" style="padding:8px 15px; font-size:12px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">🗑️ Apagar</button>
                    </div>
                </div>`}).join(``)}
            </div>`,t.listaCacheContratos=r}catch{e.innerHTML=`<p style='color:red;'>Erro ao carregar cofre.</p>`}},imprimirContrato:()=>{let e=JSON.parse(localStorage.getItem(t.getTenantKey(`escola_perfil`)))||{},n=e.nome||`Instituição de Ensino`,r=e.cnpj?`CNPJ: ${e.cnpj}`:``,i=e.foto&&e.foto.length>50&&!e.foto.includes(`placehold`)?`<img src="${e.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">`:``,a=document.getElementById(`area-impressao-contrato`).cloneNode(!0),o=document.createElement(`iframe`);o.style.position=`absolute`,o.style.top=`-10000px`,o.style.width=`800px`,o.style.height=`1000px`,o.style.border=`none`,document.body.appendChild(o);let s=o.contentWindow.document;s.open(),s.write(`
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
                    ${i}
                    <div>
                        <h2>${t.escapeHTML(n)}</h2>
                        <p>${t.escapeHTML(r)}</p>
                    </div>
                </div>
                ${a.innerHTML}
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento impresso em ${new Date().toLocaleString(`pt-BR`)} pelo SISTEMA PTT
                </div>
            </body>
            </html>
        `),s.close(),setTimeout(()=>{o.contentWindow.focus(),o.contentWindow.print(),setTimeout(()=>{document.body.removeChild(o)},1500)},800)},excluirContrato:e=>{t.abrirModalConfirmacao(`Apagar Contrato Oficial?`,`Tem a certeza que deseja apagar este documento assinado? Esta ação é irreversível.`,async n=>{document.body.style.cursor=`wait`;try{let n=await t.api(`/contratos/${e}`,`DELETE`);n&&n.error?t.showToast(n.error,`error`):(t.showToast(`Contrato apagado com sucesso!`,`success`),t.renderizarContratos())}catch{t.showToast(`Erro ao apagar o contrato.`,`error`)}finally{document.body.style.cursor=`default`,n.style.opacity=`0`,setTimeout(()=>n.style.display=`none`,300)}})},renderizarConfiguradorMatricula:async()=>{let e=document.getElementById(`area-dinamica-hub`);e.innerHTML=`<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do contrato... ⏳</p>`;try{let n=await t.api(`/escola`)||{};n.configMatricula||={imagemHeader:`https://placehold.co/800x400?text=Sua+Imagem+de+Cabecalho`,imagemPosicao:`50% 50%`,tituloHeader:`Matrícula Digital`,descHeader:`Preencha os dados abaixo com atenção para garantir a sua vaga.`,opcoesPlano:`Padrão, Intensivo, Personalizado`,opcoesVencimento:`08, 20`,textoContrato:`TERMO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS<br><br>CLÁUSULA PRIMEIRA – DO OBJETO<br>O presente contrato tem como objeto...`},t.configTemp={...n.configMatricula},t.configTemp.imagemPosicao||(t.configTemp.imagemPosicao=`50% 50%`),t.configTemp.textoContrato&&(t.configTemp.textoContrato=t.unescapeHTML(t.configTemp.textoContrato)),e.innerHTML=`
                <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                    <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                        <h3 style="margin-top:0; color:#2c3e50; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🛠️ Ferramentas</h3>
                        
                        <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:5px; justify-content:flex-start;" onclick="App.editarConfig('imagem')">🖼️ Imagem do Cabeçalho</button>
                        <div style="font-size:11px; color:#7f8c8d; text-align:center; margin-bottom:15px; line-height:1.4;">Tamanho recomendado:<br><b style="color:#2c3e50;">800 x 400px</b></div>

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
            `,t.atualizarPreviewConfigurador()}catch{e.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o configurador.</p>`}},atualizarPreviewConfigurador:()=>{let e=document.getElementById(`preview-word-doc`);e&&(e.innerHTML=`
                <div id="preview-header-img" 
                     onmousedown="App.iniciarArraste(event)" 
                     ontouchstart="App.iniciarArraste(event)"
                     style="width:100%; height:120px; background:url('${t.configTemp.imagemHeader}') no-repeat; background-size: cover; background-position: ${t.configTemp.imagemPosicao}; border-radius:8px 8px 0 0; cursor:grab; position:relative; overflow:hidden; user-select:none;">
                     <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px; pointer-events:none; backdrop-filter:blur(2px); border:1px solid rgba(255,255,255,0.2);">🖐️ Arraste para reposicionar</div>
                </div>
                <div style="padding: 25px; text-align: center; border-bottom: 2px dashed #eee;">
                    <h2 style="color:#2c3e50; margin:0 0 10px 0;">${t.escapeHTML(t.configTemp.tituloHeader)}</h2>
                    <p style="color:#7f8c8d; font-size:14px; margin:0;">${t.escapeHTML(t.configTemp.descHeader)}</p>
                </div>
                <div style="padding: 25px;">
                    <h4 style="color:#2980b9; margin-top:0;">📋 Dados Editáveis (Preview)</h4>
                    <div style="display:flex; gap:10px; margin-bottom: 15px;">
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Plano de Curso: ${t.configTemp.opcoesPlano}</option>
                        </select>
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Vencimento: ${t.configTemp.opcoesVencimento}</option>
                        </select>
                    </div>
                    <h4 style="color:#2980b9;">📑 Texto do Contrato</h4>
                    <div style="font-size:11px; color:#555; background:#f9f9f9; padding:15px; border-radius:6px; border:1px solid #eee; height:300px; overflow-y:auto; text-align:justify;">${t.configTemp.textoContrato}</div>
                </div>
            `)},editarConfig:e=>{if(e===`imagem`){let e=document.createElement(`input`);e.type=`file`,e.accept=`image/*`,e.onchange=e=>{let n=e.target.files[0];n&&(t.showToast(`A processar e otimizar a imagem... ⏳`,`info`),t.otimizarImagem(n,800,e=>{t.configTemp.imagemHeader=e,t.atualizarPreviewConfigurador(),t.showToast(`Imagem aplicada com sucesso!`,`success`)}))},e.click()}else if(e===`titulo`||e===`descricao`||e===`opcoes`){let n=(e,t,n)=>{let r=document.createElement(`div`);r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;`;let i=document.createElement(`div`);i.style.cssText=`background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;`,i.innerHTML=`
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
                     <input type="text" id="inputTitulo" class="modal-custom-input" placeholder="Ex: Contrato de Prestação de Serviços" value="${t.configTemp.tituloHeader||``}">`,e=>{t.configTemp.tituloHeader=e.querySelector(`#inputTitulo`).value,t.atualizarPreviewConfigurador()}):e===`descricao`?n(`📝 Editar Descrição`,`<label class="modal-custom-label">Subtítulo ou Descrição:</label>
                     <textarea id="inputDescricao" class="modal-custom-input" style="height:110px; resize:vertical;" placeholder="Digite aqui uma breve descrição...">${t.configTemp.descHeader||``}</textarea>`,e=>{t.configTemp.descHeader=e.querySelector(`#inputDescricao`).value,t.atualizarPreviewConfigurador()}):e===`opcoes`&&n(`⚙️ Dados Complementares`,`<div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Planos de Curso</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputCursos" class="modal-custom-input" placeholder="Ex: Inglês, Informática" value="${t.configTemp.opcoesPlano||``}">
                     </div>
                     <div>
                        <label class="modal-custom-label">Dias de Vencimento</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputDias" class="modal-custom-input" placeholder="Ex: 5, 10, 15" value="${t.configTemp.opcoesVencimento||``}">
                     </div>`,e=>{t.configTemp.opcoesPlano=e.querySelector(`#inputCursos`).value,t.configTemp.opcoesVencimento=e.querySelector(`#inputDias`).value,t.atualizarPreviewConfigurador()})}else if(e===`contrato`){let e=document.getElementById(`modal-overlay`);e&&(e.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Editar Texto do Contrato`,document.getElementById(`modal-form-content`).innerHTML=`
                <div id="editor-contrato-quill" style="height:350px; background:#fff; font-family:sans-serif; line-height:1.5;">${t.sanitizeHTML(t.configTemp.textoContrato||``)}</div>
            `,setTimeout(()=>{window.quillContrato=new Quill(`#editor-contrato-quill`,{theme:`snow`,modules:{toolbar:[[`bold`,`italic`,`underline`],[{list:`ordered`},{list:`bullet`}],[{align:[]}],[{size:[`small`,!1,`large`,`huge`]}],[`clean`]]}})},100);let n=document.querySelector(`.btn-confirm`);n.style.display=`inline-flex`,n.innerHTML=`Aplicar ao Preview`,n.onclick=()=>{t.configTemp.textoContrato=window.quillContrato.root.innerHTML,t.atualizarPreviewConfigurador(),t.fecharModal()}}},salvarConfiguradorMatricula:async()=>{let e=document.querySelector(`button[onclick="App.salvarConfiguradorMatricula()"]`),n=e?e.innerHTML:`💾 Salvar Tudo`;e&&(e.innerHTML=`A salvar... ⏳`,e.disabled=!0,e.style.opacity=`0.8`),document.body.style.cursor=`wait`;try{let e=await t.api(`/escola`)||{};e.configMatricula=t.configTemp,await t.api(`/escola`,`PUT`,e),t.showToast(`Configurações da matrícula salvas com sucesso!`,`success`)}catch{t.showToast(`Erro ao guardar as configurações.`,`error`)}finally{e&&(e.innerHTML=n,e.disabled=!1,e.style.opacity=`1`),document.body.style.cursor=`default`}},abrirModalConfirmacao:(e,t,n)=>{let r=document.getElementById(`modal-confirmacao-bonito`);r||(r=document.createElement(`div`),r.id=`modal-confirmacao-bonito`,r.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:0; transition:opacity 0.3s ease;`,document.body.appendChild(r)),r.innerHTML=`
            <div style="background:#fff; padding:30px; border-radius:24px; width:90%; max-width:380px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform:scale(0.8); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="box-confirmacao-interno">
                <div style="width:80px; height:80px; border-radius:50%; background:#fdedec; color:#e74c3c; font-size:40px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto; border:4px solid #f9ebea;">🗑️</div>
                <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size:22px; font-weight:800;">${e}</h3>
                <p style="color:#7f8c8d; font-size:14px; margin-bottom:25px; line-height:1.5;">${t}</p>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <button onclick="document.getElementById('modal-confirmacao-bonito').style.opacity='0'; setTimeout(()=>document.getElementById('modal-confirmacao-bonito').style.display='none', 300);" style="flex:1; padding:12px; background:#f4f6f7; color:#7f8c8d; border:1px solid #d5dbdb; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; transition:background 0.2s;" onmouseover="this.style.background='#e5e8e8'" onmouseout="this.style.background='#f4f6f7'">Cancelar</button>
                    <button id="btn-confirmar-acao-bonita" style="flex:1; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow:0 4px 15px rgba(231,76,60,0.3); transition:background 0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Sim, Apagar</button>
                </div>
            </div>
        `,r.style.display=`flex`,setTimeout(()=>{r.style.opacity=`1`,document.getElementById(`box-confirmacao-interno`).style.transform=`scale(1)`},10),document.getElementById(`btn-confirmar-acao-bonita`).onclick=function(){let e=this;e.innerHTML=`A apagar... ⏳`,e.style.opacity=`0.8`,e.disabled=!0,n(r)}},dragState:{isDragging:!1,startX:0,startY:0,bgX:50,bgY:50},iniciarArraste:e=>{t.dragState.isDragging=!0,t.dragState.startX=e.type.includes(`touch`)?e.touches[0].clientX:e.clientX,t.dragState.startY=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY;let n=(t.configTemp.imagemPosicao||`50% 50%`).split(` `);t.dragState.bgX=parseFloat(n[0])||50,t.dragState.bgY=parseFloat(n[1])||50;let r=document.getElementById(`preview-header-img`);r&&(r.style.cursor=`grabbing`),document.addEventListener(`mousemove`,t.arrastarImagem),document.addEventListener(`mouseup`,t.pararArraste),document.addEventListener(`touchmove`,t.arrastarImagem,{passive:!1}),document.addEventListener(`touchend`,t.pararArraste)},arrastarImagem:e=>{if(!t.dragState.isDragging)return;e.preventDefault();let n=e.type.includes(`touch`)?e.touches[0].clientX:e.clientX,r=e.type.includes(`touch`)?e.touches[0].clientY:e.clientY,i=n-t.dragState.startX,a=r-t.dragState.startY,o=.2,s=t.dragState.bgX-i*o,c=t.dragState.bgY-a*o;s=Math.max(0,Math.min(100,s)),c=Math.max(0,Math.min(100,c)),t.configTemp.imagemPosicao=`${s.toFixed(2)}% ${c.toFixed(2)}%`;let l=document.getElementById(`preview-header-img`);l&&(l.style.backgroundPosition=t.configTemp.imagemPosicao),t.dragState.startX=n,t.dragState.startY=r,t.dragState.bgX=s,t.dragState.bgY=c},pararArraste:()=>{if(t.dragState.isDragging){t.dragState.isDragging=!1;let e=document.getElementById(`preview-header-img`);e&&(e.style.cursor=`grab`),document.removeEventListener(`mousemove`,t.arrastarImagem),document.removeEventListener(`mouseup`,t.pararArraste),document.removeEventListener(`touchmove`,t.arrastarImagem),document.removeEventListener(`touchend`,t.pararArraste)}}}),document.addEventListener(`DOMContentLoaded`,t.init),document.addEventListener(`keydown`,function(e){e.key===`Escape`&&(t.fecharModal(),typeof t.fecharModalInst==`function`&&t.fecharModalInst())}),window.addEventListener(`focus`,()=>{let e=document.getElementById(`tela-sistema`);t.usuario&&e&&e.style.display!==`none`&&t.verificarNotificacoes()}),document.addEventListener(`click`,e=>{let t=document.querySelector(`.notification-container`);if(t&&!t.contains(e.target)){let e=document.getElementById(`noti-dropdown`);e&&e.classList.remove(`active`)}}),window.addEventListener(`offline`,()=>{let e=document.getElementById(`offline-banner`);e&&(e.style.display=`block`),typeof t.showToast==`function`&&t.showToast(`Sem ligação à Internet!`,`error`)}),window.addEventListener(`online`,()=>{let e=document.getElementById(`offline-banner`);e&&(e.style.display=`none`),typeof t.showToast==`function`&&t.showToast(`Ligação à Internet restaurada!`,`success`)});var i;window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),i=e;let t=document.getElementById(`pwa-install-banner`);t&&(t.style.display=`block`)});var a=document.getElementById(`pwa-btn-install`);a&&a.addEventListener(`click`,async()=>{let e=document.getElementById(`pwa-install-banner`);if(e.style.display=`none`,i){i.prompt();let{outcome:e}=await i.userChoice;i=null}});var o=document.getElementById(`pwa-btn-cancel`);o&&o.addEventListener(`click`,()=>{let e=document.getElementById(`pwa-install-banner`);e.style.display=`none`}),window.addEventListener(`appinstalled`,()=>{let e=document.getElementById(`pwa-install-banner`);e&&(e.style.display=`none`),i=null,typeof gtag==`function`&&gtag(`event`,`app_install`,{platform:`PWA Web`}),t.showToast(`App instalada com sucesso! 🎉`,`success`)}),window.App=window.App||{};var s=window.App,c=e=>{let t=document.getElementById(e);return t?t.value.trim():``},l=e=>{let t=document.getElementById(e);if(!t||!t.value)return 0;let n=parseFloat(t.value);return isNaN(n)?0:n};s.verificarMaioridade=()=>{let e=document.getElementById(`alu-nasc`),t=document.getElementById(`box-responsavel`);if(!e||!t)return;if(!e.value){t.style.display=`none`;return}let n=new Date,r=new Date(e.value),i=n.getFullYear()-r.getFullYear(),a=n.getMonth()-r.getMonth();(a<0||a===0&&n.getDate()<r.getDate())&&i--,i<18?(t.style.display=`block`,t.style.animation=`fadeIn 0.5s`):t.style.display=`none`},s.atualizarDisplayDias=()=>{let e=document.querySelectorAll(`.turma-dia-chk:checked`),t=Array.from(e).map(e=>e.value),n=document.getElementById(`tur-dia-display`);n&&(n.innerText=t.length>0?t.join(`, `):`-- Selecione os dias --`)},document.addEventListener(`click`,function(e){let t=document.getElementById(`tur-dia-wrapper`),n=document.getElementById(`tur-dia-options`);n&&t&&!t.contains(e.target)&&(n.style.display=`none`)}),s.abrirModalCadastroModulo=async(e,t)=>{s.entidadeAtual=e,s.idEdicao=t;let n=document.getElementById(`modal-overlay`);n&&(n.style.display=`flex`);let r=document.getElementById(`modal-titulo`),i=document.getElementById(`modal-form-content`);r&&(r.innerText=t?`Editar ${e.charAt(0).toUpperCase()+e.slice(1)}`:`Novo ${e.charAt(0).toUpperCase()+e.slice(1)}`),i&&(i.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando formulário... ⏳</p>`);let a={},o={cursos:[],turmas:[]};try{if(t){let n=e===`financeiro`?`financeiro`:e+`s`;a=await s.api(`/${n}/${t}`)}if(e===`aluno`||e===`turma`){let[e,t]=await Promise.all([s.api(`/cursos`),s.api(`/turmas`)]);o.cursos=Array.isArray(e)?e:[],o.turmas=Array.isArray(t)?t:[]}let n=s.UI,r=``;if(e===`aluno`){let e=o.turmas.length>0?`<option value="">-- Selecione a Turma --</option>`+o.turmas.map(e=>`<option value="${e.nome}" ${a.turma===e.nome?`selected`:``}>${s.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre uma Turma Primeiro --</option>`,t=o.cursos.length>0?`<option value="">-- Selecione o Curso --</option>`+o.cursos.map(e=>`<option value="${e.nome}" ${a.curso===e.nome?`selected`:``}>${s.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre um Curso Primeiro --</option>`;r=`
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
            `}else if(e===`turma`){let e=o.cursos.length>0?`<option value="">-- Sem Curso Específico --</option>`+o.cursos.map(e=>`<option value="${e.nome}" ${a.curso===e.nome?`selected`:``}>${s.escapeHTML(e.nome)}</option>`).join(``):`<option value="">-- Cadastre um Curso Primeiro --</option>`,t=a.dia?a.dia.split(`,`).map(e=>e.trim()):[],i=e=>`
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
            `);i&&(i.innerHTML=r,e===`aluno`&&setTimeout(()=>s.verificarMaioridade(),100));let c=document.querySelector(`.btn-confirm`);c&&(c.setAttribute(`onclick`,`App.salvarCadastro()`),c.innerHTML=`💾 Salvar Registro`)}catch(e){console.error(`Erro no formulário:`,e),i&&(i.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar o formulário. Verifique a internet.</p>`)}},s.salvarCadastro=async()=>{let e=s.entidadeAtual,t=e===`financeiro`?`financeiro`:e+`s`,n={},r=document.querySelector(`.btn-confirm`),i=r?r.innerText:`Salvar`;r&&(r.innerText=`A guardar... ⏳`,r.disabled=!0),document.body.style.cursor=`wait`;try{if(e===`aluno`){n.nome=c(`alu-nome`),n.email=c(`alu-email`),n.whatsapp=c(`alu-zap`),n.cpf=c(`alu-cpf`),n.rg=c(`alu-rg`),n.nascimento=c(`alu-nasc`),n.sexo=c(`alu-sexo`),n.profissao=c(`alu-prof`),n.rua=c(`alu-rua`),n.numero=c(`alu-num`),n.bairro=c(`alu-bairro`),n.cidade=c(`alu-cidade`),n.estado=c(`alu-uf`),n.pais=c(`alu-pais`),n.turma=c(`alu-turma`),n.curso=c(`alu-curso`),n.status=c(`alu-status`)||`Ativo`;let e=document.getElementById(`box-responsavel`);if(e&&e.style.display!==`none`?(n.resp_nome=c(`alu-resp-nome`),n.resp_parentesco=c(`alu-resp-parentesco`),n.resp_cpf=c(`alu-resp-cpf`),n.resp_zap=c(`alu-resp-zap`)):(n.resp_nome=``,n.resp_parentesco=``,n.resp_cpf=``,n.resp_zap=``),!n.nome||!n.whatsapp)throw s.showToast(`Nome e WhatsApp são obrigatórios!`,`error`),Error(`Validação Falhou`)}else if(e===`turma`){n.nome=c(`tur-nome`),n.horario=c(`tur-hora`),n.curso=c(`tur-curso`);let e=document.querySelectorAll(`.turma-dia-chk:checked`);if(n.dia=Array.from(e).map(e=>e.value).join(`, `),!n.nome)throw s.showToast(`O nome da turma é obrigatório!`,`error`),Error(`Validação Falhou`)}else if(e===`curso`){if(n.nome=c(`cur-nome`),n.carga=c(`cur-carga`),n.valor=l(`cur-valor`),n.descricao=c(`cur-desc`),!n.nome)throw s.showToast(`O nome do curso é obrigatório!`,`error`),Error(`Validação Falhou`)}else if(e===`estoque`&&(n.nome=c(`est-nome`),n.codigo=c(`est-codigo`),n.obs=c(`est-obs`),n.valor=l(`est-valor`),n.quantidade=parseInt(c(`est-qtd`))||0,n.quantidadeMinima=parseInt(c(`est-min`))||0,!n.nome))throw s.showToast(`O nome do item é obrigatório!`,`error`),Error(`Validação Falhou`);let r=s.idEdicao?`/${t}/${s.idEdicao}`:`/${t}`,i=s.idEdicao?`PUT`:`POST`,a=await s.api(r,i,n);if(!a||a.error)throw Error(a?a.error:`Erro de comunicação com a API`);s.showToast(`Registo salvo com sucesso! 🎉`,`success`),s.fecharModal();let o=document.getElementById(`app-content`);o&&(o.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando lista... ⏳</p>`),typeof s.renderizarLista==`function`?await s.renderizarLista(e):typeof s.renderizarInicio==`function`&&await s.renderizarInicio()}catch(e){e.message!==`Validação Falhou`&&(s.showToast(e.message||`Ocorreu um erro ao salvar.`,`error`),console.error(`Erro completo:`,e))}finally{r&&(r.innerText=i,r.disabled=!1),document.body.style.cursor=`default`}},window.App=window.App||{};var u=window.App;if(u.renderizarFinanceiroPro=async()=>{u.setTitulo(`Financeiro`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Carregando dados financeiros...</p>`;try{let[t,n,r]=await Promise.all([u.api(`/turmas`),u.api(`/financeiro`),u.api(`/alunos`)]),i=r.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),a=n.filter(e=>!(e.status===`Pendente`&&!i.includes(e.idAluno)));u.financeiroCache=a.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1),u.UI.input;let o=u.UI.botao,s=(e,t,n)=>`
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
                    <select id="fin-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${`<option value="">-- Selecione --</option>`+r.filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${u.escapeHTML(e.nome)}</option>`).join(``)}</select>
                </div>
                ${s(`Tipo de Faturação:`,`fin-tipo`,`<option value="padrao">🟢 Mensalidade Padrão</option><option value="extra">🟠 Parcela Extra (Reposição)</option>`)}
                ${c(`Valor (R$):`,`fin-valor`,`number`,``,`0,00`)}
                ${c(`Parcelas:`,`fin-parcelas`,`number`,`12`)}
                ${c(`1º Vencimento:`,`fin-vencimento`,`date`,new Date().toISOString().split(`T`)[0])}
            </div>
            <button id="btn-gerar-carne" onclick="App.gerarCarnes()" style="margin-top:25px; width:100%; background:linear-gradient(90deg,#2980b9,#3498db); color:white; padding:12px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase; box-shadow: 0 4px 10px rgba(52,152,219,0.3);">Gerar e Imprimir Carnê</button>
        `,d=new Set,f=new Date().getFullYear();d.add(f),a.forEach(e=>{e.vencimento&&d.add(parseInt(e.vencimento.split(`-`)[0]))});let p=`<option value="" selected>Todos os Anos</option>`+Array.from(d).sort((e,t)=>t-e).map(e=>`<option value="${e}">${e}</option>`).join(``),m=`<option value="" selected>Todos os Meses</option>`+[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${(t+1).toString().padStart(2,`0`)}">${e}</option>`).join(``),h=`
            <div class="toolbar" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
                    ${o(`BAIXAR`,`App.abrirModalBaixa()`,`primary`,`✅`)}
                    ${o(`DESFAZER`,`App.acaoLote('pendente')`,`edit`,`↩️`)}
                    ${o(`EXCLUIR`,`App.acaoLote('excluir')`,`cancel`,`🗑️`)}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px; flex:1; min-width:300px; max-width:650px;">
                    <div class="search-wrapper" style="width: 100%; position:relative;">
                        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity:0.5;">🔍</span>
                        <input type="text" id="fin-busca" placeholder="Pesquisar por nome ou descrição..." oninput="App.filtrarFinanceiro()" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #ddd; border-radius:5px;">
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <select id="fin-filtro-status" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            <option value="">Todos os Status</option><option value="Pago">🟢 Pagos</option><option value="Pendente">🟠 Pendentes</option>
                        </select>
                        <select id="fin-filtro-mes" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${m}
                        </select>
                        <select id="fin-filtro-ano" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:100px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${p}
                        </select>
                    </div>
                </div>
            </div>
            <div id="fin-lista-area" class="table-responsive-wrapper" style="overflow-x:auto;">
                ${u.gerarTabelaFinanceira(u.financeiroCache)}
            </div>
        `;e.innerHTML=`
            <div style="margin-bottom:20px; text-align:right;">
                <button onclick="App.renderizarTela('inadimplencia')" style="background:#c0392b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 6px rgba(192, 57, 43, 0.3);">📉 RELATÓRIO DE INADIMPLÊNCIA</button>
            </div>
            <div class="card" style="border-left:5px solid #2980b9; padding:25px; margin-bottom:30px;">
                ${l}
            </div>
            ${u.UI.card(``,``,h)}
        `}catch{e.innerHTML=`Erro ao carregar dados financeiros.`}},u.gerarTabelaFinanceira=e=>{if(!e||e.length===0)return`<p style="text-align:center; padding:20px; color:#999;">Nenhum lançamento encontrado.</p>`;let t=(e,t=`center`)=>`<th style="padding:12px; text-align:${t}; border-bottom:2px solid #eee;">${e}</th>`,n=`<tr style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase; font-size:12px;">
        <th style="padding:12px; width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheck(this)"></th>
        ${t(`Aluno`,`left`)}${t(`Parcela`)}${t(`Vencimento`)}${t(`Valor`)}${t(`Status`)}${t(`Ações`)}
    </tr>`,r=new Date;return r.setHours(0,0,0,0),`<table style="width:100%; border-collapse:collapse; font-size:14px; color:#555; min-width:600px;"><thead>${n}</thead><tbody>${e.map(e=>{let t=e.status===`Pago`,n=e.status===`Pendente`,i=new Date(e.vencimento+`T00:00:00`),a=n&&i<r,o=t?`#1e8449`:n?`#f39c12`:`#e74c3c`;a&&(o=`#c0392b`);let s=``;t?s=`background-color:#eafaf1;`:a&&(s=`background-color:#fdf2f2;`);let c=a?`Atrasado`:e.status,l=`<span style="background:${t?`#d4efdf`:a?`#fadbd8`:`#fcf3cf`}; padding:4px 8px; border-radius:4px; font-size:12px;">${c}</span>`,d=e.descricao.includes(`/`)?e.descricao.split(` `).pop():`-`,f=e.vencimento.split(`-`).reverse().join(`/`),p=parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2}),m=t?``:`<button onclick="App.cobrarWhatsApp('${e.idAluno}', '${p}')" style="background:#27ae60; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Cobrar no WhatsApp">💬</button>`;return`
        <tr style="border-bottom:1px solid #eee; ${s} transition:background 0.2s;">
            <td style="padding:12px; text-align:center;"><input type="checkbox" class="fin-check" value="${e.id}"></td>
            <td style="padding:12px; font-weight:bold;">${u.escapeHTML(e.alunoNome)}</td>
            <td style="padding:12px; text-align:center;">${u.escapeHTML(d)}</td>
            <td style="padding:12px; text-align:center; ${a?`color:#c0392b; font-weight:bold;`:``}">${f}</td>
            <td style="padding:12px; text-align:center;">R$ ${p}</td>
            <td style="padding:12px; text-align:center; font-weight:bold; color:${o};">${l}</td>
            <td style="padding:12px; text-align:center; white-space:nowrap;">
                <button onclick="App.abrirCarneExistente('${e.idCarne}')" style="background:#3498db; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Ver Carnê">📄</button>
                <button onclick="App.abrirEdicaoFinanceiro('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Editar Valor">✏️</button>
                ${m}
            </td>
        </tr>`}).join(``)}</tbody></table>`},u.filtrarFinanceiro=()=>{let e=document.getElementById(`fin-busca`),t=document.getElementById(`fin-filtro-mes`),n=document.getElementById(`fin-filtro-ano`),r=document.getElementById(`fin-filtro-status`),i=e?e.value.toLowerCase():``,a=t?t.value:``,o=n?n.value:``,s=r?r.value:``,c=u.financeiroCache.filter(e=>{let t=!i||e.alunoNome&&e.alunoNome.toLowerCase().includes(i)||e.descricao&&e.descricao.toLowerCase().includes(i),n=e.vencimento||``,r=n.substring(0,4),c=n.substring(5,7),l=!o||r===o,u=!a||c===a,d=!s||e.status===s;return t&&l&&u&&d});a||o||s?c.sort((e,t)=>new Date(t.vencimento)-new Date(e.vencimento)):c.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1),document.getElementById(`fin-lista-area`).innerHTML=u.gerarTabelaFinanceira(c)},u.filaBaixa={modo:``,itens:[],index:0},u.abrirModalBaixa=()=>{let e=document.querySelectorAll(`.fin-check:checked`);if(e.length===0)return u.showToast(`Selecione pelo menos um lançamento para dar baixa.`,`warning`);let t=Array.from(e).map(e=>u.financeiroCache.find(t=>t.id==e.value)).filter(e=>e);if(t.length===1)u.filaBaixa={modo:`single`,itens:t,index:0},u.montarTelaBaixa();else{u.filaBaixa={modo:`escolha`,itens:t,index:0};let e=document.getElementById(`modal-overlay`);e&&(e.style.display=`flex`),document.getElementById(`modal-titulo`).innerText=`Múltiplas Baixas (${t.length} itens)`,document.getElementById(`modal-form-content`).innerHTML=`
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
        `;let n=document.querySelector(`.btn-confirm`);n&&(n.style.display=`none`)}},u.definirModoBaixa=e=>{u.filaBaixa.modo=e,u.filaBaixa.index=0,u.montarTelaBaixa()},u.montarTelaBaixa=()=>{let{modo:e,itens:t,index:n}=u.filaBaixa,r=document.getElementById(`modal-overlay`);r&&(r.style.display=`flex`);let i=document.querySelector(`.btn-confirm`);i&&(i.style.display=`inline-block`);let a=0,o=``,s=``,c=!0;if(e===`batch`){s=`Pagamento em Lote (${t.length} itens)`;let e=0;t.forEach(t=>e+=Math.round(parseFloat(t.valor)*100)),a=e/100,o=`
            <div style="font-size:13px; color:#2980b9; margin-bottom:15px; background:#e8f4f8; padding:12px; border-radius:6px; border-left:4px solid #3498db;">
                <b>ℹ️ Atenção:</b> O valor final e quaisquer juros aplicados serão divididos proporcionalmente entre os ${t.length} lançamentos.
            </div>`,i.innerText=`CONFIRMAR LOTE ✅`}else{let r=t[n];a=parseFloat(r.valor),c=n===t.length-1,s=e===`queue`?`Fila do Caixa: Lançamento ${n+1} de ${t.length}`:`Confirmar Pagamento`,o=`
            <div style="background:#fdfefe; border:1px solid #dce1e6; padding:15px; border-radius:6px; margin-bottom:15px; border-left:4px solid #27ae60; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:6px;">👤 Identificação do Pagador</div>
                    <div style="font-size:16px; font-weight:bold; color:#2c3e50; margin-bottom:4px;">${u.escapeHTML(r.alunoNome)}</div>
                    <div style="font-size:13px; color:#555;">📄 ${u.escapeHTML(r.descricao)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold; margin-bottom:6px;">Vencimento</div>
                    <div style="font-size:14px; color:#c0392b; font-weight:bold;">${r.vencimento.split(`-`).reverse().join(`/`)}</div>
                </div>
            </div>`,i.innerText=e===`queue`&&!c?`CONFIRMAR E PRÓXIMO ⏭️`:`CONFIRMAR PAGAMENTO ✅`}document.getElementById(`modal-titulo`).innerText=s;let l=u.UI.input,d=(e,t,n,r=``)=>`
        <div class="input-group" style="margin:0;">
            <label>${e}</label>
            <select id="${t}" ${r}>${n}</select>
        </div>`,f=(e,t=``,n=`grid`)=>`<div id="${t}" style="display:${n}; grid-template-columns:2fr 1fr; gap:10px; margin-bottom:10px;">${e}</div>`,p=`<option value="PIX">PIX</option><option value="Cartão de Crédito">Cartão de Crédito</option><option value="Cartão de Débito">Cartão de Débito</option><option value="Dinheiro">Dinheiro</option>`,m=`
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

            ${d(`Divisão de Pagamento`,`baixa-qtd`,`<option value="1">1 Forma de Pagamento</option><option value="2">2 Formas de Pagamento (Dividir Valor)</option>`,`onchange="App.mudarQtdFormasBaixa()"`)}
            
            <div style="margin-top:15px;">
                ${f(d(`Forma 1`,`baixa-forma-1`,p)+l(`Valor (R$)`,`baixa-valor-1`,a.toFixed(2),``,`number`,`step="0.01" oninput="App.calcValorBaixa()" style="margin:0;"`),`forma-1-container`)}
                
                ${f(d(`Forma 2`,`baixa-forma-2`,`<option value="Dinheiro">Dinheiro</option>`+p)+l(`Valor (R$)`,`baixa-valor-2`,`0.00`,``,`number`,`step="0.01" readonly style="background:#eee; margin:0;"`),`forma-2-container`,`none`)}
            </div>
            
            <input type="hidden" id="baixa-total-original" value="${a}">
            <input type="hidden" id="baixa-total" value="${a}">
        </div>`;document.getElementById(`modal-form-content`).innerHTML=m,i.setAttribute(`onclick`,`App.confirmarBaixa()`)},u.aplicarJurosBaixa=()=>{let e=parseFloat(document.getElementById(`baixa-total-original`).value),t=parseFloat(document.getElementById(`baixa-juros`).value)||0;t<0&&(t=0,document.getElementById(`baixa-juros`).value=0);let n=e+t/100*e;document.getElementById(`baixa-display-total`).innerText=`R$ ${n.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,document.getElementById(`baixa-total`).value=n.toFixed(2),document.getElementById(`baixa-qtd`).value===`1`?document.getElementById(`baixa-valor-1`).value=n.toFixed(2):u.calcValorBaixa()},u.mudarQtdFormasBaixa=()=>{let e=document.getElementById(`baixa-qtd`).value,t=document.getElementById(`forma-2-container`),n=document.getElementById(`baixa-valor-1`),r=parseFloat(document.getElementById(`baixa-total`).value);e===`2`?(t.style.display=`grid`,n.value=(r/2).toFixed(2),u.calcValorBaixa()):(t.style.display=`none`,n.value=r.toFixed(2))},u.calcValorBaixa=()=>{if(document.getElementById(`baixa-qtd`).value===`2`){let e=Math.round(parseFloat(document.getElementById(`baixa-total`).value)*100)-(Math.round(parseFloat(document.getElementById(`baixa-valor-1`).value)*100)||0);e<0&&(e=0),document.getElementById(`baixa-valor-2`).value=(e/100).toFixed(2)}},u.confirmarBaixa=async()=>{let e=document.getElementById(`baixa-data`).value,t=document.getElementById(`baixa-qtd`).value,n=document.getElementById(`baixa-forma-1`).value,r=document.getElementById(`baixa-valor-1`).value,i=t===`2`?document.getElementById(`baixa-forma-2`).value:null,a=t===`2`?document.getElementById(`baixa-valor-2`).value:null;if(!e)return u.showToast(`Informe a data de pagamento.`,`error`);let o=document.querySelector(`.btn-confirm`),s=o.innerText;o.innerText=`A guardar... ⏳`,o.disabled=!0;let{modo:c,itens:l,index:d}=u.filaBaixa;try{let o=[];if(c===`batch`){let s=parseFloat(document.getElementById(`baixa-total-original`).value)||0;for(let c of l){let l=s>0?parseFloat(c.valor)/s:0,d=s>0?(parseFloat(r)*l).toFixed(2):`0.00`,f=t===`2`&&s>0?(parseFloat(a)*l).toFixed(2):null,p=(parseFloat(d)+(parseFloat(f)||0)).toFixed(2),m={...c,status:`Pago`,dataPagamento:e,formaPagamento:n,valorPago1:d,formaPagamento2:i,valorPago2:f,valor:p};o.push(u.api(`/financeiro/${c.id}`,`PUT`,m))}}else{let s=l[d],c=(parseFloat(r)+(parseFloat(a)||0)).toFixed(2),f={...s,status:`Pago`,dataPagamento:e,formaPagamento:n,valorPago1:r,formaPagamento2:i,valorPago2:t===`2`?a:null,valor:c};o.push(u.api(`/financeiro/${s.id}`,`PUT`,f))}if(await Promise.all(o),c===`queue`&&d<l.length-1){u.showToast(`Pagamento ${d+1} registado. Avançando...`,`success`),u.filaBaixa.index++,u.montarTelaBaixa();return}u.showToast(`Operação no caixa concluída com sucesso! 💼`,`success`),u.fecharModal(),document.getElementById(`app-content`).innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando financeiro... ⏳</p>`,await u.renderizarFinanceiroPro()}catch{u.showToast(`Erro ao processar baixa.`,`error`)}finally{o&&(o.innerText=s,o.disabled=!1)}},u.gerarCarnes=async()=>{let e=document.getElementById(`fin-aluno`).value,t=document.getElementById(`fin-valor`).value,n=parseInt(document.getElementById(`fin-parcelas`).value),r=document.getElementById(`fin-vencimento`).value,i=document.getElementById(`fin-tipo`).value;if(!e||!t||!n||!r)return u.showToast(`Preencha todos os campos do gerador.`,`error`);if(parseFloat(t)<=0)return u.showToast(`O valor da mensalidade deve ser maior que zero.`,`warning`);let a=document.getElementById(`fin-aluno`).options[document.getElementById(`fin-aluno`).selectedIndex].text,o=Date.now().toString(),s=new Date().toLocaleDateString(`pt-BR`),c=document.getElementById(`btn-gerar-carne`),l=c.innerText;c.innerText=`Gerando ${n} parcelas... ⏳`,c.disabled=!0,document.body.style.cursor=`wait`;try{let c=[],l=new Date(r+`T00:00:00`),d=l.getDate();for(let r=1;r<=n;r++){let f=new Date(l.getTime());f.setMonth(l.getMonth()+(r-1)),f.getDate()!==d&&f.setDate(0);let p=f.toISOString().split(`T`)[0],m=`Mensalidade ${r}/${n}`;i===`extra`&&(m=`Parcela Extra (Extensão de Curso) - ${r}/${n}`);let h={id:o+`_`+r,idCarne:o,dataGeracao:s,idAluno:e,alunoNome:a,valor:t,vencimento:p,status:`Pendente`,descricao:m,tipo:`Receita`};c.push(u.api(`/financeiro`,`POST`,h))}await Promise.all(c),u.showToast(`Carnê gerado com sucesso!`,`success`),u.abrirCarneExistente(o)}catch{u.showToast(`Erro ao gerar parcelas.`,`error`)}finally{c.innerText=l,c.disabled=!1,document.body.style.cursor=`default`}},u.toggleCheck=e=>{document.querySelectorAll(`.fin-check`).forEach(t=>t.checked=e.checked)},u.acaoLote=async e=>{let t=document.querySelectorAll(`.fin-check:checked`);if(t.length===0)return u.showToast(`Selecione pelo menos um lançamento.`,`warning`);if(confirm(`Tem certeza que deseja ${e===`excluir`?`EXCLUIR`:`ALTERAR`} os ${t.length} itens selecionados?`)){u.showToast(`Processando requisições em lote... ⏳`,`info`),document.body.style.cursor=`wait`;try{let n=Array.from(t).map(async t=>{let n=t.value;if(e===`excluir`)return u.api(`/financeiro/${n}`,`DELETE`);{let t=u.financeiroCache.find(e=>e.id==n);if(t)return u.api(`/financeiro/${n}`,`PUT`,{...t,status:e===`baixar`?`Pago`:`Pendente`})}});await Promise.all(n),u.showToast(`Ação concluída com sucesso!`,`success`),u.renderizarFinanceiroPro()}catch{u.showToast(`Erro ao processar lote.`,`error`)}finally{document.body.style.cursor=`default`}}},u.abrirCarneExistente=async e=>{let t=document.getElementById(`app-content`);t.innerHTML=`<p style="text-align:center; padding:20px;">Gerando Carnê Profissional...</p>`;try{let[n,r,i]=await Promise.all([u.api(`/financeiro`),u.api(`/alunos`),u.api(`/escola`)]),a=n.filter(t=>t.idCarne===e).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento));if(a.length===0)return u.showToast(`Carnê não encontrado.`,`error`);let o=r.find(e=>e.id===a[0].idAluno)||{nome:`Aluno`,cpf:`Não informado`},s=i.foto?`<img src="${i.foto}" style="height:35px; object-fit:contain; margin-right:10px;">`:``,c=(i.nome||`INSTITUIÇÃO`).substring(0,20),l=(o.nome||`Aluno`).split(` `)[0],d=i.banco||`Não Configurado`,f=i.chavePix||`Não Configurada`;t.innerHTML=`
            <style>
                @media print {
                    body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .print-bg { background: transparent !important; padding: 0 !important; }
                    .print-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
                    
                    @page { size: A4 portrait; margin: 10mm; }
                    .carne-wrapper { 
                        border: 1px solid #000 !important; 
                        box-shadow: none !important; 
                        margin-bottom: 5mm !important; 
                        height: 65mm !important; 
                        flex-direction: row !important;
                        page-break-inside: avoid !important;
                    }
                    .carne-canhoto { width: 28% !important; border-right: 2px dashed #999 !important; border-bottom: none !important; }
                    .carne-recibo { width: 72% !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                @media (max-width: 768px) {
                    .carne-wrapper { flex-direction: column !important; height: auto !important; }
                    .carne-canhoto { width: 100% !important; border-right: none !important; border-bottom: 2px dashed #999 !important; }
                    .carne-recibo { width: 100% !important; }
                    .print-sheet { padding: 10px !important; }
                }
            </style>
            
            <div class="no-print" style="text-align:center; padding:20px; background:#fff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="margin-top:0; color:#2c3e50;">Carnê Gerado com Sucesso! 🎉</h2>
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">O layout foi refinado. O bloco PIX subiu para evitar cortes na linha final.</p>
                <button onclick="window.print()" class="btn-primary" style="padding:12px 25px; font-size:16px; width:auto;">🖨️ IMPRIMIR CARNÊ</button>
                <button onclick="App.renderizarFinanceiroPro()" class="btn-cancel" style="margin-left:10px; padding:12px 25px; width:auto;">VOLTAR</button>
            </div>
            
            <div class="print-bg" style="background: #f4f6f7; padding: 30px 15px; border-radius: 8px;">
                <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 20px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px; box-sizing: border-box;">
                    ${a.map(e=>{let t=e.vencimento.split(`-`).reverse().join(`/`),n=parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2}),r=e.id.slice(-8).toUpperCase(),a=i.qrCodeImagem&&i.qrCodeImagem.length>50&&!i.qrCodeImagem.includes(`placehold`)?`<img src="${i.qrCodeImagem}" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px; padding: 2px; background: #fff;">`:`<div id="qr-${e.id}" style="width: 60px; height: 60px; padding: 5px; background: #fff; border: 1px solid #ccc; border-radius: 4px; display:flex; align-items:center; justify-content:center;"></div>`;return`
            <div class="carne-wrapper" style="display: flex; border: 1px solid #000; margin-bottom: 5mm; font-family: Arial, sans-serif; background: #fff; color: #000; border-radius: 8px; overflow: hidden; width: 100%; max-width: 210mm; height: 65mm; margin-left: auto; margin-right: auto; page-break-inside: avoid; box-sizing: border-box;">
                
                <div class="carne-canhoto" style="width: 28%; border-right: 2px dashed #999; padding: 8px; display: flex; flex-direction: column; background: #fafafa; box-sizing: border-box; justify-content: space-between;">
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 5px; text-align: center;">
                        ${s}
                        <div style="font-weight: bold; font-size: 10px; text-transform: uppercase; margin-top:3px;">${u.escapeHTML(c)}</div>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Parcela:</b> ${u.escapeHTML(e.descricao)}</div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Vencimento:</b> <span style="color: red; font-weight: bold;">${t}</span></div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Valor:</b> R$ ${n}</div>
                    <div style="font-size: 10px; margin-bottom: 3px;"><b>Nº Doc:</b> ${r}</div>
                    <div style="margin-top: auto; font-size: 9px; border-top: 1px solid #ccc; padding-top: 5px;"><b>Sacado:</b> ${u.escapeHTML(l)}</div>
                </div>
                
                <div class="carne-recibo" style="width: 72%; padding: 6px 15px; display: flex; flex-direction: column; position: relative; box-sizing: border-box;">
                    
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 6px; align-items: center;">
                        <div style="display: flex; align-items: center;">
                            ${s} 
                            <div>
                                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">${u.escapeHTML(i.nome||`INSTITUIÇÃO`)}</div>
                                <div style="font-size: 9px; color: #555;">CNPJ: ${u.escapeHTML(i.cnpj||`00.000.000/0000-00`)} | Banco: <b>${u.escapeHTML(d)}</b></div>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 10px; font-weight: bold; color: #555; border-left: 2px solid #ccc; padding-left:10px;">
                            RECIBO DO<br>PAGADOR
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; background: #fdfdfd; border: 1px solid #ddd; padding: 4px 10px; border-radius: 4px;">
                        <div><div style="font-size: 9px; color: #777; text-transform: uppercase;">Nosso Número</div><div style="font-weight: bold; font-size: 12px;">${r}</div></div>
                        <div><div style="font-size: 9px; color: #777; text-transform: uppercase;">Vencimento</div><div style="font-weight: bold; font-size: 12px; color: #c0392b;">${t}</div></div>
                        <div><div style="font-size: 9px; color: #777; text-transform: uppercase;">Valor do Documento</div><div style="font-weight: bold; font-size: 12px;">R$ ${n}</div></div>
                    </div>

                    <div style="background: #fff8e1; border: 1px solid #f1c40f; padding: 4px 8px; border-radius: 4px; margin-bottom: 5px; text-align: center;">
                        <span style="font-size: 9px; font-weight: bold; color: #d35400;">⚠️ Informação Importante:</span> 
                        <span style="font-size: 9px; color: #555;">Evite a perda de descontos e benefícios. Após o vencimento, o valor da mensalidade será atualizado.</span>
                    </div>
                    
                    <div style="font-size: 10px; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 4px; line-height:1.4;">
                        <div><b>Ref:</b> ${u.escapeHTML(e.descricao)} &nbsp;|&nbsp; <b>Pagador:</b> ${u.escapeHTML(o.nome)} &nbsp;|&nbsp; <b>CPF:</b> ${u.escapeHTML(o.cpf||`Não informado`)}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; gap:15px;">
                        <div style="flex:1;">
                            <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px; color:#27ae60;">PAGAMENTO VIA PIX</div>
                            <div style="font-size: 9px; margin-bottom: 3px; color:#555;">Leia o QR Code ao lado ou utilize a chave manual abaixo:</div>
                            <div style="background: #eee; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; word-break: break-all; border:1px dashed #ccc;">
                                🔑 ${u.escapeHTML(f)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            ${a}
                            <div style="font-size: 8px; color: #999; margin-top: 2px;">Autenticação Mecânica</div>
                        </div>
                    </div>
                </div>
            </div>`}).join(``)}
                </div>
            </div>`,(!i.qrCodeImagem||i.qrCodeImagem.length<=50||i.qrCodeImagem.includes(`placehold`))&&a.forEach(e=>{let t=document.getElementById(`qr-${e.id}`);t&&typeof QRCode<`u`?new QRCode(t,{text:f,width:60,height:60,colorDark:`#000000`,colorLight:`#ffffff`,correctLevel:QRCode.CorrectLevel.L}):t&&(t.innerHTML=`<span style="font-size:8px; color:#999; text-align:center;">QR Code<br>Indisponível</span>`)})}catch(e){console.error(e),u.showToast(`Erro ao gerar carnê.`,`error`)}},u.renderizarInadimplencia=async()=>{u.setTitulo(`Relatório de Inadimplência`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Calculando inadimplência... ⏳</p>`;try{let[t,n,r]=await Promise.all([u.api(`/financeiro`),u.api(`/alunos`),u.api(`/escola`)]),i=n.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),a=new Date,o=t.filter(e=>e.status!==`Pago`&&new Date(e.vencimento+`T00:00:00`)<a&&i.includes(e.idAluno)),s=0,c={};o.forEach(e=>{let t=Math.round(parseFloat(e.valor)*100);if(!c[e.idAluno]){let t=n.find(t=>t.id==e.idAluno);c[e.idAluno]={idAluno:e.idAluno,nome:e.alunoNome,curso:t?t.curso:`-`,totalCentavos:0,detalhes:[]}}c[e.idAluno].totalCentavos+=t,c[e.idAluno].detalhes.push(`${e.vencimento.split(`-`).reverse().join(`/`)} (R$ ${parseFloat(e.valor).toLocaleString(`pt-BR`,{minimumFractionDigits:2})})`),s+=t});let l=Object.values(c).map(e=>({...e,total:e.totalCentavos/100})),d=s/100,f=new Date().toLocaleDateString(`pt-BR`),p=r.foto?`<img src="${r.foto}" style="height:50px;">`:``,m=l.length===0?`<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">Nenhuma pendência encontrada.</td></tr>`:l.map(e=>`
                <tr>
                    <td style="font-weight:bold;">${u.escapeHTML(e.nome)}</td>
                    <td>${u.escapeHTML(e.curso)}</td>
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
                        ${p}
                        <div><h2 style="margin:0;">${u.escapeHTML(r.nome||``)}</h2><div style="font-size:12px;">CNPJ: ${u.escapeHTML(r.cnpj||``)}</div></div>
                    </div>
                    <div style="font-size:12px; color:#666;">Emissão: ${f}</div>
                </div>
                
                <h2 style="color:#2c3e50; margin-bottom:20px;">📉 Relatório de Inadimplência</h2>
                
                <div class="inad-card-top">
                    <div class="inad-kpi-box">
                        <div class="inad-kpi inad-kpi-red">
                            <div class="inad-kpi-label" style="color:#c0392b;">TOTAL EM ATRASO</div>
                            <div class="inad-kpi-val" style="color:#c0392b;">R$ ${d.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}</div>
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
                    <tbody>${m}</tbody>
                </table>
            </div>`}catch(e){console.error(e),u.showToast(`Erro ao calcular inadimplência.`,`error`)}},u.abrirEdicaoFinanceiro=async e=>{u.idEdicaoFinanceiro=e;let t=document.getElementById(`modal-overlay`);t&&(t.style.display=`flex`);let n=document.getElementById(`modal-titulo`),r=document.getElementById(`modal-form-content`);n&&(n.innerText=`Editar Lançamento`),r&&(r.innerHTML=`<p style="padding:20px; text-align:center; color:#666;">Carregando dados da parcela... ⏳</p>`);try{let t=await u.api(`/financeiro/${e}`);u.parcelaEdicaoAtual=t;let n=t.status===`Pago`,i=n?`Data Efetiva do Pagamento`:`Nova Data de Vencimento`,a=n&&t.dataPagamento||t.vencimento;r.innerHTML=`
            ${n?`<div style="background:#e8f4f8; color:#2980b9; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #2980b9;">ℹ️ <b>Parcela Paga:</b> Você está alterando apenas o dia em que o aluno efetuou o pagamento. <b>O vencimento original do carnê ficará intacto.</b></div>`:`<div style="background:#fff3e0; color:#d35400; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #d35400;">⚠️ <b>Parcela Pendente:</b> Alterar a data mudará o dia de vencimento no carnê do aluno.</div>`}
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">${i}</label>
                <input type="date" id="edit-fin-data" value="${a||``}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">Valor Registado (R$)</label>
                <input type="number" step="0.01" id="edit-fin-valor" value="${t.valor||``}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
        `;let o=document.querySelector(`.btn-confirm`);o&&(o.setAttribute(`onclick`,`App.salvarEdicaoFinanceiro()`),o.innerHTML=`💾 Salvar Alterações`)}catch(e){console.error(`Erro ao carregar edição:`,e),r&&(r.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar dados. Tente novamente.</p>`)}},u.salvarEdicaoFinanceiro=async()=>{let e=document.getElementById(`edit-fin-data`).value,t=document.getElementById(`edit-fin-valor`).value;if(!e||!t)return u.showToast(`Por favor, preencha a data e o valor.`,`warning`);let n=t.toString().trim();n.includes(`,`)&&n.includes(`.`)?n=n.replace(/\./g,``).replace(`,`,`.`):n.includes(`,`)&&(n=n.replace(`,`,`.`)),n=parseFloat(n)||0;let r=document.querySelector(`.btn-confirm`),i=r?r.innerHTML:`Salvar`;r&&(r.innerHTML=`⏳ A guardar...`,r.disabled=!0),document.body.style.cursor=`wait`;try{let t=u.parcelaEdicaoAtual.status===`Pago`,r={...u.parcelaEdicaoAtual,valor:n};t?(r.dataPagamento=e,r.valorPago1=n,r.valorPago2=0):r.vencimento=e,await u.api(`/financeiro/${u.idEdicaoFinanceiro}`,`PUT`,r),u.showToast(`Alteração financeira guardada com sucesso! 💼`,`success`),u.fecharModal(),typeof u.renderizarFinanceiroPro==`function`&&document.getElementById(`titulo-pagina`).innerText.includes(`Financeiro`)?u.renderizarFinanceiroPro():typeof u.filtrarTabelaReativa==`function`&&u.renderizarLista(`financeiro`)}catch(e){console.error(`Erro ao guardar edição:`,e),u.showToast(`Ocorreu um erro ao atualizar.`,`error`)}finally{r&&(r.innerHTML=i,r.disabled=!1),document.body.style.cursor=`default`}},u.renderizarHistoricoFinanceiro=async()=>{u.setTitulo(`Histórico de Lançamentos`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Carregando histórico financeiro... ⏳</p>`;try{let[t,n]=await Promise.all([u.api(`/financeiro`),u.api(`/alunos`)]),r=n.filter(e=>!e.status||e.status===`Ativo`).map(e=>e.id),i=t.filter(e=>!(e.status===`Pendente`&&!r.includes(e.idAluno)));u.financeiroCache=i.sort((e,t)=>e.status===t.status?new Date(e.vencimento)-new Date(t.vencimento):e.status===`Pendente`?-1:1);let a=u.UI.botao,o=new Set,s=new Date().getFullYear();o.add(s),i.forEach(e=>{e.vencimento&&o.add(parseInt(e.vencimento.split(`-`)[0]))});let c=`<option value="" selected>Todos os Anos</option>`+Array.from(o).sort((e,t)=>t-e).map(e=>`<option value="${e}">${e}</option>`).join(``),l=`<option value="" selected>Todos os Meses</option>`+[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${(t+1).toString().padStart(2,`0`)}">${e}</option>`).join(``),d=`
            <div class="toolbar" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
                    ${a(`BAIXAR`,`App.abrirModalBaixa()`,`primary`,`✅`)}
                    ${a(`DESFAZER`,`App.acaoLote('pendente')`,`edit`,`↩️`)}
                    ${a(`EXCLUIR`,`App.acaoLote('excluir')`,`cancel`,`🗑️`)}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px; flex:1; min-width:300px; max-width:650px;">
                    <div class="search-wrapper" style="width: 100%; position:relative;">
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
                ${u.gerarTabelaFinanceira(u.financeiroCache)}
            </div>
        `;e.innerHTML=`
            <div style="margin-top: 20px;">
                ${u.UI.card(``,``,d)}
            </div>
        `}catch{e.innerHTML=`Erro ao carregar dados financeiros.`}},typeof u.renderizarLista==`function`){let e=u.renderizarLista;u.renderizarLista=t=>t===`financeiro`?u.renderizarHistoricoFinanceiro():e(t)}u.cobrarWhatsApp=async(e,t)=>{try{u.showToast(`A preparar mensagem...`,`info`);let[n,r]=await Promise.all([u.api(`/alunos`),u.api(`/escola`)]),i=n.find(t=>t.id===e);if(!i)return u.showToast(`Erro: Aluno não encontrado.`,`error`);let a=(i.whatsapp||i.celular||i.telefone||i.contato||``).replace(/\D/g,``);if(a.length<10)return u.showToast(`O aluno não tem um número válido registado.`,`warning`);(a.length===10||a.length===11)&&(a=`55`+a);let o=`Olá, *${i.nome?i.nome.split(` `)[0]:`Aluno`}*! Tudo bem? ✨

Passando apenas para deixar um lembrete sobre a sua mensalidade no valor de *R$ ${t}*, que se encontra em aberto no nosso sistema.

Para sua maior comodidade, deixamos abaixo os nossos dados para pagamento via PIX:

🏦 *Dados da Instituição:*
*Instituição:* _${r.nome||`Nossa Instituição`}_
*CNPJ:* _${r.cnpj||`Não informado`}_
*Banco:* _${r.banco||`Não informado`}_

🔑 *Chave PIX:* *${r.chavePix||`Não informada`}*

_Caso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem._ 🙏

Qualquer dúvida, estamos à inteira disposição. Tenha um excelente dia! 🌟`,s=`https://api.whatsapp.com/send?phone=${a}&text=${encodeURIComponent(o)}`;window.open(s,`_blank`)}catch(e){console.error(`Erro ao gerar link do WhatsApp:`,e),u.showToast(`Erro ao processar a mensagem.`,`error`)}},window.App=window.App||{};var d=window.App,f={Evento:{bg:`#2ecc71`,text:`#fff`},Feriado:{bg:`#e74c3c`,text:`#fff`},Prova:{bg:`#3498db`,text:`#fff`},Reunião:{bg:`#f39c12`,text:`#fff`}},p=(e,t,n=`text`,r=``,i=``)=>`
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <input type="${n}" id="${t}" value="${r}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${i}>
    </div>`,m=(e,t,n,r=``)=>`
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${r}>${n}</select>
    </div>`;d.confirmar=(e,t,n,r,i)=>{let a=`modal-confirm-`+Date.now(),o=document.createElement(`div`);o.id=a,o.style.cssText=`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999; backdrop-filter:blur(3px); opacity:0; transition:opacity 0.2s;`;let s=document.createElement(`div`);s.style.cssText=`background:#fff; width:90%; max-width:400px; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); transform:scale(0.9); transition:transform 0.2s;`,s.innerHTML=`
        <div style="font-size:45px; margin-bottom:15px; animation: pop 0.3s ease;">⚠️</div>
        <h3 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${e}</h3>
        <p style="color:#7f8c8d; margin-bottom:25px; line-height:1.5; font-size:14px;">${t}</p>
        <div style="display:flex; gap:10px;">
            <button id="btn-no-${a}" style="flex:1; padding:12px; border:none; background:#ecf0f1; color:#7f8c8d; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#bdc3c7'" onmouseout="this.style.background='#ecf0f1'">Cancelar</button>
            <button id="btn-yes-${a}" style="flex:1; padding:12px; border:none; background:${r}; color:white; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; opacity:0.9;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">${n}</button>
        </div>
    `,o.appendChild(s),document.body.appendChild(o),setTimeout(()=>{o.style.opacity=`1`,s.style.transform=`scale(1)`},10);let c=()=>{o.style.opacity=`0`,s.style.transform=`scale(0.9)`,setTimeout(()=>document.body.removeChild(o),200)};document.getElementById(`btn-no-${a}`).onclick=c,document.getElementById(`btn-yes-${a}`).onclick=()=>{c(),i()}},d.filtrarTabela=(e,t)=>{let n=document.getElementById(e).value.trim().toLowerCase(),r=document.querySelectorAll(`#${t} tbody tr`);!r||r.length===0||r.forEach(e=>{if(e.innerText.includes(`Nenhum`)||e.innerText.includes(`Nenhuma`))return;let t=e.innerText.toLowerCase();e.style.display=t.includes(n)?``:`none`})},d.renderizarPlanejamentoPro=()=>{d.setTitulo(`Planejamento`);let e=document.getElementById(`app-content`),t=e=>`cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:220px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);`,n=e=>`this.style.borderColor='${e}'; this.style.transform='translateY(-5px)'`,r=`this.style.borderColor='#eee'; this.style.transform='translateY(0)'`;e.innerHTML=`
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
        </div>`},d.renderizarNovoPlanejamento=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`A carregar...`;try{let t=`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#2c3e50;">Configurar Novo Cronograma</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <div style="background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #eee;">
                ${m(`Aluno:`,`plan-aluno`,`<option value="">-- Selecione --</option>`+(await d.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}" data-curso="${d.escapeHTML(e.curso||`Geral`)}">${d.escapeHTML(e.nome)}</option>`).join(``),`style="margin-bottom:15px;"`)}
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${p(`Início:`,`plan-inicio`,`date`)}
                    ${p(`Total Aulas:`,`plan-qtd`,`number`,`10`)}
                </div>
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${p(`Horário:`,`plan-hora`,`time`,`08:00`)}
                    ${p(`Duração:`,`plan-duracao`,`time`,`01:00`)}
                </div>
                <label style="font-size:12px; font-weight:bold; color:#666; display:block; margin-bottom:8px;">Dias da Semana:</label>
                <div style="display:flex; gap:10px; flex-wrap:wrap; background:white; padding:10px; border:1px solid #ddd; border-radius:5px;">
                    ${[`Seg`,`Ter`,`Qua`,`Qui`,`Sex`,`Sáb`].map((e,t)=>`<label><input type="checkbox" class="plan-dia" value="${t+1}"> ${e}</label>`).join(``)}
                </div>
            </div>
            <button onclick="App.gerarGridEditavel()" style="width:100%; margin-top:20px; padding:15px; background:#3498db; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">CRIAR TABELA</button>
        `;e.innerHTML=d.UI.card(``,``,t,`800px`)}catch{e.innerHTML=`Erro.`}},d.renderizarPlanejamentosSalvos=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`A carregar...`;try{let t=(await d.api(`/planejamentos?_t=${Date.now()}`)).filter(e=>e.status!==`Arquivado`);if(t.length===0){e.innerHTML=d.UI.card(``,``,`<h3>Nenhum planejamento ativo.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`,`text-align:center; padding:40px;`);return}let n=t.map(e=>`
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px; font-weight:500;">${d.escapeHTML(e.nomeAluno)}</td>
                <td style="padding:10px;">${d.escapeHTML(e.curso)}</td>
                <td style="padding:10px; text-align:center;">${e.aulas?e.aulas.length:0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoEditavel('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Editar">✏️</button>
                    <button onclick="App.arquivarPlanejamento('${e.id}')" style="background:#8e44ad; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Arquivar">🗄️</button>
                    <button onclick="App.excluirPlanejamento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir">🗑️</button>
                </td>
            </tr>`).join(``);e.innerHTML=d.UI.card(``,``,`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#27ae60;">Planejamentos Ativos</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-plan-ativos" 
                       placeholder="Pesquisar planejamento ativo pelo nome do aluno ou curso..." 
                       oninput="App.filtrarTabela('input-busca-plan-ativos', 'tabela-plan-ativos')" 
                       style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
        
            <div class="table-responsive-wrapper">
                <table id="tabela-plan-ativos" style="width:100%; border-collapse:collapse;"><thead><tr><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr></thead><tbody>${n}</tbody></table>
            </div>
        `)}catch{e.innerHTML=`Erro.`}},d.renderizarPlanejamentosArquivados=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`A carregar arquivados...`;try{let t=(await d.api(`/planejamentos?_t=${Date.now()}`)).filter(e=>e.status===`Arquivado`);if(t.length===0){e.innerHTML=d.UI.card(``,``,`<h3>Nenhum planejamento no arquivo morto.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`,`text-align:center; padding:40px;`);return}let n=t.map(e=>`
            <tr style="border-bottom:1px solid #ddd; background:#f9f9f9;">
                <td style="padding:10px; color:#7f8c8d; font-weight:500;">${d.escapeHTML(e.nomeAluno)}</td>
                <td style="padding:10px; color:#7f8c8d;">${d.escapeHTML(e.curso)}</td>
                <td style="padding:10px; text-align:center; color:#7f8c8d;">${e.aulas?e.aulas.length:0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoVisualizacao('${e.id}')" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Visualizar">👁️</button>
                    <button onclick="App.restaurarPlanejamento('${e.id}')" style="background:#27ae60; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Restaurar / Reativar">♻️</button>
                    <button onclick="App.excluirPlanejamentoArquivado('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir Definitivamente">🗑️</button>
                </td>
            </tr>`).join(``);e.innerHTML=d.UI.card(``,``,`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; color:#8e44ad;">🗄️ Planejamentos Arquivados</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <p style="color:#666; font-size:13px; margin-bottom:20px;">Estes planejamentos foram finalizados/arquivados. Não são contabilizados no boletim nem no auto-ajuste de presenças.</p>
            
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-plan-arquivados" 
                       placeholder="Pesquisar arquivo morto..." 
                       oninput="App.filtrarTabela('input-busca-plan-arquivados', 'tabela-plan-arquivados')" 
                       style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
        
            <div class="table-responsive-wrapper">
                <table id="tabela-plan-arquivados" style="width:100%; border-collapse:collapse;"><thead><tr><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr></thead><tbody>${n}</tbody></table>
            </div>
        `)}catch{e.innerHTML=`Erro ao ler arquivados.`}},d.gerarGridEditavel=()=>{let e=document.getElementById(`plan-aluno`),t=e.value;if(!t)return alert(`Selecione um aluno.`);let n=e.options[e.selectedIndex].text,r=e.options[e.selectedIndex].getAttribute(`data-curso`)||`Geral`,i=document.getElementById(`plan-inicio`).value,a=parseInt(document.getElementById(`plan-qtd`).value),o=document.getElementById(`plan-hora`).value,s=document.getElementById(`plan-duracao`).value,c=Array.from(document.querySelectorAll(`.plan-dia:checked`)).map(e=>parseInt(e.value));if(!i||c.length===0)return alert(`Preencha os dados corretamente.`);let l=[],u=new Date(i+`T00:00:00`),f=0;for(;f<a;){if(c.includes(u.getDay())){f++;let e=String(u.getDate()).padStart(2,`0`),t=String(u.getMonth()+1).padStart(2,`0`),n=u.getFullYear();l.push({num:f,data:`${e}/${t}/${n}`,hora:o,duracao:s,conteudo:``,visto:!1})}u.setDate(u.getDate()+1)}d.renderizarTelaEdicao({id:null,idAluno:t,nomeAluno:n,curso:r,status:`Ativo`,aulas:l})},d.abrirPlanejamentoEditavel=async e=>{try{let t=await d.api(`/planejamentos/${e}?_t=${Date.now()}`);d.renderizarTelaEdicao(t)}catch{alert(`Erro.`)}},d.abrirPlanejamentoVisualizacao=async e=>{try{let t=await d.api(`/planejamentos/${e}?_t=${Date.now()}`);d.renderizarTelaEdicao(t,!0)}catch{alert(`Erro ao abrir.`)}},d.renderizarTelaEdicao=(e,t=!1)=>{d.planoAtual=e;let n=document.getElementById(`app-content`),r=0;e.aulas.forEach(e=>{if(e.duracao&&e.duracao.includes(`:`)){let[t,n]=e.duracao.split(`:`).map(Number);r+=t*60+(n||0)}});let i=Math.floor(r/60),a=r%60,o=a>0?`${i}h ${a}m`:`${i}H`,s=JSON.parse(localStorage.getItem(d.getTenantKey?d.getTenantKey(`escola_perfil`):`escola_perfil`))||{},c=s.foto?`<img src="${s.foto}" style="height:50px;">`:``,l=t?`App.renderizarPlanejamentosArquivados()`:`App.renderizarPlanejamentosSalvos()`,u=t?`<br><span style="color:#e74c3c; font-size:12px;">(ARQUIVADO - APENAS LEITURA)</span>`:``;n.innerHTML=`
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
                <div style="display:flex; align-items:center; gap:15px;">${c}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${d.escapeHTML(s.nome||`ESCOLA`)}</h2><div style="font-size:12px;">CNPJ: ${d.escapeHTML(s.cnpj||``)}</div></div></div>
                <div style="text-align:right;"><div><b>Planejamento Pedagógico</b> ${u}</div><div style="font-size:12px;">Emissão: ${new Date().toLocaleDateString(`pt-BR`)}</div></div>
            </div>
            
            <div style="border:1px solid #000; padding:10px; font-size:12px; margin-bottom:15px; background:#fafafa;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="width:60%;">
                        <div style="margin-bottom:5px;"><b>ALUNO:</b> ${d.escapeHTML(e.nomeAluno)}</div>
                        <div><b>TOTAL DE AULAS:</b> ${e.aulas.length}</div>
                    </div>
                    <div style="width:40%;">
                        <div style="margin-bottom:5px;"><b>CURSO:</b> ${d.escapeHTML(e.curso)}</div>
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
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${d.escapeHTML(e.data)}" onchange="App.atualizarAula(${n},'data',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${d.escapeHTML(e.hora)}" onchange="App.atualizarAula(${n},'hora',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent; font-weight:bold; color:#2980b9;" value="${d.escapeHTML(e.duracao)}" onchange="App.atualizarAula(${n},'duracao',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${t?`disabled`:``} style="width:100%; border:none; border-bottom:1px dashed #ccc; background:transparent;" placeholder="..." value="${d.escapeHTML(e.conteudo)}" onchange="App.atualizarAula(${n},'conteudo',this.value)"></td>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;"><input type="checkbox" ${t?`disabled`:``} ${e.visto?`checked`:``} onchange="App.atualizarAula(${n},'visto',this.checked)"></td>
                        </tr>`).join(``)}
                        <tr style="background:#eee; font-weight:bold; border-top:2px solid #000;"><td colspan="3" style="text-align:right; padding:10px;">Carga Horária Total =</td><td style="text-align:center; padding:10px; color:#2980b9;">${o}</td><td colspan="2"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>`},d.atualizarAula=(e,t,n)=>{d.planoAtual&&d.planoAtual.aulas[e]&&(d.planoAtual.aulas[e][t]=n),t===`duracao`&&d.renderizarTelaEdicao(d.planoAtual)},d.salvarPlanejamentoBanco=async()=>{if(!d.planoAtual)return;document.activeElement&&document.activeElement.blur();let e=d.planoAtual.id?`PUT`:`POST`,t=d.planoAtual.id?`/planejamentos/${d.planoAtual.id}`:`/planejamentos`;d.planoAtual.id||(d.planoAtual.id=Date.now().toString()),d.planoAtual.status||(d.planoAtual.status=`Ativo`);let n=document.querySelector(`button[onclick="App.salvarPlanejamentoBanco()"]`),r=n?n.innerText:`💾 SALVAR`;n&&(n.innerText=`A sincronizar tudo... ⏳`,n.disabled=!0),document.body.style.cursor=`wait`;try{await d.api(t,e,d.planoAtual);let n=(await d.api(`/chamadas?_t=${Date.now()}`)).filter(e=>e.idAluno===d.planoAtual.idAluno),r=new Date().toISOString().split(`T`)[0],i=[],a=0,o=0,s=0;d.planoAtual.aulas.forEach((e,t)=>{let c=e.data.split(`/`);if(c.length===3){let l=`${c[2]}-${c[1]}-${c[0]}`;if(l<=r){let r=n.find(e=>e.data===l);if(e.visto===!0)if(r)r.status!==`Presença`&&r.status!==`Reposição`?(i.push(d.api(`/chamadas/${r.id}`,`PUT`,{...r,status:`Presença`,duracao:e.duracao})),o++):r.duracao!==e.duracao&&(i.push(d.api(`/chamadas/${r.id}`,`PUT`,{...r,duracao:e.duracao})),o++);else{let n={id:Date.now().toString()+Math.floor(Math.random()*1e3)+t,idAluno:d.planoAtual.idAluno,nomeAluno:d.planoAtual.nomeAluno,data:l,status:`Presença`,duracao:e.duracao||`01:00`};i.push(d.api(`/chamadas`,`POST`,n)),a++}else r&&(r.status===`Presença`||r.status===`Reposição`)&&(i.push(d.api(`/chamadas/${r.id}`,`DELETE`)),s++)}}}),i.length>0&&await Promise.all(i);let c=`Planejamento Salvo!`;(a>0||o>0||s>0)&&(c+=` Sincronizado: ${a}✅ | ${o}✏️ | ${s}🗑️`),d.showToast(c,`success`);let l=document.getElementById(`app-content`);l&&(l.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await d.renderizarPlanejamentosSalvos()}catch(e){d.showToast(`Erro na sincronização.`,`error`),console.error(e)}finally{n&&(n.innerText=r,n.disabled=!1),document.body.style.cursor=`default`}},d.arquivarPlanejamento=e=>{d.confirmar(`Arquivar Planejamento`,`Tem a certeza que deseja enviar este planejamento para o arquivo morto? Ele deixará de aparecer na sua lista principal.`,`Sim, Arquivar`,`#8e44ad`,async()=>{try{let t=(await d.api(`/planejamentos?_t=${Date.now()}`)).find(t=>String(t.id)===String(e));if(!t)return d.showToast(`Planejamento não encontrado.`,`error`);t.status=`Arquivado`,await d.api(`/planejamentos/${e}`,`PUT`,t),d.showToast(`Planejamento Arquivado com sucesso!`,`success`);let n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await d.renderizarPlanejamentosSalvos()}catch{d.showToast(`Erro ao arquivar.`,`error`)}})},d.restaurarPlanejamento=e=>{d.confirmar(`Restaurar Planejamento`,`Deseja reativar este planejamento e devolvê-lo para a lista ativa?`,`Restaurar`,`#27ae60`,async()=>{try{let t=(await d.api(`/planejamentos?_t=${Date.now()}`)).find(t=>String(t.id)===String(e));if(!t)return d.showToast(`Planejamento não encontrado.`,`error`);t.status=`Ativo`,await d.api(`/planejamentos/${e}`,`PUT`,t),d.showToast(`Planejamento Reativado com sucesso!`,`success`);let n=document.getElementById(`app-content`);n&&(n.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando arquivo morto... ⏳</p>`),await d.renderizarPlanejamentosArquivados()}catch{d.showToast(`Erro ao reativar.`,`error`)}})},d.excluirPlanejamento=e=>{d.confirmar(`Atenção!`,`Deseja excluir DEFINITIVAMENTE este planejamento? Esta ação é irreversível.`,`Excluir`,`#e74c3c`,async()=>{await d.api(`/planejamentos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando planejamentos... ⏳</p>`),await d.renderizarPlanejamentosSalvos()})},d.excluirPlanejamentoArquivado=e=>{d.confirmar(`Atenção!`,`Deseja limpar este registo do arquivo morto para sempre?`,`Excluir`,`#e74c3c`,async()=>{await d.api(`/planejamentos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando arquivo morto... ⏳</p>`),await d.renderizarPlanejamentosArquivados()})},d.processarAutoAjustePlano=(e,t)=>{if(!e||!e.aulas||e.aulas.length===0)return e;let n=e.aulas[0].data.split(`/`),r=`${n[2]}-${n[1]}-${n[0]}`,i=t.filter(t=>t.idAluno===e.idAluno&&t.data>=r).sort((e,t)=>new Date(e.data)-new Date(t.data)),a=i.filter(e=>e.status===`Presença`||e.status===`Reposição`),o=[];if(a.length>0){let e=a.slice(-4);o=[...new Set(e.map(e=>{let[t,n,r]=e.data.split(`-`);return new Date(`${t}-${n}-${r}T12:00:00`).getDay()}))]}o.length===0&&(o=[...new Set(e.aulas.map(e=>{let t=e.data.split(`/`);return t.length===3?new Date(`${t[2]}-${t[1]}-${t[0]}T12:00:00`).getDay():-1}).filter(e=>e!==-1))]),o.length===0&&(o=[1]);let s=0,c=e.aulas.length>0?e.aulas[0].hora:`08:00`,l=new Date(`${r}T12:00:00`);if(l.setDate(l.getDate()-1),i.length>0){let e=i[i.length-1];l=new Date(`${e.data}T12:00:00`)}for(let t=0;t<e.aulas.length;t++){let n=e.aulas[t];if(n.hora&&(c=n.hora),s<a.length){let e=a[s],[t,r,i]=e.data.split(`-`);n.data=`${i}/${r}/${t}`,e.duracao&&(n.duracao=e.duracao),n.visto=!0,s++}else{for(n.visto=!1,l.setDate(l.getDate()+1);!o.includes(l.getDay());)l.setDate(l.getDate()+1);n.data=`${String(l.getDate()).padStart(2,`0`)}/${String(l.getMonth()+1).padStart(2,`0`)}/${l.getFullYear()}`}}for(;s<a.length;){let t=a[s],[n,r,i]=t.data.split(`-`);e.aulas.push({num:e.aulas.length+1,data:`${i}/${r}/${n}`,hora:c,duracao:t.duracao||`01:00`,conteudo:`Aula Adicional (Auto-Ajuste)`,visto:!0}),s++}return e},d.sincronizarPlanejamentoComChamadasUI=async()=>{if(!d.planoAtual||!d.planoAtual.idAluno)return;let e=document.getElementById(`btn-sync-plan`),t=e.innerHTML;e.innerHTML=`A analisar Padrões... ⏳`,e.disabled=!0,document.body.style.cursor=`wait`;try{let e=await d.api(`/chamadas?_t=${Date.now()}`);d.planoAtual=d.processarAutoAjustePlano(d.planoAtual,e),d.renderizarTelaEdicao(d.planoAtual),d.showToast(`Datas, Tempos e Aulas Extra Sincronizados! 🎉`,`success`)}catch{d.showToast(`Erro ao sincronizar planejamento.`,`error`)}finally{e&&(e.innerHTML=t,e.disabled=!1),document.body.style.cursor=`default`}},d.renderizarBoletimVisual=async()=>{d.setTitulo(`Boletim Escolar`);let e=document.getElementById(`app-content`);e.innerHTML=`A carregar...`;try{let t=`
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;">${`<option value="">-- Selecione o Aluno --</option>`+(await d.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${d.escapeHTML(e.nome)}</option>`).join(``)}</select>
                <button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR BOLETIM</button>
            </div>
        `;e.innerHTML=d.UI.card(`📄 Emitir Boletim Escolar`,``,t,`800px`)+`<div id="boletim-area" style="margin-top:30px;"></div>`}catch{e.innerHTML=`Erro.`}},d.gerarBoletimTela=async()=>{let e=document.getElementById(`bol-aluno`).value;if(!e)return d.showToast(`Selecione um aluno.`,`error`);let t=document.getElementById(`boletim-area`);t.innerHTML=`<p style="text-align:center;">A gerar boletim...</p>`;let n=parseFloat(localStorage.getItem(d.getTenantKey?d.getTenantKey(`media_aprovacao`):`media_aprovacao`))||6,r=localStorage.getItem(d.getTenantKey?d.getTenantKey(`regime_letivo`):`regime_letivo`)||`Bimestral`,i=6,a=`BIMESTRE`;r===`Trimestral`?(i=4,a=`TRIMESTRE`):r===`Semestral`?(i=2,a=`SEMESTRE`):r===`Anual`&&(i=1,a=`PERÍODO ÚNICO`);try{let[r,o,s,c,l]=await Promise.all([d.api(`/alunos/${e}`),d.api(`/avaliacoes?_t=${Date.now()}`),d.api(`/chamadas?_t=${Date.now()}`),d.api(`/escola`),d.api(`/planejamentos?_t=${Date.now()}`)]),u=l.find(t=>t.idAluno===e&&t.status!==`Arquivado`),f=s.filter(t=>t.idAluno===e&&(t.status===`Presença`||t.status===`Reposição`)).map(e=>e.data).sort(),p=`__/__/____`,m=`__/__/____`;u&&u.aulas&&u.aulas.length>0?(p=d.escapeHTML(u.aulas[0].data),m=d.escapeHTML(u.aulas[u.aulas.length-1].data)):f.length>0?(p=f[0].split(`-`).reverse().join(`/`),m=f[f.length-1].split(`-`).reverse().join(`/`)):p=new Date().toLocaleDateString(`pt-BR`);let h=d.escapeHTML(r.curso||(u?u.curso:`Geral`)),g=d.escapeHTML(r.turma||`Não informada`),_=o.filter(t=>t.idAluno===e),v={};_.forEach(e=>{let t=e.disciplina||`Geral`;v[t]||(v[t]={nome:t,notas:[],total:0,periodosLancados:new Set}),v[t].notas.push(e),v[t].total+=parseFloat(e.nota)||0;let n=e.periodo||e.bimestre;n&&v[t].periodosLancados.add(n)});let y=``;Object.keys(v).length===0?y=`<tr><td colspan="4" style="text-align:center; padding:15px; color:#999;">Sem notas lançadas para este aluno.</td></tr>`:Object.keys(v).forEach(e=>{let t=v[e],r=n*(t.periodosLancados.size>0?t.periodosLancados.size:1),a=n*i,o=t.total>=r,s=o?`#27ae60`:`#c0392b`,c=o?`<span style="color:${s}; font-weight:bold; font-size:14px;">NO PADRÃO</span>`:`<span style="color:${s}; font-weight:bold; font-size:14px;">RECUPERAÇÃO</span>`,l=t.notas.map(e=>`<span style="font-size:11px;">${d.escapeHTML(e.periodo||e.bimestre)} - ${d.escapeHTML(e.tipo)}: <b>${d.escapeHTML(e.nota)}</b></span>`).join(`<br>`);y+=`
                <tr>
                    <td style="padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><b>${d.escapeHTML(t.nome)}</b></td>
                    <td style="padding:10px; border-bottom:1px solid #eee;">${l}</td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><span style="font-size:16px; font-weight:bold; color:${s};">${t.total.toFixed(1)}</span></td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;">${c}<br><span style="font-size:10px; color:#7f8c8d;">Meta Anual: ${a.toFixed(1)} pts</span></td>
                </tr>`});let b=c.foto?`<img src="${c.foto}" style="height:60px; object-fit:contain;">`:``,x=new Date().toLocaleDateString(`pt-BR`);t.innerHTML=`
            <div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR BOLETIM</button></div>
            <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${b}<div><h2 style="margin:0; text-transform:uppercase;">${d.escapeHTML(c.nome||`INSTITUIÇÃO`)}</h2><div style="font-size:12px;">CNPJ: ${d.escapeHTML(c.cnpj||``)}</div></div></div>
                    <div style="text-align:right;"><div><b>BOLETIM ESCOLAR</b></div><div style="font-size:10px; color:#999;">Emissão: ${x}</div></div>
                </div>
                <div style="padding:15px; background:#fafafa; border:1px solid #000; margin-bottom:15px;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">ALUNO: ${d.escapeHTML(r.nome).toUpperCase()}</div>
                    <div style="font-size:13px; margin-bottom:10px;"><b>CURSO:</b> ${h} &nbsp;&nbsp;|&nbsp;&nbsp; <b>TURMA:</b> ${g}</div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #ccc; padding-top:5px; font-size:12px;"><div>INÍCIO DAS AULAS: <b>${p}</b></div><div>PREVISÃO DE TÉRMINO: <b>${m}</b></div></div>
                </div>
                <div class="table-responsive-wrapper">
                    <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                        <thead><tr style="border-bottom:2px solid #000;"><th style="padding:10px; width:30%;">DISCIPLINA</th><th style="padding:10px; width:30%;">AVALIAÇÕES (${a})</th><th style="text-align:center; padding:10px; width:15%;">NOTA TOTAL</th><th style="text-align:center; padding:10px; width:25%;">RESULTADO</th></tr></thead>
                        <tbody>${y}</tbody>
                    </table>
                </div>
                <div style="padding:40px 30px 10px 30px; text-align:center;"><div style="width:300px; margin:0 auto; border-top:1px solid #333; padding-top:5px; font-size:12px;">Coordenação Pedagógica</div></div>
            </div>`}catch{d.showToast(`Erro ao gerar boletim.`,`error`)}},d.salvarConfigNotas=()=>{let e=document.getElementById(`config-nota-media`).value,t=document.getElementById(`config-nota-max`).value,n=document.getElementById(`config-nota-regime`).value;localStorage.setItem(d.getTenantKey?d.getTenantKey(`media_aprovacao`):`media_aprovacao`,e),localStorage.setItem(d.getTenantKey?d.getTenantKey(`nota_maxima`):`nota_maxima`,t),localStorage.setItem(d.getTenantKey?d.getTenantKey(`regime_letivo`):`regime_letivo`,n),d.showToast(`Regras de avaliação guardadas com sucesso!`,`success`),d.renderizarAvaliacoesPro()},d.renderizarAvaliacoesPro=async()=>{d.setTitulo(`Avaliações e Notas`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar dados...</p>`;let t=localStorage.getItem(d.getTenantKey?d.getTenantKey(`media_aprovacao`):`media_aprovacao`)||`6.0`,n=localStorage.getItem(d.getTenantKey?d.getTenantKey(`nota_maxima`):`nota_maxima`)||`10.0`,r=localStorage.getItem(d.getTenantKey?d.getTenantKey(`regime_letivo`):`regime_letivo`)||`Bimestral`,i=parseFloat(t)/parseFloat(n),a=``,o=`Período`;r===`Bimestral`?(a=`<option value="1º Bimestre">1º Bimestre</option><option value="2º Bimestre">2º Bimestre</option><option value="3º Bimestre">3º Bimestre</option><option value="4º Bimestre">4º Bimestre</option><option value="5º Bimestre">5º Bimestre</option><option value="6º Bimestre">6º Bimestre</option>`,o=`Bimestre`):r===`Trimestral`?(a=`<option value="1º Trimestre">1º Trimestre</option><option value="2º Trimestre">2º Trimestre</option><option value="3º Trimestre">3º Trimestre</option><option value="4º Trimestre">4º Trimestre</option>`,o=`Trimestre`):r===`Semestral`?(a=`<option value="1º Semestre">1º Semestre</option><option value="2º Semestre">2º Semestre</option>`,o=`Semestre`):r===`Anual`&&(a=`<option value="Período Único">Período Único</option>`,o=`Período`);try{let[s,c,l,u]=await Promise.all([d.api(`/alunos`),d.api(`/turmas`),d.api(`/cursos`),d.api(`/avaliacoes?_t=${Date.now()}`)]);d.cacheAlunos=s;let f=u.sort((e,t)=>t.id-e.id),h=s.filter(e=>!e.status||e.status===`Ativo`),g=`<option value="">-- Turma Completa --</option>`+c.map(e=>`<option value="${d.escapeHTML(e.nome)}">${d.escapeHTML(e.nome)}</option>`).join(``),_=`<option value="">-- Aluno Específico --</option>`+h.map(e=>`<option value="${e.id}">${d.escapeHTML(e.nome)}</option>`).join(``),v=`<option value="Geral">Geral / Curso Padrão</option>`+l.map(e=>`<option value="${d.escapeHTML(e.nome)}">${d.escapeHTML(e.nome)}</option>`).join(``),y=new Date().toISOString().split(`T`)[0],b=`
            <div style="background:#fff; border-left:4px solid #8e44ad; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05); margin-bottom:20px; display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                <div style="width:100%; font-size:12px; font-weight:bold; color:#8e44ad; text-transform:uppercase; margin-bottom:-5px;">⚙️ Configuração do Sistema de Avaliação</div>
                ${m(`Regime Letivo:`,`config-nota-regime`,`<option value="Bimestral" ${r===`Bimestral`?`selected`:``}>Bimestral (6 Períodos)</option><option value="Trimestral" ${r===`Trimestral`?`selected`:``}>Trimestral (4 Períodos)</option><option value="Semestral" ${r===`Semestral`?`selected`:``}>Semestral (2 Períodos)</option><option value="Anual" ${r===`Anual`?`selected`:``}>Anual (1 Período)</option>`)}
                ${p(`Média de Aprovação:`,`config-nota-media`,`number`,t,`step="0.1"`)}
                ${p(`Nota Máx. do Período:`,`config-nota-max`,`number`,n,`step="0.1"`)}
                <button onclick="App.salvarConfigNotas()" class="btn-primary" style="background:#8e44ad; border:none; height:41px; padding:0 20px; margin-bottom: 5px;">💾 SALVAR REGRAS</button>
            </div>
        `,x=`
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${m(`Filtrar por Turma:`,`nota-turma`,g)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${m(`Buscar Aluno Único:`,`nota-aluno`,_)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px;">
                ${m(`Disciplina/Curso:`,`nota-disc`,v)}
                ${m(`Tipo de Avaliação:`,`nota-tipo`,`<option value="Teste">Teste</option><option value="Prova">Prova</option><option value="Pesquisa">Pesquisa</option><option value="Trabalho">Trabalho</option><option value="Outro">Outro (Especificar)</option>`,`onchange="App.toggleTipoOutroNota()"`)}
                <div id="div-outro-nota" style="flex: 1; min-width: 150px; display:none;">
                    <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Especifique:</label>
                    <input type="text" id="nota-outro-desc" placeholder="Ex: Seminário" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                </div>
                ${m(o+`:`,`nota-periodo`,a)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                ${p(`Valor desta Avaliação (Pts):`,`nota-max`,`number`,n,`step="0.1"`)}
                ${p(`Data da Avaliação:`,`nota-data`,`date`,y,`max="${y}"`)}
                <button onclick="App.carregarListaNotas()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR PAUTA</button>
                <button onclick="App.cancelarEdicaoNota()" id="btn-cancel-nota" style="height:41px; padding:0 20px; background:#95a5a6; color:white; border:none; border-radius:5px; display:none; cursor:pointer;">❌ Cancelar Edição</button>
            </div>
        `,S=`
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-notas" placeholder="Pesquisar histórico..." oninput="App.filtrarTabela('input-busca-notas', 'tabela-historico-notas')" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
            <div class="table-responsive-wrapper">
                <table id="tabela-historico-notas" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;">
                            <th style="padding:12px;">Aluno</th><th style="padding:12px;">Curso/Disc.</th><th style="padding:12px;">Data</th><th style="padding:12px;">Avaliação</th><th style="padding:12px;">Período</th><th style="padding:12px; text-align:center;">Nota / Valor</th><th style="padding:12px; text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${f.length===0?`<tr><td colspan="7" style="padding:20px; text-align:center; color:#999;">Nenhuma nota lançada.</td></tr>`:``}
                        ${f.map(e=>{let t=parseFloat(e.valorMax)||parseFloat(n),r=parseFloat(e.nota)/t>=i?`#27ae60`:`#c0392b`;return`
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px; font-weight:bold;">${d.escapeHTML(e.nomeAluno)}</td>
                                <td style="padding:12px; color:#555;">${d.escapeHTML(e.disciplina||`-`)}</td>
                                <td style="padding:12px;">${e.data?d.escapeHTML(e.data.split(`-`).reverse().join(`/`)):`-`}</td>
                                <td style="padding:12px;">${d.escapeHTML(e.tipo)}</td>
                                <td style="padding:12px;">${d.escapeHTML(e.periodo||e.bimestre||`-`)}</td>
                                <td style="padding:12px; text-align:center;"><strong style="color:${r}">${d.escapeHTML(e.nota)}</strong> <span style="color:#999; font-size:11px;">/ ${d.escapeHTML(t)}</span></td>
                                <td style="padding:12px; text-align:right;">
                                    <button onclick="App.editarAvaliacao('${e.id}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;" title="Editar">✏️</button>
                                    <button onclick="App.excluirAvaliacao('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;" title="Excluir">🗑️</button>
                                </td>
                            </tr>`}).join(``)}
                    </tbody>
                </table>
            </div>
        `;e.innerHTML=b+d.UI.card(`📝 Lançamento de Notas`,``,x,`100%`)+`<div id="area-lista-notas" style="margin-top:20px;"></div><div style="margin-top:20px;">`+d.UI.card(`Histórico de Notas Lançadas`,``,S,`100%`)+`</div>`}catch{e.innerHTML=`Erro ao carregar avaliações.`}},d.toggleTipoOutroNota=()=>{let e=document.getElementById(`nota-tipo`).value;document.getElementById(`div-outro-nota`).style.display=e===`Outro`?`block`:`none`},d.editarAvaliacao=async e=>{let t=await d.api(`/avaliacoes/${e}?_t=${Date.now()}`);document.getElementById(`nota-aluno`).value=t.idAluno,document.getElementById(`nota-turma`).value=``,document.getElementById(`nota-disc`).value=t.disciplina||`Geral`,[`Teste`,`Prova`,`Pesquisa`,`Trabalho`].includes(t.tipo)?(document.getElementById(`nota-tipo`).value=t.tipo,document.getElementById(`div-outro-nota`).style.display=`none`):(document.getElementById(`nota-tipo`).value=`Outro`,d.toggleTipoOutroNota(),document.getElementById(`nota-outro-desc`).value=t.tipo),document.getElementById(`nota-max`).value=t.valorMax;let n=document.getElementById(`nota-periodo`);n&&(n.value=t.periodo||t.bimestre),document.getElementById(`nota-data`).value=t.data||new Date().toISOString().split(`T`)[0],document.getElementById(`btn-cancel-nota`).style.display=`inline-block`,d.idAvaliacaoEditando=e,d.carregarListaNotas(),document.querySelector(`.card`).scrollIntoView({behavior:`smooth`})},d.cancelarEdicaoNota=()=>{d.idAvaliacaoEditando=null,document.getElementById(`nota-aluno`).value=``,document.getElementById(`btn-cancel-nota`).style.display=`none`,document.getElementById(`area-lista-notas`).innerHTML=``,d.showToast(`Modo de edição cancelado.`,`info`)},d.carregarListaNotas=async()=>{let e=document.getElementById(`nota-turma`).value,t=document.getElementById(`nota-aluno`).value,n=document.getElementById(`nota-disc`).value,r=document.getElementById(`nota-tipo`).value;r===`Outro`&&(r=document.getElementById(`nota-outro-desc`).value||`Outro`);let i=document.getElementById(`nota-data`).value,a=document.getElementById(`nota-max`).value;if(!e&&!t)return d.showToast(`Selecione uma Turma OU um Aluno específico.`,`warning`);if(!n||!i)return d.showToast(`Preencha Disciplina e Data.`,`warning`);if(i>new Date().toISOString().split(`T`)[0])return d.showToast(`Não é permitido abrir pautas para datas futuras.`,`warning`);let o=document.getElementById(`area-lista-notas`);o.innerHTML=`<p style="text-align:center; padding:20px;">A preparar pauta de lançamento... ⏳</p>`;try{let[s,c]=await Promise.all([d.api(`/alunos`),d.api(`/avaliacoes?_t=${Date.now()}`)]),l=[];if(l=t?s.filter(e=>e.id===t):s.filter(t=>t.turma===e),l=l.filter(e=>!e.status||e.status===`Ativo`),l.length===0){o.innerHTML=`<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno ativo encontrado para este filtro.</p></div>`;return}let u=``;l.forEach(e=>{let t=null;t=d.idAvaliacaoEditando&&e.id===document.getElementById(`nota-aluno`).value?c.find(e=>e.id===d.idAvaliacaoEditando):c.find(t=>t.idAluno===e.id&&t.data===i&&t.disciplina===n&&t.tipo===r);let o=t?t.nota:``,s=d.idAvaliacaoEditando&&t?`data-id-avaliacao="${t.id}"`:``;u+=`
            <tr style="border-bottom:1px solid #eee;" class="linha-nota" data-id="${e.id}" data-nome="${d.escapeHTML(e.nome)}" ${s}>
                <td style="padding:12px; font-weight:500;">${d.escapeHTML(e.nome)}</td>
                <td style="padding:12px; width:150px;">
                    <input type="number" class="valor-nota" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; text-align:center; font-weight:bold; color:var(--accent);" step="0.1" max="${a}" placeholder="0.0" value="${d.escapeHTML(o)}">
                </td>
            </tr>`}),o.innerHTML=(d.idAvaliacaoEditando?`<div style="background:#f39c12; color:#fff; padding:10px; text-align:center; font-weight:bold; margin-bottom:10px; border-radius:5px; animation: pop 0.3s;">⚠️ MODO DE EDIÇÃO ATIVO</div>`:``)+`
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #2980b9;">
                <div style="padding:15px; background:#e8f4f8; border-bottom:1px solid #d1e8f0; font-size:13px; color:#2980b9; display:flex; justify-content:space-between; align-items:center;">
                    <span><b>Lançamento:</b> ${d.escapeHTML(r)} de ${d.escapeHTML(n)}</span>
                    <span style="background:#2980b9; color:white; padding:4px 10px; border-radius:12px; font-weight:bold;">Máx: ${d.escapeHTML(a)} pts</span>
                </div>
                <div class="table-responsive-wrapper" style="margin:0; border:none;">
                    <table style="width:100%; border-collapse:collapse; min-width:400px;">
                        <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">ALUNO</th><th style="padding:15px; text-align:center;">NOTA OBTIDA</th></tr></thead>
                        <tbody>${u}</tbody>
                    </table>
                </div>
                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #eee; text-align:right;">
                    <button onclick="App.salvarNotasLote()" class="btn-primary">💾 SALVAR NOTAS NO BOLETIM</button>
                </div>
            </div>
        `}catch{o.innerHTML=`<p style="color:red; text-align:center;">Erro ao carregar a pauta.</p>`}},d.salvarNotasLote=async()=>{let e=document.getElementById(`nota-disc`).value,t=document.getElementById(`nota-tipo`).value;t===`Outro`&&(t=document.getElementById(`nota-outro-desc`).value||`Outro`);let n=document.getElementById(`nota-data`).value,r=document.getElementById(`nota-max`).value,i=document.getElementById(`nota-periodo`).value,a=document.querySelectorAll(`.linha-nota`);if(a.length===0)return;if(n>new Date().toISOString().split(`T`)[0])return d.showToast(`Bloqueado: Não é possível gravar notas com datas futuras.`,`error`);let o=document.querySelector(`button[onclick="App.salvarNotasLote()"]`),s=o.innerText;o.innerText=`A arquivar... ⏳`,o.disabled=!0,document.body.style.cursor=`wait`;try{let o=[],s=await d.api(`/avaliacoes?_t=${Date.now()}`);a.forEach(a=>{let c=a.getAttribute(`data-id`),l=a.getAttribute(`data-nome`),u=a.getAttribute(`data-id-avaliacao`),f=a.querySelector(`.valor-nota`).value;if(f===``)return;let p=null;p=u?s.find(e=>e.id===u):s.find(r=>r.idAluno===c&&r.data===n&&r.disciplina===e&&r.tipo===t);let m={idAluno:c,nomeAluno:l,disciplina:e,tipo:t,data:n,valorMax:r,nota:f,periodo:i,bimestre:i,dataLancamento:new Date().toISOString().split(`T`)[0]};p?o.push(d.api(`/avaliacoes/${p.id}`,`PUT`,{...p,nota:f,valorMax:r,data:n,disciplina:e,tipo:t,periodo:i,bimestre:i})):(m.id=Date.now().toString()+Math.floor(Math.random()*1e3),o.push(d.api(`/avaliacoes`,`POST`,m)))}),await Promise.all(o),d.showToast(`Pauta de notas arquivada com sucesso!`,`success`),d.cancelarEdicaoNota();let c=document.getElementById(`app-content`);c&&(c.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando avaliações... ⏳</p>`),await d.renderizarAvaliacoesPro()}catch{d.showToast(`Erro ao salvar as notas.`,`error`)}finally{o&&(o.innerText=s,o.disabled=!1),document.body.style.cursor=`default`}},d.excluirAvaliacao=e=>{d.confirmar(`Excluir Nota`,`Deseja mesmo excluir esta avaliação? Isto irá afetar o boletim do aluno.`,`Excluir`,`#e74c3c`,async()=>{await d.api(`/avaliacoes/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando avaliações... ⏳</p>`),await d.renderizarAvaliacoesPro()})},d.cachePedagogico={chamadas:null,alunos:null,turmas:null,planejamentos:null},d.renderizarChamadaPro=async()=>{d.setTitulo(`Controle de Presença`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar dados rapidamente... ⚡</p>`;try{let[t,n,r,i]=await Promise.all([d.api(`/alunos`),d.api(`/turmas`),d.api(`/chamadas?_t=${Date.now()}`),d.api(`/planejamentos?_t=${Date.now()}`)]);d.cachePedagogico.alunos=t,d.cachePedagogico.turmas=n,d.cachePedagogico.chamadas=Array.isArray(r)?r:[],d.cachePedagogico.planejamentos=i;let a=[...d.cachePedagogico.chamadas].sort((e,t)=>new Date(t.data)-new Date(e.data)),o=d.cachePedagogico.alunos.filter(e=>!e.status||e.status===`Ativo`),s=`<option value="">-- Turma Completa --</option>`+d.cachePedagogico.turmas.map(e=>`<option value="${d.escapeHTML(e.nome)}">${d.escapeHTML(e.nome)}</option>`).join(``),c=`<option value="">-- Aluno Específico --</option>`+o.map(e=>`<option value="${e.id}">${d.escapeHTML(e.nome)}</option>`).join(``),l=new Date().toISOString().split(`T`)[0],u=`
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${m(`Filtrar por Turma:`,`chamada-turma`,s)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${m(`Buscar Aluno Único:`,`chamada-aluno`,c)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;">
                ${p(`Data da Aula:`,`chamada-data`,`date`,l,`max="${l}"`)}
                ${p(`Duração (Ex: 01:30):`,`chamada-duracao`,`time`,`01:00`)}
                <button onclick="App.carregarListaChamada()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR CHAMADA</button>
                <button onclick="App.cancelarEdicaoChamada()" id="btn-cancel-chamada" style="height:41px; padding:0 20px; background:#95a5a6; color:white; border:none; border-radius:5px; display:none; cursor:pointer;">❌ Cancelar Edição</button>
            </div>
        `,f=`
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-chamada" placeholder="Pesquisar histórico..." oninput="App.filtrarTabela('input-busca-chamada', 'tabela-historico-chamadas')" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
            <div class="table-responsive-wrapper">
                <table id="tabela-historico-chamadas" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;">
                            <th style="padding:12px; border-bottom:2px solid #eee;">Data</th><th style="padding:12px; border-bottom:2px solid #eee;">Aluno</th><th style="padding:12px; border-bottom:2px solid #eee;">Status</th><th style="padding:12px; border-bottom:2px solid #eee;">Tempo</th><th style="padding:12px; border-bottom:2px solid #eee; text-align:right;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${a.length===0?`<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum registo encontrado.</td></tr>`:``}
                        ${a.map(e=>{let t=`#333`;return e.status===`Presença`?t=`green`:e.status===`Falta`?t=`red`:e.status===`Reposição`&&(t=`#2980b9`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:12px; color:#555;">${e.data.split(`-`).reverse().join(`/`)}</td><td style="padding:12px; font-weight:bold;">${d.escapeHTML(e.nomeAluno)}</td><td style="padding:12px; font-weight:bold; color:${t};">${d.escapeHTML(e.status)}</td><td style="padding:12px; color:#555;">${d.escapeHTML(e.duracao)}</td><td style="padding:12px; text-align:right;"><button onclick="App.editarLancamentoChamada('${e.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar">✏️</button><button onclick="App.excluirLancamentoChamada('${e.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button></td></tr>`}).join(``)}
                    </tbody>
                </table>
            </div>
        `;e.innerHTML=d.UI.card(`📝 Registo de Frequência`,``,u,`100%`)+`<div id="area-lista-chamada" style="margin-top:20px;"></div><div style="margin-top:20px;">`+d.UI.card(`Histórico Completo de Lançamentos`,``,f,`100%`)+`</div>`}catch{e.innerHTML=`Erro ao carregar módulo de chamada.`}},d.editarLancamentoChamada=async e=>{let t=d.cachePedagogico.chamadas.find(t=>String(t.id)===String(e));if(!t)return d.showToast(`Erro ao localizar o registo.`,`error`);document.getElementById(`chamada-aluno`).value=t.idAluno,document.getElementById(`chamada-turma`).value=``,document.getElementById(`chamada-data`).value=t.data,document.getElementById(`chamada-duracao`).value=t.duracao,document.getElementById(`btn-cancel-chamada`).style.display=`inline-block`,d.idChamadaEditando=e,d.carregarListaChamada(),document.querySelector(`.card`).scrollIntoView({behavior:`smooth`})},d.cancelarEdicaoChamada=()=>{d.idChamadaEditando=null,document.getElementById(`chamada-aluno`).value=``,document.getElementById(`btn-cancel-chamada`).style.display=`none`,document.getElementById(`area-lista-chamada`).innerHTML=``,d.showToast(`Modo de edição cancelado.`,`info`)},d.marcarTodosChamada=e=>{let t=document.querySelectorAll(`.status-chamada`);t.length!==0&&(t.forEach(t=>{t.value=e,e===`Falta`?t.style.color=`#e74c3c`:e===`Reposição`?t.style.color=`#f39c12`:e===`Presença`?t.style.color=`#27ae60`:t.style.color=`#333`}),d.showToast(`Lote aplicado: Todos como ${e}!`,`info`))},d.carregarListaChamada=async()=>{let e=document.getElementById(`chamada-turma`).value,t=document.getElementById(`chamada-aluno`).value,n=document.getElementById(`chamada-data`).value;if(!e&&!t)return d.showToast(`Selecione uma Turma OU um Aluno específico.`,`warning`);if(!n)return d.showToast(`Preencha a Data da aula.`,`warning`);if(n>new Date().toISOString().split(`T`)[0])return d.showToast(`Não é permitido abrir grelhas de frequência para datas futuras.`,`warning`);let r=document.getElementById(`area-lista-chamada`);r.innerHTML=`<p style="text-align:center; padding:20px;">A preparar diário de classe super rápido... ⚡</p>`;try{let i=d.cachePedagogico.alunos,a=d.cachePedagogico.chamadas,o=[];if(o=t?i.filter(e=>e.id===t):i.filter(t=>t.turma===e),o=o.filter(e=>!e.status||e.status===`Ativo`),o.length===0){r.innerHTML=`<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno ativo encontrado para este filtro.</p></div>`;return}let s=a.filter(e=>e.data===n),c=``;o.forEach(e=>{let t=null;t=d.idChamadaEditando&&e.id===document.getElementById(`chamada-aluno`).value?a.find(e=>String(e.id)===String(d.idChamadaEditando)):s.find(t=>t.idAluno===e.id);let n=t?t.status:`Presença`,r=d.idChamadaEditando&&t?`data-id-chamada="${t.id}"`:``;c+=`
            <tr style="border-bottom:1px solid #eee;" class="linha-chamada" data-id="${e.id}" data-nome="${d.escapeHTML(e.nome)}" ${r}>
                <td style="padding:12px; font-weight:500;">${d.escapeHTML(e.nome)}</td>
                <td style="padding:12px; width:250px;">
                    <select class="status-chamada" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; font-weight:bold; color:${n===`Falta`?`#e74c3c`:n===`Reposição`?`#f39c12`:`#27ae60`};" onchange="this.style.color = this.value==='Falta'?'#e74c3c': (this.value==='Reposição'?'#f39c12':'#27ae60')">
                        <option value="Presença" ${n===`Presença`?`selected`:``}>✅ Presença</option>
                        <option value="Falta" ${n===`Falta`?`selected`:``}>❌ Falta</option>
                        <option value="Reposição" ${n===`Reposição`?`selected`:``}>🔄 Reposição</option>
                        <option value="Falta Justificada" ${n===`Falta Justificada`?`selected`:``}>⚠️ Falta Justificada</option>
                        <option value="Feriado" ${n===`Feriado`?`selected`:``}>📅 Feriado</option>
                        <option value="Recesso" ${n===`Recesso`?`selected`:``}>🏖️ Recesso</option>
                    </select>
                </td>
            </tr>`});let l=d.idChamadaEditando?`<div style="background:#f39c12; color:#fff; padding:10px; text-align:center; font-weight:bold; margin-bottom:10px; border-radius:5px; animation: pop 0.3s;">⚠️ MODO DE EDIÇÃO ATIVO (A atualizar o registo existente)</div>`:``,u=d.idChamadaEditando?``:`
            <div style="padding:10px 15px; background:#fff; border-bottom:1px solid #eee; display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
                <span style="font-size:12px; color:#999; margin-top:8px; margin-right:auto;">Preenchimento Rápido em Lote:</span>
                <button onclick="App.marcarTodosChamada('Presença')" style="background:#eafaf1; color:#27ae60; border:1px solid #27ae60; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px; transition:0.2s;" onmouseover="this.style.background='#d5f5e3'" onmouseout="this.style.background='#eafaf1'">✅ Todos Presentes</button>
                <button onclick="App.marcarTodosChamada('Falta')" style="background:#fdf2f2; color:#e74c3c; border:1px solid #e74c3c; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px; transition:0.2s;" onmouseover="this.style.background='#fadbd8'" onmouseout="this.style.background='#fdf2f2'">❌ Todos Faltaram</button>
                <button onclick="App.marcarTodosChamada('Reposição')" style="background:#fef5e7; color:#f39c12; border:1px solid #f39c12; padding:6px 12px; border-radius:5px; cursor:pointer; font-weight:bold; font-size:12px; transition:0.2s;" onmouseover="this.style.background='#fdebd0'" onmouseout="this.style.background='#fef5e7'">🔄 Todas Reposições</button>
            </div>
        `;r.innerHTML=l+`
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #27ae60;">
                <div style="padding:15px; background:#eafaf1; border-bottom:1px solid #d5f5e3; font-size:13px; color:#27ae60; font-weight:bold;">
                    Grelha de Frequência - ${d.escapeHTML(n.split(`-`).reverse().join(`/`))}
                </div>
                ${u}
                <div class="table-responsive-wrapper" style="margin:0; border:none;">
                    <table style="width:100%; border-collapse:collapse; min-width:400px;">
                        <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">NOME DO ALUNO</th><th style="padding:15px; text-align:left;">STATUS DA AULA</th></tr></thead>
                        <tbody>${c}</tbody>
                    </table>
                </div>
                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #eee; text-align:right;">
                    <button onclick="App.salvarChamadaLote()" class="btn-primary" style="background:#27ae60; border-color:#27ae60; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);">💾 SALVAR FREQUÊNCIA</button>
                </div>
            </div>
        `}catch{r.innerHTML=`<p style="color:red; text-align:center;">Erro ao processar a lista.</p>`}},d.salvarChamadaLote=async()=>{let e=document.getElementById(`chamada-data`).value,t=document.getElementById(`chamada-duracao`).value||`01:00`,n=document.querySelectorAll(`.linha-chamada`);if(n.length===0)return;if(e>new Date().toISOString().split(`T`)[0])return d.showToast(`Bloqueado: Não é possível registar frequência em datas futuras.`,`error`);let r=document.querySelector(`button[onclick="App.salvarChamadaLote()"]`),i=r.innerText;r.innerText=`A arquivar instantaneamente... ⚡`,r.disabled=!0,document.body.style.cursor=`wait`;try{let a=d.cachePedagogico.planejamentos,o=d.cachePedagogico.chamadas,s=[],c=[],l=[],u=[...o];if(n.forEach(e=>{let t=e.getAttribute(`data-id`),n=e.getAttribute(`data-nome`);a.some(e=>e.idAluno===t&&e.status!==`Arquivado`)||s.push(n)}),s.length>0){d.showToast(`Bloqueado: Crie um Planejamento para: ${s.join(`, `)}`,`error`),r&&(r.innerText=i,r.disabled=!1),document.body.style.cursor=`default`;return}n.forEach(n=>{let r=n.getAttribute(`data-id`),i=n.getAttribute(`data-nome`),a=n.querySelector(`.status-chamada`).value,s=n.getAttribute(`data-id-chamada`);c.push(r);let f=null;f=s?o.find(e=>String(e.id)===String(s)):o.find(t=>String(t.idAluno)===String(r)&&t.data===e);let p={idAluno:r,nomeAluno:i,data:e,status:a,duracao:t};if(f){let n={...f,data:e,status:a,duracao:t};l.push(d.api(`/chamadas/${f.id}`,`PUT`,n));let r=u.findIndex(e=>String(e.id)===String(f.id));r!==-1&&(u[r]=n)}else p.id=Date.now().toString()+Math.floor(Math.random()*1e3)+r,l.push(d.api(`/chamadas`,`POST`,p)),u.push(p)}),await Promise.all(l);let f=``;try{let e=[];c.forEach(t=>{let n=a.find(e=>e.idAluno===t&&e.status!==`Arquivado`);n&&typeof d.processarAutoAjustePlano==`function`&&(n=d.processarAutoAjustePlano(n,u),e.push(d.api(`/planejamentos/${n.id}`,`PUT`,n)))}),e.length>0&&(await Promise.all(e),f=` e Planejamento(s) Auto-Ajustado(s)!`)}catch(e){console.log(`Aviso: Falha no auto-ajuste de fundo.`,e)}d.showToast(`Frequência registada em tempo recorde${f}`,`success`),d.cancelarEdicaoChamada();let p=document.getElementById(`app-content`);p&&(p.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando frequência... ⏳</p>`),await d.renderizarChamadaPro()}catch{d.showToast(`Erro ao guardar a chamada.`,`error`)}finally{r&&(r.innerText=i,r.disabled=!1),document.body.style.cursor=`default`}},d.excluirLancamentoChamada=e=>{d.confirmar(`Excluir Frequência`,`Tem a certeza que deseja excluir esta chamada do sistema?`,`Excluir`,`#e74c3c`,async()=>{await d.api(`/chamadas/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando frequência... ⏳</p>`),await d.renderizarChamadaPro()})},d.renderizarCalendarioPro=async()=>{d.setTitulo(`Calendário`);let e=document.getElementById(`app-content`);e.innerHTML=`A carregar calendário...`,d.calendarState||={month:new Date().getMonth(),year:new Date().getFullYear()};try{let t=await d.api(`/eventos?_t=${Date.now()}`),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`][d.calendarState.month],r=`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="App.mudarMes(-1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">◀</button>
                <h2 style="margin:0; color:#2c3e50; text-transform:uppercase; font-size:22px;">${n} ${d.calendarState.year}</h2>
                <button onclick="App.mudarMes(1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">▶</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: #7f8c8d; margin-bottom: 10px; font-size:12px; text-transform:uppercase;">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #eee; border: 1px solid #eee;">
                ${d.gerarDiasCalendario(d.calendarState.month,d.calendarState.year,t)}
            </div>
        `,i=`
            <div id="box-gerir-evento" style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span style="font-size:20px;">🗓️</span><h3 style="margin:0; color:#2c3e50;">Gerir Evento</h3></div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
                ${p(`Data:`,`evt-data`,`date`)}
                ${m(`Tipo:`,`evt-tipo`,`<option value="Evento">🟢 Evento</option><option value="Feriado">🔴 Feriado</option><option value="Prova">🔵 Prova</option><option value="Reunião">🟠 Reunião</option>`)}
                ${p(`Descrição:`,`evt-desc`,`text`,``,`placeholder="Ex: Prova de História / Carnaval" style="flex:3;"`)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; align-items: flex-end;">
                ${p(`Início:`,`evt-inicio`,`time`)}
                ${p(`Término:`,`evt-fim`,`time`)}
                <div style="flex: 1; min-width: 200px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="App.limparFormEvento()" style="background:#95a5a6; color:white; border:none; padding:12px 20px; border-radius:5px; cursor:pointer; flex: 1;">Cancelar</button>
                    <button onclick="App.salvarEvento()" style="background:#6c5ce7; color:white; border:none; padding:12px 20px; border-radius:5px; font-weight:bold; cursor:pointer; flex: 1;">Salvar</button>
                </div>
            </div>
        `,a=`
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
                    <thead><tr style="background:#f8f9fa; color:#7f8c8d; border-bottom:2px solid #eee;"><th style="padding:10px;">DIA</th><th style="padding:10px;">HORÁRIO</th><th style="padding:10px;">TIPO</th><th style="padding:10px;">DESCRIÇÃO</th><th style="padding:10px; text-align:right;">AÇÕES</th></tr></thead>
                    <tbody>${d.gerarListaEventosHTML(d.calendarState.month,d.calendarState.year,t)}</tbody>
                </table>
            </div>
        `;e.innerHTML=d.UI.card(``,``,r,`100%`)+`<div style="margin-top:20px;">`+d.UI.card(``,``,i,`100%`)+`</div><div style="margin-top:20px;">`+d.UI.card(`Lista de Eventos (${n})`,``,a,`100%`)+`</div>`,document.getElementById(`evt-data`).value=new Date().toISOString().split(`T`)[0]}catch{e.innerHTML=`Erro ao carregar calendário.`}},d.gerarDiasCalendario=(e,t,n)=>{let r=new Date(t,e,1).getDay(),i=new Date(t,e+1,0).getDate(),a=``;for(let e=0;e<r;e++)a+=`<div class="cal-day empty"></div>`;for(let r=1;r<=i;r++){let i=`${t}-${String(e+1).padStart(2,`0`)}-${String(r).padStart(2,`0`)}`,o=new Date,s=r===o.getDate()&&e===o.getMonth()&&t===o.getFullYear(),c=n.filter(e=>e.data===i).map(e=>`<div class="evt-pilula" style="--bg-cor: ${(f[e.tipo]||f.Evento).bg};" title="${d.escapeHTML(e.descricao)}"><span class="evt-texto">${d.escapeHTML(e.descricao)}</span></div>`).join(``);a+=`<div id="cal-day-${i}" class="cal-day ${s?`hoje`:``}" onclick="App.selecionarDia('${i}')"><div class="dia-num">${r}</div><div class="evt-container">${c}</div></div>`}return a},d.gerarListaEventosHTML=(e,t,n)=>{let r=n.filter(n=>{let r=new Date(n.data+`T00:00:00`);return r.getMonth()===e&&r.getFullYear()===t}).sort((e,t)=>new Date(e.data)-new Date(t.data));return r.length===0?`<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum evento.</td></tr>`:r.map(e=>`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; font-weight:bold;">${e.data.split(`-`)[2]}</td><td style="padding:10px;">${d.escapeHTML(e.inicio||`-`)}</td><td style="padding:10px; font-weight:bold; color:${(f[e.tipo]||f.Evento).bg}">${d.escapeHTML(e.tipo)}</td><td style="padding:10px;">${d.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:right;"><button onclick="App.preencherEdicaoEvento('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">✏️</button><button onclick="App.excluirEvento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️</button></td></tr>`).join(``)},d.mudarMes=e=>{d.calendarState.month+=e,d.calendarState.month>11?(d.calendarState.month=0,d.calendarState.year++):d.calendarState.month<0&&(d.calendarState.month=11,d.calendarState.year--),d.renderizarCalendarioPro()},d.selecionarDia=e=>{document.querySelectorAll(`.cal-day`).forEach(e=>e.style.border=`none`);let t=document.getElementById(`cal-day-${e}`);t&&(t.style.border=`2px solid #3498db`),document.getElementById(`evt-data`).value=e,document.getElementById(`evt-desc`).value=``,d.idEdicaoEvento=null,setTimeout(()=>{document.getElementById(`box-gerir-evento`).scrollIntoView({behavior:`smooth`,block:`start`}),document.getElementById(`evt-desc`).focus()},100)},d.salvarEvento=async()=>{document.activeElement&&document.activeElement.blur();let e={data:document.getElementById(`evt-data`).value,tipo:document.getElementById(`evt-tipo`).value,descricao:document.getElementById(`evt-desc`).value,inicio:document.getElementById(`evt-inicio`).value,fim:document.getElementById(`evt-fim`).value};if(!e.data||!e.descricao)return d.showToast(`Preencha data e descrição.`,`error`);let t=document.querySelector(`button[onclick="App.salvarEvento()"]`),n=t?t.innerText:`Salvar`;t&&(t.innerText=`A salvar... ⏳`,t.disabled=!0),document.body.style.cursor=`wait`;try{d.idEdicaoEvento?await d.api(`/eventos/${d.idEdicaoEvento}`,`PUT`,e):await d.api(`/eventos`,`POST`,e),d.idEdicaoEvento=null;let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando calendário... ⏳</p>`),await d.renderizarCalendarioPro(),setTimeout(()=>{let e=document.querySelector(`.table-responsive-wrapper`);e&&e.scrollIntoView({behavior:`smooth`,block:`end`})},100),d.showToast(`Evento salvo com sucesso!`,`success`)}catch{d.showToast(`Erro ao salvar evento.`,`error`)}finally{t&&(t.innerText=n,t.disabled=!1),document.body.style.cursor=`default`}},d.preencherEdicaoEvento=async e=>{let t=await d.api(`/eventos/${e}`);document.getElementById(`evt-data`).value=t.data,document.getElementById(`evt-tipo`).value=t.tipo,document.getElementById(`evt-desc`).value=t.descricao,document.getElementById(`evt-inicio`).value=t.inicio,document.getElementById(`evt-fim`).value=t.fim,d.idEdicaoEvento=e,document.getElementById(`box-gerir-evento`).scrollIntoView({behavior:`smooth`,block:`start`})},d.excluirEvento=e=>{d.confirmar(`Excluir Evento`,`Pretende remover este evento do calendário?`,`Excluir`,`#e74c3c`,async()=>{await d.api(`/eventos/${e}`,`DELETE`);let t=document.getElementById(`app-content`);t&&(t.innerHTML=`<p style="text-align:center; color:#666; padding:20px;">Atualizando calendário... ⏳</p>`),await d.renderizarCalendarioPro()})},d.limparFormEvento=()=>{document.getElementById(`evt-desc`).value=``,d.idEdicaoEvento=null},window.App=window.App||{};var h=window.App;h.renderizarRelatorioModulo=async e=>{if(e===`fin_detalhado`||e===`financeiro`){h.setTitulo(`Relatórios Financeiros`),h.renderizarSelecaoRelatorio();return}if(e===`dossie`){h.renderizarDossie();return}if(e===`ficha`){h.gerarFichaSetup();return}if(e===`documentos`){h.renderizarGeradorDocumentos();return}};var g=(e,t,n=`text`,r=``,i=``)=>`
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <input type="${n}" id="${t}" value="${r}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${i}>
    </div>`,_=(e,t,n,r=``)=>`
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${e}</label>
        <select id="${t}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${r}>${n}</select>
    </div>`,v=`
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
`;h.renderizarSelecaoRelatorio=async()=>{let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">A carregar períodos disponíveis... ⏳</p>`;try{let t=await h.api(`/financeiro`),n=new Set,r=new Date().getFullYear();n.add(r),n.add(r+1),t.forEach(e=>{if(e.vencimento){let t=parseInt(e.vencimento.split(`-`)[0]);isNaN(t)||n.add(t)}if(e.dataPagamento){let t=parseInt(e.dataPagamento.split(`-`)[0]);isNaN(t)||n.add(t)}});let i=Array.from(n).sort((e,t)=>t-e).map(e=>`<option value="${e}" ${e===r?`selected`:``}>${e}</option>`).join(``),a=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${t+1}" ${t===new Date().getMonth()?`selected`:``}>${e}</option>`).join(``),o=`
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <span style="font-size:24px;">🗓️</span><h2 style="margin:0; color:#2c3e50;">Selecionar Período</h2>
            </div>
            <p style="color:#666; margin-bottom:20px;">Selecione o ano base para emitir os relatórios financeiros.</p>
            
            ${_(`Selecione o Ano Base:`,`rel-ano`,i,`style="margin-bottom:25px; background:white; padding:12px; font-size:16px;"`)}
            
            <button onclick="App.gerarRelatorioAnual()" style="width:100%; padding:15px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(142,68,173,0.3);">
                📄 RELATÓRIO GERAL DO ANO TODO <span>➜</span>
            </button>
            
            <div style="text-align:center; margin:25px 0; color:#999; font-size:12px; font-weight:bold;">OU SELECIONE UM MÊS ESPECÍFICO</div>
            
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${_(`Mês:`,`rel-mes`,a,`style="background:white; padding:12px; min-width:200px;"`)}
                <button onclick="App.gerarRelatorioMensal()" style="flex:1; min-width:150px; background:#2980b9; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; height:43px; box-shadow:0 4px 10px rgba(41,128,185,0.3);">VER MÊS</button>
            </div>
        `;e.innerHTML=h.UI.card(``,``,o,`100%`)}catch(t){console.error(`Erro ao carregar anos para relatório:`,t),e.innerHTML=`<p style="color:red; text-align:center;">Erro ao ligar ao servidor para ler o histórico. Tente novamente.</p>`}},h.gerarRelatorioAnual=async()=>{let e=document.getElementById(`rel-ano`).value,t=document.getElementById(`app-content`);t.innerHTML=`<p style="text-align:center;">A gerar relatório anual...</p>`;try{let n=await h.api(`/financeiro`),r=await h.api(`/escola`)||{nome:`ESCOLA`,cnpj:``},i=r.foto?`<img src="${r.foto}" style="height:50px; object-fit:contain;">`:``,a=n.filter(t=>t.vencimento&&t.vencimento.startsWith(e)).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),o=e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0),s=a.reduce((e,t)=>e+(parseFloat(t.valor)||0),0),c=a.filter(e=>e.status===`Pago`).reduce((e,t)=>e+o(t),0),l=a.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),u=e=>e.toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`});t.innerHTML=`
            ${v}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR EXTRATO ANUAL</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${i}
                        <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${h.escapeHTML(r.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${h.escapeHTML(r.cnpj)}<br>Relatório Analítico Anual</div></div>
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
                            ${a.map(e=>{let t=e.status===`Pago`,n=t?`PAGO`:`ABERTO`;return t&&e.formaPagamento&&(n+=`<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${h.escapeHTML(e.formaPagamento)}${e.formaPagamento2?` / ${h.escapeHTML(e.formaPagamento2)}`:``}<br>Pago em: ${h.escapeHTML(e.dataPagamento?e.dataPagamento.split(`-`).reverse().join(`/`):``)}</span>`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${h.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="padding:10px;">${h.escapeHTML(e.alunoNome||`Não informado`)}</td><td style="padding:10px;">${h.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${t?`green`:`red`};">${n}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${t?u(o(e)):`-`}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${t?`-`:u(parseFloat(e.valor)||0)}</td></tr>`}).join(``)}
                        </tbody>
                        <tfoot>
                            <tr style="background:#f9f9f9; font-weight:bold; border-top:2px solid #333;"><td colspan="4" style="padding:15px; text-align:right;">SALDO FINAL:</td><td style="padding:15px; text-align:right; color:green; white-space:nowrap;">${u(c)}</td><td style="padding:15px; text-align:right; color:red; white-space:nowrap;">${u(l)}</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>`}catch{h.showToast(`Erro ao gerar relatório.`,`error`)}},h.gerarRelatorioMensal=async()=>{let e=document.getElementById(`rel-ano`).value,t=parseInt(document.getElementById(`rel-mes`).value),n=document.getElementById(`app-content`);n.innerHTML=`<p style="text-align:center;">A gerar relatório mensal...</p>`;let r=[`JANEIRO`,`FEVEREIRO`,`MARÇO`,`ABRIL`,`MAIO`,`JUNHO`,`JULHO`,`AGOSTO`,`SETEMBRO`,`OUTUBRO`,`NOVEMBRO`,`DEZEMBRO`][t-1];try{let i=await h.api(`/financeiro`),a=await h.api(`/escola`)||{nome:`ESCOLA`,cnpj:``},o=a.foto?`<img src="${a.foto}" style="height:50px; object-fit:contain;">`:``,s=i.filter(n=>{if(!n.vencimento)return!1;let r=new Date(n.vencimento+`T00:00:00`);return r.getFullYear()==e&&r.getMonth()+1==t}).sort((e,t)=>new Date(e.vencimento)-new Date(t.vencimento)),c=e=>parseFloat(e.valorPago1||e.valor||0)+parseFloat(e.valorPago2||0),l=s.reduce((e,t)=>e+(parseFloat(t.valor)||0),0),u=s.filter(e=>e.status===`Pago`).reduce((e,t)=>e+c(t),0),d=s.filter(e=>e.status!==`Pago`).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),f=e=>e.toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`});n.innerHTML=`
            ${v}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR MÊS</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:30px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${o}
                        <div><h3 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${h.escapeHTML(a.nome)}</h3><div style="font-size:11px; color:#666;">CNPJ: ${h.escapeHTML(a.cnpj)}</div></div>
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
                            ${s.map(e=>{let t=e.status===`Pago`,n=t?`PAGO`:`PENDENTE`;return t&&e.formaPagamento&&(n+=`<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${h.escapeHTML(e.formaPagamento)}${e.formaPagamento2?` / ${h.escapeHTML(e.formaPagamento2)}`:``}<br>Pago em: ${h.escapeHTML(e.dataPagamento?e.dataPagamento.split(`-`).reverse().join(`/`):``)}</span>`),`<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${h.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="padding:10px;">${h.escapeHTML(e.alunoNome||`Não informado`)}</td><td style="padding:10px;">${h.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${t?`green`:`red`};">${n}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${f(t?c(e):parseFloat(e.valor)||0)}</td></tr>`}).join(``)}
                        </tbody>
                    </table>
                </div>
            </div>`}catch{h.showToast(`Erro ao gerar relatório mensal.`,`error`)}},h.renderizarDossie=()=>{h.setTitulo(`Dossiê Executivo BI`);let e=document.getElementById(`app-content`),t=new Date().getFullYear(),n=new Date().getMonth()+1,r=`
        <div style="text-align:center;">
            <div style="font-size:48px; margin-bottom:15px;">📊</div>
            <h2 style="margin:0 0 10px 0; color:#2c3e50;">Dossiê Executivo (BI)</h2>
            <p style="color:#666; margin-bottom:25px;">Selecione o período de referência para gerar a análise profunda da sua escola.</p>
            
            <div style="display:flex; gap:15px; margin-bottom:25px; text-align:left; flex-wrap:wrap;">
                ${_(`Mês Vigente:`,`dossie-mes`,[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`].map((e,t)=>`<option value="${t+1}" ${t+1===n?`selected`:``}>${e}</option>`).join(``),`style="padding:12px;"`)}
                ${g(`Ano:`,`dossie-ano`,`number`,t,`style="padding:12px; text-align:center;"`)}
            </div>
            
            <button onclick="App.gerarDossie()" class="btn-primary" style="padding:15px; font-size:16px; width:100%; justify-content:center;">GERAR DOSSIÊ ➜</button>
        </div>
    `;e.innerHTML=h.UI.card(``,``,r,`500px`)},h.gerarDossie=async()=>{let e=document.getElementById(`dossie-ano`).value,t=parseInt(document.getElementById(`dossie-mes`).value),n=[`Janeiro`,`Fevereiro`,`Março`,`Abril`,`Maio`,`Junho`,`Julho`,`Agosto`,`Setembro`,`Outubro`,`Novembro`,`Dezembro`][t-1],r=document.getElementById(`app-content`);r.innerHTML=`<p style="text-align:center; padding:20px;">Processando Inteligência de Negócios... ⏳</p>`,document.body.style.cursor=`wait`;try{let[i,a,o,s,c]=await Promise.all([h.api(`/alunos`),h.api(`/turmas`),h.api(`/cursos`),h.api(`/financeiro`),h.api(`/escola`)]),l=new Date,u=e=>parseFloat(e||0).toLocaleString(`pt-BR`,{style:`currency`,currency:`BRL`}),d=e=>parseFloat(e.valorPago1||e.valor)+parseFloat(e.valorPago2||0),f=e=>e.descricao&&e.descricao.toLowerCase().includes(`venda`)||e.idCarne&&e.idCarne.includes(`VENDA`),p=s.filter(t=>t.vencimento&&t.vencimento.startsWith(e)&&t.tipo===`Receita`),m=p.filter(e=>parseInt(e.vencimento.split(`-`)[1])===t),g=p.filter(e=>e.status===`Pago`).reduce((e,t)=>e+d(t),0),_=p.filter(e=>!f(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),y=m.filter(e=>!f(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),b=s.filter(e=>e.status===`Pendente`&&e.tipo===`Receita`&&new Date(e.vencimento+`T00:00:00`)<l).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),x=m.filter(e=>e.status===`Pago`&&!f(e)).reduce((e,t)=>e+d(t),0),S=m.filter(e=>e.status===`Pago`&&f(e)).reduce((e,t)=>e+d(t),0),C=x+S,w={},T={};m.filter(e=>e.status===`Pago`).forEach(e=>{let t=f(e)?T:w,n=e.formaPagamento||`Outros`,r=e.formaPagamento2;t[n]=(t[n]||0)+parseFloat(e.valorPago1||e.valor),r&&(t[r]=(t[r]||0)+parseFloat(e.valorPago2||0))});let E=``,D=0;for(let e=1;e<=t;e++){let t=p.filter(t=>parseInt(t.vencimento.split(`-`)[1])===e&&t.status===`Pago`),n=t.filter(e=>!f(e)).reduce((e,t)=>e+d(t),0),r=t.filter(e=>f(e)).reduce((e,t)=>e+d(t),0),i=n+r;D+=i,E+=`<tr><td>${[`Jan`,`Fev`,`Mar`,`Abr`,`Mai`,`Jun`,`Jul`,`Ago`,`Set`,`Out`,`Nov`,`Dez`][e-1]}</td><td style="text-align:right; color:#2980b9; white-space:nowrap;">${u(n)}</td><td style="text-align:right; color:#8e44ad; white-space:nowrap;">${u(r)}</td><td style="text-align:right; font-weight:bold; white-space:nowrap;">${u(i)}</td></tr>`}let O={};a.forEach(e=>O[e.nome]=0);let k={};o.forEach(e=>k[e.nome]=0),i.forEach(e=>{e.turma&&O[e.turma]!==void 0&&O[e.turma]++,e.curso&&k[e.curso]!==void 0&&k[e.curso]++});let A=i.filter(e=>e.sexo===`Masculino`).length,j=i.filter(e=>e.sexo===`Feminino`).length,M=A+j||1,N=(A/M*100).toFixed(1),P=(j/M*100).toFixed(1),F=s.filter(e=>e.status===`Pendente`&&e.tipo===`Receita`&&new Date(e.vencimento+`T00:00:00`)<l),I=``;F.forEach(e=>{let t=e.cobradoZap?`<span style="color:#27ae60;font-weight:bold;">✅ Sim</span>`:`<span style="color:#e74c3c;font-weight:bold;">❌ Não</span>`;I+=`<tr><td>${h.escapeHTML(e.alunoNome||`Desconhecido`)}</td><td>${h.escapeHTML(e.descricao)}</td><td style="color:#c0392b; font-weight:bold; white-space:nowrap;">${u(parseFloat(e.valor))}</td><td style="white-space:nowrap;">${h.escapeHTML(e.vencimento.split(`-`).reverse().join(`/`))}</td><td style="text-align:center;">${t}</td></tr>`}),r.innerHTML=`
            ${v}
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
                        ${c.foto?`<img src="${c.foto}" style="height:50px; object-fit:contain;">`:``} <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${h.escapeHTML(c.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${h.escapeHTML(c.cnpj)}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:16px;">DOSSIÊ DE GESTÃO - ${n}/${e}</div>
                        <div style="font-size:11px; color:#666;">Emissão: ${l.toLocaleDateString(`pt-BR`)}</div>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <div class="d-kpi" style="border-bottom:3px solid #34495e;">
                        <div class="d-kpi-tit">Esperado do Ano<br>(Só Mensalidades)</div>
                        <div class="d-kpi-val" style="color:#34495e;">${u(_)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #f39c12;">
                        <div class="d-kpi-tit">Esperado no Mês Vigente<br>(Mensalidades)</div>
                        <div class="d-kpi-val" style="color:#f39c12;">${u(y)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #27ae60;">
                        <div class="d-kpi-tit">Entrada Bruta Ano<br>(Mensalidades + Vendas)</div>
                        <div class="d-kpi-val" style="color:#27ae60;">${u(g)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #3498db;">
                        <div class="d-kpi-tit">Entrada Mês Vigente<br>(Mensalidades + Vendas)</div>
                        <div class="d-kpi-val" style="color:#3498db;">${u(C)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #e74c3c;">
                        <div class="d-kpi-tit">Total Inadimplência<br>(Geral)</div>
                        <div class="d-kpi-val" style="color:#e74c3c;">${u(b)}</div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📊 Resultados Financeiros: ${n} / ${e}</h3>
                    <div class="flex-container">
                        <div class="flex-item">
                            <table class="d-table">
                                <tr><td><strong>Entradas em Mensalidades:</strong></td><td style="text-align:right; font-size:16px; color:#2980b9; font-weight:bold; white-space:nowrap;">${u(x)}</td></tr>
                                <tr><td><strong>Entradas em Vendas:</strong></td><td style="text-align:right; font-size:16px; color:#8e44ad; font-weight:bold; white-space:nowrap;">${u(S)}</td></tr>
                                <tr style="background:#f9f9f9;"><td><strong>TOTAL ARRECADADO NO MÊS:</strong></td><td style="text-align:right; font-size:18px; color:#27ae60; font-weight:bold; white-space:nowrap;">${u(C)}</td></tr>
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
                            <tbody>${E}</tbody>
                            <tfoot><tr style="background:#e8f6f3; font-weight:bold; font-size:13px;"><td colspan="3" style="text-align:right;">TOTAL BRUTO (JAN ATÉ ${n.toUpperCase()}):</td><td style="text-align:right; color:#27ae60; white-space:nowrap;">${u(D)}</td></tr></tfoot>
                        </table>
                    </div>
                </div>

                <div class="d-box">
                    <div class="flex-container">
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📚 Cursos (${o.length})</h3>
                            <div>${o.length?o.map(e=>`<div class="list-card"><span>${h.escapeHTML(e.nome)}</span><span class="badge-curso">${k[e.nome]||0} alunos</span></div>`).join(``):`<div style="color:#999; font-size:12px;">Nenhum curso.</div>`}</div>
                        </div>
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">🏫 Turmas (${a.length})</h3>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">${a.length?a.map(e=>`<div class="list-card" style="margin-bottom:0;"><span>${h.escapeHTML(e.nome)}</span><span class="badge-turma">${O[e.nome]||0} alunos</span></div>`).join(``):`<div style="color:#999; font-size:12px;">Nenhuma turma.</div>`}</div>
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
                            <div style="background:#ebf5fb; border-left:4px solid #3498db; padding:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👨 Masculino</div><div style="font-size:16px; font-weight:bold; color:#3498db;">${A}</div></div><div style="font-size:14px; color:#999; font-weight:bold;">${N}%</div></div>
                            <div style="background:#fdedec; border-left:4px solid #e74c3c; padding:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👩 Feminino</div><div style="font-size:16px; font-weight:bold; color:#e74c3c;">${j}</div></div><div style="font-size:14px; color:#999; font-weight:bold;">${P}%</div></div>
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
            </div>`,setTimeout(()=>{let e={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},cutout:`65%`},t=[`#3498db`,`#9b59b6`,`#f1c40f`,`#2ecc71`,`#e67e22`,`#95a5a6`];Object.keys(w).length>0&&document.getElementById(`grafMensalidade`)&&new Chart(document.getElementById(`grafMensalidade`),{type:`doughnut`,data:{labels:Object.keys(w),datasets:[{data:Object.values(w),backgroundColor:t,borderWidth:0}]},options:e}),Object.keys(T).length>0&&document.getElementById(`grafVenda`)&&new Chart(document.getElementById(`grafVenda`),{type:`doughnut`,data:{labels:Object.keys(T),datasets:[{data:Object.values(T),backgroundColor:t,borderWidth:0}]},options:e}),i.length>0&&document.getElementById(`grafDemografia`)&&new Chart(document.getElementById(`grafDemografia`),{type:`doughnut`,data:{labels:[`Masculino`,`Feminino`],datasets:[{data:[A,j],backgroundColor:[`#3498db`,`#e74c3c`],borderWidth:0}]},options:e})},300)}catch{h.showToast(`Erro ao gerar dossiê.`,`error`)}finally{document.body.style.cursor=`default`}},h.gerarFichaSetup=async()=>{h.setTitulo(`Ficha de Matrícula`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center;">Carregando...</p>`;try{let t=`
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${_(`Selecione o Aluno:`,`ficha-aluno`,`<option value="">-- Selecione o Aluno --</option>`+(await h.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`).map(e=>`<option value="${e.id}">${h.escapeHTML(e.nome)}</option>`).join(``))}
                <button onclick="App.gerarFichaImprimir()" class="btn-primary" style="height:41px; padding:0 25px; margin-bottom:5px;">GERAR FICHA</button>
            </div>
        `;e.innerHTML=h.UI.card(`📄 Imprimir Ficha de Matrícula`,``,t,`100%`)+`<div id="ficha-area" style="margin-top:30px;"></div>`}catch{e.innerHTML=`Erro ao carregar os alunos.`}},h.gerarFichaImprimir=async()=>{let e=document.getElementById(`ficha-aluno`).value;if(!e)return h.showToast(`Por favor, selecione um aluno.`,`warning`);let t=document.getElementById(`ficha-area`);t.innerHTML=`<p style="text-align:center;">Gerando ficha... ⏳</p>`,document.body.style.cursor=`wait`;try{let[n,r,i,a]=await Promise.all([h.api(`/alunos`),h.api(`/escola`),h.api(`/financeiro`),h.api(`/turmas`)]),o=n.find(t=>t.id===e)||{},s=r.foto?`<img src="${r.foto}" style="height:60px; object-fit:contain;">`:``,c=a.find(e=>e.nome===o.turma)||{dia:`-`,horario:`-`},l=i.filter(t=>t.idAluno===e&&t.tipo===`Receita`),u=e=>e.descricao&&e.descricao.toLowerCase().includes(`venda`)||e.idCarne&&e.idCarne.includes(`VENDA`),d=l.filter(e=>!u(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),f=l.filter(e=>u(e)).reduce((e,t)=>e+(parseFloat(t.valor)||0),0),p=d+f,m=e=>`R$ ${e.toLocaleString(`pt-BR`,{minimumFractionDigits:2})}`,g=``;o.resp_nome&&o.resp_nome.trim()!==``&&(g=`
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#d35400; font-size:15px;">👤 DADOS DO RESPONSÁVEL LEGAL (Menor de Idade)</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px; background:#fff3e0; padding:15px; border-radius:5px; border:1px dashed #e67e22;">
                    <div><b>Nome do Responsável:</b> ${h.escapeHTML(o.resp_nome)}</div>
                    <div><b>Grau Parentesco:</b> ${h.escapeHTML(o.resp_parentesco||`-`)}</div>
                    <div><b>CPF do Respons.:</b> ${h.escapeHTML(o.resp_cpf||`-`)}</div>
                    <div><b>WhatsApp:</b> ${h.escapeHTML(o.resp_zap||`-`)}</div>
                </div>
            `),t.innerHTML=`
            ${v}
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR FICHA</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${s}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${h.escapeHTML(r.nome)}</h2><div style="font-size:12px;">CNPJ: ${h.escapeHTML(r.cnpj)}</div></div></div>
                    <div style="text-align:right;"><div><b>FICHA DE MATRÍCULA</b></div><div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleDateString(`pt-BR`)}</div></div>
                </div>
                <div style="border: 1px solid #ccc; padding: 20px; margin-top: 20px; background:#fafafa;">
                    
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; color:#2c3e50; font-size:15px;">1. DADOS DO ALUNO</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px;">
                        <div><b>Nome:</b> ${h.escapeHTML(o.nome||`-`)}</div>
                        <div><b>Data Nasc:</b> ${h.escapeHTML(o.nascimento?o.nascimento.split(`-`).reverse().join(`/`):`-`)}</div>
                        <div><b>CPF:</b> ${h.escapeHTML(o.cpf||`-`)}</div>
                        <div><b>RG:</b> ${h.escapeHTML(o.rg||`-`)}</div>
                        <div><b>Sexo:</b> ${h.escapeHTML(o.sexo||`-`)}</div>
                        <div><b>WhatsApp:</b> ${h.escapeHTML(o.whatsapp||`-`)}</div>
                    </div>

                    ${g}

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#2c3e50; font-size:15px;">2. CURSO E MATRÍCULA</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 10px; font-size:13px;">
                        <div><b>Curso:</b> ${h.escapeHTML(o.curso||`-`)}</div>
                        <div><b>Turma:</b> ${h.escapeHTML(o.turma||`-`)}</div>
                        <div><b>Dias de Aula:</b> ${h.escapeHTML(c.dia||`-`)}</div>
                        <div><b>Horário:</b> ${h.escapeHTML(c.horario||`-`)}</div>
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
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px;">
                        <div style="grid-column: 1 / -1;"><b>Logradouro:</b> ${h.escapeHTML(o.rua||`-`)}, ${h.escapeHTML(o.numero||`-`)}</div>
                        <div><b>Bairro:</b> ${h.escapeHTML(o.bairro||`-`)}</div>
                        <div><b>Cidade/UF:</b> ${h.escapeHTML(o.cidade||`-`)}/${h.escapeHTML(o.estado||`-`)}</div>
                    </div>
                </div>
                <div style="margin-top:50px; display:flex; justify-content:space-between; text-align:center; flex-wrap:wrap; gap:30px;">
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Assinatura do Aluno${o.resp_nome?` / Responsável Legal`:``}</div>
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Direção da Escola</div>
                </div>
            </div>
        `}catch{h.showToast(`Erro ao gerar ficha. O aluno não foi encontrado.`,`error`)}finally{document.body.style.cursor=`default`}},h.renderizarGeradorDocumentos=async()=>{h.setTitulo(`Gerador de Documentos`);let e=document.getElementById(`app-content`);e.innerHTML=`<p style="text-align:center; padding:20px; color:#666;">Carregando base de alunos...</p>`;try{let t=(await h.api(`/alunos`)).filter(e=>!e.status||e.status===`Ativo`);e.innerHTML=`
            <div class="card" style="max-width: 700px; margin: 0 auto; border-top: 4px solid var(--accent);">
                <h3 style="color:var(--card-text); margin-top:0; border-bottom:1px solid #eee; padding-bottom:15px; display:flex; align-items:center; gap:10px; font-size:18px;">
                    🎓 Emissão de Documentos Oficiais
                </h3>
                <p style="font-size:13px; color:#666; margin-bottom:25px;">O sistema irá preencher os dados automaticamente para impressão profissional.</p>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">1. Selecione o Aluno:</label>
                            <select id="doc-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">${t.length>0?`<option value="">-- Selecione o Aluno --</option>`+t.map(e=>`<option value="${e.id}">${h.escapeHTML(e.nome)} (Turma: ${h.escapeHTML(e.turma||`-`)})</option>`).join(``):`<option value="">Nenhum aluno ativo encontrado</option>`}</select>
                        </div>
                        
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">2. Qual documento deseja emitir?</label>
                            <select id="doc-tipo" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">
                                <option value="declaracao">📝 Declaração de Matrícula / Frequência</option>
                                <option value="contrato">📄 Contrato de Prestação de Serviços</option>
                                <option value="certificado">🎓 Certificado de Conclusão de Curso (Diploma)</option>
                            </select>
                        </div>
                    </div>

                    <div style="background:#f9f9f9; padding:15px; border-radius:5px; border:1px dashed #ccc; display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:120px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Carga Horária (Horas):</label>
                            <input type="number" id="doc-carga" value="40" placeholder="Ex: 40" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold;">
                        </div>
                        <div style="flex:1; min-width:140px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Início:</label>
                            <input type="date" id="doc-data-inicio" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                        <div style="flex:1; min-width:140px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Conclusão:</label>
                            <input type="date" id="doc-data-fim" value="${new Date().toISOString().split(`T`)[0]}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:14px; box-shadow:0 4px 10px rgba(52, 152, 219, 0.3); justify-content:center;" onclick="App.gerarDocumentoPrint()">🖨️ GERAR DOCUMENTO</button>
                </div>
            </div>
            
            <div id="doc-area" style="margin-top: 30px;"></div>
        `}catch{e.innerHTML=`<p>Erro ao carregar dados.</p>`}},h.gerarDocumentoPrint=async()=>{let e=document.getElementById(`doc-aluno`).value,t=document.getElementById(`doc-tipo`).value,n=document.getElementById(`doc-carga`),r=n?n.value:`40`,i=document.getElementById(`doc-data-inicio`),a=i&&i.value?i.value.split(`-`).reverse().join(`/`):`-`,o=document.getElementById(`doc-data-fim`),s=new Date().toLocaleDateString(`pt-BR`),c=o&&o.value?o.value.split(`-`).reverse().join(`/`):s;if(!e)return h.showToast(`Selecione um aluno na lista.`,`warning`);let l=document.querySelector(`button[onclick="App.gerarDocumentoPrint()"]`),u=l.innerText;l.innerText=`A Processar... ⏳`,l.disabled=!0,document.body.style.cursor=`wait`;try{let n=(await h.api(`/alunos`)).find(t=>t.id===e)||{},i=await h.api(`/escola`)||{nome:`A INSTITUIÇÃO`,cnpj:`00.000.000/0000-00`},o=i.endereco?`${i.endereco}, ${i.numero||`S/N`} - ${i.bairro||``}. ${i.cidade||``}-${i.estado||``} | CEP: ${i.cep||``}`:``,l=document.getElementById(`doc-area`);l.innerHTML=`<p style="text-align:center;">Gerando Layout... ⏳</p>`;let u=`
            <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:30px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; align-items:center; gap:20px;">${i.foto?`<img src="${i.foto}" style="height:60px; object-fit:contain;">`:``}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${h.escapeHTML(i.nome)}</h2><div style="font-size:12px; color:#555;">CNPJ: ${h.escapeHTML(i.cnpj)}<br>${h.escapeHTML(o)}</div></div></div>
                <div style="text-align:right;"><div><b>${t===`contrato`?`CONTRATO DE SERVIÇOS`:`DECLARAÇÃO`}</b></div><div style="font-size:10px; color:#999;">Emissão: ${s}</div></div>
            </div>`,d=`
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR ESTE DOCUMENTO</button>
            </div>
        `;if(t===`contrato`){let e=parseFloat(n.valorMensalidade||0).toLocaleString(`pt-BR`,{minimumFractionDigits:2});l.innerHTML=`
                ${v}
                ${d}
                <div class="print-sheet" style="font-family: Arial, sans-serif; color: #000; line-height: 1.6;">
                    ${u}
                    
                    <p style="text-align: justify; margin-top: 20px; font-size:14px;">
                        Pelo presente instrumento particular, de um lado <b>${h.escapeHTML(i.nome||`A INSTITUIÇÃO`)}</b>, 
                        inscrita no CNPJ sob o nº <b>${h.escapeHTML(i.cnpj||`00.000.000/0000-00`)}</b>, doravante denominada <b>CONTRATADA</b>, e de outro lado 
                        <b>${h.escapeHTML(n.nome)}</b>, portador(a) do CPF nº <b>${h.escapeHTML(n.cpf||`___________`)}</b> e RG nº <b>${h.escapeHTML(n.rg||`___________`)}</b>, 
                        residente e domiciliado(a) na ${h.escapeHTML(n.rua||``)}, ${h.escapeHTML(n.numero||``)} - ${h.escapeHTML(n.bairro||``)}, 
                        ${h.escapeHTML(n.cidade||``)}/${h.escapeHTML(n.estado||``)}, doravante denominado(a) <b>CONTRATANTE</b>.
                    </p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">O presente contrato tem como objeto a prestação de serviços educacionais por parte da CONTRATADA ao CONTRATANTE, referente ao curso de <b>${h.escapeHTML(n.curso||`Não especificado`)}</b>, com carga horária de <b>${r} horas</b>, a ser ministrado na turma <b>${h.escapeHTML(n.turma||`Não especificada`)}</b>.</p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA SEGUNDA - DOS VALORES E FORMA DE PAGAMENTO</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">Pelos serviços educacionais prestados, o CONTRATANTE pagará à CONTRATADA a mensalidade no valor estipulado de <b>R$ ${e}</b>, com vencimento programado para todo dia <b>${h.escapeHTML(n.diaVencimento||`10`)}</b> de cada mês. O atraso no pagamento sujeitará o CONTRATANTE a multas e juros moratórios conforme a legislação vigente.</p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA TERCEIRA - DAS RESPONSABILIDADES</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">É responsabilidade do CONTRATANTE zelar pelo patrimônio da instituição, além de manter o mínimo de 75% de frequência nas aulas para ter direito ao certificado de conclusão. A CONTRATADA compromete-se a fornecer o material pedagógico e o corpo docente adequado para o perfeito desenvolvimento das aulas.</p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA QUARTA - DISPOSIÇÕES GERAIS</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">Este contrato tem validade a partir da data de sua assinatura. As partes elegem o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, renunciando a qualquer outro, por mais privilegiado que seja.</p>
                    
                    <p style="text-align: right; margin-top: 50px; font-size:14px;">Local e Data: ____________________________, ${s}</p>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 60px; text-align: center; flex-wrap:wrap; gap:30px;">
                        <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 10px; font-size:12px;">
                            <b>${h.escapeHTML(i.nome||`A INSTITUIÇÃO`)}</b><br>CONTRATADA
                        </div>
                        <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 10px; font-size:12px;">
                            <b>${h.escapeHTML(n.nome)}</b><br>CONTRATANTE
                        </div>
                    </div>
                </div>
            `;let t=document.createElement(`style`);t.innerHTML=`@media print { @page { size: A4 portrait; margin: 15mm; } }`,l.appendChild(t)}else if(t===`declaracao`){l.innerHTML=`
                ${v}
                ${d}
                <div class="print-sheet" style="font-family: Arial, sans-serif; color: #000; min-height: 297mm; display:flex; flex-direction:column;">
                    ${u}
                    
                    <h2 style="text-align: center; margin-top: 40px; margin-bottom: 40px; text-transform: uppercase;">Declaração de Matrícula</h2>
                    
                    <p style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 30px;">
                        Declaramos para os devidos fins que <b>${h.escapeHTML(n.nome)}</b>, inscrito(a) no CPF sob o nº <b>${h.escapeHTML(n.cpf||`___________`)}</b>, 
                        encontra-se regularmente matriculado(a) e frequentando o curso de <b>${h.escapeHTML(n.curso||`Não especificado`)}</b> 
                        (Turma: ${h.escapeHTML(n.turma||`Não especificada`)}) nesta instituição de ensino.
                    </p>
                    
                    <p style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 60px;">
                        Esta declaração é emitida a pedido do(a) interessado(a) para que produza os seus efeitos legais.
                    </p>
                    
                    <p style="text-align: right; font-size: 14px; margin-bottom: 80px;">
                        Local e Data: ____________________________, ${s}.
                    </p>
                    
                    <div style="width: 100%; max-width: 400px; margin: auto auto 0 auto; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 14px;">
                        <b>A Direção / Secretaria</b><br>
                        ${h.escapeHTML(i.nome)}
                    </div>
                </div>
            `;let e=document.createElement(`style`);e.innerHTML=`@media print { @page { size: A4 portrait; margin: 15mm; } }`,l.appendChild(e)}else if(t===`certificado`){let e=i.foto?`<img src="${i.foto}" style="max-height:100px; max-width:150px; object-fit:contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1));">`:`<div style="font-size:16px; font-weight:bold; color:#2c3e50; border:2px solid #2c3e50; padding:15px; border-radius:50%; display:flex; align-items:center; justify-content:center; width:80px; height:80px;">SELO</div>`;l.innerHTML=`
                ${v}
                ${d}
                
                <style>
                    @media print {
                        @page { size: A4 landscape; margin: 0; }
                        body { background: #fff !important; margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .no-print { display: none !important; }
                        
                        /* A print-sheet agora utiliza flexbox para garantir que a caixa fica 100% no meio da folha impressa */
                        .print-sheet { margin: 0 auto !important; padding: 0 !important; box-shadow: none !important; background:transparent !important; border:none !important; max-width: 100% !important; width: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; height: 100vh !important;}
                        
                        /* Garante que o scroll no modo de ecrã não afeta o modo de impressão */
                        .scroll-wrapper { overflow: visible !important; padding: 0 !important; }
                    }
                    
                    /* O WRAPPER DO SCROLL: Permite rolar horizontalmente se o ecrã for pequeno */
                    .scroll-wrapper {
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 20px;
                    }
                    
                    /* A SOLUÇÃO DEFINITIVA: 260x180 garante que os roletes de tração não cortam o design */
                    .cert-box {
                        font-family: 'Times New Roman', serif;
                        color: #000;
                        text-align: center;
                        border: 12px solid #2c3e50;
                        outline: 3px solid #d4af37;
                        outline-offset: -6px;
                        background: #fff;
                        width: 260mm;     /* 📏 LARGURA ULTRA-SEGURA PARA A4 PAISAGEM */
                        height: 180mm;    /* 📏 ALTURA ULTRA-SEGURA PARA A4 PAISAGEM */
                        margin: auto;
                        padding: 30px 40px;
                        box-sizing: border-box; 
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        position: relative;
                        page-break-inside: avoid;
                    }
                </style>
                
                <div class="scroll-wrapper">
                    <div class="print-sheet">
                        <div class="cert-box">
                            
                            <h1 style="font-size: 40px; color: #2c3e50; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 4px;">Certificado de Conclusão</h1>
                            <p style="font-size: 20px; color: #555; margin-bottom: 20px; font-style: italic;">Certificamos para os devidos fins que</p>
                            
                            <h2 style="font-size: 34px; color: #b71c1c; margin: 0 auto 20px auto; border-bottom: 2px solid #ccc; display: inline-block; padding: 0 40px; font-family: Arial, sans-serif;">
                                ${h.escapeHTML(n.nome)}
                            </h2>
                            
                            <p style="font-size: 19px; color: #333; max-width: 900px; margin: 0 auto; line-height: 1.8; text-align: justify; text-align-last: center;">
                                portador(a) do CPF nº <b>${h.escapeHTML(n.cpf||`Não informado`)}</b>, concluiu com êxito todos os requisitos acadêmicos do curso de <b>${h.escapeHTML(n.curso||`Não especificado`)}</b>, iniciado em <b>${a}</b> e finalizado em <b>${c}</b>, com carga horária total de <b>${r} horas</b> e aproveitamento plenamente satisfatório.
                            </p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 15px; margin-bottom: 15px;">
                                
                                <div style="flex:1; border-top: 1px solid #000; padding-top: 5px; margin: 0 10px; font-size: 15px;">
                                    <b>A Direção</b><br>
                                    <span style="font-size: 12px; color: #555;">${h.escapeHTML(i.nome||`Instituição`)}</span>
                                </div>
                                
                                <div style="flex:1; display:flex; justify-content:center; align-items:center;">
                                    ${e}
                                </div>
                                
                                <div style="flex:1; border-top: 1px solid #000; padding-top: 5px; margin: 0 10px; font-size: 15px;">
                                    <b>Aluno(a) Titular</b><br>
                                    <span style="font-size: 12px; color: #555;">${h.escapeHTML(n.nome)}</span>
                                </div>
                                
                            </div>
                            
                            <div style="position: absolute; bottom: 10px; left: 0; right: 0; font-size: 10px; color: #777; text-align: center; line-height: 1.4;">
                                <div style="margin-bottom: 2px;">O presente documento é amparado legalmente pela Lei nº 9.394/96 (Diretrizes e Bases da Educação Nacional) e pelo Decreto nº 5.154/04.</div>
                                <div>Documento Oficial. Emitido por ${h.escapeHTML(i.nome||`Instituição de Ensino`)} (CNPJ: ${h.escapeHTML(i.cnpj||`Não informado`)}) em ${s}.</div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            `}}catch{h.showToast(`Erro ao gerar o documento.`,`error`)}finally{l.innerText=u,l.disabled=!1,document.body.style.cursor=`default`}};