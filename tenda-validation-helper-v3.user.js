// ==UserScript==
// @name         Tenda Validation Helper
// @namespace    https://tampermonkey.net/
// @version      3.0.0
// @description  Automação para validação de cadastros na plataforma Tenda.
// @author       Wellington Roseno
// @match        https://vendas.tenda.com/*
// @grant        none
// ==/UserScript==

/*
===============================================================================
 Tenda Validation Helper v3.0
 ------------------------------------------------------------------------------
 Desenvolvido por Wellington Roseno

 Objetivo:
 Automatizar a coleta dos dados do cliente e do empreendimento na plataforma
 da Tenda e gerar uma linha pronta para colagem na planilha de validação.

 Melhorias da versão 3.0:
 • Identidade visual profissional.
 • Estrutura preparada para modularização.
 • Comentários e documentação.
 • Código organizado para manutenção.
===============================================================================
*/

(function() {
    'use strict';

    // ============================================================
    // CRIA INTERFACE MINIMALISTA
    // ============================================================

    function criarInterface() {

        if (document.getElementById('tenda-extrator-box')) return;

        const div = document.createElement('div');

        div.id = 'tenda-extrator-box';

        div.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            background: #191e2b;
            color: #ffffff;
            padding: 12px 14px;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            transition: all 0.25s ease;
            border: 1px solid rgba(255,255,255,0.08);
            min-width: 200px;
        `;

        div.innerHTML = `
            <div id="tenda-header-box"
                style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">

                <span style="font-weight: 600; font-size: 13px; color: #eceff4; display: flex; align-items: center; gap: 6px;" id="tenda-titulo">
                    📋 Copiar para validação
                </span>

                <button id="btn-recolher-tenda" title="Recolher painel"
                    style="
                        background: #2a3245;
                        color: #a0aec0;
                        border: none;
                        width: 24px;
                        height: 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: background 0.2s ease, color 0.2s ease;
                    ">
                    ›
                </button>
            </div>

            <div id="tenda-conteudo"
                style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                ">

                <button id="btn-copiar-tenda"
                    style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 9px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 12px;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        transition: filter 0.2s ease;
                    ">
                    <span>📋</span> Copiar Dados para Planilha
                </button>

                <button id="btn-resetar-tenda"
                    style="
                        background: #2a3245;
                        color: #cbd5e0;
                        border: 1px solid rgba(255,255,255,0.05);
                        padding: 7px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 11px;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        transition: background 0.2s ease;
                    ">
                    <span>🔄</span> Resetar / Limpar Dados
                </button>

                <div id="tenda-status"
                    style="
                        margin-top: 2px;
                        font-size: 11px;
                        color: #718096;
                        text-align: center;
                    ">
                    Pronto
                </div>

            </div>
        `;

        document.body.appendChild(div);

        // Efeito Hover sutil nos botões
        const btnRecolher = document.getElementById('btn-recolher-tenda');
        btnRecolher.onmouseover = () => btnRecolher.style.background = '#3b455c';
        btnRecolher.onmouseout = () => btnRecolher.style.background = '#2a3245';

        const btnResetar = document.getElementById('btn-resetar-tenda');
        btnResetar.onmouseover = () => btnResetar.style.background = '#353f54';
        btnResetar.onmouseout = () => btnResetar.style.background = '#2a3245';

        // ========================================================
        // BOTÃO RECOLHER / EXPANDIR
        // ========================================================

        let recolhido = false;

        btnRecolher.addEventListener('click', () => {

            recolhido = !recolhido;

            const conteudo = document.getElementById('tenda-conteudo');
            const titulo = document.getElementById('tenda-titulo');
            const box = document.getElementById('tenda-extrator-box');

            if (recolhido) {
                conteudo.style.display = 'none';
                titulo.style.display = 'none';
                box.style.minWidth = 'auto';
                box.style.padding = '6px';

                // Exibe o ícone de atalho quando estiver minimizado
                btnRecolher.innerHTML = '📋 ‹';
                btnRecolher.style.width = 'auto';
                btnRecolher.style.padding = '0 8px';
                btnRecolher.style.height = '28px';
                btnRecolher.title = "Expandir Copiar para validação";
            } else {
                conteudo.style.display = 'flex';
                titulo.style.display = 'flex';
                box.style.minWidth = '200px';
                box.style.padding = '12px 14px';

                // Volta o botão de recolher para o estado normal
                btnRecolher.innerHTML = '›';
                btnRecolher.style.width = '24px';
                btnRecolher.style.padding = '0';
                btnRecolher.style.height = '24px';
                btnRecolher.title = "Recolher painel";
            }
        });

        // ========================================================
        // BOTÃO COPIAR
        // ========================================================

        document
            .getElementById('btn-copiar-tenda')
            .addEventListener('click', extrairEColar);

        // ========================================================
        // BOTÃO RESETAR
        // ========================================================

        document
            .getElementById('btn-resetar-tenda')
            .addEventListener('click', () => {

                const status =
                    document.getElementById('tenda-status');

                status.innerText = "Pronto para novo cliente.";
                status.style.color = "#48bb78";

                setTimeout(() => {

                    status.innerText = "Pronto";
                    status.style.color = "#718096";

                }, 2500);
            });
    }


    // ============================================================
    // FUNÇÃO: VERIFICA SE ELEMENTO ESTÁ VISÍVEL
    // ============================================================

    function elementoVisivel(el) {

        if (!el) return false;

        const style = window.getComputedStyle(el);

        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0'
        ) {
            return false;
        }

        const rect = el.getBoundingClientRect();

        return (
            rect.width > 0 &&
            rect.height > 0
        );
    }


    // ============================================================
    // FUNÇÃO: VALIDA SAP ID
    // ============================================================

    function validarSapId(valor) {

        if (!valor) return false;

        valor = valor.trim();

        return /^\d+$/.test(valor);
    }


    // ============================================================
    // FUNÇÃO PRINCIPAL PARA ENCONTRAR O SAP ID
    // ============================================================

    function encontrarSapId() {

        let candidatos = [];

        const labels = document.querySelectorAll('label');

        labels.forEach(label => {

            const texto =
                label.innerText
                    ?.trim()
                    .replace(/\s+/g, ' ')
                    .toLowerCase();

            if (texto === 'sap id') {

                const forId = label.getAttribute('for');

                if (forId) {

                    const campo =
                        document.getElementById(forId);

                    if (
                        campo &&
                        elementoVisivel(campo) &&
                        validarSapId(campo.value)
                    ) {

                        candidatos.push({
                            campo: campo,
                            prioridade: 1,
                            valor: campo.value.trim()
                        });
                    }
                }

                const inputs =
                    label.querySelectorAll('input');

                inputs.forEach(campo => {

                    if (
                        elementoVisivel(campo) &&
                        validarSapId(campo.value)
                    ) {

                        candidatos.push({
                            campo: campo,
                            prioridade: 1,
                            valor: campo.value.trim()
                        });
                    }
                });

                const parent =
                    label.parentElement;

                if (parent) {

                    const inputsProximos =
                        parent.querySelectorAll('input');

                    inputsProximos.forEach(campo => {

                        if (
                            elementoVisivel(campo) &&
                            validarSapId(campo.value)
                        ) {

                            candidatos.push({
                                campo: campo,
                                prioridade: 2,
                                valor: campo.value.trim()
                            });
                        }
                    });
                }
            }
        });

        const inputs =
            document.querySelectorAll('input');

        inputs.forEach(input => {

            if (!elementoVisivel(input)) return;

            const id =
                (input.id || '').toLowerCase();

            const name =
                (input.name || '').toLowerCase();

            const aria =
                (input.getAttribute('aria-label') || '')
                    .toLowerCase();

            const placeholder =
                (input.placeholder || '')
                    .toLowerCase();

            const atributos = [
                id,
                name,
                aria,
                placeholder
            ].join(' ');

            if (
                atributos.includes('sapid') ||
                atributos.includes('sap_id') ||
                atributos.includes('sap-id') ||
                atributos.includes('sap id')
            ) {

                if (validarSapId(input.value)) {

                    candidatos.push({
                        campo: input,
                        prioridade: 3,
                        valor: input.value.trim()
                    });
                }
            }
        });

        if (candidatos.length === 0) {

            inputs.forEach(input => {

                if (!elementoVisivel(input)) return;

                const valor =
                    (input.value || '').trim();

                if (!validarSapId(valor)) return;

                let elemento = input.parentElement;

                for (let i = 0; i < 4 && elemento; i++) {

                    const texto =
                        (elemento.innerText || '')
                            .toLowerCase();

                    if (
                        texto.includes('sap id') &&
                        texto.length < 500
                    ) {

                        candidatos.push({
                            campo: input,
                            prioridade: 4,
                            valor: valor
                        });

                        break;
                    }

                    elemento =
                        elemento.parentElement;
                }
            });
        }

        candidatos.sort((a, b) => {

            return a.prioridade - b.prioridade;

        });

        if (candidatos.length > 0) {

            console.log(
                '[Copiar para validação] SAP ID encontrado:',
                candidatos[0].valor
            );

            return candidatos[0].valor;
        }

        console.warn(
            '[Copiar para validação] SAP ID não encontrado.'
        );

        return "";
    }


    // ============================================================
    // EXTRAÇÃO DOS DADOS
    // ============================================================

    function extrairEColar() {

        try {

            let nome = "";
            let sobrenome = "";
            let nomeDaTabela = "";
            let cpf = "";

            let sapId = "";

            let empreendimento = "";
            let torre = "";
            let unidade = "";


            // ====================================================
            // CAPTURA DATA E HORA ATUAIS
            // ====================================================

            const agora = new Date();
            const dataAtual = agora.toLocaleDateString('pt-BR');
            const horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });


            // ====================================================
            // SAP ID
            // ====================================================

            sapId = encontrarSapId();


            // ====================================================
            // INPUTS (NOME, SOBRENOME, CPF)
            // ====================================================

            const inputs =
                document.querySelectorAll('input, select');


            inputs.forEach(el => {

                if (!elementoVisivel(el)) return;

                const labelText =
                    (
                        el.getAttribute('id') ||
                        el.getAttribute('name') ||
                        el.getAttribute('placeholder') ||
                        ''
                    ).toLowerCase();


                let parent =
                    el.closest('div') ||
                    el.parentElement;


                let textoContexto =
                    parent
                        ? parent.innerText.toLowerCase()
                        : "";


                if (
                    textoContexto.includes('cpf') ||
                    labelText.includes('cpf')
                ) {

                    if (el.value) {

                        cpf =
                            el.value.trim();
                    }
                }


                if (
                    textoContexto.includes('nome') &&
                    !textoContexto.includes('sobrenome')
                ) {

                    if (el.value) {

                        nome =
                            el.value.trim();
                    }
                }


                if (
                    textoContexto.includes('sobrenome')
                ) {

                    if (el.value) {

                        sobrenome =
                            el.value.trim();
                    }
                }

            });


            // ====================================================
            // TABELAS (CLIENTE, EMPREENDIMENTO, TORRE, UNIDADE)
            // ====================================================

            const tabelas = document.querySelectorAll('table');

            tabelas.forEach(tabela => {

                let idxEmp = -1;
                let idxTorre = -1;
                let idxUnidade = -1;
                let idxCliente = -1;

                const cabecalhos = tabela.querySelectorAll('th');
                cabecalhos.forEach((th, idx) => {

                    const txt = th.innerText.trim().toLowerCase();

                    if (txt.includes('empreendimento')) idxEmp = idx;
                    if (txt.includes('torre')) idxTorre = idx;
                    if (txt.includes('unidade')) idxUnidade = idx;
                    if (txt === 'cliente' || txt.includes('cliente')) idxCliente = idx;
                });

                const linhas = tabela.querySelectorAll('tbody tr, tr');

                linhas.forEach(linha => {

                    const colunas = linha.querySelectorAll('td');
                    if (colunas.length < 3) return;

                    if (idxEmp !== -1 && colunas[idxEmp]) {
                        const val = colunas[idxEmp].innerText.trim();
                        if (val) empreendimento = val;
                    }

                    if (idxTorre !== -1 && colunas[idxTorre]) {
                        const val = colunas[idxTorre].innerText.trim();
                        if (val) torre = val;
                    }

                    if (idxUnidade !== -1 && colunas[idxUnidade]) {
                        const val = colunas[idxUnidade].innerText.trim();
                        if (val) unidade = val;
                    }

                    if (idxCliente !== -1 && colunas[idxCliente]) {
                        const val = colunas[idxCliente].innerText.trim();
                        if (val) nomeDaTabela = val;
                    }

                    if (!empreendimento && colunas.length >= 6) {

                        const textoLinha = linha.innerText.toUpperCase();

                        if (textoLinha.includes('CANCELAMENTO') || textoLinha.includes('ALTERAÇÃO') || textoLinha.includes('BLOCO')) {

                            empreendimento = colunas[1]?.innerText.trim() || empreendimento;
                            torre = colunas[2]?.innerText.trim() || torre;
                            unidade = colunas[3]?.innerText.trim() || unidade;
                            nomeDaTabela = colunas[5]?.innerText.trim() || nomeDaTabela;
                        }
                    }

                    if (!empreendimento && colunas.length >= 6) {

                        const textoLinha = linha.innerText.toUpperCase();

                        if (textoLinha.includes('OCR')) {

                            empreendimento = colunas[3]?.innerText.trim() || empreendimento;
                            torre = colunas[4]?.innerText.trim() || torre;
                            unidade = colunas[5]?.innerText.trim() || unidade;
                        }
                    }

                    if (!empreendimento && colunas.length >= 10) {

                        empreendimento = colunas[7]?.innerText.trim() || empreendimento;
                        torre = colunas[8]?.innerText.trim() || torre;
                        unidade = colunas[9]?.innerText.trim() || unidade;
                    }
                });
            });


            // ====================================================
            // FALLBACK INPUTS DIVERSOS
            // ====================================================

            inputs.forEach(el => {

                let parent =
                    el.closest('div') ||
                    el.parentElement;

                let textoContexto =
                    parent
                        ? parent.innerText.toLowerCase()
                        : "";

                if (textoContexto.includes('empreendimento') && el.value && !empreendimento) {
                    empreendimento = el.value.trim();
                }

                if (textoContexto.includes('torre') && el.value && !torre) {
                    torre = el.value.trim();
                }

                if (textoContexto.includes('unidade') && el.value && !unidade) {
                    unidade = el.value.trim();
                }

            });


            // ====================================================
            // NOME COMPLETO
            // ====================================================

            let nomeFinal = "";

            if (nomeDaTabela) {

                nomeFinal = nomeDaTabela.toUpperCase();

            } else if (nome && sobrenome) {

                nomeFinal = `${nome} ${sobrenome}`.toUpperCase();

            } else {

                nomeFinal = (nome || sobrenome || "").toUpperCase();
            }


            // ====================================================
            // DADOS FINAIS
            // ====================================================

            const dadosValidos = {

                nome:
                    nomeFinal || "-",

                empreendimento:
                    empreendimento || "-",

                cpf:
                    cpf || "-",

                data:
                    dataAtual,

                hora:
                    horaAtual,

                torre:
                    torre || "-",

                unidade:
                    unidade || "-",

                sapId:
                    sapId || "-"
            };


            // ====================================================
            // MONTA LINHA DA PLANILHA
            // ====================================================

            const linhaTabular = [

                dadosValidos.nome,

                dadosValidos.empreendimento,

                dadosValidos.cpf,

                dadosValidos.data,

                dadosValidos.hora,

                "",
                "",

                dadosValidos.torre,

                dadosValidos.unidade,

                dadosValidos.sapId

            ].join("\t");


            // ====================================================
            // COPIA
            // ====================================================

            navigator.clipboard
                .writeText(linhaTabular)
                .then(() => {

                    const status =
                        document.getElementById('tenda-status');

                    status.innerText =
                        `✓ Copiado! (SAP: ${dadosValidos.sapId})`;

                    status.style.color =
                        "#48bb78";

                    setTimeout(() => {

                        status.innerText =
                            "Pronto";

                        status.style.color =
                            "#718096";

                    }, 3000);

                })
                .catch(err => {

                    console.error(
                        '[Copiar para validação] Erro ao copiar:',
                        err
                    );

                    alert(
                        'Não foi possível copiar os dados.'
                    );
                });


        } catch (e) {

            console.error(e);

            alert(
                "Erro ao extrair dados. Verifique o console."
            );
        }
    }


    // ============================================================
    // INICIALIZAÇÃO E GARANTIA
    // ============================================================

    window.addEventListener('load', () => {
        setTimeout(criarInterface, 2000);
    });

    setInterval(criarInterface, 3000);

})();