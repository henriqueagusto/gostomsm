/* ============================================
   FATOR R PRO - SISTEMA PREMIUM
   JavaScript Profissional e Otimizado
   ============================================ */

// ===== CONFIGURAÇÕES GLOBAIS =====
const CONFIG = {
    LIMITE_FATOR_R: 0.28, // 28% - Limite para Anexo III
    TAXA_ANEXO_III: 0.06, // Alíquota base Anexo III
    TAXA_ANEXO_V: 0.155,  // Alíquota base Anexo V
    MAX_HISTORICO: 10,    // Máximo de cálculos no histórico
    AUTO_SAVE: true       // Salvar automaticamente no localStorage
};

// ===== ESTADO DO SISTEMA =====
const estadoSistema = {
    dadosCalculo: {
        receitaBruta: 0,
        folhaPagamento: 0,
        fatorR: 0,
        anexo: '',
        aliquotaEfetiva: 0,
        economiaMensal: 0,
        dataCalculo: null,
        id: null
    },
    historico: [],
    arquivoSelecionado: null,
    notificacoesAtivas: [],
    loadingAtivo: false
};

// ===== INICIALIZAÇÃO PREMIUM =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema Fator R Pro Premium inicializando...');
    
    try {
        inicializarSistema();
        configurarEventListeners();
        configurarObservadores();
        carregarHistorico();
        inicializarRelogio();
        
        // Status do sistema
        criarNotificacao('Sistema Premium inicializado com sucesso', 'success');
        atualizarStatusSistema('ativo');
        
        console.log('✅ Sistema Premium pronto para uso');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        criarNotificacao(`Erro na inicialização: ${error.message}`, 'error');
    }
});

function inicializarSistema() {
    console.log('⚙️ Configurando sistema premium...');
    
    // Inicializar campos com máscara
    inicializarMascaras();
    
    // Configurar validação em tempo real
    inicializarValidacao();
    
    // Configurar tooltips
    inicializarTooltips();
    
    // Verificar suporte a funcionalidades
    verificarSuporteNavegador();
    
    // Configurar tema (se houver dark mode)
    configurarTema();
}

function configurarEventListeners() {
    console.log('🎮 Configurando eventos premium...');
    
    // Eventos de entrada de dados
    const inputs = ['inputReceita', 'inputFolha'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', handleInputChange);
            input.addEventListener('blur', handleInputBlur);
            input.addEventListener('focus', handleInputFocus);
        }
    });
    
    // Eventos dos métodos de entrada
    document.querySelectorAll('.method-card').forEach(card => {
        card.addEventListener('click', handleMetodoClick);
    });
    
    // Eventos dos botões de ação
    document.getElementById('btnCalcular')?.addEventListener('click', calcularFatorR);
    
    // Eventos dos botões de limpar
    document.querySelectorAll('.input-clear').forEach(btn => {
        btn.addEventListener('click', handleLimparCampo);
    });
    
    // Eventos do modal
    document.getElementById('uploadModal')?.addEventListener('click', handleModalClick);
    document.getElementById('fileInput')?.addEventListener('change', handleFileSelect);
    
    // Eventos de teclado
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Eventos de drag and drop
    configurarDragAndDrop();
    
    // Eventos de saída
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function configurarObservadores() {
    // Observer para mudanças no DOM (se necessário)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Atualizar tooltips dinamicamente
                inicializarTooltips();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ===== FUNÇÕES DE ENTRADA DE DADOS =====
function selecionarMetodo(metodo) {
    try {
        console.log(`📱 Selecionando método: ${metodo}`);
        
        // Atualizar interface
        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('method-active');
            card.setAttribute('aria-selected', 'false');
        });
        
        const cardAtivo = document.getElementById(`tab${metodo.charAt(0).toUpperCase() + metodo.slice(1)}`);
        if (cardAtivo) {
            cardAtivo.classList.add('method-active');
            cardAtivo.setAttribute('aria-selected', 'true');
            cardAtivo.focus();
        }
        
        // Executar ação do método
        switch(metodo) {
            case 'manual':
                // Já está ativo por padrão
                break;
            case 'import':
                abrirModalUpload();
                break;
            case 'example':
                carregarExemploProfissional();
                break;
        }
        
        criarNotificacao(`Modo ${metodo} ativado`, 'info');
        
    } catch (error) {
        console.error('Erro ao selecionar método:', error);
        criarNotificacao('Erro ao mudar método de entrada', 'error');
    }
}

function handleInputChange(event) {
    const input = event.target;
    const id = input.id;
    
    // Formatar valor
    formatarMoeda(input);
    
    // Validar em tempo real
    const valido = validarCampoEmTempoReal(input);
    
    // Atualizar UI
    atualizarEstadoInput(input, valido);
    
    // Habilitar/desabilitar botão calcular
    atualizarBotaoCalcular();
    
    // Feedback sutil para usuário
    if (valido && input.value.length > 0) {
        input.classList.add('valid');
        input.classList.remove('invalid');
    }
}

function handleInputFocus(event) {
    const input = event.target;
    input.parentElement.classList.add('focused');
    
    // Mostrar dica se necessário
    const ajudaId = input.getAttribute('aria-describedby');
    if (ajudaId) {
        const ajudaElement = document.getElementById(ajudaId);
        if (ajudaElement) {
            ajudaElement.style.opacity = '1';
        }
    }
}

function handleInputBlur(event) {
    const input = event.target;
    input.parentElement.classList.remove('focused');
    
    // Validar campo
    const valido = validarCampo(input);
    
    // Atualizar estado
    atualizarEstadoInput(input, valido);
    
    // Esconder dica
    const ajudaId = input.getAttribute('aria-describedby');
    if (ajudaId) {
        const ajudaElement = document.getElementById(ajudaId);
        if (ajudaElement) {
            ajudaElement.style.opacity = '0.7';
        }
    }
}

function handleMetodoClick(event) {
    const card = event.currentTarget;
    const metodo = card.id.replace('tab', '').toLowerCase();
    selecionarMetodo(metodo);
}

