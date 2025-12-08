import LinkAction from "../LinkAction";

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-6 ${className}`}>{children}</div>;
}


export default function C_Alineacion({localTitulares, localSuplentes, visitaTitulares, visitaSuplentes, partido}:{localTitulares:string[], localSuplentes:string[], visitaTitulares:string[], visitaSuplentes:string[], partido:any}){
    return(
        <>
            <Card className="col-span-1 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Alineaciones</h3>
                    <LinkAction>Ver</LinkAction>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Equipo Local */}
                    <div>
                        <h4 className="text-md font-bold text-emerald-400 mb-2">{partido.local?.nombre ?? "Local"}</h4>
                        <div className="mb-2 text-sm font-semibold text-gray-200 uppercase tracking-wide">Titulares</div>
                            <ul className="space-y-2 text-sm text-gray-100">
                                {(localTitulares.length ? localTitulares : ["—"]).map((j, idx) => (
                                    <li key={`local-t-${idx}-${j}`} className="px-3 text-xs text-gray-400">
                                    {j}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 mb-2 text-sm font-semibold text-gray-200 uppercase tracking-wide">Suplentes</div>
                            <ul className="space-y-2 text-sm text-gray-100">
                                {(localSuplentes.length ? localSuplentes : ["—"]).map((j, idx) => (
                                    <li key={`local-s-${idx}-${j}`} className="px-3 text-xs text-gray-400">
                                    {j}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Equipo Visita */}
                        <div>
                            <h4 className="text-md font-bold text-sky-400 mb-2">{partido.visita?.nombre ?? "Visita"}</h4>
            
                            <div className="mb-2 text-sm font-semibold text-gray-200 uppercase tracking-wide">Titulares</div>
                            <ul className="space-y-2 text-sm text-gray-100">
                                {(visitaTitulares.length ? visitaTitulares : ["—"]).map((j, idx) => (
                                    <li key={`visita-t-${idx}-${j}`} className="px-3 text-xs text-gray-400">
                                    {j}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 mb-2 text-sm font-semibold text-gray-200 uppercase tracking-wide">Suplentes</div>
                            <ul className="space-y-2 text-sm text-gray-100">
                                {(visitaSuplentes.length ? visitaSuplentes : ["—"]).map((j, idx) => (
                                    <li key={`visita-s-${idx}-${j}`} className="px-3 text-xs text-gray-400">
                                    {j}
                                    </li>
                                ))}
                            </ul>
                        </div>
                </div>
            </Card>
        </>
    )
}