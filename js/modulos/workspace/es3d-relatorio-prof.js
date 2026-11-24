// js/modulos/workspace/es3d-relatorio-prof.js
// 📊 Etapa 9: Relatório Pedagógico da Cidade 3D & English Spaces para Professores e Gestores

window.Workspace = window.Workspace || {};

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function formatarDataHora(isoOuMs) {
  if (!isoOuMs) return '—';
  const d = new Date(isoOuMs);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
         d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export const ES3DRelatorioProf = {
  _dadosCache: null,
  _filtroTurma: 'TODAS',
  _busca: '',
  _alunoExpandidoId: null,

  ehProfessorOuGestor() {
    const tipo = String(window.Workspace?.usuario?.tipo || '').trim();
    return tipo === 'Professor' || tipo === 'Gestor';
  },

  async abrirRelatorio() {
    if (!this.ehProfessorOuGestor()) {
      window.Workspace?.mostrarAviso?.('🔒 Acesso restrito a Professores e Gestores.', 'warning', 2800);
      return;
    }

    document.getElementById('es-teacher-report-modal')?.remove();

    const htmlLoading = `
      <div id="es-teacher-report-modal" style="position:fixed; inset:0; z-index:1000280; background:rgba(5,7,14,0.88); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div id="es-teacher-report-card" style="background:linear-gradient(160deg,#0f172a 0%,#131a33 100%); border:2px solid rgba(139,92,246,0.55); border-radius:24px; padding:22px; width:100%; max-width:960px; max-height:90dvh; display:flex; flex-direction:column; gap:14px; color:#f8fafc; box-shadow:0 28px 80px rgba(0,0,0,0.82); overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <div>
              <h2 style="margin:0; font-size:20px; color:#fde047; font-weight:900;">📊 Relatório Pedagógico — English Spaces 3D</h2>
              <div style="font-size:12px; color:#94a3b8; margin-top:2px;">Diagnóstico de fala em inglês, missões, passaporte e correções do Coach IA</div>
            </div>
            <button type="button" id="es-rep-close" style="background:#1e293b; color:#cbd5e1; border:none; width:36px; height:36px; border-radius:50%; font-weight:900; font-size:16px; cursor:pointer;">✕</button>
          </div>
          <div id="es-rep-body" style="flex:1; overflow-y:auto; padding-right:4px; text-align:center; padding-top:40px; color:#94a3b8;">
            <div style="font-size:34px; margin-bottom:8px;">⏳</div>
            Carregando métricas pedagógicas da turma...
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', htmlLoading);

    document.getElementById('es-rep-close')?.addEventListener('click', () => this.fecharRelatorio());
    document.getElementById('es-teacher-report-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'es-teacher-report-modal') this.fecharRelatorio();
    });

    await this.carregarDadosServidor();
  },

  fecharRelatorio() {
    document.getElementById('es-teacher-report-modal')?.remove();
    this._alunoExpandidoId = null;
  },

  async carregarDadosServidor() {
    const escolaId = window.Workspace?.usuario?.escolaId || 'DEFAULT';
    const bodyEl = document.getElementById('es-rep-body');
    if (!bodyEl) return;

    try {
      const res = await fetch(
        `/api/workspace/english-spaces/teacher/report?escolaId=${encodeURIComponent(escolaId)}&_t=${Date.now()}`,
        { credentials: 'include' }
      ).then(r => r.json());

      if (!res || !res.success) {
        bodyEl.innerHTML = `<div style="padding:32px; color:#f87171; font-weight:700;">Não foi possível carregar o relatório agora. Tente novamente.</div>`;
        return;
      }

      this._dadosCache = res;
      this._filtroTurma = 'TODAS';
      this._busca = '';
      this._alunoExpandidoId = null;
      this.renderizarConteudo();
    } catch (e) {
      bodyEl.innerHTML = `<div style="padding:32px; color:#f87171; font-weight:700;">Erro de conexão ao consultar o servidor.</div>`;
    }
  },

  obterAlunosFiltrados() {
    const lista = Array.isArray(this._dadosCache?.students) ? this._dadosCache.students : [];
    const q = String(this._busca || '').toLowerCase().trim();
    const turma = this._filtroTurma || 'TODAS';

    return lista.filter(st => {
      const matchTurma = turma === 'TODAS' || (st.turma || 'Sem turma') === turma;
      const matchBusca = !q ||
        String(st.nome || '').toLowerCase().includes(q) ||
        String(st.turma || '').toLowerCase().includes(q) ||
        String(st.rank || '').toLowerCase().includes(q);
      return matchTurma && matchBusca;
    });
  },

  renderizarConteudo() {
    const bodyEl = document.getElementById('es-rep-body');
    const dados = this._dadosCache;
    if (!bodyEl || !dados) return;

    const resumo = dados.summary || {};
    const turmas = Array.isArray(dados.turmas) ? dados.turmas : [];
    const topDicas = Array.isArray(dados.topGrammarTips) ? dados.topGrammarTips : [];
    const alunos = this.obterAlunosFiltrados();

    bodyEl.style.textAlign = 'left';
    bodyEl.style.paddingTop = '0';

    bodyEl.innerHTML = `
      <!-- KPIs Gerais -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:10px; margin-bottom:14px;">
        <div style="background:rgba(59,130,246,0.14); border:1px solid rgba(96,165,250,0.4); border-radius:14px; padding:12px 14px;">
          <div style="font-size:11px; color:#93c5fd; font-weight:800;">👥 ALUNOS ATIVOS</div>
          <div style="font-size:24px; font-weight:900; color:#fff; margin-top:4px;">${resumo.totalStudents || 0}</div>
        </div>
        <div style="background:rgba(16,185,129,0.14); border:1px solid rgba(52,211,153,0.4); border-radius:14px; padding:12px 14px;">
          <div style="font-size:11px; color:#6ee7b7; font-weight:800;">🗣️ FRASES EM INGLÊS</div>
          <div style="font-size:24px; font-weight:900; color:#fff; margin-top:4px;">${resumo.totalSpokenTurns || 0}</div>
        </div>
        <div style="background:rgba(168,85,247,0.14); border:1px solid rgba(192,132,252,0.4); border-radius:14px; padding:12px 14px;">
          <div style="font-size:11px; color:#d8b4fe; font-weight:800;">🛂 SELOS &amp; MISSÕES</div>
          <div style="font-size:24px; font-weight:900; color:#fff; margin-top:4px;">${resumo.totalStamps || 0} <span style="font-size:12px; color:#c4b5fd;">selos • ${resumo.totalMissions || 0} missões</span></div>
        </div>
        <div style="background:rgba(245,158,11,0.14); border:1px solid rgba(251,191,36,0.4); border-radius:14px; padding:12px 14px;">
          <div style="font-size:11px; color:#fde047; font-weight:800;">🛵 ENTREGAS &amp; DESAFIOS</div>
          <div style="font-size:24px; font-weight:900; color:#fff; margin-top:4px;">${(resumo.totalDeliveries || 0) + (resumo.totalHouseTours || 0) + (resumo.totalFlashWins || 0)}</div>
        </div>
      </div>

      <!-- Barra de Ações e Filtros -->
      <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:14px;">
        <input type="text" id="es-rep-search" value="${escapeHtml(this._busca)}" placeholder="🔍 Buscar aluno ou patente..." style="flex:1; min-width:180px; background:#1e293b; border:1px solid #334155; border-radius:10px; padding:9px 12px; color:#fff; font-size:12.5px; outline:none;" />
        <select id="es-rep-turma" style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:9px 12px; color:#fff; font-size:12.5px; font-weight:700; outline:none;">
          <option value="TODAS" ${this._filtroTurma === 'TODAS' ? 'selected' : ''}>🏫 Todas as Turmas</option>
          ${turmas.map(t => `<option value="${escapeHtml(t)}" ${this._filtroTurma === t ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}
        </select>
        <button type="button" id="es-rep-ai-plan" style="background:linear-gradient(135deg,#8b5cf6,#ec4899); color:#fff; border:none; border-radius:10px; padding:9px 13px; font-size:12px; font-weight:800; cursor:pointer;">🤖 Sugerir Aula de Revisão (IA)</button>
        <button type="button" id="es-rep-csv" style="background:#10b981; color:#fff; border:none; border-radius:10px; padding:9px 13px; font-size:12px; font-weight:800; cursor:pointer;">📥 Exportar CSV</button>
        <button type="button" id="es-rep-refresh" style="background:#334155; color:#e2e8f0; border:none; border-radius:10px; padding:9px 12px; font-size:12px; font-weight:800; cursor:pointer;">🔄</button>
      </div>

      <!-- Slot do Plano de Revisão gerado pela IA -->
      <div id="es-rep-ai-slot" style="display:none; background:rgba(139,92,246,0.14); border:1.5px solid #a855f7; border-radius:14px; padding:14px; margin-bottom:14px; font-size:13px; line-height:1.55; color:#f3e8ff;"></div>

      <!-- Pontos de Atenção Gramatical da Turma -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); border-radius:14px; padding:12px 14px; margin-bottom:14px;">
        <div style="font-size:12px; font-weight:900; color:#fde047; margin-bottom:8px;">💡 Dicas &amp; Correções Recorrentes do Coach IA na Turma (${topDicas.length})</div>
        ${topDicas.length === 0 ? `
          <div style="font-size:12px; color:#94a3b8;">Ainda não há correções gramaticais registradas. Assim que os alunos conversarem com os NPCs na Cidade 3D ou nos cenários 2D, os padrões de erro aparecerão aqui.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:6px; max-height:140px; overflow-y:auto;">
            ${topDicas.slice(0, 12).map(d => `
              <div style="background:#1e293b; border-left:3px solid #f59e0b; border-radius:8px; padding:7px 10px; font-size:12px; display:flex; justify-content:space-between; gap:10px; align-items:center;">
                <span style="color:#f1f5f9;">${escapeHtml(d.tip)}</span>
                <span style="color:#94a3b8; font-size:10.5px; white-space:nowrap; font-weight:700;">${d.count > 1 ? `${d.count}x • ` : ''}${escapeHtml(d.zone || 'city')}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Tabela de Alunos com Dossiê Clicável -->
      <div style="font-size:12px; font-weight:900; color:#93c5fd; margin-bottom:8px;">🎓 Desempenho Individual (${alunos.length} alunos) — clique em um aluno para ver as frases faladas</div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${alunos.length === 0 ? `
          <div style="text-align:center; padding:26px; background:#1e293b; border-radius:14px; color:#94a3b8; font-size:13px;">Nenhum aluno encontrado com esse filtro.</div>
        ` : alunos.map(st => {
          const aberto = this._alunoExpandidoId === st.userId;
          const falas = Array.isArray(st.recentUtterances) ? st.recentUtterances : [];
          const dicas = Array.isArray(st.grammarTips) ? st.grammarTips : [];
          return `
            <div style="background:#1e293b; border:1px solid ${aberto ? '#60a5fa' : '#334155'}; border-radius:14px; overflow:hidden;">
              <button type="button" data-toggle-student="${escapeHtml(st.userId)}" style="width:100%; background:transparent; border:none; color:#f8fafc; padding:12px 14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; text-align:left;">
                <div style="min-width:180px;">
                  <div style="font-size:13.5px; font-weight:900; color:#fff;">${escapeHtml(st.nome)} <span style="font-size:11px; color:#94a3b8; font-weight:700;">(${escapeHtml(st.turma || 'Sem turma')})</span></div>
                  <div style="font-size:11px; color:#93c5fd; margin-top:2px;">${escapeHtml(st.rank)} • Último acesso: ${formatarDataHora(st.lastActivity)}</div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:11.5px; font-weight:800;">
                  <span style="background:rgba(16,185,129,0.16); color:#6ee7b7; padding:4px 9px; border-radius:999px;">🗣️ ${st.spokenTurns}</span>
                  <span style="background:rgba(168,85,247,0.16); color:#d8b4fe; padding:4px 9px; border-radius:999px;">🛂 ${st.stampsCount}/24</span>
                  <span style="background:rgba(56,189,248,0.16); color:#7dd3fc; padding:4px 9px; border-radius:999px;">🛵 ${st.deliveriesDone}</span>
                  <span style="background:rgba(250,204,21,0.16); color:#fde047; padding:4px 9px; border-radius:999px;">💎 ${(st.dovryx || 0).toLocaleString('pt-BR')}</span>
                  <span style="color:#94a3b8;">${aberto ? '▲' : '▼'}</span>
                </div>
              </button>

              ${aberto ? `
                <div style="border-top:1px solid #334155; padding:12px 14px; background:#0f172a; display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
                  <div>
                    <div style="font-size:11.5px; font-weight:900; color:#6ee7b7; margin-bottom:6px;">🗣️ Frases Produzidas em Inglês (${falas.length})</div>
                    ${falas.length === 0 ? `<div style="font-size:11.5px; color:#64748b;">Nenhuma frase registrada ainda.</div>` : `
                      <div style="display:flex; flex-direction:column; gap:5px; max-height:180px; overflow-y:auto;">
                        ${falas.map(f => `
                          <div style="background:#1e293b; border-radius:8px; padding:7px 9px; font-size:11.5px;">
                            <div style="color:#f8fafc; font-weight:700;">"${escapeHtml(f.text)}"</div>
                            <div style="color:#94a3b8; font-size:10px; margin-top:2px;">📍 ${escapeHtml(f.spaceId || 'city')} • ${escapeHtml(f.source || '3D')} • ${formatarDataHora(f.at)}</div>
                          </div>
                        `).join('')}
                      </div>
                    `}
                  </div>
                  <div>
                    <div style="font-size:11.5px; font-weight:900; color:#fde047; margin-bottom:6px;">💡 Dicas de Gramática Recebidas (${dicas.length})</div>
                    ${dicas.length === 0 ? `<div style="font-size:11.5px; color:#64748b;">Nenhuma correção pendente para este aluno.</div>` : `
                      <div style="display:flex; flex-direction:column; gap:5px; max-height:180px; overflow-y:auto;">
                        ${dicas.map(d => `
                          <div style="background:#1e293b; border-left:3px solid #f59e0b; border-radius:8px; padding:7px 9px; font-size:11.5px;">
                            <div style="color:#fef08a;">${escapeHtml(d.tip)}</div>
                            <div style="color:#94a3b8; font-size:10px; margin-top:2px;">📍 ${escapeHtml(d.zone || 'city')} • ${formatarDataHora(d.at)}</div>
                          </div>
                        `).join('')}
                      </div>
                    `}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Listeners
    const searchInp = bodyEl.querySelector('#es-rep-search');
    searchInp?.addEventListener('input', (e) => {
      this._busca = e.target.value;
      const pos = e.target.selectionStart;
      this.renderizarConteudo();
      const novo = document.getElementById('es-rep-search');
      if (novo) { novo.focus(); novo.setSelectionRange(pos, pos); }
    });

    bodyEl.querySelector('#es-rep-turma')?.addEventListener('change', (e) => {
      this._filtroTurma = e.target.value;
      this.renderizarConteudo();
    });

    bodyEl.querySelector('#es-rep-refresh')?.addEventListener('click', () => this.carregarDadosServidor());
    bodyEl.querySelector('#es-rep-csv')?.addEventListener('click', () => this.exportarCSV());
    bodyEl.querySelector('#es-rep-ai-plan')?.addEventListener('click', () => this.gerarPlanoRevisaoIA());

    bodyEl.querySelectorAll('[data-toggle-student]').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.toggleStudent;
        this._alunoExpandidoId = this._alunoExpandidoId === uid ? null : uid;
        this.renderizarConteudo();
      });
    });
  },

  async gerarPlanoRevisaoIA() {
    const slot = document.getElementById('es-rep-ai-slot');
    const btn = document.getElementById('es-rep-ai-plan');
    if (!slot || !this._dadosCache) return;

    const alunos = this.obterAlunosFiltrados();
    const dicas = (this._dadosCache.topGrammarTips || []).slice(0, 12).map(d => `- ${d.tip}`).join('\n');
    const falasAmostra = alunos.flatMap(a => (a.recentUtterances || []).slice(0, 2).map(u => `"${u.text}" (${u.spaceId})`)).slice(0, 10).join('; ');

    slot.style.display = 'block';
    slot.innerHTML = '⏳ Analisando os dados da turma com a IA para montar sugestões para sua próxima aula...';
    if (btn) btn.disabled = true;

    try {
      const prompt = `Você é um coordenador pedagógico de inglês analisando o relatório da turma (${this._filtroTurma}) no jogo 3D English Spaces.
Alunos filtrados: ${alunos.length}.
Principais dicas/erros gramaticais registrados pela IA:
${dicas || 'Sem erros gramaticais críticos registrados ainda.'}
Amostra de frases produzidas pelos alunos: ${falasAmostra || 'Sem amostras ainda.'}

Escreva em PORTUGUÊS um diagnóstico super objetivo em 3 tópicos curtos:
1. Ponto forte da turma;
2. Principal ponto gramatical ou de vocabulário para revisar na próxima aula;
3. Uma atividade prática rápida (5 min) usando a Cidade 3D para corrigir esse ponto.`;

      const res = await window.Workspace.api('/workspace/ingles/ia-teste/groq', 'POST', { mensagem: prompt, historico: [] });
      if (res && res.success && res.resposta) {
        slot.innerHTML = `<div style="font-weight:900; color:#e9d5ff; margin-bottom:6px;">🤖 Diagnóstico Pedagógico da Turma (${escapeHtml(this._filtroTurma)}):</div><div style="white-space:pre-line;">${escapeHtml(res.resposta)}</div>`;
      } else {
        slot.innerHTML = '⚠️ Não foi possível gerar o diagnóstico agora. Tente novamente em instantes.';
      }
    } catch (e) {
      slot.innerHTML = '⚠️ Falha de comunicação com a IA.';
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  exportarCSV() {
    const alunos = this.obterAlunosFiltrados();
    if (!alunos.length) {
      window.Workspace?.mostrarAviso?.('Nenhum aluno na lista para exportar.', 'warning', 2400);
      return;
    }

    const cabecalho = ['Aluno', 'Turma', 'Patente', 'Frases em Ingles', 'Selos Passaporte (de 24)', 'Missoes 2D', 'Entregas por Voz', 'House Tours', 'Flash Quizzes', 'Dicas Gramaticais', 'Saldo DRX', 'Ultima Atividade'];
    const linhas = alunos.map(st => [
      st.nome,
      st.turma || 'Sem turma',
      st.rank,
      st.spokenTurns || 0,
      st.stampsCount || 0,
      st.missions2D || 0,
      st.deliveriesDone || 0,
      st.houseToursDone || 0,
      st.flashEventsWon || 0,
      (st.grammarTips || []).length,
      st.dovryx || 0,
      formatarDataHora(st.lastActivity)
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'));

    const csv = '\uFEFF' + [cabecalho.join(';'), ...linhas].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-english-spaces-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

window.Workspace.ES3DRelatorioProf = ES3DRelatorioProf;