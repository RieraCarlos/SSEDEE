import React, { createContext, useState, useContext, type ReactNode} from 'react';

// 1. Definimos la forma de nuestros datos y del contexto
interface Match {
  id: string;
  teamA: string | null;
  teamB: string | null;
  date: string;
  time: string;
  status: 'pending' | 'active' | 'finished';
  round: number;
  winner?: 'teamA' | 'teamB';
}

interface ScheduleContextType {
  schedule: Match[];
  setSchedule: React.Dispatch<React.SetStateAction<Match[]>>;
  activeMatch: Match | null; // Exponemos directamente el partido activo
}

// 2. Creamos el Context con un valor por defecto
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// 3. Creamos el "Proveedor", un componente que envolverá nuestra app
export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [schedule, setSchedule] = useState<Match[]>([]);

  // Derivamos el partido activo aquí, en la fuente de la verdad
  const activeMatch = schedule.find(match => match.status === 'active') || null;

  const value = {
    schedule,
    setSchedule,
    activeMatch,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

// 4. Creamos un "Custom Hook" para consumir el contexto fácilmente
export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule debe ser usado dentro de un ScheduleProvider');
  }
  return context;
};