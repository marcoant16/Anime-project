import e from "express";
import mongoose from "mongoose";
import cors from 'cors';
import 'dotenv/config'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Middwares
const app = e();
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(e.json());
app.use(e.urlencoded({ extended: false }));

// Servir arquivos estáticos (como imagens)
app.use('/uploads', e.static(path.join(__dirname, 'uploads')));

// Rotas
import farota from "./routes/favoritorota.mjs";
import userota from "./routes/useroute.mjs";

app.use('/api/users', userota);
app.use('/api/favoritos', farota);

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// Conectar ao MongoDB (uma única vez)
const ChaveMongoose = process.env.ChaveMongoose;
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(ChaveMongoose);
        isConnected = true;
        console.log("Conectado ao MongoDB");
    } catch (err) {
        console.error("Erro ao conectar ao MongoDB", err.message);
    }
}

connectDB();

// Servir frontend em produção
if (process.env.NODE_ENV === 'production') {
    const clientDistPath = path.resolve(__dirname, '../client/anime-project/dist');
    app.use(e.static(clientDistPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}

// Só roda app.listen se **não** estiver na Vercel (produção)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

// Exporta o app para uso pela Vercel
export default app;
