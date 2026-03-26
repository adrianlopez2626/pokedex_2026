import pool from './db.js';
import axios from 'axios';

const seedRealPokemons = async () => {
    try {
        console.log('Obteniendo lista de Pokémon reales desde PokeAPI...');
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
        const pokemons = response.data.results;
        const tipos_posibles = ['Fuego', 'Agua', 'Planta', 'Bicho', 'Normal', 'Electrico', 'Tierra', 'Hada', 'Lucha', 'Psiquico', 'Roca', 'Fantasma', 'Veneno', 'Dragon', 'Hielo', 'Acero'];

        console.log('Eliminando los antiguos MewClone...');
        const [deleteResult] = await pool.query("DELETE FROM pokemon WHERE nombre LIKE 'MewClone_%'");
        console.log(`Eliminados ${deleteResult.affectedRows} Pokémon falsos.`);

        console.log('Generando 1000 Pokémon con nombres reales...');
        let successCount = 0;
        for (let i = 0; i < 1000; i++) {
            const indAleatorio = Math.floor(Math.random() * pokemons.length);
            const tipoAleatorio = tipos_posibles[Math.floor(Math.random() * tipos_posibles.length)];
            const pokeRes = pokemons[indAleatorio];
            // Para mantener la mayúscula inicial
            const nombreReal = pokeRes.name.charAt(0).toUpperCase() + pokeRes.name.slice(1);

            const nivel = Math.floor(1 + Math.random() * 100);
            const ataque = Math.floor(10 + Math.random() * 100);
            const defensa = Math.floor(10 + Math.random() * 100);
            const velocidad = Math.floor(10 + Math.random() * 100);

            try {
                await pool.query(
                    'INSERT INTO pokemon (nombre, tipo_principal, nivel, ataque, defensa, velocidad) VALUES (?, ?, ?, ?, ?, ?)',
                    [nombreReal, tipoAleatorio, nivel, ataque, defensa, velocidad]
                );
                successCount++;
            } catch (err) {
                console.error('Error insertando pokemon', nombreReal, err.message);
            }
        }

        console.log(`✅ ¡Se han insertado ${successCount} Pokémon con nombres reales exitosamente!`);
    } catch (err) {
        console.error('Error durante la generación de pokemons:', err);
    } finally {
        process.exit();
    }
};

seedRealPokemons();
