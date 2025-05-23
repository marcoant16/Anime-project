import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import '../heart/heart.css';
import Modal from '../../components/Modal';

function Heart({ animeData }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: null,
        onClose: null,
        confirmText: 'OK',
        cancelText: '',
    });

    // Verificar login e status do favorito
    useEffect(() => {
        const checkLoginAndFavoriteStatus = async () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);

            if (token && animeData?.mal_id) {
                try {
                    const response = await fetch(`${API_URL}/api/favoritos/check/${animeData.mal_id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsFavorited(data.isFavorited);
                    }
                } catch (error) {
                    console.error('Erro ao verificar status do favorito:', error);
                }
            }
        };

        checkLoginAndFavoriteStatus();
    }, [animeData?.mal_id]);

    const handleFavorite = async () => {
        if (!isLoggedIn) {
            showAlert('Por favor, faça login para adicionar aos favoritos');
            return;
        }

        if (!animeData) {
            console.error('Dados do anime não disponíveis');
            return;
        }

        try {
            const favoriteData = {
                mal_id: typeof animeData.mal_id === 'number' 
                    ? animeData.mal_id 
                    : parseInt(animeData.mal_id) || 0,
                title: animeData.title || 'Sem título',
                image_url: animeData.images?.jpg?.large_image_url || animeData.image_url || '',
                synopsis: animeData.synopsis || 'Sem sinopse',
                review: ''
            };

            const response = await fetch(`${API_URL}/api/favoritos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(favoriteData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsFavorited(true);
                showAlert('Anime adicionado aos favoritos!');
            } else if (response.status === 400) {
                showAlert(data.message || 'Este anime já está nos favoritos');
            } else {
                throw new Error(data.details || data.error || 'Erro ao adicionar aos favoritos');
            }
        } catch (error) {
            console.error('Erro ao adicionar favorito:', error);
            showAlert(error.message || 'Erro ao adicionar aos favoritos');
        }
    };

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

    return (
        <>
            <svg 
                id='heartsvg' 
                onClick={handleFavorite} 
                className={`heart-icon ${isFavorited ? 'favorited' : ''}`} 
                viewBox="0 0 24 24" 
                fill={isFavorited ? "#27DC45" : "none"}  
                strokeWidth="1" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
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
    );
}

export default Heart;