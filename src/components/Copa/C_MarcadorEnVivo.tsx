import { useAuth } from "@/hooks/useAuth";
import { useSchedule } from "./ScheduleContext";
import { useLiveMatch } from "../../hooks/LiveMatchContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Eventos from "@/pages/Public/Eventos";
//ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React from "react";
import { Button } from "../ui/button";

export default function C_MarcadorEnVivo() {
    const { activeMatch } = useSchedule();
    const { scoreA, scoreB, teamACards, teamBCards } = useLiveMatch();
    const { user } = useAuth();
    const [isPanelOpen, setIsPanelOpen] = React.useState(false);
    return (
        <>
            <Card className={activeMatch ? 'bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-0 gap-0 col-span-1 md:col-span-2 lg:col-span-2' : 'bg-[#13161c] border-2 border-[#13161c] rounded-2xl col-span-1 md:col-span-2 lg:col-span-2'}>
                <CardHeader className="text-white font-bold mb-2 pt-6">
                    <CardTitle className="flex justify-between font-bold text-xl items-center px-2">                            
                        {activeMatch && (
                            <>
                                <span>Marcador en Vivo</span>
                                <span className="text-xs font-normal bg-red-500 text-white p-1 rounded animate-pulse">EN VIVO</span>                    
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4 p-0 m-0 bg-[#13161c] border-2 border-[#13161c] rounded-2xl">
                    {!activeMatch ? (
                    <p className="text-center text-gray-500 py-8">No hay partidos en este evento.</p>
                    ) : (
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#13161c] border-2 border-[#13161c] rounded-2xl px-6 text-white">
                            <div className="flex items-center justify-center text-lg text-gray-400">
                                    <p>
                                        Ronda: {activeMatch.round} | {activeMatch.time}
                                    </p>
                            </div>
                            <CardContent className="grid grid-cols-3 items-center gap-6">
                                    {/*Local*/}
                                    <div className="flex flex-col items-center">
                                        <div className="grid h-20 w-20 place-items-center rounded-xl drop-shadow-[0_0_15px_rgba(10,233,138,0.15)]">
                                            <img src="https://img.pikbest.com/png-images/20240909/soccer-logo-or-football-club-sign-badge-football-logo-with-shield-vector-design_10824172.png!sw800" alt="" />
                                        </div>
                                        <span className="mt-1 text-sm text-gray-300">{activeMatch.teamA}</span>
                                        <div className="mt-1 text-[10px] flex items-center space-x-1">
                                            {teamACards.yellow > 0 && <div className="w-4 h-5 bg-yellow-500 rounded flex items-center justify-center"><span className="text-white font-extrabold">{teamACards.yellow}</span></div>}
                                            {teamACards.red > 0 && <div className="w-4 h-5 bg-red-500 rounded flex items-center justify-center"><span className="text-white font-extrabold">{teamACards.red}</span></div>}
                                        </div>
                                    </div>
                                    {/* Resultado */}
                                    <div className="text-center">
                                        <div className="lg:text-5xl md:text-3xl text-2xl font-extrabold tabular-nums">
                                            <span className="text-4xl font-bold">{scoreA} - {scoreB}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{activeMatch.time}</span>
                                    </div>
                                    {/* Visita */}
                                    <div className="flex flex-col items-center">
                                        <div className="grid h-20 w-20 place-items-center rounded-xl drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                                            <img src="https://img.pikbest.com/png-images/20240909/soccer-logo-or-football-club-sign-badge-football-logo-with-shield-vector-design_10824172.png!sw800" alt="" />
                                        </div>
                                        <span className="mt-1 text-[11px] text-gray-300">{activeMatch.teamB}</span>
                                        <div className="mt-1 text-[10px] flex items-center space-x-1">
                                            {teamBCards.yellow > 0 && <div className="w-4 h-5 bg-yellow-500 rounded flex items-center justify-center"><span className="text-white font-extrabold">{teamBCards.yellow}</span></div>}
                                            {teamBCards.red > 0 && <div className="w-4 h-5 bg-red-500 rounded flex items-center justify-center"><span className="text-white font-extrabold">{teamBCards.red}</span></div>}
                                        </div>
                                    </div>
                            </CardContent>
                        </Card>
                    )}
                    {/* --- SECCIÓN DEL DIALOG PARA EL ADMIN --- */}
                    {user?.role === 'admin' && (
                        <Dialog open={isPanelOpen} onOpenChange={setIsPanelOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="mb-6 bg-transparent text-white border-[#0ae98a] rounded-xl shadow-lg hover:bg-[#0ae98a] hover:text-[#13161c] transition-colors">
                                    Panel de Administrador
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xs md:max-w-3xl lg:max-w-5xl xl:max-w-7xl h-[95vh]">
                                <DialogHeader>
                                    <DialogTitle>Panel de Gestión de Eventos</DialogTitle>
                                </DialogHeader>
                                <Eventos user={user} />
                            </DialogContent>
                        </Dialog>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