function handleLimparCampo(event) {
    const button = event.currentTarget;
    const inputId = button.closest('.input-container').querySelector('.form-input').id;
    limparCampo(inputId);
}

// ===== SISTEMA DE CÁLCULO PREMIUM =====
async function calcularFatorR() {
    console.log('🧮 Iniciando cálculo premium do Fator R...');
    
    try {
        // Validar dados
        if (!validarDadosEntrada()) {
            criarNotificacao('Por favor, corrija os dados antes de calcular', 'warning');
            return;
        }
        
        // Mostrar loading
        mostrarLoading('Calculando Fator R...', 'Realizando análise tributária avançada');
        
        // Pequeno delay para melhor UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Obter valores
        const receita = converterParaNumero(document.getElementById('inputReceita').value);
        const folha = converterParaNumero(document.getElementById('inputFolha').value);
        
        // Calcular Fator R
        const fatorR = calcularProporcaoFolhaReceita(folha, receita);
        
        // Determinar enquadramento
        const resultado = determinarEnquadramentoTributario(fatorR, receita);
        
        // Atualizar estado do sistema
        estadoSistema.dadosCalculo = {
            receitaBruta: receita,
            folhaPagamento: folha,
            fatorR: fatorR,
            anexo: resultado.anexo,
            aliquotaEfetiva: resultado.aliquota,
            economiaMensal: resultado.economia,
            dataCalculo: new Date(),
            id: Date.now()
        };
        
        // Salvar no histórico
        if (CONFIG.AUTO_SAVE) {
            salvarNoHistorico(estadoSistema.dadosCalculo);
        }
        
        // Exibir resultados
        exibirResultadosPremium(estadoSistema.dadosCalculo);
        
        // Esconder loading
        esconderLoading();
        
        // Notificação de sucesso
        criarNotificacao('Cálculo realizado com sucesso!', 'success');
        
        // Scroll suave para resultados
        document.getElementById('resultsCard').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Log analytics
        console.log('📊 Resultado do cálculo:', estadoSistema.dadosCalculo);
        
    } catch (error) {
        console.error('❌ Erro no cálculo:', error);
        criarNotificacao('Erro ao calcular Fator R. Tente novamente.', 'error');
        esconderLoading();
        
        // Log detalhado do erro
        logErro('calcularFatorR', error);
    }
}

function calcularProporcaoFolhaReceita(folha, receita) {
    if (receita === 0) return 0;
    const proporcao = folha / receita;
    return Math.min(Math.max(proporcao, 0), 1); // Garantir entre 0 e 1
}

function determinarEnquadramentoTributario(fatorR, receita) {
    console.log('⚖️ Determinando enquadramento tributário...');
    
    const resultado = {
        anexo: '',
        aliquota: 0,
        economia: 0,
        status: '',
        recomendacao: ''
    };
    
    if (fatorR >= CONFIG.LIMITE_FATOR_R) {
        // Anexo III (Serviços)
        resultado.anexo = 'III';
        resultado.status = 'otimizado';
        resultado.aliquota = calcularAliquotaAnexoIII(receita);
        resultado.economia = calcularEconomiaAnexoIII(receita, resultado.aliquota);
        resultado.recomendacao = 'Mantenha sua folha acima de 28% para permanecer no Anexo III';
    } else {
        // Anexo V (Comércio)
        resultado.anexo = 'V';
        resultado.status = 'atencao';
        resultado.aliquota = calcularAliquotaAnexoV(receita);
        resultado.economia = calcularFolgaParaAnexoIII(fatorR, receita);
        resultado.recomendacao = `Aumente seu Fator R em ${((CONFIG.LIMITE_FATOR_R - fatorR) * 100).toFixed(1)}% para migrar para o Anexo III`;
    }
    
    return resultado;
}

function calcularAliquotaAnexoIII(receita) {
    // Tabela progressiva do Anexo III 2024
    const tabela = [
        { limite: 180000, aliquota: 0.06 },
        { limite: 360000, aliquota: 0.112 },
        { limite: 720000, aliquota: 0.135 },
        { limite: 1800000, aliquota: 0.16 },
        { limite: 3600000, aliquota: 0.21 },
        { limite: 4800000, aliquota: 0.33 }
    ];
    
    for (const faixa of tabela) {
        if (receita <= faixa.limite) {
            return faixa.aliquota;
        }
    }
    
    return 0.33; // Última faixa
}

function calcularAliquotaAnexoV(receita) {
    // Tabela progressiva do Anexo V 2024
    const tabela = [
        { limite: 180000, aliquota: 0.155 },
        { limite: 360000, aliquota: 0.18 },
        { limite: 720000, aliquota: 0.195 },
        { limite: 1800000, aliquota: 0.205 },
        { limite: 3600000, aliquota: 0.23 },
        { limite: 4800000, aliquota: 0.305 }
    ];
    
    for (const faixa of tabela) {
        if (receita <= faixa.limite) {
            return faixa.aliquota;
        }
    }
    
    return 0.305; // Última faixa
}

function calcularEconomiaAnexoIII(receita, aliquotaAnexoIII) {
    const aliquotaAnexoV = calcularAliquotaAnexoV(receita);
    const economiaAnual = (aliquotaAnexoV - aliquotaAnexoIII) * receita;
    return economiaAnual / 12; // Economia mensal
}

function calcularFolgaParaAnexoIII(fatorR, receita) {
    const limiteFatorR = CONFIG.LIMITE_FATOR_R;
    const folgaPercentual = (limiteFatorR - fatorR) * 100;
    const valorNecessario = (limiteFatorR * receita) - (fatorR * receita);
    
    // Retornamos negativo para indicar "falta"
    return -Math.abs(valorNecessario);
}

