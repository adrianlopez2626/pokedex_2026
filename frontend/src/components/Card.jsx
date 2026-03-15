import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaBolt, FaShieldAlt } from 'react-icons/fa';

// Map tipo → CSS class suffix + glow color
const typeMap = {
    Fuego: { cls: 'fire', glow: 'rgba(249,115,22,0.4)', grad: 'from-orange-500 to-red-600' },
    Agua: { cls: 'water', glow: 'rgba(56,189,248,0.4)', grad: 'from-sky-400 to-blue-600' },
    Planta: { cls: 'grass', glow: 'rgba(74,222,128,0.4)', grad: 'from-green-400 to-emerald-600' },
    Eléctrico: { cls: 'electric', glow: 'rgba(250,204,21,0.4)', grad: 'from-yellow-300 to-amber-500' },
    Bicho: { cls: 'bug', glow: 'rgba(163,230,53,0.4)', grad: 'from-lime-400 to-green-700' },
    Normal: { cls: 'normal', glow: 'rgba(148,163,184,0.3)', grad: 'from-slate-300 to-slate-500' },
    Hielo: { cls: 'ice', glow: 'rgba(186,230,253,0.4)', grad: 'from-sky-200 to-cyan-500' },
    Veneno: { cls: 'poison', glow: 'rgba(192,132,252,0.4)', grad: 'from-purple-400 to-violet-700' },
    Tierra: { cls: 'ground', glow: 'rgba(252,211,77,0.4)', grad: 'from-yellow-400 to-amber-700' },
    Volador: { cls: 'flying', glow: 'rgba(165,180,252,0.4)', grad: 'from-indigo-300 to-indigo-600' },
    Psíquico: { cls: 'psychic', glow: 'rgba(249,168,212,0.4)', grad: 'from-pink-400 to-rose-600' },
    Roca: { cls: 'rock', glow: 'rgba(214,211,209,0.3)', grad: 'from-stone-400 to-stone-700' },
    Fantasma: { cls: 'ghost', glow: 'rgba(196,181,253,0.4)', grad: 'from-purple-500 to-indigo-900' },
    Dragón: { cls: 'dragon', glow: 'rgba(129,140,248,0.4)', grad: 'from-indigo-400 to-indigo-900' },
    Lucha: { cls: 'fight', glow: 'rgba(252,165,165,0.4)', grad: 'from-red-400 to-red-800' },
    Acero: { cls: 'steel', glow: 'rgba(226,232,240,0.3)', grad: 'from-slate-300 to-slate-600' },
    Hada: { cls: 'fairy', glow: 'rgba(254,205,211,0.4)', grad: 'from-rose-300 to-pink-600' },
    Siniestro: { cls: 'dark', glow: 'rgba(75,85,99,0.4)', grad: 'from-gray-500 to-gray-900' },
};

const StatMini = ({ val, max, color }) => (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex-1">
        <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((val / max) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
    </div>
);

export default function Card({ pokemon, onEdit, onDelete }) {
    const tipo = pokemon.tipo_principal || 'Normal';
    const tm = typeMap[tipo] || typeMap['Normal'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glow-card rounded-3xl overflow-hidden relative cursor-pointer group"
            style={{ '--type-glow': tm.glow }}
            id={`pokemon-card-${pokemon.id}`}
        >
            {/* Glass background */}
            <div className="glass rounded-3xl overflow-hidden border border-white/10 h-full flex flex-col">

                {/* ── Top gradient area with image ─────── */}
                <Link to={`/pokemon/${pokemon.id}`} className="flex flex-col flex-grow">
                    <div className={`relative bg-gradient-to-br ${tm.grad} p-6 flex items-center justify-center`}
                        style={{ minHeight: '170px' }}>
                        {/* Pokéball watermark */}
                        <div className="absolute right-2 bottom-0 w-28 h-28 opacity-10">
                            <svg viewBox="0 0 100 100" fill="none">
                                <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="6" />
                                <path d="M2 50 Q2 2 50 2 Q98 2 98 50Z" fill="white" opacity="0.5" />
                                <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="6" />
                                <circle cx="50" cy="50" r="14" fill="white" stroke="white" strokeWidth="6" />
                                <circle cx="50" cy="50" r="7" fill="transparent" />
                            </svg>
                        </div>

                        {/* Number badge */}
                        <span className="absolute top-3 left-4 text-white/60 text-xs font-black tracking-widest">
                            #{String(pokemon.id).padStart(3, '0')}
                        </span>

                        {/* Pokemon image */}
                        {pokemon.imagen_url ? (
                            <motion.img
                                src={pokemon.imagen_url}
                                alt={pokemon.nombre}
                                className="relative z-10 h-36 object-contain drop-shadow-2xl float-anim"
                                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
                            />
                        ) : (
                            <div className="text-5xl float-anim relative z-10">❓</div>
                        )}
                    </div>

                    {/* ── Info area ──────────────────────── */}
                    <div className="p-4 flex flex-col gap-3 flex-grow">
                        <div>
                            <h2 className="text-lg font-black capitalize text-white leading-tight tracking-wide">
                                {pokemon.nombre}
                            </h2>
                            <span className={`inline-block type-${tm.cls} text-white text-xs px-3 py-0.5 rounded-full font-bold mt-1.5 shadow-sm`}>
                                {tipo}
                            </span>
                        </div>

                        {/* Mini stats */}
                        <div className="space-y-1.5 mt-auto">
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <FaBolt className="text-red-400 shrink-0" size={10} />
                                <span className="w-12 font-semibold">ATQ {pokemon.ataque}</span>
                                <StatMini val={pokemon.ataque} max={150} color="bg-red-400" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <FaShieldAlt className="text-sky-400 shrink-0" size={10} />
                                <span className="w-12 font-semibold">DEF {pokemon.defensa}</span>
                                <StatMini val={pokemon.defensa} max={150} color="bg-sky-400" />
                            </div>
                        </div>

                        {/* Level pill */}
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-white/30 font-semibold">Nivel</span>
                            <span className="bg-white/10 border border-white/10 text-white text-xs font-black px-3 py-0.5 rounded-full">
                                {pokemon.nivel}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* ── Action buttons (appear on hover) ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                        className="bg-blue-500/80 hover:bg-blue-500 backdrop-blur text-white rounded-full p-2 shadow-lg transition"
                        title="Editar"
                    ><FaEdit size={12} /></button>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                        className="bg-red-500/80 hover:bg-red-500 backdrop-blur text-white rounded-full p-2 shadow-lg transition"
                        title="Eliminar"
                    ><FaTrash size={12} /></button>
                </motion.div>
            </div>
        </motion.div>
    );
}
