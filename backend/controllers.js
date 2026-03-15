import pool from './db.js';
import axios from 'axios';

// ── Image cache ───────────────────────────────────────────
const imageCache = new Map();

const fetchPokeApiImage = async (pokemonName) => {
    try {
        const key = pokemonName.toLowerCase();
        if (imageCache.has(key)) return imageCache.get(key);
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${key}`);
        const image =
            response.data.sprites.other['official-artwork'].front_default ||
            response.data.sprites.front_default;
        imageCache.set(key, image);
        return image;
    } catch {
        return null;
    }
};

// ── GET /api/pokemons/all  (no pagination — for battle team builder) ──
export const getAllPokemons = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pokemon ORDER BY id ASC');
        const pokemonsWithImages = await Promise.all(rows.map(async (p) => {
            const image = await fetchPokeApiImage(p.nombre);
            return { ...p, imagen_url: image };
        }));
        res.json(pokemonsWithImages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener todos los pokemons' });
    }
};

// ── GET /api/pokemons ─────────────────────────────────────
export const getPokemons = async (req, res) => {
    try {
        const { search, tipo, page = 1, limit = 10 } = req.query;
        let query = 'SELECT * FROM pokemon WHERE 1=1';
        const params = [];

        if (search) { query += ' AND nombre LIKE ?'; params.push(`%${search}%`); }
        if (tipo) { query += ' AND tipo_principal LIKE ?'; params.push(`%${tipo}%`); }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [rows] = await pool.query(query, params);
        const pokemonsWithImages = await Promise.all(rows.map(async (p) => {
            const image = await fetchPokeApiImage(p.nombre);
            return { ...p, imagen_url: image };
        }));

        res.json({
            data: pokemonsWithImages,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los pokemons' });
    }
};

// ── GET /api/pokemons/:id ─────────────────────────────────
export const getPokemon = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM pokemon WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Pokemon no encontrado' });
        const pokemon = rows[0];
        const image = await fetchPokeApiImage(pokemon.nombre);
        res.json({ ...pokemon, imagen_url: image });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el pokemon' });
    }
};

// ── POST /api/pokemons ────────────────────────────────────
export const createPokemon = async (req, res) => {
    try {
        const { nombre, tipo_principal, nivel, ataque, defensa, velocidad } = req.body;
        const [result] = await pool.query(
            'INSERT INTO pokemon (nombre, tipo_principal, nivel, ataque, defensa, velocidad) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, tipo_principal, nivel, ataque, defensa, velocidad]
        );
        const image = await fetchPokeApiImage(nombre);
        res.status(201).json({ message: 'Pokemon creado', id: result.insertId, imagen_url: image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el pokemon' });
    }
};

// ── PUT /api/pokemons/:id ─────────────────────────────────
export const updatePokemon = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo_principal, nivel, ataque, defensa, velocidad } = req.body;
        const [result] = await pool.query(
            'UPDATE pokemon SET nombre=?, tipo_principal=?, nivel=?, ataque=?, defensa=?, velocidad=? WHERE id=?',
            [nombre, tipo_principal, nivel, ataque, defensa, velocidad, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Pokemon no encontrado' });
        res.json({ message: 'Pokemon actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el pokemon' });
    }
};

// ── DELETE /api/pokemons/:id ──────────────────────────────
export const deletePokemon = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM pokemon WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Pokemon no encontrado' });
        res.json({ message: 'Pokemon eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el pokemon' });
    }
};

// ── GET /api/pokemons/:id/image ───────────────────────────
export const getPokemonImage = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT nombre FROM pokemon WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Pokemon no encontrado' });
        const image = await fetchPokeApiImage(rows[0].nombre);
        res.json({ imagen_url: image });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la imagen' });
    }
};
