{/*
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, type User } from '@/hooks/useAuth';
//import eventosData from '@/hooks/BD_Admin.json';
//import horariosData from '@/hooks/BD_Horarios.json';
import { useSchedule } from '@/components/Copa/ScheduleContext';

// Importaciones de UI de shadcn
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- TIPOS DE DATOS ---
interface Club { nombre: string; }
interface Match {
  id: string;
  teamA: string | null;
  teamB: string | null;
  date: string;
  time: string;
  status: 'pending' | 'active' | 'finished';
  round: number;
  winner?: 'teamA' | 'teamB';
}
interface EventoProps { user: User | null; }

const generateEventId = (eventName: string) => `evento-${eventName.toLowerCase().replace(/\s+/g, '-')}`;

export default function Eventos({user}:{user:EventoProps['user']}) {

  // --- ESTADO DEL COMPONENTE ---
    const {schedule, setSchedule} = useSchedule();
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [tournamentType, setTournamentType] = useState<'league' | 'knockout'>('league');
    
    // Estados para parámetros de generación
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    
    // Estados para el formulario manual
    const [manualTeamA, setManualTeamA] = useState('');
    const [manualTeamB, setManualTeamB] = useState('');
    const [manualDate, setManualDate] = useState('');
    const [manualTime, setManualTime] = useState('');

    const currentEvent = useMemo(() => {
        if (!user?.email) return null;
        return eventosData.find((evento) =>
        evento.administrativos.some((admin) => admin.email === user.email)
        );
    }, [user?.email]);

    const clubs = currentEvent?.clubes || [];

  // --- LÓGICA DE CARGA Y GUARDADO ---
  useEffect(() => {
    if (currentEvent) {
      const eventId = generateEventId(currentEvent.evento);
      const loadedSchedule = (horariosData as any)[eventId] || [];
      setSchedule(loadedSchedule);
    }
  }, [currentEvent]);

  const saveSchedule = async (newSchedule: Match[]) => {
    setSchedule(newSchedule); // Actualiza el estado local y de contexto

    if (currentEvent) {
      const eventId = generateEventId(currentEvent.evento);
      const updatedHorarios = {
        ...horariosData,
        [eventId]: newSchedule,
      };

      try {
        const res = await fetch("http://localhost:4000/actualizar-horarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedHorarios, null, 2),
        });
        const data = await res.json();
      } catch (error) {
        console.error("Error al guardar el horario:", error);
        // Opcional: Mostrar un mensaje de error al usuario
      }
    }
  };
  // --- LÓGICA DE GENERACIÓN DE HORARIOS ---

  const distributeMatchesInTime = (matches: Omit<Match, 'date' | 'time'>[]): Match[] => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const diffDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24)) + 1;

    if (diffDays <= 0) {
        alert("El rango de fechas no es válido.");
        return [];
    }

    const totalMatches = matches.length;
    const matchesPerDay = Math.ceil(totalMatches / diffDays);
    let matchCountForCurrentDay = 0;
    let currentDay = startDateObj;

    return matches.map((match) => {
        if (matchCountForCurrentDay >= matchesPerDay) {
            currentDay.setDate(currentDay.getDate() + 1);
            matchCountForCurrentDay = 0;
        }
        
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const totalMinutesInRange = (endH - startH) * 60 + (endM - startM);
        const timeSlot = totalMinutesInRange / matchesPerDay;
        const newTime = new Date(0);
        newTime.setHours(startH, startM, 0, 0);
        newTime.setMinutes(newTime.getMinutes() + (matchCountForCurrentDay * timeSlot));
        
        matchCountForCurrentDay++;
        
        return {
            ...match,
            date: new Intl.DateTimeFormat('es-ES').format(currentDay),
            time: newTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        };
    });
  };

  const handleGenerateSchedule = () => {
    if (!startDate || !endDate || !startTime || !endTime) {
        alert('Por favor, complete todos los parámetros de fecha y hora.');
        return;
    }
    let matchPairs: Omit<Match, 'date' | 'time'>[] = [];
    if (tournamentType === 'league') {
        for (let i = 0; i < clubs.length - 1; i++) {
            for (let j = i + 1; j < clubs.length; j++) {
                matchPairs.push({ id: `match-L-${i}-${j}`, teamA: clubs[i].nombre, teamB: clubs[j].nombre, status: 'pending', round: 1 });
            }
        }
    } else if (tournamentType === 'knockout') {
        let teams = [...clubs].sort(() => 0.5 - Math.random());
        for (let i = 0; i < teams.length; i += 2) {
            if(teams[i+1]) {
                matchPairs.push({ id: `match-K1-${i}`, teamA: teams[i].nombre, teamB: teams[i+1].nombre, status: 'pending', round: 1 });
            }
        }
    }
    const fullSchedule = distributeMatchesInTime(matchPairs);
    saveSchedule(fullSchedule);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTeamA || !manualTeamB || !manualDate || !manualTime || manualTeamA === manualTeamB) {
      alert('Complete todos los campos y asegúrese de que los equipos sean diferentes.');
      return;
    }
    const newMatch: Match = {
      id: `manual-match-${Date.now()}`,
      teamA: manualTeamA,
      teamB: manualTeamB,
      date: new Date(manualDate).toLocaleDateString('es-ES'),
      time: manualTime,
      status: 'pending',
      round: 0, // Ronda 0 para partidos manuales/amistosos
    };
    saveSchedule([...schedule, newMatch]);
  };

  // --- LÓGICA DE INTERACCIÓN DE PARTIDOS ---

  const handleActivateMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    const updatedSchedule = schedule.map(match =>
      match.id === matchId ? { ...match, status: 'active' as const } : match
    );
    saveSchedule(updatedSchedule);
  };

  const handleDeclareWinner = (matchId: string, winner: 'teamA' | 'teamB') => {
    let updatedSchedule = schedule.map(match => 
      match.id === matchId ? { ...match, status: 'finished' as const, winner } : match
    );
    // Lógica para avanzar a la siguiente ronda
    // ... (la misma lógica de la versión anterior)
    saveSchedule(updatedSchedule);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  if (!currentEvent) { return <div className="p-4"><p>No se encontró un evento asociado.</p></div>; }

  return (
    <div className="space-y-6 p-1 md:p-4 max-h-[85vh] overflow-y-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-center">Panel de Control: {currentEvent.evento}</h1>

      {/* 1. Tabla de Clubes Inscritos 
      <Card>
        <CardHeader><CardTitle>Clubes Inscritos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Nombre del Club</TableHead></TableRow></TableHeader>
            <TableBody>
              {clubs.map((club, index) => (
                <TableRow key={club.nombre}><TableCell>{index + 1}</TableCell><TableCell>{club.nombre}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 2. Gestión de Horarios (dos secciones) 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Generador Automático</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Parámetros de generación automática 
            <div className="space-y-2">
              <Label>Tipo de Torneo</Label>
              <Select onValueChange={(value: 'league' | 'knockout') => setTournamentType(value)} defaultValue="league">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="league">Liga (Todos contra todos)</SelectItem>
                  <SelectItem value="knockout">Eliminación Directa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="startDate">Fecha Inicio</Label><Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="endDate">Fecha Fin</Label><Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="startTime">Hora Inicio</Label><Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="endTime">Hora Fin</Label><Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>
            <Button onClick={handleGenerateSchedule} className="w-full">Generar Horario Automático</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Creador Manual de Partidos</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Formulario de creación manual 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Equipo Local</Label><Select onValueChange={setManualTeamA} value={manualTeamA}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent>{clubs.map(c => <SelectItem key={`A-${c.nombre}`} value={c.nombre}>{c.nombre}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Equipo Visitante</Label><Select onValueChange={setManualTeamB} value={manualTeamB}><SelectTrigger><SelectValue placeholder="Seleccionar"/></SelectTrigger><SelectContent>{clubs.filter(c => c.nombre !== manualTeamA).map(c => <SelectItem key={`B-${c.nombre}`} value={c.nombre}>{c.nombre}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="manualDate">Fecha</Label><Input id="manualDate" type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="manualTime">Hora</Label><Input id="manualTime" type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} /></div>
              </div>
              <Button type="submit" className="w-full">Añadir Partido Manualmente</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Diagrama del Torneo (sin cambios) 
      {tournamentType === 'knockout' && schedule.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Diagrama del Torneo (Bracket)</CardTitle></CardHeader>
          <CardContent>{/* ... (lógica de renderBracket) ... </CardContent>
        </Card>
      )}

        {/* 3. Partidos Programados con Flujo de Botones Mejorado 
        <Card>
            <CardHeader><CardTitle>Partidos Programados</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedule.map((match) => (
                <Card key={match.id} className={match.status === 'active' ? 'border-2 border-green-500' : ''}>
                <CardHeader><CardTitle className="text-lg">{match.teamA} vs {match.teamB || 'BYE'}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <p>Fecha: {match.date} - {match.time}</p>
                    <p>Estado: <span className="font-semibold">{match.status}</span></p>
                    <div className="flex flex-col space-y-2">
                    {match.status === 'pending' && (
                        <Button onClick={() => handleActivateMatch(match.id)} disabled={!match.teamA || !match.teamB}>Activar Partido</Button>
                    )}
                    {match.status === 'active' && (
                        <>
                        <p className="text-sm font-semibold text-center">Partido en curso... ¿Quién ganó?</p>
                        <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleDeclareWinner(match.id, 'teamA')}>Gana {match.teamA}</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeclareWinner(match.id, 'teamB')}>Gana {match.teamB}</Button>
                        </div>
                        </>
                    )}
                    {match.status === 'finished' && (
                        <p className="font-bold text-green-500 text-center">Ganador: {match.winner === 'teamA' ? match.teamA : match.teamB}</p>
                    )}
                    </div>
                </CardContent>
                </Card>
            ))}
            </CardContent>
        </Card>
    </div>
  );
}
*/}