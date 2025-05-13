import { Router } from "express";
import 'dotenv/config'
import authenticate from "../autenticacao/middwareaut.mjs";
import Favorite from "../models/favorito.mjs";

const farota = Router();

// GET /favorites - todos os favoritos do usuário autenticado
farota.get('/', authenticate, async (req, res) => {
  try {
    console.log('Buscando favoritos para usuário:', req.user.id);
    const favorites = await Favorite.find({ userId: req.user.id });
    res.json(favorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro ao buscar favoritos', details: error.message });
  }
});

// POST /favorites - adiciona favorito com review
farota.post('/', authenticate, async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    console.log('ID do usuário:', req.user.id);

    const { mal_id, title, image_url, synopsis, review } = req.body;

    // Validação dos dados
    if (!mal_id || !title) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        message: 'mal_id e title são obrigatórios' 
      });
    }

    // Verifica se já existe
    const exists = await Favorite.findOne({ userId: req.user.id, mal_id });
    if (exists) {
      return res.status(400).json({ message: 'Já favoritado' });
    }

    // Cria novo favorito
    const favorite = new Favorite({
      userId: req.user.id,
      mal_id: Number(mal_id), // Garante que é número
      title: String(title),
      image_url: image_url || '',
      synopsis: synopsis || '',
      review: review || ''
    });

    console.log('Tentando salvar favorito:', favorite);
    await favorite.save();
    console.log('Favorito salvo com sucesso');
    
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Erro detalhado ao adicionar favorito:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user
    });
    res.status(500).json({ 
      error: 'Erro ao adicionar favorito',
      details: error.message
    });
  }
});

// DELETE /favorites/:id
farota.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('Tentando remover favorito:', req.params.id, 'do usuário:', req.user.id);
    await Favorite.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Removido' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao remover favorito', details: error.message });
  }
});

export default farota;
