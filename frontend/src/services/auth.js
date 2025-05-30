// Serviço de autenticação
const API_URL = 'https://anime-project-server.onrender.com';

// Função para salvar o token
export const saveToken = (token) => {
    localStorage.setItem('token', token);
};

// Função para obter o token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Função para remover o token
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Função para verificar se está autenticado
export const isAuthenticated = () => {
    return !!getToken();
};

// Função para fazer login
export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            saveToken(data.token);
            return data;
        } else {
            throw new Error(data.error || 'Erro ao fazer login');
        }
    } catch (error) {
        throw error;
    }
};

// Função para fazer logout
export const logout = async () => {
    try {
        const token = getToken();
        if (token) {
            await fetch(`${API_URL}/api/users/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        removeToken();
    }
};

// Função para obter dados do usuário
export const getUserData = async () => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Não autenticado');
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao obter dados do usuário');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}; 