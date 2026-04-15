import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectAuthUser } from "@/store/slices/authSlice";
import { selectTournaments, selectStandings, selectTournamentsLoading, selectPortalMatches } from "@/store/slices/tournamentsSlice";
import { fetchDeportes, fetchAllCategorias } from "@/store/slices/administrationSlice";
import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchTournaments, fetchStandings, fetchTournamentMatches } from "@/store/thunks/tournamentsThunks";
import { fetchClubs } from "@/store/thunks/clubsThunks";
import EquiposTorneo from "../Copa/EquiposTorneo";
import CalendarioPartidos from "../Copa/CalendarioPartidos";
import PosicionesTable from "../Copa/PosicionesTable";
import MatchResultCard from "../Copa/MatchResultCard";
import CreateTournamentModal from "../Copa/CreateTournamentModal";
import { useLiveMatchSupabase } from "@/hooks/useLiveMatchSupabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Play, Clock } from "lucide-react";
import SportIcon from "../common/SportIcon";

export default function HomeAdmin() {
    const user = useAppSelector(selectAuthUser);
    const dispatch = useAppDispatch();
    const tournaments = useAppSelector(selectTournaments);
    const standings = useAppSelector(selectStandings);
    const loading = useAppSelector(selectTournamentsLoading);

    const [expandedTournaments, setExpandedTournaments] = useState<string[]>([]);
    const { activateMatch, loading: loadingLive } = useLiveMatchSupabase();


    const refreshAllData = useCallback(() => {
        if (user?.id) {
            dispatch(fetchTournaments());
            dispatch(fetchStandings());
            dispatch(fetchDeportes());
            dispatch(fetchAllCategorias());
            dispatch(fetchClubs());
        }
    }, [user?.id, dispatch]);

    useEffect(() => {
        refreshAllData();
    }, [refreshAllData]);

    // Obtener los IDs de torneos para cargar sus partidos
    useEffect(() => {
        if (tournaments.length > 0) {
            const tournamentIds = tournaments.map(t => t.id);
            console.log('HomeAdmin - Despachando fetchTournamentMatches con IDs:', tournamentIds);
            dispatch(fetchTournamentMatches(tournamentIds));
        }
    }, [tournaments, dispatch]);

    // Selector de todos los partidos desde Redux
    const reduxMatches = useAppSelector(selectPortalMatches);

    // Filtrar únicamente los partidos de los próximos 7 días
    const upcomingMatches = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        console.log('reduxMatches:', reduxMatches);
        console.log('Total de partidos en Redux:', reduxMatches?.length || 0);

        return (reduxMatches || [])
            .filter((match: any) => {
                const matchDate = new Date(match.fecha_partido);
                const isInRange = matchDate >= today && matchDate <= sevenDaysLater;
                console.log(`Match: ${match.id}, Fecha: ${match.fecha_partido}, En rango: ${isInRange}`);
                return isInRange;
            })
            .sort((a: any, b: any) => {
                const dateA = new Date(a.fecha_partido);
                const dateB = new Date(b.fecha_partido);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                }
                return a.hora_inicio.localeCompare(b.hora_inicio);
            });
    }, [reduxMatches]);

    const loadingMatches = loading;

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
        <div className="text-white min-h-screen flex flex-col bg-[#13161c] pb-16 rounded-xl">

            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-[#13161c]/95 backdrop-blur-xl border-b border-[#1d2029] px-4 sm:px-6 py-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            PANEL <span className="text-[#0ae98a]">ADMIN</span>
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Control de competiciones</p>
                    </div>

                    {isAdmin && user?.id && (
                        <div className="w-full sm:w-auto">
                            <CreateTournamentModal 
                                userId={user.id.toString()} 
                                onSuccess={refreshAllData}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ENCUENTROS PRÓXIMOS - CARRUSEL HORIZONTAL */}
            <div className="border-b border-[#1d2029] bg-gradient-to-r from-[#13161c] via-[#13161c] to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-[#0ae98a]" size={20} />
                        <h2 className="text-lg sm:text-xl font-bold text-gray-300">
                            Próximos encuentros (7 días)
                        </h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#0ae98a]/10 text-[#0ae98a] font-semibold">
                            {upcomingMatches.length}
                        </span>
                    </div>

                    {loadingMatches ? (
                        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex-shrink-0 w-80 h-32 bg-[#1d2029] rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : upcomingMatches.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                            {upcomingMatches.map((match) => {
                                const matchDate = new Date(match.fecha_partido);
                                const formattedDate = matchDate.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
                                const formattedDay = matchDate.toLocaleDateString('es-AR', { weekday: 'short' });

                                return (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex-shrink-0 w-80 bg-[#1d2029] rounded-lg border border-[#1d2029] overflow-hidden hover:border-[#0ae98a]/30 transition-all shadow-lg hover:shadow-[#0ae98a]/10 p-4"
                                    >
                                        {/* Encabezado del partido */}
                                        <div className="flex flex-col gap-3">
                                            {/* Fecha y hora */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-[#0ae98a] font-semibold uppercase">
                                                    {formattedDay} {formattedDate}
                                                </span>
                                                <span className="text-gray-400 font-medium">
                                                    {match.hora_inicio}
                                                </span>
                                            </div>

                                            {/* Equipos */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-300 truncate">
                                                            {match.local?.name || 'Local'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <div className="px-2 py-1 text-xs font-bold text-[#0ae98a] bg-[#0ae98a]/10 rounded">
                                                        vs
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-300 truncate">
                                                            {match.visita?.name || 'Visitante'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Torneos info */}
                                            <div className="text-xs text-gray-500 border-t border-[#13161c] pt-2">
                                                <p className="text-xs text-gray-400">{match.torneos?.name || 'Torneo sin nombre'}</p>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="flex gap-2 pt-2 border-t border-[#13161c]">
                                                <button
                                                    onClick={() => activateMatch(match.id)}
                                                    disabled={loadingLive}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-[#0ae98a] hover:bg-[#09d47a] disabled:opacity-50 disabled:cursor-not-allowed text-[#13161c] font-bold py-2 px-3 rounded-lg transition-all text-sm uppercase tracking-wide"
                                                >
                                                    <Play size={14} />
                                                    {loadingLive ? 'Activando...' : 'LIVE'}
                                                </button>
                                                <button
                                                    className="flex-1 bg-[#1d2029] hover:bg-[#2a2f38] border border-[#1d2029] hover:border-[#0ae98a]/30 text-gray-300 font-bold py-2 px-3 rounded-lg transition-all text-sm uppercase tracking-wide"
                                                >
                                                    Detalle
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-[#1d2029]/40 rounded-lg border border-dashed border-[#0ae98a]/20">
                            <p className="text-gray-400 text-sm">No hay encuentros programados para los próximos 7 días</p>
                        </div>
                    )}
                </div>
            </div>

            {/*Partidos a disputar*/}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 space-y-10 mt-6">

                {/* TORNEOS */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-300">
                            Torneos activos
                        </h2>
                        <span className="text-[10px] px-3 py-1 rounded-full bg-[#0ae98a]/10 text-[#0ae98a] font-semibold tracking-wide">
                            LIVE
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1,2].map(i => (
                                <div key={i} className="h-20 bg-[#1d2029] rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : tournaments.length > 0 ? (
                        <div className="space-y-4">
                            {tournaments.map(tournament => (
                                <div key={tournament.id} className="bg-[#1d2029] rounded-xl border border-[#1d2029] overflow-hidden hover:border-[#0ae98a]/30 transition-all shadow-lg hover:shadow-[#0ae98a]/10">

                                    {/* HEADER CARD */}
                                    <button
                                        onClick={() => toggleTournament(tournament.id)}
                                        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0ae98a]/20 to-[#0ae98a]/5 flex items-center justify-center">
                                                <SportIcon size={18} />
                                            </div>

                                            <div className="text-left">
                                                <h3 className="text-sm sm:text-base font-semibold">
                                                    {tournament.name}
                                                </h3>
                                                <p className="text-xs text-gray-400">
                                                    {tournament.n_equipos} equipos
                                                </p>
                                            </div>
                                        </div>

                                        <ChevronDown
                                            className={`self-end sm:self-auto transition-transform text-[#0ae98a] ${expandedTournaments.includes(tournament.id) ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* CONTENIDO */}
                                    <AnimatePresence>
                                        {expandedTournaments.includes(tournament.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="p-4 space-y-6 border-t border-[#13161c] bg-[#13161c]/60 backdrop-blur-sm">
                                                    <EquiposTorneo tournament={tournament} />
                                                    <CalendarioPartidos tournament={tournament} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-[#1d2029] rounded-xl border border-dashed border-[#0ae98a]/20">
                            <p className="text-gray-400">No hay torneos activos</p>
                        </div>
                    )}
                </div>

                {/* DASHBOARD */}
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-300 mb-4">
                        Resumen
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 overflow-x-auto bg-[#1d2029] rounded-xl p-2 border border-[#1d2029]">
                            <PosicionesTable data={mappedStandings} />
                        </div>

                        <div className="bg-gradient-to-br from-[#1d2029] to-[#13161c] p-4 rounded-xl border border-[#1d2029] shadow-inner">
                            <h4 className="text-xs text-[#0ae98a] mb-4 font-semibold tracking-wide">
                                Estado del sistema
                            </h4>
                            <MatchResultCard data={{ resultadoAnterior: "DASHBOARD", perfil: { nombre: "ADMIN", nivel: "Root" } }} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
