import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Battle from './pages/Battle';
import { GiCrossedSwords } from 'react-icons/gi';

import SalonFama from './components/SalonFama';
import CapturarPokemon from './components/CapturarPokemon';
import ColeccionEntrenador from './components/ColeccionEntrenador';
import IntercambiarPokemon from './components/IntercambiarPokemon';
import BuscadorConTiempo from './components/BuscadorConTiempo';

// Pokéball SVG icon
const PokeballIcon = () => (
  <svg viewBox="0 0 100 100" className="w-9 h-9" fill="none">
    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4" />
    <path d="M2 50 Q2 2 50 2" fill="#cc0000" />
    <path d="M50 2 Q98 2 98 50" fill="#cc0000" />
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50Z" fill="white" />
    <line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="4" />
    <circle cx="50" cy="50" r="14" fill="white" stroke="white" strokeWidth="4" />
    <circle cx="50" cy="50" r="8" fill="#1a1a2e" />
    <circle cx="50" cy="50" r="4" fill="white" />
  </svg>
);

export default function App() {
  const location = useLocation();

  const navLinks = [
    { path: '/batalla', label: 'Batalla', icon: <GiCrossedSwords size={14} /> },
    { path: '/capturar', label: 'Capturar', icon: '🎯' },
    { path: '/coleccion', label: 'Colección', icon: '🎒' },
    { path: '/intercambiar', label: 'Intercambiar', icon: '🤝' },
    { path: '/salon-fama', label: 'Salón Fama', icon: '🏆' },
    { path: '/buscar-tiempo', label: 'Test Index', icon: '⏱️' }
  ];

  return (
    <div className="min-h-screen relative text-white">
      <div className="pokeball-bg" aria-hidden="true" />
      <div className="fixed top-20 right-10 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #cc0000, transparent)' }} />
      <div className="fixed bottom-20 left-10 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10 shadow-lg shadow-black/30 w-full overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between min-w-max gap-4">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
              <PokeballIcon />
            </motion.div>
            <div>
              <span className="text-white font-black text-white tracking-tight"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px', letterSpacing: '1px' }}>
                Pokédex
              </span>
              <p className="text-white/40 text-xs font-semibold tracking-widest -mt-0.5">2026 EDITION</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${location.pathname === link.path
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                      : 'glass border border-white/10 text-white/60 hover:text-white hover:border-red-500/30'
                    }`}
                >
                  <span className="flex items-center justify-center">{link.icon}</span> {link.label}
                </motion.div>
              </Link>
            ))}

            <div className="hidden lg:flex items-center gap-2 text-white/40 text-sm ml-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="font-semibold">Conectado</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/:id" element={<Detail />} />
          <Route path="/batalla" element={<Battle />} />

          <Route path="/salon-fama" element={<SalonFama />} />
          <Route path="/capturar" element={<CapturarPokemon />} />
          <Route path="/coleccion" element={<ColeccionEntrenador />} />
          <Route path="/intercambiar" element={<IntercambiarPokemon />} />
          <Route path="/buscar-tiempo" element={<BuscadorConTiempo />} />
        </Routes>
      </main>

      <footer className="relative z-10 text-center py-8 text-white/20 text-xs font-semibold mt-10">
        Pokédex 2026 · Datos de tu base de datos MariaDB · Imágenes de PokéAPI
      </footer>
    </div>
  );
}
