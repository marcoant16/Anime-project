//css
import "../paginainicio/inicio.css"
import "../paginainicio/iniciorespon.css"
import { useState, useEffect, useRef } from "react"
import { API_URL } from '../config';

//svg
import Heart from "../svgglobal/heart/heart";

function Inicio(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [animeTitles, setAnimeTitles] = useState([]);
    const [animeImages, setAnimeImages] = useState([]);
    const [animeSinopse,setAnimeSinopse] = useState([]);
    const [animeYoutube,setAnimeYoutube] = useState([]);
    const [animeGenero,setAnimeGenero] = useState([]);
    const [animeNota,setAnimeNota] = useState([]);
    const [animeAno,setAnimeAno] = useState([]);
    const [animeEp,setAnimeEp] = useState([]);
    const [expandedCard, setExpandedCard] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAnime, setSelectedAnime] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

    /////slide//////
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);
    const totalSlides = 4;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleCardExpand = (index) => {
        setExpandedCard(expandedCard === index ? null : index);
    };


   /////pesquisa de anime

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        setSearchResults([]);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}&sfw=false`);
            const data = await response.json();
            setSearchResults(data.data);
        } catch (error) {
            console.error('Erro na busca:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    /////////

    // Função para mudar o slide
    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Efeito para o slider automático
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    // Efeito para atualizar a posição do slider
    useEffect(() => {
        if (sliderRef.current) {
            sliderRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
    }, [currentSlide]);

    // Efeito para carregar os animes
    useEffect(() => {
        pegar();
    }, []);

    ///////////

    ///pegar animes famosos///
    async function pegar(){
        try {
            const resposta = await fetch('https://api.jikan.moe/v4/top/anime');
            const resp = await resposta.json();
            console.log(resp)
            
            // Gerar 3 índices aleatórios diferentes (excluindo o 0)
            const indices = [0]; // Começa com o índice 0
            while(indices.length < 4) {
                const randomIndex = Math.floor(Math.random() * (24 - 1 + 1)) + 1; // Gera números entre 1 e 24
                if (!indices.includes(randomIndex)) {
                    indices.push(randomIndex);
                }
            }
            
            // Pegar os títulos e imagens dos animes nos índices
            const titles = indices.map(index => resp.data[index].title);
            const images = indices.map(index => resp.data[index].images.jpg.large_image_url);
            const sinopse = indices.map(index => resp.data[index].synopsis);
            const aniyoutube = indices.map(index => resp.data[index].trailer.embed_url);
            const genero = indices.map(index => resp.data[index].genres[0].name);
            const nota = indices.map(index => resp.data[index].score);
            const ano = indices.map(index => resp.data[index].year);
            const ep = indices.map(index => resp.data[index].episodes);
            
            setAnimeTitles(titles);
            setAnimeImages(images);
            setAnimeSinopse(sinopse);
            setAnimeYoutube(aniyoutube);
            setAnimeGenero(genero);
            setAnimeNota(nota);
            setAnimeAno(ano);
            setAnimeEp(ep);
            
        } catch (error) {
            console.error(`Deu erro:${error.message},verifique:${error.stack}`)
        }
    }

    const handleAnimeClick = (anime) => {
        setSelectedAnime(anime);
    };

    const closeAnimeDetails = () => {
        setSelectedAnime(null);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(loginForm)
            });
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                // Buscar dados completos do usuário após o login
                const userResponse = await fetch(`${API_URL}/api/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });
                const userData = await userResponse.json();
                if (userResponse.ok && userData.user) {
                    // Garantir que a URL da imagem está completa
                    if (userData.user.profileImage) {
                        userData.user.profileImage = userData.user.profileImage.startsWith('http') 
                            ? userData.user.profileImage 
                            : `${API_URL}${userData.user.profileImage}`;
                    }
                    
                    setUserData(userData.user);
                    setIsLoggedIn(true);
                    // Atualizar a imagem do usuário no header
                    const userImage = document.getElementById('userimage');
                    if (userImage && userData.user.profileImage) {
                        userImage.src = userData.user.profileImage;
                    }
                }
                setError('');
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Erro ao fazer login');
            console.error(error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(registerForm)
            });
            const data = await response.json();
            
            if (response.ok) {
                setError('');
                setIsRegistering(false);
                setLoginForm({ username: registerForm.username, password: '' });
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError('Erro ao registrar');
            console.error(e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserData(null);
        setIsLoggedIn(false);
        // Resetar a imagem do usuário para a padrão
        const userImage = document.getElementById('userimage');
        if (userImage) {
            userImage.src = "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg";
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/api/users/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                // Modificar a URL da imagem para usar a API_URL
                const imageUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `${API_URL}${data.imageUrl}`;
                setUserData({ ...userData, profileImage: imageUrl });
                const userImage = document.getElementById('userimage');
                if (userImage) {
                    userImage.src = imageUrl;
                }
            }
        } catch (error) {
            setError('Erro ao fazer upload da imagem');
            console.error(error);
        }
    };

    // Verificar login ao carregar a página
    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/api/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error('Erro ao verificar login');
                    }
                    
                    const data = await response.json();
                    if (data.user) {
                        // Garantir que a URL da imagem está completa
                        if (data.user.profileImage) {
                            // Se a URL já começa com http, mantém como está
                            // Se não, adiciona a API_URL
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
                } catch (error) {
                    console.error('Erro ao verificar login:', error);
                    localStorage.removeItem('token');
                    setUserData(null);
                    setIsLoggedIn(false);
                    // Resetar a imagem do usuário para a padrão em caso de erro
                    const userImage = document.getElementById('userimage');
                    if (userImage) {
                        userImage.src = "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg";
                    }
                }
            }
        };

        checkLoginStatus();
    }, []);

    // Função para carregar os favoritos
    const loadFavorites = async () => {
        if (!isLoggedIn) {
            alert('Por favor, faça login para ver seus favoritos');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/favoritos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFavorites(data);
                setIsFavoritesOpen(true);
            }
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            alert('Erro ao carregar favoritos');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
            try {
                const response = await fetch(`${API_URL}/api/users/delete-account`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    // Limpar dados locais
                    localStorage.removeItem('token');
                    setUserData(null);
                    setIsLoggedIn(false);
                    // Resetar a imagem do usuário para a padrão
                    const userImage = document.getElementById('userimage');
                    if (userImage) {
                        userImage.src = "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg";
                    }
                    // Fechar o perfil
                    setIsProfileOpen(false);
                    alert('Conta deletada com sucesso');
                } else {
                    const data = await response.json();
                    alert(data.error || 'Erro ao deletar conta');
                }
            } catch (error) {
                console.error('Erro ao deletar conta:', error);
                alert('Erro ao deletar conta');
            }
        }
    };

    const styles = {
        profileImage: {
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #fff',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        },
        profilePicturePlaceholder: {
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: '#666'
        }
    };

    return(
        <>
          <section className="kiana">
              <header className="kianaheader">
                  <div className="textheaderki">
                      <h1>gaystation</h1>
                  </div>

                  <nav className="kinav">
                      <div className="userimagecont">
                         <img id="userimage" src="https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg" alt="user-image" />
                      </div>

                      <div className="kioptionscont">
                          <div className={`buthamburg ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                             <span className={`barra barraOne ${isMenuOpen ? 'barmoveOne' : ''}`}></span>
                             <span className={`barra barraTwo ${isMenuOpen ? 'barmoveTwo' : ''}`}></span>
                             <span className={`barra barraThree ${isMenuOpen ? 'barraNull' : ''}`}></span>
                          </div>

                          <ul className="optionsdefault">
                             <li onClick={toggleProfile}>View profile</li>
                             <li onClick={loadFavorites}>Favorites</li>
                             <li className="libusc" onClick={toggleSearch}><span className="spabusc"></span></li>
                          </ul>

                          <ul className={`optionscell ${isMenuOpen ? 'active' : ''}`}>
                             <li onClick={toggleProfile}>View profile</li>
                             <li onClick={loadFavorites}>Favorites</li>
                             <li className="libusc" onClick={toggleSearch}><span className="spabusc"></span></li>
                          </ul>
                      </div>
                  </nav>
              </header>

              <div id="carfamocont" className="cardscont">
                  <div className="carfamotextcont">
                    <h2>Famous Animes</h2>
                  </div>

                  <div className="cardscfam">
                    <div className="cardscfamslider" ref={sliderRef}>
                        {animeTitles.map((title, index) => (
                            <div className="card" key={index}>
                                <div className="cardimagecont" style={{backgroundImage: `url(${animeImages[index] || "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg"})`,backgroundSize: 'cover',backgroundPosition: 'center'}}></div>
                                <div className="cardinfo1">
                                    <h2 className="cardname1">{title}</h2>
                                    <span className="cardexpandir" onClick={() => toggleCardExpand(index)}>clique</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cardscfamsliderpontos">
                        {[...Array(totalSlides)].map((_, index) => (<span  key={index} className={`butslider ${currentSlide === index ? 'active' : ''}`} onClick={() => goToSlide(index)}/>))}
                    </div>
                  </div>

                  {expandedCard !== null && (
                    <div className="cardinfo2-overlay">
                        <div className={`cardinfo2 active`}>
                            <button className="close-button" onClick={() => setExpandedCard(null)}>×</button>
                            <div className="cardframecont">
                                <iframe className="cari2frame" src={animeYoutube[expandedCard] || "https://www.youtube.com/embed/CmCIZ_aUAeQ?si=WoXAXCNFAfA5pNlG"} title="YouTube video player"  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
                            </div>

                            <div className="cardinfo2minicont">
                                <h2 className="cardname2">{animeTitles[expandedCard]}</h2>
                                <span className="notacont">{animeNota[expandedCard]}</span>
                            </div>

                            <div className="cardinfo2sinocont">
                                <p className="cardinfo2sinopse">{animeSinopse[expandedCard]}</p>
                            </div>

                            <div className="cardsinfocont2final">
                                <div className="cardinfo2minicont2">
                                    <p className="episop">Episodes:<span>{animeEp[expandedCard] || "unknown"}</span></p>
                                    <p className="genp">Gender:<span>{animeGenero[expandedCard] || "unknown"}</span></p>
                                    <p className="anop">Year:<span>{animeAno[expandedCard] || "unknown"}</span></p>
                                </div>
                                
                                <div className="carin2avalicont">
                                    <Heart animeData={{
                                        mal_id: animeTitles[expandedCard],
                                        title: animeTitles[expandedCard],
                                        images: {
                                            jpg: {
                                                large_image_url: animeImages[expandedCard]
                                            }
                                        },
                                        synopsis: animeSinopse[expandedCard]
                                    }}/>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {isSearchOpen && (
                    <div className="search-overlay">
                        <div className="search-container">
                            <button className="close-search" onClick={toggleSearch}>×</button>

                            <div className="search-bar">
                                <input  type="text" placeholder="Pesquisar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyUp={handleKeyPress}/>
                                <button className="search-button" onClick={handleSearch}>Buscar</button>
                            </div>

                            <div className="search-results">
                                {searchResults.map((anime, index) => (
                                    <div key={index} className="search-result-item" onClick={() => handleAnimeClick(anime)}>
                                        <div className="search-result-image"style={{backgroundImage: `url(${anime.images.jpg.image_url})`,backgroundSize: 'cover',backgroundPosition: 'center'}}/>

                                        <div className="search-result-info">
                                            <h3>{anime.title}</h3>
                                            <p>{anime.synopsis?.substring(0, 150)}...</p>
                                            <div className="search-result-details">
                                                <span>Nota: {anime.score}</span>
                                                <span>Episódios: {anime.episodes}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  )}

                  {selectedAnime && (
                    <div className="anime-details-overlay">
                        <div className="anime-details-container">
                            <button className="close-details" onClick={closeAnimeDetails}>×</button>
                            
                            <div className="anime-details-header">
                                <div className="anime-details-image" style={{backgroundImage: `url(${selectedAnime.images.jpg.large_image_url})`, backgroundSize: 'cover',backgroundPosition: 'center' }}/>
                               
                                <div className="anime-details-info">
                                    <h2>{selectedAnime.title}</h2>

                                    <div className="anime-details-stats">
                                        <span className="anime-score">Nota: {selectedAnime.score}</span>
                                        <span className="anime-episodes">Episódios: {selectedAnime.episodes}</span>
                                        <span className="anime-year">Ano: {selectedAnime.year}</span>
                                        <span className="anime-status">Status: {selectedAnime.status}</span>
                                    </div>

                                    <Heart animeData={selectedAnime}/>
                                </div>
                            </div>

                            <div className="anime-details-content">
                                <div className="anime-trailer">
                                    {selectedAnime.trailer?.embed_url ? (
                                        <iframe  src={selectedAnime.trailer.embed_url} title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                                    ) : (
                                        <div className="no-trailer">Trailer não disponível</div>
                                    )}
                                </div>

                                <div className="anime-synopsis">
                                    <h3>Sinopse</h3>
                                    <p>{selectedAnime.synopsis}</p>
                                </div>

                                <div className="anime-genres">
                                    <h3>Gêneros</h3>
                                    <div className="genre-tags">
                                        {selectedAnime.genres?.map((genre, index) => (
                                            <span key={index} className="genre-tag">{genre.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {isProfileOpen && (
                    <div className="profile-overlay">
                        <div className="profile-container">
                            <button className="close-profile" onClick={toggleProfile}>×</button>
                            
                            {isLoggedIn && userData ? (
                                <div className="profile-content">
                                    <div className="profile-header">
                                        <div className="profile-image-container">
                                            <div className="profile-image">
                                                {userData.profileImage ? (
                                                    <img 
                                                        src={userData.profileImage} 
                                                        alt="Foto de perfil" 
                                                        className="profile-picture"
                                                        style={styles.profileImage}
                                                    />
                                                ) : (
                                                    <div className="profile-picture-placeholder" style={styles.profilePicturePlaceholder}>
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <label className="image-upload-label">
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleImageUpload}
                                                    style={{ display: 'none' }}
                                                />
                                                <span className="upload-icon">📷</span>
                                            </label>
                                        </div>
                                        <div className="profile-info">
                                            <h2>{userData.username}</h2>
                                            <p>{userData.email}</p>
                                        </div>
                                    </div>
                                    <div className="profile-actions">
                                        <button className="logout-button" onClick={handleLogout}>Sair</button>
                                        <button className="delete-account-button" onClick={handleDeleteAccount}>Deletar Conta</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="auth-content">
                                    {error && <div className="error-message">{error}</div>}
                                    
                                    {isRegistering ? (
                                        <form onSubmit={handleRegister} className="auth-form">
                                            <h2>Registrar</h2>
                                            <input
                                                type="text"
                                                placeholder="Nome de usuário"
                                                value={registerForm.username}
                                                onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={registerForm.email}
                                                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                            />
                                            <input
                                                type="password"
                                                placeholder="Senha"
                                                value={registerForm.password}
                                                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                            />
                                            <button type="submit">Registrar</button>
                                            <p>
                                                Já tem uma conta? 
                                                <button 
                                                    type="button" 
                                                    className="switch-auth"
                                                    onClick={() => setIsRegistering(false)}
                                                >
                                                    Fazer login
                                                </button>
                                            </p>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleLogin} className="auth-form">
                                            <h2>Login</h2>
                                            <input
                                                type="text"
                                                placeholder="Nome de usuário"
                                                value={loginForm.username}
                                                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                                            />
                                            <input
                                                type="password"
                                                placeholder="Senha"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                            />
                                            <button type="submit">Entrar</button>
                                            <p>
                                                Não tem uma conta? 
                                                <button 
                                                    type="button" 
                                                    className="switch-auth"
                                                    onClick={() => setIsRegistering(true)}
                                                >
                                                    Registrar
                                                </button>
                                            </p>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                  )}

                  {isFavoritesOpen && (
                    <div className="favorites-overlay">
                        <div className="favorites-container">
                            <button className="close-favorites" onClick={() => setIsFavoritesOpen(false)}>×</button>
                            <h2>Meus Favoritos</h2>
                            <div className="favorites-grid">
                                {favorites.map((favorite) => (
                                    <div key={favorite._id} className="favorite-card">
                                        <div 
                                            className="favorite-image" 
                                            style={{
                                                backgroundImage: `url(${favorite.image_url})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                        <div className="favorite-info">
                                            <h3>{favorite.title}</h3>
                                            <p>{favorite.synopsis?.substring(0, 150)}...</p>
                                            <button 
                                                className="remove-favorite"
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(`${API_URL}/api/favoritos/${favorite._id}`, {
                                                            method: 'DELETE',
                                                            headers: {
                                                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                            }
                                                        });
                                                        if (response.ok) {
                                                            setFavorites(favorites.filter(f => f._id !== favorite._id));
                                                        }
                                                    } catch (error) {
                                                        console.error('Erro ao remover favorito:', error);
                                                        alert('Erro ao remover favorito');
                                                    }
                                                }}
                                            >
                                                Remover dos favoritos
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  )}

              </div>
          </section> 
        </>
    )
}

export default Inicio