import { useState, useRef } from "react";
import { useMassiveIngestion } from "@/hooks/useMassiveIngestion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface CsvUploaderModalProps {
    tournamentId: string;
    onSuccess?: () => void;
}

export default function CsvUploaderModal({ tournamentId, onSuccess }: CsvUploaderModalProps) {
    const { 
        isParsing, 
        isUploading, 
        ingestionStep,
        stagingResult, 
        preProcessFile, 
        confirmIngestion, 
        cancelIngestion,
        resetIngestion
    } = useMassiveIngestion();
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) preProcessFile(file);
    };

    const handleConfirm = async () => {
        await confirmIngestion(tournamentId, () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setOpen(false);
            resetIngestion();
            if (onSuccess) onSuccess();
        });
    };

    const handleCancel = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
        cancelIngestion();
    };

    const handleClose = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetIngestion();
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                    <FileUp className="mr-2 h-4 w-4" /> Ingesta Masiva (CSV)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-[#1d2029] border-gray-700 text-white max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileUp className="text-emerald-500" />
                        Ingesta Masiva de Equipos
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
                    {/* DROPZONE / SELECTION */}
                    {!stagingResult && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".csv" 
                                className="hidden" 
                            />
                            {isParsing ? (
                                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                            ) : (
                                <FileUp className="h-12 w-12 text-gray-500 group-hover:text-emerald-500 mb-4 transition-colors" />
                            )}
                            <p className="text-sm font-medium text-gray-400">
                                {isParsing ? 'Parseando y Validando...' : 'Haz clic o arrastra tu archivo CSV'}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">Formato esperado: Club, DT y Jugadores</p>
                        </div>
                    )}

                    {/* STAGING PREVIEW */}
                    {stagingResult && (
                        <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                            <div className="flex items-center justify-between bg-gray-800/20 p-3 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-2">
                                    {stagingResult.valid ? (
                                        <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                    ) : (
                                        <XCircle className="text-red-500 w-5 h-5" />
                                    )}
                                    <span className="text-sm font-semibold">
                                        {stagingResult.valid ? 'Archivo Validado' : 'Errores de Validación Encontrados'}
                                    </span>
                                </div>
                                <Badge variant={stagingResult.valid ? "default" : "destructive"}>
                                    {stagingResult.raw.length} Filas Detectadas
                                </Badge>
                            </div>

                            {!stagingResult.valid && stagingResult.errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg max-h-32 overflow-y-auto">
                                    <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">
                                        <AlertCircle size={14} /> Corrija los siguientes errores:
                                    </p>
                                    <ul className="text-[10px] space-y-1 text-red-400/80">
                                        {stagingResult.errors.map((err, i) => (
                                            <li key={i}>Fila {err.row}, Columna {err.column}: {err.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex-1 border border-gray-700 rounded-xl overflow-hidden bg-[#13161c]">
                                <div className="h-full w-full overflow-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-800/40 sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-gray-700">
                                                <TableHead className="w-16">Tipo</TableHead>
                                                <TableHead>Nombre / Fullname</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="hidden md:table-cell">Posición / Detalle</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stagingResult.raw.map((row, i) => (
                                                <TableRow key={i} className="border-gray-800 hover:bg-gray-800/10 h-12">
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] uppercase border-gray-700 text-gray-400">
                                                            {row.role || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium">
                                                        {row.name || row.fullname || '---'}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-gray-500">
                                                        {row.email || '---'}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-xs text-gray-500">
                                                        {row.posicion || row.logo_url || '---'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {stagingResult && (
                        <>
                            <Button variant="ghost" onClick={handleCancel} disabled={isUploading} className="text-gray-400 hover:text-white">
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleConfirm} 
                                disabled={!stagingResult.valid || isUploading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                        {ingestionStep || 'Ingiriendo...'}
                                    </>
                                ) : (
                                    'Confirmar Carga'
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
