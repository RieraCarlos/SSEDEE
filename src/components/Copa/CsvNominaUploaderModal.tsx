import { useState, useRef } from "react";
import { useNominaCsv } from "@/hooks/useNominaCsv";
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

interface CsvNominaUploaderModalProps {
    clubId: string;
    onSuccess?: () => void;
}

export default function CsvNominaUploaderModal({ clubId, onSuccess }: CsvNominaUploaderModalProps) {
    const { 
        isParsing, 
        isUploading, 
        stagingData, 
        preProcessFile, 
        confirmUpload, 
        cancelUpload,
        resetState
    } = useNominaCsv();
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) preProcessFile(file);
    };

    const handleConfirm = async () => {
        await confirmUpload(clubId, () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
            setOpen(false);
            resetState();
            if (onSuccess) onSuccess();
        });
    };

    const handleCancel = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
        cancelUpload();
    };

    const handleClose = (isOpen: boolean) => {
        if (isUploading) return;
        setOpen(isOpen);
        if (!isOpen) {
            resetState();
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-[#0ae98a]/30 text-[#0ae98a] hover:bg-[#0ae98a]/10 w-full sm:w-auto h-9">
                    <FileUp className="mr-2 h-4 w-4" /> Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-[#1d2029] border-gray-700 text-white max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileUp className="text-[#0ae98a]" />
                        Importar Nómina Masiva
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
                    {/* DROPZONE / SELECTION */}
                    {!stagingData && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#0ae98a]/50 hover:bg-[#0ae98a]/5 transition-all group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".csv" 
                                className="hidden" 
                            />
                            {isParsing ? (
                                <Loader2 className="h-12 w-12 text-[#0ae98a] animate-spin mb-4" />
                            ) : (
                                <FileUp className="h-12 w-12 text-gray-500 group-hover:text-[#0ae98a] mb-4 transition-colors" />
                            )}
                            <p className="text-sm font-medium text-gray-400 text-center">
                                {isParsing ? 'Verificando formato...' : 'Haz clic o arrastra tu archivo CSV para reemplazar la nómina actual'}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">Columnas esperadas: fullname, email, posicion, alias, altura, fecha_nacimiento</p>
                        </div>
                    )}

                    {/* STAGING PREVIEW */}
                    {stagingData && (
                        <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                            <div className="flex items-center justify-between bg-[#13161c] p-3 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-2">
                                    {stagingData.valid ? (
                                        <CheckCircle2 className="text-[#0ae98a] w-5 h-5" />
                                    ) : (
                                        <XCircle className="text-red-500 w-5 h-5" />
                                    )}
                                    <span className="text-sm font-semibold">
                                        {stagingData.valid ? 'Archivo Validado Exitosamente' : 'Errores de Sintaxis Encontrados'}
                                    </span>
                                </div>
                                <Badge variant={stagingData.valid ? "default" : "destructive"}>
                                    {stagingData.data?.length || 0} Jugadores
                                </Badge>
                            </div>

                            {!stagingData.valid && stagingData.errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg max-h-32 overflow-y-auto">
                                    <p className="text-xs font-bold text-red-500 mb-2 flex items-center gap-1">
                                        <AlertCircle size={14} /> Por favor, corrige los siguientes errores:
                                    </p>
                                    <ul className="text-[10px] space-y-1 text-red-400/80">
                                        {stagingData.errors.map((err, i) => (
                                            <li key={i}>Fila {err.row}, Columna {err.column}: {err.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {stagingData.valid && stagingData.data && (
                                <div className="flex-1 border border-gray-700 rounded-xl overflow-hidden bg-[#13161c]">
                                    <div className="h-full w-full overflow-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-800/40 sticky top-0 z-10">
                                                <TableRow className="hover:bg-transparent border-gray-700">
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead className="hidden md:table-cell">Posición</TableHead>
                                                    <TableHead className="hidden md:table-cell">Alias</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stagingData.data.map((row, i) => (
                                                    <TableRow key={i} className="border-gray-800 hover:bg-gray-800/10 h-10">
                                                        <TableCell className="text-xs font-medium">
                                                            {row.fullname}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-gray-400">
                                                            {row.email}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-xs text-gray-500">
                                                            {row.posicion || '---'}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-xs text-gray-500">
                                                            {row.alias || '---'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    {stagingData && (
                        <>
                            <Button variant="ghost" onClick={handleCancel} disabled={isUploading} className="text-gray-400 hover:text-white">
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleConfirm} 
                                disabled={!stagingData.valid || isUploading}
                                className="bg-[#0ae98a] hover:bg-[#0ae98a]/90 text-[#13161c] font-bold px-8"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                        Sobrescribiendo Nómina...
                                    </>
                                ) : (
                                    'Confirmar y Reemplazar'
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
