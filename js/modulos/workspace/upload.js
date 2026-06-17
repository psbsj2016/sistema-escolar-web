// js/modulos/workspace/upload.js
window.Workspace = window.Workspace || {};

Workspace.Upload = {
    arquivosAtuais: [], // Guarda os ficheiros prontos a enviar
    limiteTamanhoMB: { video: 50, pdf: 15, imagem: 10, documento: 10 },

    init: () => {
        console.log("📎 Motor de Uploads iniciado.");
        Workspace.Upload.injetarInputInvisivel();
    },

    injetarInputInvisivel: () => {
        const boxCriar = document.getElementById('ws-criar-post');
        if (!boxCriar) return;

        // Procura o botão de anexar que criámos no HTML
        const btnAnexar = Array.from(boxCriar.querySelectorAll('button')).find(b => b.innerText.includes('Anexar Ficheiro'));
        
        if (btnAnexar) {
            // Cria um input de ficheiro invisível
            const inputFicheiro = document.createElement('input');
            inputFicheiro.type = 'file';
            inputFicheiro.multiple = true;
            inputFicheiro.accept = 'image/*,video/mp4,video/webm,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
            inputFicheiro.style.display = 'none';
            inputFicheiro.id = 'ws-input-upload';

            // Adiciona a área de pré-visualização (onde os ícones vão aparecer)
            const areaPreview = document.createElement('div');
            areaPreview.id = 'ws-upload-preview';
            areaPreview.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; margin-top: 10px;';
            
            boxCriar.insertBefore(areaPreview, boxCriar.querySelector('div[style*="display: flex; justify-content: space-between"]'));
            boxCriar.appendChild(inputFicheiro);

            // Quando clica no botão, aciona o input invisível
            btnAnexar.addEventListener('click', () => inputFicheiro.click());
            
            // Quando escolhe um ficheiro, processa
            inputFicheiro.addEventListener('change', Workspace.Upload.processarFicheiros);
        }
    },

    processarFicheiros: (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            // 1. Validação de Segurança e Tamanho
            const tipo = file.type.split('/')[0];
            const extensao = file.name.split('.').pop().toLowerCase();
            const tamanhoMB = file.size / (1024 * 1024);

            let limiteRecomendado = Workspace.Upload.limiteTamanhoMB.documento;
            if (tipo === 'video') limiteRecomendado = Workspace.Upload.limiteTamanhoMB.video;
            else if (tipo === 'image') limiteRecomendado = Workspace.Upload.limiteTamanhoMB.imagem;
            else if (extensao === 'pdf') limiteRecomendado = Workspace.Upload.limiteTamanhoMB.pdf;

            if (tamanhoMB > limiteRecomendado) {
                if (window.App && App.showToast) App.showToast(`O ficheiro ${file.name} é demasiado grande (Máx: ${limiteRecomendado}MB).`, "error");
                return;
            }

            // 2. Guardar em memória
            Workspace.Upload.arquivosAtuais.push(file);
        });

        Workspace.Upload.renderizarPreview();
        event.target.value = ''; // Reseta o input para permitir selecionar o mesmo ficheiro novamente se for apagado
    },

    renderizarPreview: () => {
        const area = document.getElementById('ws-upload-preview');
        if (!area) return;

        area.innerHTML = Workspace.Upload.arquivosAtuais.map((file, index) => {
            const tipo = file.type.split('/')[0];
            let icone = '📄';
            if (tipo === 'image') icone = '🖼️';
            if (tipo === 'video') icone = '🎥';
            if (file.type.includes('pdf')) icone = '📕';

            return `
                <div style="background: #f0f2f5; border: 1px solid #ddd; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; max-width: 150px;">
                    <span style="font-size: 16px;">${icone}</span>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${file.name}</span>
                    <span style="cursor: pointer; color: #e74c3c; font-weight: bold; padding: 0 5px;" onclick="Workspace.Upload.removerAnexo(${index})" title="Remover">×</span>
                </div>
            `;
        }).join('');
    },

    removerAnexo: (index) => {
        Workspace.Upload.arquivosAtuais.splice(index, 1);
        Workspace.Upload.renderizarPreview();
    },

    limparAnexos: () => {
        Workspace.Upload.arquivosAtuais = [];
        Workspace.Upload.renderizarPreview();
    }
};