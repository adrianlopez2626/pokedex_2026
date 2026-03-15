import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPokemon } from '../services/api';
import { FaArrowLeft, FaBolt, FaShieldAlt, FaTachometerAlt, FaStar, FaFire } from 'react-icons/fa';

const typeMap = {
    Fuego: { grad: 'from-orange-500 via-red-500 to-red-700', glow: 'rgba(249,115,22,0.5)' },
    Agua: { grad: 'from-sky-400 via-blue-500 to-blue-700', glow: 'rgba(56,189,248,0.5)' },
    Planta: { grad: 'from-green-400 via-emerald-500 to-emerald-700', glow: 'rgba(52,211,153,0.5)' },
    Eléctrico: { grad: 'from-yellow-300 via-amber-400 to-orange-500', glow: 'rgba(250,204,21,0.5)' },
    Bicho: { grad: 'from-lime-400 via-green-500 to-green-700', glow: 'rgba(163,230,53,0.5)' },
    Normal: { grad: 'from-slate-400 via-slate-500 to-slate-700', glow: 'rgba(148,163,184,0.3)' },
    Hielo: { grad: 'from-sky-200 via-cyan-400 to-cyan-600', glow: 'rgba(103,232,249,0.5)' },
    Veneno: { grad: 'from-purple-400 via-violet-500 to-violet-800', glow: 'rgba(167,139,250,0.5)' },
    Tierra: { grad: 'from-yellow-400 via-amber-500 to-amber-800', glow: 'rgba(217,119,6,0.5)' },
    Volador: { grad: 'from-indigo-300 via-indigo-500 to-indigo-700', glow: 'rgba(129,140,248,0.5)' },
    Psíquico: { grad: 'from-pink-400 via-rose-500 to-rose-700', glow: 'rgba(244,114,182,0.5)' },
    Roca: { grad: 'from-stone-400 via-stone-500 to-stone-700', glow: 'rgba(168,162,158,0.4)' },
    Fantasma: { grad: 'from-purple-600 via-violet-700 to-indigo-900', glow: 'rgba(88,28,135,0.6)' },
    Dragón: { grad: 'from-indigo-500 via-blue-700 to-indigo-900', glow: 'rgba(67,56,202,0.5)' },
    Lucha: { grad: 'from-red-500 via-red-700 to-red-900', glow: 'rgba(185,28,28,0.5)' },
    Acero: { grad: 'from-slate-300 via-slate-500 to-slate-700', glow: 'rgba(100,116,139,0.4)' },
    Hada: { grad: 'from-rose-300 via-pink-500 to-rose-700', glow: 'rgba(251,113,133,0.5)' },
    Siniestro: { grad: 'from-gray-600 via-gray-800 to-gray-900', glow: 'rgba(75,85,99,0.5)' },
};

