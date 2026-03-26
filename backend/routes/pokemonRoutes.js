import express from 'express';
import pool from '../db.js';

const router = express.Router();

// 2.1 CAPTURAR Pokémon (INSERT)
router.post('/capturar', async (req, res) => {
    try {
        const { entrenador_nombre, pokemon_id, nivel_inicial } = req.body;

        // Obtener el ID del entrenador
        const [entrenadores] = await pool.query('SELECT id FROM entrenadores WHERE nombre = ?', [entrenador_nombre]);
        if (entrenadores.length === 0) return res.status(404).json({ error: 'Entrenador no encontrado' });
        const entrenador_id = entrenadores[0].id;

        // Insertar captura
        const [result] = await pool.query(
            'INSERT INTO capturas (entrenador_id, pokemon_id, nivel_actual) VALUES (?, ?, ?)',
            [entrenador_id, pokemon_id, nivel_inicial]
        );
        res.status(201).json({ message: 'Pokémon capturado con éxito', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El entrenador ya tiene este Pokémon' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al capturar el Pokémon' });
    }
});

// 2.2 ENTRENAR Pokémon (UPDATE)
router.put('/entrenar/:captura_id', async (req, res) => {
    try {
        const { captura_id } = req.params;
        const { experiencia_ganada } = req.body;

        // Sumar experiencia. Para este ejemplo, cada 100 de exp sube 1 nivel
        // Primero obtenemos la exp y nivel actual
        const [capturas] = await pool.query('SELECT nivel_actual, experiencia, pokemon_id FROM capturas WHERE id = ?', [captura_id]);
        if (capturas.length === 0) return res.status(404).json({ error: 'Captura no encontrada' });

        const { nivel_actual, experiencia, pokemon_id } = capturas[0];
        let nuevaExp = experiencia + experiencia_ganada;
        let nuevoNivel = nivel_actual;

        while (nuevaExp >= 100) {
            nuevoNivel += 1;
            nuevaExp -= 100;
        }

        // Se comprueba si hay evolución (si el nuevoNivel >= nivel_requerido en la tabla evoluciones)
        // Simplificado: si coincide, cambiar el pokemon_id a pokemon_destino_id
        let nuevoPokemonId = pokemon_id;
        const [evoluciones] = await pool.query('SELECT pokemon_destino_id FROM evoluciones WHERE pokemon_origen_id = ? AND nivel_requerido <= ? ORDER BY nivel_requerido DESC LIMIT 1', [pokemon_id, nuevoNivel]);

        if (evoluciones.length > 0) {
            nuevoPokemonId = evoluciones[0].pokemon_destino_id;
        }

        await pool.query(
            'UPDATE capturas SET experiencia = ?, nivel_actual = ?, pokemon_id = ? WHERE id = ?',
            [nuevaExp, nuevoNivel, nuevoPokemonId, captura_id]
        );

        res.json({ message: 'Pokémon entrenado con éxito', nivel_actual: nuevoNivel, evoluciono: nuevoPokemonId !== pokemon_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al entrenar el Pokémon' });
    }
});

// 2.3 LIBERAR Pokémon (DELETE)
router.delete('/liberar/:captura_id', async (req, res) => {
    try {
        const { captura_id } = req.params;
        const [result] = await pool.query('DELETE FROM capturas WHERE id = ?', [captura_id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Captura no encontrada' });
        res.json({ message: 'Pokémon liberado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al liberar el Pokémon' });
    }
});

// 2.4 Obtener colección de un entrenador
router.get('/coleccion/:entrenador_nombre', async (req, res) => {
    try {
        const { entrenador_nombre } = req.params;
        const [resultados] = await pool.query(`
            SELECT c.id as captura_id, c.nivel_actual, c.experiencia, c.fecha_captura, 
                   p.id as pokemon_id, p.nombre as pokemon_nombre, p.tipo_principal
            FROM capturas c
            JOIN entrenadores e ON c.entrenador_id = e.id
            JOIN pokemon p ON c.pokemon_id = p.id
            WHERE e.nombre = ?
        `, [entrenador_nombre]);
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la colección' });
    }
});

// 2.5 Salón de la Fama - Top 10 competitivo
router.get('/top-competitivo', async (req, res) => {
    try {
        const [resultados] = await pool.query('SELECT * FROM vista_top_competitivo');
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el top competitivo' });
    }
});

// 2.6 Búsqueda con medición de tiempos (para probar índices)
router.get('/buscar-con-tiempo', async (req, res) => {
    try {
        const { filtro } = req.query;
        if (!filtro) return res.status(400).json({ error: 'Filtro es requerido' });

        const start = performance.now();
        const [resultados] = await pool.query('SELECT * FROM pokemon WHERE nombre LIKE ?', [`%${filtro}%`]);
        const end = performance.now();

        res.json({
            resultados: resultados.slice(0, 50), // devolver max 50 para no colapsar el frontend
            tiempo_busqueda_ms: (end - start).toFixed(2),
            cantidad_resultados: resultados.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

// 2.7 INTERCAMBIO SEGURO con transacciones
router.post('/intercambiar', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { entrenador1_nombre, captura1_id, entrenador2_nombre, captura2_id } = req.body;

        await connection.beginTransaction();

        // Obtener ids de los entrenadores
        const [e1] = await connection.query('SELECT id FROM entrenadores WHERE nombre = ?', [entrenador1_nombre]);
        const [e2] = await connection.query('SELECT id FROM entrenadores WHERE nombre = ?', [entrenador2_nombre]);

        if (e1.length === 0 || e2.length === 0) throw new Error('Uno o ambos entrenadores no existen');

        const ent1_id = e1[0].id;
        const ent2_id = e2[0].id;

        // Verificar pertenencia
        const [c1] = await connection.query('SELECT id FROM capturas WHERE id = ? AND entrenador_id = ?', [captura1_id, ent1_id]);
        const [c2] = await connection.query('SELECT id FROM capturas WHERE id = ? AND entrenador_id = ?', [captura2_id, ent2_id]);

        if (c1.length === 0 || c2.length === 0) throw new Error('Una o ambas capturas no corresponden a los entrenadores');

        // Intercambio
        await connection.query('UPDATE capturas SET entrenador_id = ? WHERE id = ?', [ent2_id, captura1_id]);
        await connection.query('UPDATE capturas SET entrenador_id = ? WHERE id = ?', [ent1_id, captura2_id]);

        await connection.commit();
        res.json({ message: 'Intercambio realizado de forma exitosa mediante transacción' });
    } catch (error) {
        await connection.rollback();
        console.error('Transacción abortada:', error.message);
        res.status(500).json({ error: error.message || 'Error durante el intercambio' });
    } finally {
        connection.release();
    }
});

export default router;
