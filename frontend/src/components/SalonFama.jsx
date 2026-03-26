import React, { useState, useEffect } from 'react';
import { getTopCompetitivo } from '../services/api';

const SalonFama = () => {
    const [topPokemons, setTopPokemons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTop = async () => {
            try {
                const data = await getTopCompetitivo();
                setTopPokemons(data);
            } catch (error) {
                console.error("Error fetching top:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTop();
    }, []);

    if (loading) return <p>Cargando Salón de la Fama...</p>;

    return (
        <div className="salon-fama">
            <h2>🏆 Salón de la Fama Competitivo</h2>
            <div className="top-list">
                {topPokemons.map((p, i) => (
                    <div key={p.id} className={`top-card rank-${i + 1}`}>
                        <div className="medal">
                            {i === 0 ? "🥇 #1" : i === 1 ? "🥈 #2" : i === 2 ? "🥉 #3" : `#${i + 1}`}
                        </div>
                        <h3>{p.nombre}</h3>
                        <p>Tipo: {p.tipo_principal}</p>
                        <p>Total Stats: <strong>{p.total_stats}</strong></p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalonFama;