const StatBar = ({ label, value, max = 150, colorClass, icon, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="flex items-center gap-4"
    >
        <div className="flex items-center gap-2 w-28 shrink-0 text-white/50 text-sm font-semibold">
            {icon} <span>{label}</span>
        </div>
        <span className="font-black text-white w-8 text-right shrink-0">{value}</span>
        <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${colorClass} shadow-lg`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: delay + 0.3 }}
                style={{ boxShadow: `0 0 12px var(--bar-glow)` }}
            />
        </div>
        <span className="text-white/30 text-xs font-semibold w-12 text-right shrink-0">/ {max}</span>
    </motion.div>
);

export default function Detail() {
    const { id } = useParams();
    const { data: pokemon, isLoading, isError } = useQuery({
        queryKey: ['pokemon', id],
        queryFn: () => getPokemon(id),
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16"
            >
                <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" strokeOpacity="0.2" />
                    <path d="M2 50 Q2 2 50 2" stroke="#cc0000" strokeWidth="4" fill="none" />
                    <circle cx="50" cy="50" r="14" fill="white" stroke="white" strokeWidth="4" />
                    <circle cx="50" cy="50" r="6" fill="#1a1a2e" />
                </svg>
            </motion.div>
            <p className="text-white/40 font-semibold animate-pulse">Cargando Pokémon...</p>
        </div>
    );

    if (isError || !pokemon) return (
        <div className="text-center py-24">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-red-400 font-black text-xl">Pokémon no encontrado</p>
        </div>
    );

    const tipo = pokemon.tipo_principal || 'Normal';
    const tm = typeMap[tipo] || typeMap['Normal'];

    return (
        <div className="py-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white font-bold mb-8 transition group">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Volver a la Pokédex
                </Link>
            </motion.div>

            <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                {/* ── Hero section ────────────────────── */}
                <div
                    className={`relative bg-gradient-to-br ${tm.grad} overflow-hidden`}
                    style={{ minHeight: '280px' }}
                >
                    {/* Glow blob */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-72 h-72 rounded-full opacity-30 blur-3xl"
                            style={{ background: tm.glow }} />
                    </div>

                    {/* Big watermark pokéball */}
                    <div className="absolute -right-16 -top-16 w-72 h-72 opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="3" />
                            <path d="M2 50 Q2 2 50 2 Q98 2 98 50Z" fill="white" opacity="0.3" />
                            <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="3" />
                            <circle cx="50" cy="50" r="14" fill="white" stroke="white" strokeWidth="3" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8">
                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="shrink-0"
                        >
                            {pokemon.imagen_url ? (
                                <img
                                    src={pokemon.imagen_url}
                                    alt={pokemon.nombre}
                                    className="w-52 h-52 object-contain float-anim"
                                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
                                />
                            ) : (
                                <div className="w-52 h-52 flex items-center justify-center text-7xl float-anim">❓</div>
                            )}
                        </motion.div>

                        {/* Text info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white text-center md:text-left"
                        >
                            <p className="text-white/50 font-black tracking-[0.3em] text-sm mb-1">
                                #{String(pokemon.id).padStart(3, '0')}
                            </p>
                            <h1 className="text-5xl md:text-6xl font-black capitalize leading-none mb-4"
                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
                                {pokemon.nombre}
                            </h1>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                                <span className="bg-white/20 backdrop-blur border border-white/30 text-white px-5 py-1.5 rounded-full font-black text-lg shadow">
                                    {tipo}
                                </span>
                                <span className="bg-white/10 backdrop-blur border border-white/20 text-white px-5 py-1.5 rounded-full font-bold">
                                    Nivel <span className="font-black text-xl">{pokemon.nivel}</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── Stats section ───────────────────── */}
                <div className="p-8">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white font-black text-2xl mb-6 flex items-center gap-3"
                    >
                        <FaStar className="text-yellow-400" />
                        Estadísticas de Combate
                    </motion.h2>

                    <div className="space-y-5" style={{ '--bar-glow': tm.glow }}>
                        <StatBar
                            label="Ataque"
                            value={pokemon.ataque}
                            colorClass="bg-gradient-to-r from-red-500 to-orange-400"
                            icon={<FaBolt className="text-red-400" />}
                            max={150}
                            delay={0.4}
                        />
                        <StatBar
                            label="Defensa"
                            value={pokemon.defensa}
                            colorClass="bg-gradient-to-r from-blue-500 to-sky-400"
                            icon={<FaShieldAlt className="text-blue-400" />}
                            max={150}
                            delay={0.5}
                        />
                        <StatBar
                            label="Velocidad"
                            value={pokemon.velocidad}
                            colorClass="bg-gradient-to-r from-emerald-500 to-green-400"
                            icon={<FaTachometerAlt className="text-emerald-400" />}
                            max={150}
                            delay={0.6}
                        />
                    </div>

                    {/* Power score */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 p-5 glass-light rounded-2xl border border-white/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <FaFire className="text-orange-400 text-2xl" />
                            <div>
                                <p className="text-white/50 text-sm font-semibold">Poder Total</p>
                                <p className="text-white font-black text-2xl">
                                    {Number(pokemon.ataque || 0) + Number(pokemon.defensa || 0) + Number(pokemon.velocidad || 0)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/50 text-sm font-semibold">Nivel de combate</p>
                            <div className="flex gap-1 mt-1 justify-end">
                                {[...Array(5)].map((_, i) => {
                                    const total = Number(pokemon.ataque || 0) + Number(pokemon.defensa || 0) + Number(pokemon.velocidad || 0);
                                    return (
                                        <div key={i} className={`w-6 h-2 rounded-full ${i < Math.ceil(total / 90) ? 'bg-orange-400' : 'bg-white/10'}`} />
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