// ===== EXIBIÇÃO DE RESULTADOS PREMIUM =====
function exibirResultadosPremium(dados) {
    console.log('🎨 Exibindo resultados premium...');
    
    try {
        // Mostrar seção de resultados
        const resultsCard = document.getElementById('resultsCard');
        const emptyState = document.getElementById('emptyState');
        const resultsContent = document.getElementById('resultsContent');
        
        emptyState.style.display = 'none';
        resultsContent.style.display = 'flex';
        resultsCard.classList.remove('empty');
        
        // Formatar e exibir valores
        atualizarValoresPrincipais(dados);
        atualizarBadgesAnexo(dados.anexo);
        atualizarMetricasDetalhadas(dados);
        atualizarAnaliseTributaria(dados);
        atualizarVisualizacaoProgresso(dados.fatorR);
        atualizarRecomendacoesPremium(dados);
        atualizarAcoesResultados();
        
        // Animação de entrada
        resultsContent.style.animation = 'slideInUp 0.5s ease';
        
        // Log de exibição
        console.log('✅ Resultados exibidos com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao exibir resultados:', error);
        criarNotificacao('Erro ao exibir resultados', 'error');
        logErro('exibirResultadosPremium', error);
    }
}

function atualizarValoresPrincipais(dados) {
    // Valor do Fator R
    const fatorRFormatado = (dados.fatorR * 100).toFixed(2);
    document.getElementById('valorFatorR').textContent = `${fatorRFormatado}%`;
    document.getElementById('valorFatorR').setAttribute('aria-label', `Fator R de ${fatorRFormatado} por cento`);
    
    // Receita Bruta
    const receitaFormatada = formatarMoedaValor(dados.receitaBruta);
    document.getElementById('metricReceita').textContent = receitaFormatada;
    
    // Folha de Pagamento
    const folhaFormatada = formatarMoedaValor(dados.folhaPagamento);
    document.getElementById('metricFolha').textContent = folhaFormatada;
    
    // Proporção
    document.getElementById('metricProporcao').textContent = `${fatorRFormatado}%`;
    
    // Alíquota
    const aliquotaFormatada = dados.aliquotaEfetiva.toFixed(2);
    document.getElementById('metricAliquota').textContent = `${aliquotaFormatada}%`;
}

function atualizarBadgesAnexo(anexo) {
    const badgeIII = document.getElementById('badgeAnexoIII');
    const badgeV = document.getElementById('badgeAnexoV');
    
    if (anexo === 'III') {
        badgeIII.hidden = false;
        badgeV.hidden = true;
        badgeIII.setAttribute('aria-label', 'Enquadrado no Anexo III - Otimizado');
    } else {
        badgeIII.hidden = true;
        badgeV.hidden = false;
        badgeV.setAttribute('aria-label', 'Enquadrado no Anexo V - Atenção necessária');
    }
}

function atualizarMetricasDetalhadas(dados) {
    // Diferença para o limite
    const diferencaPercentual = dados.fatorR >= CONFIG.LIMITE_FATOR_R 
        ? `+${((dados.fatorR - CONFIG.LIMITE_FATOR_R) * 100).toFixed(2)}% acima do limite`
        : `-${((CONFIG.LIMITE_FATOR_R - dados.fatorR) * 100).toFixed(2)}% abaixo do limite`;
    
    document.getElementById('metricDiferenca').textContent = diferencaPercentual;
    
    // Economia/Investimento necessário
    let economiaTexto = '';
    if (dados.economia >= 0) {
        economiaTexto = `Economia mensal: ${formatarMoedaValor(dados.economia)}`;
        document.getElementById('metricEconomia').className = 'metric-tag tag-success';
    } else {
        const investimentoNecessario = formatarMoedaValor(Math.abs(dados.economia));
        economiaTexto = `Investimento necessário: ${investimentoNecessario}`;
        document.getElementById('metricEconomia').className = 'metric-tag tag-warning';
    }
    
    document.getElementById('metricEconomia').textContent = economiaTexto;
}

function atualizarAnaliseTributaria(dados) {
    const tituloAnalise = document.getElementById('tituloAnalise');
    const textoAnalise = document.getElementById('textoAnalise');
    
    if (dados.anexo === 'III') {
        tituloAnalise.textContent = '🎉 Otimização Tributária Alcançada';
        tituloAnalise.className = 'analysis-title success';
        
        const economiaMensal = formatarMoedaValor(dados.economia);
        const economiaAnual = formatarMoedaValor(dados.economia * 12);
        
        textoAnalise.innerHTML = `
            <p>Sua empresa está <strong>enquadrada no Anexo III</strong> do Simples Nacional, aproveitando as alíquotas reduzidas para prestadores de serviços.</p>
            
            <div class="analysis-highlights">
                <div class="highlight-item">
                    <i class="fas fa-check-circle"></i>
                    <span><strong>Alíquota efetiva:</strong> ${dados.aliquotaEfetiva.toFixed(2)}%</span>
                </div>
                <div class="highlight-item">
                    <i class="fas fa-chart-line"></i>
                    <span><strong>Fator R:</strong> ${(dados.fatorR * 100).toFixed(2)}%</span>
                </div>
                <div class="highlight-item">
                    <i class="fas fa-piggy-bank"></i>
                    <span><strong>Economia mensal:</strong> ${economiaMensal}</span>
                </div>
            </div>
            
            <p class="analysis-note">
                <i class="fas fa-lightbulb"></i>
                <strong>Dica:</strong> Continue monitorando mensalmente para manter seu Fator R acima de 28%.
            </p>
        `;
    } else {
        tituloAnalise.textContent = '⚠️ Ajuste Necessário no Fator R';
        tituloAnalise.className = 'analysis-title warning';
        
        const percentualFaltante = ((CONFIG.LIMITE_FATOR_R - dados.fatorR) * 100).toFixed(2);
        const valorFaltante = formatarMoedaValor(Math.abs(dados.economia));
        
        textoAnalise.innerHTML = `
            <p>Sua empresa está <strong>enquadrada no Anexo V</strong> do Simples Nacional, com alíquotas mais elevadas para comércio e serviços específicos.</p>
            
            <div class="analysis-highlights">
                <div class="highlight-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span><strong>Alíquota atual:</strong> ${dados.aliquotaEfetiva.toFixed(2)}%</span>
                </div>
                <div class="highlight-item">
                    <i class="fas fa-chart-line"></i>
                    <span><strong>Fator R atual:</strong> ${(dados.fatorR * 100).toFixed(2)}%</span>
                </div>
                <div class="highlight-item">
                    <i class="fas fa-bullseye"></i>
                    <span><strong>Meta necessária:</strong> 28.00%</span>
                </div>
            </div>
            
            <p>Para migrar para o <strong>Anexo III</strong> e reduzir sua alíquota, você precisa:</p>
            <ul class="analysis-list">
                <li>Aumentar o Fator R em <strong>${percentualFaltante}%</strong></li>
                <li>Investir aproximadamente <strong>${valorFaltante}</strong> na folha de pagamento</li>
                <li>Revisar estrutura de pró-labore e encargos</li>
            </ul>
            
            <p class="analysis-note">
                <i class="fas fa-clock"></i>
                <strong>Prazo:</strong> O ajuste pode ser realizado gradualmente ao longo do ano.
            </p>
        `;
    }
}

