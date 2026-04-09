import { useState, useCallback } from 'react';
import type { FixtureMatch } from '@/utils/fixtureGenerator';
import { generateKnockoutFixtures } from '@/utils/fixtureGenerator';
import { toast } from 'sonner';
import Papa from 'papaparse';

export const useCalendarGenerator = (tournament: any) => {
  const [generatedMatches, setGeneratedMatches] = useState<FixtureMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = useCallback((config: {
    startTime: string;
    endTime: string;
    matchType: "ida" | "idaVuelta";
    restHours?: number;
  }) => {
    if (!tournament.equipos || tournament.equipos.length < 2) {
      toast.error("Se necesitan al menos 2 equipos");
      return;
    }

    try {
      // Implementación de Fisher-Yates previa a la generación
      const shuffledTeams = [...tournament.equipos];
      for (let i = shuffledTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
      }

      const matches = generateKnockoutFixtures(
        shuffledTeams,
        tournament.fecha[0] || new Date().toISOString(),
        tournament.fecha[1] || new Date().toISOString(),
        config.startTime,
        config.endTime,
        config.matchType
      );

      setGeneratedMatches(matches);
      toast.success("Calendario generado aleatoriamente");
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [tournament]);

  const exportToCSV = useCallback(() => {
    if (generatedMatches.length === 0) return;

    const exportData = generatedMatches.map(m => ({
      Ronda: m.round,
      Local: m.home,
      Visitante: m.away,
      Fecha: m.date,
      Hora: m.time
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `calendario_${tournament.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendario exportado a CSV");
  }, [generatedMatches, tournament.name]);

  return {
    generatedMatches,
    setGeneratedMatches,
    loading,
    generate,
    exportToCSV
  };
};
