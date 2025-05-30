import { Router } from "express";
import jwt from 'jsonwebtoken';
import bcryptjs from "bcryptjs";
import User from "../models/user.mjs";
import 'dotenv/config'
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from '../config/s3.mjs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import authenticate from "../autenticacao/middwareaut.mjs";
import Favorite from "../models/favorito.mjs";

const JWT_SECRET = process.env.JWT_SECRET;
const userota = Router();

// Configuração do multer para upload de imagens para o S3
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileName = `profile/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // limite de 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado'));
        }
    }
});

// Validação básica dos dados
const validateUserData = (req, res, next) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }
    next();
};

// Criando usuário
userota.post('/register', validateUserData, async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const user = new User({ username, password, email });
        await user.save();
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Usuário ou email já existe' });
        }
        res.status(400).json({ error: 'Erro ao criar usuário' });
    }
});

// Login do usuário
userota.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                email: user.email
            }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        res.json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Rota para upload de imagem de perfil
userota.post('/upload-image', authenticate, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada' });
        }

        // A URL da imagem será fornecida pelo multer-s3
        const imageUrl = req.file.location;
        
        await User.findByIdAndUpdate(req.user.id, {
            profileImage: imageUrl
        });

        res.json({ imageUrl });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
    }
});

// Rota para obter dados do usuário logado
userota.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter dados do usuário' });
    }
});

// Rota para deletar a conta do usuário
userota.delete('/delete-account', authenticate, async (req, res) => {
    try {
        // Primeiro, deletar todos os favoritos do usuário
        await Favorite.deleteMany({ userId: req.user.id });
        
        // Depois, deletar a conta do usuário
        await User.findByIdAndDelete(req.user.id);
        
        res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({ error: 'Erro ao deletar conta' });
    }
});

export default userota;