function atualizarVisualizacaoProgresso(fatorR) {
    const progressFill = document.getElementById('barraProgresso');
    const posicaoAtual = document.getElementById('posicaoAtual');
    
    // Calcular porcentagem (0-100%)
    const porcentagem = Math.min(Math.max((fatorR / 0.42) * 100, 0), 100);
    
    // Animação suave da barra
    progressFill.style.transition = 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
    progressFill.style.width = `${porcentagem}%`;
    
    // Atualizar texto da posição
    if (fatorR >= CONFIG.LIMITE_FATOR_R) {
        posicaoAtual.textContent = 'Anexo III - Otimizado';
        posicaoAtual.className = 'progress-value success';
    } else if (fatorR >= 0.14) {
        posicaoAtual.textContent = 'Zona de Transição';
        posicaoAtual.className = 'progress-value warning';
    } else {
        posicaoAtual.textContent = 'Anexo V - Ajuste Necessário';
        posicaoAtual.className = 'progress-value error';
    }
}

function atualizarRecomendacoesPremium(dados) {
    // Recomendação 1 - Estratégia Fiscal
    document.getElementById('tituloRec1').textContent = dados.anexo === 'III' 
        ? 'Manutenção do Anexo III' 
        : 'Migração para Anexo III';
    
    if (dados.anexo === 'III') {
        document.getElementById('textoRec1').textContent = 
            'Mantenha o controle mensal do Fator R e considere distribuição de lucros como pró-labore para otimizar ainda mais.';
    } else {
        const mesesEstimados = Math.ceil(Math.abs(dados.economia) / (dados.folhaPagamento / 12));
        document.getElementById('textoRec1').textContent = 
            `Planeje o aumento gradual da folha em ${mesesEstimados} meses. Considere contratações ou ajustes de pró-labore.`;
    }
    
    // Recomendação 2 - Gestão Financeira
    document.getElementById('tituloRec2').textContent = 'Gestão de Custos';
    
    if (dados.anexo === 'III') {
        const economiaAnual = formatarMoedaValor(dados.economia * 12);
        document.getElementById('textoRec2').textContent = 
            `Você economiza aproximadamente ${economiaAnual} anualmente. Reinvesta esses recursos para crescimento do negócio.`;
    } else {
        const custoOportunidade = formatarMoedaValor(calcularCustoOportunidade(dados));
        document.getElementById('textoRec2').textContent = 
            `O custo de oportunidade atual é de ${custoOportunidade} por ano. O investimento na folha se paga em médio prazo.`;
    }
    
    // Recomendação 3 - Planejamento
    document.getElementById('tituloRec3').textContent = 'Planejamento Tributário';
    document.getElementById('textoRec3').textContent = dados.anexo === 'III'
        ? 'Revisão trimestral da estratégia. Considere consultoria especializada para otimização contínua.'
        : 'Desenvolva um plano de ação com seu contador. Monitore trimestralmente o progresso do Fator R.';
}

function atualizarAcoesResultados() {
    // Atualizar estado dos botões de ação
    const botoesAcao = document.querySelectorAll('.actions-grid .action-button');
    botoesAcao.forEach(botao => {
        botao.disabled = false;
    });
}

// ===== FUNÇÕES DE FORMATAÇÃO E VALIDAÇÃO =====
function formatarMoeda(input) {
    try {
        let valor = input.value.replace(/\D/g, '');
        
        if (valor.length === 0) {
            input.value = '';
            return;
        }
        
        // Adicionar zeros decimais se necessário
        while (valor.length < 3) {
            valor = '0' + valor;
        }
        
        const inteiros = valor.slice(0, -2);
        const decimais = valor.slice(-2);
        
        // Formatar com separadores de milhar
        const partes = [];
        for (let i = inteiros.length; i > 0; i -= 3) {
            partes.unshift(inteiros.slice(Math.max(0, i - 3), i));
        }
        
        const valorFormatado = partes.join('.') + ',' + decimais;
        input.value = valorFormatado;
        
    } catch (error) {
        console.error('Erro na formatação de moeda:', error);
        input.value = '';
    }
}

function formatarMoedaValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

function converterParaNumero(valorFormatado) {
    try {
        if (!valorFormatado || valorFormatado.trim() === '') return 0;
        
        // Remover tudo exceto números, vírgula e ponto
        let valorLimpo = valorFormatado.replace(/[^\d,.-]/g, '');
        
        // Substituir ponto como separador de milhar
        valorLimpo = valorLimpo.replace(/\./g, '');
        
        // Substituir vírgula como separador decimal
        valorLimpo = valorLimpo.replace(',', '.');
        
        const numero = parseFloat(valorLimpo);
        
        if (isNaN(numero)) {
            console.warn('Valor não pôde ser convertido:', valorFormatado);
            return 0;
        }
        
        return Math.abs(numero); // Garantir valor positivo
        
    } catch (error) {
        console.error('Erro na conversão de número:', error);
        return 0;
    }
}

