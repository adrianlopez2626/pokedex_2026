import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getAllPokemons = async () => {
    const { data } = await api.get('/pokemons/all');
    return data;
};

export const getPokemons = async (params) => {
    const { data } = await api.get('/pokemons', { params });
    return data;
};

export const getPokemon = async (id) => {
    const { data } = await api.get(`/pokemons/${id}`);
    return data;
};

export const createPokemon = async (pokemon) => {
    const { data } = await api.post('/pokemons', pokemon);
    return data;
};

export const updatePokemon = async (id, pokemon) => {
    const { data } = await api.put(`/pokemons/${id}`, pokemon);
    return data;
};

export const deletePokemon = async (id) => {
    const { data } = await api.delete(`/pokemons/${id}`);
    return data;
};

// --- Nuevos Endpoints ---

export const capturarPokemon = async (entrenadorNombre, pokemonId, nivelInicial) => {
    const { data } = await api.post('/pokemon/capturar', {
        entrenador_nombre: entrenadorNombre,
        pokemon_id: pokemonId,
        nivel_inicial: nivelInicial
    });
    return data;
};

export const entrenarPokemon = async (capturaId, experienciaGanada) => {
    const { data } = await api.put(`/pokemon/entrenar/${capturaId}`, { experiencia_ganada: experienciaGanada });
    return data;
};

export const liberarPokemon = async (capturaId) => {
    const { data } = await api.delete(`/pokemon/liberar/${capturaId}`);
    return data;
};

export const getColeccion = async (entrenadorNombre) => {
    const { data } = await api.get(`/pokemon/coleccion/${entrenadorNombre}`);
    return data;
};

export const getTopCompetitivo = async () => {
    const { data } = await api.get('/pokemon/top-competitivo');
    return data;
};

export const buscarConTiempo = async (filtro) => {
    const { data } = await api.get(`/pokemon/buscar-con-tiempo`, { params: { filtro } });
    return data;
};

export const intercambiarPokemon = async (entrenador1_nombre, captura1_id, entrenador2_nombre, captura2_id) => {
    const { data } = await api.post('/pokemon/intercambiar', {
        entrenador1_nombre,
        captura1_id,
        entrenador2_nombre,
        captura2_id
    });
    return data;
};
