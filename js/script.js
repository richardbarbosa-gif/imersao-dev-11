document.addEventListener('DOMContentLoaded', () => {
    
    /* --- MENU MOBILE --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    /* --- EFEITO 3D --- */
    const elementos3D = document.querySelectorAll('.img-efeito, .card-tilt');
    elementos3D.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const intensidade = el.classList.contains('card-tilt') ? 10 : 15;
            const xRotation = -((y - rect.height / 2) / rect.height * intensidade);
            const yRotation = ((x - rect.width / 2) / rect.width * intensidade);
            el.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
            el.style.transition = 'none';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            el.style.transition = 'transform 0.5s ease';
        });
    });

    /* --- CARREGAR ARSENAL (JSON) --- */
    const containerArsenal = document.getElementById('container-arsenal');
    if (containerArsenal) {
        const dadosArsenal = [
            { "titulo": "Pato Debugador", "descricao": "Seu consultor sênior silencioso.", "icone": "pest_control" },
            { "titulo": "Combustível Líquido", "descricao": "Café para transformar em código.", "icone": "local_cafe" },
            { "titulo": "Skins de Notebook", "descricao": "Stickers porque falta alma no HTML sem CSS.", "icone": "sticky_note_2" },
            { "titulo": "Grimório do Código", "descricao": "E-book de boas práticas e semântica.", "icone": "menu_book" }
        ];
        containerArsenal.innerHTML = "";
        dadosArsenal.forEach(item => {
            containerArsenal.innerHTML += `
                <div class="item-arsenal img-efeito">
                    <div class="circulo-icone"><span class="material-symbols-outlined">${item.icone}</span></div>
                    <h3>${item.titulo}</h3>
                    <p>${item.descricao}</p>
                </div>`;
        });
    }

    /* ==================================================
       4. ORÁCULO INTELIGENTE (AUTO-DETECTA O MODELO)
       ================================================== */
    const btnOraculo = document.getElementById('btn-oraculo');
    const caixaResposta = document.getElementById('resposta-ia');
    const apiKey = (typeof CONFIG !== 'undefined') ? CONFIG.API_KEY : '';

    if (btnOraculo) {
        btnOraculo.addEventListener('click', async () => {
            if (!apiKey) {
                caixaResposta.innerHTML = "Erro: Chave não configurada em js/config.js";
                return;
            }

            // 1. Mostra que está "pensando"
            btnOraculo.classList.add('rodando');
            btnOraculo.innerHTML = '<span class="material-symbols-outlined">sync</span> Buscando modelo...';
            caixaResposta.innerHTML = '<span class="texto-placeholder">Calibrando a IA...</span>';

            try {
                // PASSO A: Perguntar ao Google quais modelos existem
                // Isso evita o erro "Model not found" porque vamos usar um que existe
                const listaResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const listaData = await listaResponse.json();

                if (listaData.error) {
                    throw new Error(`Erro ao listar modelos: ${listaData.error.message}`);
                }

                // Filtra um modelo que saiba gerar conteúdo (gemini-pro ou flash)
                // Procuramos preferencialmente o 'flash' ou 'pro'
                let modeloEscolhido = listaData.models.find(m => m.name.includes('gemini-1.5-flash'));
                if (!modeloEscolhido) {
                    modeloEscolhido = listaData.models.find(m => m.name.includes('gemini-pro'));
                }
                // Se não achar os favoritos, pega o primeiro que serve para gerar texto
                if (!modeloEscolhido) {
                    modeloEscolhido = listaData.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
                }

                if (!modeloEscolhido) {
                    throw new Error("Nenhum modelo de texto disponível na sua conta.");
                }

                // Atualiza o status para o usuário ver que achamos o modelo
                console.log("Modelo encontrado:", modeloEscolhido.name);
                
                // PASSO B: Usar o modelo encontrado para gerar a desculpa
                const prompt = "Gere uma desculpa muito curta, absurda e engraçada (máximo 20 palavras) de programador.";
                
                // O 'name' já vem como "models/gemini-pro", então montamos a URL certinha
                const urlGeracao = `https://generativelanguage.googleapis.com/v1beta/${modeloEscolhido.name}:generateContent?key=${apiKey}`;

                const response = await fetch(urlGeracao, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                
                const data = await response.json();

                if (data.error) throw new Error(data.error.message);

                if (data.candidates && data.candidates[0].content) {
                    const texto = data.candidates[0].content.parts[0].text;
                    caixaResposta.innerHTML = `"${texto}"`;
                } else {
                    caixaResposta.innerHTML = "A IA ficou sem palavras.";
                }

            } catch (error) {
                console.error("Erro:", error);
                caixaResposta.innerHTML = `Erro: ${error.message}`;
            } finally {
                btnOraculo.classList.remove('rodando');
                btnOraculo.innerHTML = '<span class="material-symbols-outlined">auto_awesome</span> Invocar Sabedoria';
            }
        });
    }
});