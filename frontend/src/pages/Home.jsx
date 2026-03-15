import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { getPokemons, deletePokemon } from '../services/api';
import Card from '../components/Card';
import PokemonForm from '../components/PokemonForm';
import { FaPlus, FaSearch, FaTimes } from 'react-icons/fa';

const tipos = ['Planta', 'Fuego', 'Agua', 'Eléctrico', 'Bicho', 'Normal', 'Hielo', 'Veneno', 'Tierra', 'Volador', 'Psíquico', 'Roca', 'Fantasma', 'Dragón', 'Lucha', 'Acero', 'Hada', 'Siniestro'];

const typeChipColors = {
    Fuego: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Agua: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Planta: 'bg-green-500/20 text-green-300 border-green-500/30',
    Eléctrico: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    Bicho: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    Normal: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
    Hielo: 'bg-sky-300/20 text-sky-300 border-sky-300/30',
    Veneno: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Tierra: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Volador: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/30',
    Psíquico: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    Roca: 'bg-stone-400/20 text-stone-300 border-stone-400/30',
    Fantasma: 'bg-purple-800/30 text-purple-300 border-purple-700/30',
    Dragón: 'bg-indigo-700/20 text-indigo-300 border-indigo-600/30',
    Lucha: 'bg-red-700/20 text-red-300 border-red-600/30',
    Acero: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
    Hada: 'bg-rose-400/20 text-rose-300 border-rose-400/30',
    Siniestro: 'bg-gray-700/30 text-gray-300 border-gray-600/30',
};

export default function Home() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [tipo, setTipo] = useState('');
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPokemon, setEditingPokemon] = useState(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['pokemons', { search, tipo, page }],
        queryFn: () => getPokemons({ search, tipo, page }),
        keepPreviousData: true,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePokemon,
        onSuccess: () => queryClient.invalidateQueries(['pokemons']),
    });

    const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este Pokémon de tu Pokédex?')) deleteMutation.mutate(id);
    };

    const handleEdit = (p) => { setEditingPokemon(p); setIsFormOpen(true); };

    return (
        <div className="py-8">

            {/* ── Hero header ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <h1 className="text-white font-black text-5xl md:text-6xl mb-2 leading-none"
                    style={{ textShadow: '0 0 40px rgba(220,38,38,0.5)' }}>
                    Mi <span className="text-red-500">Pokédex</span>
                </h1>
                <p className="text-white/40 font-semibold text-lg">
                    {data?.pagination?.total ?? '...'} Pokémon en tu colección
                </p>
            </motion.div>

            {/* ── Search & Filter bar ─────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center"
            >
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar Pokémon..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/30 transition font-semibold"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition">
                            <FaTimes size={12} />
                        </button>
                    )}
                </div>

                {/* Type filter select */}
                <select
                    value={tipo}
                    onChange={(e) => { setTipo(e.target.value); setPage(1); }}
                    className="w-full md:w-48 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition font-semibold"
                >
                    <option value="" className="bg-gray-900">Todos los tipos</option>
                    {tipos.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                </select>

                {/* Add button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setEditingPokemon(null); setIsFormOpen(true); }}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white px-7 py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-colors"
                >
                    <FaPlus /> Añadir
                </motion.button>
            </motion.div>

            {/* ── Type chips ──────────────────────────────── */}
            {!tipo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-wrap gap-2 mb-6"
                >
                    {tipos.map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTipo(t); setPage(1); }}
                            className={`border text-xs font-bold px-3 py-1 rounded-full transition hover:scale-105 active:scale-95 ${typeChipColors[t] || 'bg-gray-700/20 text-gray-300 border-gray-600/30'}`}
                        >
                            {t}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Active type filter chip */}
            {tipo && (
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-white/50 text-sm font-semibold">Filtrando por:</span>
                    <button
                        onClick={() => setTipo('')}
                        className={`flex items-center gap-1.5 border text-sm font-bold px-4 py-1.5 rounded-full transition ${typeChipColors[tipo] || 'bg-gray-700/20 text-gray-300 border-gray-600/30'}`}
                    >
                        {tipo} <FaTimes size={10} />
                    </button>
                </div>
            )}

            {/* ── Skeleton loading ─────────────────────────── */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="skeleton rounded-3xl h-72 border border-white/5" />
                    ))}
                </div>
            )}

            {/* ── Error state ──────────────────────────────── */}
            {isError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                    <div className="text-6xl mb-4">⚡</div>
                    <p className="text-red-400 font-black text-xl mb-2">¡Error de conexión!</p>
                    <p className="text-white/40 font-semibold">Asegúrate de que el backend corre en el puerto 5000</p>
                </motion.div>
            )}

            {/* ── Grid ─────────────────────────────────────── */}
            {!isLoading && !isError && (
                <>
                    {data?.data?.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-white/60 font-black text-xl">Ningún Pokémon encontrado</p>
                            <p className="text-white/30 mt-1">Prueba con otro nombre o tipo</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                        >
                            <AnimatePresence>
                                {data?.data?.map((pokemon, i) => (
                                    <motion.div key={pokemon.id} layout initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <Card
                                            pokemon={pokemon}
                                            onEdit={() => handleEdit(pokemon)}
                                            onDelete={() => handleDelete(pokemon.id)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ── Pagination ──────────────────────────── */}
                    {data?.pagination?.totalPages > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-center items-center gap-3 mt-12"
                        >
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="disabled:opacity-30 glass border border-white/10 text-white/70 hover:text-white px-5 py-2.5 rounded-xl font-bold transition"
                            >← Anterior</button>
                            <span className="glass border border-white/10 text-white px-5 py-2.5 rounded-xl font-black text-sm">
                                {page} / {data.pagination.totalPages}
                            </span>
                            <button
                                disabled={page === data.pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="disabled:opacity-30 glass border border-white/10 text-white/70 hover:text-white px-5 py-2.5 rounded-xl font-bold transition"
                            >Siguiente →</button>
                        </motion.div>
                    )}
                </>
            )}

            {/* ── Modal ────────────────────────────────────── */}
            <AnimatePresence>
                {isFormOpen && (
                    <PokemonForm
                        pokemon={editingPokemon}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
