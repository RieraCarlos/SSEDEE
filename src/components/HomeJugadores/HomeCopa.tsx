{/*
"use client";

import React, { useEffect, useState } from "react";
import type { User } from "@/hooks/useAuth";
import { DataTable } from "../Copa/tablaE_Posiciones";

interface Props {
  user: User;
}

// JSON de prueba para llamar lista de posiciones
import dataListaPosiciones from '../Copa/data.json'
import LinkAction from "../LinkAction";
import C_MarcadorEnVivo from "../Copa/C_MarcadorEnVivo";
import C_TablaPosiciones from "../Copa/C_TablaPosiciones";
import C_Alineacion from "../Copa/C_Alineacion";
import C_RPC from "../Copa/C_RPC";

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);
function Pill({ label }: { label: string }) {
  return (
    <button className="bg-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-[#0ae98a] transition-colors">
      {label}
    </button>
  );
}
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-6 ${className}`}>{children}</div>;
}
function LinkAction({ children = "Ver" }: { children?: React.ReactNode }) {
  return (
    <button className="group inline-flex items-center text-xs cursor-pointer   font-semibold text-[#0ae98a] hover:text-white transition-colors">
      {children}
      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

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


export default function HomeCopa({ user }: Props) {
  const [data, setData] = useState<BdJson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const progreso = data?.progreso ?? 0;
  const labelClub = data?.club?.label ?? "Club";
  const nombreCancha = data?.canchaNombre ?? data?.ubicacionCancha ?? "Cancha";
  const partido = data?.partidoActual ?? {};
  const tabla = data?.tablaPosiciones ?? [];

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
      <div className="text-3xl font-bold text-[#13161c]">Bienvenido, Pedro Alvarado</div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-4 flex-1">

        <C_MarcadorEnVivo user={user} partido={partido} />

        <C_RPC data={data} />

        <C_TablaPosiciones />

        <C_Alineacion localTitulares={localTitulares} localSuplentes={localSuplentes} visitaTitulares={visitaTitulares} visitaSuplentes={visitaSuplentes} partido={partido} />
      </div>
    </div>
  );
}
*/}
