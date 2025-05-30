// Serviço de autenticação
const API_URL = 'https://anime-project-server.onrender.com';

// Função para salvar o token
export const saveToken = (token) => {
    console.log('Salvando token:', token);
    localStorage.setItem('token', token);
};

// Função para obter o token
export const getToken = () => {
    const token = localStorage.getItem('token');
    console.log('Token obtido:', token);
    return token;
};

// Função para remover o token
export const removeToken = () => {
    console.log('Removendo token');
    localStorage.removeItem('token');
};

// Função para verificar se está autenticado
export const isAuthenticated = () => {
    const token = getToken();
    console.log('Verificando autenticação:', !!token);
    return !!token;
};

// Função para fazer login
export const login = async (username, password) => {
    try {
        console.log('Tentando fazer login para:', username);
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Resposta do login:', data);
        
        if (response.ok) {
            saveToken(data.token);
            return data;
        } else {
            throw new Error(data.error || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
};

// Função para fazer logout
export const logout = async () => {
    try {
        const token = getToken();
        console.log('Tentando fazer logout com token:', token);
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
        console.log('Tentando obter dados do usuário com token:', token);
        
        if (!token) {
            throw new Error('Não autenticado');
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Resposta do /me:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na resposta:', errorData);
            throw new Error(errorData.message || 'Erro ao obter dados do usuário');
        }

        const data = await response.json();
        console.log('Dados do usuário obtidos:', data);
        return data;
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        throw error;
    }
}; 