// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';

const JWT_SECRET = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
    try {
        // Verifica o token no header Authorization
        const authHeader = req.headers.authorization;
        console.log('Header de autorização:', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Token não fornecido no header');
            return res.status(401).json({ 
                error: 'Token não fornecido',
                message: 'É necessário estar autenticado para acessar este recurso'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token extraído:', token);

        try {
            console.log('Tentando verificar o token...');
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token decodificado:', decoded);
            
            // Verifica se o usuário ainda existe no banco
            const user = await User.findById(decoded.userId);
            if (!user) {
                console.log('Usuário não encontrado:', decoded.userId);
                return res.status(401).json({ 
                    error: 'Usuário não encontrado',
                    message: 'O usuário associado a este token não existe mais'
                });
            }

            console.log('Usuário encontrado:', user.username);
            // Adiciona informações do usuário ao request
            req.user = {
                id: user._id,
                username: user.username,
                email: user.email
            };
            
            next();
        } catch (jwtError) {
            console.log('Erro na verificação do token:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
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
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor',
            message: 'Ocorreu um erro ao processar sua requisição'
        });
    }
}

export default authenticate;
