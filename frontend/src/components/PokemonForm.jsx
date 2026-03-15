import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { createPokemon, updatePokemon } from '../services/api';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

const tipos = ['Planta', 'Fuego', 'Agua', 'Eléctrico', 'Bicho', 'Normal', 'Hielo', 'Veneno', 'Tierra', 'Volador', 'Psíquico', 'Roca', 'Fantasma', 'Dragón', 'Lucha', 'Acero', 'Hada', 'Siniestro'];

const typeGradients = {
    Fuego: 'from-orange-500 to-red-600', Agua: 'from-sky-400 to-blue-600',
    Planta: 'from-green-400 to-emerald-600', Eléctrico: 'from-yellow-300 to-amber-500',
    Bicho: 'from-lime-400 to-green-700', Normal: 'from-slate-300 to-slate-500',
    Hielo: 'from-sky-200 to-cyan-500', Veneno: 'from-purple-400 to-violet-700',
    Tierra: 'from-yellow-400 to-amber-700', Volador: 'from-indigo-300 to-indigo-600',
    Psíquico: 'from-pink-400 to-rose-600', Roca: 'from-stone-400 to-stone-700',
    Fantasma: 'from-purple-500 to-indigo-900', Dragón: 'from-indigo-400 to-indigo-900',
    Lucha: 'from-red-400 to-red-800', Acero: 'from-slate-300 to-slate-600',
    Hada: 'from-rose-300 to-pink-600', Siniestro: 'from-gray-500 to-gray-900',
};

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, min, max }) => (
    <div>
        <label className="block text-white/50 text-xs font-bold mb-1.5 uppercase tracking-widest">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            required
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/30 transition font-semibold"
        />
    </div>
);

export default function PokemonForm({ pokemon, onClose }) {
    const queryClient = useQueryClient();
    const isEdit = !!pokemon;

    const [formData, setFormData] = useState({
        nombre: pokemon?.nombre || '',
        tipo_principal: pokemon?.tipo_principal || '',
        nivel: pokemon?.nivel || '',
        ataque: pokemon?.ataque || '',
        defensa: pokemon?.defensa || '',
        velocidad: pokemon?.velocidad || '',
    });

    const mutation = useMutation({
        mutationFn: (data) => isEdit ? updatePokemon(pokemon.id, data) : createPokemon(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['pokemons']);
            onClose();
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const selectedGrad = typeGradients[formData.tipo_principal] || 'from-gray-600 to-gray-800';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 40 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-full max-w-md"
                >
                    <div className="glass-light rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
                        {/* Header with type gradient */}
                        <div className={`bg-gradient-to-r ${selectedGrad} p-6 flex justify-between items-center`}>
                            <div>
                                <h2 className="text-white font-black text-2xl">
                                    {isEdit ? '✏️ Editar' : '✨ Nuevo'} Pokémon
                                </h2>
                                <p className="text-white/60 text-sm font-semibold mt-0.5">
                                    {isEdit ? `Modificando a ${pokemon.nombre}` : 'Añade uno a tu colección'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Form body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <InputField
                                    label="Nombre (en inglés para imagen)"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="pikachu"
                                />

                                <div>
                                    <label className="block text-white/50 text-xs font-bold mb-1.5 uppercase tracking-widest">Tipo Principal</label>
                                    <select
                                        name="tipo_principal"
                                        value={formData.tipo_principal}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition font-semibold"
                                    >
                                        <option value="" className="bg-gray-900">Seleccionar tipo...</option>
                                        {tipos.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <InputField label="Nivel" name="nivel" type="number" value={formData.nivel} onChange={handleChange} placeholder="5" min="1" max="100" />
                                    <InputField label="Ataque" name="ataque" type="number" value={formData.ataque} onChange={handleChange} placeholder="49" />
                                    <InputField label="Defensa" name="defensa" type="number" value={formData.defensa} onChange={handleChange} placeholder="49" />
                                    <InputField label="Velocidad" name="velocidad" type="number" value={formData.velocidad} onChange={handleChange} placeholder="45" />
                                </div>

                                {mutation.isError && (
                                    <p className="text-red-400 text-sm font-semibold bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3">
                                        ❌ Error al guardar. Inténtalo de nuevo.
                                    </p>
                                )}

                                <div className="flex gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-5 py-3 rounded-xl font-bold transition"
                                    >
                                        Cancelar
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30"
                                    >
                                        {mutation.isPending ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                        ) : (
                                            <><FaCheckCircle /> Guardar</>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
