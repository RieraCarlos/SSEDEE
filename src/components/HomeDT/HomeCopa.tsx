{/*
import React from "react";
import MatchResultCard from "../Copa/MatchResultCard";
import PosicionesCard from "../Copa/PosicionesCard";
import AlineacionCard from "../Copa/AlineacionCard";

// Tipos de JSON 
type Partido = {
  grupo?: string;
  estado?: string;
  tiempo?: string;
  minuto?: number;
  local?: { id?: string; nombre?: string; tarjetas?: { amarillas?: number; rojas?: number } };
  visita?: { id?: string; nombre?: string; tarjetas?: { amarillas?: number; rojas?: number } };
  marcador?: { local?: number; visita?: number };
};
type Tabla = { equipo: string; pts: number; dg: number; pj: number };
type BdJson = {
  progreso?: number;
  club?: { label: string };
  resultadoAnterior?: string;
  perfil?: { nombre?: string; nivel?: string };
  canchaNombre?: string;
  ubicacionCancha?: string;
  partidoActual?: Partido;
  tablaPosiciones?: Tabla[];
  equipos?: { A?: string[]; B?: string[] };
  alineacion?:
    | { local?: { titulares?: string[]; suplentes?: string[] }; visita?: { titulares?: string[]; suplentes?: string[] } }
    | { titulares?: string[]; suplentes?: string[] }; // formato antiguo
};

export default function HomeCopaDT() {
    const [data, setData] = React.useState<BdJson | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
        try {
        setLoading(true);
        const res = await fetch("/bd.json", { signal: ac.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: BdJson = await res.json();
        setData(json);
        } catch (e) {
        if ((e as any)?.name !== "AbortError") console.error("Error al cargar /bd.json", e);
        } finally {
        setLoading(false);
        }
    })();
    return () => ac.abort();
    }, []);
    
    if (loading && !data) {
    return (
        <div className="bg-black text-white min-h-[100svh] flex items-center justify-center">
        <span className="animate-pulse">Cargando…</span>
        </div>
    );
    }

    const partido = data?.partidoActual ?? {};

     /* ====== Helpers robustos para alineaciones ====== 
    const alin = data?.alineacion as any;
    const eq = data?.equipos;

    const localTitulares: string[] =
        alin?.local?.titulares ??
        alin?.titulares ?? // formato plano
        eq?.A ??
        [];

    const localSuplentes: string[] =
        alin?.local?.suplentes ??
        alin?.suplentes ?? // formato plano
        [];

    const visitaTitulares: string[] =
        alin?.visita?.titulares ??
        eq?.B ??
        [];

    const visitaSuplentes: string[] =
        alin?.visita?.suplentes ??
        [];

    return (
        <div className="text-white flex flex-col space-y-8 w-full">
            <div className="text-3xl font-bold text-gray-400">Bienvenido, Juan Gonzalez</div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-4 flex-1">
                {/*Marcador / Partido 
                {/* <C_MarcadorEnVivo/> 
{/*Resultados anteriore + Perfil + Cancha 
<MatchResultCard data={data} />
{/* Tabla de posiciones 
<PosicionesCard />
{/* Alineacion Local y Visita 
<AlineacionCard localTitulares={localTitulares} localSuplentes={localSuplentes} visitaTitulares={visitaTitulares} visitaSuplentes={visitaSuplentes} partido={partido} />
            </div >
        </div >
    );
}
*/}