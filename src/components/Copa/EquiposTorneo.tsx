import { useState, useEffect } from "react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { addTeamToTournament } from "@/store/thunks/tournamentsThunks";
import { fetchClubs } from "@/store/thunks/clubsThunks";
import { selectAuthUser } from "@/store/slices/authSlice";
import { canEditClubRoster } from "@/utils/rosterPermissions";
import { UpdateNominaModal } from "./UpdateNominaModal";
import type { Tournament } from "@/api/type/tournaments.api";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload, User, Users, Shield, Loader2 } from "lucide-react";
import CsvUploaderModal from "./CsvUploaderModal";
import { useTeamAssets } from "@/hooks/useTeamAssets";
import type { ClubWithPlayers } from "@/services/clubs.services";
import { Badge } from "@/components/ui/badge";

interface EquiposTorneoProps {
    tournament: Tournament;
}

export default function EquiposTorneo({ tournament }: EquiposTorneoProps) {
    const dispatch = useAppDispatch();
    const allClubs = useAppSelector(state => state.clubs.clubs);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedClubId, setSelectedClubId] = useState("");

    const refreshData = () => {
        dispatch(fetchClubs());
    };

    useEffect(() => {
        refreshData();
    }, [dispatch]);

    const teams = tournament.equipos || [];
    const maxTeams = tournament.n_equipos;
    const canAddTeam = teams.length < maxTeams;

    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClubId) return;
        
        if (teams.includes(selectedClubId)) {
            toast.error("El club ya está en el torneo");
            return;
        }

        const newTeams = [...teams, selectedClubId];

        try {
            await dispatch(addTeamToTournament({
                tournamentId: tournament.id,
                teams: newTeams
            })).unwrap();
            toast.success("Club agregado al torneo");
            setSelectedClubId("");
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Error al agregar club");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#13161c]/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
                <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-white">
                        EQUIPOS <span className="text-emerald-500 font-normal">({teams.length}/{maxTeams})</span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gestión de Escuadras y Assets</p>
                </div>
                <div className="flex items-center gap-3">
                    {canAddTeam && (
                        <CsvUploaderModal tournamentId={tournament.id} onSuccess={refreshData} />
                    )}
                    {canAddTeam && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold italic tracking-tighter h-9">
                                    <Plus className="mr-2 h-4 w-4" /> Agregar Manual
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1d2029] text-white border-gray-700">
                                <DialogHeader>
                                    <DialogTitle className="italic font-black text-2xl tracking-tighter">AGREGAR NUEVO EQUIPO</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddTeam} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seleccionar Club Registrado</label>
                                        <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                                            <SelectTrigger className="bg-[#2a2d3a] border-gray-600 text-white h-11">
                                                <SelectValue placeholder="Buscar club..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1d2029] border-gray-700 text-white">
                                                {allClubs.map(club => (
                                                    <SelectItem key={club.id} value={club.id}>
                                                        {club.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter className="pt-4">
                                        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#13161c] font-black italic">
                                            VINCULAR AL TORNEO
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-gray-800 overflow-hidden bg-[#13161c]/30 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-gray-900/50">
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-4">Logo</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-4">Equipo</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-4">Director Técnico</TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest py-4 text-center">Nómina</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.length > 0 ? (
                            teams.map((teamId) => {
                                const club = allClubs.find(c => c.id === teamId) as ClubWithPlayers;
                                return (
                                    <TeamRow 
                                        key={teamId} 
                                        club={club} 
                                        fallbackId={teamId}
                                        tournamentId={tournament.id}
                                        onRosterUpdated={refreshData}
                                    />
                                );
                            })
                        ) : (
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableCell colSpan={4} className="text-center text-gray-600 py-12 italic font-medium">
                                    No hay equipos vinculados a este torneo
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

/**
 * Componente de Fila Individual (SRP)
 * Encapsula la lógica de subida de media por equipo.
 */
function TeamRow({ club, fallbackId, tournamentId, onRosterUpdated }: { club?: ClubWithPlayers, fallbackId: string, tournamentId: string, onRosterUpdated: () => void }) {
    const { uploadLogo, isUploading } = useTeamAssets();
    const [isHovered, setIsHovered] = useState(false);
    
    // NÓMINA ADDITIONS
    const user = useAppSelector(selectAuthUser);
    const canEditRoster = canEditClubRoster(user?.role);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && club) {
            await uploadLogo(club.id, e.target.files[0], club.logo_url);
        }
    };

    if (!club) {
        return (
            <TableRow className="border-gray-800 hover:bg-gray-800/10 transition-colors">
                <TableCell colSpan={4} className="text-red-400/50 text-xs italic">
                    Error: Club con ID {fallbackId.substring(0, 8)}... no encontrado
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow 
            className="border-gray-800 hover:bg-gray-800/10 transition-colors group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Columna Logo */}
            <TableCell className="py-4">
                <div className="relative w-12 h-12">
                    <div className="w-full h-full rounded-lg bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center relative">
                        {club.logo_url ? (
                            <img 
                                src={club.logo_url} 
                                alt={club.name} 
                                className={`w-full h-full object-cover transition-opacity ${isUploading(club.id) ? 'opacity-30' : 'opacity-100'}`}
                            />
                        ) : (
                            <Shield className="text-gray-700 w-6 h-6" />
                        )}
                        
                        {/* Overlay de Subida */}
                        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${isHovered || isUploading(club.id) ? 'opacity-100' : 'opacity-0'}`}>
                            {isUploading(club.id) ? (
                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                            ) : (
                                <label className="cursor-pointer p-2 hover:text-emerald-400 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={isUploading(club.id)} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>

            {/* Columna Nombre */}
            <TableCell>
                <div className="flex flex-col">
                    <span className="text-white font-black italic tracking-tighter uppercase">{club.name}</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{club.id.substring(0, 8)}</span>
                </div>
            </TableCell>

            {/* Columna DT */}
            <TableCell>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-300 font-medium">{club.dt_name || 'Sin Asignar'}</span>
                </div>
            </TableCell>

            {/* Columna Jugadores */}
            <TableCell className="text-center">
                <div className="flex flex-col items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 gap-1.5 px-3">
                        <Users className="w-3 h-3" />
                        <span className="font-black tabular-nums">{club.player_count || 0}</span>
                    </Badge>
                    {canEditRoster && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsModalOpen(true)}
                            className="h-6 text-[10px] text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/10 uppercase tracking-widest font-bold"
                        >
                            Actualizar
                        </Button>
                    )}
                </div>
                {/* Modal de nómina */}
                {canEditRoster && (
                    <UpdateNominaModal
                        isOpen={isModalOpen}
                        clubId={club.id}
                        clubName={club.name}
                        tournamentId={tournamentId}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => {
                            setIsModalOpen(false);
                            onRosterUpdated();
                        }}
                    />
                )}
            </TableCell>
        </TableRow>
    );
}
