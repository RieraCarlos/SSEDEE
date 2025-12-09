import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type for a single match in the history
interface MatchHistory {
  id: string | number;
  fecha_juego: string;
  equipo_ganador: string;
}

// Props for the dialog component
interface HistorialDialogoProps {
  isOpen: boolean;
  onClose: () => void;
  historial: MatchHistory[];
}

// Helper to format date
const formatDate = (dateString:string) => {
  if (!dateString) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
};

export const HistorialDialogo = ({ isOpen, onClose, historial }: HistorialDialogoProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#181b22] border-gray-700 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">Historial de Partidos</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Fecha</TableHead>
                <TableHead className="text-right text-gray-300">
                  Ganador
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historial && historial.length > 0 ? (
                historial.map((match) => (
                  <TableRow key={match.id} className="border-gray-800">
                    <TableCell>{formatDate(match.fecha_juego)}</TableCell>
                    <TableCell className="text-right font-bold text-[#0ae98a]">
                      {`Equipo ${match.equipo_ganador}`}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    No hay historial de partidos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
