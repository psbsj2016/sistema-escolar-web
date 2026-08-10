// js/modulos/workspace/upload.js
window.Workspace = window.Workspace || {};

Workspace.Upload = {
    arquivosAtuais: [], 
    // 🚀 LIMITES GIGANTES: Vídeos agora suportam até 1GB (1024MB)!
    limiteTamanhoMB: { video: 1024, pdf: 500, imagem: 10, documento: 500 },

    init: () => {
        console.log("📎 Motor de Uploads Inteligentes (Multi-Cloud) iniciado.");
        Workspace.Upload.injetarInputInvisivel();
    },

    // ============================================================================
    // 🚀 O NOVO CÉREBRO: Decide se envia para Cloudflare (Direto) ou Cloudinary
    // ============================================================================
   enviarFicheiroInteligente: async (file) => {
        const nomeOriginal = file.name || `ficheiro_${Date.now()}`;
        const extensao = nomeOriginal.split('.').pop().toLowerCase();
        
        const ehDocumento = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip'].includes(extensao);
        
        // 🚀 A MÁGICA ACONTECE AQUI: Detetamos se é um vídeo!
        const ehVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'].includes(extensao) || file.type.startsWith('video/');

        // Se for Documento OU VÍDEO, usamos a Via Verde (Direto para a Cloudflare)
        if (ehDocumento || ehVideo) {
            // 🟢 ROTA 1: VIA VERDE (Ignora o servidor Render e evita crashes)
            const resLink = await Workspace.api('/workspace/upload/solicitar-link', 'POST', {
                nomeFicheiro: nomeOriginal,
                tipoFicheiro: file.type || (ehVideo ? 'video/mp4' : 'application/octet-stream')
            });

            if (!resLink || !resLink.success) throw new Error("Falha ao gerar Bilhete VIP.");

            // Envia DIRETAMENTE para a Cloudflare
            const uploadDir = await fetch(resLink.urlUpload, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type || (ehVideo ? 'video/mp4' : 'application/octet-stream') }
            });

            if (!uploadDir.ok) throw new Error("Falha na transferência direta para a nuvem.");

            return { url: resLink.urlPublica, nome: nomeOriginal, tipo: file.type || (ehVideo ? 'video/mp4' : 'documento') };
        } else {
            // 🔵 ROTA 2: CLOUDINARY (Imagens continuam a ir via Node.js para compressão)
            const formData = new FormData();
            formData.append('anexos', file);
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos) throw new Error("Falha na fábrica multimédia.");
            return uploadData.anexos[0]; 
        }
    },

    // Processa dezenas de ficheiros ao mesmo tempo de forma super rápida
    enviarMultiplosFicheiros: async (filesArray) => {
        const promessas = filesArray.map(f => Workspace.Upload.enviarFicheiroInteligente(f));
        return await Promise.all(promessas);
    },

    // (O resto do seu código manteve-se idêntico e blindado)
    injetarInputInvisivel: () => {
        const boxCriar = document.getElementById('ws-criar-post');
        if (!boxCriar) return;

        const btnAnexar = document.getElementById('ws-btn-anexar');
        if (btnAnexar) {
            const inputFicheiro = document.createElement('input');
            inputFicheiro.type = 'file';
            inputFicheiro.multiple = true;
            inputFicheiro.accept = 'image/*,video/mp4,video/webm,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
            inputFicheiro.style.display = 'none';
            inputFicheiro.id = 'ws-input-upload';

            const areaPreview = document.createElement('div');
            areaPreview.id = 'ws-upload-preview';
            areaPreview.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; margin-top: 10px;';
            
            boxCriar.insertBefore(areaPreview, boxCriar.querySelector('div[style*="display: flex; justify-content: space-between"]'));
            boxCriar.appendChild(inputFicheiro);

            const dispararUploadNativamente = (e) => { e.preventDefault(); inputFicheiro.click(); };
            btnAnexar.addEventListener('click', dispararUploadNativamente);
            btnAnexar.addEventListener('touchstart', dispararUploadNativamente, { passive: false });
            inputFicheiro.addEventListener('change', Workspace.Upload.processarFicheiros);
        }
    },

    processarFicheiros: (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            const tipo = file.type.split('/')[0];
            const extensao = file.name.split('.').pop().toLowerCase();
            const tamanhoMB = file.size / (1024 * 1024);

            let limiteRecomendado = Workspace.Upload.limiteTamanhoMB.documento;
            
            // 🚀 Aplica a nossa balança inteligente de pesos (Tornou-se mais precisa)
            if (tipo === 'video' || ['mp4', 'mov', 'webm', 'mkv', 'm4v'].includes(extensao)) {
                limiteRecomendado = Workspace.Upload.limiteTamanhoMB.video;
            } else if (tipo === 'image') {
                limiteRecomendado = Workspace.Upload.limiteTamanhoMB.imagem;
            } else if (extensao === 'pdf') {
                limiteRecomendado = Workspace.Upload.limiteTamanhoMB.pdf;
            }

            if (tamanhoMB > limiteRecomendado) {
                if (Workspace.mostrarAviso) Workspace.mostrarAviso(`O ficheiro ${file.name} excede o limite máximo de ${limiteRecomendado}MB.`, "error", 5000);
                return;
            }
            Workspace.Upload.arquivosAtuais.push(file);
        });

        Workspace.Upload.renderizarPreview();
        event.target.value = ''; 
    },

    renderizarPreview: () => {
        const area = document.getElementById('ws-upload-preview');
        if (!area) return;
        area.innerHTML = Workspace.Upload.arquivosAtuais.map((file, index) => {
            const tipo = file.type.split('/')[0];
            let icone = '📄'; if (tipo === 'image') icone = '🖼️'; if (tipo === 'video') icone = '🎥'; if (file.type.includes('pdf')) icone = '📕';
            return `<div style="background: #f0f2f5; border: 1px solid #ddd; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; max-width: 150px;"><span style="font-size: 16px;">${icone}</span><span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${file.name}</span><span style="cursor: pointer; color: #e74c3c; font-weight: bold; padding: 0 5px;" onclick="Workspace.Upload.removerAnexo(${index})" title="Remover">×</span></div>`;
        }).join('');
    },

    removerAnexo: (index) => { Workspace.Upload.arquivosAtuais.splice(index, 1); Workspace.Upload.renderizarPreview(); },
    limparAnexos: () => { Workspace.Upload.arquivosAtuais = []; Workspace.Upload.renderizarPreview(); }
};