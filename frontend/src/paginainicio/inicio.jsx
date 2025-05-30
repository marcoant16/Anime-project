import { login, logout, getUserData, isAuthenticated } from '../services/auth';

// Efeito para carregar os animes e verificar login
useEffect(() => {
    const initializeApp = async () => {
        // Carregar animes
        await pegar();
        
        // Verificar status do login
        try {
            if (isAuthenticated()) {
                const data = await getUserData();
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
            }
        } catch (error) {
            console.error('Erro ao verificar login:', error);
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
        const data = await login(loginForm.username, loginForm.password);
        
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
        setError(error.message || 'Erro ao fazer login');
        console.error(error);
    }
};

const handleLogout = async () => {
    try {
        await logout();
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