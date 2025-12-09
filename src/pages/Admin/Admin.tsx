{/*
import C_MarcadorEnVivo from '@/components/Copa/C_MarcadorEnVivo';
import C_TablaPosiciones, {standingsData} from '@/components/Copa/C_TablaPosiciones';
import  DataTableS  from '@/components/Copa/tableC_Sucesos';
import Footer from '@/components/Landing/Footer';
import Nav from '@/components/Landing/Nav';
import React from 'react';
import { useSchedule } from '@/components/Copa/ScheduleContext';
import { useLiveMatch } from '@/hooks/LiveMatchContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as autoTable from 'jspdf-autotable'; 
/* ====== Tipos del JSON (flexibles) ====== 
type Partido = {
  grupo?: string;
  estado?: string;
  tiempo?: string;
  minuto?: number;
  local?: { id?: string; nombre?: string; tarjetas?: { amarillas?: number; rojas?: number } };
  visita?: { id?: string; nombre?: string; tarjetas?: { amarillas?: number; rojas?: number } };
  marcador?: { local?: number; visita?: number };
};
type Tabla = { equipo: string; pts: number; dg: number; pj: number };
type BdJson = {
  progreso?: number;
  club?: { label: string };
  resultadoAnterior?: string;
  perfil?: { nombre?: string; nivel?: string };
  canchaNombre?: string;
  ubicacionCancha?: string;
  partidoActual?: Partido;
  tablaPosiciones?: Tabla[];
  equipos?: { A?: string[]; B?: string[] };
  alineacion?:
    | { local?: { titulares?: string[]; suplentes?: string[] }; visita?: { titulares?: string[]; suplentes?: string[] } }
    | { titulares?: string[]; suplentes?: string[] }; // formato antiguo
};



const Admin: React.FC = () => {
  const [data, setData] = React.useState<BdJson | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { activeMatch } = useSchedule();
  const { scoreA, scoreB, teamAPlayers, teamBPlayers, teamACards, teamBCards } = useLiveMatch();

  React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/bd.json", { signal: ac.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: BdJson = await res.json();
        setData(json);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") console.error("Error al cargar /bd.json", e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);
  const generateReport = () => {
    if(!activeMatch) return "No active match."
    let report = `# Informe del Partido\n\n`;
    report += `## Detalles del Partido\n`;
    report += `- **Partido:** ${activeMatch.teamA} vs ${activeMatch.teamB}\n`;
    report += `- **Ronda:** ${activeMatch.round}\n`;
    report += `- **Resultado Final:** ${scoreA} - ${scoreB}\n\n`;

    report += `## Sucesos del Partido\n\n`;
    report += `### ${activeMatch.teamA}\n`;
    report += `| Jugador | Goles | T. Amarillas | T. Rojas |\n`;
    report += `|---|---|---|---|
`;
    teamAPlayers.forEach(p => {
      report += `| ${p.nombre} | ${p.gol} | ${p.amarilla} | ${p.roja} |\n`;
    });

    report += `\n### ${activeMatch.teamB}\n`;
    report += `| Jugador | Goles | T. Amarillas | T. Rojas |\n`;
    report += `|---|---|---|---|
`;
    teamBPlayers.forEach(p => {
      report += `| ${p.nombre} | ${p.gol} | ${p.amarilla} | ${p.roja} |\n`;
    });

    report += `\n## Tabla de Posiciones\n`;
    report += `| Pos | Equipo | Pts | DG | PJ |\n`;
    report += `|---|---|---|---|---|
`;
    standingsData
      .sort((a, b) => b.puntos - a.puntos)
      .forEach((t, index) => {
        report += `| ${index + 1} | ${t.nameClub} | ${t.puntos} | ${t.dg} | ${t.pj} |\n`;
      });

    return report;
  }

  if (loading && !data) {
    return (
      <div className="bg-black text-white min-h-[100svh] flex items-center justify-center">
        <span className="animate-pulse">Cargando…</span>
      </div>
    );
  }
  //
  // Función principal para generar el PDF
    const generatePDFReport = () => {
        if (!activeMatch || !standingsData) return;

        const doc = new jsPDF();
        const yOffset = 10;
        let finalY = yOffset;
        
        // --- TÍTULO Y MARCADOR EN VIVO ---
        doc.setFontSize(22);
        doc.text(`INFORME DE PARTIDO`, 14, finalY);
        finalY += 10;
        doc.setFontSize(16);
        doc.text(`Copa: ${activeMatch.round}`, 14, finalY);
        finalY += 10;
        doc.text(`${activeMatch.teamA} vs ${activeMatch.teamB}`, 14, finalY);
        finalY += 10;

        // Resumen del Marcador
        const marcadorData = [
            ["EQUIPO", "GOLES", "T. AMARILLAS", "T. ROJAS"],
            [activeMatch.teamA, scoreA, teamACards.yellow, teamACards.red],
            [activeMatch.teamB, scoreB, teamBCards.yellow, teamBCards.red],
        ];

        (doc as any).autoTable({
            head: [marcadorData[0]],
            body: marcadorData.slice(1),
            startY: finalY,
            theme: 'grid',
            styles: { halign: 'center' },
            headStyles: { fillColor: [50, 50, 50] },
            didDrawPage: (data: any) => { finalY = data.cursor.y; },
        });

        // --- TABLA DE SUCESOS ---
        finalY += 10;
        doc.setFontSize(18);
        doc.text(`Sucesos del Partido`, 14, finalY);
        finalY += 10;

        // Encabezado para la tabla de sucesos
        const playerHeaders = ["Jugador", "Goles", "T. Amarillas", "T. Rojas"];

        // Tabla Equipo A
        doc.setFontSize(14);
        doc.text(`Equipo: ${activeMatch.teamA}`, 14, finalY);
        finalY += 5;
        
        const teamAData = teamAPlayers.map(p => [p.nombre, p.gol, p.amarilla, p.roja]);
        (doc as any).autoTable({
            head: [playerHeaders],
            body: teamAData,
            startY: finalY,
            theme: 'striped',
            styles: { halign: 'center' },
            headStyles: { fillColor: [70, 70, 70] },
            didDrawPage: (data: any) => { finalY = data.cursor.y; },
        });

        // Tabla Equipo B
        finalY += 5;
        doc.setFontSize(14);
        doc.text(`Equipo: ${activeMatch.teamB}`, 14, finalY);
        finalY += 5;

        const teamBData = teamBPlayers.map(p => [p.nombre, p.gol, p.amarilla, p.roja]);
        (doc as any).autoTable({
            head: [playerHeaders],
            body: teamBData,
            startY: finalY,
            theme: 'striped',
            styles: { halign: 'center' },
            headStyles: { fillColor: [70, 70, 70] },
            didDrawPage: (data: any) => { finalY = data.cursor.y; },
        });


        // --- TABLA DE POSICIONES ---
        finalY += 10;
        doc.setFontSize(18);
        doc.text(`Tabla de Posiciones`, 14, finalY);
        finalY += 10;

        const standingsHeaders = ["Pos", "Equipo", "Pts", "DG", "PJ"];
        const sortedStandings = standingsData.sort((a, b) => b.puntos - a.puntos);
        
        const standingsBody = sortedStandings.map((t, index) => [
            index + 1,
            t.nameClub,
            t.puntos,
            t.dg,
            t.pj,
        ]);

        (doc as any).autoTable({
            head: [standingsHeaders],
            body: standingsBody,
            startY: finalY,
            theme: 'plain',
            headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
            didDrawPage: (data: any) => { finalY = data.cursor.y; },
        });


        // Descargar PDF
        doc.save(`informe-${activeMatch.teamA}-vs-${activeMatch.teamB}.pdf`);
    };

    const handleDownloadReport = () => {
      const report = generateReport();
      
      // Usaremos Blob con tipo MIME para archivos de texto/markdown.
      // Aunque la extensión sea .doc, el contenido sigue siendo Markdown.
      const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Cambiamos la extensión a .doc. Word lo abrirá, pero es mejor usar .md.
      // Si quieres que Word lo abra *directamente* y lo formateé, usa .doc
      // si quieres que lo abra como texto plano, usa .md.
      link.download = `informe-partido.doc`; // O 'informe-partido.md'
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  return (
    <div className='text-white min-h-screen flex flex-col space-y-2'>
      {/*Header 
        <Nav/>
      {/* Contenido de la página 
      <div className='px-5 md:px-15 lg:px-35 mb-15'>
        <div className="text-white flex flex-col space-y-8 w-full">
          <div className="text-3xl font-bold text-gray-400 ">Bienvenido, Alvarado Punin</div>
          <div className='fex flex-col space-y-4 '>
            {/* Sección de la Copa y el Marcador 
            <C_MarcadorEnVivo />
            

            {/* Sección de Sucesos del Partido 
            <div className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 md:p-6 lg:p-8 flex-grow">
              <h2 className="text-white text-xl font-bold mb-2">Sucesos del partido</h2>
              
              {/* Bloque del Equipo A 
              <div className="mb-8">
                <h3 className="text-gray-400 text-lg mb-4">{activeMatch?.teamA}</h3>
                {/* Tabla de jugadores 
                <DataTableS equipoNombre={activeMatch?.teamA}/>
              </div>
              {/* Bloque del Equipo B 
              <div className='mb-8'>
                <h3 className="text-gray-400 text-lg mb-4">{activeMatch?.teamB}</h3>
                {/* Tabla de jugadores 
                <DataTableS equipoNombre={activeMatch?.teamB}/>
              </div>
              <div className='flex justify-center items-center '>
                <button onClick={handleDownloadReport} className='p-4 border-2 border-red-500 rounded-xl hover:bg-red-500  cursor-pointer'>Descargar Informe</button>
              </div>
            </div>

            {/* Sección de la Tabla de posiciones 
            <C_TablaPosiciones/>
          </div>
          
        </div>
      </div>
      {/* Footer 
      <Footer/>
    </div>
  );
};

export default Admin;
*/}
