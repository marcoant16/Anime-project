import { login, logout, getUserData, isAuthenticated } from '../services/auth';

// Efeito para carregar os animes e verificar login
useEffect(() => {
    const initializeApp = async () => {
        try {
            // Carregar animes
            await pegar();
            
            // Verificar status do login
            if (isAuthenticated()) {
                console.log('Usuário está autenticado, buscando dados...');
                const data = await getUserData();
                console.log('Dados do usuário recebidos:', data);
                
                if (data.user) {
                    // Garantir que a URL da imagem está completa
                    if (data.user.profileImage) {
                        data.user.profileImage = data.user.profileImage.startsWith('http') 
                            ? data.user.profileImage 
                            : `${API_URL}${data.user.profileImage}`;
                    }
                    
                    setUserData(data.user);
                    setIsLoggedIn(true);
                    
                    // Atualizar a imagem do usuário no header
                    const userImage = document.getElementById('userimage');
                    if (userImage && data.user.profileImage) {
                        userImage.src = data.user.profileImage;
                    }
                }
            } else {
                console.log('Usuário não está autenticado');
                setUserData(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Erro ao inicializar app:', error);
            setUserData(null);
            setIsLoggedIn(false);
            // Resetar a imagem do usuário para a padrão em caso de erro
            const userImage = document.getElementById('userimage');
            if (userImage) {
                userImage.src = "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg";
            }
        }
    };

    initializeApp();
}, []);

const handleLogin = async (e) => {
    e.preventDefault();
    try {
        console.log('Iniciando processo de login...');
        const data = await login(loginForm.username, loginForm.password);
        console.log('Login bem sucedido:', data);
        
        // Garantir que a URL da imagem está completa
        if (data.user.profileImage) {
            data.user.profileImage = data.user.profileImage.startsWith('http') 
                ? data.user.profileImage 
                : `${API_URL}${data.user.profileImage}`;
        }
        
        setUserData(data.user);
        setIsLoggedIn(true);
        // Atualizar a imagem do usuário no header
        const userImage = document.getElementById('userimage');
        if (userImage && data.user.profileImage) {
            userImage.src = data.user.profileImage;
        }
        setError('');
    } catch (error) {
        console.error('Erro no login:', error);
        setError(error.message || 'Erro ao fazer login');
    }
};

const handleLogout = async () => {
    try {
        console.log('Iniciando processo de logout...');
        await logout();
        console.log('Logout realizado com sucesso');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        setUserData(null);
        setIsLoggedIn(false);
        // Resetar a imagem do usuário para a padrão
        const userImage = document.getElementById('userimage');
        if (userImage) {
            userImage.src = "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg";
        }
    }
}; 