import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import type { CalendarMatch, MatchType } from '@/core/calendars/CalendarEngine';
import { generateKnockoutFixtures } from '@/utils/fixtureGenerator';
import { toast } from 'sonner';
import Papa from 'papaparse';
import {
  generateCalendarThunk,
  selectCalendarMatches,
  selectCalendarStatus,
  selectCalendarError,
  setCalendarMatches,
} from '@/store/slices/calendarSlice';

export const useCalendarGenerator = (tournament: any) => {
  const dispatch = useAppDispatch();
  const generatedMatches = useAppSelector(selectCalendarMatches);
  const status = useAppSelector(selectCalendarStatus);
  const error = useAppSelector(selectCalendarError);

  const generate = useCallback(async (config: {
    startTime: string;
    endTime: string;
    matchType: MatchType;
    restHours?: number;
  }) => {
    if (status === 'loading') {
      toast.error('Ya existe una generación en curso. Espere a que termine.');
      return;
    }
    if (!tournament.equipos || tournament.equipos.length < 2) {
      toast.error('Se necesitan al menos 2 equipos');
      return;
    }

    try {
      const shuffledTeams = [...tournament.equipos];
      for (let i = shuffledTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
      }

      if (config.matchType === 'todosContraTodos' || config.matchType === 'IdaVueltaTvsT') {
        const action = await dispatch(generateCalendarThunk({
          teams: shuffledTeams,
          matchType: config.matchType,
          startDate: tournament.fecha?.[0] || new Date().toISOString(),
          endDate: tournament.fecha?.[1] || new Date().toISOString(),
          startHour: config.startTime,
          endHour: config.endTime,
          playDays: [6],
        }));

        if (generateCalendarThunk.rejected.match(action)) {
          throw new Error(action.payload || 'Error al generar el calendario');
        }
      } else {
        const matches = generateKnockoutFixtures(
          shuffledTeams,
          tournament.fecha?.[0] || new Date().toISOString(),
          tournament.fecha?.[1] || new Date().toISOString(),
          config.startTime,
          config.endTime,
          config.matchType
        );
        dispatch(setCalendarMatches(matches));
      }

      toast.success('Calendario generado aleatoriamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al generar el calendario');
    }
  }, [dispatch, status, tournament]);

  const setGeneratedMatches = useCallback((matches: CalendarMatch[]) => {
    dispatch(setCalendarMatches(matches));
  }, [dispatch]);

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
    generate,
    exportToCSV,
    status,
    error,
  };
};
