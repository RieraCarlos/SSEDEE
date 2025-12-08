import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectAuthUser } from "@/store/slices/authSlice";
import { assignCupoToPlayer, fetchClubPlayers, fetchMatchDate, fetchNominaCupos, removeCupoFromPlayer, toggleMatchDateState } from "@/store/thunks/clubsThunks";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import FormularioEditFecha from "./FormularioEditFecha";
import FormularioEditHora from "./FormularioEditHora";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import { selectIsCurrentUserAssigned, selectMatchDates, selectNominaPlayerIds, selectTeamData } from "@/store/slices/clubsSlice";

// --- Type Definitions ---
interface Player {
  id: number | string;
  name: string;
  posicion: string;
  isAssigned: boolean;
}

interface TeamSection {
  title: string;
  players: Player[];
}

interface SeatAssignmentProps {
  teamData: TeamSection[];
  onSolicitarCupo: () => void;
  isCurrentUserAssigned: boolean;
  onCancelarCupo: () => void;
  roleUser: string;
  matchDates: any[];
  isWindowOpen: boolean;
  nominaCount: number;
  clubId: string;
}

// --- Helper Functions ---
const getFechaString = (fechas: string | string[] | undefined | null): string | null => {
  if (!fechas) return null;
  return Array.isArray(fechas) ? (fechas.length > 0 ? String(fechas[1]) : null) : String(fechas);
};

const formatDateLabel = (input?: string | string[] | null) => {
  const fechaStr = getFechaString(input ?? null);
  if (!fechaStr) return null;

  let dateObj: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
    const [y, m, d] = fechaStr.split('-').map(p => Number(p));
    dateObj = new Date(y, m - 1, d);
  } else {
    // Fallback for other formats, can be expanded
    const parsed = Date.parse(fechaStr);
    if (!isNaN(parsed)) dateObj = new Date(parsed);
  }

  if (!dateObj || isNaN(dateObj.getTime())) return null;

  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj);
};

