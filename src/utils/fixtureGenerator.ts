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

type MatchType = "ida" | "idaVuelta";

/**
 * Motor de Generación de Encuentros (Senior Refactor)
 * Implementa Distribución Equitativa sobre Rango de Fechas.
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
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

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
    const byePairingsCount = pairings.filter(p => p.home === "BYE" || p.away === "BYE").length;

    const totalMatches = matchType === "idaVuelta" 
        ? (realPairingsCount * 2) 
        : realPairingsCount;

    // 3. Calcular Capacidad y Distribución
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const slotsPerDay = Math.floor((endHour - startHour) / 2);
    const maxCapacity = totalDays * slotsPerDay;

    if (totalMatches > maxCapacity) {
        throw new Error(`Capacidad excedida: Se requieren ${totalMatches} slots y solo hay ${maxCapacity} disponibles en el rango. Amplía las fechas o el horario.`);
    }

    const matchesPerDay = Math.floor(totalMatches / totalDays);
    const extraMatchesAtStart = totalMatches % totalDays;

    // 4. Generar Agenda
    const matches: FixtureMatch[] = [];
    let currentPairingIndex = 0;
    let isSecondLeg = false; // Control para Ida/Vuelta

    for (let d = 0; d < totalDays; d++) {
        const matchesToday = d < extraMatchesAtStart ? matchesPerDay + 1 : matchesPerDay;
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + d);
        const dateStr = currentDate.toISOString().split('T')[0];

        for (let s = 0; s < matchesToday; s++) {
            if (currentPairingIndex >= pairings.length && !isSecondLeg) break;

            const p = pairings[currentPairingIndex];
            
            // SI ES UN BYE, SALTAMOS ESTE EMPAREJAMIENTO (No genera partido)
            if (p.home === "BYE" || p.away === "BYE") {
                currentPairingIndex++;
                s--; // No consumimos slot de tiempo
                continue;
            }

            const hour = (startHour + (s * 2)).toString().padStart(2, '0') + ":00";
            const roundName = `Octavos / Llave ${currentPairingIndex + 1}`;

            if (!isSecondLeg) {
                matches.push({
                    id: crypto.randomUUID(),
                    home: p.home,
                    away: p.away,
                    date: dateStr,
                    time: hour,
                    round: roundName
                });

                if (matchType === "idaVuelta") {
                    isSecondLeg = true;
                } else {
                    currentPairingIndex++;
                }
            } else {
                matches.push({
                    id: crypto.randomUUID(),
                    home: p.away,
                    away: p.home,
                    date: dateStr,
                    time: hour,
                    round: `${roundName} (Vuelta)`
                });
                isSecondLeg = false;
                currentPairingIndex++;
            }
        }
    }

    return matches;
};
