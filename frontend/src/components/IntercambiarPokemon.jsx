import React, { useState, useEffect } from 'react';
import { getColeccion, intercambiarPokemon } from '../services/api';

const entrenadores = ['Ash', 'Misty', 'Brock', 'Red', 'Blue'];

const IntercambiarPokemon = () => {
    const [entrenador1, setEntrenador1] = useState(entrenadores[0]);
    const [entrenador2, setEntrenador2] = useState(entrenadores[1]);

    const [coleccion1, setColeccion1] = useState([]);
    const [coleccion2, setColeccion2] = useState([]);

    const [captura1, setCaptura1] = useState('');
    const [captura2, setCaptura2] = useState('');

    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        getColeccion(entrenador1).then(data => {
            setColeccion1(data);
            if (data.length > 0) setCaptura1(data[0].captura_id);
            else setCaptura1('');
        }).catch(() => setColeccion1([]));
    }, [entrenador1]);

    useEffect(() => {
        getColeccion(entrenador2).then(data => {
            setColeccion2(data);
            if (data.length > 0) setCaptura2(data[0].captura_id);
            else setCaptura2('');
        }).catch(() => setColeccion2([]));
    }, [entrenador2]);

    const handleIntercambio = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (entrenador1 === entrenador2) {
            setMensaje({ tipo: 'error', texto: 'No puedes intercambiar contigo mismo' });
            return;
        }

        if (!captura1 || !captura2) {
            setMensaje({ tipo: 'error', texto: 'Ambos entrenadores deben ofrecer un Pokémon' });
            return;
        }

        try {
            await intercambiarPokemon(entrenador1, parseInt(captura1), entrenador2, parseInt(captura2));
            setMensaje({ tipo: 'exito', texto: '¡Intercambio realizado con éxito!' });
            // Recargar colecciones
            const data1 = await getColeccion(entrenador1);
            const data2 = await getColeccion(entrenador2);
            setColeccion1(data1); setColeccion2(data2);
            if (data1.length > 0) setCaptura1(data1[0].captura_id); else setCaptura1('');
            if (data2.length > 0) setCaptura2(data2[0].captura_id); else setCaptura2('');

        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.response?.data?.error || 'Error al intercambiar' });
        }
    };

    return (
        <div className="intercambiar-view">
            <h2>🤝 Intercambiar Pokémon</h2>
            {mensaje && <div className={`alerta ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <form onSubmit={handleIntercambio} className="intercambio-form">
                <div className="lado">
                    <h3>Jugador 1</h3>
                    <select value={entrenador1} onChange={(e) => setEntrenador1(e.target.value)}>
                        {entrenadores.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select value={captura1} onChange={(e) => setCaptura1(e.target.value)} required>
                        <option value="">Selecciona un Pokémon...</option>
                        {coleccion1.map(p => <option key={p.captura_id} value={p.captura_id}>{p.pokemon_nombre} (Nv. {p.nivel_actual})</option>)}
                    </select>
                </div>

                <div className="medio">
                    <button type="submit" className="btn-intercambio">🔄 Intercambiar 🔄</button>
                    <p className="transaccion-info">Transacción Segura ✅</p>
                </div>

                <div className="lado">
                    <h3>Jugador 2</h3>
                    <select value={entrenador2} onChange={(e) => setEntrenador2(e.target.value)}>
                        {entrenadores.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select value={captura2} onChange={(e) => setCaptura2(e.target.value)} required>
                        <option value="">Selecciona un Pokémon...</option>
                        {coleccion2.map(p => <option key={p.captura_id} value={p.captura_id}>{p.pokemon_nombre} (Nv. {p.nivel_actual})</option>)}
                    </select>
                </div>
            </form>
        </div>
    );
};

export default IntercambiarPokemon;
