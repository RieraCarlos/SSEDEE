import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTournamentFactory } from "@/hooks/useTournamentFactory";
import { Trophy, Layers, Settings2, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { useState } from 'react';

interface Props {
    userId: string;
    onClose: () => void;
}

export default function TournamentStepper({ userId, onClose }: Props) {
    const {
        currentStep,
        setCurrentStep,
        selection,
        setSelection,
        deportes,
        categorias,
        loading,
        handleSportSelect,
        handleCategorySelect,
        handleFinalSubmit,
        reset
    } = useTournamentFactory(userId, onClose);

    useEffect(() => {
        reset();
    }, [reset]);

    const [newSportName, setNewSportName] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");

    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex justify-between mb-8 px-2">
                {[
                    { id: 'sport', icon: Trophy, label: 'Deporte' },
                    { id: 'category', icon: Layers, label: 'Categoría' },
                    { id: 'details', icon: Settings2, label: 'Detalles' }
                ].map((step, idx) => (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            currentStep === step.id ? 'bg-emerald-500 text-white' : 
                            idx < ['sport', 'category', 'details'].indexOf(currentStep) ? 'bg-emerald-500/30 text-emerald-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                            <step.icon size={18} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${currentStep === step.id ? 'text-white' : 'text-gray-500'}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {currentStep === 'sport' && (
                    <motion.div
                        key="sport"
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                    >
                        <Label className="text-white">Selecciona o crea un Deporte</Label>
                        <Select onValueChange={(val) => val !== "new" && handleSportSelect(val)}>
                            <SelectTrigger className="bg-[#2a2d3a] border-gray-600 text-white">
                                <SelectValue placeholder="Listado de deportes" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1d2029] border-gray-600 text-white">
                                {deportes.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                                ))}
                                <SelectItem value="new" className="text-emerald-400 font-bold">+ Nuevo Deporte</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1d2029] px-2 text-gray-500">O crea uno nuevo</span></div>
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                placeholder="Nombre del deporte" 
                                className="bg-[#2a2d3a] border-gray-600 text-white"
                                value={newSportName}
                                onChange={(e) => setNewSportName(e.target.value)}
                            />
                            <Button 
                                onClick={() => newSportName && handleSportSelect(newSportName, true)}
                                disabled={!newSportName || loading}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                <Plus size={18} />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'category' && (
                    <motion.div
                        key="category"
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('sport')} className="text-gray-400 p-0 hover:bg-transparent">
                                <ChevronLeft size={16} /> Volver
                            </Button>
                        </div>
                        <Label className="text-white">Selecciona o crea una Categoría</Label>
                        <Select onValueChange={(val) => val !== "new" && handleCategorySelect(val)}>
                            <SelectTrigger className="bg-[#2a2d3a] border-gray-600 text-white">
                                <SelectValue placeholder="Listado de categorías" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1d2029] border-gray-600 text-white">
                                {categorias.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                                ))}
                                <SelectItem value="new" className="text-emerald-400 font-bold">+ Nueva Categoría</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1d2029] px-2 text-gray-500">O crea una nueva</span></div>
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                placeholder="Nombre de la categoría" 
                                className="bg-[#2a2d3a] border-gray-600 text-white"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <Button 
                                onClick={() => newCategoryName && handleCategorySelect(newCategoryName, true)}
                                disabled={!newCategoryName || loading}
                                className="bg-emerald-500 hover:bg-emerald-600"
                            >
                                <Plus size={18} />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {currentStep === 'details' && (
                    <motion.div
                        key="details"
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-4"
                    >
                         <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('category')} className="text-gray-400 p-0 hover:bg-transparent">
                                <ChevronLeft size={16} /> Volver
                            </Button>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label className="text-white text-xs">Nombre del Torneo</Label>
                                <Input 
                                    className="bg-[#2a2d3a] border-gray-600 text-white"
                                    placeholder="Copa Champions 2026"
                                    value={selection.name}
                                    onChange={(e) => setSelection(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white text-xs">Fecha Inicio</Label>
                                    <Input 
                                        type="date"
                                        className="bg-[#2a2d3a] border-gray-600 text-white"
                                        value={selection.startDate}
                                        onChange={(e) => setSelection(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white text-xs">Fecha Fin</Label>
                                    <Input 
                                        type="date"
                                        className="bg-[#2a2d3a] border-gray-600 text-white"
                                        value={selection.endDate}
                                        onChange={(e) => setSelection(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-white text-xs">N° Equipos</Label>
                                    <Input 
                                        type="number"
                                        className="bg-[#2a2d3a] border-gray-600 text-white"
                                        value={selection.teams}
                                        onChange={(e) => setSelection(prev => ({ ...prev, teams: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-white text-xs">Tipo</Label>
                                    <Select 
                                        value={selection.type}
                                        onValueChange={(val) => setSelection(prev => ({ ...prev, type: val }))}
                                    >
                                        <SelectTrigger className="bg-[#2a2d3a] border-gray-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1d2029] border-gray-600 text-white">
                                            <SelectItem value="institucional">Institucional</SelectItem>
                                            <SelectItem value="publico">Público</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 mt-4"
                            onClick={handleFinalSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Finalizar Creación'}
                            {!loading && <ChevronRight size={18} className="ml-2" />}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
