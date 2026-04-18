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
            dispatch(fetchTournamentMatches(tournamentIds));
        }
    }, [tournaments, dispatch]);

    // Selector de todos los partidos desde Redux
    const reduxMatches = useAppSelector(selectPortalMatches);

    const parseLocalDate = (dateString: string) => {
        const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [, year, month, day] = match;
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
        const fallback = new Date(dateString);
        fallback.setHours(0, 0, 0, 0);
        return fallback;
    };

    // Filtrar únicamente los partidos de los próximos sábados
    const upcomingMatches = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formatLocalDateKey = (date: Date) => {
            const year = date.getFullYear();
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const getNextSaturday = (fromDate: Date) => {
            const date = new Date(fromDate);
            const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
            const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek);
            date.setDate(date.getDate() + daysUntilSaturday);
            date.setHours(0, 0, 0, 0);
            return date;
        };

        // Generar los próximos 6 sábados en formato local YYYY-MM-DD
        const upcomingSaturdaysKeys: string[] = [];
        let currentSaturday = getNextSaturday(today);

        for (let i = 0; i < 6; i++) {
            upcomingSaturdaysKeys.push(formatLocalDateKey(currentSaturday));
            currentSaturday.setDate(currentSaturday.getDate() + 7); // Siguiente sábado
        }

        return (reduxMatches || [])
            .filter((match: any) => {
                const matchDate = parseLocalDate(match.fecha_partido);
                const matchDateKey = formatLocalDateKey(matchDate);

                // Verificar si el partido cae en uno de los próximos sábados
                const isOnSaturday = upcomingSaturdaysKeys.includes(matchDateKey);

                return isOnSaturday;
            })
            .sort((a: any, b: any) => {
                const dateA = parseLocalDate(a.fecha_partido);
                const dateB = parseLocalDate(b.fecha_partido);
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
                            Próximos encuentros (sábados)
                        </h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-[#0ae98a]/10 text-[#0ae98a] font-semibold">
                            {upcomingMatches.length}
                        </span>
                    </div>

                    {loadingMatches ? (
                        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex-shrink-0 w-72 h-40 bg-[#1d2029] rounded-xl animate-pulse border border-[#0ae98a]/10" />
                            ))}
                        </div>
                    ) : upcomingMatches.length > 0 ? (
                        <motion.div
                            className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar cursor-grab active:cursor-grabbing"
                            drag="x"
                            dragConstraints={{ left: -((upcomingMatches.length - 1) * 300), right: 0 }}
                            dragElastic={0.1}
                        >
                            {upcomingMatches.map((match) => {
                                const matchDate = parseLocalDate(match.fecha_partido);
                                const formattedDate = matchDate.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' });
                                const formattedDay = matchDate.toLocaleDateString('es-AR', { weekday: 'short' });

                                return (
                                    <motion.div
                                        key={match.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex-shrink-0 w-72 bg-[#1d2029] rounded-xl border border-[#0ae98a]/10 overflow-hidden hover:border-[#0ae98a]/30 transition-all shadow-lg hover:shadow-[#0ae98a]/10"
                                    >
                                        {/* Header compacto */}
                                        <div className="bg-[#13161c]/50 px-4 py-3 border-b border-[#0ae98a]/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-[#0ae98a]" />
                                                    <span className="text-xs font-bold text-[#0ae98a] uppercase tracking-wide">
                                                        {formattedDay} {formattedDate}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-white/60 font-medium">
                                                    {match.hora_inicio}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contenido principal */}
                                        <div className="p-4">
                                            {/* Deporte */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <SportIcon size={16} />
                                                <span className="text-xs text-white/60 uppercase tracking-wide">
                                                    {match.torneos?.deporte?.name || 'Deporte'}
                                                </span>
                                            </div>

                                            {/* Equipos */}
                                            <div className="space-y-3">
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-white truncate">
                                                        {match.local?.name || 'Local'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <div className="px-3 py-1 text-xs font-black text-[#0ae98a] bg-[#0ae98a]/10 rounded-full border border-[#0ae98a]/20">
                                                        VS
                                                    </div>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-white truncate">
                                                        {match.visita?.name || 'Visitante'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Torneo */}
                                            <div className="mt-3 pt-3 border-t border-[#0ae98a]/10">
                                                <p className="text-xs text-white/40 truncate">
                                                    {match.torneos?.name || 'Torneo'}
                                                </p>
                                            </div>

                                            {/* Botón Live */}
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => activateMatch(match.id)}
                                                    disabled={loadingLive}
                                                    className="w-full flex items-center justify-center gap-2 bg-[#0ae98a] hover:bg-[#0ae98a]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#13161c] font-bold py-2 px-4 rounded-lg transition-all text-sm uppercase tracking-wide shadow-lg hover:shadow-[#0ae98a]/20"
                                                >
                                                    <Play size={14} />
                                                    {loadingLive ? 'Activando...' : 'LIVE'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-8 bg-[#1d2029]/40 rounded-xl border border-dashed border-[#0ae98a]/20">
                            <p className="text-white/60 text-sm">No hay encuentros programados para los próximos sábados</p>
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
                            {[1, 2].map(i => (
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
