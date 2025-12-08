"use client";

import { useEffect, useState } from "react";

type Datos = {
  progreso: number;
  club: { label: string };
  resultadoAnterior: string;
  perfil: { nombre: string; nivel: string };
  ubicacionCancha: string;
  limpiezaChalecos: string;
  equipos: { A: string[]; B: string[] };
  copasAbiertas: { id: number; titulo: string }[];
  amistosos?: { nuevoHabilitado?: boolean; buscarHabilitado?: boolean };
  enVivo?: { titulo: string; estado?: string } | null;
};

export default function C_PartidosAmistosos() {
  const [data, setData] = useState<Datos | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [inscripciones, setInscripciones] = useState<Record<number, boolean>>({});

  // Recuperar inscripciones previas
  useEffect(() => {
    try {
      const raw = localStorage.getItem("inscripciones_copas");
      if (raw) setInscripciones(JSON.parse(raw));
    } catch {}
  }, []);

  // Guardar inscripciones
  useEffect(() => {
    try {
      localStorage.setItem("inscripciones_copas", JSON.stringify(inscripciones));
    } catch {}
  }, [inscripciones]);

  // Cargar datos desde /bd.json
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/bd.json", { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Datos = await res.json();
        setData(json);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message ?? "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const handleInscribirse = async (id: number) => {
    // Simula llamada a API
    await new Promise((r) => setTimeout(r, 250));
    setInscripciones((s) => ({ ...s, [id]: true }));
  };

  return (
    <div className="bg-black text-white min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* Barra superior: progreso + botón Club */}
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${data?.progreso ?? 0}%` }}
              aria-label="Progreso"
              role="progressbar"
            />
          </div>
        </div>
        <button className="bg-green-500 hover:bg-green-600 transition-colors text-sm md:text-base font-semibold px-4 py-2 rounded-full">
          {data?.club?.label ?? "Club"}
        </button>
      </div>

      {/* Fila superior: Cupos + Resultado + 3 chips (ver/actualizar/editar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Cupos (bloque grande izq) */}
        <div className="col-span-1 lg:col-span-2 bg-gray-800 border-2 border-gray-600 rounded-3xl h-56 flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse w-2/3 h-10 bg-gray-700 rounded-lg" />
          ) : (
            <span className="text-gray-200 text-2xl">Cupos</span>
          )}
        </div>

        {/* Columna derecha */}
        <div className="md:col-span-2 lg:col-span-2 space-y-4">
          <div className="bg-gray-800 border-2 border-gray-600 rounded-3xl h-20 flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse w-48 h-6 bg-gray-700 rounded" />
            ) : (
              <span className="text-gray-300">{data?.resultadoAnterior ?? "Resultado anterior"}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Ver", "Actualizar", "Editar"].map((t) => (
              <button
                key={t}
                className="bg-gray-800 border-2 border-gray-600 rounded-2xl h-14 flex items-center justify-center hover:bg-gray-700 transition-colors text-sm"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copas abiertas */}
      <section>
        <h2 className="text-gray-300 text-lg md:text-xl mb-3">Copas abiertas</h2>
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-4 animate-pulse">
                <div className="h-6 w-56 bg-gray-700 rounded" />
              </div>
            ))
          ) : err ? (
            <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-xl p-3">{err}</div>
          ) : (
            data?.copasAbiertas?.map((copa) => {
              const ya = !!inscripciones[copa.id];
              return (
                <div
                  key={copa.id}
                  className="bg-gray-800 border-2 border-gray-600 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-200 text-base md:text-lg">{copa.titulo}</span>
                  <button
                    disabled={ya}
                    onClick={() => handleInscribirse(copa.id)}
                    className={[
                      "px-4 py-2 rounded-lg font-semibold transition-colors shadow",
                      ya
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : "bg-orange-500 text-white hover:bg-orange-600",
                    ].join(" ")}
                  >
                    {ya ? "Inscrito ✅" : "Inscribirse"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Crear partido amistoso */}
      <section className="space-y-3">
        <h2 className="text-gray-300 text-lg md:text-xl">Crear partido amistoso</h2>

        <div className="grid grid-cols-3 gap-6 items-center">
          {/* tarjeta “nuevo” */}
          <button
            disabled={!data?.amistosos?.nuevoHabilitado}
            className={[
              "aspect-square w-full rounded-3xl flex flex-col items-center justify-center border-2 transition-colors",
              data?.amistosos?.nuevoHabilitado
                ? "bg-yellow-400/90 hover:bg-yellow-400 text-black border-yellow-300"
                : "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed",
            ].join(" ")}
          >
            <span className="text-2xl">➕</span>
            <span className="text-sm mt-1">[nuevo]</span>
          </button>

          {/* VS */}
          <div className="text-center font-extrabold text-2xl text-gray-300">VS</div>

          {/* botón buscar */}
          <button
            disabled={!data?.amistosos?.buscarHabilitado}
            className={[
              "w-full h-24 rounded-3xl flex items-center justify-center font-semibold transition-colors",
              data?.amistosos?.buscarHabilitado
                ? "bg-gray-300 text-gray-800 hover:bg-gray-200"
                : "bg-gray-700 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            Buscar
          </button>
        </div>
      </section>
    </div>
  );
}