// --- SeatAssignment Component ---
const SeatAssignment: React.FC<SeatAssignmentProps> = ({ clubId, teamData, onSolicitarCupo, isCurrentUserAssigned, onCancelarCupo, roleUser, matchDates, isWindowOpen, nominaCount }) => {
  const dispatch = useAppDispatch();

  const getHoursArray = (horario: string | string[] | undefined | null): [string, string] => {
    if (!horario || !Array.isArray(horario)) return ["06:00", "17:00"];
    return [String(horario[0] || "06:00"), String(horario[1] || "17:00")];
  };

  const getDisplayHours = (): [string, string] => {
    const habilitadoMatch = matchDates.find(m => m.estado === 'habilitado');
    return getHoursArray(habilitadoMatch?.horario);
  };
  
  const handleStatusChange = useCallback((fechaId: string, date: string, newState: 'habilitado' | 'deshabilitado' | 'guardado') => {
    const action = dispatch(toggleMatchDateState({ fechaId, clubId, date, newState }));
    toast.promise(action, {
      loading: 'Actualizando estado...',
      success: () => {
        dispatch(fetchMatchDate(clubId));
        return 'El estado se ha actualizado correctamente.';
      },
      error: (err: any) => err.message || 'Error al actualizar el estado.',
    });
  }, [dispatch, clubId]);

  const datesToDisplay = useMemo(() => {
    if (!Array.isArray(matchDates)) return [];
    
    // Filter out 'guardado' state for the main view
    const nonGuardadoItems = matchDates.filter(item => item.estado !== 'guardado');
    
    // Players only see 'habilitado' matches
    const filteredForRole = roleUser === 'jugador'
      ? nonGuardadoItems.filter(item => item.estado === 'habilitado')
      : nonGuardadoItems;

    return filteredForRole.map(item => ({
      ...item,
      label: formatDateLabel(item.fecha),
    })).filter(item => item.label);
  }, [matchDates, roleUser]);
  
  const [startHour, endHour] = getDisplayHours();

  const renderPlayerTable = (section: TeamSection) => (
    <div className="mb-8 last:mb-0">
      <h2 className="text-2xl font-semibold mb-3 tracking-wider text-orange-400">{section.title}</h2>

      {/* --- Vista de Tabla para Escritorio (sm y superior) --- */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-600">
              <TableHead className="w-1/12 text-gray-400 p-2 hidden sm:table-cell">#</TableHead>
              <TableHead className="w-5/12 text-gray-400 p-2">Nombre</TableHead>
              <TableHead className="w-4/12 text-gray-400 p-2">Posición</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.players.map((player, index) => (
              <TableRow key={player.id} className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${!player.isAssigned ? 'opacity-50' : ''}`}>
                <TableCell className="p-2 hidden sm:table-cell text-gray-300">{index + 1}</TableCell>
                <TableCell className="p-2 font-medium capitalize text-gray-300">{player.name}</TableCell>
                <TableCell className="p-2 capitalize text-gray-300">{player.posicion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- Vista de Tarjetas para Móviles (inferior a sm) --- */}
      <div className="block sm:hidden space-y-3">
        {section.players.map((player, index) => (
          <div key={player.id} className={`rounded-lg p-2 border-b-2 transition-all duration-300 ${player.isAssigned ? 'bg-transparent border-l-4 border-[#07080a]' : 'bg-gray-800/60 opacity-70'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm capitalize text-white">{index + 1}. {player.name}</p>
                <p className="text-xs capitalize text-gray-400">{player.posicion}</p>
              </div>
              <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${player.isAssigned ? 'text-gray-400 bg-[#07080a]' : 'text-yellow-300 bg-yellow-900/50'}`}>
                {player.isAssigned ? 'Asignado' : 'Disponible'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full text-white">
      <Card className="bg-transparent max-w-4xl mx-auto border-0 py-0">
        <CardContent>
          <header className="mb-8 border-b-2 border-gray-700 pb-4 text-white">
            <h1 className="text-3xl font-bold mb-4">Asignación de cupos</h1>
            <div className="flex flex-col text-start space-y-4">
              <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-300 font-bold mb-2">Días de juego</p>
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-gray-400 text-xs">Fecha</TableHead>
                            {roleUser === 'dt' && <TableHead className="text-gray-400 text-xs">Estado</TableHead>}
                            {roleUser === 'dt' && <TableHead className="text-gray-400 text-right text-xs">Acción</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {datesToDisplay.length > 0 ? datesToDisplay.map((item) => (
                            <TableRow key={item.id} className="border-0">
                              <TableCell className="text-gray-300 text-sm">{item.label}</TableCell>
                              {roleUser === 'dt' && <TableCell>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.estado === 'habilitado' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}>
                                  {item.estado}
                                </span>
                              </TableCell>}
                              {roleUser === 'dt' && <TableCell className="text-right">
                                <Select value={item.estado} onValueChange={(newState: any) => handleStatusChange(item.id, item.fecha, newState)}>
                                  <SelectTrigger className="w-[120px] bg-gray-800 border-0 text-white"><SelectValue placeholder="Cambiar" /></SelectTrigger>
                                  <SelectContent className="bg-gray-800 text-white text-xs">
                                    <SelectItem value="habilitado">Habilitado</SelectItem>
                                    <SelectItem value="guardado">Guardado</SelectItem>
                                    <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>}
                            </TableRow>
                          )) : <TableRow><TableCell colSpan={roleUser === 'dt' ? 3 : 1} className="h-24 text-center">No hay fechas de juego programadas.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Vista para pantallas pequeñas */}
                    <div className="block md:hidden">
                      {datesToDisplay.length > 0 ? datesToDisplay.map((item) => (
                        <div key={item.id} className="border-b border-gray-700 py-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-xs">Fecha del partido:</span>
                            <span className="text-gray-300 text-xs">{item.label}</span>
                          </div>
                          {roleUser === 'dt' && (
                            <>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-xs">Estado:</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.estado === 'habilitado' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}>
                                  {item.estado}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">Acción:</span>
                                <Select value={item.estado} onValueChange={(newState: any) => handleStatusChange(item.id, item.fecha, newState)}>
                                  <SelectTrigger className="w-[120px] bg-gray-800 border-0 text-white text-xs p-2"><SelectValue placeholder="Cambiar" /></SelectTrigger>
                                  <SelectContent className="bg-gray-800 text-white text-xs">
                                    <SelectItem value="habilitado">Habilitado</SelectItem>
                                    <SelectItem value="guardado">Guardado</SelectItem>
                                    <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      )) : (
                        <div className="h-24 text-center flex items-center justify-center">
                          No hay fechas de juego programadas.
                        </div>
                      )}
                    </div>
                  </div>
                {roleUser === 'dt' && <FormularioEditFecha clubId={clubId} matchDates={matchDates} />}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300 font-bold">Solicita un cupo a partir de {startHour} hasta las {endHour}</p>
                {roleUser === 'dt' && <FormularioEditHora matchDates={matchDates} />}
              </div>
            </div>

            {!isCurrentUserAssigned ? (
              <div className="flex items-center space-x-3">
                <Button className="mt-4 bg-[#0ae98a] hover:bg-[#0ae98a]/80 text-[#13161c] font-semibold py-2 px-6 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onSolicitarCupo} disabled={!isWindowOpen || (nominaCount >= 10)}>
                  Solicitar cupo
                </Button>
                {nominaCount >= 10 && <span className="text-xs md:text-sm text-yellow-400 mt-4">Nómina completa ({nominaCount}/10)</span>}
              </div>
            ) : (
              <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onCancelarCupo} disabled={!isWindowOpen}>
                Cancelar cupo
              </Button>
            )}
          </header>

          <div className="max-h-[60vh] overflow-y-auto hide-scrollbar">
            {teamData.map(section => renderPlayerTable(section))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- C_Cupos Container Component ---
export default function C_Cupos() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const nominaPlayerIds = useAppSelector(selectNominaPlayerIds);
  const matchDates = useAppSelector(selectMatchDates);
  const teamData = useAppSelector(selectTeamData);
  const isCurrentUserAssigned = useAppSelector(selectIsCurrentUserAssigned);

  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Advanced effect to manage window status with setTimeout for performance
  useEffect(() => {
    const updateWindowStatus = () => {
      const habilitadoMatch = matchDates.find(md => md.estado === 'habilitado');
      if (!habilitadoMatch) {
        setIsWindowOpen(false);
        return;
      }
      
      const now = new Date();
      // FIX: Parse date string as local time to avoid timezone bugs.
      // new Date('YYYY-MM-DD') creates a date at UTC midnight, which can be the previous day in some timezones.
      const [year, month, day] = habilitadoMatch.fecha.split('-').map(Number);
      const matchDate = new Date(year, month - 1, day);
      
      const isMatchDay = matchDate.getFullYear() === now.getFullYear() &&
        matchDate.getMonth() === now.getMonth() &&
        matchDate.getDate() === now.getDate();

      if (!isMatchDay) {
        setIsWindowOpen(false);
        return;
      }

      const [startStr, endStr] = habilitadoMatch.horario;
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);

      const startTime = new Date(now);
      startTime.setHours(startH, startM, 0, 0);

      const endTime = new Date(now);
      endTime.setHours(endH, endM, 0, 0);
      
      const isOpen = now >= startTime && now <= endTime;
      setIsWindowOpen(isOpen);

      // Schedule next check
      const nextCheckTime = isOpen ? endTime.getTime() + 1000 : startTime.getTime();
      const delay = nextCheckTime - now.getTime();
      
      if (delay > 0) {
        timeoutRef.current = setTimeout(updateWindowStatus, delay);
      }
    };

    updateWindowStatus(); // Initial check

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [matchDates]);

  const handleSolicitarCupo = useCallback(() => {
    if (user?.id_club && user.id) {
      const promise = dispatch(assignCupoToPlayer({ clubId: user.id_club, playerId: user.id })).unwrap();
      toast.promise(promise, {
        loading: 'Solicitando cupo...',
        success: () => 'Cupo asignado con éxito.',
        error: (err: any) => err.message || 'Error al asignar el cupo.'
      });
    }
  }, [dispatch, user]);

  const handleCancelarCupo = useCallback(() => {
    if (user?.id_club && user.id) {
      const promise = dispatch(removeCupoFromPlayer({ clubId: user.id_club, playerId: user.id })).unwrap();
      toast.promise(promise, {
        loading: 'Cancelando cupo...',
        success: () => 'Cupo cancelado con éxito.',
        error: (err: any) => err.message || 'Error al cancelar el cupo.'
      });
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.id_club) {
      dispatch(fetchClubPlayers(user.id_club));
      dispatch(fetchNominaCupos(user.id_club));
      dispatch(fetchMatchDate(user.id_club));
    }
  }, [dispatch, user?.id_club]);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl pt-4 flex items-center justify-center col-span-1 lg:col-span-2 overflow-hidden text-center">
      <Toaster richColors />
      <SeatAssignment
        teamData={teamData}
        onSolicitarCupo={handleSolicitarCupo}
        isCurrentUserAssigned={isCurrentUserAssigned}
        onCancelarCupo={handleCancelarCupo}
        roleUser={user.role}
        matchDates={matchDates}
        isWindowOpen={isWindowOpen}
        nominaCount={nominaPlayerIds.length}
        clubId={user.id_club!}
      />
    </div>
  );
}
