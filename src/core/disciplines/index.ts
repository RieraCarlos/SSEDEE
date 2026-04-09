import type { DisciplineConfig } from "./types";

export const DISCIPLINE_REGISTRY: Record<string, () => Promise<{ default: DisciplineConfig }>> = {
    "futbol": () => import("./configs/futbol.config"),
    "basketball": () => import("./configs/basketball.config"),
    "ecuavoley": () => import("./configs/ecuavoley.config"),
    "natacion": () => import("./configs/natacion.config"),
    "futsal": () => import("./configs/futsal.config"),
    "futbol sala": () => import("./configs/futsal.config"),
};

const normalizeId = (id: string) => 
    id.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

export const getDisciplineConfig = async (id: string): Promise<DisciplineConfig | null> => {
    const loader = DISCIPLINE_REGISTRY[normalizeId(id)];
    if (!loader) return null;
    const module = await loader();
    return module.default;
};

export * from "./types";
