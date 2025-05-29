//css
import "../paginainicio/inicio.css"
import "../paginainicio/iniciorespon.css"
import { useState, useEffect, useRef } from "react"
import { API_URL } from '../config';
import Modal from '../components/Modal';

//svg
import Heart from "../svgglobal/heart/heart";
import Lupa from "../svgglobal/pesquisa/lupa";
import Seta from "../svgglobal/seta/seta";
import Sakura from "../svgglobal/sakura/sakura";
import X from "../svgglobal/x/x";

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
    const [animeMalIds, setAnimeMalIds] = useState([]);
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
    const [isLoading, setIsLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

    /////slide//////
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const sliderRef = useRef(null);
    const totalSlides = 4;

    // Estado do modal customizado
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: null,
        onClose: null,
        confirmText: 'OK',
        cancelText: 'Cancelar',
    });

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleCardExpand = (index) => {
        if (expandedCard === null) {
            handleOverlayOpen('cardExpand');
        }
        setExpandedCard(expandedCard === index ? null : index);
    };


   /////pesquisa de anime

    const toggleSearch = () => {
        if (!isSearchOpen) {
            handleOverlayOpen('search');
        }
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

    // Funções para controle de touch
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }
        if (isRightSwipe) {
            setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        }

        // Resetar os valores
        setTouchStart(null);
        setTouchEnd(null);
    };

    // Efeito para o slider automático e atualização da posição
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 12000);

        // Atualiza a posição do slider quando currentSlide mudar
        if (sliderRef.current) {
            sliderRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        return () => clearInterval(interval);
    }, [currentSlide, totalSlides]);

    // Efeito para carregar os animes e verificar login
    useEffect(() => {
        const initializeApp = async () => {
            // Carregar animes
            await pegar();
            
            // Verificar status do login
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

        initializeApp();
    }, []);

    ///pegar animes famosos///
    async function pegar(){
        try {
            const resposta = await fetch('https://api.jikan.moe/v4/top/anime');
            const resp = await resposta.json();
            
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
            const malIds = indices.map(index => resp.data[index].mal_id); // Adicionando mal_id
            
            setAnimeTitles(titles);
            setAnimeImages(images);
            setAnimeSinopse(sinopse);
            setAnimeYoutube(aniyoutube);
            setAnimeGenero(genero);
            setAnimeNota(nota);
            setAnimeAno(ano);
            setAnimeEp(ep);
            setAnimeMalIds(malIds); // Novo state para armazenar mal_ids
            
        } catch (error) {
            console.error(`Deu erro:${error.message},verifique:${error.stack}`)
        }
    }

    const handleAnimeClick = (anime) => {
        setSelectedAnime(anime);
        handleOverlayOpen('animeDetails');
    };

    const closeAnimeDetails = () => {
        setSelectedAnime(null);
        window.history.back();
    };

    const toggleProfile = () => {
        if (!isProfileOpen) {
            handleOverlayOpen('profile');
        }
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
        setIsLoading(true);
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
            setError('Error registering');
            console.error(e);
        } finally {
            setIsLoading(false);
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
            setError('Error uploading image');
            console.error(error);
        }
    };

    // Função para carregar os favoritos
    const loadFavorites = async () => {
        if (!isLoggedIn) {
            showAlert('Please log in to view your favorites');
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
                handleOverlayOpen('favorites');
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            showAlert('Error loading favorites');
        }
    };

    const handleDeleteAccount = async () => {
        showConfirm(
            'Are you sure you want to delete your account? This action cannot be undone.',
            'Confirmation',
            async () => {
            try {
                    const deleteResponse = await fetch(`${API_URL}/api/users/delete-account`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                    if (deleteResponse.ok) {
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
                        showAlert('Account deleted successfully');
                } else {
                        const data = await deleteResponse.json();
                        showAlert(data.error || 'Error deleting account');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                    showAlert('Error deleting account');
                }
            }
        );
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

    // Função utilitária para mostrar alert
    const showAlert = (message, title = '', onConfirm = null) => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'alert',
            onConfirm: () => {
                setModal((m) => ({ ...m, isOpen: false }));
                if (onConfirm) onConfirm();
            },
            onClose: () => setModal((m) => ({ ...m, isOpen: false })),
            confirmText: 'OK',
            cancelText: '',
        });
    };

    // Função utilitária para mostrar confirm
    const showConfirm = (message, title = '', onConfirm, onCancel) => {
        setModal({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm: () => {
                setModal((m) => ({ ...m, isOpen: false }));
                if (onConfirm) onConfirm();
            },
            onClose: () => {
                setModal((m) => ({ ...m, isOpen: false }));
                if (onCancel) onCancel();
            },
            confirmText: 'OK',
            cancelText: 'Cancelar',
        });
    };

    // Bloquear scroll do body quando o search-overlay estiver aberto
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSearchOpen]);

    // Função para fechar todos os overlays
    const closeAllOverlays = () => {
        setIsProfileOpen(false);
        setIsSearchOpen(false);
        setIsFavoritesOpen(false);
        setSelectedAnime(null);
        setExpandedCard(null);
    };

    // Função para gerenciar o histórico
    const handleOverlayOpen = (overlayType) => {
        // Adiciona um estado ao histórico
        window.history.pushState({ overlay: overlayType }, '');
    };

    // Função para fechar o overlay de favoritos
    const closeFavorites = () => {
        setIsFavoritesOpen(false);
        window.history.back();
    };

    // Função para fechar o overlay de perfil
    const closeProfile = () => {
        setIsProfileOpen(false);
        window.history.back();
    };

    // Função para fechar o overlay de pesquisa
    const closeSearch = () => {
        setIsSearchOpen(false);
        window.history.back();
    };

    // Função para fechar o overlay de card expandido
    const closeExpandedCard = () => {
        setExpandedCard(null);
        window.history.back();
    };

    // Efeito para gerenciar o botão voltar
    useEffect(() => {
        const handlePopState = () => {
            closeAllOverlays();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return(
        <>
          <section className="kiana">
              <header className="kianaheader">
                  <div className="textheaderki">
                      <h1>Anime Favorite</h1>
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
                             <li className="libs" onClick={toggleProfile}>View profile</li>
                             <li className="libs" onClick={loadFavorites}>Favorites</li>
                             <li className="libusc" onClick={toggleSearch}><span className="spabusc"><Lupa/></span></li>
                          </ul>

                          <ul className={`optionscell ${isMenuOpen ? 'active' : ''}`}>
                             <li className="libs libscell" onClick={toggleProfile}>View profile</li>
                             <li className="libs libscell" onClick={loadFavorites}>Favorites</li>
                             <li className="libusc libuscell" onClick={toggleSearch}><span className="spabusc"><Lupa/></span></li>
                          </ul>
                      </div>
                  </nav>
              </header>

              <div id="carfamocont" className="cardscont">
                  <div className="carfamotextcont">
                    <h2>Top rated animes</h2>
                  </div>

                  <div className="cardscfam">
                    <div className="cardscfamslider" 
                        ref={sliderRef}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {animeTitles.map((title, index) => (
                            <div className="card" key={index}>
                                <div className="indicardcont">
                                    <div className="cardimagecont" style={{backgroundImage: `url(${animeImages[index] || "https://ih1.redbubble.net/image.5509038997.5349/flat,750x1000,075,t.u1.jpg"})`,backgroundSize: 'cover',backgroundPosition: 'center'}}></div>
                                    <div className="cardinfo1">
                                        <h2 className="cardname1">{title}</h2>
                                        <span className="cardexpandir" onClick={() => toggleCardExpand(index)}><Seta/></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cardscfamsliderpontos">
                        <div className="pontlineslider">
                            {[...Array(totalSlides)].map((_, index) => (<span  key={index} className={`butslider ${currentSlide === index ? 'active' : ''}`} onClick={() => goToSlide(index)}><Sakura/></span>))}
                        </div>
                    </div>
                  </div>

                  {expandedCard !== null && (
                    <div className="cardinfo2-overlay">
                        <button className="close-button xclose" onClick={closeExpandedCard}><X/></button>
                        <div className={`cardinfo2 active`}>
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
                                        mal_id: animeMalIds[expandedCard], // Usando o mal_id real do anime
                                        title: animeTitles[expandedCard],
                                        images: {
                                            jpg: {
                                                large_image_url: animeImages[expandedCard]
                                            }
                                        },
                                        synopsis: animeSinopse[expandedCard],
                                        score: animeNota[expandedCard],
                                        episodes: animeEp[expandedCard],
                                        year: animeAno[expandedCard],
                                        genres: [{ name: animeGenero[expandedCard] }]
                                    }}/>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {isSearchOpen && (
                    <div className="search-overlay">
                        <div className="search-container">
                            <button className="close-search xclose" onClick={closeSearch}><X/></button>

                            <div className="search-bar">
                                <input  type="text" placeholder="search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyUp={handleKeyPress}/>
                                <button className="search-button" onClick={handleSearch}><Lupa/></button>
                            </div>

                            <div className="search-results">
                                {searchResults.map((anime, index) => (
                                    <div key={index} className="search-result-item" onClick={() => handleAnimeClick(anime)}>
                                        <div className="search-result-image"style={{backgroundImage: `url(${anime.images.jpg.image_url})`,backgroundSize: 'cover',backgroundPosition: 'center'}}/>

                                        <div className="search-result-info">
                                            <h3>{anime.title}</h3>
                                            <p>{anime.synopsis?.substring(0, 150)}...</p>
                                            <div className="search-result-details">
                                                <span>Score: {anime.score || "Unknown"}</span>
                                                <span>Episodes: {anime.episodes || "Unknown"}</span>
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
                            <button className="close-details" onClick={closeAnimeDetails}><X/></button>
                            
                            <div className="anime-details-header">
                                <div className="anime-details-image" style={{backgroundImage: `url(${selectedAnime.images.jpg.large_image_url})`, backgroundSize: 'cover',backgroundPosition: 'center' }}/>
                               
                                <div className="anime-details-info">
                                    <h2>{selectedAnime.title}</h2>

                                    <div className="anime-details-stats">
                                        <span className="anime-score">Score: {selectedAnime.score || "unknown"}</span>
                                        <span className="anime-episodes">Episodes: {selectedAnime.episodes || "unknown"}</span>
                                        <span className="anime-year">Year: {selectedAnime.year || "unknown"}</span>
                                        <span className="anime-status">Status: {selectedAnime.status || "unknown"}</span>
                                    </div>

                                    <Heart animeData={selectedAnime}/>
                                </div>
                            </div>

                            <div className="anime-details-content">
                                <div className="anime-trailer">
                                   <iframe  src={selectedAnime.trailer.embed_url || "https://www.youtube.com/embed/CmCIZ_aUAeQ?si=WoXAXCNFAfA5pNlG"} title="Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                                </div>

                                <div className="anime-synopsis">
                                    <h3>Sinopse</h3>
                                    <p>{selectedAnime.synopsis || "unknown"}</p>
                                </div>

                                <div className="anime-genres">
                                    <h3>Genders</h3>
                                    <div className="genre-tags">
                                        {selectedAnime.genres?.map((genre, index) => (
                                            <span key={index} className="genre-tag">{genre.name || "unknown"}</span>
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
                            <button className="close-profile" onClick={closeProfile}>×</button>
                            
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
                                                placeholder="User Name"
                                                value={registerForm.username}
                                                onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                                                disabled={isLoading}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                value={registerForm.email}
                                                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                                                disabled={isLoading}
                                            />
                                            <input
                                                type="password"
                                                placeholder="password"
                                                value={registerForm.password}
                                                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                                disabled={isLoading}
                                            />
                                            <button type="submit" disabled={isLoading}>
                                                {isLoading ? 'Registering...' : 'Register'}
                                            </button>
                                            {isLoading && (
                                                <p className="loading-message">Your account is being registered, please wait...</p>
                                            )}
                                            <p>
                                                Already have an account?
                                                <button 
                                                    type="button" 
                                                    className="switch-auth"
                                                    onClick={() => setIsRegistering(false)}
                                                    disabled={isLoading}
                                                >
                                                    Log in
                                                </button>
                                            </p>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleLogin} className="auth-form">
                                            <h2>Login</h2>
                                            <input
                                                type="text"
                                                placeholder="User Name"
                                                value={loginForm.username}
                                                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                                            />
                                            <input
                                                type="password"
                                                placeholder="password"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                            />
                                            <button type="submit">Enter</button>
                                            <p>
                                                Don't have an account?
                                                <button 
                                                    type="button" 
                                                    className="switch-auth"
                                                    onClick={() => setIsRegistering(true)}
                                                >
                                                    Register
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
                            <button className="close-favorites" onClick={closeFavorites}>×</button>
                            <h2 id="favh2">My Favorites</h2>
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
                                                        console.error('Error removing favorite:', error);
                                                        showAlert('Error removing favorite');
                                                    }
                                                }}
                                            >
                                                Remove favorite
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
          <Modal
            isOpen={modal.isOpen}
            title={modal.title}
            message={modal.message}
            type={modal.type}
            onConfirm={modal.onConfirm}
            onClose={modal.onClose}
            confirmText={modal.confirmText}
            cancelText={modal.cancelText}
          />
        </>
    )
}

export default Inicio