// js/modulos/workspace/sidebar.js
window.Workspace = window.Workspace || {};

Workspace.Sidebar = {
    init: async () => {
        console.log("📊 Motor das Barras Laterais iniciado.");
        await Workspace.Sidebar.carregarTurmas();
        await Workspace.Sidebar.carregarTarefas();
    },

    carregarTurmas: async () => {
        const container = document.getElementById('ws-lista-turmas');
        if (!container) return;

        container.innerHTML = '<p style="color:#999; font-size:12px; text-align:center;">A procurar turmas... ⏳</p>';

        try {
            // Vai ao sistema principal buscar as turmas da escola!
            const turmas = await Workspace.api('/turmas', 'GET');
            
            if (!turmas || turmas.error || turmas.length === 0) {
                container.innerHTML = '<p style="color:#999; font-size:13px; text-align:center;">Nenhuma turma encontrada.</p>';
                return;
            }

            let html = '';
            turmas.forEach(t => {
                html += `
                    <div style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; background: #f8f9fa; border: 1px solid #e9ecef;" onmouseover="this.style.background='#eef2f5'" onmouseout="this.style.background='#f8f9fa'">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 32px; height: 32px; border-radius: 8px; background: #3498db; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);">🏫</div>
                            <span style="font-weight: 600; color: #2c3e50; font-size: 13px;">${t.nome}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<p style="color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar turmas.</p>';
        }
    },

    carregarTarefas: async () => {
        const container = document.getElementById('ws-tarefas-pendentes');
        if (!container) return;

        container.innerHTML = '<p style="color:#999; font-size:12px; text-align:center;">A procurar agenda... ⏳</p>';

        try {
            // Vai ao calendário Pedagógico buscar as Provas e Eventos
            const eventos = await Workspace.api('/eventos', 'GET');
            
            if (!eventos || eventos.error || eventos.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: #7f8c8d; text-align:center;">Nenhuma atividade pendente.</p>';
                return;
            }

            // Pega na data de hoje à meia-noite
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            // Filtra só os eventos que ainda não passaram e pega os 4 mais próximos
            const proximos = eventos
                .filter(e => new Date(e.data) >= hoje)
                .sort((a, b) => new Date(a.data) - new Date(b.data))
                .slice(0, 4);

            if(proximos.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: #7f8c8d; text-align:center;">Nenhuma atividade futura.</p>';
                return;
            }

            let html = '';
            proximos.forEach(ev => {
                // Decide a cor da borda com base no tipo de evento
                let cor = '#3498db'; // Azul padrão (Provas)
                if(ev.tipo === 'Feriado') cor = '#e74c3c';
                if(ev.tipo === 'Evento') cor = '#2ecc71';
                if(ev.tipo === 'Reunião') cor = '#f39c12';

                // Formata a data (Ex: "15 de Out")
                const dataFormatada = new Date(ev.data).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
                
                html += `
                    <div style="background: #fff; border-left: 4px solid ${cor}; padding: 12px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); margin-bottom: 12px; transition: 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                        <div style="font-weight: 700; font-size: 13px; color: #2c3e50; margin-bottom: 6px; line-height: 1.3;">${ev.descricao || ev.tipo}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 10px; color: #7f8c8d; background: #f0f2f5; padding: 3px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${ev.tipo}</span>
                            <span style="font-size: 11px; color: ${cor}; font-weight: bold;">📅 ${dataFormatada}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;

        } catch(e) {
            container.innerHTML = '<p style="color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar agenda.</p>';
        }
    }
};