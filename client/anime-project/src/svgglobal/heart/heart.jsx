import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

//css
import '../heart/heart.css'

function Heart({ animeData }) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleFavorite = async () => {
        if (!isLoggedIn) {
            alert('Por favor, faça login para adicionar aos favoritos');
            return;
        }

        if (!animeData) {
            console.error('Dados do anime não disponíveis');
            return;
        }

        try {
            // Garante que mal_id seja um número
            const mal_id = typeof animeData.mal_id === 'number' 
                ? animeData.mal_id 
                : parseInt(animeData.mal_id) || 0;

            // Garante que temos pelo menos um título
            const title = animeData.title || 'Sem título';

            const favoriteData = {
                mal_id,
                title,
                image_url: animeData.images?.jpg?.large_image_url || animeData.image_url || '',
                synopsis: animeData.synopsis || 'Sem sinopse',
                review: ''
            };

            console.log('Enviando dados para o servidor:', favoriteData);

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
                alert('Anime adicionado aos favoritos!');
            } else if (response.status === 400) {
                alert(data.message || 'Este anime já está nos favoritos');
            } else {
                throw new Error(data.details || data.error || 'Erro ao adicionar aos favoritos');
            }
        } catch (error) {
            console.error('Erro detalhado:', error);
            alert(error.message || 'Erro ao adicionar aos favoritos');
        }
    };

    return (
        <svg id='heartsvg' onClick={handleFavorite} className={`heart-icon ${isFavorited ? 'favorited' : ''}`} viewBox="0 0 24 24" fill={isFavorited ? "#27DC45" : "none"}  strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
           <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
    );
}

export default Heart;