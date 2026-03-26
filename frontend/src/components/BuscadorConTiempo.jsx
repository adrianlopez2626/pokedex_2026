import React, { useState } from 'react';
import { buscarConTiempo } from '../services/api';

const BuscadorConTiempo = () => {
    const [filtro, setFiltro] = useState('');
    const [resultados, setResultados] = useState([]);
    const [tiempo, setTiempo] = useState(null);
    const [cantidad, setCantidad] = useState(0);

    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!filtro) return;

        try {
            const data = await buscarConTiempo(filtro);
            setResultados(data.resultados);
            setTiempo(data.tiempo_busqueda_ms);
            setCantidad(data.cantidad_resultados);
        } catch (error) {
            console.error('Error al buscar', error);
        }
    };

    return (
        <div className="buscador-tiempo">
            <h2>⏱️ Buscador Optimizado (Prueba de Índices)</h2>
            <form onSubmit={handleBuscar} className="tiempo-form">
                <input
                    type="text"
                    placeholder="Escribe el nombre del Pokémon..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    required
                />
                <button type="submit">Buscar Rápido</button>
            </form>

            {tiempo !== null && (
                <div className="tiempo-resultados">
                    <p>Encontrados <strong>{cantidad}</strong> resultados(s) en <strong className="tiempo-ms">{tiempo} ms</strong>.</p>
                </div>
            )}

            <ul className="lista-rapida">
                {resultados.map(r => (
                    <li key={r.id}>
                        #{r.id} - <strong>{r.nombre}</strong> - Nv. {r.nivel}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BuscadorConTiempo;
