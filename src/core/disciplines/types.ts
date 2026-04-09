export type LayoutMode = 'versus' | 'participants';

export interface ScoreRule {
    id: string;
    label: string;
    points: number;
    icon?: string;
}

export interface StatDefinition {
    id: string;
    label: string;
    type: 'counter' | 'list' | 'time' | 'set';
    category: 'positive' | 'negative' | 'neutral';
    icon?: string;
}

export interface ScoreboardLabels {
    score: string;
    period: string;
    local: string;
    visita: string;
}

export interface DisciplineConfig {
    id: string;
    name: string;
    icon: string;
    layoutMode: LayoutMode;
    scoreRules: ScoreRule[];
    stats: StatDefinition[];
    labels: ScoreboardLabels;
    periods: {
        count: number;
        name: string; // e.g., "Tiempo", "Cuarto", "Set"
        duration?: number; // duration in minutes if applicable
    };
    standingsLayout: {
        columnIds: string[];
    };
    color?: string; // Discipline brand color (Hex or CSS color)
}

export interface MatchEvent {
    id: string;
    type: string; // e.g., 'gol', 'canasta_3', 'falta'
    team: 'local' | 'visita';
    playerId: string;
    playerName: string;
    minute: number;
    timestamp: string;
    periodo: number;
    metadata?: Record<string, any>; // For sport-specific data (e.g., set scores)
}

export interface NominaMember {
    id: string;
    id_club: string;
    fullname: string;
    role: string;
    posicion?: string;
    alias?: string;
    altura?: number;
    fecha_nacimiento?: string;
    avatar?: string;
}
