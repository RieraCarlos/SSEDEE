import { useConsolidatedStandings } from '@/hooks/useConsolidatedStandings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from 'lucide-react';
import { Skeleton } from "@/components/ui/Skeleton";

export default function ConsolidatedStandings() {
  const { standings, isLoading } = useConsolidatedStandings();

  const renderTableBody = (items: any[]) => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-800">
          <td className="p-3"><Skeleton className="h-4 w-4 rounded-full bg-[#1d2029]" /></td>
          <td className="p-3 flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md bg-[#1d2029]" />
            <Skeleton className="h-4 w-32 bg-[#1d2029]" />
          </td>
          <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto bg-[#1d2029]" /></td>
          <td className="p-3 text-center"><Skeleton className="h-4 w-6 mx-auto bg-[#1d2029]" /></td>
          <td className="p-3 text-center hidden md:table-cell"><Skeleton className="h-4 w-6 mx-auto bg-[#1d2029]" /></td>
          <td className="p-3 text-center hidden md:table-cell"><Skeleton className="h-4 w-6 mx-auto bg-[#1d2029]" /></td>
          <td className="p-3 text-center hidden lg:table-cell"><Skeleton className="h-4 w-8 mx-auto bg-[#1d2029]" /></td>
          <td className="p-3 text-center font-bold text-white"><Skeleton className="h-5 w-6 mx-auto bg-[#0ae98a]/20" /></td>
        </tr>
      ));
    }

    if (!items || items.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center py-12 text-gray-500 bg-[#1d2029]/30">
            No hay clasificaciones disponibles para esta categoría.
          </td>
        </tr>
      );
    }

    return items.map((item, index) => (
        <tr 
            key={item.id} 
            className="border-b border-gray-800/50 hover:bg-[#1d2029]/80 transition-colors"
        >
            <td className="py-3 px-2 text-center w-10">
                <span className={`text-xs font-bold ${index < 3 ? 'text-[#0ae98a]' : 'text-gray-500'}`}>
                    {index + 1}
                </span>
            </td>
            <td className="py-3 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded shrink-0 bg-[#0a0b0f] border border-gray-800 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                        {item.logoUrl ? (
                            <img src={item.logoUrl} alt={item.nameClub} className="w-full h-full object-contain" />
                        ) : (
                            <Shield className="w-4 h-4 text-gray-600" />
                        )}
                    </div>
                    <span className="font-bold text-sm md:text-base text-gray-200 truncate max-w-[120px] md:max-w-[200px]">
                        {item.nameClub}
                    </span>
                </div>
            </td>
            <td className="py-3 px-2 text-center text-xs md:text-sm text-gray-400 font-medium">{item.pj}</td>
            <td className="py-3 px-2 text-center text-xs md:text-sm text-gray-400">{item.pg}</td>
            <td className="py-3 px-2 text-center text-xs md:text-sm text-gray-500 hidden md:table-cell">{item.pe}</td>
            <td className="py-3 px-2 text-center text-xs md:text-sm text-gray-400">{item.pp}</td>
            <td className="py-3 px-2 text-center text-xs md:text-sm text-gray-500 hidden lg:table-cell">{item.gf}</td>
            <td className="py-3 px-2 text-center text-xs md:text-sm text-gray-500 hidden lg:table-cell">{item.gc}</td>
            <td className="py-3 px-2 text-center text-xs md:text-sm font-semibold text-gray-300 bg-white/5">{item.gd > 0 ? `+${item.gd}` : item.gd}</td>
            <td className="py-3 px-2 text-center font-black text-sm md:text-lg text-[#0ae98a] bg-[#0ae98a]/5">{item.pts}</td>
        </tr>
    ));
  };

  const TableLayout = ({ data }: { data: any[] }) => (
    <div className="w-full overflow-x-auto rounded-xl border border-[#1d2029]">
      <table className="w-full text-left border-collapse min-w-[300px]">
        <thead>
          <tr className="bg-[#1d2029] text-[10px] md:text-xs uppercase tracking-widest text-gray-400 border-b border-gray-800">
            <th className="py-3 px-2 text-center w-10">Pos</th>
            <th className="py-3 px-2">Club</th>
            <th className="py-3 px-2 text-center" title="Partidos Jugados">PJ</th>
            <th className="py-3 px-2 text-center" title="Partidos Ganados">G</th>
            <th className="py-3 px-2 text-center hidden md:table-cell" title="Partidos Empatados">E</th>
            <th className="py-3 px-2 text-center" title="Partidos Perdidos">P</th>
            <th className="py-3 px-2 text-center hidden lg:table-cell" title="Goles a Favor">GF</th>
            <th className="py-3 px-2 text-center hidden lg:table-cell" title="Goles en Contra">GC</th>
            <th className="py-3 px-2 text-center" title="Diferencia de Goles">GD</th>
            <th className="py-3 px-2 text-center font-bold text-[#0ae98a] bg-[#0ae98a]/5">PTS</th>
          </tr>
        </thead>
        <tbody className="bg-[#13161c]">
          {renderTableBody(data)}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <Tabs defaultValue="masculino" className="w-full">
        
        <TabsList className="w-full flex bg-[#1d2029] p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger 
            value="masculino" 
            className="flex-1 min-w-[100px] text-xs sm:text-sm font-bold data-[state=active]:bg-[#13161c] data-[state=active]:text-[#0ae98a] py-2 rounded-lg transition-all"
          >
            MASCULINO
          </TabsTrigger>
          <TabsTrigger 
            value="femenino" 
            className="flex-1 min-w-[100px] text-xs sm:text-sm font-bold data-[state=active]:bg-[#13161c] data-[state=active]:text-[#0ae98a] py-2 rounded-lg transition-all"
          >
            FEMENINO
          </TabsTrigger>
          <TabsTrigger 
            value="dorados" 
            className="flex-1 min-w-[100px] text-xs sm:text-sm font-bold data-[state=active]:bg-[#13161c] data-[state=active]:text-[#0ae98a] py-2 rounded-lg transition-all"
          >
            AÑOS DORADOS
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="masculino" className="m-0 focus-visible:outline-none focus:outline-none">
            <TableLayout data={standings.masculino} />
          </TabsContent>
          
          <TabsContent value="femenino" className="m-0 focus-visible:outline-none focus:outline-none">
            <TableLayout data={standings.femenino} />
          </TabsContent>

          <TabsContent value="dorados" className="m-0 focus-visible:outline-none focus:outline-none">
            <TableLayout data={standings.dorados} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
