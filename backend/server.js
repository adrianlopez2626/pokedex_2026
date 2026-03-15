import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';
import initDB from './initDB.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/pokemons', router);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('No se pudo inicializar la BD. El servidor no arrancará.', err);
    process.exit(1);
});

