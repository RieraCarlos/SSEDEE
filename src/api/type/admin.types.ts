export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface MatchSchema {
    id: string;
    torneo_id: string;
    equipo_local_id: string;
    equipo_visitante_id: string;
    fecha_partido: string;
    hora_inicio: string;
    fase: string;
    is_active: boolean;
}
