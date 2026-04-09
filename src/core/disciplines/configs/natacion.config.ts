import type { DisciplineConfig } from "../types";

export const natacionConfig: DisciplineConfig = {
    id: "natacion",
    name: "Natación",
    icon: "Waves",
    layoutMode: "participants",
    labels: {
        score: "Marca",
        period: "Serie",
        local: "Participantes",
        visita: "-"
    },
    scoreRules: [], // No scoring in versus mode
    stats: [
        { id: "tiempo", label: "Tiempo", type: "time", category: "neutral" },
        { id: "posicion", label: "Posición", type: "counter", category: "positive" }
    ],
    periods: {
        count: 1,
        name: "Serie"
    },
    standingsLayout: {
        columnIds: ['mejor_tiempo', 'posicion']
    },
    color: "#0ea5e9"
};

export default natacionConfig;
