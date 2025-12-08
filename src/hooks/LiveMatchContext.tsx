import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSchedule } from '../components/Copa/ScheduleContext';
import { type Player } from '../components/Copa/tableC_Sucesos'
//import equiposData from '@/hooks/BD_Equipos.json';
import usersData from '@/hooks/usuario-dev.json';

interface CardCounts {
  yellow: number;
  red: number;
}

interface LiveMatchContextType {
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  scoreA: number;
  scoreB: number;
  teamACards: CardCounts;
  teamBCards: CardCounts;
  updatePlayerStat: (team: 'A' | 'B', playerId: number, stat: 'gol' | 'amarilla' | 'roja', value: number) => void;
}

const LiveMatchContext = createContext<LiveMatchContextType | undefined>(undefined);

export const LiveMatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeMatch } = useSchedule();
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [teamACards, setTeamACards] = useState<CardCounts>({ yellow: 0, red: 0 });
  const [teamBCards, setTeamBCards] = useState<CardCounts>({ yellow: 0, red: 0 });

  useEffect(() => {
    if (activeMatch) {
      const getPlayers = (teamName: string | null): Player[] => {
        if (!teamName) return [];
        const team = equiposData.find(t => t.equipo === teamName);
        if (!team) return [];

        return team.jugadores.map((playerRef, index) => {
          const user = usersData.find(u => u.email === playerRef.email);
          return {
            id: index,
            camiseta: user && user.numero_camisa ? parseInt(user.numero_camisa, 10) : 0,
            nombre: user ? (user.nombre_jugador || user.nombre) : 'Unknown',
            gol: 0,
            amarilla: 0,
            roja: 0,
            estado: 'En cancha',
            tipoJugador: 'titular'
          };
        }).filter(p => p.nombre !== 'Unknown');
      };

      setTeamAPlayers(getPlayers(activeMatch.teamA));
      setTeamBPlayers(getPlayers(activeMatch.teamB));
    } else {
      setTeamAPlayers([]);
      setTeamBPlayers([]);
    }
  }, [activeMatch]);

  const updatePlayerStat = (team: 'A' | 'B', playerId: number, stat: 'gol' | 'amarilla' | 'roja', value: number) => {
    const players = team === 'A' ? teamAPlayers : teamBPlayers;
    const setPlayers = team === 'A' ? setTeamAPlayers : setTeamBPlayers;

    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, [stat]: value } : p
    );
    setPlayers(updatedPlayers);
  };

  useEffect(() => {
    const teamAScore = teamAPlayers.reduce((acc, player) => acc + player.gol, 0);
    const teamBScore = teamBPlayers.reduce((acc, player) => acc + player.gol, 0);
    setScoreA(teamAScore);
    setScoreB(teamBScore);

    const teamACardCounts = teamAPlayers.reduce((acc, player) => {
      acc.yellow += player.amarilla;
      acc.red += player.roja;
      return acc;
    }, { yellow: 0, red: 0 });
    setTeamACards(teamACardCounts);

    const teamBCardCounts = teamBPlayers.reduce((acc, player) => {
      acc.yellow += player.amarilla;
      acc.red += player.roja;
      return acc;
    }, { yellow: 0, red: 0 });
    setTeamBCards(teamBCardCounts);

  }, [teamAPlayers, teamBPlayers]);

  return (
    <LiveMatchContext.Provider value={{ teamAPlayers, teamBPlayers, scoreA, scoreB, teamACards, teamBCards, updatePlayerStat }}>
      {children}
    </LiveMatchContext.Provider>
  );
};

export const useLiveMatch = () => {
  const context = useContext(LiveMatchContext);
  if (context === undefined) {
    throw new Error('useLiveMatch must be used within a LiveMatchProvider');
  }
  return context;
};
