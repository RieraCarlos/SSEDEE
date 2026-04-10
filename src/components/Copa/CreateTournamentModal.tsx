import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TournamentStepper from "./TournamentStepper";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchDeportes } from "@/store/slices/administrationSlice";
import { Trophy } from "lucide-react";

interface Props {
    userId: string;
    onSuccess?: () => void;
}

export default function CreateTournamentModal({ userId, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchDeportes());
        }
    }, [isOpen, dispatch]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 gap-2 transition-all hover:scale-105 active:scale-95">
                    <Trophy size={18} />
                    Crear Torneo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] w-[95vw] bg-[#13161c] text-white border-gray-700/50 p-0 overflow-hidden">
                <div className="bg-emerald-500/10 p-6 border-b border-gray-700/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black italic tracking-tighter">
                            <Trophy className="text-emerald-500" />
                            CONFIGURADOR DE TORNEO
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold opacity-50">Flujo jerárquico de administración</p>
                </div>
                
                <div className="p-6">
                    <TournamentStepper 
                        userId={userId} 
                        onClose={() => {
                            setIsOpen(false);
                            onSuccess?.();
                        }} 
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
