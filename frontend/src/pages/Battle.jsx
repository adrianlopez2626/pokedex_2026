import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAllPokemons } from '../services/api';
import {
    FaArrowLeft, FaPlus, FaTimes, FaPlay, FaPause,
    FaTrophy, FaRedo, FaSearch, FaFastForward
} from 'react-icons/fa';
import { GiCrossedSwords } from 'react-icons/gi';

// ── Constants ─────────────────────────────────────────────
const MAX_TEAM = 5;
const TURN_DELAY = 1400;

// ── Type gradients ────────────────────────────────────────
const typeGrad = {
    Fuego: 'from-orange-500 to-red-700', Agua: 'from-sky-400 to-blue-700',
    Planta: 'from-green-400 to-emerald-700', Eléctrico: 'from-yellow-300 to-amber-600',
    Bicho: 'from-lime-400 to-green-700', Normal: 'from-slate-300 to-slate-600',
    Hielo: 'from-cyan-300 to-sky-600', Veneno: 'from-purple-400 to-violet-800',
    Tierra: 'from-yellow-400 to-amber-800', Volador: 'from-indigo-300 to-indigo-700',
    Psíquico: 'from-pink-400 to-rose-700', Roca: 'from-stone-400 to-stone-700',
    Fantasma: 'from-purple-600 to-indigo-900', Dragón: 'from-indigo-400 to-blue-900',
    Lucha: 'from-red-500 to-red-900', Acero: 'from-slate-300 to-slate-600',
    Hada: 'from-rose-300 to-pink-700', Siniestro: 'from-gray-600 to-gray-900',
};

// ── Battle logic ──────────────────────────────────────────
const calcMaxHp = (p) => Math.floor(p.defensa * 2 + p.nivel * 3 + 60);
const calcDmg = (atk, def) => Math.max(1, Math.floor(atk - def * 0.45));

const simulateBattle = (team1, team2) => {
    const t1 = team1.map(p => ({ ...p, maxHp: calcMaxHp(p), hp: calcMaxHp(p) }));
    const t2 = team2.map(p => ({ ...p, maxHp: calcMaxHp(p), hp: calcMaxHp(p) }));
    const steps = [];
    let i1 = 0, i2 = 0;

    const snap = () => ({
        t1: t1.map(p => ({ ...p })),
        t2: t2.map(p => ({ ...p })),
        i1, i2,
    });
    const push = (text, type) => steps.push({ text, type, ...snap() });

    push(`⚔️ ¡La batalla comienza! ${t1[0].nombre} vs ${t2[0].nombre}`, 'start');

    for (let turn = 0; turn < 500 && i1 < t1.length && i2 < t2.length; turn++) {
        const p1 = t1[i1], p2 = t2[i2];
        const p1First = p1.velocidad >= p2.velocidad;
        const pairs = p1First ? [[p1, p2, 1], [p2, p1, 2]] : [[p2, p1, 2], [p1, p2, 1]];

        for (const [atk, def, team] of pairs) {
            if (t1[i1].hp <= 0 || t2[i2].hp <= 0) break;
            const dmg = calcDmg(atk.ataque, def.defensa);
            def.hp = Math.max(0, def.hp - dmg);
            push(
                `${team === 1 ? '🔴' : '🔵'} <b>${atk.nombre}</b> ataca a <b>${def.nombre}</b> — <span style="color:${team === 1 ? '#f87171' : '#60a5fa'};font-weight:900">-${dmg} HP</span>`,
                team === 1 ? 'atk1' : 'atk2'
            );
            if (def.hp <= 0) {
                push(`💀 <b>${def.nombre}</b> se ha debilitado`, 'faint');
                if (team === 1) { i2++; if (i2 < t2.length) push(`🔄 ¡<b>${t2[i2].nombre}</b> entra (Equipo 2)`, 'switch'); }
                else { i1++; if (i1 < t1.length) push(`🔄 ¡<b>${t1[i1].nombre}</b> entra (Equipo 1)`, 'switch'); }
                break;
            }
        }
    }

    const winner = i1 < t1.length ? 1 : 2;
    push(`🏆 ¡EQUIPO ${winner} GANA LA BATALLA!`, 'win');
    return { steps, winner };
};

