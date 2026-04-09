import LinkAction from "../LinkAction";
import PosicionesTable from "./PosicionesTable";
import { Card } from "@/components/ui/card";
import { standingsData } from "./mockData";

export default function PosicionesCard() {
    return (
        <Card className="col-span-1 lg:col-span-2 bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Tabla de posiciones</h3>
                </div>
                <LinkAction />
            </div>
            <div className="mt-4 text-xs text-gray-300">
                <PosicionesTable data={standingsData} />
            </div>
        </Card>
    );
}
