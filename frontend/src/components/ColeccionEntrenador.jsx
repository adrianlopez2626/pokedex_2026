import React, { useState, useEffect, useCallback } from 'react';
import { getColeccion, entrenarPokemon, liberarPokemon } from '../services/api';

const entrenadores = ['Ash', 'Misty', 'Brock', 'Red', 'Blue'];

const ColeccionEntrenador = () => {
    const [entrenador, setEntrenador] = useState(entrenadores[0]);
    const [coleccion, setColeccion] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const cargarColeccion = useCallback(async () => {
        setLoading(true);
        setMensaje(null);
        try {
            const data = await getColeccion(entrenador);
            setColeccion(data);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error al cargar colección' });
        } finally {
            setLoading(false);
        }
    }, [entrenador]);

    useEffect(() => {
        cargarColeccion();
    }, [cargarColeccion]);

    const handleEntrenar = async (capturaId) => {
        try {
            // Se le suma 50 de exp por cada entrenamiento
            const info = await entrenarPokemon(capturaId, 50);
            const msg = info.evoluciono
                ? `¡Tu Pokémon subió al nivel ${info.nivel_actual} y evolucionó!`
                : `¡Entrenamiento completado! Nivel actual: ${info.nivel_actual}`;
            setMensaje({ tipo: 'exito', texto: msg });
            cargarColeccion();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error' });
        }
    };

    const handleLiberar = async (capturaId) => {
        if (!window.confirm('¿Estás seguro de liberar este Pokémon?')) return;
        try {
            await liberarPokemon(capturaId);
            setMensaje({ tipo: 'exito', texto: 'Pokémon liberado en la naturaleza.' });
            cargarColeccion();
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error' });
        }
    };

    return (
        <div className="coleccion-view">
            <h2>🎒 Mi Colección</h2>
            <div className="filtros">
                <label>Seleccionar Entrenador: </label>
                <select value={entrenador} onChange={(e) => setEntrenador(e.target.value)}>
                    {entrenadores.map(ent => <option key={ent} value={ent}>{ent}</option>)}
                </select>
            </div>

            {mensaje && <div className={`alerta ${mensaje.tipo}`}>{mensaje.texto}</div>}

            {loading ? <p>Cargando...</p> : (
                <div className="grid-coleccion">
                    {coleccion.length === 0 ? <p>No hay Pokémon en la colección de {entrenador}.</p> : null}
                    {coleccion.map(p => (
                        <div key={p.captura_id} className="pk-card">
                            <h3>{p.pokemon_nombre}</h3>
                            <p>Nivel: <strong>{p.nivel_actual}</strong></p>
                            <p>EXP: {p.experiencia}/100</p>
                            <p>Tipo: {p.tipo_principal}</p>
                            <div className="card-actions">
                                <button onClick={() => handleEntrenar(p.captura_id)} className="btn-entrenar">⚔️ Entrenar (50 EXP)</button>
                                <button onClick={() => handleLiberar(p.captura_id)} className="btn-liberar">🕊️ Liberar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColeccionEntrenador;
