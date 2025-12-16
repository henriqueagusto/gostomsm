class FatorRLogin {
    constructor() {
        this.API_URL = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.testBackendConnection();
    }

    async testBackendConnection() {
        try {
            const response = await fetch(`${this.API_URL}/health`);
            const data = await response.json();
            console.log('✅ Backend conectado:', data);
            this.showNotification('Sistema conectado com sucesso', 'success');
        } catch (error) {
            console.error('❌ Backend offline:', error);
            this.showNotification('Erro ao conectar com o servidor', 'error');
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Client access button
        const clientBtn = document.querySelector('.client-btn');
        if (clientBtn) {
            clientBtn.addEventListener('click', () => this.showClientAccess());
        }

        // Modal close
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeClientAccess());
        }

        // Input masks
        this.setupInputMasks();
    }

    setupInputMasks() {
        // CNPJ mask for client form
        const cnpjInput = document.querySelector('#clientModal input[type="text"]');
        if (cnpjInput) {
            cnpjInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 14) {
                    value = value.replace(/(\d{2})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1/$2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                    e.target.value = value;
                }
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const button = form.querySelector('.login-btn');
        const email = form.querySelector('input[type="email"]').value;
        const senha = form.querySelector('input[type="password"]').value;

        // Validação básica
        if (!email || !senha) {
            this.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        this.setLoadingState(button, true);

        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Login realizado com sucesso!', 'success');
                // Aqui vamos redirecionar para o dashboard depois
                console.log('Usuário logado:', data.usuario);
            } else {
                this.showNotification(data.error || 'Erro no login', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showNotification('Erro de conexão com o servidor', 'error');
        } finally {
            this.setLoadingState(button, false);
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.querySelector('.btn-text').textContent = 'Conectando...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            button.querySelector('.btn-text').textContent = 'Continuar';
        }
    }

    showClientAccess() {
        document.getElementById('clientModal').classList.add('active');
    }

    closeClientAccess() {
        document.getElementById('clientModal').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FatorRLogin();
});

// ============================================
// SISTEMA DE AUTENTICAÇÃO FATOR R PRO
// ============================================

// Variáveis globais
let usuariosData = [];
let tentativasLogin = 0;
const MAX_TENTATIVAS = 5;

// ============================================
// FUNÇÕES PRINCIPAIS DE LOGIN
// ============================================

// Carrega os usuários do arquivo JSON
async function carregarUsuarios() {
    try {
        console.log('Carregando usuários do sistema...');
        const response = await fetch('usuarios.json');
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: Não foi possível carregar os usuários`);
        }
        
        const data = await response.json();
        usuariosData = data.usuarios;
        console.log(`${usuariosData.length} usuários carregados com sucesso!`);
        return usuariosData;
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar base de usuários. Usando modo offline.', 'warning');
        
        // Fallback para usuários básicos
        usuariosData = [
            {
                id: 1,
                nome: "Administrador",
                email: "admin@fatorrpro.com",
                usuario: "admin.pro",
                senha: "Admin@2024",
                perfil: "administrador",
                ativo: true
            },
            {
                id: 6,
                nome: "Cliente Demo",
                email: "cliente@empresa.com",
                usuario: "demo.cliente",
                senha: "Demo@2024",
                perfil: "cliente",
                ativo: true
            }
        ];
        
        return usuariosData;
    }
}

// Valida o login do usuário
async function validarLogin(emailOuUsuario, senha) {
    // Verificar se o número de tentativas foi excedido
    if (tentativasLogin >= MAX_TENTATIVAS) {
        return {
            sucesso: false,
            mensagem: "Número máximo de tentativas excedido. Tente novamente em 15 minutos."
        };
    }
    
    // Carregar usuários se ainda não carregou
    if (usuariosData.length === 0) {
        await carregarUsuarios();
    }
    
    console.log(`Tentativa de login: ${emailOuUsuario}`);
    
    // Buscar usuário por email OU nome de usuário
    const usuario = usuariosData.find(user => 
        (user.email.toLowerCase() === emailOuUsuario.toLowerCase() ||
         user.usuario.toLowerCase() === emailOuUsuario.toLowerCase()) &&
        user.ativo === true
    );
    
    if (!usuario) {
        tentativasLogin++;
        return {
            sucesso: false,
            mensagem: "Usuário não encontrado ou inativo"
        };
    }
    
    // Verificar senha
    if (usuario.senha !== senha) {
        tentativasLogin++;
        const tentativasRestantes = MAX_TENTATIVAS - tentativasLogin;
        
        return {
            sucesso: false,
            mensagem: `Senha incorreta. ${tentativasRestantes > 0 ? 
                `${tentativasRestantes} tentativa(s) restante(s)` : 
                'Conta bloqueada temporariamente'}`
        };
    }
    
    // Login bem-sucedido
    tentativasLogin = 0; // Resetar contador
    
    console.log(`Login bem-sucedido: ${usuario.nome} (${usuario.perfil})`);
    
    return {
        sucesso: true,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            usuario: usuario.usuario,
            perfil: usuario.perfil,
            departamento: usuario.departamento,
            cargo: usuario.cargo,
            empresa: usuario.empresa,
            acessos: usuario.acessos || []
        },
        mensagem: `Bem-vindo(a), ${usuario.nome}!`
    };
}

// Processa o formulário de login
async function processarLogin(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');
    const manterConectado = document.querySelector('input[type="checkbox"]').checked;
    
    const emailOuUsuario = emailInput.value.trim();
    const senha = passwordInput.value;
    
    // Validação básica
    if (!emailOuUsuario || !senha) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    // Mostrar estado de carregamento
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    try {
        // Validar credenciais
        const resultado = await validarLogin(emailOuUsuario, senha);
        
        if (resultado.sucesso) {
            // Login bem-sucedido
            showNotification(resultado.mensagem, 'success');
            
            // Salvar sessão
            salvarSessaoUsuario(resultado.usuario, manterConectado);
            
            // Simular redirecionamento
            setTimeout(() => {
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                
                // Aqui você redirecionaria para o dashboard
                // window.location.href = 'dashboard.html';
                
                // Por enquanto, apenas mostramos uma mensagem
                showNotification(`Redirecionando para o dashboard... (${resultado.usuario.perfil})`, 'info');
                
                // Resetar formulário
                event.target.reset();
                
            }, 2000);
            
        } else {
            // Login falhou
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            showNotification(resultado.mensagem, 'error');
            
            // Efeito visual de erro
            passwordInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
            
            // Limpar senha
            passwordInput.value = '';
            passwordInput.focus();
        }
        
    } catch (error) {
        console.error('Erro no processamento:', error);
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        showNotification('Erro interno no sistema. Tente novamente.', 'error');
    }
}

// Salvar sessão do usuário
function salvarSessaoUsuario(usuario, manterConectado) {
    const sessao = {
        usuario: usuario,
        timestamp: new Date().getTime(),
        expira: manterConectado ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000 // 7 dias ou 2 horas
    };
    
    localStorage.setItem('fatorRProSessao', JSON.stringify(sessao));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    
    console.log(`Sessão salva para: ${usuario.nome}`);
}

// Verificar se já existe sessão ativa
function verificarSessaoAtiva() {
    const sessaoStr = localStorage.getItem('fatorRProSessao');
    
    if (sessaoStr) {
        try {
            const sessao = JSON.parse(sessaoStr);
            const agora = new Date().getTime();
            
            if (agora - sessao.timestamp < sessao.expira) {
                // Sessão ainda válida
                console.log('Sessão ativa encontrada:', sessao.usuario.nome);
                return sessao.usuario;
            } else {
                // Sessão expirada
                localStorage.removeItem('fatorRProSessao');
                localStorage.removeItem('usuarioLogado');
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        }
    }
    
    return null;
}

// ============================================
// FUNÇÕES DE INTERFACE E UTILITÁRIAS
// ============================================

// Mostrar/ocultar senha
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
        eyeIcon.title = 'Ocultar senha';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
        eyeIcon.title = 'Mostrar senha';
    }
}

// Modal de acesso cliente
function showClientAccess() {
    document.getElementById('clientModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

function closeClientAccess() {
    document.getElementById('clientModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Simular busca de CNPJ
function searchCNPJ() {
    const cnpjInput = document.getElementById('cnpj');
    const cnpj = cnpjInput.value.replace(/\D/g, '');
    
    if (cnpj.length !== 14) {
        showNotification('CNPJ inválido. Digite 14 números.', 'error');
        cnpjInput.focus();
        return;
    }
    
    showNotification('Consultando CNPJ na Receita Federal...', 'info');
    
    // Simulação de consulta com delay
    setTimeout(() => {
        // Exemplo de resposta simulada
        const empresasSimuladas = {
            '12345678000199': 'Tech Solutions LTDA',
            '98765432000100': 'Contabilidade Excelência',
            '11111111000191': 'Indústrias ABC SA',
            '22222222000192': 'Comércio XYZ Ltda'
        };
        
        const empresa = empresasSimuladas[cnpj] || `Empresa CNPJ: ${cnpj}`;
        
        showNotification(`CNPJ encontrado: ${empresa}`, 'success');
        
        // Preencher automaticamente se for empresa conhecida
        if (empresasSimuladas[cnpj]) {
            document.getElementById('accessCode').value = 'DEMO-' + cnpj.substring(0, 8);
        }
        
    }, 2000);
}

// Sistema de notificações
function showNotification(mensagem, tipo = 'info') {
    const notifications = document.getElementById('notifications');
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    
    // Ícone baseado no tipo
    let icon = 'info-circle';
    if (tipo === 'success') icon = 'check-circle';
    if (tipo === 'error') icon = 'exclamation-circle';
    if (tipo === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${mensagem}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao container
    notifications.appendChild(notification);
    
    // Efeito de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Validar formulário de cliente (modal)
function processarAcessoCliente(event) {
    event.preventDefault();
    
    const cnpj = document.getElementById('cnpj').value;
    const birthdate = document.getElementById('birthdate').value;
    
    if (!cnpj || !birthdate) {
        showNotification('Preencha o CNPJ e a data de nascimento', 'error');
        return;
    }
    
    showNotification('Validando acesso de cliente...', 'info');
    
    setTimeout(() => {
        showNotification('Acesso cliente em desenvolvimento. Use o login principal.', 'info');
        closeClientAccess();
    }, 2000);
}

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Fator R Pro inicializando...');
    
    // Carregar usuários ao iniciar
    carregarUsuarios();
    
    // Verificar se já tem usuário logado
    const usuarioAtivo = verificarSessaoAtiva();
    if (usuarioAtivo) {
        console.log('Usuário já logado:', usuarioAtivo.nome);
        document.getElementById('email').value = usuarioAtivo.email;
        showNotification(`Bem-vindo de volta, ${usuarioAtivo.nome}!`, 'info');
    }
    
    // Configurar formulário de login principal
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', processarLogin);
    }
    
    // Configurar formulário de acesso cliente (modal)
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', processarAcessoCliente);
    }
    
    // Configurar botão "Esqueceu a senha?"
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Sistema de recuperação em desenvolvimento. Contate o administrador.', 'info');
        });
    }
    
    // Configurar botão parceiro
    const partnerBtn = document.querySelector('.partner-access-btn');
    if (partnerBtn) {
        partnerBtn.addEventListener('click', function() {
            showNotification('Acesso parceiro em desenvolvimento. Use as credenciais de parceiro no login principal.', 'info');
        });
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeClientAccess();
            }
        });
    }
    
    // Adicionar máscaras aos inputs
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 14) value = value.substring(0, 14);
            
            if (value.length > 12) {
                value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
            } else if (value.length > 8) {
                value = value.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
            } else if (value.length > 5) {
                value = value.replace(/(\d{2})(\d{3})/, "$1.$2");
            }
            
            e.target.value = value;
        });
    }
    
    const birthdateInput = document.getElementById('birthdate');
    if (birthdateInput) {
        birthdateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);
            
            if (value.length > 4) {
                value = value.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{2})/, "$1/$2");
            }
            
            e.target.value = value;
        });
    }
    
    console.log('Sistema inicializado com sucesso!');
});

// ============================================
// ANIMAÇÕES CSS DINÂMICAS
// ============================================

// Adicionar animação shake dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .notification {
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);