// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido',
                message: 'É necessário estar autenticado para acessar este recurso'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verifica se o usuário ainda existe no banco
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                error: 'Usuário não encontrado',
                message: 'O usuário associado a este token não existe mais'
            });
        }

        // Adiciona informações do usuário ao request
        req.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado',
                message: 'Sua sessão expirou. Por favor, faça login novamente'
            });
        }
        
        return res.status(401).json({ 
            error: 'Token inválido',
            message: 'Não foi possível autenticar sua requisição'
        });
    }
}

export default authenticate;
