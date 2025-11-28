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