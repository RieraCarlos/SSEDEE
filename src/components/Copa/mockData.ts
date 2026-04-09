
export interface Player {
    id: number;
    camiseta: number;
    nombre: string;
    gol: number;
    amarilla: number;
    roja: number;
    estado: "En cancha" | "Cambio" | "Expulsado";
    tipoJugador: "titular" | "suplente";
}

export interface TeamData {
    equipo: string;
    jugadores: Player[];
}

export const mockTeamsData: TeamData[] = [
    {
        equipo: "Panteras FC",
        jugadores: [
            {
                id: 1,
                camiseta: 1,
                nombre: "Pedro Alvarado",
                gol: 0,
                amarilla: 0,
                roja: 0,
                estado: "En cancha",
                tipoJugador: "titular",
            },
            {
                id: 2,
                camiseta: 12,
                nombre: "Sofía Tapia",
                gol: 0,
                amarilla: 0,
                roja: 0,
                estado: "En cancha",
                tipoJugador: "titular",
            },
        ],
    },
    {
        equipo: "Leonas FC",
        jugadores: [
            {
                id: 1,
                camiseta: 1,
                nombre: "Pedro ÑAlvarado",
                gol: 0,
                amarilla: 0,
                roja: 0,
                estado: "En cancha",
                tipoJugador: "titular",
            },
            {
                id: 2,
                camiseta: 12,
                nombre: "Sofía Ñapia",
                gol: 0,
                amarilla: 0,
                roja: 0,
                estado: "En cancha",
                tipoJugador: "titular",
            },
        ],
    },
];

export const standingsData = [
    { id: 1, nameClub: 'Panteras FC', puntos: 12, dg: 8, pj: 5 },
    { id: 2, nameClub: 'Leonas FC', puntos: 10, dg: 5, pj: 5 },
    { id: 3, nameClub: 'Tigresas F.C.', puntos: 8, dg: 2, pj: 5 },
    { id: 4, nameClub: 'Jaguar FC', puntos: 7, dg: 1, pj: 5 },
];