function validarDadosEntrada() {
    console.log('🔍 Validando dados de entrada...');
    
    const receitaInput = document.getElementById('inputReceita');
    const folhaInput = document.getElementById('inputFolha');
    
    // Verificar campos preenchidos
    if (!receitaInput.value.trim() || !folhaInput.value.trim()) {
        criarNotificacao('Preencha todos os campos obrigatórios', 'warning');
        if (!receitaInput.value.trim()) receitaInput.focus();
        return false;
    }
    
    // Converter valores
    const receita = converterParaNumero(receitaInput.value);
    const folha = converterParaNumero(folhaInput.value);
    
    // Validações numéricas
    if (receita <= 0 || folha <= 0) {
        criarNotificacao('Os valores devem ser maiores que zero', 'warning');
        return false;
    }
    
    if (isNaN(receita) || isNaN(folha)) {
        criarNotificacao('Valores inválidos. Use apenas números.', 'error');
        return false;
    }
    
    // Validação de proporção
    if (folha > receita) {
        criarNotificacao('A folha não pode ser maior que a receita bruta', 'error');
        folhaInput.focus();
        return false;
    }
    
    // Validação de valores realistas
    if (receita > 1000000000) { // 1 bilhão
        const confirmacao = confirm('Valor de receita muito alto. Deseja continuar mesmo assim?');
        if (!confirmacao) {
            receitaInput.focus();
            return false;
        }
    }
    
    console.log('✅ Dados validados com sucesso');
    return true;
}

function validarCampoEmTempoReal(input) {
    const valor = converterParaNumero(input.value);
    return valor > 0;
}

function validarCampo(input) {
    const valor = converterParaNumero(input.value);
    
    if (valor <= 0) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        return false;
    }
    
    input.classList.add('valid');
    input.classList.remove('invalid');
    return true;
}

function atualizarEstadoInput(input, valido) {
    const container = input.parentElement;
    
    if (valido) {
        container.classList.add('valid');
        container.classList.remove('invalid');
    } else if (input.value.length > 0) {
        container.classList.add('invalid');
        container.classList.remove('valid');
    } else {
        container.classList.remove('valid', 'invalid');
    }
}

function atualizarBotaoCalcular() {
    const btnCalcular = document.getElementById('btnCalcular');
    const receitaValida = validarCampo(document.getElementById('inputReceita'));
    const folhaValida = validarCampo(document.getElementById('inputFolha'));
    
    btnCalcular.disabled = !(receitaValida && folhaValida);
}

// ===== SISTEMA DE ARQUIVOS E MODAL =====
function abrirModalUpload() {
    console.log('📂 Abrindo modal de upload...');
    
    const modal = document.getElementById('uploadModal');
    if (!modal) return;
    
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Resetar estado
    document.getElementById('filePreview').hidden = true;
    document.getElementById('btnProcessar').disabled = true;
    estadoSistema.arquivoSelecionado = null;
    
    // Foco no botão de fechar para acessibilidade
    setTimeout(() => {
        document.querySelector('.modal-close')?.focus();
    }, 100);
}

function fecharModalUpload() {
    const modal = document.getElementById('uploadModal');
    if (!modal) return;
    
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    
    // Retornar foco para o botão que abriu o modal
    document.getElementById('tabImport')?.focus();
}

function previewArquivo(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.includes('pdf')) {
        criarNotificacao('Selecione um arquivo PDF válido', 'error');
        return;
    }
    
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
        criarNotificacao('O arquivo deve ter no máximo 10MB', 'error');
        return;
    }
    
    estadoSistema.arquivoSelecionado = file;
    
    // Atualizar preview
    const preview = document.getElementById('filePreview');
    const fileName = document.getElementById('nomeArquivo');
    const fileSize = document.getElementById('tamanhoArquivo');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatarTamanhoArquivo(file.size);
    preview.hidden = false;
    
    // Habilitar processamento
    document.getElementById('btnProcessar').disabled = false;
    
    criarNotificacao('Arquivo selecionado com sucesso', 'success');
}

function formatarTamanhoArquivo(bytes) {
    const unidades = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + unidades[i];
}

function removerArquivo() {
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').hidden = true;
    document.getElementById('btnProcessar').disabled = true;
    estadoSistema.arquivoSelecionado = null;
    
    criarNotificacao('Arquivo removido', 'info');
}

async function processarExtratoPDF() {
    if (!estadoSistema.arquivoSelecionado) {
        criarNotificacao('Nenhum arquivo selecionado', 'error');
        return;
    }
    
    mostrarLoading('Processando extrato...', 'Extraindo dados do PDF');
    
    try {
        // Simulação de processamento (em produção, integrar com biblioteca PDF)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Dados simulados para demonstração
        const dadosSimulados = {
            receita: 420000,
            folha: 117600,
            periodo: 'Jan/2024 - Dez/2024',
            fatorR: 0.28
        };
        
        // Atualizar campos com dados simulados
        document.getElementById('inputReceita').value = dadosSimulados.receita.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        document.getElementById('inputFolha').value = dadosSimulados.folha.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        // Atualizar dados extraídos
        document.getElementById('extraidoReceita').textContent = formatarMoedaValor(dadosSimulados.receita);
        document.getElementById('extraidoFolha').textContent = formatarMoedaValor(dadosSimulados.folha);
        document.getElementById('extraidoFatorR').textContent = `${(dadosSimulados.fatorR * 100).toFixed(2)}%`;
        document.getElementById('extraidoPeriodo').textContent = dadosSimulados.periodo;
        
        // Mostrar seção de dados extraídos
        document.getElementById('extractedData').hidden = false;
        
        // Fechar modal
        fecharModalUpload();
        
        // Esconder loading
        esconderLoading();
        
        // Notificação de sucesso
        criarNotificacao('Extrato processado com sucesso!', 'success');
        
        // Calcular automaticamente após processamento
        setTimeout(() => {
            calcularFatorR();
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro ao processar PDF:', error);
        criarNotificacao('Erro ao processar o arquivo PDF', 'error');
        esconderLoading();
        logErro('processarExtratoPDF', error);
    }
}

// ===== FUNÇÕES DE AÇÃO =====
function limparCalculadora() {
    console.log('🔄 Reiniciando calculadora...');
    
    // Limpar campos
    document.getElementById('inputReceita').value = '';
    document.getElementById('inputFolha').value = '';
    
    // Resetar validação
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('valid', 'invalid');
        input.parentElement.classList.remove('valid', 'invalid');
    });
    
    // Limpar resultados
    const resultsCard = document.getElementById('resultsCard');
    const emptyState = document.getElementById('emptyState');
    const resultsContent = document.getElementById('resultsContent');
    
    resultsContent.style.display = 'none';
    emptyState.style.display = 'flex';
    resultsCard.classList.add('empty');
    
    // Limpar dados extraídos
    document.getElementById('extractedData').hidden = true;
    
    // Resetar botão calcular
    document.getElementById('btnCalcular').disabled = true;
    
    // Limpar estado
    estadoSistema.dadosCalculo = {
        receitaBruta: 0,
        folhaPagamento: 0,
        fatorR: 0,
        anexo: '',
        aliquotaEfetiva: 0,
        economiaMensal: 0,
        dataCalculo: null,
        id: null
    };
    
    criarNotificacao('Calculadora reiniciada', 'info');
    
    // Foco no primeiro campo
    document.getElementById('inputReceita').focus();
}

