import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectAuthUser } from "@/store/slices/authSlice";
import { selectTournaments, selectStandings, selectTournamentsLoading } from "@/store/slices/tournamentsSlice";
import { selectCategories, selectSport, fetchDeportes, fetchAllCategorias } from "@/store/slices/administrationSlice";
import { useEffect, useState } from "react";
import { fetchTournaments, fetchStandings } from "@/store/thunks/tournamentsThunks";
import EquiposTorneo from "../Copa/EquiposTorneo";
import CalendarioPartidos from "../Copa/CalendarioPartidos";
import PosicionesTable from "../Copa/PosicionesTable";
import MatchResultCard from "../Copa/MatchResultCard";
import CreateTournamentModal from "../Copa/CreateTournamentModal";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LayoutDashboard, Trophy, Users, CalendarDays } from "lucide-react";
import SportIcon from "../common/SportIcon";

export default function HomeAdmin() {
    const user = useAppSelector(selectAuthUser);
    const dispatch = useAppDispatch();
    const tournaments = useAppSelector(selectTournaments);
    const standings = useAppSelector(selectStandings);
    const loading = useAppSelector(selectTournamentsLoading);
    const categories = useAppSelector(selectCategories);
    const Sport = useAppSelector(selectSport);

    const [expandedTournaments, setExpandedTournaments] = useState<string[]>([]);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchTournaments());
            dispatch(fetchStandings());
            dispatch(fetchDeportes());
            dispatch(fetchAllCategorias());
        }
    }, [user?.id, dispatch]);

    const toggleTournament = (id: string) => {
        setExpandedTournaments(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const mappedStandings = (standings || []).map((s: any, index: number) => ({
        id: index + 1,
        nameClub: s.club?.name || "Club Desconocido",
        puntos: s.pts || 0,
        dg: s.gd || 0,
        pj: s.pj || 0
    }));

    const isAdmin = user?.role === 'admin';

    return (
        <div className="text-white min-h-screen flex flex-col space-y-8 bg-[#0a0c10] pb-20 rounded-xl px-6">
            {/* Header Moderno con Glassmorphism */}
            <div className="sticky top-0 z-50 bg-[#0a0c10]/80 backdrop-blur-md border-b border-gray-800/50 pb-6 pt-4  sm:px-0 rounded-xl">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">Sistema en Vivo</span>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white">
                            PANEL <span className="text-emerald-500 text-stroke-thin">ADMIN</span>
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-70">Control Central de Competencias</p>
                    </div>
                    {isAdmin && user?.id && <CreateTournamentModal userId={user.id.toString()} />}
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-0 space-y-12">
                {/* Tournaments Section con Progressive Disclosure */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <Trophy className="text-emerald-500" size={24} />
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-300">Torneos Activos</h2>
                        <div className="flex-1 border-t border-gray-800/50 ml-4" />
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 bg-gray-800/20 rounded-xl animate-pulse border border-gray-800/50" />
                            ))}
                        </div>
                    ) : tournaments.length > 0 ? (
                        tournaments.map(tournament => (
                            <div key={tournament.id} className="bg-[#13161c] rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden transition-all hover:border-emerald-500/20 group">
                                <button
                                    onClick={() => toggleTournament(tournament.id)}
                                    className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-[#13161c] transition-all">
                                            <SportIcon disciplineId={Sport.find(s => s.id === categories.find(c => c.id === tournament.id_categoria)?.id_deporte)?.nombre} size={20} />
                                        </div>
                                        <div className="text-left">
                                            {(() => {
                                                const category = categories.find(c => c.id === tournament.id_categoria);
                                                const sport = Sport.find(s => s.id === category?.id_deporte);
                                                return (
                                                    <h3 className="text-xl font-black italic tracking-tight uppercase">
                                                        {tournament.name} / {category?.nombre || 'S/C'} / {sport?.nombre || 'S/D'}
                                                    </h3>
                                                );
                                            })()}
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    <Users size={12} className="text-emerald-500" /> {tournament.n_equipos} Equipos
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    <CalendarDays size={12} className="text-emerald-500" /> {tournament.fecha[0]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`transition-transform duration-300 ${expandedTournaments.includes(tournament.id) ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="text-gray-600" />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {expandedTournaments.includes(tournament.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                        >
                                            <div className="p-6 pt-0 space-y-8 border-t border-gray-800/50 bg-black/20">
                                                <div className="pt-8">
                                                    <EquiposTorneo tournament={tournament} />
                                                </div>
                                                <div className="pt-4">
                                                    <CalendarioPartidos tournament={tournament} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-20 bg-[#13161c]/50 rounded-2xl border border-dashed border-gray-800 flex flex-col items-center justify-center">
                            <Trophy className="text-gray-700 mb-6" size={64} />
                            <p className="text-xl font-black tracking-tight text-gray-500 italic uppercase">Sin Operaciones Activas</p>
                            <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] mt-2 uppercase">Inicia una nueva competencia arriba</p>
                        </div>
                    )}
                </div>

                {/* Dashboard Widgets */}
                <div className="pt-12 border-t border-gray-800/50">
                    <div className="flex items-center gap-3 mb-8">
                        <LayoutDashboard className="text-emerald-500" size={24} />
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-300">Resumen Analítico</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <PosicionesTable data={mappedStandings} />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-[#13161c] p-6 rounded-2xl border border-gray-800/50 h-full">
                                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6">Estado del Sistema</h4>
                                <MatchResultCard data={{ resultadoAnterior: "DASHBOARD", perfil: { nombre: "ADMIN MONITOR", nivel: "Root" } }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}