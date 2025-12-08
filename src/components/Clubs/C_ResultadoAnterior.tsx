import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectAuthUser } from "@/store/slices/authSlice";
import { fetchGuardadoMatches } from "@/store/thunks/clubsThunks";
import { Loader, History } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { HistorialDialogo } from "./HistorialDialogo";

export default function C_ResultadoAnterior() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const { guardadoHistory, loading } = useAppSelector((state) => state.clubs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id_club) {
      dispatch(fetchGuardadoMatches({ clubId: user.id_club }));
    }
  }, [dispatch, user?.id_club]);

  if (loading && guardadoHistory.length === 0) {
    return (
      <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden text-center h-full">
        <Loader className="animate-spin text-white" />
        <p className="text-sm text-gray-400 mt-2">Cargando resultado...</p>
      </div>
    );
  }

  const lastMatch = guardadoHistory?.[0];

  return (
    <>
      <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden text-center  ">
        <div className="mb-2 flex w-full justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-400">Resultado Anterior</h3>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-transparent  hover:bg-gray-800 text-gray-300 text-xs"
            >
            <History className="h-2 w-2" />
            Historial
          </Button>
        </div>
        
        <div className="flex-grow flex items-center justify-center">
          {lastMatch ? (
            <span className="text-gray-100 text-2xl md:text-3xl font-bold">
              Ganador: <span className="text-[#0ae98a]">{`Equipo ${lastMatch.equipo_ganador}`}</span>
            </span>
          ) : (
            <span className="text-gray-400 text-md">
              No hay resultados anteriores
            </span>
          )}
        </div>
        
      </div>
      <HistorialDialogo 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        historial={guardadoHistory}
      />
    </>
  );
}