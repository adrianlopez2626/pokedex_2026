import express from 'express';
import { getPokemons, getAllPokemons, getPokemon, createPokemon, updatePokemon, deletePokemon, getPokemonImage } from './controllers.js';

const router = express.Router();

router.get('/all', getAllPokemons);   // Get all pokemon (no pagination) for battle selector
router.get('/', getPokemons);
router.get('/:id', getPokemon);
router.post('/', createPokemon);
router.put('/:id', updatePokemon);
router.delete('/:id', deletePokemon);
router.get('/:id/image', getPokemonImage);

export default router;
