import type { DisciplineConfig } from "../types";

export const ecuavoleyConfig: DisciplineConfig = {
    id: "ecuavoley",
    name: "EcuaVoley",
    icon: "Volleyball",
    layoutMode: "versus",
    labels: {
        score: "Puntos",
        period: "Set",
        local: "Local",
        visita: "Visita"
    },
    scoreRules: [
        { id: "punto", label: "Punto", points: 1 }
    ],
    stats: [
        { id: "punto", label: "Punto", type: "counter", category: "positive" },
        { id: "falta", label: "Falta", type: "counter", category: "negative" }
    ],
    periods: {
        count: 3,
        name: "Set"
    },
    standingsLayout: {
        columnIds: ['pj', 'ganados', 'perdidos', 'sets_ganados', 'sets_perdidos', 'puntos']
    },
    color: "#6366f1"
};

export default ecuavoleyConfig;
