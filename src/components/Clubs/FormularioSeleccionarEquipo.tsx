import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Crown } from "lucide-react";
import { useState } from "react";
import { type Player } from "./C_Equipos";


interface FormularioSeleccionarEquipoGanadorProps {
    teamA: Player[];
    teamB: Player[];
    partidoId: string;
    onSave: (winningTeam: 'A' | 'B') => void;
}

export default function FormularioSeleccionarEquipoGanador({ onSave }: FormularioSeleccionarEquipoGanadorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectWinner = (winner: 'A' | 'B') => {
        // Here you would typically dispatch an action to save the winner
        onSave(winner);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className='p-3 rounded-lg text-white  bg-gradient-to-r from-[#13161c] to-[#0ae98a] hover:from-[#13161c] hover:to-[#0ae98a]/50 transition-all duration-300 cursor-pointer'>
                    Seleccionar el equipo ganador
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#13161c] border-0 text-white max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Seleccionar al equipo ganador</DialogTitle>
                    <DialogDescription className="text-xs">
                        En este apartado seleccione el equipo que gano para guardar en historial.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4">
                    <div className="drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] p-2 w-full text-center">
                        <h2 className="text-xl font-bold mb-4">Equipo A</h2>
                        <Button onClick={() => handleSelectWinner('A')} className="p-3 rounded-lg text-white  bg-gradient-to-r from-[#13161c] to-[#0ae98a] hover:from-[#13161c] hover:to-[#0ae98a]/50 transition-all duration-300 cursor-pointer">
                            <Crown className="w-4 h-4 mr-2" />
                            Declarar Ganador
                        </Button>
                    </div>
                    <div className="drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] p-2 w-full text-center">
                        <h2 className="text-xl font-bold mb-4">Equipo B</h2>
                        <Button onClick={() => handleSelectWinner('B')} className="p-3 rounded-lg text-white  bg-gradient-to-r from-[#13161c] to-[#0ae98a] hover:from-[#13161c] hover:to-[#0ae98a]/50 transition-all duration-300 cursor-pointer">
                            <Crown className="w-4 h-4 mr-2" />
                            Declarar Ganador
                        </Button>
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className=" text-red-500 border-1 border-red-500 bg-transparent font-bold cursor-pointer hover:bg-red-500 hover:text-[#13161c]"
                        >
                            Cancelar
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}