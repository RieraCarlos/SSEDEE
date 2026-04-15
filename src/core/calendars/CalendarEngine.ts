export type MatchType = "ida" | "idaVuelta" | "todosContraTodos" | "IdaVueltaTvsT";

export interface CalendarMatch {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
  round: string;
  is_active?: boolean;
  reporte_final?: any;
  goles_local?: number;
  goles_visitante?: number;
  fecha_partido_raw?: string;
}

export interface CalendarRound {
  round: string;
  date: string;
  dayName: string;
  matches: CalendarMatch[];
  byeTeams: string[];
}

export interface CalendarAlgorithmResult {
  matches: CalendarMatch[];
  rounds: CalendarRound[];
  byeMapping: Record<string, string[]>;
}

export interface CalendarGenerationConfig {
  teams: string[];
  matchType: MatchType;
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  playDays?: number[];
}

const WEEK_DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const DEFAULT_PLAY_DAYS = [6];

const parseDateOnly = (value: string): Date => {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    const parts = value.split('T')[0].split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    throw new Error(`Fecha inválida: ${value}`);
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const validateHours = (startHour: string, endHour: string) => {
  const start = parseInt(startHour.split(':')[0], 10);
  const end = parseInt(endHour.split(':')[0], 10);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error('Las horas de partido deben tener formato HH:mm');
  }
  if (start >= end) {
    throw new Error('La hora de inicio debe ser menor que la hora de fin');
  }
  return { start, end };
};

