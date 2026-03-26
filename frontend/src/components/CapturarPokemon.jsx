import React, { useState } from 'react';
import { capturarPokemon } from '../services/api';

const entrenadores = ['Ash', 'Misty', 'Brock', 'Red', 'Blue'];

const CapturarPokemon = () => {
    const [entrenador, setEntrenador] = useState(entrenadores[0]);
    const [pokemonId, setPokemonId] = useState('');
    const [nivelInicial, setNivelInicial] = useState('5');
    const [mensaje, setMensaje] = useState(null);

    const handleCapturar = async (e) => {
        e.preventDefault();
        setMensaje(null);
        if (!pokemonId) return;

        try {
            await capturarPokemon(entrenador, parseInt(pokemonId), parseInt(nivelInicial));
            setMensaje({ tipo: 'exito', texto: '¡Pokémon capturado con éxito!' });
            setPokemonId('');
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error al capturar' });
        }
    };

    return (
        <div className="capturar-form">
            <h2>🎯 Capturar Pokémon</h2>
            {mensaje && <div className={`alerta ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <form onSubmit={handleCapturar}>
                <div className="form-group">
                    <label>Entrenador:</label>
                    <select value={entrenador} onChange={(e) => setEntrenador(e.target.value)}>
                        {entrenadores.map(ent => <option key={ent} value={ent}>{ent}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>ID del Pokémon:</label>
                    <input type="number" min="1" required value={pokemonId} onChange={(e) => setPokemonId(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Nivel inicial:</label>
                    <input type="number" min="1" max="100" required value={nivelInicial} onChange={(e) => setNivelInicial(e.target.value)} />
                </div>
                <button type="submit" className="btn-capturar">Capturar Pokémon</button>
            </form>
        </div>
    );
};

export default CapturarPokemon;
