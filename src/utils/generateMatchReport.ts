import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MatchEvent, NominaMember, DisciplineConfig } from '@/core/disciplines';

interface MatchReportData {
  localName: string;
  visitaName: string;
  scoreLocal: number;
  scoreVisita: number;
  events: MatchEvent[];
  localRoster?: NominaMember[];
  visitaRoster?: NominaMember[];
  observations?: string;
  fecha?: string;
  header_oficial?: string;
  config: DisciplineConfig | null;
}

/**
 * Motor de Reporte PDF Evolucionado (Emerald-Pro Style)
 * Genera un acta oficial con estructura profesional por tablas.
 */
export const generateMatchReportPDF = (data: MatchReportData) => {
  const doc = new jsPDF();
  const header = data.header_oficial || "SISTEMA DE SEGUIMIENTO DEPORTIVO - ECUADOR";
  const timestamp = new Date().toLocaleString();
  const reportId = Math.random().toString(36).substr(2, 9).toUpperCase();

  // --- ESTILOS Y COLORES ---
  const PRIMARY_COLOR: [number, number, number] = [16, 185, 129]; // Emerald 500
  const SECONDARY_COLOR: [number, number, number] = [31, 41, 55]; // Gray 800
  const TEXT_DARK: [number, number, number] = [17, 24, 39];
  const TEXT_GRAY: [number, number, number] = [107, 114, 128];

  // --- HEADER (Oficialidad) ---
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_GRAY);
  doc.text(header, 105, 15, { align: 'center' });
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 18, 190, 18);

  // --- TÍTULO PRINCIPAL ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...TEXT_DARK);
  doc.text(data.config?.layoutMode === 'participants' ? "ACTA DE PARTICIPANTES" : "ACTA OFICIAL DE PARTIDO", 105, 30, { align: 'center' });
  
  // Badge de Estado
  doc.setFillColor(...PRIMARY_COLOR);
  doc.roundedRect(85, 34, 40, 6, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("RESULTADO FINAL", 105, 38.5, { align: 'center' });

  // --- PANEL DE INFORMACIÓN ---
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, 45, 170, 25, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text("ID DE REPORTE:", 25, 52);
  doc.text("FECHA Y HORA:", 25, 58);
  doc.text("ESTADO:", 25, 64);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text(reportId, 60, 52);
  doc.text(timestamp, 60, 58);
  doc.text("VALIDADO / REGISTRADO", 60, 64);

  // --- MARCADOR PREMIUM ---
  if (data.config?.layoutMode !== 'participants') {
    doc.setFontSize(16);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text(data.localName.toUpperCase(), 75, 85, { align: 'right' });
    
    // EcuaVoley: Mostrar Marcador de SETS si aplica
    if (data.config?.id === 'ecuavoley') {
      const setResults = [1, 2, 3].map(p => ({
        local: data.events.filter(e => e.type === 'punto' && e.team === 'local' && e.periodo === p).length,
        visita: data.events.filter(e => e.type === 'punto' && e.team === 'visita' && e.periodo === p).length,
      })).filter(s => s.local > 0 || s.visita > 0);

      const localSets = setResults.filter(s => s.local > s.visita).length;
      const visitaSets = setResults.filter(s => s.visita > s.local).length;

      // Marcador de Sets
      doc.setFontSize(54);
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(`${localSets}`, 92, 92, { align: 'center' });
      doc.setFontSize(24);
      doc.setTextColor(...TEXT_GRAY);
      doc.text("-", 105, 90, { align: 'center' });
      doc.setFontSize(54);
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(`${visitaSets}`, 118, 92, { align: 'center' });

      // Ganador del Partido (Texto)
      const winner = localSets > visitaSets ? data.localName : (visitaSets > localSets ? data.visitaName : "EMPATE");
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SECONDARY_COLOR);
      doc.text(`GANADOR: ${winner.toUpperCase()}`, 105, 102, { align: 'center' });

      // Desglose de Sets
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_GRAY);
      const setStrings = setResults.map((s, i) => `S${i+1}: ${s.local}-${s.visita}`).join('  |  ');
      doc.text(setStrings, 105, 108, { align: 'center' });

    } else {
      // Fútbol / Basketball: Marcador de Goles/Puntos
      doc.setFontSize(48);
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(`${data.scoreLocal}`, 92, 92, { align: 'center' });
      doc.setFontSize(24);
      doc.setTextColor(...TEXT_GRAY);
      doc.text("-", 105, 90, { align: 'center' });
      doc.setFontSize(48);
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(`${data.scoreVisita}`, 118, 92, { align: 'center' });
    }
    
    doc.setFontSize(16);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text(data.visitaName.toUpperCase(), 135, 85, { align: 'left' });
  } else {
    doc.setFontSize(20);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(data.config?.name.toUpperCase() || "COMPETICIÓN", 105, 85, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_GRAY);
    doc.text("REGISTRO DETALLADO DE PARTICIPACIÓN", 105, 92, { align: 'center' });
  }

  // --- CATEGORIZACIÓN DE EVENTOS ---
  const sortedEvents = [...data.events].sort((a, b) => {
    if (a.periodo !== b.periodo) return a.periodo - b.periodo;
    return (a.minute || 0) - (b.minute || 0);
  });

  const scoringEvents = sortedEvents.filter(e => data.config?.scoreRules.some(r => r.id === e.type));
  const foulEvents = sortedEvents.filter(e => ['falta', 'tiro_libre_6_faltas', 'TIRO_LIBRE_6_FALTAS'].includes(e.type));
  const cardEvents = sortedEvents.filter(e => ['amarilla', 'roja'].includes(e.type));

  let currentY = 105;

  // 1. TABLA DE ANOTACIONES
  if (scoringEvents.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("TABLA DE ANOTACIONES (GOLES / PUNTOS)", 20, currentY);
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Periodo', 'Tipo', 'Jugador', 'Equipo']],
      body: scoringEvents.map(e => [
        e.periodo, 
        (data.config?.scoreRules.find(r => r.id === e.type)?.label || e.type).toUpperCase(),
        e.playerName,
        e.team === 'local' ? data.localName : data.visitaName
      ]),
      theme: 'striped',
      headStyles: { fillColor: PRIMARY_COLOR },
      styles: { fontSize: 8 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // 2. TABLA DE FALTAS
  if (foulEvents.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("TABLA DE FALTAS ACUMULADAS", 20, currentY);
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Periodo', 'Descripción', 'Jugador', 'Equipo']],
      body: foulEvents.map(e => [
        e.periodo, 
        e.type === 'falta' ? 'FALTA COMETIDA' : '6TA FALTA - TIRO LIBRE',
        e.playerName,
        e.team === 'local' ? data.localName : data.visitaName
      ]),
      theme: 'striped',
      headStyles: { fillColor: [217, 119, 6] }, // Amber 600
      styles: { fontSize: 8 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // 3. TABLA DE SANCIONES (TARJETAS)
  if (cardEvents.length > 0) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text("TABLA DE SANCIONES", 20, currentY);
    
    autoTable(doc, {
      startY: currentY + 3,
      head: [['Periodo', 'Tarjeta', 'Jugador', 'Equipo']],
      body: cardEvents.map(e => [
        e.periodo, 
        e.type === 'amarilla' ? 'AMARILLA' : 'ROJA',
        e.playerName,
        e.team === 'local' ? data.localName : data.visitaName
      ]),
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38] }, // Red 600
      styles: { fontSize: 8 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // 4. NÓMINAS DE EQUIPOS (TABLAS)
  if (currentY > 230) { doc.addPage(); currentY = 20; }
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  doc.text("NÓMINAS OFICIALES DE LOS EQUIPOS", 105, currentY, { align: 'center' });
  currentY += 6;

  // Local Roster Table
  doc.setFontSize(10);
  doc.text(`EQUIPO: ${data.localName}`, 20, currentY);
  autoTable(doc, {
    startY: currentY + 2,
    margin: { right: 107 },
    head: [['Jugador', 'Rol/Posición']],
    body: (data.localRoster || []).map(p => [p.fullname, p.posicion || p.role]),
    theme: 'grid',
    headStyles: { fillColor: SECONDARY_COLOR },
    styles: { fontSize: 7 }
  });

  // Visita Roster Table (Mismo Y que local si cabe)
  const rosterY = currentY + 2;
  doc.text(`EQUIPO: ${data.visitaName}`, 110, currentY);
  autoTable(doc, {
    startY: rosterY,
    margin: { left: 107 },
    head: [['Jugador', 'Rol/Posición']],
    body: (data.visitaRoster || []).map(p => [p.fullname, p.posicion || p.role]),
    theme: 'grid',
    headStyles: { fillColor: SECONDARY_COLOR },
    styles: { fontSize: 7 }
  });

  currentY = Math.max((doc as any).lastAutoTable.finalY, (doc as any).lastAutoTable.finalY) + 15;

  // --- OBSERVACIONES ---
  if (data.observations) {
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(20, currentY, 170, 20, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text("OBSERVACIONES / REPORTE OFICIAL:", 25, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitObs = doc.splitTextToSize(data.observations, 160);
    doc.text(splitObs, 25, currentY + 13);
    currentY += 25;
  }

  // --- FIRMAS ---
  const footerY = 280;
  doc.setDrawColor(...TEXT_GRAY);
  doc.line(40, footerY - 5, 90, footerY - 5);
  doc.line(120, footerY - 5, 170, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text("DELEGADO LOCAL", 65, footerY, { align: 'center' });
  doc.text("DELEGADO VISITANTE", 145, footerY, { align: 'center' });

  // Guardar
  const fileName = data.config?.layoutMode === 'participants' 
    ? `REPORTE_${data.config.name}_${reportId}.pdf`
    : `ACTA_${data.localName}_vs_${data.visitaName}_${reportId}.pdf`;
  doc.save(fileName);
};
