import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Middwares
const app = express()

// Configuração do CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://anime-project-frontend.onrender.com'
];

app.use(cors({
    origin: function(origin, callback) {
        // Permite requisições sem origin (como mobile apps ou curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'A política CORS para este site não permite acesso da origem especificada.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Middleware para processar cookies
app.use(cookieParser());

app.use(express.json())
app.use(express.urlencoded({extended:false}))

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//rotas
import farota from "./routes/favoritorota.mjs";
import userota from "./routes/useroute.mjs";
     
app.use('/api/users', userota)
app.use('/api/favoritos', farota)

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

//variaveis .env
let  PORT = process.env.PORT || 3000
const ChaveMongoose = process.env.ChaveMongoose

mongoose.connect(ChaveMongoose)
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Servidor rodando na porta ${PORT}`)
        console.log('Banco de dados conectado com sucesso')
    })
})
.catch((error)=>{
    console.error(`Erro na conexão com o banco de dados: ${error.message}`)
    process.exit(1)
})
