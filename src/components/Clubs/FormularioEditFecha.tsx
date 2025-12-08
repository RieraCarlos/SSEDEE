import { CirclePlus, PencilLine, Save, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useCallback, useState } from "react";
import { updateMatchDates, fetchMatchDate, createMatchDates, deleteMatchDate } from "@/store/thunks/clubsThunks";
import { toast } from "sonner";

interface MatchDateFromStore {
    id: string;
    recordId: string;
    id_club: string;
    fecha: string;
    horario: string[] | string;
    estado: 'habilitado' | 'deshabilitado' | 'guardado';
    partidoId?: string | null;
}

interface FormularioEditFechaProps {
    matchDates: MatchDateFromStore[];
    clubId: string;
}

export default function FormularioEditFecha({ matchDates, clubId }: FormularioEditFechaProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const [editedDates, setEditedDates] = useState<Record<string, string[]>>({});
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open) {
            const groupedDates: Record<string, string[]> = {};
            if (Array.isArray(matchDates)) {
                // We only want to edit dates that are not 'guardado'
                const editableDates = matchDates.filter(md => md.estado !== 'guardado');
                editableDates.forEach(md => {
                    if (md && md.recordId && md.fecha) {
                        if (!groupedDates[md.recordId]) {
                            groupedDates[md.recordId] = [];
                        }
                        groupedDates[md.recordId].push(md.fecha.split('T')[0]);
                    }
                });
            }
            if (Object.keys(groupedDates).length === 0 && !groupedDates[clubId]) {
                groupedDates[clubId] = [];
            }

            setEditedDates(groupedDates);
        }
    }, [matchDates, clubId]);

    const handleAddDate = useCallback((recordId: string) => {
        setEditedDates(prev => ({
            ...prev,
            [recordId]: [...(prev[recordId] || []), '']
        }));
    }, []);
    const handleRemoveDate = useCallback((recordId: string, index: number) => {
        setEditedDates(prev => ({
            ...prev,
            [recordId]: prev[recordId].filter((_, i) => i !== index)
        }));
        console.log('Se esta removiendo la fecha: ', recordId, index);
    }, []);

    const handleUpdateDate = useCallback((recordId: string, index: number, value: string) => {
        setEditedDates(prev => {
            const dates = [...(prev[recordId] || [])];
            dates[index] = value;
            return { ...prev, [recordId]: dates };
        });
    }, []);

    const handleSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id_club) {
            toast.error("Error de autenticación", { description: "Usuario no asociado a un club." });
            return;
        }
        setIsSaving(true);
        const savePromises = Object.keys(editedDates).map(recordId => {
            const newDates = editedDates[recordId].filter(d => d.trim());
            const isExistingRecord = matchDates.some(md => md.recordId === recordId);
            if (newDates.length > 0) {
                if (recordId === clubId && !isExistingRecord) {
                    return dispatch(createMatchDates({ clubId, dates: newDates })).unwrap();
                 } else {
                     return dispatch(updateMatchDates({ recordId, newDates })).unwrap();
                 }
            } else if (isExistingRecord) {
                return dispatch(deleteMatchDate({ recordId })).unwrap();
            }
                return Promise.resolve(); 
        });

        const results = await Promise.allSettled(savePromises);
        setIsSaving(false);

        let successCount = 0;
        let errorMessages: string[] = []

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                successCount++;
            } else {
                errorMessages.push(result.reason?.message || 'Error desconocido');
            }
        });

        if (successCount > 0 && errorMessages.length === 0) {
            toast.success('Cambios guardados correctamente.');
             dispatch(fetchMatchDate(user.id_club!));
             setIsOpen(false);
        } else if (successCount > 0 && errorMessages.length > 0) {
            toast.warning('Algunos cambios se guardaron, pero hubo errores:', {
                description: errorMessages.join(', '),
             });
             dispatch(fetchMatchDate(user.id_club!));
            setIsOpen(false);
        } else {
            toast.error('Error al guardar todos los cambios:', {
                description: errorMessages.join(', '),
            });
        }
    }, [dispatch, user?.id_club, clubId, editedDates, matchDates]);
    
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent border-0 hover:bg-gray-800/50">
                    <PencilLine className="text-gray-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-[#13161c] border-gray-800 text-white max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Fechas de Juego</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Añada, edite o elimine las fechas disponibles para jugar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave}>
                    <div className="grid gap-4 py-4">
                        {editedDates[clubId] && (
                             <div key={clubId} className="border border-gray-700 p-4 rounded-lg">
                                <Label className="text-sm font-semibold mb-3 block text-gray-300">Nuevas Fechas</Label>
                                <div className="space-y-2">
                                    {(editedDates[clubId] || []).map((fecha, idx) => (
                                        <div key={`${clubId}-${idx}`} className="flex gap-2 items-center">
                                            <Input
                                                type="date"
                                                value={fecha}
                                                onChange={(e) => handleUpdateDate(clubId, idx, e.target.value)}
                                                className="bg-[#07080a] border-gray-600 text-white"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDate(clubId, idx)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Render existing date groups, excluding the clubId group if it's handled above */}
                        {Object.keys(editedDates).filter(id => id !== clubId).length > 0 ? (
                            Object.keys(editedDates).filter(id => id !== clubId).map(recordId => (
                                 <div key={recordId} className="border border-gray-700 p-4 rounded-lg">
                                    <Label className="text-sm font-semibold mb-3 block text-gray-300">Grupo de Fechas</Label>
                                     <div className="space-y-2">
                                         {(editedDates[recordId] || []).map((fecha, idx) => (
                                            <div key={`${recordId}-${idx}`} className="flex gap-2 items-center">
                                                <Input
                                                    type="date"
                                                    value={fecha}
                                                    onChange={(e) => handleUpdateDate(recordId, idx, e.target.value)}
                                                    className="bg-[#07080a] border-gray-600 text-white"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDate(recordId, idx)} className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                                 
                             ))
                            
                         ) : (
                            !editedDates[clubId] && <p className="text-sm text-center text-gray-400 py-8">No hay fechas configuradas para editar.</p>
                         )}
                    </div>

                    <DialogFooter className="mt-6">
                        
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving} className="bg-[#0ae98a] text-black hover:bg-[#0ae98a]/80">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddDate(clubId)} className="bg-transparent hover:bg-[#07080a] cursor-pointer w-full mt-3">
                            <CirclePlus className="w-4 h-4 mr-2" />
                            Agregar nueva fecha
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}