import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '../ui/button';
import { ClipboardClock, Loader, MessageCircleCode, Trophy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchGuardadoMatches, fetchMatchDate, getTeamsPlayers, saveMatchResult, updateTeamsPlayers } from '@/store/thunks/clubsThunks';
import FormularioSeleccionarEquipoGanador from './FormularioSeleccionarEquipo';
import { selectAssignedPlayers } from '@/store/slices/clubsSlice';

// --- Type Definitions ---
export interface Player {
  id: number | string;
  name: string;
  posicion: string;
  isAssigned: boolean; 
}

interface Team {
  id: number;
  title: string;
  players: Player[];
}

interface PartidoEquipos {
  partidoId: string | null;
  equipoA: string[];
  equipoB: string[];
  equipoGanador: 'A' | 'B' | null;
  estado: 'habilitado' | 'guardado' | 'deshabilitado' | null;
}

const ROSTER_SIZE = 10;
const TEAM_SIZE = 5;

// --- Main Component ---
export default function C_Equipos() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const assignedPlayers = useAppSelector(selectAssignedPlayers);
  const allClubPlayers = useAppSelector((state) => state.clubs.players);

  // --- State Management ---
  const [teamA, setTeamA] = useState<Player[] | null>(null);
  const [teamB, setTeamB] = useState<Player[] | null>(null);
  const [rawTeamData, setRawTeamData] = useState<{ equipoA: string[], equipoB: string[] }>({ equipoA: [], equipoB: [] });
  const [partidoId, setPartidoId] = useState<string | null>(null);
  const [estadoPartido, setEstadoPartido] = useState('');
  const [nameTeam, setNameTeam] = useState('');
  const [isTeamWin, setIsTeamWin] = useState(false);
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertSubmitTeams, setIsAlertSubmitTeams] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // --- Callbacks ---
  const particionarArrayAleatoriamente = useCallback((array: Player[]): { playerA: Player[], playerB: Player[] } =>  {
    if (array.length !== ROSTER_SIZE) {
        throw new Error(`El array debe contener exactamente ${ROSTER_SIZE} elementos.`);
    }
    const arrayCopia = [...array]; 
    for (let i = 0; i < TEAM_SIZE; i++) {
        const j = i + Math.floor(Math.random() * (arrayCopia.length - i)); 
        [arrayCopia[i], arrayCopia[j]] = [arrayCopia[j], arrayCopia[i]];
    }
    return { 
      playerA: arrayCopia.slice(0, TEAM_SIZE), 
      playerB: arrayCopia.slice(TEAM_SIZE) 
    };
  }, []);

  const handlePlayersTeam = useCallback(() => {
    try {
      const { playerA, playerB } = particionarArrayAleatoriamente(assignedPlayers);
      setTeamA(playerA);
      setTeamB(playerB);
      setPublished(false);
      setIsAlertSubmitTeams(false)
    } catch (err: any) {
      toast.error(err.message || "Error al crear los equipos.");
      setTeamA(null);
      setTeamB(null);
    }
  }, [assignedPlayers, particionarArrayAleatoriamente]);

  const handleSaveResult = useCallback((winningTeam: 'A' | 'B') => {
    if (!partidoId || !user?.id_club) {
      toast.error('No se puede guardar el resultado. Falta información del partido.');
      return;
    }
    dispatch(saveMatchResult({ partidoId, winningTeam })).then(() => {
      dispatch(fetchMatchDate(user.id_club!));
      setIsTeamWin(true);
      setIsAlertSubmitTeams(false);
      setNameTeam(winningTeam);
      setEstadoPartido('guardado')
      toast.success(`Equipo ${winningTeam} guardado como ganador.`);
    });
  }, [dispatch, partidoId, user?.id_club]);
  
  const handleCopyResult = useCallback(() => {
    if (!teamA || !teamB || !nameTeam) {
      toast.error('No hay datos del partido para copiar.');
      return;
    }
    const winnerName = nameTeam === 'A' ? 'Equipo A' : 'Equipo B';
    const teamAPlayers = teamA.map(p => `- ${p.name}`).join('\n');
    const teamBPlayers = teamB.map(p => `- ${p.name}`).join('\n');
    const message = `*🏆 ¡Resultado del Partido! 🏆*\n\n*EQUIPO A*\n${teamAPlayers}\n\n*EQUIPO B*\n${teamBPlayers}\n\n-----------------------------\n*🎉 Ganador: ${winnerName}*\n-----------------------------\n\n*SSEDEE*\n"Tu sistema de confianza" 😎`;
    navigator.clipboard.writeText(message.trim())
      .then(() => toast.success('¡Resultado copiado al portapapeles!'))
      .catch(() => toast.error('No se pudo copiar el resultado.'));
  }, [teamA, teamB, nameTeam]);

  const handleSubmitTeamsPlayer = useCallback(async () => {
    if (!user?.id_club || !teamA || !teamB) {
      toast.error('No se pueden publicar los equipos. Falta información.');
      return;
    }
    const teamAIds = teamA.map(p => String(p.id));
    const teamBIds = teamB.map(p => String(p.id));
    const recordId = partidoId ?? String(user.id_club);

    setIsSubmitting(true);
    try {
      await dispatch(updateTeamsPlayers({ recordId, teamP_A: teamAIds, teamP_B: teamBIds })).unwrap();
      setPublished(true);
      setIsAlertSubmitTeams(true);
      toast.success("Equipos publicados correctamente.");
      // Hide the message after 3 seconds
      timeoutRef.current = window.setTimeout(() => setPublished(false), 3000);
    } catch (err) {
      toast.error("Error al publicar los equipos.");
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, user?.id_club, partidoId, teamA, teamB]);

  // --- Effects ---
  // Effect for cleaning up timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Effect to fetch initial team data (once per club)
  useEffect(() => {
    if (!user?.id_club) return;
    dispatch(getTeamsPlayers({ recordId: String(user.id_club) }))
      .unwrap()
      .then((res: PartidoEquipos) => {
        if (res && res.equipoA.length >= 0 && res.equipoB.length >= 0) {
          setRawTeamData({ equipoA: res.equipoA, equipoB: res.equipoB });
          setPartidoId(res.partidoId);
          setNameTeam(res.equipoGanador || '');
          setEstadoPartido(res.estado || '');
          setIsAlertSubmitTeams(true)
          if (res.estado === 'guardado') {
            setIsTeamWin(true);
          }
        }
      })
      .catch(() => {
        // Silently fail, means no teams are stored in DB which is a valid state
        console.log('No teams found in DB for this club.');
      });
    
    dispatch(fetchGuardadoMatches({ clubId: user.id_club }));
  }, [dispatch, user?.id_club]);

  // Effect to map raw team IDs to player data when available
  useEffect(() => {
    if (rawTeamData.equipoA.length === 0 || allClubPlayers.length === 0) return;

    const mapById = (ids: string[]): Player[] => {
      return ids.map(id => {
        const found = allClubPlayers.find(p => String(p.id).trim() === String(id).trim());
        return {
          id: found?.id ?? id,
          name: found?.fullname ?? `ID ${id}`,
          posicion: found?.posicion || 'N/A',
          isAssigned: true,
        };
      });
    };
    
    setTeamA(mapById(rawTeamData.equipoA));
    setTeamB(mapById(rawTeamData.equipoB));
  }, [rawTeamData, allClubPlayers]);

  // --- Render Logic ---
  const isRosterReady = assignedPlayers.length === ROSTER_SIZE;
  const teamsAreSet = teamA && teamB;
  
  const renderTeamTable = (team: Team) => (
    <Card className="bg-transparent border-4 border-[#181b22] rounded-xl w-full">
      <CardContent className="p-0">
        <h3 className="text-xl font-semibold p-4 text-orange-400">{team.title}</h3>
        <Table className="w-full text-left">
          <TableHeader>
            <TableRow className="border-b border-gray-800">
              <TableHead className="w-1/4 text-gray-400 p-2 pl-4">#</TableHead>
              <TableHead className="w-2/4 text-gray-400 p-2">Nombre</TableHead>
              <TableHead className="w-1/4 text-gray-400 p-2">Posición</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.players.map((player, index) => (
              <TableRow key={player.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-700/50 transition-colors">
                <TableCell className="p-2 pl-4 text-gray-300">{index + 1}</TableCell>
                <TableCell className="p-2 font-medium capitalize text-gray-300">{player.name}</TableCell>
                <TableCell className="p-2 capitalize text-gray-400 text-sm">{player.posicion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
  return (
    <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 flex-grow overflow-hidden text-center">
      <div className='flex flex-row items-center justify-around mb-6'>
        <span className="text-2xl md:text-3xl font-bold text-white">Tabla de Equipos</span>
        {user?.role === "dt" && estadoPartido !== 'guardado' && (
          <div className='flex flex-col items-center'>
            <Button 
              className='p-3 rounded-lg text-white bg-gradient-to-r from-[#13161c] to-[#0ae98a] hover:from-[#13161c] hover:to-[#0ae98a]/50 transition-all duration-300 cursor-pointer disabled:to-gray-600 disabled:cursor-not-allowed' 
              onClick={handlePlayersTeam}
              disabled={!isRosterReady}
            >
              <Trophy className="mr-2"/> {teamsAreSet ? 'Actualizar equipos' : 'Crear equipos'}
            </Button>
            {!isRosterReady && (
                <p className='text-xs text-yellow-400 mt-2 flex items-center'><AlertTriangle className="w-4 h-4 mr-1"/>Se necesitan {ROSTER_SIZE} jugadores en nómina.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center h-full">
        {assignedPlayers.length === 0 ? (
          <div className='flex flex-col justify-center items-center h-full'>
              <Loader className='w-10 h-10 text-[#0ae98a] animate-spin' />
              <p className="mt-4 text-gray-400">Esperando jugadores en la nómina...</p>
          </div>
        ) : (
          <div className='w-full flex flex-col items-center -mt-10'>
              {teamsAreSet && partidoId && user?.role === 'dt' && isAlertSubmitTeams && estadoPartido === 'habilitado' ? (
                <div className='mb-6'>
                  <FormularioSeleccionarEquipoGanador teamA={teamA} teamB={teamB} partidoId={partidoId} onSave={handleSaveResult} />
                </div>
              ) : (isTeamWin && estadoPartido === 'guardado' ? (
                <Button className='mb-6 p-3 rounded-lg text-white bg-gradient-to-r from-[#13161c] to-[#0ae98a] hover:from-[#13161c] hover:to-[#0ae98a]/50' onClick={handleCopyResult}>
                  <MessageCircleCode className='mr-2'/> Enviar informe al grupo
                </Button>
              ) : null)}

            {teamsAreSet ? (
              <div className='w-full flex flex-col lg:flex-row items-center justify-center gap-4 mb-4'>
                <div className='w-full'>
                  <div className={isTeamWin && nameTeam === "A" ? 'border-2 border-[#0ae98a]/50 rounded-2xl drop-shadow-[0_0_15px_rgba(10,233,138,0.25)]' : ''}>
                    {renderTeamTable({ id: 1, title: 'Equipo A', players: teamA })}
                  </div>
                  {isTeamWin && nameTeam === "A" && <p className='text-[#0ae98a] text-sm mt-2'>Ganador</p>}
                </div>
                <div className='flex items-center justify-center text-xl font-bold text-white px-4 py-4'>VS</div>
                <div className='w-full'>
                  <div className={isTeamWin && nameTeam === "B" ? 'border-2 border-[#0ae98a]/50 rounded-2xl drop-shadow-[0_0_15px_rgba(10,233,138,0.25)]' : ''}>
                    {renderTeamTable({ id: 2, title: 'Equipo B', players: teamB })}
                  </div>
                  {isTeamWin && nameTeam === "B" && <p className='text-[#0ae98a] text-sm mt-2'>Ganador</p>}
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-300 flex flex-col justify-center items-center h-full'>
                {user?.role === "dt" ? <p>Presione "Crear equipos" para generar los equipos desde la nómina.</p> : <p>El DT aun no genera los equipos.</p>}
                <ClipboardClock className="mt-2"/>
              </div>
            )}

            {teamsAreSet && user?.role === 'dt' && estadoPartido === 'habilitado' && (
              <div className=''>
                {isAlertSubmitTeams && !published ? (
                  <p className='text-sm text-[#0ae98a] font-bold'>Equipos Publicados</p>
                ): !isTeamWin ? (
                  <Button className='p-3 rounded-lg text-white bg-gradient-to-r from-[#13161c] to-[#0ae98a] hover:from-[#13161c] hover:to-[#0ae98a]/50' onClick={handleSubmitTeamsPlayer} disabled={published || isSubmitting}>
                    Publicar equipos
                  </Button>
                ): ''}
                {published && <p className='text-sm text-[#0ae98a] mt-2'>Equipos publicados correctamente.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