async function gerarRelatorioPDF() {
    if (!estadoSistema.dadosCalculo.dataCalculo) {
        criarNotificacao('Nenhum cálculo para exportar', 'warning');
        return;
    }
    
    mostrarLoading('Gerando relatório...', 'Preparando documento PDF');
    
    try {
        // Simulação de geração de PDF
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Criar conteúdo do relatório
        const relatorio = criarConteudoRelatorio();
        
        // Gerar blob e fazer download
        const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `relatorio-fator-r-${timestamp}.txt`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        esconderLoading();
        criarNotificacao('Relatório gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        criarNotificacao('Erro ao gerar relatório', 'error');
        esconderLoading();
        logErro('gerarRelatorioPDF', error);
    }
}

function criarConteudoRelatorio() {
    const dados = estadoSistema.dadosCalculo;
    const dataFormatada = dados.dataCalculo ? 
        dados.dataCalculo.toLocaleDateString('pt-BR') + ' ' + 
        dados.dataCalculo.toLocaleTimeString('pt-BR') : 'N/A';
    
    return `
RELATÓRIO FATOR R PRO - SISTEMA PREMIUM
=========================================

📅 Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
📊 ID do Cálculo: ${dados.id || 'N/A'}

DADOS DE ENTRADA
----------------
💰 Receita Bruta (12 meses): ${formatarMoedaValor(dados.receitaBruta)}
👥 Folha de Pagamento: ${formatarMoedaValor(dados.folhaPagamento)}

RESULTADOS DA ANÁLISE
---------------------
📈 Fator R Calculado: ${(dados.fatorR * 100).toFixed(2)}%
🏛️  Anexo Aplicável: ${dados.anexo}
📉 Alíquota Efetiva: ${dados.aliquotaEfetiva.toFixed(2)}%
${dados.anexo === 'III' ? 
`💸 Economia Mensal Estimada: ${formatarMoedaValor(dados.economia)}
💰 Economia Anual: ${formatarMoedaValor(dados.economia * 12)}` : 
`🎯 Investimento Necessário: ${formatarMoedaValor(Math.abs(dados.economia))}
📅 Meta: Aumentar Fator R para 28%`}

RECOMENDAÇÕES ESTRATÉGICAS
--------------------------
1. ${document.getElementById('textoRec1').textContent}
2. ${document.getElementById('textoRec2').textContent}
3. ${document.getElementById('textoRec3').textContent}

INFORMAÇÕES ADICIONAIS
----------------------
• Data do Cálculo: ${dataFormatada}
• Limite do Anexo III: 28%
• Sistema: Fator R Pro Premium v3.0.0

---
📋 Gerado por Fator R Pro Premium
🔒 Contabilizatech - Sistema Tributário Inteligente
📧 suporte@contabilizatech.com
    `;
}

function salvarAnalise() {
    if (!estadoSistema.dadosCalculo.dataCalculo) {
        criarNotificacao('Nenhum cálculo para salvar', 'warning');
        return;
    }
    
    try {
        salvarNoHistorico(estadoSistema.dadosCalculo);
        criarNotificacao('Análise salva com sucesso!', 'success');
        
        // Feedback visual
        const btnSalvar = document.querySelector('[onclick="salvarAnalise()"]');
        if (btnSalvar) {
            btnSalvar.classList.add('saved');
            setTimeout(() => btnSalvar.classList.remove('saved'), 2000);
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar análise:', error);
        criarNotificacao('Erro ao salvar análise', 'error');
        logErro('salvarAnalise', error);
    }
}

function compartilharAnalise() {
    if (!estadoSistema.dadosCalculo.dataCalculo) {
        criarNotificacao('Nenhum cálculo para compartilhar', 'warning');
        return;
    }
    
    try {
        const texto = criarTextoCompartilhamento();
        
        if (navigator.share && navigator.canShare) {
            // Web Share API
            navigator.share({
                title: 'Resultado do Fator R',
                text: texto,
                url: window.location.href
            }).then(() => {
                criarNotificacao('Análise compartilhada!', 'success');
            }).catch(err => {
                console.log('Fallback para cópia:', err);
                copiarParaAreaTransferencia(texto);
            });
        } else {
            // Fallback para cópia
            copiarParaAreaTransferencia(texto);
        }
        
    } catch (error) {
        console.error('❌ Erro ao compartilhar:', error);
        criarNotificacao('Erro ao compartilhar análise', 'error');
        copiarParaAreaTransferencia(criarTextoCompartilhamento());
    }
}

function criarTextoCompartilhamento() {
    const dados = estadoSistema.dadosCalculo;
    return `
📊 *Resultado do Fator R* 📊

💰 Receita Bruta: ${formatarMoedaValor(dados.receitaBruta)}
👥 Folha de Pagamento: ${formatarMoedaValor(dados.folhaPagamento)}
📈 Fator R: ${(dados.fatorR * 100).toFixed(2)}%
🏛️  Anexo: ${dados.anexo}
📉 Alíquota: ${dados.aliquotaEfetiva.toFixed(2)}%

${dados.anexo === 'III' ? 
`✅ *Otimizado no Anexo III*
💸 Economia mensal: ${formatarMoedaValor(dados.economia)}` : 
`⚠️ *Atenção: Enquadrado no Anexo V*
🎯 Necessário aumentar Fator R para 28%`}

🔗 Gerado por *Fator R Pro Premium*
👉 ${window.location.href}
    `;
}

async function copiarParaAreaTransferencia(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        criarNotificacao('Resultados copiados para a área de transferência!', 'success');
    } catch (err) {
        console.error('❌ Erro ao copiar:', err);
        
        // Fallback para navegadores antigos
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        criarNotificacao('Resultados copiados!', 'success');
    }
}

// ===== HISTÓRICO E LOCALSTORAGE =====
function salvarNoHistorico(dados) {
    try {
        // Criar item do histórico
        const historicoItem = {
            ...dados,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        // Adicionar ao início do array
        estadoSistema.historico.unshift(historicoItem);
        
        // Manter limite máximo
        if (estadoSistema.historico.length > CONFIG.MAX_HISTORICO) {
            estadoSistema.historico = estadoSistema.historico.slice(0, CONFIG.MAX_HISTORICO);
        }
        
        // Salvar no localStorage
        localStorage.setItem('historicoFatorR', JSON.stringify(estadoSistema.historico));
        
        console.log('💾 Histórico salvo:', historicoItem);
        
        return historicoItem;
        
    } catch (error) {
        console.error('❌ Erro ao salvar histórico:', error);
        logErro('salvarNoHistorico', error);
        throw error;
    }
}

function carregarHistorico() {
    try {
        const historicoSalvo = localStorage.getItem('historicoFatorR');
        if (historicoSalvo) {
            estadoSistema.historico = JSON.parse(historicoSalvo);
            console.log('📚 Histórico carregado:', estadoSistema.historico.length, 'itens');
            return estadoSistema.historico;
        }
        return [];
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        logErro('carregarHistorico', error);
        return [];
    }
}

// ===== UTILITÁRIOS PREMIUM =====
function carregarExemploProfissional() {
    console.log('📋 Carregando exemplo profissional...');
    
    // Exemplo realista: empresa de serviços com bom Fator R
    const exemplo = {
        receita: 420000,
        folha: 117600 // 28% exato
    };
    
    document.getElementById('inputReceita').value = exemplo.receita.toLocaleString('pt-BR');
    document.getElementById('inputFolha').value = exemplo.folha.toLocaleString('pt-BR');
    
    // Atualizar UI
    formatarMoeda(document.getElementById('inputReceita'));
    formatarMoeda(document.getElementById('inputFolha'));
    
    habilitarBotaoCalcular();
    criarNotificacao('Exemplo profissional carregado', 'info');
    
    // Foco no botão calcular
    document.getElementById('btnCalcular').focus();
}

function habilitarBotaoCalcular() {
    const btnCalcular = document.getElementById('btnCalcular');
    const receitaValida = validarCampoEmTempoReal(document.getElementById('inputReceita'));
    const folhaValida = validarCampoEmTempoReal(document.getElementById('inputFolha'));
    
    btnCalcular.disabled = !(receitaValida && folhaValida);
}

function limparCampo(idCampo) {
    const input = document.getElementById(idCampo);
    if (input) {
        input.value = '';
        input.classList.remove('valid', 'invalid');
        input.parentElement.classList.remove('valid', 'invalid');
        input.focus();
        
        criarNotificacao('Campo limpo', 'info');
        atualizarBotaoCalcular();
    }
}

function highlightInput(input) {
    input.parentElement.style.borderColor = 'var(--primary)';
    input.parentElement.style.boxShadow = '0 0 0 3px rgba(3, 69, 191, 0.1)';
}

// ===== SISTEMA DE LOADING =====
function mostrarLoading(titulo, subtitulo = '') {
    estadoSistema.loadingAtivo = true;
    
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const loadingSubtext = document.querySelector('.loading-subtext');
    
    if (overlay) {
        overlay.hidden = false;
        loadingText.textContent = titulo;
        
        if (loadingSubtext && subtitulo) {
            loadingSubtext.textContent = subtitulo;
        }
        
        document.body.style.overflow = 'hidden';
    }
}

function esconderLoading() {
    estadoSistema.loadingAtivo = false;
    
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.hidden = true;
        document.body.style.overflow = 'auto';
    }
}

// ===== NOTIFICAÇÕES PREMIUM =====
function criarNotificacao(mensagem, tipo = 'info') {
    console.log(`🔔 Notificação [${tipo}]: ${mensagem}`);
    
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    const id = 'notif-' + Date.now();
    
    // Configurações por tipo
    const config = {
        success: { icon: '✓', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.95)' },
        error: { icon: '✗', color: 'var(--error)', bg: 'rgba(239, 68, 68, 0.95)' },
        warning: { icon: '⚠', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.95)' },
        info: { icon: 'ℹ', color: 'var(--info)', bg: 'rgba(3, 69, 191, 0.95)' }
    };
    
    const cfg = config[tipo] || config.info;
    
    notification.className = 'notification';
    notification.id = id;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    notification.innerHTML = `
        <div class="notification-icon">${cfg.icon}</div>
        <div class="notification-content">
            <div class="notification-message">${mensagem}</div>
        </div>
        <button class="notification-close" aria-label="Fechar notificação">×</button>
    `;
    
    // Estilos
    notification.style.cssText = `
        background: ${cfg.bg};
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius-md);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.3s ease;
        box-shadow: var(--shadow-lg);
        max-width: 400px;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(10px);
        border-left: 4px solid ${cfg.color};
    `;
    
    // Adicionar ao container
    container.appendChild(notification);
    
    // Configurar evento de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removerNotificacao(id));
    
    // Auto-remover após 5 segundos
    const timeoutId = setTimeout(() => removerNotificacao(id), 5000);
    
    // Armazenar referência
    estadoSistema.notificacoesAtivas.push({ id, timeoutId });
    
    return id;
}

function removerNotificacao(id) {
    const notification = document.getElementById(id);
    if (!notification) return;
    
    // Encontrar e limpar timeout
    const notifIndex = estadoSistema.notificacoesAtivas.findIndex(n => n.id === id);
    if (notifIndex > -1) {
        clearTimeout(estadoSistema.notificacoesAtivas[notifIndex].timeoutId);
        estadoSistema.notificacoesAtivas.splice(notifIndex, 1);
    }
    
    // Animação de saída
    notification.classList.add('fade-out');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ===== SISTEMA DE ERROS =====
function logErro(contexto, erro) {
    const erroLog = {
        timestamp: new Date().toISOString(),
        contexto: contexto,
        mensagem: erro.message,
        stack: erro.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    console.error('🚨 Erro registrado:', erroLog);
    
    // Em produção, enviar para serviço de log
    if (window.ENV === 'production') {
        // fetch('/api/logs', { method: 'POST', body: JSON.stringify(erroLog) });
    }
}

// ===== INICIALIZAÇÃO DE COMPONENTES =====
function inicializarMascaras() {
    // Já configurado nos event listeners
}

function inicializarValidacao() {
    // Já configurado nos event listeners
}

function inicializarTooltips() {
    // Implementação básica de tooltips
    document.querySelectorAll('[title]').forEach(element => {
        element.setAttribute('aria-label', element.title);
    });
}

function verificarSuporteNavegador() {
    const suporta = {
        clipboard: 'clipboard' in navigator,
        share: 'share' in navigator,
        localStorage: 'localStorage' in window,
        sessionStorage: 'sessionStorage' in window
    };
    
    if (!suporta.localStorage) {
        console.warn('⚠️ localStorage não suportado - histórico desabilitado');
        criarNotificacao('Seu navegador não suporta salvamento local', 'warning');
    }
    
    return suporta;
}

function configurarTema() {
    // Verificar preferência do usuário
    const preferenciaEscura = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (preferenciaEscura) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Observer para mudanças de tema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
}

function configurarDragAndDrop() {
    const dropArea = document.getElementById('dropArea');
    if (!dropArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, prevenirComportamentoPadrao, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, destacarAreaDrop, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, removerDestaqueAreaDrop, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
}

function prevenirComportamentoPadrao(e) {
    e.preventDefault();
    e.stopPropagation();
}

function destacarAreaDrop() {
    const dropArea = document.getElementById('dropArea');
    if (dropArea) {
        dropArea.style.borderColor = 'var(--primary)';
        dropArea.style.background = 'rgba(3, 69, 191, 0.05)';
    }
}

function removerDestaqueAreaDrop() {
    const dropArea = document.getElementById('dropArea');
    if (dropArea) {
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
    }
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const fileInput = document.getElementById('fileInput');
        fileInput.files = files;
        previewArquivo(fileInput);
    }
}

// ===== HANDLERS DE EVENTOS =====
function handleModalClick(e) {
    if (e.target.id === 'uploadModal') {
        fecharModalUpload();
    }
}

function handleFileSelect(e) {
    previewArquivo(e.target);
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter para calcular
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calcularFatorR();
    }
    
    // Esc para fechar modal
    if (e.key === 'Escape' && !document.getElementById('uploadModal').hidden) {
        fecharModalUpload();
    }
    
    // Ctrl/Cmd + S para salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        salvarAnalise();
    }
}

function handleBeforeUnload(e) {
    if (estadoSistema.dadosCalculo.dataCalculo && CONFIG.AUTO_SAVE) {
        // Tentar salvar antes de sair
        try {
            salvarNoHistorico(estadoSistema.dadosCalculo);
        } catch (error) {
            console.error('Erro ao salvar antes de sair:', error);
        }
    }
}

// ===== RELÓGIO E STATUS =====
function inicializarRelogio() {
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
}

function atualizarRelogio() {
    const relogioElement = document.getElementById('currentTime');
    if (!relogioElement) return;
    
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    const segundo = agora.getSeconds().toString().padStart(2, '0');
    
    relogioElement.textContent = `${hora}:${minuto}:${segundo}`;
    relogioElement.setAttribute('aria-label', `Hora atual: ${hora} horas, ${minuto} minutos e ${segundo} segundos`);
}

function atualizarStatusSistema(status) {
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        statusDot.classList.remove('active', 'inactive', 'warning');
        statusDot.classList.add(status);
        statusDot.setAttribute('aria-label', `Status do sistema: ${status}`);
    }
}

