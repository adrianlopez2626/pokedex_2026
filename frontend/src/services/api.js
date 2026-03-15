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