// ── Sub-components ────────────────────────────────────────
const HpBar = ({ hp, maxHp }) => {
    const pct = Math.max(0, (hp / maxHp) * 100);
    const col = pct > 50 ? 'bg-green-400' : pct > 20 ? 'bg-yellow-400' : 'bg-red-500';
    return (
        <div className="w-full">
            <div className="flex justify-between text-xs font-bold text-white/60 mb-1">
                <span>HP</span><span>{Math.max(0, hp)}/{maxHp}</span>
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full ${col}`}
                    animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
        </div>
    );
};

const PokemonChip = ({ p, onRemove, side }) => (
    <motion.div layout
        initial={{ opacity: 0, x: side === 1 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.5 }}
        className={`flex items-center gap-2 glass rounded-xl px-3 py-2 border ${side === 1 ? 'border-red-500/20' : 'border-blue-500/20'} mb-2`}
    >
        {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} className="w-10 h-10 object-contain" />}
        <div className="flex-1 min-w-0">
            <p className="text-white font-black capitalize text-sm truncate">{p.nombre}</p>
            <p className="text-white/40 text-xs font-semibold">ATQ {p.ataque} · DEF {p.defensa} · VEL {p.velocidad}</p>
        </div>
        {onRemove && (
            <button onClick={onRemove} className="text-white/30 hover:text-red-400 transition shrink-0"><FaTimes size={12} /></button>
        )}
    </motion.div>
);

const Fighter = ({ p, shake, fainted, side }) => {
    const grad = typeGrad[p.tipo_principal] || 'from-gray-600 to-gray-800';
    return (
        <motion.div
            animate={shake ? { x: side === 1 ? [-8, 8, -8, 8, 0] : [8, -8, 8, -8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center gap-3 ${fainted ? 'opacity-30 grayscale' : ''}`}
        >
            <div className={`relative w-32 h-32 bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center shadow-2xl`}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-10">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                        <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" />
                        <path d="M2 50 Q2 2 50 2 Q98 2 98 50Z" fill="white" opacity="0.3" />
                    </svg>
                </div>
                {p.imagen_url
                    ? <img src={p.imagen_url} alt={p.nombre}
                        className="w-28 h-28 object-contain relative z-10"
                        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.6))' }} />
                    : <span className="text-4xl relative z-10">❓</span>
                }
            </div>
            <div className="text-center">
                <p className="text-white font-black capitalize text-sm">{p.nombre}</p>
                <p className="text-white/40 text-xs font-semibold">Nv.{p.nivel}</p>
            </div>
        </motion.div>
    );
};

