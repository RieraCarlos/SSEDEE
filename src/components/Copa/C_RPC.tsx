import LinkAction from "../LinkAction";

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-6 ${className}`}>{children}</div>;
}

export default function C_RPC({data}: {data:any}){
    return (
        <>
            <div className="flex flex-col gap-4 md:col-span-1 lg:col-span-2">
                <Card className="h-full">
                    <div className="flex flex-col">
                        <div className="flex items-start justify-between"> 
                            <h3 className="text-lg font-semibold">Resultado anterior</h3>
                            <LinkAction />
                        </div>
                    </div>
                    <div className="h-full flex items-center justify-center">
                        <p className="mt-1 text-lg text-gray-300">{data?.resultadoAnterior ?? "—"}</p>  
                    </div>
                </Card>
    
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="col-span-1 md:col-span-1 lg:col-span-2 flex items-center gap-3 h-24">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-700/60 border-2 border-gray-600">
                            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21a8 8 0 0 0-16 0" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{data?.perfil?.nombre ?? "Perfil"}</div>
                            <div className="text-xs text-gray-300">{data?.perfil?.nivel ?? "—"}</div>
                        </div>
                    </Card>
        
                    <Card className="grid place-items-center h-24">
                        <span className="text-gray-200 text-center text-[10px] md:text-xs">
                            <strong>Cancha:</strong> nombreCancha
                        </span>
                    </Card>
                </div>
            </div>
        </>
    )
}