// ===== FUNÇÕES AUXILIARES =====
function calcularCustoOportunidade(dados) {
    // Cálculo simplificado do custo de oportunidade
    const aliquotaIII = calcularAliquotaAnexoIII(dados.receitaBruta);
    const diferencaAliquotas = dados.aliquotaEfetiva - aliquotaIII;
    return diferencaAliquotas * dados.receitaBruta;
}

// ===== EXPORTAR FUNÇÕES PARA O HTML =====
// Todas as funções necessárias para os eventos do HTML
window.selecionarMetodo = selecionarMetodo;
window.abrirModalUpload = abrirModalUpload;
window.fecharModalUpload = fecharModalUpload;
window.carregarExemploProfissional = carregarExemploProfissional;
window.formatarMoeda = formatarMoeda;
window.highlightInput = highlightInput;
window.validarInput = validarCampo; // Compatibilidade
window.limparCampo = limparCampo;
window.calcularFatorR = calcularFatorR;
window.previewArquivo = previewArquivo;
window.removerArquivo = removerArquivo;
window.processarExtratoPDF = processarExtratoPDF;
window.limparCalculadora = limparCalculadora;
window.gerarRelatorioPDF = gerarRelatorioPDF;
window.salvarAnalise = salvarAnalise;
window.compartilharAnalise = compartilharAnalise;

console.log('🎯 Sistema Fator R Pro Premium carregado com sucesso!');