import pool from './db.js';

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pokemons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                tipo VARCHAR(100) NOT NULL,
                habilidad VARCHAR(100) NOT NULL,
                altura DECIMAL(5,2),
                peso DECIMAL(5,2),
                fecha_captura DATE NOT NULL
            )
        `);
        console.log('✅ Tabla pokemons lista.');
    } catch (err) {
        console.error('❌ Error al inicializar la base de datos:', err.message);
        throw err;
    }
};

export default initDB;

