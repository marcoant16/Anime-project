import e from "express";
import mongoose from "mongoose";
import cors from 'cors';
import 'dotenv/config'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Middwares
const app = e()
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(e.json())
app.use(e.urlencoded({extended:false}))

// Servir arquivos estáticos
app.use('/uploads', e.static(path.join(__dirname, 'uploads')));

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
