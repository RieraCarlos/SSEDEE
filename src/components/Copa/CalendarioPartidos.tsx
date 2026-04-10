import { useState, useEffect } from "react";
import type { Tournament } from "@/api/type/tournaments.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchTournamentMatches, saveTournamentFixture, updateTournamentMatch } from "@/store/thunks/tournamentsThunks";
import { Calendar as CalendarIcon, Clock, Trophy, Settings2, PlayCircle, Save, Download, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useLiveMatchSupabase } from "@/hooks/useLiveMatchSupabase";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchClubs } from "@/store/thunks/clubsThunks";
import type { Club } from "@/api/type/clubs.api";
import { useCalendarGenerator } from "@/hooks/useCalendarGenerator";
import { PdfReportService } from "@/services/pdf-report.services";
import MatchResultDialog from "./MatchResultDialog";

interface CalendarioPartidosProps {
    tournament: Tournament;
}

export default function CalendarioPartidos({ tournament }: CalendarioPartidosProps) {
    const dispatch = useAppDispatch();
    const allClubs = useAppSelector(state => state.clubs.clubs);
    const [isDbHydrated, setIsDbHydrated] = useState(false);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("22:00");
    const [matchType, setMatchType] = useState<"ida" | "idaVuelta">("ida");
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [selectedMatchResults, setSelectedMatchResults] = useState<any | null>(null);
    const [editingMatch, setEditingMatch] = useState<any | null>(null);
    const { activateMatch, loading: loadingLive } = useLiveMatchSupabase();

    const { 
        generatedMatches, 
        setGeneratedMatches, 
        generate 
    } = useCalendarGenerator(tournament);

    const hydrateFromInventory = async () => {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!tournament.id || !uuidRegex.test(tournament.id)) return;

        const resultAction = await dispatch(fetchTournamentMatches(tournament.id));
        if (fetchTournamentMatches.fulfilled.match(resultAction)) {
            const data = resultAction.payload as any[];
            if (data && data.length > 0) {
                const hydrated = data.map(d => ({
                    id: d.id,
                    home: d.equipo_local_id || "Equipo A",
                    away: d.equipo_visitante_id || "Equipo B",
                    date: d.fecha_partido || "Sin fecha",
                    time: d.hora_inicio || "Sin hora",
                    round: d.fase || "Fase de Eliminación",
                    is_active: d.is_active,
                    reporte_final: d.reporte_final,
                    goles_local: d.goles_local,
                    goles_visitante: d.goles_visitante,
                }));
                setGeneratedMatches(hydrated);
                setIsDbHydrated(true);
            }
        }
    };

    useEffect(() => {
        dispatch(fetchClubs());
    }, [dispatch]);

    useEffect(() => {
        hydrateFromInventory();
    }, [tournament.id, dispatch]);

    const handleSave = async () => {
        setLoadingSave(true);
        try {
            const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

            const payload = generatedMatches
                .filter(m => m.home !== "BYE" && m.away !== "BYE")
                .map(m => {
                    const resolveId = (nameOrId: string) => {
                        if (uuidRegex.test(nameOrId)) return nameOrId;
                        const club = (allClubs as Club[]).find(c => c.name.toLowerCase() === nameOrId.toLowerCase());
                        return club ? club.id : null;
                    };

                    const homeId = resolveId(m.home);
                    const awayId = resolveId(m.away);

                    if (!homeId || !awayId) {
                        const failedName = !homeId ? m.home : m.away;
                        throw new Error(`El equipo "${failedName}" no está registrado.`);
                    }

                    return {
                        torneo_id: tournament.id,
                        equipo_local_id: homeId,
                        equipo_visitante_id: awayId,
                        fecha_partido: m.date,
                        hora_inicio: m.time,
                        is_active: false,
                        fase: m.round
                    };
                });

            if (payload.length === 0) {
                toast.error("No hay partidos válidos para guardar");
                setLoadingSave(false);
                return;
            }

            const resultAction = await dispatch(saveTournamentFixture(payload));
            if (saveTournamentFixture.fulfilled.match(resultAction)) {
                setIsDbHydrated(true);
                toast.success("Fixtures guardados en la Base de Datos");
                hydrateFromInventory();
            } else {
                throw new Error(resultAction.payload as string || "Error al guardar");
            }
        } catch (error: any) {
            toast.error(error.message || "Error al persistir el calendario");
        } finally {
            setLoadingSave(false);
        }
    };

    const handleExportPdf = async () => {
        setLoadingPdf(true);
        try {
            const resolvedMatches = generatedMatches.map(m => ({
                ...m,
                home: (allClubs as Club[]).find(c => c.id === m.home)?.name || m.home,
                away: (allClubs as Club[]).find(c => c.id === m.away)?.name || m.away,
            }));

            await PdfReportService.generateTournamentReport(tournament, resolvedMatches);
            toast.success("Reporte PDF generado exitosamente");
        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Error al generar el PDF");
        } finally {
            setLoadingPdf(false);
        }
    };

    const handleUpdateMatch = async () => {
        if (!editingMatch) return;
        try {
            const resultAction = await dispatch(updateTournamentMatch({
                matchId: editingMatch.id,
                data: {
                    fecha_partido: editingMatch.date,
                    hora_inicio: editingMatch.time
                }
            }));

            if (updateTournamentMatch.fulfilled.match(resultAction)) {
                toast.success("Horario de partido actualizado");
                setEditingMatch(null);
                hydrateFromInventory();
            } else {
                toast.error("Error al actualizar el partido");
            }
        } catch (error) {
            toast.error("Error inesperado al editar");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-700/50 pb-4">
                <h3 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-2">
                    <Trophy className="text-emerald-500" />
                    GESTIÓN DE CALENDARIO
                </h3>
                {generatedMatches.length > 0 && (
                    <Button 
                        onClick={handleExportPdf} 
                        variant="outline" 
                        disabled={loadingPdf}
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-2 font-bold italic"
                    >
                        {loadingPdf ? (
                            <>
                                <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Exportar PDF Oficial
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className="bg-[#1d2029]/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm space-y-6">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">
                    <Settings2 className="w-4 h-4" />
                    Motor de Generación Aleatoria
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <Label className="text-gray-400 text-xs font-bold uppercase">Rango Horario</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                className="bg-[#2a2d3a] border-gray-600 text-white h-9"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                disabled={isDbHydrated}
                            />
                            <span className="text-gray-600">-</span>
                            <Input
                                type="time"
                                className="bg-[#2a2d3a] border-gray-600 text-white h-9"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                disabled={isDbHydrated}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-gray-400 text-xs font-bold uppercase">Modalidad</Label>
                        <RadioGroup
                            value={matchType}
                            onValueChange={(val: "ida" | "idaVuelta") => setMatchType(val)}
                            className="flex gap-4 h-9 items-center"
                            disabled={isDbHydrated}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ida" id="r-ida" />
                                <Label htmlFor="r-ida" className="text-white cursor-pointer text-sm">Solo Ida</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="idaVuelta" id="r-idavuelta" />
                                <Label htmlFor="r-idavuelta" className="text-white cursor-pointer text-sm">Ida/Vuelta</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex items-end gap-3">
                        <Button
                            onClick={() => generate({ startTime, endTime, matchType })}
                            disabled={isDbHydrated}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#13161c] font-black italic h-10"
                        >
                            <PlayCircle className="mr-2 h-5 w-5" />
                            {isDbHydrated ? 'CALENDARIO OFICIAL' : 'GENERAR SORTEO'}
                        </Button>

                        {generatedMatches.length > 0 && !isDbHydrated && (
                            <Button
                                onClick={handleSave}
                                disabled={loadingSave}
                                className="bg-white hover:bg-gray-200 text-[#13161c] font-black italic h-10"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                {loadingSave ? 'GUARDANDO...' : 'GUARDAR'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {generatedMatches.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                    {generatedMatches.map((match, idx) => (
                        <Card key={match.id || idx} className="bg-[#13161c] border-gray-800/50 text-white overflow-hidden hover:border-emerald-500/30 transition-all group">
                            <CardHeader className="p-3 bg-gray-800/10 border-b border-gray-800/50">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    {match.round}
                                    <div className="flex gap-2">
                                        {isDbHydrated && !match.reporte_final && !match.is_active && (
                                            <button 
                                                onClick={() => setEditingMatch(match)}
                                                className="hover:text-white transition-colors p-1"
                                                title="Editar horario"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        )}
                                        {match.reporte_final ? (
                                            <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">FINALIZADO</Badge>
                                        ) : match.is_active ? (
                                            <Badge variant="secondary" className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">EN VIVO</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400/50">{isDbHydrated ? 'OFICIAL' : 'SORTEO'}</Badge>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center gap-3 mb-4">
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <span className="text-xs font-bold truncate flex-1 text-right">
                                            {(allClubs as Club[]).find(c => c.id === match.home)?.name || match.home}
                                        </span>
                                        
                                        <div className="flex flex-col items-center">
                                            {match.reporte_final ? (
                                                <div className="flex items-center bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                                    <span className="text-base font-black text-emerald-500 tabular-nums">{match.goles_local}</span>
                                                    <span className="text-[10px] text-gray-700 mx-1">:</span>
                                                    <span className="text-base font-black text-emerald-500 tabular-nums">{match.goles_visitante}</span>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                                                    <span className="text-[9px] text-gray-500 font-black">VS</span>
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-xs font-bold truncate flex-1 text-left">
                                            {(allClubs as Club[]).find(c => c.id === match.away)?.name || match.away}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                    <div className="flex items-center gap-1"><CalendarIcon size={12} className="text-emerald-500/50" /> {match.date}</div>
                                    <div className="flex items-center gap-1"><Clock size={12} className="text-emerald-500/50" /> {match.time}</div>
                                </div>

                                {isDbHydrated && (
                                    <Button
                                        className={`w-full mt-4 h-8 text-[10px] font-black uppercase tracking-widest ${
                                            match.reporte_final 
                                            ? 'bg-blue-500/5 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20' 
                                            : 'bg-emerald-500/5 hover:bg-emerald-500 text-emerald-400 hover:text-[#13161c] border border-emerald-500/20'
                                        }`}
                                        onClick={() => match.reporte_final ? setSelectedMatchResults(match) : activateMatch(match.id)}
                                        disabled={loadingLive || match.home === "BYE" || match.away === "BYE"}
                                    >
                                        {match.reporte_final ? 'VER RESULTADOS' : match.is_active ? 'PARTIDO EN VIVO' : 'ACTIVAR EN VIVO'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <MatchResultDialog 
                isOpen={!!selectedMatchResults} 
                onClose={() => setSelectedMatchResults(null)}
                match={selectedMatchResults}
                disciplineId={tournament.id_categoria ? 'futbol' : 'futbol'} // TODO: Resolver id_deporte real
            />

            <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
                <DialogContent className="bg-[#13161c] text-white border-gray-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 italic font-black uppercase tracking-tighter">
                            <Edit2 className="text-emerald-500" size={18} />
                            REPROGRAMAR PARTIDO
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                            Ajuste de fecha y hora para el encuentro oficial
                        </DialogDescription>
                    </DialogHeader>

                    {editingMatch && (
                        <div className="py-6 space-y-6">
                            <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-gray-800">
                                <span className="text-xs font-bold uppercase">{(allClubs as Club[]).find(c => c.id === editingMatch.home)?.name || editingMatch.home}</span>
                                <span className="text-[10px] text-emerald-500 font-black italic">VS</span>
                                <span className="text-xs font-bold uppercase">{(allClubs as Club[]).find(c => c.id === editingMatch.away)?.name || editingMatch.away}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-gray-400">Nueva Fecha</Label>
                                    <Input 
                                        type="date" 
                                        className="bg-[#1d2029] border-gray-700"
                                        value={editingMatch.date}
                                        onChange={(e) => setEditingMatch({...editingMatch, date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-gray-400">Nueva Hora</Label>
                                    <Input 
                                        type="time" 
                                        className="bg-[#1d2029] border-gray-700"
                                        value={editingMatch.time}
                                        onChange={(e) => setEditingMatch({...editingMatch, time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setEditingMatch(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleUpdateMatch}
                            className="bg-emerald-500 hover:bg-emerald-600 text-[#13161c] font-black italic"
                        >
                            Confirmar Cambio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
