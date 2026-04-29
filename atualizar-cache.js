const fs = require('fs');
const path = require('path');

// Como o robô agora está na mesma pasta, o caminho é direto!
const indexPath = path.join(__dirname, 'index.html');
const swPath = path.join(__dirname, 'sw.js');

try {
    const novaVersao = Math.floor(Date.now() / 1000); 

    // ATUALIZAR O INDEX.HTML
    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        html = html.replace(/\?v=\d+/g, `?v=${novaVersao}`);
        fs.writeFileSync(indexPath, html);
        console.log(`✅ [HTML] index.html atualizado para ?v=${novaVersao}`);
    } else {
        console.log(`⚠️ Aviso: index.html não encontrado.`);
    }

    // ATUALIZAR O SERVICE WORKER
    if (fs.existsSync(swPath)) {
        let sw = fs.readFileSync(swPath, 'utf8');
        sw = sw.replace(/const VERSION = '.*?';/g, `const VERSION = 'v${novaVersao}';`);
        sw = sw.replace(/\?v=\d+/g, `?v=${novaVersao}`);
        fs.writeFileSync(swPath, sw);
        console.log(`✅ [PWA] sw.js atualizado para a versão v${novaVersao}`);
    } else {
        console.log(`⚠️ Aviso: sw.js não encontrado.`);
    }

    console.log("🚀 [SUCESSO] Cache Busting concluído!");

} catch (error) {
    console.error("❌ [ERRO] Falha ao atualizar o cache:", error.message);
}