import { CircleUserRound, RotateCcw } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectAuthUser } from "@/store/slices/authSlice";
import { selectAssignedPlayers, selectChalecoPlayerName } from "@/store/slices/clubsSlice";
import { fetchClubPlayers, fetchNominaCupos, assignPlayerToChaleco, fetchChalecoPlayer } from "@/store/thunks/clubsThunks";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function C_Chalecos() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const assignedPlayers = useAppSelector(selectAssignedPlayers);
  const chalecoPlayer = useAppSelector(selectChalecoPlayerName); // Get chaleco player from Redux store

  useEffect(() => {
    if (user?.id_club) {
      dispatch(fetchClubPlayers(user.id_club));
      dispatch(fetchNominaCupos(user.id_club));
      dispatch(fetchChalecoPlayer(user.id_club)); // Fetch the chaleco player on mount
    }
  }, [dispatch, user?.id_club]);

  const handleSelectRandomPlayer = useCallback(() => {
    if (!assignedPlayers || assignedPlayers.length === 0) {
      toast.error("No hay jugadores en la nómina para seleccionar.");
      return;
    }

    if (assignedPlayers.length < 10) {
        toast.warning(`Hay ${assignedPlayers.length} jugadores en la nómina. Se recomienda tener 10 para una selección óptima.`);
    }

    const randomIndex = Math.floor(Math.random() * assignedPlayers.length);
    const player = assignedPlayers[randomIndex];
    
    // Dispatch to save to DB and update Redux state
    if (user?.id_club && player?.name) {
        dispatch(assignPlayerToChaleco({ clubId: user.id_club, playerName: player.name }));
        toast.success(`¡${player.name} ha sido seleccionado para lavar los chalecos!`);
    }
  }, [assignedPlayers, dispatch, user?.id_club]);

  return (
    <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 overflow-hidden text-center">
      <Toaster richColors />
      <div className="text-gray-300 text-xs w-full">
        <div className="font-semibold flex justify-between items-center mb-0">
          <p className="text-sm">Chalecos de hoy</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSelectRandomPlayer}
            className="text-gray-400 hover:text-gray-400 hover:bg-gray-800"
            title="Seleccionar jugador para chalecos"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center items-center space-x-2 text-white -mt-2">
          {chalecoPlayer ? (
            <>
              <CircleUserRound className="h-4 w-4 text-[#0ae98a]" />
              <h2 className="text-lg font-bold">{chalecoPlayer}</h2>
            </>
          ) : (
            <h2 className="text-xs text-orange-500">#N/A</h2>
          )}
        </div>
      </div>
    </div>
  );
}