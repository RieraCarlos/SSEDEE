import { useConsolidatedStandings } from '@/hooks/useConsolidatedStandings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from 'lucide-react';
import { Skeleton } from "@/components/ui/Skeleton";
import { motion } from 'framer-motion';

export default function PublicStandings() {
  const { standings, isLoading } = useConsolidatedStandings();

  const renderTableBody = (items: any[]) => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-white/5">
          <td className="p-6"><Skeleton className="h-4 w-4 rounded-full bg-white/5" /></td>
          <td className="p-6 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
            <Skeleton className="h-5 w-40 bg-white/5" />
          </td>
          <td className="p-6 text-center"><Skeleton className="h-5 w-8 mx-auto bg-white/5" /></td>
          <td className="p-6 text-center"><Skeleton className="h-5 w-8 mx-auto bg-white/5" /></td>
          <td className="p-6 text-center hidden md:table-cell"><Skeleton className="h-5 w-8 mx-auto bg-white/5" /></td>
          <td className="p-6 text-center font-bold text-emerald-400"><Skeleton className="h-6 w-10 mx-auto bg-emerald-500/10" /></td>
        </tr>
      ));
    }

    if (!items || items.length === 0) {
      return (
        <tr>
          <td colSpan={10} className="text-center py-20 text-slate-500 italic bg-white/2">
            No hay clasificaciones cargadas para esta categoría aún.
          </td>
        </tr>
      );
    }

    return items.map((item, index) => (
        <motion.tr 
            key={item.id} 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group border-b border-white/5 hover:bg-emerald-500/[0.02] transition-colors"
        >
            <td className="py-6 px-4 text-center w-16">
                <span className={`text-sm font-black italic ${index < 3 ? 'text-emerald-500' : 'text-slate-600'}`}>
                    #{index + 1}
                </span>
            </td>
            <td className="py-6 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center p-2 group-hover:border-emerald-500/30 transition-colors shadow-xl">
                        {item.logoUrl ? (
                            <img src={item.logoUrl} alt={item.nameClub} className="w-full h-full object-contain" />
                        ) : (
                            <Shield className="w-6 h-6 text-slate-700" />
                        )}
                    </div>
                    <span className="font-bold text-base md:text-lg text-white uppercase italic tracking-tighter group-hover:text-emerald-400 transition-colors">
                        {item.nameClub}
                    </span>
                </div>
            </td>
            <td className="py-6 px-4 text-center text-sm md:text-base text-slate-400 font-bold tabular-nums">{item.pj}</td>
            <td className="py-6 px-4 text-center text-sm md:text-base text-slate-300 tabular-nums">{item.pg}</td>
            <td className="py-6 px-4 text-center text-sm md:text-base text-slate-500 tabular-nums hidden md:table-cell">{item.pe}</td>
            <td className="py-6 px-4 text-center text-sm md:text-base text-slate-300 tabular-nums">{item.pp}</td>
            <td className="py-6 px-4 text-center text-sm md:text-base text-slate-500 tabular-nums hidden lg:table-cell">{item.gf}</td>
            <td className="py-6 px-4 text-center text-sm md:text-base text-slate-500 tabular-nums hidden lg:table-cell">{item.gc}</td>
            <td className="py-6 px-4 text-center text-sm md:text-base font-black text-slate-400 bg-white/5 tabular-nums">
                {item.gd > 0 ? `+${item.gd}` : item.gd}
            </td>
            <td className="py-6 px-4 text-center font-black text-xl md:text-3xl text-emerald-500 bg-emerald-500/5 tabular-nums">
                {item.pts}
            </td>
        </motion.tr>
    ));
  };

  const TableLayout = ({ data }: { data: any[] }) => (
    <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a]/20 backdrop-blur-3xl shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-slate-500 border-b border-white/10 font-black">
                <th className="py-6 px-4 text-center w-16">Pos</th>
                <th className="py-6 px-4">Club / Organización</th>
                <th className="py-6 px-4 text-center">PJ</th>
                <th className="py-6 px-4 text-center text-emerald-400/60">G</th>
                <th className="py-6 px-4 text-center hidden md:table-cell">E</th>
                <th className="py-6 px-4 text-center">P</th>
                <th className="py-6 px-4 text-center hidden lg:table-cell">GF</th>
                <th className="py-6 px-4 text-center hidden lg:table-cell">GC</th>
                <th className="py-6 px-4 text-center">GD</th>
                <th className="py-6 px-4 text-center text-emerald-400 bg-emerald-500/10">Puntos</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
            {renderTableBody(data)}
            </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-12">
      <Tabs defaultValue="masculino" className="w-full">
        
        <div className="flex justify-center mb-10">
            <TabsList className="inline-flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5 h-auto">
                <TabsTrigger 
                    value="masculino" 
                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all duration-500"
                >
                    Rama Masculina
                </TabsTrigger>
                <TabsTrigger 
                    value="femenino" 
                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all duration-500"
                >
                    Rama Femenina
                </TabsTrigger>
                <TabsTrigger 
                    value="dorados" 
                    className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black transition-all duration-500"
                >
                    Años Dorados
                </TabsTrigger>
            </TabsList>
        </div>

        <div className="relative">
            {/* Background Glow for Table */}
            <div className="absolute -inset-20 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            
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
