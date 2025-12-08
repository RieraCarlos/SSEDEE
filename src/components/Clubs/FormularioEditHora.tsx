import { Save, PencilLine } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useEffect, useState, useCallback } from "react";
import { updateClubHorario, fetchMatchDate } from "@/store/thunks/clubsThunks";
import { toast } from "sonner";

interface MatchDate {
    horario: string | string[];
}

interface FormularioEditHoraProps {
    matchDates: MatchDate[];
}

// Helper moved outside component as it's a pure function
const getHoursArray = (horario: string | string[] | undefined | null): [string, string] => {
    if (Array.isArray(horario) && horario.length >= 2) {
        return [String(horario[0] || "06:00"), String(horario[1] || "17:00")];
    }
    return ["06:00", "17:00"];
};

export default function FormularioEditHora({ matchDates }: FormularioEditHoraProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    
    const [startTime, setStartTime] = useState("06:00");
    const [endTime, setEndTime] = useState("17:00");
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize form state when the dialog opens
    useEffect(() => {
        if (isOpen && matchDates.length > 0) {
            const [initialStart, initialEnd] = getHoursArray(matchDates[0]?.horario);
            setStartTime(initialStart);
            setEndTime(initialEnd);
        }
    }, [isOpen, matchDates]);

    const handleSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const clubId = user?.id_club;
        if (!clubId) {
            toast.error("No se pudo identificar el club del usuario.");
            return;
        }

        // Senior Dev: Add validation
        if (startTime >= endTime) {
            toast.error("La hora de inicio debe ser anterior a la hora de fin.");
            return;
        }
        
        setIsSaving(true);
        const promise = dispatch(updateClubHorario({ clubId, startTime, endTime }))
            .unwrap()
            .then(() => {
                dispatch(fetchMatchDate(clubId));
                setIsOpen(false);
            });

        toast.promise(promise, {
            loading: 'Guardando horario...',
            success: 'Horario actualizado para todo el club.',
            error: 'Error al guardar el horario.',
            finally: () => setIsSaving(false)
        });
    }, [dispatch, user, startTime, endTime]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent border-0 hover:bg-gray-800/50">
                    <PencilLine className="text-gray-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#13161c] border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Editar Horario de Selección de Cupos</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Este horario se aplicará a todos los partidos del club.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start-time" className="text-right">Inicio</Label>
                            <Input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="col-span-3 bg-[#07080a] border-gray-600 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end-time" className="text-right">Fin</Label>
                            <Input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="col-span-3 bg-[#07080a] border-gray-600 text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#0ae98a] text-black hover:bg-[#0ae98a]/80"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}