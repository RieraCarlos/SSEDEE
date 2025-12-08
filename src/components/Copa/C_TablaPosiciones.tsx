import LinkAction from "../LinkAction";
import { DataTable } from "./tablaE_Posiciones";

function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-6 ${className}`}>{children}</div>;
}

export const standingsData = [
  { id: 1, nameClub: 'Panteras FC', puntos: 12, dg: 8, pj: 5 },
  { id: 2, nameClub: 'Leonas FC', puntos: 10, dg: 5, pj: 5 },
  { id: 3, nameClub: 'Tigresas F.C.', puntos: 8, dg: 2, pj: 5 },
  { id: 4, nameClub: 'Jaguar FC', puntos: 7, dg: 1, pj: 5 },
];

export default function C_TablaPosiciones(){
    return(
        <>
            <Card className="col-span-1 lg:col-span-2">
                <div className="flex items-start justify-between">
                    <div>
                    <h3 className="text-lg font-semibold">Tabla de posiciones</h3>
                    </div>
                    <LinkAction />
                </div>
                <div className="mt-4 text-xs text-gray-300">
                   <DataTable data={standingsData}/>
                </div>
            </Card>
        </>
    )
}