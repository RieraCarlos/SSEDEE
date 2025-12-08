import { MapPin } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectAuthUser } from "@/store/slices/authSlice";
import { fetchPartidoUbicacion, updatePartidoUbicacion } from "@/store/thunks/clubsThunks";
import { selectUbicacion } from "@/store/slices/clubsSlice";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function C_UbicacionCancha() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const currentUbicacion = useAppSelector(selectUbicacion);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedUbicacion, setEditedUbicacion] = useState("");

  useEffect(() => {
    if (user?.id_club) {
      dispatch(fetchPartidoUbicacion(user.id_club));
    }
  }, [dispatch, user?.id_club]);

  useEffect(() => {
    if (currentUbicacion) {
      setEditedUbicacion(currentUbicacion);
    }
  }, [currentUbicacion]);

  const handleSaveUbicacion = async () => {
    if (!user?.id_club) {
      toast.error("No se pudo obtener el ID del club.");
      return;
    }
    if (!editedUbicacion.trim()) {
      toast.error("La ubicación no puede estar vacía.");
      return;
    }

    try {
      await dispatch(updatePartidoUbicacion({ clubId: user.id_club, ubicacion: editedUbicacion })).unwrap();
      toast.success("Ubicación actualizada correctamente.");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(`Error al actualizar la ubicación: ${error.message || 'Error desconocido'}`);
      console.error("Error updating ubicacion:", error);
    }
  };

  return (
    <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 flex items-center justify-between overflow-hidden text-center md:text-left">
      <Toaster richColors />
        <span className="text-gray-300 text-xs font-bold">
          {currentUbicacion || "Ubicación no definida"}
        </span>
      

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-400 hover:bg-gray-800 "
            title="Editar ubicación de la cancha"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-[#1a1e26] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Editar Ubicación de la Cancha</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ubicacion" className="text-right text-gray-400">
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                value={editedUbicacion}
                onChange={(e) => setEditedUbicacion(e.target.value)}
                className="col-span-3 bg-[#0a0c0f] border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600">
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSaveUbicacion} className="bg-[#0ae98a] text-black hover:bg-[#07c272]">
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}