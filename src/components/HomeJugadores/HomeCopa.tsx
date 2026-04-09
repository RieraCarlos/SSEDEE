export default function HomeCopa() {
  // TODO: Conectar con backend real (fetchMatchDate o fetchTournaments)
  
  return (
    <div className="text-white flex flex-col space-y-8 w-full p-4">
      <div className="text-3xl font-bold text-[#13161c]">
        Bienvenido, Jugador
      </div>

      <div className="bg-[#13161c] p-6 rounded-lg border border-gray-700 text-center">
        <h3 className="text-xl text-gray-400">
          Esperando datos del torneo (Backend)
        </h3>
        <p className="text-sm mt-2 text-gray-500">
          Próximamente verás la tabla de posiciones, tu alineación y próximos partidos aquí.
        </p>
      </div>
    </div>
  );
}
