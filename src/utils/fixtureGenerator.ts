export interface FixtureMatch {
    id: string;
    home: string;
    away: string;
    date: string;
    time: string;
    round: string;
    // Extended fields for persistence and state
    is_active?: boolean;
    reporte_final?: any;
    goles_local?: number;
    goles_visitante?: number;
    fecha_partido_raw?: string;
}

type MatchType = "ida" | "idaVuelta" | "todosContraTodos";

const getLocalSaturdays = (startDateStr: string, endDateStr: string): Date[] => {
    const parseLocal = (ds: string) => {
        const parts = ds.split('T')[0].split('-').map(Number);
        if (parts.length >= 3) return new Date(parts[0], parts[1] - 1, parts[2]);
        return new Date(ds); 
    };
    
    const start = parseLocal(startDateStr);
    const end = parseLocal(endDateStr);
    end.setHours(23, 59, 59, 999);
    
    const validDays: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
        if (current.getDay() === 6) { // 6 = Sábado en local
            validDays.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return validDays;
};

const formatLocalDate = (d: Date): string => {
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

/**
 * Motor de Generación de Encuentros (Senior Refactor)
 * Implementa patrones de Ida/Vuelta correctamente para equipos impares.
 * 
 * NOTA IMPORTANTE - Manejo de BYE en Ida/Vuelta:
 * En la industria del fútbol (FIFA, CONMEBOL), cuando hay un número impar:
 * - Se genera un "BYE" virtual que rota en cada vuelta
 * - Ejemplo con 5 equipos: En Ida, descansa equipo X; en Vuelta, puede descansar otro equipo
 * - Garantiza que cada equipo descarse máximo UNA VEZ por vuelta
 * - Los descansos se distribuyen equitativamente a lo largo de las jornadas
 */
export const generateKnockoutFixtures = (
    teams: string[], 
    startDateStr: string, 
    endDateStr: string, 
    startHourStr: string, 
    endHourStr: string, 
    matchType: MatchType
): FixtureMatch[] => {
    
    if (!teams || teams.length < 2) return [];

    const startHour = parseInt(startHourStr.split(":")[0]);
    const endHour = parseInt(endHourStr.split(":")[0]);

    if (startHour >= endHour) {
        throw new Error("La hora de inicio debe ser menor a la hora de fin");
    }

    // 1. Calcular estructura del Bracket (Potencia de 2)
    let paddedTeams = [...teams];
    let powerOfTwo = 1;
    while (powerOfTwo < paddedTeams.length) {
        powerOfTwo *= 2;
    }
    const byesNeeded = powerOfTwo - paddedTeams.length;
    for (let i = 0; i < byesNeeded; i++) {
        paddedTeams.push("BYE");
    }

    // 2. Preparar Partidos (Pares de equipos)
    const pairings: { home: string, away: string }[] = [];
    for (let i = 0; i < paddedTeams.length; i += 2) {
        pairings.push({ home: paddedTeams[i], away: paddedTeams[i+1] });
    }

    const realPairingsCount = pairings.filter(p => p.home !== "BYE" && p.away !== "BYE").length;

    const totalMatches = matchType === "idaVuelta" 
        ? (realPairingsCount * 2) 
        : realPairingsCount;

    // 3. Calcular Capacidad y Distribución
    const validDays = getLocalSaturdays(startDateStr, endDateStr);
    
    if (validDays.length === 0) {
        throw new Error("El rango de fechas no incluye ningún día sábado. Por favor amplíelo.");
    }
    
    const totalDays = validDays.length;
    const slotsPerDay = Math.floor((endHour - startHour) / 2);
    const maxCapacity = totalDays * slotsPerDay;

    if (totalMatches > maxCapacity) {
        throw new Error(`Capacidad excedida: Se requieren ${totalMatches} partidos pero solo hay ${maxCapacity} cupos disponibles (Hay ${totalDays} sábados).`);
    }

    const matchesPerDay = Math.floor(totalMatches / totalDays);
    const extraMatchesAtStart = totalMatches % totalDays;

    // 4. Generar Agenda
    const matches: FixtureMatch[] = [];

    // Para Ida/Vuelta, generamos explícitamente ambas vueltas
    if (matchType === "idaVuelta") {
        // Obtener solo los pairings reales (sin BYEs)
        const realPairings = pairings.filter(p => p.home !== "BYE" && p.away !== "BYE");

        // PRIMERA VUELTA (IDA)
        let globalMatchIndex = 0;
        for (const pairing of realPairings) {
            // Calcular día y slot basado en el índice global
            const dayIndex = Math.floor(globalMatchIndex / slotsPerDay);
            const slotInDay = globalMatchIndex % slotsPerDay;

            if (dayIndex >= validDays.length) {
                throw new Error('Error en distribución: se excedió el número de días disponibles en Ida');
            }

            const currentDate = validDays[dayIndex];
            const dateStr = formatLocalDate(currentDate);
            const hour = (startHour + (slotInDay * 2)).toString().padStart(2, '0') + ":00";
            const roundName = `Jornada ${globalMatchIndex + 1}`;

            matches.push({
                id: crypto.randomUUID(),
                home: pairing.home,
                away: pairing.away,
                date: dateStr,
                time: hour,
                round: roundName
            });

            globalMatchIndex++;
        }

        // SEGUNDA VUELTA (VUELTA) - Invertir localía
        globalMatchIndex = 0;
        for (const pairing of realPairings) {
            // Calcular día y slot basado en el índice global
            const dayIndex = Math.floor(globalMatchIndex / slotsPerDay);
            const slotInDay = globalMatchIndex % slotsPerDay;

            if (dayIndex >= validDays.length) {
                throw new Error('Error en distribución: se excedió el número de días disponibles en Vuelta');
            }

            const currentDate = validDays[dayIndex];
            const dateStr = formatLocalDate(currentDate);
            const hour = (startHour + (slotInDay * 2)).toString().padStart(2, '0') + ":00";
            const roundName = `Jornada ${realPairingsCount + globalMatchIndex + 1} (Vuelta)`;

            matches.push({
                id: crypto.randomUUID(),
                home: pairing.away,  // Invertir localía
                away: pairing.home,
                date: dateStr,
                time: hour,
                round: roundName
            });

            globalMatchIndex++;
        }
    } else {
        // SOLO IDA
        let currentPairingIndex = 0;

        for (let d = 0; d < totalDays; d++) {
            const matchesToday = d < extraMatchesAtStart ? matchesPerDay + 1 : matchesPerDay;
            const currentDate = validDays[d];
            const dateStr = formatLocalDate(currentDate);

            for (let s = 0; s < matchesToday; s++) {
                if (currentPairingIndex >= pairings.length) break;

                const p = pairings[currentPairingIndex];
                
                // SI ES UN BYE, SALTAMOS ESTE EMPAREJAMIENTO (No genera partido)
                if (p.home === "BYE" || p.away === "BYE") {
                    currentPairingIndex++;
                    s--; // No consumimos slot de tiempo
                    continue;
                }

                const hour = (startHour + (s * 2)).toString().padStart(2, '0') + ":00";
                const roundName = `Octavos / Llave ${currentPairingIndex + 1}`;

                matches.push({
                    id: crypto.randomUUID(),
                    home: p.home,
                    away: p.away,
                    date: dateStr,
                    time: hour,
                    round: roundName
                });

                currentPairingIndex++;
            }
        }
    }

    return matches;
};

/**
 * Motor de Generación de Encuentros (Todos contra Todos)
 * Implementa Algoritmo de Círculo (Round-Robin).
 */
export const generateRoundRobinFixtures = (
    teams: string[], 
    startDateStr: string, 
    endDateStr: string, 
    startHourStr: string, 
    endHourStr: string
): FixtureMatch[] => {
    if (!teams || teams.length < 2) return [];

    const startHour = parseInt(startHourStr.split(":")[0]);
    const endHour = parseInt(endHourStr.split(":")[0]);

    if (startHour >= endHour) {
        throw new Error("La hora de inicio debe ser menor a la hora de fin");
    }

    let rrTeams = [...teams];
    if (rrTeams.length % 2 !== 0) {
        rrTeams.push("BYE");
    }

    const roundsCount = rrTeams.length - 1;
    const matchesPerRound = rrTeams.length / 2;

    const pairings: { home: string, away: string, round: number }[] = [];

    // Algoritmo de círculo (Sistema de Round Robin)
    for (let round = 0; round < roundsCount; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
            const home = rrTeams[match];
            const away = rrTeams[rrTeams.length - 1 - match];
            
            // Alternancia de localía aprox. (opcional)
            if (match === 0 && round % 2 !== 0) {
                pairings.push({ home: away, away: home, round: round + 1 });
            } else {
                pairings.push({ home, away, round: round + 1 });
            }
        }
        // Rotar equipos, el equipo en el índice 0 se mantiene fijo
        const last = rrTeams.pop()!;
        rrTeams.splice(1, 0, last);
    }

    // Filtrar partidos "BYE" (descansos)
    const realPairings = pairings.filter(p => p.home !== "BYE" && p.away !== "BYE");
    const totalMatches = realPairings.length;

    // Calcular Capacidad y Distribución
    const validDays = getLocalSaturdays(startDateStr, endDateStr);
    
    if (validDays.length === 0) {
        throw new Error("El rango de fechas no incluye ningún día sábado. Por favor amplíelo.");
    }
    
    const totalDays = validDays.length;
    const slotsPerDay = Math.floor((endHour - startHour) / 2);
    const maxCapacity = totalDays * slotsPerDay;

    if (totalMatches > maxCapacity) {
        throw new Error(`Capacidad excedida: Se requieren ${totalMatches} partidos pero solo hay ${maxCapacity} cupos disponibles (Hay ${totalDays} sábados).`);
    }

    const matchesPerDay = Math.floor(totalMatches / totalDays);
    const extraMatchesAtStart = totalMatches % totalDays;

    // Generar Agenda
    const matches: FixtureMatch[] = [];
    let currentPairingIndex = 0;

    for (let d = 0; d < totalDays; d++) {
        const matchesToday = d < extraMatchesAtStart ? matchesPerDay + 1 : matchesPerDay;
        const currentDate = validDays[d];
        const dateStr = formatLocalDate(currentDate);

        for (let s = 0; s < matchesToday; s++) {
            if (currentPairingIndex >= realPairings.length) break;

            const p = realPairings[currentPairingIndex];
            const hour = (startHour + (s * 2)).toString().padStart(2, '0') + ":00";

            matches.push({
                id: crypto.randomUUID(),
                home: p.home,
                away: p.away,
                date: dateStr,
                time: hour,
                round: `Jornada ${p.round}`
            });

            currentPairingIndex++;
        }
    }

    return matches;
};