// ── Main component ────────────────────────────────────────
export default function Battle() {
    const [phase, setPhase] = useState('selection');
    const [team1, setTeam1] = useState([]);
    const [team2, setTeam2] = useState([]);
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');
    const [steps, setSteps] = useState([]);
    const [stepIdx, setStepIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [winner, setWinner] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [shakeLeft, setShakeLeft] = useState(false);
    const [shakeRight, setShakeRight] = useState(false);
    const logRef = useRef(null);
    const timerRef = useRef(null);

    const { data: allPokemons = [], isLoading } = useQuery({
        queryKey: ['allPokemons'],
        queryFn: getAllPokemons,
        staleTime: 1000 * 60 * 5,
    });

    const currentStep = steps[stepIdx];

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [stepIdx]);

    useEffect(() => {
        if (!currentStep) return;
        if (currentStep.type === 'atk1') { setShakeRight(true); setTimeout(() => setShakeRight(false), 450); }
        if (currentStep.type === 'atk2') { setShakeLeft(true); setTimeout(() => setShakeLeft(false), 450); }
    }, [currentStep]);

    useEffect(() => {
        if (playing && stepIdx < steps.length - 1) {
            timerRef.current = setTimeout(() => setStepIdx(i => i + 1), TURN_DELAY);
        } else if (playing && stepIdx >= steps.length - 1) {
            setPlaying(false);
            setTimeout(() => setPhase('finished'), 600);
        }
        return () => clearTimeout(timerRef.current);
    }, [playing, stepIdx, steps.length]);

    useEffect(() => {
        if (phase !== 'countdown') return;
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 800);
            return () => clearTimeout(t);
        } else {
            setTimeout(() => { setPhase('battle'); setPlaying(true); }, 400);
        }
    }, [phase, countdown]);

    const startBattle = useCallback(() => {
        const result = simulateBattle(team1, team2);
        setSteps(result.steps);
        setWinner(result.winner);
        setStepIdx(0);
        setCountdown(3);
        setPhase('countdown');
    }, [team1, team2]);

    const reset = () => {
        clearTimeout(timerRef.current);
        setPhase('selection'); setTeam1([]); setTeam2([]);
        setSteps([]); setStepIdx(0); setPlaying(false); setWinner(null);
    };

    const addToTeam = (p, side) => {
        const team = side === 1 ? team1 : team2;
        const setTeam = side === 1 ? setTeam1 : setTeam2;
        if (team.length >= MAX_TEAM || team.find(x => x.id === p.id)) return;
        setTeam(prev => [...prev, p]);
    };

    const removeFromTeam = (id, side) => {
        const setTeam = side === 1 ? setTeam1 : setTeam2;
        setTeam(prev => prev.filter(p => p.id !== id));
    };

    const filterPokemons = (search, team) =>
        allPokemons.filter(p =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) && !team.find(t => t.id === p.id)
        );

    // ── COUNTDOWN ────────────────────────────────────────────
    if (phase === 'countdown') return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)' }}>
            <AnimatePresence mode="wait">
                <motion.div key={countdown}
                    initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                    {countdown > 0
                        ? <span className="text-9xl font-black text-red-500" style={{ textShadow: '0 0 60px rgba(220,38,38,0.8)' }}>{countdown}</span>
                        : <span className="text-5xl font-black text-yellow-400" style={{ textShadow: '0 0 60px rgba(250,204,21,0.8)' }}>¡LUCHA!</span>
                    }
                </motion.div>
            </AnimatePresence>
        </div>
    );

    // ── FINISHED ─────────────────────────────────────────────
    if (phase === 'finished') {
        const winTeam = winner === 1 ? team1 : team2;
        return (
            <div className="py-8 max-w-3xl mx-auto text-center">
                <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="glass rounded-3xl border border-white/10 p-12 flex flex-col items-center gap-6">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <FaTrophy className="text-yellow-400" size={80} />
                    </motion.div>
                    <h2 className="font-black text-white"
                        style={{
                            fontFamily: "'Press Start 2P', monospace", fontSize: '18px',
                            textShadow: `0 0 30px ${winner === 1 ? 'rgba(220,38,38,0.6)' : 'rgba(37,99,235,0.6)'}`
                        }}>
                        ¡EQUIPO {winner === 1 ? 'ROJO' : 'AZUL'} GANA!
                    </h2>
                    <div className="flex gap-4 flex-wrap justify-center">
                        {winTeam.map(p => (
                            <motion.div key={p.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                className="flex flex-col items-center gap-1">
                                {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} className="w-16 h-16 object-contain drop-shadow-xl" />}
                                <span className="text-white/60 capitalize text-xs font-semibold">{p.nombre}</span>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center mt-2">
                        <button onClick={reset}
                            className="flex items-center gap-2 glass border border-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                            <FaRedo /> Nueva batalla
                        </button>
                        <button onClick={() => { setStepIdx(0); setPhase('battle'); setPlaying(false); }}
                            className={`flex items-center gap-2 ${winner === 1 ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'} text-white px-6 py-3 rounded-xl font-bold transition`}>
                            <FaPlay /> Ver repetición
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── BATTLE ARENA ──────────────────────────────────────────
    if (phase === 'battle' && steps.length > 0) {
        const step = steps[stepIdx];
        const liveT1 = step.t1, liveT2 = step.t2;
        const activeP1 = liveT1[step.i1];
        const activeP2 = liveT2[step.i2];

        return (
            <div className="py-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={reset} className="flex items-center gap-2 text-white/40 hover:text-white transition font-bold">
                        <FaArrowLeft /> Salir
                    </button>
                    <span className="text-white/30 text-sm font-mono">
                        Paso {stepIdx + 1} / {steps.length}
                    </span>
                </div>

                {/* Teams HP overview */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    {[1, 2].map(side => {
                        const team = side === 1 ? liveT1 : liveT2;
                        const activeIdx = side === 1 ? step.i1 : step.i2;
                        return (
                            <div key={side} className={`glass rounded-2xl border p-4 ${side === 1 ? 'border-red-500/20' : 'border-blue-500/20'}`}>
                                <p className={`font-black text-xs mb-3 tracking-widest ${side === 1 ? 'text-red-400' : 'text-blue-400'}`}>
                                    {side === 1 ? '🔴 EQUIPO 1' : '🔵 EQUIPO 2'}
                                </p>
                                <div className="space-y-2">
                                    {team.map((p, idx) => (
                                        <div key={p.id} className={`flex items-center gap-2 ${idx < activeIdx ? 'opacity-25' : ''}`}>
                                            {p.imagen_url && (
                                                <img src={p.imagen_url} alt={p.nombre}
                                                    className={`w-7 h-7 object-contain shrink-0 ${idx < activeIdx ? 'grayscale' : ''}`} />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between text-xs mb-0.5">
                                                    <span className={`font-bold capitalize truncate ${idx === activeIdx ? 'text-white' : 'text-white/50'}`}>{p.nombre}</span>
                                                    <span className="text-white/40 shrink-0 ml-1">{Math.max(0, p.hp)}/{p.maxHp}</span>
                                                </div>
                                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full ${(p.hp / p.maxHp) > 0.5 ? 'bg-green-400' : (p.hp / p.maxHp) > 0.2 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                                        animate={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Arena */}
                <div className="glass rounded-3xl border border-white/10 p-6 md:p-10 mb-4"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.04), transparent 70%), rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center justify-around gap-4">
                        {activeP1 && (
                            <div className="flex flex-col items-center gap-4 w-40">
                                <Fighter p={activeP1} shake={shakeLeft} fainted={activeP1.hp <= 0} side={1} />
                                <HpBar hp={activeP1.hp} maxHp={activeP1.maxHp} />
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <GiCrossedSwords className="text-red-500/70" size={48} />
                            <span className="text-white/15 text-xs font-black tracking-widest">VS</span>
                        </div>
                        {activeP2 && (
                            <div className="flex flex-col items-center gap-4 w-40">
                                <Fighter p={activeP2} shake={shakeRight} fainted={activeP2.hp <= 0} side={2} />
                                <HpBar hp={activeP2.hp} maxHp={activeP2.maxHp} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Log */}
                <div ref={logRef}
                    className="glass rounded-2xl border border-white/10 p-4 h-44 overflow-y-auto mb-4 space-y-1.5 scroll-smooth">
                    {steps.slice(0, stepIdx + 1).map((s, i) => (
                        <p key={i}
                            className={`text-sm font-semibold transition-all ${s.type === 'win' ? 'text-yellow-400 text-base' :
                                    s.type === 'faint' ? 'text-red-300' :
                                        s.type === 'switch' ? 'text-cyan-300' :
                                            s.type === 'start' ? 'text-white/90' :
                                                'text-white/55'
                                } ${i === stepIdx ? '!text-white' : ''}`}
                            dangerouslySetInnerHTML={{ __html: s.text }}
                        />
                    ))}
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center flex-wrap">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPlaying(p => !p)}
                        className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold shadow-lg transition ${playing ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-900/30'
                                : 'bg-green-500 hover:bg-green-400 text-black shadow-green-900/30'}`}>
                        {playing ? <><FaPause /> Pausar</> : <><FaPlay /> {stepIdx === 0 ? 'Iniciar' : 'Continuar'}</>}
                    </motion.button>

                    {!playing && stepIdx < steps.length - 1 && (
                        <motion.button whileTap={{ scale: 0.95 }}
                            onClick={() => setStepIdx(i => Math.min(i + 1, steps.length - 1))}
                            className="flex items-center gap-2 glass border border-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                            <FaFastForward /> Paso a paso
                        </motion.button>
                    )}

                    {stepIdx >= steps.length - 1 && (
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPhase('finished')}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-7 py-3 rounded-xl font-bold transition shadow-lg shadow-yellow-900/30">
                            <FaTrophy /> Ver resultado
                        </motion.button>
                    )}
                </div>
            </div>
        );
    }

    // ── SELECTION ─────────────────────────────────────────────
    return (
        <div className="py-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-sm font-bold mb-4 transition group">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Pokédex
                </Link>
                <h1 className="text-5xl font-black text-white mb-2"
                    style={{ textShadow: '0 0 40px rgba(220,38,38,0.4)' }}>
                    ⚔️ Modo <span className="text-red-500">Batalla</span>
                </h1>
                <p className="text-white/40 font-semibold">
                    Elige hasta {MAX_TEAM} Pokémon por equipo y que gane el mejor
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map(side => {
                    const team = side === 1 ? team1 : team2;
                    const search = side === 1 ? search1 : search2;
                    const setSearch = side === 1 ? setSearch1 : setSearch2;
                    const filtered = filterPokemons(search, team);
                    const c = side === 1
                        ? { border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-600', head: 'bg-gradient-to-r from-red-900/60 to-transparent' }
                        : { border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-600', head: 'bg-gradient-to-r from-blue-900/60 to-transparent' };

                    return (
                        <motion.div key={side}
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: side === 1 ? 0 : 0.1 }}
                            className={`glass rounded-3xl border ${c.border} overflow-hidden flex flex-col`}
                        >
                            {/* Header */}
                            <div className={`${c.head} px-5 py-4 border-b ${c.border}`}>
                                <div className="flex justify-between items-center">
                                    <h2 className={`font-black text-lg ${c.text}`}>
                                        {side === 1 ? '🔴 Equipo 1' : '🔵 Equipo 2'}
                                    </h2>
                                    <span className={`${c.badge} text-white text-xs font-black px-3 py-1 rounded-full`}>
                                        {team.length}/{MAX_TEAM}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col gap-4 flex-grow">
                                {/* Team */}
                                <div className="min-h-14">
                                    <AnimatePresence>
                                        {team.length === 0
                                            ? <p className="text-white/20 text-sm text-center py-3 font-semibold">Añade Pokémon al equipo</p>
                                            : team.map(p => (
                                                <PokemonChip key={p.id} p={p} onRemove={() => removeFromTeam(p.id, side)} side={side} />
                                            ))
                                        }
                                    </AnimatePresence>
                                </div>

                                {/* Search */}
                                {team.length < MAX_TEAM && (
                                    <>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={12} />
                                            <input value={search} onChange={e => setSearch(e.target.value)}
                                                placeholder="Buscar Pokémon..."
                                                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 transition font-semibold"
                                            />
                                        </div>
                                        <div className="h-52 overflow-y-auto space-y-1 pr-1">
                                            {isLoading && <p className="text-white/25 text-center py-8 animate-pulse text-sm">Cargando Pokémon...</p>}
                                            {filtered.slice(0, 60).map(p => (
                                                <motion.button key={p.id} whileHover={{ x: 4 }}
                                                    onClick={() => addToTeam(p, side)}
                                                    className="w-full flex items-center gap-3 glass hover:bg-white/10 border border-white/5 rounded-xl px-3 py-2 transition text-left group"
                                                >
                                                    {p.imagen_url && (
                                                        <img src={p.imagen_url} alt={p.nombre} className="w-9 h-9 object-contain shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-bold capitalize text-sm">{p.nombre}</p>
                                                        <p className="text-white/35 text-xs">{p.tipo_principal} · Nv.{p.nivel} · ATQ {p.ataque}</p>
                                                    </div>
                                                    <FaPlus className={`shrink-0 ${c.text} opacity-0 group-hover:opacity-100 transition`} size={11} />
                                                </motion.button>
                                            ))}
                                            {!isLoading && filtered.length === 0 && (
                                                <p className="text-white/20 text-center py-4 text-sm">Sin resultados</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Fight button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-center mt-10">
                <motion.button
                    disabled={team1.length === 0 || team2.length === 0}
                    onClick={startBattle}
                    whileHover={team1.length > 0 && team2.length > 0 ? { scale: 1.05 } : {}}
                    whileTap={team1.length > 0 && team2.length > 0 ? { scale: 0.95 } : {}}
                    className="disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-14 py-5 rounded-2xl font-black shadow-2xl shadow-red-900/50 transition-all inline-flex items-center gap-4"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '13px' }}
                >
                    <GiCrossedSwords size={22} /> ¡A LUCHAR!
                </motion.button>
                {(team1.length === 0 || team2.length === 0) && (
                    <p className="text-white/25 text-sm font-semibold mt-3">Selecciona al menos 1 Pokémon por equipo</p>
                )}
            </motion.div>
        </div>
    );
}