const listValidMatchDates = (startDate: string, endDate: string, playDays: number[]) => {
  if (!playDays || playDays.length === 0) {
    playDays = DEFAULT_PLAY_DAYS;
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (end < start) {
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
  }

  const current = new Date(start);
  const validDates: Date[] = [];
  while (current <= end) {
    if (playDays.includes(current.getDay())) {
      validDates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return validDates;
};

const deepCloneTeams = (teams: string[]) => teams.map(team => team.trim()).filter(Boolean);

interface Pairing {
  home: string;
  away: string;
}

interface RoundPairings {
  roundNumber: number;
  pairings: Pairing[];
  byeTeams: string[];
}

const buildRoundRobinPairings = (teams: string[]): RoundPairings[] => {
  const normalized = deepCloneTeams(teams);
  if (normalized.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos para generar el calendario');
  }

  const hasBye = normalized.length % 2 !== 0;
  if (hasBye) {
    normalized.push('BYE');
  }

  const totalRounds = normalized.length - 1;
  const matchesPerRound = normalized.length / 2;
  const rounds: RoundPairings[] = [];
  const workingTeams = [...normalized];

  for (let round = 0; round < totalRounds; round++) {
    const pairings: Pairing[] = [];
    const byeTeams: string[] = [];

    for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex++) {
      const home = workingTeams[matchIndex];
      const away = workingTeams[workingTeams.length - 1 - matchIndex];

      if (home === 'BYE' || away === 'BYE') {
        const byeTeam = home === 'BYE' ? away : home;
        byeTeams.push(byeTeam);
        continue;
      }

      const isEvenRound = round % 2 === 0;
      const shouldSwap = matchIndex === 0 ? !isEvenRound : false;
      pairings.push({
        home: shouldSwap ? away : home,
        away: shouldSwap ? home : away,
      });
    }

    rounds.push({
      roundNumber: round + 1,
      pairings,
      byeTeams,
    });

    const lastTeam = workingTeams.pop()!;
    workingTeams.splice(1, 0, lastTeam);
  }

  return rounds;
};

const buildDoubleRoundRobinPairings = (teams: string[]): RoundPairings[] => {
  const firstLeg = buildRoundRobinPairings(teams);
  
  // SEGUNDA VUELTA: Simplemente invertir localías (home ↔ away) de la primera vuelta
  // Esto garantiza que no hay duplicados y mantiene la misma estructura Round Robin
  const secondLeg = firstLeg.map((round) => ({
    roundNumber: round.roundNumber + firstLeg.length,
    pairings: round.pairings.map(pair => ({ home: pair.away, away: pair.home })),
    byeTeams: [...round.byeTeams],
  }));
  return [...firstLeg, ...secondLeg];
};

const roundGeneratorByType: Record<MatchType, (teams: string[]) => RoundPairings[]> = {
  todosContraTodos: buildRoundRobinPairings,
  IdaVueltaTvsT: buildDoubleRoundRobinPairings,
  ida: () => { throw new Error('El tipo de partido "ida" no está soportado por el motor de calendario de liga'); },
  idaVuelta: () => { throw new Error('El tipo de partido "idaVuelta" no está soportado por el motor de calendario de liga'); },
};

const scheduleRounds = (
  rounds: RoundPairings[],
  validDates: Date[],
  startHour: number,
  endHour: number,
  labelFormatter: (roundNumber: number) => string
): CalendarRound[] => {
  const slotsPerDay = Math.floor(endHour - startHour);
  if (slotsPerDay < 1) {
    throw new Error('El rango horario no permite al menos una hora de partido');
  }

  // Calcular total de partidos
  const totalMatches = rounds.reduce((sum, round) => sum + round.pairings.length, 0);
  const daysNeeded = Math.ceil(totalMatches / slotsPerDay);

  if (daysNeeded > validDates.length) {
    throw new Error(
      `Se necesitan ${daysNeeded} días para acomodar ${totalMatches} partidos (${slotsPerDay} partidos/día), pero solo hay ${validDates.length} días disponibles.`
    );
  }

  // Crear index para distribuir partidos en los días
  let currentDayIndex = 0;
  let currentSlotInDay = 0;
  const scheduledRounds: CalendarRound[] = [];

  for (const round of rounds) {
    const roundMatches: CalendarMatch[] = [];
    const roundByeTeams = [...round.byeTeams];

    for (const pair of round.pairings) {
      // Si la franja actual está llena, pasar al siguiente día
      if (currentSlotInDay >= slotsPerDay) {
        currentDayIndex++;
        currentSlotInDay = 0;
      }

      if (currentDayIndex >= validDates.length) {
        throw new Error('No hay suficientes días para acomodar todos los partidos.');
      }

      const date = validDates[currentDayIndex];
      const matchHour = startHour + currentSlotInDay;

      roundMatches.push({
        id: crypto.randomUUID(),
        home: pair.home,
        away: pair.away,
        date: formatISODate(date),
        time: `${String(matchHour).padStart(2, '0')}:00`,
        round: labelFormatter(round.roundNumber),
      });

      currentSlotInDay++;
    }

    scheduledRounds.push({
      round: labelFormatter(round.roundNumber),
      date: roundMatches.length > 0 ? roundMatches[0].date : formatISODate(validDates[0]),
      dayName: roundMatches.length > 0 ? WEEK_DAY_NAMES[parseDateOnly(roundMatches[0].date).getDay()] : '',
      matches: roundMatches,
      byeTeams: roundByeTeams,
    });
  }

  return scheduledRounds;
};

const accumulateFlatMatches = (rounds: CalendarRound[]): CalendarMatch[] =>
  rounds.flatMap(round => round.matches);

const buildByeMapping = (rounds: CalendarRound[]): Record<string, string[]> =>
  rounds.reduce((map, round) => {
    if (round.byeTeams.length > 0) {
      map[round.round] = [...round.byeTeams];
    }
    return map;
  }, {} as Record<string, string[]>);

export const generateCalendar = (config: CalendarGenerationConfig): CalendarAlgorithmResult => {
  const { teams, matchType, startDate, endDate, startHour, endHour, playDays } = config;
  const teamList = deepCloneTeams(teams);
  if (teamList.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos para generar un calendario');
  }

  const { start, end } = validateHours(startHour, endHour);
  const validDays = listValidMatchDates(startDate, endDate, playDays ?? DEFAULT_PLAY_DAYS);
  if (validDays.length === 0) {
    throw new Error('No hay días de juego válidos dentro del rango de fechas. Actualice el rango o los días de juego.');
  }

  const generator = roundGeneratorByType[matchType];
  if (!generator) {
    throw new Error(`matchType no soportado por CalendarEngine: ${matchType}`);
  }

  const roundPairings = generator(teamList);

  const rounds = scheduleRounds(roundPairings, validDays, start, end, (roundNumber) => {
    const baseNumber = roundNumber <= roundPairings.length / (matchType === 'IdaVueltaTvsT' ? 2 : 1)
      ? roundNumber
      : roundNumber - (matchType === 'IdaVueltaTvsT' ? roundPairings.length / 2 : 0);

    const suffix = matchType === 'IdaVueltaTvsT' && roundNumber > roundPairings.length / 2 ? ' (Vuelta)' : '';
    return `Jornada ${baseNumber}${suffix}`;
  });

  const matches = accumulateFlatMatches(rounds);
  const byeMapping = buildByeMapping(rounds);

  return { matches, rounds, byeMapping };
};
